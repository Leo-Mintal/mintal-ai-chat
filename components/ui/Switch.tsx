import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  size?: "md" | "lgMobile";
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  id,
  className = "",
  size = "md",
  disabled = false,
}) => {
  // Q-tan Sizing
  const sizeClasses =
    size === "lgMobile"
      ? {
          track: "h-7 w-12",
          thumb: "h-5 w-5",
          checkedTranslate: "translate-x-[22px]",
          uncheckedTranslate: "translate-x-[4px]",
        }
      : {
          track: "h-6 w-10",
          thumb: "h-4 w-4",
          checkedTranslate: "translate-x-[20px]",
          uncheckedTranslate: "translate-x-[4px]",
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
        relative inline-flex shrink-0 items-center rounded-full transition-all duration-300 ease-spring
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cheese-300 dark:focus-visible:ring-starlight-400
        disabled:opacity-60 disabled:cursor-not-allowed border-2 border-transparent
        ${sizeClasses.track}
        ${
          checked
            ? "bg-gradient-to-r from-cheese-400 to-cheese-500 dark:from-starlight-400 dark:to-starlight-600 shadow-inner"
            : "bg-slate-200 dark:bg-slate-700/80"
        }
        ${className}
      `}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none absolute rounded-full bg-white shadow-sm ring-0
          transition-all duration-300 ease-spring
          ${sizeClasses.thumb}
          ${checked ? sizeClasses.checkedTranslate : sizeClasses.uncheckedTranslate}
          ${checked ? "scale-[1.03]" : "scale-100"}
        `}
      />
    </button>
  );
};
