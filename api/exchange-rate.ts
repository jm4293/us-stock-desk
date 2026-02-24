import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Add Edge Caching for 60 seconds to prevent rate limits from Yahoo
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  try {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?interval=1m&range=1d"
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const rate = meta?.regularMarketPrice ?? 1450;
    const previousClose = meta?.chartPreviousClose ?? meta?.previousClose ?? rate;
    const dayHigh = meta?.regularMarketDayHigh ?? meta?.dayHigh ?? rate;
    const dayLow = meta?.regularMarketDayLow ?? meta?.dayLow ?? rate;
    const change = rate - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return res.status(200).json({
      base: "USD",
      target: "KRW",
      rate,
      previousClose,
      change,
      changePercent,
      dayHigh,
      dayLow,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[Exchange Rate Proxy Error]:", error);
    return res.status(200).json({
      base: "USD",
      target: "KRW",
      rate: 1450,
      previousClose: 1450,
      change: 0,
      changePercent: 0,
      dayHigh: 1450,
      dayLow: 1450,
      timestamp: Date.now(),
      stale: true,
    });
  }
}
