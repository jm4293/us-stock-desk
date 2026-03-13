# useStockData Hook

## 개요

미국 주식 가격 정보를 실시간으로 조회하고 업데이트하는 훅입니다. Finnhub API로 스냅샷 가격을 가져온 후, Yahoo Finance WebSocket으로 실시간 트레이드 데이터를 수신합니다. 장 마감 또는 WebSocket 연결 실패 시 자동으로 REST API 폴링으로 전환됩니다.

## 매개변수

```ts
symbol: string;
```

미국 주식 심볼 (예: "AAPL", "MSFT")

## 반환값

```ts
{
  state: AsyncState<StockPrice>; // 로딩, 성공, 에러 상태 및 데이터
  refetch: () => Promise<void>; // 수동으로 가격 재조회
  isWebSocket: boolean; // WebSocket 연결 활성 여부
}
```

`AsyncState` 타입:

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

## 사용 예시

```tsx
import { useStockData } from "@/hooks";

export function StockPriceDisplay({ symbol }: { symbol: string }) {
  const { state, refetch, isWebSocket } = useStockData(symbol);

  if (state.status === "loading") return <div>로딩 중...</div>;
  if (state.status === "error") return <div>에러: {state.error}</div>;
  if (state.status !== "success") return null;

  const { current, change, changePercent } = state.data;

  return (
    <div>
      <h3>{symbol}</h3>
      <p className="text-2xl">${current.toFixed(2)}</p>
      <p className={change >= 0 ? "text-green-500" : "text-red-500"}>
        {change >= 0 ? "+" : ""}
        {change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </p>
      <div className="text-xs text-gray-500">{isWebSocket ? "WebSocket 연결 중" : "폴링 모드"}</div>
      <button onClick={refetch}>새로고침</button>
    </div>
  );
}
```

## 내부 동작 원리

### 1. 초기화 단계

- Finnhub API로 현재 가격과 기본 정보 조회
- Yahoo Finance API로 확장 거래 시간(pre/post market) 가격 조회
- 두 데이터 병렬 요청으로 깜빡임 최소화

### 2. 시장 상태별 동작

- **정규장(open)**: Yahoo WebSocket 실시간 구독
- **프리장(pre), 애프터장(post)**: Yahoo WebSocket 실시간 구독
- **장 마감(closed)**: 60초 간격 REST API 폴링
- **WebSocket 연결 실패**: 자동으로 폴링 모드로 전환

### 3. 웹소켓 트레이드 처리

- 실시간 트레이드 수신 시 기존 데이터와 병합
- 누락된 필드는 전일 종가 기반으로 자동 계산
- 거래량 증분 반영

### 4. 폴백 재시도

- WebSocket 실패 후 장이 다시 열리면 자동으로 WebSocket 재연결 시도

## 주의사항

- **symbol 변경 시**: 이전 데이터와 WebSocket 연결이 자동으로 정리됨
- **최초 로딩**: 처음 로드될 때만 "loading" 상태 표시, 이후 데이터 업데이트는 깜빡임 없음
- **Stale Closure**: `marketStatusRef`와 `hasLoadedRef`를 사용해 클로저 문제 방지
- **의존성**: `useMarketStatus()` 훅과 함께 사용하여 시장 상태 동기화 필수
- **네트워크 오류**: 첫 로드 실패 시에만 에러 상태 설정, 이후 자동 재시도는 조용히 처리

## 성능 최적화

- Ref 사용으로 불필요한 리렌더링 최소화
- 폴링 주기: 정규장 중 2배 간격 사용 (POLLING_INTERVAL \* 2)
- WebSocket이 가능하면 우선 사용하여 네트워크 부하 감소
