import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { PromedioFavoritos } from "@/lib/buyer-metrics.types";

export function getPromedioFavoritos() {
  return fetchBuyerMetric<PromedioFavoritos>("/favoritos/promedio");
}

export async function GET() {
  const result = await getPromedioFavoritos();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
