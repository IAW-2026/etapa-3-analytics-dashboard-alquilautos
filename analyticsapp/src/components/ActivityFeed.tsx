import { SectionCard } from "@/components/SectionCard";
import { timeAgo } from "@/lib/format";
import { ActividadRecienteData } from "../lib/seller-metrics.types";


export function ActivityFeed({ data }: { data: ActividadRecienteData }) {
  const items = [
    ...data.ultimas_reservas.map((r) => ({
      key: `ur-${r.id_reserva}`,
      title: `Reserva ${r.estado}`,
      detail: r.vehiculo,
      createdAt: r.createdAt,
      color: r.estado === "Finalizada" ? "bg-success" : "bg-primary",
    })),
    ...data.nuevos_propietarios.map((p) => ({
      key: `np-${p.id_propietario}`,
      title: "Nuevo Propietario Registrado",
      detail: `${p.nombre} ${p.apellido}`,
      createdAt: p.createdAt,
      color: "bg-primary-300",
    })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

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
                {timeAgo(i.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}