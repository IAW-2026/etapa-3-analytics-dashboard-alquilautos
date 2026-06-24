"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { TendenciaPunto } from "@/lib/feedback-metrics.types";

interface Props {
  data: TendenciaPunto[];
}

export function FeedbackTendenciaChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="periodo"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          allowDecimals={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 5]}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          formatter={(value: any, name: any) =>
            name === "Promedio (★)" && typeof value === "number" ? [`${value.toFixed(2)} ★`, name] : [value ?? "", name]
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="left"
          dataKey="cantidad_resenas"
          name="Reseñas"
          fill="hsl(var(--chart-1))"
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="calificacion_promedio"
          name="Promedio (★)"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
