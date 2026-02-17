import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StockBox } from "./StockBox";

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return {
    ...actual,
    useStockData: () => ({ state: { status: "idle" }, refetch: vi.fn(), isWebSocket: false }),
    useChartData: () => ({ state: { status: "idle" } }),
    useMarketStatus: () => ({ status: "open", isRegularHours: true }),
  };
});

vi.mock("@/stores", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/stores")>();
  return {
    ...actual,
    useShowChart: () => true,
    useTheme: () => "dark",
    useColorScheme: () => "kr",
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("StockBox", () => {
  const defaultProps = {
    id: "test-id",
    symbol: "AAPL",
    companyName: "Apple Inc.",
    position: { x: 100, y: 100 },
    size: { width: 400, height: 300 },
    zIndex: 1,
    focused: false,
    onFocus: vi.fn(),
    onClose: vi.fn(),
    onPositionChange: vi.fn(),
    onSizeChange: vi.fn(),
  };

  it("종목 심볼을 렌더링한다", () => {
    render(<StockBox {...defaultProps} />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
  });

  it("회사명을 렌더링한다", () => {
    render(<StockBox {...defaultProps} />);
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
  });

  it("닫기 버튼을 렌더링한다", () => {
    render(<StockBox {...defaultProps} />);
    expect(screen.getByRole("button", { name: /닫기/i })).toBeInTheDocument();
  });

  it("닫기 버튼 클릭 시 onClose가 id와 함께 호출된다", async () => {
    const onClose = vi.fn();
    render(<StockBox {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /닫기/i }));
    expect(onClose).toHaveBeenCalledWith("test-id");
  });

  it("클릭 시 onFocus가 호출된다", async () => {
    const onFocus = vi.fn();
    render(<StockBox {...defaultProps} onFocus={onFocus} />);
    await userEvent.click(screen.getByTestId("stock-box"));
    expect(onFocus).toHaveBeenCalledWith("test-id");
  });

  it("focused 상태에서 강조 스타일을 적용한다", () => {
    render(<StockBox {...defaultProps} focused />);
    expect(screen.getByTestId("stock-box")).toHaveClass("z-50");
  });

  it("focused가 아닐 때 기본 스타일을 적용한다", () => {
    render(<StockBox {...defaultProps} focused={false} />);
    const box = screen.getByTestId("stock-box");
    expect(box).not.toHaveClass("z-50");
  });

  it("로딩 상태에서 스켈레톤을 표시한다", () => {
    render(<StockBox {...defaultProps} loading />);
    expect(screen.getByTestId("stock-box-skeleton")).toBeInTheDocument();
  });

  it("에러 상태에서 에러 메시지를 표시한다", () => {
    render(<StockBox {...defaultProps} error="데이터 로드 실패" />);
    expect(screen.getByText("데이터 로드 실패")).toBeInTheDocument();
  });
});
