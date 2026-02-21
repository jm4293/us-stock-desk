# 주식 데이터 흐름 (Data Flow)

> 실제 코드 기반으로 작성된 아키텍처 다이어그램입니다.

---

## 1. 전체 레이어 구조

```mermaid
graph TD
    subgraph External["외부 API"]
        F["Finnhub API<br/>(초기 가격 · 차트 · 검색)"]
        Y["Yahoo Finance API<br/>(실시간 시세 · 확장거래 · 환율)"]
    end

    subgraph Serverless["Vercel Serverless Functions (api/)"]
        SP["/api/stock-proxy<br/>Finnhub 프록시 (Edge Cache)"]
        CH["/api/chart<br/>Yahoo Finance 차트 프록시"]
        EH["/api/extended-hours<br/>확장거래시간 프록시"]
        ER["/api/exchange-rate<br/>Yahoo 환율 프록시 (Edge Cache)"]
    end

    subgraph Services["Services (src/services/)"]
        FA["finnhubApi.ts<br/>REST 호출 래퍼"]
        YS["yahooSocket.ts<br/>Yahoo WebSocket (Protobuf)"]
        CC["chartCache.ts<br/>중복 요청 제거"]
        LS["localStorage.ts<br/>Base64 암호화 저장"]
    end

    subgraph Hooks["Hooks (src/hooks/)"]
        USD["useStockData()<br/>실시간 가격"]
        UCD["useChartData()<br/>OHLCV 차트"]
        UMS["useMarketStatus()<br/>시장 개폐장 판단"]
        UER["useExchangeRate()<br/>환율"]
    end

    subgraph Store["Store (src/stores/)"]
        STK["stockStore<br/>종목 목록 · 위치 · 크기<br/>(Zustand + Persist)"]
    end

    subgraph Components["Components (src/components/)"]
        SB["StockBox<br/>데스크톱 위젯"]
        MSC["MobileStockCard<br/>모바일 카드"]
        PD["PriceDisplay<br/>가격 표시"]
        SC["StockChart<br/>차트"]
    end

    F --> SP
    Y --> CH & EH & ER

    SP --> FA
    CH --> CC
    EH --> FA
    ER --> UER

    FA --> USD
    YS --> USD
    CC --> UCD
    UMS --> USD

    USD --> SB & MSC & PD
    UCD --> SC
    UER --> SB & MSC
    STK --> SB & MSC
```

---

## 2. 실시간 가격 데이터 흐름 (`useStockData`)

```mermaid
flowchart TD
    Start([컴포넌트 마운트]) --> MS{useMarketStatus\n시장 상태 확인}

    MS -->|"정규장\n09:30~16:00 ET"| WS_CHECK{WebSocket\n연결 실패 여부}
    MS -->|"프리마켓\n04:00~09:30 ET"| POLL
    MS -->|"애프터마켓\n16:00~20:00 ET"| POLL
    MS -->|"장 종료\n그 외 시간"| POLL

    WS_CHECK -->|"정상"| WS["WebSocket 구독\nstockSocket.subscribe()"]
    WS_CHECK -->|"실패 (connectionFailed)"| POLL

    WS --> SNAP["최초 스냅샷\nfinnhubApi.getQuote()"]
    SNAP --> WS_RECV["실시간 tick 수신\nonmessage → handleTrade()"]
    WS_RECV --> MERGE["기존 데이터에 현재가만 교체\n{ ...prev, current: trade.p }"]

    POLL["REST Polling\nsetInterval(fetchPrice, POLLING_INTERVAL)"] --> QUOTE["finnhubApi.getQuote()\nGET /api/stock-proxy?type=quote"]
    QUOTE --> IS_OPEN{marketStatus}
    IS_OPEN -->|"open"| SET_STATE["setState success"]
    IS_OPEN -->|"pre / post"| EXT["getExtendedHours()\nGET /api/extended-hours"]
    IS_OPEN -->|"closed"| SET_STATE
    EXT --> EXT_MERGE["확장거래가를 현재가로 교체\n{ ...data, current: extPrice.price }"]
    EXT_MERGE --> SET_STATE

    MERGE --> SET_STATE
    SET_STATE --> RENDER["컴포넌트 리렌더"]

    WS -->|"연결 끊김"| RECONNECT["지수 백오프 재연결\nRECONNECT_DELAY × 2ⁿ"]
    RECONNECT -->|"MAX_RECONNECT_ATTEMPTS 초과"| FALLBACK["wsFailedFallback = true\n→ Polling 전환"]
    FALLBACK --> POLL
```

---

## 3. 차트 데이터 흐름 (`useChartData`)

```mermaid
sequenceDiagram
    participant Comp as StockChart
    participant Hook as useChartData
    participant Cache as chartCache.ts
    participant API as /api/chart
    participant Yahoo as Yahoo Finance

    Comp->>Hook: useChartData(symbol, range)
    Hook->>Cache: fetchChartWithDedup(symbol, range)

    alt 동일 key 요청 진행 중
        Cache-->>Hook: 기존 Promise 반환 (중복 제거)
    else 신규 요청
        Cache->>API: GET /api/chart?symbol=AAPL&range=1D
        API->>Yahoo: Yahoo Finance v8 chart API 호출
        Yahoo-->>API: OHLCV JSON 응답
        API-->>Cache: Response 반환
        Cache-->>Hook: Response 반환
    end

    Hook->>Hook: mapYahooToChartData()\n타임스탬프 × 1000, null 필터링
    Hook-->>Comp: { status: "success", data: StockChartData[] }
```

---

