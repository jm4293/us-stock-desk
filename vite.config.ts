import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Yahoo Finance 차트 프록시 (무료, API 키 불필요)
function yahooChartPlugin(): Plugin {
  const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
  const RANGE_MAP: Record<string, { interval: string; range: string }> = {
    "1D": { interval: "5m", range: "1d" },
    "1W": { interval: "1h", range: "5d" },
    "1M": { interval: "1d", range: "1mo" },
    "3M": { interval: "1d", range: "3mo" },
    "6M": { interval: "1d", range: "6mo" },
    "1Y": { interval: "1wk", range: "1y" },
  };

  return {
    name: "yahoo-chart-proxy",
    configureServer(server) {
      server.middlewares.use("/api/chart", async (req, res) => {
        const url = new URL(req.url!, "http://localhost");
        const symbol = url.searchParams.get("symbol") ?? "";
        const timeRange = url.searchParams.get("range") ?? "1W";
        const config = RANGE_MAP[timeRange] ?? RANGE_MAP["1W"];

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

      // Frankfurt Open Data API (무료, 키 불필요, ECB 기준 실시간 환율)
      server.middlewares.use("/api/exchange-rate", async (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        try {
          const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW");
          const data = (await response.json()) as { rates?: Record<string, number> };
          const rate = data?.rates?.KRW ?? 1450;
          res.end(JSON.stringify({ base: "USD", target: "KRW", rate, timestamp: Date.now() }));
        } catch {
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
    plugins: [react(), finnhubProxyPlugin(apiKey), yahooChartPlugin()],
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
