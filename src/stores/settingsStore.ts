import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { SettingsState, SettingsActions } from "@/types/store";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/constants/app";

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...DEFAULT_SETTINGS,

        setTheme: (theme: "light" | "dark") => {
          set((state) => {
            state.theme = theme;
          });
        },

        setLanguage: (lang: "ko" | "en") => {
          set((state) => {
            state.language = lang;
          });
        },

        setColorScheme: (scheme: "kr" | "us") => {
          set((state) => {
            state.colorScheme = scheme;
          });
        },

        setCurrency: (currency: "USD" | "KRW") => {
          set((state) => {
            state.currency = currency;
          });
        },

        setShowChart: (show: boolean) => {
          set((state) => {
            state.showChart = show;
          });
        },
      })),
      {
        name: STORAGE_KEYS.SETTINGS,
        version: 1,
      }
    ),
    {
      name: "SettingsStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors
export const useTheme = () => useSettingsStore((state) => state.theme);
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useColorScheme = () => useSettingsStore((state) => state.colorScheme);
export const useCurrency = () => useSettingsStore((state) => state.currency);
export const useShowChart = () => useSettingsStore((state) => state.showChart);
export const useSettingsActions = () =>
  useSettingsStore((state) => ({
    setTheme: state.setTheme,
    setLanguage: state.setLanguage,
    setColorScheme: state.setColorScheme,
    setCurrency: state.setCurrency,
    setShowChart: state.setShowChart,
  }));
