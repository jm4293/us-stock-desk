import { POLLING_INTERVAL } from "@/constants/api";
import { useMarketStatus } from "@/hooks/useMarketStatus";
import { finnhubApi, getExtendedHours } from "@/services/api/finnhubApi";
import { yahooSocket, type YahooTradeData } from "@/services/websocket/yahooSocket";
import type { AsyncState } from "@/types/common";
import type { StockPrice } from "@/types/stock";
import { useCallback, useEffect, useRef, useState } from "react";

export function useStockData(symbol: string) {
  const [state, setState] = useState<AsyncState<StockPrice>>({ status: "idle" });

  // 현재 데이터를 ref로도 보관 → WebSocket 트레이드 수신 시 기존 데이터 병합에 사용
  const currentData = useRef<StockPrice | null>(null);

  // 최초 로딩 여부 추적 (stale closure 방지용 ref)
  const hasLoadedOnce = useRef(false);

  // Polling fallback 여부 (WebSocket 연결 실패 시 true)
  const [wsFailedFallback, setWsFailedFallback] = useState(false);

  const { status: marketStatus } = useMarketStatus();

  // marketStatus를 ref로 보관 → fetchPrice 클로저가 항상 최신값을 읽도록
  const marketStatusRef = useRef(marketStatus);
  marketStatusRef.current = marketStatus;

  // ─── Polling: 최초 통신으로 스냅샷 로딩 ───────────────
  const fetchPrice = useCallback(async () => {
    if (!hasLoadedOnce.current) {
      setState({ status: "loading" });
    }

    const result = await finnhubApi.getQuote(symbol);
    if (result.success && result.data) {
      hasLoadedOnce.current = true;
      let priceData = result.data;

      // Yahoo Finance 확장 거래 데이터 가져와서 병합
      const extResult = await getExtendedHours(symbol);
      if (extResult.success && extResult.data) {
        priceData = { ...priceData, ...extResult.data };

        // 현재 마켓 상태에 따라 폴링 초기값을 메인 가격에 덮어씀
        const currentMarketStatus = marketStatusRef.current;
        if (currentMarketStatus === "pre" && extResult.data.preMarket) {
          priceData.current = extResult.data.preMarket.price;
          priceData.change = extResult.data.preMarket.change;
          priceData.changePercent = extResult.data.preMarket.changePercent;
        } else if (
          (currentMarketStatus === "post" || currentMarketStatus === "closed") &&
          extResult.data.postMarket
        ) {
          priceData.current = extResult.data.postMarket.price;
          priceData.change = extResult.data.postMarket.change;
          priceData.changePercent = extResult.data.postMarket.changePercent;
        }
      }

      currentData.current = priceData;
      setState({ status: "success", data: priceData });
    } else if (!hasLoadedOnce.current) {
      setState({ status: "error", error: result.error ?? "Failed to fetch" });
    }
  }, [symbol]);

  // ─── WebSocket 트레이드 수신 핸들러 ────────────────────────────────────────
  const handleTrade = useCallback((trade: YahooTradeData) => {
    if (!currentData.current) return;

    const prev = currentData.current;

    // Yahoo WebSocket은 price를 항상 보내지만, 다른 메타데이터(changePercent) 등은 있는 경우만 반영
    const current = trade.price || prev.current;
    const change = trade.change !== undefined ? trade.change : current - prev.close;
    const changePercent =
      trade.changePercent !== undefined
        ? trade.changePercent
        : prev.close > 0
          ? (change / prev.close) * 100
          : 0;

    const volume = prev.volume + (trade.dayVolume ? trade.dayVolume - prev.volume : 0);

    const updated: StockPrice = {
      ...prev,
      current,
      change,
      changePercent,
      volume,
      timestamp: trade.time ? trade.time * 1000 : prev.timestamp,
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
  useEffect(() => {
    // Yahoo Finance는 프리장(pre), 정규장(open), 애프터장(post) 모두 실시간 웹소켓 지원!
    const isTradingHours =
      marketStatus === "open" || marketStatus === "pre" || marketStatus === "post";
    const usePolling = wsFailedFallback || !isTradingHours;

    if (usePolling) {
      // 장 마감 (closed) 이거나 웹소켓 실패 시 -> 아주 가끔씩 폴링하여 스냅샷 갱신
      fetchPrice();
      // 장 마감 중에는 사실상 가격 변동이 없으므로 폴링 주기를 넓혀도 되지만 기존 로직 호환을 위해 유지
      const interval = setInterval(fetchPrice, POLLING_INTERVAL * 2);
      return () => clearInterval(interval);
    } else {
      // 1) 최초 스냅샷은 Finnhub에서 가져옴 (전일 종가 등 기본 정보 세팅 목적)
      fetchPrice();

      // 2) Yahoo WebSocket 구독 (정규, 프리, 애프터 모두)
      const unsubscribe = yahooSocket.subscribe(symbol, handleTrade);

      const unregisterError = yahooSocket.onConnectionFailed(() => {
        setWsFailedFallback(true);
      });

      return () => {
        unsubscribe();
        unregisterError();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, marketStatus, wsFailedFallback]);

  // fallback 중이라도 다시 장이 열리는 시간대가 오면 재도전
  useEffect(() => {
    const isTradingHours =
      marketStatus === "open" || marketStatus === "pre" || marketStatus === "post";
    if (isTradingHours && wsFailedFallback) {
      yahooSocket.init();
      setWsFailedFallback(false);
    }
  }, [marketStatus, wsFailedFallback]);

  const isWebSocketActive =
    (marketStatus === "open" || marketStatus === "pre" || marketStatus === "post") &&
    !wsFailedFallback;

  return { state, refetch: fetchPrice, isWebSocket: isWebSocketActive };
}
