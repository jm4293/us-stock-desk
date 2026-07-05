import { useCallback, useEffect, useState } from "react";
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

// 캐시와 in-flight 프로미스를 모듈 레벨에 두어 훅 인스턴스 N개가 요청을 공유하도록 함
// (훅 인스턴스별 캐시는 마운트마다 각자 네트워크 요청을 발생시켜 캐시 역할을 못 함)
const sharedCache: { data: ExchangeRateData | null; time: number } = { data: null, time: 0 };
let inflightRequest: Promise<ExchangeRateData> | null = null;

function getExchangeRate(): Promise<ExchangeRateData> {
  if (sharedCache.data && Date.now() - sharedCache.time < CACHE_DURATION) {
    return Promise.resolve(sharedCache.data);
  }
  if (!inflightRequest) {
    inflightRequest = fetchExchangeRate()
      .then((newData) => {
        sharedCache.data = newData;
        sharedCache.time = Date.now();
        return newData;
      })
      .finally(() => {
        inflightRequest = null;
      });
  }
  return inflightRequest;
}

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

  const doFetch = useCallback(() => {
    getExchangeRate()
      .then((newData) => {
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
