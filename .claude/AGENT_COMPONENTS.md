# 🎨 Agent 5: Components (UI 개발자)

> Components vs Features 패턴으로 React 컴포넌트 개발

## 🎯 역할

React 컴포넌트를 Components/Features 패턴으로 개발합니다.

- **Components**: 기본 UI 빌딩 블록 (Button, Input, Modal 등)
- **Features**: 완전한 기능 모듈 (DesktopStockBox, SearchModal 등)
- **Hooks**: 비즈니스 로직 (useStockData, useChartData 등)
- **kebab-case 파일명**, **PascalCase 컴포넌트명**
- **Barrel export**: 레이어 index.ts를 통한 import

## 📋 작업 범위

### ✅ 작업 대상

- `src/components/` - 기본 UI 빌딩 블록 (재사용 가능)
  - `button/` - Button 컴포넌트
  - `input/` - Input 컴포넌트
  - `modal/` - Modal 컴포넌트
  - `badge/` - Badge 컴포넌트
  - `header/` - Header 컴포넌트
  - `index.ts` - Barrel export
- `src/features/` - 완전한 기능 모듈 (특화된 기능)
  - `desktop-stock-box/` - 데스크톱 주식 박스
  - `mobile-stock-box/` - 모바일 주식 박스
  - `price-display/` - 가격 표시
  - `stock-chart/` - 주식 차트
  - `search-modal/` - 검색 모달
  - `settings-modal/` - 설정 모달
  - `index.ts` - Barrel export
- `src/hooks/` - Custom Hooks (비즈니스 로직)
  - `use-stock-data.ts`
  - `use-chart-data.ts`
  - `use-is-mobile.ts`
  - `index.ts` - Barrel export

### ❌ 작업 제외

- 스타일 정의 (Styles 에이전트가 이미 완료)
- 상태 관리 (State 에이전트가 이미 완료)
- API 호출 (Services 에이전트가 이미 완료)

## 📚 필수 읽기 문서

1. **docs/architecture/import-conventions.md** - Barrel 패턴, Components vs Features (필독!)
2. **docs/architecture/css.md** - 100% Tailwind 스타일 사용법 (필독!)
3. **docs/guides/tdd-storybook-i18n.md** - TDD, Storybook
4. **docs/architecture/tech-stack.md** - react-hook-form, GSAP 등

## 🏗 Components vs Features 구조

```
Components (기본 UI 빌딩 블록)
  - Button, Input, Modal, Badge, Header
  - 재사용 가능, 비즈니스 로직 최소화
  - Props로 데이터 받기
  ↓
Features (완전한 기능 모듈)
  - DesktopStockBox, SearchModal, PriceDisplay
  - Hook과 Store를 사용하여 비즈니스 로직 통합
  - 여러 컴포넌트를 조합
  - 특정 기능에 특화
  ↓
Hooks (비즈니스 로직)
  - useStockData, useChartData
  - 상태 관리, 데이터 fetching, 계산
  - 컴포넌트에서 분리된 로직
```

## 🔧 작업 순서

### 1단계: Components (기본 UI 빌딩 블록)

#### 1.1 Button Component

```tsx
// src/components/button/button.tsx (kebab-case 파일명)
import { cn } from "@/utils/cn/cn";

interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        // 기본 스타일
        "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2",
        // variant별 스타일
        variant === "primary" && "bg-blue-500 hover:bg-blue-600 text-white",
        variant === "secondary" && "bg-gray-500 hover:bg-gray-600 text-white",
        variant === "ghost" && "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
        // size별 스타일
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        // 외부 클래스
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

Button.displayName = "Button";
```

```ts
// src/components/button/index.ts (Barrel export)
export * from "./button";
```

```ts
// src/components/index.ts (Barrel export)
export * from "./button";
export * from "./input";
export * from "./modal";
export * from "./badge";
export * from "./header";
// ... 모든 기본 컴포넌트
```

### 2단계: Features (완전한 기능 모듈)

#### 2.1 Desktop Stock Box Feature

