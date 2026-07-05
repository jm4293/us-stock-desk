import { STORAGE_KEYS } from "@/constants";
import type { PersistStorage, StorageValue } from "zustand/middleware";

// btoa는 Latin-1 범위 밖 문자(한글, 이모지 등)에서 throw하므로 encodeURIComponent를 먼저 적용
function encode(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function decode<T>(encoded: string): T {
  const raw = atob(encoded);
  try {
    return JSON.parse(decodeURIComponent(raw)) as T;
  } catch {
    // 구버전(encodeURIComponent 미적용) 데이터 호환
    return JSON.parse(raw) as T;
  }
}

/**
 * Zustand persist 미들웨어용 인코딩 스토리지 팩토리
 * btoa/atob 기반 base64 인코딩으로 데이터를 난독화하여 저장
 */
export function createEncodedStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name): StorageValue<T> | null => {
      try {
        const str = localStorage.getItem(name);
        if (!str) return null;
        return decode<StorageValue<T>>(str);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, encode(value));
      } catch {
        // 인코딩 실패, storage full 또는 접근 불가 시 저장 생략 (in-memory 상태는 유지됨)
      }
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
