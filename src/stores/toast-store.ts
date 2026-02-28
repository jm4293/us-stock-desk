import { TIMING } from "@/constants";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_TOASTS = {
  toasts: [] as Toast[],
};

export const useToastStore = create<ToastStore>()(
  devtools(
    (set) => ({
      ...DEFAULT_TOASTS,

      showToast: (message, type = "success") => {
        const id = crypto.randomUUID();
        set((state) => {
          const next = [...state.toasts, { id, message, type }];
          // 최대 3개 초과 시 가장 오래된 것 제거
          return { toasts: next.length > 3 ? next.slice(next.length - 3) : next };
        });
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, TIMING.TOAST_DURATION);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },
    }),
    {
      name: "ToastStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors - State
export const selectToasts = (state: ToastStore) => state.toasts;

// Selectors - Actions
export const selectShowToast = (state: ToastStore) => state.showToast;
export const selectRemoveToast = (state: ToastStore) => state.removeToast;
