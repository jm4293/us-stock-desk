# Custom Hooks 완전 가이드

> Stock Desk의 모든 Custom Hook 사용법 및 내부 동작 원리

---

## 📋 목차

1. [개요](#개요)
2. [Hook 목록](#hook-목록)
3. [카테고리별 분류](#카테고리별-분류)
4. [사용 패턴](#사용-패턴)

---

## 개요

Stock Desk는 **13개의 Custom Hook**을 제공하여 비즈니스 로직을 컴포넌트에서 분리합니다.

### 설계 원칙

- ✅ **단일 책임** - 각 Hook은 하나의 기능만 담당
- ✅ **재사용성** - 여러 컴포넌트에서 동일 Hook 사용 가능
- ✅ **타입 안정성** - TypeScript로 매개변수/반환값 명시
- ✅ **테스트 가능** - Hook 단위 테스트 작성 가능

---

## Hook 목록

| #   | Hook                                      | 파일                  | 주요 기능            | 상태 관리 | 비동기 |
| --- | ----------------------------------------- | --------------------- | -------------------- | --------- | ------ |
| 1   | [useAppInit](./useAppInit.md)             | use-app-init.ts       | WebSocket 초기화     | ❌        | ✅     |
| 2   | [useApplyTheme](./useApplyTheme.md)       | use-apply-theme.ts    | 테마 적용            | ✅        | ❌     |
| 3   | [useChartData](./useChartData.md)         | use-chart-data.ts     | 차트 데이터 로드     | ✅        | ✅     |
| 4   | [useExchangeRate](./useExchangeRate.md)   | use-exchange-rate.ts  | 환율 폴링            | ✅        | ✅     |
| 5   | [useFlashBorder](./useFlashBorder.md)     | use-flash-border.ts   | 가격 변동 애니메이션 | ✅        | ❌     |
| 6   | [useFullscreen](./useFullscreen.md)       | use-full-screen.ts    | 전체화면 토글        | ✅        | ✅     |
| 7   | [useIndexData](./useIndexData.md)         | use-index-data.ts     | 지수 데이터          | ✅        | ✅     |
| 8   | [useIsMobile](./useIsMobile.md)           | use-is-mobile.ts      | 모바일 감지          | ✅        | ❌     |
| 9   | [useLanguage](./useLanguage.md)           | use-language.ts       | 언어 동기화          | ✅        | ❌     |
| 10  | [useMarketStatus](./useMarketStatus.md)   | use-market-status.ts  | 시장 상태 판단       | ✅        | ❌     |
| 11  | [useNetworkStatus](./useNetworkStatus.md) | use-network-status.ts | 온라인 상태 감지     | ✅        | ❌     |
| 12  | [useStockData](./useStockData.md)         | use-stock-data.ts     | 주식 가격 데이터     | ✅        | ✅     |
| 13  | [useWakeLock](./useWakeLock.md)           | use-wake-lock.ts      | 화면 잠금 방지       | ❌        | ✅     |

---

## 카테고리별 분류

### 📊 데이터 Fetching

실시간 및 주기적 데이터 로드:

- **[useStockData](./useStockData.md)** - 주식 가격 (WebSocket + Polling)
- **[useChartData](./useChartData.md)** - OHLCV 차트 데이터
- **[useIndexData](./useIndexData.md)** - 시장 지수 (S&P 500, NASDAQ 등)
- **[useExchangeRate](./useExchangeRate.md)** - USD/KRW 환율

**공통 패턴:**

```ts
const { state, refetch } = useDataHook(params);

// state.status: "idle" | "loading" | "success" | "error"
// state.data: 실제 데이터 (success 시)
// state.error: 에러 메시지 (error 시)
```

---

### 🎨 UI/UX

사용자 인터페이스 및 경험:

- **[useFlashBorder](./useFlashBorder.md)** - 가격 변동 시 테두리 플래시
- **[useFullscreen](./useFullscreen.md)** - 전체화면 모드
- **[useApplyTheme](./useApplyTheme.md)** - 다크/라이트 모드
- **[useLanguage](./useLanguage.md)** - 다국어 (i18n)

---

### 🔧 시스템/유틸리티

시스템 상태 감지 및 초기화:

- **[useAppInit](./useAppInit.md)** - 앱 초기화 (WebSocket)
- **[useMarketStatus](./useMarketStatus.md)** - 시장 개장 여부 (DST 포함)
- **[useNetworkStatus](./useNetworkStatus.md)** - 온라인/오프라인
- **[useIsMobile](./useIsMobile.md)** - 모바일/데스크톱 감지
- **[useWakeLock](./useWakeLock.md)** - 화면 절전 방지

---

## 사용 패턴

### 1. 앱 초기화 (App.tsx)

```tsx
import { useAppInit, useApplyTheme, useWakeLock } from "@/hooks";

export const App = () => {
  useAppInit(); // WebSocket 초기화 (1회)
  useApplyTheme(); // 테마 적용
  useWakeLock(); // 화면 잠금 방지

  return <RouterProvider />;
};
```

---

### 2. 데이터 로딩 패턴

```tsx
import { useStockData } from "@/hooks";

export const StockBox = ({ symbol }: { symbol: string }) => {
  const { state, refetch, isWebSocket } = useStockData(symbol);

  // 로딩 상태
  if (state.status === "loading") {
    return <Skeleton />;
  }

  // 에러 상태
  if (state.status === "error") {
    return <ErrorDisplay error={state.error} onRetry={refetch} />;
  }

  // 성공 상태
  const { data } = state;
  return (
    <div>
      <h3>{symbol}</h3>
      <Price value={data.current} />
      <Change value={data.change} percent={data.changePercent} />
    </div>
  );
};
```

---

### 3. 조건부 렌더링 패턴

```tsx
import { useIsMobile, useMarketStatus } from "@/hooks";

export const Layout = () => {
  const isMobile = useIsMobile();
  const { status, isRegularHours } = useMarketStatus();

  return (
    <>
      {isRegularHours && <MarketOpenIndicator />}
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </>
  );
};
```

---

### 4. 애니메이션 패턴

```tsx
import { useFlashBorder } from "@/hooks";
import { cn } from "@/utils/cn";

export const PriceDisplay = ({ price, colorScheme }: Props) => {
  const { flashRingClass } = useFlashBorder(price, colorScheme);

  return <div className={cn("rounded-lg p-4", flashRingClass)}>${price.toFixed(2)}</div>;
};
```

---

### 5. Hook 조합 패턴

여러 Hook을 조합하여 복잡한 기능 구현:

```tsx
import { useFlashBorder, useMarketStatus, useNetworkStatus, useStockData } from "@/hooks";

export const AdvancedStockBox = ({ symbol }: { symbol: string }) => {
  const { state, isWebSocket } = useStockData(symbol);
  const { status: marketStatus } = useMarketStatus();
  const { flashRingClass } = useFlashBorder(state.data?.current ?? null, "kr");
  const { isOnline } = useNetworkStatus();

  const showOfflineWarning = !isOnline;
  const showMarketClosed = marketStatus === "closed";

  return (
    <div className={cn("stock-box", flashRingClass)}>
      {showOfflineWarning && <OfflineBanner />}
      {showMarketClosed && <MarketClosedBadge />}
      {/* 가격 표시 */}
    </div>
  );
};
```

---

## 성능 최적화

### 1. 선택적 구독

```tsx
// ❌ 나쁜 예: 전체 스토어 구독
const settings = useSettingsStore();

// ✅ 좋은 예: 필요한 값만 선택
const theme = useSettingsStore((state) => state.theme);
```

### 2. 의존성 배열 최적화

```tsx
// Hook 내부에서
useEffect(() => {
  fetchData(symbol);
}, [symbol]); // symbol 변경 시에만 실행
```

### 3. 메모이제이션

```tsx
const handleTrade = useCallback((trade: TradeData) => {
  setData(mapTradeToPrice(trade));
}, []); // 함수 참조 고정
```

---

## 디버깅 팁

### 1. React DevTools

```bash
# Hook 상태 추적
React DevTools → Components → 컴포넌트 선택 → Hooks 섹션
```

### 2. Console Logging

```tsx
useEffect(() => {
  console.log("[useStockData] Fetching:", symbol);
  // ...
}, [symbol]);
```

### 3. Network 탭

```
WebSocket 연결: ws:// 필터
API 호출: /api/ 필터
```

---

## 참조

- [.claude/rules/hooks.md](../../../.claude/rules/hooks.md) - Hook 작성 규칙
- [docs/architecture/websocket-strategy.md](../../architecture/websocket-strategy.md) - WebSocket 전략
- [docs/architecture/market-time-dst.md](../../architecture/market-time-dst.md) - 시장 시간 계산

---

**작성일:** 2026-03-10
**총 Hook 개수:** 13개
