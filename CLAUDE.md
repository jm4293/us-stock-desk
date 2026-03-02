# US Stock Desk - Claude AI 개발 가이드

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
  - React 19 + TypeScript 5.3
  - Vite 7 (빌드 도구)
  - react-rnd (데스크톱 드래그 & 리사이징)
  - @dnd-kit/sortable (모바일 정렬)
  - Lightweight Charts (TradingView 차트)
  - Tailwind CSS (100% - CSS Modules 없음)
  - tailwind-merge + clsx (클래스 유틸리티)
  - Glassmorphism 디자인
  - react-i18next (한국어, English)
  - Storybook 8 (컴포넌트 개발)
  - Vitest 4 + React Testing Library 16 (TDD)
  - Zustand 4 (전역 상태 관리 with immer + persist + devtools)
  - React Portal (모달, 토스트)
  - Suspense + Error Boundary

Backend:
  - Vercel Serverless Functions (API Proxy)

APIs:
  - Finnhub (실시간 가격, 서버 측 프록시 /api/stock-proxy)
  - Yahoo Finance WebSocket (실시간 가격 - 우선순위)
  - Yahoo Finance API (차트 OHLCV 데이터)
  - Extended Hours Support (Pre-market, Post-market)

Storage:
  - LocalStorage (Base64 인코딩)

Deployment:
  - Vercel

Architecture:
  - Custom Hooks Pattern (비즈니스 로직 분리)
  - Feature-based Pattern (복잡한 기능 모듈화)
  - Components: 기본 UI 컴포넌트
  - Features: 완전한 기능 모듈 (컴포넌트 + 로직)
  - Hooks: 비즈니스 로직
  - Stores: Zustand 상태 관리
  - Services: 외부 통신 (API, WebSocket)
  - Utils: 순수 함수

Development:
  - TDD (Test-Driven Development)
  - Storybook (컴포넌트 독립 개발)
  - ESLint Flat Config (eslint.config.js)
  - Prettier (import sorting + Tailwind class sorting)
  - Husky Git Hooks (pre-commit, commit-msg, pre-push)
  - Conventional Commits
  - i18n (한국어/English)
