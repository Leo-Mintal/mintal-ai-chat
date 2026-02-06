import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, id, className = '' }) => {
  return (
    <div className={`relative inline-block w-11 h-6 ${className}`}>
      <input
        type="checkbox"
        id={id}
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label
        htmlFor={id}
        className={`
          block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ease-in-out
          ${checked ? 'bg-cheese-500 dark:bg-starlight-500' : 'bg-slate-200 dark:bg-slate-700'}
        `}
      >
        <span
          className={`
            block h-5 w-5 mt-0.5 ml-0.5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </label>
    </div>
  );
};