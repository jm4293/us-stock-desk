import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("텍스트를 렌더링한다", () => {
    render(<Badge>+1.25%</Badge>);
    expect(screen.getByText("+1.25%")).toBeInTheDocument();
  });

  it("positive variant는 상승 색상 스타일을 적용한다", () => {
    render(<Badge variant="positive">+1.25%</Badge>);
    expect(screen.getByText("+1.25%")).toHaveClass("text-up-us");
  });

  it("negative variant는 하락 색상 스타일을 적용한다", () => {
    render(<Badge variant="negative">-0.5%</Badge>);
    expect(screen.getByText("-0.5%")).toHaveClass("text-down-us");
  });

  it("neutral variant는 중립 색상 스타일을 적용한다", () => {
    render(<Badge variant="neutral">0.00%</Badge>);
    expect(screen.getByText("0.00%")).toBeInTheDocument();
  });

  it("기본 variant는 neutral이다", () => {
    render(<Badge>0.00%</Badge>);
    expect(screen.getByText("0.00%")).toBeInTheDocument();
  });

  it("추가 className을 적용할 수 있다", () => {
    render(<Badge className="text-xl">+1%</Badge>);
    expect(screen.getByText("+1%")).toHaveClass("text-xl");
  });
});
