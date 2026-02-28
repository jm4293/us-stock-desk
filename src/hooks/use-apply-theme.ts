import { useEffect } from "react";
import { selectTheme, useSettingsStore } from "@/stores";

/**
 * 테마 적용 훅
 * - 테마 변경 시 document.documentElement에 클래스 적용
 */
export const useApplyTheme = () => {
  const theme = useSettingsStore(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  return theme;
};
