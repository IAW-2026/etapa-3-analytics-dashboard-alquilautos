import type { ApiResponse } from "@/lib/api-client";

const BASE = process.env.BUYER_METRICS_API_URL!;

export async function fetchBuyerMetric<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return { data: null, error: `Respondió ${res.status}` };
    return { data: (await res.json()) as T, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Buyer App" };
  }
}
