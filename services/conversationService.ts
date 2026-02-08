import { HttpClientError, apiClient } from './httpClient';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const pickText = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
};

interface ConversationListApiItem {
  conversation_id?: number | string;
  title?: string;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface ConversationListApiData {
  user_id?: number;
  page?: number;
  page_size?: number;
  total?: number;
  items?: ConversationListApiItem[];
}

interface ConversationMemoryApiItem {
  memory_id?: number | string;
  role?: string;
  content?: string;
  thinking?: string;
  thinking_duration_ms?: number | string;
  thinkingDurationMs?: number | string;
  created_at?: string;
  updated_at?: string;
}

interface ConversationMemoryApiData {
  user_id?: number;
  conversation_id?: number | string;
  page?: number;
  page_size?: number;
  total?: number;
  items?: ConversationMemoryApiItem[];
}

export interface ConversationListItem {
  conversationId: number;
  title: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationListResult {
  userId: number;
  page: number;
  pageSize: number;
  total: number;
  items: ConversationListItem[];
}

export interface ConversationMemoryItem {
  memoryId: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  thinkingDurationMs?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationMemoryResult {
  userId: number;
  conversationId: number;
  page: number;
  pageSize: number;
  total: number;
  items: ConversationMemoryItem[];
}

export interface RenameConversationPayload {
  userId: number;
  conversationId: number;
  title: string;
}

export interface RenameConversationResult {
  userId: number;
  conversationId: number;
  title: string;
  updatedAt?: string;
}

export interface DeleteConversationPayload {
  userId: number;
  conversationId: number;
}

export interface DeleteConversationResult {
  userId: number;
  conversationId: number;
  deleted: boolean;
}

interface RenameConversationApiData {
  user_id?: number;
  conversation_id?: number | string;
  title?: string;
  updated_at?: string;
}

interface DeleteConversationApiData {
  user_id?: number;
  conversation_id?: number | string;
  deleted?: boolean;
}

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

interface ConversationListOptions extends PaginationOptions {
  userId: number;
}

interface ConversationMemoryOptions extends PaginationOptions {
  userId: number;
  conversationId: number;
}

const DEFAULT_CONVERSATION_PAGE_SIZE = 20;
const DEFAULT_MEMORY_PAGE_SIZE = 50;

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

const normalizePositiveInteger = (value: number, fieldName: string): number => {
  const parsed = Number(value);
  if (!isPositiveInteger(parsed)) {
    throw new Error(`${fieldName} 必须是大于 0 的整数`);
  }

  return parsed;
};

const normalizeConversationId = (value: unknown): number => {
  if (typeof value === 'number' && isPositiveInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.trim());
    if (isPositiveInteger(parsed)) {
      return parsed;
    }
  }

  throw new Error('conversation_id 必须是大于 0 的整数');
};

const normalizeOptionalDurationMs = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.max(1, Math.round(value));
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.max(1, Math.round(parsed));
    }
  }

  return undefined;
};

const extractHttpErrorSignal = (error: HttpClientError): string => {
  const chunks: string[] = [];

  const pushChunk = (value?: string) => {
    if (typeof value !== 'string') {
      return;
    }

    const trimmed = value.trim();
    if (trimmed) {
      chunks.push(trimmed.toUpperCase());
    }
  };

  pushChunk(error.message);

  if (isRecord(error.details)) {
    pushChunk(pickText(error.details, ['error', 'message', 'msg', 'detail', 'description']));

    if (isRecord(error.details.data)) {
      pushChunk(pickText(error.details.data, ['error', 'message', 'msg', 'detail', 'description']));
    }
  }

  return chunks.join(' | ');
};

