import { cn } from "@/utils/cn";
import React from "react";

export interface SettingOptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  isDark: boolean;
}

export const SettingOptionButton: React.FC<SettingOptionButtonProps> = ({
  isActive,
  isDark,
  className,
  children,
  ...props
}) => {
  const btnActive = isDark
    ? "border-white/40 bg-white/20 text-white font-semibold"
    : "border-slate-800 bg-white text-slate-900 font-semibold shadow-sm";
  const btnInactive = isDark
    ? "border-white/10 bg-white/5 text-gray-400 font-medium hover:bg-white/10"
    : "border-slate-200 bg-white/60 text-slate-500 font-medium hover:bg-white hover:text-slate-800 hover:border-slate-300";

  return (
    <button
      className={cn(
        "flex-1 rounded-lg border transition-colors",
        isActive ? btnActive : btnInactive,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

SettingOptionButton.displayName = "SettingOptionButton";
