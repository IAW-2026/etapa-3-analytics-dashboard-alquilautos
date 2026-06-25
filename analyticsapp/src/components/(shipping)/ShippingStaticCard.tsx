import type { LucideIcon } from "lucide-react";
import { Minus } from "lucide-react";

export function ShippingStaticCard({
  title,
  value,
  subtitle,
  note,
  icon: Icon,
  iconTone = "bg-amber-500/10 text-amber-600 ring-amber-500/15",
}: {
  title: string;
  value: number | string;
  subtitle: string;
  note?: string;
  icon: LucideIcon;
  iconTone?: string;
}) {
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
          {note && (
            <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ring-1 text-slate-600 bg-slate-100 ring-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:ring-slate-700">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {note}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
