import type { Metadata } from "next";
import { KpiCard }     from "@/components/KpiCard";
import { PageHeader }  from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { getResumen }              from "@/app/api/(feedback)/metrics/resumen/route";
import { getTendencia }            from "@/app/api/(feedback)/metrics/tendencia/route";
import { getDistribucion }         from "@/app/api/(feedback)/metrics/distribucion/route";
import { getRankingAlquilador, getRankingPropietario, getRankingVehiculo } from "@/app/api/(feedback)/metrics/ranking/[tipo]/route";
import { getTiempoModeracion }     from "@/app/api/(feedback)/metrics/moderacion-tiempo/route";
import { getEmisoresRecurrentes }  from "@/app/api/(feedback)/metrics/emisores-recurrentes/route";
import { getRechazosEmisor }       from "@/app/api/(feedback)/metrics/rechazos-por-emisor/route";
import { getCaidaAlquilador, getCaidaPropietario, getCaidaVehiculo } from "@/app/api/(feedback)/metrics/caida/[tipo]/route";
import { FeedbackTendenciaChart }  from "@/components/(feedback)/FeedbackTendenciaChart";
import { FeedbackDistribucionBar } from "@/components/(feedback)/FeedbackDistribucionBar";
import { FeedbackRankingList }     from "@/components/(feedback)/FeedbackRankingList";
import { FeedbackAlertasCaida, FeedbackAlertasRechazos } from "@/components/(feedback)/FeedbackAlertas";

export const metadata: Metadata = {
  title: "Feedback · AlquilAutos Analytics",
  description: "Métricas de reseñas y calificaciones de Feedback App.",
};

