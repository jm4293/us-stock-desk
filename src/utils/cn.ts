import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스를 병합하는 유틸리티 함수
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌을 해결
 *
 * @example
 * cn('px-4 py-2', 'px-6') // 'px-6 py-2'
 * cn('text-red-500', condition && 'text-blue-500') // 조건부
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
