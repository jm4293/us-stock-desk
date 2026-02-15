# 🔌 Agent 4: Services (서비스 레이어)

> API, WebSocket, LocalStorage 등 외부 통신 레이어 구축

## 🎯 역할

외부 서비스와의 통신을 담당합니다.

- Finnhub API 연동
- WebSocket 실시간 데이터
- REST API Polling (백업)
- LocalStorage 유틸리티
- 환율 API

## 📋 작업 범위

### ✅ 작업 대상

- `src/services/api/` - REST API
  - `finnhub.ts` - Finnhub API 클라이언트
  - `exchange.ts` - 환율 API
- `src/services/websocket/` - WebSocket
  - `stockSocket.ts` - 실시간 주식 데이터
- `src/services/storage/` - LocalStorage
  - `storage.ts` - 암호화 스토리지 유틸
- `api/` - Vercel Serverless Functions
  - `stock-proxy.ts` - 주식 데이터 프록시
  - `exchange-rate.ts` - 환율 프록시

### ❌ 작업 제외

- 상태 관리 (State 에이전트)
- UI 컴포넌트 (Components 에이전트)
- 테스트 (Test 에이전트)

## 📚 필수 읽기 문서

1. **API_KEY_STRATEGY.md** - API 키 관리 전략 (필독!)
2. **PROJECT_REQUIREMENTS.md** - API 요구사항
3. **CLAUDE.md** - 프로젝트 이해

## 🔧 작업 순서

### 1단계: Finnhub API 클라이언트

```typescript
// src/services/api/finnhub.ts
import type { FinnhubQuote, FinnhubCandle } from "@/types/api";
import { API_ENDPOINTS } from "@/constants/api";

class FinnhubApi {
  private baseUrl: string;
  private proxyUrl: string;

  constructor() {
    this.baseUrl = API_ENDPOINTS.FINNHUB_BASE;
    this.proxyUrl = API_ENDPOINTS.PROXY_BASE;
  }

  /**
   * 주식 실시간 가격 조회
   */
  async getQuote(symbol: string): Promise<FinnhubQuote> {
    try {
      const response = await fetch(`${this.proxyUrl}/stock-proxy?symbol=${symbol}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      throw error;
    }
  }

  /**
   * 주식 차트 데이터 조회 (캔들스틱)
   */
  async getCandles(
    symbol: string,
    resolution: "D" | "W" | "M",
    from: number,
    to: number
  ): Promise<FinnhubCandle> {
    try {
      const params = new URLSearchParams({
        symbol,
        resolution,
        from: from.toString(),
        to: to.toString(),
      });

      const response = await fetch(`${this.proxyUrl}/stock-proxy?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch candles:", error);
      throw error;
    }
  }

  /**
   * 종목 검색
   */
  async searchSymbol(query: string): Promise<
    Array<{
      description: string;
      displaySymbol: string;
      symbol: string;
      type: string;
    }>
  > {
    try {
      const response = await fetch(`${this.proxyUrl}/stock-proxy?q=${encodeURIComponent(query)}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error("Failed to search symbol:", error);
      throw error;
    }
  }
}

export const finnhubApi = new FinnhubApi();
```

### 2단계: 환율 API

```typescript
// src/services/api/exchange.ts
interface ExchangeRate {
  rate: number;
  timestamp: number;
}

class ExchangeApi {
  private proxyUrl: string;
  private cache: Map<string, { rate: number; timestamp: number }>;
  private cacheTimeout = 60000; // 1분

  constructor() {
    this.proxyUrl = "/api";
    this.cache = new Map();
  }