```tsx
// src/features/desktop-stock-box/desktop-stock-box.tsx (kebab-case 파일명)
import { Rnd } from "react-rnd";
import { cn } from "@/utils/cn/cn";
import { Button } from "@/components";
import { PriceDisplay, StockChart } from "@/features";
import { useStockData } from "@/hooks";
import type { StockBox } from "@/types/stock";

interface DesktopStockBoxProps {
  stock: StockBox;
  focused: boolean;
  onFocus: () => void;
  onRemove: () => void;
  onDragStop: (position: { x: number; y: number }) => void;
  onResizeStop: (size: { width: number; height: number }) => void;
}

export const DesktopStockBox = ({
  stock,
  focused,
  onFocus,
  onRemove,
  onDragStop,
  onResizeStop,
}: DesktopStockBoxProps) => {
  const { state } = useStockData(stock.symbol);

  return (
    <Rnd
      position={stock.position}
      size={stock.size}
      onDragStop={(e, d) => onDragStop({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref) =>
        onResizeStop({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        })
      }
      onMouseDown={onFocus}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      className={cn(
        "glass rounded-xl p-4",
        "transition-all duration-200",
        focused && "z-50 shadow-2xl ring-2 ring-blue-500",
        !focused && "opacity-70 blur-[2px]"
      )}
      style={{ zIndex: stock.zIndex }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{stock.symbol}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stock.companyName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove stock">
            ✕
          </Button>
        </div>

        {/* Content */}
        {state.status === "loading" && (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-gray-500">Loading...</span>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-red-500">Error: {state.error}</span>
          </div>
        )}

        {state.status === "success" && (
          <>
            <PriceDisplay
              price={state.data.current}
              change={state.data.change}
              changePercent={state.data.changePercent}
              className="mb-4"
            />
            <div className="flex-1">
              <StockChart symbol={stock.symbol} />
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

DesktopStockBox.displayName = "DesktopStockBox";
```

```ts
// src/features/desktop-stock-box/index.ts (Barrel export)
export * from "./desktop-stock-box";
```

#### 2.2 Price Display Feature

```tsx
// src/features/price-display/price-display.tsx (kebab-case 파일명)
import { cn } from "@/utils/cn/cn";
import { useSettingsStore } from "@/stores";

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  className?: string;
}

export const PriceDisplay = ({ price, change, changePercent, className }: PriceDisplayProps) => {
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="text-3xl font-bold">${price.toFixed(2)}</div>
      <div
        className={cn(
          "text-lg font-semibold transition-colors",
          colorScheme === "kr" && {
            "text-up-kr": isUp,
            "text-down-kr": isDown,
          },
          colorScheme === "us" && {
            "text-up-us": isUp,
            "text-down-us": isDown,
          }
        )}
      >
        {isUp && "↑"}
        {isDown && "↓"}
        {change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </div>
    </div>
  );
};

PriceDisplay.displayName = "PriceDisplay";
```

```ts
// src/features/price-display/index.ts (Barrel export)
export * from "./price-display";
```

```ts
// src/features/index.ts (Barrel export)
export * from "./desktop-stock-box";
export * from "./mobile-stock-box";
export * from "./price-display";
export * from "./stock-chart";
export * from "./search-modal";
export * from "./settings-modal";
// ... 모든 피처
```

### 3단계: Custom Hooks (비즈니스 로직)

#### 3.1 useStockData Hook

