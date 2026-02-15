import React from "react";
import { cn } from "@/utils/cn";
import type { StockPrice } from "@/types/stock";

interface PriceDisplayProps {
  price: StockPrice | null;
  loading?: boolean;
  className?: string;
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatChange(value: number): string {
  if (value >= 0) {
    return `+$${value.toFixed(2)}`;
  }
  return `-$${Math.abs(value).toFixed(2)}`;
}

function formatPercent(value: number): string {
  if (value >= 0) {
    return `+${value.toFixed(2)}%`;
  }
  return `-${Math.abs(value).toFixed(2)}%`;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div data-testid="price-skeleton" className={cn("animate-pulse space-y-2", className)}>
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="h-4 w-24 rounded bg-white/10" />
      </div>
    );
  }

  if (!price) {
    return null;
  }

  const isPositive = price.change >= 0;
  const priceColorClass = isPositive ? "text-up-us" : "text-down-us";

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("text-2xl font-bold", priceColorClass)}>{formatPrice(price.current)}</div>
      <div className="flex items-center gap-2 text-sm">
        <span className={isPositive ? "text-up-us" : "text-down-us"}>
          {formatChange(price.change)}
        </span>
        <span className={isPositive ? "text-up-us" : "text-down-us"}>
          {formatPercent(price.changePercent)}
        </span>
      </div>
    </div>
  );
};

PriceDisplay.displayName = "PriceDisplay";
