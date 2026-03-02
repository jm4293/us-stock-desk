# US Stock Desk - TDD, Storybook, Components/Features 가이드

## 📋 개요

이 문서는 US Stock Desk 프로젝트의 개발 방법론, 컴포넌트 개발 전략, 그리고 다국어 지원에 대한 가이드입니다.

**중요**: 이 프로젝트는 **Atomic Design 패턴 대신 Components/Features 패턴**을 사용합니다.

---

## 🧪 TDD (Test-Driven Development)

### 개발 프로세스

```
1. 테스트 작성 (Red)
   ↓
2. 최소한의 코드로 테스트 통과 (Green)
   ↓
3. 리팩토링 (Refactor)
   ↓
반복
```

### 테스트 도구

- **Vitest**: 빠른 단위 테스트 러너
- **React Testing Library**: React 컴포넌트 테스트
- **@testing-library/user-event**: 사용자 인터랙션 시뮬레이션

### 설치

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### vitest.config.ts

```ts
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### src/test/setup.ts

```ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

### 테스트 예시

#### Component 테스트 (기본 UI)

```tsx
// src/components/button/button.test.tsx (kebab-case 파일명)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

// 같은 디렉터리에서 import

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });

  it("applies variant styles correctly", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toHaveClass("bg-blue-500");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-gray-500");
  });
});
```

#### Feature 테스트 (완전한 기능 모듈)

```tsx
// src/features/price-display/price-display.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceDisplay } from "./price-display";

describe("PriceDisplay", () => {
  it("renders price correctly", () => {
    render(<PriceDisplay price={150.25} change={2.5} changePercent={1.69} />);
    expect(screen.getByText("$150.25")).toBeInTheDocument();
  });

  it("shows up arrow for positive change", () => {
    render(<PriceDisplay price={150} change={2.5} changePercent={1.69} />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it("shows down arrow for negative change", () => {
    render(<PriceDisplay price={150} change={-2.5} changePercent={-1.69} />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it("applies Korean color scheme", () => {
    render(<PriceDisplay price={150} change={2.5} changePercent={1.69} colorScheme="kr" />);
    // 한국식: 빨강 상승
    expect(screen.getByText(/2.5/)).toHaveClass("text-up-kr");
  });
});
```

#### Hook 테스트

```tsx
// src/hooks/use-stock-data.test.ts (kebab-case 파일명)
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStockData } from "./use-stock-data";

describe("useStockData", () => {
  it("initial state is loading", () => {
    const { result } = renderHook(() => useStockData("AAPL"));
    expect(result.current.state.status).toBe("loading");
  });

  it("fetches stock data successfully", async () => {
    const { result } = renderHook(() => useStockData("AAPL"));

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    if (result.current.state.status === "success") {
      expect(result.current.state.data).toBeDefined();
      expect(result.current.state.data.symbol).toBe("AAPL");
    }
  });

  it("handles error state", async () => {
    const { result } = renderHook(() => useStockData("INVALID"));

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });

    if (result.current.state.status === "error") {
      expect(result.current.state.error).toBeDefined();
    }
  });
});
```

### package.json 스크립트

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 📚 Storybook

### 설치

```bash
npx storybook@latest init
```

### 설정

#### .storybook/main.ts

```ts
import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
    };
    return config;
  },
};

export default config;
```

#### .storybook/preview.ts

```ts
import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a1a" },
        { name: "light", value: "#f5f5f5" },
      ],
    },
  },
};

export default preview;
```

### Story 작성 예시

#### Component Story (기본 UI)

```tsx
// src/components/button/button.stories.tsx (kebab-case 파일명)
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button", // Components 카테고리
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading...",
    isLoading: true,
  },
};
```

#### Feature Story (완전한 기능 모듈)

```tsx
// src/features/price-display/price-display.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PriceDisplay } from "./price-display";

const meta: Meta<typeof PriceDisplay> = {
  title: "Features/PriceDisplay", // Features 카테고리
  component: PriceDisplay,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PriceDisplay>;

export const PositiveChange: Story = {
  args: {
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    colorScheme: "kr", // 한국식 (빨강↑)
  },
};

export const NegativeChange: Story = {
  args: {
    price: 147.75,
    change: -2.5,
    changePercent: -1.66,
    colorScheme: "kr", // 한국식 (파랑↓)
  },
};

export const USColorScheme: Story = {
  args: {
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    colorScheme: "us", // 미국식 (초록↑)
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
```

#### Feature Story with Hooks (복잡한 기능)