```

---

## 🏗 프로젝트 구조

```
us-stock-desk/
├── src/
│   ├── components/              # 기본 UI 컴포넌트 (재사용 가능한 빌딩 블록)
│   │   ├── badge/               # Badge 컴포넌트
│   │   ├── button/              # Button 컴포넌트 (variant 포함)
│   │   ├── desktop-layout/      # 데스크톱 레이아웃 래퍼
│   │   ├── empty-state/         # 빈 상태 UI
│   │   ├── header/              # 앱 헤더 (환율, 시간)
│   │   ├── input/               # Input 컴포넌트
│   │   ├── mobile-layout/       # 모바일 레이아웃 래퍼
│   │   ├── modal/               # 모달 컴포넌트
│   │   ├── search-input/        # 검색 입력 컴포넌트
│   │   ├── splash-screen/       # 로딩 스플래시
│   │   ├── toast/               # 토스트 알림
│   │   └── index.ts             # Barrel export
│   │
│   ├── features/                # 기능 모듈 (완전한 기능 단위)
│   │   ├── KST-clock/           # 한국 시간 시계
│   │   ├── desktop-stock-box/   # 드래그 가능한 주식 박스 (데스크톱)
│   │   ├── market-index-bar/    # 시장 지수 표시 바
│   │   ├── mobile-stock-box/    # 모바일 주식 박스
│   │   ├── network-offline-banner/  # 오프라인 배너
│   │   ├── price-display/       # 가격 표시 (시장 상태 포함)
│   │   ├── search-modal/        # 종목 검색 모달
│   │   ├── settings-modal/      # 설정 모달
│   │   ├── stock-chart/         # 주식 차트 (Lightweight Charts)
│   │   └── index.ts             # Barrel export
│   │
│   ├── hooks/                   # 커스텀 Hook (비즈니스 로직)
│   │   ├── use-app-init.ts      # 앱 초기화
│   │   ├── use-apply-theme.ts   # 테마 적용
│   │   ├── use-chart-data.ts    # 차트 데이터
│   │   ├── use-exchange-rate.ts # 환율 데이터
│   │   ├── use-flash-border.ts  # 가격 변동 플래시 효과
│   │   ├── use-full-screen.ts   # 전체화면 토글
│   │   ├── use-index-data.ts    # 시장 지수 데이터
│   │   ├── use-is-mobile.ts     # 모바일 감지
│   │   ├── use-language.ts      # 언어 전환
│   │   ├── use-market-status.ts # 시장 상태 (pre, open, post, closed)
│   │   ├── use-network-status.ts# 네트워크 상태
│   │   ├── use-stock-data.ts    # 주식 가격 데이터
│   │   ├── use-wake-lock.ts     # 화면 절전 방지
│   │   └── index.ts             # Barrel export
│   │
│   ├── stores/                  # Zustand 상태 관리
│   │   ├── settings-store.ts    # 설정 (테마, 언어, 통화, 색상)
│   │   ├── stock-box-store.ts   # 주식 박스 상태
│   │   ├── stock-index-store.ts # 시장 지수 상태
│   │   ├── toast-store.ts       # 토스트 알림
│   │   ├── ui-store.ts          # UI 상태 (모달, 로딩)
│   │   └── index.ts             # Barrel export (resetAllStores 포함)
│   │
│   ├── services/                # 외부 서비스
│   │   ├── api/
│   │   │   ├── fetch-finnhub.ts    # Finnhub API
│   │   │   └── fetch-yahoo-chart.ts# Yahoo Finance API
│   │   └── websocket/
│   │       ├── stock-socket.ts     # 주식 WebSocket
│   │       └── yahoo-socket.ts     # Yahoo WebSocket
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   ├── cn/
│   │   │   └── cn.ts            # tailwind-merge + clsx
│   │   ├── date/
│   │   │   └── date.ts          # 날짜 포맷팅
│   │   ├── formatters/
│   │   │   └── formatters.ts    # 숫자, 가격 포맷팅
│   │   └── number/
│   │       └── number.ts        # 숫자 유틸리티
│   │
│   ├── types/                   # TypeScript 타입
│   │   ├── chart.ts             # 차트 타입
│   │   ├── market.ts            # 시장 상태 타입
│   │   └── stock.ts             # 주식 데이터 타입
│   │
│   ├── constants/               # 상수
│   │   ├── chart.ts             # 차트 상수
│   │   ├── colors.ts            # 색상 상수
│   │   ├── storage.ts           # 저장소 키
│   │   └── stocks.ts            # 주식 심볼, 지수
│   │
│   ├── i18n/                    # 국제화
│   │   ├── locales/
│   │   │   ├── ko.json          # 한국어 번역
│   │   │   └── en.json          # 영어 번역
│   │   └── index.ts             # i18n 설정
│   │
│   ├── styles/                  # 글로벌 스타일
│   │   ├── globals.css          # Tailwind + 글로벌 스타일
│   │   └── themes.css           # 테마 변수
│   │
│   ├── test/                    # 테스트 설정
│   │   └── setup.ts             # Vitest 설정
│   │
│   ├── App.tsx                  # 메인 앱 컴포넌트
│   ├── main.tsx                 # 엔트리 포인트
│   └── vite-env.d.ts            # Vite 타입 정의
│
├── api/                         # Vercel Serverless Functions
│   └── stock-proxy.ts           # Finnhub API 프록시
│
├── .claude/                     # Claude AI 에이전트 설정
├── docs/                        # 프로젝트 문서
├── public/                      # 정적 파일
├── .storybook/                  # Storybook 설정
├── eslint.config.js             # ESLint Flat Config
├── tailwind.config.js           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
└── vite.config.ts               # Vite 설정
```

### 📁 디렉터리 구조 설명

#### **Components vs Features**

- **Components** (`src/components/`)
  - 기본 UI 빌딩 블록
  - 재사용 가능한 단순 컴포넌트
  - 비즈니스 로직 최소화
  - 예: Button, Input, Modal, Badge

- **Features** (`src/features/`)
  - 완전한 기능 모듈
  - 복잡한 비즈니스 로직 포함
  - 여러 컴포넌트 조합
  - 예: DesktopStockBox, SearchModal, StockChart

#### **파일 명명 규칙**

- **파일명**: `kebab-case` (예: `desktop-stock-box.tsx`)
- **컴포넌트명**: `PascalCase` (예: `DesktopStockBox`)
- **Hook명**: `camelCase` with `use` prefix (예: `useStockData`)
- **Store명**: `camelCase` with `use` prefix (예: `useStockBoxStore`)

#### **파일 구조 패턴**

각 컴포넌트/피처 디렉터리는 다음 구조를 따릅니다:

```
component-name/
├── component-name.tsx        # 메인 컴포넌트
├── component-name.test.tsx   # 테스트
├── component-name.stories.tsx # Storybook 스토리
└── index.ts                   # Barrel export
```

---

## 🎨 CSS 전략 (중요!)

### 100% Tailwind CSS + tailwind-merge + clsx

**자세한 내용은 [docs/architecture/css.md](./docs/architecture/css.md)를 참조하세요.**

#### 핵심 원칙

- ✅ **Tailwind CSS 100% 사용 (CSS Modules 사용 안 함)**
- ✅ cn() 함수로 조건부 클래스 병합
- ✅ 글로벌 스타일은 `@layer utilities`로 정의
- ❌ **!important 절대 사용 금지**
- ❌ **CSS Modules 사용 금지**

#### 유틸리티 함수

```ts
// src/utils/cn/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 사용 예시

