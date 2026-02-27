import { useCallback, useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "@/constants";
import { useMarketStatus } from "@/hooks";
import { yahooSocket, type YahooTradeData } from "@/services";
import type { IndexSymbol, MarketIndex } from "@/types";

const INDEX_POLLING_INTERVAL = 60_000; // 60초

export function useIndexData(symbol: IndexSymbol) {
  const [data, setData] = useState<MarketIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<MarketIndex | null>(null);
  const hasLoadedOnce = useRef(false);
  const { status: marketStatus } = useMarketStatus();

  const fetchQuote = useCallback(async () => {
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.PROXY_BASE}/index-quote?symbol=${encodeURIComponent(symbol)}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = (await response.json()) as MarketIndex;
      hasLoadedOnce.current = true;
      dataRef.current = json;
      setData(json);
      setLoading(false);
    } catch {
      if (!hasLoadedOnce.current) {
        setLoading(false);
      }
    }
  }, [symbol]);

  // WebSocket 트레이드 수신
  const handleTrade = useCallback((trade: YahooTradeData) => {
    const prev = dataRef.current;
    if (!prev) return;

    const price = trade.price || prev.price;
    const change = trade.change !== undefined ? trade.change : price - prev.previousClose;
    const changePercent =
      trade.changePercent !== undefined
        ? trade.changePercent
        : prev.previousClose > 0
          ? (change / prev.previousClose) * 100
          : 0;

    const updated: MarketIndex = {
      ...prev,
      price,
      change,
      changePercent,
      dayHigh: trade.dayHigh ?? prev.dayHigh,
      dayLow: trade.dayLow ?? prev.dayLow,
    };

    dataRef.current = updated;
    setData(updated);
  }, []);

  // symbol 변경 시 초기화
  useEffect(() => {
    hasLoadedOnce.current = false;
    dataRef.current = null;
    setData(null);
    setLoading(true);
  }, [symbol]);

  useEffect(() => {
    const isTradingHours =
      marketStatus === "open" || marketStatus === "pre" || marketStatus === "post";

    // 초기 스냅샷 fetch
    fetchQuote();

    if (isTradingHours) {
      // WebSocket 구독
      const unsubscribe = yahooSocket.subscribe(symbol, handleTrade);
      return () => {
        unsubscribe();
      };
    } else {
      // 장 마감 시 폴링
      const interval = setInterval(fetchQuote, INDEX_POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, marketStatus]);

  return { data, loading };
}
