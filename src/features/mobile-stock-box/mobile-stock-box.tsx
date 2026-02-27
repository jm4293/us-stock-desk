import React, { lazy, Suspense, useRef, useState } from "react";
import { useFlashBorder, useMarketStatus, useMobileStockBox } from "@/hooks";
import type { ChartTimeRange } from "@/types";
import { cn, formatChangeKRW, formatChangeUSD, formatKRW, formatPercent, formatUSD } from "@/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";

// 차트 컴포넌트 lazy loading (번들 크기 최적화)
const StockChart = lazy(() =>
  import("@/features/stock-chart/stock-chart").then((module) => ({
    default: module.StockChart,
  }))
);

const TIME_RANGES: ChartTimeRange[] = ["1m", "5m", "10m", "1h", "1D"];

interface MobileStockBoxProps {
  id: string;
  symbol: string;
  companyName: string;
  onClose: (id: string) => void;
}

export const MobileStockBox: React.FC<MobileStockBoxProps> = ({
  id,
  symbol,
  companyName,
  onClose,
}) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<ChartTimeRange>("1m");
  const { isDark, priceState, chartState, showChart, colorScheme, currency, exchangeRate } =
    useMobileStockBox(symbol, range);
  const { status: marketStatus } = useMarketStatus();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  // 스와이프 삭제 상태
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 60; // 삭제 영역 노출 임계값 (px)
  const DELETE_ZONE_WIDTH = 72; // 삭제 버튼 너비 (px)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.touches[0].clientX;
    if (delta < 0) {
      // 오른쪽 스와이프 → 닫기
      if (isRevealed) setSwipeOffset(Math.max(0, DELETE_ZONE_WIDTH + delta));
      return;
    }
    const offset = isRevealed
      ? Math.min(DELETE_ZONE_WIDTH, DELETE_ZONE_WIDTH + delta)
      : Math.min(DELETE_ZONE_WIDTH, delta);
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    if (swipeOffset >= SWIPE_THRESHOLD) {
      setSwipeOffset(DELETE_ZONE_WIDTH);
      setIsRevealed(true);
    } else {
      setSwipeOffset(0);
      setIsRevealed(false);
    }
  };

  const rawPrice = priceState.status === "success" ? priceState.data : null;
  const price = rawPrice?.current ? rawPrice : null;
  const isLoading = priceState.status === "loading" || priceState.status === "idle" || !price;

  const currentPrice = price?.current ?? null;
  const { flashRingClass } = useFlashBorder(currentPrice, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = price ? price.change >= 0 : true;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayPrice = price
    ? currency === "KRW"
      ? formatKRW(price.current * exchangeRate)
      : formatUSD(price.current)
    : null;

  const displayChange = price
    ? currency === "KRW"
      ? formatChangeKRW(price.change * exchangeRate)
      : formatChangeUSD(price.change)
    : null;

  const displayPercent = price ? formatPercent(price.changePercent) : null;

  const displayHigh = price
    ? currency === "KRW"
      ? formatKRW(price.high * exchangeRate)
      : formatUSD(price.high)
    : null;

  const displayLow = price
    ? currency === "KRW"
      ? formatKRW(price.low * exchangeRate)
      : formatUSD(price.low)
    : null;

  // 확장시간 세션 레이블 (current가 이미 확장가로 교체된 상태)
  const sessionLabel =
    marketStatus === "pre"
      ? t("stockBox.preMarket")
      : marketStatus === "post"
        ? t("stockBox.postMarket")
        : null;

  // 정규장 종가 + 종가 기준 변동값/변동률 (pre/post/closed 상태에서만 표시)
  const regularPrice = price ? (price.regularMarketPrice ?? price.current) : null;
  const regularChange = price ? (price.regularMarketChange ?? price.change) : null;
  const regularChangePercent = price
    ? (price.regularMarketChangePercent ?? price.changePercent)
    : null;
  const isRegularPositive = regularChange != null ? regularChange >= 0 : true;
  const regularColorClass = isRegularPositive ? upClass : downClass;
  const displayRegularPrice =
    regularPrice != null
      ? currency === "KRW"
        ? formatKRW(regularPrice * exchangeRate)
        : formatUSD(regularPrice)
      : null;
  const displayRegularChange =
    regularChange != null
      ? currency === "KRW"
        ? formatChangeKRW(regularChange * exchangeRate)
        : formatChangeUSD(regularChange)
      : null;

  const isAnimating = touchStartX.current === null;
  const cardTransition = isAnimating
    ? "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)"
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative overflow-hidden rounded-2xl", flashRingClass)}
    >
      {/* 삭제 버튼 — 카드 뒤에 고정, 카드가 밀리면 자연스럽게 드러남 */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center rounded-2xl bg-red-500"
        style={{
          width: DELETE_ZONE_WIDTH,
          transform: `translateX(${DELETE_ZONE_WIDTH - swipeOffset}px)`,
          transition: cardTransition,
        }}
      >
        <button
          onClick={() => onClose(id)}
          aria-label={t("common.remove")}
          className="flex h-full w-full flex-col items-center justify-center gap-1"
        >
          {/* 휴지통 SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          <span className="text-[11px] font-semibold text-white">{t("common.remove")}</span>
        </button>
      </div>

      {/* 카드 본체 — 스와이프 offset만큼 왼쪽으로 밀림, z-index로 삭제 버튼 위에 위치 */}
      <div
        className={cn(
          "relative rounded-2xl border p-4 shadow-sm",
          isDark ? "glass" : "border-slate-200 bg-white shadow-slate-100",
          isDragging && "shadow-2xl"
        )}
        style={{ transform: `translateX(-${swipeOffset}px)`, transition: cardTransition }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 카드 헤더 */}
        <div className="flex items-center gap-2">
          {/* 드래그 핸들 */}
          <button
            {...attributes}
            {...listeners}
            aria-label="드래그하여 순서 변경"
            className={cn(
              "flex shrink-0 touch-none flex-col gap-0.5 rounded p-1",
              isDark ? "text-gray-500 hover:text-gray-300" : "text-slate-300 hover:text-slate-500"
            )}
          >
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </button>

          {/* 종목명 + 티커 */}
          <div className="min-w-0 flex-1">
            <p
              className={cn("truncate text-sm font-bold", isDark ? "text-white" : "text-slate-900")}
            >
              {companyName}
            </p>
            <p className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-slate-400")}>
              {symbol}
            </p>
          </div>

          {/* 가격 + 변동률 (인라인) */}
          <div className="flex shrink-0 flex-col items-end">
            {isLoading || !displayPrice ? (
              <div className="animate-pulse space-y-1">
                <div className={cn("h-4 w-16 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
                <div className={cn("h-3 w-12 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
              </div>
            ) : displayPrice ? (
              <>
                <span className={cn("text-sm font-bold", priceColorClass)}>{displayPrice}</span>
                <div className="flex items-center gap-1 text-xs">
                  {sessionLabel && (
                    <span
                      className={cn(
                        "rounded px-1 py-0.5 font-medium",
                        isDark ? "bg-white/10 text-gray-300" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {sessionLabel}
                    </span>
                  )}
                  {displayChange && <span className={priceColorClass}>{displayChange}</span>}
                  <span className={priceColorClass}>{displayPercent}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* 정규장 종가 + 종가 기준 변동 — 정규장이 아닌 시간(pre/post/closed)에만 표시 */}
        {!isLoading && displayRegularPrice && marketStatus !== "open" && (
          <div
            className={cn(
              "mt-1 flex items-center justify-between text-xs",
              isDark ? "text-gray-400" : "text-slate-500"
            )}
          >
            <span>{t("stockBox.regularClose") || "Regular Close"}</span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-medium tabular-nums",
                  isDark ? "text-gray-300" : "text-slate-700"
                )}
              >
                {displayRegularPrice}
              </span>
              {displayRegularChange && (
                <span className={cn("tabular-nums", regularColorClass)}>
                  {displayRegularChange}
                </span>
              )}
              {regularChangePercent != null && (
                <span className={cn("tabular-nums", regularColorClass)}>
                  {formatPercent(regularChangePercent)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 고가 / 저가 */}
        {isLoading || !price ? (
          <div className="mt-1 flex animate-pulse gap-3">
            <div className={cn("h-3 w-20 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
            <div className={cn("h-3 w-20 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
          </div>
        ) : (
          <div
            className={cn("mt-0.5 flex gap-3 text-xs", isDark ? "text-gray-400" : "text-slate-400")}
          >
            <span>
              <span className="mr-1 opacity-60">{t("stockBox.high")}</span>
              <span className={upClass}>{displayHigh}</span>
            </span>
            <span>
              <span className="mr-1 opacity-60">{t("stockBox.low")}</span>
              <span className={downClass}>{displayLow}</span>
            </span>
          </div>
        )}

        {/* 차트 */}
        {showChart && (
          <>
            {/* 시간 범위 */}
            <div className="mt-3 flex gap-1">
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs transition-colors",
                    range === r
                      ? isDark
                        ? "bg-white/20 font-medium text-white ring-1 ring-white/40"
                        : "bg-slate-100 font-semibold text-slate-900 ring-1 ring-slate-300"
                      : isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  {t(`stockBox.range.${r}`)}
                </button>
              ))}
            </div>

            {/* 차트 영역 */}
            <div className="mt-2 h-40">
              {chartState.status === "success" && chartState.data && chartState.data.length > 0 ? (
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <div
                        className={cn(
                          "h-6 w-6 animate-spin rounded-full border-2",
                          isDark
                            ? "border-white/20 border-t-white"
                            : "border-slate-200 border-t-slate-500"
                        )}
                      />
                    </div>
                  }
                >
                  <StockChart data={chartState.data} livePrice={price ? price.current : null} />
                </Suspense>
              ) : chartState.status === "loading" || chartState.status === "idle" ? (
                <div className="flex h-full items-center justify-center">
                  <div
                    className={cn(
                      "h-6 w-6 animate-spin rounded-full border-2",
                      isDark
                        ? "border-white/20 border-t-white"
                        : "border-slate-200 border-t-slate-500"
                    )}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                  <p className={cn("text-xs", isDark ? "text-gray-500" : "text-slate-400")}>
                    {t("stockBox.noData")}
                  </p>
                  <p className={cn("text-xs", isDark ? "text-gray-600" : "text-slate-300")}>
                    {t("stockBox.noDataHint")}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

MobileStockBox.displayName = "MobileStockBox";
