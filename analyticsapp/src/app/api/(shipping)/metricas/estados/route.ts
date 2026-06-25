import { NextResponse } from "next/server";
import { fetchShippingMetric } from "@/lib/shipping-api";
import type {
  EstadoDistribucionShipping,
  EstadosShipping,
} from "@/lib/shipping-metrics.types";

export function getEstadosShipping() {
  return fetchShippingMetric<EstadosShipping>("/estados");
}

export function getEstadosDistribucion() {
  return fetchShippingMetric<EstadoDistribucionShipping[]>(
    "/estados/distribucion",
  );
}

export async function GET() {
  const result = await getEstadosShipping();

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
