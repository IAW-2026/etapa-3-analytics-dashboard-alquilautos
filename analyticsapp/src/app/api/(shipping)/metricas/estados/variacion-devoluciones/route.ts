import { NextResponse } from "next/server";
import { fetchShippingMetric } from "@/lib/shipping-api";
import type { VariacionEstadosShipping } from "@/lib/shipping-metrics.types";

export function getVariacionDevoluciones() {
  return fetchShippingMetric<VariacionEstadosShipping>(
    "/estados/variacion-devoluciones",
  );
}

export async function GET() {
  const result = await getVariacionDevoluciones();

  if (result.error) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: result.data,
    error: null,
  });
}