const mapConversationError = (error: unknown, target: 'list' | 'memory' | 'rename' | 'delete'): Error => {
  if (error instanceof HttpClientError) {
    const signal = extractHttpErrorSignal(error);

    if (signal.includes('USER_ID_REQUIRED')) {
      return new Error('缺少 user_id，请重新登录后重试');
    }

    if (signal.includes('USER_TOKEN_MISMATCH')) {
      return new Error('当前登录用户与 user_id 不匹配，请重新登录后重试');
    }

    if (signal.includes('TOKEN_NOT_FOUND')) {
      return new Error('该用户尚未绑定可用 Token，请先在用量管理中完成配置');
    }

    if (signal.includes('TOKEN_DISABLED')) {
      return new Error('该用户 Token 已停用，请先在用量管理中启用后再试');
    }

    if (signal.includes('CONVERSATION_ID_INVALID')) {
      return new Error('会话 ID 不合法，请刷新页面后重试');
    }

    if (signal.includes('PAGE_INVALID')) {
      return new Error('分页参数 page 不合法，请检查请求参数');
    }

    if (signal.includes('PAGE_SIZE_INVALID')) {
      return new Error('分页参数 page_size 超出限制，请调整后重试');
    }

    if (signal.includes('TITLE_REQUIRED') || signal.includes('TITLE_INVALID')) {
      return new Error('会话标题不能为空，请输入后重试');
    }

    if (signal.includes('CONVERSATION_NOT_FOUND')) {
      if (target === 'list') {
        return new Error('当前账号暂无历史会话');
      }

      return new Error('会话不存在或不属于当前用户');
    }

    if (signal.includes('CONVERSATION_SERVICE_UNAVAILABLE') || signal.includes('GATEWAY_UNAVAILABLE')) {
      return new Error('会话服务暂时不可用，请稍后重试');
    }

    if (error.status === 404) {
      if (target === 'list') {
        return new Error('会话列表暂不可用，请确认后端已提供 /llm/conversations 接口');
      }

      return new Error('会话不存在或不属于当前用户');
    }

    if (error.status >= 500) {
      return new Error('会话服务暂时不可用，请稍后重试');
    }

    return new Error(error.message || `请求失败（HTTP ${error.status}）`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('请求失败，请稍后重试');
};

const normalizeTitle = (value?: string): string => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return '新对话';
};

const normalizeRenameTitle = (title: string): string => {
  const normalized = title.trim();

  if (!normalized) {
    throw new Error('会话标题不能为空');
  }

  return normalized;
};

export const fetchConversationList = async (
  options: ConversationListOptions,
): Promise<ConversationListResult> => {
  const userId = normalizePositiveInteger(options.userId, 'user_id');
  const page = normalizePositiveInteger(options.page || 1, 'page');
  const pageSize = normalizePositiveInteger(options.pageSize || DEFAULT_CONVERSATION_PAGE_SIZE, 'page_size');

  try {
    const data = await apiClient.get<ConversationListApiData>(
      `/llm/conversations?user_id=${encodeURIComponent(String(userId))}&page=${encodeURIComponent(String(page))}&page_size=${encodeURIComponent(String(pageSize))}`,
    );

    const items = Array.isArray(data.items)
      ? data.items
          .map(item => {
            if (item?.conversation_id === undefined || item.conversation_id === null) {
              return null;
            }

            const conversationId = normalizeConversationId(item.conversation_id);
            return {
              conversationId,
              title: normalizeTitle(item.title),
              lastMessageAt: typeof item.last_message_at === 'string' ? item.last_message_at : undefined,
              createdAt: typeof item.created_at === 'string' ? item.created_at : undefined,
              updatedAt: typeof item.updated_at === 'string' ? item.updated_at : undefined,
            } as ConversationListItem;
          })
          .filter((item): item is ConversationListItem => item !== null)
      : [];

    return {
      userId,
      page: isPositiveInteger(Number(data.page)) ? Number(data.page) : page,
      pageSize: isPositiveInteger(Number(data.page_size)) ? Number(data.page_size) : pageSize,
      total: typeof data.total === 'number' && data.total >= 0 ? data.total : items.length,
      items,
    };
  } catch (error) {
    throw mapConversationError(error, 'list');
  }
};

export const fetchConversationMemories = async (
  options: ConversationMemoryOptions,
): Promise<ConversationMemoryResult> => {
  const userId = normalizePositiveInteger(options.userId, 'user_id');
  const page = normalizePositiveInteger(options.page || 1, 'page');
  const pageSize = normalizePositiveInteger(options.pageSize || DEFAULT_MEMORY_PAGE_SIZE, 'page_size');
  const conversationId = normalizeConversationId(options.conversationId);

  try {
    const data = await apiClient.get<ConversationMemoryApiData>(
      `/llm/conversations/${encodeURIComponent(String(conversationId))}/memories?user_id=${encodeURIComponent(String(userId))}&page=${encodeURIComponent(String(page))}&page_size=${encodeURIComponent(String(pageSize))}`,
    );

    const items = Array.isArray(data.items)
      ? data.items
          .map(item => {
            if (!item || item.memory_id === undefined || item.memory_id === null) {
              return null;
            }

            const role = item.role === 'assistant' ? 'assistant' : 'user';
            return {
              memoryId: String(item.memory_id),
              role,
              content: typeof item.content === 'string' ? item.content : '',
              thinking: typeof item.thinking === 'string' && item.thinking.trim() ? item.thinking.trim() : undefined,
              thinkingDurationMs: normalizeOptionalDurationMs(item.thinking_duration_ms)
                ?? normalizeOptionalDurationMs(item.thinkingDurationMs),
              createdAt: typeof item.created_at === 'string' ? item.created_at : undefined,
              updatedAt: typeof item.updated_at === 'string' ? item.updated_at : undefined,
            } as ConversationMemoryItem;
          })
          .filter((item): item is ConversationMemoryItem => item !== null)
      : [];

    return {
      userId,
      conversationId,
      page: isPositiveInteger(Number(data.page)) ? Number(data.page) : page,
      pageSize: isPositiveInteger(Number(data.page_size)) ? Number(data.page_size) : pageSize,
      total: typeof data.total === 'number' && data.total >= 0 ? data.total : items.length,
      items,
    };
  } catch (error) {
    throw mapConversationError(error, 'memory');
  }
};

export const renameConversation = async (
  payload: RenameConversationPayload,
): Promise<RenameConversationResult> => {
  const userId = normalizePositiveInteger(payload.userId, 'user_id');
  const conversationId = normalizeConversationId(payload.conversationId);
  const title = normalizeRenameTitle(payload.title);

  try {
    const data = await apiClient.patch<RenameConversationApiData, { user_id: number; title: string }>(
      `/llm/conversations/${encodeURIComponent(String(conversationId))}`,
      {
        user_id: userId,
        title,
      },
    );

    return {
      userId: isPositiveInteger(Number(data.user_id)) ? Number(data.user_id) : userId,
      conversationId: data.conversation_id !== undefined && data.conversation_id !== null
        ? normalizeConversationId(data.conversation_id)
        : conversationId,
      title: normalizeTitle(data.title || title),
      updatedAt: typeof data.updated_at === 'string' ? data.updated_at : undefined,
    };
  } catch (error) {
    throw mapConversationError(error, 'rename');
  }
};

export const deleteConversation = async (
  payload: DeleteConversationPayload,
): Promise<DeleteConversationResult> => {
  const userId = normalizePositiveInteger(payload.userId, 'user_id');
  const conversationId = normalizeConversationId(payload.conversationId);

  try {
    const data = await apiClient.delete<DeleteConversationApiData>(
      `/llm/conversations/${encodeURIComponent(String(conversationId))}?user_id=${encodeURIComponent(String(userId))}`,
    );

    return {
      userId: isPositiveInteger(Number(data.user_id)) ? Number(data.user_id) : userId,
      conversationId: data.conversation_id !== undefined && data.conversation_id !== null
        ? normalizeConversationId(data.conversation_id)
        : conversationId,
      deleted: data.deleted !== false,
    };
  } catch (error) {
    throw mapConversationError(error, 'delete');
  }
};
