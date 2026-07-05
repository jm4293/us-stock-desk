import type { ChartTimeRange } from "@/types";

// Response 객체는 body를 한 번만 읽을 수 있으므로, 파싱된 JSON 프로미스를 캐싱하여
// 동시 요청자들이 안전하게 같은 결과를 공유하도록 한다.
const pendingRequests = new Map<string, Promise<unknown>>();

export function fetchYahooChart(symbol: string, range: ChartTimeRange): Promise<unknown> {
  const key = `${symbol}:${range}`;

  if (!pendingRequests.has(key)) {
    const promise = fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });
    pendingRequests.set(key, promise);
  }

  return pendingRequests.get(key)!;
}
