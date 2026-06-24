import { NextResponse } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { TiempoModeracion } from "@/lib/feedback-metrics.types";

export function getTiempoModeracion() {
  return fetchFeedbackMetric<TiempoModeracion>("/api/metrics/moderacion-tiempo");
}

export async function GET() {
  const result = await getTiempoModeracion();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
