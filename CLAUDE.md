# Stock Desk - Claude AI 개발 가이드

> 이 문서는 Claude AI가 이 프로젝트를 이해하고 개발할 수 있도록 작성된 가이드입니다.

## 🎯 프로젝트 목적

미국주식을 실시간으로 모니터링할 수 있는 **인터랙티브 대시보드** 웹 애플리케이션입니다.

- 데스크톱 위젯처럼 자유롭게 배치 가능한 주식 박스
- 실시간 가격 업데이트 및 차트
- 브라우저 시작 페이지로 사용 가능
- **프론트엔드 전용** (백엔드/DB 없음)

---

## 📚 필수 읽기 문서

개발 전 반드시 읽어야 할 문서:

1. **[docs/requirements.md](./docs/requirements.md)** - 전체 요구사항 명세서
2. **[docs/architecture/css.md](./docs/architecture/css.md)** - CSS 전략 및 아키텍처 가이드
3. **[docs/guides/tdd-storybook-i18n.md](./docs/guides/tdd-storybook-i18n.md)** - TDD, Storybook, Atomic Design, i18n 가이드
4. **[docs/architecture/tech-stack.md](./docs/architecture/tech-stack.md)** - Zustand, react-hook-form, GSAP, 접근성 가이드
5. **[docs/architecture/bundle-optimization.md](./docs/architecture/bundle-optimization.md)** - 번들 최적화 및 성능 가이드
6. **[docs/architecture/import-conventions.md](./docs/architecture/import-conventions.md)** - Import 경로 규칙 (Barrel 패턴)
7. **[docs/getting-started.md](./docs/getting-started.md)** - 개발 시작 가이드
8. **[docs/guides/git-workflow.md](./docs/guides/git-workflow.md)** - Git 브랜치 전략 및 Claude 작업 가이드

---

## 🤖 Agent Teams 개발 전략

이 프로젝트는 **Agent Teams 방식**으로 체계적으로 개발됩니다.
6명의 전문 에이전트가 역할을 나누어 순차적/병렬로 작업합니다.

### Agent 구성

| #   | Agent          | 역할                                    | 가이드 문서                                                |
| --- | -------------- | --------------------------------------- | ---------------------------------------------------------- |
| 1   | **Architect**  | 프로젝트 설계자 (폴더 구조, 타입 정의)  | [.claude/AGENT_ARCHITECT.md](.claude/AGENT_ARCHITECT.md)   |
| 2   | **Styles**     | 스타일 전문가 (Tailwind, Glassmorphism) | [.claude/AGENT_STYLES.md](.claude/AGENT_STYLES.md)         |
| 3   | **State**      | 상태 관리 (Zustand 스토어)              | [.claude/AGENT_STATE.md](.claude/AGENT_STATE.md)           |
| 4   | **Services**   | 서비스 레이어 (API, WebSocket)          | [.claude/AGENT_SERVICES.md](.claude/AGENT_SERVICES.md)     |
| 5   | **Components** | UI 개발자 (React 컴포넌트)              | [.claude/AGENT_COMPONENTS.md](.claude/AGENT_COMPONENTS.md) |
| 6   | **Test**       | 테스트 전문가 (Vitest, Storybook)       | [.claude/AGENT_TEST.md](.claude/AGENT_TEST.md)             |

### 작업 흐름

**Phase 1: 기반 구축**

```
1. Architect (필수 선행) → 2. Styles (순차)
```

**Phase 2: 핵심 로직 (병렬 가능)**

```
3. State ←→ 4. Services (동시 작업 가능)
```

**Phase 3: UI 구축**

```
5. Components (State, Services 완료 후) → 6. Test (마지막)
```

**자세한 가이드**: [.claude/AGENT_TEAMS.md](.claude/AGENT_TEAMS.md), [.claude/README.md](.claude/README.md)

---

## 🛠 기술 스택

