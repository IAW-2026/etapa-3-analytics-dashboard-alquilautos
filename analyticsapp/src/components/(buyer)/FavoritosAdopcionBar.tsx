import type { FavoritosPorUsuario } from "@/lib/buyer-metrics.types";

export function FavoritosAdopcionBar({ data }: { data: FavoritosPorUsuario }) {
  const total = data.con_favoritos + data.sin_favoritos;
  const pct = total > 0 ? (data.con_favoritos / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-muted rounded-lg p-4 text-center ring-1 ring-black/5 dark:ring-white/5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Con favoritos
          </p>
          <span className="text-3xl font-semibold text-[#1A5CFF]">{data.con_favoritos}</span>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-xl font-semibold text-foreground">{pct.toFixed(0)}%</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">adopción</span>
        </div>

        <div className="flex-1 bg-muted rounded-lg p-4 text-center ring-1 ring-black/5 dark:ring-white/5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Sin favoritos
          </p>
          <span className="text-3xl font-semibold text-muted-foreground">{data.sin_favoritos}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#1A5CFF] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {data.con_favoritos} de {total} usuarios guardaron al menos un vehículo
        </p>
      </div>
    </div>
  );
}
