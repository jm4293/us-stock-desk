import { memo, useRef, useState } from "react";
import { KSTClock } from "@/features";
import { useFullscreen, useIsMobile, useMarketStatus } from "@/hooks";
import { useTheme } from "@/stores";
import type { MarketStatus } from "@/types";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { MarketTooltipDesktop } from "./market-tooltip-desktop";
import { MarketTooltipMobile } from "./market-tooltip-mobile";

interface HeaderProps {
  onAddStock: () => void;
  onOpenSettings: () => void;
  className?: string;
}

const STATUS_COLORS: Record<MarketStatus, string> = {
  open: "bg-green-500",
  pre: "bg-yellow-400",
  post: "bg-blue-400",
  closed: "bg-gray-500",
};

export const Header = memo(function Header({ onAddStock, onOpenSettings, className }: HeaderProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { status, labelKey, isDST } = useMarketStatus();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const theme = useTheme();
  const isDark = theme === "dark";
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <header className={cn("glass flex items-center justify-between px-4 py-3", className)}>
      {/* 왼쪽: 로고 + 정보 */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="shrink-0 text-base font-bold text-white">US Stock Desk</h1>

        {isMobile ? (
          /* 모바일: 상태 도트 + KST 시각 (터치 → 툴팁) */
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
        ) : (
          /* 데스크톱: 거래시간 + 한국시각 */
          <>
            {/* 거래시간 + 한국시각 (hover → 툴팁) */}
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
          </>
        )}
      </div>

      {/* 오른쪽: 버튼 */}
      <div className="flex shrink-0 items-center gap-1">
        {/* 전체화면 토글 */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t("header.exitFullscreen") : t("header.fullscreen")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {isFullscreen ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
          {!isMobile && (isFullscreen ? t("header.exitFullscreen") : t("header.fullscreen"))}
        </button>

        {/* 종목 추가 */}
        <button
          onClick={onAddStock}
          aria-label={t("header.addStock")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {!isMobile && t("header.addStock")}
        </button>

        {/* 설정 */}
        <button
          onClick={onOpenSettings}
          aria-label={t("header.settings")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          {!isMobile && t("header.settings")}
        </button>
      </div>
    </header>
  );
});

Header.displayName = "Header";
