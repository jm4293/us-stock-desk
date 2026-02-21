# 🧪 Agent 6: Test (테스트 전문가)

> TDD + Storybook으로 품질 보장

## 🎯 역할

모든 컴포넌트와 로직에 대한 테스트를 작성합니다.

- Vitest + React Testing Library (단위 테스트)
- Storybook (컴포넌트 문서화)
- TDD (테스트 주도 개발)
- 접근성 테스트

## 📋 작업 범위

### ✅ 작업 대상

- `tests/` - 모든 테스트 파일
  - `components/` - 컴포넌트 테스트
  - `hooks/` - Hook 테스트
  - `services/` - Service 테스트
  - `utils/` - 유틸리티 테스트
- `.storybook/` - Storybook 설정
- `src/**/*.stories.tsx` - Storybook 스토리

### ❌ 작업 제외

- 컴포넌트 구현 (Components 에이전트 완료)
- API 구현 (Services 에이전트 완료)

## 📚 필수 읽기 문서

1. **TDD_STORYBOOK_I18N.md** - TDD, Storybook 가이드 (필독!)
2. **PROJECT_REQUIREMENTS.md** - 테스트 요구사항
3. **ADVANCED_TECH_STACK.md** - 접근성 가이드

## 🔧 작업 순서

### 1단계: Vitest 설정

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", ".storybook/", "**/*.stories.tsx", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/constants": path.resolve(__dirname, "./src/constants"),
    },
  },
});
```

```typescript
// tests/setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
});

// LocalStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// WebSocket 모킹
global.WebSocket = vi.fn() as any;
```

### 2단계: 컴포넌트 테스트

#### 2.1 Atoms 테스트

```typescript
// tests/components/atoms/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/atoms/Button/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-ghost');
  });

  it('applies size styles', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3 py-1 text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg');
  });
});
```

```typescript
// tests/components/atoms/Input.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/atoms/Input/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('hello');
  });

  it('has aria-invalid when error exists', () => {
    render(<Input error="Error message" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
```

#### 2.2 Organisms 테스트

```typescript
// tests/components/organisms/Header.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/organisms/Header/Header';

// Mock stores
vi.mock('@/stores/settingsStore', () => ({
  useTheme: () => 'light',
  useSettingsActions: () => ({
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUiActions: () => ({
    openModal: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

describe('Header', () => {
  it('renders app title', () => {
    render(<Header />);
    expect(screen.getByText('US Stock Desk')).toBeInTheDocument();
  });

  it('has add stock button', () => {
    render(<Header />);
    expect(screen.getByLabelText('header.addStock')).toBeInTheDocument();
  });

  it('has theme toggle button', () => {
    render(<Header />);
    expect(screen.getByLabelText('header.toggleTheme')).toBeInTheDocument();
  });

  it('has language toggle button', () => {
    render(<Header />);
    expect(screen.getByLabelText('header.toggleLanguage')).toBeInTheDocument();
  });

  it('has settings button', () => {
    render(<Header />);
    expect(screen.getByLabelText('header.settings')).toBeInTheDocument();
  });
});
```

### 3단계: Hooks 테스트

```typescript
// tests/hooks/useStockBox.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStockBox } from "@/hooks/useStockBox";
import type { StockBox } from "@/types/stock";

// Mock services
vi.mock("@/services/api/finnhub", () => ({
  finnhubApi: {
    getQuote: vi.fn(() =>
      Promise.resolve({
        c: 150,
        o: 148,
        h: 152,
        l: 147,
        pc: 149,
        t: Date.now(),
      })
    ),
  },
}));

vi.mock("@/services/websocket/stockSocket", () => ({
  stockSocket: {
    subscribe: vi.fn(() => () => {}),
  },
}));

vi.mock("@/stores/stockStore", () => ({
  useStockActions: () => ({
    updatePosition: vi.fn(),
    updateSize: vi.fn(),
    removeStock: vi.fn(),
    bringToFront: vi.fn(),
    setFocused: vi.fn(),
  }),
}));

describe("useStockBox", () => {
  const mockStock: StockBox = {
    id: "test-1",
    symbol: "AAPL",
    companyName: "Apple Inc.",
    position: { x: 0, y: 0 },
    size: { width: 400, height: 300 },
    zIndex: 1,
    created: Date.now(),
    updated: Date.now(),
  };

  it("loads stock data on mount", async () => {
    const { result } = renderHook(() => useStockBox(mockStock));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.current).toBe(150);
  });

  it("subscribes to WebSocket updates", () => {
    const { stockSocket } = require("@/services/websocket/stockSocket");
    renderHook(() => useStockBox(mockStock));

    expect(stockSocket.subscribe).toHaveBeenCalledWith("AAPL", expect.any(Function));
  });
});
```

### 4단계: Storybook 설정

```typescript
// .storybook/main.ts
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
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
      "@/components": path.resolve(__dirname, "../src/components"),
      "@/hooks": path.resolve(__dirname, "../src/hooks"),
      "@/stores": path.resolve(__dirname, "../src/stores"),
      "@/services": path.resolve(__dirname, "../src/services"),
      "@/utils": path.resolve(__dirname, "../src/utils"),
      "@/types": path.resolve(__dirname, "../src/types"),
      "@/constants": path.resolve(__dirname, "../src/constants"),
    };
    return config;
  },
};

export default config;
```

```typescript
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';

      return (
        <div className={theme === 'dark' ? 'dark' : ''}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default preview;
```

### 5단계: Storybook 스토리

```tsx
// src/components/atoms/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
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
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Loading Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};
```

```tsx
// src/components/molecules/PriceDisplay/PriceDisplay.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PriceDisplay } from "./PriceDisplay";

const meta = {
  title: "Molecules/PriceDisplay",
  component: PriceDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PriceDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: {
    price: 150.25,
    change: 2.35,
    changePercent: 1.59,
  },
};

export const Negative: Story = {
  args: {
    price: 148.9,
    change: -3.15,
    changePercent: -2.07,
  },
};

export const Unchanged: Story = {
  args: {
    price: 150.0,
    change: 0,
    changePercent: 0,
  },
};
```

## ✅ 완료 체크리스트

### 설정

- [ ] `vitest.config.ts` 생성
- [ ] `tests/setup.ts` 생성
- [ ] `.storybook/main.ts` 생성
- [ ] `.storybook/preview.tsx` 생성

### 테스트 작성

- [ ] Atoms 테스트 (Button, Input, Icon)
- [ ] Molecules 테스트 (SearchInput, PriceDisplay)
- [ ] Organisms 테스트 (Header, StockBox)
- [ ] Hooks 테스트 (useStockBox)
- [ ] Utils 테스트 (cn)
- [ ] Services 테스트 (API)

### Storybook 스토리

- [ ] Atoms 스토리
- [ ] Molecules 스토리
- [ ] Organisms 스토리

### 커버리지

- [ ] 전체 커버리지 80% 이상
- [ ] 핵심 비즈니스 로직 100%

### 접근성

- [ ] ARIA 속성 테스트
- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 테스트

## 💡 Best Practices

### 1. AAA 패턴 (Arrange-Act-Assert)

```typescript
it('calls onClick when clicked', async () => {
  // Arrange
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);

  // Act
  await userEvent.click(screen.getByRole('button'));

  // Assert
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 2. 역할(role) 기반 선택

```typescript
// ✅ 좋은 예
screen.getByRole("button");
screen.getByRole("textbox");
screen.getByLabelText("Username");

// ❌ 나쁜 예
screen.getByTestId("submit-button");
screen.getByClassName("input");
```

### 3. 비동기 처리

```typescript
// waitFor 사용
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// findBy 사용
const element = await screen.findByText("Loaded");
```

## 🤝 최종 완료

Test 작업 완료 후:

```
✅ Test 작업 완료

생성된 결과물:
- Vitest 설정 완료
- 컴포넌트 테스트 완료
- Hooks 테스트 완료
- Storybook 설정 완료
- 스토리 작성 완료

✨ US Stock Desk 프로젝트 개발 완료!
모든 Agent Teams 작업이 완료되었습니다.
```

---

**담당**: 테스트 & 문서화  
**의존성**: 모든 에이전트  
**다음 에이전트**: 없음 (완료)
