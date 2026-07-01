import { NextResponse } from "next/server";
import { fetchSellerMetric } from "@/lib/seller-api";
import type { TasaConversion } from "@/lib/seller-metrics.types";

export function getTasaConversion() {
  return fetchSellerMetric<TasaConversion>("/tasa-conversion");
}

export async function GET() {
  const result = await getTasaConversion();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
