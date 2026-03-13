# 컴포넌트 개발 규칙

> React 컴포넌트 작성 시 반드시 따라야 할 규칙

---

## 🎯 핵심 원칙

1. ✅ **UI만 담당** - 비즈니스 로직은 Hook으로 분리
2. ✅ **Atomic Design 패턴** - atoms → molecules → organisms
3. ✅ **TypeScript 타입 정의 필수**
4. ✅ **Props는 Interface로 정의**
5. ❌ **컴포넌트에 복잡한 로직 금지**

---

## 📦 Atomic Design 구조

```
atoms/       # 기본 UI 요소 (Button, Input, Badge)
  └── 재사용 가능, 독립적

molecules/   # atoms 조합 (SearchInput, PriceDisplay)
  └── 단일 기능 제공

organisms/   # molecules/atoms 조합 (Header, StockBox)
  └── 복잡한 UI 섹션
```

---

## ✅ 올바른 컴포넌트 구조

### 1. UI만 담당

```tsx
// ✅ 올바른 방법
import { useStockData } from "@/hooks";

interface StockBoxProps {
  symbol: string;
  focused: boolean;
}

export const StockBox = ({ symbol, focused }: StockBoxProps) => {
  // Hook에서 로직 처리
  const { data, loading } = useStockData(symbol);

  if (loading) return <div>Loading...</div>;

  // UI만 렌더링
  return (
    <div className={cn("rounded-xl p-4", focused && "z-50")}>
      <h3>{symbol}</h3>
      <p>${data.price}</p>
    </div>
  );
};
```

### 2. Props Interface 정의

```tsx
// ✅ 올바른 방법
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className,
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg font-bold",
        variant === "primary" && "bg-blue-500 text-white",
        size === "sm" && "px-2 py-1 text-sm",
        size === "md" && "px-4 py-2 text-base",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

---

## ❌ 금지된 패턴

### 1. 컴포넌트 내부에 비즈니스 로직

```tsx
// ❌ 잘못된 방법
export const StockBox = ({ symbol }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❌ API 호출을 컴포넌트에서 직접
    fetch(`/api/stock?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .finally(() => setLoading(false));
  }, [symbol]);

  // ...
};

// ✅ 올바른 방법 - Hook으로 분리
export const StockBox = ({ symbol }) => {
  const { data, loading } = useStockData(symbol);
  // ...
};
```

### 2. any 타입 사용

```tsx
// ❌ 잘못된 방법
interface Props {
  data: any;
  onSelect: (item: any) => void;
}

// ✅ 올바른 방법
interface Props {
  data: StockPrice;
  onSelect: (item: StockPrice) => void;
}
```

### 3. Props 타입 미정의

```tsx
// ❌ 잘못된 방법
export const Button = ({ children, onClick }) => {
  // ...
};

// ✅ 올바른 방법
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ children, onClick }: ButtonProps) => {
  // ...
};
```

---

## 📁 파일 구조

### 폴더 및 파일 명명

```
src/components/atoms/Button/
├── Button.tsx              # 컴포넌트
├── Button.module.css       # CSS (필요시)
├── Button.test.tsx         # 테스트
├── Button.stories.tsx      # Storybook
└── index.ts                # export { Button } from "./Button"
```

### index.ts 필수

```ts
// src/components/atoms/Button/index.ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

---

## 🔄 컴포넌트 분리 기준

### Atoms (기본 요소)

```tsx
// Button, Input, Badge, Icon 등
export const Button = ({ children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};
```

### Molecules (atoms 조합)

```tsx
// SearchInput = Input + Icon
export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <Icon name="search" />
      <Input value={value} onChange={onChange} />
    </div>
  );
};
```

### Organisms (복잡한 섹션)

```tsx
// Header = Logo + SearchInput + Button
export const Header = () => {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      <Button onClick={handleSettings}>Settings</Button>
    </header>
  );
};
```

---

## 💡 권장 사항

### 1. Default Props

```tsx
// ✅ 함수 매개변수 기본값 사용
export const Button = ({ variant = "primary", size = "md", disabled = false }: ButtonProps) => {
  // ...
};
```

### 2. Children 타입

```tsx
interface Props {
  children: React.ReactNode; // ✅ 가장 범용적
}

interface Props {
  children: React.ReactElement; // ✅ React 요소만
}

interface Props {
  children: string; // ✅ 문자열만
}
```

### 3. Optional Props

```tsx
interface Props {
  required: string;
  optional?: string; // ✅ ? 사용
  callback?: () => void;
}
```

### 4. className Props 제공

```tsx
// ✅ 외부에서 스타일 확장 가능하도록
interface Props {
  className?: string;
}

export const Component = ({ className }: Props) => {
  return <div className={cn("base-styles", className)} />;
};
```

---

## 🧪 테스트 및 Storybook

### 컴포넌트 작성 순서 (TDD)

```
1. Storybook 스토리 작성
2. 테스트 코드 작성
3. 컴포넌트 구현
4. 테스트 통과 확인
```

### 필수 파일

```
- Component.tsx         # 컴포넌트
- Component.test.tsx    # 테스트
- Component.stories.tsx # Storybook 스토리
```

---

## 📋 체크리스트

새 컴포넌트 작성 후:

- [ ] Props Interface 정의했는가?
- [ ] 비즈니스 로직을 Hook으로 분리했는가?
- [ ] any 타입 사용하지 않았는가?
- [ ] className props 제공했는가?
- [ ] index.ts 생성했는가?
- [ ] 상위 index.ts에 export 추가했는가?
- [ ] Storybook 스토리 작성했는가?
- [ ] 테스트 코드 작성했는가?

---

## 🚨 자주 하는 실수

### ❌ 실수 1: 컴포넌트에 API 호출

```tsx
// ❌ 잘못된 방법
export const StockList = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch("/api/stocks").then(/* ... */);
  }, []);

  return <div>{/* ... */}</div>;
};

// ✅ 올바른 방법
export const StockList = () => {
  const { stocks, loading } = useStocks(); // Hook으로 분리
  return <div>{/* ... */}</div>;
};
```

### ❌ 실수 2: Atomic Design 무시

```tsx
// ❌ 잘못된 위치
src/components/atoms/StockChart/ // Chart는 organism

// ✅ 올바른 위치
src/components/organisms/StockChart/
```

### ❌ 실수 3: Props 구조분해 없이 사용

```tsx
// ❌ 가독성 낮음
export const Button = (props: ButtonProps) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};

// ✅ 구조분해 사용
export const Button = ({ onClick, children }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
```

---

**작성일:** 2026-03-10
**참조:** [docs/guides/tdd-storybook-i18n.md](../../docs/guides/tdd-storybook-i18n.md)
