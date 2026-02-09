import React, { useRef, useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Attachment, User } from '../types';
import type { UserQuotaSummary } from '../services/adminService';
import { Paperclip, X, Sparkles, Wand2, Pencil, ArrowUp, ArrowDown, ChevronDown, Bot, Copy, Check, Star, Heart, Gauge, RefreshCcw } from 'lucide-react';
import { Button } from './ui/Button';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  user: User | null;
  quotaInfo: UserQuotaSummary | null;
  quotaLoading: boolean;
  quotaError?: string;
  onRefreshQuota?: () => void;
  aiBubbleEnabled: boolean;
  inputDisabled?: boolean;
  inputDisabledHint?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onEditMessage,
  user,
  quotaInfo,
  quotaLoading,
  quotaError,
  onRefreshQuota,
  aiBubbleEnabled,
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

  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return;
    const DEFAULT_HEIGHT = 44;
    const MAX_HEIGHT = 132;
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight || DEFAULT_HEIGHT;
    const targetHeight = Math.min(Math.max(scrollHeight, DEFAULT_HEIGHT), MAX_HEIGHT);
    textareaRef.current.style.height = targetHeight + 'px';
    textareaRef.current.style.overflowY = scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  const hasStreamingMessage = messages.some(message => message.role === 'model' && message.isStreaming);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

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
      return;
    }

    if (distanceToBottom <= AUTO_SCROLL_RESUME_THRESHOLD) {
      if (!isAutoScrollEnabled) {
        setIsAutoScrollEnabled(true);
      }
      setShowScrollToBottom(false);
    }
  }, [isAutoScrollEnabled]);

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
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isLoading && !inputDisabled;
  const shouldReserveBottomSpace = messages.length > 0 || isLoading;
  const bottomReserveClass = shouldReserveBottomSpace
    ? (showQuotaCard ? 'h-56 sm:h-60' : 'h-44 sm:h-48')
    : 'h-0';

  return (
    <div className="flex flex-col h-full relative z-0">
      <div ref={scrollContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar">
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
              <div className="relative w-28 h-28 bg-gradient-to-br from-white to-cream-100 dark:from-night-card dark:to-night-surface rounded-[40px] shadow-cheese dark:shadow-glow border-4 border-white dark:border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform duration-500 cursor-pointer animate-float">
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
                  className="group p-4 bg-white/70 dark:bg-night-card/50 border-2 border-transparent hover:border-cheese-300 dark:hover:border-starlight-500 rounded-[24px] shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) transform hover:-translate-y-1 hover:scale-[1.02] text-left animate-slide-up-bouncy disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
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
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              user={user}
              onEdit={onEditMessage}
              aiBubbleEnabled={aiBubbleEnabled}
            />
          ))
        )}
        
        {isLoading && !hasStreamingMessage && (
          <div className="max-w-4xl mx-auto w-full animate-pop-in px-2">
            <div className="mx-auto w-fit flex items-center gap-1.5 rounded-full border border-white/70 dark:border-white/12 bg-white/88 dark:bg-night-card/88 px-4 py-2 shadow-soft dark:shadow-night backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-cheese-400 dark:bg-starlight-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-cheese-500 dark:bg-starlight-400 animate-bounce" style={{ animationDelay: '120ms' }} />
              <div className="w-2 h-2 rounded-full bg-cheese-600 dark:bg-starlight-300 animate-bounce" style={{ animationDelay: '240ms' }} />
              <span className="ml-1 text-[11px] font-bold text-warm-500 dark:text-slate-300">正在生成</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className={`${bottomReserveClass} shrink-0 w-full`} />
      </div>

      {showScrollToBottom && (
        <button
          type="button"
          onClick={handleScrollToBottomClick}
          className="absolute bottom-[132px] right-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/70 dark:border-white/15 bg-white/95 dark:bg-night-card/95 px-3 py-1.5 text-xs font-bold text-warm-700 dark:text-slate-100 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-cheese-sm dark:hover:shadow-glow"
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
              )}
            </div>
          )}

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
                  </div>
                ))}
              </div>
            )}

             <div className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-[20px] bg-white/92 dark:bg-night-surface/90 border border-slate-300/40 dark:border-[#3b4c72]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus-within:border-slate-400/60 dark:focus-within:border-starlight-400/55">
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
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousStreamingRef = useRef(Boolean(message.isStreaming));
  const thinkingContent = message.thinking?.trim();
  const hasThinkingPanel = !isUser && (Boolean(thinkingContent) || Boolean(message.isStreaming));
  const showMessageBubble = isUser || aiBubbleEnabled;
  const renderableContent = useMemo(
    () => normalizeStreamingMarkdown(message.content, Boolean(message.isStreaming) && !isUser),
    [isUser, message.content, message.isStreaming],
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        // Auto resize functionality for edit textarea
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editContent, isEditing]);

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

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
    <div className={`flex gap-5 sm:gap-6 max-w-4xl mx-auto w-full min-w-0 group animate-slide-up-bouncy ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`
        w-10 h-10 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm border-2 overflow-hidden transform hover:scale-110 transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
        ${isUser 
          ? 'bg-cheese-100 border-cheese-200 dark:bg-slate-700 dark:border-slate-600' 
          : 'bg-white dark:bg-night-card border-cheese-100 dark:border-white/10 text-cheese-500 dark:text-starlight-300'
        }
      `}>
        {isUser ? (
           <img src={user?.avatar} alt="User" className="w-full h-full object-cover" />
        ) : <Bot size={24} />}
      </div>

      <div className={`relative min-w-0 flex flex-col ${showMessageBubble ? 'max-w-[85%]' : 'flex-1 max-w-none'} ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`mb-2 text-xs font-bold text-warm-400 dark:text-slate-500 px-2.5 ${isUser ? 'text-right' : 'text-left'}`}>
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
            ? `px-4 py-3 rounded-[24px] text-[14px] leading-[1.5] shadow-sm w-fit hover:scale-[1.01] ${isUser
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
              <div key="edit-mode" className="flex flex-col gap-2 w-full animate-pop-in origin-center">
                  <textarea 
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-w-0 bg-white/20 rounded-lg p-2 text-white placeholder-white/70 outline-none resize-none border border-white/30 focus:bg-white/30 transition-colors"
                  />
                  <div className="flex justify-end gap-2 mt-1 animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                      <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full transition-colors font-medium">取消</button>
                      <button onClick={handleSaveEdit} className="px-3 py-1 text-xs bg-white text-cheese-600 dark:text-starlight-600 font-bold rounded-full shadow-sm hover:scale-105 transition-transform">保存</button>
                  </div>
              </div>
          ) : (
            <div className="markdown-content font-medium break-words [overflow-wrap:anywhere] [word-break:break-word] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown components={markdownRenderers}>{renderableContent}</ReactMarkdown>
                {message.isStreaming && !isUser && (
                  <span className="inline-block ml-1 w-2 h-5 align-middle bg-cheese-400 dark:bg-starlight-400 rounded animate-pulse" />
                )}
            </div>
          )}
        </div>
        
        {/* Actions (Copy/Edit) */}
        <div className={`mt-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'pr-2.5' : 'pl-2.5'}`}>
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
