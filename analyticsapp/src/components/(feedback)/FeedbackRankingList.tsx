import type {
  RankingItemAlquilador,
  RankingItemPropietario,
  RankingItemVehiculo,
} from "@/lib/feedback-metrics.types";

type AnyRankingItem =
  | RankingItemAlquilador
  | RankingItemPropietario
  | RankingItemVehiculo;

function getEntityId(item: AnyRankingItem): string {
  if ("nombre_entidad" in item && item.nombre_entidad) return item.nombre_entidad;
  if ("id_alquilador"  in item) return `Alquilador #${item.id_alquilador}`;
  if ("id_propietario" in item) return `Propietario #${item.id_propietario}`;
  if ("id_vehiculo"    in item) return `Vehículo #${item.id_vehiculo}`;
  return "—";
}

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

interface Props {
  items: AnyRankingItem[];
}

export function FeedbackRankingList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Sin datos suficientes para el período
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const prom = item.calificacion_promedio;
        const pct  = ((prom / 5) * 100).toFixed(0);

        return (
          <div key={i} className="flex items-center gap-3 py-1">
            {/* Posición */}
            <span className="text-base w-6 text-center shrink-0">
              {MEDAL[i] ?? <span className="text-sm text-muted-foreground font-mono">{i + 1}</span>}
            </span>

            {/* ID entidad + barra */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {getEntityId(item)}
                </span>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {item.cantidad_resenas} reseña{item.cantidad_resenas !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Calificación */}
            <span className="text-sm font-semibold text-foreground tabular-nums w-10 text-right shrink-0">
              {prom.toFixed(1)}★
            </span>
          </div>
        );
      })}
    </div>
  );
}