```tsx
import { cn } from "@/utils/cn/cn";

<div
  className={cn(
    "glass rounded-xl p-4",
    focused && "z-50 shadow-2xl",
    !focused && "opacity-70 blur-sm"
  )}
/>;
```

#### 커스텀 색상

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        "up-kr": "#ff0000", // 한국식 상승: 빨강
        "down-kr": "#0000ff", // 한국식 하락: 파랑
        "up-us": "#22c55e", // 미국식 상승: 초록
        "down-us": "#ef4444", // 미국식 하락: 빨강
      },
    },
  },
};
```

---

## 🏗 아키텍처: Custom Hooks Pattern

### 책임 분리 원칙

| 레이어         | 책임              | 예시                               |
| -------------- | ----------------- | ---------------------------------- |
| **Components** | 기본 UI 빌딩 블록 | Button, Input, Modal, Badge        |
| **Features**   | 완전한 기능 모듈  | 컴포넌트 + 비즈니스 로직 통합      |
| **Hooks**      | 비즈니스 로직     | 상태 관리, 데이터 fetching, 계산   |
| **Stores**     | 전역 상태 관리    | Zustand 스토어 (persist, devtools) |
| **Services**   | 외부 통신         | API 호출, WebSocket                |
| **Utils**      | 순수 함수         | 포맷팅, 변환, 유효성 검사          |

### 코드 예시

#### ✅ 좋은 예 (Component: 기본 UI)

**기본 컴포넌트 (UI만, 재사용 가능)**

```tsx
// src/components/button/button.tsx
import { cn } from "@/utils/cn/cn";

interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary";
}

export const Button = ({ variant = "primary", className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 font-medium transition-colors",
        variant === "primary" && "bg-blue-500 hover:bg-blue-600",
        variant === "secondary" && "bg-gray-500 hover:bg-gray-600",
        className
      )}
      {...props}
    />
  );
};

Button.displayName = "Button";
```

#### ✅ 좋은 예 (Feature: 기능 모듈)

**피처 컴포넌트 (로직 통합, 여러 컴포넌트 조합)**

```tsx
// src/features/desktop-stock-box/desktop-stock-box.tsx
import { PriceDisplay } from "@/features";
import { useStockData } from "@/hooks";
import { Rnd } from "react-rnd";
import { cn } from "@/utils/cn/cn";

interface StockBoxProps {
  symbol: string;
  focused: boolean;
}

export const DesktopStockBox = ({ symbol, focused }: StockBoxProps) => {
  const { state: priceState } = useStockData(symbol);

  return (
    <Rnd className={cn("glass rounded-xl p-4", focused && "z-50")}>
      <PriceDisplay
        price={priceState.status === "success" ? priceState.data : undefined}
        loading={priceState.status === "loading"}
        symbol={symbol}
      />
    </Rnd>
  );
};

