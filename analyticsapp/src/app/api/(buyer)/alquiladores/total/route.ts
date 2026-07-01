import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { TotalAlquiladores } from "@/lib/buyer-metrics.types";

export function getTotalAlquiladores() {
  return fetchBuyerMetric<TotalAlquiladores>("/alquiladores/total");
}

export async function GET() {
  const result = await getTotalAlquiladores();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
