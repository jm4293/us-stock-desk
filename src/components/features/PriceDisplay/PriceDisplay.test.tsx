import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriceDisplay } from "./PriceDisplay";
import type { StockPrice } from "@/types/stock";

describe("PriceDisplay", () => {
  const mockPrice: StockPrice = {
    symbol: "AAPL",
    current: 182.5,
    open: 180.0,
    high: 184.0,
    low: 179.5,
    close: 180.0,
    change: 2.5,
    changePercent: 1.39,
    volume: 50000000,
    timestamp: Date.now(),
  };

  it("현재가를 렌더링한다", () => {
    render(<PriceDisplay price={mockPrice} />);
    expect(screen.getByText("$182.50")).toBeInTheDocument();
  });

  it("상승 시 양수 변동을 표시한다", () => {
    render(<PriceDisplay price={mockPrice} />);
    expect(screen.getByText("+$2.50")).toBeInTheDocument();
    expect(screen.getByText("+1.39%")).toBeInTheDocument();
  });

  it("하락 시 음수 변동을 표시한다", () => {
    const downPrice: StockPrice = { ...mockPrice, change: -2.5, changePercent: -1.39 };
    render(<PriceDisplay price={downPrice} />);
    expect(screen.getByText("-$2.50")).toBeInTheDocument();
    expect(screen.getByText("-1.39%")).toBeInTheDocument();
  });

  it("상승 시 상승 색상 스타일을 적용한다", () => {
    render(<PriceDisplay price={mockPrice} />);
    const priceEl = screen.getByText("$182.50");
    expect(priceEl).toHaveClass("text-up-us");
  });

  it("하락 시 하락 색상 스타일을 적용한다", () => {
    const downPrice: StockPrice = { ...mockPrice, change: -2.5, changePercent: -1.39 };
    render(<PriceDisplay price={downPrice} />);
    const priceEl = screen.getByText("$182.50");
    expect(priceEl).toHaveClass("text-down-us");
  });

  it("loading 상태에서 스켈레톤을 표시한다", () => {
    render(<PriceDisplay price={null} loading />);
    expect(screen.getByTestId("price-skeleton")).toBeInTheDocument();
  });

  it("loading이 false이고 price가 null이면 빈 상태를 표시한다", () => {
    render(<PriceDisplay price={null} />);
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it("변동이 0이면 중립 스타일을 적용한다", () => {
    const neutralPrice: StockPrice = { ...mockPrice, change: 0, changePercent: 0 };
    render(<PriceDisplay price={neutralPrice} />);
    expect(screen.getByText("$182.50")).toBeInTheDocument();
  });
});
