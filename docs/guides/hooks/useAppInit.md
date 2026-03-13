# useAppInit Hook

## 개요

애플리케이션 초기화 로직을 담당하는 훅입니다. 주로 앱 최상위 컴포넌트에서 한 번만 실행되어 Finnhub WebSocket 연결을 초기화합니다. 환경 변수에서 API 키를 읽어 소켓 서비스에 전달합니다.

## 매개변수

없음

## 반환값

없음 (부수 효과만 수행)

## 사용 예시

```tsx
import { useAppInit } from "@/hooks";

export function App() {
  // 앱 마운트 시 한 번만 초기화
  useAppInit();

  return (
    <Router>
      <Header />
      <main>{/* 페이지 */}</main>
    </Router>
  );
}
```

## 내부 동작 원리

### 1. 환경 변수 읽기

- `import.meta.env.VITE_FINNHUB_API_KEY` 사용
- Vite 환경 변수 접근 방식

### 2. WebSocket 초기화

- `stockSocket.init(apiKey)` 호출
- Finnhub WebSocket 서비스 초기화
- 한 번만 실행됨 (useEffect 의존성 배열 빈 배열)

### 3. 정리

- 언마운트 시 자동으로 정리 (현재는 정리 로직 없음)

## 사용 예시

### 1. 최상위 컴포넌트에서 호출

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import { App } from "@/components/pages/App";

function RootApp() {
  // 앱 초기화
  useAppInit();

  return <App />;
}

createRoot(document.getElementById("root")!).render(<RootApp />);
```

### 2. Layout 컴포넌트에서 호출

```tsx
// src/components/templates/Layout.tsx
export function Layout({ children }: { children: React.ReactNode }) {
  // 한 번만 초기화
  useAppInit();

  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

## 주의사항

- **단일 호출**: 앱 전체에서 **한 번만** 호출해야 함
  - 최상위 컴포넌트 또는 최상위 Layout에서만 호출
  - 여러 컴포넌트에서 호출하지 말 것
- **API 키 필수**: `VITE_FINNHUB_API_KEY` 환경 변수 설정 필수
- **의존성 배열**: 빈 배열 `[]`로 설정되어 있으므로 마운트 시점에만 실행
- **에러 처리**: 현재 구현에는 에러 처리 로직 없음

## 환경 변수 설정

### .env 파일

```env
VITE_FINNHUB_API_KEY=your-api-key-here
```

### .env.local (로컬 개발용)

```env
VITE_FINNHUB_API_KEY=your-local-api-key
```

### Vercel 배포

Vercel 대시보드에서 환경 변수 설정:

```
VITE_FINNHUB_API_KEY = your-production-api-key
```

## stockSocket 서비스

`useAppInit()`이 초기화하는 Finnhub WebSocket 서비스:

```ts
// src/services/websocket/stock-socket.ts
const stockSocket = {
  init(apiKey: string) {
    // WebSocket 연결 초기화
    // API 키 설정
    // 연결 재시도 로직 등
  },
  subscribe(symbol: string, callback: (data) => void) {
    // 특정 심볼 구독
  },
  unsubscribe(symbol: string) {
    // 구독 취소
  },
};
```

## 권장 구조

### Option 1: Main에서 초기화

```tsx
// src/main.tsx
import { App } from "./App";

function Root() {
  useAppInit();
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
```

### Option 2: Root Layout에서 초기화

```tsx
// src/components/templates/RootLayout.tsx
export function RootLayout({ children }: Props) {
  useAppInit();

  return <div>{children}</div>;
}

// src/main.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <RootLayout>
    <App />
  </RootLayout>
);
```

## 성능 고려사항

- 매우 간단한 훅으로 성능 영향 최소
- WebSocket 초기화는 비동기이지만, 이 훅은 Promise 반환하지 않음
- 초기화 완료를 기다려야 하면 `stockSocket.init()` 직접 호출 후 Promise 처리

## 개선 아이디어

현재 구현은 매우 기본적. 다음 개선 사항 고려:

### 1. 에러 처리

```ts
useEffect(() => {
  try {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) {
      console.error("VITE_FINNHUB_API_KEY not set");
      return;
    }
    stockSocket.init(apiKey);
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
}, []);
```

### 2. 초기화 상태 반환

```ts
export function useAppInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      stockSocket.init(apiKey);
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  return { isInitialized, error };
}
```

### 3. 정리 로직

```ts
useEffect(() => {
  stockSocket.init(apiKey);

  return () => {
    // WebSocket 정리
    stockSocket.disconnect?.();
  };
}, []);
```

## 테스트

```tsx
import { useAppInit } from "@/hooks";
import { renderHook } from "@testing-library/react";

describe("useAppInit", () => {
  it("should initialize stockSocket on mount", () => {
    const initSpy = vi.spyOn(stockSocket, "init");
    renderHook(() => useAppInit());
    expect(initSpy).toHaveBeenCalledWith("api-key");
  });
});
```
