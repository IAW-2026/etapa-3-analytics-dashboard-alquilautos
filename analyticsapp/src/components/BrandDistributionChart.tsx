"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatARS, formatNumber } from "@/lib/format";
import type { DistribucionMarca } from "@/lib/seller-metrics.types";

const BRAND_COLORS = ["#1A5CFF", "#0040CC", "#5280FF", "#F59E0B", "#16A34A", "#94A3B8"];

export function BrandDistributionChart({ data }: { data: DistribucionMarca[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="marca" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) =>
              name === "ingresos_totales" ? formatARS(Number(value)) : formatNumber(Number(value))
            }
          />
          <Bar dataKey="cantidad_vehiculos" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}