DesktopStockBox.displayName = "DesktopStockBox";
```

#### ✅ 좋은 예 (Hook: 비즈니스 로직)

**커스텀 Hook (데이터 fetching, 상태 관리)**

```tsx
// src/hooks/use-stock-data.ts
import { useEffect, useRef, useState } from "react";
import { finnhubApi } from "@/services/api/fetch-finnhub";
import { yahooSocket } from "@/services/websocket/yahoo-socket";

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export function useStockData(symbol: string) {
  const [state, setState] = useState<AsyncState<StockPrice>>({ status: "idle" });
  const currentData = useRef<StockPrice | null>(null);

  useEffect(() => {
    // WebSocket 연결 시도 (우선순위)
    const unsubscribe = yahooSocket.subscribe(symbol, (data) => {
      currentData.current = data;
      setState({ status: "success", data });
    });

    // Polling fallback
    const interval = setInterval(fetchPrice, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [symbol]);

  return { state, refetch: fetchPrice };
}
```

#### ✅ 좋은 예 (Store: 전역 상태)

**Zustand Store (persist + devtools + immer)**

```tsx
// src/stores/settings-store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface SettingsStore {
  theme: "light" | "dark";
  language: "ko" | "en";
  colorScheme: "kr" | "us";
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: "ko" | "en") => void;
  setColorScheme: (colorScheme: "kr" | "us") => void;
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      immer((set) => ({
        theme: "dark",
        language: "ko",
        colorScheme: "kr",
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        setColorScheme: (colorScheme) => set({ colorScheme }),
      })),
      {
        name: "settings",
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            return str ? JSON.parse(atob(str)) : null;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, btoa(JSON.stringify(value)));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    )
  )
);

// Selectors
export const selectTheme = (state: SettingsStore) => state.theme;
export const selectSetTheme = (state: SettingsStore) => state.setTheme;
```

---

## 📋 개발 원칙

### 1. CSS 전략

- ✅ **Tailwind CSS 100% 사용**
- ✅ cn() 함수로 조건부 클래스 병합
- ✅ 커스텀 유틸리티 클래스는 `@layer utilities`로 정의
- ❌ **CSS Modules 사용 금지**
- ❌ **!important 절대 사용 금지**

### 2. 컴포넌트 vs 피처

- ✅ **Components**: 기본 UI 빌딩 블록 (Button, Input, Modal 등)
- ✅ **Features**: 완전한 기능 모듈 (컴포넌트 + 로직 통합)
- ✅ 비즈니스 로직은 Custom Hooks로 분리
- ❌ 컴포넌트에 복잡한 로직 직접 작성 금지

### 3. 타입 안정성

- ✅ 모든 함수/컴포넌트 타입 정의
- ✅ any 타입 사용 금지
- ✅ Interface 우선, Type은 필요 시

### 4. 재사용성

- ✅ Hook은 독립적으로 재사용 가능하게
- ✅ 컴포넌트는 작고 단일 책임
- ✅ Utils는 순수 함수로

### 5. Import 경로 규칙 (Barrel 패턴)

**레이어 barrel(`index.ts`)을 통해 import합니다. 개별 파일 경로 직접 접근 금지.**

```ts
// ✅ 올바른 방법
import { Button, Input, Modal } from "@/components";
import { PriceDisplay, DesktopStockBox, SearchModal } from "@/features";
import { useStockData, useIsMobile, useMarketStatus } from "@/hooks";
import { useStockBoxStore, useSettingsStore } from "@/stores";

// ❌ 금지 — 개별 파일 직접 접근
import { Button } from "@/components/button/button";
import { DesktopStockBox } from "@/features/desktop-stock-box/desktop-stock-box";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useSettingsStore } from "@/stores/settings-store";
```

**예외 (직접 접근 허용):**

- `@/services/api/...` — API 서비스 파일
- `@/services/websocket/...` — WebSocket 서비스 파일
- `@/utils/cn/cn`, `@/utils/formatters/formatters` — 유틸리티 함수
- `@/types/...` — TypeScript 타입
- `@/constants/...` — 상수 파일
- hooks 파일 내부에서 다른 hook 참조 시 (순환 참조 방지)

**새 파일 추가 시 반드시 해당 레이어 `index.ts`에 export를 추가해야 합니다.**

```ts
// src/components/index.ts
export * from "./button";
export * from "./input";
// ... 새 컴포넌트 추가

// src/features/index.ts
export * from "./desktop-stock-box";
export * from "./price-display";
// ... 새 피처 추가

