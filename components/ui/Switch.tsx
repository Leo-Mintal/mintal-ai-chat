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
        `}
      />
    </button>
  );
};
