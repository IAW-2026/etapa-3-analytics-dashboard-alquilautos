import { NextRequest, NextResponse } from "next/server";
import { fetchPaymentMetric } from "@/lib/payments-api";
import type { PaymentsResumen } from "@/lib/payments-metrics.types";

export function getTicketPromedio(desde: string, hasta: string) {
  return fetchPaymentMetric<PaymentsResumen>("/api/analytics/resumen", { desde, hasta });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const result = await getTicketPromedio(desde, hasta);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ticket_promedio: result.data?.ticket_promedio });
}
