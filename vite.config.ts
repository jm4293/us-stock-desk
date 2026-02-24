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

        let finnhubUrl = "";
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
      open: false,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            charts: ["lightweight-charts"],
          },
        },
      },
    },
  };
});
