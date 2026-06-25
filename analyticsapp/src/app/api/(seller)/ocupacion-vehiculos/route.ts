import { NextRequest, NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { OcupacionVehiculos } from "@/lib/seller-metrics.types";

export function getOcupacionVehiculos(desde: string, hasta: string) {
  return fetchSellerMetric<OcupacionVehiculos>("/ocupacion-vehiculos", { desde, hasta });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";

  const result = await getOcupacionVehiculos(desde, hasta);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
