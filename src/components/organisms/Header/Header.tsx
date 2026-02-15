import React from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/Button";

interface HeaderProps {
  exchangeRate: number;
  onAddStock: () => void;
  onOpenSettings: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  exchangeRate,
  onAddStock,
  onOpenSettings,
  className,
}) => {
  const formattedRate = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 1,
  }).format(exchangeRate);

  return (
    <header className={cn("glass flex items-center justify-between px-6 py-3", className)}>
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white">Stock Desk</h1>
        <span className="text-sm text-gray-300">USD/KRW {formattedRate}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onAddStock} aria-label="종목 추가">
          + 종목 추가
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenSettings} aria-label="설정">
          설정
        </Button>
      </div>
    </header>
  );
};

Header.displayName = "Header";
