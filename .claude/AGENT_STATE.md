# 🗃️ Agent 3: State (상태 관리)

> Zustand로 전역 상태 관리 시스템 구축

## 🎯 역할

Zustand를 사용해 애플리케이션의 전역 상태를 관리합니다.

- Zustand 스토어 설계
- Persist (LocalStorage 연동)
- DevTools 연동
- Immer로 불변성 관리

## 📋 작업 범위

### ✅ 작업 대상

- `src/stores/` - 모든 Zustand 스토어 (kebab-case 파일명)
  - `stock-box-store.ts` - 주식 박스 상태
  - `settings-store.ts` - 설정 상태
  - `ui-store.ts` - UI 상태
  - `toast-store.ts` - 토스트 상태
  - `stock-index-store.ts` - 주요 지수 상태
  - `index.ts` - Barrel export

### ❌ 작업 제외

- API 호출 (Services 에이전트)
- 컴포넌트 (Components 에이전트)
- 스타일 (Styles 에이전트)

## 📚 필수 읽기 문서

1. **docs/architecture/tech-stack.md** - Zustand 가이드 (필독!)
2. **docs/architecture/import-conventions.md** - Import 규칙 (Barrel 패턴)
3. **CLAUDE.md** - 프로젝트 이해
4. **docs/requirements.md** - 상태 요구사항

## 🔧 작업 순서

### 1단계: Stock Box Store (주식 박스 상태)

```typescript
// src/stores/stock-box-store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StockBox, Position, Size } from "@/types/stock";
import type { StockState, StockActions } from "@/types/store";
import { STORAGE_KEYS } from "@/constants/app";

interface StockStore extends StockState, StockActions {}

export const useStockStore = create<StockStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        stocks: [],
        focusedStockId: null,
        maxZIndex: 0,

        // Actions
        addStock: (symbol: string, companyName: string) => {
          set((state) => {
            const newZIndex = state.maxZIndex + 1;
            const newStock: StockBox = {
              id: `${symbol}-${Date.now()}`,
              symbol,
              companyName,
              position: {
                x: Math.random() * (window.innerWidth - 400),
                y: Math.random() * (window.innerHeight - 300),
              },
              size: {
                width: 400,
                height: 300,
              },
              zIndex: newZIndex,
              created: Date.now(),
              updated: Date.now(),
            };
            state.stocks.push(newStock);
            state.maxZIndex = newZIndex;
            state.focusedStockId = newStock.id;
          });
        },

        removeStock: (id: string) => {
          set((state) => {
            state.stocks = state.stocks.filter((stock) => stock.id !== id);
            if (state.focusedStockId === id) {
              state.focusedStockId = null;
            }
          });
        },

        updatePosition: (id: string, position: Position) => {
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              stock.position = position;
              stock.updated = Date.now();
            }
          });
        },

        updateSize: (id: string, size: Size) => {
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              stock.size = size;
              stock.updated = Date.now();
            }
          });
        },

        setFocused: (id: string | null) => {
          set((state) => {
            state.focusedStockId = id;
          });
        },

        bringToFront: (id: string) => {
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              const newZIndex = state.maxZIndex + 1;
              stock.zIndex = newZIndex;
              state.maxZIndex = newZIndex;
              state.focusedStockId = id;
            }
          });
        },
      })),
      {
        name: STORAGE_KEYS.STOCKS,
        version: 1,
        // 민감한 정보 암호화 (선택사항)
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            try {
              // Base64 디코딩
              const decoded = atob(str);
              return JSON.parse(decoded);
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            // Base64 인코딩
            const encoded = btoa(JSON.stringify(value));
            localStorage.setItem(name, encoded);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    {
      name: "StockStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors (성능 최적화)
export const useStocks = () => useStockBoxStore((state) => state.stocks);
export const useFocusedStockId = () => useStockBoxStore((state) => state.focusedStockId);
export const useStockBoxActions = () =>
  useStockBoxStore((state) => ({
    addStock: state.addStock,
    removeStock: state.removeStock,
    updatePosition: state.updatePosition,
    updateSize: state.updateSize,
    setFocused: state.setFocused,
    bringToFront: state.bringToFront,
  }));
```

