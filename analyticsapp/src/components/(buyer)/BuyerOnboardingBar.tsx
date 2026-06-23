import type { Onboarding } from "@/lib/buyer-metrics.types";

export function BuyerOnboardingBar({ data }: { data: Onboarding }) {
  const total = data.completo + data.pendiente;
  const pctCompleto = total > 0 ? (data.completo / total) * 100 : 0;
  const pctPendiente = 100 - pctCompleto;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Completo
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-foreground">{data.completo}</span>
            <span className="text-sm text-emerald-500 font-medium">{pctCompleto.toFixed(0)}%</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Total registrados
          </p>
          <span className="text-xl font-semibold text-foreground">{total}</span>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Pendiente
          </p>
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-sm text-amber-500 font-medium">{pctPendiente.toFixed(0)}%</span>
            <span className="text-3xl font-semibold text-foreground">{data.pendiente}</span>
          </div>
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${pctCompleto}%` }}
        />
        <div
          className="absolute inset-y-0 rounded-full bg-amber-400 transition-all duration-700"
          style={{ left: `${pctCompleto}%`, right: 0 }}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Onboarding completo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="text-xs text-muted-foreground">Onboarding pendiente</span>
        </div>
      </div>
    </div>
  );
}