export default async function FeedbackPage() {
  const [
    resumenRes, tendenciaRes, distribucionRes,
    rankAlqRes, rankPropRes, rankVehRes,
    tiempoRes,
    emisoresRes, rechazosRes,
    caidaAlqRes, caidaPropRes, caidaVehRes,
  ] = await Promise.all([
    getResumen(),
    getTendencia("mes", 12),
    getDistribucion(),
    getRankingAlquilador("desc", 5),
    getRankingPropietario("desc", 5),
    getRankingVehiculo("desc", 5),
    getTiempoModeracion(),
    getEmisoresRecurrentes(3, 10),
    getRechazosEmisor(2, 0.5, 10),
    getCaidaAlquilador(),
    getCaidaPropietario(),
    getCaidaVehiculo(),
  ]);

  const resumen     = resumenRes.data;
  const tendencia   = tendenciaRes.data?.datos ?? [];
  const distribucion = distribucionRes.data?.distribucion ?? [];
  const rankAlq     = rankAlqRes.data?.ranking ?? [];
  const rankProp    = rankPropRes.data?.ranking ?? [];
  const rankVeh     = rankVehRes.data?.ranking ?? [];
  const tiempo      = tiempoRes.data;
  const emisores    = emisoresRes.data?.emisores ?? [];
  const rechazos    = rechazosRes.data?.emisores ?? [];

  // Unir caídas de los 3 tipos
  const caidasTodas = [
    ...(caidaAlqRes.data?.entidades_con_caida ?? []),
    ...(caidaPropRes.data?.entidades_con_caida ?? []),
    ...(caidaVehRes.data?.entidades_con_caida ?? []),
  ].sort((a, b) => b.caida - a.caida);

  // Deltas para KPIs
  const ultimaMod    = tendencia.at(-1);
  const penultimaMod = tendencia.at(-2);
  const deltaMes =
    ultimaMod && penultimaMod && penultimaMod.cantidad_resenas > 0
      ? `${ultimaMod.cantidad_resenas >= penultimaMod.cantidad_resenas ? "+" : ""}${
          ultimaMod.cantidad_resenas - penultimaMod.cantidad_resenas
        } vs mes ant.`
      : undefined;
  const trendMes =
    ultimaMod && penultimaMod
      ? ultimaMod.cantidad_resenas >= penultimaMod.cantidad_resenas ? "up" : "down"
      : "neutral";

  return (
    <>
      <PageHeader
        title="Feedback App"
        description="Reseñas, calificaciones y moderación entre alquiladores y propietarios."
      />

      {/* ── KPIs globales ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total de reseñas"
          value={resumen ? String(resumen.total_resenas) : "—"}
        />
        <KpiCard
          label="Tasa de aprobación"
          value={resumen ? `${resumen.tasa_aprobacion}%` : "—"}
          trend={resumen && resumen.tasa_aprobacion >= 70 ? "up" : "down"}
        />
        <KpiCard
          label="Calificación promedio"
          value={resumen ? `${resumen.calificacion_promedio_global}★` : "—"}
          trend={
            resumen
              ? resumen.calificacion_promedio_global >= 4 ? "up"
              : resumen.calificacion_promedio_global >= 3 ? "neutral"
              : "down"
              : "neutral"
          }
        />
        <KpiCard
          label="Pendientes de moderación"
          value={resumen ? String(resumen.total_pendientes) : "—"}
          trend={resumen && resumen.total_pendientes === 0 ? "up" : "down"}
        />
      </div>

      {/* ── KPIs secundarios ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard
          label="Reseñas este mes"
          value={resumen ? String(resumen.resenas_ultimo_mes) : "—"}
          delta={deltaMes}
          trend={trendMes}
        />
        <KpiCard
          label="Tasa de respuesta"
          value={resumen ? `${resumen.tasa_respuesta}%` : "—"}
          trend={resumen && resumen.tasa_respuesta >= 30 ? "up" : "neutral"}
        />
        <KpiCard
          label="Tiempo prom. moderación"
          value={tiempo ? `${tiempo.promedio_dias}d` : "—"}
          unit={tiempo ? `mediana: ${tiempo.mediana_dias}d` : undefined}
          trend={tiempo && tiempo.promedio_dias <= 2 ? "up" : "down"}
        />
      </div>

      {/* ── Tendencia + Distribución ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <SectionCard title="Reseñas aprobadas por mes">
            {tendencia.length > 0 ? (
              <FeedbackTendenciaChart data={tendencia} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de tendencia</p>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-4">
          <SectionCard title="Distribución de calificaciones">
            {distribucion.length > 0 ? (
              <FeedbackDistribucionBar data={distribucion} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de distribución</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Rankings ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Rankings</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SectionCard title="Top alquiladores">
          {rankAlq.length > 0 ? (
            <FeedbackRankingList items={rankAlq} />
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin datos</p>
          )}
        </SectionCard>
        <SectionCard title="Top propietarios">
          {rankProp.length > 0 ? (
            <FeedbackRankingList items={rankProp} />
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin datos</p>
          )}
        </SectionCard>
        <SectionCard title="Top vehículos">
          {rankVeh.length > 0 ? (
            <FeedbackRankingList items={rankVeh} />
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin datos</p>
          )}
        </SectionCard>
      </div>

      {/* ── Moderación ────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Moderación</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {tiempo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total moderaciones", value: String(tiempo.total_moderaciones) },
            { label: "Promedio (días)",    value: `${tiempo.promedio_dias}d` },
            { label: "Mediana (días)",     value: `${tiempo.mediana_dias}d` },
            { label: "Percentil 90",       value: `${tiempo.percentil_90_dias}d` },
          ].map(({ label, value }) => (
            <KpiCard key={label} label={label} value={value} />
          ))}
        </div>
      )}

      {/* ── Alertas ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Alertas</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-6">
          <SectionCard
            title="Entidades con caída brusca"
            description="Calificación reciente (30 días) vs. histórico — caída ≥ 1 punto"
          >
            <FeedbackAlertasCaida items={caidasTodas} tipo="entidad" />
          </SectionCard>
        </div>
        <div className="lg:col-span-6">
          <SectionCard
            title="Emisores con rechazos concentrados"
            description="Usuarios con ≥ 50% de sus reseñas rechazadas"
          >
            <FeedbackAlertasRechazos items={rechazos} />
          </SectionCard>
        </div>
      </div>

      {/* ── Emisores recurrentes ─────────────────────────── */}
      {emisores.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Emisores recurrentes</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <SectionCard
            title="Usuarios más activos"
            description="Con 3 o más reseñas enviadas"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    {["Emisor", "Reseñas", "Calif. promedio emitida", "Última reseña"].map((h) => (
                      <th key={h} className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emisores.map((e, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{e.nombre_entidad ?? `#${e.id_emisor}`}</td>
                      <td className="py-2.5 pr-4 tabular-nums text-foreground">{e.cantidad_resenas}</td>
                      <td className="py-2.5 pr-4 tabular-nums text-foreground">{e.calificacion_promedio_emitida.toFixed(2)}★</td>
                      <td className="py-2.5 pr-4 text-muted-foreground text-xs">
                        {new Date(e.ultima_resena).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </>
  );
}