### 2단계: Settings Store (설정 상태)

```typescript
// src/stores/settings-store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { SettingsState, SettingsActions } from "@/types/store";
import { STORAGE_KEYS } from "@/constants/app";

interface SettingsStore extends SettingsState, SettingsActions {}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        theme: "light",
        language: "ko",
        colorScheme: "kr",
        currency: "USD",

        // Actions
        setTheme: (theme) => {
          set((state) => {
            state.theme = theme;
          });

          // DOM 업데이트
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        },

        setLanguage: (lang) => {
          set((state) => {
            state.language = lang;
          });
        },

        setColorScheme: (scheme) => {
          set((state) => {
            state.colorScheme = scheme;
          });
        },

        setCurrency: (currency) => {
          set((state) => {
            state.currency = currency;
          });
        },
      })),
      {
        name: STORAGE_KEYS.SETTINGS,
        version: 1,
      }
    ),
    {
      name: "SettingsStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors
export const useTheme = () => useSettingsStore((state) => state.theme);
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useColorScheme = () => useSettingsStore((state) => state.colorScheme);
export const useCurrency = () => useSettingsStore((state) => state.currency);
export const useSettingsActions = () =>
  useSettingsStore((state) => ({
    setTheme: state.setTheme,
    setLanguage: state.setLanguage,
    setColorScheme: state.setColorScheme,
    setCurrency: state.setCurrency,
  }));
```

### 3단계: UI Store (UI 상태)

```typescript
// src/stores/ui-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Modal {
  isOpen: boolean;
  type: "search" | "settings" | "error" | null;
  data?: any;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface UiState {
  modal: Modal;
  toasts: Toast[];
  isLoading: boolean;
  sidebarOpen: boolean;
}

interface UiActions {
  // Modal
  openModal: (type: Modal["type"], data?: any) => void;
  closeModal: () => void;

  // Toast
  showToast: (message: string, type: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;

  // Loading
  setLoading: (isLoading: boolean) => void;

  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface UiStore extends UiState, UiActions {}

export const useUiStore = create<UiStore>()(
  devtools(
    immer((set) => ({
      // State
      modal: {
        isOpen: false,
        type: null,
        data: undefined,
      },
      toasts: [],
      isLoading: false,
      sidebarOpen: false,

      // Actions
      openModal: (type, data) => {
        set((state) => {
          state.modal.isOpen = true;
          state.modal.type = type;
          state.modal.data = data;
        });
      },

      closeModal: () => {
        set((state) => {
          state.modal.isOpen = false;
          state.modal.type = null;
          state.modal.data = undefined;
        });
      },

      showToast: (message, type, duration = 3000) => {
        const id = `toast-${Date.now()}`;
        set((state) => {
          state.toasts.push({ id, message, type, duration });
        });

        // 자동 제거
        setTimeout(() => {
          set((state) => {
            state.toasts = state.toasts.filter((t) => t.id !== id);
          });
        }, duration);
      },

      removeToast: (id) => {
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        });
      },

      setLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },
    })),
    {
      name: "UiStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors
export const useModal = () => useUiStore((state) => state.modal);
export const useToasts = () => useUiStore((state) => state.toasts);
export const useIsLoading = () => useUiStore((state) => state.isLoading);
export const useSidebarOpen = () => useUiStore((state) => state.sidebarOpen);
export const useUiActions = () =>
  useUiStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
    showToast: state.showToast,
    removeToast: state.removeToast,
    setLoading: state.setLoading,
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
  }));
```

### 4단계: Store Barrel Export

