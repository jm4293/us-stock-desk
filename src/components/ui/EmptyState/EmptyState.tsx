import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/stores";

export function EmptyState() {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
        Stock Desk
      </p>
      <p className={cn("text-sm", isDark ? "text-gray-400" : "text-slate-500")}>
        {t("search.empty")}
      </p>
    </div>
  );
}
