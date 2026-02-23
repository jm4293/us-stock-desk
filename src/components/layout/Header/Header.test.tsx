import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  const defaultProps = {
    onAddStock: vi.fn(),
    onOpenSettings: vi.fn(),
  };

  it("앱 제목을 렌더링한다", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("US Stock Desk")).toBeInTheDocument();
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
