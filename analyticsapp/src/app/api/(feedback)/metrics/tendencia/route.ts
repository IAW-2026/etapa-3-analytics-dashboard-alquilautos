import { NextResponse } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { TendenciaData } from "@/lib/feedback-metrics.types";

export function getTendencia(granularidad = "mes", cantidad = 12) {
  return fetchFeedbackMetric<TendenciaData>(
    `/api/metrics/tendencia?granularidad=${granularidad}&cantidad=${cantidad}`
  );
}

export async function GET() {
  const result = await getTendencia();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
