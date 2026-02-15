import React from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/Button";
import type { Position, Size } from "@/types/stock";

interface StockBoxProps {
  id: string;
  symbol: string;
  companyName: string;
  position: Position;
  size: Size;
  zIndex: number;
  focused: boolean;
  loading?: boolean;
  error?: string;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onPositionChange: (id: string, position: Position) => void;
  onSizeChange: (id: string, size: Size) => void;
}

export const StockBox: React.FC<StockBoxProps> = ({
  id,
  symbol,
  companyName,
  position,
  size,
  zIndex,
  focused,
  loading = false,
  error,
  onFocus,
  onClose,
  onPositionChange,
  onSizeChange,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  if (loading) {
    return (
      <Rnd position={position} size={size} style={{ zIndex }} minWidth={300} minHeight={200}>
        <div
          data-testid="stock-box-skeleton"
          className="glass h-full w-full animate-pulse rounded-xl p-4"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-5 w-16 rounded bg-white/10" />
              <div className="h-3 w-24 rounded bg-white/10" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-32 rounded bg-white/10" />
            <div className="h-4 w-24 rounded bg-white/10" />
          </div>
        </div>
      </Rnd>
    );
  }

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={(_, d) => onPositionChange(id, { x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) => {
        onSizeChange(id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        onPositionChange(id, pos);
      }}
      style={{ zIndex }}
      minWidth={300}
      minHeight={200}
    >
      <div
        data-testid="stock-box"
        role="button"
        tabIndex={0}
        className={cn(
          "glass h-full w-full rounded-xl p-4 transition-all duration-200",
          focused && "z-50 shadow-2xl ring-1 ring-white/30"
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick(e as unknown as React.MouseEvent);
        }}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{symbol}</h3>
            <p className="text-xs text-gray-400">{companyName}</p>
          </div>
          <Button variant="ghost" size="sm" aria-label="닫기" onClick={handleClose}>
            ✕
          </Button>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </Rnd>
  );
};

StockBox.displayName = "StockBox";
