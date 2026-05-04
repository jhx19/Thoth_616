import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative bg-card border border-line rounded-card shadow-card px-5 py-4 border-l-2 border-l-magenta",
        className
      )}
    >
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-[28px] leading-tight font-semibold text-ink">
        {value}
      </div>
    </div>
  );
}
