# toastStore Store

## 개요

**useToastStore**는 토스트 알림(임시 메시지)을 관리합니다. 성공, 에러, 정보 메시지를 표시하고 자동으로 소멸시킵니다.

- **책임**: 토스트 알림 표시, 자동 제거
- **Persist**: ❌ No (메모리에만 저장)
- **특징**: 최대 3개 토스트만 화면에 표시, 자동 소멸 (3초)

---

## 상태 구조

### State 인터페이스

```typescript
interface Toast {
  id: string; // UUID (고유 식별자)
  message: string; // 표시할 메시지
  type: "success" | "error" | "info"; // 토스트 타입
}

interface ToastStore {
  toasts: Toast[]; // 현재 표시 중인 토스트 배열
  showToast: (message, type?) => void; // 토스트 추가
  removeToast: (id: string) => void; // 토스트 제거
}
```

### 초기값

```typescript
const DEFAULT_TOASTS = {
  toasts: [], // 빈 배열에서 시작
};
```

---

## Actions

### showToast(message, type?)

새 토스트를 표시합니다.

**파라미터**:

- `message: string` - 표시할 메시지
- `type?: "success" | "error" | "info"` - 토스트 타입 (기본값: "success")

**동작**:

1. UUID 생성 (`crypto.randomUUID()`)
2. Toast 객체 생성 (message, type과 함께)
3. toasts 배열에 추가
4. 배열 길이가 3을 초과하면 가장 오래된 토스트 제거
5. TIMING.TOAST_DURATION (3초) 후 자동 제거

**코드**:

```typescript
showToast: (message, type = "success") => {
  const id = crypto.randomUUID();
  set((state) => {
    const next = [...state.toasts, { id, message, type }];
    // 최대 3개 초과 시 가장 오래된 것 제거
    return { toasts: next.length > 3 ? next.slice(next.length - 3) : next };
  });
  setTimeout(() => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }, TIMING.TOAST_DURATION); // 3000ms = 3초
};
```

**사용 예시**:

```tsx
import { useToastStore } from "@/stores";

const { showToast } = useToastStore();

// 성공 메시지
showToast("주식이 추가되었습니다.");
// 또는
showToast("주식이 추가되었습니다.", "success");

// 에러 메시지
showToast("종목 추가에 실패했습니다.", "error");

// 정보 메시지
showToast("시장이 종료되었습니다.", "info");
```

---

### removeToast(id)

특정 토스트를 즉시 제거합니다 (x 버튼 클릭 시).

**파라미터**:

- `id: string` - 제거할 토스트의 ID

**사용 예시**:

```tsx
import { useToastStore } from "@/stores";

export const ToastItem = ({ toast }) => {
  const { removeToast } = useToastStore();

  return (
    <div className="toast">
      {toast.message}
      <button onClick={() => removeToast(toast.id)}>✕</button>
    </div>
  );
};
```

---

## 사용 예시

### 1. 주식 추가 시 토스트

```tsx
import { useStockBoxStore, useToastStore } from "@/stores";

export const SearchModal = () => {
  const { addStock } = useStockBoxStore();
  const { showToast } = useToastStore();

  const handleAddStock = async (symbol: string, companyName: string) => {
    try {
      // 데이터 검증
      if (!symbol || !companyName) {
        showToast("종목 정보가 부족합니다.", "error");
        return;
      }

      addStock(symbol, companyName);
      showToast(`${companyName}(${symbol})가 추가되었습니다.`, "success");
    } catch (error) {
      showToast("종목 추가에 실패했습니다.", "error");
    }
  };

  return (
    // 검색 모달 UI
  );
};
```

### 2. API 호출 후 토스트

```tsx
export const StockDataFetcher = () => {
  const { showToast } = useToastStore();

  const fetchStockData = async (symbol: string) => {
    try {
      const data = await apiService.getStockData(symbol);
      showToast(`${symbol} 데이터를 불러왔습니다.`, "success");
      return data;
    } catch (error) {
      showToast("데이터를 불러오는 중 오류가 발생했습니다.", "error");
      return null;
    }
  };

  return (
    // 컴포넌트
  );
};
```

### 3. 토스트 컨테이너

```tsx
import { selectRemoveToast, selectToasts, useToastStore } from "@/stores";
import { cn } from "@/utils/cn";

export const ToastContainer = () => {
  const toasts = useToastStore(selectToasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToastStore();

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[toast.type];

  return (
    <div
      className={cn(
        "glass flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-white",
        bgColor
      )}
    >
      <span>{toast.message}</span>
      <button onClick={() => removeToast(toast.id)} className="text-white hover:opacity-75">
        ✕
      </button>
    </div>
  );
};
```

### 4. 언어에 따른 메시지

```tsx
import { useTranslation } from "react-i18next";
import { useToastStore } from "@/stores";

export const MultiLanguageToast = () => {
  const { t } = useTranslation();
  const { showToast } = useToastStore();

  const handleAddStock = (symbol: string) => {
    showToast(t("toast.stockAdded", { symbol })), "success");
  };

  return (
    // 버튼
  );
};

// i18n 번역 (locales/ko.json)
// {
//   "toast": {
//     "stockAdded": "{{symbol}}이(가) 추가되었습니다."
//   }
// }
```

### 5. 조건부 토스트 (개발 환경에서만)

```tsx
export const DebugToast = (message: string) => {
  const { showToast } = useToastStore();

  if (import.meta.env.DEV) {
    showToast(`[DEBUG] ${message}`, "info");
  }
};

// 사용
DebugToast("Store 상태 변경됨");
```

