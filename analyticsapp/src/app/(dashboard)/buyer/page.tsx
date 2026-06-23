import type { Metadata } from "next";
import { getTotalAlquiladores } from "@/app/api/(buyer)/alquiladores/total/route";
import { getNuevosPorMes } from "@/app/api/(buyer)/alquiladores/nuevos-por-mes/route";
import { getOnboarding } from "@/app/api/(buyer)/alquiladores/onboarding/route";
import { getDistribucionEdad } from "@/app/api/(buyer)/alquiladores/edad/route";
import { getTotalFavoritos } from "@/app/api/(buyer)/favoritos/total/route";
import { getMasFavoriteados } from "@/app/api/(buyer)/favoritos/mas-favoriteados/route";
import { getFavoritosPorUsuario } from "@/app/api/(buyer)/favoritos/por-usuario/route";
import { getPromedioFavoritos } from "@/app/api/(buyer)/favoritos/promedio/route";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { BuyerGrowthChart } from "@/components/(buyer)/BuyerGrowthChart";
import { BuyerAgeDonut } from "@/components/(buyer)/BuyerAgeDonut";
import { BuyerOnboardingBar } from "@/components/(buyer)/BuyerOnboardingBar";
import { FavoritosTopList } from "@/components/(buyer)/FavoritosTopList";
import { FavoritosAdopcionBar } from "@/components/(buyer)/FavoritosAdopcionBar";

export const metadata: Metadata = {
  title: "Buyer · AlquilAutos Analytics",
  description: "Métricas de alquiladores de Buyer App.",
};

export default async function BuyerPage() {
  const [
    totalRes,
    nuevosRes,
    onboardingRes,
    edadRes,
    totalFavRes,
    topFavRes,
    porUsuarioRes,
    promedioRes,
  ] = await Promise.all([
    getTotalAlquiladores(),
    getNuevosPorMes(),
    getOnboarding(),
    getDistribucionEdad(),
    getTotalFavoritos(),
    getMasFavoriteados(),
    getFavoritosPorUsuario(),
    getPromedioFavoritos(),
  ]);

  const total = totalRes.data;
  const nuevos = nuevosRes.data?.meses ?? [];
  const onboarding = onboardingRes.data;
  const edad = edadRes.data;
  const totalFav = totalFavRes.data;
  const topFav = topFavRes.data?.vehiculos ?? [];
  const porUsuario = porUsuarioRes.data;
  const promedio = promedioRes.data;

  const ultimoMes = nuevos.at(-1)?.total;
  const penultimoMes = nuevos.at(-2)?.total;
  const deltaMes =
    ultimoMes !== undefined && penultimoMes !== undefined && penultimoMes > 0
      ? `${ultimoMes >= penultimoMes ? "+" : ""}${ultimoMes - penultimoMes} vs mes ant.`
      : undefined;
  const tendencia =
    ultimoMes !== undefined && penultimoMes !== undefined
      ? ultimoMes >= penultimoMes ? "up" : "down"
      : "neutral";

  const tasaOnboarding =
    onboarding && onboarding.completo + onboarding.pendiente > 0
      ? `${((onboarding.completo / (onboarding.completo + onboarding.pendiente)) * 100).toFixed(0)}%`
      : "—";

  return (
    <>
      <PageHeader
        title="Buyer App"
        description="Métricas de alquiladores: crecimiento y favoritos."
      />

      {/* KPIs — Alquiladores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard
          label="Alquiladores totales"
          value={total ? String(total.total) : "—"}
        />
        <KpiCard
          label="Nuevos este mes"
          value={ultimoMes !== undefined ? String(ultimoMes) : "—"}
          delta={deltaMes}
          trend={tendencia}
        />
        <KpiCard
          label="Tasa de onboarding completado"
          value={tasaOnboarding}
          trend={
            onboarding && onboarding.completo / (onboarding.completo + onboarding.pendiente) >= 0.7
              ? "up"
              : "down"
          }
        />
      </div>

      {/* Charts — Crecimiento y Edad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <SectionCard title="Nuevos alquiladores por mes">
            {nuevos.length > 0 ? (
              <BuyerGrowthChart data={nuevos} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de crecimiento</p>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-4">
          <SectionCard title="Distribución por edad">
            {edad ? (
              <BuyerAgeDonut data={edad} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de edad</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Onboarding */}
      <div className="mb-10">
        <SectionCard title="Estado de onboarding">
          {onboarding ? (
            <BuyerOnboardingBar data={onboarding} />
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin datos de onboarding</p>
          )}
        </SectionCard>
      </div>

      {/* Sección Favoritos */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Favoritos</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* KPIs — Favoritos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Total de favoritos"
          value={totalFav ? String(totalFav.total) : "—"}
        />
        <KpiCard
          label="Promedio por usuario"
          value={promedio ? String(promedio.promedio) : "—"}
          unit="favs"
        />
        <KpiCard
          label="Usuarios con favoritos"
          value={promedio ? String(promedio.usuarios_con_favoritos) : "—"}
        />
      </div>

      {/* Charts — Favoritos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SectionCard title="Vehículos más guardados">
            {topFav.length > 0 ? (
              <FavoritosTopList vehiculos={topFav} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de favoritos</p>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-5">
          <SectionCard title="Adopción de favoritos">
            {porUsuario ? (
              <FavoritosAdopcionBar data={porUsuario} />
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Sin datos de adopción</p>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
