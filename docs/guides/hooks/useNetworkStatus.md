# useNetworkStatus Hook

## 개요

브라우저의 온라인/오프라인 상태를 추적하는 훅입니다. `navigator.onLine` API와 `online/offline` 이벤트를 활용하여 네트워크 연결 상태를 실시간으로 감지합니다. 오프라인 상태에서 경고 메시지를 표시하거나 API 호출을 중단하는 데 활용됩니다.

## 매개변수

없음

## 반환값

```ts
{
  isOnline: boolean; // 네트워크 연결 여부
}
```

## 사용 예시

```tsx
import { useNetworkStatus } from "@/hooks";

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="fixed left-0 right-0 top-0 bg-red-500 p-3 text-center text-white">
        오프라인 상태입니다. 네트워크 연결을 확인해주세요.
      </div>
    );
  }

  return null;
}
```

## 내부 동작 원리

### 1. 초기 상태

- `navigator.onLine` 값으로 초기 상태 설정
- true (온라인) 또는 false (오프라인)

### 2. 네트워크 상태 변경 감지

- `window.addEventListener("online", ...)`: 네트워크 연결 감지
- `window.addEventListener("offline", ...)`: 네트워크 끊김 감지
- 상태 변경 시 즉시 업데이트

### 3. 정리

- 컴포넌트 언마운트 시 이벤트 리스너 제거
- 메모리 누수 방지

## 사용 예시

### 1. API 호출 조건부 실행

```tsx
import { useNetworkStatus } from "@/hooks";
import { useStockData } from "@/hooks";

export function StockWidget({ symbol }: { symbol: string }) {
  const { isOnline } = useNetworkStatus();
  const { state } = useStockData(symbol);

  if (!isOnline) {
    return <div className="text-red-500">네트워크 없음</div>;
  }

  // 정상적으로 데이터 표시
  return <div>{/* 콘텐츠 */}</div>;
}
```

### 2. 토스트 알림

```tsx
import { useEffect } from "react";
import { useNetworkStatus } from "@/hooks";

export function NetworkStatusNotifier() {
  const { isOnline } = useNetworkStatus();
  const previousStatusRef = useRef(true);

  useEffect(() => {
    if (!isOnline && previousStatusRef.current) {
      // 온라인 → 오프라인으로 변경
      showToast("네트워크 연결이 끊어졌습니다", "error");
      previousStatusRef.current = false;
    } else if (isOnline && !previousStatusRef.current) {
      // 오프라인 → 온라인으로 변경
      showToast("네트워크가 복구되었습니다", "success");
      previousStatusRef.current = true;
    }
  }, [isOnline]);

  return null;
}
```

### 3. 폴링 자동 일시 정지

```tsx
import { useEffect } from "react";
import { useNetworkStatus } from "@/hooks";

export function SmartPolling({ onFetch }: { onFetch: () => Promise<void> }) {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) return; // 오프라인이면 폴링 안 함

    onFetch();
    const interval = setInterval(onFetch, 30000);
    return () => clearInterval(interval);
  }, [isOnline, onFetch]);

  return null;
}
```

## 주의사항

- **불완전한 감지**: `navigator.onLine`은 로컬 네트워크 상태만 표시
  - WiFi 연결 있어도 인터넷 없으면 true로 표시될 수 있음
- **즉시 갱신 안 됨**: 네트워크 끊김 감지 시간 차이 발생 가능
- **iOS Safari**: 제한적 지원 (일부 버전에서 이벤트 미발동)
- **정확성**: 신뢰할 수 있는 기본값 수준, 중요한 상태 결정에는 별도 헬스 체크 권장

## 권장 활용 패턴

### 1. 단순 오프라인 경고

```tsx
const { isOnline } = useNetworkStatus();
return isOnline ? <App /> : <OfflineScreen />;
```

### 2. 헬스 체크와 조합

```tsx
const { isOnline } = useNetworkStatus();
const [isHealthy, setIsHealthy] = useState(true);

useEffect(() => {
  if (!isOnline) {
    setIsHealthy(false);
    return;
  }

  // 온라인 상태에서만 헬스 체크
  fetch("/api/health")
    .then((r) => setIsHealthy(r.ok))
    .catch(() => setIsHealthy(false));
}, [isOnline]);

const canFetch = isOnline && isHealthy;
```

## 성능 고려사항

- 매우 가벼운 훅 (이벤트 리스너만 관리)
- 상태 변경이 적으므로 성능 영향 미미
- 여러 컴포넌트에서 동시에 사용 가능

## 타입 정의

```ts
interface NetworkStatus {
  isOnline: boolean;
}
```

## 대체 솔루션

더 정확한 네트워크 감지가 필요하면:

```ts
// 정기적 헬스 체크
async function checkNetworkHealth() {
  try {
    const response = await fetch("/api/health", { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
```
