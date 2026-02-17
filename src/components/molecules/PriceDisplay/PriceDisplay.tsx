import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useColorScheme, useCurrency } from "@/stores/settingsStore";
import type { StockPrice } from "@/types/stock";
import { cn } from "@/utils/cn";
import {
  formatUSD,
  formatKRW,
  formatChangeUSD,
  formatChangeKRW,
  formatPercent,
} from "@/utils/formatters";
import React from "react";
import { useTranslation } from "react-i18next";

interface PriceDisplayProps {
  price: StockPrice | null;
  loading?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  loading = false,
  className,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const currency = useCurrency();
  const { rate: exchangeRate } = useExchangeRate();

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-700 dark:text-blue-600" : "text-down-us";

  if (loading || !price) {
    return (
      <div data-testid="price-skeleton" className={cn("animate-pulse space-y-2", className)}>
        <div className="h-8 w-32 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-24 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-3 w-40 rounded bg-black/10 dark:bg-white/10" />
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

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* 현재가 */}
      <div className={cn("text-2xl font-bold", priceColorClass)}>{displayPrice}</div>

      {/* 변동 수치 + 변동 % */}
      <div className="flex items-center gap-2 text-sm">
        <span className={priceColorClass}>{displayChange}</span>
        <span className={priceColorClass}>{formatPercent(price.changePercent)}</span>
      </div>

      {/* 오늘 최고가 / 최저가 */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
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
