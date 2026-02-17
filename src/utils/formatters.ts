export function formatUSD(value: number): string {
  if (value == null || isNaN(value)) return "$—";
  return `$${value.toFixed(2)}`;
}

export function formatKRW(value: number): string {
  if (value == null || isNaN(value)) return "₩—";
  return `₩${Math.round(value).toLocaleString("ko-KR")}`;
}

export function formatChangeUSD(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value >= 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`;
}

export function formatChangeKRW(value: number): string {
  if (value == null || isNaN(value)) return "—";
  const rounded = Math.round(value);
  return rounded >= 0
    ? `+₩${rounded.toLocaleString("ko-KR")}`
    : `-₩${Math.abs(rounded).toLocaleString("ko-KR")}`;
}

export function formatPercent(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value >= 0 ? `+${value.toFixed(2)}%` : `-${Math.abs(value).toFixed(2)}%`;
}
