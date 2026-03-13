# Hook 작성 규칙

> Custom Hook 개발 시 반드시 따라야 할 규칙

---

## 🎯 핵심 원칙

1. ✅ **비즈니스 로직만 담당** - UI는 컴포넌트로
2. ✅ **use로 시작하는 이름**
3. ✅ **타입 정의 필수**
4. ✅ **순수 함수처럼 동작** - 같은 입력 → 같은 출력
5. ❌ **직접 API 호출 금지** - services/ 사용

---

## ✅ 올바른 Hook 구조

### 1. 기본 형식

```ts
// ✅ 올바른 방법
interface UseStockDataReturn {
  data: StockPrice | null;
  loading: boolean;
  error: Error | null;
}

export const useStockData = (symbol: string): UseStockDataReturn => {
  const [data, setData] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 비즈니스 로직
    // services/를 통한 데이터 fetching
  }, [symbol]);

  return { data, loading, error };
};
```

### 2. 타입 정의

```ts
// ✅ 매개변수와 반환값 타입 명시
export const useStockData = (
  symbol: string, // 매개변수 타입
  options?: { autoUpdate?: boolean } // 선택적 매개변수
): AsyncState<StockPrice> => {
  // 반환 타입
  // ...
};
```

### 3. Services 레이어 사용

```ts
// ✅ 올바른 방법
import { finnhubApi } from "@/services/api/finnhubApi";

export const useStockData = (symbol: string) => {
  useEffect(() => {
    const fetchData = async () => {
      const result = await finnhubApi.getQuote(symbol);
      setData(result);
    };
    fetchData();
  }, [symbol]);
  // ...
};
```

---

## ❌ 금지된 패턴

### 1. UI 렌더링

```tsx
// ❌ 잘못된 방법 - Hook에서 JSX 반환
export const useStockBox = () => {
  return <div>Stock Box</div>;
};

// ✅ 올바른 방법 - 데이터만 반환
export const useStockBox = () => {
  return { data, loading, error };
};
```

### 2. 직접 API 호출

```ts
// ❌ 잘못된 방법
export const useStockData = (symbol: string) => {
  useEffect(() => {
    fetch(`/api/stock?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [symbol]);
};

// ✅ 올바른 방법
import { finnhubApi } from "@/services/api/finnhubApi";

export const useStockData = (symbol: string) => {
  useEffect(() => {
    const fetchData = async () => {
      const result = await finnhubApi.getQuote(symbol);
      setData(result);
    };
    fetchData();
  }, [symbol]);
};
```

### 3. 타입 미정의

```ts
// ❌ 잘못된 방법
export const useStockData = (symbol) => {
  // any 타입 추론
  const [data, setData] = useState(null);
  return { data };
};

// ✅ 올바른 방법
export const useStockData = (symbol: string): AsyncState<StockPrice> => {
  const [data, setData] = useState<StockPrice | null>(null);
  return { data, loading, error };
};
```

---

## 📋 Hook 카테고리

### 1. Data Fetching Hook

```ts
// 외부 데이터 가져오기
export const useStockData = (symbol: string): AsyncState<StockPrice> => {
  // ...
};

export const useChartData = (symbol: string, range: ChartTimeRange): AsyncState<ChartData> => {
  // ...
};
```

### 2. State Management Hook

```ts
// 로컬 상태 관리
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
};
```

### 3. UI Interaction Hook

```ts
// UI 상호작용 처리
export const useDragAndResize = (id: string) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 300 });

  const handleDragStop = useCallback((e, data) => {
    setPosition({ x: data.x, y: data.y });
  }, []);

  return { position, size, handleDragStop };
};
```

### 4. Utility Hook

```ts
// 유틸리티 기능
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
```

---

## 💡 권장 사항

### 1. AsyncState 타입 사용

```ts
// src/types/api.ts
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Hook에서 사용
export const useStockData = (symbol: string): AsyncState<StockPrice> => {
  const [data, setData] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  return { data, loading, error };
};
```

### 2. useCallback 사용

```ts
// ✅ 함수를 반환할 때 useCallback 사용
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return { searchTerm, handleSearch };
};
```

### 3. 의존성 배열 정확히 명시

```ts
// ✅ 올바른 의존성 배열
useEffect(() => {
  fetchData(symbol);
}, [symbol]); // symbol이 변경될 때만 실행

// ❌ 잘못된 의존성 배열
useEffect(() => {
  fetchData(symbol);
}, []); // symbol 변경 시 업데이트 안 됨
```

### 4. Cleanup 함수

```ts
// ✅ 구독 해제, 타이머 정리 등
useEffect(() => {
  const subscription = subscribeToUpdates(symbol);

  return () => {
    subscription.unsubscribe(); // cleanup
  };
}, [symbol]);
```

---

## 🗂 파일 구조

```
src/hooks/
├── useStockData.ts
├── useMarketStatus.ts
├── useChartData.ts
└── index.ts            # ✅ 필수 - barrel export
```

```ts
// src/hooks/index.ts
export { useStockData } from "./useStockData";
export { useMarketStatus } from "./useMarketStatus";
export { useChartData } from "./useChartData";
```

---

## 🔄 Hook 간 참조

### Hook 내부에서 다른 Hook 사용

```ts
// ✅ 직접 import (순환 참조 방지)
import { useMarketStatus } from "@/hooks/useMarketStatus";
import { useStockData } from "@/hooks/useStockData";

export const useStockBox = (symbol: string) => {
  const { data, loading } = useStockData(symbol);
  const { isOpen } = useMarketStatus();

  return { data, loading, isOpen };
};
```

---

## 📋 체크리스트

새 Hook 작성 후:

- [ ] use로 시작하는 이름인가?
- [ ] 매개변수 타입 정의했는가?
- [ ] 반환값 타입 정의했는가?
- [ ] any 타입 사용하지 않았는가?
- [ ] JSX 반환하지 않았는가?
- [ ] 직접 API 호출하지 않고 services/ 사용했는가?
- [ ] hooks/index.ts에 export 추가했는가?
- [ ] useEffect 의존성 배열 정확한가?
- [ ] cleanup 함수 필요하면 작성했는가?

---

## 🚨 자주 하는 실수

### ❌ 실수 1: use 없는 이름

```ts
// ❌ 잘못된 방법
export const stockData = (symbol: string) => {
  // ...
};

// ✅ 올바른 방법
export const useStockData = (symbol: string) => {
  // ...
};
```

### ❌ 실수 2: 조건부 Hook 호출

```tsx
// ❌ 잘못된 방법
export const useConditional = (condition: boolean) => {
  if (condition) {
    const [state, setState] = useState(0); // ❌ 조건부 Hook 호출
  }
};

// ✅ 올바른 방법
export const useConditional = (condition: boolean) => {
  const [state, setState] = useState(0);

  if (condition) {
    // state 사용
  }
};
```

### ❌ 실수 3: 반환값 타입 불일치

```ts
// ❌ 잘못된 방법
export const useStockData = (): AsyncState<StockPrice> => {
  return { data, loading }; // error 누락
};

// ✅ 올바른 방법
export const useStockData = (): AsyncState<StockPrice> => {
  return { data, loading, error };
};
```

---

**작성일:** 2026-03-10
**참조:** [docs/guides/hooks/README.md](../../docs/guides/hooks/README.md) (작성 예정)
