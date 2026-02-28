import React from "react";
import { useFlashBorder, useIndexData } from "@/hooks";
import { selectColorScheme, selectTheme, useSettingsStore } from "@/stores";
import type { IndexSymbol } from "@/types";
import { cn, formatChangeIndex, formatIndex, formatPercent } from "@/utils";
import { useTranslation } from "react-i18next";

interface MobileIndexCardProps {
  symbol: IndexSymbol;
  label: string;
}

/**
 * 모바일: 지수 카드 (MobileStockBox와 유사한 디자인)
 */
export const MobileIndexCard: React.FC<MobileIndexCardProps> = ({ symbol, label }) => {
  const { t } = useTranslation();

  const { data, loading } = useIndexData(symbol);
  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const currentPrice = data?.price ?? null;
  const { flashRingClass } = useFlashBorder(currentPrice, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = data ? data.change >= 0 : true;
  const priceColorClass = isPositive ? upClass : downClass;
  const isLoading = loading || !data;

  const displayPrice = data ? formatIndex(data.price) : null;
  const displayChange = data ? formatChangeIndex(data.change) : null;
  const displayPercent = data ? formatPercent(data.changePercent) : null;
  const displayHigh = data ? formatIndex(data.dayHigh) : null;
  const displayLow = data ? formatIndex(data.dayLow) : null;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-all duration-200",
        isDark ? "glass" : "border-slate-200 bg-white shadow-slate-100",
        flashRingClass
      )}
    >
      {/* 카드 헤더 */}
      <div className="flex items-center gap-2">
        {/* 지수명 */}
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>
            {label}
          </p>
          <p className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-slate-400")}>
            {symbol}
          </p>
        </div>

        {/* 가격 + 변동률 */}
        <div className="flex shrink-0 flex-col items-end">
          {isLoading || !displayPrice ? (
            <div className="animate-pulse space-y-1">
              <div className={cn("h-4 w-16 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
              <div className={cn("h-3 w-12 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
            </div>
          ) : (
            <>
              <span className={cn("text-sm font-bold", priceColorClass)}>{displayPrice}</span>
              <div className={cn("flex items-center gap-1 text-xs", priceColorClass)}>
                {displayChange && <span>{displayChange}</span>}
                <span>{displayPercent}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 고가/저가 */}
      {isLoading ? (
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
    </div>
  );
};

MobileIndexCard.displayName = "MobileIndexCard";
