import { describe, it, expect, beforeEach } from "vitest";
import {
  useUIStore,
  useIsSearchOpen,
  useIsSettingsOpen,
  useIsLoading,
  useUIActions,
} from "./uiStore";
import { renderHook } from "@testing-library/react";

describe("uiStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      isSearchOpen: false,
      isSettingsOpen: false,
      isLoading: false,
    });
  });

  it("초기 isSearchOpen은 false이다", () => {
    expect(useUIStore.getState().isSearchOpen).toBe(false);
  });

  it("초기 isSettingsOpen은 false이다", () => {
    expect(useUIStore.getState().isSettingsOpen).toBe(false);
  });

  it("초기 isLoading은 false이다", () => {
    expect(useUIStore.getState().isLoading).toBe(false);
  });

  it("openSearch로 검색 모달을 연다", () => {
    useUIStore.getState().openSearch();
    expect(useUIStore.getState().isSearchOpen).toBe(true);
  });

  it("closeSearch로 검색 모달을 닫는다", () => {
    useUIStore.getState().openSearch();
    useUIStore.getState().closeSearch();
    expect(useUIStore.getState().isSearchOpen).toBe(false);
  });

  it("openSettings로 설정 모달을 연다", () => {
    useUIStore.getState().openSettings();
    expect(useUIStore.getState().isSettingsOpen).toBe(true);
  });

  it("closeSettings로 설정 모달을 닫는다", () => {
    useUIStore.getState().openSettings();
    useUIStore.getState().closeSettings();
    expect(useUIStore.getState().isSettingsOpen).toBe(false);
  });

  it("setLoading(true)로 로딩 상태를 활성화한다", () => {
    useUIStore.getState().setLoading(true);
    expect(useUIStore.getState().isLoading).toBe(true);
  });

  it("setLoading(false)로 로딩 상태를 비활성화한다", () => {
    useUIStore.getState().setLoading(true);
    useUIStore.getState().setLoading(false);
    expect(useUIStore.getState().isLoading).toBe(false);
  });

  it("검색 모달과 설정 모달을 동시에 열 수 있다", () => {
    useUIStore.getState().openSearch();
    useUIStore.getState().openSettings();
    expect(useUIStore.getState().isSearchOpen).toBe(true);
    expect(useUIStore.getState().isSettingsOpen).toBe(true);
  });
});

describe("uiStore 셀렉터", () => {
  beforeEach(() => {
    useUIStore.setState({
      isSearchOpen: false,
      isSettingsOpen: false,
      isLoading: false,
    });
  });

  it("useIsSearchOpen 셀렉터가 검색 모달 상태를 반환한다", () => {
    const { result } = renderHook(() => useIsSearchOpen());
    expect(result.current).toBe(false);
  });

  it("useIsSettingsOpen 셀렉터가 설정 모달 상태를 반환한다", () => {
    const { result } = renderHook(() => useIsSettingsOpen());
    expect(result.current).toBe(false);
  });

  it("useIsLoading 셀렉터가 로딩 상태를 반환한다", () => {
    const { result } = renderHook(() => useIsLoading());
    expect(result.current).toBe(false);
  });

  it("useUIActions 셀렉터가 액션들을 반환한다", () => {
    const { result } = renderHook(() => useUIActions());
    expect(typeof result.current.openSearch).toBe("function");
    expect(typeof result.current.closeSearch).toBe("function");
    expect(typeof result.current.openSettings).toBe("function");
    expect(typeof result.current.closeSettings).toBe("function");
    expect(typeof result.current.setLoading).toBe("function");
  });
});
