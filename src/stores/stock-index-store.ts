import type { IndexSymbol, Position, Size } from "@/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { STORAGE_KEYS } from "@/constants/";

interface IndexBoxData {
  id: IndexSymbol;
  label: string;
  position: Position;
  size: Size;
  zIndex: number;
}

const INDEX_BOX_WIDTH = 300;
const INDEX_BOX_HEIGHT = 200;

const DEFAULT_INDICES: IndexBoxData[] = [
  {
    id: "^DJI",
    label: "Dow Jones",
    position: { x: 20, y: 20 },
    size: { width: INDEX_BOX_WIDTH, height: INDEX_BOX_HEIGHT },
    zIndex: 1,
  },
  {
    id: "^GSPC",
    label: "S&P 500",
    position: { x: 340, y: 20 },
    size: { width: INDEX_BOX_WIDTH, height: INDEX_BOX_HEIGHT },
    zIndex: 1,
  },
  {
    id: "^IXIC",
    label: "NASDAQ",
    position: { x: 660, y: 20 },
    size: { width: INDEX_BOX_WIDTH, height: INDEX_BOX_HEIGHT },
    zIndex: 1,
  },
];

const DEFAULT_EXCHANGE_RATE_BOX: ExchangeRateBoxLayout = {
  position: { x: 980, y: 20 },
  size: { width: INDEX_BOX_WIDTH, height: INDEX_BOX_HEIGHT },
  zIndex: 1,
};

interface ExchangeRateBoxLayout {
  position: Position;
  size: Size;
  zIndex: number;
}

interface IndexState {
  indices: IndexBoxData[];
  exchangeRateBox: ExchangeRateBoxLayout;
  maxZIndex: number;
}

interface IndexActions {
  updatePosition: (id: IndexSymbol, position: Position) => void;
  updateSize: (id: IndexSymbol, size: Size) => void;
  bringToFront: (id: IndexSymbol) => void;
  updateExchangeRatePosition: (position: Position) => void;
  updateExchangeRateSize: (size: Size) => void;
  bringExchangeRateToFront: () => void;
}

type IndexStore = IndexState & IndexActions;

export const useStockIndexStore = create<IndexStore>()(
  devtools(
    persist(
      immer((set) => ({
        indices: DEFAULT_INDICES,
        exchangeRateBox: DEFAULT_EXCHANGE_RATE_BOX,
        maxZIndex: 1,

        updatePosition: (id: IndexSymbol, position: Position) => {
          set((state) => {
            const idx = state.indices.find((i) => i.id === id);
            if (idx) idx.position = position;
          });
        },

        updateSize: (id: IndexSymbol, size: Size) => {
          set((state) => {
            const idx = state.indices.find((i) => i.id === id);
            if (idx) idx.size = size;
          });
        },

        bringToFront: (id: IndexSymbol) => {
          set((state) => {
            const idx = state.indices.find((i) => i.id === id);
            if (idx) {
              const newZ = state.maxZIndex + 1;
              idx.zIndex = newZ;
              state.maxZIndex = newZ;
            }
          });
        },

        updateExchangeRatePosition: (position: Position) => {
          set((state) => {
            state.exchangeRateBox.position = position;
          });
        },

        updateExchangeRateSize: (size: Size) => {
          set((state) => {
            state.exchangeRateBox.size = size;
          });
        },

        bringExchangeRateToFront: () => {
          set((state) => {
            const newZ = state.maxZIndex + 1;
            state.exchangeRateBox.zIndex = newZ;
            state.maxZIndex = newZ;
          });
        },
      })),
      {
        name: STORAGE_KEYS.INDEX_LAYOUT,
        version: 3,
        partialize: (state) => ({
          indices: state.indices,
          exchangeRateBox: state.exchangeRateBox,
          maxZIndex: state.maxZIndex,
        }),
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            try {
              return JSON.parse(atob(str));
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            localStorage.setItem(name, btoa(JSON.stringify(value)));
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    { name: "IndexStore", enabled: import.meta.env.DEV }
  )
);

// Selectors - State
export const selectIndices = (state: IndexStore) => state.indices;
export const selectExchangeRateBox = (state: IndexStore) => state.exchangeRateBox;
export const selectIndexMaxZIndex = (state: IndexStore) => state.maxZIndex;

// Selectors - Actions
export const selectIndexUpdatePosition = (state: IndexStore) => state.updatePosition;
export const selectIndexUpdateSize = (state: IndexStore) => state.updateSize;
export const selectIndexBringToFront = (state: IndexStore) => state.bringToFront;
export const selectUpdateExchangeRatePosition = (state: IndexStore) =>
  state.updateExchangeRatePosition;
export const selectUpdateExchangeRateSize = (state: IndexStore) => state.updateExchangeRateSize;
export const selectBringExchangeRateToFront = (state: IndexStore) => state.bringExchangeRateToFront;
