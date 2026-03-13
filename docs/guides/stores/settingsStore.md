# settingsStore Store

## 개요

**useSettingsStore**는 애플리케이션의 전역 설정을 관리합니다. 테마(다크/라이트), 언어(한국어/영어), 색상 체계(한국식/미국식), 통화, 그리고 각 위젯의 표시 여부를 제어합니다.

- **책임**: 앱 전역 설정 (테마, 언어, 표시 옵션)
- **Persist**: ✅ Yes (LocalStorage에 자동 저장)
- **접근 키**: `stockdesk_settings_v2`

---

## 상태 구조

### State 인터페이스

```typescript
interface SettingsState {
  theme: "light" | "dark"; // UI 테마
  language: "ko" | "en"; // 표시 언어
  colorScheme: "kr" | "us"; // 주가 색상 체계
  currency: "USD" | "KRW"; // 통화 표시
  showChart: boolean; // 개별 주식 차트 표시 여부
  showIndexDJI: boolean; // Dow Jones 박스 표시 여부
  showIndexSP500: boolean; // S&P 500 박스 표시 여부
  showIndexNASDAQ: boolean; // NASDAQ 박스 표시 여부
  showExchangeRate: boolean; // USD/KRW 환율 박스 표시 여부
}
```

### 초기값

```typescript
const DEFAULT_SETTINGS = {
  theme: "dark", // 다크 모드가 기본값
  language: "ko", // 한국어가 기본값
  colorScheme: "us", // 미국식 색상 (빨강=상승, 파랑=하락)
  currency: "USD", // USD가 기본값
  showChart: true, // 차트 표시
  showIndexDJI: true, // 지수 표시
  showIndexSP500: true,
  showIndexNASDAQ: true,
  showExchangeRate: true, // 환율 표시
};
```

---

## Actions

각 설정마다 개별 setter가 있습니다.

### setTheme(theme)

UI 테마를 변경합니다.

**파라미터**:

- `theme: "light" | "dark"`

**동작**:

1. 테마 값 변경
2. CSS 클래스 적용 (통상 `<html class="dark">`)

**코드**:

```typescript
setTheme: (theme: "light" | "dark") => {
  set((state) => {
    state.theme = theme;
  });
};
```

**사용 예시**:

```tsx
const { setTheme } = useSettingsStore();
setTheme("dark"); // 다크 모드 활성화
setTheme("light"); // 라이트 모드 활성화
```

**HTML/CSS에서의 적용**:

```tsx
export const App = () => {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <html className={theme === "dark" ? "dark" : ""}>
      <div className="bg-white text-black dark:bg-slate-900 dark:text-white">
        {/* Tailwind의 dark: prefix 사용 */}
      </div>
    </html>
  );
};
```

---

### setLanguage(lang)

표시 언어를 변경합니다.

**파라미터**:

- `lang: "ko" | "en"`

**동작**:

1. 언어 값 변경
2. i18n 라이브러리에 언어 동기화 (별도 처리 필요)

**코드**:

```typescript
setLanguage: (lang: "ko" | "en") => {
  set((state) => {
    state.language = lang;
  });
};
```

**사용 예시**:

```tsx
import { useSettingsStore } from "@/stores";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  const handleLanguageChange = (lang: "ko" | "en") => {
    setLanguage(lang);
    i18n.changeLanguage(lang); // i18n과 동기화
  };

  return (
    <button onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")}>
      {language === "ko" ? "EN" : "KO"}
    </button>
  );
};
```

---

### setColorScheme(scheme)

주가 색상 체계를 변경합니다.

**파라미터**:

- `scheme: "kr" | "us"`

**동작**:

1. 색상 체계 값 변경
2. 차트 및 가격 표시 색상이 자동 갱신

**색상 차이**:

