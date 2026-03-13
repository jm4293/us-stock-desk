# Stock Desk - 프로젝트 요구사항 명세서

## 📋 프로젝트 개요

미국주식 종목을 실시간으로 모니터링할 수 있는 인터랙티브 대시보드 웹 애플리케이션

- **타입**: 프론트엔드 전용 (백엔드/DB 없음)
- **컨셉**: 브라우저 시작 페이지, 데스크톱 위젯 스타일
- **핵심 기능**: 드래그 가능한 주식 박스, 실시간 데이터, 영속성

---

## 🛠 기술 스택

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Drag & Resize**: react-rnd
- **Charts**: Lightweight Charts (TradingView)
- **Styling**: Tailwind CSS + CSS Modules
- **Class Utilities**: tailwind-merge + clsx
- **Design**: Glassmorphism
- **i18n**: react-i18next (한국어, English)
- **Component Development**: Storybook
- **Design Pattern**: Atomic Design Pattern
- **Testing**: Vitest + React Testing Library (TDD)
- **State Management**: Zustand (persist, devtools, immer)
- **Form**: react-hook-form + zod
- **Animation**: GSAP
- **Portal**: React Portal (모달, 토스트)
- **Error Handling**: Suspense + Error Boundary
- **Accessibility**: ARIA, 키보드 네비게이션, 스크린 리더

### Backend

- **Serverless**: Vercel Serverless Functions (API Proxy)

### APIs

- **Price Data**: Finnhub & Yahoo Finance
  - Initial Load: Finnhub REST API (via Vercel proxy with Edge Caching).
  - Real-time Streaming: Yahoo Finance WebSocket (Client-side, 100% free, all hours).
  - Exchange Rate: Yahoo Finance REST API (`KRW=X`) via Vercel Edge Caching proxy.
- **Chart Data**: Finnhub Candle API (via server proxy)
- **Rate Limiting**: Effectively handled globally using Vercel Edge Cache (`Cache-Control`), eliminating per-user API quota limits.

### Storage

- **LocalStorage**: 암호화/Base64 인코딩
  - `stockdesk_stocks_v1` - 종목 목록 + 위치/크기
  - `stockdesk_settings_v1` - 사용자 설정
  - `stockdesk_theme_v1` - 다크/라이트 모드
  - `stockdesk_layout_v1` - 레이아웃 정보
  - `stockdesk_cache_v1` - 임시 캐시 데이터

### Analytics & Monitoring

- **Google Analytics 4**: 사용자 분석
- **Sentry**: 에러 추적

### Deployment

- **Platform**: Vercel
- **Environment**: Production + Preview

### Architecture

- **Pattern**: Custom Hooks Pattern (비즈니스 로직 분리)
- **Design Pattern**: Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)
- **Components**: UI 렌더링만 (JSX, 스타일, 이벤트 연결)
- **Hooks**: 비즈니스 로직 (상태 관리, 데이터 fetching, 계산)
- **Services**: 외부 통신 (API, WebSocket, LocalStorage)
- **Utils**: 순수 함수 (포맷팅, 변환, 유효성 검사)
- **No !important**: tailwind-merge로 클래스 충돌 자동 해결

### Development Methodology

- **TDD (Test-Driven Development)**: 테스트 작성 → 구현 → 리팩토링
- **Storybook**: 컴포넌트 독립 개발 및 문서화
- **Atomic Design**: 재사용 가능한 컴포넌트 체계
- **Bundle Optimization**: Code Splitting, Dynamic Import, Tree Shaking
  - 초기 번들: < 300KB (gzipped)
  - Lighthouse 성능 점수: 90+
  - FCP < 1.5초, LCP < 2.5초

---

## 🎯 핵심 기능

### 1. 주식 박스 (Stock Box)

#### 기본 기능

- ✅ 종목 추가/삭제
- ✅ 드래그 앤 드롭으로 자유로운 위치 이동
- ✅ 리사이징 (최소/최대 크기 제한)
- ✅ Z-index 관리 (클릭/이동 시 최상단으로)

#### 표시 정보

- 종목명 + 심볼
- 현재가
- 등락률
- 거래량
- 실시간 차트 (박스 하단)

#### 박스 레이아웃

