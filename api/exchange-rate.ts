import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW");
    const data = (await response.json()) as { rates?: Record<string, number> };
    const rate = data?.rates?.KRW ?? 1450;

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ base: "USD", target: "KRW", rate, timestamp: Date.now() });
  } catch {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ base: "USD", target: "KRW", rate: 1450, timestamp: Date.now() });
  }
}
