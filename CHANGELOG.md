# Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Planned

- Architect Agent 실행: 프로젝트 기본 구조 생성
- Styles Agent 실행: Tailwind CSS 및 디자인 시스템 구축
- State Agent 실행: Zustand 스토어 구현
- Services Agent 실행: API 및 WebSocket 레이어 구현
- Components Agent 실행: UI 컴포넌트 개발 (Atomic Design)
- Test Agent 실행: 테스트 및 Storybook 스토리 작성

---

## [2026-02-15] - 프로젝트 설계 및 문서화

### Added

- 프로젝트 문서 구조 설계 및 정리
  - `CLAUDE.md` - AI 개발 가이드 (루트)
  - `docs/` 폴더 생성 - 모든 기술 문서 정리
    - `docs/getting-started.md` - 개발 시작 가이드
    - `docs/requirements.md` - 요구사항 명세서
    - `docs/architecture/css.md` - CSS 전략 및 아키텍처
    - `docs/architecture/bundle-optimization.md` - 번들 최적화 및 성능 가이드
    - `docs/architecture/tech-stack.md` - Zustand, react-hook-form, GSAP, 접근성 가이드
    - `docs/guides/tdd-storybook-i18n.md` - TDD, Storybook, Atomic Design, i18n 가이드
    - `docs/guides/api-key-strategy.md` - API 키 관리 전략
  - `CHANGELOG.md` - 변경 이력 관리 (루트)
- **코드 품질 자동화 도구 설정**
  - `Prettier` ^3.2.4 - 코드 포맷팅
  - `prettier-plugin-tailwindcss` ^0.5.11 - Tailwind 클래스 자동 정렬
  - `Husky` ^9.0.10 - Git Hooks 관리
  - `lint-staged` ^15.2.0 - 스테이징된 파일만 검사
  - `Commitlint` ^18.6.0 - Conventional Commits 규칙 적용
  - `.prettierrc`, `.prettierignore` - Prettier 설정
  - `.eslintrc.cjs`, `.eslintignore` - ESLint + Prettier 통합
  - `.husky/pre-commit` - 커밋 전 포맷팅 & 린트
  - `.husky/commit-msg` - 커밋 메시지 검증
  - `.husky/pre-push` - 푸시 전 타입 체크 & 테스트
  - `commitlint.config.js` - 커밋 메시지 규칙
  - `.gitmessage` - 커밋 메시지 템플릿
  - `.vscode/settings.json` - VSCode 저장 시 자동 포맷팅
  - `.vscode/extensions.json` - 권장 확장 프로그램
- API 키 관리 전략 수립
  - 제한 모드 (공용 API, 10초 업데이트)
  - 실시간 모드 (개인 API, 1초 업데이트)
  - API 키 자동 검증 플로우
  - 성공/실패 UX 피드백 설계
- 번들 최적화 전략
  - Code Splitting (React.lazy)
  - Dynamic Import
  - Vite manualChunks 설정
  - 성능 목표: 초기 번들 < 300KB, Lighthouse 90+

### Changed

- `README.md` 프로젝트 소개 중심으로 재작성
  - 기술 문서 → 사용자 친화적 소개
  - 디자인 철학 섹션 제거
  - 배포된 서비스 사용 중심으로 변경
  - 로컬 설치는 개발자용으로 접을 수 있게 변경
- 용어 변경: "무료/프리미엄" → "제한 모드/실시간 모드"
  - 유료 서비스 느낌 제거
  - 기능 차이 명확화

### Technical Decisions

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand (persist, devtools, immer)
- **Styling**: Tailwind CSS + CSS Modules
- **Form**: react-hook-form + zod
- **Animation**: GSAP
- **Charts**: Lightweight Charts
- **Testing**: Vitest + React Testing Library
- **Component Dev**: Storybook
- **Architecture**: Atomic Design + Custom Hooks Pattern
- **Deployment**: Vercel (Serverless Functions)
- **API**: Finnhub (WebSocket + Polling fallback)

---

## 변경 이력 작성 가이드

### 카테고리

- `Added` - 새로운 기능
- `Changed` - 기존 기능 변경
- `Deprecated` - 곧 제거될 기능
- `Removed` - 제거된 기능
- `Fixed` - 버그 수정
- `Security` - 보안 관련 변경

### 작성 예시

```markdown
## [YYYY-MM-DD] - 간단한 설명

### Added

- 새로운 기능 설명

### Changed

- 변경된 내용 설명

### Fixed

- 수정된 버그 설명
```
