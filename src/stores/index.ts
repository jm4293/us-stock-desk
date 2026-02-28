import { useSettingsStore } from "./settings-store";
import { useStockBoxStore } from "./stock-box-store";
import { useUIStore } from "./ui-store";

/**
 * 모든 스토어를 초기화 (개발 중 디버깅용)
 */
export const resetAllStores = () => {
  useStockBoxStore.persist.clearStorage();
  useSettingsStore.persist.clearStorage();

  useStockBoxStore.setState({
    stocks: [],
    focusedStockId: null,
    maxZIndex: 0,
  });

  useSettingsStore.setState({
    theme: "dark",
    language: "ko",
    colorScheme: "kr",
    currency: "USD",
    showChart: true,
    showIndexDJI: true,
    showIndexSP500: true,
    showIndexNASDAQ: true,
    showExchangeRate: true,
  });

  useUIStore.setState({
    isSearchOpen: false,
    isSettingsOpen: false,
    isLoading: false,
  });
};

/**
 * 개발 환경에서 window에 디버그 함수 노출
 */
if (import.meta.env.DEV) {
  (window as Window & { resetStores?: typeof resetAllStores; stores?: object }).resetStores =
    resetAllStores;
  (window as Window & { resetStores?: typeof resetAllStores; stores?: object }).stores = {
    stock: useStockBoxStore,
    settings: useSettingsStore,
    ui: useUIStore,
  };
}

export * from "./settings-store";
export * from "./stock-box-store";
export * from "./stock-index-store";
export * from "./toast-store";
export * from "./ui-store";
