import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  // Smoother Spring Physics
  // transition-timing-function: cubic-bezier(0.34, 1.3, 0.64, 1); <-- Sophisticated soft spring
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 ease-spring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:-translate-y-0.5 hover:scale-[1.02]";

  const variants = {
    // Gradient Orange/Yellow for that "Creamy" pop
    primary:
      "bg-gradient-to-r from-cheese-400 to-cheese-500 dark:from-sky-500 dark:to-blue-600 text-white shadow-cheese-sm dark:shadow-glow rounded-[24px] hover:shadow-cheese dark:hover:shadow-glow border-2 border-transparent",

    // Soft white/glass for secondary
    secondary:
      "bg-white dark:bg-night-surface text-warm-700 dark:text-starlight-100 border-2 border-cheese-100 dark:border-white/10 hover:border-cheese-300 dark:hover:border-starlight-300 rounded-[24px] shadow-sm",

    // Transparent but with rounded hover
    ghost:
      "bg-transparent text-warm-500 dark:text-starlight-300 hover:bg-cheese-100/50 dark:hover:bg-white/10 hover:text-cheese-600 dark:hover:text-starlight-100 rounded-[20px]",

    danger:
      "bg-red-50 dark:bg-red-900/20 text-red-500 border-2 border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-[24px]",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-11 px-6 text-sm", // Taller for cuteness
    lg: "h-14 px-8 text-base",
    icon: "h-11 w-11 p-2 rounded-full", // Larger, perfectly round icons
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};
