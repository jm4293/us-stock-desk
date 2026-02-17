export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface StockBox {
  id: string;
  symbol: string;
  companyName: string;
  position: Position;
  size: Size;
  zIndex: number;
  created: number;
  updated: number;
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
}

export interface StockChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartTimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";
export type MarketStatus = "open" | "closed" | "pre" | "post";
