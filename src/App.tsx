import { NetworkOfflineBanner, SearchModal, SettingsModal } from "@/components/features";
import {
  BackgroundGradient,
  DesktopLayout,
  Header,
  MobileLayout,
  SplashScreen,
} from "@/components/layout";
import { ToastContainer } from "@/components/ui/Toast";
import { useExchangeRate, useIsMobile, useWakeLock } from "@/hooks";
import i18n from "@/i18n";
import { stockSocket } from "@/services/websocket";
import { useSettingsStore, useShowToast, useStockStore, useUIStore } from "@/stores";
import { cn } from "@/utils/cn";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  useWakeLock();

  const showToast = useShowToast();
  const isMobile = useIsMobile();
  const { rate: exchangeRate } = useExchangeRate();

  const stocks = useStockStore((state) => state.stocks);
  const removeStock = useStockStore((state) => state.removeStock);

  const openSearch = useUIStore((state) => state.openSearch);
  const openSettings = useUIStore((state) => state.openSettings);

  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);

  // WebSocket 초기화 (앱 시작 시 1회)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY as string;
    stockSocket.init(apiKey);
  }, []);

  // 테마 클래스 적용
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  // 언어 동기화
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const handleRemoveStock = (id: string) => {
    const stock = stocks.find((s) => s.id === id);

    removeStock(id);

    if (stock) {
      showToast(t("toast.stockRemoved", { symbol: stock.symbol }), "info");
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "relative h-screen w-screen overflow-hidden",
        isDark ? "bg-gray-950" : "bg-slate-100"
      )}
    >
      {/* 배경 그라디언트 */}
      <BackgroundGradient />

      {/* 스플래시 화면 (React Portal을 사용하여 독립적으로 렌더링됨) */}
      <SplashScreen />

      {/* 네트워크 오프라인 배너 */}
      <NetworkOfflineBanner />

      {/* 헤더 */}
      <Header
        className="relative z-50"
        exchangeRate={exchangeRate}
        onAddStock={openSearch}
        onOpenSettings={openSettings}
      />

      {/* 레이아웃 (모바일 / 데스크톱) */}
      {isMobile ? (
        <MobileLayout onRemoveStock={handleRemoveStock} />
      ) : (
        <DesktopLayout onRemoveStock={handleRemoveStock} />
      )}

      {/* 검색 모달 — 항상 최상단 */}
      <SearchModal />

      {/* 설정 모달 — 항상 최상단 */}
      <SettingsModal />

      {/* 토스트 알림 */}
      <ToastContainer />
    </div>
  );
}

export default App;
