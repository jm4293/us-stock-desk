import { MobileStockCard } from "@/components/organisms";
import { EmptyState } from "@/components/molecules";
import { useStockStore } from "@/stores";
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

interface MobileLayoutProps {
  onRemoveStock: (id: string) => void;
}

export function MobileLayout({ onRemoveStock }: MobileLayoutProps) {
  const stocks = useStockStore((state) => state.stocks);
  const reorderStocks = useStockStore((state) => state.reorderStocks);

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
    <div className="absolute bottom-0 left-0 right-0 top-[52px] overflow-y-auto">
      {stocks.length === 0 ? (
        <EmptyState />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stocks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3 p-4 pb-8">
              {stocks.map((stock) => (
                <MobileStockCard
                  key={stock.id}
                  id={stock.id}
                  symbol={stock.symbol}
                  companyName={stock.companyName}
                  onClose={onRemoveStock}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
