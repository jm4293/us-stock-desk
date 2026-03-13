# useApplyTheme Hook

## 개요

Zustand 스토어에서 선택된 테마(다크/라이트)를 감지하고, 변경될 때마다 DOM의 `document.documentElement`에 클래스를 적용하는 훅입니다. Tailwind CSS의 다크 모드 기능과 연동하여 전역 테마를 관리합니다.

## 매개변수

없음

## 반환값

```ts
"dark" | "light"; // 현재 적용된 테마
```

## 사용 예시

```tsx
import { useApplyTheme } from "@/hooks";

export function App() {
  const theme = useApplyTheme();

  return (
    <div className="bg-white text-black dark:bg-slate-900 dark:text-white">
      <Header />
      <main>
        <p>현재 테마: {theme}</p>
      </main>
    </div>
  );
}
```

## 내부 동작 원리

### 1. 테마 상태 조회

- Zustand `useSettingsStore`에서 `selectTheme` selector로 현재 테마 조회
- "dark" 또는 "light" 문자열 반환

### 2. DOM 클래스 적용

- `document.documentElement` (html 태그) 선택
- `classList.toggle("dark", theme === "dark")` 실행
- `classList.toggle("light", theme === "light")` 실행

### 3. Tailwind 다크 모드 연동

- html 태그에 "dark" 클래스 있으면 어두운 스타일 적용
- html 태그에 "dark" 클래스 없으면 밝은 스타일 적용

## 데이터 흐름

```
User Action (테마 변경)
    ↓
Zustand Store (theme 업데이트)
    ↓
useApplyTheme Hook (감지)
    ↓
document.documentElement.classList.toggle()
    ↓
HTML 태그의 "dark" 클래스 추가/제거
    ↓
Tailwind CSS 다크 모드 활성화/비활성화
    ↓
모든 Tailwind dark:* 클래스 적용/미적용
```

## 사용 예시

### 1. 테마 토글 버튼

```tsx
import { useApplyTheme } from "@/hooks";
import { useSettingsStore } from "@/stores";

export function ThemeToggle() {
  const theme = useApplyTheme();
  const setTheme = useSettingsStore((s) => s.setTheme);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // useApplyTheme가 감지하여 DOM 자동 업데이트
  };

  return <button onClick={toggleTheme}>{theme === "dark" ? "🌙 Dark" : "☀️ Light"}</button>;
}
```

### 2. 시스템 기본값 감지

```tsx
import { useEffect } from "react";
import { useApplyTheme } from "@/hooks";
import { useSettingsStore } from "@/stores";

export function SystemThemeSync() {
  useApplyTheme();
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    // 시스템 다크 모드 감지
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, [setTheme]);

  return null;
}
```

### 3. 조건부 스타일 적용

```tsx
import { useApplyTheme } from "@/hooks";

export function ThemedComponent() {
  const theme = useApplyTheme();

  return (
    <div className={theme === "dark" ? "bg-slate-900" : "bg-white"}>
      {/* Tailwind로 충분하지 않은 경우 */}
    </div>
  );
}
```

## Tailwind CSS 설정

`useApplyTheme`이 정상 작동하려면 tailwind.config.js 설정 필수:

### tailwind.config.js

```js
export default {
  darkMode: "class", // 클래스 기반 다크 모드
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 클래스 기반 다크 모드 작동 원리

```html
<!-- 라이트 모드 (dark 클래스 없음) -->
<html>
  <body className="bg-white text-black">
    ...
  </body>
</html>

<!-- 다크 모드 (dark 클래스 있음) -->
<html class="dark">
  <body className="bg-white dark:bg-slate-900 text-black dark:text-white">
    ...
  </body>
</html>
```

## Tailwind CSS 다크 모드 사용법

```tsx
// light 모드에서는 bg-white, dark 모드에서는 bg-slate-900
<div className="bg-white dark:bg-slate-900">
  <p className="text-black dark:text-white">텍스트</p>
</div>
```

## 주의사항

- **Zustand 의존**: `useSettingsStore`와 `selectTheme` selector 필수
- **Tailwind 설정**: `darkMode: "class"` 설정 필수
- **초기화 순서**: 앱 초기화 시 테마 설정 완료 후 useApplyTheme 호출
- **SSR 환경**: 서버 렌더링 시 DOM 접근 불가, useEffect로 보호됨
- **동기화**: DOM 클래스와 Zustand 스토어 항상 동기화됨

## 성능 최적화

- Zustand selector로 테마 변경만 감지
- useEffect로 필요할 때만 DOM 업데이트
- 리렌더링 최소화

## 디버깅

현재 테마 상태 확인:

```tsx
// 콘솔에서
document.documentElement.classList.contains("dark"); // true or false

// 또는
window.getComputedStyle(document.documentElement).colorScheme; // "dark" or "light"
```

## 시스템 기본값 자동 반영

앱 시작 시 사용자 시스템 설정 자동 적용:

```tsx
export function InitializeTheme() {
  useApplyTheme();
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    // 저장된 테마가 없으면 시스템 설정 사용
    if (!localStorage.getItem("theme")) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
    }
  }, [setTheme]);

  return null;
}
```

## 주요 특징

- **양방향 동기화**: Zustand ↔ DOM
- **자동 적용**: 테마 변경 시 모든 Tailwind dark:\* 클래스 자동 적용
- **성능**: 가벼운 구현으로 성능 영향 최소
- **표준화**: Tailwind CSS 공식 다크 모드 방식 사용
