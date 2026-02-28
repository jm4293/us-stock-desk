import { useEffect } from "react";
import { stockSocket } from "@/services";

/**
 * 앱 초기화 로직
 * - WebSocket 연결 초기화
 */
export const useAppInit = () => {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY as string;
    stockSocket.init(apiKey);
  }, []);
};
