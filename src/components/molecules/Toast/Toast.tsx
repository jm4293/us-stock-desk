import { useToastStore, useTheme } from "@/stores";
import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastItemProps {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  onRemove: (id: string) => void;
}

const ICONS = {
  success: (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
    </svg>
  ),
};

const TYPE_COLORS = {
  success: {
    dark: "border border-emerald-400/30 bg-emerald-500/20 text-emerald-300 backdrop-blur-xl",
    light: "border border-emerald-500/30 bg-emerald-50/90 text-emerald-700 backdrop-blur-xl",
  },
  error: {
    dark: "border border-red-400/30 bg-red-500/20 text-red-300 backdrop-blur-xl",
    light: "border border-red-500/30 bg-red-50/90 text-red-700 backdrop-blur-xl",
  },
  info: {
    dark: "border border-blue-400/30 bg-blue-500/20 text-blue-300 backdrop-blur-xl",
    light: "border border-blue-500/30 bg-blue-50/90 text-blue-700 backdrop-blur-xl",
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onRemove }) => {
  const isDark = useTheme() === "dark";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 직후 visible true → 슬라이드 인
    const enter = requestAnimationFrame(() => setVisible(true));

    // 2700ms 후 slide out 시작 (총 3000ms - 300ms 애니메이션)
    const leaveTimer = setTimeout(() => setVisible(false), 2700);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(leaveTimer);
    };
  }, []);

  // slide-out 완료 후 제거
  const handleTransitionEnd = () => {
    if (!visible) onRemove(id);
  };

  const colors = TYPE_COLORS[type][isDark ? "dark" : "light"];

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        "flex w-max max-w-xs items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
        "transition-all duration-300 ease-out",
        colors,
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      )}
    >
      {ICONS[type]}
      <span className="truncate">{message}</span>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed left-1/2 top-16 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

ToastContainer.displayName = "ToastContainer";
