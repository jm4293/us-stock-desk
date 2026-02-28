import React from "react";
import { useFlashBorder, useIndexData } from "@/hooks";
import {
  selectColorScheme,
  selectIndexBringToFront,
  selectIndexUpdatePosition,
  selectIndexUpdateSize,
  selectTheme,
  useSettingsStore,
  useStockIndexStore,
} from "@/stores";
import type { IndexSymbol, Position, Size } from "@/types";
import { cn, formatChangeIndex, formatIndex, formatPercent } from "@/utils";
import { useTranslation } from "react-i18next";
import { Rnd } from "react-rnd";

interface IndexBoxProps {
  symbol: IndexSymbol;
  label: string;
  position: Position;
  size: Size;
  zIndex: number;
}

/**
 * 데스크톱: Rnd 기반 드래그/리사이즈 가능한 지수 박스
 */
export const DesktopIndexBox: React.FC<IndexBoxProps> = ({
  symbol,
  label,
  position,
  size,
  zIndex,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useIndexData(symbol);
  const updatePosition = useStockIndexStore(selectIndexUpdatePosition);
  const updateSize = useStockIndexStore(selectIndexUpdateSize);
  const bringToFront = useStockIndexStore(selectIndexBringToFront);
  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const currentPrice = data?.price ?? null;
  const { flashDirection, flashRingClass } = useFlashBorder(currentPrice, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = data ? data.change >= 0 : true;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayPrice = data ? formatIndex(data.price) : null;
  const displayChange = data ? formatChangeIndex(data.change) : null;
  const displayHigh = data ? formatIndex(data.dayHigh) : null;
  const displayLow = data ? formatIndex(data.dayLow) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(symbol);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      bringToFront(symbol);
    }
  };

  return (
    <Rnd
      bounds="parent"
      position={position}
      size={{ width: size.width, height: "auto" }}
      onDragStart={() => bringToFront(symbol)}
      onDragStop={(_, d) => updatePosition(symbol, { x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) => {
        updateSize(symbol, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updatePosition(symbol, pos);
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
        {/* 헤더: 지수명 + 가격 */}
        <div className="px-4 py-4">
          {loading || !data || !displayPrice ? (
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <h3
                  className={cn(
                    "truncate text-lg font-bold",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {label}
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
                {/* 좌측: 지수명 */}
                <div className="min-w-0 flex-1 pr-4">
                  <h3
                    className={cn(
                      "truncate text-lg font-bold",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {label}
                  </h3>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-400/80" : "text-slate-400"
                    )}
                  >
                    {symbol}
                  </p>
                </div>

                {/* 우측: 가격/변동률 */}
                <div className="flex shrink-0 flex-col items-end">
                  <div className={cn("text-2xl font-bold tracking-tight", priceColorClass)}>
                    {displayPrice}
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

DesktopIndexBox.displayName = "DesktopIndexBox";
