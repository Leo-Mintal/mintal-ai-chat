import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  size?: 'md' | 'lgMobile';
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  id,
  className = '',
  size = 'md',
  disabled = false,
}) => {
<<<<<<< HEAD
  const sizeClasses = size === 'lgMobile'
    ? {
        track: 'h-7 w-12 sm:h-6 sm:w-11',
        thumb: 'h-6 w-6 sm:h-5 sm:w-5',
        checkedTranslate: 'translate-x-5',
      }
    : {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        checkedTranslate: 'translate-x-5',
=======
  // Q-tan Sizing
  const sizeClasses = size === 'lgMobile'
    ? {
        track: 'h-7 w-12',
        thumb: 'h-5 w-5',
        checkedTranslate: 'translate-x-[22px]',
        uncheckedTranslate: 'translate-x-[4px]',
      }
    : {
        track: 'h-6 w-10',
        thumb: 'h-4 w-4',
        checkedTranslate: 'translate-x-[20px]',
        uncheckedTranslate: 'translate-x-[4px]',
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
      };

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={`
<<<<<<< HEAD
        relative inline-flex shrink-0 p-0.5 rounded-full transition-colors duration-300 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cheese-300 dark:focus-visible:ring-starlight-400
        disabled:opacity-60 disabled:cursor-not-allowed
        ${sizeClasses.track}
        ${checked ? 'bg-cheese-500 dark:bg-starlight-500' : 'bg-slate-200 dark:bg-slate-700'}
        ${className}
      `}
    >
      <span
        className={`
          pointer-events-none absolute left-0.5 top-0.5 rounded-full bg-white shadow-sm
          transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${sizeClasses.thumb}
          ${checked ? sizeClasses.checkedTranslate : 'translate-x-0'}
=======
        relative inline-flex shrink-0 items-center rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cheese-300 dark:focus-visible:ring-starlight-400
        disabled:opacity-60 disabled:cursor-not-allowed border-2 border-transparent
        ${sizeClasses.track}
        ${checked 
          ? 'bg-gradient-to-r from-cheese-400 to-cheese-500 dark:from-starlight-400 dark:to-starlight-600 shadow-inner' 
          : 'bg-slate-200 dark:bg-slate-700/80'
        }
        ${className}
      `}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none absolute rounded-full bg-white shadow-sm ring-0
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${sizeClasses.thumb}
          ${checked ? sizeClasses.checkedTranslate : sizeClasses.uncheckedTranslate}
          ${checked ? 'scale-110' : 'scale-100'} 
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
        `}
      />
    </button>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
