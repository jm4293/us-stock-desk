import { useStockStore } from "./stockStore";
import { useSettingsStore } from "./settingsStore";
import { useUIStore } from "./uiStore";

/**
 * 모든 스토어를 초기화 (개발 중 디버깅용)
 */
export const resetAllStores = () => {
  useStockStore.persist.clearStorage();
  useSettingsStore.persist.clearStorage();

  useStockStore.setState({
    stocks: [],
    focusedStockId: null,
    maxZIndex: 0,
  });

  useSettingsStore.setState({
    theme: "dark",
    language: "ko",
    colorScheme: "kr",
    currency: "USD",
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
    stock: useStockStore,
    settings: useSettingsStore,
    ui: useUIStore,
  };
}

export * from "./stockStore";
export * from "./settingsStore";
export * from "./uiStore";
export * from "./toastStore";