  /**
   * 환율 조회 (캐시 지원)
   */
  async getRate(from: string = "USD", to: string = "KRW"): Promise<ExchangeRate> {
    const cacheKey = `${from}_${to}`;
    const cached = this.cache.get(cacheKey);

    // 캐시가 유효하면 반환
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    try {
      const response = await fetch(`${this.proxyUrl}/exchange-rate?from=${from}&to=${to}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const result = {
        rate: data.rate,
        timestamp: Date.now(),
      };

      // 캐시 저장
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);

      // 캐시된 데이터라도 반환
      if (cached) {
        return cached;
      }

      throw error;
    }
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
  }
}

export const exchangeApi = new ExchangeApi();
```

### 3단계: WebSocket 클라이언트

```typescript
// src/services/websocket/stockSocket.ts
import { WEBSOCKET_URL, MAX_RECONNECT_ATTEMPTS, RECONNECT_DELAY } from "@/constants/api";

type MessageCallback = (data: any) => void;

class StockSocket {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<MessageCallback>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  /**
   * WebSocket 연결
   */
  connect(apiKey: string) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(`${WEBSOCKET_URL}?token=${apiKey}`);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // 구독 중인 심볼 재등록
        this.subscribers.forEach((_, symbol) => {
          this.subscribeSymbol(symbol);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "trade") {
            message.data.forEach((trade: any) => {
              const callbacks = this.subscribers.get(trade.s);
              if (callbacks) {
                callbacks.forEach((callback) => callback(trade));
              }
            });
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnecting = false;
        this.ws = null;

        // 재연결 시도
        if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

          this.reconnectTimer = setTimeout(() => {
            this.connect(apiKey);
          }, RECONNECT_DELAY);
        } else {
          console.error("Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.isConnecting = false;
    }
  }

  /**
   * 심볼 구독
   */
  subscribe(symbol: string, callback: MessageCallback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.subscribeSymbol(symbol);
    }

    this.subscribers.get(symbol)!.add(callback);

    // 구독 해제 함수 반환
    return () => {
      const callbacks = this.subscribers.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);

        // 구독자가 없으면 WebSocket 구독 해제
        if (callbacks.size === 0) {
          this.subscribers.delete(symbol);
          this.unsubscribeSymbol(symbol);
        }
      }
    };
  }

  /**
   * WebSocket으로 심볼 구독 메시지 전송
   */
  private subscribeSymbol(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", symbol }));
    }
  }

  /**
   * WebSocket으로 심볼 구독 해제 메시지 전송
   */
  private unsubscribeSymbol(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
    }
  }

  /**
   * WebSocket 연결 종료
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribers.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * 연결 상태 확인
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const stockSocket = new StockSocket();
```

### 4단계: LocalStorage 유틸리티

```typescript
// src/services/storage/storage.ts
/**
 * LocalStorage 암호화 유틸리티
 */
class StorageService {
  /**
   * 데이터 저장 (Base64 인코딩)
   */
  set<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      const encoded = btoa(json);
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  }

  /**
   * 데이터 조회 (Base64 디코딩)
   */
  get<T>(key: string): T | null {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;

      const decoded = atob(encoded);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Failed to load from storage:", error);
      return null;
    }
  }

  /**
   * 데이터 삭제
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove from storage:", error);
    }
  }

  /**
   * 모든 데이터 삭제
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }

  /**
   * 키 존재 여부 확인
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

export const storage = new StorageService();
```

### 5단계: Vercel Serverless Functions

#### 5.1 주식 프록시

```typescript
// api/stock-proxy.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE = "https://finnhub.io/api/v1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol, resolution, from, to, q } = req.query;

    let url = "";

    // 검색
    if (q) {
      url = `${FINNHUB_BASE}/search?q=${q}&token=${FINNHUB_API_KEY}`;
    }
    // 캔들 데이터
    else if (resolution && from && to) {
      url = `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    }
    // 실시간 가격
    else if (symbol) {
      url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    } else {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const response = await fetch(url);
    const data = await response.json();

    // 캐시 헤더 추가
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

#### 5.2 환율 프록시

```typescript
// api/exchange-rate.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const EXCHANGE_BASE = "https://api.exchangerate-api.com/v4/latest";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { from = "USD", to = "KRW" } = req.query;

    const response = await fetch(`${EXCHANGE_BASE}/${from}`);
    const data = await response.json();

    const rate = data.rates[to as string];

    // 1시간 캐시
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

    return res.status(200).json({
      from,
      to,
      rate,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Exchange rate error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

## ✅ 완료 체크리스트

### API 레이어

- [ ] `src/services/api/finnhub.ts` 생성
  - [ ] getQuote 메서드
  - [ ] getCandles 메서드
  - [ ] searchSymbol 메서드
- [ ] `src/services/api/exchange.ts` 생성
  - [ ] getRate 메서드
  - [ ] 캐시 로직

### WebSocket

- [ ] `src/services/websocket/stockSocket.ts` 생성
  - [ ] connect 메서드
  - [ ] subscribe 메서드
  - [ ] 재연결 로직
  - [ ] 에러 처리

### Storage

- [ ] `src/services/storage/storage.ts` 생성
  - [ ] set/get 메서드
  - [ ] Base64 인코딩/디코딩

### Serverless Functions

- [ ] `api/stock-proxy.ts` 생성
  - [ ] 실시간 가격
  - [ ] 캔들 데이터
  - [ ] 검색
  - [ ] CORS 헤더
  - [ ] 캐시 헤더
- [ ] `api/exchange-rate.ts` 생성
  - [ ] 환율 조회
  - [ ] 캐시 헤더

### 환경 변수

- [ ] `.env.local` 생성 (로컬 개발용)
- [ ] Vercel 환경 변수 설정
  - [ ] FINNHUB_API_KEY
  - [ ] EXCHANGE_API_KEY

### 검증

- [ ] API 호출 성공
- [ ] WebSocket 연결 성공
- [ ] Serverless Function 배포 성공
- [ ] CORS 정상 동작

## 💡 Best Practices

### 1. 에러 처리

```typescript
try {
  const data = await api.getQuote("AAPL");
} catch (error) {
  console.error("Failed:", error);
  // Fallback 로직
}
```

### 2. 재시도 로직

```typescript
async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### 3. Rate Limiting

```typescript
// Serverless Function에서 Rate Limit 체크
const rateLimiter = new Map();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter((t: number) => now - t < 60000);

  if (recentRequests.length >= 60) {
    throw new Error("Rate limit exceeded");
  }

  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
}
```

## 🤝 다음 에이전트에게 전달

Services 작업 완료 후:

```
✅ Services 작업 완료

생성된 결과물:
- Finnhub API 클라이언트
- 환율 API
- WebSocket 실시간 연결
- LocalStorage 유틸리티
- Vercel Serverless Functions

다음 에이전트: Agent 5 (Components)
- State 에이전트 완료 대기
- "AGENT_COMPONENTS.md를 읽고 컴포넌트 개발을 시작해주세요"
```

---

**담당**: 외부 통신 레이어  
**의존성**: Architect  
**다음 에이전트**: Components (State 완료 후)
