import { useExchangeRate } from "@/hooks/useExchangeRate";
import type { ExchangeRateData } from "@/hooks/useExchangeRate";
import { useFlashBorder } from "@/hooks/useFlashBorder";
import { useIndexData } from "@/hooks/useIndexData";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useColorScheme,
  useIndexStore,
  useShowExchangeRate,
  useShowIndexDJI,
  useShowIndexNASDAQ,
  useShowIndexSP500,
  useTheme,
} from "@/stores";
import type { IndexSymbol, Position, Size } from "@/types/stock";
import { cn } from "@/utils/cn";
import { formatChangeIndex, formatIndex, formatPercent } from "@/utils/formatters";
import React from "react";
import { useTranslation } from "react-i18next";
import { Rnd } from "react-rnd";

/* ─── 공용 포맷터 (매 렌더마다 재생성 방지) ──────────────────── */
const krwFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

/* ─── 데스크톱: Rnd 기반 드래그/리사이즈 가능 박스 ──────────── */

interface IndexBoxProps {
  symbol: IndexSymbol;
  label: string;
  position: Position;
  size: Size;
  zIndex: number;
}

const IndexBox: React.FC<IndexBoxProps> = ({ symbol, label, position, size, zIndex }) => {
  const { t } = useTranslation();
  const { data, loading } = useIndexData(symbol);
  const updatePosition = useIndexStore((s) => s.updatePosition);
  const updateSize = useIndexStore((s) => s.updateSize);
  const bringToFront = useIndexStore((s) => s.bringToFront);
  const theme = useTheme();
  const isDark = theme === "dark";
  const colorScheme = useColorScheme();

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

/* ─── 모바일: MobileStockCard와 동일한 카드 ────────────────── */

interface MobileIndexCardProps {
  symbol: IndexSymbol;
  label: string;
}

const MobileIndexCard: React.FC<MobileIndexCardProps> = ({ symbol, label }) => {
  const { t } = useTranslation();
  const { data, loading } = useIndexData(symbol);
  const theme = useTheme();
  const isDark = theme === "dark";
  const colorScheme = useColorScheme();

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

/* ─── 데스크톱: 환율 Rnd 박스 ─────────────────────────── */

interface ExchangeRateBoxProps {
  data: ExchangeRateData;
  loading: boolean;
  position: Position;
  size: Size;
  zIndex: number;
}

const ExchangeRateBox: React.FC<ExchangeRateBoxProps> = ({
  data,
  loading,
  position,
  size,
  zIndex,
}) => {
  const { t } = useTranslation();
  const updatePosition = useIndexStore((s) => s.updateExchangeRatePosition);
  const updateSize = useIndexStore((s) => s.updateExchangeRateSize);
  const bringToFront = useIndexStore((s) => s.bringExchangeRateToFront);
  const theme = useTheme();
  const isDark = theme === "dark";
  const colorScheme = useColorScheme();

  const { flashDirection, flashRingClass } = useFlashBorder(data.rate, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = data.change >= 0;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayRate = `₩${krwFormatter.format(data.rate)}`;
  const displayChange = isPositive
    ? `+₩${krwFormatter.format(data.change)}`
    : `-₩${krwFormatter.format(Math.abs(data.change))}`;
  const displayHigh = `₩${krwFormatter.format(data.dayHigh)}`;
  const displayLow = `₩${krwFormatter.format(data.dayLow)}`;

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

/* ─── 모바일: 환율 카드 ──────────────────────────────── */

interface MobileExchangeRateCardProps {
  data: ExchangeRateData;
  loading: boolean;
}

const MobileExchangeRateCard: React.FC<MobileExchangeRateCardProps> = ({ data, loading }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme === "dark";
  const colorScheme = useColorScheme();

  const { flashRingClass } = useFlashBorder(data.rate, colorScheme);

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  const isPositive = data.change >= 0;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayRate = `₩${krwFormatter.format(data.rate)}`;
  const displayChange = isPositive
    ? `+₩${krwFormatter.format(data.change)}`
    : `-₩${krwFormatter.format(Math.abs(data.change))}`;
  const displayHigh = `₩${krwFormatter.format(data.dayHigh)}`;
  const displayLow = `₩${krwFormatter.format(data.dayLow)}`;

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

/* ─── Export: 데스크톱/모바일 분기 ──────────────────────── */

const INDEX_LABELS: Record<IndexSymbol, string> = {
  "^DJI": "Dow Jones",
  "^GSPC": "S&P 500",
  "^IXIC": "NASDAQ",
};

export const MarketIndexBar: React.FC = () => {
  const isMobile = useIsMobile();
  const showDJI = useShowIndexDJI();
  const showSP500 = useShowIndexSP500();
  const showNASDAQ = useShowIndexNASDAQ();
  const showExchangeRate = useShowExchangeRate();
  const indices = useIndexStore((s) => s.indices);
  const exchangeRateBox = useIndexStore((s) => s.exchangeRateBox);
  const { data: exchangeRateData, loading: exchangeRateLoading } = useExchangeRate();

  const visibleSymbols = (
    [
      ["^DJI", showDJI],
      ["^GSPC", showSP500],
      ["^IXIC", showNASDAQ],
    ] as [IndexSymbol, boolean][]
  ).filter(([, show]) => show);

  if (visibleSymbols.length === 0 && !showExchangeRate) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-3">
        {showExchangeRate && (
          <MobileExchangeRateCard data={exchangeRateData} loading={exchangeRateLoading} />
        )}
        {visibleSymbols.map(([sym]) => (
          <MobileIndexCard key={sym} symbol={sym} label={INDEX_LABELS[sym]} />
        ))}
      </div>
    );
  }

  // 데스크톱: Rnd 박스
  return (
    <>
      {showExchangeRate && (
        <ExchangeRateBox
          data={exchangeRateData}
          loading={exchangeRateLoading}
          position={exchangeRateBox.position}
          size={exchangeRateBox.size}
          zIndex={exchangeRateBox.zIndex}
        />
      )}
      {visibleSymbols.map(([sym]) => {
        const box = indices.find((i) => i.id === sym);
        if (!box) return null;
        return (
          <IndexBox
            key={sym}
            symbol={sym}
            label={INDEX_LABELS[sym]}
            position={box.position}
            size={box.size}
            zIndex={box.zIndex}
          />
        );
      })}
    </>
  );
};

MarketIndexBar.displayName = "MarketIndexBar";
