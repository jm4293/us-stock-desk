import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import type { MarketTooltipBaseProps, TooltipPos } from "./types";

const TOOLTIP_WIDTH = 288; // px (w-72)

export const MarketTooltipBase = ({
  isDST,
  isDark,
  anchorEl,
  children,
}: MarketTooltipBaseProps) => {
  const { t } = useTranslation();
  const [pos, setPos] = useState<TooltipPos>({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    // 뷰포트 오른쪽 끝을 넘지 않도록 left 값 클램프
    const rawLeft = rect.left + window.scrollX;
    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - 8;
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left: Math.min(rawLeft, maxLeft),
    });
  }, [anchorEl]);

  if (!anchorEl) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999 }}
      className={cn(
        "w-72 rounded-xl border p-3 shadow-2xl backdrop-blur-sm",
        isDark ? "border-white/10 bg-gray-900/95" : "border-slate-200 bg-white shadow-slate-300/60"
      )}
    >
      {/* 제목 */}
      <p className={cn("mb-1 text-xs font-semibold", isDark ? "text-white" : "text-slate-900")}>
        {t("market.tooltip.title")}
      </p>
      {/* DST 상태 */}
      <p className={cn("mb-3 text-xs", isDark ? "text-gray-400" : "text-slate-500")}>
        {isDST ? t("market.tooltip.dstActive") : t("market.tooltip.dstInactive")}
      </p>
      {children}
    </div>,
    document.body
  );
};
