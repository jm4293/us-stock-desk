import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Yahoo Finance v7 quote API를 통해 프리마켓 / 애프터마켓 가격을 가져옵니다.
 * GET /api/extended-hours?symbol=AAPL
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "")
    .trim()
    .toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: "symbol is required" });
  }

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}&fields=preMarketPrice,preMarketChange,preMarketChangePercent,preMarketTime,postMarketPrice,postMarketChange,postMarketChangePercent,postMarketTime`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    return res.status(response.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
