import { useCallback, useEffect, useRef, useState } from "react";
import { type ExchangeRateData, fetchExchangeRate } from "@/services";

const DEFAULT_DATA: ExchangeRateData = {
  rate: 1450,
  previousClose: 1450,
  change: 0,
  changePercent: 0,
  dayHigh: 1450,
  dayLow: 1450,
};

// 프론트엔드 캐시는 1분 (Vercel Edge Cache s-maxage=60 설정과 동일하게 맞춰 불필요한 네트워크 요청 방지)
const CACHE_DURATION = 60 * 1000;
// 폴링 간격: 캐시와 동일하게 60초
const POLLING_INTERVAL = 60 * 1000;

interface UseExchangeRateReturn {
  rate: number;
  data: ExchangeRateData;
  loading: boolean;
  error: string | null;
}

export function useExchangeRate(): UseExchangeRateReturn {
  const [data, setData] = useState<ExchangeRateData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: ExchangeRateData | null; time: number }>({
    data: null,
    time: 0,
  });

  const doFetch = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    if (cache.data && now - cache.time < CACHE_DURATION) {
      setData(cache.data);
      setLoading(false);
      return;
    }

    fetchExchangeRate()
      .then((newData) => {
        cacheRef.current = { data: newData, time: Date.now() };
        setData(newData);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[useExchangeRate] Failed to fetch exchange rate:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch exchange rate");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    doFetch();

    const interval = setInterval(doFetch, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [doFetch]);

  return { rate: data.rate, data, loading, error };
}
