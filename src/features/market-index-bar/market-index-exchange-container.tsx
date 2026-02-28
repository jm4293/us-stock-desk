import React from "react";
import {
  DesktopExchangeRateBox,
  DesktopIndexBox,
  MobileExchangeRateCard,
  MobileIndexCard,
} from "@/features";
import { useExchangeRate, useIsMobile } from "@/hooks";
import {
  selectShowExchangeRate,
  selectShowIndexDJI,
  selectShowIndexNASDAQ,
  selectShowIndexSP500,
  useSettingsStore,
  useStockIndexStore,
} from "@/stores";
import type { IndexSymbol } from "@/types";

const INDEX_LABELS: Record<IndexSymbol, string> = {
  "^DJI": "Dow Jones",
  "^GSPC": "S&P 500",
  "^IXIC": "NASDAQ",
};

/**
 * 시장 지수 및 환율 표시 바
 * - 데스크톱: Rnd 기반 드래그 가능한 박스
 * - 모바일: 카드 형태로 표시
 */
export const MarketIndexExchangeContainer: React.FC = () => {
  const isMobile = useIsMobile();
  const showDJI = useSettingsStore(selectShowIndexDJI);
  const showSP500 = useSettingsStore(selectShowIndexSP500);
  const showNASDAQ = useSettingsStore(selectShowIndexNASDAQ);
  const showExchangeRate = useSettingsStore(selectShowExchangeRate);

  const indices = useStockIndexStore((s) => s.indices);
  const exchangeRateBox = useStockIndexStore((s) => s.exchangeRateBox);
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

  return (
    <>
      {showExchangeRate && (
        <DesktopExchangeRateBox
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
          <DesktopIndexBox
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

MarketIndexExchangeContainer.displayName = "MarketIndexExchangeContainer";
