import { STORAGE_KEYS } from "@/constants";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

const savedLanguage = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return "ko";
    // 스토리지 코덱(local-storage.ts)과 동일: encodeURIComponent 적용분 우선, 구버전 데이터 호환
    const decoded = atob(raw);
    let parsed: { state?: { language?: string } };
    try {
      parsed = JSON.parse(decodeURIComponent(decoded));
    } catch {
      parsed = JSON.parse(decoded);
    }
    return parsed?.state?.language ?? "ko";
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
