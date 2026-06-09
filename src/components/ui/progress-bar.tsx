import { clsx } from "clsx";

export function ProgressBar({
  value,
  max = 100,
  className,
  variant = "accent",
}: {
  value: number;
  max?: number;
  className?: string;
  variant?: "accent" | "success" | "warning" | "danger";
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors: Record<string, string> = {
    accent: "bg-accent",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  return (
    <div
      className={clsx(
        "h-2 w-full overflow-hidden rounded-full bg-slate-200",
        className,
      )}
    >
      <div
        className={clsx("h-full rounded-full transition-all", variantColors[variant])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
