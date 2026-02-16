import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface NetworkOfflineBannerProps {
  isOnline: boolean;
}

export function NetworkOfflineBanner({ isOnline }: NetworkOfflineBannerProps) {
  const { t } = useTranslation();
  // 다시 온라인이 됐을 때 잠깐 "연결됨" 메시지를 보여주기 위한 상태
  const [showReconnected, setShowReconnected] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  useEffect(() => {
    if (!prevOnline && isOnline) {
      // 오프라인 → 온라인 전환 시 2초간 재연결 메시지 표시
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevOnline(isOnline);
  }, [isOnline, prevOnline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "relative z-[200] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
        showReconnected && isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white"
      )}
    >
      {showReconnected && isOnline ? (
        <>
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{t("network.reconnected")}</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M3.636 5.636a9 9 0 000 12.728M6.464 8.464a5 5 0 000 7.072"
            />
            <line x1="2" y1="2" x2="22" y2="22" strokeWidth={2} />
          </svg>
          <span>{t("network.offline")}</span>
        </>
      )}
    </div>
  );
}
