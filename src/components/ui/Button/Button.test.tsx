import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("텍스트를 렌더링한다", () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByRole("button", { name: "클릭하세요" })).toBeInTheDocument();
  });

  it("클릭 이벤트가 호출된다", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 상태에서 클릭이 불가하다", async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        클릭
      </Button>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("disabled 상태에서 aria-disabled 속성이 설정된다", () => {
    render(<Button disabled>버튼</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("primary variant는 기본 스타일(bg-gray-900)을 적용한다", () => {
    render(<Button variant="primary">버튼</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-gray-900");
  });

  it("ghost variant는 투명 배경을 적용한다", () => {
    render(<Button variant="ghost">버튼</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-transparent");
  });

  it("loading 상태에서 스피너를 표시한다", () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("loading 상태에서 버튼이 비활성화된다", () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("sm size는 작은 패딩을 적용한다", () => {
    render(<Button size="sm">작은 버튼</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3");
  });

  it("lg size는 큰 패딩을 적용한다", () => {
    render(<Button size="lg">큰 버튼</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-6");
  });

  it("type 속성을 전달한다", () => {
    render(<Button type="submit">제출</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("기본 type은 button이다", () => {
    render(<Button>버튼</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
