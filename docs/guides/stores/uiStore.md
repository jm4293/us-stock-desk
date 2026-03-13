# uiStore Store

## 개요

**useUIStore**는 UI 레이어의 일시적 상태를 관리합니다. 모달 열기/닫기, 로딩 상태 등을 제어하며, **Persist하지 않습니다** (페이지 새로고침 시 초기값으로 리셋).

- **책임**: 모달, 로딩 상태 등 임시 UI 상태
- **Persist**: ❌ No (메모리에만 저장)
- **용도**: 컴포넌트 간 UI 제어 신호

---

## 상태 구조

### State 인터페이스

```typescript
interface UIState {
  isSearchOpen: boolean; // 검색 모달 열림 여부
  isSettingsOpen: boolean; // 설정 모달 열림 여부
  isLoading: boolean; // 전역 로딩 상태
}
```

### 초기값

```typescript
{
  isSearchOpen: false,            // 모달 닫힘
  isSettingsOpen: false,          // 모달 닫힘
  isLoading: false,               // 로딩 아님
}
```

---

## Actions

### openSearch() / closeSearch()

검색 모달을 열고 닫습니다.

**코드**:

```typescript
openSearch: () => {
  set((state) => {
    state.isSearchOpen = true;
  });
},

closeSearch: () => {
  set((state) => {
    state.isSearchOpen = false;
  });
},
```

**사용 예시**:

```tsx
import { useUIStore } from "@/stores";

export const Header = () => {
  const { openSearch } = useUIStore();

  return <button onClick={openSearch}>🔍 검색</button>;
};

export const SearchModal = () => {
  const { isSearchOpen, closeSearch } = useUIStore();

  if (!isSearchOpen) return null;

  return (
    <div className="modal">
      <h2>종목 검색</h2>
      {/* 검색 UI */}
      <button onClick={closeSearch}>닫기</button>
    </div>
  );
};
```

---

### openSettings() / closeSettings()

설정 모달을 열고 닫습니다.

**코드**:

```typescript
openSettings: () => {
  set((state) => {
    state.isSettingsOpen = true;
  });
},

closeSettings: () => {
  set((state) => {
    state.isSettingsOpen = false;
  });
},
```

**사용 예시**:

```tsx
export const Header = () => {
  const { openSettings } = useUIStore();

  return <button onClick={openSettings}>⚙️ 설정</button>;
};

export const SettingsModal = () => {
  const { isSettingsOpen, closeSettings } = useUIStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="modal">
      <h2>설정</h2>
      {/* 설정 UI */}
      <button onClick={closeSettings}>닫기</button>
    </div>
  );
};
```

---

### setLoading(loading)

전역 로딩 상태를 변경합니다.

**파라미터**:

- `loading: boolean` - true 시 로딩 중

**코드**:

```typescript
setLoading: (loading: boolean) => {
  set((state) => {
    state.isLoading = loading;
  });
},
```

**사용 예시**:

```tsx
export const StockList = () => {
  const { setLoading } = useUIStore();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStocks();
      // 데이터 처리
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return <div>{/* 리스트 표시 */}</div>;
};

// 로딩 스피너
export const LoadingOverlay = () => {
  const isLoading = useUIStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="spinner" />
    </div>
  );
};
```

---

## 사용 예시

### 1. 기본 모달 제어

```tsx
import { useUIStore } from "@/stores";

export const App = () => {
  const { isSearchOpen, isSettingsOpen } = useUIStore();

  return (
    <>
      <Header />
      {isSearchOpen && <SearchModal />}
      {isSettingsOpen && <SettingsModal />}
      <MainContent />
    </>
  );
};
```

### 2. 모달 열기 (Keyboard 단축키)

```tsx
export const App = () => {
  const { openSearch, closeSearch, isSearchOpen } = useUIStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSearchOpen]);

  return <>{/* UI */}</>;
};
```

### 3. 로딩 상태 관리

```tsx
export const StockBoxContainer = () => {
  const stocks = useStockBoxStore((state) => state.stocks);
  const { setLoading } = useUIStore();

  const handleAddStock = async (symbol: string) => {
    try {
      setLoading(true);
      const companyName = await apiService.getCompanyName(symbol);
      useStockBoxStore.getState().addStock(symbol, companyName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {stocks.map((stock) => (
        <StockBox key={stock.id} stock={stock} />
      ))}
    </div>
  );
};
```

### 4. Selector로 성능 최적화

```tsx
import { selectIsLoading, selectIsSearchOpen, useUIStore } from "@/stores";

// ✅ 필요한 상태만 구독 → 불필요한 재렌더링 방지
export const SearchButton = () => {
  const { openSearch } = useUIStore();

  return <button onClick={openSearch}>검색</button>;
};

export const LoadingIndicator = () => {
  const isLoading = useUIStore(selectIsLoading);

  if (!isLoading) return null;
  return <div className="spinner" />;
};
```

### 5. 모달 스택 관리

