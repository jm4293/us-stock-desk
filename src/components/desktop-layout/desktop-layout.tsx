import { EmptyState } from "@/components";
import { DesktopStockBox, MarketIndexExchangeContainer } from "@/features";
import { useStockBoxStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";

interface DesktopCanvasProps {
  onRemoveStock: (id: string) => void;
}

export function DesktopLayout({ onRemoveStock }: DesktopCanvasProps) {
  // shallow equality로 배열 내부 객체 변경 시에만 리렌더 (원시 값 구독 최적화)
  const { stocks, focusedStockId } = useStockBoxStore(
    useShallow((state) => ({
      stocks: state.stocks,
      focusedStockId: state.focusedStockId,
    }))
  );

  // 이벤트 핸들러만 사용하는 액션들은 getState()로 호출하여 리렌더 방지
  const handleFocus = (id: string) => {
    useStockBoxStore.getState().bringToFront(id);
  };

  const handlePositionChange = (id: string, position: { x: number; y: number }) => {
    useStockBoxStore.getState().updatePosition(id, position);
  };

  const handleSizeChange = (id: string, size: { width: number; height: number }) => {
    useStockBoxStore.getState().updateSize(id, size);
  };

  return (
    <div id="stock-canvas" className="absolute bottom-0 left-0 right-0 top-[52px] overflow-hidden">
      {stocks.length === 0 && <EmptyState />}
      <MarketIndexExchangeContainer />
      {stocks.map((stock) => (
        <DesktopStockBox
          key={stock.id}
          id={stock.id}
          symbol={stock.symbol}
          companyName={stock.companyName}
          position={stock.position}
          size={stock.size}
          zIndex={stock.zIndex}
          focused={focusedStockId === stock.id}
          onFocus={handleFocus}
          onClose={onRemoveStock}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
        />
      ))}
    </div>
  );
}
