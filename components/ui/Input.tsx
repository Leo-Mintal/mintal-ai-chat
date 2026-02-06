import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  labelAction?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, labelAction, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full group relative">
      {(label || labelAction) && (
        <div className="flex items-center justify-between mb-2 pl-1">
          {label && <label className="block text-xs font-bold text-warm-500 dark:text-starlight-300 uppercase tracking-wider">{label}</label>}
          {labelAction}
        </div>
      )}
      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <input
          className={`
            w-full bg-white dark:bg-night-surface border-2 
            text-warm-800 dark:text-starlight-100 text-sm rounded-2xl
            focus:ring-4 focus:ring-cheese-200 dark:focus:ring-starlight-500/20 focus:border-cheese-400 dark:focus:border-starlight-500
            block py-3 px-4 transition-all duration-300 shadow-sm placeholder-warm-300 dark:placeholder-slate-500
            ${icon ? 'pl-11' : ''}
            ${error 
              ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-100' 
              : 'border-cheese-100 dark:border-white/10 hover:border-cheese-300 dark:hover:border-starlight-300'
            }
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-warm-400 dark:text-starlight-300 group-focus-within:text-cheese-500 dark:group-focus-within:text-starlight-500 transition-colors">
            {icon}
          </div>
        )}
        
        {/* Error message bubble */}
        <div className={`
          absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none transition-all duration-300
          ${error ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}>
          {error && <AlertCircle className="text-red-400" size={18} />}
        </div>
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-xs font-bold text-red-400 animate-pop-in">{error}</p>
      )}
    </div>
  );
};