import { useEffect, useRef } from "react";
import { useColorScheme, useTheme } from "@/stores";
import type { ChartTimeRange, StockChartData } from "@/types";
import {
  type CandlestickData,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  TickMarkType,
} from "lightweight-charts";

// 타임프레임별 캔들 간격 (초)
const CANDLE_INTERVAL_SEC: Record<ChartTimeRange, number> = {
  "1m": 60,
  "5m": 300,
  "10m": 600,
  "1h": 3600,
  "1D": 86400,
};

interface StockChartProps {
  data: StockChartData[];
  livePrice?: number | null;
  timeRange?: ChartTimeRange;
}

export function StockChart({ data, livePrice, timeRange = "1m" }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const dataRef = useRef<StockChartData[]>(data);
  dataRef.current = data;

  // 현재 진행 중인 라이브 캔들 OHLC를 추적 (data ref 기반으로 리셋)
  const liveCandleRef = useRef<{
    timeSec: number;
    open: number;
    high: number;
    low: number;
  } | null>(null);

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
          if (tickType === TickMarkType.DayOfMonth) {
            // 분봉 데이터에서는 날짜 + 시간을 함께 표시
            if (hh !== "00" || min !== "00") return `${mm}/${dd} ${hh}:${min}`;
            return `${mm}/${dd}`;
          }
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

  // 데이터 변경 시 시리즈 업데이트 (API 폴링으로 새 데이터 수신)
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
    // API 데이터가 갱신되면 liveCandleRef 리셋 → 이후 livePrice effect에서 재초기화
    liveCandleRef.current = null;
  }, [data]);

  // 라이브 실시간 가격 업데이트
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0 || !livePrice) return;

    const intervalSec = CANDLE_INTERVAL_SEC[timeRange];
    const lastCandle = data[data.length - 1];
    const lastCandleTimeSec = Math.floor(lastCandle.time / 1000);

    const nowSec = Math.floor(Date.now() / 1000);

    // 현재 시각 기준으로 현재 캔들 구간의 시작 시각을 계산
    // (nowSec을 intervalSec으로 정렬하면 현재 캔들 구간의 시작 시각)
    const currentCandleTimeSec = Math.floor(nowSec / intervalSec) * intervalSec;

    // liveCandleRef 초기화 조건:
    // - 아직 없거나, API data가 업데이트되어 마지막 캔들이 바뀌었을 때 리셋
    if (!liveCandleRef.current || liveCandleRef.current.timeSec < lastCandleTimeSec) {
      liveCandleRef.current = null;
    }

    if (currentCandleTimeSec > lastCandleTimeSec) {
      // 현재 시각이 마지막 API 캔들보다 이후 구간 → 새 캔들
      if (!liveCandleRef.current || liveCandleRef.current.timeSec !== currentCandleTimeSec) {
        // 새 캔들 구간에 처음 진입: open = livePrice
        liveCandleRef.current = {
          timeSec: currentCandleTimeSec,
          open: livePrice,
          high: livePrice,
          low: livePrice,
        };
      } else {
        // 같은 새 캔들 구간 내에서 누적
        liveCandleRef.current.high = Math.max(liveCandleRef.current.high, livePrice);
        liveCandleRef.current.low = Math.min(liveCandleRef.current.low, livePrice);
      }

      seriesRef.current.update({
        time: liveCandleRef.current.timeSec as CandlestickData["time"],
        open: liveCandleRef.current.open,
        high: liveCandleRef.current.high,
        low: liveCandleRef.current.low,
        close: livePrice,
      });
    } else {
      // 아직 같은 캔들 구간 → 마지막 API 캔들 OHLC 갱신
      // liveCandleRef로 high/low 누적 (data 원본이 리셋해도 유지)
      if (!liveCandleRef.current || liveCandleRef.current.timeSec !== lastCandleTimeSec) {
        liveCandleRef.current = {
          timeSec: lastCandleTimeSec,
          open: lastCandle.open,
          high: lastCandle.high,
          low: lastCandle.low,
        };
      }
      liveCandleRef.current.high = Math.max(liveCandleRef.current.high, livePrice);
      liveCandleRef.current.low = Math.min(liveCandleRef.current.low, livePrice);

      seriesRef.current.update({
        time: lastCandleTimeSec as CandlestickData["time"],
        open: liveCandleRef.current.open,
        high: liveCandleRef.current.high,
        low: liveCandleRef.current.low,
        close: livePrice,
      });
    }
  }, [data, livePrice, timeRange]);

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
