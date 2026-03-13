# useExchangeRate Hook

## 개요

미국 달러(USD)와 한국 원(KRW)의 환율 정보를 조회하는 훅입니다. Vercel Serverless 프록시(`/api/exchange-rate`)를 통해 데이터를 가져오며, 프론트엔드 캐싱(1분)과 60초 폴링으로 불필요한 네트워크 요청을 최소화합니다.

## 매개변수

없음

## 반환값

```ts
{
  rate: number; // 현재 환율 (예: 1450 KRW/USD)
  data: ExchangeRateData; // 상세 환율 정보
  loading: boolean; // 로딩 상태
}
```

`ExchangeRateData`:

```ts
{
  rate: number; // 현재 환율
  previousClose: number; // 이전 종가
  change: number; // 변동액
  changePercent: number; // 변동률 (%)
  dayHigh: number; // 일일 고점
  dayLow: number; // 일일 저점
}
```

## 사용 예시

```tsx
import { useExchangeRate } from "@/hooks";

export function ExchangeRateDisplay() {
  const { rate, data, loading } = useExchangeRate();

  if (loading && !rate) return <div>환율 로딩 중...</div>;

  const changeColor = data.change >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="rounded bg-slate-800 p-4 text-white">
      <h3>USD/KRW</h3>
      <p className="text-2xl font-bold">{rate.toFixed(0)}</p>
      <p className={changeColor}>
        {data.change >= 0 ? "+" : ""}
        {data.change.toFixed(0)} ({data.changePercent.toFixed(2)}%)
      </p>
      <div className="mt-2 text-xs text-gray-400">
        <p>고점: {data.dayHigh.toFixed(0)}</p>
        <p>저점: {data.dayLow.toFixed(0)}</p>
      </div>
    </div>
  );
}
```

## 내부 동작 원리

### 1. 캐싱 전략

- **프론트엔드 캐시**: 1분 (CACHE_DURATION = 60s)
- **Vercel Edge Cache**: 60초 (서버 설정: s-maxage=60)
- 동일하게 설정하여 중복 요청 제거

### 2. 폴링 주기

- 60초 간격 자동 폴링
- 캐시 유효 시 네트워크 요청 없이 캐시된 데이터 반환
- 캐시 만료 시 새로 조회

### 3. 데이터 병합

- API 응답에서 필드 누락 시 기본값으로 대체
- `rate` 필드만 필수, 나머지는 선택사항
- `previousClose` 누락 시 현재 환율 사용
- `change`는 (rate - previousClose)로 자동 계산
- `changePercent`는 change를 previousClose로 나눠 계산

### 4. 기본값 설정

- DEFAULT_DATA: 1450 KRW/USD (기본 설정값)
- 첫 로드 전에 캐시가 없으면 기본값 사용

## 주의사항

- **모듈 수준 캐싱**: `cachedData`와 `cacheTime`을 모듈 수준 변수로 관리
- **여러 컴포넌트**: 동일 hook 사용 시 캐시 공유로 네트워크 요청 최소화
- **초기 로딩**: 첫 마운트 시 `loading: true`, 캐시 있으면 `loading: false`
- **에러 처리**: 네트워크 에러 시 console 출력만 하고 로딩 상태만 해제
- **타임존**: 환율은 시간대 영향 받지 않음 (글로벌 시장)

## 성능 최적화

- 모듈 수준 캐시로 인스턴스 간 데이터 공유
- useCallback으로 doFetch 메모이제이션
- 폴링 간격을 캐시 유효 기간과 동일하게 설정
