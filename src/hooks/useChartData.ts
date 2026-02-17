import { useState, useEffect, useCallback, useRef } from "react";
import type { StockChartData, ChartTimeRange } from "@/types/stock";
import type { AsyncState } from "@/types/common";
import { fetchChartWithDedup } from "@/services/api/chartCache";

interface YahooChartResult {
  meta: { regularMarketPrice: number };
  timestamp: number[];
  indicators: {
    quote: {
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      close: (number | null)[];
      volume: (number | null)[];
    }[];
  };
}

interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: { code: string; description: string } | null;
  };
}

function mapYahooToChartData(result: YahooChartResult): StockChartData[] {
  const { timestamp, indicators } = result;
  const quote = indicators.quote[0];
  if (!timestamp || !quote) return [];

  return timestamp
    .map((t, i) => ({
      time: t * 1000,
      open: quote.open[i] ?? 0,
      high: quote.high[i] ?? 0,
      low: quote.low[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
    }))
    .filter((d) => d.open > 0 && d.close > 0);
}

export function useChartData(symbol: string, range: ChartTimeRange) {
  const [state, setState] = useState<AsyncState<StockChartData[]>>({ status: "idle" });
  const hasLoadedRef = useRef(false);

  // symbol/range 변경 시 최초 로딩 플래그 초기화
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [symbol, range]);

  const fetchCandles = useCallback(async () => {
    // 최초 로딩만 "loading" 표시, 이후엔 기존 데이터 유지(깜빡임 방지)
    if (!hasLoadedRef.current) {
      setState({ status: "loading" });
    }
    try {
      const response = await fetchChartWithDedup(symbol, range);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: YahooChartResponse = await response.json();

      if (data.chart.error || !data.chart.result) {
        throw new Error(data.chart.error?.description ?? "No data");
      }

      const chartData = mapYahooToChartData(data.chart.result[0]);
      hasLoadedRef.current = true;
      setState({ status: "success", data: chartData });
    } catch (error) {
      if (!hasLoadedRef.current) {
        setState({
          status: "error",
          error: error instanceof Error ? error.message : "Failed to fetch",
        });
      }
    }
  }, [symbol, range]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  return { state, refetch: fetchCandles };
}
