import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, KeyRound, Hash, Lock, Unlock, Activity, RefreshCcw } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { fetchUserQuota, updateUserDailyQuota, UserQuotaSummary } from '../services/adminService';

interface AdminPanelProps {
  onBack: () => void;
  defaultUserId?: string;
  onQuotaUpdated?: (quota: UserQuotaSummary) => void;
}

const ADMIN_GATE_SESSION_KEY = 'mintal_admin_gate_verified';
<<<<<<< HEAD
const DEFAULT_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD || 'liao123...').trim() || 'liao123...';
=======
const DEFAULT_ADMIN_PASSWORD = (import.meta.env?.VITE_ADMIN_PASSWORD || 'liao123...').trim() || 'liao123...';
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)

interface FormErrors {
  password?: string;
  userId?: string;
  dailyLimit?: string;
}

const parsePositiveInteger = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const formatResetTime = (raw?: string): string => {
  if (!raw) {
    return '--';
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, defaultUserId, onQuotaUpdated }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [userIdInput, setUserIdInput] = useState(defaultUserId || '');
  const [dailyLimitInput, setDailyLimitInput] = useState('10');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingQuota, setIsRefreshingQuota] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [quotaSnapshot, setQuotaSnapshot] = useState<UserQuotaSummary | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsVerified(window.sessionStorage.getItem(ADMIN_GATE_SESSION_KEY) === '1');
  }, []);

  useEffect(() => {
    if (defaultUserId && !userIdInput.trim()) {
      setUserIdInput(defaultUserId);
    }
  }, [defaultUserId, userIdInput]);

  const userIdNumber = useMemo(() => parsePositiveInteger(userIdInput), [userIdInput]);
  const dailyLimitNumber = useMemo(() => parsePositiveInteger(dailyLimitInput), [dailyLimitInput]);

  const refreshQuota = useCallback(async (targetUserId: number, silent = false) => {
    if (!silent) {
      setIsRefreshingQuota(true);
    }

    try {
      const latest = await fetchUserQuota(targetUserId);
      setQuotaSnapshot(latest);
      onQuotaUpdated?.(latest);

      if (!silent) {
        setFeedback({ type: 'success', message: `用户 ${targetUserId} 的当日额度已同步` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '额度查询失败，请稍后再试';
      if (!silent) {
        setFeedback({ type: 'error', message });
      }
    } finally {
      if (!silent) {
        setIsRefreshingQuota(false);
      }
    }
  }, [onQuotaUpdated]);

  useEffect(() => {
    if (!isVerified || !userIdNumber) {
      return;
    }

    let cancelled = false;

    const syncQuota = async (silent = true) => {
      try {
        const latest = await fetchUserQuota(userIdNumber);
        if (!cancelled) {
          setQuotaSnapshot(latest);
          onQuotaUpdated?.(latest);
        }
      } catch {
        // 静默轮询失败时不打断用户操作
      }
    };

    void syncQuota(true);

    const timer = window.setInterval(() => {
      void syncQuota(true);
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isVerified, userIdNumber, onQuotaUpdated]);

  const handleVerifyPassword = () => {
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: '请输入管理员密码' }));
      return;
    }

    if (password.trim() !== DEFAULT_ADMIN_PASSWORD) {
      setErrors(prev => ({ ...prev, password: '管理员密码不正确，请重试' }));
      setFeedback(null);
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ADMIN_GATE_SESSION_KEY, '1');
    }

    setErrors({});
    setPassword('');
    setIsVerified(true);
    setFeedback({ type: 'success', message: '验证成功，已进入用量管理面板' });
  };

  const validateUpdateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!userIdNumber) {
      nextErrors.userId = '请输入有效的用户 ID（正整数）';
    }

    if (!dailyLimitNumber) {
      nextErrors.dailyLimit = '请输入有效的每日额度（大于 0）';
    }

