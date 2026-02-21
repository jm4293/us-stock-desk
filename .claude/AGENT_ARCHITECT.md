# 🏗️ Agent 1: Architect (설계자)

> 프로젝트의 뼈대를 만드는 설계 전문가

## 🎯 역할

프로젝트의 기반 구조를 설계하고 구축합니다.

- 폴더 구조 생성
- 설정 파일 작성 (TypeScript, Vite, ESLint 등)
- 핵심 타입 정의
- 경로 별칭 설정
- 다른 에이전트가 사용할 인터페이스 정의

## 📋 작업 범위

### ✅ 작업 대상

- `tsconfig.json` - TypeScript 설정
- `vite.config.ts` - Vite 설정 (경로 별칭 포함)
- `vitest.config.ts` - 테스트 설정
- `.eslintrc.cjs` - ESLint 설정
- `.eslintignore` - ESLint 제외 파일
- `.prettierrc` - Prettier 설정
- `.prettierignore` - Prettier 제외 파일
- `commitlint.config.js` - Commitlint 설정
- `.gitmessage` - Git 커밋 메시지 템플릿
- `.husky/` - Git Hooks
  - `pre-commit` - 커밋 전 lint-staged 실행
  - `commit-msg` - 커밋 메시지 검증
  - `pre-push` - 푸시 전 타입 체크 & 테스트
- `.vscode/settings.json` - VSCode 자동 포맷팅 설정
- `.vscode/extensions.json` - 권장 확장 프로그램
- `src/types/` - 모든 타입 정의
- `src/constants/` - 상수 정의
- 폴더 구조 생성

### ❌ 작업 제외

- 스타일 관련 (Styles 에이전트)
- 비즈니스 로직 (State, Services 에이전트)
- UI 컴포넌트 (Components 에이전트)
- 테스트 코드 (Test 에이전트)

## 📚 필수 읽기 문서

1. **CLAUDE.md** - 프로젝트 전체 구조
2. **docs/requirements.md** - 요구사항
3. **docs/architecture/tech-stack.md** - 기술 스택
4. **docs/guides/git-workflow.md** - Git 브랜치 전략 (feature/architect-\* 브랜치로 작업)

## 📂 생성할 폴더 구조

```
src/
├── components/           # UI 컴포넌트 (Components 에이전트)
│   ├── atoms/           # Button, Input, Icon 등
│   ├── molecules/       # SearchInput, PriceDisplay 등
│   ├── organisms/       # Header, StockBox 등
│   ├── templates/       # MainLayout 등
│   └── pages/           # MainPage, LandingPage 등
├── hooks/               # Custom Hooks (Components 에이전트)
├── stores/              # Zustand 스토어 (State 에이전트)
├── services/            # 외부 서비스 (Services 에이전트)
│   ├── api/
│   ├── websocket/
│   └── storage/
├── utils/               # 유틸리티 함수
│   └── cn.ts            # (Styles 에이전트가 작성)
├── types/               # ✅ 여기서 작업
│   ├── stock.ts
│   ├── api.ts
│   ├── store.ts
│   └── common.ts
├── constants/           # ✅ 여기서 작업
│   ├── api.ts
│   └── app.ts
├── styles/              # 글로벌 스타일 (Styles 에이전트)
├── App.tsx              # ✅ 여기서 작업 (기본 구조만)
└── main.tsx             # ✅ 여기서 작업
```

## 🔧 작업 순서

### 1단계: 설정 파일 생성

#### 1.1 TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/services/*": ["./src/services/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 1.2 Vite 설정

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/constants": path.resolve(__dirname, "./src/constants"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          charts: ["lightweight-charts"],
        },
      },
    },
  },
});
```

#### 1.3 ESLint 설정

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "jsx-a11y"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
  },
};
```

#### 1.4 Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

### 2단계: 타입 정의

#### 2.1 Stock Types

```typescript
// src/types/stock.ts
export interface StockBox {
  id: string;
  symbol: string;
  companyName: string;
  position: Position;
  size: Size;
  zIndex: number;
  created: number;
  updated: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface StockPrice {
  symbol: string;
  current: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface StockChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartTimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";
export type MarketStatus = "open" | "closed" | "pre" | "post";
```

