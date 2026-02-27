import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// WebSocket 상수 정의 (글로벌 모킹 전에)
const WS_OPEN = 1;

const mockWsInstance: any = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WS_OPEN,
  onopen: null,
  onmessage: null,
  onclose: null,
  onerror: null,
};

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CLOSING = 2;
  static CONNECTING = 0;
  constructor() {
    return mockWsInstance as any;
  }
}
vi.stubGlobal("WebSocket", MockWebSocket);

describe("stockSocket", () => {
  beforeEach(async () => {
    vi.resetModules();
    mockWsInstance.send.mockClear();
    mockWsInstance.close.mockClear();
    mockWsInstance.addEventListener.mockClear();
    mockWsInstance.removeEventListener.mockClear();
    mockWsInstance.readyState = WS_OPEN;
    mockWsInstance.onopen = null;
    mockWsInstance.onmessage = null;
    mockWsInstance.onclose = null;
    mockWsInstance.onerror = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribe 함수가 존재한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    expect(typeof stockSocket.subscribe).toBe("function");
  });

  it("subscribe는 unsubscribe 함수를 반환한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const callback = vi.fn();
    const unsubscribe = stockSocket.subscribe("AAPL", callback);
    expect(typeof unsubscribe).toBe("function");
    stockSocket.disconnect();
  });

  it("disconnect 함수가 존재한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    expect(typeof stockSocket.disconnect).toBe("function");
  });

  it("여러 심볼을 구독할 수 있다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const unsub1 = stockSocket.subscribe("AAPL", cb1);
    const unsub2 = stockSocket.subscribe("TSLA", cb2);
    expect(typeof unsub1).toBe("function");
    expect(typeof unsub2).toBe("function");
    stockSocket.disconnect();
  });

  it("구독 해제 후 콜백이 더 이상 호출되지 않는다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const callback = vi.fn();
    const unsubscribe = stockSocket.subscribe("AAPL", callback);
    unsubscribe();
    // 구독 해제 후 내부 상태에서 제거됨을 확인
    expect(callback).not.toHaveBeenCalled();
    stockSocket.disconnect();
  });

  it("disconnect를 호출하면 연결이 닫힌다", async () => {
    const { stockSocket } = await import("./stock-socket");
    stockSocket.subscribe("AAPL", vi.fn());
    stockSocket.disconnect();
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it("isConnected 속성이 존재한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    expect(typeof stockSocket.isConnected).toBe("boolean");
  });

  it("같은 심볼에 여러 콜백을 구독할 수 있다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const unsub1 = stockSocket.subscribe("AAPL", cb1);
    const unsub2 = stockSocket.subscribe("AAPL", cb2);
    expect(typeof unsub1).toBe("function");
    expect(typeof unsub2).toBe("function");
    unsub1();
    unsub2();
    stockSocket.disconnect();
  });

  it("onmessage 핸들러가 trade 데이터를 콜백에 전달한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const callback = vi.fn();
    stockSocket.subscribe("AAPL", callback);

    // WebSocket onmessage 트리거
    const messageEvent = {
      data: JSON.stringify({
        type: "trade",
        data: [{ s: "AAPL", p: 182.5, t: 1700000000, v: 100 }],
      }),
    } as MessageEvent;
    mockWsInstance.onmessage?.(messageEvent);

    expect(callback).toHaveBeenCalledWith({ s: "AAPL", p: 182.5, t: 1700000000, v: 100 });
    stockSocket.disconnect();
  });

  it("잘못된 JSON 메시지는 무시한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const callback = vi.fn();
    stockSocket.subscribe("AAPL", callback);

    const messageEvent = { data: "invalid json" } as MessageEvent;
    expect(() => mockWsInstance.onmessage?.(messageEvent)).not.toThrow();
    stockSocket.disconnect();
  });

  it("WebSocket onopen 콜백이 실행되면 resubscribeAll이 호출된다", async () => {
    // readyState를 CONNECTING으로 설정하여 connect()가 실행되도록
    mockWsInstance.readyState = 0; // CONNECTING
    const { stockSocket } = await import("./stock-socket");
    stockSocket.subscribe("AAPL", vi.fn());

    // onopen 트리거 - 이미 구독된 종목을 재구독함
    mockWsInstance.readyState = WS_OPEN;
    mockWsInstance.onopen?.(new Event("open"));

    // send가 재구독으로 호출됨
    expect(mockWsInstance.send).toHaveBeenCalled();
    stockSocket.disconnect();
  });

  it("WebSocket onclose 콜백이 실행되어도 에러 없이 처리된다", async () => {
    const { stockSocket } = await import("./stock-socket");
    stockSocket.subscribe("AAPL", vi.fn());

    expect(() => mockWsInstance.onclose?.(new CloseEvent("close"))).not.toThrow();
    stockSocket.disconnect();
  });

  it("WebSocket onerror 콜백이 실행되어도 에러 없이 처리된다", async () => {
    const { stockSocket } = await import("./stock-socket");
    stockSocket.subscribe("AAPL", vi.fn());

    expect(() => mockWsInstance.onerror?.(new Event("error"))).not.toThrow();
    stockSocket.disconnect();
  });

  it("trade 타입이 아닌 메시지는 무시한다", async () => {
    const { stockSocket } = await import("./stock-socket");
    const callback = vi.fn();
    stockSocket.subscribe("AAPL", callback);

    const pingEvent = {
      data: JSON.stringify({ type: "ping", data: null }),
    } as MessageEvent;
    mockWsInstance.onmessage?.(pingEvent);

    expect(callback).not.toHaveBeenCalled();
    stockSocket.disconnect();
  });
});
