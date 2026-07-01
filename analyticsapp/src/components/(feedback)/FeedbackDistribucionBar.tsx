"use client";

import type { DistribucionPunto } from "@/lib/feedback-metrics.types";

interface Props {
  data: DistribucionPunto[];
}

const STAR_COLORS: Record<number, string> = {
  5: "hsl(var(--chart-1, 142 76% 36%))", // Verde
  4: "hsl(var(--chart-2, 173 80% 40%))", // Verde azulado
  3: "hsl(var(--chart-3, 48 96% 53%))",  // Amarillo
  2: "hsl(var(--chart-4, 25 95% 53%))",  // Naranja
  1: "hsl(var(--chart-5, 347 77% 50%))", // Rojo
};

export function FeedbackDistribucionBar({ data }: Props) {
  const sorted = [...data].sort((a, b) => Number(b.calificacion) - Number(a.calificacion));
  const max    = Math.max(...sorted.map((d) => Number(d.cantidad)), 1);

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
                width: `${(Number(item.cantidad) / max) * 100}%`,
                backgroundColor: STAR_COLORS[Number(item.calificacion)] ?? "hsl(var(--primary, 222 47% 11%))",
                minWidth: Number(item.cantidad) > 0 ? "4px" : "0",
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