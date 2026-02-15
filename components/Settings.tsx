import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, Monitor, Bell, Shield, Laptop, Gauge } from 'lucide-react';
import { Theme } from '../types';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';

interface SettingsProps {
  onBack: () => void;
  onNavigateToUsageManagement: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  aiBubbleEnabled: boolean;
  setAiBubbleEnabled: (enabled: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onBack,
  onNavigateToUsageManagement,
  theme,
  setTheme,
  aiBubbleEnabled,
  setAiBubbleEnabled,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-transparent animate-fade-in overflow-y-auto custom-scrollbar">
=======
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-transparent animate-pop-in overflow-y-auto custom-scrollbar">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-night-card/60 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <button 
          onClick={onBack}
<<<<<<< HEAD
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-starlight-100 hover:bg-white/80 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-starlight-100">设置</h2>
=======
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-starlight-100 hover:bg-white/80 dark:hover:bg-white/10 rounded-xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-110 active:scale-90 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-starlight-100 tracking-tight">设置</h2>
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
      </div>

      <div className="max-w-2xl mx-auto w-full p-6 sm:p-8 space-y-8">
        
        {/* Appearance Section */}
<<<<<<< HEAD
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
            <Laptop size={14} className="text-cheese-500 dark:text-starlight-500" /> 样式配置
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300">
=======
        <section className="animate-slide-up-bouncy" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2 group">
            <div className="p-1.5 bg-cheese-100 dark:bg-white/10 rounded-lg group-hover:rotate-12 transition-transform duration-300">
               <Laptop size={14} className="text-cheese-500 dark:text-starlight-500" />
            </div>
            样式配置
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-[1.01]">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">主题模式</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">选择最适合您的界面风格</div>
              </div>
<<<<<<< HEAD
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-black/20 p-1.5 rounded-2xl border border-white/50 dark:border-white/5">
=======
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-black/20 p-1.5 rounded-[20px] border border-white/50 dark:border-white/5">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                {[
                  { value: 'light', icon: Sun, label: '浅色' },
                  { value: 'system', icon: Monitor, label: '自动' },
                  { value: 'dark', icon: Moon, label: '深色' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as Theme)}
                    className={`
<<<<<<< HEAD
                      flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                      ${theme === option.value 
                        ? 'bg-white dark:bg-starlight-500 text-cheese-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-105' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
                      }
                    `}
                  >
                    <option.icon size={14} />
=======
                      flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                      ${theme === option.value 
                        ? 'bg-white dark:bg-starlight-500 text-cheese-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-105' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 hover:scale-105'
                      }
                    `}
                  >
                    <option.icon size={14} className={theme === option.value ? 'animate-bounce-soft' : ''} />
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5">
              <div className="min-w-0 pr-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">聊天框样式</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">控制 AI 回复是否使用聊天框气泡。开启显示气泡，关闭则全宽展示。</div>
              </div>
              <Switch checked={aiBubbleEnabled} onChange={setAiBubbleEnabled} size="lgMobile" className="mt-0.5 sm:mt-0" />
            </div>
          </div>
        </section>

        {/* Notifications */}
<<<<<<< HEAD
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
            <Bell size={14} className="text-purple-500 dark:text-starlight-400" /> 通知
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300 divide-y divide-slate-100 dark:divide-white/5">
=======
        <section className="animate-slide-up-bouncy" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2 group">
            <div className="p-1.5 bg-purple-100 dark:bg-white/10 rounded-lg group-hover:-rotate-12 transition-transform duration-300">
               <Bell size={14} className="text-purple-500 dark:text-starlight-400" />
            </div>
            通知
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-[1.01] divide-y divide-slate-100 dark:divide-white/5">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            <div className="p-5 sm:p-6 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">回复提示音</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI 回复完成时播放提示音</div>
              </div>
<<<<<<< HEAD
              <Switch checked={soundEnabled} onChange={setSoundEnabled} />
=======
              <Switch checked={soundEnabled} onChange={setSoundEnabled} size="lgMobile" />
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            </div>
            <div className="p-5 sm:p-6 flex items-center justify-between">
               <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">桌面通知</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">在后台运行时接收消息通知</div>
              </div>
<<<<<<< HEAD
              <Switch checked={notificationsEnabled} onChange={setNotificationsEnabled} />
=======
              <Switch checked={notificationsEnabled} onChange={setNotificationsEnabled} size="lgMobile" />
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            </div>
          </div>
        </section>

        {/* Privacy */}
<<<<<<< HEAD
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
            <Shield size={14} className="text-green-500 dark:text-green-400" /> 隐私与数据
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300">
=======
        <section className="animate-slide-up-bouncy" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2 group">
            <div className="p-1.5 bg-green-100 dark:bg-white/10 rounded-lg group-hover:rotate-12 transition-transform duration-300">
               <Shield size={14} className="text-green-500 dark:text-green-400" />
            </div>
            隐私与数据
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-[1.01]">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            <div className="p-5 sm:p-6 flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">清除所有本地缓存</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">删除浏览器中存储的所有对话历史和设置</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
<<<<<<< HEAD
                className="w-full sm:w-auto sm:min-w-[112px] h-10 whitespace-nowrap text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-red-900/30 dark:text-red-400 rounded-2xl sm:rounded-xl"
=======
                className="w-full sm:w-auto sm:min-w-[112px] h-10 whitespace-nowrap text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-red-900/30 dark:text-red-400 rounded-2xl sm:rounded-xl hover:scale-105 active:scale-95 transition-all duration-300"
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
              >
                清除数据
              </Button>
            </div>
          </div>
        </section>

        {/* Usage Management */}
<<<<<<< HEAD
        <section className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
            <Gauge size={14} className="text-cheese-500 dark:text-starlight-400" /> 用量管理
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-300">
=======
        <section className="animate-slide-up-bouncy" style={{ animationDelay: '0.35s' }}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-starlight-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2 group">
            <div className="p-1.5 bg-cheese-100 dark:bg-white/10 rounded-lg group-hover:-rotate-12 transition-transform duration-300">
               <Gauge size={14} className="text-cheese-500 dark:text-starlight-400" />
            </div>
            用量管理
          </h3>
          <div className="bg-white/70 dark:bg-night-card/50 backdrop-blur-sm border-[2px] border-white dark:border-white/10 rounded-[32px] overflow-hidden shadow-soft hover:shadow-cheese-sm dark:hover:shadow-glow transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-[1.01]">
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
            <div className="p-5 sm:p-6 flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">额度配置</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onNavigateToUsageManagement}
<<<<<<< HEAD
                className="w-full sm:w-auto rounded-2xl sm:rounded-xl whitespace-nowrap"
=======
                className="w-full sm:w-auto rounded-2xl sm:rounded-xl whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-300"
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
              >
                进入用量管理
              </Button>
            </div>
          </div>
        </section>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-8 pb-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Mintal Intelligence v1.0.0
        </div>
      </div>
    </div>
  );
};