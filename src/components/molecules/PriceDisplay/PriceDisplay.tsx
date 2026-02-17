import { useExchangeRate } from "@/hooks";
import { useColorScheme, useCurrency, useTheme } from "@/stores";
import type { StockPrice } from "@/types/stock";
import { cn } from "@/utils/cn";
import {
  formatChangeKRW,
  formatChangeUSD,
  formatKRW,
  formatPercent,
  formatUSD,
} from "@/utils/formatters";
import React from "react";
import { useTranslation } from "react-i18next";

interface PriceDisplayProps {
  price: StockPrice | null;
  loading?: boolean;
  /** 현재 마켓 상태: pre/post일 때 확장 거래 가격 표시 */
  marketStatus?: "open" | "pre" | "post" | "closed";
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  loading = false,
  marketStatus,
  className,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const currency = useCurrency();
  const { rate: exchangeRate } = useExchangeRate();
  const theme = useTheme();
  const isDark = theme === "dark";

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  if (loading || !price || !price.current) {
    return (
      <div data-testid="price-skeleton" className={cn("animate-pulse space-y-2", className)}>
        <div className={cn("h-8 w-32 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
        <div className={cn("h-4 w-24 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
        <div className={cn("h-3 w-40 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
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

  // closed 상태에서 postMarket 보조 표시
  const closedPostMarket = marketStatus === "closed" ? price.postMarket : null;
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

  // 정규장 종가 보조 표시 (pre/post 중에만)
  const isExtendedHours = marketStatus === "pre" || marketStatus === "post";
  const displayClose =
    isExtendedHours && price.close > 0
      ? currency === "KRW"
        ? formatKRW(price.close * exchangeRate)
        : formatUSD(price.close)
      : null;

  return (
    <div className={cn("space-y-1", className)}>
      {/* 현재가 + 세션 레이블 */}
      <div className="flex items-baseline gap-2">
        <div className={cn("text-2xl font-bold", priceColorClass)}>{displayPrice}</div>
        {sessionLabel && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-medium",
              isDark ? "bg-white/10 text-gray-300" : "bg-slate-100 text-slate-500"
            )}
          >
            {sessionLabel}
          </span>
        )}
      </div>

      {/* 변동 수치 + 변동 % (확장시간 기준) */}
      <div className="flex items-center gap-2 text-sm">
        <span className={priceColorClass}>{displayChange}</span>
        <span className={priceColorClass}>{formatPercent(price.changePercent)}</span>
      </div>

      {/* 정규장 종가 (확장시간 중에만 보조 표시) */}
      {displayClose && (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isDark ? "text-gray-500" : "text-slate-400"
          )}
        >
          <span>{t("stockBox.regularClose")}</span>
          <span className={cn("tabular-nums", isDark ? "text-gray-400" : "text-slate-500")}>
            {displayClose}
          </span>
        </div>
      )}

      {/* 애프터마켓 (closed 상태에서 보조 표시) */}
      {displayClosedPost && (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
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

      {/* 오늘 최고가 / 최저가 */}
      <div
        className={cn(
          "flex items-center gap-3 text-xs",
          isDark ? "text-gray-400" : "text-slate-400"
        )}
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
    </div>
  );
};

PriceDisplay.displayName = "PriceDisplay";
