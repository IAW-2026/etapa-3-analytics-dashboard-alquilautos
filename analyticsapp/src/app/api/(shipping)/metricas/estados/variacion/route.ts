import { NextResponse } from "next/server";
import { fetchShippingMetric } from "@/lib/shipping-api";
import type { VariacionEstadosShipping } from "@/lib/shipping-metrics.types";

export function getEstadosVariacion() {
  return fetchShippingMetric<VariacionEstadosShipping>(
    "/estados/variacion-entregas",
  );
}

export async function GET() {
  const result = await getEstadosVariacion();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
}
