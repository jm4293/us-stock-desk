# Stock Desk - TDD, Storybook, Atomic Design 가이드

## 📋 개요

이 문서는 Stock Desk 프로젝트의 개발 방법론, 컴포넌트 개발 전략, 그리고 다국어 지원에 대한 가이드입니다.

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
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

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

#### Atom 컴포넌트 테스트

```tsx
// src/components/atoms/Button/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

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
});
```

#### Hook 테스트

```tsx
// src/hooks/useStockData.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStockData } from "./useStockData";

describe("useStockData", () => {
  it("fetches stock data successfully", async () => {
    const { result } = renderHook(() => useStockData("AAPL"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
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

#### Atom 컴포넌트 Story

```tsx
// src/components/atoms/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
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
```

#### Organism 컴포넌트 Story

```tsx
// src/components/organisms/Header/Header.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./Header";

const meta: Meta<typeof Header> = {
  title: "Organisms/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: "dark" },
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

## ⚛️ Atomic Design Pattern

### 구조

```
components/
├── atoms/          # 기본 단위 (Button, Input, Icon 등)
├── molecules/      # 원자 조합 (SearchInput, PriceDisplay 등)
├── organisms/      # 분자 조합 (Header, StockBox 등)
├── templates/      # 페이지 레이아웃
└── pages/          # 완성된 페이지
```

### 1. Atoms (원자)

가장 작은 단위의 컴포넌트. 더 이상 분해할 수 없는 기본 요소.

```tsx
// src/components/atoms/Button/Button.tsx
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        "glass rounded-lg transition-all",
        variant === "primary" && "bg-blue-500 hover:bg-blue-600",
        variant === "secondary" && "bg-gray-500 hover:bg-gray-600",
        variant === "ghost" && "bg-transparent hover:bg-white/10",
        size === "sm" && "px-2 py-1 text-sm",
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
```

### 2. Molecules (분자)

여러 Atom을 조합한 컴포넌트.

```tsx
// src/components/molecules/PriceDisplay/PriceDisplay.tsx
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  colorScheme: "kr" | "us";
}

export const PriceDisplay = ({ price, change, changePercent, colorScheme }: PriceDisplayProps) => {
  const { t } = useTranslation();
  const isUp = change > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-3xl font-bold">${price.toFixed(2)}</div>
      <div
        className={cn(
          "text-sm font-medium",
          colorScheme === "kr" && {
            "text-up-kr": isUp,
            "text-down-kr": !isUp,
          },
          colorScheme === "us" && {
            "text-up-us": isUp,
            "text-down-us": !isUp,
          }
        )}
      >
        {isUp ? "+" : ""}
        {change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </div>
    </div>
  );
};
```

### 3. Organisms (유기체)

여러 Molecule과 Atom을 조합한 복잡한 컴포넌트.

```tsx
// src/components/organisms/StockBox/StockBox.tsx
import { Rnd } from "react-rnd";
import { useStockBox } from "@/hooks/useStockBox";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

interface StockBoxProps {
  symbol: string;
  focused?: boolean;
  onFocus?: () => void;
  onDelete?: () => void;
}

export const StockBox = ({ symbol, focused, onFocus, onDelete }: StockBoxProps) => {
  const { data, loading, position, size, handleDragStop, handleResizeStop } = useStockBox(symbol);

  if (loading) return <div>Loading...</div>;

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
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
import { Header } from "@/components/organisms/Header";
import { ReactNode } from "react";

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
import { MainLayout } from "@/components/templates/MainLayout";
import { StockBox } from "@/components/organisms/StockBox";
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
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ko from "./locales/ko.json";
import en from "./locales/en.json";

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
import "./styles/globals.css";
import "./i18n/config"; // i18n 설정 import

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
