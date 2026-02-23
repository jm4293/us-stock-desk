export const STORAGE_KEYS = {
  STOCKS: "stockdesk_stocks_v2",
  SETTINGS: "stockdesk_settings_v2",
  THEME: "stockdesk_theme_v1",
  LAYOUT: "stockdesk_layout_v1",
  INDEX_LAYOUT: "stockdesk_index_layout_v1",
  CACHE: "stockdesk_cache_v1",
} as const;

export const STOCK_BOX = {
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  DEFAULT_WIDTH: 300,
  DEFAULT_HEIGHT: 300,
} as const;
