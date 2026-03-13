import { useEffect } from "react";
import i18n from "@/i18n";
import { selectLanguage, useSettingsStore } from "@/stores";

export const useLanguage = () => {
  const language = useSettingsStore(selectLanguage);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return language;
};
