import { useChartData, useExchangeRate, useStockData } from "@/hooks";
import { useColorScheme, useCurrency, useSettingsStore, useShowChart } from "@/stores";
import type { ChartTimeRange } from "@/types";

export function useMobileStockBox(symbol: string, range: ChartTimeRange) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const { state: priceState } = useStockData(symbol);
  const { state: chartState } = useChartData(symbol, range);
  const showChart = useShowChart();
  const colorScheme = useColorScheme();
  const currency = useCurrency();
  const { rate: exchangeRate } = useExchangeRate();

  return {
    isDark,
    priceState,
    chartState,
    showChart,
    colorScheme,
    currency,
    exchangeRate,
  };
}
