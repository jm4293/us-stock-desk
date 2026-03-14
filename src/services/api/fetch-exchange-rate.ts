export interface ExchangeRateData {
  rate: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
}

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

export async function fetchExchangeRate(): Promise<ExchangeRateData> {
  const response = await fetch("/api/exchange-rate");
  const resp: Partial<ExchangeRateResponse> & { rate: number } = await response.json();

  const rate = resp.rate ?? 1450;
  const previousClose = resp.previousClose ?? rate;

  return {
    rate,
    previousClose,
    change: resp.change ?? rate - previousClose,
    changePercent:
      resp.changePercent ??
      (previousClose !== 0 ? ((rate - previousClose) / previousClose) * 100 : 0),
    dayHigh: resp.dayHigh ?? rate,
    dayLow: resp.dayLow ?? rate,
  };
}
