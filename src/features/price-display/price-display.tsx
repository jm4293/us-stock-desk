import React from "react";
import { useExchangeRate } from "@/hooks";
import { selectColorScheme, selectCurrency, selectTheme, useSettingsStore } from "@/stores";
import type { StockPrice } from "@/types";
import { cn, formatChangeKRW, formatChangeUSD, formatKRW, formatPercent, formatUSD } from "@/utils";
import { useTranslation } from "react-i18next";

interface PriceDisplayProps {
  price: StockPrice | null;
  loading?: boolean;
  /** 현재 마켓 상태: pre/post일 때 확장 거래 가격 표시 */
  marketStatus?: "open" | "pre" | "post" | "closed";
  className?: string;

  companyName?: string;
  symbol?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  loading = false,
  marketStatus,
  className,
  companyName,
  symbol,
}) => {
  const { t } = useTranslation();

  const { rate: exchangeRate } = useExchangeRate();
  const currency = useSettingsStore(selectCurrency);
  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  if (loading || !price || !price.current) {
    return (
      <div className={cn(className)}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-4">
            {companyName ? (
              <h3 className="truncate text-lg font-bold text-white">{companyName}</h3>
            ) : (
              symbol && <h3 className="truncate text-lg font-bold text-white">{symbol}</h3>
            )}
            {companyName && symbol && (
              <p className="text-sm font-medium text-gray-400/80">{symbol}</p>
            )}
          </div>
          <div
            data-testid="price-skeleton"
            className="flex animate-pulse flex-col items-end space-y-2"
          >
            <div className={cn("h-8 w-32 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
            <div className={cn("h-4 w-24 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
            <div className={cn("h-3 w-40 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
          </div>
        </div>
      </div>
    );
  }

  const isPositive = price.change >= 0;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayPrice =
    currency === "KRW" ? formatKRW(price.current * exchangeRate) : formatUSD(price.current);

  const displayChange =
    currency === "KRW"
      ? formatChangeKRW(price.change * exchangeRate)
      : formatChangeUSD(price.change);

  const displayHigh =
    currency === "KRW" ? formatKRW(price.high * exchangeRate) : formatUSD(price.high);

  const displayLow =
    currency === "KRW" ? formatKRW(price.low * exchangeRate) : formatUSD(price.low);

  // 세션 레이블: pre/post는 현재가가 확장가로 교체됨, closed는 종가 유지
  const sessionLabel =
    marketStatus === "pre"
      ? t("stockBox.preMarket")
      : marketStatus === "post"
        ? t("stockBox.postMarket")
        : null;

  // 정규장 종가 + 종가 기준 변동값/변동률 (pre/post/closed 상태에서만 표시)
  const regularPrice = price.regularMarketPrice ?? price.current;
  const regularChange = price.regularMarketChange ?? price.change;
  const regularChangePercent = price.regularMarketChangePercent ?? price.changePercent;
  const isRegularPositive = regularChange >= 0;
  const regularColorClass = isRegularPositive ? upClass : downClass;
  const displayRegularPrice =
    currency === "KRW" ? formatKRW(regularPrice * exchangeRate) : formatUSD(regularPrice);
  const displayRegularChange =
    currency === "KRW"
      ? formatChangeKRW(regularChange * exchangeRate)
      : formatChangeUSD(regularChange);

  return (
    <div className={cn(className)}>
      <div className="flex items-start justify-between">
        {/* 좌측: 이름 및 티커 */}
        <div className="min-w-0 flex-1 pr-4">
          {companyName ? (
            <h3 className="truncate text-lg font-bold text-white">{companyName}</h3>
          ) : (
            symbol && <h3 className="truncate text-lg font-bold text-white">{symbol}</h3>
          )}
          {companyName && symbol && (
            <p className="text-sm font-medium text-gray-400/80">{symbol}</p>
          )}
        </div>

        {/* 우측: 가격/변동률 */}
        <div className="flex shrink-0 flex-col items-end">
          <div className={cn("text-2xl font-bold tracking-tight", priceColorClass)}>
            {displayPrice}
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1.5 text-sm">
            {sessionLabel && (
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
                  isDark ? "bg-white/10 text-gray-300" : "bg-slate-100 text-slate-500"
                )}
              >
                {sessionLabel}
              </span>
            )}
            <span className={priceColorClass}>{displayChange}</span>
            <span className={priceColorClass}>{formatPercent(price.changePercent)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col text-xs">
        {/* 정규장 종가 + 종가 기준 변동 — 정규장이 아닌 시간(pre/post/closed)에만 표시 */}
        {marketStatus !== "open" && (
          <div className="flex items-center justify-between">
            <span className={isDark ? "text-gray-400" : "text-slate-500"}>
              {t("stockBox.regularClose") || "Regular Close"}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-medium tabular-nums",
                  isDark ? "text-gray-300" : "text-slate-700"
                )}
              >
                {displayRegularPrice}
              </span>
              <span className={cn("tabular-nums", regularColorClass)}>{displayRegularChange}</span>
              <span className={cn("tabular-nums", regularColorClass)}>
                {formatPercent(regularChangePercent)}
              </span>
            </div>
          </div>
        )}

        {/* 오늘 최고가 / 최저가 (한 줄로 통합) */}
        <div
          className={cn("mt-0.5 flex gap-3 text-xs", isDark ? "text-gray-400" : "text-slate-500")}
        >
          <span>
            <span className={`mr-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {t("stockBox.high")}
            </span>
            <span className={upClass}>{displayHigh}</span>
          </span>
          <span>
            <span className={`mr-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {t("stockBox.low")}
            </span>
            <span className={downClass}>{displayLow}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

PriceDisplay.displayName = "PriceDisplay";
