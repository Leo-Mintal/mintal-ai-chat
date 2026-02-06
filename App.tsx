import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { Select } from './components/ui/Select';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { User, Message, Conversation, AppState, Attachment, View, Theme } from './types';
import { AVAILABLE_MODELS } from './constants';
import { generateChatResponse } from './services/aiService';
import { Menu, AlertTriangle, Trash2, PanelLeftOpen, Star, Heart, Smile } from 'lucide-react';

// Star & Blob Background (Unified with Auth)
const UnifiedBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.7 + 0.3
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
       {/* Soft Gradient Blobs (Matches Auth) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cheese-200 to-pink-200 dark:from-starlight-500/10 dark:to-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200 to-cheese-100 dark:from-blue-900/10 dark:to-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float" style={{ animationDelay: '3s' }}></div>

      {/* Floating Cute Elements (Subtle) */}
      <div className="absolute top-[10%] right-[20%] text-cheese-200 dark:text-starlight-500/10 animate-bounce-soft opacity-40">
        <Star size={32} fill="currentColor" className="rotate-12" />
      </div>
      <div className="absolute bottom-[15%] left-[5%] text-pink-200 dark:text-pink-500/10 animate-bounce-soft opacity-40" style={{ animationDelay: '2s' }}>
        <Heart size={24} fill="currentColor" className="-rotate-12" />
      </div>

      {/* Twinkling Stars for Dark Mode */}
      <div className="opacity-0 dark:opacity-100 transition-opacity duration-1000">
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
              opacity: star.opacity
            }}
          />
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [currentView, setCurrentView] = useState<View>('CHAT');
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [currentModel, setCurrentModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [theme, setTheme] = useState<Theme>('system');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<'none' | 'confirm_delete'>('none');

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      if (theme === 'dark') root.classList.add('dark');
      else if (theme === 'light') root.classList.remove('dark');
      else mediaQuery.matches ? root.classList.add('dark') : root.classList.remove('dark');
    };
    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const startNewChat = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = { id: newId, title: '新对话', updatedAt: Date.now(), preview: '开始新的聊天...' };
    setConversations(prev => [newConv, ...prev]);
    setMessages(prev => ({ ...prev, [newId]: [] }));
    setActiveConvId(newId);
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setMessages(prev => { const newMsgs = { ...prev }; delete newMsgs[id]; return newMsgs; });
    if (activeConvId === id) setActiveConvId(null);
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setAppState(AppState.CHAT);
    setCurrentView('CHAT');
    startNewChat();
  };

  const triggerAIResponse = async (chatId: string, history: Message[], userMessage: string, attachments: Attachment[]) => {
    setLoading(true);
    const loadingDelay = new Promise<void>((resolve) => {
      setTimeout(resolve, 2000);
    });

    try {
      const responseText = await generateChatResponse(currentModel, history, userMessage, attachments);
      await loadingDelay;
      setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), {
        id: (Date.now() + 1).toString(), role: 'model', content: responseText, timestamp: Date.now()
      }] }));
    } catch (error: any) {
      await loadingDelay;
      setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), {
        id: (Date.now() + 1).toString(), role: 'model', content: "哎呀，出了一点小问题，稍后再试一下吧。", timestamp: Date.now(), isError: true
      }] }));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    let chatId = activeConvId;
    if (!chatId) {
      chatId = Date.now().toString();
      const newConv: Conversation = { id: chatId, title: text.slice(0, 10) + '...', updatedAt: Date.now(), preview: text.slice(0, 40) };
      setConversations(prev => [newConv, ...prev]);
      setMessages(prev => ({ ...prev, [chatId!]: [] }));
      setActiveConvId(chatId);
    }
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now(), attachments };
    setMessages(prev => ({ ...prev, [chatId!]: [...(prev[chatId!] || []), userMsg] }));
    if (activeConvId && chatId === activeConvId && messages[chatId!]?.length === 0) {
      setConversations(prev => prev.map(c => c.id === chatId ? { ...c, title: text.slice(0, 10) } : c));
    }
    await triggerAIResponse(chatId!, attachments.length > 0 ? [] : (messages[chatId!] || []), text, attachments);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeConvId) return;
    const currentMsgs = messages[activeConvId];
    const msgIndex = currentMsgs.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const oldMsg = currentMsgs[msgIndex];
    const updatedMsg: Message = { ...oldMsg, content: newContent, timestamp: Date.now() };
    const historyBefore = currentMsgs.slice(0, msgIndex);
    setMessages(prev => ({ ...prev, [activeConvId]: [...historyBefore, updatedMsg] }));
    await triggerAIResponse(activeConvId, historyBefore, newContent, updatedMsg.attachments || []);
  };

  if (appState === AppState.AUTH) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#FFFDF5] dark:bg-night-bg font-sans overflow-hidden relative transition-colors duration-700">
      <UnifiedBackground />

      <Sidebar
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen} setIsDesktopOpen={setIsDesktopSidebarOpen}
        conversations={conversations} activeConversationId={activeConvId}
        onSelectConversation={setActiveConvId} onNewChat={startNewChat}
        onDeleteConversation={handleDeleteConversation} onRenameConversation={handleRenameConversation}
        onNavigate={setCurrentView} user={user!} onLogout={() => setAppState(AppState.AUTH)}
      />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 p-4 gap-4 h-full">
        {currentView === 'CHAT' && (
          // Main Chat Container
          <div className="flex-1 flex flex-col h-full bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl rounded-[48px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-night border-[3px] border-white/50 dark:border-white/5 overflow-hidden relative animate-pop-in origin-center group transition-all duration-500">

            {/* Header with Frosted Glass Buttons */}
            <header className="h-20 flex items-center justify-between px-6 z-20 shrink-0">
              <div className="flex items-center gap-4">

                {/* Mobile Menu Button - Frosted Glass */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-3 text-warm-600 dark:text-starlight-300 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[20px] shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:shadow-cheese-sm dark:hover:shadow-glow hover:bg-white/60"
                >
                  <Menu size={20} strokeWidth={2.5} />
                </button>

                {/* Desktop Expand Button - Frosted Glass */}
                {!isDesktopSidebarOpen && (
                  <button
                    onClick={() => setIsDesktopSidebarOpen(true)}
                    className="hidden lg:flex p-3 text-warm-600 dark:text-starlight-300 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[20px] shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:shadow-cheese-sm dark:hover:shadow-glow hover:bg-white/60"
                  >
                    <PanelLeftOpen size={20} strokeWidth={2.5} />
                  </button>
                )}

                <div className="w-56">
                  <Select options={AVAILABLE_MODELS} value={currentModel} onChange={setCurrentModel} placeholder="选择模型" />
                </div>
              </div>

              {/* Trash Button - Frosted Glass */}
              <button
                 onClick={() => setModalOpen('confirm_delete')}
                 disabled={!activeConvId || !messages[activeConvId]?.length}
                 className="p-3 text-warm-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-[20px] shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
            </header>

            <div className="flex-1 overflow-hidden relative">
              <ChatArea
                messages={activeConvId ? messages[activeConvId] || [] : []}
                isLoading={loading}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                user={user}
              />
            </div>
          </div>
        )}

        {currentView === 'SETTINGS' && (
           <div className="flex-1 bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl rounded-[48px] shadow-soft dark:shadow-night border-[3px] border-white/50 dark:border-white/5 overflow-hidden animate-pop-in"><Settings onBack={() => setCurrentView('CHAT')} theme={theme} setTheme={setTheme} /></div>
        )}

        {currentView === 'PROFILE' && user && (
           <div className="flex-1 bg-white/60 dark:bg-night-card/60 backdrop-blur-2xl rounded-[48px] shadow-soft dark:shadow-night border-[3px] border-white/50 dark:border-white/5 overflow-hidden animate-pop-in"><Profile user={user} onUpdateUser={setUser} onBack={() => setCurrentView('CHAT')} /></div>
        )}
      </main>

      <Modal isOpen={modalOpen === 'confirm_delete'} onClose={() => setModalOpen('none')} title="清空记忆？" footer={
        <>
          <Button variant="ghost" onClick={() => setModalOpen('none')}>点错了</Button>
          <Button variant="danger" onClick={() => { if(activeConvId) setMessages(prev => ({...prev, [activeConvId]: []})); setModalOpen('none'); }}>确认清空</Button>
        </>
      }>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-500 rounded-[20px]"><AlertTriangle size={28} /></div>
          <div><h4 className="font-bold text-warm-800 dark:text-white text-lg">真的要忘掉这些吗？</h4><p className="text-warm-500 dark:text-slate-400">删除后就找不回这段对话了哦。</p></div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