<<<<<<< HEAD
    setErrors(prev => ({
      ...prev,
=======
    setErrors(prev => ({ ...prev,
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
      userId: nextErrors.userId,
      dailyLimit: nextErrors.dailyLimit,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleUpdateQuota = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateUpdateForm() || !userIdNumber || !dailyLimitNumber) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await updateUserDailyQuota({
        userId: userIdNumber,
        dailyLimit: dailyLimitNumber,
      });

      const latest = await fetchUserQuota(userIdNumber);
      setQuotaSnapshot(latest);
      onQuotaUpdated?.(latest);

      setFeedback({
        type: 'success',
        message: `用户 ${userIdNumber} 每日额度已更新为 ${dailyLimitNumber}`,
      });
      setErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新失败，请稍后重试';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLockPanel = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_GATE_SESSION_KEY);
    }

    setIsVerified(false);
    setPassword('');
    setErrors({});
    setFeedback(null);
    setQuotaSnapshot(null);
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-cream-50/50 dark:bg-transparent animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-night-card/60 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-starlight-300 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95"
=======
    <div className="flex flex-col h-full bg-cream-50/50 dark:bg-transparent animate-pop-in overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-night-card/60 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-starlight-300 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 rounded-xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-110 active:scale-90 shadow-sm"
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
        >
          <ArrowLeft size={20} />
        </button>
        <div>
<<<<<<< HEAD
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">用量管理</h2>
=======
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">用量管理</h2>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
          <p className="text-xs text-slate-500 dark:text-slate-400">更新指定用户的每日调用额度</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full p-6 sm:p-8">
<<<<<<< HEAD
        <div className="bg-white/70 dark:bg-night-card/60 backdrop-blur-md border-[2px] border-white dark:border-white/10 rounded-[40px] p-6 sm:p-8 shadow-soft dark:shadow-night animate-slide-up space-y-6">
=======
        <div className="bg-white/70 dark:bg-night-card/60 backdrop-blur-md border-[2px] border-white dark:border-white/10 rounded-[40px] p-6 sm:p-8 shadow-soft dark:shadow-night animate-slide-up-bouncy space-y-6">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
          {!isVerified ? (
            <>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-warm-800 dark:text-white flex items-center gap-2">
<<<<<<< HEAD
                  <Lock size={18} className="text-cheese-500 dark:text-starlight-400" />
=======
                  <div className="p-1.5 bg-cheese-100 dark:bg-white/10 rounded-lg">
                    <Lock size={18} className="text-cheese-500 dark:text-starlight-400" />
                  </div>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                  请输入管理员密码
                </h3>
                <p className="text-sm text-warm-500 dark:text-slate-400">
                  通过校验后才能进入用量管理页面。
                </p>
              </div>

<<<<<<< HEAD
              <Input
                label="管理员密码"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors(prev => ({ ...prev, password: undefined }));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleVerifyPassword();
                  }
                }}
                icon={<KeyRound size={18} />}
                error={errors.password}
                placeholder="请输入管理员密码"
                className="h-14 rounded-[24px]"
              />

              <Button onClick={handleVerifyPassword} className="w-full h-12 rounded-full text-base">
                验证并进入
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold text-warm-800 dark:text-white flex items-center gap-2">
                    <Unlock size={18} className="text-cheese-500 dark:text-starlight-400" />
                    每日额度配置
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleLockPanel} className="rounded-full">
=======
              <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
                <Input
                  label="管理员密码"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleVerifyPassword();
                    }
                  }}
                  icon={<KeyRound size={18} />}
                  error={errors.password}
                  placeholder="请输入管理员密码"
                  className="h-14 rounded-[24px] transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
                <Button onClick={handleVerifyPassword} className="w-full h-12 rounded-full text-base hover:scale-[1.02] active:scale-95 transition-all duration-300">
                  验证并进入
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 animate-pop-in">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold text-warm-800 dark:text-white flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-white/10 rounded-lg">
                      <Unlock size={18} className="text-green-500 dark:text-green-400" />
                    </div>
                    每日额度配置
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleLockPanel} className="rounded-full hover:scale-105 active:scale-95 transition-all">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                    重新上锁
                  </Button>
                </div>
                <p className="text-sm text-warm-500 dark:text-slate-400">
                  提交后将调用 PUT /api/v1/llm/quota，按 user_id 更新 daily_limit。
                </p>
              </div>

<<<<<<< HEAD
              <div className="rounded-[28px] border border-white/70 dark:border-white/10 bg-white/60 dark:bg-night-surface/60 backdrop-blur-sm p-4 space-y-3">
=======
              <div className="rounded-[28px] border border-white/70 dark:border-white/10 bg-white/60 dark:bg-night-surface/60 backdrop-blur-sm p-4 space-y-3 animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-warm-500 dark:text-slate-300 flex items-center gap-2">
                    <Activity size={14} className="text-cheese-500 dark:text-starlight-400" />
                    当前额度状态
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (userIdNumber && !isRefreshingQuota) {
                        void refreshQuota(userIdNumber, false);
                      }
                    }}
<<<<<<< HEAD
                    className="inline-flex items-center gap-1 text-xs font-bold text-warm-500 dark:text-slate-300 hover:text-cheese-600 dark:hover:text-starlight-200 transition-colors disabled:opacity-50"
