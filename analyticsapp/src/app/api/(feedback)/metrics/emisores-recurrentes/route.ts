import { NextResponse } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { EmisoresRecurrentesData } from "@/lib/feedback-metrics.types";

export function getEmisoresRecurrentes(minResenas = 3, limit = 10) {
  return fetchFeedbackMetric<EmisoresRecurrentesData>(
    `/emisores-recurrentes?min_resenas=${minResenas}&limit=${limit}`
  );
}

export async function GET() {
  const result = await getEmisoresRecurrentes();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
