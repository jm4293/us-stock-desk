# Zustand Store 사용 규칙

> Zustand를 사용한 전역 상태 관리 규칙

---

## 🎯 핵심 원칙

1. ✅ **Immer 사용** - 불변성 관리 자동화
2. ✅ **TypeScript 타입 정의 필수**
3. ✅ **DevTools 통합** - 개발 환경에서만
4. ✅ **Persist 사용** - LocalStorage 연동 (필요 시)
5. ❌ **직접 state 변경 금지** - actions를 통해서만

---

## 📦 프로젝트의 Store 구조

```
src/stores/
├── stockBoxStore.ts      # 주식 박스 상태 (위치, 크기, z-index)
├── settingsStore.ts      # 설정 (테마, 언어, 색상 스키마)
├── uiStore.ts            # UI 상태 (모달 열림/닫힘)
├── toastStore.ts         # 토스트 알림
└── index.ts              # barrel export
```

---

## ✅ 올바른 Store 작성

### 1. 기본 구조

```ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface StockBoxState {
  boxes: StockBox[];
  addBox: (symbol: string) => void;
  removeBox: (id: string) => void;
  updatePosition: (id: string, position: Position) => void;
}

export const useStockBoxStore = create<StockBoxState>()(
  devtools(
    immer((set) => ({
      // State
      boxes: [],

      // Actions
      addBox: (symbol) =>
        set((state) => {
          state.boxes.push({
            id: `${symbol}-${Date.now()}`,
            symbol,
            position: { x: 0, y: 0 },
            size: { width: 400, height: 300 },
          });
        }),

      removeBox: (id) =>
        set((state) => {
          state.boxes = state.boxes.filter((box) => box.id !== id);
        }),

      updatePosition: (id, position) =>
        set((state) => {
          const box = state.boxes.find((b) => b.id === id);
          if (box) {
            box.position = position;
          }
        }),
    })),
    { name: "StockBoxStore" }
  )
);
```

### 2. Persist 미들웨어 (LocalStorage)

```ts
import { persist } from "zustand/middleware";

interface SettingsState {
  theme: "light" | "dark";
  language: "ko" | "en";
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: "ko" | "en") => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      immer((set) => ({
        theme: "dark",
        language: "ko",

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        setLanguage: (language) =>
          set((state) => {
            state.language = language;
          }),
      })),
      {
        name: "settings-storage", // LocalStorage 키
      }
    ),
    { name: "SettingsStore" }
  )
);
```

---

## ❌ 금지된 패턴

### 1. 직접 state 변경

```ts
// ❌ 잘못된 방법
const { boxes } = useStockBoxStore();
boxes.push(newBox); // 직접 변경 금지!

// ✅ 올바른 방법
const { addBox } = useStockBoxStore();
addBox(symbol); // action 사용
```

### 2. Immer 없이 불변성 관리

```ts
// ❌ 잘못된 방법 (Immer 미사용)
updatePosition: (id, position) =>
  set((state) => ({
    boxes: state.boxes.map((box) => (box.id === id ? { ...box, position } : box)),
  }));

// ✅ 올바른 방법 (Immer 사용)
updatePosition: (id, position) =>
  set((state) => {
    const box = state.boxes.find((b) => b.id === id);
    if (box) {
      box.position = position; // Immer가 불변성 관리
    }
  });
```

### 3. 타입 미정의

```ts
// ❌ 잘못된 방법
export const useStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

// ✅ 올바른 방법
interface StoreState {
  data: StockPrice | null;
  setData: (data: StockPrice | null) => void;
}

export const useStore = create<StoreState>()(
  // ...
);
```

---

## 🎨 컴포넌트에서 사용

### 1. 전체 state 사용 (권장하지 않음)

```tsx
// ⚠️ 성능 이슈 - 모든 state 변경 시 리렌더링
const state = useStockBoxStore();
```

### 2. 필요한 것만 선택 (✅ 권장)

