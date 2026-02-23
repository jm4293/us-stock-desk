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
}

export function StockChart({ data, livePrice }: StockChartProps) {
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

  // 라이브 실시간 가격 업데이트
  // 항상 마지막 캔들의 time을 사용하여 OHLC만 갱신 (새 캔들 추가는 다음 API 폴링 시 반영)
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0 || !livePrice) return;

    const lastCandle = data[data.length - 1];
    const lastTimeSec = Math.floor(lastCandle.time / 1000) as CandlestickData["time"];

    seriesRef.current.update({
      time: lastTimeSec,
      open: lastCandle.open,
      high: Math.max(lastCandle.high, livePrice),
      low: Math.min(lastCandle.low, livePrice),
      close: livePrice,
    });
  }, [data, livePrice]);

  // 차트 영역 드래그 시 부모(Rnd) 드래그 방지
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("mousedown", stop);
    el.addEventListener("touchstart", stop, { passive: true });
    return () => {
      el.removeEventListener("mousedown", stop);
      el.removeEventListener("touchstart", stop);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
