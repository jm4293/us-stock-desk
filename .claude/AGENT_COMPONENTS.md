# 🎨 Agent 5: Components (UI 개발자)

> Atomic Design Pattern으로 React 컴포넌트 개발

## 🎯 역할

React 컴포넌트를 Atomic Design 패턴으로 개발합니다.

- Atoms (기본 컴포넌트)
- Molecules (조합 컴포넌트)
- Organisms (복잡한 컴포넌트)
- Templates (레이아웃)
- Pages (페이지)
- Custom Hooks (비즈니스 로직)

## 📋 작업 범위

### ✅ 작업 대상

- `src/components/` - 모든 UI 컴포넌트
  - `atoms/` - Button, Input, Icon 등
  - `molecules/` - SearchInput, PriceDisplay 등
  - `organisms/` - Header, StockBox 등
  - `templates/` - MainLayout 등
  - `pages/` - MainPage, LandingPage 등
- `src/hooks/` - Custom Hooks (비즈니스 로직)

### ❌ 작업 제외

- 스타일 정의 (Styles 에이전트가 이미 완료)
- 상태 관리 (State 에이전트가 이미 완료)
- API 호출 (Services 에이전트가 이미 완료)

## 📚 필수 읽기 문서

1. **TDD_STORYBOOK_I18N.md** - Atomic Design, TDD, Storybook (필독!)
2. **CSS_ARCHITECTURE.md** - 스타일 사용법
3. **ADVANCED_TECH_STACK.md** - react-hook-form, GSAP 등

## 🏗 Atomic Design 구조

```
Atoms (원자)
  ↓ 조합
Molecules (분자)
  ↓ 조합
Organisms (유기체)
  ↓ 배치
Templates (템플릿)
  ↓ 데이터 주입
Pages (페이지)
```

## 🔧 작업 순서

### 1단계: Atoms (기본 컴포넌트)

#### 1.1 Button

```tsx
// src/components/atoms/Button/Button.tsx
import React from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", isLoading, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          variant === "ghost" && "btn-ghost",
          size === "sm" && "px-3 py-1 text-sm",
          size === "md" && "px-4 py-2",
          size === "lg" && "px-6 py-3 text-lg",
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
  }
);

Button.displayName = "Button";
```

#### 1.2 Input

```tsx
// src/components/atoms/Input/Input.tsx
import React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("input", error && "border-red-500 focus:ring-red-500", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```

#### 1.3 Icon

```tsx
// src/components/atoms/Icon/Icon.tsx
import React from "react";
import { cn } from "@/utils/cn";

type IconName = "search" | "settings" | "close" | "add" | "remove" | "drag";

interface IconProps {
  name: IconName;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const icons: Record<IconName, string> = {
  search: "🔍",
  settings: "⚙️",
  close: "✕",
  add: "+",
  remove: "✕",
  drag: "⋮",
};

export const Icon: React.FC<IconProps> = ({ name, size = "md", className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl",
        className
      )}
      role="img"
      aria-label={name}
    >
      {icons[name]}
    </span>
  );
};
```

### 2단계: Molecules (조합 컴포넌트)

#### 2.1 SearchInput

```tsx
// src/components/molecules/SearchInput/SearchInput.tsx
import React, { useState } from "react";
import { Input } from "@/components/atoms/Input/Input";
import { Icon } from "@/components/atoms/Icon/Icon";
import { cn } from "@/utils/cn";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Search...",
  className,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        aria-label="Search"
      >
        <Icon name="search" />
      </button>
    </form>
  );
};
```

#### 2.2 PriceDisplay

