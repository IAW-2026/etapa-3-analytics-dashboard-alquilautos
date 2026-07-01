import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type { CaidaData } from "@/lib/feedback-metrics.types";

const DEFAULT_PARAMS = "dias_reciente=30&umbral=1.0&min_resenas=2";

export function getCaidaAlquilador(params = DEFAULT_PARAMS) {
  return fetchFeedbackMetric<CaidaData>(`/caida/alquilador?${params}`);
}

export function getCaidaPropietario(params = DEFAULT_PARAMS) {
  return fetchFeedbackMetric<CaidaData>(`/caida/propietario?${params}`);
}

export function getCaidaVehiculo(params = DEFAULT_PARAMS) {
  return fetchFeedbackMetric<CaidaData>(`/caida/vehiculo?${params}`);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;
  const sp       = req.nextUrl.searchParams;
  const path     = `/caida/${tipo}?${sp.toString()}`;
  const result   = await fetchFeedbackMetric(path);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
