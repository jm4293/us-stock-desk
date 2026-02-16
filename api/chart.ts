import type { VercelRequest, VercelResponse } from "@vercel/node";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

const RANGE_MAP: Record<string, { interval: string; range: string }> = {
  "1D": { interval: "5m", range: "1d" },
  "1W": { interval: "1h", range: "5d" },
  "1M": { interval: "1d", range: "1mo" },
  "3M": { interval: "1d", range: "3mo" },
  "6M": { interval: "1d", range: "6mo" },
  "1Y": { interval: "1wk", range: "1y" },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "");
  const timeRange = String(req.query.range ?? "1W");
  const config = RANGE_MAP[timeRange] ?? RANGE_MAP["1W"];

  if (!symbol) {
    return res.status(400).json({ error: "symbol is required" });
  }

  const yahooUrl = `${YAHOO_BASE}/${symbol}?interval=${config.interval}&range=${config.range}`;

  const response = await fetch(yahooUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const data = await response.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(response.status).json(data);
}
