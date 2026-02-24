import { useEffect, useRef, useState } from "react";

type FlashDirection = "up" | "down" | null;
type ColorScheme = "kr" | "us";

interface UseFlashBorderResult {
  flashDirection: FlashDirection;
  flashRingClass: string | null;
}

/**
 * 가격 변동 시 테두리 플래시 애니메이션을 제공하는 훅.
 * 가격이 오르면 "up", 내리면 "down" 방향으로 600ms간 outline이 표시됩니다.
 */
export function useFlashBorder(
  currentPrice: number | null,
  colorScheme: ColorScheme
): UseFlashBorderResult {
  const prevPriceRef = useRef<number | null>(null);
  const [flashDirection, setFlashDirection] = useState<FlashDirection>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentPrice === null) return;
    const prev = prevPriceRef.current;
    if (prev !== null && prev !== currentPrice) {
      const direction = currentPrice > prev ? "up" : "down";
      setFlashDirection(direction);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashDirection(null), 600);
    }
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const flashRingClass =
    flashDirection === "up"
      ? colorScheme === "kr"
        ? "outline outline-2 outline-red-500"
        : "outline outline-2 outline-green-400"
      : flashDirection === "down"
        ? colorScheme === "kr"
          ? "outline outline-2 outline-blue-500"
          : "outline outline-2 outline-red-500"
        : null;

  return { flashDirection, flashRingClass };
}
