import { Attachment, Message, User } from "../types";
import { HttpClientError } from "./httpClient";

interface LlmChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LlmChatPayload {
  user_id: number;
  model: string;
  stream: boolean;
  think: boolean;
  messages: LlmChatMessage[];
  conversation_id?: number;
}

interface QuotaInfo {
  limit?: number;
  used?: number;
  remaining?: number;
  resetAt?: string;
}

interface StreamState {
  content: string;
  thinking: string;
  durationMs?: number;
  conversationId?: number;
}

interface GenerateChatResponseOptions {
  onDelta?: (state: StreamState) => void;
  onConversationId?: (conversationId: number) => void;
  conversationId?: number;
  thinkEnabled?: boolean;
}

export interface GenerateChatResponseResult {
  content: string;
  thinking?: string;
  quota?: QuotaInfo;
  durationMs?: number;
  conversationId?: number;
}

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:18080/api/v1"
).replace(/\/$/, "");

const BACKEND_CHAT_TIMEOUT_MS = 300_000;
const DEFAULT_FRONTEND_CHAT_TIMEOUT_MS = 600_000;

const resolveFrontendChatTimeoutMs = (): number => {
  const raw = import.meta.env?.VITE_LLM_CHAT_TIMEOUT_MS;
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed > BACKEND_CHAT_TIMEOUT_MS) {
    return Math.round(parsed);
  }

  return DEFAULT_FRONTEND_CHAT_TIMEOUT_MS;
};

const FRONTEND_CHAT_TIMEOUT_MS = resolveFrontendChatTimeoutMs();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const pickText = (
  source: Record<string, unknown>,
  keys: string[],
  options: { trim?: boolean } = {},
): string | undefined => {
  const shouldTrim = options.trim !== false;

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string") {
      if (shouldTrim) {
        const trimmed = value.trim();
        if (trimmed) {
          return trimmed;
        }
      } else if (value.length > 0) {
        return value;
      }
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
};

const normalizeConversationId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
};

const extractConversationId = (
  source: Record<string, unknown>,
  current?: number,
): number | undefined => {
  return (
    normalizeConversationId(source.conversation_id) ||
    normalizeConversationId(source.conversationId) ||
    current
  );
};

const buildUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const toAssistantRole = (role: Message["role"]): LlmChatMessage["role"] => {
  return role === "model" ? "assistant" : "user";
};

const resolveNumericUserId = (user: User | null): number => {
  if (!user?.id) {
    throw new Error("当前登录信息缺少 user_id，请重新登录后重试");
  }

  const userId = Number(user.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("当前账号 user_id 无效，请重新登录后再试");
  }

  return userId;
};

const buildChatMessages = (
  history: Message[],
  currentMessage: string,
  attachments: Attachment[],
): LlmChatMessage[] => {
  const safeHistory = history
    .filter((item) => !item.isError)
    .map((item) => ({
      role: toAssistantRole(item.role),
      content: item.content.trim(),
    }))
    .filter((item) => item.content.length > 0);

  const attachmentHint =
    attachments.length > 0
      ? `\n\n[附件：${attachments.map((item) => item.name).join("、")}]`
      : "";

  const finalUserMessage = `${currentMessage}${attachmentHint}`.trim();

  return [
    ...safeHistory,
    {
      role: "user",
      content: finalUserMessage,
    },
  ];
};

const mergeChunk = (current: string, chunk: string): string => {
  if (!chunk) {
    return current;
  }

  if (!current) {
    return chunk;
  }

  if (chunk.startsWith(current)) {
    return chunk;
  }

  return `${current}${chunk}`;
};

const extractQuotaInfo = (
  source: Record<string, unknown>,
  current: QuotaInfo,
): QuotaInfo => {
  const next: QuotaInfo = { ...current };

  if (typeof source.quota_limit === "number") {
    next.limit = source.quota_limit;
  }

  if (typeof source.quota_used === "number") {
    next.used = source.quota_used;
  }

  if (typeof source.quota_remaining === "number") {
    next.remaining = source.quota_remaining;
  }

  if (
    typeof source.quota_reset_at === "string" &&
    source.quota_reset_at.trim()
  ) {
    next.resetAt = source.quota_reset_at.trim();
  }

  return next;
};

