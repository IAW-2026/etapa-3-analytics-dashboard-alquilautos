"use client";

import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistribucionSemanal } from "@/lib/shipping-metrics.types";

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const unique = payload.filter(
    (entry: any, idx: number, arr: any[]) =>
      arr.findIndex((e) => e.dataKey === entry.dataKey) === idx,
  );
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-md text-xs space-y-1.5">
      <p className="font-semibold text-foreground">{label}</p>
      {unique.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === "entregas" ? "Entregas" : "Devoluciones"}
          </span>
          <span className="ml-auto font-medium text-foreground pl-4">
            {formatPct(Number(entry.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ShippingWeeklyDistributionChart({
  data,
}: {
  data: DistribucionSemanal[];
}) {
  return (
    <div className="space-y-4">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradEntregas" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.03}
                />
              </linearGradient>
              <linearGradient id="gradDevoluciones" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-accent)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-accent)"
                  stopOpacity={0.03}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "var(--color-muted-foreground)" }}
              width={36}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--color-border)", strokeWidth: 1.5 }}
            />

            <Line
              dataKey="entregas"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "var(--color-primary)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 0 }}
              type="monotone"
            />
            <Area
              dataKey="entregas"
              fill="url(#gradEntregas)"
              stroke="none"
              type="monotone"
            />
            <Line
              dataKey="devoluciones"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "var(--color-accent)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--color-accent)", strokeWidth: 0 }}
              type="monotone"
            />
            <Area
              dataKey="devoluciones"
              fill="url(#gradDevoluciones)"
              stroke="none"
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          <span>Entregas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-accent" />
          <span>Devoluciones</span>
        </div>
        <span>Dom → Sáb</span>
      </div>
    </div>
  );
}
