import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SoonState } from "@/components/SoonState";

export const metadata: Metadata = {
  title: "Feedback · AlquilAutos Analytics",
  description: "Métricas de Feedback App (próximamente).",
};

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        title="Feedback App"
        description="Reseñas y calificaciones mutuas entre alquiladores y propietarios."
      />
      <SoonState
        app="Calificaciones"
        descripcion="Calificación promedio, NPS, distribución de estrellas, reseñas reportadas y propietarios mejor calificados."
      />
    </>
  );
}