import { SessionItem } from "@/components";

export function TooltipSessions(isDST: boolean): SessionItem[] {
  const dst = isDST ? "EDT" : "EST";
  return [
    {
      key: "pre",
      color: "bg-yellow-400",
      etKey: `market.tooltip.preTime${dst}`,
      kstKey: `market.tooltip.preTimeKST${dst}`,
    },
    {
      key: "open",
      color: "bg-green-500",
      etKey: `market.tooltip.openTime${dst}`,
      kstKey: `market.tooltip.openTimeKST${dst}`,
    },
    {
      key: "post",
      color: "bg-blue-400",
      etKey: `market.tooltip.postTime${dst}`,
      kstKey: `market.tooltip.postTimeKST${dst}`,
    },
    {
      key: "closed",
      color: "bg-gray-500",
      etKey: `market.tooltip.closedTime${dst}`,
      kstKey: `market.tooltip.closedTimeKST${dst}`,
    },
  ];
}