#### 2.2 API Types

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface FinnhubQuote {
  c: number; // current
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

export interface FinnhubCandle {
  c: number[]; // close
  h: number[]; // high
  l: number[]; // low
  o: number[]; // open
  s: string; // status
  t: number[]; // timestamp
  v: number[]; // volume
}

export interface WebSocketMessage {
  type: "trade" | "ping" | "error";
  data: any;
}
```

#### 2.3 Store Types

```typescript
// src/types/store.ts
export interface StockState {
  stocks: StockBox[];
  focusedStockId: string | null;
  maxZIndex: number;
}

export interface StockActions {
  addStock: (symbol: string, companyName: string) => void;
  removeStock: (id: string) => void;
  updatePosition: (id: string, position: Position) => void;
  updateSize: (id: string, size: Size) => void;
  setFocused: (id: string | null) => void;
  bringToFront: (id: string) => void;
}

export interface SettingsState {
  theme: "light" | "dark";
  language: "ko" | "en";
  colorScheme: "kr" | "us";
  currency: "USD" | "KRW";
}

export interface SettingsActions {
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: "ko" | "en") => void;
  setColorScheme: (scheme: "kr" | "us") => void;
  setCurrency: (currency: "USD" | "KRW") => void;
}
```

#### 2.4 Common Types

```typescript
// src/types/common.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface Loadable<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

### 3단계: 상수 정의

#### 3.1 API 상수

```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  FINNHUB_BASE: "https://finnhub.io/api/v1",
  PROXY_BASE: "/api",
} as const;

export const WEBSOCKET_URL = "wss://ws.finnhub.io";

export const POLLING_INTERVAL = 10000; // 10초
export const RECONNECT_DELAY = 3000; // 3초
export const MAX_RECONNECT_ATTEMPTS = 5;
```

#### 3.2 App 상수

```typescript
// src/constants/app.ts
export const STORAGE_KEYS = {
  STOCKS: "stockdesk_stocks_v1",
  SETTINGS: "stockdesk_settings_v1",
  THEME: "stockdesk_theme_v1",
  LAYOUT: "stockdesk_layout_v1",
  CACHE: "stockdesk_cache_v1",
} as const;

export const STOCK_BOX = {
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 300,
} as const;

export const CHART_RANGES = {
  "1D": { label: "1일", days: 1 },
  "1W": { label: "1주", days: 7 },
  "1M": { label: "1개월", days: 30 },
  "3M": { label: "3개월", days: 90 },
  "6M": { label: "6개월", days: 180 },
  "1Y": { label: "1년", days: 365 },
} as const;
```

### 4단계: 기본 파일 생성

#### 4.1 main.tsx

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 4.2 App.tsx (기본 구조만)

```typescript
// src/App.tsx
import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>US Stock Desk</h1>
      <p>Agent Teams 개발 시작</p>
    </div>
  );
}

export default App;
```

#### 4.3 index.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="미국주식 실시간 모니터링 대시보드" />
    <title>US Stock Desk</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## ✅ 완료 체크리스트

### 설정 파일

- [ ] `tsconfig.json` 생성
- [ ] `tsconfig.node.json` 생성
- [ ] `vite.config.ts` 생성 (경로 별칭 포함)
- [ ] `vitest.config.ts` 생성
- [ ] `.eslintrc.cjs` 생성
- [ ] `.prettierrc` 생성

### 폴더 구조

- [ ] `src/components/` 폴더 생성 (atoms, molecules, organisms, templates, pages)
- [ ] `src/hooks/` 폴더 생성
- [ ] `src/stores/` 폴더 생성
- [ ] `src/services/api/` 폴더 생성
- [ ] `src/services/websocket/` 폴더 생성
- [ ] `src/services/storage/` 폴더 생성
- [ ] `src/utils/` 폴더 생성
- [ ] `src/types/` 폴더 생성
- [ ] `src/constants/` 폴더 생성
- [ ] `src/styles/` 폴더 생성

### 타입 정의

- [ ] `src/types/stock.ts` 생성
- [ ] `src/types/api.ts` 생성
- [ ] `src/types/store.ts` 생성
- [ ] `src/types/common.ts` 생성

### 상수 정의

- [ ] `src/constants/api.ts` 생성
- [ ] `src/constants/app.ts` 생성

### 기본 파일

- [ ] `src/main.tsx` 생성
- [ ] `src/App.tsx` 생성 (기본 구조)
- [ ] `index.html` 생성

### 검증

- [ ] `npm install` 실행 성공
- [ ] `npm run dev` 실행 가능
- [ ] ESLint 에러 없음
- [ ] TypeScript 컴파일 에러 없음

## 🤝 다음 에이전트에게 전달

Architect 작업 완료 후 다음 에이전트에게 전달:

```
✅ Architect 작업 완료

생성된 결과물:
- 프로젝트 설정 파일 완료
- 폴더 구조 생성 완료
- 타입 정의 완료
- 상수 정의 완료

다음 에이전트: Agent 2 (Styles)
전달 메시지: "AGENT_STYLES.md를 읽고 Tailwind 설정을 시작해주세요"
```

---

**담당**: 프로젝트 기반 구조
**의존성**: 없음 (시작점)
**다음 에이전트**: Styles
