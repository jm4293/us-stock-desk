import React from "react";
import { Modal, SettingOptionButton } from "@/components";
import {
  useColorScheme,
  useCurrency,
  useLanguage,
  useSettingsActions,
  useShowChart,
  useShowExchangeRate,
  useShowIndexDJI,
  useShowIndexNASDAQ,
  useShowIndexSP500,
  useShowToast,
  useTheme,
  useUIActions,
  useUIStore,
} from "@/stores";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();
  const isSettingsOpen = useUIStore((state) => state.isSettingsOpen);
  const { closeSettings } = useUIActions();
  const {
    setColorScheme,
    setTheme,
    setLanguage,
    setCurrency,
    setShowChart,
    setShowIndexDJI,
    setShowIndexSP500,
    setShowIndexNASDAQ,
    setShowExchangeRate,
  } = useSettingsActions();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const language = useLanguage();
  const currency = useCurrency();
  const showChart = useShowChart();
  const showIndexDJI = useShowIndexDJI();
  const showIndexSP500 = useShowIndexSP500();
  const showIndexNASDAQ = useShowIndexNASDAQ();
  const showExchangeRate = useShowExchangeRate();
  const showToast = useShowToast();

  const isDark = theme === "dark";

  const handleSetting = (fn: () => void, message: string) => {
    fn();
    showToast(message, "info");
  };

  const headingColor = isDark ? "text-white" : "text-slate-800";
  const sectionHeadingColor = isDark ? "text-gray-300" : "text-slate-500";

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
          <SettingOptionButton
            isActive={colorScheme === "kr"}
            isDark={isDark}
            className="p-3 text-left"
            onClick={() =>
              handleSetting(
                () => setColorScheme("kr"),
                t("toast.colorSchemeChanged", { value: t("settings.kr") })
              )
            }
          >
            <div className="text-sm font-medium">{t("settings.kr")}</div>
            <div className="mt-1 text-xs opacity-70">{t("settings.krDesc")}</div>
          </SettingOptionButton>
          <SettingOptionButton
            isActive={colorScheme === "us"}
            isDark={isDark}
            className="p-3 text-left"
            onClick={() =>
              handleSetting(
                () => setColorScheme("us"),
                t("toast.colorSchemeChanged", { value: t("settings.us") })
              )
            }
          >
            <div className="text-sm font-medium">{t("settings.us")}</div>
            <div className="mt-1 text-xs opacity-70">{t("settings.usDesc")}</div>
          </SettingOptionButton>
        </div>
      </section>

      {/* 테마 */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.theme")}
        </h3>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t_val) => (
            <SettingOptionButton
              key={t_val}
              isActive={theme === t_val}
              isDark={isDark}
              className="p-2 text-sm"
              onClick={() =>
                handleSetting(
                  () => setTheme(t_val),
                  t("toast.themeChanged", {
                    value: t_val === "dark" ? t("settings.dark") : t("settings.light"),
                  })
                )
              }
            >
              {t_val === "dark" ? t("settings.dark") : t("settings.light")}
            </SettingOptionButton>
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
            <SettingOptionButton
              key={l}
              isActive={language === l}
              isDark={isDark}
              className="p-2 text-sm"
              onClick={() =>
                handleSetting(
                  () => setLanguage(l),
                  t("toast.languageChanged", { value: l === "ko" ? "한국어" : "English" })
                )
              }
            >
              {l === "ko" ? "한국어" : "English"}
            </SettingOptionButton>
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
            <SettingOptionButton
              key={c}
              isActive={currency === c}
              isDark={isDark}
              className="p-2 text-sm"
              onClick={() =>
                handleSetting(
                  () => setCurrency(c),
                  t("toast.currencyChanged", { value: c === "USD" ? "USD ($)" : "KRW (₩)" })
                )
              }
            >
              {c === "USD" ? "USD ($)" : "KRW (₩)"}
            </SettingOptionButton>
          ))}
        </div>
      </section>

      {/* 시장 지수 on/off */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.marketIndex")}
        </h3>
        <div className="flex flex-col gap-2">
          {(
            [
              {
                label: t("settings.indexDJI"),
                show: showIndexDJI,
                onToggle: setShowIndexDJI,
                name: "settings.indexDJI",
              },
              {
                label: t("settings.indexSP500"),
                show: showIndexSP500,
                onToggle: setShowIndexSP500,
                name: "settings.indexSP500",
              },
              {
                label: t("settings.indexNASDAQ"),
                show: showIndexNASDAQ,
                onToggle: setShowIndexNASDAQ,
                name: "settings.indexNASDAQ",
              },
            ] as const
          ).map(({ label, show, onToggle, name }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "w-20 shrink-0 text-xs font-medium",
                  isDark ? "text-gray-300" : "text-slate-600"
                )}
              >
                {label}
              </span>
              <div className="flex flex-1 gap-1">
                <SettingOptionButton
                  isActive={show}
                  isDark={isDark}
                  className="flex-1 py-1 text-xs"
                  onClick={() =>
                    handleSetting(
                      () => onToggle(true),
                      t("toast.indexChanged", { name: t(name), value: t("settings.indexOn") })
                    )
                  }
                >
                  {t("settings.indexOn")}
                </SettingOptionButton>
                <SettingOptionButton
                  isActive={!show}
                  isDark={isDark}
                  className="flex-1 py-1 text-xs"
                  onClick={() =>
                    handleSetting(
                      () => onToggle(false),
                      t("toast.indexChanged", { name: t(name), value: t("settings.indexOff") })
                    )
                  }
                >
                  {t("settings.indexOff")}
                </SettingOptionButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 환율 on/off */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.exchangeRate")}
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-20 shrink-0 text-xs font-medium",
                isDark ? "text-gray-300" : "text-slate-600"
              )}
            >
              {t("settings.exchangeRateLabel")}
            </span>
            <div className="flex flex-1 gap-1">
              <SettingOptionButton
                isActive={showExchangeRate}
                isDark={isDark}
                className="flex-1 py-1 text-xs"
                onClick={() =>
                  handleSetting(
                    () => setShowExchangeRate(true),
                    t("toast.exchangeRateChanged", { value: t("settings.indexOn") })
                  )
                }
              >
                {t("settings.indexOn")}
              </SettingOptionButton>
              <SettingOptionButton
                isActive={!showExchangeRate}
                isDark={isDark}
                className="flex-1 py-1 text-xs"
                onClick={() =>
                  handleSetting(
                    () => setShowExchangeRate(false),
                    t("toast.exchangeRateChanged", { value: t("settings.indexOff") })
                  )
                }
              >
                {t("settings.indexOff")}
              </SettingOptionButton>
            </div>
          </div>
        </div>
      </section>

      {/* 차트 표시 on/off */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.chart")}
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-20 shrink-0 text-xs font-medium",
                isDark ? "text-gray-300" : "text-slate-600"
              )}
            >
              {t("settings.chartLabel")}
            </span>
            <div className="flex flex-1 gap-1">
              <SettingOptionButton
                isActive={showChart}
                isDark={isDark}
                className="flex-1 py-1 text-xs"
                onClick={() =>
                  handleSetting(
                    () => setShowChart(true),
                    t("toast.chartChanged", { value: t("settings.chartOn") })
                  )
                }
              >
                {t("settings.chartOn")}
              </SettingOptionButton>
              <SettingOptionButton
                isActive={!showChart}
                isDark={isDark}
                className="flex-1 py-1 text-xs"
                onClick={() =>
                  handleSetting(
                    () => setShowChart(false),
                    t("toast.chartChanged", { value: t("settings.chartOff") })
                  )
                }
              >
                {t("settings.chartOff")}
              </SettingOptionButton>
            </div>
          </div>
        </div>
      </section>

      {/* 완료 버튼 */}
      <button
        onClick={closeSettings}
        className={cn(
          "w-full rounded-xl py-3 text-sm font-medium transition-colors",
          isDark
            ? "bg-white/15 text-white hover:bg-white/25"
            : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
        )}
      >
        {t("common.done")}
      </button>
    </Modal>
  );
};

SettingsModal.displayName = "SettingsModal";
