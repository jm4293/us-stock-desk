import { useEffect, useState } from "react";
import type { MarketStatus } from "@/types";

export interface MarketStatusInfo {
  status: MarketStatus;
  /** i18n 번역 키 (예: "market.open") */
  labelKey: string;
  /** DST 상태 i18n 키 ("market.dstOn" | "market.dstOff") */
  dstKey: "market.dstOn" | "market.dstOff";
  isRegularHours: boolean;
  isDST: boolean;
}

/**
 * 미국 서머타임(DST) 여부 판단
 * DST: 3월 둘째 일요일 02:00 ET ~ 11월 첫째 일요일 02:00 ET
 */
function isDST(date: Date): boolean {
  const year = date.getUTCFullYear();

  // 3월 둘째 일요일 (UTC 기준, EST=UTC-5이므로 +5h 보정 → 07:00 UTC)
  const march = new Date(Date.UTC(year, 2, 1));
  const marchDST = new Date(Date.UTC(year, 2, 1 + ((7 - march.getUTCDay()) % 7) + 7, 7));

  // 11월 첫째 일요일 (EDT=UTC-4이므로 +4h 보정 → 06:00 UTC)
  const nov = new Date(Date.UTC(year, 10, 1));
  const novDST = new Date(Date.UTC(year, 10, 1 + ((7 - nov.getUTCDay()) % 7), 6));

  return date >= marchDST && date < novDST;
}

/** UTC Date → 미국 동부시간 Date (내부는 UTC로 처리) */
function toET(date: Date): Date {
  const offset = isDST(date) ? -4 : -5;
  return new Date(date.getTime() + offset * 60 * 60 * 1000);
}

// ─── NYSE 휴장일 / 조기폐장 (규칙 기반 계산, 연도별 캐시) ────────────────────

interface MarketCalendar {
  /** 전일 휴장일 ("월-일" 키) */
  holidays: Set<string>;
  /** 조기폐장일 — 정규장 13:00 ET 마감 ("월-일" 키) */
  earlyClose: Set<string>;
}

const calendarCache = new Map<number, MarketCalendar>();

const dateKey = (month: number, day: number) => `${month}-${day}`;

const dayOfWeek = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day)).getUTCDay();

/** n번째 특정 요일의 날짜 (예: 1월 셋째 월요일) */
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  const firstDow = dayOfWeek(year, month, 1);
  return 1 + ((7 + weekday - firstDow) % 7) + (n - 1) * 7;
}

/** 해당 월의 마지막 특정 요일 날짜 (예: 5월 마지막 월요일) */
function lastWeekday(year: number, month: number, weekday: number): number {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDow = dayOfWeek(year, month, lastDay);
  return lastDay - ((7 + lastDow - weekday) % 7);
}

/** 부활절 일요일 (Anonymous Gregorian algorithm) */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function addDaysOf(year: number, month: number, day: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1, day + delta));
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function getMarketCalendar(year: number): MarketCalendar {
  const cached = calendarCache.get(year);
  if (cached) return cached;

  const holidays = new Set<string>();
  const earlyClose = new Set<string>();

  // 고정일 휴장은 관측일 규칙 적용: 토요일 → 전날 금요일, 일요일 → 다음날 월요일
  // (단, 신정이 토요일이면 전년도 12/31은 휴장하지 않음 — NYSE 규정)
  const addObserved = (month: number, day: number, fridayIfSaturday = true) => {
    const dow = dayOfWeek(year, month, day);
    if (dow === 6) {
      if (fridayIfSaturday) {
        const obs = addDaysOf(year, month, day, -1);
        holidays.add(dateKey(obs.month, obs.day));
      }
      return;
    }
    if (dow === 0) {
      const obs = addDaysOf(year, month, day, 1);
      holidays.add(dateKey(obs.month, obs.day));
      return;
    }
    holidays.add(dateKey(month, day));
  };

  addObserved(1, 1, false); // 신정
  holidays.add(dateKey(1, nthWeekday(year, 1, 1, 3))); // 마틴 루터 킹 데이 (1월 셋째 월요일)
  holidays.add(dateKey(2, nthWeekday(year, 2, 1, 3))); // 대통령의 날 (2월 셋째 월요일)
  const easter = easterSunday(year);
  const goodFriday = addDaysOf(year, easter.month, easter.day, -2); // 성금요일
  holidays.add(dateKey(goodFriday.month, goodFriday.day));
  holidays.add(dateKey(5, lastWeekday(year, 5, 1))); // 메모리얼 데이 (5월 마지막 월요일)
  addObserved(6, 19); // 준틴스
  addObserved(7, 4); // 독립기념일
  holidays.add(dateKey(9, nthWeekday(year, 9, 1, 1))); // 노동절 (9월 첫째 월요일)
  const thanksgiving = nthWeekday(year, 11, 4, 4); // 추수감사절 (11월 넷째 목요일)
  holidays.add(dateKey(11, thanksgiving));
  addObserved(12, 25); // 크리스마스

  // 조기폐장 (정규장 13:00 ET 마감): 7/3, 추수감사절 다음날, 12/24
  // 평일이면서 그 자체가 휴장일(관측일)이 아닐 때만 적용
  const maybeEarlyClose = (month: number, day: number) => {
    const dow = dayOfWeek(year, month, day);
    if (dow >= 1 && dow <= 5 && !holidays.has(dateKey(month, day))) {
      earlyClose.add(dateKey(month, day));
    }
  };
  maybeEarlyClose(7, 3);
  maybeEarlyClose(11, thanksgiving + 1);
  maybeEarlyClose(12, 24);

  const calendar = { holidays, earlyClose };
  calendarCache.set(year, calendar);
  return calendar;
}

