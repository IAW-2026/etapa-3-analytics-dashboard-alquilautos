import { NextResponse } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { ResumenGlobal } from "@/lib/feedback-metrics.types";

export function getResumen() {
  return fetchFeedbackMetric<ResumenGlobal>("/resumen");
}

export async function GET() {
  const result = await getResumen();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
