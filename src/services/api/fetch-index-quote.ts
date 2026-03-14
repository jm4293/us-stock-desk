import { API_ENDPOINTS } from "@/constants";

export interface MarketIndex {
  symbol: string;
  shortName: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
}

export async function fetchIndexQuote(symbol: string): Promise<MarketIndex> {
  const response = await fetch(
    `${API_ENDPOINTS.PROXY_BASE}/index-quote?symbol=${encodeURIComponent(symbol)}`
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as MarketIndex;
}
