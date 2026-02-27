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
  /** 미국 동부시간(ET) 기준 Date (UTC 내부 표현) */
  currentET: Date;
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

  const dstKey: "market.dstOn" | "market.dstOff" = dst ? "market.dstOn" : "market.dstOff";

  let status: MarketStatus;
  let labelKey: string;

  if (isWeekend) {
    status = "closed";
    labelKey = "market.weekend";
  } else if (time >= 400 && time < 930) {
    status = "pre";
    labelKey = "market.pre";
  } else if (time >= 930 && time < 1600) {
    status = "open";
    labelKey = "market.open";
  } else if (time >= 1600 && time < 2000) {
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
    currentET: et,
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
    const interval = setInterval(() => {
      setKstTimeStr(getCurrentKSTStr());
    }, 1_000);
    return () => clearInterval(interval);
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
