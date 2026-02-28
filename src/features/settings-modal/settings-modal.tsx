import React from "react";
import { Modal, SettingOptionButton } from "@/components";
import {
  selectCloseSettings,
  selectColorScheme,
  selectCurrency,
  selectIsSettingsOpen,
  selectLanguage,
  selectSetColorScheme,
  selectSetCurrency,
  selectSetLanguage,
  selectSetShowChart,
  selectSetShowExchangeRate,
  selectSetShowIndexDJI,
  selectSetShowIndexNASDAQ,
  selectSetShowIndexSP500,
  selectSetTheme,
  selectShowChart,
  selectShowExchangeRate,
  selectShowIndexDJI,
  selectShowIndexNASDAQ,
  selectShowIndexSP500,
  selectShowToast,
  selectTheme,
  useSettingsStore,
  useToastStore,
  useUIStore,
} from "@/stores";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

const colorSchemeOptions = [
  { value: "kr", labelKey: "settings.kr", descKey: "settings.krDesc" },
  { value: "us", labelKey: "settings.us", descKey: "settings.usDesc" },
] as const;

const themeOptions = [
  { value: "dark", labelKey: "settings.dark" },
  { value: "light", labelKey: "settings.light" },
] as const;

const languageOptions = [
  { value: "ko", labelKey: "settings.krLang" },
  { value: "en", labelKey: "settings.usLang" },
] as const;

const currencyOptions = [
  { value: "KRW", labelKey: "settings.krw" },
  { value: "USD", labelKey: "settings.usd" },
] as const;

const marketIndexOptions = [
  { value: "dji", labelKey: "settings.indexDJI", show: "showIndexDJI", setter: "setShowIndexDJI" },
  {
    value: "sp500",
    labelKey: "settings.indexSP500",
    show: "showIndexSP500",
    setter: "setShowIndexSP500",
  },
  {
    value: "nasdaq",
    labelKey: "settings.indexNASDAQ",
    show: "showIndexNASDAQ",
    setter: "setShowIndexNASDAQ",
  },
] as const;

const showExchangeRateOptions = [
  { value: true, labelKey: "settings.on" },
  { value: false, labelKey: "settings.off" },
] as const;

