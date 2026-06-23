import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SoonState } from "@/components/SoonState";

export const metadata: Metadata = {
  title: "Buyer · AlquilAutos Analytics",
  description: "Métricas de Buyer App (próximamente).",
};

export default function BuyerPage() {
  return (
    <>
      <PageHeader
        title="Buyer App"
        description="Métricas de alquiladores: búsquedas, reservas iniciadas, tasa de conversión."
      />
      <SoonState
        app="Buyer Insights"
        descripcion="Cuando los endpoints de Buyer App estén disponibles, este panel mostrará volumen de búsquedas, reservas iniciadas, tasa de conversión, y comportamiento de los alquiladores en la plataforma."
      />
    </>
  );
}