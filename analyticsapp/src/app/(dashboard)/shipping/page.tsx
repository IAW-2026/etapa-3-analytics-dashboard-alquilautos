import type { Metadata } from "next";
import { Clock3, RotateCcw, Truck, XCircle } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { ShippingWeeklyDistributionChart } from "@/components/(shipping)/ShippingWeeklyDistributionChart";
import { ShippingVariationCard } from "@/components/(shipping)/ShippingVariationCard";
import { ShippingStaticCard } from "@/components/(shipping)/ShippingStaticCard";
import { getDistribucionSemanal } from "@/app/api/(shipping)/metricas/distribucion-semanal/route";
import {
  getEstadosDistribucion,
  getEstadosShipping,
} from "@/app/api/(shipping)/metricas/estados/route";
import { getEstadosVariacion } from "@/app/api/(shipping)/metricas/estados/variacion/route";
import { getVariacionDevoluciones } from "@/app/api/(shipping)/metricas/estados/variacion-devoluciones/route";

export const metadata: Metadata = {
  title: "Shipping · AlquilAutos Analytics",
  description: "Métricas operativas de Shipping App.",
};

export default async function ShippingPage() {
  const [
    weeklyRes,
    statesRes,
    distribucionRes,
    variacionRes,
    variacionDevolucionesRes,
  ] = await Promise.all([
    getDistribucionSemanal(),
    getEstadosShipping(),
    getEstadosDistribucion(),
    getEstadosVariacion(),
    getVariacionDevoluciones(),
  ]);

  const weekly = weeklyRes.data ?? [];
  const states = statesRes.data;
  const distribucionEstados = distribucionRes.data ?? [];
  const variacion = variacionRes.data;
  const variacionDevoluciones = variacionDevolucionesRes.data;

  const totalEstados = distribucionEstados.reduce(
    (acc, item) => acc + item.value,
    0,
  );
  const estadoTop = distribucionEstados.reduce<null | {
    name: string;
    value: number;
  }>(
    (top, item) =>
      !top || item.value > top.value
        ? { name: item.name, value: item.value }
        : top,
    null,
  );

  return (
    <>
      <PageHeader
        title="Shipping App"
        description="Coordinación de entrega y devolución de vehículos, con métricas live desde Shipping App."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ShippingVariationCard
          title="Entregas activas"
          value={states ? formatNumber(states.entregasActivas) : "—"}
          subtitle="En curso ahora mismo"
          variation={variacion?.variation}
          icon={Truck}
          iconTone="bg-primary/10 text-primary ring-primary/15"
        />
        <ShippingVariationCard
          title="Devoluciones esta semana"
          value={
            variacionDevoluciones
              ? formatNumber(variacionDevoluciones.current)
              : "—"
          }
          subtitle="Procesadas en esta semana"
          variation={variacionDevoluciones?.variation}
          icon={RotateCcw}
          iconTone="bg-danger/10 text-danger ring-danger/15"
        />
        <ShippingStaticCard
          title="Pendientes de coordinar"
          value={states ? formatNumber(states.pendientesCoordinar) : "—"}
          subtitle="A la espera de asignación"
          note={
            states && totalEstados > 0
              ? `${((states.pendientesCoordinar / totalEstados) * 100).toFixed(1)}% pendientes`
              : undefined
          }
          icon={Clock3}
          iconTone="bg-amber-500/10 text-amber-600 ring-amber-500/15"
        />

        <ShippingStaticCard
          title="Canceladas"
          value={states ? formatNumber(states.canceladas) : "—"}
          subtitle="Total acumuladas"
          note={
            states
              ? `${totalEstados > 0 ? ((states.canceladas / totalEstados) * 100).toFixed(1) : "0.0"}% se cancelan`
              : undefined
          }
          icon={XCircle}
          iconTone="bg-danger/10 text-danger ring-danger/15"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SectionCard
            title="Distribución semanal"
            right={
              <span className="text-xs text-muted-foreground">
                Valores en porcentaje
              </span>
            }
          >
            {weekly.length > 0 ? (
              <ShippingWeeklyDistributionChart data={weekly} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sin datos de distribución semanal
              </p>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-4">
          <SectionCard title="Estados operativos">
            {distribucionEstados.length > 0 ? (
              <div className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Total de eventos
                    </p>
                    <span className="text-3xl font-semibold text-foreground">
                      {formatNumber(totalEstados)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Estado principal
                    </p>
                    <span className="text-xl font-semibold text-foreground">
                      {estadoTop ? estadoTop.name : "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {distribucionEstados.map((item) => {
                    const pct =
                      totalEstados > 0 ? (item.value / totalEstados) * 100 : 0;
                    return (
                      <div
                        key={item.name}
                        className="group rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted"
                      >
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {item.name}
                          </span>
                          <span className="font-medium tabular-nums group-hover:text-foreground transition-colors">
                            {item.value} · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-opacity group-hover:opacity-80"
                            aria-label={`Distribucion ${item.name}`}
                            title={`${item.name}: ${item.value}`}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Sin datos de estados operativos
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
