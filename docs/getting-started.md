# US Stock Desk 개발 시작 가이드

> 실제 개발을 시작하기 위한 준비 체크리스트

## ✅ 완료된 작업

- [x] 📚 프로젝트 문서화
  - [x] CLAUDE.md - AI 개발 가이드
  - [x] PROJECT_REQUIREMENTS.md - 요구사항 명세
  - [x] CSS_ARCHITECTURE.md - CSS 전략
  - [x] TDD_STORYBOOK_I18N.md - 개발 방법론
  - [x] ADVANCED_TECH_STACK.md - 고급 기술 스택
  - [x] BUNDLE_OPTIMIZATION.md - 성능 최적화
  - [x] API_KEY_STRATEGY.md - API 키 관리
  - [x] README.md - 사용자 가이드
  - [x] CHANGELOG.md - 변경 이력

- [x] 🤖 Agent Teams 설정
  - [x] .claude/AGENT_ARCHITECT.md
  - [x] .claude/AGENT_STYLES.md
  - [x] .claude/AGENT_STATE.md
  - [x] .claude/AGENT_SERVICES.md
  - [x] .claude/AGENT_COMPONENTS.md
  - [x] .claude/AGENT_TEST.md
  - [x] .claude/AGENT_TEAMS.md

- [x] 🔧 코드 품질 도구
  - [x] Prettier 설정 (.prettierrc, .prettierignore)
  - [x] ESLint 설정 (.eslintrc.cjs, .eslintignore)
  - [x] Husky Git Hooks (.husky/pre-commit, commit-msg, pre-push)
  - [x] Commitlint (commitlint.config.js)
  - [x] lint-staged (package.json)
  - [x] VSCode 설정 (.vscode/settings.json, extensions.json)

- [x] 📦 패키지 관리
  - [x] package.json (의존성 정의)
  - [x] npm install (패키지 설치 완료)

---

## 🌿 개발 워크플로우

### Git 브랜치 전략

이 프로젝트는 **GitHub Flow** 전략을 사용합니다.

#### 브랜치 생성 규칙

```
feature/기능명       # 새로운 기능 개발
fix/버그명           # 버그 수정
docs/문서명          # 문서 작업
refactor/대상       # 리팩토링
style/대상          # 스타일링
test/대상           # 테스트
chore/작업명        # 빌드, 설정 등
```

#### Claude에게 작업 요청하는 방법

**예시 1: 기능 개발**

```
feature/stock-search 브랜치를 생성하고 주식 검색 기능을 개발해줘.

작업 내용:
1. SearchModal 컴포넌트 개발
2. API 연동
3. 테스트 작성

완료 후 커밋하고 PR 준비해줘.
```

**예시 2: Agent와 결합**

```
feature/project-setup 브랜치 생성 후

.claude/AGENT_ARCHITECT.md를 읽고 프로젝트 초기 설정해줘.

완료 후 커밋하고 PR 준비해줘.
```

**자세한 가이드**: **[Git 브랜치 전략 & Claude 작업 가이드](./guides/git-workflow.md)**

---

## 🚀 다음 단계: 프로젝트 초기화

### Phase 1: 기본 설정 파일 생성

#### 1. TypeScript 설정

```bash
□ tsconfig.json 생성
□ tsconfig.node.json 생성 (Vite용)
```

**파일 위치**: 프로젝트 루트