const normalizeDurationMs = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  if (value >= 1_000_000) {
    return Math.max(1, Math.round(value / 1_000_000));
  }

  return Math.round(value);
};

const extractDurationMs = (
  source: Record<string, unknown>,
  current?: number,
): number | undefined => {
  const resolveDurationFromRecord = (
    record: Record<string, unknown>,
  ): number | undefined => {
    const directCandidates = [
      record.thinking_duration_ms,
      record.thinkingDurationMs,
      record.duration_ms,
      record.durationMs,
    ];

    for (const candidate of directCandidates) {
      if (typeof candidate === "number" && candidate > 0) {
        return Math.max(1, Math.round(candidate));
      }

      if (typeof candidate === "string" && candidate.trim()) {
        const parsed = Number(candidate.trim());
        if (Number.isFinite(parsed) && parsed > 0) {
          return Math.max(1, Math.round(parsed));
        }
      }
    }

    const upstreamCandidates = [
      record.total_duration,
      record.eval_duration,
      record.prompt_eval_duration,
      record.load_duration,
    ];
    for (const candidate of upstreamCandidates) {
      if (typeof candidate === "number" && candidate > 0) {
        return normalizeDurationMs(candidate);
      }
    }

    return undefined;
  };

  const directDuration = resolveDurationFromRecord(source);
  if (directDuration !== undefined) {
    return directDuration;
  }

  if (isRecord(source.message)) {
    const nestedDuration = resolveDurationFromRecord(source.message);
    if (nestedDuration !== undefined) {
      return nestedDuration;
    }
  }

  return current;
};

const extractDeltaFromSource = (
  source: Record<string, unknown>,
): { contentChunk: string; thinkingChunk: string; done: boolean } => {
  let contentChunk = "";
  let thinkingChunk = "";

  const choices = Array.isArray(source.choices) ? source.choices : [];
  const firstChoice = choices.length > 0 && isRecord(choices[0]) ? choices[0] : null;
  const choiceMessage = firstChoice && isRecord(firstChoice.message) ? firstChoice.message : null;
  const choiceDelta = firstChoice && isRecord(firstChoice.delta) ? firstChoice.delta : null;

  if (choiceMessage) {
    contentChunk =
      pickText(
        choiceMessage,
        ["content", "response", "text", "output", "answer", "result"],
        { trim: false },
      ) || "";
    thinkingChunk =
      pickText(
        choiceMessage,
        [
          "thinking",
          "reasoning",
          "reasoning_content",
          "reasoningContent",
          "think",
        ],
        { trim: false },
      ) || "";
  }

  if (!contentChunk && choiceDelta) {
    contentChunk =
      pickText(
        choiceDelta,
        ["content", "response", "text", "output", "answer", "result"],
        { trim: false },
      ) || "";
  }

  if (!thinkingChunk && choiceDelta) {
    thinkingChunk =
      pickText(
        choiceDelta,
        [
          "thinking",
          "reasoning",
          "reasoning_content",
          "reasoningContent",
          "think",
        ],
        { trim: false },
      ) || "";
  }

  if (isRecord(source.message)) {
    contentChunk =
      pickText(
        source.message,
        ["content", "response", "text", "output", "answer", "result"],
        { trim: false },
      ) || "";
    thinkingChunk =
      pickText(
        source.message,
        [
          "thinking",
          "reasoning",
          "reasoning_content",
          "reasoningContent",
          "think",
        ],
        { trim: false },
      ) || "";
  }

  if (!contentChunk && isRecord(source.delta)) {
    contentChunk =
      pickText(
        source.delta,
        ["content", "response", "text", "output", "answer", "result"],
        { trim: false },
      ) || "";
  }

  if (!thinkingChunk && isRecord(source.delta)) {
    thinkingChunk =
      pickText(
        source.delta,
        [
          "thinking",
          "reasoning",
          "reasoning_content",
          "reasoningContent",
          "think",
        ],
        { trim: false },
      ) || "";
  }

  if (!contentChunk) {
    contentChunk =
      pickText(
        source,
        ["response", "content", "text", "output", "answer", "result"],
        { trim: false },
      ) || "";
  }

  if (!thinkingChunk) {
    thinkingChunk =
      pickText(
        source,
        [
          "thinking",
          "reasoning",
          "reasoning_content",
          "reasoningContent",
          "think",
        ],
        { trim: false },
      ) || "";
  }

  return {
    contentChunk,
    thinkingChunk,
    done: source.done === true,
  };
};

