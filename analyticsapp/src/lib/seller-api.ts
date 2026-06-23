import { fetchMetric } from "@/lib/api-client";

const BASE = process.env.SELLER_METRICS_API_URL!;

export function fetchSellerMetric<T>(path: string, params?: Record<string, string>) {
  return fetchMetric<T>(BASE, path, params);
}