**참고 문서**: [.claude/AGENT_ARCHITECT.md#TypeScript-설정](.claude/AGENT_ARCHITECT.md)

---

#### 2. Vite 설정

```bash
□ vite.config.ts 생성
  - 경로 별칭 (@/) 설정
  - React plugin 설정
  - 빌드 최적화 설정
```

**파일 위치**: 프로젝트 루트

**참고 문서**: [BUNDLE_OPTIMIZATION.md](BUNDLE_OPTIMIZATION.md)

---

#### 3. Tailwind CSS 설정

```bash
□ tailwind.config.js 생성
□ postcss.config.js 생성
```

**참고 문서**: [CSS_ARCHITECTURE.md](CSS_ARCHITECTURE.md)

---

#### 4. Vitest 설정

```bash
□ vitest.config.ts 생성
□ vitest.setup.ts 생성
```

**참고 문서**: [TDD_STORYBOOK_I18N.md](TDD_STORYBOOK_I18N.md)

---

#### 5. 환경 변수

```bash
□ .env.example 생성
□ .env.local 생성 (gitignore됨, 개발자 전용)
```

**내용**:

```env
# .env.local (개발자 전용 — 일반 사용자는 불필요)
# Finnhub API 키: 서버 측 프록시에서만 사용, 클라이언트에 노출 없음
# Vercel 배포 시 Vercel 대시보드 환경변수에서 설정
FINNHUB_API_KEY=your_api_key_here
```

> **참고**: 일반 사용자는 API 키를 발급하거나 설정할 필요가 없습니다.
> 차트 데이터(Yahoo Finance)는 API 키 없이 무료로 사용됩니다.
> 실시간 가격(Finnhub)은 서버에서 처리되므로 사용자가 직접 관리하지 않아도 됩니다.

---

### Phase 2: HTML & 진입점

#### 6. HTML 템플릿

```bash
□ index.html 생성
  - 메타 태그 설정
  - 타이틀 설정
  - favicon 링크
```

---

#### 7. React 진입점

```bash
□ src/main.tsx 생성
□ src/App.tsx 생성 (기본 껍데기)
```

---

### Phase 3: 폴더 구조 생성

#### 8. src/ 폴더 구조

```bash
□ src/components/           # 기본 UI 컴포넌트 (재사용 가능한 빌딩 블록)
  □ badge/
  □ button/
  □ desktop-layout/
  □ empty-state/
  □ header/
  □ input/
  □ mobile-layout/
  □ modal/
  □ search-input/
  □ splash-screen/
  □ toast/
  □ index.ts               # Barrel export

□ src/features/            # 기능 모듈 (완전한 기능 단위)
  □ KST-clock/
  □ desktop-stock-box/
  □ market-index-bar/
  □ mobile-stock-box/
  □ network-offline-banner/
  □ price-display/
  □ search-modal/
  □ settings-modal/
  □ stock-chart/
  □ index.ts               # Barrel export

□ src/hooks/               # Custom Hooks (비즈니스 로직)
  □ use-app-init.ts
  □ use-apply-theme.ts
  □ use-chart-data.ts
  □ use-exchange-rate.ts
  □ use-flash-border.ts
  □ use-full-screen.ts
  □ use-index-data.ts
  □ use-is-mobile.ts
  □ use-language.ts
  □ use-market-status.ts
  □ use-network-status.ts
  □ use-stock-data.ts
  □ use-wake-lock.ts
  □ index.ts               # Barrel export

□ src/stores/              # Zustand 상태 관리
  □ stock-box-store.ts     # 주식 박스 상태
  □ settings-store.ts      # 앱 설정 (테마, 언어, 통화, 색상)
  □ ui-store.ts           # UI 상태 (모달, 로딩)
  □ toast-store.ts        # 토스트 알림
  □ stock-index-store.ts  # 시장 지수
  □ index.ts              # Barrel export + resetAllStores

□ src/services/            # 외부 서비스
  □ api/
    □ fetch-finnhub.ts    # Finnhub API (실시간 가격)
    □ fetch-yahoo-chart.ts # Yahoo Finance API (차트 데이터)
  □ websocket/
    □ stock-socket.ts     # Stock WebSocket
    □ yahoo-socket.ts     # Yahoo WebSocket (우선순위)

□ src/utils/               # 유틸리티 함수
  □ cn/
    □ cn.ts               # tailwind-merge + clsx
  □ date/
    □ date.ts             # 날짜 포맷팅
  □ formatters/
    □ formatters.ts       # 숫자, 가격 포맷팅
  □ number/
    □ number.ts           # 숫자 유틸리티

□ src/types/               # TypeScript 타입
  □ chart.ts              # 차트 타입
  □ market.ts             # 시장 상태 타입
  □ stock.ts              # 주식 데이터 타입

□ src/constants/           # 상수
  □ chart.ts              # 차트 상수
  □ colors.ts             # 색상 상수
  □ storage.ts            # 저장소 키
  □ stocks.ts             # 주식 심볼, 지수

□ src/i18n/                # 국제화
  □ locales/
    □ ko.json             # 한국어 번역
    □ en.json             # 영어 번역
  □ index.ts              # i18n 설정

□ src/styles/              # 글로벌 스타일
  □ globals.css           # Tailwind + 글로벌 스타일
  □ themes.css            # 테마 변수

□ src/test/                # 테스트 설정
  □ setup.ts              # Vitest 설정
```

**참고 문서**: [.claude/AGENT_ARCHITECT.md#폴더-구조](.claude/AGENT_ARCHITECT.md)

**중요 변경사항**:

- ✅ Atomic Design 패턴 대신 **Components/Features 패턴** 사용
- ✅ Components: 기본 UI 빌딩 블록 (Button, Input, Modal 등)
- ✅ Features: 완전한 기능 모듈 (DesktopStockBox, SearchModal 등)
- ✅ 모든 레이어에 Barrel export (`index.ts`) 추가
- ✅ 파일명: `kebab-case` (예: `use-stock-data.ts`, `desktop-stock-box.tsx`)

---

### Phase 4: Vercel Serverless Functions

#### 9. API Proxy

```bash
□ api/stock-proxy.ts 생성
□ api/exchange-rate.ts 생성
```

**참고 문서**: [API_KEY_STRATEGY.md](API_KEY_STRATEGY.md)

---

### Phase 5: Storybook 설정

#### 10. Storybook 초기화

```bash
□ npx storybook@latest init
□ .storybook/main.ts 수정
□ .storybook/preview.ts 수정
```

**참고 문서**: [TDD_STORYBOOK_I18N.md](TDD_STORYBOOK_I18N.md)

---

## 📝 Agent Teams 실행 순서

### 권장 순서

```
1. Architect 🏗️
   → 위의 Phase 1~3 모두 실행
   → 기본 타입 정의
   → 폴더 구조 생성 (components, features, hooks, stores 등)

2. Styles 🎨
   → Tailwind CSS 100% 설정
   → 글로벌 스타일 (globals.css, themes.css)
   → cn() 유틸리티 함수
   → 커스텀 색상 (up-kr, down-kr, up-us, down-us)

3. State + Services (병렬 가능) 🔄
   → Zustand 스토어 (persist + devtools + immer)
   → API 클라이언트 (Finnhub, Yahoo Finance)
   → WebSocket (Yahoo WebSocket 우선, Finnhub 폴백)
   → Extended Hours Support (Pre-market, Post-market)

4. Test 1차 🧪 (구현 전 — Red)
   → 테스트 먼저 작성 (실패 상태가 정상)
   → Storybook 스토리 먼저 작성
   → 각 컴포넌트/피처마다 테스트 파일 co-locate

5. Components & Features 🎨 (구현 — Green)
   → 테스트를 통과하도록 구현
   → Components: Button, Input, Modal 등 기본 UI 빌딩 블록
   → Features: DesktopStockBox, SearchModal, StockChart 등 완전한 기능 모듈
   → 각 파일에 Barrel export (index.ts) 추가

6. Test 2차 🧪 (검증 — Refactor)
   → 전체 테스트 통과 확인
   → 커버리지 확인
   → 리팩토링
```

---

## 🎯 빠른 시작

프로젝트 초기 개발이 완료되어 바로 실행 가능합니다:

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트 실행
npm run test

# Storybook 실행
npm run storybook
```

---

## 📊 진행률 추적

- **문서화**: ████████████████████ 100%
- **기본 설정**: ████████████████████ 100%
- **프로젝트 구조**: ████████████████████ 100%
- **핵심 로직**: ████████████████████ 100%
- **UI 컴포넌트**: ████████████████████ 100%
- **테스트**: ████████████████████ 100%

**전체 진행률**: ████████████████████ 100%

---

## 💡 Tips

### 빠른 개발을 위한 팁

1. **Agent 1명씩 순차적으로**: 처음엔 Architect부터 시작
2. **문서를 항상 참조**: 각 Agent 파일에 상세한 가이드 있음
3. **테스트는 나중에**: 기본 구조부터 완성
4. **Storybook 활용**: 컴포넌트 개발 시 독립적으로 개발

### 예상 소요 시간

- Architect (기본 설정): 1-2시간
- Styles (디자인 시스템): 1-2시간
- State + Services (병렬): 2-3시간
- Components (단계별): 4-6시간
- Test (전체): 2-3시간

**총 예상 시간**: 10-16시간

---

**현재 상태**: 초기 개발 완료. `npm run dev`로 바로 실행 가능합니다.
