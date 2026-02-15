export const STORAGE_KEYS = {
  STOCKS: "stockdesk_stocks_v1",
  SETTINGS: "stockdesk_settings_v1",
  THEME: "stockdesk_theme_v1",
  LAYOUT: "stockdesk_layout_v1",
  CACHE: "stockdesk_cache_v1",
} as const;

export const STOCK_BOX = {
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 300,
} as const;

export const CHART_RANGES = {
  "1D": { label: "1일", days: 1 },
  "1W": { label: "1주", days: 7 },
  "1M": { label: "1개월", days: 30 },
  "3M": { label: "3개월", days: 90 },
  "6M": { label: "6개월", days: 180 },
  "1Y": { label: "1년", days: 365 },
} as const;

export const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  language: "ko" as const,
  colorScheme: "kr" as const,
  currency: "USD" as const,
};
