# 🎨 Agent 2: Styles (스타일 전문가)

> Tailwind CSS + CSS Modules + Glassmorphism 디자인 시스템 구축

## 🎯 역할

프로젝트의 스타일 시스템을 구축합니다.

- Tailwind CSS 설정
- CSS Modules 설정
- Glassmorphism 디자인 시스템
- cn() 유틸리티 함수
- 글로벌 스타일
- 다크/라이트 모드

## 📋 작업 범위

### ✅ 작업 대상

- `tailwind.config.js` - Tailwind 설정
- `postcss.config.js` - PostCSS 설정
- `src/styles/globals.css` - 글로벌 스타일
- `src/styles/themes.css` - 테마 변수
- `src/utils/cn.ts` - 클래스 병합 유틸리티
- CSS Modules 예제

### ❌ 작업 제외

- 컴포넌트 개발 (Components 에이전트)
- 비즈니스 로직 (State, Services 에이전트)
- 테스트 (Test 에이전트)

## 📚 필수 읽기 문서

1. **CSS_ARCHITECTURE.md** - CSS 전략 (필독!)
2. **CLAUDE.md** - 프로젝트 이해
3. **PROJECT_REQUIREMENTS.md** - 디자인 요구사항

## 🔧 작업 순서

### 1단계: Tailwind 설정

#### 1.1 tailwind.config.js

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 한국식 색상
        "up-kr": "#ff0000",
        "down-kr": "#0000ff",
        // 미국식 색상
        "up-us": "#22c55e",
        "down-us": "#ef4444",
        // 브랜드 색상
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#3b82f6",
          600: "#2563eb",
          900: "#1e3a8a",
        },
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        "card-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        card: "0 4px 16px 0 rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
```

#### 1.2 postcss.config.js

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 2단계: 글로벌 스타일

#### 2.1 globals.css

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 글로벌 리셋 */
@layer base {
  * {
    @apply box-border;
  }

  html,
  body,
  #root {
    @apply m-0 h-full w-full p-0;
  }

  body {
    @apply font-sans antialiased;
    @apply text-gray-900 dark:text-gray-100;
    @apply bg-gradient-to-br from-blue-50 to-indigo-100;
    @apply dark:from-gray-900 dark:to-gray-800;
  }

  #root {
    @apply relative overflow-hidden;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    @apply h-2 w-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }

  ::-webkit-scrollbar-thumb {
    @apply rounded-full bg-gray-300 dark:bg-gray-600;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400 dark:bg-gray-500;
  }
}

/* 유틸리티 클래스 */
@layer utilities {
  /* Glassmorphism */
  .glass {
    @apply border border-white/20 bg-white/10 backdrop-blur-lg;
    @apply shadow-glass;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .glass-dark {
    @apply border border-gray-700/30 bg-gray-900/30 backdrop-blur-lg;
    @apply shadow-glass;
  }

  /* Card Styles */
  .card {
    @apply bg-white dark:bg-gray-800;
    @apply rounded-xl shadow-card;
    @apply border border-gray-200 dark:border-gray-700;
  }

  .card-gradient {
    @apply bg-gradient-to-br from-white/80 to-white/40;
    @apply dark:from-gray-800/80 dark:to-gray-800/40;
    @apply backdrop-blur-md;
  }

  /* Focus States */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
    @apply dark:focus:ring-offset-gray-900;
  }

  /* Blur Effect */
  .blur-unfocused {
    @apply opacity-70 blur-sm transition-all duration-200;
  }

  .focused {
    @apply opacity-100 blur-0 transition-all duration-200;
  }

  /* Text Gradients */
  .text-gradient {
    @apply bg-clip-text text-transparent;
    @apply bg-gradient-to-r from-blue-600 to-indigo-600;
    @apply dark:from-blue-400 dark:to-indigo-400;
  }

  /* 가격 변동 색상 (한국식) */
  .price-up-kr {
    @apply text-up-kr;
  }

  .price-down-kr {
    @apply text-down-kr;
  }

  /* 가격 변동 색상 (미국식) */
  .price-up-us {
    @apply text-up-us;
  }

  .price-down-us {
    @apply text-down-us;
  }

  /* 애니메이션 */
  .animate-in {
    @apply animate-fade-in;
  }

  .slide-in-up {
    @apply animate-slide-up;
  }

  .slide-in-down {
    @apply animate-slide-down;
  }

  .scale-in {
    @apply animate-scale-in;
  }
}

/* 컴포넌트 스타일 */
@layer components {
  /* 버튼 기본 스타일 */
  .btn {
    @apply rounded-lg px-4 py-2 font-medium;
    @apply transition-all duration-200;
    @apply focus-ring;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
  }

  .btn-primary {
    @apply btn bg-primary-500 text-white;
    @apply hover:bg-primary-600;
    @apply active:bg-primary-700;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900;
    @apply dark:bg-gray-700 dark:text-gray-100;
    @apply hover:bg-gray-300 dark:hover:bg-gray-600;
  }

  .btn-ghost {
    @apply btn bg-transparent;
    @apply hover:bg-gray-100 dark:hover:bg-gray-800;
  }

  /* Input 스타일 */
  .input {
    @apply rounded-lg px-4 py-2;
    @apply bg-white dark:bg-gray-800;
    @apply border border-gray-300 dark:border-gray-600;
    @apply text-gray-900 dark:text-gray-100;
    @apply placeholder:text-gray-400 dark:placeholder:text-gray-500;
    @apply focus-ring;
    @apply transition-colors duration-200;
  }

  /* Modal Overlay */
  .modal-overlay {
    @apply fixed inset-0 z-50;
    @apply bg-black/50 backdrop-blur-sm;
    @apply flex items-center justify-center;
    @apply animate-fade-in;
  }

  /* Modal Content */
  .modal-content {
    @apply glass rounded-2xl p-6;
    @apply mx-4 w-full max-w-lg;
    @apply animate-scale-in;
  }
}
```

