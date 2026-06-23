import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SoonState } from "@/components/SoonState";

export const metadata: Metadata = {
  title: "Payments · AlquilAutos Analytics",
  description: "Métricas de Payments App (próximamente).",
};

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments App"
        description="Procesamiento de pagos, payouts a propietarios y métodos de pago."
      />
      <SoonState
        app="Pagos & Payouts"
        descripcion="Volumen transaccional, tasa de éxito de pagos, tiempo de payout a propietarios, y desglose por medio de pago."
      />
    </>
  );
}