=======
                    className="inline-flex items-center gap-1 text-xs font-bold text-warm-500 dark:text-slate-300 hover:text-cheese-600 dark:hover:text-starlight-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                    disabled={!userIdNumber || isRefreshingQuota}
                  >
                    <RefreshCcw size={12} className={isRefreshingQuota ? 'animate-spin' : ''} />
                    刷新
                  </button>
                </div>

                {quotaSnapshot && (!userIdNumber || quotaSnapshot.userId === userIdNumber) ? (
<<<<<<< HEAD
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2">
                      <p className="text-warm-400 dark:text-slate-400">总额度</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{quotaSnapshot.quotaLimit}</p>
                    </div>
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2">
                      <p className="text-warm-400 dark:text-slate-400">已使用</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{quotaSnapshot.quotaUsed}</p>
                    </div>
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2">
                      <p className="text-warm-400 dark:text-slate-400">剩余</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{quotaSnapshot.quotaRemaining}</p>
                    </div>
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2">
=======
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-pop-in">
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2 hover:scale-105 transition-transform duration-300">
                      <p className="text-warm-400 dark:text-slate-400">总额度</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{quotaSnapshot.quotaLimit}</p>
                    </div>
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2 hover:scale-105 transition-transform duration-300">
                      <p className="text-warm-400 dark:text-slate-400">已使用</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{quotaSnapshot.quotaUsed}</p>
                    </div>
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2 hover:scale-105 transition-transform duration-300">
                      <p className="text-warm-400 dark:text-slate-400">剩余</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{quotaSnapshot.quotaRemaining}</p>
                    </div>
                    <div className="rounded-2xl bg-cream-50/80 dark:bg-black/20 border border-cheese-100 dark:border-white/10 px-3 py-2 hover:scale-105 transition-transform duration-300">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                      <p className="text-warm-400 dark:text-slate-400">重置时间</p>
                      <p className="text-sm font-extrabold text-warm-700 dark:text-white mt-1">{formatResetTime(quotaSnapshot.quotaResetAt)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-warm-500 dark:text-slate-400">输入用户 ID 后点击刷新，可查看当前额度使用情况。</p>
                )}
              </div>

              <form className="space-y-5" onSubmit={handleUpdateQuota}>
<<<<<<< HEAD
                <Input
                  label="用户 ID"
                  value={userIdInput}
                  onChange={(event) => {
                    setUserIdInput(event.target.value);
                    setErrors(prev => ({ ...prev, userId: undefined }));
                  }}
                  icon={<Hash size={18} />}
                  error={errors.userId}
                  placeholder="请输入 user_id"
                  className="h-14 rounded-[24px]"
                />

                <Input
                  label="每日额度"
                  type="number"
                  min={1}
                  step={1}
                  value={dailyLimitInput}
                  onChange={(event) => {
                    setDailyLimitInput(event.target.value);
                    setErrors(prev => ({ ...prev, dailyLimit: undefined }));
                  }}
                  icon={<Hash size={18} />}
                  error={errors.dailyLimit}
                  placeholder="例如 25"
                  className="h-14 rounded-[24px]"
                />

                <Button type="submit" loading={isSubmitting} className="w-full h-12 rounded-full text-base">
                  更新每日额度
                </Button>
=======
                <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
                  <Input
                    label="用户 ID"
                    value={userIdInput}
                    onChange={(event) => {
                      setUserIdInput(event.target.value);
                      setErrors(prev => ({ ...prev, userId: undefined }));
                    }}
                    icon={<Hash size={18} />}
                    error={errors.userId}
                    placeholder="请输入 user_id"
                    className="h-14 rounded-[24px] transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>

                <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.3s' }}>
                  <Input
                    label="每日额度"
                    type="number"
                    min={1}
                    step={1}
                    value={dailyLimitInput}
                    onChange={(event) => {
                      setDailyLimitInput(event.target.value);
                      setErrors(prev => ({ ...prev, dailyLimit: undefined }));
                    }}
                    icon={<Hash size={18} />}
                    error={errors.dailyLimit}
                    placeholder="例如 25"
                    className="h-14 rounded-[24px] transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>

                <div className="animate-slide-up-bouncy" style={{ animationDelay: '0.4s' }}>
                  <Button type="submit" loading={isSubmitting} className="w-full h-12 rounded-full text-base hover:scale-[1.02] active:scale-95 transition-all duration-300">
                    更新每日额度
                  </Button>
                </div>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
              </form>
            </>
          )}

          {feedback && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-bold animate-pop-in ${
                feedback.type === 'success'
                  ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                  : 'bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
