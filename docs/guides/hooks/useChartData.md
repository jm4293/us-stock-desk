# useChartData Hook

## 개요

주식 차트 데이터(OHLCV: Open, High, Low, Close, Volume)를 Yahoo Finance API에서 조회하는 훅입니다. 지정된 기간(`range`)의 캔들 데이터를 가져와 Lightweight Charts에서 사용하는 형식으로 변환합니다.

## 매개변수

```ts
symbol: string; // 미국 주식 심볼 (예: "AAPL")
range: ChartTimeRange; // "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX"
```

## 반환값

```ts
{
  state: AsyncState<StockChartData[]>; // 로딩, 성공, 에러 상태 및 차트 데이터
  refetch: () => Promise<void>; // 차트 데이터 재조회
}
```

`StockChartData`:

```ts
{
  time: number; // Unix timestamp (밀리초)
  open: number; // 시가
  high: number; // 고가
  low: number; // 저가
  close: number; // 종가
  volume: number; // 거래량
}
```

## 사용 예시

```tsx
import { useEffect, useRef } from "react";
import { useChartData } from "@/hooks";
import { createChart } from "lightweight-charts";

export function StockChart({ symbol, range }: { symbol: string; range: ChartTimeRange }) {
  const { state, refetch } = useChartData(symbol, range);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "success" || !containerRef.current) return;

    const chart = createChart(containerRef.current);
    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeries.setData(state.data);
    chart.timeScale().fitContent();
  }, [state]);

  if (state.status === "loading") return <div>차트 로딩 중...</div>;
  if (state.status === "error") return <div>에러: {state.error}</div>;

  return (
    <div>
      <div ref={containerRef} style={{ height: "400px" }} />
      <button onClick={refetch}>새로고침</button>
    </div>
  );
}
```

## 내부 동작 원리

### 1. 데이터 조회

- Yahoo Finance API로 OHLCV 데이터 조회
- JSON 응답에서 timestamp, open, high, low, close, volume 추출
- 각 타임스탬프별로 객체 생성

### 2. 데이터 필터링

- `open > 0 && close > 0` 조건으로 유효한 캔들만 필터링
- 누락된 데이터(null)는 제외

### 3. 로딩 상태 관리

- **첫 로드**: "loading" 상태 표시
- **이후 갱신**: 기존 데이터 유지, 깜빡임 없음 (hasLoadedRef 사용)
- symbol 또는 range 변경 시 상태 초기화

### 4. 에러 처리

- HTTP 에러: `HTTP {status}` 메시지 표시
- API 에러: API 응답의 `error.description` 사용
- 첫 로드 실패만 에러 상태 설정

## 주의사항

- **symbol/range 변경**: 자동으로 데이터 재조회 (의존성 배열에 포함)
- **캔들 필터링**: 시가와 종가가 0보다 큼 조건으로 유효한 캔들 선별
- **시간대**: Unix timestamp는 초 단위이므로 밀리초로 변환 (x 1000)
- **네트워크 오류**: 첫 로드 이후 오류는 조용히 처리되고 이전 데이터 유지
- **메모리**: 대량의 캔들 데이터 시 성능 영향 가능

## 성능 최적화

- `hasLoadedRef`로 불필요한 "loading" 상태 제거
- 에러 발생 후에도 기존 차트 데이터 화면에 유지
- useCallback으로 fetchCandles 메모이제이션
