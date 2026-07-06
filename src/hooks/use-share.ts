import { useCallback } from "react";
import { useSettingsStore, useStockBoxStore } from "@/stores";
import { buildShareUrl, encodeShareState, SHARE_VERSION, type SharedState } from "@/utils";

/**
 * 현재 종목 목록과 설정을 공유 URL로 인코딩하는 콜백을 반환한다.
 * @param includePositions 위치·크기까지 포함할지 여부
 */
export const useCreateShareLink = () => {
  return useCallback(async (includePositions: boolean): Promise<string> => {
    const { stocks } = useStockBoxStore.getState();
    const s = useSettingsStore.getState();

    const state: SharedState = {
      v: SHARE_VERSION,
      stocks: stocks.map((stock) => ({
        symbol: stock.symbol,
        companyName: stock.companyName,
        ...(includePositions ? { position: stock.position, size: stock.size } : {}),
      })),
      settings: {
        theme: s.theme,
        language: s.language,
        colorScheme: s.colorScheme,
        currency: s.currency,
        showChart: s.showChart,
        showIndexDJI: s.showIndexDJI,
        showIndexSP500: s.showIndexSP500,
        showIndexNASDAQ: s.showIndexNASDAQ,
        showExchangeRate: s.showExchangeRate,
      },
    };

    const encoded = await encodeShareState(state);
    return buildShareUrl(encoded);
  }, []);
};
