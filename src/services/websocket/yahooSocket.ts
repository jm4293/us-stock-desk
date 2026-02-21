import protobuf from "protobufjs/light";

// Yahoo Finance WebSocket Protobuf schema
// Derived from https://github.com/gadicc/node-yahoo-finance2/blob/devel/src/lib/quoteStream.ts
const root = protobuf.Root.fromJSON({
  nested: {
    yaticker: {
      fields: {
        id: { id: 1, type: "string" },
        price: { id: 2, type: "float" },
        time: { id: 3, type: "uint64" },
        currency: { id: 4, type: "string" },
        exchange: { id: 5, type: "string" },
        quoteType: { id: 6, type: "int32" },
        marketHours: { id: 7, type: "int32" },
        changePercent: { id: 8, type: "float" },
        dayVolume: { id: 9, type: "uint64" },
        dayHigh: { id: 10, type: "float" },
        dayLow: { id: 11, type: "float" },
        change: { id: 12, type: "float" },
        shortName: { id: 13, type: "string" },
        expireDate: { id: 14, type: "uint64" },
        openPrice: { id: 15, type: "float" },
        previousClose: { id: 16, type: "float" },
        strikePrice: { id: 17, type: "float" },
        underlyingSymbol: { id: 18, type: "string" },
        openInterest: { id: 19, type: "uint64" },
        optionsType: { id: 20, type: "int32" },
        miniOption: { id: 21, type: "uint64" },
        lastSize: { id: 22, type: "uint64" },
        bid: { id: 23, type: "float" },
        bidSize: { id: 24, type: "uint64" },
        ask: { id: 25, type: "float" },
        askSize: { id: 26, type: "uint64" },
        priceHint: { id: 27, type: "uint64" },
        vol_24hr: { id: 28, type: "uint64" },
        volAllCurrencies: { id: 29, type: "uint64" },
        fromcurrency: { id: 30, type: "string" },
        lastMarket: { id: 31, type: "string" },
        circulatingSupply: { id: 32, type: "double" },
        marketcap: { id: 33, type: "double" },
      },
    },
  },
});

const Yaticker = root.lookupType("yaticker");

export interface YahooTradeData {
  id: string; // symbol
  price: number;
  time: number;
  changePercent?: number;
  dayVolume?: number;
  change?: number;
  previousClose?: number;
  marketHours?: number; // 0=PRE, 1=REGULAR, 2=POST, 3=EXTENDED
}

type TradeCallback = (trade: YahooTradeData) => void;

class YahooSocket {
  private ws: WebSocket | null = null;
  private url = "wss://streamer.finance.yahoo.com";
  private subscriptions = new Set<string>();
  private callbacks = new Map<string, Set<TradeCallback>>();

  // 재연결 관련 상태
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly BASE_RECONNECT_DELAY = 1000;

  private connectionFailedCallback: (() => void) | null = null;

  public onConnectionFailed(callback: () => void) {
    this.connectionFailedCallback = callback;
    // 반환값으로 unregister 함수 제공
    return () => {
      if (this.connectionFailedCallback === callback) {
        this.connectionFailedCallback = null;
      }
    };
  }

  public init() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.reconnectAttempts = 0;
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("[YahooSocket] Connected to wss://streamer.finance.yahoo.com");
        this.reconnectAttempts = 0;
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error("[YahooSocket] WebSocket Error:", error);
      };

      this.ws.onclose = (event) => {
        console.log(`[YahooSocket] Disconnected (code: ${event.code}). Reason: ${event.reason}`);
        this.ws = null;
        this.scheduleReconnect();
      };
    } catch (err) {
      console.error("[YahooSocket] Connection failed:", err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.warn(
        `[YahooSocket] Reached maximum reconnect attempts (${this.MAX_RECONNECT_ATTEMPTS}). Giving up.`
      );
      this.connectionFailedCallback?.();
      return;
    }

    // 지수 백오프 (1s, 2s, 4s, 8s, 16s...)
    const delay = this.BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts);
    console.log(
      `[YahooSocket] Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private handleMessage(data: Blob | string) {
    if (typeof data !== "string") {
      // Yahoo Finance sends Base64 encoded Protobuf strings.
      // If we receive a Blob (rare for this endpoint), ignore or convert.
      return;
    }

    try {
      // 1. Base64 Decode
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Protobuf Decode
      const message = Yaticker.decode(bytes);
      // To strictly type, we cast the message to our interface
      const trade = Yaticker.toObject(message, {
        enums: String,
        longs: Number,
        defaults: true,
      }) as unknown as YahooTradeData;

      // 3. Dispatch to callbacks
      const callbacks = this.callbacks.get(trade.id);
      if (callbacks && callbacks.size > 0) {
        callbacks.forEach((cb) => cb(trade));
      }
    } catch (err) {
      // Fail silently for bad ticks, or log in debug mode
      // console.error("[YahooSocket] Failed to decode message", err);
    }
  }

  private resubscribeAll() {
    if (this.ws?.readyState === WebSocket.OPEN && this.subscriptions.size > 0) {
      const msg = {
        subscribe: Array.from(this.subscriptions),
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  public subscribe(symbol: string, callback: TradeCallback) {
    // 저장 (콜백 관리)
    if (!this.callbacks.has(symbol)) {
      this.callbacks.set(symbol, new Set());
    }
    this.callbacks.get(symbol)!.add(callback);

    // 새 구독인 경우 Set에 추가 후 서버에 전송
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.add(symbol);

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ subscribe: [symbol] }));
      } else if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        // 소켓이 죽어있으면 연결 시도
        this.init();
      }
    }

    // unsubscribe 함수 반환
    return () => {
      this.unsubscribe(symbol, callback);
    };
  }

  private unsubscribe(symbol: string, callback: TradeCallback) {
    const callbacks = this.callbacks.get(symbol);
    if (callbacks) {
      callbacks.delete(callback);

      // 해당 심볼을 구독하는 컴포넌트가 더 이상 없다면
      if (callbacks.size === 0) {
        this.subscriptions.delete(symbol);
        this.callbacks.delete(symbol);

        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ unsubscribe: [symbol] }));
        }

        // 구독하는 종목이 하나도 안 남았다면 연결 종료
        if (this.subscriptions.size === 0 && this.ws) {
          this.close();
        }
      }
    }
  }

  public close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    // 콜백은 보존하거나 비울 수 있지만 안전하게 비우기 (일반적으로 React가 언마운트 시 unsubscribe를 완벽히 하므로 안전함)
    this.callbacks.clear();
  }
}

// 싱글턴 인스턴스 내보내기
export const yahooSocket = new YahooSocket();
