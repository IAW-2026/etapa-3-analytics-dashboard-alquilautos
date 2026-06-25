"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { timeAgo } from "@/lib/format";
import { ActividadRecienteData } from "../lib/seller-metrics.types";

const PAGE_SIZE = 5;

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

  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <SectionCard title="Actividad Reciente" padded={false}>
      <div className="p-4 space-y-5 min-h-[340px]">
        {visible.map((i) => (
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
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sin actividad reciente</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </button>
          <span className="text-[11px] text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground transition-colors"
          >
            Siguiente
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </SectionCard>
  );
}
