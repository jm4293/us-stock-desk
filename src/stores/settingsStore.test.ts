import { describe, it, expect, beforeEach } from "vitest";
import {
  useSettingsStore,
  useTheme,
  useLanguage,
  useColorScheme,
  useCurrency,
  useSettingsActions,
} from "./settingsStore";
import { renderHook } from "@testing-library/react";

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: "dark",
      language: "ko",
      colorScheme: "kr",
      currency: "USD",
    });
  });

  it("초기 테마는 dark이다", () => {
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("초기 언어는 ko이다", () => {
    expect(useSettingsStore.getState().language).toBe("ko");
  });

  it("초기 색상 체계는 kr이다", () => {
    expect(useSettingsStore.getState().colorScheme).toBe("kr");
  });

  it("초기 통화는 USD이다", () => {
    expect(useSettingsStore.getState().currency).toBe("USD");
  });

  it("setTheme으로 테마를 light로 변경한다", () => {
    useSettingsStore.getState().setTheme("light");
    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("setTheme으로 테마를 dark로 변경한다", () => {
    useSettingsStore.getState().setTheme("light");
    useSettingsStore.getState().setTheme("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("setLanguage로 언어를 en으로 변경한다", () => {
    useSettingsStore.getState().setLanguage("en");
    expect(useSettingsStore.getState().language).toBe("en");
  });

  it("setLanguage로 언어를 ko로 변경한다", () => {
    useSettingsStore.getState().setLanguage("en");
    useSettingsStore.getState().setLanguage("ko");
    expect(useSettingsStore.getState().language).toBe("ko");
  });

  it("setColorScheme으로 색상 체계를 us로 변경한다", () => {
    useSettingsStore.getState().setColorScheme("us");
    expect(useSettingsStore.getState().colorScheme).toBe("us");
  });

  it("setColorScheme으로 색상 체계를 kr로 변경한다", () => {
    useSettingsStore.getState().setColorScheme("us");
    useSettingsStore.getState().setColorScheme("kr");
    expect(useSettingsStore.getState().colorScheme).toBe("kr");
  });

  it("setCurrency로 통화를 KRW로 변경한다", () => {
    useSettingsStore.getState().setCurrency("KRW");
    expect(useSettingsStore.getState().currency).toBe("KRW");
  });

  it("setCurrency로 통화를 USD로 변경한다", () => {
    useSettingsStore.getState().setCurrency("KRW");
    useSettingsStore.getState().setCurrency("USD");
    expect(useSettingsStore.getState().currency).toBe("USD");
  });
});

describe("settingsStore 셀렉터", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: "dark",
      language: "ko",
      colorScheme: "kr",
      currency: "USD",
    });
  });

  it("useTheme 셀렉터가 테마를 반환한다", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("dark");
  });

  it("useLanguage 셀렉터가 언어를 반환한다", () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current).toBe("ko");
  });

  it("useColorScheme 셀렉터가 색상 체계를 반환한다", () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe("kr");
  });

  it("useCurrency 셀렉터가 통화를 반환한다", () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current).toBe("USD");
  });

  it("useSettingsActions 셀렉터가 액션들을 반환한다", () => {
    const { result } = renderHook(() => useSettingsActions());
    expect(typeof result.current.setTheme).toBe("function");
    expect(typeof result.current.setLanguage).toBe("function");
    expect(typeof result.current.setColorScheme).toBe("function");
    expect(typeof result.current.setCurrency).toBe("function");
  });
});
