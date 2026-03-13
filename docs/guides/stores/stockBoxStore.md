# stockBoxStore Store

## 개요

**useStockBoxStore**는 사용자가 검색 후 추가한 주식 박스들의 상태를 관리합니다. 각 주식의 위치, 크기, z-index (레이어 순서)를 관리하며, LocalStorage에 자동으로 저장됩니다.

- **책임**: 주식 박스 CRUD, 드래그 위치, z-index 관리
- **Persist**: ✅ Yes (LocalStorage에 자동 저장)
- **접근 키**: `stockdesk_stocks_v2`

---

## 상태 구조

### State 인터페이스

```typescript
interface StockBox {
  id: string; // UUID (고유 식별자)
  symbol: string; // "AAPL", "MSFT" (대문자)
  companyName: string; // "Apple Inc"
  position: Position; // { x: 100, y: 200 }
  size: Size; // { width: 300, height: 300 }
  zIndex: number; // 레이어 순서 (높을수록 위)
  created: number; // 생성 시간 (Date.now())
  updated: number; // 마지막 수정 시간
}

interface StockState {
  stocks: StockBox[]; // 주식 박스 배열
  focusedStockId: string | null; // 현재 선택된 박스 ID
  maxZIndex: number; // 새 박스의 다음 z-index 값
}
```

### 초기값

```typescript
const DEFAULT_STOCKS = {
  stocks: [], // 빈 배열에서 시작
  focusedStockId: null, // 선택된 박스 없음
  maxZIndex: 0, // 첫 번째 박스는 z-index=1
};
```

---

## Actions

### addStock(symbol, companyName)

새 주식 박스를 추가합니다.

**파라미터**:

- `symbol: string` - 주식 코드 (예: "AAPL")
- `companyName: string` - 회사명 (예: "Apple Inc")

**동작**:

1. UUID 생성 (`crypto.randomUUID()`)
2. 위치 계산: `{ x: 100 + offset, y: 100 + offset }` (offset = (zIndex - 1) \* 30)
3. 기본 크기 설정: 300x300px
4. maxZIndex 증가
5. focusedStockId 자동 설정 (새로 추가된 박스로 포커스)

**코드**:

```typescript
addStock: (symbol: string, companyName: string) => {
  set((state) => {
    const newZIndex = state.maxZIndex + 1;
    const offset = (newZIndex - 1) * 30;
    const newStock: StockBox = {
      id: crypto.randomUUID(),
      symbol: symbol.toUpperCase(),
      companyName,
      position: { x: 100 + offset, y: 100 + offset },
      size: { width: 300, height: 300 },
      zIndex: newZIndex,
      created: Date.now(),
      updated: Date.now(),
    };
    state.stocks.push(newStock);
    state.maxZIndex = newZIndex;
    state.focusedStockId = newStock.id;
  });
};
```

**사용 예시**:

```tsx
const { addStock } = useStockBoxStore();
addStock("AAPL", "Apple Inc"); // 새 주식 박스 추가
```

---

### removeStock(id)

주식 박스를 제거합니다.

**파라미터**:

- `id: string` - 제거할 박스의 ID

**동작**:

1. ID로 박스 찾아 배열에서 제거
2. 제거된 박스가 포커스되었으면 focusedStockId를 null로 설정

**사용 예시**:

```tsx
const { removeStock } = useStockBoxStore();
removeStock("550e8400-e29b-41d4-a716-446655440000");
```

---

### updatePosition(id, position)

박스의 위치를 업데이트합니다 (드래그 후 호출).

**파라미터**:

- `id: string` - 박스 ID
- `position: Position` - `{ x: number, y: number }`

**동작**:

1. ID로 박스 찾기
2. position 업데이트
3. updated 타임스탬프 갱신

**사용 예시**:

```tsx
const { updatePosition } = useStockBoxStore();
updatePosition("box-id", { x: 200, y: 300 });
```

---

### updateSize(id, size)

박스의 크기를 업데이트합니다 (리사이징 후 호출).

**파라미터**:

- `id: string` - 박스 ID
- `size: Size` - `{ width: number, height: number }`

**동작**:

1. ID로 박스 찾기
2. size 업데이트
3. updated 타임스탬프 갱신

**사용 예시**:

```tsx
const { updateSize } = useStockBoxStore();
updateSize("box-id", { width: 400, height: 400 });
```

---

### setFocused(id | null)

현재 포커스된 박스를 변경합니다.

**파라미터**:

- `id: string | null` - 박스 ID 또는 null (포커스 해제)

