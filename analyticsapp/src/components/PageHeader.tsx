import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="text-muted-foreground mt-1 max-w-[60ch] text-pretty">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function PeriodToggle({
  value,
  onChange,
  options = ["Mes", "Semana", "Día"],
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg ring-1 ring-black/5 dark:ring-white/5 w-fit">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={
              active
                ? "px-3 py-1 text-xs font-medium bg-card text-foreground rounded-md shadow-sm"
                : "px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}