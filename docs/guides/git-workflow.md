# Git 브랜치 전략 & Claude 작업 가이드

> GitHub Flow 전략을 사용한 체계적인 개발 워크플로우

## 🌿 브랜치 전략

### 브랜치 유형

```
main
 ├── feature/기능명       # 새로운 기능 개발
 ├── fix/버그명           # 버그 수정
 ├── docs/문서명          # 문서 작업
 ├── refactor/대상       # 리팩토링
 ├── style/대상          # 스타일링 (CSS, 포맷팅)
 ├── test/대상           # 테스트 추가/수정
 └── chore/작업명        # 빌드, 설정 등
```

### 네이밍 규칙

```
feature/stock-search        # 주식 검색 기능
fix/chart-rendering         # 차트 렌더링 버그
docs/api-guide              # API 가이드 문서
refactor/api-service        # API 서비스 리팩토링
style/button-design         # 버튼 디자인 개선
test/stock-box              # StockBox 테스트
chore/update-deps           # 의존성 업데이트
```

---

## 🤖 Claude에게 작업 요청하는 방법

### 1. 새로운 기능 개발

```
feature/stock-search 브랜치를 생성하고 주식 검색 기능을 개발해줘.

작업 내용:
1. SearchModal 컴포넌트 개발
2. 주식 심볼 자동완성 API 연동
3. 테스트 코드 작성
4. Storybook 스토리 작성

완료 후 커밋하고 main으로 PR 준비해줘.
```

### 2. 버그 수정

```
fix/chart-rendering 브랜치를 생성하고 차트 렌더링 버그를 수정해줘.

문제:
- 가격 소수점이 제대로 표시되지 않음
- 차트가 깨지는 현상

수정 후 테스트하고 커밋해줘.
```

### 3. 리팩토링

```
refactor/api-service 브랜치를 생성하고 API 서비스 레이어를 리팩토링해줘.

목표:
- 중복 코드 제거
- 에러 핸들링 개선
- 타입 안정성 강화

완료 후 PR 준비해줘.
```

### 4. 문서 작업

```
docs/deployment-guide 브랜치를 생성하고 배포 가이드를 작성해줘.

내용:
- Vercel 배포 방법
- 환경변수 설정
- 도메인 연결

완료 후 커밋해줘.
```

---

## 📋 Claude 작업 흐름

### Step 1: 브랜치 생성 & 작업

Claude에게 요청:

```
feature/stock-chart 브랜치를 생성하고 주식 차트 컴포넌트를 개발해줘.
```

Claude가 자동으로:

```bash
git checkout -b feature/stock-chart
# 개발 작업...
git add .
git commit -m "feat: 주식 차트 컴포넌트 구현"
```

### Step 2: Push & PR 생성

Claude에게 요청:

```
feature/stock-chart를 push하고 main으로 PR을 생성해줘.

PR 제목: [Feature] 주식 차트 컴포넌트 구현
```

Claude가 자동으로:

```bash
git push -u origin feature/stock-chart
gh pr create --base main --head feature/stock-chart \
  --title "[Feature] 주식 차트 컴포넌트 구현" \
  --body "..."
```

### Step 3: 리뷰 & 머지

수동으로 GitHub에서:

1. PR 리뷰
2. 승인
3. Merge to main
4. 브랜치 삭제

---

## 🔄 전체 워크플로우 예시

### 예시 1: 새 기능 개발

**1. Claude에게 요청**

```
feature/realtime-price 브랜치 생성하고 실시간 가격 업데이트 기능을 개발해줘.

요구사항:
- WebSocket 연결
- 1초마다 가격 업데이트
- 연결 끊김 시 재연결
- 에러 핸들링

완료 후 커밋하고 PR 준비해줘.
```

**2. Claude 작업**

