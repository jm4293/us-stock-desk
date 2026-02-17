import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mapQuoteToStockPrice, mapCandleToChartData, getQuote, finnhubApi } from "./finnhubApi";

describe("finnhubApi 유틸 함수", () => {
  describe("mapQuoteToStockPrice", () => {
    it("FinnhubQuote를 StockPrice로 변환한다", () => {
      const quote = {
        c: 182.5,
        h: 184.0,
        l: 179.5,
        o: 180.0,
        pc: 180.0,
        t: 1700000000,
      };
      const result = mapQuoteToStockPrice("AAPL", quote);
      expect(result.symbol).toBe("AAPL");
      expect(result.current).toBe(182.5);
      expect(result.high).toBe(184.0);
      expect(result.low).toBe(179.5);
      expect(result.open).toBe(180.0);
      expect(result.close).toBe(180.0);
    });

    it("변동액(change)을 올바르게 계산한다", () => {
      const quote = {
        c: 182.5,
        h: 184.0,
        l: 179.5,
        o: 180.0,
        pc: 180.0,
        t: 1700000000,
      };
      const result = mapQuoteToStockPrice("AAPL", quote);
      expect(result.change).toBeCloseTo(2.5, 2);
    });

    it("변동률(changePercent)을 올바르게 계산한다", () => {
      const quote = {
        c: 182.5,
        h: 184.0,
        l: 179.5,
        o: 180.0,
        pc: 180.0,
        t: 1700000000,
      };
      const result = mapQuoteToStockPrice("AAPL", quote);
      // (182.5 - 180.0) / 180.0 * 100 = 1.388...
      expect(result.changePercent).toBeCloseTo(1.39, 1);
    });

    it("하락 시 음수 변동을 계산한다", () => {
      const quote = {
        c: 177.5,
        h: 181.0,
        l: 177.0,
        o: 180.0,
        pc: 180.0,
        t: 1700000000,
      };
      const result = mapQuoteToStockPrice("AAPL", quote);
      expect(result.change).toBeLessThan(0);
      expect(result.changePercent).toBeLessThan(0);
    });

    it("타임스탬프를 포함한다", () => {
      const quote = {
        c: 182.5,
        h: 184.0,
        l: 179.5,
        o: 180.0,
        pc: 180.0,
        t: 1700000000,
      };
      const result = mapQuoteToStockPrice("AAPL", quote);
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe("number");
    });
  });

  describe("mapCandleToChartData", () => {
    it("FinnhubCandle을 StockChartData[]로 변환한다", () => {
      const candle = {
        s: "ok",
        t: [1700000000, 1700086400],
        o: [180, 182],
        h: [185, 186],
        l: [179, 181],
        c: [182, 184],
        v: [1000000, 1200000],
      };
      const result = mapCandleToChartData(candle);
      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(180);
      expect(result[0].high).toBe(185);
      expect(result[0].low).toBe(179);
      expect(result[0].close).toBe(182);
      expect(result[0].volume).toBe(1000000);
    });

    it("첫 번째 캔들의 time이 올바르다 (ms 단위로 변환)", () => {
      const candle = {
        s: "ok",
        t: [1700000000, 1700086400],
        o: [180, 182],
        h: [185, 186],
        l: [179, 181],
        c: [182, 184],
        v: [1000000, 1200000],
      };
      const result = mapCandleToChartData(candle);
      // 구현은 Unix 초를 밀리초(* 1000)로 변환함
      expect(result[0].time).toBe(1700000000 * 1000);
    });

    it("status가 ok가 아니면 빈 배열을 반환한다", () => {
      const candle = {
        s: "no_data",
        t: [],
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
      };
      expect(mapCandleToChartData(candle)).toHaveLength(0);
    });

    it("빈 데이터면 빈 배열을 반환한다", () => {
      const candle = {
        s: "ok",
        t: [],
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
      };
      expect(mapCandleToChartData(candle)).toHaveLength(0);
    });
  });
});

describe("finnhubApi HTTP 요청", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getQuote가 올바른 StockPrice를 반환한다", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          c: 182.5,
          h: 184.0,
          l: 179.5,
          o: 180.0,
          pc: 180.0,
          t: 1700000000,
        }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await getQuote("AAPL");

    expect(result.symbol).toBe("AAPL");
    expect(result.current).toBe(182.5);
  });

  it("getQuote API 실패 시 에러를 throw한다", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(getQuote("AAPL")).rejects.toThrow();
  });

  it("finnhubApi.getQuote가 ApiResponse<StockPrice>를 반환한다", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          c: 182.5,
          h: 184.0,
          l: 179.5,
          o: 180.0,
          pc: 180.0,
          t: 1700000000,
        }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await finnhubApi.getQuote("AAPL");

    expect(result.success).toBe(true);
    expect(result.data!.symbol).toBe("AAPL");
    expect(result.data!.current).toBe(182.5);
  });

  it("finnhubApi.getQuote API 실패 시 success=false를 반환한다", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await finnhubApi.getQuote("AAPL");
    expect(result.success).toBe(false);
  });

  it("finnhubApi.getCandles가 캔들 데이터를 반환한다", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          s: "ok",
          t: [1700000000, 1700086400],
          o: [180, 182],
          h: [185, 186],
          l: [179, 181],
          c: [182, 184],
          v: [1000000, 1200000],
        }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await finnhubApi.getCandles("AAPL", "1D");
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("finnhubApi.searchSymbol이 검색 결과를 반환한다", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ symbol: "AAPL", description: "Apple Inc." }]),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await finnhubApi.searchSymbol("AAPL");
    expect(result.success).toBe(true);
  });
});