```
┌─────────────────────────────┐
│ [종목명 + 심볼]      [X 삭제] │
│                              │
│ [현재가]                     │
│ [등락률]  [거래량]           │
│ ─────────────────────────── │
│                              │
│      [차트 영역]             │
│                              │
└─────────────────────────────┘
```

#### 박스 동작

- **초기 위치**: 중앙에서 생성, 기존 박스와 겹치지 않도록 약간 오프셋 또는 랜덤 위치
- **초기 크기**: 고정된 기본 크기
- **최소/최대 크기**: 설정 필요
- **삭제**: 박스 내 숨겨진 삭제 버튼 (호버 시 표시)

#### Z-index & Blur 효과

- 마지막 클릭/이동한 박스가 최상단
- 하위 박스는 blur 처리로 포커스 강조

### 2. 차트 (Chart)

#### 기능

- 마우스 드래그로 좌우 이동
- 스크롤로 차트 범위 조절 (줌 인/아웃)
- 기간 선택 버튼 (1일, 1주, 1개월, 3개월, 1년, 전체)

#### 라이브러리

- Lightweight Charts (TradingView)

### 3. 종목 검색 (Search Modal)

- 검색 버튼 클릭 시 모달 표시
- 종목 심볼/이름 검색
- 자동완성 기능
- 검색 결과 선택 → 박스 생성

### 4. 헤더 (Header)

#### 구성 요소

1. **환율 정보** (USD, JPY, EUR)
   - 실시간 환율 표시
   - 디지털 시계 스타일 (숫자만, 초 단위, 애니메이션)

2. **시장 시간**
   - 미국 시장 시간
   - 한국 시간
   - 디지털 시계 스타일 (초 단위, 애니메이션)
   - 개장/휴장 상태 표시

3. **다크/라이트 모드 토글**

4. **설정 버튼** (모달 오픈)

#### 레이아웃

```
┌────────────────────────────────────────────────────────────┐
│ [환율: USD/JPY/EUR] | [미국 시간] [한국 시간] | [🌓] [⚙️] │
└────────────────────────────────────────────────────────────┘
```

### 5. 설정 모달 (Settings Modal)

#### 설정 항목

1. **색상 설정**
   - 상승: 빨강 / 하락: 파랑 (기본, 한국식)
   - 상승: 초록 / 하락: 빨강 (미국식)

2. **차트 기본 기간**
   - 1일, 1주, 1개월 등

3. **데이터 업데이트 주기**
   - 5초, 10초, 30초

4. **기타 설정** (추후 추가 가능)
   - 언어 설정
   - 통화 표시
   - 박스 기본 크기

### 6. 랜딩 페이지 (Landing Page)

#### 기능

- 페이지 최초 접근 시 표시
- API 연결 상태 점검
- 네트워크 연결 테스트

#### UI

- 프로젝트 텍스트 애니메이션
- 로딩 바 (0-100% 증가 애니메이션)
- 연결 상태 표시

#### 점검 항목

- Finnhub API 연결 (서버 프록시)
- Yahoo Finance API 연결
- LocalStorage 접근 가능 여부

### 7. 에러 처리

#### 에러 표시 방법

- 모달 또는 토스트 메시지
- 명확한 에러 메시지
- 재시도 옵션

#### 에러 케이스

- API 호출 실패 (Finnhub 프록시 또는 Yahoo Finance)
- 네트워크 오프라인
- LocalStorage 접근 불가

### 8. 오프라인 감지

- 네트워크 오프라인 시 사용자에게 알림
- 온라인 복구 시 자동 재연결

---

## 🎨 디자인 & UX

### 스타일

- **Glassmorphism**: 반투명 효과
- **다크/라이트 모드**: 토글 가능
- **애니메이션**: 부드러운 전환 효과

### 반응형

- **데스크톱**: 드래그 & 리사이징 전체 기능
- **모바일**: 드래그 & 리사이징 지원
  - 이동 중 인터랙션 효과 (scale, shadow, opacity 변화)
  - 햅틱 피드백

### 색상

- **상승**: 빨강 (기본)
- **하락**: 파랑 (기본)
- 설정에서 변경 가능

### 애니메이션

- 박스 추가/삭제 시 fade in/out
- 가격 변동 시 색상 변화 애니메이션
- 시계 숫자 변경 시 애니메이션
- 드래그 중 인터랙션 효과

---

## 📊 데이터 관리

### 실시간 업데이트 전략

### 실시간 업데이트 전략

