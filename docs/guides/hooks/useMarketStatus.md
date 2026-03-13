# useMarketStatus Hook

## 개요

미국 주식 시장의 현재 상태(개장, 프리장, 애프터장, 폐장)와 DST(서머타임) 정보를 제공하는 훅입니다. 분 단위로만 업데이트되어 불필요한 리렌더링을 방지합니다. 별도로 `useKSTClock()` 함수를 제공하여 KST 현재 시각을 초 단위로 표시합니다.

## 매개변수

없음

## 반환값

```ts
{
  status: MarketStatus; // "open" | "pre" | "post" | "closed"
  labelKey: string; // i18n 번역 키 (예: "market.open")
  dstKey: "market.dstOn" | "market.dstOff"; // 서머타임 여부
  isRegularHours: boolean; // 정규장 여부
  isDST: boolean; // 서머타임 활성 여부
  currentET: Date; // 미국 동부시간(ET)
}
```

## 사용 예시

```tsx
import { useKSTClock, useMarketStatus } from "@/hooks";
import { useTranslation } from "react-i18next";

export function MarketStatusBar() {
  const { status, labelKey, isDST, currentET } = useMarketStatus();
  const kstTime = useKSTClock(); // KST 시각 (초 단위 갱신)
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 bg-slate-900 p-4 text-white">
      <div className="flex flex-col">
        <span className="font-bold">{t(labelKey)}</span>
        <span className="text-xs text-gray-400">{t(`market.${isDST ? "dstOn" : "dstOff"}`)}</span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-sm">ET: {currentET.toLocaleTimeString()}</span>
        <span className="text-sm">KST: {kstTime}</span>
      </div>
    </div>
  );
}
```

## 내부 동작 원리

### 1. DST(서머타임) 판단

- 3월 둘째 일요일 02:00 ET ~ 11월 첫째 일요일 02:00 ET
- UTC 기준으로 계산: March 2nd Sunday 07:00 UTC ~ Nov 1st Sunday 06:00 UTC
- DST 중에는 UTC-4, 아니면 UTC-5

### 2. 시장 상태 판단

- **프리장(pre)**: 04:00 ~ 09:30 ET
- **정규장(open)**: 09:30 ~ 16:00 ET
- **애프터장(post)**: 16:00 ~ 20:00 ET
- **폐장(closed)**: 그 외 시간 (평일) 또는 주말

### 3. 성능 최적화

- 분 단위로만 상태 변경 감지
- 초 단위 리렌더링 방지
- 상태 값이 변경되지 않으면 동일 객체 반환 (참조 동등성)
- Timeout으로 분 경계에 맞춰 시작

### 4. KST 시각 제공

- `useKSTClock()` 함수로 초 단위 실시간 갱신
- 시계 컴포넌트 전용으로 별도 분리

## 주의사항

- **시간대 변환**: 로컬 시간이 아닌 미국 동부시간(ET) 기준
- **DST 미포함 지역**: 미국 하와이, 애리조나 등은 별도 처리 필요 (현재 미구현)
- **초 단위 갱신 필요**: KST 시각을 초 단위로 표시해야 하면 `useKSTClock()`을 별도로 사용
- **i18n 번역키**: "market.open", "market.pre", "market.post", "market.closed", "market.weekend", "market.dstOn", "market.dstOff"가 번역 파일에 존재해야 함

## 주요 특징

- **메모리 효율**: 분 단위 갱신으로 불필요한 상태 업데이트 제거
- **정확한 시장 상태**: 미국 서머타임 자동 반영
- **국제화 지원**: i18n 번역 키 제공
- **높은 정확성**: UTC 기반 계산으로 타임존 오류 제거
