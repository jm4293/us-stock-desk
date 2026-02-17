import { EmptyState } from "@/components/molecules";
import { StockBox } from "@/components/organisms";
import { useStockStore } from "@/stores";

interface DesktopCanvasProps {
  onRemoveStock: (id: string) => void;
}

export function DesktopLayout({ onRemoveStock }: DesktopCanvasProps) {
  const stocks = useStockStore((state) => state.stocks);
  const focusedStockId = useStockStore((state) => state.focusedStockId);
  const updatePosition = useStockStore((state) => state.updatePosition);
  const updateSize = useStockStore((state) => state.updateSize);
  const bringToFront = useStockStore((state) => state.bringToFront);

  return (
    <div id="stock-canvas" className="absolute bottom-0 left-0 right-0 top-[52px] overflow-hidden">
      {stocks.length === 0 ? (
        <EmptyState />
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
            onClose={onRemoveStock}
            onPositionChange={updatePosition}
            onSizeChange={updateSize}
          />
        ))
      )}
    </div>
  );
}
