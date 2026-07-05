import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks";
import { selectTheme, useSettingsStore } from "@/stores";
import { cn } from "@/utils";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // isDark: boolean;
  /** 자동완성 드롭다운 등 overflow가 필요할 때 true */
  allowOverflow?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, allowOverflow = false }) => {
  const isMobile = useIsMobile();

  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // visualViewport로 키보드가 올라올 때 실제 뷰포트 높이 추적 (Android 대응)
  useEffect(() => {
    if (!isMobile) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => setViewportHeight(vv.height);
    update();
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, [isMobile]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      animFrameRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      // 언마운트 지연은 전환 시간과 일치시킴 (데스크톱 300ms / 모바일 700ms)
      // 길게 잡으면 페이드아웃 후에도 투명한 백드롭이 클릭을 가로챔
      const timer = setTimeout(() => setMounted(false), isMobile ? 700 : 300);
      return () => clearTimeout(timer);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [open, isMobile]);

  // ESC로 닫기 + Tab 포커스 트랩 + 닫힐 때 이전 포커스 복원
  // 포커스 위치와 무관하게 동작하도록 document 레벨에서 처리
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 패널이 마운트 렌더링된 뒤(open → mounted 반영 이후) 초기 포커스 이동
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const panel = panelRef.current;
        if (!panel || panel.contains(document.activeElement)) return;
        const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        (focusables[0] ?? panel).focus();
      });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  // 모달이 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  if (isMobile) {
    return (
      <>
        <div
          role="presentation"
          className={cn(
            "fixed inset-0 z-[1000] transition-opacity duration-700",
            isDark ? "bg-black/50" : "bg-slate-900/20",
            visible ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />

        {/* 패널 — fixed로 하단에서 위로 슬라이드 */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[1001] min-h-[80vh] rounded-t-3xl transition-transform duration-700 ease-in-out will-change-transform",
            isDark ? "glass border-t border-white/10" : "glass border-t border-slate-200",
            visible ? "translate-y-0" : "translate-y-full"
          )}
          style={{
            // visualViewport 높이 기준으로 패널 최대 높이 제한 (Android 키보드 대응)
            maxHeight: viewportHeight ? `${viewportHeight * 0.92}px` : "92dvh",
          }}
        >
          {/* 드래그 핸들 바 */}
          <div className="flex justify-center pb-1 pt-3">
            <div className={cn("h-1 w-10 rounded-full", isDark ? "bg-white/20" : "bg-slate-300")} />
          </div>
          <div className="overflow-y-auto px-6 pb-8 pt-2" style={{ maxHeight: "inherit" }}>
            {children}
          </div>
        </div>
      </>
    );
  }

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
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "w-full max-w-sm rounded-2xl p-6 shadow-2xl transition-all duration-300",
          isDark ? "glass" : "glass border border-slate-200",
          allowOverflow ? "overflow-visible" : "",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};

Modal.displayName = "Modal";
