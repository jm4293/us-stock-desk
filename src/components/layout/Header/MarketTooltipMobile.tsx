import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";
import { MarketTooltipBase } from "./MarketTooltipBase";
import type { MarketTooltipBaseProps } from "./types";
import { useTooltipSessions } from "./useTooltipSessions";

export const MarketTooltipMobile = ({
  isDST,
  isDark,
  anchorEl,
}: Omit<MarketTooltipBaseProps, "children">) => {
  const { t } = useTranslation();
  const sessions = useTooltipSessions(isDST);

  return (
    <MarketTooltipBase isDST={isDST} isDark={isDark} anchorEl={anchorEl}>
      <div className="space-y-3">
        {sessions.map(({ key, color, etKey, kstKey }) => (
          <div key={key}>
            <div className="mb-1 flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)} />
              <span
                className={cn("text-xs font-medium", isDark ? "text-gray-300" : "text-slate-700")}
              >
                {t(`market.tooltip.${key}`)}
              </span>
            </div>
            <div className="ml-3.5 flex gap-4">
              <div>
                <span
                  className={cn(
                    "block text-xs font-medium",
                    isDark ? "text-gray-500" : "text-slate-400"
                  )}
                >
                  {t("market.tooltip.etLabel")}
                </span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    isDark ? "text-gray-400" : "text-slate-600"
                  )}
                >
                  {t(etKey)}
                </span>
              </div>
              <div>
                <span
                  className={cn(
                    "block text-xs font-medium",
                    isDark ? "text-gray-500" : "text-slate-400"
                  )}
                >
                  {t("market.tooltip.kstLabel")}
                </span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    isDark ? "text-gray-400" : "text-slate-600"
                  )}
                >
                  {t(kstKey)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MarketTooltipBase>
  );
};
