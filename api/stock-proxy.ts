import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "FINNHUB_API_KEY not configured" });
  }

  const { type, symbol, q, resolution, from, to } = req.query;

  let url: string;

  switch (type) {
    case "quote":
      if (!symbol) return res.status(400).json({ error: "symbol is required" });
      url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(String(symbol))}&token=${apiKey}`;
      break;

    case "search":
      if (!q) return res.status(400).json({ error: "q is required" });
      url = `${FINNHUB_BASE}/search?q=${encodeURIComponent(String(q))}&token=${apiKey}`;
      break;

    case "candle": {
      if (!symbol || !resolution || !from || !to) {
        return res.status(400).json({ error: "symbol, resolution, from, to are required" });
      }
      const fromNum = Number(from);
      const toNum = Number(to);
      if (!Number.isFinite(fromNum) || !Number.isFinite(toNum)) {
        return res.status(400).json({ error: "from and to must be numeric timestamps" });
      }
      url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(String(symbol))}&resolution=${encodeURIComponent(String(resolution))}&from=${fromNum}&to=${toNum}&token=${apiKey}`;
      break;
    }

    default:
      return res.status(400).json({ error: "Invalid type" });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=10");
    return res.status(response.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: message });
  }
}
