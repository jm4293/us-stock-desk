import { describe, it, expect, beforeEach } from "vitest";
import { useStockStore, useStocks, useFocusedStockId, useStockActions } from "./stockStore";
import { renderHook } from "@testing-library/react";

describe("stockStore", () => {
  beforeEach(() => {
    useStockStore.setState({
      stocks: [],
      focusedStockId: null,
      maxZIndex: 0,
    });
    // localStorage mock 초기화
    localStorage.clear();
  });

  it("초기 상태는 빈 배열이다", () => {
    expect(useStockStore.getState().stocks).toHaveLength(0);
  });

  it("초기 focusedStockId는 null이다", () => {
    expect(useStockStore.getState().focusedStockId).toBeNull();
  });

  it("초기 maxZIndex는 0이다", () => {
    expect(useStockStore.getState().maxZIndex).toBe(0);
  });

  it("addStock으로 종목을 추가한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const stocks = useStockStore.getState().stocks;
    expect(stocks).toHaveLength(1);
    expect(stocks[0].symbol).toBe("AAPL");
    expect(stocks[0].companyName).toBe("Apple Inc.");
  });

  it("addStock은 심볼을 대문자로 저장한다", () => {
    useStockStore.getState().addStock("aapl", "Apple Inc.");
    expect(useStockStore.getState().stocks[0].symbol).toBe("AAPL");
  });

  it("addStock 후 focusedStockId가 새 종목으로 설정된다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const stock = useStockStore.getState().stocks[0];
    expect(useStockStore.getState().focusedStockId).toBe(stock.id);
  });

  it("removeStock으로 종목을 삭제한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().removeStock(id);
    expect(useStockStore.getState().stocks).toHaveLength(0);
  });

  it("removeStock 시 focused 종목이면 focusedStockId를 null로 설정한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().removeStock(id);
    expect(useStockStore.getState().focusedStockId).toBeNull();
  });

  it("removeStock 시 다른 종목의 focusedStockId는 유지된다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    useStockStore.getState().addStock("TSLA", "Tesla Inc.");
    const stocks = useStockStore.getState().stocks;
    const aaplId = stocks[0].id;
    const tslaId = stocks[1].id;
    useStockStore.getState().setFocused(aaplId);
    useStockStore.getState().removeStock(tslaId);
    expect(useStockStore.getState().focusedStockId).toBe(aaplId);
  });

  it("updatePosition으로 위치를 업데이트한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().updatePosition(id, { x: 200, y: 300 });
    const stock = useStockStore.getState().stocks[0];
    expect(stock.position).toEqual({ x: 200, y: 300 });
  });

  it("updateSize로 크기를 업데이트한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().updateSize(id, { width: 500, height: 400 });
    const stock = useStockStore.getState().stocks[0];
    expect(stock.size).toEqual({ width: 500, height: 400 });
  });

  it("setFocused로 focusedStockId를 변경한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().setFocused(id);
    expect(useStockStore.getState().focusedStockId).toBe(id);
  });

  it("setFocused(null)로 focus를 해제한다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().setFocused(id);
    useStockStore.getState().setFocused(null);
    expect(useStockStore.getState().focusedStockId).toBeNull();
  });

  it("bringToFront으로 zIndex를 올린다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    useStockStore.getState().addStock("TSLA", "Tesla Inc.");
    const id = useStockStore.getState().stocks[0].id;
    const prevMaxZIndex = useStockStore.getState().maxZIndex;
    useStockStore.getState().bringToFront(id);
    expect(useStockStore.getState().maxZIndex).toBe(prevMaxZIndex + 1);
  });

  it("bringToFront 후 해당 종목이 focused된다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockStore.getState().stocks[0].id;
    useStockStore.getState().bringToFront(id);
    expect(useStockStore.getState().focusedStockId).toBe(id);
  });

  it("여러 종목을 추가할 때 위치가 오프셋된다", () => {
    useStockStore.getState().addStock("AAPL", "Apple Inc.");
    useStockStore.getState().addStock("TSLA", "Tesla Inc.");
    const stocks = useStockStore.getState().stocks;
    expect(stocks[1].position.x).toBeGreaterThan(stocks[0].position.x);
  });
});

describe("stockStore 셀렉터", () => {
  beforeEach(() => {
    useStockStore.setState({
      stocks: [],
      focusedStockId: null,
      maxZIndex: 0,
    });
    localStorage.clear();
  });

  it("useStocks 셀렉터가 종목 목록을 반환한다", () => {
    const { result } = renderHook(() => useStocks());
    expect(result.current).toEqual([]);
  });

  it("useFocusedStockId 셀렉터가 포커스된 종목 ID를 반환한다", () => {
    const { result } = renderHook(() => useFocusedStockId());
    expect(result.current).toBeNull();
  });

  it("useStockActions 셀렉터가 액션들을 반환한다", () => {
    const { result } = renderHook(() => useStockActions());
    expect(typeof result.current.addStock).toBe("function");
    expect(typeof result.current.removeStock).toBe("function");
    expect(typeof result.current.updatePosition).toBe("function");
    expect(typeof result.current.updateSize).toBe("function");
    expect(typeof result.current.setFocused).toBe("function");
    expect(typeof result.current.bringToFront).toBe("function");
  });
});
