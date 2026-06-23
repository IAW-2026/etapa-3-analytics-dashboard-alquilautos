import { NextResponse } from "next/server";
import { fetchBuyerMetric } from "@/lib/buyer-api";
import type { Onboarding } from "@/lib/buyer-metrics.types";

export function getOnboarding() {
  return fetchBuyerMetric<Onboarding>("/alquiladores/onboarding");
}

export async function GET() {
  const result = await getOnboarding();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
