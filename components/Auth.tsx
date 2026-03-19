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
    <div className="min-h-screen flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 relative overflow-y-auto overflow-x-hidden bg-[#FFFDF5] dark:bg-night-bg transition-colors duration-300">
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

      <div className="w-full max-w-[398px] perspective-1000 relative z-10 group my-auto">
        <div
          className={`
           relative bg-white/70 dark:bg-night-card/70 backdrop-blur-2xl
           rounded-[32px] sm:rounded-[40px] shadow-[0_18px_46px_-14px_rgba(255,183,77,0.26)] dark:shadow-night
           border-[3px] sm:border-[4px] border-white/50 dark:border-white/5
           max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col
           overflow-hidden transition-all duration-300 ease-spring
           sm:group-hover:scale-[1.008] sm:group-hover:shadow-[0_24px_54px_-16px_rgba(255,183,77,0.32)] dark:sm:group-hover:shadow-glow
        `}
        >
          <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
              <div className="relative mb-3.5 sm:mb-5 group/icon">
                <div className="absolute inset-0 bg-cheese-300 dark:bg-starlight-500 rounded-[28px] blur-xl opacity-35 group-hover/icon:opacity-50 transition-opacity duration-200"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cheese-400 to-cheese-500 dark:from-starlight-400 dark:to-starlight-600 rounded-[24px] sm:rounded-[28px] shadow-cheese dark:shadow-glow flex items-center justify-center text-white transition-transform duration-200 ease-spring group-hover/icon:scale-[1.02] group-hover/icon:rotate-2">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                </div>
                <div className="absolute -right-1.5 -top-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-white dark:bg-night-card rounded-full flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '2.4s' }}>
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                </div>
              </div>

              <div className="overflow-hidden">
                <h1 key={isLogin ? 'login' : 'register'} className="text-[1.85rem] sm:text-[2.35rem] font-extrabold text-warm-800 dark:text-white tracking-tight mb-1.5 animate-slide-up-bouncy">
                  {isLogin ? '欢迎回来!' : '创建账号'}
                </h1>
              </div>
              <p className="text-warm-500 dark:text-starlight-200/80 font-bold text-[13px] sm:text-sm leading-5 tracking-wide">
                {isLogin ? '输入账号后继续你的聊天旅程 ✨' : '注册后会自动登录并进入聊天 🚀'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {isLogin ? (
                <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                  <Input
                    placeholder="用户名或邮箱"
                    label="账号"
                    icon={<UserIcon className="w-5 h-5 text-cheese-500 dark:text-starlight-400" />}
                    value={usernameOrEmail}
                    onChange={e => setUsernameOrEmail(e.target.value)}
                    error={errors.usernameOrEmail}
                    className="rounded-[22px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.01] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-200 font-bold text-warm-700 py-2.5"
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
                      className="rounded-[22px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.01] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-200 font-bold text-warm-700 py-2.5"
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
                      className="rounded-[22px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.01] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-200 font-bold text-warm-700 py-2.5"
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
                  className="rounded-[22px] border-transparent bg-white/60 dark:bg-black/20 focus:bg-white dark:focus:bg-night-surface focus:scale-[1.01] focus:shadow-cheese-sm dark:focus:shadow-glow transition-all duration-200 font-bold text-warm-700 py-2.5"
                />
              </div>

              {submitError && (
                <p className="text-xs sm:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-3.5 py-2.5 animate-pop-in">
                  {submitError}
                </p>
              )}

              <div className="animate-slide-up-bouncy pt-1 sm:pt-2" style={{ animationDelay: isLogin ? '0.3s' : '0.4s' }}>
                <Button
                  type="submit"
                  loading={loading}
                  className="group w-full h-11 sm:h-12 text-sm sm:text-base rounded-full shadow-cheese hover:shadow-[0_12px_24px_-6px_rgba(255,167,38,0.42)] dark:shadow-glow dark:hover:shadow-[0_0_24px_rgba(14,165,233,0.48)] hover:scale-[1.01] transition-all duration-200 bg-gradient-to-r from-cheese-400 via-cheese-500 to-cheese-600 dark:from-starlight-500 dark:to-blue-600 border-none"
                >
                  <span className="flex items-center gap-2 font-black tracking-wide">
                    {isLogin ? '登录' : '注册并登录'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={3} />}
                  </span>
                </Button>
              </div>
            </form>

            <div className="mt-5 sm:mt-6 text-center animate-slide-up-bouncy" style={{ animationDelay: isLogin ? '0.4s' : '0.5s' }}>
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

        <div className="mt-3 text-center">
          <p className="text-[10px] font-bold text-warm-300 dark:text-white/20 uppercase tracking-[0.2em]">Mintal Intelligence © 2025</p>
        </div>
      </div>
    </div>
  );
};
