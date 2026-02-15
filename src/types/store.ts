import type { Position, Size, StockBox } from "./stock";

export interface StockState {
  stocks: StockBox[];
  focusedStockId: string | null;
  maxZIndex: number;
}

export interface StockActions {
  addStock: (symbol: string, companyName: string) => void;
  removeStock: (id: string) => void;
  updatePosition: (id: string, position: Position) => void;
  updateSize: (id: string, size: Size) => void;
  setFocused: (id: string | null) => void;
  bringToFront: (id: string) => void;
}

export interface SettingsState {
  theme: "light" | "dark";
  language: "ko" | "en";
  colorScheme: "kr" | "us";
  currency: "USD" | "KRW";
}

export interface SettingsActions {
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: "ko" | "en") => void;
  setColorScheme: (scheme: "kr" | "us") => void;
  setCurrency: (currency: "USD" | "KRW") => void;
}

export interface UIState {
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
}

export interface UIActions {
  openSearch: () => void;
  closeSearch: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setLoading: (loading: boolean) => void;
}
