import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("단일 클래스를 반환한다", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("여러 클래스를 병합한다", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("Tailwind 충돌 클래스를 올바르게 병합한다", () => {
    // tailwind-merge: 마지막 px가 우선
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("조건부 클래스를 처리한다", () => {
    expect(cn("base", true && "active", false && "inactive")).toBe("base active");
  });

  it("null/undefined를 무시한다", () => {
    expect(cn("base", null, undefined)).toBe("base");
  });

  it("배열 형태의 클래스를 처리한다", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });

  it("객체 형태의 조건부 클래스를 처리한다", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
  });

  it("인자가 없으면 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });
});
