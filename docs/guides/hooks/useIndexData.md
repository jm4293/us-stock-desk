# useIndexData Hook

## 개요

미국 주가지수(S&P 500, NASDAQ, Dow Jones 등) 데이터를 실시간으로 조회하는 훅입니다. `useStockData()`와 유사하게 초기 스냅샷을 REST API로 가져온 후, 거래 시간 중 Yahoo Finance WebSocket으로 실시간 가격 업데이트를 수신합니다. 장 마감 시 60초 주기 폴링으로 전환됩니다.

## 매개변수

```ts
symbol: IndexSymbol; // "^GSPC" (S&P 500) | "^IXIC" (NASDAQ) | "^DJI" (Dow Jones) 등
```

## 반환값

```ts
{
  data: MarketIndex | null; // 지수 데이터 (null이면 로딩 중 또는 에러)
  loading: boolean; // 초기 로딩 상태
}
```

`MarketIndex`:

```ts
{
  symbol: string; // 지수 심볼
  shortName: string; // 축약명 (예: "S&P 500")
  price: number; // 현재 지수
  previousClose: number; // 이전 종가
  change: number; // 변동액
  changePercent: number; // 변동률 (%)
  dayHigh: number; // 일일 고점
  dayLow: number; // 일일 저점
}
```

## 사용 예시

```tsx
import { useIndexData } from "@/hooks";

export function IndexWidget() {
  const { data, loading } = useIndexData("^GSPC"); // S&P 500

  if (loading) return <div className="text-gray-400">로딩 중...</div>;
  if (!data) return <div className="text-red-400">데이터 없음</div>;

  const isUp = data.change >= 0;
  const changeColor = isUp ? "text-green-500" : "text-red-500";

  return (
    <div className="rounded bg-slate-900 p-4">
      <h4 className="text-sm text-gray-400">{data.shortName}</h4>
      <p className="text-lg font-bold">{data.price.toFixed(2)}</p>
      <p className={changeColor}>
        {isUp ? "+" : ""}
        {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
      </p>
    </div>
  );
}
```

## 내부 동작 원리

### 1. 초기 데이터 로드

- `/api/index-quote?symbol=...` 엔드포인트로 초기 지수 데이터 조회
- 성공 시 `hasLoadedOnce` 플래그 설정 (이후 로딩 상태 표시 안 함)

### 2. 시장 상태별 구독 전환

- **정규장/프리장/애프터장**: Yahoo WebSocket 구독
  - `yahooSocket.subscribe(symbol, handleTrade)` 호출
  - 실시간 트레이드 데이터 수신
- **장 마감**: REST API 폴링으로 전환
  - 60초(INDEX_POLLING_INTERVAL) 주기 갱신

### 3. WebSocket 트레이드 처리

- 실시간 트레이드 수신 시 기존 데이터 병합
- 누락된 필드는 전일 종가 기반으로 자동 계산
- dayHigh, dayLow 별도 반영

### 4. symbol 변경 처리

- 이전 구독 자동 정리
- 상태 초기화 및 새로 로드

## 주의사항

- **symbol 변경**: 자동으로 이전 구독 정리 및 새 데이터 로드
- **초기 로딩**: 첫 로드만 `loading: true`, 이후 데이터 갱신은 깜빡임 없음
- **에러 처리**: 에러 발생 시 조용히 처리, data는 null 유지
- **API 엔드포인트**: `/api/index-quote` 의존
- **지수 심볼**: 대문자 ^ 포함 필수 (예: "^GSPC", "^IXIC")

## 성능 최적화

- `dataRef`로 최신 데이터 추적 (WebSocket 핸들러에서 사용)
- `hasLoadedOnce` 플래그로 불필요한 "loading" 상태 제거
- 장 마감 중 폴링 주기: 60초 (주식과 동일)
- WebSocket 우선 사용으로 네트워크 부하 최소화

## 공통 미국 주가지수

| 심볼  | 이름             | 설명            |
| ----- | ---------------- | --------------- |
| ^GSPC | S&P 500          | 대형주 500개    |
| ^IXIC | NASDAQ Composite | 나스닥 종합     |
| ^DJI  | Dow Jones        | 다우존스 30     |
| ^FTSE | FTSE 100         | 런던 증권거래소 |
| ^N225 | Nikkei 225       | 일본 닛케이     |

## 시장 상태와 업데이트 빈도

| 시장 상태       | 업데이트 방식 | 빈도     |
| --------------- | ------------- | -------- |
| 정규장(open)    | WebSocket     | 실시간   |
| 프리장(pre)     | WebSocket     | 실시간   |
| 애프터장(post)  | WebSocket     | 실시간   |
| 장 마감(closed) | REST API 폴링 | 60초마다 |
