export function formatUSD(value: number): string {
  if (value == null || isNaN(value)) return "$—";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatKRW(value: number): string {
  if (value == null || isNaN(value)) return "₩—";
  return `₩${value.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChangeUSD(value: number): string {
  if (value == null || isNaN(value)) return "—";
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value >= 0 ? `+$${abs}` : `-$${abs}`;
}

export function formatChangeKRW(value: number): string {
  if (value == null || isNaN(value)) return "—";
  const abs = Math.abs(value).toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value >= 0 ? `+₩${abs}` : `-₩${abs}`;
}

export function formatIndex(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatChangeIndex(value: number): string {
  if (value == null || isNaN(value)) return "—";
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value >= 0 ? `+${abs}` : `-${abs}`;
}

export function formatPercent(value: number): string {
  if (value == null || isNaN(value)) return "—";
  return value >= 0 ? `+${value.toFixed(2)}%` : `-${Math.abs(value).toFixed(2)}%`;
}
