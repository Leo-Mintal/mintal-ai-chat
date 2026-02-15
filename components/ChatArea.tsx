import React, {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import ReactMarkdown from "react-markdown";
import { Message, Attachment, User } from "../types";
import type { UserQuotaSummary } from "../services/adminService";
import {
  Paperclip,
  X,
  Sparkles,
  Wand2,
  Pencil,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Bot,
  Copy,
  Check,
  Star,
  Heart,
  Gauge,
  RefreshCcw,
  Brain,
  Zap,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";

interface ChatAreaProps {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  hasMoreHistory: boolean;
  isLoadingMoreHistory: boolean;
  historyLoadError?: string;
  onLoadOlderMessages?: () => Promise<void> | void;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  user: User | null;
  quotaInfo: UserQuotaSummary | null;
  quotaLoading: boolean;
  quotaError?: string;
  onRefreshQuota?: () => void;
  aiBubbleEnabled: boolean;
  thinkEnabled: boolean;
  onThinkEnabledChange?: (enabled: boolean) => void;
  inputDisabled?: boolean;
  inputDisabledHint?: string;
}

// Sophisticated Spring Physics
const SMOOTH_SPRING_TRANSITION = "transition-all duration-500 ease-spring";

// --- New Component: Chat Index (Barcode Minimap) ---
const ChatIndex: React.FC<{
  messages: Message[];
  activeId: string | null;
  onScrollTo: (id: string) => void;
}> = ({ messages, activeId, onScrollTo }) => {
  // Only index user messages
  const targets = useMemo(
    () => messages.filter((m) => m.role === "user"),
    [messages],
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (targets.length < 2) return null;

  return (
    // Container: Fixed to the right, vertically centered.
    // Increased right margin (right-4 sm:right-8) to give breathing room.
    // pointer-events-none allows clicking through the empty space to the chat below.
    <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-1.5 pointer-events-none py-4 max-h-[70vh]">
      {targets.map((msg) => {
        const isActive = activeId === msg.id;
        const isHovered = hoveredId === msg.id;
        // Dynamic width calculation for desktop:
        // Min 6px, Max 48px, roughly based on character count.
        const widthPx = Math.min(
          48,
          Math.max(6, Math.ceil(msg.content.length * 1.5)),
        );

        return (
          <div
            key={msg.id}
            className="relative flex items-center justify-end pointer-events-auto cursor-pointer py-1 pl-2 focus-visible:outline-none"
            style={{ "--w": `${widthPx}px` } as React.CSSProperties}
            onMouseEnter={() => setHoveredId(msg.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(msg.id)}
            onBlur={() => setHoveredId(null)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onScrollTo(msg.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onScrollTo(msg.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`跳转到消息：${msg.content.slice(0, 20) || "空内容"}`}
          >
            {/* Tooltip Preview */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2
                right-0
                mr-[calc(var(--w)+16px)]
                px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-xl shadow-xl
                ${isHovered ? "opacity-100 scale-100 visible" : "opacity-0 scale-90 invisible"}
                transition-all duration-200 ease-out origin-right
                whitespace-nowrap z-20 max-w-[200px] truncate pointer-events-none
              `}
            >
              {msg.content}
              {/* Right Arrow for Tooltip */}
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
            </div>

            {/* The Bar Indicator */}
            <div
              className={`
                relative z-10
                h-1.5 rounded-full transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-cheese-500 dark:bg-starlight-500 scale-125 shadow-[0_0_8px_rgba(251,140,0,0.5)] dark:shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                    : isHovered
                      ? "bg-cheese-400 dark:bg-starlight-400 scale-x-110"
                      : "bg-slate-300/60 dark:bg-white/10"
                }
                w-1.5
                sm:w-[var(--w)]
              `}
            />
          </div>
        );
      })}
    </div>
  );
};

const MessageBubble: React.FC<{
  message: Message;
  user: User | null;
  onEdit?: (id: string, newContent: string) => void;
  aiBubbleEnabled: boolean;
}> = ({ message, user, onEdit, aiBubbleEnabled }) => {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onEdit && editValue.trim() !== message.content) {
      onEdit(message.id, editValue);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(message.content);
  };

  if (isUser) {
    return (
      <div
        id={`msg-${message.id}`}
        data-msg-id={message.id}
        className="flex flex-col items-end gap-1 group animate-slide-up-bouncy w-full max-w-5xl mx-auto"
      >
        <div className="flex items-end gap-2 max-w-[95%] sm:max-w-[85%]">
          <div
            className={`
             relative px-4 py-2.5 rounded-[24px] rounded-br-sm
             bg-gradient-to-br from-cheese-400 to-cheese-600 dark:from-starlight-500 dark:to-blue-600
             text-white shadow-md transition-all duration-300
           `}
          >
            {isEditing ? (
              <div className="min-w-[240px]">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-white/20 text-white rounded-lg p-2 outline-none border border-white/30 text-sm focus:bg-white/30 transition-colors resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={cancelEdit}
                    className="text-xs opacity-80 hover:opacity-100 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs font-bold bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors shadow-sm"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                {message.content}
              </div>
            )}

            {!isEditing && onEdit && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditValue(message.content);
                }}
                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-warm-400 dark:text-slate-400 hover:text-cheese-500 dark:hover:text-starlight-300 transition-all bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full shadow-sm hover:scale-110"
                title="编辑消息"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-cheese-200 dark:bg-starlight-800 overflow-hidden shrink-0 border-2 border-white dark:border-white/10 shadow-sm">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-cheese-600 dark:text-starlight-200 bg-cheese-100 dark:bg-starlight-900">
                {(user?.name || "ME").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2 mr-10 mt-1">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 text-xs bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-500 dark:text-slate-300 shadow-sm backdrop-blur-sm"
              >
                <Paperclip size={10} />
                <span className="max-w-[120px] truncate">{att.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Model Message
  const hasThinking = !!message.thinking;
  const showBubble = aiBubbleEnabled;

  return (
    <div
      id={`msg-${message.id}`}
      data-msg-id={message.id}
      className="flex flex-col items-start gap-1 w-full max-w-5xl mx-auto mr-auto group animate-slide-up-bouncy"
    >
      <div className="flex items-start gap-3 w-full">
        <div className="w-8 h-8 rounded-[14px] bg-gradient-to-tr from-cheese-400 to-cheese-300 dark:from-starlight-500 dark:to-starlight-600 flex items-center justify-center shrink-0 shadow-sm mt-1 ring-2 ring-white dark:ring-white/5">
          <Bot size={18} className="text-white" />
        </div>

        <div
          className={`flex-1 min-w-0 transition-all duration-300 ${showBubble ? "bg-white/80 dark:bg-night-surface/80 backdrop-blur-sm border border-slate-100 dark:border-white/5 rounded-[24px] rounded-tl-sm px-5 py-4 shadow-sm hover:shadow-md" : "px-2 py-1"}`}
        >
          {/* Thinking Block */}
          {hasThinking && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 select-none">
                <div className="p-1 bg-slate-100 dark:bg-white/5 rounded-full">
                  <Brain
                    size={12}
                    className={
                      message.isStreaming && !message.content
                        ? "animate-pulse"
                        : ""
                    }
                  />
                </div>
                <span>深度思考</span>
                {message.thinkingDurationMs &&
                  message.thinkingDurationMs > 0 && (
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-mono">
                      {(message.thinkingDurationMs / 1000).toFixed(1)}s
                    </span>
                  )}
              </div>
              <div className="pl-3 border-l-2 border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed opacity-90">
                {message.thinking}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words leading-relaxed ${message.isError ? "text-red-500" : "text-slate-700 dark:text-slate-200"} prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-pre:bg-slate-900 prose-pre:text-slate-50 dark:prose-pre:bg-black/50 prose-pre:rounded-xl prose-pre:p-4`}
          >
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : message.isStreaming && !message.thinking ? (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          {!message.isStreaming && !message.isError && message.content && (
            <div
              className={`flex items-center gap-2 mt-3 pt-2 ${showBubble ? "border-t border-slate-100 dark:border-white/5" : ""} opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-medium text-slate-400 hover:text-cheese-600 dark:hover:text-starlight-300 hover:bg-cheese-50 dark:hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
                {copied ? (
                  <span className="text-green-500">已复制</span>
                ) : (
                  "复制"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  messages,
  isLoading,
  hasMoreHistory,
  isLoadingMoreHistory,
  historyLoadError,
  onLoadOlderMessages,
  onSendMessage,
  onEditMessage,
  user,
  quotaInfo,
  quotaLoading,
  quotaError,
  onRefreshQuota,
  aiBubbleEnabled,
  thinkEnabled,
  onThinkEnabledChange,
  inputDisabled = false,
  inputDisabledHint,
}) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const skipEnterUntilRef = useRef(0);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const topLoadTriggerRef = useRef<HTMLDivElement | null>(null);
  const needsInitialScrollRef = useRef(false);
  const pendingPrependAdjustmentRef = useRef<{
    beforeScrollTop: number;
    beforeScrollHeight: number;
  } | null>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return;
    const DEFAULT_HEIGHT = 56;
    const MAX_HEIGHT = 160;
    textareaRef.current.style.height = "auto";
    const scrollHeight = textareaRef.current.scrollHeight || DEFAULT_HEIGHT;
    const targetHeight = Math.min(
      Math.max(scrollHeight, DEFAULT_HEIGHT),
      MAX_HEIGHT,
    );
    textareaRef.current.style.height = targetHeight + "px";
    textareaRef.current.style.overflowY =
      scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  const hasStreamingMessage = messages.some(
    (message) => message.role === "model" && message.isStreaming,
  );
  const topLoadTriggerIndex =
    messages.length > 0 ? Math.min(2, messages.length - 1) : -1;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScrollToMessage = useCallback((id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      setIsAutoScrollEnabled(false); // Disable auto-scroll when manually navigating
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveMessageId(id);
    } else {
      console.warn(`Element msg-${id} not found in DOM`);
    }
  }, []);

  const requestLoadOlderMessages = useCallback(() => {
    if (
      !onLoadOlderMessages ||
      isLoadingMoreHistory ||
      hasStreamingMessage ||
      (!hasMoreHistory && !historyLoadError)
    ) {
      return;
    }

    const container = scrollContainerRef.current;
    if (container) {
      pendingPrependAdjustmentRef.current = {
        beforeScrollTop: container.scrollTop,
        beforeScrollHeight: container.scrollHeight,
      };
    }

    void onLoadOlderMessages();
  }, [
    hasMoreHistory,
    hasStreamingMessage,
    historyLoadError,
    isLoadingMoreHistory,
    onLoadOlderMessages,
  ]);

  useEffect(() => {
    needsInitialScrollRef.current = true;
    setIsAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    setActiveMessageId(null);
    pendingPrependAdjustmentRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (
      !conversationId ||
      !needsInitialScrollRef.current ||
      messages.length === 0
    ) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom("auto");
      needsInitialScrollRef.current = false;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [conversationId, messages.length, scrollToBottom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const triggerElement = topLoadTriggerRef.current;

    if (
      !container ||
      !triggerElement ||
      !hasMoreHistory ||
      isLoadingMoreHistory ||
      !onLoadOlderMessages
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          requestLoadOlderMessages();
        }
      },
      {
        root: container,
        threshold: 0.1,
      },
    );

    observer.observe(triggerElement);
    return () => observer.disconnect();
  }, [
    conversationId,
    hasMoreHistory,
    isLoadingMoreHistory,
    messages.length,
    onLoadOlderMessages,
    requestLoadOlderMessages,
    topLoadTriggerIndex,
  ]);

  useLayoutEffect(() => {
    if (isLoadingMoreHistory) {
      return;
    }

    const pending = pendingPrependAdjustmentRef.current;
    if (!pending) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      pendingPrependAdjustmentRef.current = null;
      return;
    }

    const delta = container.scrollHeight - pending.beforeScrollHeight;
    if (delta !== 0) {
      container.scrollTop = pending.beforeScrollTop + delta;
    }

    pendingPrependAdjustmentRef.current = null;
  }, [isLoadingMoreHistory, messages]);

  const handleMessagesScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const AUTO_SCROLL_PAUSE_THRESHOLD = 80;
    const AUTO_SCROLL_RESUME_THRESHOLD = 24;
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceToBottom > AUTO_SCROLL_PAUSE_THRESHOLD) {
      if (isAutoScrollEnabled) {
        setIsAutoScrollEnabled(false);
      }
      setShowScrollToBottom(true);
    } else if (distanceToBottom <= AUTO_SCROLL_RESUME_THRESHOLD) {
      if (!isAutoScrollEnabled) {
        setIsAutoScrollEnabled(true);
      }
      setShowScrollToBottom(false);
    }
  }, [isAutoScrollEnabled]);

  // Observer for Active Message
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by visibility ratio
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          // Prefer the most visible element
          const targetId = visibleEntries[0].target.getAttribute("data-msg-id");
          if (targetId) setActiveMessageId(targetId);
        }
      },
      {
        root: container,
        threshold: [0.1, 0.5, 0.9], // Check at multiple thresholds for better accuracy
        rootMargin: "-10% 0px -40% 0px", // Focus on the top-center part of the screen
      },
    );

    messages.forEach((msg) => {
      // Only observe user messages for the TOC
      if (msg.role === "user") {
        const el = document.getElementById(`msg-${msg.id}`);
        if (el) observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      return;
    }

    if (!isAutoScrollEnabled) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom(hasStreamingMessage ? "auto" : "smooth");
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    messages,
    isLoading,
    isAutoScrollEnabled,
    hasStreamingMessage,
    scrollToBottom,
  ]);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSend = () => {
    if (
      (!input.trim() && attachments.length === 0) ||
      isLoading ||
      inputDisabled
    )
      return;
    setIsAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    onSendMessage(input, attachments);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as KeyboardEvent & { keyCode?: number };
    const isImeComposing =
      nativeEvent.isComposing ||
      nativeEvent.keyCode === 229 ||
      isComposingRef.current ||
      Date.now() < skipEnterUntilRef.current;

    if (isImeComposing) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    skipEnterUntilRef.current = Date.now() + 80;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              data: ev.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleScrollToBottomClick = () => {
    setIsAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    scrollToBottom("smooth");
  };

  const showQuotaCard =
    quotaLoading || Boolean(quotaInfo) || Boolean(quotaError);
  const modelInputPlaceholder = inputDisabled
    ? inputDisabledHint || "当前暂无可用模型，请稍后再试"
    : "发个消息...";
  const canSend =
    (input.trim().length > 0 || attachments.length > 0) &&
    !isLoading &&
    !inputDisabled;
  const showTopUtilityRow = showQuotaCard || showScrollToBottom;

  return (
    <div className="flex flex-col h-full relative z-0">
      {/* Chat Index (TOC) - Fixed relative to the ChatArea container */}
      <ChatIndex
        messages={messages}
        activeId={activeMessageId}
        onScrollTo={handleScrollToMessage}
      />

      <div
        ref={scrollContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar relative"
      >
        {(isLoadingMoreHistory || historyLoadError) && (
          <div className="max-w-5xl mx-auto w-full animate-pop-in">
            <div className="mx-auto w-fit flex items-center gap-2 rounded-full border border-white/70 dark:border-white/12 bg-white/88 dark:bg-night-card/88 px-4 py-2 shadow-soft dark:shadow-night backdrop-blur-md">
              {isLoadingMoreHistory ? (
                <>
                  <div
                    className="w-2 h-2 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce"
                    style={{ animationDelay: "120ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce"
                    style={{ animationDelay: "240ms" }}
                  />
                  <span className="ml-1 text-[11px] font-bold text-warm-500 dark:text-slate-300">
                    正在加载更早消息...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-red-500 dark:text-red-300">
                    {historyLoadError}
                  </span>
                  <button
                    type="button"
                    onClick={requestLoadOlderMessages}
                    disabled={isLoadingMoreHistory}
                    className="rounded-full border border-red-200/80 dark:border-red-400/30 px-2 py-0.5 text-[10px] font-bold text-red-500 hover:bg-red-50/80 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    重试
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center relative">
            {/* Decorative Elements for Empty State */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[20%] left-[10%] text-cheese-200 dark:text-starlight-500/20 animate-bounce-soft">
                <Star size={36} className="rotate-12" />
              </div>
              <div
                className="absolute bottom-[30%] right-[10%] text-pink-200 dark:text-pink-500/20 animate-bounce-soft"
                style={{ animationDelay: "1s" }}
              >
                <Heart size={28} className="-rotate-12" />
              </div>
            </div>

            {/* Cute Mascot Animation */}
            <div className="relative mb-8 animate-pop-in z-10">
              <div className="absolute inset-0 bg-cheese-200 dark:bg-starlight-500 rounded-full blur-[40px] opacity-40 animate-pulse"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-white to-cream-100 dark:from-night-card dark:to-night-surface rounded-[40px] shadow-cheese dark:shadow-glow border-4 border-white dark:border-white/10 flex items-center justify-center transform hover:scale-105 transition-transform duration-500 cursor-pointer animate-float hover:rotate-3 ease-spring">
                <Sparkles
                  size={48}
                  className="text-cheese-500 dark:text-starlight-300 drop-shadow-sm"
                />
              </div>
            </div>

            <h2
              className="text-3xl font-extrabold text-warm-800 dark:text-white mb-3 tracking-tight animate-slide-up-bouncy relative z-10"
              style={{ animationDelay: "0.1s" }}
            >
              嗨！今天想聊点什么？
            </h2>
            <p
              className="text-warm-500 dark:text-starlight-100 mb-10 font-medium animate-slide-up-bouncy relative z-10"
              style={{ animationDelay: "0.2s" }}
            >
              我像果冻一样软萌，但依然聪明绝顶哦~
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4 relative z-10">
              {[
                "写一段可爱的早安问候语",
                "解释一下为什么猫咪喜欢纸箱",
                "帮我策划一个奶油风的卧室",
                "给我的多肉植物起个名字",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => !inputDisabled && setInput(suggestion)}
                  disabled={inputDisabled}
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  className={`group p-4 bg-white/70 dark:bg-night-card/50 border-2 border-transparent hover:border-cheese-300 dark:hover:border-starlight-500 rounded-[24px] shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow ${SMOOTH_SPRING_TRANSITION} transform hover:-translate-y-1 hover:scale-[1.02] text-left animate-slide-up-bouncy disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 active:scale-95`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2
                      size={16}
                      className="text-cheese-500 dark:text-starlight-300 group-hover:rotate-12 transition-transform"
                    />
                    <span className="font-bold text-warm-700 dark:text-white text-sm">
                      灵感 {i + 1}
                    </span>
                  </div>
                  <span className="text-xs text-warm-400 dark:text-slate-400 group-hover:text-warm-600 dark:group-hover:text-starlight-100">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              ref={(node) => {
                if (index === topLoadTriggerIndex) {
                  topLoadTriggerRef.current = node;
                }
              }}
            >
              <MessageBubble
                message={msg}
                user={user}
                onEdit={onEditMessage}
                aiBubbleEnabled={aiBubbleEnabled}
              />
            </div>
          ))
        )}

        {isLoading && !hasStreamingMessage && (
          <div className="max-w-5xl mx-auto w-full animate-pop-in px-2">
            <div className="mx-auto w-fit flex items-center gap-1.5 rounded-full border border-white/70 dark:border-white/12 bg-white/88 dark:bg-night-card/88 px-4 py-2 shadow-soft dark:shadow-night backdrop-blur-md">
              <div
                className="w-2 h-2 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce"
                style={{ animationDelay: "120ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce"
                style={{ animationDelay: "240ms" }}
              />
              <span className="ml-1 text-[11px] font-bold text-warm-500 dark:text-slate-300">
                正在生成
              </span>
            </div>
          </div>
        )}
        {/* Reserve space at the bottom for the fixed input area */}
        <div
          ref={bottomRef}
          style={{ height: showQuotaCard ? "240px" : "200px" }}
          className="shrink-0 w-full transition-all duration-300"
        />
      </div>

      {/* Input Area Container */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 pointer-events-none">
        <div
          className="max-w-5xl mx-auto pointer-events-auto animate-slide-up-bouncy"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Utility Row: Quota Card + Scroll Button */}
          {showTopUtilityRow && (
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
              {showQuotaCard && (
                <div className="col-start-2 justify-self-center">
                  <div
                    className={`
                  max-w-fit flex items-center justify-center
                  bg-white/80 dark:bg-night-card/80 backdrop-blur-xl border border-white/50 dark:border-white/10
                  rounded-full shadow-cheese-sm dark:shadow-night
                  px-1.5 py-1.5
                  transition-all duration-500 ease-spring hover:scale-105 hover:shadow-cheese hover:-translate-y-0.5
                `}
                  >
                    {quotaError ? (
                      <div className="flex items-center justify-between gap-2 px-3">
                        <p className="text-[11px] font-bold text-red-500 truncate">
                          {quotaError}
                        </p>
                        <button
                          type="button"
                          onClick={onRefreshQuota}
                          disabled={!onRefreshQuota || quotaLoading}
                          className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-warm-500 dark:text-slate-300 hover:text-cheese-600 dark:hover:text-starlight-200 transition-colors disabled:opacity-50"
                        >
                          <RefreshCcw
                            size={11}
                            className={quotaLoading ? "animate-spin" : ""}
                          />
                          重试
                        </button>
                      </div>
                    ) : quotaInfo ? (
                      <div className="flex items-center gap-1">
                        <div className="bg-cheese-100 dark:bg-white/10 p-1.5 rounded-full text-cheese-600 dark:text-starlight-300">
                          <Gauge size={14} />
                        </div>
                        <div className="flex items-center gap-3 px-2 text-xs font-bold text-warm-600 dark:text-slate-300">
                          <span className="text-[10px] uppercase tracking-wider text-warm-400 dark:text-slate-500">
                            今日用量
                          </span>
                          <div className="h-3 w-px bg-warm-200 dark:bg-white/10" />
                          <span className="font-extrabold">
                            {quotaInfo.quotaUsed} / {quotaInfo.quotaLimit}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={onRefreshQuota}
                          disabled={!onRefreshQuota || quotaLoading}
                          className="p-1.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-full text-warm-400 hover:text-cheese-600 transition-colors hover:rotate-180 duration-500"
                        >
                          <RefreshCcw
                            size={12}
                            className={quotaLoading ? "animate-spin" : ""}
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3">
                        <Gauge
                          size={12}
                          className="text-cheese-500 dark:text-starlight-300 animate-pulse"
                        />
                        <p className="text-[11px] font-bold text-warm-500 dark:text-slate-300">
                          正在同步...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showScrollToBottom && (
                <div className="col-start-3 justify-self-end">
                  <button
                    type="button"
                    onClick={handleScrollToBottomClick}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-white/70 dark:border-white/15 bg-white/95 dark:bg-night-card/95 px-4 py-2 text-xs font-bold text-warm-700 dark:text-slate-100 shadow-soft backdrop-blur ${SMOOTH_SPRING_TRANSITION} hover:-translate-y-0.5 hover:shadow-cheese-sm dark:hover:shadow-glow active:scale-95`}
                  >
                    <ArrowDown size={14} />
                    <span>回到底部</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Input Box */}
          <div
            className={`
             bg-white/90 dark:bg-night-card/90 backdrop-blur-2xl rounded-[32px]
             shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]
             border border-white/60 dark:border-white/10
             transition-all duration-500 ease-spring relative flex flex-col overflow-hidden
             ${isLoading ? "opacity-95 grayscale-[0.3]" : "hover:shadow-[0_20px_50px_-12px_rgba(255,183,77,0.25)] dark:hover:shadow-[0_20px_50px_-12px_rgba(14,165,233,0.25)] hover:scale-[1.005] hover:-translate-y-0.5"}
             focus-within:ring-2 focus-within:ring-cheese-200/50 dark:focus-within:ring-starlight-500/20 focus-within:scale-[1.005]
          `}
          >
            {/* Upper Area: Text Input */}
            <div className="relative px-2 pt-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder={modelInputPlaceholder}
                className="w-full max-h-[160px] bg-transparent !border-none border-0 outline-none ring-0 focus:!border-none focus:border-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 resize-none py-4 px-4 text-warm-800 dark:text-slate-100 placeholder:text-warm-300 dark:placeholder:text-slate-500 text-[15px] leading-6 font-medium caret-cheese-500 dark:caret-starlight-300"
                rows={1}
                disabled={inputDisabled}
              />
            </div>

            {/* Middle: Attachments */}
            {attachments.length > 0 && (
              <div className="flex gap-2 px-4 pb-2 overflow-x-auto custom-scrollbar">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-cheese-50 dark:bg-white/10 rounded-xl text-[11px] font-bold text-warm-700 dark:text-white border border-cheese-200 dark:border-white/10 animate-pop-in shadow-sm"
                  >
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(file.id)}
                      className="p-0.5 hover:bg-red-100 text-red-400 rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Toolbar: Controls & Send */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1 mt-auto">
              <div className="flex items-center gap-2">
                {/* Attachment Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={inputDisabled}
                  className={`p-2.5 text-warm-400 dark:text-slate-400 hover:text-cheese-600 dark:hover:text-starlight-200 bg-transparent hover:bg-cheese-50 dark:hover:bg-white/10 rounded-[18px] ${SMOOTH_SPRING_TRANSITION} active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Paperclip size={20} strokeWidth={2.5} />
                </button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*, application/pdf, text/plain"
                  disabled={inputDisabled}
                />

                {/* Deep Thinking Toggle Pill */}
                <div
                  onClick={() =>
                    !isLoading &&
                    onThinkEnabledChange &&
                    onThinkEnabledChange(!thinkEnabled)
                  }
                  className={`
                       group relative flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer select-none
                       ${SMOOTH_SPRING_TRANSITION}
                       active:scale-95 hover:scale-102 hover:-translate-y-0.5
                       ${
                         thinkEnabled
                           ? "bg-cheese-500 dark:bg-starlight-500 text-white shadow-cheese-sm dark:shadow-glow"
                           : "bg-slate-100/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-white/20"
                       }
                       ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                     `}
                >
                  <div
                    className={`p-1 rounded-full transition-colors duration-300 ${thinkEnabled ? "bg-white/20 text-white" : "bg-slate-200 text-slate-400 dark:bg-white/10"}`}
                  >
                    <Brain size={12} strokeWidth={3} />
                  </div>
                  <span
                    className={`text-[11px] font-extrabold transition-colors duration-300`}
                  >
                    深度思考
                  </span>

                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${thinkEnabled ? "bg-white scale-125" : "bg-slate-300 dark:bg-slate-600 scale-75"}`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLoading && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <Zap
                      size={14}
                      className="text-cheese-500 dark:text-starlight-400 fill-current animate-pulse"
                    />
                  </div>
                )}
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`
                       shrink-0 !w-11 !h-11 !rounded-[20px] p-0 ${SMOOTH_SPRING_TRANSITION}
                       disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none
                       ${
                         canSend
                           ? "bg-gradient-to-br from-cheese-400 to-cheese-600 dark:from-starlight-400 dark:to-starlight-600 shadow-[0_8px_20px_-6px_rgba(251,140,0,0.5)] dark:shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)] hover:scale-105 hover:-translate-y-1 active:scale-95 active:rotate-2"
                           : "bg-slate-100 dark:bg-white/10 text-slate-300 dark:text-slate-600 shadow-none"
                       }
                     `}
                >
                  <ArrowUp
                    size={22}
                    strokeWidth={3}
                    className={
                      canSend
                        ? "text-white"
                        : "text-slate-300 dark:text-slate-600"
                    }
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
