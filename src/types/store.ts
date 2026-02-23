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
  reorderStocks: (fromIndex: number, toIndex: number) => void;
}

export interface SettingsState {
  theme: "light" | "dark";
  language: "ko" | "en";
  colorScheme: "kr" | "us";
  currency: "USD" | "KRW";
  showChart: boolean;
  showIndexDJI: boolean;
  showIndexSP500: boolean;
  showIndexNASDAQ: boolean;
}

export interface SettingsActions {
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: "ko" | "en") => void;
  setColorScheme: (scheme: "kr" | "us") => void;
  setCurrency: (currency: "USD" | "KRW") => void;
  setShowChart: (show: boolean) => void;
  setShowIndexDJI: (show: boolean) => void;
  setShowIndexSP500: (show: boolean) => void;
  setShowIndexNASDAQ: (show: boolean) => void;
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
