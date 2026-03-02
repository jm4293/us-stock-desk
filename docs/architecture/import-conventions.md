# Import 경로 규칙 (Barrel 패턴)

> 이 프로젝트는 **레이어 barrel** 방식을 사용합니다.
> 컴포넌트 개별 파일 경로가 아니라, 레이어 `index.ts`를 통해 import합니다.

---

## 📐 핵심 원칙

| 레이어         | import 경로    | ❌ 금지                                          |
| -------------- | -------------- | ------------------------------------------------ |
| **components** | `@/components` | `@/components/button/button`                     |
| **features**   | `@/features`   | `@/features/desktop-stock-box/desktop-stock-box` |
| **hooks**      | `@/hooks`      | `@/hooks/use-stock-data`                         |
| **stores**     | `@/stores`     | `@/stores/settings-store`                        |

> **services, utils, types, constants**는 개별 파일로 직접 import합니다 (아래 참고).

---

## ✅ 올바른 예시

```ts
// components (기본 UI 빌딩 블록)
import { Badge, Button, Header, Input, Modal } from "@/components";
// features (완전한 기능 모듈)
import {
  DesktopStockBox,
  MobileStockBox,
  PriceDisplay,
  SearchModal,
  SettingsModal,
  StockChart,
} from "@/features";
// hooks
import { useApplyTheme, useChartData, useIsMobile, useMarketStatus, useStockData } from "@/hooks";
// stores
import {
  useSettingsStore,
  useStockBoxStore,
  useStockIndexStore,
  useToastStore,
  useUIStore,
} from "@/stores";
```

## ❌ 잘못된 예시

```ts
// 개별 파일 경로 직접 접근 — 금지
import { Button } from "@/components/button/button";
import { DesktopStockBox } from "@/features/desktop-stock-box/desktop-stock-box";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useSettingsStore } from "@/stores/settings-store";
```

---

## 📌 레이어별 예외 규칙

### services — 개별 파일 직접 import

```ts
// API services
import { finnhubApi } from "@/services/api/fetch-finnhub";
import { yahooChartApi } from "@/services/api/fetch-yahoo-chart";
// WebSocket services
import { stockSocket } from "@/services/websocket/stock-socket";
import { yahooSocket } from "@/services/websocket/yahoo-socket";
```

서비스는 각 파일의 역할이 명확히 구분되므로 레이어 barrel 없이 직접 사용합니다.

### utils, types, constants — 개별 파일 직접 import

```ts
// utils
import { cn } from "@/utils/cn/cn";
import { formatDate } from "@/utils/date/date";
import { formatPercent, formatPrice } from "@/utils/formatters/formatters";
import type { ChartData } from "@/types/chart";
// types
import type { MarketStatus, StockPrice } from "@/types/stock";
// constants
import { CHART_RANGES } from "@/constants/chart";
import { COLORS } from "@/constants/colors";
import { STORAGE_KEYS } from "@/constants/storage";
```

### hooks 내부에서 서로 참조 시 — 개별 파일 직접 import

```ts
// hooks/use-stock-data.ts 내부
// ✅ 순환 참조 방지를 위해 직접 import
import { useMarketStatus } from "@/hooks/use-market-status";
import { useNetworkStatus } from "@/hooks/use-network-status";

// ❌ hooks barrel 사용 시 순환 참조 발생
// import { useMarketStatus } from "@/hooks";
```

> hooks barrel(`@/hooks`)을 hooks 파일 내부에서 사용하면 순환 참조가 발생할 수 있으므로
> hooks끼리 참조할 때는 반드시 개별 파일 경로를 사용합니다.

---

## 🗂 Barrel 파일 구조

```
src/
├── components/                # 기본 UI 빌딩 블록
│   ├── button/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   ├── button.stories.tsx
│   │   └── index.ts           ← export * from "./button"
│   ├── input/
│   │   ├── input.tsx
│   │   └── index.ts
│   ├── modal/
│   │   ├── modal.tsx
│   │   └── index.ts
│   └── index.ts               ← export * from "./button", "./input", "./modal"
│
├── features/                  # 완전한 기능 모듈
│   ├── desktop-stock-box/
│   │   ├── desktop-stock-box.tsx
│   │   ├── desktop-stock-box.test.tsx
│   │   ├── desktop-stock-box.stories.tsx
│   │   └── index.ts           ← export * from "./desktop-stock-box"
│   ├── price-display/
│   │   ├── price-display.tsx
│   │   └── index.ts
│   ├── stock-chart/
│   │   ├── stock-chart.tsx
│   │   └── index.ts
│   └── index.ts               ← export * from "./desktop-stock-box", "./price-display"...
│
├── hooks/
│   ├── use-stock-data.ts
│   ├── use-chart-data.ts
│   ├── use-is-mobile.ts
│   ├── use-market-status.ts
│   └── index.ts               ← export * from "./use-stock-data", "./use-chart-data"...
│
└── stores/
    ├── stock-box-store.ts
    ├── settings-store.ts
    ├── ui-store.ts
    ├── toast-store.ts
    ├── stock-index-store.ts
    └── index.ts               ← export * from 각 store + resetAllStores helper
```

---

## 🆕 새 컴포넌트/훅 추가 시 체크리스트

### Component 추가 (기본 UI)

```
1. src/components/{component-name}/component-name.tsx 생성
2. src/components/{component-name}/index.ts 생성
   └── export * from "./component-name";
3. src/components/index.ts 에 export 추가
   └── export * from "./{component-name}";
```

**예시:**

