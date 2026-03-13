# useLanguage Hook

## 개요

현재 선택된 언어를 Zustand 스토어에서 가져오고, 변경될 때마다 i18n 인스턴스에 적용하는 훅입니다. 한국어(ko)와 영어(en)를 지원하며, 사용자 언어 설정을 전역 상태로 관리합니다.

## 매개변수

없음

## 반환값

```ts
string; // 현재 언어 코드 ("ko" | "en")
```

## 사용 예시

```tsx
import { useLanguage } from "@/hooks";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const currentLanguage = useLanguage();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = currentLanguage === "ko" ? "en" : "ko";
    // Zustand 스토어 업데이트 (useLanguage 훅이 감지해서 i18n 자동 동기화)
    useSettingsStore.setState({ language: newLang });
  };

  return (
    <button onClick={toggleLanguage}>{currentLanguage === "ko" ? "English" : "한국어"}</button>
  );
}
```

## 내부 동작 원리

### 1. 언어 상태 조회

- Zustand `useSettingsStore`에서 `selectLanguage` selector로 현재 언어 조회
- Zustand 선택자를 통한 구독으로 필요한 부분만 리렌더링

### 2. i18n 동기화

- 언어 변경 시 `i18n.changeLanguage(language)` 자동 호출
- i18next 인스턴스와 Zustand 스토어 상태 동기화

### 3. 자동 적용

- useEffect 의존성에 `language` 포함
- 언어 값 변경 시 i18n 자동 업데이트

## 데이터 흐름

```
User Action (언어 변경)
    ↓
Zustand Store (language 업데이트)
    ↓
useLanguage Hook (감지)
    ↓
i18n.changeLanguage() (자동 호출)
    ↓
모든 컴포넌트 (useTranslation()으로 새 번역 적용)
```

## 주의사항

- **Zustand 의존**: `selectLanguage` selector와 `useSettingsStore` 필수
- **i18n 인스턴스**: 프로젝트 전역에서 하나의 i18n 인스턴스 사용
- **초기화 순서**: 앱 초기화 시 i18n 설정 완료 후 이 훅 사용
- **스토어 업데이트**: 직접 훅 반환값을 변경할 수 없음 (Zustand 스토어로 변경)

## 올바른 사용 패턴

```tsx
import { useLanguage } from "@/hooks";
import { useSettingsStore } from "@/stores";

export function Header() {
  const language = useLanguage(); // 현재 언어 조회

  const changeLanguage = (newLang: "ko" | "en") => {
    // Zustand 스토어를 통해 언어 변경
    useSettingsStore.setState({ language: newLang });
    // useLanguage 훅이 감지하여 i18n 자동 동기화
  };

  return (
    <div>
      <button onClick={() => changeLanguage("ko")}>한국어</button>
      <button onClick={() => changeLanguage("en")}>English</button>
    </div>
  );
}
```

## 여러 컴포넌트에서 사용

```tsx
// HeaderComponent.tsx
export function HeaderComponent() {
  const language = useLanguage();
  return <h1>{language === "ko" ? "헤더" : "Header"}</h1>;
}

// FooterComponent.tsx
export function FooterComponent() {
  const language = useLanguage();
  return <footer>{language === "ko" ? "바닥글" : "Footer"}</footer>;
}

// 모두 동일한 언어 상태 공유
```

## useTranslation()과의 차이

```tsx
// useLanguage - 현재 언어 코드만 필요할 때
const language = useLanguage(); // "ko" | "en"

// useTranslation() - 번역 함수가 필요할 때
const { t } = useTranslation();
const text = t("key"); // 번역 문자열 조회
```

## 성능 최적화

- Zustand selector로 필요한 부분만 구독
- 언어 변경 시에만 리렌더링
- useEffect로 i18n 동기화 처리

## 주요 특징

- **단방향 동기화**: Zustand → i18n (훅이 감시)
- **자동 적용**: 언어 변경 시 모든 컴포넌트에 자동 반영
- **간편한 사용**: 단순히 언어 코드만 반환하므로 사용 간단