### 6. 작업 완료 후 토스트

```tsx
export const StockRemoveButton = ({ stockId }: { stockId: string }) => {
  const { removeStock } = useStockBoxStore();
  const { showToast } = useToastStore();

  const handleRemove = () => {
    const stock = useStockBoxStore.getState().stocks.find((s) => s.id === stockId);
    if (!stock) return;

    removeStock(stockId);
    showToast(`${stock.symbol}가 제거되었습니다.`, "success");
  };

  return (
    <button onClick={handleRemove} className="text-red-500">
      제거
    </button>
  );
};
```

### 7. 설정 변경 알림

```tsx
import { useSettingsStore } from "@/stores";
import { useToastStore } from "@/stores";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useSettingsStore();
  const { showToast } = useToastStore();

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    showToast(newTheme === "dark" ? "다크 모드 활성화" : "라이트 모드 활성화", "info");
  };

  return <button onClick={handleThemeChange}>테마 변경</button>;
};
```

---

## 토스트 타입별 스타일

```tsx
const toastStyles = {
  success: {
    icon: "✓",
    bgColor: "bg-green-500",
    textColor: "text-white",
  },
  error: {
    icon: "✕",
    bgColor: "bg-red-500",
    textColor: "text-white",
  },
  info: {
    icon: "ℹ",
    bgColor: "bg-blue-500",
    textColor: "text-white",
  },
};
```

---

## 특징

### 1. 자동 소멸

```typescript
// 3초 후 자동으로 제거됨
showToast("작업이 완료되었습니다.", "success");
// 3초 뒤에 자동으로 토스트가 사라짐
```

### 2. 최대 3개 토스트

```typescript
// 토스트가 4개 이상이면 가장 오래된 것부터 제거
showToast("1번", "info"); // toasts = [1]
showToast("2번", "info"); // toasts = [1, 2]
showToast("3번", "info"); // toasts = [1, 2, 3]
showToast("4번", "info"); // toasts = [2, 3, 4] (1번 제거)
showToast("5번", "info"); // toasts = [3, 4, 5] (2번 제거)
```

### 3. 즉시 제거 가능

```typescript
const { id } = toastId;
removeToast(id); // 자동 소멸 전에 제거 가능
```

---

## TIMING 상수

```typescript
// src/constants/timing.ts
export const TIMING = {
  TOAST_DURATION: 3000, // 3초
};
```

토스트가 보이는 시간을 변경하려면 이 값을 수정합니다.

---

## Selector 패턴

```typescript
// State Selector
export const selectToasts = (state: ToastStore) => state.toasts;

// Action Selectors
export const selectShowToast = (state: ToastStore) => state.showToast;
export const selectRemoveToast = (state: ToastStore) => state.removeToast;
```

**사용**:

```tsx
const toasts = useToastStore(selectToasts);
const showToast = useToastStore(selectShowToast);
```

---

## 주의사항

### 1. 토스트는 Persist하지 않음

```tsx
// ✅ 페이지 새로고침 시 모든 토스트가 사라짐
// 의도적 설계: 토스트는 임시 알림이므로 유지할 필요 없음
```

### 2. 동일한 메시지 중복 표시

```tsx
// ❌ 같은 메시지를 여러 번 showToast하면 여러 개 표시
showToast("저장되었습니다.");
showToast("저장되었습니다.");
// → 토스트 2개 표시

// ✅ 중복 제거가 필요하면 조건 확인
const shouldShowToast = (message) => {
  const existing = useToastStore.getState().toasts;
  return !existing.some((t) => t.message === message);
};

if (shouldShowToast("저장되었습니다.")) {
  showToast("저장되었습니다.");
}
```

### 3. 제거 함수는 ID 필요

```tsx
// ❌ 잘못된 사용
removeToast("저장되었습니다."); // 메시지로 제거 불가

// ✅ 올바른 사용
removeToast(toastId); // UUID로 제거
```

### 4. 성능: 많은 토스트 추가 금지

```tsx
// ❌ 루프에서 개별 showToast 호출
for (let i = 0; i < 100; i++) {
  showToast(`메시지 ${i}`); // 과도한 상태 변경
}

// ✅ 최대 3개 토스트만 유지되므로 실제로는 무해하지만 피하기
const showBatchToasts = (messages: string[]) => {
  messages.forEach((msg) => showToast(msg));
};
```

---

## Accessibility (접근성)

토스트 컴포넌트는 스크린 리더 지원이 필요합니다:

```tsx
export const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToastStore();

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="glass rounded-lg px-4 py-3">
      {toast.message}
      <button onClick={() => removeToast(toast.id)} aria-label={`${toast.message} 닫기`}>
        ✕
      </button>
    </div>
  );
};
```

---

## 개발 팁

### 현재 토스트 확인

```javascript
// 브라우저 콘솔
window.stores.ui ? window.stores.ui.getState() : "Toast store not found";
// → { toasts: [...] }
```

### 토스트 수동 추가

```javascript
useToastStore.getState().showToast("테스트 메시지", "success");
```

### 토스트 컨테이너 테스트

```tsx
import { render, screen } from "@testing-library/react";

it("should show toast when showToast is called", () => {
  render(<ToastContainer />);

  act(() => {
    useToastStore.getState().showToast("Test message", "success");
  });

  expect(screen.getByText("Test message")).toBeInTheDocument();
});
```

---

## 다음 단계

- [uiStore.md](./uiStore.md) - 모달 UI 상태
- [stockIndexStore.md](./stockIndexStore.md) - 지수/환율 레이아웃
- [README.md](./README.md) - Zustand Store 전체 가이드
