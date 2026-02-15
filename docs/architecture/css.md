# Stock Desk - CSS 전략 및 아키텍처 가이드

## 🎨 CSS 전략: Tailwind CSS + CSS Modules

### 핵심 원칙

- ✅ **Tailwind 우선 사용** (90% 스타일링)
- ✅ **CSS Modules는 복잡한 스타일만** (gradient, pseudo-elements 등)
- ✅ **tailwind-merge + clsx로 클래스 병합**
- ❌ **!important 절대 사용 금지**

---

## 📦 필수 패키지

```json
{
  "dependencies": {
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## ⚙️ Tailwind 설정

### tailwind.config.js

```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 한국식
        "up-kr": "#ff0000",
        "down-kr": "#0000ff",
        // 미국식
        "up-us": "#00ff00",
        "down-us": "#ff0000",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
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

### src/utils/cn.ts

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스를 병합하는 유틸리티 함수
 * clsx로 조건부 클래스 처리 → twMerge로 충돌 해결
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 🎨 글로벌 스타일

### src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Variables for theme */
:root {
  --color-scheme: "kr"; /* 'kr' | 'us' */
}

[data-theme="dark"] {
  /* 다크 모드 변수 */
}

/* Custom Utilities */
@layer utilities {
  .glass {
    @apply border border-white/20 bg-white/10 backdrop-blur-lg;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .glass-strong {
    @apply border border-white/30 bg-white/20 backdrop-blur-xl;
  }
}

/* Custom Components */
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
}

[data-theme="dark"] {
  /* Dark Mode */
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
}
```

---

## 💻 사용 예시

### 패턴 A: Tailwind만 사용

```tsx
import { cn } from "@/utils/cn";

export const StockBox = ({ focused, className }) => {
  return (
    <div
      className={cn(
        // 기본 스타일
        "glass rounded-xl p-4",
        "transition-all duration-200",
        // 조건부 스타일
        focused && "z-50 shadow-2xl",
        !focused && "opacity-70 blur-sm",
        // hover 효과
        "hover:-translate-y-1 hover:shadow-xl",
        // 외부 클래스
        className
      )}
    >
      {/* 내용 */}
    </div>
  );
};
```

### 패턴 B: CSS Modules 혼합 (복잡한 스타일)

```tsx
import { cn } from "@/utils/cn";
import styles from "./Header.module.css";

