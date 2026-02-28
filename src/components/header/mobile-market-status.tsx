import { useRef, useState } from "react";
import { KSTClock } from "@/features";
import { useMarketStatus } from "@/hooks";
import { selectTheme, useSettingsStore } from "@/stores";
import type { MarketStatus } from "@/types";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { MarketTooltipMobile } from "./market-tooltip-mobile";

const STATUS_COLORS: Record<MarketStatus, string> = {
  open: "bg-green-500",
  pre: "bg-yellow-400",
  post: "bg-blue-400",
  closed: "bg-gray-500",
};

export function MobileMarketStatus() {
  const { t } = useTranslation();

  const [showTooltip, setShowTooltip] = useState(false);

  const { status, labelKey, isDST } = useMarketStatus();
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-2">
      <div ref={triggerRef}>
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={() => setShowTooltip((v) => !v)}
          onBlur={(e) => {
            // 툴팁 내부 클릭이 아닐 때만 닫기
            if (!e.relatedTarget) setShowTooltip(false);
          }}
          aria-label={t(labelKey)}
          aria-expanded={showTooltip}
        >
          <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_COLORS[status])} />
        </button>
      </div>
      {/* KSTClock만 초마다 리렌더링 */}
      <span className="text-xs font-medium tabular-nums text-gray-300">
        <KSTClock mobileOnly />
      </span>
      {showTooltip && (
        <MarketTooltipMobile isDST={isDST} isDark={isDark} anchorEl={triggerRef.current} />
      )}
    </div>
  );
}
