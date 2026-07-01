import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { MasFavoriteados } from "@/lib/buyer-metrics.types";

export function getMasFavoriteados() {
  return fetchBuyerMetric<MasFavoriteados>("/favoritos/mas-favoriteados");
}

export async function GET() {
  const result = await getMasFavoriteados();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
