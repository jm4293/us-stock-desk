# 📈 US Stock Desk

<div align="center">

![US Stock Desk Banner](https://via.placeholder.com/800x200/1a1a1a/ffffff?text=Stock+Desk)

**미국주식을 한눈에, 나만의 실시간 대시보드**

브라우저 시작 페이지를 주식 모니터링 공간으로 바꿔보세요.
데스크톱 위젯처럼 자유롭게 배치하고, 실시간으로 업데이트되는 주식 정보를 확인하세요.

🆓 **완전 무료** · 🔐 **회원가입 불필요** · 💾 **데이터는 내 브라우저에만**

[🚀 바로 시작하기](https://stock-desk.vercel.app) · [💡 사용법 보기](#-사용-가이드) · [❓ 자주 묻는 질문](#-자주-묻는-질문)

</div>

---

## 🎯 프로젝트 소개

**US Stock Desk**는 미국주식 투자자를 위한 실시간 모니터링 대시보드입니다.

브라우저만 열면 바로 확인할 수 있으며, 원하는 종목을 자유롭게 배치하고 실시간으로 업데이트되는 시장 정보를 확인할 수 있습니다.

### 💡 개발 배경

- 🔄 **여러 앱을 오가는 번거로움**: 증권 앱, 환율 앱, 시간 확인 등을 한 곳에서 보고 싶었습니다
- 🖥️ **PC 환경 최적화**: 모바일 중심 앱들은 PC에서 사용하기 불편합니다
- 🎨 **자유로운 레이아웃**: 중요한 종목은 크게, 참고용은 작게 배치할 수 있으면 좋겠다고 생각했습니다

### 특징

간편한 사용 + 자유로운 배치 + 실시간 업데이트

---

## 🎬 주요 기능

### 📊 실시간 주식 모니터링

<table>
<tr>
<td width="50%">

**WebSocket 실시간 업데이트**

- 시장이 열리면 즉시 가격 변동 반영
- 연결 끊김 시 자동 Polling으로 전환
- 안정적인 데이터 수신 보장

</td>
<td width="50%">

**전문가급 차트**

- TradingView의 Lightweight Charts 사용
- 마우스 드래그로 시간대 이동
- 스크롤로 줌 인/아웃
- 1일 ~ 1년 기간 선택

</td>
</tr>
</table>

### 🖱️ 자유로운 레이아웃

<table>
<tr>
<td width="50%">

**드래그 앤 드롭**

- 데스크톱 아이콘처럼 자유롭게 배치
- 클릭한 박스가 자동으로 최상단으로
- 뒤쪽 박스는 자동 blur 처리

</td>
<td width="50%">

**크기 조절**

- 중요한 종목은 크게
- 참고용 종목은 작게
- 최소/최대 크기 제한으로 안정성 보장

</td>
</tr>
</table>

### 💾 영속성 & 편의성

- ✅ **자동 저장**: 브라우저를 껐다 켜도 그대로 유지
- ✅ **다크/라이트 모드**: 눈이 편한 테마 선택
- ✅ **다국어 지원**: 한국어, English
- ✅ **색상 설정**: 한국식(빨강↑/파랑↓) ↔ 미국식(초록↑/빨강↓)

### 💱 부가 정보

- 📈 **환율 정보**: USD, JPY, EUR 실시간 환율
- 🕐 **시장 시간**: 미국 시장 시간 + 한국 시간 동시 표시
- 🔔 **개장/휴장 상태**: 현재 거래 가능 여부 확인

---

## 🚀 시작하기

### 1단계: 바로 시작하기

**[👉 US Stock Desk 열기](https://stock-desk.vercel.app)**

클릭하면 바로 사용할 수 있습니다! 회원가입도, 설치도 필요 없습니다.

### 2단계: 종목 추가하기

1. **"+ 종목 추가"** 버튼 클릭
2. 원하는 종목 검색 (예: 애플 → AAPL, 테슬라 → TSLA)
3. 선택하면 화면에 박스가 생성됩니다

### 3단계: 자유롭게 배치하기

- 📦 **박스 이동**: 박스 상단을 드래그
- 📏 **크기 조절**: 박스 모서리를 드래그
- 🗑️ **삭제**: 박스 우측 상단의 X 버튼

완료! 이제 브라우저를 다시 열어도 설정이 그대로 유지됩니다.

: TypeScript 타입 체크 + 테스트 실행

#### 커밋 메시지 형식

```bash
# 형식: <type>: <subject>
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드, 패키지 관리
```

자세한 내용은 [.husky/README.md](.husky/README.md)를 참조하세요.

</details>

---

## 📖 사용 가이드

### 종목 추가하기

1. **"+ 종목 추가"** 버튼 클릭
2. 종목 심볼 검색 (예: AAPL, TSLA, MSFT)
3. 선택하면 화면에 박스 생성!

### 박스 조작하기

| 동작              | 방법                   |
| ----------------- | ---------------------- |
| 🖱️ **이동**       | 박스 헤더를 드래그     |
| 📏 **크기 조절**  | 박스 모서리를 드래그   |
| 🔝 **최상단으로** | 박스 클릭              |
| 🗑️ **삭제**       | 박스 내 삭제 버튼 클릭 |

### 차트 조작하기

| 동작               | 방법                      |
| ------------------ | ------------------------- |
| ⬅️➡️ **좌우 이동** | 차트를 마우스로 드래그    |
| 🔍 **줌 인/아웃**  | 마우스 휠 스크롤          |
| 📅 **기간 선택**   | 1일, 1주, 1개월, 1년 버튼 |

---

## 🤝 기여하기

버그를 발견하셨거나 새로운 기능을 제안하고 싶으시다면 [Issues](https://github.com/jm4293/stock-desk/issues)에 남겨주세요.

---

## 📄 라이선스

MIT 라이선스 - 자유롭게 사용하실 수 있습니다.

---

<div align="center">

**GitHub**: [@jm4293](https://github.com/jm4293)

<details>
<summary><b>개발자를 위한 기술 문서</b></summary>

- [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md) - 전체 요구사항
- [CSS_ARCHITECTURE.md](./CSS_ARCHITECTURE.md) - CSS 전략
- [TDD_STORYBOOK_I18N.md](./TDD_STORYBOOK_I18N.md) - 개발 방법론
- [ADVANCED_TECH_STACK.md](./ADVANCED_TECH_STACK.md) - 고급 기술 스택
- [BUNDLE_OPTIMIZATION.md](./BUNDLE_OPTIMIZATION.md) - 성능 최적화

</details>

</div>
📦 박스 다루기

| 하고 싶은 일                 | 방법                          |
| ---------------------------- | ----------------------------- |
| 🖱️ **박스 위치 바꾸기**      | 박스 상단을 마우스로 드래그   |
| 📏 **박스 크기 조절**        | 박스 모서리를 마우스로 드래그 |
| 🔝 **특정 박스를 맨 앞으로** | 박스 아무 곳이나 클릭         |
| 🗑️ **박스 삭제**             | 박스 우측 상단의 X 버튼 클릭  |

### 📊 차트 보는 법

| 하고 싶은 일              | 방법                           |
| ------------------------- | ------------------------------ |
| ⬅️➡️ **과거 데이터 보기** | 차트를 마우스로 좌우 드래그    |
| 🔍 **차트 확대/축소**     | 마우스 휠 스크롤               |
| 📅 **기간 변경**          | 1일, 1주, 1개월, 1년 버튼 클릭 |

### ⚙️ 설정 변경하기

우측 상단의 **설정(⚙️)** 버튼에서:

- 🌓 **다크/라이트 모드** 전환
- 🎨 **색상 설정**: 한국식(빨강↑/파랑↓) ↔ 미국식(초록↑/빨강↓)
- 🌏 **언어 변경**: 한국어 ↔ English
- ⚡ **실시간 모드** 활성화

---

## ❓ 자주 묻는 질문

💬 피드백 & 문의

궁금한 점이나 개선 제안이 있으신가요?

- 🐛 **버그 제보**: [Issues](https://github.com/jm4293/stock-desk/issues)에 남겨주세요
- 💡 **기능 제안**: [Issues](https://github.com/jm4293/stock-desk/issues)에서 의견을 공유해주세요
- ⭐ **마음에 드셨나요?**: GitHub에서 Star를 눌러주세요!

---

## 📜 이용 약관

US Stock Desk는 MIT 라이선스로 제공됩니다.
자유롭게 사용하실 수 있으며, 투자 판단의 참고 자료로만 활용해주세요.

> ⚠️ **투자 유의사항**: 이 서비스는 정보 제공 목적이며, 투자 권유가 아닙니다.
> 모든 투자 판단과 책임은 투자자 본인에게 있습니다.

---

<div align="center">

**만든 사람**: [@jm4293](https://github.com/jm4293)

---

<details>
<summary><b>🔧 개발자를 위한 정보</b></summary>

<br>

[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### 로컬 개발 환경

```bash
git clone https://github.com/jm4293/stock-desk.git
cd stock-desk
npm install
npm run dev
```

### 기술 문서

- [CLAUDE.md](./CLAUDE.md) - AI 개발 가이드
- [docs/](./docs/) - 모든 기술 문서
  - [getting-started.md](./docs/getting-started.md) - 개발 시작 가이드
  - [requirements.md](./docs/requirements.md) - 전체 요구사항
  - [architecture/css.md](./docs/architecture/css.md) - CSS 전략
  - [architecture/tech-stack.md](./docs/architecture/tech-stack.md) - 기술 스택
  - [architecture/bundle-optimization.md](./docs/architecture/bundle-optimization.md) - 성능 최적화
  - [guides/tdd-storybook-i18n.md](./docs/guides/tdd-storybook-i18n.md) - 개발 방법론
  - [guides/api-key-strategy.md](./docs/guides/api-key-strategy.md) - API 관리
- [.husky/README.md](.husky/README.md) - Git Hooks 가이드

### 기술 스택

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Lightweight Charts · Finnhub API

</details>

<details>
<summary><b>어떤 종목을 볼 수 있나요?</b></summary>

미국 주식 시장의 모든 종목을 검색할 수 있습니다:

- 주요 주식: AAPL(애플), TSLA(테슬라), MSFT(마이크로소프트) 등
- ETF: SPY, QQQ 등
- 기타 상장된 모든 미국 주식

</details>

<details>
<summary><b>모바일에서도 사용할 수 있나요?</b></summary>

네, 가능합니다! 하지만 PC 화면에 최적화되어 있어서
큰 화면에서 사용하시는 것을 추천드립니다.

</details>

<details>
<summary><b>브라우저 시작 페이지로 설정하려면?</b></summary>

**Chrome/Edge:**

1. 브라우저 설정(⚙️) → 시작그룹
2. "특정 페이지 또는 페이지 모음 열기" 선택
3. `https://stock-desk.vercel.app` 입력

**Safari:**

1. 환경설정 → 일반
2. Safari 시동 시: "홈페이지" 선택
3. 홈페이지에 `https://stock-desk.vercel.app` 입력

</details>
