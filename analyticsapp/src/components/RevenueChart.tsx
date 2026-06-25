"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatARS } from "@/lib/format";
import type { IngresoPeriodo } from "@/lib/seller-metrics.types";



export function RevenueChart({ data }: { data: IngresoPeriodo[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A5CFF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1A5CFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="periodo" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => formatARS(Number(value))}
          />
          <Area type="monotone" dataKey="ingresos" stroke="#1A5CFF" strokeWidth={2} fill="url(#gradActual)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}