const resolveApiErrorMessage = (payload: unknown, status: number): string => {
  if (isRecord(payload)) {
    const directMessage = pickText(payload, [
      "error",
      "message",
      "msg",
      "detail",
      "description",
    ]);
    if (directMessage) {
      return directMessage;
    }

    if (isRecord(payload.data)) {
      const dataMessage = pickText(payload.data, [
        "error",
        "message",
        "msg",
        "detail",
        "description",
      ]);
      if (dataMessage) {
        return dataMessage;
      }
    }
  }

  return `聊天请求失败（HTTP ${status}）`;
};

const mapChatError = (error: unknown): Error => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return new Error(
      `聊天请求超时（前端 ${Math.ceil(FRONTEND_CHAT_TIMEOUT_MS / 1000)} 秒），请稍后重试`,
    );
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new Error(
      `聊天请求超时（前端 ${Math.ceil(FRONTEND_CHAT_TIMEOUT_MS / 1000)} 秒），请稍后重试`,
    );
  }

  if (error instanceof HttpClientError) {
    const resolvedStatus = error.status >= 400 ? error.status : error.code;

    if (resolvedStatus === 401) {
      return new Error(`鉴权失败（401）：${error.message}`);
    }

    if (resolvedStatus === 429) {
      return new Error(`调用额度已用尽（429）：${error.message}`);
    }

    if (resolvedStatus === 502 || resolvedStatus === 504) {
      return new Error(
        `上游模型服务暂时不可用（${resolvedStatus}），请稍后重试`,
      );
    }

    if (resolvedStatus) {
      return new Error(
        error.message || `聊天请求失败（HTTP ${resolvedStatus}）`,
      );
    }

    return new Error(error.message || "聊天请求失败，请稍后重试");
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("聊天请求失败，请稍后重试");
};

const processParsedPayload = (
  parsed: unknown,
  state: {
    content: string;
    thinking: string;
    durationMs?: number;
    conversationId?: number;
    quota: QuotaInfo;
  },
  onDelta?: (next: StreamState) => void,
): void => {
  if (!isRecord(parsed)) {
    return;
  }

  let source: Record<string, unknown> = parsed;

  if (typeof parsed.code === "number") {
    const businessCode = parsed.code;
    if (businessCode < 200 || businessCode >= 300) {
      throw new HttpClientError(
        resolveApiErrorMessage(parsed, 200),
        200,
        businessCode,
        parsed,
      );
    }

    if (isRecord(parsed.data)) {
      state.quota = extractQuotaInfo(parsed.data, state.quota);
      state.durationMs = extractDurationMs(parsed.data, state.durationMs);
      state.conversationId = extractConversationId(
        parsed.data,
        state.conversationId,
      );

      if (isRecord(parsed.data.upstream)) {
        source = parsed.data.upstream;
      } else if (typeof parsed.data.upstream === "string") {
        source = { response: parsed.data.upstream };
      } else {
        source = parsed.data;
      }
    }
  }

  const previousContent = state.content;
  const previousThinking = state.thinking;
  const previousDuration = state.durationMs;
  const previousConversationId = state.conversationId;
  const delta = extractDeltaFromSource(source);

  state.content = mergeChunk(state.content, delta.contentChunk);
  state.thinking = mergeChunk(state.thinking, delta.thinkingChunk);
  state.durationMs = extractDurationMs(source, state.durationMs);
  state.conversationId = extractConversationId(source, state.conversationId);

  if (
    state.content !== previousContent ||
    state.thinking !== previousThinking ||
    state.durationMs !== previousDuration ||
    state.conversationId !== previousConversationId
  ) {
    onDelta?.({
      content: state.content,
      thinking: state.thinking,
      durationMs: state.durationMs,
      conversationId: state.conversationId,
    });
  }
};

