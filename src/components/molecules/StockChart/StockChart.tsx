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
  }, [upColor, downColor, chartTextColor, gridColor, borderColor, crosshairColor]);

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
