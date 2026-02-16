import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  const defaultProps = {
    exchangeRate: 1325.5,
    onAddStock: vi.fn(),
    onOpenSettings: vi.fn(),
  };

  it("앱 제목을 렌더링한다", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Stock Desk")).toBeInTheDocument();
  });

  it("환율을 표시한다", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/1,32[56]/)).toBeInTheDocument();
  });

  it("소수점 환율을 올바르게 표시한다", () => {
    render(<Header {...defaultProps} exchangeRate={1325.5} />);
    // 환율이 반올림되어 표시됨 (1325.5 → 1,326)
    expect(screen.getByText(/1,326/)).toBeInTheDocument();
  });

  it("종목 추가 버튼을 렌더링한다", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole("button", { name: /종목 추가/i })).toBeInTheDocument();
  });

  it("종목 추가 버튼 클릭 시 콜백이 호출된다", async () => {
    const onAddStock = vi.fn();
    render(<Header {...defaultProps} onAddStock={onAddStock} />);
    await userEvent.click(screen.getByRole("button", { name: /종목 추가/i }));
    expect(onAddStock).toHaveBeenCalledTimes(1);
  });

  it("설정 버튼을 렌더링한다", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole("button", { name: /설정/i })).toBeInTheDocument();
  });

  it("설정 버튼 클릭 시 콜백이 호출된다", async () => {
    const onOpenSettings = vi.fn();
    render(<Header {...defaultProps} onOpenSettings={onOpenSettings} />);
    await userEvent.click(screen.getByRole("button", { name: /설정/i }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("header role이 존재한다", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
