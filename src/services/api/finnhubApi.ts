import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResponse, FinnhubCandle, FinnhubQuote } from "@/types/api";
import type { ChartTimeRange, ExtendedHoursPrice, StockChartData, StockPrice } from "@/types/stock";

const CHART_RESOLUTION: Record<ChartTimeRange, string> = {
  "1m": "1",
  "5m": "5",
  "10m": "15",
  "1h": "60",
  "1D": "D",
};

const CHART_DAYS: Record<ChartTimeRange, number> = {
  "1m": 1,
  "5m": 1,
  "10m": 5,
  "1h": 5,
  "1D": 30,
};

async function fetchFromProxy<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_ENDPOINTS.PROXY_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = (await response.json()) as T;
    return { data, success: true, timestamp: Date.now() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      data: null,
      success: false,
      error: message,
      timestamp: Date.now(),
    };
  }
}

export function mapQuoteToStockPrice(symbol: string, quote: FinnhubQuote): StockPrice {
  const change = quote.c - quote.pc;
  const changePercent = quote.pc !== 0 ? (change / quote.pc) * 100 : 0;
  return {
    symbol,
    current: quote.c,
    open: quote.o,
    high: quote.h,
    low: quote.l,
    close: quote.pc,
    change,
    changePercent,
    volume: 0,
    timestamp: quote.t * 1000,
    regularMarketPrice: quote.c,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
  };
}

export function mapCandleToChartData(candle: FinnhubCandle): StockChartData[] {
  if (candle.s !== "ok" || !candle.t) return [];
  return candle.t.map((time, i) => ({
    time: time * 1000,
    open: candle.o[i],
    high: candle.h[i],
    low: candle.l[i],
    close: candle.c[i],
    volume: candle.v[i],
  }));
}

export const getQuote = async (symbol: string): Promise<StockPrice> => {
  const response = await fetch(
    `${API_ENDPOINTS.PROXY_BASE}/stock-proxy?symbol=${symbol}&type=quote`
  );
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const quote = (await response.json()) as FinnhubQuote;
  return mapQuoteToStockPrice(symbol, quote);
};

export const finnhubApi = {
  getQuote: async (symbol: string): Promise<ApiResponse<StockPrice>> => {
    const result = await fetchFromProxy<FinnhubQuote>(`/stock-proxy?symbol=${symbol}&type=quote`);
    if (!result.success || !result.data) {
      return {
        data: null,
        success: false,
        error: result.error ?? "Failed to fetch quote",
        timestamp: result.timestamp,
      };
    }
    return {
      data: mapQuoteToStockPrice(symbol, result.data),
      success: true,
      timestamp: result.timestamp,
    };
  },

  getCandles: async (
    symbol: string,
    range: ChartTimeRange
  ): Promise<ApiResponse<StockChartData[]>> => {
    const to = Math.floor(Date.now() / 1000);
    const from = to - CHART_DAYS[range] * 24 * 60 * 60;
    const resolution = CHART_RESOLUTION[range];
    const result = await fetchFromProxy<FinnhubCandle>(
      `/stock-proxy?symbol=${symbol}&type=candle&resolution=${resolution}&from=${from}&to=${to}`
    );
    if (!result.success || !result.data) {
      return {
        data: null,
        success: false,
        error: result.error ?? "Failed to fetch candles",
        timestamp: result.timestamp,
      };
    }
    return {
      data: mapCandleToChartData(result.data),
      success: true,
      timestamp: result.timestamp,
    };
  },

  searchSymbol: async (
    query: string
  ): Promise<ApiResponse<{ symbol: string; description: string }[]>> => {
    return fetchFromProxy(`/stock-proxy?type=search&q=${encodeURIComponent(query)}`);
  },
};

/**
 * Yahoo Finance v8 chart API 응답에서 확장 거래시간 가격을 추출합니다.
 * 가장 마지막 체결 캔들의 close를 현재 가격으로 사용합니다.
 */