## 4. WebSocket 연결 및 재연결 (`yahooSocket`)

```mermaid
stateDiagram-v2
    [*] --> IDLE

    IDLE --> CONNECTING : subscribe() 최초 호출
    CONNECTING --> OPEN : ws.onopen
    OPEN --> SUBSCRIBED : Yahoo에 구독 심볼 전송\n{"subscribe": ["AAPL"]}

    SUBSCRIBED --> SUBSCRIBED : onmessage → Protobuf 디코딩\n→ callbacks 실행

    SUBSCRIBED --> CLOSED : ws.onclose
    OPEN --> CLOSED : ws.onclose

    CLOSED --> CONNECTING : scheduleReconnect()
```

---

## 5. 시장 상태 판단 (`useMarketStatus`)

```mermaid
flowchart LR
    NOW["현재 UTC 시각"] --> DST{DST 판단}
    DST -->|"EDT (여름)"| UTC_4["UTC - 4h → ET"]
    DST -->|"EST (겨울)"| UTC_5["UTC - 5h → ET"]

    UTC_4 & UTC_5 --> DAY{요일}
    DAY -->|"토 · 일"| WEEKEND["closed\nmarket.weekend"]
    DAY -->|"평일"| TIME{ET 시각}

    TIME -->|"04:00 ~ 09:30"| PRE["pre\nmarket.pre"]
    TIME -->|"09:30 ~ 16:00"| OPEN["open\nmarket.open\nisRegularHours=true"]
    TIME -->|"16:00 ~ 20:00"| POST["post\nmarket.post"]
    TIME -->|"그 외"| CLOSED["closed\nmarket.closed"]

    PRE & OPEN & POST -->|"true"| WS_MODE["Yahoo WebSocket 스트리밍 활성화"]
    CLOSED & WEEKEND -->|"false"| STATIC_MODE["마감가 표시 (연결 안함)"]

    style OPEN fill:#22c55e,color:#fff
    style PRE fill:#f59e0b,color:#fff
    style POST fill:#f59e0b,color:#fff
    style CLOSED fill:#6b7280,color:#fff
    style WEEKEND fill:#6b7280,color:#fff
```

---

## 6. 상태 영속화 (`stockStore`)

```mermaid
flowchart LR
    subgraph Store["Zustand stockStore"]
        STATE["stocks[]\n{ id, symbol, position, size, zIndex }"]
        ACTIONS["addStock / removeStock\nupdatePosition / updateSize\nbringToFront / setFocused"]
    end

    subgraph Persist["Persist Middleware"]
        SERIAL["partialize()\n→ stocks + maxZIndex만 저장"]
        ENC["btoa(JSON.stringify)\nBase64 인코딩"]
        DEC["JSON.parse(atob)\nBase64 디코딩"]
    end

    subgraph LS["localStorage"]
        KEY["key: 'stockdesk_stocks_v1'\nversion: 2"]
    end

    ACTIONS --> STATE
    STATE --> SERIAL --> ENC --> KEY
    KEY --> DEC --> STATE

    style ENC fill:#3b82f6,color:#fff
    style DEC fill:#3b82f6,color:#fff
```

---

## 7. 환율 시스템 (`useExchangeRate`)

```mermaid
sequenceDiagram
    participant Comp as 컴포넌트
    participant Hook as useExchangeRate
    participant API as /api/exchange-rate
    participant Vercel as Vercel Edge Cache
    participant Yahoo as Yahoo Finance<br/>(KRW=X)

    Comp->>Hook: useExchangeRate()
    Hook->>API: GET /api/exchange-rate

    API->>Vercel: 캐시 히트? (Cache-Control: s-maxage=60)

    alt Edge Cache Hit (60초 내 요청)
        Vercel-->>API: 기존 응답
    else Edge Cache Miss
        Vercel->>Yahoo: Yahoo Finance 호출
        Yahoo-->>Vercel: 새로운 환율 응답
        Vercel->>Vercel: 60초간 응답 기록 (Edge 캐시 생성)
        Vercel-->>API: 새로운 응답
    end

    API-->>Hook: { rate: 1450, ... }
    Hook-->>Comp: { rate, loading: false }
```

---

## 파일 위치 참고

| 다이어그램      | 파일                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| REST 래퍼       | [src/services/api/finnhubApi.ts](../../src/services/api/finnhubApi.ts)               |
| Yahoo WebSocket | [src/services/websocket/yahooSocket.ts](../../src/services/websocket/yahooSocket.ts) |
| 차트 캐시       | [src/services/api/chartCache.ts](../../src/services/api/chartCache.ts)               |
| 실시간 가격 훅  | [src/hooks/useStockData.ts](../../src/hooks/useStockData.ts)                         |
| 차트 데이터 훅  | [src/hooks/useChartData.ts](../../src/hooks/useChartData.ts)                         |
| 시장 상태 훅    | [src/hooks/useMarketStatus.ts](../../src/hooks/useMarketStatus.ts)                   |
| 환율 훅         | [src/hooks/useExchangeRate.ts](../../src/hooks/useExchangeRate.ts)                   |
| 상태 스토어     | [src/stores/stockStore.ts](../../src/stores/stockStore.ts)                           |
| Finnhub 프록시  | [api/stock-proxy.ts](../../api/stock-proxy.ts)                                       |
| 차트 프록시     | [api/chart.ts](../../api/chart.ts)                                                   |
| 확장거래 프록시 | [api/extended-hours.ts](../../api/extended-hours.ts)                                 |
| 환율 프록시     | [api/exchange-rate.ts](../../api/exchange-rate.ts)                                   |
