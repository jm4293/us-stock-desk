import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components";
import { STOCK_BOX } from "@/constants";
import { PriceDisplay } from "@/features";
import { useChartData, useMarketStatus, useStockData } from "@/hooks";
import { selectColorScheme, selectShowChart, selectTheme, useSettingsStore } from "@/stores";
import type { ChartTimeRange, Position, Size } from "@/types";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { Rnd } from "react-rnd";

// 차트 컴포넌트 lazy loading (번들 크기 최적화)
const StockChart = lazy(() =>
  import("@/features/stock-chart/stock-chart").then((module) => ({
    default: module.StockChart,
  }))
);

// 차트 표시 여부에 따른 최소/기본 높이
// 확장시간 보조 행(정규장 종가, 애프터마켓)이 추가될 수 있어 여유 있게 설정
const HEIGHT_WITH_CHART = 300;
const HEIGHT_WITHOUT_CHART = 200;

const TIME_RANGES: ChartTimeRange[] = ["1m", "5m", "10m", "1h", "1D"];

interface StockBoxProps {
  id: string;
  symbol: string;
  companyName: string;
  position: Position;
  size: Size;
  zIndex: number;
  focused: boolean;
  loading?: boolean;
  error?: string;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onPositionChange: (id: string, position: Position) => void;
  onSizeChange: (id: string, size: Size) => void;
}

export const DesktopStockBox: React.FC<StockBoxProps> = ({
  id,
  symbol,
  companyName,
  position,
  size,
  zIndex,
  focused,
  loading = false,
  error,
  onFocus,
  onClose,
  onPositionChange,
  onSizeChange,
}) => {
  const { t } = useTranslation();

  const [range, setRange] = useState<ChartTimeRange>("1m");
  const [flashDirection, setFlashDirection] = useState<"up" | "down" | null>(null);

  const { state: priceState } = useStockData(symbol);
  const { state: chartState } = useChartData(symbol, range);
  const { status: marketStatus } = useMarketStatus();
  const showChart = useSettingsStore(selectShowChart);
  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const isMounted = useRef(false);
  const prevPriceRef = useRef<number | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPrice = priceState.status === "success" ? priceState.data.current : null;

  useEffect(() => {
    if (currentPrice === null) return;
    const prev = prevPriceRef.current;
    if (prev !== null && prev !== currentPrice) {
      const direction = currentPrice > prev ? "up" : "down";
      setFlashDirection(direction);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashDirection(null), 600);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const flashRingClass =
    flashDirection === "up"
      ? colorScheme === "kr"
        ? "ring-2 ring-red-500"
        : "ring-2 ring-green-400"
      : flashDirection === "down"
        ? colorScheme === "kr"
          ? "ring-2 ring-blue-500"
          : "ring-2 ring-red-500"
        : null;

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (showChart && size.height < HEIGHT_WITH_CHART) {
      onSizeChange(id, { ...size, height: HEIGHT_WITH_CHART });
    } else if (!showChart) {
      onSizeChange(id, { width: STOCK_BOX.DEFAULT_WIDTH, height: STOCK_BOX.DEFAULT_HEIGHT });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChart]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      onFocus(id);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  if (loading) {
    return (
      <Rnd
        position={position}
        size={size}
        style={{ zIndex }}
        minWidth={300}
        minHeight={HEIGHT_WITHOUT_CHART}
      >
        <div
          data-testid="stock-box-skeleton"
          className="glass h-full w-full animate-pulse rounded-xl p-4"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-5 w-24 rounded bg-white/10" />
              <div className="h-3 w-16 rounded bg-white/10" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-32 rounded bg-white/10" />
            <div className="h-4 w-24 rounded bg-white/10" />
          </div>
        </div>
      </Rnd>
    );
  }

  return (
    <Rnd
      bounds="parent"
      position={position}
      size={showChart ? size : { width: size.width, height: "auto" }}
      onDragStop={(_, d) => onPositionChange(id, { x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) => {
        onSizeChange(id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        onPositionChange(id, pos);
      }}
      style={{ zIndex }}
      minWidth={300}
      minHeight={showChart ? HEIGHT_WITH_CHART : undefined}
      enableResizing={showChart}
      className="group"
    >
      {/* 박스 호버 시 우측 상단에 나타나는 X 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("common.remove")}
        onClick={handleClose}
        onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
        className="absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full bg-white/10 p-0 text-xs leading-none opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-white/25 group-hover:opacity-100"
      >
        ✕
      </Button>

      <div
        data-testid="stock-box"
        role="button"
        tabIndex={0}
        className={cn(
          "glass w-full cursor-grab rounded-xl transition-all duration-200 active:cursor-grabbing",
          showChart && "flex h-full flex-col",
          focused && !flashDirection && "z-50 shadow-2xl ring-1 ring-white/30",
          focused && flashDirection && "z-50 shadow-2xl",
          flashRingClass
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* 헤더 및 가격 (PriceDisplay 통합) */}
        <div className={cn("px-4", showChart ? "pb-2 pt-4" : "py-4")}>
          {error ? (
            <div>
              <h3 className="text-lg font-bold text-white">{companyName}</h3>
              <p className="text-xs text-gray-400">{symbol}</p>
              <p className="mt-2 text-sm text-red-400">{error}</p>
            </div>
          ) : (
            <PriceDisplay
              price={priceState.status === "success" ? priceState.data : null}
              loading={priceState.status === "loading" || priceState.status === "idle"}
              marketStatus={marketStatus}
              companyName={companyName}
              symbol={symbol}
            />
          )}
        </div>

        {/* 시간 범위 선택 + 차트 — showChart가 true일 때만 표시 */}
        {showChart && (
          <>
            <div className="flex gap-1 px-4 pb-2">
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRange(r);
                  }}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs transition-colors",
                    range === r
                      ? isDark
                        ? "bg-white/20 font-medium text-white ring-1 ring-white/40"
                        : "bg-slate-100 font-semibold text-slate-900 ring-1 ring-slate-300"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {t(`stockBox.range.${r}`)}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 px-2 pb-2">
              {chartState.status === "success" && chartState.data.length > 0 ? (
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    </div>
                  }
                >
                  <StockChart
                    data={chartState.data}
                    livePrice={priceState.status === "success" ? priceState.data.current : null}
                    timeRange={range}
                  />
                </Suspense>
              ) : chartState.status === "loading" || chartState.status === "idle" ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                  <p className="text-xs text-gray-500">{t("stockBox.noData")}</p>
                  <p className="text-xs text-gray-600">{t("stockBox.noDataHint")}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

DesktopStockBox.displayName = "DesktopStockBox";