```
실시간 주식 데이터 (Yahoo Finance WebSocket):
  1. 초기 진입 시 Finnhub REST (Server Proxy) 로 기본 스냅샷 확보.
  2. Yahoo Finance WebSocket (wss://streamer.finance.yahoo.com) 연결.
  3. Protobuf 메시지 수신 및 디코딩으로 정규장 및 확장거래 실시간 렌더링.
  4. 시장 종료 시 연결 해제 후 마지막 마감가 유지.

환율 데이터 (Vercel Edge Cache):
  1. 클라이언트가 /api/exchange-rate 호출.
  2. Vercel Edge 서버가 60초 캐싱 (Yahoo Finance 통신 최소화).

차트 데이터 (Finnhub Candle API, 서버 프록시 경유):
  → 기간별 OHLCV 데이터 (1일, 1주, 1개월, 3개월, 6개월, 1년)
```

### LocalStorage 구조

#### stockdesk_stocks_v1

```json
{
  "stocks": [
    {
      "id": "uuid-1",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "position": { "x": 100, "y": 100 },
      "size": { "width": 400, "height": 500 },
      "zIndex": 1
    }
  ]
}
```

#### stockdesk_settings_v1

```json
{
  "colorScheme": "kr", // "kr" | "us"
  "defaultChartPeriod": "1D",
  "updateInterval": 10,
  "language": "ko",
  "currency": "KRW"
}
```

#### stockdesk_theme_v1

```json
{
  "mode": "dark" // "dark" | "light"
}
```

### 데이터 암호화

- Base64 인코딩 또는 간단한 암호화
- 사용자가 직접 읽기 어렵게 처리

---

## 🔒 보안 & 성능

### API 키 관리

- Finnhub API 키는 Vercel Serverless Functions 환경변수로 관리
- 클라이언트에 API 키 노출 없음
- Yahoo Finance는 API 키 불필요 (무료 공개 API)
- 사용자가 별도로 API 키를 발급하거나 관리할 필요 없음

### 캐싱 및 트래픽 분산 (Edge Caching)

- Vercel Edge Network의 `Cache-Control: s-maxage=N` 헤더를 활용.
- 개별 사용자가 아닌 **URL 파라미터(심볼)** 기준으로 요청을 그룹화하여, 대규모 트래픽 발생 시에도 Vercel 서버가 Yahoo/Finnhub로 보내는 요청 수를 극단적으로 억제함.
- LocalStorage의 `stockdesk_cache_v1` 의존도를 낮추고 Edge Cache에 위임.

### 성능 최적화

- 박스 개수 제한 없음 (초기, 추후 추가 가능)
- 차트 데이터 포인트 최적화
- 불필요한 리렌더링 방지

---

## 📁 프로젝트 구조

```
stock-desk/
├── src/
│   ├── components/              # Atomic Design Pattern
│   │   ├── atoms/               # 기본 단위 컴포넌트
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   └── Badge/
│   │   ├── molecules/           # 원자 조합 컴포넌트
│   │   │   ├── SearchInput/
│   │   │   ├── PriceDisplay/
│   │   │   ├── StockChart/      # Lightweight Charts 캔들스틱
│   │   │   ├── KSTClock/        # 한국 시간 디지털 시계
│   │   │   ├── Modal/           # 모달
│   │   │   └── NetworkOfflineBanner/
│   │   └── organisms/           # 분자 조합 복잡한 컴포넌트
│   │       ├── Header/
│   │       │   ├── Header.tsx
│   │       │   ├── Header.stories.tsx
│   │       │   └── Header.test.tsx
│   │       ├── StockBox/
│   │       ├── MobileStockCard/ # 모바일 전용 카드
│   │       ├── SearchModal/
│   │       └── SettingsModal/
│   ├── hooks/                   # 비즈니스 로직 (Custom Hooks)
│   │   ├── useStockData.ts      # 주식 데이터 fetching
│   │   ├── useChartData.ts      # 차트 데이터 fetching
│   │   ├── useExchangeRate.ts   # 환율 데이터
│   │   ├── useMarketStatus.ts   # 시장 개장/휴장 상태
│   │   ├── useNetworkStatus.ts  # 온라인/오프라인 상태
│   │   ├── useIsMobile.ts       # 모바일 여부
│   │   ├── useFullscreen.ts     # 전체화면
│   │   └── useWakeLock.ts       # 화면 잠금 방지
│   ├── services/                # API 호출 및 외부 서비스
│   │   ├── api/
│   │   │   └── finnhubApi.ts    # Finnhub REST API (Quote + Candle + Search)
│   │   ├── websocket/
│   │   │   └── yahooSocket.ts   # Yahoo Finance WebSocket (Protobuf)
│   │   └── storage/
│   │       └── localStorage.ts  # LocalStorage 서비스
│   ├── stores/                  # 전역 상태 관리 (Zustand)
│   │   ├── stockStore.ts        # 종목 목록 + 위치/크기
│   │   ├── settingsStore.ts     # 사용자 설정
│   │   └── uiStore.ts           # UI 상태 (모달 등)
│   ├── i18n/                    # 다국어 (react-i18next)
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── ko.json
│   │       └── en.json
│   ├── utils/                   # 유틸리티 함수
│   │   └── cn.ts                # tailwind-merge + clsx
│   ├── types/                   # TypeScript 타입
│   │   ├── stock.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   └── common.ts
│   ├── constants/               # 상수
│   │   ├── api.ts
│   │   └── app.ts
│   ├── styles/                  # 글로벌 스타일
│   │   └── globals.css          # Tailwind directives + 글로벌
│   ├── App.tsx
│   └── main.tsx
├── api/                         # Vercel Serverless Functions (예정)
│   └── .gitkeep
├── public/
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.js           # Tailwind 설정
├── postcss.config.js            # PostCSS 설정
├── vite.config.ts
└── vercel.json
```

