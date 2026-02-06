import React, { useState, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, Camera, Save, RefreshCw, Mail } from 'lucide-react';
import { User } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onBack }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(user.name);
    setAvatar(user.avatar || '');
  }, [user]);

  const handleSave = () => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      onUpdateUser({ ...user, name, avatar });
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 800);
  };

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e0f2fe,bae6fd,7dd3fc`;
    setAvatar(newAvatar);
  };

  return (
    <div className="flex flex-col h-full bg-cream-50/50 dark:bg-transparent animate-fade-in overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-night-card/60 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-starlight-300 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">个人资料</h2>
      </div>

      <div className="max-w-xl mx-auto w-full p-6 sm:p-10">
        
        <div className="bg-white/70 dark:bg-night-card/60 backdrop-blur-md border-[2px] border-white dark:border-white/10 rounded-[48px] p-10 shadow-soft dark:shadow-night animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer" onClick={handleRandomizeAvatar}>
              <div className="w-32 h-32 rounded-full border-[6px] border-white dark:border-white/10 shadow-xl overflow-hidden bg-slate-100 dark:bg-night-surface relative ring-1 ring-slate-100 dark:ring-white/5 transition-transform duration-300 hover:scale-105">
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                   <RefreshCw className="text-white drop-shadow-md animate-spin-slow" size={32} />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-cheese-500 dark:bg-starlight-500 text-white p-2.5 rounded-full shadow-lg border-4 border-white dark:border-night-card transform transition-transform group-hover:scale-110 group-hover:rotate-12 group-hover:bg-cheese-400">
                <Camera size={18} />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-starlight-300/70 mt-4 bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">点击头像随机生成新形象</p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            <div className="animate-slide-up-stagger" style={{ animationDelay: '0.2s' }}>
              <Input 
                label="昵称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon size={18} />}
                placeholder="请输入您的昵称"
                className="rounded-[24px] dark:bg-night-surface dark:border-white/5 dark:focus:border-starlight-500 h-14"
              />
            </div>
            
            <div className="animate-slide-up-stagger" style={{ animationDelay: '0.3s' }}>
              <Input 
                label="邮箱"
                value={user.email}
                disabled
                icon={<Mail size={18} />}
                className="rounded-[24px] bg-slate-50/50 dark:bg-night-surface/50 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-white/5 cursor-not-allowed opacity-70 h-14"
              />
            </div>

            <div className="pt-4 flex gap-3 animate-slide-up-stagger" style={{ animationDelay: '0.4s' }}>
              <Button 
                onClick={handleSave} 
                loading={isLoading}
                disabled={!name.trim() || (name === user.name && avatar === user.avatar)}
                className={`w-full h-14 flex items-center justify-center gap-2 text-lg rounded-full shadow-cheese hover:shadow-cheese dark:shadow-glow hover:scale-[1.02] transition-all duration-300 ${isSaved ? 'bg-green-500 hover:bg-green-600 border-green-500' : ''}`}
              >
                {isSaved ? '已保存' : '保存更改'}
                {isSaved ? <CheckIcon className="w-5 h-5" /> : <Save size={20} />}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper for check icon
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);