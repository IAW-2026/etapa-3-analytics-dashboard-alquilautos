type Trend = "up" | "down" | "neutral";

export function KpiCard({
  label,
  value,
  unit,
  delta,
  trend = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  trend?: Trend;
}) {
  const trendCls =
    trend === "up"
      ? "text-success bg-success/10"
      : trend === "down"
        ? "text-danger bg-danger/10"
        : "text-muted-foreground bg-muted";
  return (
    <div className="bg-card p-5 rounded-xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <h3 className="text-2xl font-semibold text-foreground">
          {value}
          {unit && <span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>}
        </h3>
        {delta && <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trendCls}`}>{delta}</span>}
      </div>
    </div>
  );
}