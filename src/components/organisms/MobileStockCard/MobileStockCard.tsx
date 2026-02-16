import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/utils/cn";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { StockChart } from "@/components/molecules/StockChart/StockChart";
import { useStockData } from "@/hooks/useStockData";
import { useChartData } from "@/hooks/useChartData";
import { useShowChart } from "@/stores/settingsStore";
import { useSettingsStore } from "@/stores/settingsStore";
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
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const [range, setRange] = useState<ChartTimeRange>("1W");
  const { state: priceState } = useStockData(symbol);
  const { state: chartState } = useChartData(symbol, range);
  const showChart = useShowChart();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

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
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
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

          <div className="min-w-0">
            <h3 className={cn("text-base font-bold", isDark ? "text-white" : "text-slate-900")}>
              {symbol}
            </h3>
            <p className={cn("truncate text-xs", isDark ? "text-gray-400" : "text-slate-500")}>
              {companyName}
            </p>
          </div>
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

      {/* 가격 정보 */}
      <PriceDisplay
        price={priceState.status === "success" ? priceState.data : null}
        loading={priceState.status === "loading" || priceState.status === "idle"}
      />

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
            {chartState.status === "success" && chartState.data.length > 0 ? (
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
