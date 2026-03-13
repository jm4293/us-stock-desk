# 테스트 작성 규칙

> TDD 방식의 테스트 작성 규칙

---

## 🎯 핵심 원칙

1. ✅ **TDD 방식** - 테스트 먼저, 구현은 나중
2. ✅ **Storybook 스토리 필수** - 컴포넌트마다
3. ✅ **80% 이상 커버리지** 목표
4. ✅ **의미 있는 테스트** - 단순 커버리지 채우기 X
5. ❌ **구현 세부사항 테스트 금지** - 동작만 테스트

---

## 📋 TDD 워크플로우

```
1. Storybook 스토리 작성
   ↓
2. 테스트 코드 작성 (Red)
   ↓
3. 최소 구현 (Green)
   ↓
4. 리팩토링 (Refactor)
   ↓
5. 테스트 통과 확인
```

---

## ✅ 컴포넌트 테스트

### 1. 기본 렌더링 테스트

```tsx
// Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("텍스트를 렌더링한다", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("클릭 시 핸들러가 호출된다", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 상태에서는 클릭할 수 없다", async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 2. Props 테스트

```tsx
it("variant에 따라 다른 스타일이 적용된다", () => {
  const { rerender } = render(<Button variant="primary">Primary</Button>);
  expect(screen.getByRole("button")).toHaveClass("bg-blue-500");

  rerender(<Button variant="secondary">Secondary</Button>);
  expect(screen.getByRole("button")).toHaveClass("bg-gray-500");
});
```

---

## ✅ Hook 테스트

### 1. renderHook 사용

```tsx
// useCounter.test.ts
import { act, renderHook } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("초기값으로 시작한다", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increment 함수가 값을 증가시킨다", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### 2. 비동기 Hook 테스트

```tsx
// useStockData.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { finnhubApi } from "@/services/api/finnhubApi";
import { useStockData } from "./useStockData";

vi.mock("@/services/api/finnhubApi");

describe("useStockData", () => {
  it("데이터를 성공적으로 로드한다", async () => {
    const mockData = { symbol: "AAPL", price: 150 };
    vi.mocked(finnhubApi.getQuote).mockResolvedValue(mockData);

    const { result } = renderHook(() => useStockData("AAPL"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("에러를 올바르게 처리한다", async () => {
    const mockError = new Error("API Error");
    vi.mocked(finnhubApi.getQuote).mockRejectedValue(mockError);

    const { result } = renderHook(() => useStockData("AAPL"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });
});
```

---

## ✅ Storybook 스토리

### 1. 기본 스토리

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};
```

### 2. 인터랙션 테스트

```tsx
import { expect, userEvent, within } from "@storybook/test";

export const WithClick: Story = {
  args: {
    children: "Click me",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    await userEvent.click(button);
    // 클릭 후 동작 검증
  },
};
```

---

## 📋 테스트 작성 규칙

### 1. describe/it 구조

```tsx
describe("컴포넌트명/Hook명", () => {
  describe("기능 그룹", () => {
    it("구체적인 동작을 테스트한다", () => {
      // Arrange (준비)
      // Act (실행)
      // Assert (검증)
    });
  });
});
```

### 2. 테스트 이름

```tsx
// ✅ 올바른 방법 - 무엇을 테스트하는지 명확
it("사용자가 버튼을 클릭하면 카운터가 증가한다", () => {});
it("API 호출이 실패하면 에러 메시지를 표시한다", () => {});

// ❌ 잘못된 방법 - 불명확
it("동작한다", () => {});
it("테스트", () => {});
```

### 3. Mock 사용

```tsx
// ✅ 외부 의존성은 mock
vi.mock("@/services/api/finnhubApi");

it("API를 호출한다", async () => {
  const mockData = { price: 150 };
  vi.mocked(finnhubApi.getQuote).mockResolvedValue(mockData);

  // 테스트...
});
```

---

## ❌ 금지된 패턴

### 1. 구현 세부사항 테스트

```tsx
// ❌ 잘못된 방법 - 내부 state 직접 접근
it("state가 업데이트된다", () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.state).toBe(0); // 내부 state
});

// ✅ 올바른 방법 - 동작 테스트
it("increment 함수가 카운터를 증가시킨다", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1); // 외부 API
});
```

### 2. Snapshot 테스트 남용

```tsx
// ❌ 잘못된 방법 - 의미 없는 snapshot
it("렌더링 확인", () => {
  const { container } = render(<Button>Click</Button>);
  expect(container).toMatchSnapshot();
});

// ✅ 올바른 방법 - 의미 있는 검증
it("버튼 텍스트를 렌더링한다", () => {
  render(<Button>Click</Button>);
  expect(screen.getByText("Click")).toBeInTheDocument();
});
```

### 3. 타이머/비동기 잘못 처리

```tsx
// ❌ 잘못된 방법 - setTimeout 사용
it("로딩 상태 확인", () => {
  const { result } = renderHook(() => useStockData("AAPL"));
  setTimeout(() => {
    expect(result.current.loading).toBe(false);
  }, 1000);
});

// ✅ 올바른 방법 - waitFor 사용
it("로딩 상태 확인", async () => {
  const { result } = renderHook(() => useStockData("AAPL"));
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});
```

---

## 💡 권장 사항

### 1. AAA 패턴

```tsx
it("버튼 클릭 시 카운터 증가", async () => {
  // Arrange - 준비
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);

  // Act - 실행
  await userEvent.click(screen.getByText("Click"));

  // Assert - 검증
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 2. 접근성 쿼리 우선

```tsx
// ✅ 우선순위 순서
screen.getByRole("button"); // 1순위
screen.getByLabelText("Search"); // 2순위
screen.getByPlaceholderText("Enter"); // 3순위
screen.getByText("Click"); // 4순위
screen.getByTestId("button"); // 최후의 수단
```

### 3. userEvent 사용

```tsx
import { userEvent } from "@testing-library/user-event";

// ✅ userEvent 사용 (실제 사용자 동작 시뮬레이션)
await userEvent.click(button);
await userEvent.type(input, "text");

// ⚠️ fireEvent는 필요 시만
fireEvent.change(input, { target: { value: "text" } });
```

---

## 📋 체크리스트

새 파일 작성 후:

- [ ] Storybook 스토리 작성했는가?
- [ ] 테스트 코드 작성했는가?
- [ ] 테스트가 통과하는가?
- [ ] 커버리지가 충분한가? (80% 이상)
- [ ] 의미 있는 테스트인가? (구현 세부사항 X)
- [ ] Mock은 적절히 사용했는가?
- [ ] 비동기 처리 올바른가? (waitFor 사용)

---

## 🚀 테스트 실행

```bash
# 전체 테스트
npm run test

# Watch 모드
npm run test:watch

# 커버리지
npm run test:coverage

# UI 모드
npm run test:ui

# Storybook
npm run storybook
```

---

**작성일:** 2026-03-10
**참조:** [docs/guides/testing-guide.md](../../docs/guides/testing-guide.md) (작성 예정)
