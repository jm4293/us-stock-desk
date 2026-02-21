# 📚 US Stock Desk 기술 문서

> 프로젝트 개발을 위한 모든 기술 문서

## 🚀 시작하기

### 개발자를 위한 첫 단계

- **[개발 시작 가이드](./getting-started.md)** - 프로젝트 초기 설정 및 체크리스트

### 프로젝트 이해하기

- **[요구사항 명세서](./requirements.md)** - 전체 기능 요구사항 및 기술 스펙

---

## 🏗️ 아키텍처

### 스타일링 & 디자인

- **[CSS 아키텍처](./architecture/css.md)** - Tailwind CSS + CSS Modules 전략
- **[번들 최적화](./architecture/bundle-optimization.md)** - 성능 최적화 및 코드 스플리팅

### 기술 스택

- **[고급 기술 스택](./architecture/tech-stack.md)** - Zustand, react-hook-form, GSAP, 접근성

---

## 📖 개발 가이드

### 개발 방법론

- **[TDD + Storybook + i18n](./guides/tdd-storybook-i18n.md)** - 테스트 주도 개발, 컴포넌트 문서화, 다국어

### API 관리

- **[API 키 전략](./guides/api-key-strategy.md)** - API 키 관리 및 검증 플로우

### Git 워크플로우

- **[Git 브랜치 전략](./guides/git-workflow.md)** - 브랜치 전략 및 Claude 작업 가이드

---

## 🤖 Agent Teams

Agent Teams로 체계적 개발을 위한 가이드는 [.claude/](./.claude/) 폴더를 참조하세요.

- [AGENT_ARCHITECT.md](../.claude/AGENT_ARCHITECT.md) - 프로젝트 설계자
- [AGENT_STYLES.md](../.claude/AGENT_STYLES.md) - 스타일 전문가
- [AGENT_STATE.md](../.claude/AGENT_STATE.md) - 상태 관리
- [AGENT_SERVICES.md](../.claude/AGENT_SERVICES.md) - 서비스 레이어
- [AGENT_COMPONENTS.md](../.claude/AGENT_COMPONENTS.md) - UI 개발자
- [AGENT_TEST.md](../.claude/AGENT_TEST.md) - 테스트 전문가
- [AGENT_TEAMS.md](../.claude/AGENT_TEAMS.md) - 전체 협업 가이드

---

## 📂 문서 구조

```
docs/
├── README.md                           # 이 파일
│
├── getting-started.md                  # 🚀 개발 시작
├── requirements.md                     # 📋 요구사항
│
├── architecture/                       # 🏗️ 아키텍처
│   ├── css.md                         # 스타일 전략
│   ├── bundle-optimization.md         # 성능 최적화
│   └── tech-stack.md                  # 기술 스택
│
└── guides/                            # 📖 가이드
    ├── tdd-storybook-i18n.md         # 개발 방법론
    ├── api-key-strategy.md           # API 관리
    └── git-workflow.md               # Git 브랜치 전략
```

---

## 🔗 관련 문서

- [CLAUDE.md](../CLAUDE.md) - AI 개발 가이드 (루트)
- [README.md](../README.md) - 프로젝트 소개 (루트)
- [CHANGELOG.md](../CHANGELOG.md) - 변경 이력 (루트)

---

**작성일**: 2026-02-15
