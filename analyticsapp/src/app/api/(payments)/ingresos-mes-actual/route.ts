import { NextRequest, NextResponse } from "next/server";
import { fetchPaymentMetric } from "@/lib/payments-api";
import type { PaymentsResumen } from "@/lib/payments-metrics.types";

export function getIngresosMesActual(desde: string, hasta: string) {
  return fetchPaymentMetric<PaymentsResumen>("/api/analytics/resumen", { desde, hasta });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const result = await getIngresosMesActual(desde, hasta);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({
    ingresos_mes_actual: result.data?.ingresos_mes_actual,
    crecimiento_mensual: result.data?.crecimiento_mensual,
  });
}
