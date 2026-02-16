import { Header } from "@/components/organisms/Header";
import { MobileStockCard } from "@/components/organisms/MobileStockCard/MobileStockCard";
import { SearchModal } from "@/components/organisms/SearchModal/SearchModal";
import { SettingsModal } from "@/components/organisms/SettingsModal/SettingsModal";
import { StockBox } from "@/components/organisms/StockBox";
import { NetworkOfflineBanner } from "@/components/molecules/NetworkOfflineBanner/NetworkOfflineBanner";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useWakeLock } from "@/hooks/useWakeLock";
import { stockSocket } from "@/services/websocket/stockSocket";
import { useSettingsStore } from "@/stores/settingsStore";
import { useStockStore } from "@/stores/stockStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  const stocks = useStockStore((state) => state.stocks);
  const focusedStockId = useStockStore((state) => state.focusedStockId);
  const removeStock = useStockStore((state) => state.removeStock);
  const updatePosition = useStockStore((state) => state.updatePosition);
  const updateSize = useStockStore((state) => state.updateSize);
  const bringToFront = useStockStore((state) => state.bringToFront);
  const reorderStocks = useStockStore((state) => state.reorderStocks);

  const openSearch = useUIStore((state) => state.openSearch);
  const openSettings = useUIStore((state) => state.openSettings);

  const theme = useSettingsStore((state) => state.theme);
  const { rate: exchangeRate } = useExchangeRate();
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  useWakeLock();

  // WebSocket 초기화 (앱 시작 시 1회)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY as string;
    stockSocket.init(apiKey);
  }, []);

  // 테마 클래스 적용
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const isDark = theme === "dark";

  // dnd-kit 센서 (터치 + 포인터 모두 지원)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = stocks.findIndex((s) => s.id === active.id);
    const toIndex = stocks.findIndex((s) => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderStocks(fromIndex, toIndex);
    }
  };

  return (
    <div
      className={cn(
        "relative h-screen w-screen overflow-hidden",
        isDark ? "bg-gray-950" : "bg-slate-100"
      )}
    >
      {/* 배경 그라디언트 */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-gradient-to-br from-blue-950/30 via-gray-950 to-purple-950/30"
            : "bg-gradient-to-br from-blue-100/80 via-slate-50 to-purple-100/80"
        )}
      />

      {/* 네트워크 오프라인 배너 */}
      <NetworkOfflineBanner isOnline={isOnline} />

      {/* 헤더 */}
      <div className="relative z-50">
        <Header exchangeRate={exchangeRate} onAddStock={openSearch} onOpenSettings={openSettings} />
      </div>

      {/* ── 모바일 레이아웃 ── */}
      {isMobile ? (
        <div className="absolute bottom-0 left-0 right-0 top-[52px] overflow-y-auto">
          {stocks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                Stock Desk
              </p>
              <p className={cn("text-sm", isDark ? "text-gray-400" : "text-slate-500")}>
                {t("search.empty")}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stocks.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3 p-4 pb-8">
                  {stocks.map((stock) => (
                    <MobileStockCard
                      key={stock.id}
                      id={stock.id}
                      symbol={stock.symbol}
                      companyName={stock.companyName}
                      onClose={removeStock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      ) : (
        /* ── 데스크톱 레이아웃 ── */
        <div
          id="stock-canvas"
          className="absolute bottom-0 left-0 right-0 top-[52px] overflow-hidden"
        >
          {stocks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                Stock Desk
              </p>
              <p className={cn("text-sm", isDark ? "text-gray-400" : "text-slate-500")}>
                {t("search.empty")}
              </p>
            </div>
          ) : (
            stocks.map((stock) => (
              <StockBox
                key={stock.id}
                id={stock.id}
                symbol={stock.symbol}
                companyName={stock.companyName}
                position={stock.position}
                size={stock.size}
                zIndex={stock.zIndex}
                focused={focusedStockId === stock.id}
                onFocus={bringToFront}
                onClose={removeStock}
                onPositionChange={updatePosition}
                onSizeChange={updateSize}
              />
            ))
          )}
        </div>
      )}

      {/* 검색 모달 — 항상 최상단 */}
      <SearchModal />

      {/* 설정 모달 — 항상 최상단 */}
      <SettingsModal />
    </div>
  );
}

export default App;
