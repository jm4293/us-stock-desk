import { DesktopLayout, Header, MobileLayout, ToastContainer } from "@/components";
import { SearchModal, SettingsModal } from "@/features";
import { useAppInit, useApplyTheme, useIsMobile, useLanguage, useWakeLock } from "@/hooks";
import { selectShowToast, useStockBoxStore, useToastStore, useUIStore } from "@/stores";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  useAppInit();
  useLanguage();
  useWakeLock();
  const showToast = useToastStore(selectShowToast);
  const isMobile = useIsMobile();
  const theme = useApplyTheme();
  const isDark = theme === "dark";

  const handleRemoveStock = (id: string) => {
    const stock = useStockBoxStore.getState().stocks.find((s) => s.id === id);
    useStockBoxStore.getState().removeStock(id);

    if (stock) {
      showToast(t("toast.stockRemoved", { symbol: stock.symbol }), "info");
    }
  };

  const handleOpenSearch = () => {
    useUIStore.getState().openSearch();
  };

  const handleOpenSettings = () => {
    useUIStore.getState().openSettings();
  };

  return (
    <div
      className={cn(
        "relative h-screen w-screen overflow-hidden",
        isDark ? "bg-gray-950" : "bg-slate-100"
      )}
    >
      <Header
        className="relative z-50"
        onAddStock={handleOpenSearch}
        onOpenSettings={handleOpenSettings}
      />

      {isMobile ? (
        <MobileLayout onRemoveStock={handleRemoveStock} />
      ) : (
        <DesktopLayout onRemoveStock={handleRemoveStock} />
      )}

      <SearchModal />
      <SettingsModal />
      <ToastContainer />
    </div>
  );
}

export default App;
