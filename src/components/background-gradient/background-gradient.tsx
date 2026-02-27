import { useSettingsStore } from "@/stores";
import { cn } from "@/utils";

export function BackgroundGradient() {
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", isDark ? "bg-gray-950" : "bg-slate-50")}
    />
  );
}
