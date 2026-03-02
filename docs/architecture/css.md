# US Stock Desk - CSS 전략 및 아키텍처 가이드

## 🎨 CSS 전략: 100% Tailwind CSS

### 핵심 원칙

- ✅ **Tailwind CSS 100% 사용** (CSS Modules 사용 안 함)
- ✅ **tailwind-merge + clsx로 클래스 병합**
- ✅ **커스텀 유틸리티는 `@layer utilities`로 정의**
- ❌ **CSS Modules 사용 금지**
- ❌ **!important 절대 사용 금지**

### 변경 사항

이 프로젝트는 초기 계획과 달리 **Tailwind CSS 100%**를 사용합니다:

- ❌ **CSS Modules 제거**: 복잡한 스타일도 Tailwind로 처리
- ✅ **@layer utilities**: 커스텀 유틸리티 클래스 정의
- ✅ **Tailwind config**: 커스텀 색상, 애니메이션 정의
- ✅ **cn() 함수**: 조건부 클래스 병합

---

## 📦 필수 패키지

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.1",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## ⚙️ Tailwind 설정

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 한국식 (빨강↑ / 파랑↓)
        "up-kr": "#ff0000",
        "down-kr": "#0000ff",
        // 미국식 (초록↑ / 빨강↓)
        "up-us": "#22c55e",
        "down-us": "#ef4444",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "flash-border": "flashBorder 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        flashBorder: {
          "0%, 100%": { borderColor: "transparent" },
          "50%": { borderColor: "currentColor" },
        },
      },
    },
  },
  plugins: [],
};
```

### postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## 🛠 유틸리티 함수

### src/utils/cn/cn.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스를 병합하는 유틸리티 함수
 * clsx로 조건부 클래스 처리 → twMerge로 충돌 해결
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**사용 방법**:

```tsx
import { cn } from "@/utils/cn/cn";

<div
  className={cn(
    "glass rounded-xl p-4", // 기본 스타일
    focused && "z-50 shadow-2xl", // 조건부 스타일
    !focused && "opacity-70 blur-sm",
    className // 외부에서 전달받은 클래스
  )}
/>;
```

---

## 🎨 글로벌 스타일

### src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom Utilities */
@layer utilities {
  /* Glassmorphism 효과 */
  .glass {
    @apply border border-white/20 bg-white/10 backdrop-blur-lg;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .glass-strong {
    @apply border border-white/30 bg-white/20 backdrop-blur-xl;
  }

  /* 스크롤바 스타일 */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  /* 텍스트 선택 방지 */
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}

/* Custom Components (필요 시) */
@layer components {
  .btn-primary {
    @apply glass rounded-lg px-4 py-2;
    @apply transition-all duration-200 hover:bg-white/20;
    @apply active:scale-95;
  }
}
```

### src/styles/themes.css

```css
:root {
  /* Light Mode */
  --color-bg: #f5f5f5;
  --color-text: #333333;
  --color-border: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  /* Dark Mode */
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
  --color-border: rgba(255, 255, 255, 0.1);
}
```

---

## 💻 사용 예시

### 패턴 A: 기본 컴포넌트 (Tailwind만 사용)

```tsx
// src/components/button/button.tsx
import { cn } from "@/utils/cn/cn";

interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ variant = "primary", size = "md", className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        // 기본 스타일
        "rounded-lg font-medium transition-colors",
        // variant별 스타일
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" && "bg-gray-500 text-white hover:bg-gray-600",
        // size별 스타일
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        // 외부 클래스
        className
      )}
      {...props}
    />
  );
};

Button.displayName = "Button";
```

### 패턴 B: 피처 컴포넌트 (조건부 스타일)

```tsx
// src/features/desktop-stock-box/desktop-stock-box.tsx
import { PriceDisplay } from "@/features";
import { Rnd } from "react-rnd";
import { cn } from "@/utils/cn/cn";

interface DesktopStockBoxProps {
  symbol: string;
  focused: boolean;
  onFocus: () => void;
}

export const DesktopStockBox = ({ symbol, focused, onFocus }: DesktopStockBoxProps) => {
  return (
    <Rnd
      className={cn(
        // 기본 glassmorphism 스타일
        "glass rounded-xl p-4",
        "transition-all duration-200",
        // 포커스 상태에 따른 조건부 스타일
        focused && "z-50 shadow-2xl ring-2 ring-blue-500",
        !focused && "opacity-70 blur-[2px]",
        // hover 효과
        "hover:-translate-y-1 hover:shadow-xl"
      )}
      onClick={onFocus}
    >
      <PriceDisplay symbol={symbol} />
    </Rnd>
  );
};

DesktopStockBox.displayName = "DesktopStockBox";
```