```ts
// src/components/button/index.ts
export * from "./button";

// src/components/index.ts
export * from "./button";
export * from "./input";
export * from "./modal";
// ... 모든 컴포넌트
```

### Feature 추가 (기능 모듈)

```
1. src/features/{feature-name}/feature-name.tsx 생성
2. src/features/{feature-name}/index.ts 생성
   └── export * from "./feature-name";
3. src/features/index.ts 에 export 추가
   └── export * from "./{feature-name}";
```

**예시:**

```ts
// src/features/desktop-stock-box/index.ts
export * from "./desktop-stock-box";

// src/features/index.ts
export * from "./desktop-stock-box";
export * from "./mobile-stock-box";
export * from "./price-display";
// ... 모든 피처
```

### Hook 추가

```
1. src/hooks/use-xxx.ts 생성
2. src/hooks/index.ts 에 export 추가
   └── export * from "./use-xxx";
```

**예시:**

```ts
// src/hooks/index.ts
export * from "./use-stock-data";
export * from "./use-chart-data";
export * from "./use-is-mobile";
export * from "./use-market-status";
// ... 모든 Hook
```

### Store 추가

```
1. src/stores/xxx-store.ts 생성
2. src/stores/index.ts 에 export 추가
   └── export * from "./xxx-store";
```

**예시:**

```ts
// src/stores/index.ts
export * from "./stock-box-store";
export * from "./settings-store";
export * from "./ui-store";
export * from "./toast-store";
export * from "./stock-index-store";

// Helper function
export const resetAllStores = () => {
  useStockBoxStore.getState().reset();
  useSettingsStore.getState().reset();
  // ... 모든 스토어 리셋
};
```

---

## 📝 파일 명명 규칙

### 파일명: kebab-case

- ✅ `desktop-stock-box.tsx`
- ✅ `use-stock-data.ts`
- ✅ `settings-store.ts`
- ❌ `DesktopStockBox.tsx`
- ❌ `useStockData.ts`

### 컴포넌트명: PascalCase

```tsx
// desktop-stock-box.tsx
export const DesktopStockBox = () => {
  // ...
};

DesktopStockBox.displayName = "DesktopStockBox";
```

### Hook명: camelCase with `use` prefix

```ts
// use-stock-data.ts
export function useStockData(symbol: string) {
  // ...
}
```

### Store명: camelCase with `use` prefix

```ts
// settings-store.ts
export const useSettingsStore =
  create<SettingsStore>()();
  // ...
```

---

## 🎯 Components vs Features

### Components (`src/components/`)

**기본 UI 빌딩 블록 - 재사용 가능한 단순 컴포넌트**

- Button, Input, Modal, Badge
- Header (간단한 앱 헤더)
- EmptyState, SplashScreen, Toast
- DesktopLayout, MobileLayout

**특징:**

- 비즈니스 로직 최소화
- Props로 데이터 받기
- 순수 UI 렌더링에 집중
- 프로젝트 전반에 걸쳐 재사용

### Features (`src/features/`)

**완전한 기능 모듈 - 컴포넌트 + 로직 통합**

- DesktopStockBox, MobileStockBox
- SearchModal, SettingsModal
- PriceDisplay, StockChart
- MarketIndexBar, KSTClock

**특징:**

- Hook과 Store를 사용하여 비즈니스 로직 통합
- 여러 컴포넌트를 조합
- 특정 기능에 특화
- 독립적으로 동작 가능

---

## 💡 Best Practices

### 1. Import 순서 (Prettier 자동 정렬)

```tsx
// 1. React
import React, { useEffect, useState } from "react";
// 3. Components
import { Button, Modal } from "@/components";
// 4. Features
import { PriceDisplay, StockChart } from "@/features";
// 5. Hooks
import { useIsMobile, useStockData } from "@/hooks";
// 6. Stores
import { useSettingsStore, useStockBoxStore } from "@/stores";
import { useTranslation } from "react-i18next";
// 2. External libraries
import { Rnd } from "react-rnd";
// 7. Services (직접 import)
import { finnhubApi } from "@/services/api/fetch-finnhub";
// 8. Utils (직접 import)
import { cn } from "@/utils/cn/cn";
import { formatPrice } from "@/utils/formatters/formatters";
// 9. Types
import type { StockPrice } from "@/types/stock";
// 10. Constants
import { CHART_RANGES } from "@/constants/chart";
```

### 2. displayName 설정

```tsx
export const Button = () => {
  // ...
};

Button.displayName = "Button"; // React DevTools에서 표시
```

### 3. TypeScript 타입 정의

```tsx
interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ variant = "primary", ...props }: ButtonProps) => {
  // ...
};
```

### 4. Barrel Export 패턴

```ts
// ✅ 좋은 예
export * from "./button";

// ❌ 나쁜 예 - default export는 피하기
export { default as Button } from "./button";
```

---

## 🔍 문제 해결

### 순환 참조 에러가 발생하면?

1. **hooks 내부에서 다른 hook 참조 시**: 개별 파일 경로로 import
2. **stores 내부에서 다른 store 참조 시**: 개별 파일 경로로 import
3. **컴포넌트 간 순환 참조**: 구조를 재검토하거나 공통 부분을 별도 파일로 분리

### IDE에서 자동 import가 잘못된 경로로 추가되면?

VSCode 설정 (`settings.json`):

```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## 📚 관련 문서

- [CLAUDE.md](../../CLAUDE.md) - 전체 프로젝트 가이드
- [css.md](./css.md) - CSS 전략
- [tech-stack.md](./tech-stack.md) - 기술 스택
- [getting-started.md](../getting-started.md) - 개발 시작 가이드
