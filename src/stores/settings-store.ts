import { STORAGE_KEYS } from "@/constants";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface SettingsState {
  theme: "light" | "dark";
  language: "ko" | "en";
  colorScheme: "kr" | "us";
  currency: "USD" | "KRW";
  showChart: boolean;
  showIndexDJI: boolean;
  showIndexSP500: boolean;
  showIndexNASDAQ: boolean;
  showExchangeRate: boolean;
}

interface SettingsActions {
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: "ko" | "en") => void;
  setColorScheme: (scheme: "kr" | "us") => void;
  setCurrency: (currency: "USD" | "KRW") => void;
  setShowChart: (show: boolean) => void;
  setShowIndexDJI: (show: boolean) => void;
  setShowIndexSP500: (show: boolean) => void;
  setShowIndexNASDAQ: (show: boolean) => void;
  setShowExchangeRate: (show: boolean) => void;
}

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

// Selector - State
export const selectTheme = (state: SettingsStore) => state.theme;
export const selectLanguage = (state: SettingsStore) => state.language;
export const selectColorScheme = (state: SettingsStore) => state.colorScheme;
export const selectCurrency = (state: SettingsStore) => state.currency;
export const selectShowChart = (state: SettingsStore) => state.showChart;
export const selectShowIndexDJI = (state: SettingsStore) => state.showIndexDJI;
export const selectShowIndexSP500 = (state: SettingsStore) => state.showIndexSP500;
export const selectShowIndexNASDAQ = (state: SettingsStore) => state.showIndexNASDAQ;
export const selectShowExchangeRate = (state: SettingsStore) => state.showExchangeRate;

// Selector - Actions
export const selectSetTheme = (state: SettingsStore) => state.setTheme;
export const selectSetLanguage = (state: SettingsStore) => state.setLanguage;
export const selectSetColorScheme = (state: SettingsStore) => state.setColorScheme;
export const selectSetCurrency = (state: SettingsStore) => state.setCurrency;
export const selectSetShowChart = (state: SettingsStore) => state.setShowChart;
export const selectSetShowIndexDJI = (state: SettingsStore) => state.setShowIndexDJI;
export const selectSetShowIndexSP500 = (state: SettingsStore) => state.setShowIndexSP500;
export const selectSetShowIndexNASDAQ = (state: SettingsStore) => state.setShowIndexNASDAQ;
export const selectSetShowExchangeRate = (state: SettingsStore) => state.setShowExchangeRate;
