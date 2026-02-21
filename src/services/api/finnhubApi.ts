import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResponse, FinnhubCandle, FinnhubQuote } from "@/types/api";
import type { ChartTimeRange, ExtendedHoursPrice, StockChartData, StockPrice } from "@/types/stock";

const CHART_RESOLUTION: Record<ChartTimeRange, string> = {
  "1D": "5",
  "1W": "60",
  "1M": "D",
  "3M": "D",
  "6M": "W",
  "1Y": "W",
};

const CHART_DAYS: Record<ChartTimeRange, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
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

/** Yahoo Finance v7 응답에서 extended hours 가격을 추출합니다 */
function parseYahooExtendedHours(
  result: Record<string, unknown>
): Pick<StockPrice, "preMarket" | "postMarket"> {
  const preMarketPrice = result.preMarketPrice as number | undefined;
  const preMarketChange = result.preMarketChange as number | undefined;
  const preMarketChangePercent = result.preMarketChangePercent as number | undefined;
  const preMarketTime = result.preMarketTime as number | undefined;

  const postMarketPrice = result.postMarketPrice as number | undefined;
  const postMarketChange = result.postMarketChange as number | undefined;
  const postMarketChangePercent = result.postMarketChangePercent as number | undefined;
  const postMarketTime = result.postMarketTime as number | undefined;

  const pre: ExtendedHoursPrice | undefined =
    preMarketPrice && preMarketPrice > 0
      ? {
          price: preMarketPrice,
          change: preMarketChange ?? 0,
          changePercent: preMarketChangePercent ?? 0,
          timestamp: (preMarketTime ?? 0) * 1000,
        }
      : undefined;

  const post: ExtendedHoursPrice | undefined =
    postMarketPrice && postMarketPrice > 0
      ? {
          price: postMarketPrice,
          change: postMarketChange ?? 0,
          changePercent: postMarketChangePercent ?? 0,
          timestamp: (postMarketTime ?? 0) * 1000,
        }
      : undefined;

  return { preMarket: pre, postMarket: post };
}

/** 프리마켓 / 애프터마켓 가격을 Yahoo Finance에서 가져옵니다 */
export async function getExtendedHours(
  symbol: string
): Promise<ApiResponse<Pick<StockPrice, "preMarket" | "postMarket">>> {
  try {
    const response = await fetch(`${API_ENDPOINTS.PROXY_BASE}/extended-hours?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const json = (await response.json()) as {
      quoteResponse?: { result?: Record<string, unknown>[] };
    };
    const result = json?.quoteResponse?.result?.[0];
    if (!result) {
      return {
        data: { preMarket: undefined, postMarket: undefined },
        success: true,
        timestamp: Date.now(),
      };
    }
    return {
      data: parseYahooExtendedHours(result),
      success: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, success: false, error: message, timestamp: Date.now() };
  }
}
