import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  ColorType,
} from "lightweight-charts";
import type { StockChartData } from "@/types/stock";
import { useColorScheme, useTheme } from "@/stores/settingsStore";

interface StockChartProps {
  data: StockChartData[];
}

export function StockChart({ data }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const dataRef = useRef<StockChartData[]>(data);
  dataRef.current = data;

  const colorScheme = useColorScheme();
  const theme = useTheme();
  const isDark = theme === "dark";

  const upColor = colorScheme === "kr" ? "#ef4444" : "#22c55e";
  const downColor = colorScheme === "kr" ? "#60a5fa" : "#ef4444";

  const chartTextColor = isDark ? "#9ca3af" : "#475569";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const crosshairColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";

  // 차트 최초 생성 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: chartTextColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        vertLine: { color: crosshairColor },
        horzLine: { color: crosshairColor },
      },
      rightPriceScale: {
        borderColor,
        textColor: chartTextColor,
      },
      timeScale: {
        borderColor,
        timeVisible: true,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    if (dataRef.current.length > 0) {
      const candleData: CandlestickData[] = dataRef.current.map((d) => ({
        time: Math.floor(d.time / 1000) as CandlestickData["time"],
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      series.setData(candleData);
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테마/색상 변경 시 차트 재생성 없이 옵션만 업데이트
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;

    chartRef.current.applyOptions({
      layout: { textColor: chartTextColor },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        vertLine: { color: crosshairColor },
        horzLine: { color: crosshairColor },
      },
      rightPriceScale: { borderColor, textColor: chartTextColor },
      timeScale: { borderColor },
    });

    seriesRef.current.applyOptions({
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
  }, [upColor, downColor, chartTextColor, gridColor, borderColor, crosshairColor]);

  // 데이터 변경 시 시리즈 업데이트
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const candleData: CandlestickData[] = data.map((d) => ({
      time: Math.floor(d.time / 1000) as CandlestickData["time"],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    seriesRef.current.setData(candleData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className="h-full w-full" />;
}
