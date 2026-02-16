import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useKSTClock } from "@/hooks/useMarketStatus";

interface KSTClockProps {
  /** 모바일 전용: 레이블/아이콘 없이 시간 문자열만 렌더링 */
  mobileOnly?: boolean;
}

/**
 * 한국 시각을 초 단위로 표시하는 컴포넌트.
 * 초마다 이 컴포넌트만 리렌더링되고, 부모(Header)는 영향 없음.
 */
export const KSTClock = memo(function KSTClock({ mobileOnly = false }: KSTClockProps) {
  const { t } = useTranslation();
  const kstTimeStr = useKSTClock();

  if (mobileOnly) {
    return <>{kstTimeStr}</>;
  }

  return (
    <div className="flex items-center gap-1">
      <svg
        className="h-3.5 w-3.5 shrink-0 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 6v6l4 2" />
      </svg>
      <span className="tabular-nums text-gray-400">
        {t("header.kstLabel")} <span className="font-medium text-gray-300">{kstTimeStr}</span>
      </span>
    </div>
  );
});
