"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export function PaymentsApprovalGauge({ value }: { value: number }) {
  const data = [
    { name: "Aprobado", value },
    { name: "Resto", value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              startAngle={180}
              endAngle={0}
              paddingAngle={0}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#22C55E" />
              <Cell fill="var(--color-border)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-foreground">{value}%</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">aprobacion</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-green-500" />
          Aprobado
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          Rechazado
        </div>
      </div>
    </div>
  );
}
