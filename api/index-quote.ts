import type { VercelRequest, VercelResponse } from "@vercel/node";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "").trim();

  if (!symbol) {
    return res.status(400).json({ error: "symbol is required" });
  }

  const yahooUrl = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  try {
    const response = await fetch(yahooUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();

    const result = data?.chart?.result?.[0];
    if (!result?.meta) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(404).json({ error: "No data found" });
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
    return res.status(200).json({
      symbol: meta.symbol,
      shortName: meta.shortName ?? meta.symbol,
      price,
      previousClose,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? 0,
      dayLow: meta.regularMarketDayLow ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: message });
  }
}
