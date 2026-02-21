import { useColorScheme, useTheme } from "@/stores";
import type { StockChartData } from "@/types/stock";
import {
  ColorType,
  TickMarkType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

interface StockChartProps {
  data: StockChartData[];
  livePrice?: number | null;
  liveTimestamp?: number | null;
}

export function StockChart({ data, livePrice, liveTimestamp }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const dataRef = useRef<StockChartData[]>(data);
  dataRef.current = data;

  const colorScheme = useColorScheme();
  const theme = useTheme();
  const isDark = theme === "dark";

  const upColor = colorScheme === "kr" ? "#ef4444" : "#089981";
  const downColor = colorScheme === "kr" ? "#2563eb" : "#ef4444";

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
        tickMarkFormatter: (timestamp: number, tickType: TickMarkType) => {
          // KST = UTC+9
          const kstDate = new Date((timestamp + 9 * 60 * 60) * 1000);
          const yyyy = String(kstDate.getUTCFullYear());
          const mm = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(kstDate.getUTCDate()).padStart(2, "0");
          const hh = String(kstDate.getUTCHours()).padStart(2, "0");
          const min = String(kstDate.getUTCMinutes()).padStart(2, "0");
          if (tickType === TickMarkType.Year) return yyyy;
          if (tickType === TickMarkType.Month) return `${mm}/${dd}`;
          if (tickType === TickMarkType.DayOfMonth) return `${mm}/${dd}`;
          return `${hh}:${min}`;
        },
      },
      localization: {
        timeFormatter: (timestamp: number) => {
          // 크로스헤어 툴팁용 KST 포맷
          const kstDate = new Date((timestamp + 9 * 60 * 60) * 1000);
          const mm = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(kstDate.getUTCDate()).padStart(2, "0");
          const hh = String(kstDate.getUTCHours()).padStart(2, "0");
          const min = String(kstDate.getUTCMinutes()).padStart(2, "0");
          if (hh === "00" && min === "00") return `${mm}/${dd}`;
          return `${mm}/${dd} ${hh}:${min}`;
        },
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

  // 라이브 실시간 가격 업데이트 (기존 마지막 캔들 갱신 또는 새 캔들 추가)
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0 || !livePrice || !liveTimestamp) return;

    const lastCandle = data[data.length - 1];
    const liveTime = Math.floor(liveTimestamp / 1000) as CandlestickData["time"];

    // 현재 캔들의 시간 범위 (주/월봉 등에 따라 로직이 복잡해질 수 있으나 기본적으로 일/분봉 덮어쓰기)
    const lastTimeNum =
      typeof lastCandle.time === "number" ? lastCandle.time : Number(lastCandle.time);
    const time =
      (liveTime as unknown as number) > lastTimeNum
        ? liveTime
        : (lastCandle.time as CandlestickData["time"]);

    // 마지막 캔들의 고가, 저가, 종가를 실시간 가격으로 갱신
    const open = lastCandle.open;
    const high = Math.max(lastCandle.high, livePrice);
    const low = Math.min(lastCandle.low, livePrice);
    const close = livePrice;

    seriesRef.current.update({ time, open, high, low, close });
  }, [data, livePrice, liveTimestamp]);

  return <div ref={containerRef} className="h-full w-full" />;
}
