# useFullscreen Hook

## 개요

브라우저 전체 화면 모드를 제어하는 훅입니다. 현재 전체 화면 상태를 추적하고, 전체 화면 진입/해제를 토글하는 함수를 제공합니다. 데스크톱 애플리케이션처럼 주식 대시보드를 최대로 활용하기 위한 기능입니다.

## 매개변수

없음

## 반환값

```ts
{
  isFullscreen: boolean; // 전체 화면 활성 여부
  toggleFullscreen: () => Promise<void>; // 전체 화면 토글
}
```

## 사용 예시

```tsx
import { useFullscreen } from "@/hooks";

export function Header() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <header className="flex items-center justify-between p-4">
      <h1>Stock Desk</h1>
      <button
        onClick={toggleFullscreen}
        className="rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {isFullscreen ? "전체 화면 종료" : "전체 화면"}
      </button>
    </header>
  );
}
```

## 내부 동작 원리

### 1. 상태 추적

- `document.fullscreenElement` 확인으로 현재 상태 판단
- 초기 상태: `!!document.fullscreenElement` (false 또는 true)

### 2. fullscreenchange 이벤트

- 사용자가 ESC 키로 전체 화면 종료 시 감지
- 브라우저 UI 버튼으로 전체 화면 종료 시 감지
- 상태 자동 동기화

### 3. toggleFullscreen 함수

- 현재 상태가 아니면 진입: `document.documentElement.requestFullscreen()`
- 현재 상태이면 해제: `document.exitFullscreen()`
- Promise 기반이므로 async/await 사용 가능

## 주의사항

- **권한 요청**: 전체 화면 진입 시 브라우저가 사용자 권한 요청
- **보안**: HTTPS 연결이거나 localhost일 때만 작동
- **사용자 제스처 필요**: 클릭, 키보드 입력 등 사용자 상호작용 후에만 호출 가능
  (자동 실행 금지)
- **ESC 키**: 사용자가 ESC 키로 언제든 전체 화면 종료 가능
- **크로스 브라우저**: 구형 브라우저는 `webkitRequestFullscreen()` 등 벤더 접두사 버전 사용
  (현재 코드는 표준 API만 지원)
- **에러 처리**: Promise rejection 가능하므로 try-catch 권장

## 사용 예시 (에러 처리)

```tsx
const { isFullscreen, toggleFullscreen } = useFullscreen();

const handleToggle = async () => {
  try {
    await toggleFullscreen();
  } catch (error) {
    console.error("전체 화면 전환 실패:", error);
    // 권한 거부, 보안 정책 등 이유로 실패
  }
};
```

## 성능 고려사항

- 가볍고 간단한 훅으로 성능 영향 최소
- 이벤트 리스너 정리로 메모리 누수 방지
- 상태 변경 시에만 리렌더링

## 브라우저 호환성

| 브라우저 | 지원    |
| -------- | ------- |
| Chrome   | ✅ 15+  |
| Firefox  | ✅ 10+  |
| Safari   | ✅ 5.1+ |
| Edge     | ✅ 12+  |
| IE       | ❌      |

## 고급 용법

### 1. 자동 전체 화면 (사용자 상호작용 후)

```tsx
useEffect(() => {
  const handleDoubleClick = async () => {
    await toggleFullscreen();
  };

  document.addEventListener("dblclick", handleDoubleClick);
  return () => document.removeEventListener("dblclick", handleDoubleClick);
}, [toggleFullscreen]);
```

### 2. 상태별 UI 변경

```tsx
const fullscreenButtonIcon = isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />;
```
