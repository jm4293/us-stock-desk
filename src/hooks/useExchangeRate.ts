import { useEffect, useState } from "react";

interface ExchangeRateResponse {
  base: string;
  target: string;
  rate: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  timestamp: number;
}

export interface ExchangeRateData {
  rate: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
}

const DEFAULT_DATA: ExchangeRateData = {
  rate: 1450,
  previousClose: 1450,
  change: 0,
  changePercent: 0,
  dayHigh: 1450,
  dayLow: 1450,
};

let cachedData: ExchangeRateData | null = null;
let cacheTime = 0;
// 프론트엔드 캐시는 1분 (Vercel Edge Cache s-maxage=60 설정과 동일하게 맞춰 불필요한 네트워크 요청 방지)
const CACHE_DURATION = 60 * 1000;

export function useExchangeRate() {
  const [data, setData] = useState<ExchangeRateData>(cachedData ?? DEFAULT_DATA);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    const now = Date.now();
    if (cachedData && now - cacheTime < CACHE_DURATION) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((resp: Partial<ExchangeRateResponse> & { rate: number }) => {
        const rate = resp.rate ?? 1450;
        const previousClose = resp.previousClose ?? rate;
        const newData: ExchangeRateData = {
          rate,
          previousClose,
          change: resp.change ?? rate - previousClose,
          changePercent:
            resp.changePercent ??
            (previousClose !== 0 ? ((rate - previousClose) / previousClose) * 100 : 0),
          dayHigh: resp.dayHigh ?? rate,
          dayLow: resp.dayLow ?? rate,
        };
        cachedData = newData;
        cacheTime = Date.now();
        setData(newData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("[useExchangeRate] Failed to fetch exchange rate:", error);
        // 에러 시에도 로딩 해제 (UI 멈춤 방지)
        setLoading(false);
      });
  }, []);

  return { rate: data.rate, data, loading };
}
