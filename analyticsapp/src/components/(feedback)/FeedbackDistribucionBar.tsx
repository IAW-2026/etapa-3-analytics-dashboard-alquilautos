"use client";

import type { DistribucionPunto } from "@/lib/feedback-metrics.types";

interface Props {
  data: DistribucionPunto[];
}

const STAR_COLORS: Record<number, string> = {
  5: "hsl(var(--chart-1))",
  4: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  2: "hsl(var(--chart-4))",
  1: "hsl(var(--chart-5))",
};

export function FeedbackDistribucionBar({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.calificacion - a.calificacion);
  const max    = Math.max(...sorted.map((d) => d.cantidad), 1);

  return (
    <div className="space-y-3 py-2">
      {sorted.map((item) => (
        <div key={item.calificacion} className="flex items-center gap-3">
          {/* Estrellas label */}
          <span className="text-sm font-medium w-6 text-right text-foreground">
            {item.calificacion}★
          </span>

          {/* Barra */}
          <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${(item.cantidad / max) * 100}%`,
                background: STAR_COLORS[item.calificacion] ?? "hsl(var(--chart-1))",
                minWidth: item.cantidad > 0 ? "4px" : "0",
              }}
            />
          </div>

          {/* Count + porcentaje */}
          <div className="flex gap-1.5 w-24 justify-end">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {item.cantidad}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              ({item.porcentaje}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
