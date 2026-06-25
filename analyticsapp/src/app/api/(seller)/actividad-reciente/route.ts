import { NextRequest, NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { ActividadRecienteData } from "@/lib/seller-metrics.types";

export function getActividadReciente(limit?: string) {
  return fetchSellerMetric<ActividadRecienteData>("/actividad-reciente", limit ? { limit } : undefined);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? undefined;

  const result = await getActividadReciente(limit);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
