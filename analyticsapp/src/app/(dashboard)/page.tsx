import { fetchSellerMetric } from "@/lib/seller-api";
import { getTotalAlquiladores } from "@/app/api/(buyer)/alquiladores/total/route";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { RevenueChart } from "@/components/RevenueChart";
import { EcosystemCards } from "@/components/EcosystemCards";
import { ActivityFeed } from "@/components/ActivityFeed";
import { formatARS, formatNumber } from "@/lib/format";
import type {
  ResumenGeneral,
  TasaConversion,
  VehiculoTop,
  OcupacionVehiculos,
  IngresoPeriodo,
  ActividadRecienteData,
} from "@/lib/seller-metrics.types";
import { getDistribucionSemanal } from "@/app/api/(shipping)/metricas/distribucion-semanal/route";

function rangoMesActual() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(desde), hasta: fmt(hasta) };
}

export default async function OverviewPage() {
  const { desde, hasta } = rangoMesActual();

  const [
    resumenRes,
    tasaRes,
    topRes,
    ingresosRes,
    actividadRes,
    ocupacionRes,
    totalAlquiladoresRes,
    distribucionSemanalRes,
  ] = await Promise.all([
    fetchSellerMetric<ResumenGeneral>("/resumen-general"),
    fetchSellerMetric<TasaConversion>("/tasa-conversion"),
    fetchSellerMetric<VehiculoTop[]>("/vehiculos-top", { limit: "5" }),
    fetchSellerMetric<IngresoPeriodo[]>("/ingresos-por-periodo", {
      granularity: "month",
    }),
    fetchSellerMetric<ActividadRecienteData>("/actividad-reciente", {
      limit: "5",
    }),
    fetchSellerMetric<OcupacionVehiculos>("/ocupacion-vehiculos", {
      desde,
      hasta,
    }),
    getTotalAlquiladores(),
    getDistribucionSemanal(),
  ]);

  const resumen = resumenRes.data;
  const tasa = tasaRes.data;
  const totalAlquiladores = totalAlquiladoresRes.data;
  const top = topRes.data ?? [];
  const ingresos = ingresosRes.data ?? [];
  const actividad = actividadRes.data;
  const ocupacion = ocupacionRes.data;
  const distribucion = distribucionSemanalRes.data ?? [];
  const diaMasEntregas =
    distribucion.length > 0
      ? (() => {
          const maxPorcentaje = Math.max(
            ...distribucion.map((d) => d.entregas),
          );

          const dias = distribucion
            .filter((d) => d.entregas === maxPorcentaje)
            .map((d) => d.day)
            .join("/");

          return {
            day: dias,
            entregas: maxPorcentaje,
          };
        })()
      : null;

  const hayErrorCritico = resumenRes.error && tasaRes.error;

  return (
    <>
      <PageHeader
        title="Resumen General"
        description="Panel consolidado de métricas operativas del ecosistema AlquilAutos."
      />

      {hayErrorCritico && (
        <div className="mb-6 p-4 rounded-lg bg-danger/10 text-danger text-sm">
          No se pudo conectar con Seller App. {resumenRes.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Ingresos Totales"
          value={resumen ? formatARS(resumen.ingresos_totales_ars) : "—"}
          unit="ARS"
        />
        <KpiCard
          label="Reservas Totales"
          value={resumen ? formatNumber(resumen.reservas.total) : "—"}
        />
        <KpiCard
          label="Tasa de Finalización"
          value={tasa ? `${tasa.tasa_conversion}%` : "—"}
        />
        <KpiCard
          label="Alquiladores Totales"
          value={totalAlquiladores ? String(totalAlquiladores.total) : "—"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <SectionCard title="Tendencia de Ingresos">
            <RevenueChart data={ingresos} />
          </SectionCard>

          <SectionCard title="Top Vehículos (Seller App)" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Vehículo</th>
                    <th className="px-6 py-3">Alquileres</th>
                    <th className="px-6 py-3 text-right">Ingresos (ARS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {top.map((v) => (
                    <tr
                      key={v.id_vehiculo}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-muted rounded-md ring-1 ring-border/60" />
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {v.marca} {v.modelo}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {v.anio}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {v.cantidad_alquileres}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground text-right font-medium">
                        {formatARS(v.ingresos_generados)}
                      </td>
                    </tr>
                  ))}
                  {top.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-sm text-muted-foreground"
                      >
                        Sin datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <EcosystemCards
            sellerStats={{
              propietarios: resumen?.total_propietarios ?? 0,
              ocupacionPromedio: ocupacion?.ocupacion_promedio_plataforma ?? 0,
            }}
            buyerStats={{ total: totalAlquiladores?.total ?? 0 }}
            shippingStats={{
              dia: diaMasEntregas?.day ?? "—",
              porcentaje: diaMasEntregas?.entregas ?? 0,
            }}
          />
          {actividad && <ActivityFeed data={actividad} />}
        </div>
      </div>
    </>
  );
}
