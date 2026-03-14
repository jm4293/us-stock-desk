import { STORAGE_KEYS } from "@/constants";
import type { PersistStorage, StorageValue } from "zustand/middleware";

function encode(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function decode<T>(encoded: string): T {
  return JSON.parse(decodeURIComponent(atob(encoded))) as T;
}

/**
 * Zustand persist 미들웨어용 인코딩 스토리지 팩토리
 * btoa/atob 기반 base64 인코딩으로 데이터를 난독화하여 저장
 */
export function createEncodedStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name): StorageValue<T> | null => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      try {
        const decoded = atob(str);
        return JSON.parse(decoded) as StorageValue<T>;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      const encoded = btoa(JSON.stringify(value));
      localStorage.setItem(name, encoded);
    },
    removeItem: (name) => localStorage.removeItem(name),
  };
}

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return decode<T>(item);
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, encode(value));
    } catch {
      // storage full or unavailable
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
