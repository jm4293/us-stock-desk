import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface UIState {
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
}

interface UIActions {
  openSearch: () => void;
  closeSearch: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setLoading: (loading: boolean) => void;
}

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

// Selectors - State
export const selectIsSearchOpen = (state: UIStore) => state.isSearchOpen;
export const selectIsSettingsOpen = (state: UIStore) => state.isSettingsOpen;
export const selectIsLoading = (state: UIStore) => state.isLoading;

// Selectors - Actions
export const selectOpenSearch = (state: UIStore) => state.openSearch;
export const selectCloseSearch = (state: UIStore) => state.closeSearch;
export const selectOpenSettings = (state: UIStore) => state.openSettings;
export const selectCloseSettings = (state: UIStore) => state.closeSettings;
export const selectSetLoading = (state: UIStore) => state.setLoading;
