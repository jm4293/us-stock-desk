# useFlashBorder Hook

## 개요

주식 가격 변동 시 테두리에 플래시 애니메이션을 표시하는 훅입니다. 가격이 올라가면 상승 색상으로, 내려가면 하락 색상으로 600ms 동안 outline을 표시합니다. 한국식(up=빨강, down=파랑)과 미국식(up=초록, down=빨강) 색상 스킴을 지원합니다.

## 매개변수

```ts
currentPrice: number | null; // 현재 가격 (null이면 무시)
colorScheme: "kr" | "us"; // 색상 스킴 ("kr": 한국식, "us": 미국식)
```

## 반환값

```ts
{
  flashDirection: "up" | "down" | null; // 플래시 방향 (up/down/null)
  flashRingClass: string | null; // Tailwind 클래스 (ring-2 ring-color-500 또는 null)
}
```

## 사용 예시

```tsx
import { useFlashBorder } from "@/hooks";
import { cn } from "@/utils/cn";

export function StockBox({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const { flashRingClass } = useFlashBorder(currentPrice, "kr");

  return (
    <div
      className={cn(
        "glass rounded-lg p-4 transition-all",
        "border border-white/20",
        flashRingClass // 플래시 애니메이션 적용
      )}
    >
      <h3>{symbol}</h3>
      <p>${currentPrice.toFixed(2)}</p>
    </div>
  );
}
```

## 내부 동작 원리

### 1. 가격 변동 감지

- `prevPriceRef`로 이전 가격 저장
- 새 currentPrice 수신 시 이전 가격과 비교

### 2. 플래시 방향 결정

- `currentPrice > prevPrice` → "up" (상승)
- `currentPrice < prevPrice` → "down" (하락)
- `currentPrice === prevPrice` → 플래시 안 함

### 3. 색상 스킴 적용

- **한국식(kr)**:
  - up: `ring-2 ring-red-500` (빨강)
  - down: `ring-2 ring-blue-500` (파랑)
- **미국식(us)**:
  - up: `ring-2 ring-green-400` (초록)
  - down: `ring-2 ring-red-500` (빨강)

### 4. 애니메이션 타이밍

- 플래시 시작: 상태 변경 시 즉시
- 플래시 종료: 600ms 후 자동 reset
- 이전 타이머 정리: 중복 타이머 방지

## 주의사항

- **null 처리**: currentPrice가 null이면 플래시 발생 안 함
- **초기 렌더**: 첫 렌더링 시 null 상태로 플래시 안 함
- **정확한 비교**: 정수/소수 구분 없이 수치 비교만 수행
- **타이머 정리**: 언마운트 시 남은 타이머 정리 필수
- **색상 커스터마이징**: colorScheme를 통한 색상 선택만 가능
  (추가 색상 스킴 필요 시 훅 수정 필요)

## 성능 최적화

- Ref 사용으로 상태 불필요한 렌더링 제거
- setTimeout 타이머로 정확한 600ms 제어
- 컴포넌트 언마운트 시 타이머 정리

## 스타일 적용 팁

CSS Modules와 함께 사용하려면:

```tsx
import { cn } from "@/utils/cn";
import styles from "./StockBox.module.css";

export function StockBox({ symbol, currentPrice }: Props) {
  const { flashRingClass } = useFlashBorder(currentPrice, "kr");

  return <div className={cn(styles.container, flashRingClass)}>{/* 콘텐츠 */}</div>;
}
```

## 애니메이션 커스터마이징

기본 600ms 대신 다른 시간 사용:

```tsx
const { flashRingClass } = useFlashBorder(currentPrice, "kr");

// 훅 내부의 600을 원하는 값으로 수정해야 함
// 현재는 하드코드되어 있음 (개선 필요)
```
