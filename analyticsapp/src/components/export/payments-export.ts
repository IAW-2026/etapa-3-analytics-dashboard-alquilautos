import type { ExportFormat } from "./export-config";
import {
  styleHeader, styleTitle, styleSubtitle,
  styleDataValue, styleSectionLabel, styleTotalRow,
} from "./excel-styles";
import { PDF_TABLE_STYLES, addPDFHeader, addPDFSectionTitle, addPDFFooter } from "./pdf-styles";

async function fetchPaymentsData() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const res = await fetch(`/api/resumen?desde=${desde}&hasta=${hasta}`).then((r) => r.json());
  return res;
}

type PaymentsData = Awaited<ReturnType<typeof fetchPaymentsData>>;

// ─── EXCEL ────────────────────────────────────────────────────────────────────

async function exportExcel(data: PaymentsData) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AlquilAutos Analytics";
  wb.created = new Date();

  const fecha = new Date().toLocaleDateString("es-AR");

  const ventas = {
    ventas_totales: data?.ventas_totales ?? "—",
    ticket_promedio: data?.ticket_promedio ?? "—",
    ingresos_mes_actual: data?.ingresos_mes_actual ?? "—",
    crecimiento: data?.crecimiento_mensual ?? "—",
    pagos_totales: data?.pagos_totales ?? "—",
    tasa_aprobacion: data?.tasa_aprobacion ?? "—",
    alquiladores_recurrentes: data?.alquiladores_recurrentes ?? "—",
    propietarios_activos: data?.propietarios_activos ?? "—",
  };

  const topProp = data?.top_propietario ?? null;

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [{ key: "a", width: 42 }, { key: "b", width: 22 }];

  ws1.addRow(["AlquilAutos Analytics — Payments App"]);
  styleTitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([`Exportado el ${fecha}`]);
  styleSubtitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([]);

  const resumenRows: [string, string | number][] = [
    ["Ventas totales",               ventas.ventas_totales],
    ["Ticket promedio",              ventas.ticket_promedio],
    ["Ingresos mes actual",          ventas.ingresos_mes_actual],
    ["Crecimiento mensual",          `${ventas.crecimiento >= 0 ? "+" : ""}${ventas.crecimiento}%`],
    ["Total de pagos",               ventas.pagos_totales],
    ["Tasa de aprobación",           `${ventas.tasa_aprobacion}%`],
    ["Alquiladores recurrentes",     `${ventas.alquiladores_recurrentes}%`],
    ["Propietarios activos",         ventas.propietarios_activos],
  ];

  const hdr1 = ws1.addRow(["Indicador", "Valor"]);
  hdr1.height = 20;
  styleHeader(hdr1.getCell(1));
  styleHeader(hdr1.getCell(2));

  resumenRows.forEach(([label, value], i) => {
    const row = ws1.addRow([label, value]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  // ── Hoja 2: Estado de Pagos ──────────────────────────────────────────────
  const ws2 = wb.addWorksheet("Estado de Pagos");
  ws2.columns = [{ key: "a", width: 26 }, { key: "b", width: 16 }, { key: "c", width: 16 }];

  ws2.addRow(["Estado de pagos — Desglose"]);
  styleTitle(ws2.lastRow!.getCell(1));
  ws2.mergeCells(`A${ws2.rowCount}:C${ws2.rowCount}`);
  ws2.addRow([]);

  const totalEstados = (data?.pendientes ?? 0) + (data?.cancelados ?? 0) + (data?.pagos_hoy ?? 0);
  const pctEstado = (n: number) => totalEstados > 0 ? `${Math.round((n / totalEstados) * 100)}%` : "—";

  const hdr2 = ws2.addRow(["Estado", "Cantidad", "Porcentaje"]);
  hdr2.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdr2.getCell(c)));

  const estadoRows: [string, number | string, string][] = [
    ["Pendientes",  data?.pendientes ?? "—", pctEstado(data?.pendientes ?? 0)],
    ["Cancelados",  data?.cancelados ?? "—", pctEstado(data?.cancelados ?? 0)],
    ["Pagos hoy",   data?.pagos_hoy  ?? "—", pctEstado(data?.pagos_hoy ?? 0)],
  ];

  estadoRows.forEach(([estado, cant, pct], i) => {
    const row = ws2.addRow([estado, cant, pct]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws2.addRow([]);
  const totEst = ws2.addRow(["Total", totalEstados, "100%"]);
  totEst.height = 20;
  styleTotalRow(totEst.getCell(1), "left");
  styleTotalRow(totEst.getCell(2), "center");
  styleTotalRow(totEst.getCell(3), "center");

  // ── Hoja 3: Top Propietario ──────────────────────────────────────────────
  const ws3 = wb.addWorksheet("Top Propietario");
  ws3.columns = [{ key: "a", width: 36 }, { key: "b", width: 22 }];

  ws3.addRow(["Propietario destacado"]);
  styleTitle(ws3.lastRow!.getCell(1));
  ws3.mergeCells(`A${ws3.rowCount}:B${ws3.rowCount}`);
  ws3.addRow([]);

  const hdr3 = ws3.addRow(["Indicador", "Valor"]);
  hdr3.height = 20;
  styleHeader(hdr3.getCell(1));
  styleHeader(hdr3.getCell(2));

  const topRows: [string, string | number][] = topProp
    ? [
        ["ID propietario", topProp.id],
        ["Ventas realizadas", topProp.ventas],
        ["Monto total", topProp.monto],
      ]
    : [["Propietario", "Sin datos"]];

  topRows.forEach(([label, value], i) => {
    const row = ws3.addRow([label, value]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `payments-metrics-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

async function exportPDF(data: PaymentsData) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = addPDFHeader(doc, "Payments App");

  // ── Ventas y KPIs ─────────────────────────────────────────────────────────
  const crecimiento = data?.crecimiento_mensual ?? "—";
  const crecimientoStr = typeof crecimiento === "number"
    ? `${crecimiento >= 0 ? "+" : ""}${crecimiento}%`
    : String(crecimiento);

  y = addPDFSectionTitle(doc, "VENTAS Y KPIS", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Ventas totales",            String(data?.ventas_totales ?? "—")],
      ["Ticket promedio",           String(data?.ticket_promedio ?? "—")],
      ["Ingresos mes actual",       String(data?.ingresos_mes_actual ?? "—")],
      ["Crecimiento mensual",       crecimientoStr],
      ["Total de pagos",            String(data?.pagos_totales ?? "—")],
      ["Tasa de aprobación",        `${data?.tasa_aprobacion ?? "—"}%`],
      ["Alquiladores recurrentes",  `${data?.alquiladores_recurrentes ?? "—"}%`],
      ["Propietarios activos",      String(data?.propietarios_activos ?? "—")],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Estado de Pagos ───────────────────────────────────────────────────────
  const totalEstados = (data?.pendientes ?? 0) + (data?.cancelados ?? 0) + (data?.pagos_hoy ?? 0);
  const pctEstado = (n: number) => totalEstados > 0 ? `${Math.round((n / totalEstados) * 100)}%` : "—";

  y = addPDFSectionTitle(doc, "ESTADO DE PAGOS", y);
  autoTable(doc, {
    startY: y,
    head: [["Estado", "Cantidad", "Porcentaje"]],
    body: [
      ["Pendientes", String(data?.pendientes ?? "—"), pctEstado(data?.pendientes ?? 0)],
      ["Cancelados", String(data?.cancelados ?? "—"), pctEstado(data?.cancelados ?? 0)],
      ["Pagos hoy",  String(data?.pagos_hoy  ?? "—"), pctEstado(data?.pagos_hoy ?? 0)],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 45, halign: "center" }, 2: { cellWidth: 45, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Top Propietario ───────────────────────────────────────────────────────
  const topProp = data?.top_propietario;

  y = addPDFSectionTitle(doc, "TOP PROPIETARIO", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: topProp
      ? [
          ["ID propietario",   topProp.id],
          ["Ventas realizadas", String(topProp.ventas)],
          ["Monto total",      String(topProp.monto)],
        ]
      : [["Propietario", "Sin datos"]],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });

  addPDFFooter(doc);
  doc.save(`payments-metrics-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function exportPayments(format: ExportFormat): Promise<void> {
  const data = await fetchPaymentsData();
  if (format === "excel") {
    await exportExcel(data);
  } else {
    await exportPDF(data);
  }
}
