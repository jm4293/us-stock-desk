# stockIndexStore Store

## 개요

**useStockIndexStore**는 시장 지수(Dow Jones, S&P 500, NASDAQ) 및 USD/KRW 환율 박스의 위치와 크기를 관리합니다. 이들은 고정된 3개의 지수 박스 + 1개의 환율 박스로 구성되며, 드래그/리사이징 시 위치를 저장합니다.

- **책임**: 지수 및 환율 박스의 레이아웃 (위치, 크기, z-index)
- **Persist**: ✅ Yes (LocalStorage에 자동 저장)
- **접근 키**: `stockdesk_index_layout_v1`
- **특징**: 고정 박스 (stockBoxStore와 달리 추가/삭제 불가)

---

## 상태 구조

### State 인터페이스

```typescript
interface IndexBoxData {
  id: IndexSymbol; // "^DJI" | "^GSPC" | "^IXIC"
  label: string; // "Dow Jones", "S&P 500", "NASDAQ"
  position: Position; // { x: number, y: number }
  size: Size; // { width: number, height: number }
  zIndex: number; // 레이어 순서
}

interface ExchangeRateBoxLayout {
  position: Position;
  size: Size;
  zIndex: number;
}

interface IndexState {
  indices: IndexBoxData[]; // 3개 지수 박스
  exchangeRateBox: ExchangeRateBoxLayout; // 환율 박스
  maxZIndex: number; // 다음 z-index 값
}
```

### IndexSymbol 타입

```typescript
type IndexSymbol = "^DJI" | "^GSPC" | "^IXIC";

// DJI  = Dow Jones Industrial Average
// GSPC = S&P 500
// IXIC = NASDAQ Composite
```

### 초기값 (기본 레이아웃)

```typescript
const DEFAULT_INDICES: IndexBoxData[] = [
  {
    id: "^DJI",
    label: "Dow Jones",
    position: { x: 20, y: 20 },
    size: { width: 300, height: 200 },
    zIndex: 1,
  },
  {
    id: "^GSPC",
    label: "S&P 500",
    position: { x: 340, y: 20 },
    size: { width: 300, height: 200 },
    zIndex: 1,
  },
  {
    id: "^IXIC",
    label: "NASDAQ",
    position: { x: 660, y: 20 },
    size: { width: 300, height: 200 },
    zIndex: 1,
  },
];

const DEFAULT_EXCHANGE_RATE_BOX: ExchangeRateBoxLayout = {
  position: { x: 980, y: 20 },
  size: { width: 300, height: 200 },
  zIndex: 1,
};
```

---

## Actions

### updatePosition(id, position)

지수 박스의 위치를 업데이트합니다 (드래그 후 호출).

**파라미터**:

- `id: IndexSymbol` - "^DJI" | "^GSPC" | "^IXIC"
- `position: Position` - `{ x: number, y: number }`

**동작**:

1. ID로 지수 박스 찾기
2. position 업데이트
3. 상태 저장 (Persist)

**코드**:

```typescript
updatePosition: (id: IndexSymbol, position: Position) => {
  set((state) => {
    const idx = state.indices.find((i) => i.id === id);
    if (idx) idx.position = position;
  });
};
```

**사용 예시**:

```tsx
import { useStockIndexStore } from "@/stores";

export const IndexBox = ({ index }) => {
  const { updatePosition } = useStockIndexStore();

  const handleDragStop = (e, d) => {
    updatePosition(index.id, { x: d.x, y: d.y });
  };

  return (
    <Rnd position={index.position} onDragStop={handleDragStop}>
      {/* 박스 콘텐츠 */}
    </Rnd>
  );
};
```

---

### updateSize(id, size)

지수 박스의 크기를 업데이트합니다 (리사이징 후 호출).

**파라미터**:

- `id: IndexSymbol`
- `size: Size` - `{ width: number, height: number }`

**사용 예시**:

```tsx
const { updateSize } = useStockIndexStore();

const handleResizeStop = (e, d, ref, delta, position) => {
  updateSize(index.id, {
    width: ref.offsetWidth,
    height: ref.offsetHeight,
  });
};
```

---

### bringToFront(id)

지수 박스를 최상단으로 가져옵니다 (클릭 시 호출).

**파라미터**:

- `id: IndexSymbol`

**동작**:

1. maxZIndex 증가
2. 박스의 zIndex를 새로운 maxZIndex로 설정
3. 상태 업데이트

**사용 예시**:

```tsx
const { bringToFront } = useStockIndexStore();

<div onClick={() => bringToFront(index.id)}>{/* 박스 콘텐츠 */}</div>;
```

---

### updateExchangeRatePosition(position)

환율 박스의 위치를 업데이트합니다.

**파라미터**:

- `position: Position`

**사용 예시**:

```tsx
const { updateExchangeRatePosition } = useStockIndexStore();

const handleDragStop = (e, d) => {
  updateExchangeRatePosition({ x: d.x, y: d.y });
};
```

---

### updateExchangeRateSize(size)