```tsx
// src/components/molecules/PriceDisplay/PriceDisplay.tsx
import React from "react";
import { useColorScheme } from "@/stores/settingsStore";
import { cn } from "@/utils/cn";

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  change,
  changePercent,
  className,
}) => {
  const colorScheme = useColorScheme();
  const isPositive = change >= 0;

  const colorClass = isPositive
    ? colorScheme === "kr"
      ? "price-up-kr"
      : "price-up-us"
    : colorScheme === "kr"
      ? "price-down-kr"
      : "price-down-us";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="text-2xl font-bold">${price.toFixed(2)}</div>
      <div className={cn("text-sm font-medium", colorClass)}>
        {isPositive ? "+" : ""}
        {change.toFixed(2)} ({isPositive ? "+" : ""}
        {changePercent.toFixed(2)}%)
      </div>
    </div>
  );
};
```

### 3단계: Organisms (복잡한 컴포넌트)

#### 3.1 Header

```tsx
// src/components/organisms/Header/Header.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/Button/Button";
import { Icon } from "@/components/atoms/Icon/Icon";
import { useSettingsActions, useTheme } from "@/stores/settingsStore";
import { useUiActions } from "@/stores/uiStore";
import { cn } from "@/utils/cn";

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { setTheme, setLanguage } = useSettingsActions();
  const { openModal } = useUiActions();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="glass fixed left-0 right-0 top-0 z-50 px-6 py-4">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
        <h1 className="text-gradient text-2xl font-bold">Stock Desk</h1>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal("search")}
            aria-label={t("header.addStock")}
          >
            <Icon name="add" />
            {t("header.addStock")}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={t("header.toggleTheme")}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            aria-label={t("header.toggleLanguage")}
          >
            {i18n.language === "ko" ? "EN" : "KO"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal("settings")}
            aria-label={t("header.settings")}
          >
            <Icon name="settings" />
          </Button>
        </div>
      </div>
    </header>
  );
};
```

#### 3.2 StockBox

```tsx
// src/components/organisms/StockBox/StockBox.tsx
import React from "react";
import { Rnd } from "react-rnd";
import { PriceDisplay } from "@/components/molecules/PriceDisplay/PriceDisplay";
import { Button } from "@/components/atoms/Button/Button";
import { Icon } from "@/components/atoms/Icon/Icon";
import { useStockBox } from "@/hooks/useStockBox";
import { cn } from "@/utils/cn";
import type { StockBox as StockBoxType } from "@/types/stock";

interface StockBoxProps {
  stock: StockBoxType;
  focused: boolean;
}

export const StockBox: React.FC<StockBoxProps> = ({ stock, focused }) => {
  const { data, loading, error, handleDragStop, handleResizeStop, handleFocus, handleRemove } =
    useStockBox(stock);

  if (error) {
    return (
      <div className="glass rounded-xl p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <Rnd
      position={stock.position}
      size={stock.size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={handleFocus}
      minWidth={300}
      minHeight={200}
      maxWidth={800}
      maxHeight={600}
      bounds="parent"
      className={cn(
        "glass rounded-xl transition-all duration-200",
        focused ? "focused shadow-2xl" : "blur-unfocused"
      )}
      style={{ zIndex: stock.zIndex }}
    >
      <div className="flex h-full flex-col p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{stock.symbol}</h3>
            <p className="text-sm text-gray-500">{stock.companyName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove} aria-label="Remove stock">
            <Icon name="close" />
          </Button>
        </div>

        {/* Price */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : data ? (
          <>
            <PriceDisplay
              price={data.current}
              change={data.change}
              changePercent={data.changePercent}
              className="mb-4"
            />

            {/* Chart */}
            <div className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              <p className="py-4 text-center text-gray-500">Chart placeholder</p>
            </div>
          </>
        ) : null}
      </div>
    </Rnd>
  );
};
```

### 4단계: Custom Hooks (비즈니스 로직)

#### 4.1 useStockBox

