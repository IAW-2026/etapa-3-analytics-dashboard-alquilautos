import { NextResponse } from "next/server";
import { getEstadosDistribucion } from "@/app/api/(shipping)/metricas/estados/route";

export async function GET() {
  const result = await getEstadosDistribucion();

  if (result.error) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: result.data,
    error: null,
  });
}
