import { useEffect, useRef } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // 절전모드 잠금 실패 시 무시 (권한 거부 등)
    }
  };

  const release = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    acquire();

    // 문서가 다시 보일 때 재획득 (탭 전환 후 복귀 시)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      release();
    };
  }, []);
}
