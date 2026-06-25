import { NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { ResumenGeneral } from "@/lib/seller-metrics.types";

export function getResumenGeneral() {
  return fetchSellerMetric<ResumenGeneral>("/resumen-general");
}

export async function GET() {
  const result = await getResumenGeneral();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
