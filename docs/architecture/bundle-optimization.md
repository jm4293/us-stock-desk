# Stock Desk - 번들 최적화 가이드

## 📋 개요

이 프로젝트는 여러 무거운 라이브러리(Lightweight Charts ~200KB, GSAP ~50KB 등)를 사용하므로 번들 최적화가 필수입니다.

---

## 🎯 현재 예상 번들 크기

```
react + react-dom: ~140KB (gzipped)
react-rnd: ~50KB
lightweight-charts: ~200KB
gsap: ~50KB
zustand: ~3KB
react-hook-form: ~25KB
i18next + react-i18next: ~30KB
zod: ~15KB
기타 라이브러리: ~50KB
─────────────────────────
총 예상: ~560KB (gzipped)
```

**최적화 없이는 초기 로딩 시간이 3초 이상 소요될 수 있습니다!**

---

## ✅ 필수 최적화 전략

### 1. Code Splitting (코드 분할) ⭐ 최우선

#### React.lazy + Suspense

```tsx
// src/App.tsx
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// 페이지 레벨 분할
const MainPage = lazy(() => import("@/components/pages/MainPage"));
const LandingPage = lazy(() => import("@/components/pages/LandingPage"));

// 무거운 컴포넌트 분할
const SearchModal = lazy(() => import("@/components/organisms/SearchModal"));
const SettingsModal = lazy(() => import("@/components/organisms/SettingsModal"));

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <MainPage />
      </Suspense>
    </ErrorBoundary>
  );
}
```

#### 라우트 기반 분할

```tsx
// src/router.tsx
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const MainPage = lazy(() => import("@/components/pages/MainPage"));
const SettingsPage = lazy(() => import("@/components/pages/SettingsPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
]);
```

---

### 2. Dynamic Import (동적 임포트)

#### GSAP 동적 로드

```tsx
// src/hooks/useGSAPAnimation.ts
import { useEffect, useRef } from "react";

export const useGSAPAnimation = () => {
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);

  const animate = async (target: string, options: any) => {
    if (!gsapRef.current) {
      const { gsap } = await import("gsap");
      gsapRef.current = gsap;
    }

    gsapRef.current.from(target, options);
  };

  return { animate };
};
```

#### Lightweight Charts 동적 로드

```tsx
// src/components/organisms/StockBox/StockChart.tsx
import { useEffect, useRef, useState } from "react";
import type { IChartApi } from "lightweight-charts";

export const StockChart = ({ data }: { data: any[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);

  useEffect(() => {
    const loadChart = async () => {
      if (!chartContainerRef.current) return;

      // 차트 라이브러리 동적 로드
      const { createChart } = await import("lightweight-charts");

      const chartInstance = createChart(chartContainerRef.current, {
        width: 400,
        height: 300,
      });

      setChart(chartInstance);
    };

    loadChart();

    return () => {
      chart?.remove();
    };
  }, []);

  return <div ref={chartContainerRef} />;
};
```

---

### 3. Vite 번들 최적화 설정

#### vite.config.ts

```ts
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),

    // 번들 크기 시각화
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),

    // Gzip 압축
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),

    // Brotli 압축 (더 효율적)
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        // 벤더 청크 수동 분리
        manualChunks: {
          // React 관련
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],

          // 차트 라이브러리 (가장 무거움)
          "chart-vendor": ["lightweight-charts"],

          // 애니메이션
          "animation-vendor": ["gsap"],

          // 폼 관련
          "form-vendor": ["react-hook-form", "zod", "@hookform/resolvers"],

          // 상태 관리
          "state-vendor": ["zustand"],

          // 다국어
          "i18n-vendor": ["react-i18next", "i18next", "i18next-browser-languagedetector"],

          // 드래그 앤 드롭
          "rnd-vendor": ["react-rnd"],

          // 유틸리티
          "utils-vendor": ["clsx", "tailwind-merge"],
        },

        // 청크 파일명 패턴
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    // 청크 크기 경고 임계값 (KB)
    chunkSizeWarningLimit: 500,

    // 소스맵 제거 (프로덕션)
    sourcemap: false,

    // 압축 설정
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
        pure_funcs: ["console.log", "console.info"], // 특정 함수 제거
      },
      format: {
        comments: false, // 주석 제거
      },
    },

    // CSS 코드 분할
    cssCodeSplit: true,

    // 청크 크기 제한
    assetsInlineLimit: 4096, // 4KB 이하는 인라인
  },

  // 최적화 옵션
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "clsx", "tailwind-merge"],
    exclude: [
      "lightweight-charts", // 큰 라이브러리는 제외
      "gsap",
    ],
  },
});
```

---

### 4. Tree Shaking 최적화

#### package.json 설정

```json
{
  "sideEffects": ["*.css", "*.scss"]
}
```

#### 올바른 Import 패턴

