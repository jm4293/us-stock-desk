import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("placeholder를 렌더링한다", () => {
    render(<Input placeholder="검색..." />);
    expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
  });

  it("label을 렌더링한다", () => {
    render(<Input label="종목명" />);
    expect(screen.getByLabelText("종목명")).toBeInTheDocument();
  });

  it("입력값 변경 이벤트가 호출된다", async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "AAPL");
    expect(handleChange).toHaveBeenCalled();
  });

  it("입력값이 textbox에 표시된다", async () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "TSLA");
    expect(input).toHaveValue("TSLA");
  });

  it("disabled 상태를 렌더링한다", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("error 상태에서 에러 메시지를 표시한다", () => {
    render(<Input error="필수 입력 항목입니다" />);
    expect(screen.getByText("필수 입력 항목입니다")).toBeInTheDocument();
  });

  it("error 상태에서 aria-invalid 속성이 설정된다", () => {
    render(<Input error="오류 메시지" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("error 없을 때 aria-invalid는 false이다", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "false");
  });

  it("type prop을 올바르게 적용한다", () => {
    render(<Input type="email" />);
    // type="email"은 여전히 textbox role이지만 type 속성 확인
    expect(document.querySelector('input[type="email"]')).toBeInTheDocument();
  });
});
