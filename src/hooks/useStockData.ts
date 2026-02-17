import { useState, useEffect, useCallback, useRef } from "react";
import type { StockPrice } from "@/types/stock";
import type { AsyncState } from "@/types/common";
import type { TradeData } from "@/types/api";
import { finnhubApi, getExtendedHours } from "@/services/api/finnhubApi";
import { stockSocket } from "@/services/websocket/stockSocket";
import { POLLING_INTERVAL } from "@/constants/api";
import { useMarketStatus } from "@/hooks/useMarketStatus";

export function useStockData(symbol: string) {
  const [state, setState] = useState<AsyncState<StockPrice>>({ status: "idle" });

  // 현재 데이터를 ref로도 보관 → WebSocket 트레이드 수신 시 기존 데이터 병합에 사용
  const currentData = useRef<StockPrice | null>(null);

  // 최초 로딩 여부 추적 (stale closure 방지용 ref)
  const hasLoadedOnce = useRef(false);

  // Polling fallback 여부 (WebSocket 연결 실패 시 true)
  const [wsFailedFallback, setWsFailedFallback] = useState(false);

  const { isRegularHours, status: marketStatus } = useMarketStatus();

  // marketStatus를 ref로 보관 → fetchPrice 클로저가 항상 최신값을 읽도록
  const marketStatusRef = useRef(marketStatus);
  marketStatusRef.current = marketStatus;

  // ─── Polling: 최초 및 갱신 시 loading 표시 없이 데이터 교체 ───────────────
  const fetchPrice = useCallback(async () => {
    // 최초 로딩만 "loading" 상태로 표시, 이후엔 기존 데이터 유지(깜빡임 방지)
    if (!hasLoadedOnce.current) {
      setState({ status: "loading" });
    }

    const result = await finnhubApi.getQuote(symbol);
    if (result.success && result.data) {
      hasLoadedOnce.current = true;

      let priceData = result.data;

      // 정규장 외 시간에는 Yahoo Finance에서 확장 거래 데이터를 가져와 병합
      // ref를 통해 최신 marketStatus를 읽으므로 클로저 stale 문제 없음
      const currentMarketStatus = marketStatusRef.current;
      if (currentMarketStatus !== "open") {
        const extResult = await getExtendedHours(symbol);
        if (extResult.success && extResult.data) {
          priceData = { ...priceData, ...extResult.data };

          // 프리/애프터마켓 중에는 확장 거래 가격을 현재가로 교체
          // closed 상태에서는 종가를 그대로 유지하고 postMarket을 보조로만 표시
          if (currentMarketStatus === "pre" || currentMarketStatus === "post") {
            const extPrice =
              currentMarketStatus === "pre" ? extResult.data.preMarket : extResult.data.postMarket;
            if (extPrice) {
              priceData = {
                ...priceData,
                current: extPrice.price,
                change: extPrice.change,
                changePercent: extPrice.changePercent,
              };
            }
          }
        }
      }

      currentData.current = priceData;
      setState({ status: "success", data: priceData });
    } else if (!hasLoadedOnce.current) {
      // 아직 한 번도 성공한 적 없을 때만 에러 표시
      setState({ status: "error", error: result.error ?? "Failed to fetch" });
    }
  }, [symbol]); // marketStatus는 ref로 읽으므로 deps 불필요

  // ─── WebSocket 트레이드 수신 핸들러 ────────────────────────────────────────
  const handleTrade = useCallback((trade: TradeData) => {
    if (!currentData.current) return;

    // 기존 데이터를 기반으로 현재가만 업데이트 (깜빡임 없음)
    const prev = currentData.current;
    const updated: StockPrice = {
      ...prev,
      current: trade.p,
      change: trade.p - prev.close,
      changePercent: prev.close > 0 ? ((trade.p - prev.close) / prev.close) * 100 : 0,
      volume: prev.volume + (trade.v ?? 0),
      timestamp: trade.t,
    };
    currentData.current = updated;
    setState({ status: "success", data: updated });
  }, []);

  // symbol 변경 시 ref 초기화
  useEffect(() => {
    hasLoadedOnce.current = false;
    currentData.current = null;
    setState({ status: "idle" });
  }, [symbol]);

  // ─── 정규장 여부에 따라 WebSocket / Polling 전환 ──────────────────────────
  useEffect(() => {
    // WebSocket이 실패해서 fallback 모드이거나, 정규장이 아니면 → Polling
    const usePolling = wsFailedFallback || !isRegularHours;

    if (usePolling) {
      // Polling 모드 (marketStatus 포함한 최신 fetchPrice 사용)
      fetchPrice();
      const interval = setInterval(fetchPrice, POLLING_INTERVAL);
      return () => clearInterval(interval);
    } else {
      // WebSocket 모드 (정규장 중)

      // 1) 최초 snapshot은 REST API로 가져옴 (WebSocket은 tick 단위라 초기값 필요)
      fetchPrice();

      // 2) WebSocket 구독
      const unsubscribe = stockSocket.subscribe(symbol, handleTrade);

      // 3) WebSocket 연결 실패 시 Polling fallback 전환
      const unregisterError = stockSocket.onConnectionFailed(() => {
        setWsFailedFallback(true);
      });

      return () => {
        unsubscribe();
        unregisterError();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, isRegularHours, wsFailedFallback]);

  // 장 상태가 정규장으로 복귀하면 fallback 해제 (재연결 시도)
  useEffect(() => {
    if (isRegularHours && wsFailedFallback) {
      // stockSocket을 재초기화하면 connectionFailed가 리셋됨
      stockSocket.init(import.meta.env.VITE_FINNHUB_API_KEY as string);
      setWsFailedFallback(false);
    }
  }, [isRegularHours, wsFailedFallback]);

  return { state, refetch: fetchPrice, isWebSocket: isRegularHours && !wsFailedFallback };
}
