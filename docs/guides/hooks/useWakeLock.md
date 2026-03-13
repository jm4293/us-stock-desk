# useWakeLock Hook

## 개요

Screen Wake Lock API를 사용하여 디바이스 화면이 절전 모드로 들어가지 않도록 방지하는 훅입니다. 모바일 기기에서 주식 대시보드를 계속 모니터링할 때 화면이 꺼지지 않도록 유지합니다.

## 매개변수

없음

## 반환값

없음 (부수 효과만 수행)

## 사용 예시

```tsx
import { useWakeLock } from "@/hooks";

export function StockDashboard() {
  // 이 컴포넌트가 마운트되는 동안 화면 켜짐 유지
  useWakeLock();

  return <div className="h-screen overflow-auto">{/* 주식 위젯들 */}</div>;
}
```

## 내부 동작 원리

### 1. Wake Lock 획득

- `navigator.wakeLock.request("screen")` 호출
- 성공 시 `WakeLockSentinel` 인스턴스 저장
- 브라우저가 지원하지 않으면 조용히 무시

### 2. 탭 전환 후 재획득

- `visibilitychange` 이벤트 리스너 설정
- 사용자가 다른 탭으로 이동 후 돌아올 때
- `document.visibilityState === "visible"` 조건에서 재획득

### 3. Wake Lock 해제

- 컴포넌트 언마운트 시 `wakeLockRef.current.release()` 호출
- 리소스 정리 및 배터리 절약

## 사용 예시

### 1. 전체 앱 레벨 적용

```tsx
import { useWakeLock } from "@/hooks";

export function App() {
  useWakeLock(); // 앱 전체에서 화면 유지

  return (
    <Router>
      <Header />
      <main>{/* 라우팅 */}</main>
    </Router>
  );
}
```

### 2. 특정 모드에서만 활성화

```tsx
import { useWakeLock } from "@/hooks";
import { useSettingsStore } from "@/stores";

export function StockDashboard() {
  const keepScreenOn = useSettingsStore(selectKeepScreenOn);

  // keepScreenOn이 true일 때만 hook 실행
  if (keepScreenOn) {
    useWakeLock();
  }

  return <div>{/* 대시보드 */}</div>;
}
```

## 주의사항

- **API 지원**: 모든 브라우저가 Screen Wake Lock API를 지원하지 않음
  - Chrome/Edge: ✅ 지원
  - Firefox: ✅ 지원
  - Safari: ❌ 미지원
  - IE: ❌ 미지원
- **권한 요청**: 사용자 권한 필요 (일반적으로 자동으로 부여)
- **배터리 소모**: 화면을 계속 켜므로 모바일 기기 배터리 소모 증가
- **사용자 설정**: 화면 유지 옵션을 사용자가 끌 수 있도록 제공 권장
- **실패 처리**: API 호출 실패 시 조용히 무시되므로 앱은 정상 작동

## 브라우저 호환성

| 브라우저 | 지원 | 버전 |
| -------- | ---- | ---- |
| Chrome   | ✅   | 84+  |
| Edge     | ✅   | 84+  |
| Firefox  | ✅   | 137+ |
| Safari   | ❌   | -    |
| Opera    | ✅   | 70+  |

## 성능 및 배터리

### 배터리 사용량 감소 팁

```tsx
import { useWakeLock } from "@/hooks";
import { useSettings } from "@/stores";

export function SmartWakeLock() {
  const marketStatus = useMarketStatus();
  const keepScreenOnDuringTradingHours = useSettings((s) => s.keepScreenOn);

  // 거래 시간 중에만 화면 유지
  if (keepScreenOnDuringTradingHours && marketStatus.isRegularHours) {
    useWakeLock();
  }

  return null;
}
```

## 고급 사용

### 1. Wake Lock 상태 추적 (개선 필요)

현재 구현에는 Wake Lock 획득 여부를 반환하지 않음. 필요하면 커스텀 훅 작성:

```ts
export function useWakeLockWithStatus() {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = async () => {
    if (!("wakeLock" in navigator)) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setIsActive(true);
    } catch {
      setIsActive(false);
    }
  };

  useEffect(() => {
    acquire();
  }, []);

  return { isActive };
}
```

### 2. 오프라인 감지와 연계

```tsx
import { useWakeLock } from "@/hooks";
import { useNetworkStatus } from "@/hooks";

export function SmartWakeLock() {
  const { isOnline } = useNetworkStatus();

  // 온라인 상태일 때만 화면 유지
  if (isOnline) {
    useWakeLock();
  }

  return null;
}
```

## 사용 사례

| 용도                 | 활성화   | 비활성화 |
| -------------------- | -------- | -------- |
| 실시간 주식 모니터링 | ✅       |          |
| 거래 시간 중         | ✅       |          |
| 배터리 절약 모드     |          | ✅       |
| 모바일 기기          | ✅       |          |
| 데스크톱             | 선택사항 |          |

## 사용자 체험

화면을 계속 켜므로 사용자 입장에서:

- 장점: 주식 데이터 실시간 모니터링 가능
- 단점: 배터리 빠르게 소모

따라서 설정에서 끌 수 있도록 구현 권장:

```tsx
<label>
  <input
    type="checkbox"
    checked={keepScreenOn}
    onChange={(e) => setKeepScreenOn(e.target.checked)}
  />
  거래 시간 중 화면 유지
</label>
```