```tsx
// src/hooks/useStockBox.ts
import { useState, useEffect, useCallback } from "react";
import { useStockActions } from "@/stores/stockStore";
import { finnhubApi } from "@/services/api/finnhub";
import { stockSocket } from "@/services/websocket/stockSocket";
import type { StockBox, StockPrice } from "@/types/stock";
import type { DraggableData } from "react-rnd";

export const useStockBox = (stock: StockBox) => {
  const [data, setData] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { updatePosition, updateSize, removeStock, bringToFront, setFocused } = useStockActions();

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const quote = await finnhubApi.getQuote(stock.symbol);
        setData({
          symbol: stock.symbol,
          current: quote.c,
          open: quote.o,
          high: quote.h,
          low: quote.l,
          close: quote.pc,
          change: quote.c - quote.pc,
          changePercent: ((quote.c - quote.pc) / quote.pc) * 100,
          volume: 0,
          timestamp: quote.t,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [stock.symbol]);

  // WebSocket 실시간 업데이트
  useEffect(() => {
    const unsubscribe = stockSocket.subscribe(stock.symbol, (trade) => {
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          current: trade.p,
          change: trade.p - prev.close,
          changePercent: ((trade.p - prev.close) / prev.close) * 100,
          timestamp: trade.t,
        };
      });
    });

    return unsubscribe;
  }, [stock.symbol]);

  const handleDragStop = useCallback(
    (_e: any, data: DraggableData) => {
      updatePosition(stock.id, { x: data.x, y: data.y });
    },
    [stock.id, updatePosition]
  );

  const handleResizeStop = useCallback(
    (_e: any, _direction: any, ref: HTMLElement) => {
      updateSize(stock.id, {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      });
    },
    [stock.id, updateSize]
  );

  const handleFocus = useCallback(() => {
    bringToFront(stock.id);
    setFocused(stock.id);
  }, [stock.id, bringToFront, setFocused]);

  const handleRemove = useCallback(() => {
    removeStock(stock.id);
  }, [stock.id, removeStock]);

  return {
    data,
    loading,
    error,
    handleDragStop,
    handleResizeStop,
    handleFocus,
    handleRemove,
  };
};
```

### 5단계: Templates & Pages

#### 5.1 MainLayout

```tsx
// src/components/templates/MainLayout/MainLayout.tsx
import React from "react";
import { Header } from "@/components/organisms/Header/Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="h-full w-full">
      <Header />
      <main className="h-full w-full pt-20">{children}</main>
    </div>
  );
};
```

#### 5.2 MainPage

```tsx
// src/components/pages/MainPage/MainPage.tsx
import React from "react";
import { MainLayout } from "@/components/templates/MainLayout/MainLayout";
import { StockBox } from "@/components/organisms/StockBox/StockBox";
import { useStocks, useFocusedStockId } from "@/stores/stockStore";

export const MainPage: React.FC = () => {
  const stocks = useStocks();
  const focusedStockId = useFocusedStockId();

  return (
    <MainLayout>
      <div className="relative h-full w-full">
        {stocks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No stocks added yet</p>
          </div>
        ) : (
          stocks.map((stock) => (
            <StockBox key={stock.id} stock={stock} focused={stock.id === focusedStockId} />
          ))
        )}
      </div>
    </MainLayout>
  );
};
```

## ✅ 완료 체크리스트

### Atoms

- [ ] Button 컴포넌트
- [ ] Input 컴포넌트
- [ ] Icon 컴포넌트

### Molecules

- [ ] SearchInput 컴포넌트
- [ ] PriceDisplay 컴포넌트

### Organisms

- [ ] Header 컴포넌트
- [ ] StockBox 컴포넌트
- [ ] SearchModal 컴포넌트
- [ ] SettingsModal 컴포넌트

### Templates

- [ ] MainLayout 컴포넌트

### Pages

- [ ] MainPage 컴포넌트
- [ ] LandingPage 컴포넌트

### Hooks

- [ ] useStockBox 훅
- [ ] useStockData 훅
- [ ] useExchangeRate 훅

### App 통합

- [ ] App.tsx 업데이트
- [ ] i18n 설정
- [ ] Router 설정 (필요시)

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
