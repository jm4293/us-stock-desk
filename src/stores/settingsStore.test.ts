import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./settingsStore";

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
