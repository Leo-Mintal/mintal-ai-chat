import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Auth } from "./components/Auth";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { Settings } from "./components/Settings";
import { Profile } from "./components/Profile";
import { AdminPanel } from "./components/AdminPanel";
import { Select } from "./components/ui/Select";
import { Modal } from "./components/ui/Modal";
import { Button } from "./components/ui/Button";
import {
  User,
  Message,
  Conversation,
  AppState,
  Attachment,
  View,
  Theme,
  AuthCredentials,
  ModelOption,
} from "./types";
import { generateChatResponse } from "./services/aiService";
import {
  authenticate,
  logoutWithServer,
  restoreSessionAndFetchUser,
  updateCurrentUserProfile,
} from "./services/authService";
import { updateAuthUser } from "./services/authStorage";
import { fetchRemoteModelOptions } from "./services/modelService";
import { fetchUserQuota, UserQuotaSummary } from "./services/adminService";
import {
  ConversationMemoryItem,
  ConversationListItem,
  deleteConversation as deleteRemoteConversation,
  fetchConversationList,
  fetchConversationMemories,
  renameConversation as renameRemoteConversation,
} from "./services/conversationService";
import {
  Menu,
  AlertTriangle,
  Trash2,
  PanelLeftOpen,
  Star,
  Heart,
} from "lucide-react";

// Star & Blob Background (Unified with Auth)
const UnifiedBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft Gradient Blobs (Matches Auth) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cheese-200 to-pink-200 dark:from-starlight-500/10 dark:to-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200 to-cheese-100 dark:from-blue-900/10 dark:to-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float"
        style={{ animationDelay: "3s" }}
      ></div>

      {/* Floating Cute Elements (Subtle) */}
      <div className="absolute top-[10%] right-[20%] text-cheese-200 dark:text-starlight-500/10 animate-bounce-soft opacity-40">
        <Star size={32} fill="currentColor" className="rotate-12" />
      </div>
      <div
        className="absolute bottom-[15%] left-[5%] text-pink-200 dark:text-pink-500/10 animate-bounce-soft opacity-40"
        style={{ animationDelay: "2s" }}
      >
        <Heart size={24} fill="currentColor" className="-rotate-12" />
      </div>

      {/* Twinkling Stars for Dark Mode */}
      <div className="opacity-0 dark:opacity-100 transition-opacity duration-300">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star animate-twinkle"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const toPositiveInteger = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const CONVERSATION_LIST_PAGE_SIZE = 20;
const CONVERSATION_MEMORY_PAGE_SIZE = 10;

const AI_BUBBLE_COOKIE_KEY = "mintal_ai_bubble";
const AI_BUBBLE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const readCookieValue = (name: string): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cookieParts = window.document.cookie
    ? window.document.cookie.split("; ")
    : [];

  for (const entry of cookieParts) {
    const separatorIndex = entry.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = entry.slice(0, separatorIndex);
    if (key === name) {
      return decodeURIComponent(entry.slice(separatorIndex + 1));
    }
  }

  return null;
};

const loadAiBubblePreference = (): boolean => {
  return readCookieValue(AI_BUBBLE_COOKIE_KEY) === "1";
};

