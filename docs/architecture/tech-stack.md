# Stock Desk - 고급 기술 스택 가이드

## 📋 개요

이 문서는 Stock Desk 프로젝트의 고급 기술 스택 및 패턴에 대한 가이드입니다.

---

## 🗃 전역 상태 관리: Zustand

### 설치

```bash
npm install zustand
npm install -D @types/zustand
```

### 기본 사용법

#### Store 생성

```ts
// src/store/useStockStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Stock {
  id: string;
  symbol: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface StockStore {
  stocks: Stock[];
  focusedStockId: string | null;

  // Actions
  addStock: (stock: Stock) => void;
  removeStock: (id: string) => void;
  updateStockPosition: (id: string, position: { x: number; y: number }) => void;
  setFocusedStock: (id: string | null) => void;
}

export const useStockStore = create<StockStore>()(
  devtools(
    persist(
      immer((set) => ({
        stocks: [],
        focusedStockId: null,

        addStock: (stock) =>
          set((state) => {
            state.stocks.push(stock);
          }),

        removeStock: (id) =>
          set((state) => {
            state.stocks = state.stocks.filter((s) => s.id !== id);
          }),

        updateStockPosition: (id, position) =>
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              stock.position = position;
            }
          }),

        setFocusedStock: (id) => set({ focusedStockId: id }),
      })),
      {
        name: "stock-storage",
        partialize: (state) => ({ stocks: state.stocks }),
      }
    ),
    { name: "StockStore" }
  )
);
```

#### Settings Store

```ts
// src/store/useSettingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  colorScheme: "kr" | "us";
  theme: "light" | "dark";
  language: "ko" | "en";
  updateInterval: number;

  setColorScheme: (scheme: "kr" | "us") => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: "ko" | "en") => void;
  setUpdateInterval: (interval: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      colorScheme: "kr",
      theme: "dark",
      language: "ko",
      updateInterval: 10,

      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
      setUpdateInterval: (interval) => set({ updateInterval: interval }),
    }),
    { name: "settings-storage" }
  )
);
```

#### 컴포넌트에서 사용

```tsx
// src/components/organisms/StockBox/StockBox.tsx
import { useStockStore } from "@/store/useStockStore";

export const StockBox = ({ id }: { id: string }) => {
  const stock = useStockStore((state) => state.stocks.find((s) => s.id === id));
  const updatePosition = useStockStore((state) => state.updateStockPosition);
  const removeStock = useStockStore((state) => state.removeStock);

  // ...
};
```

### Zustand 미들웨어

- **persist**: LocalStorage 자동 동기화
- **devtools**: Redux DevTools 연동
- **immer**: 불변성 관리 간소화

---

## 📝 폼 관리: react-hook-form + zod

### 설치

```bash
npm install react-hook-form zod @hookform/resolvers
```

### 사용 예시

#### 검색 모달

```tsx
// src/components/organisms/SearchModal/SearchModal.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchSchema = z.object({
  symbol: z.string().min(1, "종목 심볼을 입력하세요").max(10),
});

type SearchFormData = z.infer<typeof searchSchema>;

export const SearchModal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (data: SearchFormData) => {
    // 종목 검색 로직
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("symbol")} placeholder="AAPL, TSLA..." aria-label="종목 심볼 입력" />
      {errors.symbol && <span role="alert">{errors.symbol.message}</span>}
      <button type="submit">검색</button>
    </form>
  );
};
```

#### 설정 모달

```tsx
// src/components/organisms/SettingsModal/SettingsModal.tsx
import { useSettingsStore } from "@/store/useSettingsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const settingsSchema = z.object({
  colorScheme: z.enum(["kr", "us"]),
  updateInterval: z.number().min(5).max(60),
  language: z.enum(["ko", "en"]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const SettingsModal = () => {
  const settings = useSettingsStore();

  const { register, handleSubmit } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      colorScheme: settings.colorScheme,
      updateInterval: settings.updateInterval,
      language: settings.language,
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    settings.setColorScheme(data.colorScheme);
    settings.setUpdateInterval(data.updateInterval);
    settings.setLanguage(data.language);
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* 폼 필드 */}</form>;
};
```

