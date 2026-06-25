import { fetchMetric } from "@/lib/api-client";

const BASE = process.env.SHIPPING_METRICS_API_URL!;

export function fetchShippingMetric<T>(
  path: string,
  params?: Record<string, string>,
) {
  return fetchMetric<T>(BASE, path, params);
}
