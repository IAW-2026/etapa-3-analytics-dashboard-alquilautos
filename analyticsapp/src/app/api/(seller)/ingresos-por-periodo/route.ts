import { NextRequest, NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { IngresoPeriodo } from "@/lib/seller-metrics.types";

export function getIngresosPorPeriodo(params?: { granularity?: string; desde?: string; hasta?: string }) {
  const query: Record<string, string> = {};
  if (params?.granularity) query.granularity = params.granularity;
  if (params?.desde) query.desde = params.desde;
  if (params?.hasta) query.hasta = params.hasta;

  return fetchSellerMetric<IngresoPeriodo[]>(
    "/ingresos-por-periodo",
    Object.keys(query).length ? query : undefined,
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const result = await getIngresosPorPeriodo({
    granularity: searchParams.get("granularity") ?? undefined,
    desde: searchParams.get("desde") ?? undefined,
    hasta: searchParams.get("hasta") ?? undefined,
  });
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