```tsx
// 여러 모달이 동시에 열릴 수 있는 경우
export const ModalStack = () => {
  const { isSearchOpen, isSettingsOpen } = useUIStore();

  return (
    <>
      {/* 모달은 아래 순서대로 렌더링됨 */}
      {/* SettingsModal이 SearchModal 위에 표시 */}
      {isSearchOpen && <SearchModal />}
      {isSettingsOpen && <SettingsModal />}
    </>
  );
};
```

### 6. API 호출 시 로딩 표시

```tsx
import { useUIStore } from "@/stores";

export const useStockDataWithLoading = (symbol: string) => {
  const { setLoading } = useUIStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiService.getStockData(symbol);
        setData(result);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  return { data };
};
```

---

## 미들웨어 구성

UIStore는 **Persist하지 않습니다**. 따라서 더 간단한 미들웨어 스택을 사용합니다:

```typescript
create<UIStore>()(
  devtools(
    // Redux DevTools 통합
    immer((set) => ({
      // Immer 미들웨어
      // State & Actions
    }))
  )
);
// persist 미들웨어는 없음 → 메모리만 사용
```

### 장점

- 빠른 성능 (LocalStorage I/O 없음)
- 페이지 새로고침 시 모달 자동 닫힘
- 불필요한 로컬스토리지 오염 방지

---

## 주의사항

### 1. 상태는 메모리에만 저장

```tsx
// ✅ 페이지 새로고침 시 모달이 닫힘
// 사용자가 설정 모달을 연 후 새로고침하면 자동으로 닫힘
const { isSettingsOpen } = useUIStore();
// isSettingsOpen = false (항상)
```

### 2. 페이지 네비게이션 시 상태 초기화

```tsx
// ✅ 라우트 변경 시 모든 모달이 닫혀야 함
import { useNavigate } from "react-router-dom";

const handleNavigate = (path: string) => {
  useUIStore.setState({
    isSearchOpen: false,
    isSettingsOpen: false,
  });
  navigate(path);
};
```

### 3. 동시에 두 모달이 열리면 안 되는 경우

```tsx
// ❌ 현재 구현에서는 두 모달을 동시에 열 수 있음
openSearch();
openSettings(); // 둘 다 true

// ✅ 필요하면 한 번에 하나만 열도록 구현
const useUIStoreExclusive = () => {
  const ui = useUIStore();

  return {
    ...ui,
    openSearch: () => {
      useUIStore.setState({
        isSearchOpen: true,
        isSettingsOpen: false,
      });
    },
    openSettings: () => {
      useUIStore.setState({
        isSearchOpen: false,
        isSettingsOpen: true,
      });
    },
  };
};
```

### 4. 모달 닫기는 여러 곳에서 트리거될 수 있음

```tsx
// ✅ ESC 키, 배경 클릭, 버튼 클릭 등 여러 곳에서 닫기 가능
export const SearchModal = () => {
  const { closeSearch } = useUIStore();

  // ESC 키
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // 배경 클릭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeSearch();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* 검색 UI */}
        <button onClick={closeSearch}>닫기</button>
      </div>
    </div>
  );
};
```

---

## Selector 패턴

```typescript
// State Selectors
export const selectIsSearchOpen = (state: UIStore) => state.isSearchOpen;
export const selectIsSettingsOpen = (state: UIStore) => state.isSettingsOpen;
export const selectIsLoading = (state: UIStore) => state.isLoading;

// Action Selectors
export const selectOpenSearch = (state: UIStore) => state.openSearch;
export const selectCloseSearch = (state: UIStore) => state.closeSearch;
export const selectOpenSettings = (state: UIStore) => state.openSettings;
export const selectCloseSettings = (state: UIStore) => state.closeSettings;
export const selectSetLoading = (state: UIStore) => state.setLoading;
```

**사용**:

```tsx
const isLoading = useUIStore(selectIsLoading);
```

---

## 개발 팁

### DevTools에서 상태 변경 시뮬레이션

```javascript
// 브라우저 콘솔
useUIStore.setState({ isSearchOpen: true });
useUIStore.setState({ isLoading: true });
```

### 현재 상태 확인

```javascript
window.stores.ui.getState();
// → { isSearchOpen: false, isSettingsOpen: false, isLoading: false }
```

### 모든 UI 상태 초기화

```javascript
window.resetStores();
```

---

## vs settingsStore

### 차이점

| 항목        | uiStore                 | settingsStore               |
| ----------- | ----------------------- | --------------------------- |
| **목적**    | 임시 UI 상태            | 영구 애플리케이션 설정      |
| **Persist** | ❌ No                   | ✅ Yes                      |
| **수명**    | 페이지 새로고침 시 리셋 | 사용자가 변경할 때까지 유지 |
| **예시**    | 모달 열기, 로딩         | 테마, 언어, 통화            |

---

## 다음 단계

- [toastStore.md](./toastStore.md) - 알림 메시지 관리
- [settingsStore.md](./settingsStore.md) - 영구 설정
- [README.md](./README.md) - Zustand Store 전체 가이드
