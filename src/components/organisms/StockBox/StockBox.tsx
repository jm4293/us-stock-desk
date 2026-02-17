import { Button } from "@/components/atoms";
import { PriceDisplay, StockChart } from "@/components/molecules";
import { useChartData, useMarketStatus, useStockData } from "@/hooks";
import { useShowChart } from "@/stores";
import type { ChartTimeRange, Position, Size } from "@/types/stock";
import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Rnd } from "react-rnd";

// 차트 표시 여부에 따른 최소/기본 높이
// 확장시간 보조 행(정규장 종가, 애프터마켓)이 추가될 수 있어 여유 있게 설정
const HEIGHT_WITH_CHART = 300;
const HEIGHT_WITHOUT_CHART = 200;

const TIME_RANGES: ChartTimeRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

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

export const StockBox: React.FC<StockBoxProps> = ({
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
  const [range, setRange] = useState<ChartTimeRange>("1W");
  const { state: priceState } = useStockData(symbol);
  const { state: chartState } = useChartData(symbol, range);
  const showChart = useShowChart();
  const { status: marketStatus } = useMarketStatus();

  // 차트 표시 여부 변경 및 마운트 시 최소 높이 보장
  useEffect(() => {
    const minH = showChart ? HEIGHT_WITH_CHART : HEIGHT_WITHOUT_CHART;
    if (size.height < minH) {
      onSizeChange(id, { ...size, height: minH });
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
      <Rnd position={position} size={size} style={{ zIndex }} minWidth={300} minHeight={200}>
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
      size={size}
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
      minHeight={showChart ? HEIGHT_WITH_CHART : HEIGHT_WITHOUT_CHART}
    >
      <div
        data-testid="stock-box"
        role="button"
        tabIndex={0}
        className={cn(
          "glass flex h-full w-full cursor-grab flex-col rounded-xl transition-all duration-200 active:cursor-grabbing",
          focused && "z-50 shadow-2xl ring-1 ring-white/30"
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* 헤더 (드래그 핸들) */}
        <div className="flex items-start justify-between p-4 pb-2">
          <div>
            <h3 className="text-lg font-bold text-white">{companyName}</h3>
            <p className="text-xs text-gray-400">{symbol}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("common.close")}
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
          >
            ✕
          </Button>
        </div>

        {/* 가격 */}
        <div className="px-4 pb-2">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <PriceDisplay
              price={priceState.status === "success" ? priceState.data : null}
              loading={priceState.status === "loading" || priceState.status === "idle"}
              marketStatus={marketStatus}
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
                    range === r ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 px-2 pb-2">
              {chartState.status === "success" && chartState.data.length > 0 ? (
                <StockChart data={chartState.data} />
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

StockBox.displayName = "StockBox";
