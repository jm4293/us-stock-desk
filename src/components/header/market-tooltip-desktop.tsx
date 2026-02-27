import { MarketTooltipBase } from "@/components";
import { TooltipSessions } from "@/constants";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import type { MarketTooltipBaseProps } from "./types";

export const MarketTooltipDesktop = ({
  isDST,
  isDark,
  anchorEl,
}: Omit<MarketTooltipBaseProps, "children">) => {
  const { t } = useTranslation();
  const sessions = TooltipSessions(isDST);

  return (
    <MarketTooltipBase isDST={isDST} isDark={isDark} anchorEl={anchorEl}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-full pb-1" />
            <th
              className={cn(
                "whitespace-nowrap pb-1 pr-0 text-right text-xs font-medium",
                isDark ? "text-gray-500" : "text-slate-400"
              )}
            >
              {t("market.tooltip.etLabel")}
            </th>
            <th
              className={cn(
                "whitespace-nowrap pb-1 pl-4 text-right text-xs font-medium",
                isDark ? "text-gray-500" : "text-slate-400"
              )}
            >
              {t("market.tooltip.kstLabel")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(({ key, color, etKey, kstKey }) => (
            <tr key={key}>
              <td className="py-1">
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)} />
                  <span className={cn("text-xs", isDark ? "text-gray-300" : "text-slate-700")}>
                    {t(`market.tooltip.${key}`)}
                  </span>
                </div>
              </td>
              <td
                className={cn(
                  "whitespace-nowrap py-1 pr-0 text-right text-xs tabular-nums",
                  isDark ? "text-gray-500" : "text-slate-400"
                )}
              >
                {t(etKey)}
              </td>
              <td
                className={cn(
                  "whitespace-nowrap py-1 pl-4 text-right text-xs tabular-nums",
                  isDark ? "text-gray-400" : "text-slate-600"
                )}
              >
                {t(kstKey)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MarketTooltipBase>
  );
};