```tsx
// src/features/desktop-stock-box/desktop-stock-box.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { DesktopStockBox } from "./desktop-stock-box";

const meta: Meta<typeof DesktopStockBox> = {
  title: "Features/DesktopStockBox",
  component: DesktopStockBox,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DesktopStockBox>;

export const Default: Story = {
  args: {
    symbol: "AAPL",
    focused: false,
  },
};

export const Focused: Story = {
  args: {
    symbol: "AAPL",
    focused: true,
  },
};
```

### package.json 스크립트

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## 🧩 Components vs Features 패턴

**이 프로젝트는 Atomic Design 대신 Components/Features 패턴을 사용합니다.**

### 구조

```
src/
├── components/        # 기본 UI 빌딩 블록
│   ├── button/
│   ├── input/
│   ├── modal/
│   └── index.ts      # Barrel export
│
├── features/          # 완전한 기능 모듈
│   ├── desktop-stock-box/
│   ├── price-display/
│   ├── stock-chart/
│   └── index.ts      # Barrel export
│
└── hooks/             # 비즈니스 로직
    ├── use-stock-data.ts
    ├── use-chart-data.ts
    └── index.ts       # Barrel export
```

### 1. Components (기본 UI 빌딩 블록)

재사용 가능한 단순 컴포넌트. 비즈니스 로직 최소화.

**파일 구조:**

```
component-name/
├── component-name.tsx        # 메인 컴포넌트 (kebab-case)
├── component-name.test.tsx   # 테스트
├── component-name.stories.tsx # Storybook
└── index.ts                   # Barrel export
```

**예시:**

```tsx
// src/components/button/button.tsx
import { cn } from "@/utils/cn/cn";

interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" && "bg-gray-500 text-white hover:bg-gray-600",
        variant === "ghost" && "bg-transparent hover:bg-white/10",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-lg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

Button.displayName = "Button";
```

```ts
// src/components/button/index.ts
export * from "./button";
```

```ts
// src/components/index.ts
export * from "./button";
export * from "./input";
export * from "./modal";
// ... 모든 컴포넌트
```

### 2. Features (완전한 기능 모듈)

Hook과 Store를 사용하여 비즈니스 로직을 통합한 완전한 기능 단위.

**파일 구조:**

```
feature-name/
├── feature-name.tsx          # 메인 피처 (kebab-case)
├── feature-name.test.tsx     # 테스트
├── feature-name.stories.tsx  # Storybook
└── index.ts                   # Barrel export
```

**예시:**

```tsx
// src/features/price-display/price-display.tsx
import { useSettingsStore } from "@/stores";
import { cn } from "@/utils/cn/cn";

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  loading?: boolean;
}

export const PriceDisplay = ({ price, change, changePercent, loading }: PriceDisplayProps) => {
  // Store에서 color scheme 가져오기
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const isUp = change > 0;
  const isDown = change < 0;

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
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

### 3. Features with Hooks (복잡한 기능)

Hook을 사용하여 비즈니스 로직을 분리한 Feature.

```tsx
// src/features/desktop-stock-box/desktop-stock-box.tsx
import { Button } from "@/components";
import { PriceDisplay } from "@/features";
import { useStockData } from "@/hooks";
import { Rnd } from "react-rnd";
import { cn } from "@/utils/cn/cn";

interface DesktopStockBoxProps {
  symbol: string;
  focused?: boolean;
  onFocus?: () => void;
  onDelete?: () => void;
}

export const DesktopStockBox = ({ symbol, focused, onFocus, onDelete }: DesktopStockBoxProps) => {
  // Hook에서 비즈니스 로직 가져오기
  const { state } = useStockData(symbol);

  if (state.status === "loading") {
    return <div className="glass rounded-xl p-4">Loading...</div>;
  }

  if (state.status === "error") {
    return <div className="glass rounded-xl p-4 text-red-500">Error: {state.error}</div>;
  }

  return (
    <Rnd
      className={cn(
        "glass rounded-xl p-4",
        focused && "z-50 shadow-2xl",
        !focused && "opacity-70 blur-sm"
      )}
      onClick={onFocus}
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-xl font-bold">{symbol}</h3>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          ×
        </Button>
      </div>

      <PriceDisplay
        price={data.price}
        change={data.change}
        changePercent={data.changePercent}
        colorScheme="kr"
      />
    </Rnd>
  );
};
```

### 4. Templates (템플릿)

페이지의 레이아웃 구조.

```tsx
// src/components/templates/MainLayout/MainLayout.tsx
import { ReactNode } from "react";
import { Header } from "@/components/organisms/Header";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Header />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
};
```

### 5. Pages (페이지)

완성된 페이지.

```tsx
// src/components/pages/MainPage/MainPage.tsx
import { StockBox } from "@/components/organisms/StockBox";
import { MainLayout } from "@/components/templates/MainLayout";
import { useStocks } from "@/hooks/useStocks";

