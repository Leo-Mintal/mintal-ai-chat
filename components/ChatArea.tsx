import React, { useRef, useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Attachment, User } from '../types';
import type { UserQuotaSummary } from '../services/adminService';
<<<<<<< HEAD
import { Paperclip, X, Sparkles, Wand2, Pencil, ArrowUp, ArrowDown, ChevronDown, Bot, Copy, Check, Star, Heart, Gauge, RefreshCcw } from 'lucide-react';
=======
import { Paperclip, X, Sparkles, Wand2, Pencil, ArrowUp, ArrowDown, ChevronDown, Bot, Copy, Check, Star, Heart, Gauge, RefreshCcw, Brain, Zap } from 'lucide-react';
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';

interface ChatAreaProps {
<<<<<<< HEAD
  messages: Message[];
  isLoading: boolean;
=======
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  hasMoreHistory: boolean;
  isLoadingMoreHistory: boolean;
  historyLoadError?: string;
  onLoadOlderMessages?: () => Promise<void> | void;
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
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

<<<<<<< HEAD
export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
=======
// Sophisticated Spring Physics
const SMOOTH_SPRING_TRANSITION = "transition-all duration-500 ease-spring";

// --- New Component: Chat Index (Barcode Minimap) ---
const ChatIndex: React.FC<{
  messages: Message[];
  activeId: string | null;
  onScrollTo: (id: string) => void;
}> = ({ messages, activeId, onScrollTo }) => {
  // Only index user messages
  const targets = useMemo(() => messages.filter(m => m.role === 'user'), [messages]);
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
        const widthPx = Math.min(48, Math.max(6, Math.ceil(msg.content.length * 1.5)));
        
        return (
          <div 
            key={msg.id} 
            className="relative flex items-center justify-end pointer-events-auto cursor-pointer py-1 pl-2 focus-visible:outline-none"
            style={{ '--w': `${widthPx}px` } as React.CSSProperties}
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
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onScrollTo(msg.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`跳转到消息：${msg.content.slice(0, 20) || '空内容'}`}
          >
            {/* Tooltip Preview */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2
                right-0
                mr-[calc(var(--w)+16px)]
                px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-xl shadow-xl
                ${isHovered ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-90 invisible'}
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
                ${isActive 
                  ? 'bg-cheese-500 dark:bg-starlight-500 scale-125 shadow-[0_0_8px_rgba(251,140,0,0.5)] dark:shadow-[0_0_8px_rgba(14,165,233,0.5)]' 
                  : isHovered
                    ? 'bg-cheese-400 dark:bg-starlight-400 scale-x-110'
                    : 'bg-slate-300/60 dark:bg-white/10'
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
  const isUser = message.role === 'user';
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
  }

  if (isUser) {
    return (
      <div id={`msg-${message.id}`} data-msg-id={message.id} className="flex flex-col items-end gap-1 group animate-slide-up-bouncy w-full max-w-5xl mx-auto">
        <div className="flex items-end gap-2 max-w-[95%] sm:max-w-[85%]">
           <div className={`
             relative px-4 py-2.5 rounded-[24px] rounded-br-sm 
             bg-gradient-to-br from-cheese-400 to-cheese-600 dark:from-starlight-500 dark:to-blue-600 
             text-white shadow-md transition-all duration-300
           `}>
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
                   <button onClick={cancelEdit} className="text-xs opacity-80 hover:opacity-100 hover:bg-white/10 px-2 py-1 rounded transition-colors">取消</button>
                   <button onClick={handleSaveEdit} className="text-xs font-bold bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors shadow-sm">保存</button>
                 </div>
               </div>
             ) : (
                <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                  {message.content}
                </div>
             )}
             
             {!isEditing && onEdit && (
               <button 
                 onClick={() => { setIsEditing(true); setEditValue(message.content); }}
                 className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-warm-400 dark:text-slate-400 hover:text-cheese-500 dark:hover:text-starlight-300 transition-all bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full shadow-sm hover:scale-110"
                 title="编辑消息"
               >
                 <Pencil size={14} />
               </button>
             )}
           </div>
           
           <div className="w-8 h-8 rounded-full bg-cheese-200 dark:bg-starlight-800 overflow-hidden shrink-0 border-2 border-white dark:border-white/10 shadow-sm">
             {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-cheese-600 dark:text-starlight-200 bg-cheese-100 dark:bg-starlight-900">
                  {(user?.name || 'ME').slice(0, 2).toUpperCase()}
                </div>
             )}
           </div>
         </div>
         
         {message.attachments && message.attachments.length > 0 && (
           <div className="flex flex-wrap justify-end gap-2 mr-10 mt-1">
             {message.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-1.5 text-xs bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-500 dark:text-slate-300 shadow-sm backdrop-blur-sm">
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
    <div id={`msg-${message.id}`} data-msg-id={message.id} className="flex flex-col items-start gap-1 w-full max-w-5xl mx-auto mr-auto group animate-slide-up-bouncy">
      <div className="flex items-start gap-3 w-full">
        <div className="w-8 h-8 rounded-[14px] bg-gradient-to-tr from-cheese-400 to-cheese-300 dark:from-starlight-500 dark:to-starlight-600 flex items-center justify-center shrink-0 shadow-sm mt-1 ring-2 ring-white dark:ring-white/5">
          <Bot size={18} className="text-white" />
        </div>
        
        <div className={`flex-1 min-w-0 transition-all duration-300 ${showBubble ? 'bg-white/80 dark:bg-night-surface/80 backdrop-blur-sm border border-slate-100 dark:border-white/5 rounded-[24px] rounded-tl-sm px-5 py-4 shadow-sm hover:shadow-md' : 'px-2 py-1'}`}>
           {/* Thinking Block */}
           {hasThinking && (
             <div className="mb-4">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 select-none">
                 <div className="p-1 bg-slate-100 dark:bg-white/5 rounded-full">
                   <Brain size={12} className={message.isStreaming && !message.content ? "animate-pulse" : ""} />
                 </div>
                 <span>深度思考</span>
                 {message.thinkingDurationMs && message.thinkingDurationMs > 0 && (
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
           <div className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words leading-relaxed ${message.isError ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'} prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-pre:bg-slate-900 prose-pre:text-slate-50 dark:prose-pre:bg-black/50 prose-pre:rounded-xl prose-pre:p-4`}>
             {message.content ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
             ) : (
                message.isStreaming && !message.thinking ? (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                  </div>
                ) : null
             )}
           </div>

           {/* Footer Actions */}
           {!message.isStreaming && !message.isError && message.content && (
             <div className={`flex items-center gap-2 mt-3 pt-2 ${showBubble ? 'border-t border-slate-100 dark:border-white/5' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
               <button 
                 onClick={handleCopy}
                 className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-medium text-slate-400 hover:text-cheese-600 dark:hover:text-starlight-300 hover:bg-cheese-50 dark:hover:bg-white/10 transition-colors"
               >
                 {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                 {copied ? <span className="text-green-500">已复制</span> : '复制'}
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
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
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
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const skipEnterUntilRef = useRef(0);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
<<<<<<< HEAD

  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return;
    const DEFAULT_HEIGHT = 44;
    const MAX_HEIGHT = 132;
=======
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const topLoadTriggerRef = useRef<HTMLDivElement | null>(null);
  const needsInitialScrollRef = useRef(false);
  const pendingPrependAdjustmentRef = useRef<{ beforeScrollTop: number; beforeScrollHeight: number } | null>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return;
    const DEFAULT_HEIGHT = 56;
    const MAX_HEIGHT = 160;
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight || DEFAULT_HEIGHT;
    const targetHeight = Math.min(Math.max(scrollHeight, DEFAULT_HEIGHT), MAX_HEIGHT);
    textareaRef.current.style.height = targetHeight + 'px';
    textareaRef.current.style.overflowY = scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  const hasStreamingMessage = messages.some(message => message.role === 'model' && message.isStreaming);
<<<<<<< HEAD
=======
  const topLoadTriggerIndex = messages.length > 0 ? Math.min(2, messages.length - 1) : -1;
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

<<<<<<< HEAD
=======
  const handleScrollToMessage = useCallback((id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      setIsAutoScrollEnabled(false); // Disable auto-scroll when manually navigating
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveMessageId(id);
    } else {
        console.warn(`Element msg-${id} not found in DOM`);
    }
  }, []);

  const requestLoadOlderMessages = useCallback(() => {
    if (
      !onLoadOlderMessages
      || isLoadingMoreHistory
      || hasStreamingMessage
      || (!hasMoreHistory && !historyLoadError)
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
  }, [hasMoreHistory, hasStreamingMessage, historyLoadError, isLoadingMoreHistory, onLoadOlderMessages]);

  useEffect(() => {
    needsInitialScrollRef.current = true;
    setIsAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    setActiveMessageId(null);
    pendingPrependAdjustmentRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !needsInitialScrollRef.current || messages.length === 0) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom('auto');
      needsInitialScrollRef.current = false;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [conversationId, messages.length, scrollToBottom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const triggerElement = topLoadTriggerRef.current;

    if (!container || !triggerElement || !hasMoreHistory || isLoadingMoreHistory || !onLoadOlderMessages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
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

>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
  const handleMessagesScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const AUTO_SCROLL_PAUSE_THRESHOLD = 80;
    const AUTO_SCROLL_RESUME_THRESHOLD = 24;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceToBottom > AUTO_SCROLL_PAUSE_THRESHOLD) {
      if (isAutoScrollEnabled) {
        setIsAutoScrollEnabled(false);
      }
      setShowScrollToBottom(true);
<<<<<<< HEAD
      return;
    }

    if (distanceToBottom <= AUTO_SCROLL_RESUME_THRESHOLD) {
=======
    } else if (distanceToBottom <= AUTO_SCROLL_RESUME_THRESHOLD) {
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
      if (!isAutoScrollEnabled) {
        setIsAutoScrollEnabled(true);
      }
      setShowScrollToBottom(false);
    }
  }, [isAutoScrollEnabled]);

<<<<<<< HEAD
=======
  // Observer for Active Message
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by visibility ratio
        const visibleEntries = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        
        if (visibleEntries.length > 0) {
          // Prefer the most visible element
          const targetId = visibleEntries[0].target.getAttribute('data-msg-id');
          if (targetId) setActiveMessageId(targetId);
        }
      },
      {
        root: container,
        threshold: [0.1, 0.5, 0.9], // Check at multiple thresholds for better accuracy
        rootMargin: '-10% 0px -40% 0px' // Focus on the top-center part of the screen
      }
    );

    messages.forEach(msg => {
      // Only observe user messages for the TOC
      if (msg.role === 'user') {
        const el = document.getElementById(`msg-${msg.id}`);
        if (el) observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [messages]);

>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      return;
    }

    if (!isAutoScrollEnabled) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom(hasStreamingMessage ? 'auto' : 'smooth');
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages, isLoading, isAutoScrollEnabled, hasStreamingMessage, scrollToBottom]);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || inputDisabled) return;
    setIsAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    onSendMessage(input, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as KeyboardEvent & { keyCode?: number };
    const isImeComposing = nativeEvent.isComposing
      || nativeEvent.keyCode === 229
      || isComposingRef.current
      || Date.now() < skipEnterUntilRef.current;

    if (isImeComposing) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
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
          setAttachments(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            data: ev.target?.result as string
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleScrollToBottomClick = () => {
    setIsAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    scrollToBottom('smooth');
  };

  const showQuotaCard = quotaLoading || Boolean(quotaInfo) || Boolean(quotaError);
  const modelInputPlaceholder = inputDisabled
    ? (inputDisabledHint || '当前暂无可用模型，请稍后再试')
    : '发个消息...';
<<<<<<< HEAD
  const thinkStatusText = thinkEnabled ? '开启 ' : '关闭 ';
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isLoading && !inputDisabled;
  const shouldReserveBottomSpace = messages.length > 0 || isLoading;
  const bottomReserveClass = shouldReserveBottomSpace
    ? (showQuotaCard ? 'h-56 sm:h-60' : 'h-44 sm:h-48')
    : 'h-0';
  const scrollToBottomButtonPositionClass = showQuotaCard
    ? 'bottom-[176px] sm:bottom-[132px]'
    : 'bottom-[118px] sm:bottom-[132px]';

  return (
    <div className="flex flex-col h-full relative z-0">
      <div ref={scrollContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:p-6 space-y-5 sm:space-y-6 scroll-smooth custom-scrollbar">
=======
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isLoading && !inputDisabled;
  const showTopUtilityRow = showQuotaCard || showScrollToBottom;

  return (
    <div className="flex flex-col h-full relative z-0">
      {/* Chat Index (TOC) - Fixed relative to the ChatArea container */}
      <ChatIndex messages={messages} activeId={activeMessageId} onScrollTo={handleScrollToMessage} />

      <div ref={scrollContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar relative">
        {(isLoadingMoreHistory || historyLoadError) && (
          <div className="max-w-5xl mx-auto w-full animate-pop-in">
            <div className="mx-auto w-fit flex items-center gap-2 rounded-full border border-white/70 dark:border-white/12 bg-white/88 dark:bg-night-card/88 px-4 py-2 shadow-soft dark:shadow-night backdrop-blur-md">
              {isLoadingMoreHistory ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce" style={{ animationDelay: '240ms' }} />
                  <span className="ml-1 text-[11px] font-bold text-warm-500 dark:text-slate-300">正在加载更早消息...</span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-bold text-red-500 dark:text-red-300">{historyLoadError}</span>
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

>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center relative">
             {/* Decorative Elements for Empty State */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute top-[20%] left-[10%] text-cheese-200 dark:text-starlight-500/20 animate-bounce-soft"><Star size={36} className="rotate-12" /></div>
                 <div className="absolute bottom-[30%] right-[10%] text-pink-200 dark:text-pink-500/20 animate-bounce-soft" style={{animationDelay: '1s'}}><Heart size={28} className="-rotate-12" /></div>
            </div>

            {/* Cute Mascot Animation */}
            <div className="relative mb-8 animate-pop-in z-10">
              <div className="absolute inset-0 bg-cheese-200 dark:bg-starlight-500 rounded-full blur-[40px] opacity-40 animate-pulse"></div>
<<<<<<< HEAD
              <div className="relative w-28 h-28 bg-gradient-to-br from-white to-cream-100 dark:from-night-card dark:to-night-surface rounded-[40px] shadow-cheese dark:shadow-glow border-4 border-white dark:border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform duration-500 cursor-pointer animate-float">
=======
              <div className="relative w-28 h-28 bg-gradient-to-br from-white to-cream-100 dark:from-night-card dark:to-night-surface rounded-[40px] shadow-cheese dark:shadow-glow border-4 border-white dark:border-white/10 flex items-center justify-center transform hover:scale-105 transition-transform duration-500 cursor-pointer animate-float hover:rotate-3 ease-spring">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                <Sparkles size={48} className="text-cheese-500 dark:text-starlight-300 drop-shadow-sm" />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-warm-800 dark:text-white mb-3 tracking-tight animate-slide-up-bouncy relative z-10" style={{ animationDelay: '0.1s' }}>
              嗨！今天想聊点什么？
            </h2>
            <p className="text-warm-500 dark:text-starlight-100 mb-10 font-medium animate-slide-up-bouncy relative z-10" style={{ animationDelay: '0.2s' }}>
              我像果冻一样软萌，但依然聪明绝顶哦~
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4 relative z-10">
              {['写一段可爱的早安问候语', '解释一下为什么猫咪喜欢纸箱', '帮我策划一个奶油风的卧室', '给我的多肉植物起个名字'].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => !inputDisabled && setInput(suggestion)}
                  disabled={inputDisabled}
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
<<<<<<< HEAD
                  className="group p-4 bg-white/70 dark:bg-night-card/50 border-2 border-transparent hover:border-cheese-300 dark:hover:border-starlight-500 rounded-[24px] shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) transform hover:-translate-y-1 hover:scale-[1.02] text-left animate-slide-up-bouncy disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
=======
                  className={`group p-4 bg-white/70 dark:bg-night-card/50 border-2 border-transparent hover:border-cheese-300 dark:hover:border-starlight-500 rounded-[24px] shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow ${SMOOTH_SPRING_TRANSITION} transform hover:-translate-y-1 hover:scale-[1.02] text-left animate-slide-up-bouncy disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 active:scale-95`}
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 size={16} className="text-cheese-500 dark:text-starlight-300 group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-warm-700 dark:text-white text-sm">灵感 {i+1}</span>
                  </div>
                  <span className="text-xs text-warm-400 dark:text-slate-400 group-hover:text-warm-600 dark:group-hover:text-starlight-100">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
<<<<<<< HEAD
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              user={user}
              onEdit={onEditMessage}
              aiBubbleEnabled={aiBubbleEnabled}
            />
=======
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
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
          ))
        )}

        {isLoading && !hasStreamingMessage && (
<<<<<<< HEAD
          <div className="max-w-4xl mx-auto w-full animate-pop-in px-2">
=======
          <div className="max-w-5xl mx-auto w-full animate-pop-in px-2">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            <div className="mx-auto w-fit flex items-center gap-1.5 rounded-full border border-white/70 dark:border-white/12 bg-white/88 dark:bg-night-card/88 px-4 py-2 shadow-soft dark:shadow-night backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce" style={{ animationDelay: '120ms' }} />
              <div className="w-2 h-2 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce" style={{ animationDelay: '240ms' }} />
              <span className="ml-1 text-[11px] font-bold text-warm-500 dark:text-slate-300">正在生成</span>
            </div>
          </div>
        )}
<<<<<<< HEAD
        <div ref={bottomRef} className={`${bottomReserveClass} shrink-0 w-full`} />
      </div>

      {showScrollToBottom && (
        <button
          type="button"
          onClick={handleScrollToBottomClick}
          className={`absolute ${scrollToBottomButtonPositionClass} left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/70 dark:border-white/15 bg-white/95 dark:bg-night-card/95 px-3 py-1.5 text-xs font-bold text-warm-700 dark:text-slate-100 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-cheese-sm dark:hover:shadow-glow`}
        >
          <ArrowDown size={14} />
          回到底部
        </button>
      )}

      {/* Floating Pill Input */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
          {showQuotaCard && (
            <div className={`mb-1 rounded-[20px] border backdrop-blur-xl px-2.5 py-1.5 shadow-soft transition-all duration-300 ${
              quotaError
                ? 'bg-red-50/90 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-500 dark:text-red-300'
                : 'bg-white/75 dark:bg-night-card/75 border-white/70 dark:border-white/10 text-warm-700 dark:text-slate-100'
            }`}>
              {quotaError ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold truncate">{quotaError}</p>
                  <button
                    type="button"
                    onClick={onRefreshQuota}
                    disabled={!onRefreshQuota || quotaLoading}
                    className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-warm-500 dark:text-slate-300 hover:text-cheese-600 dark:hover:text-starlight-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCcw size={11} className={quotaLoading ? 'animate-spin' : ''} />
                    重试
                  </button>
                </div>
              ) : quotaInfo ? (
                <div className="flex items-center gap-2">
                  <p className="shrink-0 text-[10px] uppercase tracking-wide font-extrabold flex items-center gap-1.5">
                    <Gauge size={12} className="text-cheese-500 dark:text-starlight-300" />
                    今日用量
                  </p>
                  <div className="min-w-0 flex-1 overflow-x-auto custom-scrollbar">
                    <div className="min-w-max flex items-center gap-1">
                      <div className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-cream-50/70 dark:bg-black/20 border border-cheese-100/70 dark:border-white/10">
                        <span className="text-[10px] text-warm-400 dark:text-slate-400">总</span>
                        <span className="text-[12px] font-extrabold">{quotaInfo.quotaLimit}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-cream-50/70 dark:bg-black/20 border border-cheese-100/70 dark:border-white/10">
                        <span className="text-[10px] text-warm-400 dark:text-slate-400">已用</span>
                        <span className="text-[12px] font-extrabold">{quotaInfo.quotaUsed}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-cream-50/70 dark:bg-black/20 border border-cheese-100/70 dark:border-white/10">
                        <span className="text-[10px] text-warm-400 dark:text-slate-400">剩余</span>
                        <span className="text-[12px] font-extrabold">{quotaInfo.quotaRemaining}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-cream-50/70 dark:bg-black/20 border border-cheese-100/70 dark:border-white/10">
                        <span className="text-[10px] text-warm-400 dark:text-slate-400">重置</span>
                        <span className="text-[11px] font-extrabold">{formatQuotaResetTime(quotaInfo.quotaResetAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onRefreshQuota}
                    disabled={!onRefreshQuota || quotaLoading}
                    className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-warm-500 dark:text-slate-300 hover:text-cheese-600 dark:hover:text-starlight-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCcw size={11} className={quotaLoading ? 'animate-spin' : ''} />
                    刷新
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-1">
                  <Gauge size={12} className="text-cheese-500 dark:text-starlight-300" />
                  <p className="text-[11px] font-bold text-warm-500 dark:text-slate-300">正在同步今日额度...</p>
                </div>
=======
        {/* Reserve space at the bottom for the fixed input area */}
        <div ref={bottomRef} style={{ height: showQuotaCard ? '240px' : '200px' }} className="shrink-0 w-full transition-all duration-300" />
      </div>

      {/* Input Area Container */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
          
          {/* Utility Row: Quota Card + Scroll Button */}
          {showTopUtilityRow && (
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
              {showQuotaCard && (
                <div className="col-start-2 justify-self-center">
                  <div className={`
                  max-w-fit flex items-center justify-center
                  bg-white/80 dark:bg-night-card/80 backdrop-blur-xl border border-white/50 dark:border-white/10
                  rounded-full shadow-cheese-sm dark:shadow-night
                  px-1.5 py-1.5
                  transition-all duration-500 ease-spring hover:scale-105 hover:shadow-cheese hover:-translate-y-0.5
                `}>
                  {quotaError ? (
                    <div className="flex items-center justify-between gap-2 px-3">
                      <p className="text-[11px] font-bold text-red-500 truncate">{quotaError}</p>
                      <button
                        type="button"
                        onClick={onRefreshQuota}
                        disabled={!onRefreshQuota || quotaLoading}
                        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-warm-500 dark:text-slate-300 hover:text-cheese-600 dark:hover:text-starlight-200 transition-colors disabled:opacity-50"
                      >
                        <RefreshCcw size={11} className={quotaLoading ? 'animate-spin' : ''} />
                        重试
                      </button>
                    </div>
                  ) : quotaInfo ? (
                    <div className="flex items-center gap-1">
                      <div className="bg-cheese-100 dark:bg-white/10 p-1.5 rounded-full text-cheese-600 dark:text-starlight-300">
                        <Gauge size={14} />
                      </div>
                      <div className="flex items-center gap-3 px-2 text-xs font-bold text-warm-600 dark:text-slate-300">
                        <span className="text-[10px] uppercase tracking-wider text-warm-400 dark:text-slate-500">今日用量</span>
                        <div className="h-3 w-px bg-warm-200 dark:bg-white/10" />
                        <span className="font-extrabold">{quotaInfo.quotaUsed} / {quotaInfo.quotaLimit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={onRefreshQuota}
                        disabled={!onRefreshQuota || quotaLoading}
                        className="p-1.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-full text-warm-400 hover:text-cheese-600 transition-colors hover:rotate-180 duration-500"
                      >
                        <RefreshCcw size={12} className={quotaLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3">
                      <Gauge size={12} className="text-cheese-500 dark:text-starlight-300 animate-pulse" />
                      <p className="text-[11px] font-bold text-warm-500 dark:text-slate-300">正在同步...</p>
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
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
              )}
            </div>
          )}

<<<<<<< HEAD
          <div className={`
             bg-white/94 dark:bg-night-card/92 backdrop-blur-xl rounded-[30px]
             shadow-[0_12px_30px_-12px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_36px_-18px_rgba(2,8,23,0.85)]
             border-[2px] border-white/75 dark:border-white/10
             transition-all duration-300 p-1.5 flex flex-col gap-1.5
             ${isLoading ? 'opacity-90 grayscale' : 'hover:shadow-[0_18px_40px_-14px_rgba(255,167,38,0.2)] dark:hover:shadow-[0_20px_45px_-20px_rgba(14,165,233,0.5)]'}
             focus-within:border-slate-300/70 dark:focus-within:border-starlight-400/55
             focus-within:ring-0
          `}>
             {/* Attachments */}
             {attachments.length > 0 && (
              <div className="flex gap-2 px-3 pt-1 overflow-x-auto custom-scrollbar">
                {attachments.map(file => (
                  <div key={file.id} className="relative flex items-center gap-1.5 px-2.5 py-1 bg-cheese-50 dark:bg-white/10 rounded-lg text-[11px] font-bold text-warm-700 dark:text-white border border-cheese-200 dark:border-white/10 animate-pop-in">
                     <span className="truncate max-w-[92px]">{file.name}</span>
                     <button onClick={() => removeAttachment(file.id)} className="p-0.5 hover:bg-red-100 text-red-400 rounded-full"><X size={11} /></button>
=======
          {/* Main Input Box */}
          <div className={`
             bg-white/90 dark:bg-night-card/90 backdrop-blur-2xl rounded-[32px]
             shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]
             border border-white/60 dark:border-white/10
             transition-all duration-500 ease-spring relative flex flex-col overflow-hidden
             ${isLoading ? 'opacity-95 grayscale-[0.3]' : 'hover:shadow-[0_20px_50px_-12px_rgba(255,183,77,0.25)] dark:hover:shadow-[0_20px_50px_-12px_rgba(14,165,233,0.25)] hover:scale-[1.005] hover:-translate-y-0.5'}
             focus-within:ring-2 focus-within:ring-cheese-200/50 dark:focus-within:ring-starlight-500/20 focus-within:scale-[1.005]
          `}>
             
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
                {attachments.map(file => (
                  <div key={file.id} className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-cheese-50 dark:bg-white/10 rounded-xl text-[11px] font-bold text-warm-700 dark:text-white border border-cheese-200 dark:border-white/10 animate-pop-in shadow-sm">
                     <span className="truncate max-w-[100px]">{file.name}</span>
                     <button onClick={() => removeAttachment(file.id)} className="p-0.5 hover:bg-red-100 text-red-400 rounded-full transition-colors"><X size={12} /></button>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                  </div>
                ))}
              </div>
            )}

<<<<<<< HEAD
             <div className="flex flex-col gap-1.5 pl-1.5 pr-2 py-1 rounded-[20px] bg-white/92 dark:bg-night-surface/90 border border-slate-300/40 dark:border-[#3b4c72]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:border-slate-400/60 dark:focus-within:border-starlight-400/55">
               <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                 <div className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-white/60 dark:border-white/12 bg-white/74 dark:bg-night-card/64 backdrop-blur-sm px-2.5 py-1 shadow-soft dark:shadow-night transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5">
                   <span className="text-[10px] font-black text-warm-600 dark:text-starlight-200 whitespace-nowrap">深度思考</span>
                   <Switch
                     checked={thinkEnabled}
                     onChange={(checked) => onThinkEnabledChange?.(checked)}
                     disabled={isLoading || !onThinkEnabledChange}
                     size="lgMobile"
                     className="scale-[0.92] sm:scale-100 transition-transform duration-300"
                   />
                   <span className="text-[10px] font-bold text-warm-500 dark:text-starlight-300 whitespace-nowrap">{thinkStatusText}</span>
                 </div>
                 {isLoading && (
                   <span className="shrink-0 pr-1 text-[10px] font-semibold text-warm-400 dark:text-slate-400">生成中</span>
                 )}
               </div>

               <div className="flex items-center gap-2">
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   disabled={inputDisabled}
                   className="p-2.5 text-warm-500 dark:text-starlight-300 hover:text-cheese-600 dark:hover:text-starlight-200 bg-white/55 dark:bg-night-card/70 hover:bg-white dark:hover:bg-night-card rounded-full transition-all active:scale-90 cubic-bezier(0.34, 1.56, 0.64, 1) disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/55 dark:disabled:hover:bg-night-card/70 disabled:hover:text-warm-500 dark:disabled:hover:text-starlight-300"
                 >
                   <Paperclip size={20} strokeWidth={2.4} />
                 </button>
                 <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*, application/pdf, text/plain" disabled={inputDisabled} />

                 <textarea
                     ref={textareaRef}
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={handleKeyDown}
                     onCompositionStart={handleCompositionStart}
                     onCompositionEnd={handleCompositionEnd}
                     placeholder={modelInputPlaceholder}
                     className="w-full max-h-[132px] bg-transparent !border-none border-0 outline-none ring-0 focus:!border-none focus:border-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 resize-none py-2.5 px-1.5 text-warm-800 dark:text-slate-100 placeholder:text-warm-500 dark:placeholder:text-slate-500 text-[15px] leading-6 font-medium caret-cheese-500 dark:caret-starlight-300"
                     rows={1}
                     disabled={inputDisabled}
                 />

                 <Button
                   size="icon"
                   onClick={handleSend}
                   disabled={!canSend}
                   className={`
                     !w-10 !h-10 min-w-10 min-h-10 aspect-square !rounded-full p-0 mx-0.5 border-2 ring-1 transition-all duration-300 text-white
                     disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none
                     ${canSend
                       ? "bg-gradient-to-br from-cheese-400 via-cheese-500 to-cheese-600 dark:from-starlight-400 dark:via-starlight-500 dark:to-starlight-600 border-white/70 dark:border-white/35 ring-slate-300/35 dark:ring-starlight-300/35 shadow-[0_0_0_2px_rgba(255,255,255,0.12),0_8px_18px_-10px_rgba(37,99,235,0.45)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.06),0_10px_20px_-12px_rgba(14,165,233,0.75)] hover:scale-[1.05] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                       : "bg-slate-200/75 dark:bg-white/[0.10] border-slate-300/55 dark:border-white/20 ring-slate-200/50 dark:ring-white/8 shadow-[0_0_0_2px_rgba(255,255,255,0.08)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.03)]"
                     }
                   `}
                 >
                   <ArrowUp size={18} strokeWidth={2.6} className="text-white" />
                 </Button>
               </div>
=======
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
                   <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*, application/pdf, text/plain" disabled={inputDisabled} />

                   {/* Deep Thinking Toggle Pill */}
                   <div 
                     onClick={() => !isLoading && onThinkEnabledChange && onThinkEnabledChange(!thinkEnabled)}
                     className={`
                       group relative flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer select-none
                       ${SMOOTH_SPRING_TRANSITION}
                       active:scale-95 hover:scale-102 hover:-translate-y-0.5
                       ${thinkEnabled 
                         ? 'bg-cheese-500 dark:bg-starlight-500 text-white shadow-cheese-sm dark:shadow-glow' 
                         : 'bg-slate-100/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-white/20'
                       }
                       ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                     `}
                   >
                     <div className={`p-1 rounded-full transition-colors duration-300 ${thinkEnabled ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-400 dark:bg-white/10'}`}>
                        <Brain size={12} strokeWidth={3} />
                     </div>
                     <span className={`text-[11px] font-extrabold transition-colors duration-300`}>深度思考</span>
                     
                     <div className={`w-2 h-2 rounded-full transition-all duration-500 ${thinkEnabled ? 'bg-white scale-125' : 'bg-slate-300 dark:bg-slate-600 scale-75'}`}></div>
                   </div>
                 </div>

                 <div className="flex items-center gap-2">
                   {isLoading && (
                     <div className="flex items-center gap-1.5 px-3 py-1.5">
                       <Zap size={14} className="text-cheese-500 dark:text-starlight-400 fill-current animate-pulse" />
                     </div>
                   )}
                   <Button
                     size="icon"
                     onClick={handleSend}
                     disabled={!canSend}
                     className={`
                       shrink-0 !w-11 !h-11 !rounded-[20px] p-0 ${SMOOTH_SPRING_TRANSITION}
                       disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none
                       ${canSend
                         ? "bg-gradient-to-br from-cheese-400 to-cheese-600 dark:from-starlight-400 dark:to-starlight-600 shadow-[0_8px_20px_-6px_rgba(251,140,0,0.5)] dark:shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)] hover:scale-105 hover:-translate-y-1 active:scale-95 active:rotate-2"
                         : "bg-slate-100 dark:bg-white/10 text-slate-300 dark:text-slate-600 shadow-none"
                       }
                     `}
                   >
                     <ArrowUp size={22} strokeWidth={3} className={canSend ? 'text-white' : 'text-slate-300 dark:text-slate-600'} />
                   </Button>
                 </div>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
<<<<<<< HEAD

const formatQuotaResetTime = (raw?: string): string => {
  if (!raw) {
    return '--';
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatThinkingDuration = (durationMs?: number): string => {
  if (!durationMs || durationMs <= 0) {
    return '0.0s';
  }

  if (durationMs < 1000) {
    return `${Math.max(1, Math.round(durationMs))}ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(durationMs < 10_000 ? 1 : 0)}s`;
  }

  const minutes = Math.floor(durationMs / 60_000);
  const seconds = ((durationMs % 60_000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
};

const extractLanguageName = (className?: string): string => {
  if (!className) {
    return 'text';
  }

  const matched = className.match(/language-([\w-]+)/i);
  if (matched?.[1]) {
    return matched[1].toLowerCase();
  }

  return 'text';
};

const normalizeStreamingMarkdown = (content: string, isStreaming: boolean): string => {
  if (!isStreaming || !content.includes('```')) {
    return content;
  }

  const fenceCount = content.match(/```/g)?.length ?? 0;
  if (fenceCount % 2 === 0) {
    return content;
  }

  return `${content}\n\`\`\``;
};

const MarkdownCodeBlock: React.FC<{ className?: string; value: string }> = ({ className, value }) => {
  const [copied, setCopied] = useState(false);
  const language = extractLanguageName(className);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-cheese-200/90 dark:border-slate-700/60 bg-gradient-to-b from-cream-50 to-cream-100/95 dark:from-[#0b122a] dark:to-[#091129] shadow-[0_8px_22px_-16px_rgba(161,136,127,0.38)] dark:shadow-[0_8px_24px_-18px_rgba(14,23,42,0.9)]">
      <div className="flex items-center justify-between border-b border-cheese-200/90 dark:border-slate-700/70 bg-cream-100/85 dark:bg-slate-900/60 px-3 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-warm-700 dark:text-slate-300">{language}</span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 rounded-md border border-cheese-300/90 dark:border-slate-600 bg-white/90 dark:bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-warm-700 dark:text-slate-200 transition-colors hover:bg-cream-100 dark:hover:bg-slate-700"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="max-h-[360px] overflow-x-auto overflow-y-auto bg-cream-50/80 dark:bg-transparent p-3 text-[12.5px] leading-5 text-warm-900 dark:text-slate-100">
        <code className={className}>{value}</code>
      </pre>
    </div>
  );
};

const markdownRenderers = {
  h1: ({ children }: any) => <h1 className="mb-3 mt-1.5 text-[1.65rem] font-extrabold leading-tight text-warm-800 dark:text-white">{children}</h1>,
  h2: ({ children }: any) => <h2 className="mb-2.5 mt-4 text-[1.18rem] font-bold leading-tight text-warm-800 dark:text-white">{children}</h2>,
  h3: ({ children }: any) => <h3 className="mb-1.5 mt-3 text-base font-bold leading-tight text-warm-700 dark:text-starlight-100">{children}</h3>,
  p: ({ children }: any) => <p className="my-1.5 leading-[1.5] text-warm-800 dark:text-slate-100">{children}</p>,
  ul: ({ children }: any) => <ul className="my-1.5 list-disc space-y-0.5 pl-4 marker:text-cheese-500 dark:marker:text-starlight-300">{children}</ul>,
  ol: ({ children }: any) => <ol className="my-1.5 list-decimal space-y-0.5 pl-4 marker:text-cheese-500 dark:marker:text-starlight-300">{children}</ol>,
  li: ({ children }: any) => <li className="leading-[1.45]">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="my-2.5 border-l-4 border-cheese-300 dark:border-starlight-400 bg-cheese-50/80 dark:bg-starlight-500/10 px-3 py-2 italic text-warm-600 dark:text-slate-200 rounded-r-xl">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-cheese-600 underline decoration-cheese-400/60 underline-offset-2 hover:text-cheese-500 dark:text-starlight-300 dark:hover:text-starlight-200"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-cheese-100/80 dark:border-white/10" />,
  table: ({ children }: any) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-cheese-100 dark:border-white/10">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-cheese-50/70 dark:bg-white/5">{children}</thead>,
  th: ({ children }: any) => <th className="border-b border-cheese-100 dark:border-white/10 px-2.5 py-1.5 text-left font-bold text-warm-700 dark:text-starlight-200">{children}</th>,
  td: ({ children }: any) => <td className="border-b border-cheese-100/80 dark:border-white/10 px-2.5 py-1.5 text-warm-700 dark:text-slate-200">{children}</td>,
  code: ({ inline, className, children }: any) => {
    const value = String(children || '').replace(/\n$/, '');

    if (inline) {
      return (
        <code className="rounded-md bg-cheese-100/80 px-1.5 py-0.5 text-[0.92em] font-semibold text-cheese-700 dark:bg-white/10 dark:text-starlight-200">
          {value}
        </code>
      );
    }

    return <MarkdownCodeBlock className={className} value={value} />;
  },
};

const MessageBubble: React.FC<{
  message: Message;
  user?: User | null;
  onEdit?: (id: string, text: string) => void;
  aiBubbleEnabled: boolean;
}> = ({ message, user, onEdit, aiBubbleEnabled }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(() => Boolean(message.isStreaming));
  const [editContent, setEditContent] = useState(message.content);
  const [isLongUserContent, setIsLongUserContent] = useState(false);
  const [isUserContentExpanded, setIsUserContentExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userContentRef = useRef<HTMLDivElement>(null);
  const previousStreamingRef = useRef(Boolean(message.isStreaming));
  const thinkingContent = message.thinking?.trim();
  const hasThinkingPanel = !isUser && Boolean(thinkingContent);
  const showMessageBubble = isUser || aiBubbleEnabled;
  const renderableContent = useMemo(
    () => normalizeStreamingMarkdown(message.content, Boolean(message.isStreaming) && !isUser),
    [isUser, message.content, message.isStreaming],
  );
  const isEditingUserBubble = isEditing && isUser && showMessageBubble;
  const showStreamingDots = !isUser && message.isStreaming && !hasThinkingPanel && renderableContent.trim().length === 0;
  const userMessageCollapseHeight = 260;
  const shouldCollapseUserContent = isUser && !isEditing && isLongUserContent && !isUserContentExpanded;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        const MIN_HEIGHT = 140;
        const MAX_HEIGHT = 360;
        textareaRef.current.style.height = 'auto';
        const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
        textareaRef.current.style.height = `${nextHeight}px`;
        textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [editContent, isEditing]);

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  useEffect(() => {
    if (isUser) {
      setIsUserContentExpanded(false);
    }
  }, [isUser, message.id, message.content]);

  useEffect(() => {
    if (!isUser || isEditing) {
      setIsLongUserContent(false);
      return;
    }

    const node = userContentRef.current;
    if (!node) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const shouldFold = node.scrollHeight > userMessageCollapseHeight;
      setIsLongUserContent(shouldFold);
      if (!shouldFold) {
        setIsUserContentExpanded(false);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isUser, isEditing, message.id, renderableContent, userMessageCollapseHeight]);

  useEffect(() => {
    const wasStreaming = previousStreamingRef.current;
    const isStreamingNow = Boolean(message.isStreaming);

    if (isStreamingNow && !wasStreaming) {
      setIsThinkingExpanded(true);
    }

    if (!isStreamingNow && wasStreaming) {
      setIsThinkingExpanded(false);
    }

    previousStreamingRef.current = isStreamingNow;
  }, [message.isStreaming]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
        onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex max-w-4xl mx-auto w-full min-w-0 group animate-slide-up-bouncy ${isUser ? 'flex-row-reverse gap-4 sm:gap-6' : 'gap-2.5 sm:gap-6 -ml-1 sm:ml-0'}`}>
      <div className={`
        w-9 h-9 sm:w-10 sm:h-10 rounded-2xl sm:rounded-[18px] flex items-center justify-center shrink-0 shadow-sm border-2 overflow-hidden transform hover:scale-110 transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
        ${isUser
          ? 'bg-cheese-100 border-cheese-200 dark:bg-slate-700 dark:border-slate-600'
          : 'bg-white dark:bg-night-card border-cheese-100 dark:border-white/10 text-cheese-500 dark:text-starlight-300'
        }
      `}>
        {isUser ? (
           <img src={user?.avatar} alt="User" className="w-full h-full object-cover" />
        ) : <Bot size={20} className="sm:w-6 sm:h-6" />}
      </div>

      <div className={`relative min-w-0 flex flex-col ${showMessageBubble ? (isEditingUserBubble ? 'w-full max-w-full sm:max-w-[85%]' : 'max-w-[85%]') : 'flex-1 max-w-none'} ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`mb-2 text-xs font-bold text-warm-400 dark:text-slate-500 ${isUser ? 'text-right px-2.5' : showMessageBubble ? 'text-left px-2.5' : 'text-left px-0'}`}>
           {isUser ? user?.name : 'Mintal AI'}
        </div>

        {hasThinkingPanel && (
          <div className="mb-2 max-w-full overflow-hidden rounded-2xl border border-cheese-100 dark:border-white/10 bg-cream-50/85 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setIsThinkingExpanded(prev => !prev)}
              className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left transition-colors hover:bg-white/55 dark:hover:bg-white/[0.07]"
            >
              <span className="text-[11px] font-bold text-warm-600 dark:text-starlight-300">
                {message.isStreaming ? '思考中' : '思考完成'}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-warm-400 dark:text-slate-400">
                {message.isStreaming
                  ? `思考中 ${formatThinkingDuration(message.thinkingDurationMs)}`
                  : `耗时 ${formatThinkingDuration(message.thinkingDurationMs)}`}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isThinkingExpanded ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {isThinkingExpanded && (
              <div className="border-t border-cheese-100/80 dark:border-white/10">
                <div className="max-h-36 overflow-y-auto custom-scrollbar px-3 py-2 text-[11px] leading-5 text-warm-500 dark:text-slate-300 whitespace-pre-wrap break-words">
                  {thinkingContent || '思考中...'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`
          relative transition-all duration-300 max-w-full min-w-0
          ${showMessageBubble
            ? `px-4 py-3 rounded-[24px] text-[14px] leading-[1.5] shadow-sm ${isEditingUserBubble ? 'w-full max-w-full sm:min-w-[360px] sm:max-w-[680px]' : 'w-fit'} ${isEditing ? '' : 'hover:scale-[1.01]'} ${isUser
              ? 'bg-gradient-to-br from-cheese-400 to-cheese-500 dark:from-starlight-500 dark:to-starlight-600 text-white rounded-tr-none shadow-cheese-sm dark:shadow-glow'
              : 'bg-white/80 dark:bg-night-card/80 backdrop-blur-sm border-2 border-white/50 dark:border-white/5 text-warm-800 dark:text-slate-100 rounded-tl-none shadow-soft'
            }`
            : 'w-full px-0 py-0 text-[14px] leading-[1.55] text-warm-800 dark:text-slate-100'
          }
        `}>
          {message.attachments?.map((att, i) => (
             att.type.startsWith('image/') && <img key={i} src={att.data} className={`rounded-xl mb-2.5 max-h-56 shadow-sm ${showMessageBubble ? 'border border-white/20' : 'border border-cheese-200/60 dark:border-white/10'}`} />
          ))}

          {isEditing ? (
              <div key="edit-mode" className="flex flex-col gap-2.5 w-full animate-pop-in origin-center rounded-[22px] bg-white/28 dark:bg-night-card/58 backdrop-blur-md border-2 border-white/45 dark:border-white/12 shadow-soft dark:shadow-night p-3">
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-w-0 min-h-[140px] max-h-[55vh] overflow-y-auto bg-white/55 dark:bg-black/20 rounded-[16px] px-3 py-2.5 text-white placeholder-white/70 outline-none resize-none border-2 border-white/55 dark:border-white/12 focus:bg-white/68 dark:focus:bg-black/28 focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 leading-6"
                  />
                  <div className="flex flex-wrap justify-end gap-2 mt-1 animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                      <button onClick={() => setIsEditing(false)} className="min-w-[74px] px-3.5 py-1.5 text-xs bg-white/35 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/18 rounded-full border border-white/45 dark:border-white/15 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 font-bold">取消</button>
                      <button onClick={handleSaveEdit} className="min-w-[74px] px-3.5 py-1.5 text-xs bg-white text-cheese-600 dark:text-starlight-600 font-bold rounded-full shadow-cheese-sm dark:shadow-glow transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95">保存</button>
                  </div>
              </div>
          ) : showStreamingDots ? (
            <div className="inline-flex items-center gap-1.5 py-0.5 leading-none animate-pop-in">
              <span className="h-2.5 w-2.5 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2.5 w-2.5 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce" style={{ animationDelay: '120ms' }} />
              <span className="h-2.5 w-2.5 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce" style={{ animationDelay: '240ms' }} />
            </div>
          ) : (
            <>
              <div className="relative">
                <div
                  ref={isUser ? userContentRef : undefined}
                  className={`markdown-content font-medium break-words [overflow-wrap:anywhere] [word-break:break-word] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${shouldCollapseUserContent ? 'max-h-[260px] overflow-hidden pr-0.5' : ''}`}
                >
                  <ReactMarkdown components={markdownRenderers}>{renderableContent}</ReactMarkdown>
                  {message.isStreaming && !isUser && !showStreamingDots && (
                    <span className="inline-flex items-center gap-1 ml-1.5 align-middle">
                      <span className="h-1.5 w-1.5 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce" style={{ animationDelay: '110ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce" style={{ animationDelay: '220ms' }} />
                    </span>
                  )}
                </div>
                {shouldCollapseUserContent && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-[20px] bg-gradient-to-t from-cheese-500/56 via-cheese-400/22 to-transparent dark:from-starlight-600/60 dark:via-starlight-500/24 dark:to-transparent" />
                )}
              </div>

              {isUser && isLongUserContent && !message.isStreaming && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsUserContentExpanded((prev) => !prev)}
                    className="group/fold inline-flex items-center gap-1.5 rounded-full border-2 border-white/55 dark:border-white/15 bg-white/28 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-white/38 dark:hover:bg-white/16 active:scale-95"
                  >
                    {isUserContentExpanded ? '收起内容' : '展开内容'}
                    <ChevronDown size={13} className={`transition-transform duration-200 group-hover/fold:scale-110 ${isUserContentExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions (Copy/Edit) */}
        <div className={`mt-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'pr-2.5' : showMessageBubble ? 'pl-2.5' : 'pl-0'}`}>
            <button onClick={handleCopy} className="p-1.5 text-warm-400 hover:text-cheese-500 dark:hover:text-starlight-300 bg-white/50 dark:bg-white/5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors hover:scale-110 active:scale-90">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {isUser && onEdit && !isEditing && (
                 <button onClick={() => setIsEditing(true)} className="p-1.5 text-warm-400 hover:text-cheese-500 dark:hover:text-starlight-300 bg-white/50 dark:bg-white/5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors hover:scale-110 active:scale-90">
                    <Pencil size={14} />
                 </button>
            )}
        </div>
      </div>
    </div>
  );
};
=======
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
