import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Yahoo Finance 차트 프록시 (무료, API 키 불필요)
function yahooChartPlugin(): Plugin {
  const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
  const RANGE_MAP: Record<string, { interval: string; range: string }> = {
    "1m": { interval: "1m", range: "1d" },
    "5m": { interval: "5m", range: "1d" },
    "10m": { interval: "15m", range: "5d" },
    "1h": { interval: "1h", range: "5d" },
    "1D": { interval: "1d", range: "1mo" },
  };

  return {
    name: "yahoo-chart-proxy",
    configureServer(server) {
      server.middlewares.use("/api/chart", async (req, res) => {
        const url = new URL(req.url!, "http://localhost");
        const symbol = url.searchParams.get("symbol") ?? "";
        const timeRange = url.searchParams.get("range") ?? "5m";
        const config = RANGE_MAP[timeRange] ?? RANGE_MAP["5m"];

        try {
          const yahooUrl = `${YAHOO_BASE}/${symbol}?interval=${config.interval}&range=${config.range}`;
          const response = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const data = await response.json();
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(data));
        } catch {
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Yahoo chart proxy error" }));
        }
      });
    },
  };
}

// Yahoo Finance 지수 시세 프록시 (로컬 개발용)
function yahooIndexQuotePlugin(): Plugin {
  const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

  return {
    name: "yahoo-index-quote-proxy",
    configureServer(server) {
      server.middlewares.use("/api/index-quote", async (req, res) => {
        const url = new URL(req.url!, "http://localhost");
        const symbol = url.searchParams.get("symbol") ?? "";

        if (!symbol) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "symbol is required" }));
          return;
        }

        try {
          const yahooUrl = `${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
          const response = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const data = await response.json();

          const result = data?.chart?.result?.[0];
          if (!result?.meta) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "No data found" }));
            return;
          }

          const meta = result.meta;
          const price = meta.regularMarketPrice ?? 0;
          const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
          const change = price - previousClose;
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(
            JSON.stringify({
              symbol: meta.symbol,
              shortName: meta.shortName ?? meta.symbol,
              price,
              previousClose,
              change,
              changePercent,
              dayHigh: meta.regularMarketDayHigh ?? 0,
              dayLow: meta.regularMarketDayLow ?? 0,
            })
          );
        } catch {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Yahoo index quote proxy error" }));
        }
      });
    },
  };
}

// 로컬 개발용 Finnhub API 프록시 미들웨어
function finnhubProxyPlugin(apiKey: string): Plugin {
  return {
    name: "finnhub-proxy",
    configureServer(server) {
      const BASE = "https://finnhub.io/api/v1";

      server.middlewares.use("/api/stock-proxy", async (req, res) => {
        const url = new URL(req.url!, "http://localhost");
        const symbol = url.searchParams.get("symbol") ?? "";
        const type = url.searchParams.get("type") ?? "";
        const resolution = url.searchParams.get("resolution") ?? "D";
        const from = url.searchParams.get("from") ?? "";
        const to = url.searchParams.get("to") ?? "";
        const q = url.searchParams.get("q") ?? "";

        let finnhubUrl;
        if (type === "quote") {
          finnhubUrl = `${BASE}/quote?symbol=${symbol}&token=${apiKey}`;
        } else if (type === "candle") {
          finnhubUrl = `${BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
        } else if (type === "search") {
          finnhubUrl = `${BASE}/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid type" }));
          return;
        }

        try {
          const response = await fetch(finnhubUrl);
          const data = await response.json();
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(data));
        } catch {
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Proxy error" }));
        }
      });

      // Yahoo Finance Extended Hours Proxy (Match production api/extended-hours.ts)
      server.middlewares.use("/api/extended-hours", async (req, res) => {
        const url = new URL(req.url!, "http://localhost");
        const symbol = url.searchParams.get("symbol") ?? "";

        if (!symbol) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "symbol is required" }));
          return;
        }

        try {
          const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1m&range=1d&includePrePost=true`;
          const response = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const data = await response.json();
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(data));
        } catch {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Extended hours proxy error" }));
        }
      });

      // Yahoo Finance Exchange Rate Proxy (Match production api/exchange-rate.ts)
      server.middlewares.use("/api/exchange-rate", async (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        try {
          const response = await fetch(
            "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?interval=1m&range=1d",
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );
          if (!response.ok) throw new Error("Yahoo API Error");
          const data = await response.json();
          const rate = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? 1450;
          res.end(JSON.stringify({ base: "USD", target: "KRW", rate, timestamp: Date.now() }));
        } catch (error) {
          console.error("Local Exchange Rate Proxy Error:", error);
          res.end(
            JSON.stringify({ base: "USD", target: "KRW", rate: 1450, timestamp: Date.now() })
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.FINNHUB_API_KEY ?? "";

  return {
    plugins: [
      react(),
      finnhubProxyPlugin(apiKey),
      yahooChartPlugin(),
      yahooIndexQuotePlugin(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "US Stock Desk",
          short_name: "StockDesk",
          description: "미국주식 실시간 모니터링 대시보드",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          runtimeCaching: [
            {
              urlPattern: /^https:\/\//,
              handler: "NetworkOnly",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
        "@/stores": path.resolve(__dirname, "./src/stores"),
        "@/services": path.resolve(__dirname, "./src/services"),
        "@/utils": path.resolve(__dirname, "./src/utils"),
        "@/types": path.resolve(__dirname, "./src/types"),
        "@/constants": path.resolve(__dirname, "./src/constants"),
        "@/styles": path.resolve(__dirname, "./src/styles"),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    esbuild: {
      // 프로덕션 빌드 시 console, debugger 제거
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    build: {
      rollupOptions: {
        // eval() 경고 무시 (protobufjs 등 일부 라이브러리에서 사용)
        onwarn(warning, warn) {
          // eval 경고 무시
          if (warning.code === "EVAL") return;
          // 순환 참조 경고는 표시
          warn(warning);
        },
        output: {
          manualChunks(id) {
            // node_modules가 아니면 기본 처리
            if (!id.includes("node_modules")) {
              return undefined;
            }

            // React 핵심 + scheduler (React 내부 의존성 포함)
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/scheduler/")
            ) {
              return "react-vendor";
            }

            // 차트 라이브러리
            if (id.includes("/lightweight-charts/")) {
              return "charts";
            }

            // 드래그 & 리사이징 (React 의존성 있음)
            if (id.includes("/react-rnd/")) {
              return "rnd-vendor";
            }

            // Zustand + Immer (상태 관리)
            if (id.includes("/zustand/") || id.includes("/immer/")) {
              return "store-vendor";
            }

            // i18n 관련
            if (id.includes("/i18next/") || id.includes("/react-i18next/")) {
              return "i18n-vendor";
            }

            // 유틸리티 (작은 패키지들)
            if (
              id.includes("/clsx/") ||
              id.includes("/tailwind-merge/") ||
              id.includes("/date-fns/")
            ) {
              return "utils-vendor";
            }

            // 나머지 모든 node_modules는 vendor로
            return "vendor";
          },
        },
      },
      chunkSizeWarningLimit: 600, // 경고 임계값을 600KB로 상향 (차트 라이브러리 때문)
    },
  };
});
