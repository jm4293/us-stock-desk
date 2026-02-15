# 🤖 Agent Teams 실행 가이드

> Stock Desk 프로젝트를 Claude Agent Teams로 체계적으로 개발하기

## 📋 개요

이 프로젝트는 **Agent Teams** 전략을 사용하여 개발됩니다.
6명의 전문 에이전트가 역할을 나누어 순차적/병렬로 작업합니다.

## � Git 브랜치 전략

각 Agent는 **별도의 브랜치**에서 작업하고 PR을 통해 main에 병합합니다.
브랜치 네이밍: `feature/<agent-name>-<description>`, `fix/<agent-name>-<issue>`

**예시:**

- `feature/architect-project-structure` - Architect 작업
- `feature/styles-tailwind-setup` - Styles 작업
- `feature/state-zustand-stores` - State 작업

**Claude에게 요청 시:**

```
"feature/architect-project-structure 브랜치를 생성하고 프로젝트 구조를 설정해줘"
"현재 브랜치를 main에 merge하기 위한 커밋을 작성해줘"
```

자세한 내용은 [docs/guides/git-workflow.md](../docs/guides/git-workflow.md)를 참조하세요.

## �🎯 Agent 구성

| #   | Agent          | 역할            | 의존성                  | 병렬 가능       |
| --- | -------------- | --------------- | ----------------------- | --------------- |
| 1   | **Architect**  | 프로젝트 설계자 | 없음                    | ❌              |
| 2   | **Styles**     | 스타일 전문가   | Architect               | ❌              |
| 3   | **State**      | 상태 관리       | Architect               | ✅ (Services와) |
| 4   | **Services**   | 서비스 레이어   | Architect               | ✅ (State와)    |
| 5   | **Components** | UI 개발자       | Styles, State, Services | ❌              |
| 6   | **Test**       | 테스트 전문가   | Components              | ❌              |

## 🚀 실행 방법

### Phase 1: 기반 구축

#### Step 1: Architect 시작

**Claude에게 전달할 메시지:**

```
.agents/AGENT_ARCHITECT.md 파일을 읽고 작업을 시작해주세요.

프로젝트 초기 설정을 완료해주세요:
1. 폴더 구조 생성
2. TypeScript, Vite, ESLint 설정
3. 타입 정의
4. 상수 정의
```

**완료 확인:**

- [ ] `src/` 폴더 구조 생성됨
- [ ] `tsconfig.json`, `vite.config.ts` 생성됨
- [ ] `src/types/` 타입 정의 완료
- [ ] `src/constants/` 상수 정의 완료
- [ ] `npm install` 성공
- [ ] `npm run dev` 실행 가능

---

#### Step 2: Styles 시작

**Claude에게 전달할 메시지:**

```
.agents/AGENT_STYLES.md 파일을 읽고 작업을 시작해주세요.

Tailwind CSS + Glassmorphism 디자인 시스템을 구축해주세요:
1. Tailwind 설정
2. 글로벌 스타일
3. cn() 유틸리티
4. 다크/라이트 모드
```

**완료 확인:**

- [ ] `tailwind.config.js` 생성됨
- [ ] `src/styles/globals.css` 완료
- [ ] `src/utils/cn.ts` 생성됨
- [ ] Tailwind 빌드 성공
- [ ] 다크 모드 동작 확인

---

### Phase 2: 핵심 로직 (병렬 작업 가능)

#### Step 3: State + Services (동시 진행)

**Option A: State 먼저 시작**

```
.agents/AGENT_STATE.md 파일을 읽고 작업을 시작해주세요.

Zustand 스토어를 구축해주세요:
1. Stock Store
2. Settings Store
3. UI Store
4. Persist + DevTools 설정
```

**Option B: Services 먼저 시작**

```
.agents/AGENT_SERVICES.md 파일을 읽고 작업을 시작해주세요.

API 및 WebSocket 레이어를 구축해주세요:
1. Finnhub API 클라이언트
2. 환율 API
3. WebSocket 연결
4. Vercel Serverless Functions
```

