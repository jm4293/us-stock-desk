# Git 작업 규칙

> Claude AI의 Git 작업 제한 사항

---

## 🚨 절대 금지 사항

### ❌ 커밋 금지

```bash
# 절대 실행하지 마세요
git commit
git commit -m "..."
git commit --amend
```

**이유:** 사용자가 직접 커밋 히스토리를 관리합니다.

### ❌ 푸시 금지

```bash
# 절대 실행하지 마세요
git push
git push origin main
git push -f
```

**이유:** 사용자가 직접 원격 저장소에 반영합니다.

---

## ✅ 허용된 작업

### Git 상태 확인 (읽기만)

```bash
git status              # 변경 사항 확인
git diff                # 차이 확인
git log --oneline -5    # 최근 커밋 확인
git branch              # 브랜치 목록
```

### 파일 스테이징

```bash
git add src/components/Header.tsx    # 특정 파일 추가
git add src/hooks/                   # 디렉토리 추가
```

**주의:** `git add .` 또는 `git add -A`는 신중히 사용

- 민감한 파일(.env, credentials) 포함 위험
- 가능하면 파일명을 명시적으로 지정

---

## 💡 커밋 메시지 추천

사용자가 커밋할 때 사용할 메시지를 추천할 수 있습니다.

### Conventional Commits 형식

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Type 종류

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 등

### 예시

```bash
# 추천 메시지를 사용자에게 제공
"다음과 같은 커밋 메시지를 권장합니다:

feat(chart): 실시간 차트 업데이트 기능 추가

- Lightweight Charts 통합
- 1분/5분/1시간 간격 지원
- WebSocket 연결 시 자동 업데이트

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
"
```

---

## 📋 작업 흐름 예시

### ✅ 올바른 흐름

```bash
# 1. 파일 수정 (Edit, Write 도구 사용)
# 2. 변경 사항 확인
git status
git diff

# 3. 스테이징
git add src/components/StockChart.tsx
git add src/hooks/useChartData.ts

# 4. 사용자에게 커밋 메시지 추천
"추천 커밋 메시지:
feat(chart): 주식 차트 컴포넌트 구현

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 5. 사용자가 직접 커밋
```

### ❌ 잘못된 흐름

```bash
# 파일 수정 후 바로 커밋 (금지!)
git commit -m "Update component"

# 또는 푸시 (금지!)
git push origin main
```

---

## 🔍 브랜치 관련

### 브랜치 확인 (허용)

```bash
git branch              # 로컬 브랜치 목록
git branch -r           # 원격 브랜치 목록
git branch -a           # 모든 브랜치 목록
```

### 브랜치 생성 (사용자 요청 시만)

```bash
# 사용자가 명시적으로 요청한 경우만
git checkout -b feature/stock-search
```

### 브랜치 전환 (사용자 요청 시만)

```bash
# 사용자가 명시적으로 요청한 경우만
git checkout main
```

---

## ⚠️ 주의사항

1. **민감한 파일 스테이징 방지**
   - `.env`, `.env.local`
   - `credentials.json`
   - `*.key`, `*.pem`

   이런 파일은 절대 `git add` 하지 마세요.

2. **변경 사항 확인 후 스테이징**
   - 항상 `git status`, `git diff`로 확인
   - 예상치 못한 파일이 있으면 사용자에게 알림

3. **사용자 의도 존중**
   - 사용자가 명시적으로 요청하지 않은 Git 작업 금지
   - 불확실하면 사용자에게 물어보기

---

## 📝 체크리스트

작업 완료 후:

- [ ] 변경된 파일 확인 (`git status`)
- [ ] 차이 확인 (`git diff`)
- [ ] 필요한 파일만 스테이징
- [ ] 민감한 파일 미포함 확인
- [ ] 커밋 메시지 추천 제공
- [ ] ❌ 커밋 실행하지 않음
- [ ] ❌ 푸시 실행하지 않음

---

**작성일:** 2026-03-10
**참조:** [docs/guides/git-workflow.md](../../docs/guides/git-workflow.md)
