import { clsx } from "clsx";

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  variant = "default",
}: {
  label: string;
  value: string;
  subtitle?: string;
  trend?: { direction: "up" | "down"; pct: number };
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantStyles: Record<string, string> = {
    default: "border-slate-200",
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
  };

  const trendColor = trend?.direction === "up" ? "text-emerald-600" : "text-red-600";
  const trendArrow = trend?.direction === "up" ? "\u2191" : "\u2193";

  return (
    <div
      className={clsx(
        "rounded-xl border p-5",
        variantStyles[variant],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span className={clsx("text-xs font-semibold", trendColor)}>
            {trendArrow} {trend.pct}%
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-slate-500">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
