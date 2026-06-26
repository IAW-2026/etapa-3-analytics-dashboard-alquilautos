import { fetchSellerMetric } from "@/lib/seller-api";
import { fetchPaymentMetric } from "@/lib/payments-api";
import { getTotalAlquiladores } from "@/app/api/(buyer)/alquiladores/total/route";
import { getResumen } from "@/app/api/(feedback)/metrics/resumen/route";
import {
  getRankingPropietario,
  getRankingVehiculo,
} from "@/app/api/(feedback)/metrics/ranking/[tipo]/route";
import {
  getCaidaAlquilador,
  getCaidaPropietario,
  getCaidaVehiculo,
} from "@/app/api/(feedback)/metrics/caida/[tipo]/route";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { RevenueChart } from "@/components/RevenueChart";
import { EcosystemCards } from "@/components/EcosystemCards";
import { ActivityFeed } from "@/components/ActivityFeed";
import { PaymentsApprovalGauge } from "@/components/(payments)/PaymentsApprovalGauge";
import { PaymentsStatusPie } from "@/components/(payments)/PaymentsStatusPie";
import { FeedbackRankingList } from "@/components/(feedback)/FeedbackRankingList";
import { FeedbackAlertasCaida } from "@/components/(feedback)/FeedbackAlertas";
import { formatARS, formatNumber } from "@/lib/format";
import type {
  ResumenGeneral,
  TasaConversion,
  VehiculoTop,
  OcupacionVehiculos,
  IngresoPeriodo,
  ActividadRecienteData,
} from "@/lib/seller-metrics.types";
import type { PaymentsResumen } from "@/lib/payments-metrics.types";
import { getDistribucionSemanal } from "../api/(shipping)/metricas/distribucion-semanal/route";

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
    paymentsRes,
    fbResumenRes,
    rankPropRes,
    rankVehRes,
    caidaAlqRes,
    caidaPropRes,
    caidaVehRes,
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
    fetchPaymentMetric<PaymentsResumen>("/api/analytics/resumen", {
      desde,
      hasta,
    }),
    getResumen(),
    getRankingPropietario("desc", 5),
    getRankingVehiculo("desc", 5),
    getCaidaAlquilador(),
    getCaidaPropietario(),
    getCaidaVehiculo(),
    getDistribucionSemanal(),
  ]);

  const resumen = resumenRes.data;
  const tasa = tasaRes.data;
  const totalAlquiladores = totalAlquiladoresRes.data;
  const top = topRes.data ?? [];
  const ingresos = ingresosRes.data ?? [];
  const actividad = actividadRes.data;
  const ocupacion = ocupacionRes.data;
  const paymentsData = paymentsRes.data;
  const fbResumen = fbResumenRes.data;
  const rankProp = rankPropRes.data?.ranking ?? [];
  const rankVeh = rankVehRes.data?.ranking ?? [];
  const caidasTodas = [
    ...(caidaAlqRes.data?.entidades_con_caida ?? []),
    ...(caidaPropRes.data?.entidades_con_caida ?? []),
    ...(caidaVehRes.data?.entidades_con_caida ?? []),
  ].sort((a, b) => b.caida - a.caida);
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {v.marca} {v.modelo}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {v.anio}
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

          {/* Sección de Pagos */}
          {paymentsData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <SectionCard title="Tasa de Aprobación">
                <PaymentsApprovalGauge value={paymentsData.tasa_aprobacion} />
              </SectionCard>
              <SectionCard title="Estado de Pagos">
                <PaymentsStatusPie
                  pendientes={paymentsData.pendientes}
                  cancelados={paymentsData.cancelados}
                  pagos_hoy={paymentsData.pagos_hoy}
                />
              </SectionCard>
            </div>
          )}

          {/* Sección de Rankings (Feedback) */}
          {(rankProp.length > 0 || rankVeh.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {rankProp.length > 0 && (
                <SectionCard title="Top propietarios (Feedback)">
                  <FeedbackRankingList items={rankProp} />
                </SectionCard>
              )}
              {rankVeh.length > 0 && (
                <SectionCard title="Top vehículos (Feedback)">
                  <FeedbackRankingList items={rankVeh} />
                </SectionCard>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <EcosystemCards
            sellerStats={{
              propietarios: resumen?.total_propietarios ?? 0,
              ocupacionPromedio: ocupacion?.ocupacion_promedio_plataforma ?? 0,
            }}
            buyerStats={{ total: totalAlquiladores?.total ?? 0 }}
            paymentsStats={{ recaudadoHoy: paymentsData?.pagos_hoy ?? 0 }}
            feedbackStats={
              fbResumen
                ? {
                    resenas: fbResumen.total_resenas,
                    calificacion: fbResumen.calificacion_promedio_global,
                  }
                : undefined
            }
            shippingStats={{
              dia: diaMasEntregas?.day ?? "—",
              porcentaje: diaMasEntregas?.entregas ?? 0,
            }}
          />
          <SectionCard
            title="Entidades con caída brusca"
            description="Calificación reciente vs. histórico (Feedback App)"
          >
            <FeedbackAlertasCaida items={caidasTodas} tipo="entidad" />
          </SectionCard>
          {actividad && <ActivityFeed data={actividad} />}
        </div>
      </div>
    </>
  );
}
