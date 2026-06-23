import { SectionCard } from "@/components/SectionCard";
import { timeAgo } from "@/lib/format";
import { ActividadRecienteData } from "../lib/seller-metrics.types";


export function ActivityFeed({ data }: { data: ActividadRecienteData }) {
  const items = [
    ...data.pendientes_vencidos.map((r) => ({
      key: `pv-${r.id_reserva}`,
      title: "Reserva Pendiente Vencida",
      detail: r.vehiculo,
      hace: `sin respuesta · ${timeAgo(r.createdAt)}`,
      color: "bg-accent",
    })),
    ...data.ultimas_reservas.map((r) => ({
      key: `ur-${r.id_reserva}`,
      title: `Reserva ${r.estado}`,
      detail: r.vehiculo,
      hace: timeAgo(r.createdAt),
      color: r.estado === "Finalizada" ? "bg-success" : "bg-primary",
    })),
    ...data.nuevos_propietarios.map((p) => ({
      key: `np-${p.id_propietario}`,
      title: "Nuevo Propietario Registrado",
      detail: `${p.nombre} ${p.apellido}`,
      hace: timeAgo(p.createdAt),
      color: "bg-primary-300",
    })),
  ];

  return (
    <SectionCard title="Actividad Reciente" padded={false}>
      <div className="p-4 space-y-5">
        {items.map((i) => (
          <div key={i.key} className="flex gap-4">
            <div className={`size-2 mt-1.5 ${i.color} rounded-full shrink-0`} />
            <div className="min-w-0">
              <p className="text-sm text-foreground font-medium">{i.title}</p>
              <p className="text-xs text-muted-foreground truncate">{i.detail}</p>
              <span className="text-[10px] font-medium text-muted-foreground/70 uppercase mt-1 inline-block">
                {i.hace}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-3 bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest border-t border-border/60 hover:text-foreground transition-colors">
        Ver Historial Completo
      </button>
    </SectionCard>
  );
}