환율 박스의 크기를 업데이트합니다.

**파라미터**:

- `size: Size`

**사용 예시**:

```tsx
const { updateExchangeRateSize } = useStockIndexStore();

updateExchangeRateSize({ width: 350, height: 250 });
```

---

### bringExchangeRateToFront()

환율 박스를 최상단으로 가져옵니다.

**파라미터**: 없음

**사용 예시**:

```tsx
const { bringExchangeRateToFront } = useStockIndexStore();

<div onClick={() => bringExchangeRateToFront()}>{/* 환율 박스 콘텐츠 */}</div>;
```

---

## 사용 예시

### 1. 지수 박스 렌더링

```tsx
import { selectIndices, useStockIndexStore } from "@/stores";
import { Rnd } from "react-rnd";

export const IndexBoxContainer = () => {
  const indices = useStockIndexStore(selectIndices);
  const { updatePosition, updateSize, bringToFront } = useStockIndexStore();

  return (
    <div>
      {indices.map((index) => (
        <Rnd
          key={index.id}
          position={index.position}
          size={index.size}
          onDragStop={(e, d) => updatePosition(index.id, { x: d.x, y: d.y })}
          onResizeStop={(e, d, ref) => {
            updateSize(index.id, {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
          }}
          style={{ zIndex: index.zIndex }}
        >
          <div onClick={() => bringToFront(index.id)} className="glass h-full rounded-xl p-4">
            <h3>{index.label}</h3>
            <IndexChart symbol={index.id} />
          </div>
        </Rnd>
      ))}
    </div>
  );
};
```

### 2. 환율 박스 렌더링

```tsx
export const ExchangeRateBox = () => {
  const exchangeRateBox = useStockIndexStore((state) => state.exchangeRateBox);
  const { updateExchangeRatePosition, updateExchangeRateSize, bringExchangeRateToFront } =
    useStockIndexStore();

  return (
    <Rnd
      position={exchangeRateBox.position}
      size={exchangeRateBox.size}
      onDragStop={(e, d) => updateExchangeRatePosition({ x: d.x, y: d.y })}
      onResizeStop={(e, d, ref) => {
        updateExchangeRateSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
      style={{ zIndex: exchangeRateBox.zIndex }}
    >
      <div onClick={() => bringExchangeRateToFront()} className="glass h-full rounded-xl p-4">
        <h3>USD / KRW</h3>
        <ExchangeRateDisplay />
      </div>
    </Rnd>
  );
};
```

### 3. 모든 박스 함께 렌더링

```tsx
export const DashboardLayout = () => {
  const showIndexDJI = useSettingsStore((state) => state.showIndexDJI);
  const showIndexSP500 = useSettingsStore((state) => state.showIndexSP500);
  const showIndexNASDAQ = useSettingsStore((state) => state.showIndexNASDAQ);
  const showExchangeRate = useSettingsStore((state) => state.showExchangeRate);

  return (
    <>
      {showIndexDJI && <IndexBoxContainer filter={["^DJI"]} />}
      {showIndexSP500 && <IndexBoxContainer filter={["^GSPC"]} />}
      {showIndexNASDAQ && <IndexBoxContainer filter={["^IXIC"]} />}
      {showExchangeRate && <ExchangeRateBox />}
    </>
  );
};
```

### 4. z-index 관리

```tsx
// stockBoxStore와 stockIndexStore의 z-index가 독립적으로 관리됨
const Dashbboard = () => {
  const stocks = useStockBoxStore((state) => state.stocks);
  const indices = useStockIndexStore((state) => state.indices);

  // stockBoxStore의 maxZIndex: 100
  // stockIndexStore의 maxZIndex: 10
  // → 서로 겹쳐도 문제없음 (분리된 z-index 스택)

  return (
    <div>
      {stocks.map((stock) => (
        <StockBox key={stock.id} stock={stock} />
      ))}
      {indices.map((index) => (
        <IndexBox key={index.id} index={index} />
      ))}
    </div>
  );
};
```

---

## 지수 정보

### Dow Jones Industrial Average (^DJI)

```typescript
{
  id: "^DJI",
  label: "Dow Jones",
  // 30개 대형주 지수
  // NYSE에 상장된 기업들
}
```

### S&P 500 (^GSPC)

```typescript
{
  id: "^GSPC",
  label: "S&P 500",
  // 500개 중형주 이상 지수
  // 미국 시장 대표 지수
}
```

### NASDAQ Composite (^IXIC)

```typescript
{
  id: "^IXIC",
  label: "NASDAQ",
  // 기술주 중심 지수
  // 혁신 기업들 포함
}
```

---

## Persist 전략

### 저장되는 상태

```typescript
partialize: (state) => ({
  indices: state.indices, // 3개 지수 박스 레이아웃
  exchangeRateBox: state.exchangeRateBox, // 환율 박스 레이아웃
  maxZIndex: state.maxZIndex, // z-index 상태
});
```

### 저장 위치

- **LocalStorage 키**: `stockdesk_index_layout_v1`
- **인코딩**: Base64
- **버전**: 3