#### 2.2 themes.css

```css
/* src/styles/themes.css */
:root {
  /* Light Mode */
  --color-background: 239 246 255; /* blue-50 */
  --color-foreground: 17 24 39; /* gray-900 */

  --color-card: 255 255 255;
  --color-card-foreground: 17 24 39;

  --color-primary: 59 130 246; /* blue-500 */
  --color-primary-foreground: 255 255 255;

  --color-border: 229 231 235; /* gray-200 */
  --color-input: 255 255 255;

  --color-up-kr: 255 0 0;
  --color-down-kr: 0 0 255;
  --color-up-us: 34 197 94;
  --color-down-us: 239 68 68;
}

.dark {
  /* Dark Mode */
  --color-background: 17 24 39; /* gray-900 */
  --color-foreground: 243 244 246; /* gray-100 */

  --color-card: 31 41 55; /* gray-800 */
  --color-card-foreground: 243 244 246;

  --color-primary: 59 130 246;
  --color-primary-foreground: 255 255 255;

  --color-border: 55 65 81; /* gray-700 */
  --color-input: 31 41 55;

  --color-up-kr: 255 0 0;
  --color-down-kr: 0 0 255;
  --color-up-us: 34 197 94;
  --color-down-us: 239 68 68;
}
```

### 3단계: cn() 유틸리티 함수

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스를 병합하는 유틸리티 함수
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌을 해결
 *
 * @example
 * cn('px-4 py-2', 'px-6') // 'px-6 py-2'
 * cn('text-red-500', condition && 'text-blue-500') // 조건부
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4단계: CSS Modules 예제

```css
/* src/components/StockBox/StockBox.module.css */
.stockBox {
  /* 복잡한 애니메이션이나 Tailwind으로 표현 어려운 스타일만 */
  animation: var(--stock-box-animation, none);
}

.stockBox:hover .dragHandle {
  opacity: 1;
}

.dragHandle {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chartContainer {
  /* 차트 특수 스타일 */
  position: relative;
  isolation: isolate;
}

@keyframes priceFlash {
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(59, 130, 246, 0.1);
  }
}

.priceFlash {
  animation: priceFlash 0.5s ease;
}
```

## ✅ 완료 체크리스트

### 설정 파일

- [ ] `tailwind.config.js` 생성
- [ ] `postcss.config.js` 생성

### 스타일 파일

- [ ] `src/styles/globals.css` 생성
  - [ ] Tailwind base, components, utilities
  - [ ] 글로벌 리셋
  - [ ] Glassmorphism 유틸리티
  - [ ] 버튼/Input 컴포넌트 스타일
  - [ ] 애니메이션
- [ ] `src/styles/themes.css` 생성
  - [ ] Light mode 변수
  - [ ] Dark mode 변수

### 유틸리티

- [ ] `src/utils/cn.ts` 생성

### 예제

- [ ] CSS Modules 예제 작성

### 검증

- [ ] Tailwind 빌드 성공
- [ ] 다크 모드 토글 동작
- [ ] cn() 함수 정상 동작
- [ ] Glassmorphism 효과 확인

## 🎨 디자인 가이드라인

### 색상 팔레트

```
Primary: Blue (주요 액션)
Success: Green (상승, 성공)
Danger: Red (하락, 에러)
Warning: Yellow (경고)
Neutral: Gray (텍스트, 배경)
```

### 타이포그래피

```
Heading 1: text-4xl font-bold
Heading 2: text-3xl font-semibold
Heading 3: text-2xl font-semibold
Body: text-base
Small: text-sm
Tiny: text-xs
```

### 간격

```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
```

### 반응형 브레이크포인트

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## ⚠️ 중요 규칙

1. **!important 절대 금지**
   - tailwind-merge가 자동으로 충돌 해결
   - 필요하면 CSS 특이성(specificity)으로 해결

2. **Tailwind 우선 사용 (90%)**
   - 복잡한 애니메이션만 CSS Modules
   - 단순 스타일은 Tailwind로

3. **cn() 함수 활용**

   ```tsx
   // ✅ 좋은 예
   className={cn('base-class', condition && 'conditional-class')}

   // ❌ 나쁜 예
   className={`base-class ${condition ? 'conditional-class' : ''}`}
   ```

4. **다크 모드 고려**
   ```tsx
   // 항상 다크 모드 클래스 함께 정의
   className = "bg-white dark:bg-gray-800";
   ```

## 🤝 다음 에이전트에게 전달

Styles 작업 완료 후:

```
✅ Styles 작업 완료

생성된 결과물:
- Tailwind 설정 완료
- 글로벌 스타일 완료
- cn() 유틸리티 완료
- 다크/라이트 모드 준비 완료

다음 에이전트: Agent 3 (State) 또는 Agent 4 (Services)
- 두 에이전트 병렬 작업 가능
- State: "AGENT_STATE.md를 읽고 Zustand 스토어를 구축해주세요"
- Services: "AGENT_SERVICES.md를 읽고 API 레이어를 구축해주세요"
```

---

**담당**: 스타일 시스템  
**의존성**: Architect  
**다음 에이전트**: State, Services (병렬 가능)