```bash
# 브랜치 생성
git checkout -b feature/realtime-price

# 개발 (Claude가 자동으로 파일 생성/수정)
# - src/services/websocket/stockSocket.ts
# - src/hooks/useRealtimePrice.ts
# - tests/useRealtimePrice.test.ts

# 커밋
git add .
git commit -m "feat: 실시간 가격 업데이트 기능 구현"

# Push
git push -u origin feature/realtime-price
```

**3. PR 생성**

```
feature/realtime-price를 main으로 PR 생성해줘.

PR 내용:
- 실시간 가격 업데이트 기능
- WebSocket 연결 관리
- 자동 재연결 로직
- 테스트 코드 포함
```

**4. GitHub에서**

- PR 확인
- 코드 리뷰
- Approve & Merge

---

## 🚀 빠른 시작 명령어

### Claude에게 이렇게 요청하세요

#### 기능 개발

```
feature/[기능명] 브랜치 생성하고 [기능 설명] 개발해줘.
완료 후 커밋하고 PR 준비해줘.
```

#### 버그 수정

```
fix/[버그명] 브랜치 생성하고 [버그 설명] 수정해줘.
테스트 확인 후 커밋해줘.
```

#### 리팩토링

```
refactor/[대상] 브랜치 생성하고 [대상]을 리팩토링해줘.
기존 테스트 통과 확인 후 커밋해줘.
```

#### 문서 작성

```
docs/[문서명] 브랜치 생성하고 [내용] 문서 작성해줘.
```

---

## 💡 Pro Tips

### 1. Agent Teams와 브랜치 전략 결합

```
feature/stock-search 브랜치 생성 후

.claude/AGENT_COMPONENTS.md를 읽고 SearchModal 컴포넌트를 개발해줘.

Atomic Design 패턴:
1. SearchInput (molecule)
2. StockList (organism)
3. SearchModal (organism)

완료 후 커밋하고 PR 준비해줘.
```

### 2. 병렬 개발

```bash
# 터미널 1 - State 작업
feature/stock-store 브랜치에서 Zustand 스토어 구현해줘.

# 터미널 2 - Service 작업
feature/api-service 브랜치에서 API 클라이언트 구현해줘.
```

### 3. 자동 PR 생성 설정

GitHub CLI 설치:

```bash
brew install gh
gh auth login
```

그러면 Claude가 PR도 자동 생성 가능:

```
feature/stock-chart를 push하고 main으로 PR 생성해줘.
```

### 4. 브랜치 정리

작업 완료 후:

```
feature/stock-chart 브랜치 삭제하고 main으로 돌아가줘.
```

---

## 📝 커밋 메시지 규칙 (이미 설정됨)

Conventional Commits 자동 검증:

```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
perf: 성능 개선
test: 테스트 추가/수정
chore: 빌드, 설정 등
```

---

## 🔐 보호 규칙 (GitHub 설정 권장)

GitHub에서 main 브랜치 보호:

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. 체크박스:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

---

## 📊 실제 사용 예시

### 시나리오: Architect Agent로 프로젝트 초기화

```
1. feature/project-setup 브랜치 생성
2. .claude/AGENT_ARCHITECT.md를 읽고 프로젝트 초기 설정 완료
3. 커밋하고 PR 생성
```

**Claude에게 전달:**

```
feature/project-setup 브랜치를 생성하고

.claude/AGENT_ARCHITECT.md를 읽고 프로젝트 초기 설정을 완료해줘.

작업 내용:
1. tsconfig.json, vite.config.ts 생성
2. index.html, src/main.tsx, src/App.tsx 생성
3. src/ 폴더 구조 생성
4. 타입 정의 및 상수 정의
5. .env.example 생성

완료 후:
git add .
git commit -m "chore: 프로젝트 초기 구조 설정"
git push -u origin feature/project-setup

PR 생성 준비까지 해줘.
```

---

**작성일**: 2026-02-15
**다음 단계**: [GitHub에서 main 브랜치 보호 규칙 설정](https://github.com/jm4293/stock-desk/settings/branches)
