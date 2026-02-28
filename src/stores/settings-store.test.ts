import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  selectColorScheme,
  selectCurrency,
  selectLanguage,
  selectSetColorScheme,
  selectSetCurrency,
  selectSetLanguage,
  selectSetShowChart,
  selectSetShowExchangeRate,
  selectSetShowIndexDJI,
  selectSetShowIndexNASDAQ,
  selectSetShowIndexSP500,
  selectSetTheme,
  selectShowChart,
  selectShowExchangeRate,
  selectShowIndexDJI,
  selectShowIndexNASDAQ,
  selectShowIndexSP500,
  selectTheme,
  useSettingsStore,
} from "./settings-store";

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: "dark",
      language: "ko",
      colorScheme: "us",
      currency: "USD",
      showChart: true,
      showIndexDJI: true,
      showIndexSP500: true,
      showIndexNASDAQ: true,
      showExchangeRate: true,
    });
    // localStorage mock 초기화
    localStorage.clear();
  });

  it("초기 테마는 dark이다", () => {
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("초기 언어는 ko이다", () => {
    expect(useSettingsStore.getState().language).toBe("ko");
  });

  it("초기 색상 체계는 us이다", () => {
    expect(useSettingsStore.getState().colorScheme).toBe("us");
  });

  it("초기 통화는 USD이다", () => {
    expect(useSettingsStore.getState().currency).toBe("USD");
  });

  it("초기 차트 표시는 true이다", () => {
    expect(useSettingsStore.getState().showChart).toBe(true);
  });

  it("초기 DJI 지수 표시는 true이다", () => {
    expect(useSettingsStore.getState().showIndexDJI).toBe(true);
  });

  it("초기 S&P500 지수 표시는 true이다", () => {
    expect(useSettingsStore.getState().showIndexSP500).toBe(true);
  });

  it("초기 NASDAQ 지수 표시는 true이다", () => {
    expect(useSettingsStore.getState().showIndexNASDAQ).toBe(true);
  });

  it("초기 환율 표시는 true이다", () => {
    expect(useSettingsStore.getState().showExchangeRate).toBe(true);
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

  it("setColorScheme으로 색상 체계를 kr로 변경한다", () => {
    useSettingsStore.getState().setColorScheme("kr");
    expect(useSettingsStore.getState().colorScheme).toBe("kr");
  });

  it("setColorScheme으로 색상 체계를 us로 변경한다", () => {
    useSettingsStore.getState().setColorScheme("kr");
    useSettingsStore.getState().setColorScheme("us");
    expect(useSettingsStore.getState().colorScheme).toBe("us");
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

  it("setShowChart로 차트 표시를 false로 변경한다", () => {
    useSettingsStore.getState().setShowChart(false);
    expect(useSettingsStore.getState().showChart).toBe(false);
  });

  it("setShowChart로 차트 표시를 true로 변경한다", () => {
    useSettingsStore.getState().setShowChart(false);
    useSettingsStore.getState().setShowChart(true);
    expect(useSettingsStore.getState().showChart).toBe(true);
  });

  it("setShowIndexDJI로 DJI 지수 표시를 false로 변경한다", () => {
    useSettingsStore.getState().setShowIndexDJI(false);
    expect(useSettingsStore.getState().showIndexDJI).toBe(false);
  });

  it("setShowIndexDJI로 DJI 지수 표시를 true로 변경한다", () => {
    useSettingsStore.getState().setShowIndexDJI(false);
    useSettingsStore.getState().setShowIndexDJI(true);
    expect(useSettingsStore.getState().showIndexDJI).toBe(true);
  });

  it("setShowIndexSP500로 S&P500 지수 표시를 false로 변경한다", () => {
    useSettingsStore.getState().setShowIndexSP500(false);
    expect(useSettingsStore.getState().showIndexSP500).toBe(false);
  });

  it("setShowIndexSP500로 S&P500 지수 표시를 true로 변경한다", () => {
    useSettingsStore.getState().setShowIndexSP500(false);
    useSettingsStore.getState().setShowIndexSP500(true);
    expect(useSettingsStore.getState().showIndexSP500).toBe(true);
  });

  it("setShowIndexNASDAQ로 NASDAQ 지수 표시를 false로 변경한다", () => {
    useSettingsStore.getState().setShowIndexNASDAQ(false);
    expect(useSettingsStore.getState().showIndexNASDAQ).toBe(false);
  });

  it("setShowIndexNASDAQ로 NASDAQ 지수 표시를 true로 변경한다", () => {
    useSettingsStore.getState().setShowIndexNASDAQ(false);
    useSettingsStore.getState().setShowIndexNASDAQ(true);
    expect(useSettingsStore.getState().showIndexNASDAQ).toBe(true);
  });

  it("setShowExchangeRate로 환율 표시를 false로 변경한다", () => {
    useSettingsStore.getState().setShowExchangeRate(false);
    expect(useSettingsStore.getState().showExchangeRate).toBe(false);
  });

  it("setShowExchangeRate로 환율 표시를 true로 변경한다", () => {
    useSettingsStore.getState().setShowExchangeRate(false);
    useSettingsStore.getState().setShowExchangeRate(true);
    expect(useSettingsStore.getState().showExchangeRate).toBe(true);
  });
});

describe("settingsStore 셀렉터", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: "dark",
      language: "ko",
      colorScheme: "us",
      currency: "USD",
      showChart: true,
      showIndexDJI: true,
      showIndexSP500: true,
      showIndexNASDAQ: true,
      showExchangeRate: true,
    });
    localStorage.clear();
  });

  it("selectTheme 셀렉터가 테마를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectTheme));
    expect(result.current).toBe("dark");
  });

  it("selectLanguage 셀렉터가 언어를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectLanguage));
    expect(result.current).toBe("ko");
  });

  it("selectColorScheme 셀렉터가 색상 체계를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectColorScheme));
    expect(result.current).toBe("us");
  });

  it("selectCurrency 셀렉터가 통화를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectCurrency));
    expect(result.current).toBe("USD");
  });

  it("selectShowChart 셀렉터가 차트 표시 여부를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectShowChart));
    expect(result.current).toBe(true);
  });

  it("selectShowIndexDJI 셀렉터가 DJI 지수 표시 여부를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectShowIndexDJI));
    expect(result.current).toBe(true);
  });

  it("selectShowIndexSP500 셀렉터가 S&P500 지수 표시 여부를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectShowIndexSP500));
    expect(result.current).toBe(true);
  });

  it("selectShowIndexNASDAQ 셀렉터가 NASDAQ 지수 표시 여부를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectShowIndexNASDAQ));
    expect(result.current).toBe(true);
  });

  it("selectShowExchangeRate 셀렉터가 환율 표시 여부를 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectShowExchangeRate));
    expect(result.current).toBe(true);
  });

  it("selectSetTheme 셀렉터가 setTheme 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetTheme));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetLanguage 셀렉터가 setLanguage 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetLanguage));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetColorScheme 셀렉터가 setColorScheme 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetColorScheme));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetCurrency 셀렉터가 setCurrency 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetCurrency));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetShowChart 셀렉터가 setShowChart 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetShowChart));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetShowIndexDJI 셀렉터가 setShowIndexDJI 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetShowIndexDJI));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetShowIndexSP500 셀렉터가 setShowIndexSP500 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetShowIndexSP500));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetShowIndexNASDAQ 셀렉터가 setShowIndexNASDAQ 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetShowIndexNASDAQ));
    expect(typeof result.current).toBe("function");
  });

  it("selectSetShowExchangeRate 셀렉터가 setShowExchangeRate 액션을 반환한다", () => {
    const { result } = renderHook(() => useSettingsStore(selectSetShowExchangeRate));
    expect(typeof result.current).toBe("function");
  });
});