> 💡 **Tip**: 두 에이전트를 별도의 Claude 세션에서 동시에 실행 가능

**완료 확인:**

- [ ] `src/stores/` 스토어 생성됨
- [ ] `src/services/` 서비스 레이어 완료
- [ ] `api/` Serverless Functions 생성됨
- [ ] LocalStorage persist 동작 확인

---

### Phase 3: UI 구축

#### Step 4: Components 시작

**Claude에게 전달할 메시지:**

```
.agents/AGENT_COMPONENTS.md 파일을 읽고 작업을 시작해주세요.

Atomic Design 패턴으로 컴포넌트를 개발해주세요:
1. Atoms (Button, Input, Icon)
2. Molecules (SearchInput, PriceDisplay)
3. Organisms (Header, StockBox)
4. Templates & Pages
5. Custom Hooks
```

**완료 확인:**

- [ ] `src/components/atoms/` 완료
- [ ] `src/components/molecules/` 완료
- [ ] `src/components/organisms/` 완료
- [ ] `src/components/pages/` 완료
- [ ] `src/hooks/` Custom Hooks 완료
- [ ] 화면에 UI가 렌더링됨

---

### Phase 4: 테스트 & 문서화

#### Step 5: Test 시작

**Claude에게 전달할 메시지:**

```
.agents/AGENT_TEST.md 파일을 읽고 작업을 시작해주세요.

테스트와 Storybook을 작성해주세요:
1. Vitest 설정
2. 컴포넌트 테스트
3. Hooks 테스트
4. Storybook 설정
5. 스토리 작성
```

**완료 확인:**

- [ ] `vitest.config.ts` 생성됨
- [ ] `tests/` 테스트 파일 작성됨
- [ ] `.storybook/` 설정 완료
- [ ] `npm run test` 성공
- [ ] `npm run storybook` 실행 가능
- [ ] 커버리지 80% 이상

---

## ✅ 전체 진행 상황

```
[ ] Phase 1: 기반 구축
    [ ] Step 1: Architect
    [ ] Step 2: Styles

[ ] Phase 2: 핵심 로직
    [ ] Step 3: State
    [ ] Step 3: Services

[ ] Phase 3: UI 구축
    [ ] Step 4: Components

[ ] Phase 4: 테스트
    [ ] Step 5: Test

[ ] 🎉 프로젝트 완료!
```

## 📝 에이전트 간 통신

### Architect → 다른 에이전트

- 타입 정의 (`src/types/`)
- 상수 정의 (`src/constants/`)
- 경로 별칭 (`@/`)

### Styles → Components

- `cn()` 유틸리티
- Tailwind 클래스
- 글로벌 스타일

### State → Components

- Zustand 훅 (`useStockStore`, `useSettingsStore`)
- Selectors

### Services → Components

- API 함수 (`finnhubApi`, `exchangeApi`)
- WebSocket (`stockSocket`)

## ⚠️ 주의사항

1. **순서 엄수**: Architect는 반드시 먼저 완료
2. **의존성 확인**: 선행 에이전트 완료 전 시작 금지
3. **파일 충돌 방지**: 각 에이전트는 자신의 폴더만 수정
4. **타입 안정성**: 모든 변경사항은 타입 안전하게

## 🛠 유용한 명령어

```bash
# 개발 서버
npm run dev

# 타입 체크
npm run type-check

# 린트
npm run lint

# 테스트
npm run test

# Storybook
npm run storybook

# 빌드
npm run build
```

## 🎯 최종 목표

- ✅ 실시간 주식 데이터 표시
- ✅ 드래그 & 리사이징 주식 박스
- ✅ 다크/라이트 모드
- ✅ 한국어/English 지원
- ✅ LocalStorage 영속성
- ✅ Glassmorphism 디자인
- ✅ 80% 이상 테스트 커버리지
- ✅ Storybook 문서화

---

**작성일**: 2026-02-15
**by**: Agent Teams Strategy
