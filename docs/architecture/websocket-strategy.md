# WebSocket 연결 전략 가이드

> 실시간 주식 데이터를 위한 WebSocket 구현 및 재연결 메커니즘

---

## 📋 목차

1. [개요](#개요)
2. [WebSocket 구현 개요](#websocket-구현-개요)
3. [Finnhub WebSocket](#finnhub-websocket)
4. [Yahoo Finance WebSocket](#yahoo-finance-websocket)
5. [재연결 전략](#재연결-전략)
6. [Protobuf 디코딩](#protobuf-디코딩)
7. [에러 처리 및 Fallback](#에러-처리-및-fallback)
8. [React Hook 통합](#react-hook-통합)

---

## 개요

Stock Desk는 실시간 주식 데이터를 위해 **2개의 WebSocket 연결**을 사용합니다:

| WebSocket         | 역할                                | 데이터 형식 | API 키    |
| ----------------- | ----------------------------------- | ----------- | --------- |
| **Finnhub**       | 실시간 거래 데이터                  | JSON        | ✅ 필요   |
| **Yahoo Finance** | 확장시간 거래 (프리마켓/애프터마켓) | Protobuf    | ❌ 불필요 |

---

## WebSocket 구현 개요

### 파일 구조

```
src/services/websocket/
├── index.ts                # Barrel export
├── stock-socket.ts         # Finnhub WebSocket (Singleton)
├── yahoo-socket.ts         # Yahoo Finance WebSocket (Singleton)
└── stockSocket.test.ts     # Unit tests
```

### 싱글톤 패턴

```ts
// stock-socket.ts
class StockSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Set<TradeCallback>>();
  // ...
}

export const stockSocket = new StockSocket(); // ✅ Singleton
```

**장점:**

- 애플리케이션 전체에서 단일 연결 공유
- 중복 구독 방지
- 효율적인 리소스 사용

---

## Finnhub WebSocket

### 기본 정보

**URL:** `wss://ws.finnhub.io?token={API_KEY}`
**데이터 형식:** JSON
**용도:** 실시간 거래 데이터 (현재가, 거래량)

### 초기화

```ts
// hooks/use-app-init.ts
const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
stockSocket.init(apiKey);
```

### 구독 시스템

#### 1. 구독 (Subscribe)

```ts
const unsubscribe = stockSocket.subscribe(symbol, (trade) => {
  console.log(trade); // { s: "AAPL", p: 150.5, t: 1710086400, v: 1000 }
});
```

**내부 동작:**

```ts
subscribe(symbol: string, callback: TradeCallback): () => void {
  // 1. callbacks Map에 추가
  if (!this.callbacks.has(symbol)) {
    this.callbacks.set(symbol, new Set());
  }
  this.callbacks.get(symbol)!.add(callback);

  // 2. 서버에 구독 메시지 전송
  if (this.ws?.readyState === WebSocket.OPEN) {
    this.ws.send(JSON.stringify({ type: "subscribe", symbol }));
  }

  // 3. Lazy Connection (첫 구독 시 연결)
  if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
    this.connect();
  }

  // 4. Unsubscribe 함수 반환
  return () => this.unsubscribe(symbol, callback);
}
```

#### 2. 구독 해제 (Unsubscribe)

```ts
unsubscribe(symbol: string, callback: TradeCallback): void {
  const callbacks = this.callbacks.get(symbol);
  if (!callbacks) return;

  callbacks.delete(callback);

  // 해당 심볼의 모든 callback이 제거되면
  if (callbacks.size === 0) {
    this.callbacks.delete(symbol);

    // 서버에 구독 해제 메시지 전송
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
    }
  }
}
```

### 메시지 처리

#### 수신 메시지 형식

```json
{
  "type": "trade",
  "data": [
    {
      "s": "AAPL", // Symbol
      "p": 150.5, // Price
      "t": 1710086400, // Timestamp (ms)
      "v": 1000 // Volume
    }
  ]
}
```

#### 처리 로직

```ts
private handleMessage(event: MessageEvent) {
  try {
    const message = JSON.parse(event.data);

    // "trade" 타입만 처리
    if (message.type !== "trade") return;

    // 각 거래 데이터 dispatch
    for (const trade of message.data) {
      const callbacks = this.callbacks.get(trade.s);
      if (callbacks && callbacks.size > 0) {
        callbacks.forEach((cb) => cb(trade));
      }
    }
  } catch {
    // 파싱 에러 무시
  }
}
```

### 연결 관리

#### 연결 (Connect)

```ts
private connect() {
  // 중복 연결 방지
  if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
    return;
  }

  this.isConnecting = true;
  this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

  this.ws.onopen = () => {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.resubscribeAll(); // 기존 구독 복원
  };

  this.ws.onmessage = (event) => this.handleMessage(event);
  this.ws.onclose = () => this.scheduleReconnect();
  this.ws.onerror = () => {
    this.isConnecting = false;
  };
}
```

#### 재구독 (Resubscribe All)

```ts
private resubscribeAll() {
  if (this.ws?.readyState !== WebSocket.OPEN) return;

  // 모든 구독 심볼 재전송
  for (const symbol of this.callbacks.keys()) {
    this.ws.send(JSON.stringify({ type: "subscribe", symbol }));
  }
}
```

---

## Yahoo Finance WebSocket

### 기본 정보

**URL:** `wss://streamer.finance.yahoo.com`
**데이터 형식:** Protobuf (Base64 인코딩)
**용도:** 확장시간 거래 데이터 (프리마켓, 애프터마켓)

### 특징

- **API 키 불필요** - 공개 WebSocket
- **Protobuf 디코딩** - `protobufjs/light` 사용
- **27개 필드** - 상세한 시장 데이터

### 초기화

```ts
// hooks/use-stock-data.ts
yahooSocket.init(); // API 키 불필요
```

### 구독 시스템

#### 구독 메시지 형식

```json
{
  "subscribe": ["AAPL", "TSLA", "GOOGL"]
}
```

#### 구독 (Subscribe)

```ts
subscribe(symbol: string, callback: TradeCallback): () => void {
  // 1. callbacks Map에 추가
  if (!this.callbacks.has(symbol)) {
    this.callbacks.set(symbol, new Set());
  }
  this.callbacks.get(symbol)!.add(callback);

  // 2. subscriptions Set에 추가
  this.subscriptions.add(symbol);

  // 3. 서버에 구독 메시지 전송
  if (this.ws?.readyState === WebSocket.OPEN) {
    this.ws.send(JSON.stringify({ subscribe: [symbol] }));
  } else {
    this.connect(); // 연결 없으면 시작
  }

  // 4. Unsubscribe 함수 반환
  return () => this.unsubscribe(symbol, callback);
}
```

#### 구독 해제 (Unsubscribe)

```ts
unsubscribe(symbol: string, callback: TradeCallback): void {
  const callbacks = this.callbacks.get(symbol);
  if (!callbacks) return;

  callbacks.delete(callback);

  // 해당 심볼의 모든 callback이 제거되면
  if (callbacks.size === 0) {
    this.callbacks.delete(symbol);
    this.subscriptions.delete(symbol);

    // 서버에 구독 해제 메시지 전송
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ unsubscribe: [symbol] }));
    }

    // 모든 구독 제거 시 연결 종료
    if (this.subscriptions.size === 0) {
      this.close();
    }
  }
}
```

### Protobuf 디코딩

#### 메시지 처리 파이프라인

```
Base64 문자열 → Binary → Protobuf Decode → JavaScript 객체
```

#### 처리 로직

```ts
private handleMessage(data: Blob | string) {
  if (typeof data !== "string") return;

  try {
    // Step 1: Base64 Decode
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Step 2: Protobuf Decode
    const message = Yaticker.decode(bytes);

    // Step 3: Convert to Object
    const trade = Yaticker.toObject(message, {
      enums: String,   // Enums as strings
      longs: Number,   // 64-bit ints as Numbers
      defaults: true,  // Include default values
    }) as unknown as YahooTradeData;

    // Step 4: Dispatch
    const callbacks = this.callbacks.get(trade.id);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((cb) => cb(trade));
    }
  } catch {
    // 디코딩 에러 무시
  }
}
```

#### 데이터 타입

```ts
export interface YahooTradeData {
  id: string; // Symbol (예: "AAPL")
  price: number; // 현재가
  time: number; // Timestamp (seconds)
  changePercent?: number; // 일일 변동률 (%)
  dayVolume?: number; // 누적 거래량
  dayHigh?: number; // 고가
  dayLow?: number; // 저가
  change?: number; // 변동금액
  previousClose?: number; // 전일 종가
  marketHours?: number; // 0=PRE, 1=REGULAR, 2=POST, 3=EXTENDED
}
```

---

## 재연결 전략

### Exponential Backoff

두 WebSocket 모두 **Exponential Backoff** 전략 사용:

```
delay = base_delay * 2^(attempts)
```

### Finnhub 재연결 설정

```ts
// constants/api.ts
export const RECONNECT_DELAY = 3000; // Base: 3초
export const MAX_RECONNECT_ATTEMPTS = 5; // 최대 5회
```

**재연결 시퀀스:**

```
Attempt 0: 즉시
Attempt 1: 3초 후  (3 * 2^0 = 3s)
Attempt 2: 6초 후  (3 * 2^1 = 6s)
Attempt 3: 12초 후 (3 * 2^2 = 12s)
Attempt 4: 24초 후 (3 * 2^3 = 24s)
Attempt 5: 실패 처리
```

**구현:**

```ts
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
```

### Yahoo Finance 재연결 설정

```ts
// yahoo-socket.ts
private readonly MAX_RECONNECT_ATTEMPTS = 5;
private readonly BASE_RECONNECT_DELAY = 1000;  // Base: 1초
```

**재연결 시퀀스:**

```
Attempt 0: 즉시
Attempt 1: 1초 후  (1 * 2^0 = 1s)
Attempt 2: 2초 후  (1 * 2^1 = 2s)
Attempt 3: 4초 후  (1 * 2^2 = 4s)
Attempt 4: 8초 후  (1 * 2^3 = 8s)
Attempt 5: 실패 처리
```

**구현:**

```ts
private scheduleReconnect() {
  const delay = this.BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts);

  console.log(`[YahooSocket] Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);

  this.reconnectTimer = setTimeout(() => {
    this.reconnectAttempts++;
    this.connect();
  }, delay);
}
```

---

## Protobuf 디코딩

### Protobuf 스키마 정의

```ts
// yahoo-socket.ts
const root = protobuf.Root.fromJSON({
  nested: {
    yaticker: {
      fields: {
        id: { type: "string", id: 1 },
        price: { type: "float", id: 2 },
        time: { type: "uint64", id: 3 },
        currency: { type: "string", id: 4 },
        exchange: { type: "string", id: 5 },
        quoteType: { type: "int32", id: 6 },
        marketHours: { type: "int32", id: 7 },
        changePercent: { type: "float", id: 8 },
        dayVolume: { type: "uint64", id: 9 },
        dayHigh: { type: "float", id: 10 },
        dayLow: { type: "float", id: 11 },
        change: { type: "float", id: 12 },
        // ... 총 27개 필드
      },
    },
  },
});

const Yaticker = root.lookupType("yaticker");
```

**출처:** [node-yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)

### 디코딩 옵션

```ts
Yaticker.toObject(message, {
  enums: String, // Enum 값을 문자열로 변환
  longs: Number, // 64비트 정수를 JavaScript Number로 변환
  defaults: true, // 기본값 포함
});
```

---

## 에러 처리 및 Fallback

### 에러 시나리오

| 에러                 | Finnhub                     | Yahoo Finance                     |
| -------------------- | --------------------------- | --------------------------------- |
| **연결 실패**        | `scheduleReconnect()`       | `scheduleReconnect()`             |
| **메시지 파싱 에러** | 무시 (try-catch)            | 무시 (try-catch)                  |
| **최대 재시도 초과** | `onConnectionFailed()` 호출 | `connectionFailedCallback()` 호출 |

### Polling Fallback 전략

`useStockData` Hook에서 WebSocket 실패 시 자동으로 Polling으로 전환:

```ts
// hooks/use-stock-data.ts
const [wsFailedFallback, setWsFailedFallback] = useState(false);

const unregisterError = yahooSocket.onConnectionFailed(() => {
  setWsFailedFallback(true); // Fallback 활성화
});

const usePolling = wsFailedFallback || !isTradingHours;

if (usePolling) {
  // Polling 모드
  fetchPrice(); // 즉시 fetch
  const interval = setInterval(fetchPrice, POLLING_INTERVAL * 2); // 20초마다
  return () => clearInterval(interval);
} else {
  // WebSocket 모드
  const unsubscribe = yahooSocket.subscribe(symbol, handleTrade);
  return unsubscribe;
}
```

### 자동 복구

시장 재개장 시 WebSocket 재시도:

```ts
useEffect(() => {
  if (isTradingHours && wsFailedFallback) {
    yahooSocket.init(); // WebSocket 재시도
    setWsFailedFallback(false);
  }
}, [marketStatus, wsFailedFallback]);
```

---

## React Hook 통합

### useStockData Hook

#### 2단계 데이터 로딩

**Phase 1: 초기 스냅샷 (Finnhub + Yahoo Extended Hours)**

```ts
const fetchPrice = useCallback(async () => {
  // Finnhub REST API
  const finnhubPromise = finnhubApi.getQuote(symbol);

  // Yahoo Extended Hours (병렬)
  const extPromise = finnhubPromise.then((r) => getExtendedHours(symbol, r.data?.close ?? 0));

  const [result, extResult] = await Promise.all([finnhubPromise, extPromise]);

  // 확장시간 가격 병합
  if (extResult && extResult.price !== 0) {
    mergedData = {
      ...result.data,
      extendedHours: extResult,
    };
  }
}, [symbol]);
```

**Phase 2: 실시간 업데이트 (Yahoo WebSocket)**

```ts
const handleTrade = useCallback((trade: YahooTradeData) => {
  setData({
    symbol: trade.id,
    price: trade.price,
    change: trade.change ?? 0,
    changePercent: trade.changePercent ?? 0,
    dayHigh: trade.dayHigh,
    dayLow: trade.dayLow,
    // ...
  });
}, []);

const unsubscribe = yahooSocket.subscribe(symbol, handleTrade);
```

### 시장 상태에 따른 전략

```ts
const isTradingHours = marketStatus === "open" || marketStatus === "pre" || marketStatus === "post";

if (isTradingHours && !wsFailedFallback) {
  // WebSocket 사용
  yahooSocket.subscribe(symbol, handleTrade);
} else {
  // Polling 사용
  const interval = setInterval(fetchPrice, 20000);
}
```

---

## 참조

- [Finnhub WebSocket API](https://finnhub.io/docs/api/websocket-trades)
- [Yahoo Finance WebSocket (비공식)](https://github.com/gadicc/node-yahoo-finance2)
- [protobufjs Documentation](https://github.com/protobufjs/protobuf.js)
- [WebSocket Reconnection Strategies](https://javascript.info/websocket)

---

**작성일:** 2026-03-10
**다음 단계:** [docs/architecture/market-time-dst.md](./market-time-dst.md)
