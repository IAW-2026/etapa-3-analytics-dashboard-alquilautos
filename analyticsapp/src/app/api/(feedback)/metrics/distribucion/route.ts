import { NextResponse } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { DistribucionData } from "@/lib/feedback-metrics.types";

export function getDistribucion() {
  return fetchFeedbackMetric<DistribucionData>("/api/metrics/distribucion");
}

export async function GET() {
  const result = await getDistribucion();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
