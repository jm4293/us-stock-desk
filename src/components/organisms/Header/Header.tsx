import { KSTClock } from "@/components/molecules";
import { useFullscreen, useIsMobile, useMarketStatus } from "@/hooks";
import { useTheme } from "@/stores";
import type { MarketStatus } from "@/types/stock";
import { cn } from "@/utils/cn";
import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  exchangeRate: number;
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

const TOOLTIP_WIDTH = 288; // px (w-72)

interface TooltipPos {
  top: number;
  left: number;
}

/** Portal로 body에 직접 마운트 — stacking context 우회 */
const MarketTooltip = ({
  isDST,
  isDark,
  isMobile,
  anchorEl,
}: {
  isDST: boolean;
  isDark: boolean;
  isMobile: boolean;
  anchorEl: HTMLElement | null;
}) => {
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

  const dst = isDST ? "EDT" : "EST";
  const sessions = [
    {
      key: "pre",
      color: "bg-yellow-400",
      etKey: `market.tooltip.preTime${dst}`,
      kstKey: `market.tooltip.preTimeKST${dst}`,
    },
    {
      key: "open",
      color: "bg-green-500",
      etKey: `market.tooltip.openTime${dst}`,
      kstKey: `market.tooltip.openTimeKST${dst}`,
    },
    {
      key: "post",
      color: "bg-blue-400",
      etKey: `market.tooltip.postTime${dst}`,
      kstKey: `market.tooltip.postTimeKST${dst}`,
    },
    {
      key: "closed",
      color: "bg-gray-500",
      etKey: `market.tooltip.closedTime${dst}`,
      kstKey: `market.tooltip.closedTimeKST${dst}`,
    },
  ] as const;

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

      {isMobile ? (
        /* 모바일: 세션명 상단, ET/KST 시간 아래에 한 줄씩 */
        <div className="space-y-3">
          {sessions.map(({ key, color, etKey, kstKey }) => (
            <div key={key}>
              {/* 세션명 */}
              <div className="mb-1 flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)} />
                <span
                  className={cn("text-xs font-medium", isDark ? "text-gray-300" : "text-slate-700")}
                >
                  {t(`market.tooltip.${key}`)}
                </span>
              </div>
              {/* ET / KST 시간 */}
              <div className="ml-3.5 flex gap-4">
                <div>
                  <span
                    className={cn(
                      "block text-xs font-medium",
                      isDark ? "text-gray-500" : "text-slate-400"
                    )}
                  >
                    {t("market.tooltip.etLabel")}
                  </span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isDark ? "text-gray-400" : "text-slate-600"
                    )}
                  >
                    {t(etKey)}
                  </span>
                </div>
                <div>
                  <span
                    className={cn(
                      "block text-xs font-medium",
                      isDark ? "text-gray-500" : "text-slate-400"
                    )}
                  >
                    {t("market.tooltip.kstLabel")}
                  </span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isDark ? "text-gray-400" : "text-slate-600"
                    )}
                  >
                    {t(kstKey)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 데스크톱: 세션명 | ET 시간 | KST 시간 한 줄 */
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-full pb-1" />
              <th
                className={cn(
                  "whitespace-nowrap pb-1 pr-0 text-right text-xs font-medium",
                  isDark ? "text-gray-500" : "text-slate-400"
                )}
              >
                {t("market.tooltip.etLabel")}
              </th>
              <th
                className={cn(
                  "whitespace-nowrap pb-1 pl-4 text-right text-xs font-medium",
                  isDark ? "text-gray-500" : "text-slate-400"
                )}
              >
                {t("market.tooltip.kstLabel")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(({ key, color, etKey, kstKey }) => (
              <tr key={key}>
                <td className="py-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)} />
                    <span className={cn("text-xs", isDark ? "text-gray-300" : "text-slate-700")}>
                      {t(`market.tooltip.${key}`)}
                    </span>
                  </div>
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap py-1 pr-0 text-right text-xs tabular-nums",
                    isDark ? "text-gray-500" : "text-slate-400"
                  )}
                >
                  {t(etKey)}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap py-1 pl-4 text-right text-xs tabular-nums",
                    isDark ? "text-gray-400" : "text-slate-600"
                  )}
                >
                  {t(kstKey)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>,
    document.body
  );
};

export const Header = memo(function Header({
  exchangeRate,
  onAddStock,
  onOpenSettings,
  className,
}: HeaderProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { status, labelKey, isDST } = useMarketStatus();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const theme = useTheme();
  const isDark = theme === "dark";
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const formattedRate = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(exchangeRate);

  return (
    <header className={cn("glass flex items-center justify-between px-4 py-3", className)}>
      {/* 왼쪽: 로고 + 정보 */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="shrink-0 text-base font-bold text-white">Stock Desk</h1>

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
              <MarketTooltip
                isDST={isDST}
                isDark={isDark}
                isMobile={true}
                anchorEl={triggerRef.current}
              />
            )}
          </div>
        ) : (
          /* 데스크톱: 환율 + 거래시간 + 한국시각 */
          <>
            {/* 환율 */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span className="text-gray-500">{t("header.exchangeRateLabel")}</span>
              <span className="font-medium text-gray-300">₩{formattedRate}</span>
            </div>

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
                <MarketTooltip
                  isDST={isDST}
                  isDark={isDark}
                  isMobile={false}
                  anchorEl={triggerRef.current}
                />
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
