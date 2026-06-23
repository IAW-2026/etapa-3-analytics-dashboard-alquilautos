"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VehiculoFavoriteado } from "@/lib/buyer-metrics.types";

const COLORS = [
  "#7C3AED",
  "#8B47F0",
  "#9A55F2",
  "#A963F5",
  "#B871F7",
  "#C77FFA",
  "#D68DFC",
  "#E59BFF",
];

function shortNombre(nombre: string) {
  return nombre.length > 18 ? `${nombre.slice(0, 16)}…` : nombre;
}

export function FavoritosTopList({ vehiculos }: { vehiculos: VehiculoFavoriteado[] }) {
  const data = vehiculos
    .slice(0, 8)
    .map((v, i) => ({ nombre: shortNombre(v.nombre), cantidad: v.cantidad, rank: i + 1 }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
          barSize={18}
        >
          <XAxis
            type="number"
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip
            cursor={{ fill: "var(--color-border)", opacity: 0.4 }}
            contentStyle={{
              background: "var(--bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value} guardados`, "Favoritos"]}
          />
          <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={entry.nombre} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList
              dataKey="cantidad"
              position="right"
              style={{ fontSize: 11, fontWeight: 600, fill: "var(--color-foreground)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