const showChartOptions = [
  { value: true, labelKey: "settings.on" },
  { value: false, labelKey: "settings.off" },
] as const;

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();

  const isSettingsOpen = useUIStore(selectIsSettingsOpen);
  const closeSettings = useUIStore(selectCloseSettings);

  const language = useSettingsStore(selectLanguage);
  const currency = useSettingsStore(selectCurrency);
  const showChart = useSettingsStore(selectShowChart);
  const showIndexDJI = useSettingsStore(selectShowIndexDJI);
  const showIndexSP500 = useSettingsStore(selectShowIndexSP500);
  const showIndexNASDAQ = useSettingsStore(selectShowIndexNASDAQ);
  const showExchangeRate = useSettingsStore(selectShowExchangeRate);
  const colorScheme = useSettingsStore(selectColorScheme);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const setColorScheme = useSettingsStore(selectSetColorScheme);
  const setTheme = useSettingsStore(selectSetTheme);
  const setLanguage = useSettingsStore(selectSetLanguage);
  const setCurrency = useSettingsStore(selectSetCurrency);
  const setShowChart = useSettingsStore(selectSetShowChart);
  const setShowIndexDJI = useSettingsStore(selectSetShowIndexDJI);
  const setShowIndexSP500 = useSettingsStore(selectSetShowIndexSP500);
  const setShowIndexNASDAQ = useSettingsStore(selectSetShowIndexNASDAQ);
  const setShowExchangeRate = useSettingsStore(selectSetShowExchangeRate);

  const showToast = useToastStore(selectShowToast);

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
          {colorSchemeOptions.map((option) => (
            <SettingOptionButton
              key={option.value}
              isActive={colorScheme === option.value}
              isDark={isDark}
              className="p-3 text-left"
              onClick={() =>
                handleSetting(
                  () => setColorScheme(option.value),
                  t("toast.colorSchemeChanged", { value: t(option.labelKey) })
                )
              }
            >
              <div className="text-sm font-medium">{t(option.labelKey)}</div>
              <div className="mt-1 text-xs opacity-70">{t(option.descKey)}</div>
            </SettingOptionButton>
          ))}
        </div>
      </section>

      {/* 테마 */}
      <section className="mb-5">
        <h3 className={cn("mb-3 text-sm font-semibold", sectionHeadingColor)}>
          {t("settings.theme")}
        </h3>
        <div className="flex gap-2">
          {themeOptions.map((option) => (
            <SettingOptionButton
              key={option.value}
              isActive={theme === option.value}
              isDark={isDark}
              className="p-2 text-sm"
              onClick={() =>
                handleSetting(
                  () => setTheme(option.value),
                  t("toast.themeChanged", {
                    value: t(option.labelKey),
                  })
                )
              }
            >
              {t(option.labelKey)}
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
          {languageOptions.map((option) => (
            <SettingOptionButton
              key={option.value}
              isActive={language === option.value}
              isDark={isDark}
              className="p-2 text-sm"
              onClick={() =>
                handleSetting(
                  () => setLanguage(option.value),
                  t("toast.languageChanged", { value: t(option.labelKey) })
                )
              }
            >
              {t(option.labelKey)}
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
          {currencyOptions.map((option) => (
            <SettingOptionButton
              key={option.value}
              isActive={currency === option.value}
              isDark={isDark}
              className="p-2 text-sm"
              onClick={() =>
                handleSetting(
                  () => setCurrency(option.value),
                  t("toast.currencyChanged", { value: t(option.labelKey) })
                )
              }
            >
              {t(option.labelKey)}
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
          {marketIndexOptions.map(({ labelKey }) => {
            const show =
              labelKey === "settings.indexDJI"
                ? showIndexDJI
                : labelKey === "settings.indexSP500"
                  ? showIndexSP500
                  : showIndexNASDAQ;
            const onToggle =
              labelKey === "settings.indexDJI"
                ? setShowIndexDJI
                : labelKey === "settings.indexSP500"
                  ? setShowIndexSP500
                  : setShowIndexNASDAQ;

            return (
              <div key={labelKey} className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-20 shrink-0 text-xs font-medium",
                    isDark ? "text-gray-300" : "text-slate-600"
                  )}
                >
                  {t(labelKey)}
                </span>
                <div className="flex flex-1 gap-1">
                  <SettingOptionButton
                    isActive={show}
                    isDark={isDark}
                    className="flex-1 py-1 text-xs"
                    onClick={() =>
                      handleSetting(
                        () => onToggle(true),
                        t("toast.indexChanged", { name: t(labelKey), value: t("settings.indexOn") })
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
                        t("toast.indexChanged", {
                          name: t(labelKey),
                          value: t("settings.indexOff"),
                        })
                      )
                    }
                  >
                    {t("settings.indexOff")}
                  </SettingOptionButton>
                </div>
              </div>
            );
          })}
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
              {showExchangeRateOptions.map(({ value, labelKey }) => (
                <SettingOptionButton
                  key={String(value)}
                  isActive={showExchangeRate === value}
                  isDark={isDark}
                  className="flex-1 py-1 text-xs"
                  onClick={() =>
                    handleSetting(
                      () => setShowExchangeRate(value),
                      t("toast.exchangeRateChanged", { value: t(labelKey) })
                    )
                  }
                >
                  {t(labelKey)}
                </SettingOptionButton>
              ))}
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
              {showChartOptions.map(({ value, labelKey }) => (
                <SettingOptionButton
                  key={String(value)}
                  isActive={showChart === value}
                  isDark={isDark}
                  className="flex-1 py-1 text-xs"
                  onClick={() =>
                    handleSetting(
                      () => setShowChart(value),
                      t("toast.chartChanged", { value: t(labelKey) })
                    )
                  }
                >
                  {t(labelKey)}
                </SettingOptionButton>
              ))}
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
