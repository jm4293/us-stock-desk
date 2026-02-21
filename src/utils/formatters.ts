export function formatUSD(value: number): string {
  if (value == null || isNaN(value)) return "$—";
  return `$${value.toFixed(2)}`;
}

export function formatKRW(value: number): string {
  if (value == null || isNaN(value)) return "₩—";
  return `₩${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`;
}

export function formatChangeUSD(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value >= 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`;
}

export function formatChangeKRW(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value >= 0
    ? `+₩${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`
    : `-₩${Math.abs(value).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value >= 0 ? `+${value.toFixed(2)}%` : `-${Math.abs(value).toFixed(2)}%`;
}
