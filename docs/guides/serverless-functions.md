# Vercel Serverless Functions 가이드

> Vercel 배포 환경에서 API 프록시 역할을 하는 Serverless Functions

---

## 📋 목차

1. [개요](#개요)
2. [함수 목록](#함수-목록)
3. [/api/stock-proxy](#apistock-proxy)
4. [/api/chart](#apichart)
5. [/api/index-quote](#apiindex-quote)
6. [/api/extended-hours](#apiextended-hours)
7. [/api/exchange-rate](#apiexchange-rate)
8. [캐싱 전략](#캐싱-전략)
9. [에러 처리](#에러-처리)
10. [로컬 vs 프로덕션](#로컬-vs-프로덕션)

---

## 개요

`api/` 디렉토리의 TypeScript 파일들은 Vercel 배포 시 자동으로 **Serverless Functions**로 변환됩니다.

### 목적

1. **CORS 우회** - 외부 API 호출 시 CORS 에러 방지
2. **API 키 보호** - 클라이언트에 API 키 노출 방지
3. **캐싱** - Edge 캐싱으로 API 호출 횟수 감소
4. **에러 처리** - 일관된 에러 응답 제공

### 파일 구조

```
api/
├── stock-proxy.ts       # Finnhub API 프록시 (quote, candle, search)
├── chart.ts             # Yahoo Finance 차트 데이터
├── index-quote.ts       # Yahoo Finance 지수 시세
├── extended-hours.ts    # Yahoo Finance 확장시간 거래
└── exchange-rate.ts     # Yahoo Finance 환율 데이터
```

---

## 함수 목록

| 엔드포인트            | 파일              | 역할                | API 키    | 캐싱 |
| --------------------- | ----------------- | ------------------- | --------- | ---- |
| `/api/stock-proxy`    | stock-proxy.ts    | Finnhub API 프록시  | ✅ 필요   | 5초  |
| `/api/chart`          | chart.ts          | Yahoo 차트 OHLCV    | ❌ 불필요 | 없음 |
| `/api/index-quote`    | index-quote.ts    | Yahoo 지수 시세     | ❌ 불필요 | 10초 |
| `/api/extended-hours` | extended-hours.ts | Yahoo 확장시간 거래 | ❌ 불필요 | 없음 |
| `/api/exchange-rate`  | exchange-rate.ts  | USD/KRW 환율        | ❌ 불필요 | 60초 |

---

## /api/stock-proxy

### 역할

Finnhub API를 프록시하여 3가지 기능 제공:

1. **quote** - 실시간 주가
2. **candle** - 캔들 차트 데이터
3. **search** - 주식 검색

### 요청 형식

```
GET /api/stock-proxy?type={type}&...
```

#### 1. 실시간 주가 (quote)

**요청:**

```
GET /api/stock-proxy?type=quote&symbol=AAPL
```

**응답:**

```json
{
  "c": 150.5, // 현재가
  "d": 2.3, // 변동금액
  "dp": 1.55, // 변동률 (%)
  "h": 151.2, // 고가
  "l": 149.8, // 저가
  "o": 150.0, // 시가
  "pc": 148.2, // 전일 종가
  "t": 1710086400 // 타임스탬프
}
```

#### 2. 캔들 차트 (candle)

**요청:**

```
GET /api/stock-proxy?type=candle&symbol=AAPL&resolution=D&from=1709481600&to=1710086400
```

**매개변수:**

- `symbol`: 주식 심볼 (예: AAPL)
- `resolution`: D(일), W(주), M(월)
- `from`: 시작 타임스탬프 (Unix)
- `to`: 종료 타임스탬프 (Unix)

**응답:**

```json
{
  "c": [150.5, 151.2, 152.0], // Close
  "h": [151.0, 152.5, 153.0], // High
  "l": [149.5, 150.0, 151.0], // Low
  "o": [150.0, 151.0, 152.0], // Open
  "t": [1710000000, 1710086400, 1710172800], // Timestamp
  "v": [1000000, 1200000, 1100000], // Volume
  "s": "ok"
}
```

#### 3. 주식 검색 (search)

**요청:**

```
GET /api/stock-proxy?type=search&q=apple
```

**응답:**

```json
{
  "count": 3,
  "result": [
    {
      "description": "Apple Inc",
      "displaySymbol": "AAPL",
      "symbol": "AAPL",
      "type": "Common Stock"
    },
    {
      "description": "Apple Hospitality REIT Inc",
      "displaySymbol": "APLE",
      "symbol": "APLE",
      "type": "Common Stock"
    }
  ]
}
```

### 코드 구조

```ts
// api/stock-proxy.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.FINNHUB_API_KEY; // 환경 변수에서 로드
  if (!apiKey) {
    return res.status(500).json({ error: "FINNHUB_API_KEY not configured" });
  }

  const { type, symbol, q, resolution, from, to } = req.query;

  // type에 따라 URL 결정
  switch (type) {
    case "quote":
      url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`;
      break;
    case "search":
      url = `${FINNHUB_BASE}/search?q=${q}&token=${apiKey}`;
      break;
    case "candle":
      url = `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&...&token=${apiKey}`;
      break;
  }

  const response = await fetch(url);
  const data = await response.json();

  // 캐싱 헤더
  res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=10");
  return res.status(response.status).json(data);
}
```

### 환경 변수

Vercel 프로젝트 설정에서 환경 변수 추가:

```env
FINNHUB_API_KEY=your_api_key_here
```

---

## /api/chart

### 역할

Yahoo Finance API를 사용하여 차트용 OHLCV 데이터 제공 (무료).

### 요청 형식

```
GET /api/chart?symbol={symbol}&range={range}
```

**매개변수:**

- `symbol`: 주식 심볼 (예: AAPL)
- `range`: 시간 범위 (1m, 10m, 1h, 1D)

### Range 매핑

```ts
const RANGE_MAP = {
  "1m": { interval: "1m", range: "1d" }, // 1분봉 → 1일치
  "10m": { interval: "15m", range: "5d" }, // 10분봉 → 15분봉 5일치
  "1h": { interval: "1h", range: "5d" }, // 1시간봉 → 5일치
  "1D": { interval: "1d", range: "1mo" }, // 일봉 → 1개월치
};
```

### 사용 예시

**요청:**

```
GET /api/chart?symbol=AAPL&range=1h
```

**응답:**

```json
{
  "chart": {
    "result": [
      {
        "meta": {
          "symbol": "AAPL",
          "regularMarketPrice": 150.5
        },
        "timestamp": [1710000000, 1710003600, 1710007200],
        "indicators": {
          "quote": [
            {
              "open": [150.0, 150.5, 151.0],
              "high": [151.0, 151.5, 152.0],
              "low": [149.5, 150.0, 150.5],
              "close": [150.5, 151.0, 151.5],
              "volume": [1000000, 1100000, 1050000]
            }
          ]
        }
      }
    ]
  }
}
```

### 코드 구조

```ts
// api/chart.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "");
  const timeRange = String(req.query.range ?? "1m");
  const config = RANGE_MAP[timeRange] ?? RANGE_MAP["1m"];

  const yahooUrl = `${YAHOO_BASE}/${symbol}?interval=${config.interval}&range=${config.range}`;

  const response = await fetch(yahooUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }, // 필수!
  });
  const data = await response.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(response.status).json(data);
}
```

---

## /api/index-quote

### 역할

Yahoo Finance API를 사용하여 주요 지수(DJI, SPX, IXIC) 시세 제공.

### 요청 형식

```
GET /api/index-quote?symbol={symbol}
```

**매개변수:**

- `symbol`: 지수 심볼 (예: ^DJI, ^GSPC, ^IXIC)

### 사용 예시

**요청:**

```
GET /api/index-quote?symbol=%5EDJI
```

(URL 인코딩: `^DJI` → `%5EDJI`)

**응답:**

```json
{
  "symbol": "^DJI",
  "shortName": "Dow Jones Industrial Average",
  "price": 38500.5,
  "previousClose": 38400.2,
  "change": 100.3,
  "changePercent": 0.26,
  "dayHigh": 38550.0,
  "dayLow": 38350.0
}
```

### 코드 구조

```ts
// api/index-quote.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "").trim();

  const yahooUrl = `${YAHOO_BASE}/${symbol}?interval=1d&range=1d`;
  const response = await fetch(yahooUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const data = await response.json();

  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice;
  const previousClose = meta.chartPreviousClose;
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  // 캐싱 헤더 (10초)
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
  return res.status(200).json({
    symbol: meta.symbol,
    shortName: meta.shortName,
    price,
    previousClose,
    change,
    changePercent,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
  });
}
```

---

## /api/extended-hours

### 역할

Yahoo Finance API를 사용하여 **프리마켓/애프터마켓** 확장시간 거래 데이터 제공.

### 요청 형식

```
GET /api/extended-hours?symbol={symbol}
```

### 특징

- `includePrePost=true` 파라미터로 확장시간 데이터 포함
- 1분봉 데이터로 최신 체결 가격 확인

### 사용 예시

**요청:**

```
GET /api/extended-hours?symbol=AAPL
```

**응답:**

```json
{
  "chart": {
    "result": [{
      "meta": {
        "symbol": "AAPL",
        "regularMarketPrice": 150.5,
        "currentTradingPeriod": {
          "pre": { "start": 1710064800, "end": 1710082800 },
          "regular": { "start": 1710082800, "end": 1710106200 },
          "post": { "start": 1710106200, "end": 1710120600 }
        }
      },
      "timestamp": [...],
      "indicators": {
        "quote": [{
          "close": [150.2, 150.3, 150.5] // 확장시간 포함
        }]
      }
    }]
  }
}
```

### 코드 구조

```ts
// api/extended-hours.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbol = String(req.query.symbol ?? "")
    .trim()
    .toUpperCase();

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&includePrePost=true`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const data = await response.json();

  // 캐싱 비활성화 (실시간 데이터)
  res.setHeader("Cache-Control", "no-store");
  return res.status(response.status).json(data);
}
```

---

## /api/exchange-rate

### 역할

Yahoo Finance API를 사용하여 **USD/KRW 환율** 실시간 데이터 제공.

### 요청 형식

```
GET /api/exchange-rate
```

(매개변수 없음)

### 사용 예시

**요청:**

```
GET /api/exchange-rate
```

**응답:**

```json
{
  "base": "USD",
  "target": "KRW",
  "rate": 1328.5,
  "previousClose": 1325.0,
  "change": 3.5,
  "changePercent": 0.26,
  "dayHigh": 1330.0,
  "dayLow": 1325.0,
  "timestamp": 1710086400000
}
```

### Fallback 전략

API 호출 실패 시 기본값 반환:

```ts
catch (error) {
  return res.status(200).json({
    base: "USD",
    target: "KRW",
    rate: 1450,  // 기본값
    previousClose: 1450,
    change: 0,
    changePercent: 0,
    dayHigh: 1450,
    dayLow: 1450,
    timestamp: Date.now(),
    stale: true  // 오래된 데이터 표시
  });
}
```

### 코드 구조

```ts
// api/exchange-rate.ts
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Edge 캐싱 (60초)
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  try {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?interval=1m&range=1d"
    );
    const data = await response.json();
    const rate = data.chart.result[0].meta.regularMarketPrice ?? 1450;

    return res.status(200).json({
      base: "USD",
      target: "KRW",
      rate,
      timestamp: Date.now(),
    });
  } catch {
    // Fallback
    return res.status(200).json({ rate: 1450, stale: true });
  }
}
```

---

## 캐싱 전략

### Cache-Control 헤더

Vercel Edge Network에서 캐싱 활용:

| 함수           | Cache-Control                             | 의미                        |
| -------------- | ----------------------------------------- | --------------------------- |
| stock-proxy    | `s-maxage=5, stale-while-revalidate=10`   | 5초 캐시, 10초 stale 허용   |
| chart          | 없음                                      | 캐싱 안 함 (실시간)         |
| index-quote    | `s-maxage=10, stale-while-revalidate=30`  | 10초 캐시, 30초 stale 허용  |
| extended-hours | `no-store`                                | 절대 캐싱 안 함             |
| exchange-rate  | `s-maxage=60, stale-while-revalidate=120` | 60초 캐시, 120초 stale 허용 |

### s-maxage vs max-age

- `s-maxage`: **서버(Edge) 캐싱** - Vercel CDN에서 캐싱
- `max-age`: **브라우저 캐싱** - 사용자 브라우저에서 캐싱

### stale-while-revalidate

캐시 만료 후에도 일정 시간 stale 데이터 제공하면서 백그라운드에서 새 데이터 fetch.

```
요청 → 캐시 만료? → Yes → stale 데이터 즉시 반환 + 백그라운드 갱신
                  → No  → 캐시 데이터 반환
```

---

## 에러 처리

### 400 Bad Request

필수 매개변수 누락:

```json
{
  "error": "symbol is required"
}
```

### 404 Not Found

데이터 없음:

```json
{
  "error": "No data found"
}
```

### 500 Internal Server Error

API 호출 실패:

```json
{
  "error": "Proxy error"
}
```

또는 구체적인 에러 메시지:

```json
{
  "error": "HTTP error: 429"
}
```

### CORS 헤더

모든 응답에 CORS 헤더 포함:

```ts
res.setHeader("Access-Control-Allow-Origin", "*");
```

---

## 로컬 vs 프로덕션

### 로컬 개발 (npm run dev)

```
클라이언트 → /api/chart → Vite 플러그인 → Yahoo API
```

- Vite Dev Server의 커스텀 미들웨어가 처리
- `vite.config.ts`의 플러그인 동작

### 프로덕션 (Vercel)

```
클라이언트 → /api/chart → Vercel Serverless Function → Yahoo API
```

- Vercel이 `api/` 디렉토리를 자동 배포
- Edge Network 캐싱 적용

### 코드 동기화

로컬과 프로덕션 동작이 일치하도록 **코드 로직 동기화** 필수:

```ts
// vite.config.ts - yahooChartPlugin
const config = RANGE_MAP[timeRange] ?? RANGE_MAP["5m"];

// api/chart.ts - handler
const config = RANGE_MAP[timeRange] ?? RANGE_MAP["1m"];
```

---

## 참조

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions)
- [Vercel Edge Caching](https://vercel.com/docs/edge-network/caching)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [docs/architecture/vite-plugins.md](../architecture/vite-plugins.md)

---

**작성일:** 2026-03-10
**다음 단계:** [docs/architecture/websocket-strategy.md](../architecture/websocket-strategy.md)
