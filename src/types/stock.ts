export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/** 프리마켓 / 애프터마켓 가격 정보 */
export interface ExtendedHoursPrice {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface StockPrice {
  symbol: string;
  current: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  /** 프리마켓 가격 (장 시작 전에만 유효) */
  preMarket?: ExtendedHoursPrice;
  /** 애프터마켓 가격 (장 종료 후에만 유효) */
  postMarket?: ExtendedHoursPrice;

  /** 원본 정규장 가격 (current가 pre/post로 덮어씌워져도 유지됨) */
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

export interface StockChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartTimeRange = "1m" | "5m" | "10m" | "1h" | "1D";
export type MarketStatus = "open" | "closed" | "pre" | "post";
export type IndexSymbol = "^DJI" | "^GSPC" | "^IXIC";
