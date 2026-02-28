import { useRef, useState } from "react";
import { KSTClock } from "@/features";
import { useMarketStatus } from "@/hooks";
import { selectTheme, useSettingsStore } from "@/stores";
import type { MarketStatus } from "@/types";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { MarketTooltipDesktop } from "./market-tooltip-desktop";

const STATUS_COLORS: Record<MarketStatus, string> = {
  open: "bg-green-500",
  pre: "bg-yellow-400",
  post: "bg-blue-400",
  closed: "bg-gray-500",
};

export function DesktopMarketStatus() {
  const { t } = useTranslation();

  const [showTooltip, setShowTooltip] = useState(false);

  const { status, labelKey, isDST } = useMarketStatus();
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        ref={triggerRef}
        className="flex cursor-default items-center gap-1.5"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_COLORS[status])} />
        <span className="text-gray-300">{t(labelKey)}</span>
      </div>

      {showTooltip && (
        <MarketTooltipDesktop isDST={isDST} isDark={isDark} anchorEl={triggerRef.current} />
      )}

      <span className="text-gray-600">|</span>

      {/* KSTClock만 초마다 리렌더링 */}
      <KSTClock />
    </div>
  );
}
