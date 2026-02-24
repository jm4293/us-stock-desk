import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Yahoo Finance v8 chart API를 통해 프리마켓 / 애프터마켓 가격을 가져옵니다.
 * 가장 최근 체결 캔들의 close 값을 현재 확장시간 가격으로 반환합니다.
 * GET /api/extended-hours?symbol=AAPL
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "")
    .trim()
    .toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: "symbol is required" });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&includePrePost=true`;

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
