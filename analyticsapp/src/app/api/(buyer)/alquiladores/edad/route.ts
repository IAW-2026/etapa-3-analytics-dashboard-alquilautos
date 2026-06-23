import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { DistribucionEdad } from "@/lib/buyer-metrics.types";

export function getDistribucionEdad() {
  return fetchBuyerMetric<DistribucionEdad>("/alquiladores/edad");
}

export async function GET() {
  const result = await getDistribucionEdad();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
