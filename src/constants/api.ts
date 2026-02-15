export const API_ENDPOINTS = {
  FINNHUB_BASE: "https://finnhub.io/api/v1",
  PROXY_BASE: "/api",
} as const;

export const WEBSOCKET_URL = "wss://ws.finnhub.io";

export const POLLING_INTERVAL = 10000;
export const RECONNECT_DELAY = 3000;
export const MAX_RECONNECT_ATTEMPTS = 5;
