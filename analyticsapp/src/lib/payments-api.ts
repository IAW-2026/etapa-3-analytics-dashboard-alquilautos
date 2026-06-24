import type { ApiResponse } from "@/lib/api-client";

const BASE = process.env.PAYMENTS_API_URL!;

export async function fetchPaymentMetric<T>(
  path: string,
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    const url = new URL(`${BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { data: null, error: `Respondió ${res.status}` };
    return { data: (await res.json()) as T, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Payments App" };
  }
}
