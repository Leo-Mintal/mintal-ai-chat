import React, { useState, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, Save, Mail } from 'lucide-react';
import { User } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ProfileProps {
  user: User;
  onUpdateUser: (payload: { name: string; email: string }) => Promise<void>;
  onBack: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onBack }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const validate = () => {
    if (!name.trim()) {
      setError('用户名不能为空');
      return false;
    }

    if (!email.trim()) {
      setError('邮箱不能为空');
      return false;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('邮箱格式不正确');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onUpdateUser({
        name: name.trim(),
        email: email.trim(),
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : '资料更新失败，请稍后重试';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarSrc = user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name || 'mintal')}&backgroundColor=FFD54F,FFB74D,FF8A65`;

  return (
    <div className="flex flex-col h-full bg-cream-50/50 dark:bg-transparent animate-fade-in overflow-y-auto custom-scrollbar">
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
          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 rounded-full border-[6px] border-white dark:border-white/10 shadow-xl overflow-hidden bg-slate-100 dark:bg-night-surface ring-1 ring-slate-100 dark:ring-white/5">
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-starlight-300/70 mt-4 bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
              当前头像由后端资料返回，后续可继续扩展头像修改接口
            </p>
          </div>

          <div className="space-y-8">
            <div className="animate-slide-up-stagger" style={{ animationDelay: '0.2s' }}>
              <Input
                label="用户名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon size={18} />}
                placeholder="请输入用户名"
                className="rounded-[24px] dark:bg-night-surface dark:border-white/5 dark:focus:border-starlight-500 h-14"
              />
            </div>

            <div className="animate-slide-up-stagger" style={{ animationDelay: '0.3s' }}>
              <Input
                label="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                placeholder="请输入邮箱"
                className="rounded-[24px] dark:bg-night-surface dark:border-white/5 dark:focus:border-starlight-500 h-14"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-4 py-3 animate-pop-in">
                {error}
              </p>
            )}

            <div className="pt-4 flex gap-3 animate-slide-up-stagger" style={{ animationDelay: '0.4s' }}>
              <Button
                onClick={handleSave}
                loading={isLoading}
                disabled={
                  !name.trim() ||
                  !email.trim() ||
                  (name.trim() === user.name && email.trim() === user.email)
                }
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

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