---

## 🎬 애니메이션: GSAP

### 설치

```bash
npm install gsap
npm install -D @types/gsap
```

### 사용 예시

#### 박스 추가 애니메이션

```tsx
// src/components/organisms/StockBox/StockBox.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const StockBox = () => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      gsap.from(boxRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }
  }, []);

  return <div ref={boxRef}>{/* 내용 */}</div>;
};
```

#### 가격 변동 애니메이션

```tsx
// src/components/molecules/PriceDisplay/PriceDisplay.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const PriceDisplay = ({ price, change }: { price: number; change: number }) => {
  const priceRef = useRef<HTMLDivElement>(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (priceRef.current && prevPrice.current !== price) {
      const isUp = price > prevPrice.current;

      gsap.fromTo(
        priceRef.current,
        { backgroundColor: isUp ? "#ff000033" : "#0000ff33" },
        { backgroundColor: "transparent", duration: 1 }
      );

      prevPrice.current = price;
    }
  }, [price]);

  return (
    <div ref={priceRef} className="transition-colors">
      ${price.toFixed(2)}
    </div>
  );
};
```

#### 랜딩 페이지 애니메이션

```tsx
// src/components/pages/LandingPage/LandingPage.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const LandingPage = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    }).to(progressRef.current, {
      width: "100%",
      duration: 2,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <div>
      <h1 ref={titleRef}>Stock Desk</h1>
      <div className="h-2 w-full rounded-full bg-gray-700">
        <div ref={progressRef} className="h-2 w-0 rounded-full bg-blue-500" />
      </div>
    </div>
  );
};
```

---

## 🚨 Suspense + Error Boundary

### Error Boundary 구현

```tsx
// src/components/common/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Sentry로 에러 전송
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">오류가 발생했습니다</h2>
              <p className="mb-4 text-gray-400">{this.state.error?.message}</p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-primary"
              >
                다시 시도
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### Suspense 사용

```tsx
// src/App.tsx
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <MainPage />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 데이터 fetching with Suspense

```tsx
// src/hooks/useStockDataSuspense.ts
import { use } from "react";

let cache = new Map();

export const useStockDataSuspense = (symbol: string) => {
  if (!cache.has(symbol)) {
    cache.set(symbol, fetchStockData(symbol));
  }

  return use(cache.get(symbol));
};

async function fetchStockData(symbol: string) {
  const response = await fetch(`/api/stock-proxy?symbol=${symbol}`);
  if (!response.ok) throw new Error("Failed to fetch stock data");
  return response.json();
}
```

---

## 🌐 React Portal (모달, 토스트)

### Portal 컨테이너 설정

```html
<!-- index.html -->
<body>
  <div id="root"></div>
  <div id="modal-root"></div>
  <div id="toast-root"></div>
</body>
```

### Portal 컴포넌트

```tsx
// src/components/common/Portal.tsx
import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

export const Portal = ({ children, containerId = "modal-root" }: PortalProps) => {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Portal container #${containerId} not found`);
    return null;
  }

  return createPortal(children, container);
};
```

### 모달 구현

```tsx
// src/components/organisms/Modal/Modal.tsx
import { ReactNode, useEffect } from "react";
import { Portal } from "@/components/common/Portal";
import { cn } from "@/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div className={cn("glass relative mx-4 w-full max-w-lg rounded-xl p-6")}>
          {title && (
            <h2 id="modal-title" className="mb-4 text-2xl font-bold">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </Portal>
  );
};
```

### 토스트 구현

```tsx
// src/components/common/Toast/Toast.tsx
import { useEffect } from "react";
import { Portal } from "@/components/common/Portal";
import { cn } from "@/utils/cn";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type = "info", duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <Portal containerId="toast-root">
      <div
        className={cn(
          "glass fixed bottom-4 right-4 rounded-lg p-4 shadow-lg",
          "animate-slide-up",
          type === "success" && "border-l-4 border-green-500",
          type === "error" && "border-l-4 border-red-500",
          type === "info" && "border-l-4 border-blue-500"
        )}
        role="alert"
        aria-live="polite"
      >
        {message}
      </div>
    </Portal>
  );
};
```

---

## ♿ 웹 접근성 (a11y)

### 필수 구현 사항

#### 1. 시맨틱 HTML

```tsx
// ✅ 좋은 예
<header>
  <nav aria-label="메인 네비게이션">
    <ul>
      <li><a href="#home">홈</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>주식 대시보드</h1>
  </article>
