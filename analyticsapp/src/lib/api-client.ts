import { auth } from "@clerk/nextjs/server";

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

export async function fetchMetric<T>(
  baseUrl: string,
  path: string,
  searchParams?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return { data: null, error: "No autorizado" };
  }

  const url = new URL(`${baseUrl}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const json = (await res.json()) as ApiResponse<T>;

    if (!res.ok) {
      return { data: null, error: json.error ?? `Respondió ${res.status}` };
    }

    return json;
  } catch {
    return { data: null, error: "No se pudo contactar a la app" };
  }
}