| 상태 | 한국식 (kr)    | 미국식 (us)    |
| ---- | -------------- | -------------- |
| 상승 | 빨강 (#ff0000) | 녹색 (#22c55e) |
| 하락 | 파랑 (#0000ff) | 빨강 (#ef4444) |

**코드**:

```typescript
setColorScheme: (scheme: "kr" | "us") => {
  set((state) => {
    state.colorScheme = scheme;
  });
};
```

**사용 예시**:

```tsx
export const ColorSchemeSelector = () => {
  const { colorScheme, setColorScheme } = useSettingsStore();

  return (
    <>
      <button onClick={() => setColorScheme("kr")}>한국식 (빨강=상승, 파랑=하락)</button>
      <button onClick={() => setColorScheme("us")}>미국식 (녹색=상승, 빨강=하락)</button>
    </>
  );
};
```

---

### setCurrency(currency)

표시 통화를 변경합니다.

**파라미터**:

- `currency: "USD" | "KRW"`

**동작**:

1. 통화 값 변경
2. 환율 정보가 필요한 컴포넌트가 자동 갱신

**코드**:

```typescript
setCurrency: (currency: "USD" | "KRW") => {
  set((state) => {
    state.currency = currency;
  });
};
```

**사용 예시**:

```tsx
export const CurrencySwitcher = () => {
  const { currency, setCurrency } = useSettingsStore();

  return (
    <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
      <option value="USD">USD</option>
      <option value="KRW">KRW</option>
    </select>
  );
};
```

---

### setShowChart(show)

개별 주식 박스의 차트 표시 여부를 제어합니다.

**파라미터**:

- `show: boolean`

**동작**:

1. showChart 값 변경
2. 모든 StockBox 컴포넌트에서 차트 표시 유무 결정

**코드**:

```typescript
setShowChart: (show: boolean) => {
  set((state) => {
    state.showChart = show;
  });
};
```

**사용 예시**:

```tsx
export const SettingsModal = () => {
  const { showChart, setShowChart } = useSettingsStore();

  return (
    <label>
      <input type="checkbox" checked={showChart} onChange={(e) => setShowChart(e.target.checked)} />
      차트 표시
    </label>
  );
};
```

**StockBox에서의 사용**:

```tsx
export const StockBox = ({ stock }) => {
  const showChart = useSettingsStore((state) => state.showChart);

  return (
    <div>
      <PriceDisplay symbol={stock.symbol} />
      {showChart && <Chart symbol={stock.symbol} />}
    </div>
  );
};
```

---

### setShowIndex\* (DJI, SP500, NASDAQ)

지수 박스 표시 여부를 제어합니다.

**파라미터**:

- `show: boolean`

**메서드**:

- `setShowIndexDJI(show)`
- `setShowIndexSP500(show)`
- `setShowIndexNASDAQ(show)`

**사용 예시**:

```tsx
const { showIndexDJI, setShowIndexDJI } = useSettingsStore();

<label>
  <input
    type="checkbox"
    checked={showIndexDJI}
    onChange={(e) => setShowIndexDJI(e.target.checked)}
  />
  Dow Jones 표시
</label>;
```

---

### setShowExchangeRate(show)

USD/KRW 환율 박스 표시 여부를 제어합니다.

**파라미터**:

- `show: boolean`

**사용 예시**:

```tsx
const { showExchangeRate, setShowExchangeRate } = useSettingsStore();

<label>
  <input
    type="checkbox"
    checked={showExchangeRate}
    onChange={(e) => setShowExchangeRate(e.target.checked)}
  />
  환율 표시
</label>;
```

---

## 사용 예시

### 1. 설정 모달에서 모든 옵션 제어

```tsx
import { useSettingsStore } from "@/stores";

export const SettingsModal = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>설정</h2>

      {/* 테마 */}
      <div>
        <label>테마</label>
        <select value={settings.theme} onChange={(e) => settings.setTheme(e.target.value as any)}>
          <option value="light">라이트 모드</option>
          <option value="dark">다크 모드</option>
        </select>
      </div>

      {/* 언어 */}
      <div>
        <label>언어</label>
        <select
          value={settings.language}
          onChange={(e) => settings.setLanguage(e.target.value as any)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* 색상 체계 */}
      <div>
        <label>색상 체계</label>
        <select
          value={settings.colorScheme}
          onChange={(e) => settings.setColorScheme(e.target.value as any)}
        >
          <option value="kr">한국식 (빨강=상승)</option>
          <option value="us">미국식 (녹색=상승)</option>
        </select>
      </div>

      {/* 통화 */}
      <div>
        <label>통화</label>
        <select
          value={settings.currency}
          onChange={(e) => settings.setCurrency(e.target.value as any)}
        >
          <option value="USD">USD</option>
          <option value="KRW">KRW</option>
        </select>
      </div>

      {/* 표시 옵션 */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showChart}
            onChange={(e) => settings.setShowChart(e.target.checked)}
          />
          차트 표시
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showIndexDJI}
            onChange={(e) => settings.setShowIndexDJI(e.target.checked)}
          />
          Dow Jones 표시
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showIndexSP500}
            onChange={(e) => settings.setShowIndexSP500(e.target.checked)}
          />
          S&P 500 표시
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showIndexNASDAQ}
            onChange={(e) => settings.setShowIndexNASDAQ(e.target.checked)}
          />
          NASDAQ 표시
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showExchangeRate}
            onChange={(e) => settings.setShowExchangeRate(e.target.checked)}
          />
          환율 표시
        </label>
      </div>

      <button onClick={onClose}>닫기</button>
    </div>
  );
};
```

### 2. 색상 스킴에 따른 조건부 렌더링

```tsx
export const PriceChange = ({ change }) => {
  const colorScheme = useSettingsStore((state) => state.colorScheme);

  const color = {
    kr: change >= 0 ? "text-red-600" : "text-blue-600",
    us: change >= 0 ? "text-green-600" : "text-red-600",
  }[colorScheme];

  return (
    <span className={color}>
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  );
};
```

### 3. 언어에 따른 텍스트 표시

```tsx
import { useSettingsStore } from "@/stores";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const language = useSettingsStore((state) => state.language);

  // i18n과 store 동기화
  React.useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <h1>{t("header.title")}</h1>;
};
```

### 4. Selector로 성능 최적화

```tsx
import { selectShowChart, selectTheme, useSettingsStore } from "@/stores";

// ✅ 필요한 설정만 구독 → 불필요한 재렌더링 방지
export const OptimizedComponent = () => {
  const theme = useSettingsStore(selectTheme);
  const showChart = useSettingsStore(selectShowChart);

  return (
    <div className={theme === "dark" ? "bg-slate-900" : "bg-white"}>{showChart && <Chart />}</div>
  );
};
```

---

## Persist 전략

### 저장되는 상태

```typescript
partialize: (state) => ({
  theme: state.theme,
  language: state.language,
  colorScheme: state.colorScheme,
  currency: state.currency,
  showChart: state.showChart,
  showIndexDJI: state.showIndexDJI,
  showIndexSP500: state.showIndexSP500,
  showIndexNASDAQ: state.showIndexNASDAQ,
  showExchangeRate: state.showExchangeRate,
});
```

**모든 설정이 저장됩니다** (선택적 저장 없음).

### 저장 위치

- **LocalStorage 키**: `stockdesk_settings_v2`
- **인코딩**: Base64
- **버전**: 2 (마이그레이션 지원)

### 복구 흐름

```
페이지 새로고침
↓
useSettingsStore 초기화 (DEFAULT_SETTINGS)
↓
Persist 미들웨어가 LocalStorage에서 데이터 로드
↓
저장된 설정이 있으면 덮어씀
↓
상태 복구 완료 → 모든 컴포넌트에서 설정 자동 갱신
```

---

## 주의사항

### 1. i18n과의 동기화

```tsx
// ❌ 주의: Store의 language와 i18n.language가 불일치할 수 있음
const { setLanguage } = useSettingsStore();
setLanguage("en");
// i18n.language는 여전히 "ko"일 수 있음

// ✅ 올바른 방법: Custom Hook에서 동기화
const useChangeLanguage = () => {
  const { i18n } = useTranslation();
  const { setLanguage } = useSettingsStore();

  return (lang: "ko" | "en") => {
    setLanguage(lang);
    i18n.changeLanguage(lang); // 동기화
  };
};
```

### 2. CSS 클래스 적용 타이밍

```tsx
// ❌ 테마가 변경되면 HTML 클래스도 즉시 업데이트 필요
const theme = useSettingsStore((state) => state.theme);
// 단순히 상태 변경만으로는 CSS가 적용 안 될 수 있음

// ✅ useEffect에서 HTML 클래스 수동 관리
useEffect(() => {
  document.documentElement.className = theme === "dark" ? "dark" : "";
}, [theme]);
```

### 3. 성능: Selector 패턴 권장

```tsx
// ❌ 모든 설정을 구독 → 언어 변경 시 showChart 컴포넌트도 재렌더링
const Component = () => {
  const { theme, language, colorScheme, showChart } = useSettingsStore();
};

// ✅ 필요한 설정만 구독 → 해당 설정 변경 시만 재렌더링
const Component = () => {
  const showChart = useSettingsStore((state) => state.showChart);
};
```

### 4. 통화 변경과 환율 API

```tsx
// 통화 변경 시 환율 정보도 새로 요청해야 함
const currency = useSettingsStore((state) => state.currency);

useEffect(() => {
  // 환율 API 호출
  fetchExchangeRate(currency);
}, [currency]);
```

---

## 관련 Selector

```typescript
// State Selectors
export const selectTheme = (state: SettingsStore) => state.theme;
export const selectLanguage = (state: SettingsStore) => state.language;
export const selectColorScheme = (state: SettingsStore) => state.colorScheme;
export const selectCurrency = (state: SettingsStore) => state.currency;
export const selectShowChart = (state: SettingsStore) => state.showChart;
export const selectShowIndexDJI = (state: SettingsStore) => state.showIndexDJI;
export const selectShowIndexSP500 = (state: SettingsStore) => state.showIndexSP500;
export const selectShowIndexNASDAQ = (state: SettingsStore) => state.showIndexNASDAQ;
export const selectShowExchangeRate = (state: SettingsStore) => state.showExchangeRate;

// Action Selectors
export const selectSetTheme = (state: SettingsStore) => state.setTheme;
export const selectSetLanguage = (state: SettingsStore) => state.setLanguage;
// ... 등등
```

---

## 디버깅 팁

### 현재 설정 확인

```javascript
// 브라우저 콘솔
window.stores.settings.getState();
// → 모든 설정값 출력
```

### LocalStorage 값 확인

```javascript
const raw = localStorage.getItem("stockdesk_settings_v2");
const decoded = atob(raw);
JSON.parse(decoded);
```

### 설정 초기화

```javascript
window.resetStores();
// 또는
useSettingsStore.persist.clearStorage();
```

---

## 다음 단계

- [uiStore.md](./uiStore.md) - 모달 UI 상태
- [stockBoxStore.md](./stockBoxStore.md) - 주식 박스 관리
- [README.md](./README.md) - Zustand Store 전체 가이드
