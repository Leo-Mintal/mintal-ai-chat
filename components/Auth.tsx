import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User as UserIcon, Lock, ArrowRight, Sparkles, Heart, Star, Smile } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{username?: string, password?: string}>({});

  const validate = () => {
    const newErrors: {username?: string, password?: string} = {};
    if (!username.trim()) newErrors.username = '名字是必填的哦';
    if (!password) newErrors.password = '密码也不能忘';
    else if (password.length < 4) newErrors.password = '密码太短啦，多写点';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: Date.now().toString(),
        name: username,
        email: `${username}@mintal.ai`,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}&backgroundColor=FFD54F,FFB74D,FF8A65`
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#FFFDF5] dark:bg-night-bg transition-colors duration-700">

      {/* 动态背景光斑 - Soft Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cheese-200 to-pink-200 dark:from-starlight-500/20 dark:to-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200 to-cheese-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* 漂浮装饰元素 - Floating Cute Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-[15%] left-[10%] text-cheese-300 dark:text-starlight-500/30 animate-bounce-soft" style={{ animationDelay: '0s' }}>
            <Star size={48} fill="currentColor" className="drop-shadow-sm rotate-12" />
         </div>
         <div className="absolute bottom-[20%] left-[15%] text-pink-300 dark:text-pink-500/30 animate-bounce-soft" style={{ animationDelay: '1.5s' }}>
            <Heart size={36} fill="currentColor" className="drop-shadow-sm -rotate-12" />
         </div>
         <div className="absolute top-[25%] right-[15%] text-cyan-300 dark:text-cyan-500/30 animate-bounce-soft" style={{ animationDelay: '0.8s' }}>
            <Smile size={42} strokeWidth={2.5} className="drop-shadow-sm rotate-6" />
         </div>
      </div>

      {/* 主卡片 - Main Jelly Card */}
      <div className="w-full max-w-[420px] perspective-1000 relative z-10 group">
        <div className={`
           relative bg-white/70 dark:bg-night-card/70 backdrop-blur-2xl
           rounded-[48px] shadow-[0_20px_50px_-12px_rgba(255,183,77,0.3)] dark:shadow-night
           border-[6px] border-white/50 dark:border-white/5
           overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
           group-hover:scale-[1.02] group-hover:shadow-[0_30px_60px_-12px_rgba(255,183,77,0.4)] dark:group-hover:shadow-glow
        `}>

          <div className="p-8 sm:p-10">
            {/* 头部动画图标 */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6 group/icon">
                <div className="absolute inset-0 bg-cheese-300 dark:bg-starlight-500 rounded-[32px] blur-xl opacity-40 group-hover/icon:opacity-60 transition-opacity"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-cheese-400 to-cheese-500 dark:from-starlight-400 dark:to-starlight-600 rounded-[32px] shadow-cheese dark:shadow-glow flex items-center justify-center text-white transform transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover/icon:scale-110 group-hover/icon:rotate-6">
                  <Sparkles className="w-12 h-12 animate-pulse" />
                </div>
                <div className="absolute -right-2 -top-2 w-8 h-8 bg-white dark:bg-night-card rounded-full flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '2s' }}>
                   <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                </div>
              </div>

              <div className="overflow-hidden">
                <h1 key={isLogin ? 'login' : 'register'} className="text-3xl font-extrabold text-warm-800 dark:text-white tracking-tight mb-2 animate-slide-up-bouncy">
                  {isLogin ? '欢迎回来!' : '加入我们'}
                </h1>
              </div>
              <p className="text-warm-500 dark:text-starlight-200/80 font-bold text-sm tracking-wide">
                {isLogin ? '今天也要元气满满哦 ✨' : '开启你的奇妙 AI 之旅 🚀'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                <Input
                  placeholder="怎么称呼你呢？"
                  label="昵称"
                  icon={<UserIcon className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  error={errors.username}
                  className="rounded-[24px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.03] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 font-bold text-warm-700"
                />
              </div>

              <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
                <Input
                  type="password"
                  placeholder="••••••••"
                  label="密码"
                  icon={<Lock className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  className="rounded-[24px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.03] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 font-bold text-warm-700"
                />
              </div>

              <div className="animate-slide-up-bouncy pt-2" style={{ animationDelay: '0.3s' }}>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-14 text-lg rounded-full shadow-cheese hover:shadow-[0_15px_30px_-5px_rgba(255,167,38,0.5)] dark:shadow-glow dark:hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transform hover:scale-[1.03] active:scale-95 transition-all duration-300 bg-gradient-to-r from-cheese-400 via-cheese-500 to-cheese-600 dark:from-starlight-500 dark:to-blue-600 border-none group-hover:rotate-1"
                >
                  <span className="flex items-center gap-2 font-black tracking-wide">
                    {isLogin ? '出发！' : '注册'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                  </span>
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center animate-slide-up-bouncy" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                className="group relative inline-flex flex-col items-center gap-1 text-sm font-bold text-warm-400 hover:text-cheese-600 dark:text-slate-500 dark:hover:text-starlight-300 transition-colors"
              >
                <span>{isLogin ? "还没有账号？去注册" : "已有账号？去登录"}</span>
                <span className="w-0 h-[3px] bg-cheese-400 dark:bg-starlight-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-[10px] font-bold text-warm-300 dark:text-white/20 uppercase tracking-[0.2em]">Mintal Intelligence © 2025</p>
        </div>
      </div>
    </div>
  );
};