---

## 🚀 개발 단계

### Phase 1: 기본 구조

- [x] Vite + React + TypeScript 프로젝트 설정
- [x] 기본 컴포넌트 구조 생성
- [x] Glassmorphism 스타일 시스템 구축

### Phase 2: 핵심 기능

- [x] StockBox 컴포넌트 (드래그 & 리사이징)
- [x] Finnhub API 연동 (Serverless Functions 프록시, 실시간 가격)
- [x] Finnhub Candle API 연동 (차트 OHLCV 데이터, Yahoo Finance 대신 사용)
- [x] LocalStorage 관리 시스템
- [x] 실시간 데이터 업데이트 (REST API Polling + WebSocket)

### Phase 3: UI/UX

- [x] Header (환율, 시간, 테마)
- [x] SearchModal (종목 검색)
- [x] SettingsModal (설정)
- [ ] LandingPage (로딩 화면)
- [ ] ErrorModal (에러 처리)

### Phase 4: 차트

- [x] Lightweight Charts 통합
- [x] 차트 인터랙션 (드래그, 줌)
- [x] 기간 선택 기능

### Phase 5: 최적화 & 배포

- [ ] 성능 최적화
- [x] 반응형 디자인 (모바일 — MobileStockCard, Modal)
- [ ] Google Analytics 연동
- [ ] Sentry 연동
- [ ] Vercel 배포

---

## 📝 미결정 사항

### 확인 필요

1. **API 확정**
   - 실시간 가격: Finnhub (서버 측 프록시)
   - 차트 데이터: Yahoo Finance (무료 REST API)
2. **설정 모달 추가 항목**
   - 언어 설정 필요 여부
   - 통화 표시 옵션
   - 박스 기본 크기 설정

3. **LocalStorage 키 구조 최종 확정**
   - 현재 제안된 구조로 진행할지

4. **모바일 인터랙션 효과 세부사항**
   - Scale, shadow, opacity 값
   - 햅틱 피드백 강도

5. **박스 최소/최대 크기**
   - 구체적인 픽셀 값

6. **차트 데이터 포인트 개수**
   - 성능을 위한 최적값

---

## 🎯 성공 기준

- ✅ 실시간 주식 데이터 표시
- ✅ 부드러운 드래그 & 리사이징
- ✅ 브라우저 재시작 후에도 상태 유지
- ✅ 모바일/데스크톱 모두 원활한 UX
- ✅ 빠른 로딩 속도 (< 3초)
- ✅ 에러 없는 안정적인 동작
- ✅ 아름다운 Glassmorphism 디자인

---

## 📞 연락처 & 참고

- **프로젝트 저장소**: `/Users/jm4293/Project/stock-desk`
- **배포 플랫폼**: Vercel
- **문서 작성일**: 2026-02-15
