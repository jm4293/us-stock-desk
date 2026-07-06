import { STOCK_BOX } from "@/constants";
import type { Position, Size } from "@/types";
import { decodePayload, encodePayload } from "./share-codec";

/** 공유 페이로드 스키마 버전. 구조가 바뀌면 올린다. */
export const SHARE_VERSION = 1;

/** URL 해시에서 공유 페이로드를 담는 파라미터 키 (`#s=...`) */
const HASH_KEY = "s";

/** 공유로 실어 나르는 임의 데이터 상한(악의적 초대형 URL 방어) */
const MAX_STOCKS = 100;
const SYMBOL_RE = /^[A-Z0-9.-]{1,12}$/;

/** 공유에 포함되는 설정 필드 (SettingsState의 부분집합) */
export interface ShareSettings {
  theme: "light" | "dark";
  language: "ko" | "en";
  colorScheme: "kr" | "us";
  currency: "USD" | "KRW";
  showChart: boolean;
  showIndexDJI: boolean;
  showIndexSP500: boolean;
  showIndexNASDAQ: boolean;
  showExchangeRate: boolean;
}

export interface ShareStock {
  symbol: string;
  companyName: string;
  /** 위치·크기는 "위치 포함" 옵션을 켰을 때만 존재 */
  position?: Position;
  size?: Size;
}

export interface SharedState {
  v: number;
  stocks: ShareStock[];
  settings: ShareSettings;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function validateSettings(value: unknown): ShareSettings | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;

  const theme = o.theme === "light" || o.theme === "dark" ? o.theme : null;
  const language = o.language === "ko" || o.language === "en" ? o.language : null;
  const colorScheme = o.colorScheme === "kr" || o.colorScheme === "us" ? o.colorScheme : null;
  const currency = o.currency === "USD" || o.currency === "KRW" ? o.currency : null;
  if (!theme || !language || !colorScheme || !currency) return null;

  const bool = (x: unknown, fallback: boolean) => (typeof x === "boolean" ? x : fallback);
  return {
    theme,
    language,
    colorScheme,
    currency,
    showChart: bool(o.showChart, true),
    showIndexDJI: bool(o.showIndexDJI, true),
    showIndexSP500: bool(o.showIndexSP500, true),
    showIndexNASDAQ: bool(o.showIndexNASDAQ, true),
    showExchangeRate: bool(o.showExchangeRate, true),
  };
}

function validateStock(value: unknown): ShareStock | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;

  const symbol = typeof o.symbol === "string" ? o.symbol.trim().toUpperCase() : "";
  if (!SYMBOL_RE.test(symbol)) return null;

  const companyName =
    typeof o.companyName === "string" && o.companyName.length > 0
      ? o.companyName.slice(0, 100)
      : symbol;

  const stock: ShareStock = { symbol, companyName };

  const pos = o.position as Record<string, unknown> | undefined;
  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    if (Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
      stock.position = { x: clamp(pos.x, -5000, 20000), y: clamp(pos.y, -5000, 20000) };
    }
  }

  const size = o.size as Record<string, unknown> | undefined;
  if (size && typeof size.width === "number" && typeof size.height === "number") {
    if (Number.isFinite(size.width) && Number.isFinite(size.height)) {
      stock.size = {
        width: clamp(size.width, STOCK_BOX.MIN_WIDTH, STOCK_BOX.MAX_WIDTH),
        height: clamp(size.height, STOCK_BOX.MIN_HEIGHT, STOCK_BOX.MAX_HEIGHT),
      };
    }
  }

  return stock;
}

/** 신뢰할 수 없는 입력(URL)을 검증·정규화한다. 유효하지 않으면 null. */
export function validateSharedState(data: unknown): SharedState | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (o.v !== SHARE_VERSION) return null;
  if (!Array.isArray(o.stocks)) return null;

  const settings = validateSettings(o.settings);
  if (!settings) return null;

  const stocks: ShareStock[] = [];
  for (const raw of o.stocks.slice(0, MAX_STOCKS)) {
    const stock = validateStock(raw);
    if (stock) stocks.push(stock);
  }

  return { v: SHARE_VERSION, stocks, settings };
}

/** SharedState → URL-safe 인코딩 문자열 */
export function encodeShareState(state: SharedState): Promise<string> {
  return encodePayload(state);
}

/** 인코딩 문자열 → 검증된 SharedState (실패 시 null) */
export async function decodeShareState(encoded: string): Promise<SharedState | null> {
  const decoded = await decodePayload<unknown>(encoded);
  return decoded ? validateSharedState(decoded) : null;
}

/** 인코딩 문자열을 현재 origin 기준 공유 URL로 만든다. */
export function buildShareUrl(encoded: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${HASH_KEY}=${encoded}`;
}

/** 현재 URL 해시에서 공유 페이로드를 읽는다. 없으면 null. */
export function readShareHash(): string | null {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const value = params.get(HASH_KEY);
  return value && value.length > 0 ? value : null;
}

/** 공유 해시를 URL에서 제거한다(리로드 없이). */
export function clearShareHash(): void {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", pathname + search);
}
