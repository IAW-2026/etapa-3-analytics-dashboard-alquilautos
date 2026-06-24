import { NextResponse } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { RechazosEmisorData } from "@/lib/feedback-metrics.types";

export function getRechazosEmisor(minResenas = 2, umbralTasa = 0.5, limit = 10) {
  return fetchFeedbackMetric<RechazosEmisorData>(
    `/api/metrics/rechazos-por-emisor?min_resenas=${minResenas}&umbral_tasa=${umbralTasa}&limit=${limit}`
  );
}

export async function GET() {
  const result = await getRechazosEmisor();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