export const generateChatResponse = async (
  modelId: string,
  history: Message[],
  currentMessage: string,
  attachments: Attachment[],
  user: User | null,
  options: GenerateChatResponseOptions = {},
): Promise<GenerateChatResponseResult> => {
  const payload: LlmChatPayload = {
    user_id: resolveNumericUserId(user),
    model: modelId,
    stream: true,
    think: options.thinkEnabled ?? true,
    messages: buildChatMessages(history, currentMessage, attachments),
  };

  const normalizedConversationId = normalizeConversationId(
    options.conversationId,
  );
  if (normalizedConversationId) {
    payload.conversation_id = normalizedConversationId;
  }

  const abortController = new AbortController();
  const timeoutTimer = window.setTimeout(() => {
    abortController.abort();
  }, FRONTEND_CHAT_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl("/llm/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const rawText = await response.text();
      const parsed = rawText ? tryParseJson(rawText) : null;
      const message = resolveApiErrorMessage(parsed, response.status);
      const businessCode =
        isRecord(parsed) && typeof parsed.code === "number"
          ? parsed.code
          : undefined;

      throw new HttpClientError(message, response.status, businessCode, parsed);
    }

    const streamState = {
      content: "",
      thinking: "",
      durationMs: undefined as number | undefined,
      conversationId: undefined as number | undefined,
      quota: {} as QuotaInfo,
    };

    const conversationIdFromHeader = normalizeConversationId(
      response.headers.get("X-Conversation-ID"),
    );
    if (conversationIdFromHeader) {
      streamState.conversationId = conversationIdFromHeader;
      options.onConversationId?.(conversationIdFromHeader);
    }

    if (!response.body) {
      const rawText = await response.text();
      if (rawText.trim()) {
        processParsedPayload(
          tryParseJson(rawText),
          streamState,
          options.onDelta,
        );
      }

      return {
        content:
          streamState.content.trim() || "请求成功，但暂未解析到模型文本输出。",
        thinking: streamState.thinking.trim() || undefined,
        quota:
          Object.keys(streamState.quota).length > 0
            ? streamState.quota
            : undefined,
        durationMs: streamState.durationMs,
        conversationId: streamState.conversationId,
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (let line of lines) {
        line = line.trim();
        if (!line) {
          continue;
        }

        if (line.startsWith("data:")) {
          line = line.slice(5).trim();
        }

        if (!line || line === "[DONE]") {
          continue;
        }

        processParsedPayload(tryParseJson(line), streamState, options.onDelta);
      }
    }

    buffer += decoder.decode();
    const tail = buffer.trim();
    if (tail) {
      const tailLines = tail.split("\n");
      for (let line of tailLines) {
        line = line.trim();
        if (!line) {
          continue;
        }

        if (line.startsWith("data:")) {
          line = line.slice(5).trim();
        }

        if (!line || line === "[DONE]") {
          continue;
        }

        processParsedPayload(tryParseJson(line), streamState, options.onDelta);
      }
    }

    return {
      content:
        streamState.content.trim() || "请求成功，但暂未解析到模型文本输出。",
      thinking: streamState.thinking.trim() || undefined,
      quota:
        Object.keys(streamState.quota).length > 0
          ? streamState.quota
          : undefined,
      durationMs: streamState.durationMs,
      conversationId: streamState.conversationId,
    };
  } catch (error) {
    throw mapChatError(error);
  } finally {
    window.clearTimeout(timeoutTimer);
  }
};
