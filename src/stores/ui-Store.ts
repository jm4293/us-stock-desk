import type { UIActions, UIState } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set) => ({
      isSearchOpen: false,
      isSettingsOpen: false,
      isLoading: false,

      openSearch: () => {
        set((state) => {
          state.isSearchOpen = true;
        });
      },

      closeSearch: () => {
        set((state) => {
          state.isSearchOpen = false;
        });
      },

      openSettings: () => {
        set((state) => {
          state.isSettingsOpen = true;
        });
      },

      closeSettings: () => {
        set((state) => {
          state.isSettingsOpen = false;
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
    })),
    {
      name: "UIStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors
export const useIsSearchOpen = () => useUIStore((state) => state.isSearchOpen);
export const useIsSettingsOpen = () => useUIStore((state) => state.isSettingsOpen);
export const useIsLoading = () => useUIStore((state) => state.isLoading);
export const useUIActions = () =>
  useUIStore(
    useShallow((state) => ({
      openSearch: state.openSearch,
      closeSearch: state.closeSearch,
      openSettings: state.openSettings,
      closeSettings: state.closeSettings,
      setLoading: state.setLoading,
    }))
  );
