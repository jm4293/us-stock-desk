import { useEffect, useRef } from "react";

export function useWakeLock(): void {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // acquire()가 pending인 상태로 언마운트되면 뒤늦게 획득된 sentinel이
    // 해제되지 않고 남으므로, cancelled 플래그로 즉시 해제한다
    let cancelled = false;

    const acquire = async () => {
      if (!("wakeLock" in navigator)) {
        return;
      }

      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          sentinel.release();
        } else {
          wakeLockRef.current = sentinel;
        }
      } catch {
        // 절전모드 잠금 실패 시 무시 (권한 거부 등)
      }
    };

    acquire();

    // 문서가 다시 보일 때 재획득 (탭 전환 후 복귀 시)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, []);
}
