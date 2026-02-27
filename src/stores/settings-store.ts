import { STORAGE_KEYS } from "@/constants";
import type { SettingsActions, SettingsState } from "@/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  language: "ko" as const,
  colorScheme: "us" as const,
  currency: "USD" as const,
  showChart: true,
  showIndexDJI: true,
  showIndexSP500: true,
  showIndexNASDAQ: true,
  showExchangeRate: true,
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

        setShowIndexDJI: (show: boolean) => {
          set((state) => {
            state.showIndexDJI = show;
          });
        },

        setShowIndexSP500: (show: boolean) => {
          set((state) => {
            state.showIndexSP500 = show;
          });
        },

        setShowIndexNASDAQ: (show: boolean) => {
          set((state) => {
            state.showIndexNASDAQ = show;
          });
        },

        setShowExchangeRate: (show: boolean) => {
          set((state) => {
            state.showExchangeRate = show;
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
          showIndexDJI: state.showIndexDJI,
          showIndexSP500: state.showIndexSP500,
          showIndexNASDAQ: state.showIndexNASDAQ,
          showExchangeRate: state.showExchangeRate,
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
export const useShowIndexDJI = () => useSettingsStore((state) => state.showIndexDJI);
export const useShowIndexSP500 = () => useSettingsStore((state) => state.showIndexSP500);
export const useShowIndexNASDAQ = () => useSettingsStore((state) => state.showIndexNASDAQ);
export const useShowExchangeRate = () => useSettingsStore((state) => state.showExchangeRate);
export const useSettingsActions = () =>
  useSettingsStore(
    useShallow((state) => ({
      setTheme: state.setTheme,
      setLanguage: state.setLanguage,
      setColorScheme: state.setColorScheme,
      setCurrency: state.setCurrency,
      setShowChart: state.setShowChart,
      setShowIndexDJI: state.setShowIndexDJI,
      setShowIndexSP500: state.setShowIndexSP500,
      setShowIndexNASDAQ: state.setShowIndexNASDAQ,
      setShowExchangeRate: state.setShowExchangeRate,
    }))
  );
