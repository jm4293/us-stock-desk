import React from "react";
import { cn } from "@/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "positive" | "negative" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className }) => {
  const variants = {
    positive: "text-up-us bg-up-us/10",
    negative: "text-down-us bg-down-us/10",
    neutral: "text-gray-400 bg-gray-400/10",
  };

  return (
    <span className={cn("rounded px-2 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
