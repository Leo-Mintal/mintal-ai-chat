import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Sparkles, Loader2 } from 'lucide-react';

interface SelectOption {
  id: string;
  name: string;
  group?: string;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
  isLoading = false,
  loadingText = '加载中...',
  emptyText = '暂无可用选项',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);
  const isTriggerDisabled = disabled;
  const triggerLabel = isLoading
    ? loadingText
    : selectedOption
      ? selectedOption.name
      : options.length === 0
        ? emptyText
        : placeholder;

  // Group options
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGroups = Object.keys(groupedOptions).reduce((acc, group) => {
    const filtered = groupedOptions[group].filter(opt =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filtered.length > 0) acc[group] = filtered;
    return acc;
  }, {} as Record<string, SelectOption[]>);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-warm-400 dark:text-slate-400 mb-1.5 uppercase tracking-wide px-1">{label}</label>}

      {/* Trigger Button - Enhanced Frosted Glass */}
      <button
        type="button"
        onClick={() => {
          if (!isTriggerDisabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={isTriggerDisabled}
        className={`
          w-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border-[2px]
          text-warm-800 dark:text-white text-sm font-bold rounded-[24px]
          focus:outline-none
          p-3 flex items-center justify-between transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
          shadow-sm hover:shadow-cheese-sm dark:hover:shadow-glow hover:scale-[1.02] active:scale-95
          disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm disabled:active:scale-100
          ${isOpen
            ? 'border-cheese-300 dark:border-starlight-500 ring-4 ring-cheese-100 dark:ring-starlight-500/20 bg-white/60 dark:bg-black/40'
            : 'border-white/30 dark:border-white/10 hover:border-cheese-200 dark:hover:border-starlight-500/50 hover:bg-white/60 dark:hover:bg-black/30'
          }
        `}
      >
        <span className={`flex items-center gap-2 ${selectedOption ? 'text-warm-800 dark:text-white' : 'text-warm-400 dark:text-slate-300'}`}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-cheese-500 dark:text-starlight-400" strokeWidth={2.5} />}
          {triggerLabel}
        </span>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-cheese-500 dark:text-starlight-400" strokeWidth={2.5} />
        ) : (
          <ChevronDown className={`w-4 h-4 text-warm-400 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? 'rotate-180 text-cheese-500 dark:text-starlight-500 scale-125' : ''}`} strokeWidth={2.5} />
        )}
      </button>

      {isOpen && !isTriggerDisabled && (
        <div className="absolute z-50 w-full mt-2 bg-white/70 dark:bg-night-card/70 backdrop-blur-xl border-[3px] border-white dark:border-white/10 rounded-[28px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-night animate-pop-in origin-top overflow-hidden ring-1 ring-black/5 dark:ring-white/5 p-2">

          {/* Search Box - Frosted */}
          <div className="p-1 mb-1">
            <div className="relative group">
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-warm-400 dark:text-slate-500 group-focus-within:text-cheese-500 dark:group-focus-within:text-starlight-500 transition-colors" strokeWidth={2.5} />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold bg-white/40 dark:bg-black/20 backdrop-blur-sm border-2 border-transparent focus:border-cheese-300 dark:focus:border-starlight-500 rounded-full text-warm-700 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-night-surface transition-all placeholder:text-warm-300 dark:placeholder:text-slate-500"
                placeholder="搜索模型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar px-1 pb-1">
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="px-3 py-6 text-xs font-bold text-warm-300 text-center flex flex-col items-center gap-2">
                <Sparkles size={16} />
                <span>{options.length === 0 ? emptyText : '没有找到这个模型哦'}</span>
              </div>
            ) : (
              Object.keys(filteredGroups).map(group => (
                <div key={group} className="mb-2 last:mb-0">
                  <div className="px-3 py-2 text-[10px] font-extrabold text-warm-300 dark:text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1">
                    {group}
                  </div>
                  <div className="space-y-1">
                    {filteredGroups[group].map(option => {
                      const isSelected = value === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            onChange(option.id);
                            setIsOpen(false);
                          }}
                          className={`
                            w-full text-left px-4 py-3 rounded-[20px] flex items-center justify-between group transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
                            hover:scale-[1.02] active:scale-95
                            ${isSelected
                              ? 'bg-cheese-100 dark:bg-starlight-500/20 text-cheese-700 dark:text-starlight-100 shadow-sm'
                              : 'hover:bg-white/50 dark:hover:bg-white/10 text-warm-600 dark:text-slate-300'
                            }
                          `}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-cheese-700 dark:text-starlight-100' : 'text-warm-700 dark:text-white group-hover:text-cheese-600 dark:group-hover:text-starlight-200'}`}>
                              {option.name}
                            </span>
                            {option.description && (
                              <span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-cheese-500 dark:text-starlight-300' : 'text-warm-400 dark:text-slate-500 group-hover:text-cheese-400 dark:group-hover:text-starlight-400'}`}>
                                {option.description}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="bg-cheese-400 dark:bg-starlight-500 text-white rounded-full p-1 shadow-sm animate-pop-in">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};