```tsx
// src/hooks/use-stock-data.ts (kebab-case 파일명)
import { useState, useEffect, useRef } from "react";
import { finnhubApi } from "@/services/api/fetch-finnhub";
import { yahooSocket } from "@/services/websocket/yahoo-socket";
import type { StockPrice } from "@/types/stock";

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export function useStockData(symbol: string) {
  const [state, setState] = useState<AsyncState<StockPrice>>({ status: "idle" });
  const currentData = useRef<StockPrice | null>(null);

  useEffect(() => {
    setState({ status: "loading" });

    // Yahoo WebSocket 연결 (우선순위)
    const unsubscribe = yahooSocket.subscribe(symbol, (data) => {
      currentData.current = data;
      setState({ status: "success", data });
    });

    // Polling fallback (WebSocket 실패 시)
    const interval = setInterval(() => {
      if (currentData.current) return; // WebSocket 연결 중이면 스킵
      fetchPrice();
    }, 3000);

    async function fetchPrice() {
      try {
        const data = await finnhubApi.getQuote(symbol);
        setState({ status: "success", data });
      } catch (error) {
        setState({ status: "error", error: error.message });
      }
    }

    fetchPrice();

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [symbol]);

  return { state };
}
```

```ts
// src/hooks/index.ts (Barrel export)
export * from "./use-stock-data";
export * from "./use-chart-data";
export * from "./use-is-mobile";
export * from "./use-market-status";
// ... 모든 Hook
```

## ✅ 완료 체크리스트

### Components (기본 UI 빌딩 블록, kebab-case 파일명)

- [ ] `button/button.tsx` + `button/index.ts`
- [ ] `input/input.tsx` + `input/index.ts`
- [ ] `modal/modal.tsx` + `modal/index.ts`
- [ ] `badge/badge.tsx` + `badge/index.ts`
- [ ] `header/header.tsx` + `header/index.ts`
- [ ] `components/index.ts` (Barrel export)

### Features (완전한 기능 모듈, kebab-case 파일명)

- [ ] `desktop-stock-box/desktop-stock-box.tsx` + `index.ts`
- [ ] `mobile-stock-box/mobile-stock-box.tsx` + `index.ts`
- [ ] `price-display/price-display.tsx` + `index.ts`
- [ ] `stock-chart/stock-chart.tsx` + `index.ts`
- [ ] `search-modal/search-modal.tsx` + `index.ts`
- [ ] `settings-modal/settings-modal.tsx` + `index.ts`
- [ ] `features/index.ts` (Barrel export)

### Hooks (비즈니스 로직, kebab-case 파일명)

- [ ] `use-stock-data.ts` (Yahoo WebSocket + Finnhub 백업)
- [ ] `use-chart-data.ts` (Yahoo Chart API)
- [ ] `use-is-mobile.ts` (반응형 레이아웃)
- [ ] `use-market-status.ts` (Extended Hours)
- [ ] `hooks/index.ts` (Barrel export)

### App 통합

- [ ] App.tsx 업데이트
- [ ] i18n 설정 (react-i18next)
- [ ] Router 설정 (필요 시)

### 파일 명명 규칙 준수

- [ ] 모든 파일명 kebab-case
- [ ] 모든 컴포넌트명 PascalCase
- [ ] 모든 레이어에 Barrel export (index.ts)

## 💡 Best Practices

### 1. 컴포넌트는 UI만

```tsx
// ✅ 좋은 예
const MyComponent = () => {
  const { data, loading } = useMyHook(); // Hook에서 로직
  return <div>{data}</div>; // UI만
};

// ❌ 나쁜 예
const MyComponent = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    // 복잡한 로직... (Hook으로 분리해야 함)
  }, []);
  return <div>{data}</div>;
};
```

### 2. cn() 함수 활용

```tsx
className={cn(
  'base-classes',
  condition && 'conditional-class',
  props.className
)}
```

### 3. 접근성 고려

```tsx
<button aria-label="Close">
  <Icon name="close" />
</button>
```

## 🤝 다음 에이전트에게 전달

Components 작업 완료 후:

```
✅ Components 작업 완료

생성된 결과물:
- Atoms 컴포넌트
- Molecules 컴포넌트
- Organisms 컴포넌트
- Templates & Pages
- Custom Hooks

다음 에이전트: Agent 6 (Test)
"AGENT_TEST.md를 읽고 테스트와 Storybook을 작성해주세요"
```

---

**담당**: UI 컴포넌트 개발  
**의존성**: Architect, Styles, State, Services  
**다음 에이전트**: Test
