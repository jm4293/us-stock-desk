# Husky + Lint-staged + Commitlint 🐶

이 프로젝트는 코드 품질을 자동으로 관리하기 위해 Git Hooks를 사용합니다.

## 🔧 설치된 Git Hooks

### 1. pre-commit (커밋 전)

- **ESLint**: 코드 스타일 및 오류 자동 수정
- **Prettier**: 코드 포맷팅 자동 적용
- **실행 대상**: 스테이징된 파일만

### 2. commit-msg (커밋 메시지 작성 시)

- **Commitlint**: Conventional Commits 규칙 검증
- 올바른 형식: `<type>: <subject>` 또는 `<type>(<scope>): <subject>`

### 3. pre-push (푸시 전)

- **Type Check**: TypeScript 타입 검사
- **Tests**: Vitest 테스트 실행
- 모든 검사 통과 시에만 푸시 허용

## 📝 커밋 메시지 규칙

### 기본 형식

```
<type>: <subject>
<type>(<scope>): <subject>
```

### Type 목록

| Type       | 설명             | 예시                           |
| ---------- | ---------------- | ------------------------------ |
| `feat`     | 새로운 기능      | `feat: 주식 검색 기능 추가`    |
| `fix`      | 버그 수정        | `fix: 차트 렌더링 오류 수정`   |
| `docs`     | 문서 변경        | `docs: README 업데이트`        |
| `style`    | 코드 포맷팅      | `style: Prettier 적용`         |
| `refactor` | 리팩토링         | `refactor: API 호출 로직 개선` |
| `perf`     | 성능 개선        | `perf: 메모이제이션 적용`      |
| `test`     | 테스트 추가/수정 | `test: StockBox 테스트 추가`   |
| `chore`    | 빌드, 패키지 등  | `chore: 의존성 업데이트`       |
| `ci`       | CI 설정          | `ci: GitHub Actions 추가`      |
| `build`    | 빌드 시스템      | `build: Vite 설정 변경`        |
| `revert`   | 되돌리기         | `revert: feat 이전 커밋 취소`  |

### 좋은 예시 ✅

```bash
feat: 실시간 환율 업데이트 기능 구현
fix(chart): 가격 소수점 표시 오류 수정
docs: API 키 설정 가이드 추가
refactor(hooks): useStockData 로직 개선
test: 주식 박스 드래그 테스트 추가
```

### 나쁜 예시 ❌

```bash
update code           # type 없음
Feat: new feature     # type 대문자
fix: bug fixed.       # 마침표 사용
random commit         # 형식 위반
```

## 🚀 초기 설정

### 1. 패키지 설치

```bash
npm install
```

### 2. Husky 초기화 (자동 실행됨)

```bash
npm run prepare
```

### 3. 커밋 메시지 템플릿 설정 (선택사항)

```bash
git config --local commit.template .gitmessage
```

## 🎯 사용 방법

### 일반 커밋

```bash
git add .
git commit -m "feat: 새로운 기능 추가"
```

자동으로 다음이 실행됩니다:

1. ✨ Prettier로 코드 포맷팅
2. 🔍 ESLint로 코드 검사 및 수정
3. ✅ 커밋 메시지 규칙 검증

### 푸시 전

```bash
git push
```

자동으로 다음이 실행됩니다:

1. 🔍 TypeScript 타입 체크
2. 🧪 Vitest 테스트 실행
3. ✅ 모든 검사 통과 시 푸시

## ⚙️ 설정 파일

- [commitlint.config.js](../commitlint.config.js) - 커밋 메시지 규칙
- [.husky/pre-commit](.husky/pre-commit) - 커밋 전 Hook
- [.husky/commit-msg](.husky/commit-msg) - 커밋 메시지 Hook
- [.husky/pre-push](.husky/pre-push) - 푸시 전 Hook
- [package.json](../package.json) - lint-staged 설정

## 🔧 Hook 비활성화 (긴급 상황)

### 특정 커밋에서만 비활성화

```bash
git commit -m "feat: 긴급 수정" --no-verify
```

### 푸시에서만 비활성화

```bash
git push --no-verify
```

⚠️ **주의**: 가능한 Hook을 우회하지 마세요. 코드 품질이 저하될 수 있습니다.

## 📋 Lint-staged 동작

### TypeScript/JavaScript/React

```bash
eslint --fix        # 코드 오류 자동 수정
prettier --write    # 코드 포맷팅
```

### JSON/CSS/Markdown

```bash
prettier --write    # 포맷팅만 적용
```

## 🐛 문제 해결

### Hook이 실행되지 않을 때

```bash
# Husky 재설치
rm -rf .husky
npm run prepare

# 실행 권한 추가
chmod +x .husky/*
```

### 커밋 메시지 오류

```bash
# 커밋 메시지 형식 확인
npx commitlint --edit

# 템플릿 확인
cat .gitmessage
```

### Lint-staged 오류

```bash
# 수동 실행
npx lint-staged

# 특정 파일만 포맷팅
npm run format
```

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky](https://typicode.github.io/husky/)
- [Commitlint](https://commitlint.js.org/)
- [Lint-staged](https://github.com/okonet/lint-staged)
