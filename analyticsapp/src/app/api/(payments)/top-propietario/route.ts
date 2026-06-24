import { NextRequest, NextResponse } from "next/server";
import { fetchPaymentMetric } from "@/lib/payments-api";
import type { PaymentsResumen } from "@/lib/payments-metrics.types";

export function getTopPropietario(desde: string, hasta: string) {
  return fetchPaymentMetric<PaymentsResumen>("/api/analytics/resumen", { desde, hasta });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const result = await getTopPropietario(desde, hasta);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ top_propietario: result.data?.top_propietario });
}
