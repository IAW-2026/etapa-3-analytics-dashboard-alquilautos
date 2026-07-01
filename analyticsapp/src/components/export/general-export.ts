import type { ExportFormat } from "./export-config";
import {
  styleHeader, styleTitle, styleSubtitle,
  styleSectionLabel, styleDataValue,
} from "./excel-styles";
import { PDF_TABLE_STYLES, addPDFHeader, addPDFSectionTitle, addPDFFooter } from "./pdf-styles";

function rangoMesActual() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { desde, hasta };
}

async function fetchGeneralData() {
  const { desde, hasta } = rangoMesActual();

  const [resumenSeller, tasaSeller, ocupacion, totalAlquiladores, payments, feedback, shippingEstados] =
    await Promise.all([
      fetch("/api/resumen-general").then((r) => r.json()),
      fetch("/api/tasa-conversion").then((r) => r.json()),
      fetch(`/api/ocupacion-vehiculos?desde=${desde}&hasta=${hasta}`).then((r) => r.json()),
      fetch("/api/alquiladores/total").then((r) => r.json()),
      fetch(`/api/resumen?desde=${desde}&hasta=${hasta}`).then((r) => r.json()),
      fetch("/api/metrics/resumen").then((r) => r.json()),
      fetch("/api/metricas/estados").then((r) => r.json()),
    ]);

  return { resumenSeller, tasaSeller, ocupacion, totalAlquiladores, payments, feedback, shippingEstados };
}

type GeneralData = Awaited<ReturnType<typeof fetchGeneralData>>;

type Section = { app: string; rows: [string, string | number][] };

function buildSections(data: GeneralData): Section[] {
  const rs = data.resumenSeller;
  const tasa = data.tasaSeller;
  const pay = data.payments;
  const fb = data.feedback;
  const ship = data.shippingEstados;

  return [
    {
      app: "Seller App — Propietarios y vehículos",
      rows: [
        ["Total de propietarios", rs?.total_propietarios ?? "—"],
        ["Vehículos publicados", rs?.vehiculos?.total ?? "—"],
        ["Vehículos alquilados", rs?.vehiculos?.alquilados ?? "—"],
        ["Reservas totales", rs?.reservas?.total ?? "—"],
        ["Ingresos totales (ARS)", rs?.ingresos_totales_ars ?? "—"],
        ["Ocupación promedio (%)", data.ocupacion?.ocupacion_promedio_plataforma ?? "—"],
        ["Tasa de finalización (%)", tasa?.tasa_conversion ?? "—"],
        ["Tasa de cancelación (%)", tasa?.tasa_cancelacion ?? "—"],
      ],
    },
    {
      app: "Buyer App — Alquiladores y favoritos",
      rows: [
        ["Total de alquiladores", data.totalAlquiladores?.total ?? "—"],
      ],
    },
    {
      app: "Payments App — Pagos y payouts",
      rows: [
        ["Ventas totales", pay?.ventas_totales ?? "—"],
        ["Ticket promedio (ARS)", pay?.ticket_promedio ?? "—"],
        ["Ingresos mes actual (ARS)", pay?.ingresos_mes_actual ?? "—"],
        ["Crecimiento mensual (%)", pay?.crecimiento_mensual ?? "—"],
        ["Pagos totales", pay?.pagos_totales ?? "—"],
        ["Tasa de aprobación (%)", pay?.tasa_aprobacion ?? "—"],
        ["Pagos pendientes", pay?.pendientes ?? "—"],
        ["Pagos cancelados", pay?.cancelados ?? "—"],
        ["Pagos hoy", pay?.pagos_hoy ?? "—"],
      ],
    },
    {
      app: "Feedback App — Reseñas",
      rows: [
        ["Total de reseñas", fb?.total_resenas ?? "—"],
        ["Calificación promedio global", fb?.calificacion_promedio_global ?? "—"],
        ["Tasa de aprobación (%)", fb?.tasa_aprobacion ?? "—"],
        ["Tasa de respuesta (%)", fb?.tasa_respuesta ?? "—"],
        ["Reseñas última semana", fb?.resenas_ultima_semana ?? "—"],
        ["Reseñas último mes", fb?.resenas_ultimo_mes ?? "—"],
      ],
    },
    {
      app: "Shipping App — Logística y entregas",
      rows: [
        ["Entregas activas", ship?.entregasActivas ?? "—"],
        ["Pendientes de coordinar", ship?.pendientesCoordinar ?? "—"],
        ["Devoluciones", ship?.devoluciones ?? "—"],
        ["Canceladas", ship?.canceladas ?? "—"],
      ],
    },
  ];
}

// ─── EXCEL ────────────────────────────────────────────────────────────────────

async function exportExcel(data: GeneralData) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AlquilAutos Analytics";
  wb.created = new Date();

  const fecha = new Date().toLocaleDateString("es-AR");
  const sections = buildSections(data);

  const ws = wb.addWorksheet("Resumen General");
  ws.columns = [{ key: "a", width: 38 }, { key: "b", width: 22 }];

  ws.addRow(["AlquilAutos Analytics — Resumen General"]);
  styleTitle(ws.lastRow!.getCell(1));
  ws.mergeCells(`A${ws.rowCount}:B${ws.rowCount}`);

  ws.addRow([`Exportado el ${fecha} — todas las apps consolidadas`]);
  styleSubtitle(ws.lastRow!.getCell(1));
  ws.mergeCells(`A${ws.rowCount}:B${ws.rowCount}`);

  sections.forEach((section) => {
    ws.addRow([]);
    ws.addRow([section.app]);
    styleTitle(ws.lastRow!.getCell(1));
    ws.mergeCells(`A${ws.rowCount}:B${ws.rowCount}`);

    const hdr = ws.addRow(["Indicador", "Valor"]);
    hdr.height = 20;
    styleHeader(hdr.getCell(1));
    styleHeader(hdr.getCell(2));

    section.rows.forEach(([label, value], i) => {
      const row = ws.addRow([label, value]);
      row.height = 18;
      styleSectionLabel(row.getCell(1), i % 2 === 1);
      styleDataValue(row.getCell(2), i % 2 === 1);
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `resumen-general-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

async function exportPDF(data: GeneralData) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = addPDFHeader(doc, "Resumen General");

  const sections = buildSections(data);

  sections.forEach((section) => {
    if (y > 220) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, section.app.toUpperCase(), y);
    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Valor"]],
      body: section.rows.map(([label, value]) => [label, String(value)]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  });

  addPDFFooter(doc);
  doc.save(`resumen-general-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function exportGeneral(format: ExportFormat): Promise<void> {
  const data = await fetchGeneralData();
  if (format === "excel") {
    await exportExcel(data);
  } else {
    await exportPDF(data);
  }
}
