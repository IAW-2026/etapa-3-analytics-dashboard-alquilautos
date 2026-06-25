import { NextRequest, NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { VehiculoTop } from "@/lib/seller-metrics.types";

export function getVehiculosTop(limit?: string) {
  return fetchSellerMetric<VehiculoTop[]>("/vehiculos-top", limit ? { limit } : undefined);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? undefined;

  const result = await getVehiculosTop(limit);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
