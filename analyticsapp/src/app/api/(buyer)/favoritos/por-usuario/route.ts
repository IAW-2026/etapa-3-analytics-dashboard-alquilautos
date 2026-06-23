import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { FavoritosPorUsuario } from "@/lib/buyer-metrics.types";

export function getFavoritosPorUsuario() {
  return fetchBuyerMetric<FavoritosPorUsuario>("/favoritos/por-usuario");
}

export async function GET() {
  const result = await getFavoritosPorUsuario();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
