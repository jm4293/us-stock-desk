# Stock Desk - Claude AI 개발 가이드

> 미국주식 실시간 모니터링 대시보드 (프론트엔드 전용)

---

## 🚨 절대 규칙 (항상 준수)

### Git 작업

- ❌ **`git commit` 절대 금지** - 사용자가 직접 커밋
- ❌ **`git push` 절대 금지** - 사용자가 직접 푸시
- ✅ 커밋 메시지 추천만 가능

### Import 경로

- ✅ **Barrel 패턴만 사용** - `@/components/atoms`, `@/hooks`, `@/stores`
- ❌ 개별 파일 직접 접근 금지 - `@/components/atoms/Button/Button`
- 📖 상세: [.claude/rules/imports.md](.claude/rules/imports.md)

### CSS 작성

- ✅ **Tailwind 우선** (90% 이상)
- ✅ **cn() 함수 사용** - 클래스 병합
- ❌ **!important 절대 금지**
- 📖 상세: [.claude/rules/css.md](.claude/rules/css.md)

---

## 📋 작업별 필수 규칙

| 작업          | 규칙 문서                                                  |
| ------------- | ---------------------------------------------------------- |
| Git 작업      | [.claude/rules/git.md](.claude/rules/git.md)               |
| Import 경로   | [.claude/rules/imports.md](.claude/rules/imports.md)       |
| CSS 작성      | [.claude/rules/css.md](.claude/rules/css.md)               |
| 컴포넌트 개발 | [.claude/rules/components.md](.claude/rules/components.md) |
| Hook 작성     | [.claude/rules/hooks.md](.claude/rules/hooks.md)           |
| Store 사용    | [.claude/rules/stores.md](.claude/rules/stores.md)         |
| 테스트 작성   | [.claude/rules/testing.md](.claude/rules/testing.md)       |

---

## 📚 상세 가이드

작업 시작 전 해당 문서를 반드시 참조하세요:

- **시작하기:** [docs/getting-started.md](docs/getting-started.md)
- **요구사항:** [docs/requirements.md](docs/requirements.md)
- **아키텍처:** [docs/architecture/](docs/architecture/)
- **개발 가이드:** [docs/guides/](docs/guides/)

---

## 🤖 Agent Teams (선택 사항)

대규모 작업 시 Agent Teams 활용:

- [.claude/AGENT_TEAMS.md](.claude/AGENT_TEAMS.md) - 작업 흐름
- [.claude/agents/](. claude/agents/) - Agent별 지침

---

**프로젝트 경로:** `/Users/jm4293/Project/us-stock-desk`
**마지막 업데이트:** 2026-03-10
