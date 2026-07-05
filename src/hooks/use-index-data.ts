import { useCallback, useEffect, useRef, useState } from "react";
import { fetchIndexQuote, type MarketIndex, yahooSocket, type YahooTradeData } from "@/services";
import type { IndexSymbol } from "@/types";
import { useMarketStatus } from "@/hooks/use-market-status";

const INDEX_POLLING_INTERVAL = 60_000; // 60초

interface UseIndexDataReturn {
  data: MarketIndex | null;
  loading: boolean;
  error: string | null;
}

export function useIndexData(symbol: IndexSymbol): UseIndexDataReturn {
  const [data, setData] = useState<MarketIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<MarketIndex | null>(null);
  const hasLoadedOnce = useRef(false);
  // symbol 변경 후 늦게 도착한 이전 요청의 응답을 무시하기 위한 시퀀스
  const requestSeqRef = useRef(0);
  const { status: marketStatus } = useMarketStatus();

  const fetchQuote = useCallback(async () => {
    const requestId = ++requestSeqRef.current;

    if (!hasLoadedOnce.current) {
      setLoading(true);
    }

    try {
      const json = await fetchIndexQuote(symbol);
      if (requestId !== requestSeqRef.current) return;
      hasLoadedOnce.current = true;
      dataRef.current = json;
      setData(json);
      setError(null);
      setLoading(false);
    } catch (err) {
      if (requestId !== requestSeqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to fetch index data");
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

    // 폴링은 장중에도 안전망으로 유지:
    // 초기 fetch 실패 시 재시도하고, WebSocket이 불통이어도 스냅샷은 계속 갱신됨
    const interval = setInterval(fetchQuote, INDEX_POLLING_INTERVAL);

    if (isTradingHours) {
      // WebSocket 구독
      const unsubscribe = yahooSocket.subscribe(symbol, handleTrade);
      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, marketStatus]);

  return { data, loading, error };
}
