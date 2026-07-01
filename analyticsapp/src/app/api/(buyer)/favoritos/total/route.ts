import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { TotalFavoritos } from "@/lib/buyer-metrics.types";

export function getTotalFavoritos() {
  return fetchBuyerMetric<TotalFavoritos>("/favoritos/total");
}

export async function GET() {
  const result = await getTotalFavoritos();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
