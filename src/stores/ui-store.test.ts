import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  selectCloseSearch,
  selectCloseSettings,
  selectIsLoading,
  selectIsSearchOpen,
  selectIsSettingsOpen,
  selectOpenSearch,
  selectOpenSettings,
  selectSetLoading,
  useUIStore,
} from "./ui-store";

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

  it("selectIsSearchOpen 셀렉터가 검색 모달 상태를 반환한다", () => {
    const { result } = renderHook(() => useUIStore(selectIsSearchOpen));
    expect(result.current).toBe(false);
  });

  it("selectIsSettingsOpen 셀렉터가 설정 모달 상태를 반환한다", () => {
    const { result } = renderHook(() => useUIStore(selectIsSettingsOpen));
    expect(result.current).toBe(false);
  });

  it("selectIsLoading 셀렉터가 로딩 상태를 반환한다", () => {
    const { result } = renderHook(() => useUIStore(selectIsLoading));
    expect(result.current).toBe(false);
  });

  it("액션 셀렉터들이 함수를 반환한다", () => {
    const { result: openSearchResult } = renderHook(() => useUIStore(selectOpenSearch));
    const { result: closeSearchResult } = renderHook(() => useUIStore(selectCloseSearch));
    const { result: openSettingsResult } = renderHook(() => useUIStore(selectOpenSettings));
    const { result: closeSettingsResult } = renderHook(() => useUIStore(selectCloseSettings));
    const { result: setLoadingResult } = renderHook(() => useUIStore(selectSetLoading));

    expect(typeof openSearchResult.current).toBe("function");
    expect(typeof closeSearchResult.current).toBe("function");
    expect(typeof openSettingsResult.current).toBe("function");
    expect(typeof closeSettingsResult.current).toBe("function");
    expect(typeof setLoadingResult.current).toBe("function");
  });
});
