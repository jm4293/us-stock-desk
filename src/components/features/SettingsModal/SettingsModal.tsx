import { Modal } from "@/components/ui";
import {
  useColorScheme,
  useCurrency,
  useLanguage,
  useSettingsActions,
  useShowChart,
  useShowToast,
  useTheme,
  useUIActions,
  useUIStore,
} from "@/stores";
import { cn } from "@/utils/cn";
import React from "react";
import { useTranslation } from "react-i18next";

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();
  const isSettingsOpen = useUIStore((state) => state.isSettingsOpen);
  const { closeSettings } = useUIActions();
  const { setColorScheme, setTheme, setLanguage, setCurrency, setShowChart } = useSettingsActions();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const language = useLanguage();
  const currency = useCurrency();
  const showChart = useShowChart();
  const showToast = useShowToast();

  const isDark = theme === "dark";

  const handleSetting = (fn: () => void, message: string) => {
    fn();
    showToast(message, "info");
  };

  const headingColor = isDark ? "text-white" : "text-slate-800";
  const sectionHeadingColor = isDark ? "text-gray-300" : "text-slate-500";
  const btnActive = isDark
    ? "border-white/40 bg-white/20 text-white"
    : "border-blue-500 bg-blue-50 text-blue-700";
  const btnInactive = isDark
    ? "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100";

  return (
    <Modal open={isSettingsOpen} onClose={closeSettings}>
      <div className="mb-4">
        <h2 className={cn("text-lg font-bold", headingColor)}>{t("settings.title")}</h2>
      </div>

      {/* 캔들 색상 */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.candleColor")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleSetting(
                () => setColorScheme("kr"),
                t("toast.colorSchemeChanged", { value: t("settings.kr") })
              )
            }
            className={cn(
              "flex-1 rounded-lg border p-3 text-left transition-colors",
              colorScheme === "kr" ? btnActive : btnInactive
            )}
          >
            <div className="text-sm font-medium">{t("settings.kr")}</div>
            <div className="mt-1 text-xs opacity-70">{t("settings.krDesc")}</div>
            {/* <div className="mt-2 flex gap-1">
              <span className="h-3 w-3 rounded-sm bg-red-500" />
              <span className="h-3 w-3 rounded-sm bg-blue-600" />
            </div> */}
          </button>
          <button
            onClick={() =>
              handleSetting(
                () => setColorScheme("us"),
                t("toast.colorSchemeChanged", { value: t("settings.us") })
              )
            }
            className={cn(
              "flex-1 rounded-lg border p-3 text-left transition-colors",
              colorScheme === "us" ? btnActive : btnInactive
            )}
          >
            <div className="text-sm font-medium">{t("settings.us")}</div>
            <div className="mt-1 text-xs opacity-70">{t("settings.usDesc")}</div>
            {/* <div className="mt-2 flex gap-1">
              <span className="h-3 w-3 rounded-sm bg-green-500" />
              <span className="h-3 w-3 rounded-sm bg-red-500" />
            </div> */}
          </button>
        </div>
      </section>

      {/* 테마 */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.theme")}
        </h3>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t_val) => (
            <button
              key={t_val}
              onClick={() =>
                handleSetting(
                  () => setTheme(t_val),
                  t("toast.themeChanged", {
                    value: t_val === "dark" ? t("settings.dark") : t("settings.light"),
                  })
                )
              }
              className={cn(
                "flex-1 rounded-lg border p-2 text-sm transition-colors",
                theme === t_val ? btnActive : btnInactive
              )}
            >
              {t_val === "dark" ? t("settings.dark") : t("settings.light")}
            </button>
          ))}
        </div>
      </section>

      {/* 언어 */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.language")}
        </h3>
        <div className="flex gap-2">
          {(["ko", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() =>
                handleSetting(
                  () => setLanguage(l),
                  t("toast.languageChanged", { value: l === "ko" ? "한국어" : "English" })
                )
              }
              className={cn(
                "flex-1 rounded-lg border p-2 text-sm transition-colors",
                language === l ? btnActive : btnInactive
              )}
            >
              {l === "ko" ? "한국어" : "English"}
            </button>
          ))}
        </div>
      </section>

      {/* 통화 */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.currency")}
        </h3>
        <div className="flex gap-2">
          {(["USD", "KRW"] as const).map((c) => (
            <button
              key={c}
              onClick={() =>
                handleSetting(
                  () => setCurrency(c),
                  t("toast.currencyChanged", { value: c === "USD" ? "USD ($)" : "KRW (₩)" })
                )
              }
              className={cn(
                "flex-1 rounded-lg border p-2 text-sm transition-colors",
                currency === c ? btnActive : btnInactive
              )}
            >
              {c === "USD" ? "USD ($)" : "KRW (₩)"}
            </button>
          ))}
        </div>
      </section>

      {/* 차트 표시 on/off */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.chart")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleSetting(
                () => setShowChart(true),
                t("toast.chartChanged", { value: t("settings.chartOn") })
              )
            }
            className={cn(
              "flex-1 rounded-lg border p-2 text-sm transition-colors",
              showChart ? btnActive : btnInactive
            )}
          >
            {t("settings.chartOn")}
          </button>
          <button
            onClick={() =>
              handleSetting(
                () => setShowChart(false),
                t("toast.chartChanged", { value: t("settings.chartOff") })
              )
            }
            className={cn(
              "flex-1 rounded-lg border p-2 text-sm transition-colors",
              !showChart ? btnActive : btnInactive
            )}
          >
            {t("settings.chartOff")}
          </button>
        </div>
      </section>

      {/* 완료 버튼 */}
      <button
        onClick={closeSettings}
        className={cn(
          "w-full rounded-xl py-3 text-sm font-medium transition-colors",
          isDark
            ? "bg-white/15 text-white hover:bg-white/25"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        )}
      >
        {t("common.done")}
      </button>
    </Modal>
  );
};

SettingsModal.displayName = "SettingsModal";
