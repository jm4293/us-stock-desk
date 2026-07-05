import { MAX_RECONNECT_ATTEMPTS, RECONNECT_DELAY, WEBSOCKET_URL } from "@/constants";
import type { TradeData, WebSocketMessage } from "@/types";

type TradeCallback = (data: TradeData) => void;
type ErrorCallback = () => void;

class StockSocket {
  private ws: WebSocket | null = null;
  private subscribers = new Map<string, Set<TradeCallback>>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private apiKey = "";
  private onErrorCallbacks = new Set<ErrorCallback>();
  private _connectionFailed = false;
  // disconnect()로 닫은 소켓의 onclose가 재연결을 트리거하지 않도록 구분
  private intentionalClose = false;

  init(apiKey: string) {
    this.apiKey = apiKey;
    this._connectionFailed = false;
    this.intentionalClose = false;
  }

  /** WebSocket 연결 실패 시 호출될 콜백 등록 */
  onConnectionFailed(cb: ErrorCallback): () => void {
    this.onErrorCallbacks.add(cb);
    return () => this.onErrorCallbacks.delete(cb);
  }

  /** 현재 연결이 완전히 실패한 상태인지 (재연결 한도 초과) */
  get connectionFailed(): boolean {
    return this._connectionFailed;
  }

  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
    this.isConnecting = true;
    this.intentionalClose = false;

    const socket = new WebSocket(`${WEBSOCKET_URL}?token=${this.apiKey}`);
    this.ws = socket;

    socket.onopen = () => {
      if (this.ws !== socket) return;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this._connectionFailed = false;
      this.resubscribeAll();
    };

    socket.onmessage = (event: MessageEvent) => {
      if (this.ws !== socket) return;
      try {
        const message: WebSocketMessage = JSON.parse(event.data as string);
        if (message.type === "trade" && message.data) {
          message.data.forEach((trade) => {
            const callbacks = this.subscribers.get(trade.s);
            callbacks?.forEach((cb) => cb(trade));
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    socket.onclose = () => {
      // 교체된(더 이상 현재가 아닌) 소켓의 close 이벤트는 무시
      if (this.ws !== socket) return;
      this.isConnecting = false;
      this.ws = null;
      if (this.intentionalClose) return;
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      if (this.ws !== socket) return;
      this.isConnecting = false;
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this._connectionFailed = true;
      this.onErrorCallbacks.forEach((cb) => cb());
      return;
    }
    this.reconnectTimer = setTimeout(
      () => {
        this.reconnectAttempts++;
        this.connect();
      },
      RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts)
    );
  }

  private resubscribeAll() {
    this.subscribers.forEach((_, symbol) => {
      this.ws?.send(JSON.stringify({ type: "subscribe", symbol }));
    });
  }

  subscribe(symbol: string, callback: TradeCallback): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "subscribe", symbol }));
      } else {
        this.connect();
      }
    }
    this.subscribers.get(symbol)!.add(callback);

    return () => this.unsubscribe(symbol, callback);
  }

  private unsubscribe(symbol: string, callback: TradeCallback) {
    const callbacks = this.subscribers.get(symbol);
    if (!callbacks) return;
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      this.subscribers.delete(symbol);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
      }
    }
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      const socket = this.ws;
      this.ws = null;
      socket.close();
    }
    this.subscribers.clear();
    this.reconnectAttempts = 0;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const stockSocket = new StockSocket();
