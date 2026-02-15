export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface FinnhubQuote {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface FinnhubCandle {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

export interface TradeData {
  s: string;
  p: number;
  t: number;
  v: number;
}

export interface WebSocketMessage {
  type: "trade" | "ping" | "error";
  data: TradeData[] | null;
}

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  timestamp: number;
}