// src/hooks/index.ts
export * from "./use-stock-data";
export * from "./use-is-mobile";
// ... 새 Hook 추가
```

자세한 내용: [docs/architecture/import-conventions.md](./docs/architecture/import-conventions.md)

### 6. 파일 명명 규칙

- ✅ **파일명**: `kebab-case` (예: `desktop-stock-box.tsx`, `use-stock-data.ts`)
- ✅ **컴포넌트명**: `PascalCase` (예: `DesktopStockBox`, `Button`)
- ✅ **Hook명**: `camelCase` with `use` prefix (예: `useStockData`, `useIsMobile`)
- ✅ **Store명**: `camelCase` with `use` prefix (예: `useStockBoxStore`)
- ✅ **displayName 설정**: 모든 컴포넌트에 명시적으로 설정
  ```tsx
  export const Button = () => {
    /* ... */
  };
  Button.displayName = "Button";
  ```

### 7. 코드 품질 및 커밋 규칙

- ✅ **ESLint**: Flat Config (`eslint.config.js`) 사용
  - TypeScript ESLint v8
  - Plugins: react-hooks, react-refresh, jsx-a11y, prettier
- ✅ **Prettier**: 저장 시 자동 포맷팅 (VSCode)
  - Import 자동 정렬 (`@trivago/prettier-plugin-sort-imports`)
  - Tailwind 클래스 자동 정렬 (`prettier-plugin-tailwindcss`)
  - Print width: 100
- ✅ **Husky**: Git Hooks로 품질 자동 관리
  - `pre-commit`: 커밋 전 포맷팅 & 린트 (lint-staged)
  - `commit-msg`: Conventional Commits 검증
  - `pre-push`: 타입 체크 & 테스트 실행
- ✅ **Conventional Commits**: 일관된 커밋 메시지
  - 형식: `<type>: <subject>` 또는 `<type>(<scope>): <subject>`
  - Type: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
  - 예시: `feat: 실시간 환율 기능 추가`, `fix(chart): 가격 표시 오류 수정`
- ✅ **lint-staged**: 스테이징된 파일만 검사 (속도 최적화)
- 📚 **자세한 가이드**: [.husky/README.md](.husky/README.md)

---

## 📦 주요 의존성

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-rnd": "^10.4.13",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^9.0.0",
    "lightweight-charts": "^4.2.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "react-i18next": "^15.2.0",
    "i18next": "^24.2.0",
    "i18next-browser-languagedetector": "^8.0.2",
    "zustand": "^5.0.4",
    "immer": "^10.1.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.3.3",
    "vite": "^7.0.4",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.1",
    "autoprefixer": "^10.4.20",
    "vitest": "^4.2.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.4",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.0.0",
    "@storybook/react": "^8.6.17",
    "@storybook/react-vite": "^8.6.17",
    "@storybook/addon-essentials": "^8.6.17",
    "@storybook/addon-a11y": "^8.6.17",
    "prettier": "^3.4.2",
    "@trivago/prettier-plugin-sort-imports": "^4.3.0",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "eslint": "^9.18.0",
    "@eslint/js": "^9.18.0",
    "typescript-eslint": "^8.20.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.1",
    "husky": "^9.1.7",
    "lint-staged": "^15.3.0",
    "@commitlint/cli": "^19.6.1",
    "@commitlint/config-conventional": "^19.6.0"
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

### 컴포넌트 구조

**이 프로젝트는 Atomic Design 대신 Components/Features 패턴을 사용합니다:**

- **Components** (`src/components/`): 기본 UI 빌딩 블록
  - Button, Input, Modal, Badge, Header 등

- **Features** (`src/features/`): 완전한 기능 모듈
  - DesktopStockBox, SearchModal, StockChart, PriceDisplay 등

**자세한 내용은 [docs/guides/tdd-storybook-i18n.md](./docs/guides/tdd-storybook-i18n.md)를 참조하세요.**

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

### 구현 완료 사항

- [x] Tailwind CSS 100% 적용
- [x] cn() 유틸리티 함수 (tailwind-merge + clsx)
- [x] Custom Hooks 패턴 (14개 Hook)
- [x] react-rnd로 드래그 & 리사이징 (데스크톱)
- [x] @dnd-kit/sortable로 정렬 (모바일)
- [x] Lightweight Charts 통합 (Lazy Loading)
- [x] Finnhub API 연동 (Serverless 프록시)
- [x] Yahoo Finance WebSocket (실시간 가격)
- [x] Yahoo Finance API (차트 데이터)
- [x] Extended Hours Support (Pre-market, Post-market)
- [x] LocalStorage Base64 인코딩 저장
- [x] Zustand 상태 관리 (persist + devtools + immer)
- [x] 다크/라이트 모드
- [x] Glassmorphism 디자인
- [x] Z-index & Blur 효과
- [x] 가격 변동 플래시 효과
- [x] 오프라인 배너
- [x] 토스트 알림
- [x] 한국어/English i18n
- [x] ESLint Flat Config
- [x] Prettier (import + Tailwind class sorting)
- [x] Husky Git Hooks
- [x] TDD (Vitest + React Testing Library)
- [x] Storybook 8

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
