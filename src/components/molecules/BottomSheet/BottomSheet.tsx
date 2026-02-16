import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 데스크톱 모달 max-width (기본 max-w-sm) */
  maxWidth?: string;
  isDark?: boolean;
  /** 자동완성 드롭다운 등 overflow가 필요할 때 true */
  allowOverflow?: boolean;
  /** 모바일 패널 최소 높이 (기본값 없음). 예: "50vh" */
  mobileMinHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  children,
  maxWidth = "max-w-sm",
  isDark = false,
  allowOverflow = false,
  mobileMinHeight,
}) => {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      animFrameRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(timer);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [open]);

  if (!mounted) return null;

  // ── 모바일: Bottom Sheet ──
  if (isMobile) {
    return (
      <>
        {/* 백드롭: fixed로 화면 전체 덮기 */}
        <div
          role="presentation"
          className={cn(
            "fixed inset-0 z-[1000] transition-opacity duration-700",
            isDark ? "bg-black/50" : "bg-slate-900/20",
            visible ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
        />

        {/* 패널 — fixed로 하단에서 위로 슬라이드 */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[1001] rounded-t-3xl transition-transform duration-700 ease-in-out will-change-transform",
            isDark ? "glass border-t border-white/10" : "border-t border-slate-200 bg-white",
            visible ? "translate-y-0" : "translate-y-full"
          )}
          style={mobileMinHeight ? { minHeight: mobileMinHeight } : undefined}
        >
          {/* 드래그 핸들 바 */}
          <div className="flex justify-center pb-1 pt-3">
            <div className={cn("h-1 w-10 rounded-full", isDark ? "bg-white/20" : "bg-slate-300")} />
          </div>
          <div className="max-h-[85vh] overflow-y-auto px-6 pb-8 pt-2">{children}</div>
        </div>
      </>
    );
  }

  // ── 데스크톱: 중앙 모달 ──
  return (
    <div
      role="presentation"
      className={cn(
        "absolute inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300",
        isDark ? "bg-black/50" : "bg-slate-900/20",
        visible ? "opacity-100" : "opacity-0"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className={cn(
          "w-full rounded-2xl p-6 shadow-2xl transition-all duration-300",
          maxWidth,
          isDark ? "glass" : "border border-slate-200 bg-white",
          allowOverflow ? "overflow-visible" : "",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};

BottomSheet.displayName = "BottomSheet";