```tsx
// ❌ 나쁜 예 - 전체 라이브러리 임포트
import _ from "lodash";
// ✅ 좋은 예 - 필요한 것만 임포트
import debounce from "lodash-es/debounce";
// ❌ 나쁜 예 - 기본 export 사용
import moment from "moment";
import * as Icons from "react-icons/fa";
import { FaCog, FaSearch } from "react-icons/fa";

// ✅ 좋은 예 - 네이티브 API 사용
const date = new Date();
```

---

### 5. 이미지 최적화

#### Vite 플러그인 설치

```bash
npm install -D vite-plugin-imagemin
```

#### vite.config.ts에 추가

```ts
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          { name: "removeViewBox", active: false },
          { name: "removeEmptyAttrs", active: true },
          { name: "removeUselessDefs", active: true },
        ],
      },
    }),
  ],
});
```

#### Lazy Loading Images

```tsx
// src/components/atoms/LazyImage.tsx
export const LazyImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy" // 네이티브 lazy loading
      decoding="async" // 비동기 디코딩
    />
  );
};
```

---

### 6. CSS 최적화

#### Tailwind CSS 최적화

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // 사용하지 않는 스타일 제거
  safelist: [], // 동적 클래스만 추가
};
```

#### CSS Modules 최적화

```ts
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[hash:base64:5]", // 짧은 클래스명
    },
  },
});
```

---

### 7. 폰트 최적화

#### Google Fonts 최적화

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

#### 로컬 폰트 사용 (더 빠름)

```css
/* src/styles/fonts.css */
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap; /* FOIT 방지 */
}
```

---

## 📊 번들 분석 도구

### 설치

```bash
npm install -D rollup-plugin-visualizer
```

### 사용

```bash
# 빌드 후 자동으로 stats.html 열림
npm run build

# 또는 수동으로 분석
npx vite-bundle-visualizer
```

### 분석 결과 해석

- **큰 청크 확인**: 500KB 이상은 분할 필요
- **중복 코드 확인**: 같은 라이브러리가 여러 청크에 포함되는지 확인
- **사용하지 않는 코드**: Tree shaking이 제대로 작동하는지 확인

---

## 🎯 최적화 목표

### 번들 크기 목표

```
초기 번들 (Critical Path):
  - main.js: < 150KB (gzipped)
  - react-vendor.js: < 140KB (gzipped)
  - Total: < 300KB (gzipped)

지연 로드 청크:
  - chart-vendor.js: ~200KB (필요할 때 로드)
  - animation-vendor.js: ~50KB (필요할 때 로드)
  - form-vendor.js: ~30KB (모달 열릴 때 로드)
  - i18n-vendor.js: ~30KB (초기 로드)
```

### 성능 목표

```
First Contentful Paint (FCP): < 1.5초
Largest Contentful Paint (LCP): < 2.5초
Time to Interactive (TTI): < 3.5초
Total Blocking Time (TBT): < 300ms
Cumulative Layout Shift (CLS): < 0.1

Lighthouse 점수:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 90+
```

---

## 📋 최적화 체크리스트

### 코드 분할

- [ ] React.lazy로 페이지 분할
- [ ] 무거운 컴포넌트 lazy loading (모달, 차트)
- [ ] 라우트 기반 코드 분할
- [ ] Vite manualChunks 설정

### 동적 임포트

- [ ] GSAP 동적 로드
- [ ] Lightweight Charts 동적 로드
- [ ] 큰 라이브러리 필요할 때만 로드

### 번들 최적화

- [ ] Tree shaking 확인
- [ ] 사용하지 않는 코드 제거
- [ ] console.log 제거 (프로덕션)
- [ ] 소스맵 제거 (프로덕션)

### 리소스 최적화

- [ ] 이미지 압축 및 최적화
- [ ] Lazy loading images
- [ ] 폰트 최적화 (font-display: swap)
- [ ] CSS 압축

### 압축

- [ ] Gzip 압축 활성화
- [ ] Brotli 압축 활성화 (더 효율적)

### 분석

- [ ] 번들 분석기로 크기 확인
- [ ] Lighthouse 성능 점수 측정
- [ ] WebPageTest로 실제 성능 측정

---

## 🛠 개발 vs 프로덕션

### 개발 환경

```ts
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === "development", // 개발에서만 소스맵
    minify: mode === "production", // 프로덕션에서만 압축
  },
}));
```

### package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:analyze": "vite build && vite-bundle-visualizer",
    "preview": "vite preview",
    "lighthouse": "lighthouse http://localhost:4173 --view"
  }
}
```

---

## 📈 성능 모니터링

### Lighthouse CI

```bash
npm install -D @lhci/cli

# lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
      },
    },
  },
};
```

### Web Vitals 측정

```tsx
// src/utils/reportWebVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals";

export const reportWebVitals = () => {
  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
};

// main.tsx
import { reportWebVitals } from "./utils/reportWebVitals";

reportWebVitals();
```

---

## 🚀 배포 최적화

### Vercel 설정

```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

**작성일**: 2026-02-15
