import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StockBox, Position, Size } from "@/types/stock";
import type { StockState, StockActions } from "@/types/store";
import { STORAGE_KEYS, STOCK_BOX } from "@/constants/app";

type StockStore = StockState & StockActions;

export const useStockStore = create<StockStore>()(
  devtools(
    persist(
      immer((set) => ({
        stocks: [],
        focusedStockId: null,
        maxZIndex: 0,

        addStock: (symbol: string, companyName: string) => {
          set((state) => {
            const newZIndex = state.maxZIndex + 1;
            const offset = state.stocks.length * 30;
            const newStock: StockBox = {
              id: crypto.randomUUID(),
              symbol: symbol.toUpperCase(),
              companyName,
              position: { x: 100 + offset, y: 100 + offset },
              size: {
                width: STOCK_BOX.DEFAULT_WIDTH,
                height: STOCK_BOX.DEFAULT_HEIGHT,
              },
              zIndex: newZIndex,
              created: Date.now(),
              updated: Date.now(),
            };
            state.stocks.push(newStock);
            state.maxZIndex = newZIndex;
            state.focusedStockId = newStock.id;
          });
        },

        removeStock: (id: string) => {
          set((state) => {
            state.stocks = state.stocks.filter((s) => s.id !== id);
            if (state.focusedStockId === id) {
              state.focusedStockId = null;
            }
          });
        },

        updatePosition: (id: string, position: Position) => {
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              stock.position = position;
              stock.updated = Date.now();
            }
          });
        },

        updateSize: (id: string, size: Size) => {
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              stock.size = size;
              stock.updated = Date.now();
            }
          });
        },

        setFocused: (id: string | null) => {
          set((state) => {
            state.focusedStockId = id;
          });
        },

        bringToFront: (id: string) => {
          set((state) => {
            const stock = state.stocks.find((s) => s.id === id);
            if (stock) {
              const newZIndex = state.maxZIndex + 1;
              stock.zIndex = newZIndex;
              state.maxZIndex = newZIndex;
              state.focusedStockId = id;
            }
          });
        },
      })),
      {
        name: STORAGE_KEYS.STOCKS,
        version: 1,
        partialize: (state) => ({
          stocks: state.stocks,
          maxZIndex: state.maxZIndex,
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
      name: "StockStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors (성능 최적화)
export const useStocks = () => useStockStore((state) => state.stocks);
export const useFocusedStockId = () => useStockStore((state) => state.focusedStockId);
export const useStockActions = () =>
  useStockStore((state) => ({
    addStock: state.addStock,
    removeStock: state.removeStock,
    updatePosition: state.updatePosition,
    updateSize: state.updateSize,
    setFocused: state.setFocused,
    bringToFront: state.bringToFront,
  }));
