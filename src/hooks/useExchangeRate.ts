import { useEffect, useState } from "react";

interface ExchangeRateResponse {
  base: string;
  target: string;
  rate: number;
  timestamp: number;
}

let cachedRate: number | null = null;
let cacheTime = 0;
// 프론트엔드 캐시는 1분 (Vercel Edge Cache s-maxage=60 설정과 동일하게 맞춰 불필요한 네트워크 요청 방지)
const CACHE_DURATION = 60 * 1000;

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(cachedRate ?? 1450);
  const [loading, setLoading] = useState(!cachedRate);

  useEffect(() => {
    const now = Date.now();
    if (cachedRate && now - cacheTime < CACHE_DURATION) {
      setRate(cachedRate);
      setLoading(false);
      return;
    }

    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((data: ExchangeRateResponse) => {
        cachedRate = data.rate;
        cacheTime = Date.now();
        setRate(data.rate);
        setLoading(false);
      })
      .catch((error) => {
        console.error("[useExchangeRate] Failed to fetch exchange rate:", error);
        // 에러 시에도 로딩 해제 (UI 멈춤 방지)
        setLoading(false);
      });
  }, []);

  return { rate, loading };
}
