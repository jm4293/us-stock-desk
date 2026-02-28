import { useEffect } from "react";
import i18n from "@/i18n";
import { selectLanguage, useSettingsStore } from "@/stores";

/**
 * 언어 동기화 훅
 * - 설정된 언어를 i18n에 반영
 */
export const useLanguage = () => {
  const language = useSettingsStore(selectLanguage);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return language;
};