```yaml
Frontend:
  - React 18 + TypeScript
  - Vite (빌드 도구)
  - react-rnd (드래그 & 리사이징)
  - Lightweight Charts (TradingView 차트)
  - Tailwind CSS + CSS Modules
  - tailwind-merge + clsx (클래스 유틸리티)
  - Glassmorphism 디자인
  - react-i18next (한국어, English)
  - Storybook (컴포넌트 개발)
  - Vitest + React Testing Library (TDD)
  - Zustand (전역 상태 관리)
  - react-hook-form + zod (폼 관리)
  - GSAP (애니메이션)
  - React Portal (모달, 토스트)
  - Suspense + Error Boundary

Backend:
  - Vercel Serverless Functions (API Proxy)

APIs:
  - Finnhub (실시간 가격, 서버 측 프록시 /api/stock-proxy)
  - Yahoo Finance (차트 OHLCV 데이터, 무료 API)
  - REST API Polling

Storage:
  - LocalStorage (암호화/Base64)

Analytics:
  - Google Analytics 4
  - Sentry (에러 추적)

Deployment:
  - Vercel

Architecture:
  - Custom Hooks Pattern (비즈니스 로직 분리)
  - Atomic Design Pattern (Atoms → Molecules → Organisms → Templates → Pages)
  - Components: UI만
  - Hooks: 비즈니스 로직
  - Services: 외부 통신
  - Utils: 순수 함수

Development:
  - TDD (Test-Driven Development)
  - Storybook (컴포넌트 독립 개발)
  - i18n (한국어/English)
```

---

## 🏗 프로젝트 구조

```
stock-desk/
├── src/
│   ├── components/              # UI 컴포넌트만 (비즈니스 로직 없음)
│   │   ├── Header/
│   │   ├── StockBox/
│   │   ├── SearchModal/
│   │   ├── SettingsModal/
│   │   ├── LandingPage/
│   │   └── ErrorModal/
│   ├── hooks/                   # 비즈니스 로직 (Custom Hooks)
│   │   ├── useStockBox.ts
│   │   ├── useStockData.ts
│   │   ├── useDragAndResize.ts
│   │   └── useLocalStorage.ts
│   ├── services/                # API 호출 및 외부 서비스
│   │   ├── api/
│   │   ├── websocket/
│   │   └── storage/
│   ├── utils/                   # 유틸리티 함수
│   │   ├── cn.ts                # tailwind-merge + clsx
│   │   └── formatters.ts
│   ├── types/                   # TypeScript 타입
│   ├── constants/               # 상수
│   └── styles/                  # 글로벌 스타일
│       ├── globals.css          # Tailwind + 글로벌
│       └── themes.css           # 테마 변수
├── api/                         # Vercel Serverless Functions
│   ├── stock-proxy.ts
│   └── exchange-rate.ts
├── tailwind.config.js           # Tailwind 설정
└── postcss.config.js
```

---

## 🎨 CSS 전략 (중요!)

### Tailwind CSS + CSS Modules + tailwind-merge + clsx

**자세한 내용은 [CSS_ARCHITECTURE.md](./CSS_ARCHITECTURE.md)를 참조하세요.**

#### 핵심 원칙

- ✅ Tailwind 우선 사용 (90%)
- ✅ 복잡한 스타일만 CSS Modules
- ✅ cn() 함수로 클래스 병합
- ❌ **!important 절대 사용 금지**

#### 유틸리티 함수

```ts
// src/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 사용 예시

```tsx
import { cn } from "@/utils/cn";

<div
  className={cn(
    "glass rounded-xl p-4",
    focused && "z-50 shadow-2xl",
    !focused && "opacity-70 blur-sm"
  )}
