# Import 경로 규칙

> Barrel 패턴을 사용한 레이어별 import

---

## 🎯 핵심 원칙

**레이어 barrel을 통해 import합니다. 개별 파일 경로 직접 접근 금지.**

---

## ✅ 올바른 방법

```ts
// Components
// Hooks
import { useIsMobile, useMarketStatus, useStockData } from "@/hooks";
// Stores
import { useSettingsStore, useShowToast, useStockStore } from "@/stores";
import { Badge, Button, Input } from "@/components/atoms";
import { PriceDisplay, StockChart } from "@/components/molecules";
import { Header, SearchModal } from "@/components/organisms";
```

---

## ❌ 금지된 방법

```ts
// 개별 파일 직접 접근 — 절대 금지!
import { Toast } from "@/components/molecules/Toast/Toast";
import { Header } from "@/components/organisms/Header/Header";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettingsStore } from "@/stores/settingsStore";
```

---

## 📌 레이어별 규칙

### Components (organisms, molecules, atoms)

```ts
// ✅ Barrel import만 사용
import { Button } from "@/components/atoms";
import { PriceDisplay } from "@/components/molecules";
import { Header } from "@/components/organisms";
```

### Hooks

```ts
// ✅ Barrel import
import { useChartData, useStockData } from "@/hooks";
```

**예외:** Hook 파일 내부에서 다른 Hook 참조 시

```ts
// hooks/useMobileStockCard.ts 내부
// ✅ 순환 참조 방지를 위해 직접 import
import { useChartData } from "@/hooks/useChartData";
import { useStockData } from "@/hooks/useStockData";
```

### Stores

```ts
// ✅ Barrel import
import { useSettingsStore, useStockStore } from "@/stores";
```

---

## 🔓 예외 (직접 import 허용)

### Services

```ts
// ✅ 서비스는 개별 파일 직접 접근
import { finnhubApi } from "@/services/api/finnhubApi";
import { storageService } from "@/services/storage/localStorage";
import { stockSocket } from "@/services/websocket/stockSocket";
```

### Utils

```ts
// ✅ 유틸리티는 개별 함수 직접 접근
import { cn } from "@/utils/cn";
import { formatUSD } from "@/utils/formatters";
```

### Types

```ts
// ✅ 타입은 개별 파일 직접 접근
import type { AsyncState } from "@/types/api";
import type { StockPrice } from "@/types/stock";
```

### Constants

```ts
// ✅ 상수는 개별 파일 직접 접근
import { API_ENDPOINTS } from "@/constants/api";
import { TIMING } from "@/constants/timing";
```

---

## 🆕 새 파일 추가 시

### 컴포넌트 추가

```
1. src/components/{layer}/{ComponentName}/ComponentName.tsx 생성
2. src/components/{layer}/{ComponentName}/index.ts 생성
   └── export { ComponentName } from "./ComponentName";
3. src/components/{layer}/index.ts에 export 추가 ✅ 필수!
   └── export { ComponentName } from "./{ComponentName}";
```

**예시:**

```ts
// src/components/atoms/Badge/index.ts
export { Badge } from "./Badge";

// src/components/atoms/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Badge } from "./Badge"; // ✅ 추가
```

### Hook 추가

```
1. src/hooks/useXxx.ts 생성
2. src/hooks/index.ts에 export 추가 ✅ 필수!
   └── export { useXxx } from "./useXxx";
```

### Store 추가

```
1. src/stores/xxxStore.ts 생성
2. src/stores/index.ts에 export 추가 ✅ 필수!
   └── export * from "./xxxStore";
```

---

## 📋 체크리스트

새 파일 작성 후:

- [ ] 해당 레이어의 `index.ts`에 export 추가했는가?
- [ ] Import 시 barrel 패턴 사용했는가?
- [ ] 개별 파일 경로 직접 접근하지 않았는가?

---

## 🚨 자주 하는 실수

### ❌ 실수 1: index.ts 업데이트 누락

```ts
// 새 컴포넌트 생성 후 index.ts 업데이트 안 함
import { NewComponent } from "@/components/atoms";

// ❌ 에러!
```

**해결:**

```ts
// src/components/atoms/index.ts
export { NewComponent } from "./NewComponent"; // ✅ 추가
```

### ❌ 실수 2: 직접 경로 사용

```ts
// ❌ 잘못된 방법
import { Button } from "@/components/atoms/Button/Button";

// ✅ 올바른 방법
import { Button } from "@/components/atoms";
```

### ❌ 실수 3: Hook 내부에서 barrel import

```ts
// hooks/useStockBox.ts 내부
// ❌ 순환 참조 발생 가능
import { useStockData } from "@/hooks";

// ✅ 올바른 방법
import { useStockData } from "@/hooks/useStockData";
```

---

**작성일:** 2026-03-10
**참조:** [docs/architecture/import-conventions.md](../../docs/architecture/import-conventions.md) (삭제 예정)