### 복구 흐름

```
페이지 새로고침
↓
useStockIndexStore 초기화 (DEFAULT_INDICES + DEFAULT_EXCHANGE_RATE_BOX)
↓
Persist 미들웨어가 LocalStorage에서 데이터 로드
↓
저장된 레이아웃이 있으면 덮어씀
↓
상태 복구 완료
```

---

## stockBoxStore와의 차이점

### stockBoxStore

```typescript
// 사용자가 추가한 주식 박스
// CRUD 가능 (추가, 삭제, 수정)
const { addStock, removeStock } = useStockBoxStore();

addStock("AAPL", "Apple Inc"); // ✅ 가능
removeStock("box-id"); // ✅ 가능
```

### stockIndexStore

```typescript
// 고정된 지수 및 환율 박스
// CRUD 불가능 (레이아웃 수정만)
const { updatePosition, updateSize } = useStockIndexStore();

updatePosition("^DJI", { x: 100, y: 100 }); // ✅ 가능
// 하지만 추가/삭제는 불가능 → 디자인상 3개 지수 + 1개 환율로 고정
```

---

## 주의사항

### 1. 지수 ID는 변경 불가

```typescript
// ❌ 지수 ID를 임의로 변경하면 안 됨
state.indices[0].id = "NEW_ID"; // 위험

// ✅ 정해진 ID만 사용
updatePosition("^DJI", position); // ✅
updatePosition("^GSPC", position); // ✅
updatePosition("^IXIC", position); // ✅
```

### 2. 환율 박스는 별도 메서드 필요

```typescript
// ❌ indices 배열에서 환율 찾기 (안 함)
const exchangeRateFromIndices = indices.find((i) => i.id === "EXCHANGE_RATE");

// ✅ 별도의 exchangeRateBox 상태 사용
const exchangeRateBox = useStockIndexStore((state) => state.exchangeRateBox);
```

### 3. Z-Index는 독립적

```typescript
// stockBoxStore와 stockIndexStore의 z-index가 별도로 관리됨
const stockMaxZ = useStockBoxStore((state) => state.maxZIndex); // 예: 100
const indexMaxZ = useStockIndexStore((state) => state.maxZIndex); // 예: 10

// → 겹침 현상 발생 가능 (해결: 페이지 레이아웃 구성에서 영역 분리)
```

### 4. 설정 모달에서 표시 옵션 연동

```typescript
// showIndexDJI, showIndexSP500 등은 settingsStore에 있음
// useStockIndexStore는 레이아웃만 관리

const { showIndexDJI } = useSettingsStore();
const indices = useStockIndexStore((state) => state.indices);

// 렌더링 조건: showIndexDJI && indices 모두 필요
if (showIndexDJI) {
  return <IndexBox index={indices.find(i => i.id === "^DJI")} />;
}
```

---

## Selector 패턴

```typescript
// State Selectors
export const selectIndices = (state: IndexStore) => state.indices;
export const selectExchangeRateBox = (state: IndexStore) => state.exchangeRateBox;
export const selectIndexMaxZIndex = (state: IndexStore) => state.maxZIndex;

// Action Selectors
export const selectIndexUpdatePosition = (state: IndexStore) => state.updatePosition;
export const selectIndexUpdateSize = (state: IndexStore) => state.updateSize;
export const selectIndexBringToFront = (state: IndexStore) => state.bringToFront;
export const selectUpdateExchangeRatePosition = (state: IndexStore) =>
  state.updateExchangeRatePosition;
export const selectUpdateExchangeRateSize = (state: IndexStore) => state.updateExchangeRateSize;
export const selectBringExchangeRateToFront = (state: IndexStore) => state.bringExchangeRateToFront;
```

**사용**:

```tsx
const indices = useStockIndexStore(selectIndices);
const updatePosition = useStockIndexStore(selectIndexUpdatePosition);
```

---

## 개발 팁

### 현재 레이아웃 확인

```javascript
// 브라우저 콘솔
window.stores.index = useStockIndexStore; // (index.ts에서 이미 노출됨)
window.stores.index.getState();
// → { indices: [...], exchangeRateBox: {...}, maxZIndex: N }
```

### 특정 지수 정보 조회

```javascript
const dji = useStockIndexStore.getState().indices.find((i) => i.id === "^DJI");
console.log(dji.position, dji.size);
```

### 환율 박스 위치 재설정

```javascript
useStockIndexStore.getState().updateExchangeRatePosition({ x: 0, y: 0 });
```

### 모든 박스 원점으로 리셋

```javascript
useStockIndexStore.setState({
  indices: DEFAULT_INDICES,
  exchangeRateBox: DEFAULT_EXCHANGE_RATE_BOX,
  maxZIndex: 1,
});
```

---

## 다음 단계

- [stockBoxStore.md](./stockBoxStore.md) - 사용자 추가 주식 박스
- [settingsStore.md](./settingsStore.md) - 전역 설정
- [README.md](./README.md) - Zustand Store 전체 가이드