/>;
```

---

## 🏗 아키텍처: Custom Hooks Pattern

### 책임 분리 원칙

| 레이어         | 책임          | 예시                              |
| -------------- | ------------- | --------------------------------- |
| **Components** | UI 렌더링만   | JSX, 스타일, 이벤트 핸들러 연결   |
| **Hooks**      | 비즈니스 로직 | 상태 관리, 데이터 fetching, 계산  |
| **Services**   | 외부 통신     | API 호출, WebSocket, LocalStorage |
| **Utils**      | 순수 함수     | 포맷팅, 변환, 유효성 검사         |

### 코드 예시

#### ✅ 좋은 예 (로직 분리)

**Custom Hook (비즈니스 로직)**

```tsx
// hooks/useStockBox.ts
export const useStockBox = (symbol: string) => {
  const { data, loading } = useStockData(symbol);
  const { position, size, handleDragStop } = useDragAndResize(symbol);

  return { data, loading, position, size, handleDragStop };
};
```

**Component (UI만)**

```tsx
// components/StockBox/StockBox.tsx
import { useStockBox } from "@/hooks/useStockBox";
import { cn } from "@/utils/cn";

export const StockBox = ({ symbol, focused }) => {
  const { data, loading, position, size, handleDragStop } = useStockBox(symbol);

  if (loading) return <div>Loading...</div>;

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={handleDragStop}
      className={cn("glass rounded-xl p-4", focused && "z-50")}
    >
      <h3>{symbol}</h3>
      <p>${data.price}</p>
    </Rnd>
  );
};
```

---

## 📋 개발 원칙

### 1. CSS 우선순위

- ✅ Tailwind 우선 사용
- ✅ 복잡한 스타일만 CSS Modules
- ✅ cn() 함수로 클래스 병합
- ❌ !important 절대 사용 금지

### 2. 비즈니스 로직 분리

- ✅ 컴포넌트는 UI만 (JSX, 스타일)
- ✅ 로직은 Custom Hooks로 분리
- ❌ 컴포넌트에 복잡한 로직 금지

### 3. 타입 안정성

- ✅ 모든 함수/컴포넌트 타입 정의
- ✅ any 타입 사용 금지
- ✅ Interface 우선, Type은 필요 시

### 4. 재사용성

- ✅ Hook은 독립적으로 재사용 가능하게
- ✅ 컴포넌트는 작고 단일 책임
- ✅ Utils는 순수 함수로

### 5. Import 경로 규칙 (Barrel 패턴)

**레이어 barrel을 통해 import합니다. 개별 파일 경로 직접 접근 금지.**

```ts
// ✅ 올바른 방법
import { Header, SearchModal } from "@/components/organisms";
import { PriceDisplay, StockChart } from "@/components/molecules";
import { Button } from "@/components/atoms";
import { useStockData, useIsMobile } from "@/hooks";
import { useStockStore, useSettingsStore } from "@/stores";

// ❌ 금지 — 개별 파일 직접 접근
import { Header } from "@/components/organisms/Header/Header";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettingsStore } from "@/stores/settingsStore";
```

**예외 (직접 접근 허용):**

- `@/services/api/...`, `@/services/websocket/...` — 서비스 파일
- `@/utils/cn`, `@/utils/formatters` — 유틸리티 함수
- `@/types/...`, `@/constants/...` — 타입 및 상수
- hooks 파일 내부에서 다른 hook 참조 시 (순환 참조 방지)

**새 파일 추가 시 반드시 해당 레이어 `index.ts`에 export를 추가해야 합니다.**
자세한 내용: [docs/architecture/import-conventions.md](./docs/architecture/import-conventions.md)

### 6. 코드 품질 및 커밋 규칙

- ✅ **Prettier**: 저장 시 자동 포맷팅 (VSCode)
- ✅ **ESLint**: 코드 스타일 및 오류 자동 수정
- ✅ **Husky**: Git Hooks로 품질 자동 관리
  - `pre-commit`: 커밋 전 포맷팅 & 린트
  - `commit-msg`: Conventional Commits 검증
  - `pre-push`: 타입 체크 & 테스트 실행
- ✅ **Conventional Commits**: 일관된 커밋 메시지
  - 형식: `<type>: <subject>` 또는 `<type>(<scope>): <subject>`
  - Type: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
  - 예시: `feat: 실시간 환율 기능 추가`, `fix(chart): 가격 표시 오류 수정`
- ✅ **lint-staged**: 스테이징된 파일만 검사 (속도 최적화)
- 📚 **자세한 가이드**: [.husky/README.md](.husky/README.md)

---

## 📦 package.json 의존성

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-rnd": "^10.4.1",
    "lightweight-charts": "^4.1.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.0",
    "i18next-browser-languagedetector": "^7.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0",
    "@storybook/react": "^7.6.0",
    "@storybook/react-vite": "^7.6.0",
    "@storybook/addon-essentials": "^7.6.0",
    "prettier": "^3.2.4",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "husky": "^9.0.10",
    "lint-staged": "^15.2.0",
    "@commitlint/cli": "^18.6.0",
    "@commitlint/config-conventional": "^18.6.0"
  }
}
```

