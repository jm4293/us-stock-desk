import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "FINNHUB_API_KEY not configured" });
  }

  const { type, symbol, q, resolution, from, to } = req.query;

  let url: string;

  switch (type) {
    case "quote":
      if (!symbol) return res.status(400).json({ error: "symbol is required" });
      url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`;
      break;

    case "search":
      if (!q) return res.status(400).json({ error: "q is required" });
      url = `${FINNHUB_BASE}/search?q=${encodeURIComponent(String(q))}&token=${apiKey}`;
      break;

    case "candle":
      if (!symbol || !resolution || !from || !to) {
        return res.status(400).json({ error: "symbol, resolution, from, to are required" });
      }
      url = `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
      break;

    default:
      return res.status(400).json({ error: "Invalid type" });
  }

  const response = await fetch(url);
  const data = await response.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=10");
  return res.status(response.status).json(data);
}
