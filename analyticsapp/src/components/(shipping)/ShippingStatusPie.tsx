"use client";

import { useRef, useState } from "react";

type StatusItem = {
  name: string;
  value: number;
  color: string;
};

export function ShippingStatusPie({ data }: { data: StatusItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [centerInfo, setCenterInfo] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 110,
    cy = 110,
    R = 95,
    r = 58,
    gap = 0.04;

  function polarToXY(angle: number, radius: number): [number, number] {
    return [
      Math.round((cx + radius * Math.cos(angle)) * 1e6) / 1e6,
      Math.round((cy + radius * Math.sin(angle)) * 1e6) / 1e6,
    ];
  }

  function slicePath(startAngle: number, endAngle: number): string {
    const [x1, y1] = polarToXY(startAngle, R);
    const [x2, y2] = polarToXY(endAngle, R);
    const [x3, y3] = polarToXY(endAngle, r);
    const [x4, y4] = polarToXY(startAngle, r);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  const slices: { path: string; fraction: number }[] = [];
  let currentAngle = -Math.PI / 2;
  data.forEach((d) => {
    const fraction = d.value / total;
    const span = fraction * 2 * Math.PI - gap;
    const start = currentAngle + gap / 2;
    const end = start + span;
    slices.push({ path: slicePath(start, end), fraction });
    currentAngle += fraction * 2 * Math.PI;
  });

  const displayValue = centerInfo?.value ?? total;
  const displayLabel = centerInfo?.label ?? "total";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* DONUT — más grande */}
      <div className="relative w-[220px] h-[220px] mx-auto sm:mx-0 flex-shrink-0">
        <svg
          ref={svgRef}
          viewBox="0 0 220 220"
          width={220}
          height={220}
          role="img"
          aria-label="Gráfico de dona con estados de envío"
        >
          {slices.map((slice, i) => (
            <path
              key={data[i].name}
              d={slice.path}
              fill={data[i].color}
              style={{
                opacity: hovered === null || hovered === i ? 1 : 0.35,
                transform: hovered === i ? "scale(1.03)" : "scale(1)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: "opacity 0.15s, transform 0.15s",
                cursor: "pointer",
              }}
              onMouseMove={(e) => {
                setHovered(i);
                setCenterInfo({ value: data[i].value, label: data[i].name });
                setTooltip({
                  x: e.clientX + 14,
                  y: e.clientY - 28,
                  text: `${data[i].name}: ${data[i].value.toLocaleString()} (${(slice.fraction * 100).toFixed(1)}%)`,
                });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setCenterInfo(null);
                setTooltip(null);
              }}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-medium text-foreground leading-none">
            {displayValue.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {displayLabel}
          </span>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-lg px-3 py-1.5 text-xs text-popover-foreground pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Leyenda — ocupa todo el espacio restante, filas más densas */}
      <div className="flex-1 sm:border-l sm:border-border sm:pl-6">
        <div className="border-t border-border sm:hidden mb-3" />
        <div className="divide-y divide-border/50">
          {data.map((entry, i) => (
            <div
              key={entry.name}
              className="flex items-center gap-3 py-2.5 px-2 rounded-md cursor-pointer hover:bg-muted/40 transition-colors"
              onMouseEnter={() => {
                setHovered(i);
                setCenterInfo({ value: entry.value, label: entry.name });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setCenterInfo(null);
              }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground flex-1">
                {entry.name}
              </span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {entry.value.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
                {((entry.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