---

## 🧪 TDD & Storybook

### TDD 워크플로우

```
1. 테스트 작성 (Red)
   ↓
2. 최소 구현 (Green)
   ↓
3. 리팩토링 (Refactor)
```

### Storybook 사용

```bash
# Storybook 실행
npm run storybook

# 테스트 실행
npm run test
```

### Atomic Design 구조

- **Atoms**: Button, Input, Icon
- **Molecules**: SearchInput, PriceDisplay
- **Organisms**: Header, StockBox
- **Templates**: MainLayout
- **Pages**: MainPage

**자세한 내용은 [TDD_STORYBOOK_I18N.md](./TDD_STORYBOOK_I18N.md)를 참조하세요.**

---

## 🌍 i18n (다국어)

### 사용 예시

```tsx
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("header.exchangeRate")}</h1>
      <button onClick={() => i18n.changeLanguage("en")}>
        {i18n.language === "ko" ? "EN" : "KO"}
      </button>
    </div>
  );
};
```

**자세한 내용은 [TDD_STORYBOOK_I18N.md](./TDD_STORYBOOK_I18N.md)를 참조하세요.**

---

## 🚀 개발 시작

### 1. 프로젝트 초기화

```bash
npm create vite@latest . -- --template react-ts
npm install react-rnd lightweight-charts clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Tailwind 설정

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "up-kr": "#ff0000",
        "down-kr": "#0000ff",
      },
    },
  },
};
```

### 3. 글로벌 스타일

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .glass {
    @apply border border-white/20 bg-white/10 backdrop-blur-lg;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }
}
```

---

## 📝 체크리스트

### 필수 구현 사항

- [ ] Tailwind CSS + CSS Modules 설정
- [ ] cn() 유틸리티 함수 생성
- [ ] Custom Hooks 패턴 적용
- [ ] react-rnd로 드래그 & 리사이징
- [ ] Lightweight Charts 통합
- [ ] Finnhub API 연동 (Serverless 프록시, 실시간 가격)
- [ ] Yahoo Finance API 연동 (차트 데이터)
- [ ] REST API Polling 실시간 업데이트
- [ ] LocalStorage 암호화 저장
- [ ] 다크/라이트 모드
- [ ] Glassmorphism 디자인
- [ ] Z-index & Blur 효과

---

## 🎯 최종 목표

- ✅ 실시간 주식 데이터 표시
- ✅ 부드러운 드래그 & 리사이징
- ✅ 브라우저 재시작 후에도 상태 유지
- ✅ 모바일/데스크톱 모두 원활한 UX
- ✅ 빠른 로딩 속도 (< 3초)
- ✅ 에러 없는 안정적인 동작
- ✅ 아름다운 Glassmorphism 디자인

---

**작성일**: 2026-02-15
**프로젝트 경로**: `/Users/jm4293/Project/stock-desk`
