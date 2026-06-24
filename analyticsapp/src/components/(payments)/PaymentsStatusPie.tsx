"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const SEGMENTS = [
  { key: "pendientes", label: "Pendientes", color: "#F59E0B" },
  { key: "cancelados", label: "Cancelados", color: "#EF4444" },
  { key: "pagos_hoy", label: "Pagos hoy", color: "#3B82F6" },
] as const;

export function PaymentsStatusPie({
  pendientes,
  cancelados,
  pagos_hoy,
}: {
  pendientes: number;
  cancelados: number;
  pagos_hoy: number;
}) {
  const total = pendientes + cancelados + pagos_hoy;

  const chartData = SEGMENTS.map(({ key, label, color }) => ({
    name: label,
    value: key === "pendientes" ? pendientes : key === "cancelados" ? cancelados : pagos_hoy,
    color,
    pct: total > 0 ? Math.round(((key === "pendientes" ? pendientes : key === "cancelados" ? cancelados : pagos_hoy) / total) * 100) : 0,
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
              formatter={(value, name) => [`${value} (${chartData.find((d) => d.name === String(name))?.pct ?? 0}%)`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-foreground">{total}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">total</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {chartData.map((seg) => (
          <div key={seg.name} className="flex flex-col items-center gap-1">
            <span className="size-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{seg.name}</span>
            <span className="text-xs font-medium text-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
