# Import 경로 규칙 (Barrel 패턴)

> 이 프로젝트는 **레이어 barrel** 방식을 사용합니다.
> 컴포넌트 개별 파일 경로가 아니라, 레이어 `index.ts`를 통해 import합니다.

---

## 📐 핵심 원칙

| 레이어        | import 경로              | ❌ 금지                                |
| ------------- | ------------------------ | -------------------------------------- |
| **organisms** | `@/components/organisms` | `@/components/organisms/Header/Header` |
| **molecules** | `@/components/molecules` | `@/components/molecules/Toast/Toast`   |
| **atoms**     | `@/components/atoms`     | `@/components/atoms/Button/Button`     |
| **hooks**     | `@/hooks`                | `@/hooks/useMarketStatus`              |
| **stores**    | `@/stores`               | `@/stores/settingsStore`               |

> **services, utils, types, constants**는 개별 파일로 직접 import합니다 (아래 참고).

---

## ✅ 올바른 예시

```ts
// organisms
import { Header, SearchModal, DesktopCanvas } from "@/components/organisms";

// molecules
import { PriceDisplay, StockChart, ToastContainer } from "@/components/molecules";

// atoms
import { Button, Input, Badge } from "@/components/atoms";

// hooks
import { useStockData, useIsMobile, useMarketStatus } from "@/hooks";

// stores
import { useStockStore, useSettingsStore, useShowToast } from "@/stores";
```

## ❌ 잘못된 예시

```ts
// 개별 파일 경로 직접 접근 — 금지
import { Header } from "@/components/organisms/Header/Header";
import { Toast } from "@/components/molecules/Toast/Toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettingsStore } from "@/stores/settingsStore";
```

---

## 📌 레이어별 예외 규칙

### services — 개별 파일 직접 import

```ts
import { finnhubApi } from "@/services/api/finnhubApi";
import { stockSocket } from "@/services/websocket/stockSocket";
import { storageService } from "@/services/storage/localStorage";
```

서비스는 각 파일의 역할이 명확히 구분되므로 레이어 barrel 없이 직접 사용합니다.

### utils, types, constants — 개별 파일 직접 import

```ts
import { cn } from "@/utils/cn";
import { formatUSD } from "@/utils/formatters";
import type { StockPrice } from "@/types/stock";
import { TIMING } from "@/constants/timing";
```

### hooks 내부에서 서로 참조 시 — 개별 파일 직접 import

```ts
// hooks/useMobileStockCard.ts 내부
import { useStockData } from "@/hooks/useStockData"; // ✅ 순환 참조 방지를 위해 직접
import { useChartData } from "@/hooks/useChartData"; // ✅
```

> hooks barrel(`@/hooks`)을 hooks 파일 내부에서 사용하면 순환 참조가 발생할 수 있으므로
> hooks끼리 참조할 때는 반드시 개별 파일 경로를 사용합니다.

---

## 🗂 Barrel 파일 구조

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts          ← export { Button } from "./Button"
│   │   ├── Input/index.ts
│   │   ├── Badge/index.ts
│   │   └── index.ts              ← export { Button, Input, Badge } from "..."
│   ├── molecules/
│   │   ├── PriceDisplay/index.ts
│   │   ├── StockChart/index.ts
│   │   └── index.ts              ← 모든 molecules re-export
│   └── organisms/
│       ├── Header/index.ts
│       ├── StockBox/index.ts
│       └── index.ts              ← 모든 organisms re-export
├── hooks/
│   ├── useStockData.ts
│   ├── useIsMobile.ts
│   └── index.ts                  ← 모든 hooks re-export
└── stores/
    ├── stockStore.ts
    ├── settingsStore.ts
    └── index.ts                  ← export * from 각 store
```

---

## 🆕 새 컴포넌트/훅 추가 시 체크리스트

### 컴포넌트 추가

```
1. src/components/{layer}/{ComponentName}/ComponentName.tsx 생성
2. src/components/{layer}/{ComponentName}/index.ts 생성
   └── export { ComponentName } from "./ComponentName";
3. src/components/{layer}/index.ts 에 export 추가
   └── export { ComponentName } from "./{ComponentName}";
```

### 훅 추가

```
1. src/hooks/useXxx.ts 생성
2. src/hooks/index.ts 에 export 추가
   └── export { useXxx } from "./useXxx";
```

### 스토어 추가

```
1. src/stores/xxxStore.ts 생성
2. src/stores/index.ts 에 export 추가
   └── export * from "./xxxStore";
```