```tsx
// ✅ 올바른 방법 - 필요한 것만 구독
const boxes = useStockBoxStore((state) => state.boxes);
const addBox = useStockBoxStore((state) => state.addBox);

// 또는
const { boxes, addBox } = useStockBoxStore((state) => ({
  boxes: state.boxes,
  addBox: state.addBox,
}));
```

### 3. 여러 action 사용

```tsx
const { addBox, removeBox, updatePosition } = useStockBoxStore((state) => ({
  addBox: state.addBox,
  removeBox: state.removeBox,
  updatePosition: state.updatePosition,
}));
```

---

## 💡 권장 사항

### 1. Action 명명 규칙

```ts
// ✅ 동사로 시작
(addBox, removeBox, updatePosition, setTheme, toggleModal);

// ❌ 명사 사용
(box, position, theme);
```

### 2. 복잡한 로직은 분리

```ts
// ✅ 복잡한 계산은 별도 함수로
const calculateNewZIndex = (boxes: StockBox[]) => {
  return Math.max(...boxes.map((b) => b.zIndex), 0) + 1;
};

bringToFront: (id) =>
  set((state) => {
    const box = state.boxes.find((b) => b.id === id);
    if (box) {
      box.zIndex = calculateNewZIndex(state.boxes);
    }
  });
```

### 3. DevTools는 개발 환경에서만

```ts
export const useStore = create<State>()(
  process.env.NODE_ENV === "development"
    ? devtools(immer(storeImpl), { name: "StoreName" })
    : immer(storeImpl)
);
```

---

## 🗂 파일 구조

### Store 파일

```ts
// src/stores/stockBoxStore.ts
interface StockBoxState {
  // types
}

export const useStockBoxStore =
  create<StockBoxState>()();
  // implementation
```

### Barrel Export

```ts
// src/stores/index.ts
export * from "./stockBoxStore";
export * from "./settingsStore";
export * from "./uiStore";
export * from "./toastStore";
```

---

## 🔄 Store 간 참조

### Store에서 다른 Store 사용

```ts
import { useSettingsStore } from "@/stores/settingsStore";

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    openModal: (modalName) =>
      set((state) => {
        // 다른 store 참조
        const { theme } = useSettingsStore.getState();

        if (theme === "dark") {
          // 다크 모드 전용 로직
        }

        state.openedModal = modalName;
      }),
  }))
);
```

---

## 📋 체크리스트

새 Store 작성 후:

- [ ] TypeScript 타입 정의했는가?
- [ ] Immer 미들웨어 사용했는가?
- [ ] DevTools 통합했는가?
- [ ] Persist 필요 시 추가했는가?
- [ ] Action은 동사로 시작하는가?
- [ ] stores/index.ts에 export 추가했는가?

---

## 🚨 자주 하는 실수

### ❌ 실수 1: state 직접 변경

```ts
// ❌ 잘못된 방법
const state = useStore();
state.value = newValue;

// ✅ 올바른 방법
const setValue = useStore((state) => state.setValue);
setValue(newValue);
```

### ❌ 실수 2: 불필요한 리렌더링

```tsx
// ❌ 전체 state 구독 - 모든 변경 시 리렌더링
const state = useStore();

// ✅ 필요한 것만 구독
const value = useStore((state) => state.value);
```

### ❌ 실수 3: Immer 없이 중첩 객체 수정

```ts
// ❌ Immer 없으면 복잡함
set((state) => ({
  boxes: state.boxes.map((box) =>
    box.id === id
      ? {
          ...box,
          position: {
            ...box.position,
            x: newX,
          },
        }
      : box
  ),
}));

// ✅ Immer 사용하면 간단함
set((state) => {
  const box = state.boxes.find((b) => b.id === id);
  if (box) {
    box.position.x = newX;
  }
});
```

---

**작성일:** 2026-03-10
**참조:** [docs/guides/stores/README.md](../../docs/guides/stores/README.md) (작성 예정)
