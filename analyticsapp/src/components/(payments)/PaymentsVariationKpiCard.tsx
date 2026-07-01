import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Variation = number | undefined;

function variationTone(variation: Variation) {
  if (variation === undefined)
    return "text-slate-600 bg-slate-100 ring-slate-200";
  if (variation >= 0) return "text-emerald-600 bg-emerald-50 ring-emerald-200";
  return "text-rose-600 bg-rose-50 ring-rose-200";
}

function VariationIcon({ variation }: { variation: Variation }) {
  if (variation === undefined)
    return <Minus className="size-3.5 shrink-0" strokeWidth={2.5} />;
  return variation >= 0 ? (
    <ChevronUp className="size-3.5 shrink-0" strokeWidth={2.75} />
  ) : (
    <ChevronDown className="size-3.5 shrink-0" strokeWidth={2.75} />
  );
}

export function PaymentsVariationKpiCard({
  title,
  value,
  subtitle,
  variation,
  variationLabel: customVariationLabel,
  icon: Icon,
  iconTone = "bg-primary/10 text-primary ring-primary/15",
}: {
  title: string;
  value: number | string;
  subtitle: string;
  variation?: number;
  variationLabel?: string;
  icon: LucideIcon;
  iconTone?: string;
}) {
  const tone = variationTone(variation);
  const variationLabel =
    customVariationLabel ??
    (variation === undefined
      ? "—"
      : `${variation >= 0 ? "+" : ""}${variation.toFixed(1)}%`);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-card p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/5 min-h-[160px] flex flex-col">
      <div
        className={`absolute right-5 top-5 grid size-10 place-items-center rounded-2xl ring-1 ${iconTone}`}
      >
        <Icon className="size-5" strokeWidth={2.1} />
      </div>

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground pr-16 min-h-[2rem]">
        {title}
      </p>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="text-[2.6rem] font-semibold leading-none tracking-tight text-foreground">
            {value}
          </div>
          <p className="mt-2.5 text-sm font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="mt-3 min-h-[32px] flex items-end">
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ring-1 ${tone}`}
          >
            <VariationIcon variation={variation} />
            <span
              className={`text-sm font-semibold ${variation === undefined ? "text-slate-600" : variation >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {variationLabel}
            </span>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              vs mes anterior
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
