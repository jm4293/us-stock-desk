import type { ChartTimeRange } from "@/types";

const pendingRequests = new Map<string, Promise<Response>>();

export function fetchYahooChart(symbol: string, range: ChartTimeRange): Promise<Response> {
  const key = `${symbol}:${range}`;

  if (!pendingRequests.has(key)) {
    const promise = fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`).finally(
      () => {
        pendingRequests.delete(key);
      }
    );
    pendingRequests.set(key, promise);
  }

  return pendingRequests.get(key)!;
}
