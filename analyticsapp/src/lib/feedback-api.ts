import { auth } from "@clerk/nextjs/server";
import type { ApiResponse } from "@/lib/api-client";

const BASE = process.env.FEEDBACK_METRICS_API_URL!;

export async function fetchFeedbackMetric<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const res = await fetch(`${BASE}${path}`, { 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) return { data: null, error: `Respondió ${res.status}` };
    
    return { data: (await res.json()) as T, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Feedback App" };
  }
}
