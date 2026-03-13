# 시장 시간 및 DST 계산 가이드

> 미국 주식시장 개폐장 시간 판단 및 서머타임(DST) 계산

---

## 📋 목차

1. [개요](#개요)
2. [DST (Daylight Saving Time)](#dst-daylight-saving-time)
3. [시장 상태 판단](#시장-상태-판단)
4. [타임존 변환](#타임존-변환)
5. [useMarketStatus Hook](#usemarketstatus-hook)
6. [성능 최적화](#성능-최적화)

---

## 개요

Stock Desk는 미국 주식시장의 상태를 정확히 판단하기 위해 **DST(Daylight Saving Time, 서머타임)**를 고려한 시간 계산을 수행합니다.

### 시장 상태 종류

```ts
type MarketStatus = "pre" | "open" | "post" | "closed";
```

| 상태       | 시간 (ET)     | 설명                     |
| ---------- | ------------- | ------------------------ |
| **pre**    | 04:00 ~ 09:30 | 프리마켓 (Pre-Market)    |
| **open**   | 09:30 ~ 16:00 | 정규 거래 시간           |
| **post**   | 16:00 ~ 20:00 | 애프터마켓 (After-Hours) |
| **closed** | 20:00 ~ 04:00 | 시장 폐장                |

**주말:** 토요일, 일요일은 항상 `closed`

---

## DST (Daylight Saving Time)

### DST란?

**Daylight Saving Time (일광 절약 시간제, 서머타임)**

- 여름철에 시계를 1시간 앞당겨 일광을 절약하는 제도
- 미국에서는 대부분의 주가 DST 적용
- 동부시간(ET): **EST** (표준시) ↔ **EDT** (서머타임)

### DST 기간

```
시작: 3월 둘째 일요일 02:00 ET
종료: 11월 첫째 일요일 02:00 ET
```

**예시 (2026년):**

- 시작: 2026년 3월 8일 (일) 02:00 → 03:00 (1시간 건너뜀)
- 종료: 2026년 11월 1일 (일) 02:00 → 01:00 (1시간 되돌림)

### UTC 오프셋

| 시간대  | DST 적용 여부   | UTC 오프셋 |
| ------- | --------------- | ---------- |
| **EST** | 겨울 (표준시)   | UTC-5      |
| **EDT** | 여름 (서머타임) | UTC-4      |

---

## DST 계산 로직

### 알고리즘

```ts
function isDST(date: Date): boolean {
  const year = date.getUTCFullYear();

  // 3월 둘째 일요일 07:00 UTC (EST 02:00)
  const march = new Date(Date.UTC(year, 2, 1));
  const marchDST = new Date(Date.UTC(year, 2, 1 + ((7 - march.getUTCDay()) % 7) + 7, 7));

  // 11월 첫째 일요일 06:00 UTC (EDT 02:00)
  const nov = new Date(Date.UTC(year, 10, 1));
  const novDST = new Date(Date.UTC(year, 10, 1 + ((7 - nov.getUTCDay()) % 7), 6));

  return date >= marchDST && date < novDST;
}
```

### 단계별 설명

#### 1. 3월 둘째 일요일 계산

```ts
const march = new Date(Date.UTC(year, 2, 1)); // 3월 1일
const marchDST = new Date(
  Date.UTC(
    year,
    2, // 3월
    1 + ((7 - march.getUTCDay()) % 7) + 7, // 둘째 일요일
    7 // 07:00 UTC (EST 02:00)
  )
);
```

**왜 +7h인가?**

- DST 시작: 3월 둘째 일요일 **02:00 EST**
- EST = UTC-5
- 02:00 EST = 07:00 UTC

**둘째 일요일 계산:**

```
1. 첫째 일요일 = 1일 + ((7 - 3월 1일의 요일) % 7)
2. 둘째 일요일 = 첫째 일요일 + 7
```

#### 2. 11월 첫째 일요일 계산

```ts
const nov = new Date(Date.UTC(year, 10, 1)); // 11월 1일
const novDST = new Date(
  Date.UTC(
    year,
    10, // 11월
    1 + ((7 - nov.getUTCDay()) % 7), // 첫째 일요일
    6 // 06:00 UTC (EDT 02:00)
  )
);
```

**왜 +6h인가?**

- DST 종료: 11월 첫째 일요일 **02:00 EDT**
- EDT = UTC-4
- 02:00 EDT = 06:00 UTC

#### 3. DST 여부 판단

```ts
return date >= marchDST && date < novDST;
```

**조건:**

- `date >= marchDST`: 3월 둘째 일요일 07:00 UTC 이후
- `date < novDST`: 11월 첫째 일요일 06:00 UTC 이전

---

## 타임존 변환

### UTC → 동부시간(ET)

```ts
function toET(date: Date): Date {
  const offset = isDST(date) ? -4 : -5;
  return new Date(date.getTime() + offset * 60 * 60 * 1000);
}
```

**동작:**

1. `isDST(date)` 확인
2. DST 적용 시: UTC-4 (EDT)
3. DST 미적용 시: UTC-5 (EST)
4. UTC 타임스탬프에 오프셋 적용

**예시:**

```ts
// 2026년 7월 15일 14:00 UTC (DST 적용 중)
const utc = new Date("2026-07-15T14:00:00Z");
const et = toET(utc);
// et = 2026-07-15T10:00:00Z (내부는 UTC, 실제 표시는 EDT 10:00)

// 2026년 12월 15일 14:00 UTC (DST 미적용)
const utc2 = new Date("2026-12-15T14:00:00Z");
const et2 = toET(utc2);
// et2 = 2026-12-15T09:00:00Z (내부는 UTC, 실제 표시는 EST 09:00)
```

---

## 시장 상태 판단

### 핵심 로직

```ts
function getMarketStatus(now: Date): MarketStatusInfo {
  const et = toET(now);
  const dst = isDST(now);

  // ET 기준 시/분을 숫자로 변환 (09:30 → 930)
  const h = et.getUTCHours();
  const m = et.getUTCMinutes();
  const time = h * 100 + m;

  // 요일 (ET 기준, 0=일 … 6=토)
  const day = et.getUTCDay();
  const isWeekend = day === 0 || day === 6;

  let status: MarketStatus;
  let labelKey: string;

  if (isWeekend) {
    status = "closed";
    labelKey = "market.weekend";
  } else if (time >= 400 && time < 930) {
    status = "pre";
    labelKey = "market.pre";
  } else if (time >= 930 && time < 1600) {
    status = "open";
    labelKey = "market.open";
  } else if (time >= 1600 && time < 2000) {
    status = "post";
    labelKey = "market.post";
  } else {
    status = "closed";
    labelKey = "market.closed";
  }

  return { status, labelKey, dstKey, isRegularHours, isDST, currentET };
}
```

### 시간 비교 방식

**숫자 변환:**

```ts
const time = h * 100 + m;
```

**장점:**

- 간단한 범위 비교 (`time >= 930 && time < 1600`)
- 시간 계산 오버헤드 없음

**예시:**

```ts
09:30 → 9 * 100 + 30 = 930
16:00 → 16 * 100 + 0 = 1600
20:00 → 20 * 100 + 0 = 2000
```

### 시장 상태 시간표

```
00:00 ─────┐
           │ closed
04:00 ─────┼─────┐
           │     │ pre
09:30 ─────┼─────┼─────┐
           │     │     │ open
16:00 ─────┼─────┼─────┼─────┐
           │     │     │     │ post
20:00 ─────┼─────┼─────┼─────┼─────┐
           │     │     │     │     │ closed
24:00 ─────┴─────┴─────┴─────┴─────┘
```

---

## useMarketStatus Hook

### 반환 타입

```ts
export interface MarketStatusInfo {
  status: MarketStatus; // "pre" | "open" | "post" | "closed"
  labelKey: string; // i18n 키 (예: "market.open")
  dstKey: "market.dstOn" | "market.dstOff"; // DST 상태 i18n 키
  isRegularHours: boolean; // 정규 시간 여부 (status === "open")
  isDST: boolean; // DST 적용 여부
  currentET: Date; // 현재 ET 시간 (UTC 내부 표현)
}
```

### 사용 예시

```tsx
import { useMarketStatus } from "@/hooks";

export const Header = () => {
  const { status, labelKey, isDST, isRegularHours } = useMarketStatus();

  return (
    <div>
      <span>{t(labelKey)}</span>
      <span>{isDST ? t("market.dstOn") : t("market.dstOff")}</span>
      {isRegularHours && <span className="text-green-500">●</span>}
    </div>
  );
};
```

---

## 성능 최적화

### 1. 분 단위 업데이트

시장 상태는 **분 단위**로만 변경되므로, 초 단위 업데이트 불필요:

```ts
useEffect(() => {
  const tick = () => {
    const next = getMarketStatus(new Date());
    setInfo((prev) => {
      // 동일한 상태면 객체 유지 → 리렌더링 방지
      if (
        prev.status === next.status &&
        prev.labelKey === next.labelKey &&
        prev.dstKey === next.dstKey
      ) {
        return prev; // ✅ 같은 참조 유지
      }
      return next; // ✅ 새 객체 반환
    });
  };

  // 다음 분이 시작될 때까지 대기
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  let interval: ReturnType<typeof setInterval>;
  const timeout = setTimeout(() => {
    tick();
    interval = setInterval(tick, 60_000); // 1분마다
  }, msUntilNextMinute);

  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}, []);
```

**효과:**

- 불필요한 리렌더링 방지
- CPU 사용량 감소

### 2. 정렬된 interval 시작

```ts
const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
```

**동작:**

- 현재 시각이 `14:30:45.500`이면
- 다음 분(`14:31:00.000`)까지 14.5초 대기
- 그 후 정확히 분이 바뀔 때마다 실행

**장점:**

- 시간 드리프트 없음
- 정확한 분 단위 동기화

---

## KST 시계 (useKSTClock)

### 용도

한국 시간(KST) 표시용 Hook (초 단위 업데이트):

```ts
export function useKSTClock(): string {
  const [kstTimeStr, setKstTimeStr] = useState(() => getCurrentKSTStr());

  useEffect(() => {
    const interval = setInterval(() => {
      setKstTimeStr(getCurrentKSTStr());
    }, 1_000); // 1초마다
    return () => clearInterval(interval);
  }, []);

  return kstTimeStr;
}

function getCurrentKSTStr(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000); // KST = UTC+9
  return kst.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC", // UTC로 표시 (이미 +9h 보정됨)
  });
}
```

**반환 예시:** `"14:30:45"`

---

## 주의사항

### 1. Date 객체의 내부 표현

모든 Date 객체는 **UTC 타임스탬프**로 내부 저장:

```ts
const et = toET(new Date()); // 내부는 UTC, 실제 의미는 ET
const h = et.getUTCHours(); // UTC 메서드 사용 (실제로는 ET 값)
```

**중요:** `getHours()` 대신 `getUTCHours()` 사용!

### 2. DST 전환 시점

DST 전환 시점에는 **존재하지 않는 시간** 또는 **중복된 시간**이 발생:

**시작 (3월):**

```
02:00 → 03:00 (02:00~02:59는 존재하지 않음)
```

**종료 (11월):**

```
02:00 → 01:00 (01:00~01:59가 두 번 발생)
```

**대응:**

- 프리마켓은 04:00부터 시작하므로 영향 없음
- 정규 시간(09:30~16:00)도 영향 없음

### 3. 타임존 라이브러리 미사용

이 프로젝트는 `moment-timezone`, `date-fns-tz` 같은 라이브러리를 **사용하지 않음**:

**이유:**

- 번들 크기 증가
- 단순한 로직으로 충분히 구현 가능
- DST 규칙이 명확히 정의됨

---

## 테스트 예시

### DST 전환 시점 테스트

```ts
// 2026년 3월 8일 (DST 시작)
const beforeDST = new Date("2026-03-08T06:59:00Z"); // EST 01:59
const afterDST = new Date("2026-03-08T07:00:00Z"); // EDT 03:00

expect(isDST(beforeDST)).toBe(false); // ✅ EST
expect(isDST(afterDST)).toBe(true); // ✅ EDT

// 2026년 11월 1일 (DST 종료)
const beforeEnd = new Date("2026-11-01T05:59:00Z"); // EDT 01:59
const afterEnd = new Date("2026-11-01T06:00:00Z"); // EST 01:00

expect(isDST(beforeEnd)).toBe(true); // ✅ EDT
expect(isDST(afterEnd)).toBe(false); // ✅ EST
```

### 시장 상태 테스트

```ts
// 2026년 7월 15일 (수요일, DST 적용)
const premarketET = new Date("2026-07-15T08:30:00Z"); // ET 04:30 (EDT)
const openET = new Date("2026-07-15T13:30:00Z"); // ET 09:30
const closeET = new Date("2026-07-15T20:00:00Z"); // ET 16:00
const postET = new Date("2026-07-15T23:00:00Z"); // ET 19:00

expect(getMarketStatus(premarketET).status).toBe("pre");
expect(getMarketStatus(openET).status).toBe("open");
expect(getMarketStatus(closeET).status).toBe("post");
expect(getMarketStatus(postET).status).toBe("post");
```

---

## 참조

- [US Daylight Saving Time Rules](https://www.timeanddate.com/time/change/usa)
- [NYSE Trading Hours](https://www.nyse.com/markets/hours-calendars)
- [MDN: Date - UTC Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

---

**작성일:** 2026-03-10
**관련 파일:** [src/hooks/use-market-status.ts](../../src/hooks/use-market-status.ts)
