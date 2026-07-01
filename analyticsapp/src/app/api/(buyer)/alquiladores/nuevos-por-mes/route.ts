import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { NuevosPorMes } from "@/lib/buyer-metrics.types";

export function getNuevosPorMes() {
  return fetchBuyerMetric<NuevosPorMes>("/alquiladores/nuevos-por-mes");
}

export async function GET() {
  const result = await getNuevosPorMes();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
