import { STORAGE_KEYS } from "@/constants";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

const savedLanguage = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return "ko";
    const decoded = JSON.parse(atob(raw));
    return decoded?.state?.language ?? "ko";
  } catch {
    return "ko";
  }
})();

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: "ko",
  interpolation: { escapeValue: false },
});

export default i18n;
