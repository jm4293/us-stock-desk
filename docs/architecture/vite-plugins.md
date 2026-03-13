# Vite 커스텀 플러그인 가이드

> 로컬 개발 환경에서 API 프록시를 제공하는 Vite 커스텀 플러그인

---

## 📋 목차

1. [개요](#개요)
2. [왜 프록시가 필요한가?](#왜-프록시가-필요한가)
3. [플러그인 목록](#플러그인-목록)
4. [finnhubProxyPlugin](#finnhubproxyplugin)
5. [yahooChartPlugin](#yahoochartplugin)
6. [yahooIndexQuotePlugin](#yahooindexquoteplugin)
7. [로컬 vs 프로덕션 환경](#로컬-vs-프로덕션-환경)

---

## 개요

`vite.config.ts`에는 **3개의 커스텀 Vite 플러그인**이 정의되어 있습니다:

```ts
plugins: [
  react(),
  finnhubProxyPlugin(apiKey),    // Finnhub API 프록시
  yahooChartPlugin(),             // Yahoo 차트 데이터 프록시
  yahooIndexQuotePlugin(),        // Yahoo 지수 시세 프록시
  VitePWA({...}),
]
```

이 플러그인들은 **로컬 개발 환경에서만 동작**하며, Vercel 배포 시에는 Serverless Functions로 대체됩니다.

---

## 왜 프록시가 필요한가?

### 1. CORS 우회

외부 API(Finnhub, Yahoo Finance)는 브라우저에서 직접 호출 시 CORS 에러 발생:

```js
// ❌ 브라우저에서 직접 호출 - CORS 에러!
fetch("https://finnhub.io/api/v1/quote?symbol=AAPL&token=xxx");
```

**해결:** 서버(Vite Dev Server)를 통해 프록시

```js
// ✅ 프록시를 통한 호출 - CORS 없음
fetch("/api/stock-proxy?symbol=AAPL&type=quote");
```

### 2. API 키 보호

API 키를 클라이언트 코드에 노출하지 않고 서버에서만 사용:

```ts
// vite.config.ts (서버)
const apiKey = env.FINNHUB_API_KEY; // .env에서 로드
finnhubUrl = `${BASE}/quote?symbol=${symbol}&token=${apiKey}`;
```

```ts
// 클라이언트 코드
fetch("/api/stock-proxy?symbol=AAPL&type=quote"); // API 키 불필요
```

### 3. 통합 인터페이스

로컬 개발과 프로덕션 환경에서 동일한 API 엔드포인트 사용:

```ts
// 클라이언트 코드는 환경 무관
fetch("/api/stock-proxy?symbol=AAPL&type=quote");

// 로컬: Vite 플러그인이 처리
// 프로덕션: Vercel Serverless Function이 처리
```

---

## 플러그인 목록

| 플러그인              | 엔드포인트            | 역할                | API 키 필요 |
| --------------------- | --------------------- | ------------------- | ----------- |
| finnhubProxyPlugin    | `/api/stock-proxy`    | Finnhub API 프록시  | ✅ 필요     |
| finnhubProxyPlugin    | `/api/extended-hours` | Yahoo 확장시간 거래 | ❌ 불필요   |
| finnhubProxyPlugin    | `/api/exchange-rate`  | Yahoo 환율 데이터   | ❌ 불필요   |
| yahooChartPlugin      | `/api/chart`          | Yahoo 차트 OHLCV    | ❌ 불필요   |
| yahooIndexQuotePlugin | `/api/index-quote`    | Yahoo 지수 시세     | ❌ 불필요   |

---

## finnhubProxyPlugin

### 역할

Finnhub API를 프록시하여 3가지 엔드포인트 제공:

1. `/api/stock-proxy?type=quote` - 실시간 주가
2. `/api/stock-proxy?type=candle` - 캔들 차트 데이터
3. `/api/stock-proxy?type=search` - 주식 검색

추가로 Yahoo Finance API도 포함: 4. `/api/extended-hours` - 확장시간 거래 (프리마켓/애프터마켓) 5. `/api/exchange-rate` - USD/KRW 환율

### 코드 구조

```ts
function finnhubProxyPlugin(apiKey: string): Plugin {
  return {
    name: "finnhub-proxy",
    configureServer(server) {
      // /api/stock-proxy 미들웨어
      server.middlewares.use("/api/stock-proxy", async (req, res) => {
        const { symbol, type, resolution, from, to, q } = queryParams;

        // type에 따라 Finnhub API 엔드포인트 결정
        if (type === "quote") {
          finnhubUrl = `${BASE}/quote?symbol=${symbol}&token=${apiKey}`;
        } else if (type === "candle") {
          finnhubUrl = `${BASE}/stock/candle?...&token=${apiKey}`;
        } else if (type === "search") {
          finnhubUrl = `${BASE}/search?q=${q}&token=${apiKey}`;
        }

        // Finnhub API 호출 및 응답
        const response = await fetch(finnhubUrl);
        const data = await response.json();
        res.end(JSON.stringify(data));
      });

      // /api/extended-hours 미들웨어
      server.middlewares.use("/api/extended-hours", async (req, res) => {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?includePrePost=true`;
        // ...
      });

      // /api/exchange-rate 미들웨어
      server.middlewares.use("/api/exchange-rate", async (req, res) => {
        const response = await fetch("https://query1.finance.yahoo.com/.../KRW=X");
        // ...
      });
    },
  };
}
```

### 사용 예시

#### 1. 실시간 주가 (quote)

```ts
// 클라이언트 코드
const response = await fetch("/api/stock-proxy?symbol=AAPL&type=quote");
const data = await response.json();
```

**응답 예시:**

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

```ts
const from = Math.floor(Date.now() / 1000) - 86400; // 1일 전
const to = Math.floor(Date.now() / 1000);
const url = `/api/stock-proxy?symbol=AAPL&type=candle&resolution=D&from=${from}&to=${to}`;
const response = await fetch(url);
```

**응답 예시:**

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

```ts
const response = await fetch("/api/stock-proxy?type=search&q=apple");
```

**응답 예시:**

```json
{
  "count": 3,
  "result": [
    {
      "description": "Apple Inc",
      "displaySymbol": "AAPL",
      "symbol": "AAPL",
      "type": "Common Stock"
    }
  ]
}
```

#### 4. 확장시간 거래 (extended-hours)

```ts
const response = await fetch("/api/extended-hours?symbol=AAPL");
```

#### 5. 환율 (exchange-rate)

```ts
const response = await fetch("/api/exchange-rate");
```

**응답 예시:**

```json
{
  "base": "USD",
  "target": "KRW",
  "rate": 1328.5,
  "timestamp": 1710086400000
}
```

---

## yahooChartPlugin

### 역할

Yahoo Finance API를 사용하여 차트용 OHLCV 데이터 제공 (무료, API 키 불필요).

### 특징

- **TimeRange 매핑:** 클라이언트가 요청한 범위를 Yahoo API 형식으로 변환

```ts
const RANGE_MAP = {
  "1m": { interval: "1m", range: "1d" }, // 1분봉 → 1일치
  "5m": { interval: "5m", range: "1d" }, // 5분봉 → 1일치
  "10m": { interval: "15m", range: "5d" }, // 10분봉 → 15분봉 5일치
  "1h": { interval: "1h", range: "5d" }, // 1시간봉 → 5일치
  "1D": { interval: "1d", range: "1mo" }, // 일봉 → 1개월치
};
```

### 코드 구조

```ts
function yahooChartPlugin(): Plugin {
  return {
    name: "yahoo-chart-proxy",
    configureServer(server) {
      server.middlewares.use("/api/chart", async (req, res) => {
        const { symbol, range } = queryParams;
        const config = RANGE_MAP[range] ?? RANGE_MAP["5m"];

        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${config.interval}&range=${config.range}`;
        const response = await fetch(yahooUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        res.end(JSON.stringify(data));
      });
    },
  };
}
```

### 사용 예시

```ts
// 클라이언트 코드
const response = await fetch("/api/chart?symbol=AAPL&range=1h");
const data = await response.json();
```

**응답 예시:**

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

---

## yahooIndexQuotePlugin

### 역할

Yahoo Finance API를 사용하여 주요 지수(DJI, SPX, IXIC) 시세 제공.

### 코드 구조

```ts
function yahooIndexQuotePlugin(): Plugin {
  return {
    name: "yahoo-index-quote-proxy",
    configureServer(server) {
      server.middlewares.use("/api/index-quote", async (req, res) => {
        const { symbol } = queryParams;

        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const response = await fetch(yahooUrl);
        const data = await response.json();

        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        res.end(
          JSON.stringify({
            symbol,
            price,
            previousClose,
            change,
            changePercent,
            dayHigh: meta.regularMarketDayHigh,
            dayLow: meta.regularMarketDayLow,
          })
        );
      });
    },
  };
}
```

### 사용 예시

```ts
// 클라이언트 코드
const response = await fetch("/api/index-quote?symbol=%5EDJI"); // ^DJI (다우존스)
const data = await response.json();
```

**응답 예시:**

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

---

## 로컬 vs 프로덕션 환경

### 로컬 개발 (npm run dev)

```
클라이언트 → /api/stock-proxy → Vite 플러그인 → Finnhub/Yahoo API
```

**동작:**

1. Vite Dev Server가 3000번 포트에서 실행
2. `/api/*` 경로는 Vite 플러그인이 처리
3. 플러그인이 외부 API 호출 후 응답 전달

**환경 변수:**

```env
# .env.local
FINNHUB_API_KEY=your_api_key_here
```

### 프로덕션 (Vercel 배포)

```
클라이언트 → /api/stock-proxy → Vercel Serverless Function → Finnhub/Yahoo API
```

**동작:**

1. Vercel이 `api/` 디렉토리를 Serverless Functions로 배포
2. `/api/*` 경로는 Serverless Function이 처리
3. Function이 외부 API 호출 후 응답 전달

**파일 매핑:**

```
로컬: vite.config.ts - finnhubProxyPlugin
↓
프로덕션: api/stock-proxy.ts

로컬: vite.config.ts - yahooChartPlugin
↓
프로덕션: api/chart.ts

로컬: vite.config.ts - yahooIndexQuotePlugin
↓
프로덕션: api/index-quote.ts
```

---

## 주의사항

### 1. API 키 관리

```env
# .env.local (로컬 개발)
FINNHUB_API_KEY=your_api_key_here

# Vercel 환경 변수 (프로덕션)
FINNHUB_API_KEY=your_api_key_here
```

### 2. User-Agent 헤더

Yahoo Finance API는 User-Agent 헤더 필수:

```ts
headers: { "User-Agent": "Mozilla/5.0" }
```

### 3. CORS 헤더

모든 프록시는 CORS 헤더 설정:

```ts
res.setHeader("Access-Control-Allow-Origin", "*");
```

### 4. 에러 처리

각 플러그인은 try-catch로 에러 처리:

```ts
try {
  const response = await fetch(url);
  const data = await response.json();
  res.end(JSON.stringify(data));
} catch {
  res.writeHead(500);
  res.end(JSON.stringify({ error: "Proxy error" }));
}
```

---

## 참조

- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Yahoo Finance API (비공식)](https://query1.finance.yahoo.com)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**작성일:** 2026-03-10
**다음 단계:** [docs/guides/serverless-functions.md](../guides/serverless-functions.md)
