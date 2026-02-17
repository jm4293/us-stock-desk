import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/utils/cn";
import {
  formatUSD,
  formatKRW,
  formatChangeUSD,
  formatChangeKRW,
  formatPercent,
} from "@/utils/formatters";
import { StockChart } from "@/components/molecules";
import { useMobileStockCard, useMarketStatus } from "@/hooks";
import type { ChartTimeRange } from "@/types/stock";

const TIME_RANGES: ChartTimeRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

interface MobileStockCardProps {
  id: string;
  symbol: string;
  companyName: string;
  onClose: (id: string) => void;
}

export const MobileStockCard: React.FC<MobileStockCardProps> = ({
  id,
  symbol,
  companyName,
  onClose,
}) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<ChartTimeRange>("1W");
  const { isDark, priceState, chartState, showChart, colorScheme, currency, exchangeRate } =
    useMobileStockCard(symbol, range);
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

  const rawPrice = priceState.status === "success" ? priceState.data : null;
  const price = rawPrice?.current ? rawPrice : null;
  const isLoading = priceState.status === "loading" || priceState.status === "idle" || !price;

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = price ? price.change >= 0 : true;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayPrice = price
    ? currency === "KRW"
      ? formatKRW(price.current * exchangeRate)
      : formatUSD(price.current)
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

  // 정규장 종가 (확장시간 중 보조 표시용)
  const isExtendedHours = marketStatus === "pre" || marketStatus === "post";
  const displayClose =
    isExtendedHours && price && price.close > 0
      ? currency === "KRW"
        ? formatKRW(price.close * exchangeRate)
        : formatUSD(price.close)
      : null;

  // closed 상태에서 postMarket 보조 표시
  const closedPostMarket = marketStatus === "closed" && price ? price.postMarket : null;
  const displayClosedPost = closedPostMarket
    ? currency === "KRW"
      ? formatKRW(closedPostMarket.price * exchangeRate)
      : formatUSD(closedPostMarket.price)
    : null;
  const closedPostChange = closedPostMarket
    ? currency === "KRW"
      ? formatChangeKRW(closedPostMarket.change * exchangeRate)
      : formatChangeUSD(closedPostMarket.change)
    : null;
  const isClosedPostPositive = closedPostMarket ? closedPostMarket.change >= 0 : true;
  const closedPostColorClass = isClosedPostPositive ? upClass : downClass;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-shadow",
        isDark ? "glass" : "border-slate-200 bg-white shadow-slate-100",
        isDragging && "shadow-2xl"
      )}
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
          <p className={cn("truncate text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>
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
              <div className="flex items-center gap-1">
                <span className={cn("text-sm font-bold", priceColorClass)}>{displayPrice}</span>
                {sessionLabel && (
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-xs font-medium",
                      isDark ? "bg-white/10 text-gray-300" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {sessionLabel}
                  </span>
                )}
              </div>
              <span className={cn("text-xs", priceColorClass)}>{displayPercent}</span>
            </>
          ) : null}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={() => onClose(id)}
          aria-label={t("common.close")}
          className={cn(
            "shrink-0 rounded-lg p-1.5 text-xs transition-colors",
            isDark
              ? "text-gray-500 hover:bg-white/10 hover:text-white"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          ✕
        </button>
      </div>

      {/* 고가 / 저가 */}
      {isLoading || !price ? (
        <div className="mt-2 flex animate-pulse gap-3">
          <div className={cn("h-3 w-20 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
          <div className={cn("h-3 w-20 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
        </div>
      ) : (
        <div className={cn("mt-2 flex gap-3 text-xs", isDark ? "text-gray-400" : "text-slate-400")}>
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

      {/* 애프터마켓 (closed 상태에서 보조 표시) */}
      {!isLoading && displayClosedPost && (
        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-xs",
            isDark ? "text-gray-500" : "text-slate-400"
          )}
        >
          <span>{t("stockBox.postMarket")}</span>
          <span className={cn("tabular-nums", closedPostColorClass)}>{displayClosedPost}</span>
          {closedPostChange && (
            <span className={cn("tabular-nums", closedPostColorClass)}>{closedPostChange}</span>
          )}
        </div>
      )}

      {/* 정규장 종가 (확장시간 중 보조 표시) */}
      {!isLoading && displayClose && (
        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-xs",
            isDark ? "text-gray-500" : "text-slate-400"
          )}
        >
          <span>{t("stockBox.regularClose")}</span>
          <span className={cn("tabular-nums", isDark ? "text-gray-400" : "text-slate-500")}>
            {displayClose}
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
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 font-medium text-blue-700"
                    : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* 차트 영역 */}
          <div className="mt-2 h-40">
            {chartState.status === "success" && chartState.data && chartState.data.length > 0 ? (
              <StockChart data={chartState.data} />
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
  );
};

MobileStockCard.displayName = "MobileStockCard";
