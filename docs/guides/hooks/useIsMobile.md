# useIsMobile Hook

## 개요

현재 뷰포트 너비가 모바일 기준(768px)보다 작은지 판단하는 훅입니다. `window.matchMedia()`를 사용하여 반응형 UI를 구현할 때 미디어 쿼리 상태를 React 상태로 관리합니다.

## 매개변수

없음

## 반환값

```ts
boolean; // 모바일 여부 (너비 < 768px)
```

## 사용 예시

```tsx
import { useIsMobile } from "@/hooks";
import { cn } from "@/utils/cn";

export function ResponsiveLayout() {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "grid gap-4 p-4",
        isMobile
          ? "grid-cols-1" // 모바일: 1열
          : "grid-cols-3" // 데스크톱: 3열
      )}
    >
      {/* 그리드 아이템 */}
    </div>
  );
}
```

## 내부 동작 원리

### 1. 모바일 기준 설정

- MOBILE_BREAKPOINT = 768px
- Tailwind CSS 기본 md 브레이크포인트와 동일

### 2. 초기 상태

- 초기값: `window.innerWidth < MOBILE_BREAKPOINT`
- 렌더링 시점의 뷰포트 너비 기반

### 3. 미디어 쿼리 리스너

- `window.matchMedia("(max-width: 767px)")` 설정
- 뷰포트 너비 변경 시 자동으로 상태 업데이트
- MediaQueryListEvent의 `matches` 속성으로 판단

### 4. 정리

- 언마운트 시 이벤트 리스너 제거

## 주의사항

- **767px vs 768px**: 미디어 쿼리는 `max-width: 767px` 사용 (768px 경계에서 정확)
- **SSR 환경**: 서버 렌더링 시 `window` 객체 없음 (에러 방지 필요)
- **성능**: 리사이징 이벤트 자주 발생하지 않으므로 성능 우려 불필요
- **초기 렌더링**: 서버에서는 기본값으로, 클라이언트에서 실제 값 업데이트

## 사용 팁

### 1. 조건부 렌더링

```tsx
const isMobile = useIsMobile();

return (
  <>
    {isMobile && <MobileHeader />}
    {!isMobile && <DesktopHeader />}
  </>
);
```

### 2. 동적 컴포넌트 선택

```tsx
const isMobile = useIsMobile();
const Layout = isMobile ? MobileLayout : DesktopLayout;

return <Layout>{children}</Layout>;
```

### 3. 스타일 동적 적용

```tsx
const isMobile = useIsMobile();

const containerClass = isMobile ? "p-2 rounded-lg" : "p-4 rounded-xl";
```

## 성능 최적화

- 최소한의 상태 (boolean)로 경량화
- 미디어 쿼리 변경 감지로 정확한 업데이트
- 이벤트 리스너 정리로 메모리 누수 방지

## Tailwind CSS와의 관계

Tailwind에서 제공하는 반응형 클래스 대신 이 훅을 사용하는 경우:

```tsx
// ❌ Tailwind 반응형 클래스 (가능하면 이것 사용)
<div className="grid grid-cols-1 md:grid-cols-3">

// ✅ useIsMobile 훅 (동적 로직 필요 시)
const isMobile = useIsMobile();
return <div className={isMobile ? "grid grid-cols-1" : "grid grid-cols-3"}>;
```

## SSR 호환 버전

Next.js 등 SSR 환경에서 사용하려면:

```ts
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile ?? false; // 서버 렌더링 시 false 반환
}
```