```typescript
// src/stores/index.ts
import { useStockBoxStore } from "./stock-box-store";
import { useSettingsStore } from "./settings-store";
import { useUIStore } from "./ui-store";
import { useToastStore } from "./toast-store";
import { useStockIndexStore } from "./stock-index-store";

/**
 * 모든 스토어를 초기화 (개발 중 디버깅용)
 */
export const resetAllStores = () => {
  useStockBoxStore.persist.clearStorage();
  useSettingsStore.persist.clearStorage();

  // 상태 리셋
  useStockBoxStore.setState({
    stocks: [],
    focusedStockId: null,
    maxZIndex: 0,
  });

  useSettingsStore.setState({
    theme: "light",
    language: "ko",
    colorScheme: "kr",
    currency: "USD",
  });

  useUIStore.setState({
    modal: { isOpen: false, type: null },
    toasts: [],
    isLoading: false,
    sidebarOpen: false,
  });
};

/**
 * 개발 환경에서 window에 디버그 함수 노출
 */
if (import.meta.env.DEV) {
  (window as any).resetStores = resetAllStores;
  (window as any).stores = {
    stockBox: useStockBoxStore,
    settings: useSettingsStore,
    ui: useUIStore,
    toast: useToastStore,
    stockIndex: useStockIndexStore,
  };
}

// Barrel exports
export * from "./stock-box-store";
export * from "./settings-store";
export * from "./ui-store";
export * from "./toast-store";
export * from "./stock-index-store";
```

## ✅ 완료 체크리스트

### 스토어 생성 (kebab-case 파일명)

- [ ] `src/stores/stock-box-store.ts` 생성
  - [ ] State 정의
  - [ ] Actions 구현
  - [ ] Persist 설정 (Base64 인코딩)
  - [ ] DevTools 연동
  - [ ] Selectors 정의
- [ ] `src/stores/settings-store.ts` 생성
  - [ ] State 정의
  - [ ] Actions 구현
  - [ ] Persist 설정
  - [ ] 테마 DOM 업데이트 로직
- [ ] `src/stores/ui-store.ts` 생성
  - [ ] Modal 상태
  - [ ] Loading 상태
  - [ ] Sidebar 상태
- [ ] `src/stores/toast-store.ts` 생성
  - [ ] Toast 상태 및 Actions
- [ ] `src/stores/stock-index-store.ts` 생성
  - [ ] 주요 지수 상태 (S&P 500, NASDAQ 등)
- [ ] `src/stores/index.ts` 생성 (Barrel export)
  - [ ] resetAllStores 함수
  - [ ] 개발용 window 노출
  - [ ] export * from 모든 스토어

### 검증

- [ ] TypeScript 에러 없음
- [ ] DevTools 동작 확인
- [ ] Persist 동작 확인 (브라우저 새로고침)
- [ ] Base64 인코딩 확인 (LocalStorage)

## 💡 Best Practices

### 1. Selector 사용으로 리렌더링 최적화

```typescript
// ❌ 나쁜 예 (모든 상태 변경 시 리렌더링)
const { stocks, focusedStockId, maxZIndex } = useStockStore();

// ✅ 좋은 예 (필요한 것만 구독)
const stocks = useStocks();
const focusedStockId = useFocusedStockId();
```

### 2. Immer로 불변성 자동 관리

```typescript
// Immer 사용 시 mutate 가능
set((state) => {
  state.stocks.push(newStock); // OK
  state.focusedStockId = id; // OK
});
```

### 3. Actions는 순수 로직만

```typescript
// ✅ 좋은 예 (순수 로직)
addStock: (symbol: string, companyName: string) => {
  set(state => {
    // 상태 변경만
  });
}

// ❌ 나쁜 예 (API 호출 포함)
addStock: async (symbol: string) => {
  const data = await fetchStock(symbol); // Services 영역
  set(state => { ... });
}
```

### 4. 개발 환경에서만 DevTools

```typescript
devtools(..., {
  name: 'StoreName',
  enabled: import.meta.env.DEV, // 프로덕션에서는 비활성화
})
```

## 🤝 다음 에이전트에게 전달

State 작업 완료 후:

```
✅ State 작업 완료

생성된 결과물:
- Stock Store (주식 박스 상태)
- Settings Store (설정)
- UI Store (모달, 토스트)
- Persist + DevTools 설정 완료

다음 에이전트: Agent 5 (Components)
- Services 에이전트 완료 대기
- "AGENT_COMPONENTS.md를 읽고 컴포넌트 개발을 시작해주세요"
```

---

**담당**: 전역 상태 관리  
**의존성**: Architect  
**다음 에이전트**: Components (Services 완료 후)