</main>

// ❌ 나쁜 예
<div className="header">
  <div className="nav">
    <div className="link">홈</div>
  </div>
</div>
```

#### 2. ARIA 속성

```tsx
// src/components/atoms/Button/Button.tsx
export const Button = ({ children, onClick, disabled, ariaLabel }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} aria-disabled={disabled}>
      {children}
    </button>
  );
};
```

#### 3. 키보드 네비게이션

```tsx
// src/components/organisms/StockBox/StockBox.tsx
export const StockBox = ({ id }: { id: string }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      // 박스 포커스
    }
    if (e.key === "Delete") {
      // 박스 삭제
    }
  };

  return (
    <div tabIndex={0} role="region" aria-label={`${symbol} 주식 정보`} onKeyDown={handleKeyDown}>
      {/* 내용 */}
    </div>
  );
};
```

#### 4. 포커스 관리

```tsx
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from "react";

export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTab);
    };
  }, [isActive]);

  return containerRef;
};
```

#### 5. 스크린 리더 지원

```tsx
// src/components/molecules/PriceDisplay/PriceDisplay.tsx
export const PriceDisplay = ({ price, change, changePercent }: PriceDisplayProps) => {
  const isUp = change > 0;

  return (
    <div>
      <span className="sr-only">
        현재가 {price}달러,
        {isUp ? "상승" : "하락"} {Math.abs(change)}달러,
        {Math.abs(changePercent)}퍼센트
      </span>
      <div aria-hidden="true">
        ${price.toFixed(2)}
        <span className={isUp ? "text-up-kr" : "text-down-kr"}>
          {isUp ? "+" : ""}
          {change.toFixed(2)} ({changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};
```

#### 6. 색상 대비

```css
/* Tailwind config에서 WCAG AA 기준 준수 */
/* 최소 대비율 4.5:1 */
```

#### 7. 라이브 리전

```tsx
// src/components/organisms/StockBox/StockBox.tsx
export const StockBox = ({ symbol }: { symbol: string }) => {
  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {symbol} 주식 가격이 업데이트되었습니다
      </div>
      {/* 내용 */}
    </div>
  );
};
```

---

## 📦 package.json 의존성

```json
{
  "dependencies": {
    "zustand": "^4.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "gsap": "^3.12.0"
  },
  "devDependencies": {
    "@types/gsap": "^3.0.0"
  }
}
```

---

## 🎯 개발 원칙

### 1. 상태 관리

- ✅ 전역 상태는 Zustand
- ✅ 로컬 상태는 useState
- ❌ Context API 사용 금지 (성능 이슈)

### 2. 폼 관리

- ✅ react-hook-form + zod
- ✅ 타입 안전성 보장
- ✅ 유효성 검사 자동화

### 3. 애니메이션

- ✅ 간단한 애니메이션: Tailwind
- ✅ 복잡한 애니메이션: GSAP
- ✅ 성능 고려 (transform, opacity 우선)

### 4. 에러 처리

- ✅ Error Boundary로 전역 에러 처리
- ✅ Suspense로 로딩 상태 관리
- ✅ 사용자 친화적 에러 메시지

### 5. 접근성

- ✅ 시맨틱 HTML 사용
- ✅ ARIA 속성 추가
- ✅ 키보드 네비게이션 지원
- ✅ 스크린 리더 지원
- ✅ 색상 대비 준수

---

**작성일**: 2026-02-15
