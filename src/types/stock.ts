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
