import { NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { DistribucionMarca } from "@/lib/seller-metrics.types";

export function getDistribucionMarcas() {
  return fetchSellerMetric<DistribucionMarca[]>("/distribucion-marcas");
}

export async function GET() {
  const result = await getDistribucionMarcas();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
