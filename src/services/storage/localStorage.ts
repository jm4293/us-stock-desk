import { STORAGE_KEYS } from "@/constants/app";

function encode(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function decode<T>(encoded: string): T {
  return JSON.parse(decodeURIComponent(atob(encoded))) as T;
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
