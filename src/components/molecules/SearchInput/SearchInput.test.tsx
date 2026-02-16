import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("placeholder를 렌더링한다", () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText("종목 검색 (예: AAPL)")).toBeInTheDocument();
  });

  it("입력 후 엔터키로 검색을 실행한다", async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    await userEvent.type(screen.getByRole("textbox"), "AAPL{enter}");
    expect(handleSearch).toHaveBeenCalledWith("AAPL", "AAPL");
  });

  it("검색 버튼 클릭으로 검색을 실행한다", async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    await userEvent.type(screen.getByRole("textbox"), "TSLA");
    await userEvent.click(screen.getByRole("button", { name: /검색/i }));
    expect(handleSearch).toHaveBeenCalledWith("TSLA", "TSLA");
  });

  it("입력이 비어있으면 검색을 실행하지 않는다", async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    await userEvent.keyboard("{enter}");
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it("검색 후 입력 필드를 초기화한다", async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "AAPL{enter}");
    expect(input).toHaveValue("");
  });

  it("공백만 있는 입력은 검색을 실행하지 않는다", async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    await userEvent.type(screen.getByRole("textbox"), "   {enter}");
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it("검색 전 입력값을 대문자로 변환한다", async () => {
    const handleSearch = vi.fn();
    render(<SearchInput onSearch={handleSearch} />);
    await userEvent.type(screen.getByRole("textbox"), "aapl{enter}");
    expect(handleSearch).toHaveBeenCalledWith("AAPL", "AAPL");
  });
});
