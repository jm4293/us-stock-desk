import React from "react";
import type { ExchangeRateData } from "@/hooks";
import { useFlashBorder } from "@/hooks";
import {
  selectBringExchangeRateToFront,
  selectColorScheme,
  selectTheme,
  selectUpdateExchangeRatePosition,
  selectUpdateExchangeRateSize,
  useSettingsStore,
  useStockIndexStore,
} from "@/stores";
import type { Position, Size } from "@/types";
import { cn, formatChangeKRW, formatKRW, formatPercent } from "@/utils";
import { useTranslation } from "react-i18next";
import { Rnd } from "react-rnd";

interface ExchangeRateBoxProps {
  data: ExchangeRateData;
  loading: boolean;
  position: Position;
  size: Size;
  zIndex: number;
}

/**
 * 데스크톱: Rnd 기반 드래그/리사이즈 가능한 환율 박스
 */
export const DesktopExchangeRateBox: React.FC<ExchangeRateBoxProps> = ({
  data,
  loading,
  position,
  size,
  zIndex,
}) => {
  const { t } = useTranslation();

  const updatePosition = useStockIndexStore(selectUpdateExchangeRatePosition);
  const updateSize = useStockIndexStore(selectUpdateExchangeRateSize);
  const bringToFront = useStockIndexStore(selectBringExchangeRateToFront);
  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const { flashDirection, flashRingClass } = useFlashBorder(data.rate, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = data.change >= 0;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayRate = formatKRW(data.rate);
  const displayChange = formatChangeKRW(data.change);
  const displayHigh = formatKRW(data.dayHigh);
  const displayLow = formatKRW(data.dayLow);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      bringToFront();
    }
  };

  return (
    <Rnd
      bounds="parent"
      position={position}
      size={{ width: size.width, height: "auto" }}
      onDragStart={() => bringToFront()}
      onDragStop={(_, d) => updatePosition({ x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) => {
        updateSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updatePosition(pos);
      }}
      style={{ zIndex }}
      minWidth={300}
      enableResizing={false}
    >
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "glass w-full cursor-grab rounded-xl transition-all duration-200 active:cursor-grabbing",
          flashRingClass,
          !flashDirection && "outline outline-1 outline-transparent"
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <h3
                  className={cn(
                    "truncate text-lg font-bold",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {t("settings.exchangeRateLabel")}
                </h3>
              </div>
              <div className="flex shrink-0 animate-pulse flex-col items-end space-y-2">
                <div className={cn("h-8 w-32 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
                <div className={cn("h-4 w-24 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
                <div className={cn("h-3 w-40 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                {/* 좌측: 이름 */}
                <div className="min-w-0 flex-1 pr-4">
                  <h3
                    className={cn(
                      "truncate text-lg font-bold",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {t("settings.exchangeRateLabel")}
                  </h3>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-400/80" : "text-slate-400"
                    )}
                  >
                    USD/KRW
                  </p>
                </div>

                {/* 우측: 가격/변동률 */}
                <div className="flex shrink-0 flex-col items-end">
                  <div className={cn("text-2xl font-bold tracking-tight", priceColorClass)}>
                    {displayRate}
                  </div>
                  <div className="mt-0.5 flex items-center justify-end gap-1.5 text-sm">
                    <span className={priceColorClass}>{displayChange}</span>
                    <span className={priceColorClass}>{formatPercent(data.changePercent)}</span>
                  </div>
                </div>
              </div>

              {/* 고가/저가 */}
              <div
                className={cn(
                  "mt-0.5 flex gap-3 text-xs",
                  isDark ? "text-gray-400" : "text-slate-500"
                )}
              >
                <span>
                  <span className="mr-1">{t("stockBox.high")}</span>
                  <span className={upClass}>{displayHigh}</span>
                </span>
                <span>
                  <span className="mr-1">{t("stockBox.low")}</span>
                  <span className={downClass}>{displayLow}</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Rnd>
  );
};

DesktopExchangeRateBox.displayName = "DesktopExchangeRateBox";
