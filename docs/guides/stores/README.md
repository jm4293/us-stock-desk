# Zustand Store 완전 가이드

## 개요

이 프로젝트는 4개의 **Zustand 스토어**를 사용하여 전역 상태를 관리합니다. 각 스토어는 특정 도메인의 상태를 담당하며, **Immer 미들웨어**로 불변성을 자동 관리하고, **DevTools**로 개발 중 디버깅을 지원합니다.

### 핵심 특징

- **Immer 미들웨어**: Draft 객체를 통해 직관적인 상태 수정
- **Persist 미들웨어**: Base64 인코딩으로 LocalStorage에 상태 저장
- **DevTools 미들웨어**: Redux DevTools로 시간 여행 디버깅
- **Selector 패턴**: 필요한 상태/액션만 선택적 사용으로 성능 최적화

---

## Store 목록

| Store                  | 설명                       | Persist | 책임                                       |
| ---------------------- | -------------------------- | ------- | ------------------------------------------ |
| **useStockBoxStore**   | 사용자 추가 주식 박스 관리 | ✅ Yes  | 주식 데이터 레이아웃, 드래그 위치, z-index |
| **useSettingsStore**   | 전역 설정                  | ✅ Yes  | 테마, 언어, 화면 표시 설정                 |
| **useUIStore**         | UI 상태                    | ❌ No   | 모달 열기/닫기, 로딩 상태                  |
| **useToastStore**      | 토스트 알림                | ❌ No   | 임시 알림 메시지 관리                      |
| **useStockIndexStore** | 지수/환율 박스 레이아웃    | ✅ Yes  | DJI, S&P500, NASDAQ 위치 및 크기           |

---

## 카테고리별 분류

### 레이아웃 관리 (Persist)

```
useStockBoxStore       → 사용자 추가 주식 박스
useStockIndexStore     → 지수/환율 박스 (고정)
```

### 설정 관리 (Persist)

```
useSettingsStore       → 테마, 언어, 표시 옵션
```

### 일시적 상태 (Non-Persist)

```
useUIStore             → 모달 UI 상태
useToastStore          → 알림 메시지 (자동 소멸)
```

---

## 사용 패턴

### 1. 기본 사용법 (Hook으로 전체 상태 구독)

```tsx
import { useStockBoxStore } from "@/stores";

export const StockBoxContainer = () => {
  const stocks = useStockBoxStore((state) => state.stocks);
  const addStock = useStockBoxStore((state) => state.addStock);

  return (
    <div>
      {stocks.map((stock) => (
        <div key={stock.id}>{stock.symbol}</div>
      ))}
      <button onClick={() => addStock("AAPL", "Apple Inc")}>Add Stock</button>
    </div>
  );
};
```

### 2. Selector 패턴 (성능 최적화)

```tsx
import { useStockBoxStore, selectStocks, selectAddStock } from "@/stores";

export const StockList = () => {
  // 필요한 상태만 선택 → 재렌더링 최소화
  const stocks = useStockBoxStore(selectStocks);
  const addStock = useStockBoxStore(selectAddStock);

  return (
    // JSX
  );
};
```

### 3. 직접 상태 접근 (컴포넌트 외부)

```tsx
import { useStockBoxStore } from "@/stores";

// 현재 상태 읽기
const currentStocks = useStockBoxStore.getState().stocks;

// 상태 직접 수정
useStockBoxStore.setState({
  focusedStockId: "some-id",
});
```

### 4. Persist 데이터 관리

```tsx
import { useStockBoxStore } from "@/stores";

// LocalStorage에서 복구
useStockBoxStore.persist.rehydrate();

// LocalStorage 초기화
useStockBoxStore.persist.clearStorage();

// 현재 상태를 Persist에 저장
useStockBoxStore.persist.setHasHydrated(true);
```

---

## 미들웨어 스택

각 스토어는 다음 미들웨어를 적용합니다:

```typescript
create<Store>()(
  devtools(
    // 4층: Redux DevTools
    persist(
      // 3층: LocalStorage 저장
      immer((set) => ({
        // 2층: 불변성 자동 관리
        // 1층: 비즈니스 로직
      }))
    )
  )
);
```

### 각 미들웨어의 역할

**Immer**: Draft 객체로 상태 수정

```tsx
set((state) => {
  state.stocks.push(newStock); // 직관적인 배열 수정
  state.maxZIndex += 1; // 직관적인 값 수정
});
```

**Persist**: LocalStorage에 자동 저장

```typescript
persist({
  name: "stockdesk_stocks_v2", // LocalStorage 키
  version: 2, // 마이그레이션 버전
  partialize: (state) => ({
    // 저장할 상태만 선택
    stocks: state.stocks,
    maxZIndex: state.maxZIndex,
  }),
  storage: {
    // Base64 암호화 저장
    getItem: (name) => atob(localStorage.getItem(name)),
    setItem: (name, value) => localStorage.setItem(name, btoa(JSON.stringify(value))),
  },
});
```

