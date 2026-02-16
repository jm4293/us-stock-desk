import { useState, useEffect, useCallback } from "react";
import type { StockChartData, ChartTimeRange } from "@/types/stock";
import type { AsyncState } from "@/types/common";

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

  const fetchCandles = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/chart?symbol=${symbol}&range=${range}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: YahooChartResponse = await response.json();

      if (data.chart.error || !data.chart.result) {
        throw new Error(data.chart.error?.description ?? "No data");
      }

      const chartData = mapYahooToChartData(data.chart.result[0]);
      setState({ status: "success", data: chartData });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to fetch",
      });
    }
  }, [symbol, range]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  return { state, refetch: fetchCandles };
}
