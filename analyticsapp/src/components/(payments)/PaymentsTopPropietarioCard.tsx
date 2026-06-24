import { formatARS, formatNumber } from "@/lib/format";

export function PaymentsTopPropietarioCard({
  data,
}: {
  data: { id: string; ventas: number; monto: number } | null;
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Sin datos de propietario destacado
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="flex items-center gap-4">
        <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-lg font-bold text-primary">
          {data.id.slice(-3).toUpperCase()}
        </div>
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Propietario</p>
          <p className="text-sm font-medium text-foreground font-mono">{data.id}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ventas</p>
        <p className="text-xl font-semibold text-foreground">{formatNumber(data.ventas)}</p>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Monto total</p>
        <p className="text-xl font-semibold text-foreground">{formatARS(data.monto)}</p>
      </div>
    </div>
  );
}