**DevTools**: 시간 여행 디버깅

```typescript
devtools({
  name: "StockStore",
  enabled: import.meta.env.DEV, // 개발 환경에서만 활성화
});
```

---

## Persist 전략

### Base64 인코딩

모든 persist 스토어는 **Base64 인코딩**으로 LocalStorage에 저장됩니다:

```typescript
// 저장 시
const encoded = btoa(JSON.stringify(value));
localStorage.setItem("stockdesk_stocks_v2", encoded);

// 복구 시
const decoded = atob(localStorage.getItem("stockdesk_stocks_v2"));
const parsed = JSON.parse(decoded);
```

### 버전 관리

마이그레이션이 필요한 경우 `version` 속성을 증가시킵니다:

```typescript
persist({
  name: "stockdesk_stocks_v2",
  version: 2, // 이전 버전에서 업그레이드 시 마이그레이션 함수 추가
  migrate: (persistedState, version) => {
    if (version === 1) {
      return { ...persistedState /* 변환 로직 */ };
    }
    return persistedState;
  },
});
```

---

## 개발 팁

### DevTools 브라우저 확장 설치

```bash
# Chrome
https://chrome.google.com/webstore/detail/redux-devtools/lmjabglucaajldapdjedljtemfjcmbnf
```

### 개발 중 스토어 초기화

```javascript
// 개발 환경에서만 window에 노출
// 브라우저 콘솔에서 실행
window.resetStores(); // 모든 스토어 초기화
window.stores.stock; // Stock Store 접근
window.stores.settings; // Settings Store 접근
window.stores.ui; // UI Store 접근
```

### 성능 프로파일링

```tsx
// Selector를 사용하여 필요한 상태만 선택
// → 재렌더링 횟수 최소화
const stocks = useStockBoxStore(selectStocks);  // 필요한 상태만

// vs
const { stocks, addStock, removeStock } = useStockBoxStore();  // 전체 구독
```

---

## 주의사항

### 1. Persist 스토어는 "동기" 복구

```tsx
// ❌ 잘못된 사용
const App = () => {
  const stocks = useStockBoxStore((state) => state.stocks);
  // 마운트 초기에 stocks는 빈 배열일 수 있음
};

// ✅ 올바른 사용
const App = () => {
  const stocks = useStockBoxStore((state) => state.stocks);
  const hydrated = useStockBoxStore((state) => state._hydrated);

  if (!hydrated) return <Loading />;
  return <StockList stocks={stocks} />;
};
```

### 2. 성능: 불필요한 재렌더링 방지

```tsx
// ❌ 나쁜 예: 전체 상태 구독
const MyComponent = () => {
  const { stocks, settings, ui } = useStockBoxStore();
  // stocks 변경 시에만 필요하지만, settings 변경 시에도 재렌더링됨
};

// ✅ 좋은 예: 필요한 상태만 선택
const MyComponent = () => {
  const stocks = useStockBoxStore(selectStocks);  // stocks만 구독
  // stocks 변경 시에만 재렌더링
};
```

### 3. 순환 참조 방지

```tsx
// ❌ 위험: 다른 스토어 액션에서 스토어 호출
useStockBoxStore.getState().addStock(...);  // stock-box-store에서 settings 호출

// ✅ 안전: 필요시 Hook으로 분리
// → Custom Hook에서 여러 스토어 조합
const useAddStockWithSettings = () => {
  const addStock = useStockBoxStore((state) => state.addStock);
  const currency = useSettingsStore((state) => state.currency);

  return (symbol: string) => {
    // 두 상태를 조합하여 사용
  };
};
```

---

## 다음 단계

각 스토어의 상세 가이드를 참조하세요:

1. **[stockBoxStore.md](./stockBoxStore.md)** - 사용자 추가 주식 박스 관리
2. **[settingsStore.md](./settingsStore.md)** - 전역 설정 (테마, 언어)
3. **[uiStore.md](./uiStore.md)** - UI 상태 (모달 제어)
4. **[toastStore.md](./toastStore.md)** - 알림 메시지 관리
5. **[stockIndexStore.md](./stockIndexStore.md)** - 지수/환율 박스 레이아웃

---

## 참고 자료

- [Zustand 공식 문서](https://github.com/pmndrs/zustand)
- [Immer 미들웨어](https://github.com/pmndrs/zustand/blob/main/docs/guides/immer-middleware.md)
- [Persist 미들웨어](https://github.com/pmndrs/zustand/blob/main/docs/guides/persist-middleware.md)
- [Redux DevTools 통합](https://github.com/pmndrs/zustand/blob/main/docs/guides/devtools.md)
