import { useState, useEffect } from "react";

interface ExchangeRateResponse {
  base: string;
  target: string;
  rate: number;
  timestamp: number;
}

let cachedRate: number | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

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
        setLoading(false);
      });
  }, []);

  return { rate, loading };
}
