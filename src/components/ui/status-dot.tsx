import { clsx } from "clsx";

type DotStatus = "online" | "offline" | "warning" | "error";

const dotColors: Record<DotStatus, string> = {
  online: "bg-emerald-500",
  offline: "bg-slate-300",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

export function StatusDot({
  status,
  label,
  className,
}: {
  status: DotStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)}>
      <span
        className={clsx(
          "inline-block h-2 w-2 rounded-full",
          dotColors[status],
        )}
      />
      {label && <span className="text-xs text-slate-600">{label}</span>}
    </span>
  );
}
