import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchFeedbackMetric } from "@/lib/feedback-api";
import type {
  RankingData,
  RankingItemAlquilador,
  RankingItemPropietario,
  RankingItemVehiculo,
} from "@/lib/feedback-metrics.types";

// Helpers tipados para importar directamente desde la page
export function getRankingAlquilador(orden = "desc", limit = 5) {
  return fetchFeedbackMetric<RankingData<RankingItemAlquilador>>(
    `/api/metrics/ranking/alquilador?orden=${orden}&limit=${limit}`
  );
}

export function getRankingPropietario(orden = "desc", limit = 5) {
  return fetchFeedbackMetric<RankingData<RankingItemPropietario>>(
    `/api/metrics/ranking/propietario?orden=${orden}&limit=${limit}`
  );
}

export function getRankingVehiculo(orden = "desc", limit = 5) {
  return fetchFeedbackMetric<RankingData<RankingItemVehiculo>>(
    `/api/metrics/ranking/vehiculo?orden=${orden}&limit=${limit}`
  );
}

// GET handler genérico para llamadas externas a /api/metrics/ranking/[tipo]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;
  const sp      = req.nextUrl.searchParams;
  const path    = `/api/metrics/ranking/${tipo}?${sp.toString()}`;
  const result  = await fetchFeedbackMetric(path);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result.data);
}
