import { fetchSellerMetric } from "@/lib/seller-api";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { BrandDistributionChart } from "@/components/BrandDistributionChart";
import { formatARS, formatNumber } from "@/lib/format";
import type {
  ResumenGeneral,
  VehiculoTop,
  PropietarioTop,
  OcupacionVehiculos,
  DistribucionMarca,
} from "@/lib/seller-metrics.types";

function rangoMesActual() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(desde), hasta: fmt(hasta) };
}

export default async function SellerPage() {
  const { desde, hasta } = rangoMesActual();

  const [resumenRes, ocupacionRes, topRes, propietariosRes, marcasRes] = await Promise.all([
    fetchSellerMetric<ResumenGeneral>("/resumen-general"),
    fetchSellerMetric<OcupacionVehiculos>("/ocupacion-vehiculos", { desde, hasta }),
    fetchSellerMetric<VehiculoTop[]>("/vehiculos-top", { limit: "8" }),
    fetchSellerMetric<PropietarioTop[]>("/propietarios-top", { limit: "6" }),
    fetchSellerMetric<DistribucionMarca[]>("/distribucion-marcas"),
  ]);

  const resumen = resumenRes.data;
  const ocupacion = ocupacionRes.data;
  const top = topRes.data ?? [];
  const propietarios = propietariosRes.data ?? [];
  const marcas = marcasRes.data ?? [];

  // Join real entre dos endpoints: ocupacion-vehiculos tiene el % por id_vehiculo,
  // vehiculos-top no — lo cruzamos en vez de inventar el dato.
  const ocupacionPorVehiculo = new Map(
    (ocupacion?.vehiculos ?? []).map((v) => [v.id_vehiculo, v.porcentaje]),
  );

  const totalReservas = resumen
    ? Object.values(resumen.reservas.por_estado).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <>
      <PageHeader
        title="Seller App"
        description="Métricas operativas de propietarios y vehículos. Datos live desde la API de Seller."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Propietarios" value={resumen ? formatNumber(resumen.total_propietarios) : "—"} />
        <KpiCard
          label="Vehículos Publicados"
          value={resumen ? formatNumber(resumen.vehiculos.total) : "—"}
          delta={resumen ? `${resumen.vehiculos.alquilados} alquilados` : undefined}
          trend="neutral"
        />
        <KpiCard
          label="Ocupación Promedio"
          value={ocupacion ? `${ocupacion.ocupacion_promedio_plataforma}%` : "—"}
        />
        <KpiCard
          label="Ingresos Acumulados"
          value={resumen ? formatARS(resumen.ingresos_totales_ars) : "—"}
          unit="ARS"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <SectionCard title="Top Vehículos" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Vehículo</th>
                    <th className="px-6 py-3">Alquileres</th>
                    <th className="px-6 py-3">Ocupación</th>
                    <th className="px-6 py-3 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {top.map((v, idx) => {
                    const ocupacionPct = ocupacionPorVehiculo.get(v.id_vehiculo);
                    return (
                      <tr key={v.id_vehiculo} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="size-6 grid place-items-center text-[10px] font-mono font-bold rounded bg-muted text-muted-foreground">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-sm font-medium">{v.marca} {v.modelo}</div>
                              <div className="text-[11px] text-muted-foreground">{v.anio}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{v.cantidad_alquileres}</td>
                        <td className="px-6 py-4 text-sm">
                          {ocupacionPct !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${ocupacionPct}%` }} />
                              </div>
                              <span className="text-xs">{ocupacionPct}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium">{formatARS(v.ingresos_generados)}</td>
                      </tr>
                    );
                  })}
                  {top.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        Sin datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Distribución por Marca">
            <BrandDistributionChart data={marcas} />
          </SectionCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <SectionCard title="Top Propietarios" padded={false}>
            <ul className="divide-y divide-border/60">
              {propietarios.map((p, idx) => (
                <li key={p.id_propietario} className="flex items-center gap-3 px-6 py-4">
                  <span className="size-7 grid place-items-center text-xs font-mono font-bold rounded-full bg-muted text-muted-foreground shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.nombre} {p.apellido}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.cantidad_vehiculos} vehículos · {p.cantidad_reservas_finalizadas} reservas
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary">{formatARS(p.ingresos_totales)}</div>
                </li>
              ))}
              {propietarios.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-muted-foreground">Sin datos disponibles</li>
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Reservas por Estado">
            {resumen ? (
              <ul className="space-y-2 text-sm">
                {Object.entries(resumen.reservas.por_estado).map(([estado, count]) => {
                  const pct = totalReservas > 0 ? (count / totalReservas) * 100 : 0;
                  return (
                    <li key={estado}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{estado}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}