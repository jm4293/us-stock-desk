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
    const rate = result?.meta?.regularMarketPrice ?? 1450;

    return res.status(200).json({ base: "USD", target: "KRW", rate, timestamp: Date.now() });
  } catch (error) {
    console.error("[Exchange Rate Proxy Error]:", error);
    return res.status(200).json({ base: "USD", target: "KRW", rate: 1450, timestamp: Date.now() });
  }
}
