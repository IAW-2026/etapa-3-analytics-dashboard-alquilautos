import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SoonState } from "@/components/SoonState";

export const metadata: Metadata = {
  title: "Shipping · AlquilAutos Analytics",
  description: "Métricas de Shipping App (próximamente).",
};

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        title="Shipping App"
        description="Coordinación de entrega y devolución de vehículos."
      />
      <SoonState
        app="Logística & Entregas"
        descripcion="Tiempos promedio de entrega, devoluciones a tiempo, incidencias de coordinación, y mapa de cobertura."
      />
    </>
  );
}