import type { Metadata } from "next";
import { fetchPaymentMetric } from "@/lib/payments-api";
import type { PaymentsResumen } from "@/lib/payments-metrics.types";
import { DollarSign, Receipt, TrendingUp, CreditCard, CalendarCheck, Repeat, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { PaymentsApprovalGauge } from "@/components/(payments)/PaymentsApprovalGauge";
import { PaymentsStatusPie } from "@/components/(payments)/PaymentsStatusPie";
import { PaymentsTopPropietarioCard } from "@/components/(payments)/PaymentsTopPropietarioCard";
import { PaymentsKpiCard } from "@/components/(payments)/PaymentsKpiCard";
import { PaymentsVariationKpiCard } from "@/components/(payments)/PaymentsVariationKpiCard";
import { formatARS, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Payments · AlquilAutos Analytics",
  description: "Métricas de procesamiento de pagos y payouts.",
};

function rangoMesActual() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(desde), hasta: fmt(hasta) };
}

export default async function PaymentsPage() {
  const { desde, hasta } = rangoMesActual();

  const result = await fetchPaymentMetric<PaymentsResumen>(
    "/api/analytics/resumen",
    { desde, hasta },
  );

  const data = result.data;

  return (
    <>
      <PageHeader
        title="Payments App"
        description="Procesamiento de pagos, payouts a propietarios y métodos de pago."
      />

      {result.error && (
        <div className="mb-6 p-4 rounded-lg bg-danger/10 text-danger text-sm">
          No se pudo conectar con Payments App. {result.error}
        </div>
      )}

      {/* KPIs — Fila 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PaymentsKpiCard
          title="Ventas Totales"
          value={data ? formatARS(data.ventas_totales) : "—"}
          subtitle="ARS"
          icon={DollarSign}
          iconTone="bg-blue-500/10 text-blue-600 ring-blue-500/15"
        />
        <PaymentsKpiCard
          title="Ticket Promedio"
          value={data ? formatARS(data.ticket_promedio) : "—"}
          subtitle="ARS"
          icon={Receipt}
          iconTone="bg-purple-500/10 text-purple-600 ring-purple-500/15"
        />
        <PaymentsVariationKpiCard
          title="Ingresos Mes Actual"
          value={data ? formatARS(data.ingresos_mes_actual) : "—"}
          subtitle="ARS"
          variation={data ? data.crecimiento_mensual : undefined}
          icon={TrendingUp}
          iconTone="bg-emerald-500/10 text-emerald-600 ring-emerald-500/15"
        />
        <PaymentsKpiCard
          title="Pagos Totales"
          value={data ? formatNumber(data.pagos_totales) : "—"}
          subtitle="Transacciones"
          icon={CreditCard}
          iconTone="bg-orange-500/10 text-orange-600 ring-orange-500/15"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-5">
          <SectionCard title="Tasa de Aprobación">
            {data ? (
              <PaymentsApprovalGauge value={data.tasa_aprobacion} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de aprobación</p>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-3">
          <SectionCard title="Estado de Pagos">
            {data ? (
              <PaymentsStatusPie
                pendientes={data.pendientes}
                cancelados={data.cancelados}
                pagos_hoy={data.pagos_hoy}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de pagos</p>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <PaymentsKpiCard
            title="Pagos Hoy"
            value={data ? String(data.pagos_hoy) : "—"}
            subtitle="Procesados hoy"
            icon={CalendarCheck}
            iconTone="bg-indigo-500/10 text-indigo-600 ring-indigo-500/15"
          />
          <PaymentsKpiCard
            title="Alquiladores Recurrentes"
            value={data ? `${data.alquiladores_recurrentes}%` : "—"}
            subtitle="Tasa de recurrencia"
            icon={Repeat}
            iconTone="bg-teal-500/10 text-teal-600 ring-teal-500/15"
          />
          <PaymentsKpiCard
            title="Propietarios Activos"
            value={data ? String(data.propietarios_activos) : "—"}
            subtitle="Con pagos este mes"
            icon={Users}
            iconTone="bg-amber-500/10 text-amber-600 ring-amber-500/15"
          />
        </div>
      </div>

      {/* Top Propietario */}
      <SectionCard title="Top Propietario">
        <PaymentsTopPropietarioCard data={data?.top_propietario ?? null} />
      </SectionCard>
    </>
  );
}