**사용 예시**:

```tsx
const { setFocused } = useStockBoxStore();
setFocused("box-id"); // 박스에 포커스
setFocused(null); // 포커스 해제
```

---

### bringToFront(id)

박스를 최상단으로 가져옵니다 (클릭 시 호출).

**파라미터**:

- `id: string` - 박스 ID

**동작**:

1. maxZIndex 증가
2. 박스의 zIndex를 새로운 maxZIndex로 설정
3. focusedStockId를 해당 ID로 설정

**사용 예시**:

```tsx
const { bringToFront } = useStockBoxStore();
bringToFront("box-id"); // 박스를 맨 위로 이동
```

---

### reorderStocks(fromIndex, toIndex)

배열 내에서 박스 순서를 변경합니다 (드래그-드롭 재정렬).

**파라미터**:

- `fromIndex: number` - 현재 인덱스
- `toIndex: number` - 이동할 인덱스

**사용 예시**:

```tsx
const { reorderStocks } = useStockBoxStore();
reorderStocks(0, 2); // 첫 번째 박스를 3번째 위치로 이동
```

---

## 사용 예시

### 1. 새 주식 추가

```tsx
import { useStockBoxStore } from "@/stores";

export const SearchModal = () => {
  const addStock = useStockBoxStore((state) => state.addStock);

  const handleAddStock = (symbol: string, companyName: string) => {
    addStock(symbol, companyName);
    // → 새 박스가 (100, 100)에 생성되고 자동으로 포커스됨
  };

  return <button onClick={() => handleAddStock("AAPL", "Apple Inc")}>Add Stock</button>;
};
```

### 2. 드래그 위치 저장

```tsx
import { useStockBoxStore } from "@/stores";
import { Rnd } from "react-rnd";

export const StockBox = ({ stock }) => {
  const updatePosition = useStockBoxStore((state) => state.updatePosition);

  const handleDragStop = (e, d) => {
    updatePosition(stock.id, { x: d.x, y: d.y });
  };

  return (
    <Rnd position={stock.position} onDragStop={handleDragStop}>
      {/* 박스 콘텐츠 */}
    </Rnd>
  );
};
```

### 3. 클릭 시 앞으로 가져오기

```tsx
export const StockBox = ({ stock }) => {
  const bringToFront = useStockBoxStore((state) => state.bringToFront);

  return (
    <div onClick={() => bringToFront(stock.id)} style={{ zIndex: stock.zIndex }}>
      {/* 박스 콘텐츠 */}
    </div>
  );
};
```

### 4. 모든 박스 조회

```tsx
import { selectStocks, useStockBoxStore } from "@/stores";

export const StockContainer = () => {
  const stocks = useStockBoxStore(selectStocks);

  return (
    <div>
      {stocks.map((stock) => (
        <StockBox key={stock.id} stock={stock} />
      ))}
    </div>
  );
};
```

### 5. 포커스된 박스만 강조표시

```tsx
export const StockBox = ({ stock }) => {
  const focusedStockId = useStockBoxStore((state) => state.focusedStockId);
  const isFocused = focusedStockId === stock.id;

  return (
    <div
      className={cn(
        "glass rounded-xl p-4 transition",
        isFocused && "z-50 shadow-2xl ring-2 ring-blue-500"
      )}
    >
      {/* 박스 콘텐츠 */}
    </div>
  );
};
```

---

## 내부 동작 원리

### Z-Index 관리 (Stacking Context)

새 박스가 추가될 때마다 maxZIndex가 증가합니다:

```
초기: stocks=[], maxZIndex=0

addStock("AAPL", "Apple Inc")
→ stocks[0] = { id: "uuid-1", zIndex: 1, ... }
→ maxZIndex = 1

addStock("MSFT", "Microsoft Corp")
→ stocks[1] = { id: "uuid-2", zIndex: 2, ... }
→ maxZIndex = 2

bringToFront("uuid-1")  // AAPL을 최상단으로
→ stocks[0] = { id: "uuid-1", zIndex: 3, ... }
→ maxZIndex = 3

결과: MSFT (z=2) → AAPL (z=3) 순서대로 표시
```

**장점**: 박스 삭제 후에도 maxZIndex는 감소하지 않아 항상 새로운 오프셋을 보장합니다.

### 위치 오프셋 계산

```typescript
const offset = (newZIndex - 1) * 30;
const position = { x: 100 + offset, y: 100 + offset };
```

새 박스가 추가될 때마다 30px씩 우측 하단으로 이동:

```
첫 번째: (100, 100)
두 번째: (130, 130)
세 번째: (160, 160)
```

이렇게 하면 여러 박스를 추가해도 모두 보입니다.

---

## Persist 전략

### 저장되는 상태

```typescript
partialize: (state) => ({
  stocks: state.stocks, // 모든 박스 데이터 저장
  maxZIndex: state.maxZIndex, // z-index 상태 보존
  // focusedStockId는 저장하지 않음 (페이지 새로고침 시 초기화)
});
```

### 저장 위치

- **LocalStorage 키**: `stockdesk_stocks_v2`
- **인코딩**: Base64
- **버전**: 2 (마이그레이션 히스토리 지원)

### 복구 흐름

```
페이지 새로고침
↓
useStockBoxStore 초기화
↓
Persist 미들웨어가 LocalStorage에서 데이터 로드
↓
Base64 디코딩 → JSON 파싱
↓
상태 복구 완료
```

---

## 주의사항

### 1. Symbol은 대문자로 저장

```typescript
// ✅ 자동으로 대문자 변환
addStock("aapl", "Apple Inc");
// → symbol: "AAPL"

// ✅ 이미 대문자면 그대로
addStock("AAPL", "Apple Inc");
// → symbol: "AAPL"
```

### 2. focusedStockId는 persist하지 않음

```typescript
// ✅ 페이지 새로고침 후에는 focusedStockId = null
// → 마지막 포커스 상태가 유지되지 않으므로 의도적 설계

// ✅ 필요시 Custom Hook에서 처리
const useLastFocusedStock = () => {
  const stocks = useStockBoxStore((state) => state.stocks);
  return stocks.length > 0 ? stocks[0].id : null;
};
```

### 3. Updated 타임스탬프는 자동 갱신

```typescript
updatePosition(id, { x: 200, y: 300 });
// → 자동으로 updated = Date.now() 설정
// → 최근 수정 시간이 필요한 로직에서 사용 가능
```

### 4. 성능: 대량 박스 추가

```typescript
// ❌ 나쁜 예: 루프 내에서 개별 호출
for (const symbol of symbols) {
  addStock(symbol, names[symbol]); // 상태 5번 변경
}

// ✅ 좋은 예: 상태를 일괄 수정
useStockBoxStore.setState((state) => {
  const newStocks = symbols.map((symbol) => ({
    id: crypto.randomUUID(),
    symbol: symbol.toUpperCase(),
    // ... 나머지 필드
  }));
  state.stocks.push(...newStocks);
});
```

---

## 관련 Selector

편의용으로 제공되는 Selector들:

```typescript
// State Selectors
export const selectStocks = (state: StockStore) => state.stocks;
export const selectFocusedStockId = (state: StockStore) => state.focusedStockId;
export const selectMaxZIndex = (state: StockStore) => state.maxZIndex;

// Action Selectors
export const selectAddStock = (state: StockStore) => state.addStock;
export const selectRemoveStock = (state: StockStore) => state.removeStock;
export const selectUpdatePosition = (state: StockStore) => state.updatePosition;
export const selectUpdateSize = (state: StockStore) => state.updateSize;
export const selectSetFocused = (state: StockStore) => state.setFocused;
export const selectBringToFront = (state: StockStore) => state.bringToFront;
export const selectReorderStocks = (state: StockStore) => state.reorderStocks;
```

**사용**:

```tsx
const stocks = useStockBoxStore(selectStocks);
const addStock = useStockBoxStore(selectAddStock);
```

---

## 디버깅 팁

### 개발 중 모든 박스 확인

```javascript
// 브라우저 콘솔
window.stores.stock.getState().stocks;
// → 모든 StockBox 객체 배열 출력
```

### LocalStorage 값 확인

```javascript
// 브라우저 콘솔
const raw = localStorage.getItem("stockdesk_stocks_v2");
const decoded = atob(raw);
JSON.parse(decoded);
// → { stocks: [...], maxZIndex: N }
```

### 상태 초기화

```javascript
// 개발 환경에서
window.resetStores();
// 또는
useStockBoxStore.persist.clearStorage();
useStockBoxStore.setState({
  stocks: [],
  focusedStockId: null,
  maxZIndex: 0,
});
```

---

## 다음 단계

- [settingsStore.md](./settingsStore.md) - 전역 설정 관리
- [uiStore.md](./uiStore.md) - 모달 UI 상태
- [README.md](./README.md) - Zustand Store 전체 가이드
