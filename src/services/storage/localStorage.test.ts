import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "./localStorage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("값을 저장하고 불러온다 (문자열)", () => {
    storage.set("test-key", "hello");
    const result = storage.get<string>("test-key", "");
    expect(result).toBe("hello");
  });

  it("값을 저장하고 불러온다 (객체)", () => {
    storage.set("test-key", { name: "AAPL", price: 182.5 });
    const result = storage.get<{ name: string; price: number }>("test-key", { name: "", price: 0 });
    expect(result).toEqual({ name: "AAPL", price: 182.5 });
  });

  it("값을 저장하고 불러온다 (배열)", () => {
    storage.set("test-key", [1, 2, 3]);
    const result = storage.get<number[]>("test-key", []);
    expect(result).toEqual([1, 2, 3]);
  });

  it("없는 키는 defaultValue를 반환한다", () => {
    const result = storage.get<string>("nonexistent", "default");
    expect(result).toBe("default");
  });

  it("없는 키에 null defaultValue를 반환한다", () => {
    const result = storage.get<null>("nonexistent", null);
    expect(result).toBeNull();
  });

  it("remove로 항목을 삭제한다", () => {
    storage.set("test-key", "value");
    storage.remove("test-key");
    const result = storage.get<string>("test-key", "fallback");
    expect(result).toBe("fallback");
  });

  it("clear로 모든 항목을 삭제한다", () => {
    storage.set("key1", "value1");
    storage.set("key2", "value2");
    storage.clear();
    expect(storage.get("key1", null)).toBeNull();
    expect(storage.get("key2", null)).toBeNull();
  });

  it("손상된 데이터는 defaultValue를 반환한다", () => {
    // localStorage에 잘못된 JSON 저장 (직접 모킹)
    localStorage.setItem("corrupt-key", "invalid-base64-json!!!");
    const result = storage.get<string>("corrupt-key", "fallback");
    expect(result).toBe("fallback");
  });
});