function getMarketStatus(now: Date): MarketStatusInfo {
  const et = toET(now);
  const dst = isDST(now);

  // ET 기준 시/분 → 숫자 (예: 09:30 → 930)
  const h = et.getUTCHours();
  const m = et.getUTCMinutes();
  const time = h * 100 + m;

  // 요일 (ET 기준, 0=일 … 6=토)
  const day = et.getUTCDay();
  const isWeekend = day === 0 || day === 6;

  // 휴장일 / 조기폐장 판정 (ET 날짜 기준)
  const calendar = getMarketCalendar(et.getUTCFullYear());
  const todayKey = dateKey(et.getUTCMonth() + 1, et.getUTCDate());
  const isHoliday = calendar.holidays.has(todayKey);
  // 조기폐장일: 정규장 13:00 마감, 애프터마켓 13:00 ~ 17:00
  const regularEnd = calendar.earlyClose.has(todayKey) ? 1300 : 1600;
  const postEnd = calendar.earlyClose.has(todayKey) ? 1700 : 2000;

  const dstKey: "market.dstOn" | "market.dstOff" = dst ? "market.dstOn" : "market.dstOff";

  let status: MarketStatus;
  let labelKey: string;

  if (isWeekend) {
    status = "closed";
    labelKey = "market.weekend";
  } else if (isHoliday) {
    status = "closed";
    labelKey = "market.holiday";
  } else if (time >= 400 && time < 930) {
    status = "pre";
    labelKey = "market.pre";
  } else if (time >= 930 && time < regularEnd) {
    status = "open";
    labelKey = "market.open";
  } else if (time >= regularEnd && time < postEnd) {
    status = "post";
    labelKey = "market.post";
  } else {
    status = "closed";
    labelKey = "market.closed";
  }

  return {
    status,
    labelKey,
    dstKey,
    isRegularHours: status === "open",
    isDST: dst,
  };
}

/**
 * 시장 상태만 반환 — 분이 바뀔 때만 갱신 (초 단위 리렌더링 없음)
 */
export function useMarketStatus(): MarketStatusInfo {
  const [info, setInfo] = useState<MarketStatusInfo>(() => getMarketStatus(new Date()));

  useEffect(() => {
    const tick = () => {
      const next = getMarketStatus(new Date());
      setInfo((prev) => {
        // status, labelKey, dstKey 가 모두 같으면 동일 객체 유지 → 리렌더링 방지
        if (
          prev.status === next.status &&
          prev.labelKey === next.labelKey &&
          prev.dstKey === next.dstKey
        ) {
          return prev;
        }
        return next;
      });
    };

    // 분이 바뀌는 순간에 맞춰 interval 시작
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return info;
}

/**
 * KST 현재 시각(초 단위 갱신) — 시계 컴포넌트 전용
 */
export function useKSTClock(): string {
  const [kstTimeStr, setKstTimeStr] = useState(() => getCurrentKSTStr());

  useEffect(() => {
    // setInterval(1000)은 드리프트로 초가 건너뛸 수 있어, 매 틱마다 다음 초 경계에 맞춰 재예약
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setKstTimeStr(getCurrentKSTStr());
      timer = setTimeout(tick, 1_000 - (Date.now() % 1_000));
    };
    timer = setTimeout(tick, 1_000 - (Date.now() % 1_000));
    return () => clearTimeout(timer);
  }, []);

  return kstTimeStr;
}

function getCurrentKSTStr(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}
