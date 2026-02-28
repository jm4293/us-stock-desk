import { memo } from "react";
import { DesktopMarketStatus, MobileMarketStatus } from "@/components";
import { useFullscreen, useIsMobile } from "@/hooks";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  onAddStock: () => void;
  onOpenSettings: () => void;
  className?: string;
}

// SVG 아이콘들을 컴포넌트 외부로 hoisting (렌더링 성능 최적화)
const ExitFullscreenIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
    />
  </svg>
);

const FullscreenIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
);

const AddIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
    />
  </svg>
);

export const Header = memo(function Header({ onAddStock, onOpenSettings, className }: HeaderProps) {
  const { t } = useTranslation();

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const isMobile = useIsMobile();

  return (
    <header className={cn("glass flex items-center justify-between px-4 py-3", className)}>
      {/* 왼쪽: 로고 + 정보 */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="shrink-0 text-base font-bold text-white">US Stock Desk</h1>
        {isMobile ? <MobileMarketStatus /> : <DesktopMarketStatus />}
      </div>

      {/* 오른쪽: 버튼 */}
      <div className="flex shrink-0 items-center gap-1">
        {/* 전체화면 토글 */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t("header.exitFullscreen") : t("header.fullscreen")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {isFullscreen ? ExitFullscreenIcon : FullscreenIcon}
          {!isMobile && (isFullscreen ? t("header.exitFullscreen") : t("header.fullscreen"))}
        </button>

        {/* 종목 추가 */}
        <button
          onClick={onAddStock}
          aria-label={t("header.addStock")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {AddIcon}
          {!isMobile && t("header.addStock")}
        </button>

        {/* 설정 */}
        <button
          onClick={onOpenSettings}
          aria-label={t("header.settings")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {SettingsIcon}
          {!isMobile && t("header.settings")}
        </button>
      </div>
    </header>
  );
});

Header.displayName = "Header";