export const MainPage = () => {
  const { stocks, addStock, removeStock, focusedStock, setFocusedStock } = useStocks();

  return (
    <MainLayout>
      {stocks.map((stock) => (
        <StockBox
          key={stock.id}
          symbol={stock.symbol}
          focused={focusedStock === stock.id}
          onFocus={() => setFocusedStock(stock.id)}
          onDelete={() => removeStock(stock.id)}
        />
      ))}
    </MainLayout>
  );
};
```

---

## 🌍 i18n (다국어 지원)

### 설치

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### 설정

#### src/i18n/config.ts

```ts
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 번역 파일

#### src/i18n/locales/ko.json

```json
{
  "common": {
    "add": "추가",
    "delete": "삭제",
    "cancel": "취소",
    "confirm": "확인",
    "search": "검색",
    "settings": "설정"
  },
  "header": {
    "exchangeRate": "환율",
    "marketTime": "시장 시간",
    "koreaTime": "한국 시간"
  },
  "stockBox": {
    "price": "현재가",
    "change": "변동",
    "volume": "거래량",
    "chart": "차트"
  },
  "settings": {
    "title": "설정",
    "colorScheme": "색상 설정",
    "korean": "한국식 (빨강↑/파랑↓)",
    "american": "미국식 (초록↑/빨강↓)",
    "language": "언어",
    "updateInterval": "업데이트 주기"
  },
  "search": {
    "placeholder": "종목 검색...",
    "noResults": "검색 결과가 없습니다"
  },
  "errors": {
    "networkError": "네트워크 오류가 발생했습니다",
    "apiError": "API 오류가 발생했습니다",
    "retry": "다시 시도"
  }
}
```

#### src/i18n/locales/en.json

```json
{
  "common": {
    "add": "Add",
    "delete": "Delete",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "search": "Search",
    "settings": "Settings"
  },
  "header": {
    "exchangeRate": "Exchange Rate",
    "marketTime": "Market Time",
    "koreaTime": "Korea Time"
  },
  "stockBox": {
    "price": "Price",
    "change": "Change",
    "volume": "Volume",
    "chart": "Chart"
  },
  "settings": {
    "title": "Settings",
    "colorScheme": "Color Scheme",
    "korean": "Korean (Red↑/Blue↓)",
    "american": "American (Green↑/Red↓)",
    "language": "Language",
    "updateInterval": "Update Interval"
  },
  "search": {
    "placeholder": "Search stocks...",
    "noResults": "No results found"
  },
  "errors": {
    "networkError": "Network error occurred",
    "apiError": "API error occurred",
    "retry": "Retry"
  }
}
```

### 사용 예시

```tsx
// src/components/organisms/Header/Header.tsx
import { useTranslation } from "react-i18next";
import { Button } from "@/components/atoms/Button";

export const Header = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="glass p-4">
      <div className="flex items-center justify-between">
        <h1>{t("header.exchangeRate")}</h1>
        <Button onClick={toggleLanguage}>{i18n.language === "ko" ? "EN" : "KO"}</Button>
      </div>
    </header>
  );
};
```

### main.tsx에 적용

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/config";
import "./styles/globals.css";

// i18n 설정 import

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 📋 개발 워크플로우

### 1. 새로운 컴포넌트 개발

```bash
# 1. 테스트 작성
# src/components/atoms/Badge/Badge.test.tsx

# 2. Storybook Story 작성
# src/components/atoms/Badge/Badge.stories.tsx

# 3. 컴포넌트 구현
# src/components/atoms/Badge/Badge.tsx

# 4. 테스트 실행
npm run test

# 5. Storybook 확인
npm run storybook
```

### 2. 컴포넌트 파일 구조

```
Badge/
├── Badge.tsx           # 컴포넌트 구현
├── Badge.stories.tsx   # Storybook Story
├── Badge.test.tsx      # 테스트
├── Badge.module.css    # 스타일 (필요시)
└── index.ts            # export
```

---

## 📦 package.json 의존성

```json
{
  "dependencies": {
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.0",
    "i18next-browser-languagedetector": "^7.2.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0",
    "@storybook/react": "^7.6.0",
    "@storybook/react-vite": "^7.6.0",
    "@storybook/addon-essentials": "^7.6.0",
    "@storybook/addon-interactions": "^7.6.0",
    "@storybook/addon-a11y": "^7.6.0"
  }
}
```

---

**작성일**: 2026-02-15
