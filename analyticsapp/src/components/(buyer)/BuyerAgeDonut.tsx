"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DistribucionEdad } from "@/lib/buyer-metrics.types";

const SEGMENTS = [
  { key: "menores_de_25", label: "< 25 años", color: "#1A5CFF" },
  { key: "entre_25_y_40", label: "25–40 años", color: "#5280FF" },
  { key: "mayores_de_40", label: "> 40 años", color: "#93AEFF" },
  { key: "sin_datos", label: "Sin datos", color: "#E5E7EB" },
] as const;

export function BuyerAgeDonut({ data }: { data: DistribucionEdad }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const chartData = SEGMENTS.map(({ key, label, color }) => ({
    name: label,
    value: data[key],
    color,
    pct: total > 0 ? Math.round((data[key] / total) * 100) : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `${value} (${chartData.find((d) => d.name === String(name))?.pct ?? 0}%)`,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-foreground">{total}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {chartData.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2 min-w-0">
            <span className="size-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-muted-foreground truncate">{seg.name}</span>
            <span className="ml-auto text-xs font-medium text-foreground">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
