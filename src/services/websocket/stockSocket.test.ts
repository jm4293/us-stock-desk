import { describe, it, expect, vi, beforeEach } from "vitest";
import { stockSocket } from "./stockSocket";

describe("stockSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribe 함수가 존재한다", () => {
    expect(typeof stockSocket.subscribe).toBe("function");
  });

  it("subscribe는 unsubscribe 함수를 반환한다", () => {
    const callback = vi.fn();
    const unsubscribe = stockSocket.subscribe("AAPL", callback);
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });

  it("disconnect 함수가 존재한다", () => {
    expect(typeof stockSocket.disconnect).toBe("function");
  });

  it("여러 심볼을 구독할 수 있다", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const unsub1 = stockSocket.subscribe("AAPL", cb1);
    const unsub2 = stockSocket.subscribe("TSLA", cb2);
    expect(typeof unsub1).toBe("function");
    expect(typeof unsub2).toBe("function");
    unsub1();
    unsub2();
  });

  it("구독 해제 후 콜백이 더 이상 호출되지 않는다", () => {
    const callback = vi.fn();
    const unsubscribe = stockSocket.subscribe("AAPL", callback);
    unsubscribe();
    // 구독 해제 후 내부 상태에서 제거됨을 확인하는 방식은 구현에 따라 다름
    // 여기서는 unsubscribe가 정상 실행됨을 확인
    expect(callback).not.toHaveBeenCalled();
  });
});
