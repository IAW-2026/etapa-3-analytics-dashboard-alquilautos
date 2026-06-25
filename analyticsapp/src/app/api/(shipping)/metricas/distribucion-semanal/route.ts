import { NextResponse } from "next/server";
import { fetchShippingMetric } from "@/lib/shipping-api";
import type { DistribucionSemanal } from "@/lib/shipping-metrics.types";

export function getDistribucionSemanal() {
  return fetchShippingMetric<DistribucionSemanal[]>("/distribucion-semanal");
}

export async function GET() {
  const result = await getDistribucionSemanal();

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
