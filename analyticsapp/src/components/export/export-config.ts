export type AppId = "general" | "buyer" | "seller" | "shipping" | "payments" | "feedback";
export type ExportFormat = "pdf" | "excel";

export interface ExportApp {
  id: AppId;
  label: string;
  description: string;
  available: boolean;
}

export const EXPORT_APPS: ExportApp[] = [
  {
    id: "general",
    label: "Resumen General",
    description: "Todas las apps consolidadas",
    available: false,
  },
  {
    id: "buyer",
    label: "Buyer App",
    description: "Alquiladores y favoritos",
    available: true,
  },
  {
    id: "seller",
    label: "Seller App",
    description: "Propietarios y vehículos",
    available: true,
  },
  {
    id: "shipping",
    label: "Shipping App",
    description: "Logística y entregas",
    available: false,
  },
  {
    id: "payments",
    label: "Payments App",
    description: "Pagos y payouts",
    available: true,
  },
  {
    id: "feedback",
    label: "Feedback App",
    description: "Calificaciones",
    available: false,
  },
];
