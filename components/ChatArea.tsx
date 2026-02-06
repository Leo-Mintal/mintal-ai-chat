import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Attachment, User } from '../types';
import { Paperclip, X, File, Sparkles, Wand2, Pencil, ArrowUp, Bot, Copy, Check, Star, Heart, Smile } from 'lucide-react';
import { Button } from './ui/Button';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  user: User | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, onSendMessage, onEditMessage, user }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (!textareaRef.current) return;
    const DEFAULT_HEIGHT = 48;
    const MAX_HEIGHT = 150;
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight || DEFAULT_HEIGHT;
    const targetHeight = Math.min(Math.max(scrollHeight, DEFAULT_HEIGHT), MAX_HEIGHT);
    textareaRef.current.style.height = targetHeight + 'px';
    textareaRef.current.style.overflowY = scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, isLoading]);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(input, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  return (
    <div className="flex flex-col h-full relative z-0">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center pb-24 relative">
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
                  onClick={() => setInput(suggestion)}
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  className="group p-4 bg-white/70 dark:bg-night-card/50 border-2 border-transparent hover:border-cheese-300 dark:hover:border-starlight-500 rounded-[24px] shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) transform hover:-translate-y-1 hover:scale-[1.02] text-left animate-slide-up-bouncy"
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
            <MessageBubble key={msg.id} message={msg} user={user} onEdit={onEditMessage} />
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto w-full animate-pop-in px-2">
             <div className="w-10 h-10 rounded-[18px] bg-white dark:bg-night-card border-2 border-cheese-100 dark:border-white/10 flex items-center justify-center shadow-sm">
               <Bot size={20} className="text-cheese-500 dark:text-starlight-300" />
             </div>
             <div className="flex items-center gap-1.5 h-12 px-6 bg-white dark:bg-night-card rounded-[24px] rounded-tl-none shadow-sm border border-cheese-50 dark:border-white/5">
               <div className="w-2.5 h-2.5 bg-cheese-300 dark:bg-starlight-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2.5 h-2.5 bg-cheese-400 dark:bg-starlight-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2.5 h-2.5 bg-cheese-500 dark:bg-starlight-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
        <div ref={bottomRef} className="h-32 shrink-0 w-full" />
      </div>

      {/* Floating Pill Input */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
          <div className={`
             bg-white/80 dark:bg-night-card/80 backdrop-blur-xl rounded-[32px] 
             shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-night 
             border-[3px] border-white/60 dark:border-white/10 
             transition-all duration-300 p-2 flex flex-col gap-2
             ${isLoading ? 'opacity-90 grayscale' : 'hover:scale-[1.01] hover:shadow-[0_20px_50px_-10px_rgba(255,167,38,0.2)] dark:hover:shadow-glow'}
             focus-within:border-cheese-200/50 dark:focus-within:border-starlight-500/30
             focus-within:ring-4 focus-within:ring-cheese-100 dark:focus-within:ring-starlight-500/20
          `}>
             {/* Attachments */}
             {attachments.length > 0 && (
              <div className="flex gap-3 px-4 pt-2 overflow-x-auto custom-scrollbar">
                {attachments.map(file => (
                  <div key={file.id} className="relative flex items-center gap-2 px-3 py-1.5 bg-cheese-50 dark:bg-white/10 rounded-xl text-xs font-bold text-warm-700 dark:text-white border border-cheese-200 dark:border-white/10 animate-pop-in">
                     <span className="truncate max-w-[100px]">{file.name}</span>
                     <button onClick={() => removeAttachment(file.id)} className="p-0.5 hover:bg-red-100 text-red-400 rounded-full"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

             <div className="flex items-end gap-2 pl-2 pr-2 pb-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-warm-400 dark:text-starlight-300 hover:text-cheese-600 dark:hover:text-starlight-500 hover:bg-cheese-50 dark:hover:bg-white/10 rounded-full transition-all active:scale-90 cubic-bezier(0.34, 1.56, 0.64, 1)"
                >
                  <Paperclip size={22} strokeWidth={2.5} />
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*, application/pdf, text/plain" />

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="发个消息..."
                    className="w-full max-h-[150px] bg-transparent border-none focus:ring-0 resize-none py-3.5 px-2 text-warm-800 dark:text-white placeholder:text-warm-300 dark:placeholder:text-slate-500 text-base font-medium"
                    rows={1}
                />
                
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className={`
                    w-12 h-12 rounded-full mb-0.5 transition-transform duration-300 shadow-none border-0
                    ${(!input.trim() && attachments.length === 0) 
                      ? "bg-warm-100 dark:bg-white/10 text-warm-300 dark:text-slate-500" 
                      : "bg-gradient-to-tr from-cheese-400 to-cheese-600 dark:from-starlight-500 dark:to-starlight-600 text-white shadow-cheese dark:shadow-glow hover:scale-110 active:scale-90"
                    }
                  `}
                >
                  <ArrowUp size={24} strokeWidth={3} />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message; user?: User | null; onEdit?: (id: string, text: string) => void }> = ({ message, user, onEdit }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        // Auto resize functionality for edit textarea
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editContent, isEditing]);

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
    <div className={`flex gap-4 max-w-4xl mx-auto w-full group animate-slide-up-bouncy ${isUser ? 'flex-row-reverse' : ''}`}>
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

      <div className={`relative max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`mb-1 text-xs font-bold text-warm-400 dark:text-slate-500 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
           {isUser ? user?.name : 'Mintal AI'}
        </div>

        <div className={`
          px-6 py-4 rounded-[32px] text-base leading-7 shadow-sm relative transition-all duration-300 w-fit hover:scale-[1.01]
          ${isUser 
            ? 'bg-gradient-to-br from-cheese-400 to-cheese-500 dark:from-starlight-500 dark:to-starlight-600 text-white rounded-tr-none shadow-cheese-sm dark:shadow-glow' 
            : 'bg-white/80 dark:bg-night-card/80 backdrop-blur-sm border-2 border-white/50 dark:border-white/5 text-warm-800 dark:text-slate-100 rounded-tl-none shadow-soft'
          }
        `}>
          {message.attachments?.map((att, i) => (
             att.type.startsWith('image/') && <img key={i} src={att.data} className="rounded-2xl mb-3 max-h-60 border-2 border-white/20 shadow-sm" />
          ))}
          
          {isEditing ? (
              <div key="edit-mode" className="flex flex-col gap-2 w-full animate-pop-in origin-center">
                  <textarea 
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-w-[200px] sm:min-w-[300px] bg-white/20 rounded-lg p-2 text-white placeholder-white/70 outline-none resize-none border border-white/30 focus:bg-white/30 transition-colors"
                  />
                  <div className="flex justify-end gap-2 mt-1 animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                      <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full transition-colors font-medium">取消</button>
                      <button onClick={handleSaveEdit} className="px-3 py-1 text-xs bg-white text-cheese-600 dark:text-starlight-600 font-bold rounded-full shadow-sm hover:scale-105 transition-transform">保存</button>
                  </div>
              </div>
          ) : (
            <div className="markdown-content font-medium break-words">
                <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Actions (Copy/Edit) */}
        <div className={`mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'pr-2' : 'pl-2'}`}>
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