### 패턴 C: 동적 색상 (clsx 활용)

```tsx
// src/features/price-display/price-display.tsx
import { useSettingsStore } from "@/stores";
import { cn } from "@/utils/cn/cn";

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
}

export const PriceDisplay = ({ price, change, changePercent }: PriceDisplayProps) => {
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div className="flex flex-col space-y-2">
      {/* 가격 */}
      <div className="text-3xl font-bold">${price.toFixed(2)}</div>

      {/* 변동 */}
      <div
        className={cn(
          "text-lg font-semibold transition-colors",
          // 한국식 (빨강↑ / 파랑↓)
          colorScheme === "kr" && {
            "text-up-kr": isUp,
            "text-down-kr": isDown,
          },
          // 미국식 (초록↑ / 빨강↓)
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

### 패턴 D: 복잡한 레이아웃 (Grid, Flex)

```tsx
// src/features/search-modal/search-modal.tsx
import { Modal } from "@/components";
import { cn } from "@/utils/cn/cn";

export const SearchModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="glass-strong w-full max-w-2xl rounded-2xl p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">주식 검색</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/10">
            ✕
          </button>
        </div>

        {/* 검색 입력 */}
        <input
          type="text"
          placeholder="심볼 또는 회사명 입력..."
          className={cn(
            "w-full rounded-lg px-4 py-3",
            "border border-white/20 bg-white/10",
            "transition-colors focus:border-blue-500 focus:outline-none"
          )}
        />

        {/* 검색 결과 */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              className={cn(
                "glass rounded-lg p-3 text-left",
                "transition-all hover:scale-105 hover:bg-white/20"
              )}
            >
              <div className="font-bold">{stock.symbol}</div>
              <div className="text-sm opacity-70">{stock.name}</div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
```

---

## 🏗 아키텍처: Custom Hooks Pattern

### 책임 분리 원칙

| 레이어         | 책임              | 예시                                     |
| -------------- | ----------------- | ---------------------------------------- |
| **Components** | 기본 UI 빌딩 블록 | Button, Input, Modal, Badge              |
| **Features**   | 완전한 기능 모듈  | DesktopStockBox, SearchModal, StockChart |
| **Hooks**      | 비즈니스 로직     | 상태 관리, 데이터 fetching, 계산         |
| **Stores**     | 전역 상태 관리    | Zustand 스토어 (persist + devtools)      |
| **Services**   | 외부 통신         | API 호출, WebSocket                      |
| **Utils**      | 순수 함수         | 포맷팅, 변환, 유효성 검사                |

---

## 📝 코드 예시

### ❌ 나쁜 예 (모든 로직이 컴포넌트에)

```tsx
export const StockBox = ({ symbol }) => {
  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // 100줄의 비즈니스 로직...
  useEffect(() => {
    // WebSocket 연결
    const socket = new WebSocket("...");
    socket.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };
    return () => socket.close();
  }, [symbol]);

  useEffect(() => {
    // LocalStorage 저장
    localStorage.setItem("position", JSON.stringify(position));
  }, [position]);

  return <div>{/* UI */}</div>;
};
```

### ✅ 좋은 예 (로직 분리)

#### 1. Custom Hook (비즈니스 로직)

```tsx
// src/hooks/use-stock-data.ts
import { useEffect, useRef, useState } from "react";
import { finnhubApi } from "@/services/api/fetch-finnhub";
import { yahooSocket } from "@/services/websocket/yahoo-socket";

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

    // WebSocket 연결 (우선순위)
    const unsubscribe = yahooSocket.subscribe(symbol, (data) => {
      currentData.current = data;
      setState({ status: "success", data });
    });

    // Polling fallback
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

#### 2. Component (UI만)

```tsx
// src/features/desktop-stock-box/desktop-stock-box.tsx
import { PriceDisplay } from "@/features";
import { useStockData } from "@/hooks";
import { Rnd } from "react-rnd";
import { cn } from "@/utils/cn/cn";

interface DesktopStockBoxProps {
  symbol: string;
  focused: boolean;
  onFocus: () => void;
}

export const DesktopStockBox = ({ symbol, focused, onFocus }: DesktopStockBoxProps) => {
  // 비즈니스 로직은 Hook에서
  const { state } = useStockData(symbol);

  // UI 렌더링만
  if (state.status === "loading") {
    return <div className="glass rounded-xl p-4">Loading...</div>;
  }

  if (state.status === "error") {
    return <div className="glass rounded-xl p-4 text-red-500">Error: {state.error}</div>;
  }

  return (
    <Rnd
      className={cn("glass rounded-xl p-4", focused && "z-50 shadow-2xl", !focused && "blur-[2px]")}
      onClick={onFocus}
    >
      <div className="flex h-full flex-col">
        <h3 className="text-xl font-bold">{symbol}</h3>
        {state.status === "success" && <PriceDisplay price={state.data} />}
      </div>
    </Rnd>
  );
};

DesktopStockBox.displayName = "DesktopStockBox";
```