function parseYahooV8ExtendedHours(
  data: Record<string, unknown>,
  previousClose: number
): Pick<StockPrice, "preMarket" | "postMarket"> {
  const result = (data as { chart?: { result?: unknown[] } })?.chart?.result?.[0] as
    | Record<string, unknown>
    | undefined;
  if (!result) return { preMarket: undefined, postMarket: undefined };

  const meta = result.meta as Record<string, unknown> | undefined;
  if (!meta) return { preMarket: undefined, postMarket: undefined };

  const timestamps = result.timestamp as number[] | undefined;
  const quotes = (result.indicators as Record<string, unknown[]> | undefined)?.quote as
    | Record<string, number[]>[]
    | undefined;
  const closes = quotes?.[0]?.close;

  if (!timestamps || !closes || timestamps.length === 0) {
    return { preMarket: undefined, postMarket: undefined };
  }

  const tradingPeriods = meta.tradingPeriods as
    | { pre?: unknown[][]; post?: unknown[][] }
    | undefined;

  // 프리마켓 / 정규장 / 애프터마켓 시간 범위
  const preStart = (tradingPeriods?.pre?.[0]?.[0] as Record<string, number> | undefined)?.start;
  const preEnd = (tradingPeriods?.pre?.[0]?.[0] as Record<string, number> | undefined)?.end;
  const postStart = (tradingPeriods?.post?.[0]?.[0] as Record<string, number> | undefined)?.start;
  const postEnd = (tradingPeriods?.post?.[0]?.[0] as Record<string, number> | undefined)?.end;

  // 가장 마지막 유효한 프리마켓 캔들 탐색
  let prePrice: number | undefined;
  let preTimestamp: number | undefined;
  if (preStart && preEnd) {
    for (let i = timestamps.length - 1; i >= 0; i--) {
      const t = timestamps[i];
      const c = closes[i];
      if (t >= preStart && t < preEnd && c != null && c > 0) {
        prePrice = c;
        preTimestamp = t;
        break;
      }
    }
  }

  // 가장 마지막 유효한 애프터마켓 캔들 탐색
  let postPrice: number | undefined;
  let postTimestamp: number | undefined;
  if (postStart && postEnd) {
    for (let i = timestamps.length - 1; i >= 0; i--) {
      const t = timestamps[i];
      const c = closes[i];
      if (t >= postStart && t < postEnd && c != null && c > 0) {
        postPrice = c;
        postTimestamp = t;
        break;
      }
    }
  }

  const base = previousClose > 0 ? previousClose : ((meta.chartPreviousClose as number) ?? 0);

  const pre: ExtendedHoursPrice | undefined =
    prePrice && prePrice > 0
      ? {
          price: prePrice,
          change: prePrice - base,
          changePercent: base > 0 ? ((prePrice - base) / base) * 100 : 0,
          timestamp: (preTimestamp ?? 0) * 1000,
        }
      : undefined;

  const post: ExtendedHoursPrice | undefined =
    postPrice && postPrice > 0
      ? {
          price: postPrice,
          change: postPrice - base,
          changePercent: base > 0 ? ((postPrice - base) / base) * 100 : 0,
          timestamp: (postTimestamp ?? 0) * 1000,
        }
      : undefined;

  return { preMarket: pre, postMarket: post };
}

/** 프리마켓 / 애프터마켓 가격을 Yahoo Finance v8 chart API에서 가져옵니다 */
export async function getExtendedHours(
  symbol: string,
  previousClose = 0
): Promise<ApiResponse<Pick<StockPrice, "preMarket" | "postMarket">>> {
  try {
    const response = await fetch(`${API_ENDPOINTS.PROXY_BASE}/extended-hours?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const json = (await response.json()) as Record<string, unknown>;
    return {
      data: parseYahooV8ExtendedHours(json, previousClose),
      success: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, success: false, error: message, timestamp: Date.now() };
  }
}
