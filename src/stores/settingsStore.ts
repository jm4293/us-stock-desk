import { STORAGE_KEYS } from "@/constants/app";
import type { SettingsActions, SettingsState } from "@/types/store";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  language: "ko" as const,
  colorScheme: "us" as const,
  currency: "USD" as const,
  showChart: true,
};

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
        version: 2,
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          colorScheme: state.colorScheme,
          currency: state.currency,
          showChart: state.showChart,
        }),
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            try {
              const decoded = atob(str);
              return JSON.parse(decoded);
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            const encoded = btoa(JSON.stringify(value));
            localStorage.setItem(name, encoded);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
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
