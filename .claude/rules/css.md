# CSS 작성 규칙

> Tailwind CSS 우선, CSS Modules는 최소한으로

---

## 🎯 핵심 원칙

1. ✅ **Tailwind 우선** - 90% 이상의 스타일링
2. ✅ **cn() 함수 사용** - 클래스 병합 (clsx + tailwind-merge)
3. ✅ **CSS Modules는 복잡한 스타일만** - gradient, pseudo-elements
4. ❌ **!important 절대 금지**

---

## ✅ Tailwind 우선 사용

### 기본 스타일링

```tsx
// ✅ 올바른 방법
<div className="flex items-center gap-2 rounded-xl bg-white/10 p-4">
  <span className="text-sm font-bold text-white">Price</span>
</div>
```

### 조건부 스타일링 - cn() 사용

```tsx
import { cn } from "@/utils/cn";

// ✅ 올바른 방법
<div
  className={cn("rounded-xl p-4", focused && "z-50 shadow-2xl", !focused && "opacity-70 blur-sm")}
/>;
```

---

## 🔧 cn() 함수 사용법

### 기본 사용

```tsx
import { cn } from "@/utils/cn";

// 조건부 클래스
<div className={cn(
  "base-class",
  condition && "conditional-class"
)} />

// 여러 조건
<div className={cn(
  "flex items-center",
  isActive && "bg-blue-500",
  !isActive && "bg-gray-300",
  isLarge && "text-lg",
  props.className // 외부에서 받은 클래스
)} />
```

### Props와 함께 사용

```tsx
interface ButtonProps {
  className?: string;
  variant?: "primary" | "secondary";
}

export const Button = ({ className, variant = "primary" }: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 font-bold",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-500 text-white",
        className // 외부 클래스 병합
      )}
    />
  );
};
```

---

## 📦 CSS Modules 사용 (복잡한 스타일만)

### 사용 조건

다음의 경우만 CSS Modules 허용:

- ✅ 복잡한 gradient
- ✅ 여러 pseudo-elements (::before, ::after)
- ✅ keyframe 애니메이션 (Tailwind로 불가능한 경우)
- ✅ 브라우저 특정 스타일 (-webkit-, -moz-)

### 예시: Glass Morphism

```tsx
// StockBox.module.css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.glassHover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.glassHover:hover::before {
  opacity: 1;
}
```

```tsx
// StockBox.tsx
import { cn } from "@/utils/cn";
import styles from "./StockBox.module.css";

export const StockBox = ({ focused }) => {
  return (
    <div className={cn(styles.glass, styles.glassHover, "rounded-xl p-4", focused && "z-50")}>
      {/* content */}
    </div>
  );
};
```

---

## ❌ 절대 금지 사항

### !important 사용 금지

```css
/* ❌ 절대 금지 */
.myClass {
  color: red !important;
  z-index: 9999 !important;
}
```

**이유:**

- 우선순위 전쟁 발생
- 유지보수 어려움
- Tailwind의 장점 상실

**해결 방법:**

```tsx
// ✅ cn()으로 클래스 병합
<div className={cn("text-red-500", props.className)} />

// 또는 구체적인 선택자 사용 (CSS Modules)
.parent .child {
  color: red;
}
```

### Inline Style 최소화

```tsx
// ❌ 피해야 할 방법
<div style={{ color: "red", fontSize: "16px" }} />

// ✅ 올바른 방법
<div className="text-red-500 text-base" />
```

**예외:** 동적 값이 필요한 경우만 허용

```tsx
// ✅ 동적 값이므로 허용
<div style={{ transform: `translateX(${x}px)` }} />
```

---

## 🎨 색상 사용

### 미리 정의된 색상 사용

```tsx
// ✅ tailwind.config.js에 정의된 색상
<div className="text-up-kr">+2.5%</div>      // 한국식 상승 (빨강)
<div className="text-down-kr">-1.2%</div>    // 한국식 하락 (파랑)
<div className="text-up-us">+2.5%</div>      // 미국식 상승 (초록)
<div className="text-down-us">-1.2%</div>    // 미국식 하락 (빨강)
```

### 투명도 사용

```tsx
// ✅ Tailwind 투명도 구문
<div className="bg-white/10 text-black/50" />
```

---

## 📐 반응형 디자인

```tsx
// ✅ Tailwind 반응형 유틸리티
<div className="flex flex-col md:flex-row lg:gap-4" />

// 모바일 우선
<div className="text-sm sm:text-base md:text-lg" />
```

---

## 🌓 다크/라이트 모드

```tsx
// ✅ dark: 접두사 사용
<div className="bg-white text-black dark:bg-black dark:text-white" />

// cn()과 함께
<div
  className={cn(
    "rounded-xl p-4",
    "bg-white dark:bg-gray-900",
    "text-gray-900 dark:text-white"
  )}
/>
```

---

## 📋 체크리스트

스타일 작성 후:

- [ ] Tailwind로 90% 이상 스타일링했는가?
- [ ] 조건부 클래스에 cn() 사용했는가?
- [ ] !important 사용하지 않았는가?
- [ ] CSS Modules는 복잡한 스타일만 사용했는가?
- [ ] 반응형 디자인 고려했는가?
- [ ] 다크 모드 대응했는가?

---

## 🚨 자주 하는 실수

### ❌ 실수 1: cn() 없이 조건부 클래스

```tsx
// ❌ 잘못된 방법
<div className={`base ${focused ? "focused" : ""}`} />

// ✅ 올바른 방법
<div className={cn("base", focused && "focused")} />
```

### ❌ 실수 2: 불필요한 CSS Modules

```tsx
// ❌ Tailwind로 충분한데 CSS Modules 사용
// Button.module.css
.button {
  padding: 1rem;
  border-radius: 0.5rem;
}

// ✅ 올바른 방법 - Tailwind 사용
<button className="rounded-lg p-4" />
```

### ❌ 실수 3: 하드코딩된 색상

```tsx
// ❌ 잘못된 방법
<div className="text-[#ff0000]" />

// ✅ 올바른 방법
<div className="text-up-kr" />
```

---

**작성일:** 2026-03-10
**참조:** [docs/architecture/css-architecture.md](../../docs/architecture/css-architecture.md) (작성 예정)
