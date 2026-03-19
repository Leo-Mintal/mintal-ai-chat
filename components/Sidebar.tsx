import React, { useState, useEffect, useRef } from "react";
import { Conversation, User, View } from "../types";
import {
  Plus,
  MessageCircle,
  Settings,
  LogOut,
  X,
  MoreHorizontal,
  Sparkles,
  Edit2,
  Trash2,
} from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onNavigate: (view: View) => void;
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDesktopOpen: boolean;
  setIsDesktopOpen: (open: boolean) => void;
  isConversationLoading?: boolean;
  conversationError?: string;
  hasMoreConversations?: boolean;
  isLoadingMoreConversations?: boolean;
  onLoadMoreConversations?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onNavigate,
  user,
  onLogout,
  isOpen,
  setIsOpen,
  isDesktopOpen,
  setIsDesktopOpen,
  isConversationLoading = false,
  conversationError,
  hasMoreConversations = false,
  isLoadingMoreConversations = false,
  onLoadMoreConversations,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditValue(conv.title);
    setOpenMenuId(null);
  };

  const handleSubmitRename = () => {
    if (editingId && editValue.trim()) {
      onRenameConversation(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitRename();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
    setOpenMenuId(null);
  };

  const handleNavigation = (view: View) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-warm-900/20 dark:bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ease-soft lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-40 h-full
        flex flex-col transition-all duration-300 ease-spring motion-reduce:transition-none
        w-[85vw] sm:w-[300px]
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isDesktopOpen ? "lg:w-[300px]" : "lg:w-0"}
        pt-6 pb-4 pl-4
      `}
      >
        {/* Floating Card Container */}
        <div className="w-full h-full flex flex-col bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl border-[3px] border-white/50 dark:border-white/5 rounded-[48px] shadow-soft dark:shadow-night overflow-hidden relative animate-pop-in origin-left">
          {/* Logo Area */}
          <div className="h-24 shrink-0 flex items-center justify-between px-6">
            <div
              className="flex items-center gap-3 group cursor-pointer select-none"
              onClick={() => handleNavigation("CHAT")}
            >
              <div className="relative transition-transform duration-200 ease-spring group-hover:scale-[1.02] group-hover:rotate-2 group-active:scale-[0.98]">
                <div className="w-10 h-10 bg-gradient-to-tr from-cheese-400 to-cheese-300 dark:from-starlight-500 dark:to-starlight-600 rounded-[18px] rotate-3 flex items-center justify-center shadow-lg text-white group-hover:shadow-cheese dark:group-hover:shadow-glow transition-shadow duration-200 group-hover:animate-wiggle">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-warm-800 dark:text-white tracking-tight group-hover:text-cheese-600 dark:group-hover:text-starlight-300 transition-colors">
                Mintal
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2.5 text-warm-400 hover:text-warm-600 hover:bg-white/55 rounded-full border border-white/30 transition-all duration-200 ease-spring hover:-translate-y-px active:scale-[0.98]"
            >
              <X size={20} />
            </button>
            {/* Desktop Collapse */}
            <button
              onClick={() => setIsDesktopOpen(false)}
              className="hidden lg:block dark:hidden p-2.5 text-warm-400 dark:text-starlight-300 bg-white/40 hover:bg-cheese-100 dark:hover:bg-white/10 rounded-full border border-white/30 opacity-70 hover:opacity-100 transition-all duration-200 ease-spring hover:-translate-y-px hover:scale-[1.03] active:scale-[0.98]"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <div
            className="px-5 mb-4 animate-slide-up-bouncy"
            style={{ animationDelay: "0.1s" }}
          >
            <button
              onClick={() => {
                onNewChat();
                handleNavigation("CHAT");
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-cheese-100/50 dark:bg-white/5 hover:bg-cheese-100 dark:hover:bg-white/10 border-2 border-dashed border-cheese-300 dark:border-starlight-500/30 rounded-[24px] text-cheese-600 dark:text-starlight-300 font-bold text-sm transition-all duration-200 ease-spring hover:scale-[1.008] hover:-translate-y-px active:scale-[0.99] group shadow-sm hover:shadow-cheese-sm dark:hover:shadow-glow"
            >
              <div className="bg-cheese-400 dark:bg-starlight-500 text-white p-1 rounded-full group-hover:rotate-45 transition-transform duration-200 ease-spring">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span>开启新对话</span>
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-4">
            <div
              className="px-3 pb-1 pt-2 text-xs font-bold text-warm-400 dark:text-slate-500 uppercase tracking-wider animate-slide-up-bouncy"
              style={{ animationDelay: "0.15s" }}
            >
              最近聊天
            </div>

            {isConversationLoading && conversations.length === 0 ? (
              <div className="px-4 py-8 text-center animate-pop-in">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cream-100 dark:bg-white/5 text-cheese-300 dark:text-slate-600 mb-3 animate-float">
                  <MessageCircle
                    size={24}
                    fill="currentColor"
                    className="opacity-50"
                  />
                </div>
                <p className="text-xs text-warm-400 dark:text-slate-500 font-bold">
                  正在加载会话...
                </p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-8 text-center animate-pop-in">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cream-100 dark:bg-white/5 text-cheese-300 dark:text-slate-600 mb-3 animate-float">
                  <MessageCircle
                    size={24}
                    fill="currentColor"
                    className="opacity-50"
                  />
                </div>
                <p className="text-xs text-warm-400 dark:text-slate-500 font-bold">
                  空空如也~
                </p>
              </div>
            ) : (
              conversations.map((conv, idx) => {
                const isActive = activeConversationId === conv.id;
                const isEditing = editingId === conv.id;

                return (
                  <div key={conv.id} className="relative group min-h-[48px]">
                    {isEditing ? (
                      <div className="w-full px-0 animate-pop-in">
                        <input
                          ref={editInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSubmitRename}
                          onKeyDown={handleKeyDown}
                          className="w-full bg-white dark:bg-white/10 border-2 border-transparent focus:border-cheese-400 dark:focus:border-starlight-500 rounded-[20px] px-4 py-3 text-sm text-warm-800 dark:text-white focus:outline-none shadow-soft dark:shadow-none font-medium transition-all"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectConversation(conv.id);
                          handleNavigation("CHAT");
                        }}
                        style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-[20px] text-sm transition-all duration-200 ease-spring text-left relative animate-slide-up-bouncy
                          hover:scale-[1.01] hover:-translate-y-px active:scale-[0.99] hover:shadow-sm
                          ${
                            isActive
                              ? "bg-white dark:bg-white/10 shadow-soft text-cheese-600 dark:text-starlight-300 font-bold scale-[1.01] ring-2 ring-cheese-100/50 dark:ring-white/5"
                              : "text-warm-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5"
                          }
                        `}
                      >
                        <MessageCircle
                          size={18}
                          className={`shrink-0 transition-transform duration-200 ease-spring ${isActive ? "scale-[1.03] fill-current rotate-[-3deg]" : "group-hover:scale-[1.02] group-hover:rotate-2"}`}
                        />
                        <span className="truncate flex-1 font-medium">
                          {conv.title}
                        </span>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === conv.id ? null : conv.id,
                            );
                          }}
                          className={`p-1.5 rounded-full hover:bg-cream-200 dark:hover:bg-white/20 text-warm-400 transition-all duration-200 ease-spring hover:scale-[1.03] active:scale-[0.98] ${isActive || openMenuId === conv.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                          <MoreHorizontal size={16} />
                        </div>
                      </button>
                    )}

                    {/* Context Menu */}
                    {openMenuId === conv.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-10 mt-1 w-32 bg-white/90 dark:bg-night-card/90 backdrop-blur-xl rounded-[20px] shadow-cheese-sm dark:shadow-glow ring-1 ring-cheese-100 dark:ring-white/10 z-50 overflow-hidden animate-pop-in origin-top-right p-1.5"
                      >
                        <button
                          onClick={() => handleStartRename(conv)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-warm-600 dark:text-slate-300 hover:bg-cheese-50 dark:hover:bg-white/10 hover:text-cheese-600 rounded-xl transition-all active:scale-95"
                        >
                          <Edit2 size={12} /> 重命名
                        </button>
                        <button
                          onClick={() => handleDelete(conv.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all mt-1 active:scale-95"
                        >
                          <Trash2 size={12} /> 删除
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {conversationError && (
              <div className="mx-1 mt-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/80 dark:bg-red-900/20 px-3 py-2 text-[11px] font-bold text-red-500 dark:text-red-300 animate-pop-in">
                {conversationError}
              </div>
            )}

            {hasMoreConversations && (
              <button
                onClick={onLoadMoreConversations}
                disabled={isLoadingMoreConversations}
                className="w-full mt-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-warm-500 dark:text-slate-300 border border-cheese-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-200 ease-spring hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed animate-slide-up-bouncy"
              >
                {isLoadingMoreConversations ? "加载中..." : "加载更多"}
              </button>
            )}
          </div>

          {/* User Profile Footer */}
          <div className="p-4 bg-cream-50/50 dark:bg-black/20 backdrop-blur-sm mt-auto">
            <div
              onClick={() => handleNavigation("PROFILE")}
              className="flex items-center gap-3 p-2 rounded-[24px] hover:bg-white dark:hover:bg-white/10 transition-all duration-300 ease-spring cursor-pointer group shadow-sm hover:shadow-cheese-sm dark:hover:shadow-glow border border-transparent hover:border-cheese-100 dark:hover:border-white/5 hover:-translate-y-px hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="relative group-hover:scale-[1.04] transition-transform duration-300 ease-spring">
                <img
                  src={user.avatar}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-white/10 shadow-sm bg-cheese-100 object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-night-card rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-warm-800 dark:text-white truncate group-hover:text-cheese-600 dark:group-hover:text-starlight-300 transition-colors">
                  {user.name}
                </p>
                <p className="text-[10px] text-warm-500 dark:text-slate-400 font-bold bg-cheese-100/50 dark:bg-white/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ✨ Pro Plan
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigation("SETTINGS");
                  }}
                  className="p-2 text-warm-400 dark:text-starlight-300 hover:text-cheese-600 dark:hover:text-starlight-100 hover:bg-cheese-50 dark:hover:bg-white/10 rounded-xl transition-all duration-200 ease-spring hover:scale-[1.04] active:scale-[0.96]"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="p-2 text-warm-400 dark:text-starlight-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 ease-spring hover:scale-[1.04] active:scale-[0.96]"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