const saveAiBubblePreference = (enabled: boolean): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.document.cookie = `${AI_BUBBLE_COOKIE_KEY}=${enabled ? "1" : "0"}; path=/; max-age=${AI_BUBBLE_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
};

const parseTimeToTimestamp = (value?: string): number => {
  if (!value) {
    return Date.now();
  }

  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) {
    return Date.now();
  }

  return parsed;
};

const pickConversationTitle = (
  title: string | undefined,
  fallback = "新对话",
): string => {
  if (typeof title === "string" && title.trim()) {
    return title.trim();
  }

  return fallback;
};

const buildRemoteConversationLocalId = (conversationId: number): string => {
  return `remote-${conversationId}`;
};

interface ConversationMemoryMeta {
  nextPage: number;
  hasMore: boolean;
  total: number;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  loadError: string;
  initialized: boolean;
}

const createDefaultConversationMemoryMeta = (): ConversationMemoryMeta => ({
  nextPage: 2,
  hasMore: false,
  total: 0,
  isLoadingInitial: false,
  isLoadingMore: false,
  loadError: "",
  initialized: false,
});

const mapMemoryItemToMessage = (item: ConversationMemoryItem): Message => ({
  id: `memory-${item.memoryId}`,
  role: item.role === "assistant" ? "model" : "user",
  content: item.content || "",
  thinking: item.role === "assistant" ? item.thinking : undefined,
  thinkingDurationMs:
    item.role === "assistant" ? item.thinkingDurationMs : undefined,
  timestamp: parseTimeToTimestamp(item.createdAt || item.updatedAt),
});

const mergeMessagesByIdSorted = (incoming: Message[]): Message[] => {
  const byId = new Map<string, Message>();
  incoming.forEach((message) => {
    byId.set(message.id, message);
  });

  return Array.from(byId.values()).sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }

    return a.id.localeCompare(b.id);
  });
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [currentView, setCurrentView] = useState<View>("CHAT");
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [currentModel, setCurrentModel] = useState<string>("");
  const [modelOptionsLoading, setModelOptionsLoading] = useState(true);
  const [modelOptionsError, setModelOptionsError] = useState("");
  const [thinkEnabled, setThinkEnabled] = useState(true);
  const [theme, setTheme] = useState<Theme>("system");
  const [aiBubbleEnabled, setAiBubbleEnabled] = useState<boolean>(() =>
    loadAiBubblePreference(),
  );

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversationListPage, setConversationListPage] = useState(1);
  const [conversationListHasMore, setConversationListHasMore] = useState(false);
  const [conversationListLoading, setConversationListLoading] = useState(false);
  const [conversationListAppending, setConversationListAppending] =
    useState(false);
  const [conversationListError, setConversationListError] = useState("");
  const [conversationMemoryMeta, setConversationMemoryMeta] = useState<
    Record<string, ConversationMemoryMeta>
  >({});

  const [conversationLoadingState, setConversationLoadingState] = useState<
    Record<string, boolean>
  >({});
  const [modalOpen, setModalOpen] = useState<"none" | "confirm_delete">("none");
  const [authBootstrapping, setAuthBootstrapping] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState<UserQuotaSummary | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [quotaError, setQuotaError] = useState("");
  const sendingGuardRef = useRef<Record<string, boolean>>({});
  const initialMemoryRequestSeqRef = useRef<Record<string, number>>({});
  const olderMemoryLoadingRef = useRef<Record<string, boolean>>({});
  const activeConversationMeta = activeConvId
    ? conversationMemoryMeta[activeConvId]
    : undefined;
  const activeConversationLoading = activeConvId
    ? Boolean(conversationLoadingState[activeConvId])
    : false;
  const historyLoading = Boolean(activeConversationMeta?.isLoadingInitial);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      if (theme === "dark") root.classList.add("dark");
      else if (theme === "light") root.classList.remove("dark");
      else
        mediaQuery.matches
          ? root.classList.add("dark")
          : root.classList.remove("dark");
    };
    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    saveAiBubblePreference(aiBubbleEnabled);
  }, [aiBubbleEnabled]);

  const setConversationLoading = useCallback(
    (conversationId: string, nextLoading: boolean) => {
      setConversationLoadingState((prev) => {
        if (nextLoading) {
          if (prev[conversationId]) {
            return prev;
          }

          return {
            ...prev,
            [conversationId]: true,
          };
        }

        if (!prev[conversationId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    },
    [],
  );

  const isConversationBusy = useCallback((conversationId?: string | null) => {
    if (!conversationId) {
      return false;
    }

    return Boolean(sendingGuardRef.current[conversationId]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRemoteModels = async () => {
      setModelOptionsLoading(true);
      setModelOptionsError("");

      try {
        const { options: remoteModels, defaultModelId } =
          await fetchRemoteModelOptions();

        if (cancelled) {
          return;
        }

        if (remoteModels.length === 0) {
          setModelOptions([]);
          setCurrentModel("");
          setModelOptionsError("暂无可用模型，请先在后端配置 /models");
          return;
        }

        setModelOptions(remoteModels);
        setCurrentModel((previousModel) => {
          if (remoteModels.some((model) => model.id === previousModel)) {
            return previousModel;
          }

          if (
            defaultModelId &&
            remoteModels.some((model) => model.id === defaultModelId)
          ) {
            return defaultModelId;
          }

          return remoteModels[0].id;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setModelOptions([]);
        setCurrentModel("");
        setModelOptionsError("模型列表加载失败，请稍后重试");
        console.error("加载远程模型列表失败", error);
      } finally {
        if (!cancelled) {
          setModelOptionsLoading(false);
        }
      }
    };

    void loadRemoteModels();

    return () => {
      cancelled = true;
    };
  }, []);

  const syncUserQuota = useCallback(
    async (targetUser: User | null, options: { silent?: boolean } = {}) => {
      const userId = toPositiveInteger(targetUser?.id);
      if (!userId) {
        setQuotaInfo(null);
        setQuotaError("当前账号缺少有效 user_id");
        return;
      }

      if (!options.silent) {
        setQuotaLoading(true);
      }

      try {
        const latestQuota = await fetchUserQuota(userId);
        setQuotaInfo(latestQuota);
        setQuotaError("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "额度状态获取失败";
        setQuotaError(message);
      } finally {
        if (!options.silent) {
          setQuotaLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (appState !== AppState.CHAT || !user) {
      return;
    }

    void syncUserQuota(user, { silent: true });

    const timer = window.setInterval(() => {
      void syncUserQuota(user, { silent: true });
    }, 15000);

    return () => {
      window.clearInterval(timer);
    };
  }, [appState, user, syncUserQuota]);

  const startNewChat = useCallback(() => {
    const newId = `local-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: "新对话",
      updatedAt: Date.now(),
      preview: "开始新的聊天...",
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newId]: [] }));
    setConversationMemoryMeta((prev) => ({
      ...prev,
      [newId]: {
        ...createDefaultConversationMemoryMeta(),
        initialized: true,
      },
    }));
    setActiveConvId(newId);

    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const mergeRemoteConversations = useCallback(
    (
      current: Conversation[],
      remoteItems: ConversationListItem[],
      append: boolean,
    ): Conversation[] => {
      const remoteConversationIds = new Set<number>();

      const mappedRemote = remoteItems.map((item) => {
        remoteConversationIds.add(item.conversationId);
        const matched = current.find(
          (conv) => conv.backendConversationId === item.conversationId,
        );

        return {
          id:
            matched?.id || buildRemoteConversationLocalId(item.conversationId),
          title: pickConversationTitle(item.title),
          updatedAt: parseTimeToTimestamp(
            item.lastMessageAt || item.updatedAt || item.createdAt,
          ),
          preview:
            matched?.preview ||
            pickConversationTitle(item.title, "点击查看历史消息"),
          backendConversationId: item.conversationId,
        } satisfies Conversation;
      });

      if (append) {
        const merged = [...current];

        for (const incoming of mappedRemote) {
          const matchIndex = merged.findIndex(
            (conv) =>
              conv.backendConversationId === incoming.backendConversationId,
          );

          if (matchIndex >= 0) {
            merged[matchIndex] = { ...merged[matchIndex], ...incoming };
          } else {
            merged.push(incoming);
          }
        }

        return merged;
      }

      const localDrafts = current.filter((conv) => !conv.backendConversationId);
      const staleRemote = current.filter(
        (conv) =>
          conv.backendConversationId &&
          !remoteConversationIds.has(conv.backendConversationId),
      );

      return [...localDrafts, ...mappedRemote, ...staleRemote];
    },
    [],
  );

  const loadConversationListPage = useCallback(
    async (
      targetUser: User | null,
      options: { page?: number; append?: boolean; silent?: boolean } = {},
    ) => {
      const userId = toPositiveInteger(targetUser?.id);

      if (!userId) {
        setConversationListHasMore(false);
        setConversationListError("当前账号缺少有效 user_id");
        return null;
      }

      const page = options.page && options.page > 0 ? options.page : 1;
      const append = Boolean(options.append);
      const silent = Boolean(options.silent);

      if (!silent) {
        if (append) {
          setConversationListAppending(true);
        } else {
          setConversationListLoading(true);
        }
      }

      try {
        const result = await fetchConversationList({
          userId,
          page,
          pageSize: CONVERSATION_LIST_PAGE_SIZE,
        });

        setConversationListError("");
        setConversationListPage(result.page);
        setConversationListHasMore(
          result.page * result.pageSize < result.total,
        );
        setConversations((prev) =>
          mergeRemoteConversations(prev, result.items, append),
        );

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "会话列表加载失败";
        setConversationListError(message);
        return null;
      } finally {
        if (!silent) {
          if (append) {
            setConversationListAppending(false);
          } else {
            setConversationListLoading(false);
          }
        }
      }
    },
    [mergeRemoteConversations],
  );

  const updateConversationMemoryMeta = useCallback(
    (
      conversationId: string,
      updater: (prev: ConversationMemoryMeta) => ConversationMemoryMeta,
    ) => {
      setConversationMemoryMeta((prev) => {
        const current =
          prev[conversationId] || createDefaultConversationMemoryMeta();
        const next = updater(current);

        return {
          ...prev,
          [conversationId]: next,
        };
      });
    },
    [],
  );

  const loadInitialConversationMemories = useCallback(
    async (conversationId: string, targetUser: User | null) => {
      const cachedMessages = messages[conversationId] || [];
      const existingMeta = conversationMemoryMeta[conversationId];
      const hasStreamingMessage = cachedMessages.some(
        (message) => message.role === "model" && message.isStreaming,
      );

      if (existingMeta?.isLoadingInitial) {
        return;
      }

      if (
        hasStreamingMessage ||
        (existingMeta?.initialized &&
          !existingMeta.loadError &&
          cachedMessages.length > 0)
      ) {
        return;
      }

      const userId = toPositiveInteger(targetUser?.id);
      if (!userId) {
        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          isLoadingInitial: false,
          loadError: "当前账号缺少有效 user_id",
          initialized: true,
          hasMore: false,
        }));
        return;
      }

      const targetConversation = conversations.find(
        (conv) => conv.id === conversationId,
      );
      if (!targetConversation?.backendConversationId) {
        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          isLoadingInitial: false,
          isLoadingMore: false,
          loadError: "",
          initialized: true,
          hasMore: false,
          total: messages[conversationId]?.length || 0,
          nextPage: 2,
        }));
        return;
      }

      const requestSeq =
        (initialMemoryRequestSeqRef.current[conversationId] || 0) + 1;
      initialMemoryRequestSeqRef.current[conversationId] = requestSeq;

      updateConversationMemoryMeta(conversationId, (prev) => ({
        ...prev,
        isLoadingInitial: true,
        loadError: "",
      }));

      try {
        const result = await fetchConversationMemories({
          userId,
          conversationId: targetConversation.backendConversationId,
          page: 1,
          pageSize: CONVERSATION_MEMORY_PAGE_SIZE,
        });

        if (initialMemoryRequestSeqRef.current[conversationId] !== requestSeq) {
          return;
        }

        const remoteMessages = mergeMessagesByIdSorted(
          result.items.map(mapMemoryItemToMessage),
        );

        setMessages((prev) => {
          const currentMessages = prev[conversationId] || [];
          const hasStreamingLocalMessage = currentMessages.some(
            (message) => message.role === "model" && message.isStreaming,
          );

          if (hasStreamingLocalMessage) {
            return prev;
          }

          return {
            ...prev,
            [conversationId]: remoteMessages,
          };
        });

        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          isLoadingInitial: false,
          isLoadingMore: false,
          initialized: true,
          loadError: "",
          nextPage: result.page + 1,
          hasMore: result.page * result.pageSize < result.total,
          total: result.total,
        }));

        if (remoteMessages.length > 0) {
          const latestMessage = remoteMessages[remoteMessages.length - 1];
          setConversations((prev) =>
            prev.map((item) =>
              item.id === conversationId
                ? {
                    ...item,
                    preview: latestMessage.content.slice(0, 40) || item.preview,
                    updatedAt: latestMessage.timestamp || item.updatedAt,
                  }
                : item,
            ),
          );
        }
      } catch (error) {
        if (initialMemoryRequestSeqRef.current[conversationId] !== requestSeq) {
          return;
        }

        console.error("加载会话历史失败", error);
        const message =
          error instanceof Error
            ? error.message
            : "加载会话历史失败，请稍后重试";
        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          isLoadingInitial: false,
          loadError: message,
          initialized: true,
        }));
      }
    },
    [conversationMemoryMeta, conversations, messages, updateConversationMemoryMeta],
  );

  const loadOlderConversationMemories = useCallback(
    async (conversationId: string, targetUser: User | null) => {
      const userId = toPositiveInteger(targetUser?.id);
      if (!userId) {
        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          loadError: "当前账号缺少有效 user_id",
          isLoadingMore: false,
        }));
        return;
      }

      const targetConversation = conversations.find(
        (conv) => conv.id === conversationId,
      );
      if (!targetConversation?.backendConversationId) {
        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          hasMore: false,
          isLoadingMore: false,
          loadError: "",
          initialized: true,
        }));
        return;
      }

      const meta =
        conversationMemoryMeta[conversationId] ||
        createDefaultConversationMemoryMeta();
      if (
        olderMemoryLoadingRef.current[conversationId] ||
        !meta.initialized ||
        !meta.hasMore ||
        meta.isLoadingMore ||
        meta.isLoadingInitial
      ) {
        return;
      }

      olderMemoryLoadingRef.current[conversationId] = true;
      updateConversationMemoryMeta(conversationId, (prev) => ({
        ...prev,
        isLoadingMore: true,
        loadError: "",
      }));

      try {
        const result = await fetchConversationMemories({
          userId,
          conversationId: targetConversation.backendConversationId,
          page: meta.nextPage,
          pageSize: CONVERSATION_MEMORY_PAGE_SIZE,
        });

        const olderMessages = mergeMessagesByIdSorted(
          result.items.map(mapMemoryItemToMessage),
        );
        setMessages((prev) => ({
          ...prev,
          [conversationId]: mergeMessagesByIdSorted([
            ...olderMessages,
            ...(prev[conversationId] || []),
          ]),
        }));

        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          isLoadingMore: false,
          loadError: "",
          initialized: true,
          nextPage: result.page + 1,
          hasMore: result.page * result.pageSize < result.total,
          total: result.total,
        }));
      } catch (error) {
        console.error("加载更早会话历史失败", error);
        const message =
          error instanceof Error
            ? error.message
            : "加载更早消息失败，请稍后重试";
        updateConversationMemoryMeta(conversationId, (prev) => ({
          ...prev,
          isLoadingMore: false,
          loadError: message,
        }));
      } finally {
        olderMemoryLoadingRef.current[conversationId] = false;
      }
    },
    [conversationMemoryMeta, conversations, updateConversationMemoryMeta],
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConvId(id);
      void loadInitialConversationMemories(id, user);
    },
    [loadInitialConversationMemories, user],
  );

  const handleLoadMoreConversations = useCallback(() => {
    if (!conversationListHasMore || conversationListAppending) {
      return;
    }

    void loadConversationListPage(user, {
      page: conversationListPage + 1,
      append: true,
    });
  }, [
    conversationListAppending,
    conversationListHasMore,
    conversationListPage,
    loadConversationListPage,
    user,
  ]);

  useEffect(() => {
    if (
      appState !== AppState.CHAT ||
      activeConvId ||
      conversations.length === 0
    ) {
      return;
    }

    const firstConversationId = conversations[0].id;
    setActiveConvId(firstConversationId);
    void loadInitialConversationMemories(firstConversationId, user);
  }, [
    activeConvId,
    appState,
    conversations,
    loadInitialConversationMemories,
    user,
  ]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const session = await restoreSessionAndFetchUser();

        if (!cancelled && session) {
          setUser(session.user);
          setAppState(AppState.CHAT);
          setCurrentView("CHAT");
          setConversations([]);
          setMessages({});
          setConversationMemoryMeta({});
          setConversationLoadingState({});
          initialMemoryRequestSeqRef.current = {};
          olderMemoryLoadingRef.current = {};
          sendingGuardRef.current = {};
          setActiveConvId(null);
          setConversationListPage(1);
          setConversationListHasMore(false);
          setConversationListError("");

          const list = await loadConversationListPage(session.user, {
            page: 1,
          });

          if (!cancelled && (!list || list.items.length === 0)) {
            startNewChat();
          }

          if (!cancelled) {
            void syncUserQuota(session.user);
          }
        }
      } finally {
        if (!cancelled) {
          setAuthBootstrapping(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [loadConversationListPage, startNewChat, syncUserQuota]);

  const handleDeleteConversation = async (id: string) => {
    const targetConversation = conversations.find((item) => item.id === id);
    const userId = toPositiveInteger(user?.id);

    if (targetConversation?.backendConversationId) {
      if (!userId) {
        setConversationListError("当前账号缺少有效 user_id，无法删除会话");
        return;
      }

      try {
        await deleteRemoteConversation({
          userId,
          conversationId: targetConversation.backendConversationId,
        });
        setConversationListError("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "删除会话失败，请稍后重试";
        setConversationListError(message);
        return;
      }
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const newMsgs = { ...prev };
      delete newMsgs[id];
      return newMsgs;
    });
    setConversationMemoryMeta((prev) => {
      const next = { ...prev };
      delete next[id];
      delete initialMemoryRequestSeqRef.current[id];
      delete olderMemoryLoadingRef.current[id];
      delete sendingGuardRef.current[id];
      return next;
    });
    setConversationLoadingState((prev) => {
      if (!prev[id]) {
        return prev;
      }

      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (activeConvId === id) {
      setActiveConvId(null);
    }

    void loadConversationListPage(user, { page: 1, silent: true });
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    const normalizedTitle = newTitle.trim();
    if (!normalizedTitle) {
      return;
    }

    const targetConversation = conversations.find((item) => item.id === id);
    const userId = toPositiveInteger(user?.id);

    if (targetConversation?.backendConversationId) {
      if (!userId) {
        setConversationListError("当前账号缺少有效 user_id，无法重命名会话");
        return;
      }

      try {
        const renamed = await renameRemoteConversation({
          userId,
          conversationId: targetConversation.backendConversationId,
          title: normalizedTitle,
        });

        setConversations((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  title: renamed.title,
                  updatedAt: parseTimeToTimestamp(renamed.updatedAt),
                }
              : item,
          ),
        );
        setConversationListError("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "重命名会话失败，请稍后重试";
        setConversationListError(message);
      }

      return;
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: normalizedTitle } : c)),
    );
  };

  const handleLogin = async (credentials: AuthCredentials) => {
    const session = await authenticate(credentials);

    setUser(session.user);
    setAppState(AppState.CHAT);
    setCurrentView("CHAT");
    setConversations([]);
    setMessages({});
    setConversationMemoryMeta({});
    setConversationLoadingState({});
    initialMemoryRequestSeqRef.current = {};
    olderMemoryLoadingRef.current = {};
    sendingGuardRef.current = {};
    setActiveConvId(null);
    setConversationListPage(1);
    setConversationListHasMore(false);
    setConversationListError("");

    const list = await loadConversationListPage(session.user, { page: 1 });
    if (!list || list.items.length === 0) {
      startNewChat();
    }

    void syncUserQuota(session.user);
  };

  const handleLogout = async () => {
    try {
      await logoutWithServer();
    } catch (error) {
      console.error("退出登录接口调用失败，将仅清理前端登录态", error);
    } finally {
      setUser(null);
      setAppState(AppState.AUTH);
      setCurrentView("CHAT");
      setConversations([]);
      setMessages({});
      setConversationMemoryMeta({});
      setConversationLoadingState({});
      initialMemoryRequestSeqRef.current = {};
      olderMemoryLoadingRef.current = {};
      sendingGuardRef.current = {};
      setActiveConvId(null);
      setConversationListPage(1);
      setConversationListHasMore(false);
      setConversationListLoading(false);
      setConversationListAppending(false);
      setConversationListError("");
      setIsSidebarOpen(false);
      setQuotaInfo(null);
      setQuotaError("");
      setQuotaLoading(false);
    }
  };

  const handleUpdateUser = async (payload: { name: string; email: string }) => {
    const nextUser = await updateCurrentUserProfile({
      username: payload.name,
      email: payload.email,
    });

    setUser(nextUser);
    updateAuthUser(nextUser);
  };

  const triggerAIResponse = async (
    chatId: string,
    history: Message[],
    userMessage: string,
    attachments: Attachment[],
    backendConversationId?: number,
  ) => {
    setConversationLoading(chatId, true);

    const assistantMessageId = `${Date.now()}-assistant`;
    const createdAt = Date.now();

    setMessages((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        {
          id: assistantMessageId,
          role: "model",
          content: "",
          thinking: "",
          thinkingDurationMs: 0,
          timestamp: createdAt,
          isStreaming: true,
        },
      ],
    }));

    const updateAssistantMessage = (updater: (message: Message) => Message) => {
      setMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map((item) =>
          item.id === assistantMessageId ? updater(item) : item,
        ),
      }));
    };

    const syncBackendConversationId = (conversationId?: number) => {
      if (!conversationId) {
        return;
      }

      setConversations((prev) =>
        prev.map((item) =>
          item.id === chatId && item.backendConversationId !== conversationId
            ? { ...item, backendConversationId: conversationId }
            : item,
        ),
      );
    };

    const durationTicker = window.setInterval(() => {
      updateAssistantMessage((item) => {
        if (!item.isStreaming) {
          return item;
        }

        return {
          ...item,
          thinkingDurationMs: Date.now() - createdAt,
        };
      });
    }, 200);

    try {
      const response = await generateChatResponse(
        currentModel,
        history,
        userMessage,
        attachments,
        user,
        {
          conversationId: backendConversationId,
          thinkEnabled,
          onConversationId: (conversationId) => {
            syncBackendConversationId(conversationId);
          },
          onDelta: ({ content, thinking, durationMs, conversationId }) => {
            const elapsedMs = Date.now() - createdAt;
            syncBackendConversationId(conversationId);

            updateAssistantMessage((item) => ({
              ...item,
              content,
              thinking,
              thinkingDurationMs:
                durationMs && durationMs > 0 ? durationMs : elapsedMs,
              timestamp: Date.now(),
              isStreaming: true,
              isError: false,
            }));
          },
        },
      );

      const finalDurationMs =
        response.durationMs && response.durationMs > 0
          ? response.durationMs
          : Date.now() - createdAt;

      updateAssistantMessage((item) => ({
        ...item,
        content: response.content,
        thinking: response.thinking,
        thinkingDurationMs: finalDurationMs,
        timestamp: Date.now(),
        isStreaming: false,
        isError: false,
      }));
      syncBackendConversationId(response.conversationId);

      if (response.quota) {
        const currentUserId = toPositiveInteger(user?.id);

        if (currentUserId) {
          setQuotaInfo((prev) => {
            const base =
              prev && prev.userId === currentUserId
                ? prev
                : {
                    userId: currentUserId,
                    quotaLimit: 0,
                    quotaUsed: 0,
                    quotaRemaining: 0,
                    updatedAt: Date.now(),
                  };

            return {
              ...base,
              quotaLimit:
                typeof response.quota.limit === "number"
                  ? response.quota.limit
                  : base.quotaLimit,
              quotaUsed:
                typeof response.quota.used === "number"
                  ? response.quota.used
                  : base.quotaUsed,
              quotaRemaining:
                typeof response.quota.remaining === "number"
                  ? response.quota.remaining
                  : base.quotaRemaining,
              quotaResetAt: response.quota.resetAt || base.quotaResetAt,
              updatedAt: Date.now(),
            };
          });
          setQuotaError("");
        }
      }

      void loadConversationListPage(user, { page: 1, silent: true });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "哎呀，出了一点小问题，稍后再试一下吧。";

      updateAssistantMessage((item) => ({
        ...item,
        content: errorMessage,
        thinking: "",
        thinkingDurationMs: Date.now() - createdAt,
        timestamp: Date.now(),
        isStreaming: false,
        isError: true,
      }));
    } finally {
      window.clearInterval(durationTicker);
      setConversationLoading(chatId, false);
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (historyLoading) {
      return;
    }

    let chatId = activeConvId;

    if (!chatId) {
      chatId = `local-${Date.now()}`;
      const newConv: Conversation = {
        id: chatId,
        title: "新对话",
        updatedAt: Date.now(),
        preview: "开始新的聊天...",
      };

      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({ ...prev, [chatId!]: [] }));
      setConversationMemoryMeta((prev) => ({
        ...prev,
        [chatId!]: {
          ...createDefaultConversationMemoryMeta(),
          initialized: true,
        },
      }));
      setActiveConvId(chatId);
    }

    if (isConversationBusy(chatId)) {
      return;
    }

    const historyBeforeSend =
      attachments.length > 0 ? [] : messages[chatId] || [];
    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    setMessages((prev) => ({
      ...prev,
      [chatId!]: [...(prev[chatId!] || []), userMsg],
    }));

    setConversations((prev) => {
      const target = prev.find((item) => item.id === chatId);
      if (!target) {
        return prev;
      }

      const nextTitle =
        target.title === "新对话"
          ? pickConversationTitle(text.slice(0, 20), "新对话")
          : target.title;

      const updatedConversation: Conversation = {
        ...target,
        title: nextTitle,
        preview: text.slice(0, 40),
        updatedAt: Date.now(),
      };

      return [
        updatedConversation,
        ...prev.filter((item) => item.id !== chatId),
      ];
    });

    const currentConversation = conversations.find(
      (item) => item.id === chatId,
    );

    sendingGuardRef.current[chatId] = true;
    try {
      await triggerAIResponse(
        chatId,
        historyBeforeSend,
        text,
        attachments,
        currentConversation?.backendConversationId,
      );
    } finally {
      delete sendingGuardRef.current[chatId];
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeConvId || historyLoading || isConversationBusy(activeConvId)) {
      return;
    }

    const currentMsgs = messages[activeConvId];
    if (!currentMsgs || currentMsgs.length === 0) {
      return;
    }

    const msgIndex = currentMsgs.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) {
      return;
    }

    const oldMsg = currentMsgs[msgIndex];
    const updatedMsg: Message = {
      ...oldMsg,
      content: newContent,
      timestamp: Date.now(),
    };
    const historyBefore = currentMsgs.slice(0, msgIndex);

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...historyBefore, updatedMsg],
    }));

    setConversations((prev) =>
      prev.map((item) =>
        item.id === activeConvId
          ? {
              ...item,
              preview: newContent.slice(0, 40),
              updatedAt: Date.now(),
            }
          : item,
      ),
    );

    const currentConversation = conversations.find(
      (item) => item.id === activeConvId,
    );

    sendingGuardRef.current[activeConvId] = true;
    try {
      await triggerAIResponse(
        activeConvId,
        historyBefore,
        newContent,
        updatedMsg.attachments || [],
        currentConversation?.backendConversationId,
      );
    } finally {
      delete sendingGuardRef.current[activeConvId];
    }
  };

  if (authBootstrapping) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] dark:bg-night-bg flex items-center justify-center text-warm-700 dark:text-starlight-200">
        <div className="px-8 py-6 rounded-[32px] bg-white/70 dark:bg-night-card/70 border border-white/60 dark:border-white/10 shadow-soft text-center">
          <p className="text-lg font-bold animate-pulse">正在恢复登录状态...</p>
        </div>
      </div>
    );
  }

  if (appState === AppState.AUTH) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#FFFDF5] dark:bg-night-bg font-sans overflow-hidden relative transition-colors duration-300">
      <UnifiedBackground />

      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        setIsDesktopOpen={setIsDesktopSidebarOpen}
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onNewChat={startNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onNavigate={setCurrentView}
        user={user!}
        onLogout={handleLogout}
        isConversationLoading={conversationListLoading}
        conversationError={conversationListError}
        hasMoreConversations={conversationListHasMore}
        isLoadingMoreConversations={conversationListAppending}
        onLoadMoreConversations={handleLoadMoreConversations}
      />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 p-4 gap-4 h-full">
        {currentView === "CHAT" && (
          // Main Chat Container
          <div className="flex-1 flex flex-col h-full bg-white/62 dark:bg-night-card/62 backdrop-blur-2xl rounded-[48px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-night border-[3px] border-white/55 dark:border-white/5 overflow-hidden relative animate-pop-in origin-center group transition-all duration-300">
            {/* Header with Frosted Glass Buttons */}
            <header className="h-[74px] sm:h-20 flex items-center gap-2.5 sm:gap-4 px-3 sm:px-6 z-20 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                {/* Mobile Menu Button - Frosted Glass */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden shrink-0 p-2.5 sm:p-3 text-warm-600 dark:text-starlight-300 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[18px] sm:rounded-[20px] shadow-sm transition-all duration-200 ease-spring motion-reduce:transition-none hover:-translate-y-px hover:scale-[1.02] active:scale-[0.98] hover:shadow-cheese-sm dark:hover:shadow-glow hover:bg-white/60"
                >
                  <Menu size={20} strokeWidth={2.5} />
                </button>

                {/* Desktop Expand Button - Frosted Glass */}
                {!isDesktopSidebarOpen && (
                  <button
                    onClick={() => setIsDesktopSidebarOpen(true)}
                    className="hidden lg:flex shrink-0 p-3 text-warm-600 dark:text-starlight-300 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[20px] shadow-sm transition-all duration-200 ease-spring motion-reduce:transition-none hover:-translate-y-px hover:scale-[1.02] active:scale-[0.98] hover:shadow-cheese-sm dark:hover:shadow-glow hover:bg-white/60"
                  >
                    <PanelLeftOpen size={20} strokeWidth={2.5} />
                  </button>
                )}

                <div className="min-w-0 flex-1 sm:flex-none sm:w-56">
                  <Select
                    options={modelOptions}
                    value={currentModel}
                    onChange={setCurrentModel}
                    placeholder="选择模型"
                    isLoading={modelOptionsLoading}
                    emptyText={modelOptionsError || "暂无可用模型"}
                    disabled={modelOptionsLoading || modelOptions.length === 0}
                  />
                </div>
              </div>

              {/* Trash Button - Frosted Glass */}
              <button
                onClick={() => setModalOpen("confirm_delete")}
                disabled={!activeConvId || !messages[activeConvId]?.length}
                className="shrink-0 p-2.5 sm:p-3 ml-1 sm:ml-0 text-warm-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[18px] sm:rounded-[20px] shadow-sm transition-all duration-200 ease-spring motion-reduce:transition-none hover:-translate-y-px hover:scale-[1.02] active:scale-[0.98] hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="flex-1 overflow-hidden relative">
              <ChatArea
                conversationId={activeConvId}
                messages={activeConvId ? messages[activeConvId] || [] : []}
                isLoading={activeConversationLoading || historyLoading}
                hasMoreHistory={Boolean(activeConversationMeta?.hasMore)}
                isLoadingMoreHistory={Boolean(
                  activeConversationMeta?.isLoadingMore,
                )}
                historyLoadError={activeConversationMeta?.loadError}
                onLoadOlderMessages={
                  activeConvId
                    ? async () => {
                        const activeMessages = messages[activeConvId] || [];
                        const meta = conversationMemoryMeta[activeConvId];

                        if (meta?.loadError && activeMessages.length === 0) {
                          await loadInitialConversationMemories(
                            activeConvId,
                            user,
                          );
                          return;
                        }

                        await loadOlderConversationMemories(activeConvId, user);
                      }
                    : undefined
                }
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                user={user}
                quotaInfo={quotaInfo}
                quotaLoading={quotaLoading}
                quotaError={quotaError}
                onRefreshQuota={() => void syncUserQuota(user)}
                aiBubbleEnabled={aiBubbleEnabled}
                thinkEnabled={thinkEnabled}
                onThinkEnabledChange={setThinkEnabled}
                inputDisabled={modelOptionsLoading || !currentModel}
                inputDisabledHint={
                  modelOptionsLoading
                    ? "模型加载中，请稍候…"
                    : modelOptionsError || "暂无可用模型"
                }
              />
            </div>
          </div>
        )}

        {currentView === "SETTINGS" && (
          <div className="flex-1 bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl rounded-[48px] shadow-soft dark:shadow-night border-[3px] border-white/50 dark:border-white/5 overflow-hidden animate-pop-in">
            <Settings
              onBack={() => setCurrentView("CHAT")}
              onNavigateToUsageManagement={() => setCurrentView("ADMIN")}
              theme={theme}
              setTheme={setTheme}
              aiBubbleEnabled={aiBubbleEnabled}
              setAiBubbleEnabled={setAiBubbleEnabled}
            />
          </div>
        )}

        {currentView === "PROFILE" && user && (
          <div className="flex-1 bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl rounded-[48px] shadow-soft dark:shadow-night border-[3px] border-white/50 dark:border-white/5 overflow-hidden animate-pop-in">
            <Profile
              user={user}
              onUpdateUser={handleUpdateUser}
              onBack={() => setCurrentView("CHAT")}
            />
          </div>
        )}

        {currentView === "ADMIN" && (
          <div className="flex-1 bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl rounded-[48px] shadow-soft dark:shadow-night border-[3px] border-white/50 dark:border-white/5 overflow-hidden animate-pop-in">
            <AdminPanel
              onBack={() => setCurrentView("CHAT")}
              defaultUserId={user?.id}
              onQuotaUpdated={(latestQuota) => {
                const currentUserId = toPositiveInteger(user?.id);
                if (currentUserId && latestQuota.userId === currentUserId) {
                  setQuotaInfo(latestQuota);
                  setQuotaError("");
                }
              }}
            />
          </div>
        )}
      </main>

      <Modal
        isOpen={modalOpen === "confirm_delete"}
        onClose={() => setModalOpen("none")}
        title="清空记忆？"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen("none")}>
              点错了
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (activeConvId)
                  setMessages((prev) => ({ ...prev, [activeConvId]: [] }));
                setModalOpen("none");
              }}
            >
              确认清空
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-500 rounded-[20px]">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h4 className="font-bold text-warm-800 dark:text-white text-lg">
              真的要忘掉这些吗？
            </h4>
            <p className="text-warm-500 dark:text-slate-400">
              删除后就找不回这段对话了哦。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
