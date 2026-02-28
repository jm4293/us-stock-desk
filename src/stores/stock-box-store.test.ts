import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  selectAddStock,
  selectBringToFront,
  selectFocusedStockId,
  selectRemoveStock,
  selectSetFocused,
  selectStocks,
  selectUpdatePosition,
  selectUpdateSize,
  useStockBoxStore,
} from "./stock-box-store";

describe("stockStore", () => {
  beforeEach(() => {
    useStockBoxStore.setState({
      stocks: [],
      focusedStockId: null,
      maxZIndex: 0,
    });
    // localStorage mock 초기화
    localStorage.clear();
  });

  it("초기 상태는 빈 배열이다", () => {
    expect(useStockBoxStore.getState().stocks).toHaveLength(0);
  });

  it("초기 focusedStockId는 null이다", () => {
    expect(useStockBoxStore.getState().focusedStockId).toBeNull();
  });

  it("초기 maxZIndex는 0이다", () => {
    expect(useStockBoxStore.getState().maxZIndex).toBe(0);
  });

  it("addStock으로 종목을 추가한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const stocks = useStockBoxStore.getState().stocks;
    expect(stocks).toHaveLength(1);
    expect(stocks[0].symbol).toBe("AAPL");
    expect(stocks[0].companyName).toBe("Apple Inc.");
  });

  it("addStock은 심볼을 대문자로 저장한다", () => {
    useStockBoxStore.getState().addStock("aapl", "Apple Inc.");
    expect(useStockBoxStore.getState().stocks[0].symbol).toBe("AAPL");
  });

  it("addStock 후 focusedStockId가 새 종목으로 설정된다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const stock = useStockBoxStore.getState().stocks[0];
    expect(useStockBoxStore.getState().focusedStockId).toBe(stock.id);
  });

  it("removeStock으로 종목을 삭제한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().removeStock(id);
    expect(useStockBoxStore.getState().stocks).toHaveLength(0);
  });

  it("removeStock 시 focused 종목이면 focusedStockId를 null로 설정한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().removeStock(id);
    expect(useStockBoxStore.getState().focusedStockId).toBeNull();
  });

  it("removeStock 시 다른 종목의 focusedStockId는 유지된다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    useStockBoxStore.getState().addStock("TSLA", "Tesla Inc.");
    const stocks = useStockBoxStore.getState().stocks;
    const aaplId = stocks[0].id;
    const tslaId = stocks[1].id;
    useStockBoxStore.getState().setFocused(aaplId);
    useStockBoxStore.getState().removeStock(tslaId);
    expect(useStockBoxStore.getState().focusedStockId).toBe(aaplId);
  });

  it("updatePosition으로 위치를 업데이트한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().updatePosition(id, { x: 200, y: 300 });
    const stock = useStockBoxStore.getState().stocks[0];
    expect(stock.position).toEqual({ x: 200, y: 300 });
  });

  it("updateSize로 크기를 업데이트한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().updateSize(id, { width: 500, height: 400 });
    const stock = useStockBoxStore.getState().stocks[0];
    expect(stock.size).toEqual({ width: 500, height: 400 });
  });

  it("setFocused로 focusedStockId를 변경한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().setFocused(id);
    expect(useStockBoxStore.getState().focusedStockId).toBe(id);
  });

  it("setFocused(null)로 focus를 해제한다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().setFocused(id);
    useStockBoxStore.getState().setFocused(null);
    expect(useStockBoxStore.getState().focusedStockId).toBeNull();
  });

  it("bringToFront으로 zIndex를 올린다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    useStockBoxStore.getState().addStock("TSLA", "Tesla Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    const prevMaxZIndex = useStockBoxStore.getState().maxZIndex;
    useStockBoxStore.getState().bringToFront(id);
    expect(useStockBoxStore.getState().maxZIndex).toBe(prevMaxZIndex + 1);
  });

  it("bringToFront 후 해당 종목이 focused된다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    const id = useStockBoxStore.getState().stocks[0].id;
    useStockBoxStore.getState().bringToFront(id);
    expect(useStockBoxStore.getState().focusedStockId).toBe(id);
  });

  it("여러 종목을 추가할 때 위치가 오프셋된다", () => {
    useStockBoxStore.getState().addStock("AAPL", "Apple Inc.");
    useStockBoxStore.getState().addStock("TSLA", "Tesla Inc.");
    const stocks = useStockBoxStore.getState().stocks;
    expect(stocks[1].position.x).toBeGreaterThan(stocks[0].position.x);
  });
});

describe("stockStore 셀렉터", () => {
  beforeEach(() => {
    useStockBoxStore.setState({
      stocks: [],
      focusedStockId: null,
      maxZIndex: 0,
    });
    localStorage.clear();
  });

  it("useStocks 셀렉터가 종목 목록을 반환한다", () => {
    const { result } = renderHook(() => useStockBoxStore(selectStocks));
    expect(result.current).toEqual([]);
  });

  it("useFocusedStockId 셀렉터가 포커스된 종목 ID를 반환한다", () => {
    const { result } = renderHook(() => useStockBoxStore(selectFocusedStockId));
    expect(result.current).toBeNull();
  });

  it("useStockActions 셀렉터가 액션들을 반환한다", () => {
    const { result: addStockResult } = renderHook(() => useStockBoxStore(selectAddStock));
    const { result: removeStockResult } = renderHook(() => useStockBoxStore(selectRemoveStock));
    const { result: updatePositionResult } = renderHook(() =>
      useStockBoxStore(selectUpdatePosition)
    );
    const { result: updateSizeResult } = renderHook(() => useStockBoxStore(selectUpdateSize));
    const { result: setFocusedResult } = renderHook(() => useStockBoxStore(selectSetFocused));
    const { result: bringToFrontResult } = renderHook(() => useStockBoxStore(selectBringToFront));

    expect(typeof addStockResult.current).toBe("function");
    expect(typeof removeStockResult.current).toBe("function");
    expect(typeof updatePositionResult.current).toBe("function");
    expect(typeof updateSizeResult.current).toBe("function");
    expect(typeof setFocusedResult.current).toBe("function");
    expect(typeof bringToFrontResult.current).toBe("function");
  });
});
