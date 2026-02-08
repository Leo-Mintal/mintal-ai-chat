import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User as UserIcon, Lock, ArrowRight, Sparkles, Heart, Star, Smile, Mail } from 'lucide-react';
import { AuthCredentials } from '../types';

interface AuthProps {
  onLogin: (credentials: AuthCredentials) => Promise<void>;
}

interface FormErrors {
  usernameOrEmail?: string;
  username?: string;
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors: FormErrors = {};

    if (isLogin) {
      if (!usernameOrEmail.trim()) {
        newErrors.usernameOrEmail = '账号或邮箱不能为空';
      }
    } else {
      if (!username.trim()) {
        newErrors.username = '用户名不能为空';
      } else if (username.trim().length < 3) {
        newErrors.username = '用户名至少 3 位';
      }

      if (!email.trim()) {
        newErrors.email = '邮箱不能为空';
      } else if (!EMAIL_REGEX.test(email.trim())) {
        newErrors.email = '邮箱格式不正确';
      }
    }

    if (!password) {
      newErrors.password = '密码也不能忘';
    } else if (isLogin && password.length < 4) {
      newErrors.password = '密码至少 4 位';
    } else if (!isLogin && password.length < 8) {
      newErrors.password = '密码至少 8 位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    const payload: AuthCredentials = isLogin
      ? {
          mode: 'login',
          usernameOrEmail: usernameOrEmail.trim(),
          password,
        }
      : {
          mode: 'register',
          usernameOrEmail: email.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        };

    try {
      await onLogin(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败，请稍后重试';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSubmitError('');
  };

  return (
    <div className="h-screen flex items-start sm:items-center justify-center p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden bg-[#FFFDF5] dark:bg-night-bg transition-colors duration-700">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cheese-200 to-pink-200 dark:from-starlight-500/20 dark:to-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200 to-cheese-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-60 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

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

      <div className="w-full max-w-[420px] perspective-1000 relative z-10 group my-2 sm:my-0">
        <div
          className={`
           relative bg-white/70 dark:bg-night-card/70 backdrop-blur-2xl
           rounded-[36px] sm:rounded-[48px] shadow-[0_20px_50px_-12px_rgba(255,183,77,0.3)] dark:shadow-night
           border-[4px] sm:border-[6px] border-white/50 dark:border-white/5
           max-h-[calc(100dvh-1.5rem)] sm:max-h-none flex flex-col
           overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
           sm:group-hover:scale-[1.02] sm:group-hover:shadow-[0_30px_60px_-12px_rgba(255,183,77,0.4)] dark:sm:group-hover:shadow-glow
        `}
        >
          <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              <div className="relative mb-4 sm:mb-6 group/icon">
                <div className="absolute inset-0 bg-cheese-300 dark:bg-starlight-500 rounded-[32px] blur-xl opacity-40 group-hover/icon:opacity-60 transition-opacity"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cheese-400 to-cheese-500 dark:from-starlight-400 dark:to-starlight-600 rounded-[28px] sm:rounded-[32px] shadow-cheese dark:shadow-glow flex items-center justify-center text-white transform transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover/icon:scale-110 group-hover/icon:rotate-6">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
                </div>
                <div className="absolute -right-2 -top-2 w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-night-card rounded-full flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '2s' }}>
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                </div>
              </div>

              <div className="overflow-hidden">
                <h1 key={isLogin ? 'login' : 'register'} className="text-[2.15rem] sm:text-3xl font-extrabold text-warm-800 dark:text-white tracking-tight mb-2 animate-slide-up-bouncy">
                  {isLogin ? '欢迎回来!' : '创建账号'}
                </h1>
              </div>
              <p className="text-warm-500 dark:text-starlight-200/80 font-bold text-sm tracking-wide">
                {isLogin ? '输入账号后继续你的聊天旅程 ✨' : '注册后会自动登录并进入聊天 🚀'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {isLogin ? (
                <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                  <Input
                    placeholder="用户名或邮箱"
                    label="账号"
                    icon={<UserIcon className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                    value={usernameOrEmail}
                    onChange={e => setUsernameOrEmail(e.target.value)}
                    error={errors.usernameOrEmail}
                    className="rounded-[24px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.03] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 font-bold text-warm-700 py-2.5 sm:py-3"
                  />
                </div>
              ) : (
                <>
                  <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                    <Input
                      placeholder="3 位以上用户名"
                      label="用户名"
                      icon={<UserIcon className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      error={errors.username}
                      className="rounded-[24px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.03] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 font-bold text-warm-700 py-2.5 sm:py-3"
                    />
                  </div>

                  <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      label="邮箱"
                      icon={<Mail className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      error={errors.email}
                      className="rounded-[24px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.03] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 font-bold text-warm-700 py-2.5 sm:py-3"
                    />
                  </div>
                </>
              )}

              <div className="animate-slide-up-bouncy" style={{ animationDelay: isLogin ? '0.2s' : '0.3s' }}>
                <Input
                  type="password"
                  placeholder={isLogin ? "请输入密码" : "至少 8 位密码"}
                  label="密码"
                  icon={<Lock className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  className="rounded-[24px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.03] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-300 font-bold text-warm-700 py-2.5 sm:py-3"
                />
              </div>

              {submitError && (
                <p className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-4 py-3 animate-pop-in">
                  {submitError}
                </p>
              )}

              <div className="animate-slide-up-bouncy pt-1 sm:pt-2" style={{ animationDelay: isLogin ? '0.3s' : '0.4s' }}>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-full shadow-cheese hover:shadow-[0_15px_30px_-5px_rgba(255,167,38,0.5)] dark:shadow-glow dark:hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transform hover:scale-[1.02] active:scale-95 transition-all duration-300 bg-gradient-to-r from-cheese-400 via-cheese-500 to-cheese-600 dark:from-starlight-500 dark:to-blue-600 border-none group-hover:rotate-1"
                >
                  <span className="flex items-center gap-2 font-black tracking-wide">
                    {isLogin ? '登录' : '注册并登录'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                  </span>
                </Button>
              </div>
            </form>

            <div className="mt-6 sm:mt-8 text-center animate-slide-up-bouncy" style={{ animationDelay: isLogin ? '0.4s' : '0.5s' }}>
              <button
                onClick={switchMode}
                className="group relative inline-flex flex-col items-center gap-1 text-sm font-bold text-warm-400 hover:text-cheese-600 dark:text-slate-500 dark:hover:text-starlight-300 transition-colors"
              >
                <span>{isLogin ? '还没有账号？去注册' : '已有账号？去登录'}</span>
                <span className="w-0 h-[3px] bg-cheese-400 dark:bg-starlight-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] font-bold text-warm-300 dark:text-white/20 uppercase tracking-[0.2em]">Mintal Intelligence © 2025</p>
        </div>
      </div>
    </div>
  );
};
