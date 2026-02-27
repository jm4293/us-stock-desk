import "@/i18n";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import WS from "ws";

// WebSocket 폴리필
const PolyfilledWebSocket = WS as any;
global.WebSocket = PolyfilledWebSocket;
globalThis.WebSocket = PolyfilledWebSocket;
if (typeof window !== "undefined") {
  (window as any).WebSocket = PolyfilledWebSocket;
}
vi.stubGlobal("WebSocket", PolyfilledWebSocket);

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
});

// LocalStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// crypto.randomUUID 모킹
let uuidCounter = 0;
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`),
  },
  writable: true,
});

// btoa / atob 모킹
if (typeof global.btoa === "undefined") {
  global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}
if (typeof global.atob === "undefined") {
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

// window.matchMedia 모킹
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