export const Header = () => {
  return (
    <header
      className={cn(
        // Tailwind 유틸리티
        "fixed left-0 right-0 top-0 z-50",
        "border-b border-white/20 bg-white/10 backdrop-blur-lg",
        // CSS Module 클래스 (복잡한 gradient)
        styles.complexGradient
      )}
    >
      {/* 내용 */}
    </header>
  );
};
```

```css
/* Header.module.css */
.complexGradient {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.complexGradient::before {
  content: "";
  position: absolute;
  /* 복잡한 pseudo-element 스타일 */
}
```

### 패턴 C: 동적 스타일 (clsx 활용)

```tsx
import { cn } from "@/utils/cn";

interface PriceDisplayProps {
  price: number;
  change: number;
  colorScheme: "kr" | "us";
}

export const PriceDisplay = ({ price, change, colorScheme }: PriceDisplayProps) => {
  const isUp = change > 0;

  return (
    <div
      className={cn(
        "text-2xl font-bold transition-colors",
        // 한국식
        colorScheme === "kr" && {
          "text-up-kr": isUp,
          "text-down-kr": !isUp,
        },
        // 미국식
        colorScheme === "us" && {
          "text-up-us": isUp,
          "text-down-us": !isUp,
        }
      )}
    >
      ${price.toFixed(2)}
    </div>
  );
};
```

---

## 🏗 아키텍처: Custom Hooks Pattern

### 책임 분리 원칙

| 레이어         | 책임          | 예시                              |
| -------------- | ------------- | --------------------------------- |
| **Components** | UI 렌더링만   | JSX, 스타일, 이벤트 핸들러 연결   |
| **Hooks**      | 비즈니스 로직 | 상태 관리, 데이터 fetching, 계산  |
| **Services**   | 외부 통신     | API 호출, WebSocket, LocalStorage |
| **Utils**      | 순수 함수     | 포맷팅, 변환, 유효성 검사         |

---

## 📝 코드 예시

### ❌ 나쁜 예 (모든 로직이 컴포넌트에)

```tsx
export const StockBox = ({ symbol }) => {
  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 100줄의 비즈니스 로직...
  useEffect(() => {
    /* WebSocket */
  }, []);
  useEffect(() => {
    /* LocalStorage */
  }, []);

  return <div>{/* UI */}</div>;
};
```

### ✅ 좋은 예 (로직 분리)

#### 1. Custom Hook (비즈니스 로직)

```tsx
// hooks/useStockBox.ts
import { useStockData } from "./useStockData";
import { useDragAndResize } from "./useDragAndResize";
import { useStockWebSocket } from "./useStockWebSocket";

export const useStockBox = (symbol: string) => {
  const { data, loading, error } = useStockData(symbol);
  const { realtimeData } = useStockWebSocket(symbol);
  const { position, size, handleDragStop, handleResizeStop } = useDragAndResize(symbol);

  return {
    data: realtimeData || data,
    loading,
    error,
    position,
    size,
    handleDragStop,
    handleResizeStop,
  };
};
```

#### 2. Component (UI만)

```tsx
// components/StockBox/StockBox.tsx
import { Rnd } from "react-rnd";
import { useStockBox } from "@/hooks/useStockBox";
import { cn } from "@/utils/cn";

interface StockBoxProps {
  symbol: string;
  focused?: boolean;
  onFocus?: () => void;
}

export const StockBox = ({ symbol, focused, onFocus }: StockBoxProps) => {
  // 비즈니스 로직은 Hook에서
  const { data, loading, position, size, handleDragStop, handleResizeStop } = useStockBox(symbol);

  // UI 렌더링만
  if (loading) return <div>Loading...</div>;

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      className={cn("glass rounded-xl p-4", focused && "z-50", !focused && "blur-sm")}
      onClick={onFocus}
    >
      <div className="flex h-full flex-col">
        <h3 className="text-xl font-bold">{symbol}</h3>
        <p className="text-2xl">${data.price}</p>
      </div>
    </Rnd>
  );
};
```

---

## 📋 개발 원칙

### 1. CSS 우선순위

- ✅ Tailwind 우선 사용 (90%)
- ✅ 복잡한 스타일만 CSS Modules
- ✅ cn() 함수로 클래스 병합
- ❌ !important 절대 사용 금지

### 2. 비즈니스 로직 분리

- ✅ 컴포넌트는 UI만 (JSX, 스타일)
- ✅ 로직은 Custom Hooks로 분리
- ❌ 컴포넌트에 복잡한 로직 금지

### 3. 타입 안정성

- ✅ 모든 함수/컴포넌트 타입 정의
- ✅ any 타입 사용 금지
- ✅ Interface 우선, Type은 필요 시

### 4. 재사용성

- ✅ Hook은 독립적으로 재사용 가능하게
- ✅ 컴포넌트는 작고 단일 책임
- ✅ Utils는 순수 함수로

---

## 🎯 언제 무엇을 사용할까?

| 상황                             | 사용 방법                |
| -------------------------------- | ------------------------ |
| 간단한 스타일                    | Tailwind 클래스만        |
| 조건부 스타일                    | `cn()` + clsx            |
| 복잡한 gradient, pseudo-elements | CSS Modules              |
| 애니메이션 (간단)                | Tailwind config          |
| 애니메이션 (복잡)                | CSS Modules + @keyframes |
| 테마 변수                        | CSS Variables + Tailwind |

---

**작성일**: 2026-02-15
