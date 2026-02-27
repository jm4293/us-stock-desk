export interface TooltipPos {
  top: number;
  left: number;
}

export interface MarketTooltipBaseProps {
  isDST: boolean;
  isDark: boolean;
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
}

export type SessionItem = {
  key: "pre" | "open" | "post" | "closed";
  color: string;
  etKey: string;
  kstKey: string;
};
