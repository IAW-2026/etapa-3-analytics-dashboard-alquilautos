import type { CaidaItem, EmisorRechazo } from "@/lib/feedback-metrics.types";

// ── Caída de calificación ─────────────────────────────────

interface AlertasCaidaProps {
  items: CaidaItem[];
  tipo: string;
}

function getEntityLabel(item: CaidaItem): string {
  if (item.id_alquilador)  return `Alquilador #${item.id_alquilador}`;
  if (item.id_propietario) return `Propietario #${item.id_propietario}`;
  if (item.id_vehiculo)    return `Vehículo #${item.id_vehiculo}`;
  return "—";
}

export function FeedbackAlertasCaida({ items, tipo }: AlertasCaidaProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Sin alertas de caída para {tipo}s en el período
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Entidad
            </th>
            <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Histórico
            </th>
            <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Reciente
            </th>
            <th className="text-center py-2 pl-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Caída
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-2.5 pr-4 font-medium text-foreground">
                {getEntityLabel(item)}
                <span className="block text-xs text-muted-foreground font-normal">
                  {item.resenas_historicas} hist. · {item.resenas_recientes} rec.
                </span>
              </td>
              <td className="py-2.5 px-3 text-center tabular-nums text-muted-foreground">
                {item.promedio_historico.toFixed(2)}★
              </td>
              <td className="py-2.5 px-3 text-center tabular-nums text-foreground">
                {item.promedio_reciente.toFixed(2)}★
              </td>
              <td className="py-2.5 pl-3 text-center">
                <span className="inline-flex items-center gap-1 text-destructive font-semibold tabular-nums">
                  ▼ {item.caida.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Rechazos por emisor ───────────────────────────────────

interface AlertasRechazosProps {
  items: EmisorRechazo[];
}

export function FeedbackAlertasRechazos({ items }: AlertasRechazosProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Sin emisores con alta concentración de rechazos
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Emisor
            </th>
            <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total
            </th>
            <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rechazadas
            </th>
            <th className="text-center py-2 pl-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tasa
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-2.5 pr-4 font-medium text-foreground">
                #{item.id_emisor}
              </td>
              <td className="py-2.5 px-3 text-center tabular-nums text-muted-foreground">
                {item.total_resenas}
              </td>
              <td className="py-2.5 px-3 text-center tabular-nums text-foreground">
                {item.resenas_rechazadas}
              </td>
              <td className="py-2.5 pl-3 text-center">
                <span
                  className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                    item.tasa_rechazo >= 75
                      ? "text-destructive"
                      : item.tasa_rechazo >= 50
                        ? "text-orange-500"
                        : "text-yellow-500"
                  }`}
                >
                  {item.tasa_rechazo.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