---

## 📋 개발 원칙

### 1. CSS 전략

- ✅ **Tailwind CSS 100% 사용**
- ✅ cn() 함수로 조건부 클래스 병합
- ✅ 커스텀 유틸리티 클래스는 `@layer utilities`로 정의
- ❌ **CSS Modules 사용 금지**
- ❌ **!important 절대 사용 금지**

### 2. 컴포넌트 vs 피처

- ✅ **Components**: 기본 UI 빌딩 블록 (Button, Input, Modal 등)
- ✅ **Features**: 완전한 기능 모듈 (DesktopStockBox, SearchModal 등)
- ✅ 비즈니스 로직은 Custom Hooks로 분리
- ❌ 컴포넌트에 복잡한 로직 직접 작성 금지

### 3. 타입 안정성

- ✅ 모든 함수/컴포넌트 타입 정의
- ✅ any 타입 사용 금지
- ✅ Interface 우선, Type은 필요 시

### 4. 재사용성

- ✅ Hook은 독립적으로 재사용 가능하게
- ✅ 컴포넌트는 작고 단일 책임
- ✅ Utils는 순수 함수로

---

## 🎯 스타일링 가이드

### 반응형 디자인

```tsx
<div
  className={cn(
    // Mobile-first 접근
    "flex flex-col", // 모바일: 세로
    "md:flex-row", // 태블릿 이상: 가로
    "lg:gap-6", // 데스크톱: 간격 증가
    "xl:p-8" // 대형 화면: 패딩 증가
  )}
/>
```

### 다크 모드

```tsx
<div
  className={cn(
    // 라이트 모드
    "bg-white text-gray-900",
    // 다크 모드
    "dark:bg-gray-900 dark:text-white"
  )}
/>
```

### 애니메이션

```tsx
<div
  className={cn(
    "transition-all duration-200", // 기본 트랜지션
    "hover:scale-105", // Hover 확대
    "active:scale-95", // 클릭 축소
    "animate-fade-in" // 페이드인 애니메이션
  )}
/>
```

### Glassmorphism

```tsx
<div
  className={cn(
    "glass", // 기본 glassmorphism
    "rounded-xl p-4",
    "backdrop-blur-lg",
    "border border-white/20"
  )}
/>
```

---

## 💡 Best Practices

### 1. 클래스 순서 (가독성)

```tsx
className={cn(
  // Layout
  "flex flex-col items-center justify-center",
  // Sizing
  "w-full h-screen",
  // Spacing
  "p-4 gap-2",
  // Typography
  "text-xl font-bold",
  // Colors
  "bg-white text-gray-900",
  // Borders
  "border border-gray-200 rounded-lg",
  // Effects
  "shadow-lg backdrop-blur-lg",
  // Transitions
  "transition-all duration-200",
  // Pseudo-classes
  "hover:bg-gray-100",
  // Responsive
  "md:flex-row lg:gap-6",
  // Dark mode
  "dark:bg-gray-900 dark:text-white",
  // Conditional
  focused && "z-50",
  // External
  className
)}
```

### 2. 반복되는 스타일은 변수로

```tsx
const cardStyles = "glass rounded-xl p-4 transition-all hover:shadow-xl";

<div className={cardStyles}>...</div>;
```

### 3. Prettier 자동 정렬 활용

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## 🔍 문제 해결

### Q: 클래스가 적용되지 않아요

**A**: Tailwind JIT가 클래스를 감지하지 못했을 수 있습니다.

```tsx
// ❌ 동적 클래스 생성 (감지 안 됨)
const color = "blue";
<div className={`text-${color}-500`}>

// ✅ 전체 클래스명 사용
<div className={color === "blue" ? "text-blue-500" : "text-red-500"}>
```

### Q: 조건부 스타일이 충돌해요

**A**: `cn()` 함수를 사용하세요.

```tsx
// ❌ 마지막 클래스만 적용됨
<div className={`p-4 ${isLarge ? "p-8" : ""}`}>

// ✅ twMerge가 충돌 해결
<div className={cn("p-4", isLarge && "p-8")}>
```

---

## 📚 관련 문서

- [CLAUDE.md](../../CLAUDE.md) - 전체 프로젝트 가이드
- [import-conventions.md](./import-conventions.md) - Import 규칙
- [tech-stack.md](./tech-stack.md) - 기술 스택
- [getting-started.md](../getting-started.md) - 개발 시작 가이드

---

**작성일**: 2026-02-28
**마지막 업데이트**: 2026-02-28
