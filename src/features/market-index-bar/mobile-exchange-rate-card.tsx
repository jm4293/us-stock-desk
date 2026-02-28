import React from "react";
import type { ExchangeRateData } from "@/hooks";
import { useFlashBorder } from "@/hooks";
import { selectColorScheme, selectTheme, useSettingsStore } from "@/stores";
import { cn, formatChangeKRW, formatKRW, formatPercent } from "@/utils";
import { useTranslation } from "react-i18next";

interface MobileExchangeRateCardProps {
  data: ExchangeRateData;
  loading: boolean;
}

/**
 * 모바일: 환율 카드
 */
export const MobileExchangeRateCard: React.FC<MobileExchangeRateCardProps> = ({
  data,
  loading,
}) => {
  const { t } = useTranslation();

  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const { flashRingClass } = useFlashBorder(data.rate, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = data.change >= 0;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayRate = formatKRW(data.rate);
  const displayChange = formatChangeKRW(data.change);
  const displayHigh = formatKRW(data.dayHigh);
  const displayLow = formatKRW(data.dayLow);

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
        {/* 이름 */}
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>
            {t("settings.exchangeRateLabel")}
          </p>
          <p className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-slate-400")}>
            USD/KRW
          </p>
        </div>

        {/* 가격 + 변동률 */}
        <div className="flex shrink-0 flex-col items-end">
          {loading ? (
            <div className="animate-pulse space-y-1">
              <div className={cn("h-4 w-16 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
              <div className={cn("h-3 w-12 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
            </div>
          ) : (
            <>
              <span className={cn("text-sm font-bold", priceColorClass)}>{displayRate}</span>
              <div className={cn("flex items-center gap-1 text-xs", priceColorClass)}>
                <span>{displayChange}</span>
                <span>{formatPercent(data.changePercent)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 고가/저가 */}
      {loading ? (
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

MobileExchangeRateCard.displayName = "MobileExchangeRateCard";
