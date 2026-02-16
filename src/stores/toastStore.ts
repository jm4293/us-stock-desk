import { create } from "zustand";

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

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (message, type = "success") => {
    const id = crypto.randomUUID();
    set((state) => {
      const next = [...state.toasts, { id, message, type }];
      // 최대 3개 초과 시 가장 오래된 것 제거
      return { toasts: next.length > 3 ? next.slice(next.length - 3) : next };
    });
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const useShowToast = () => useToastStore((state) => state.showToast);
