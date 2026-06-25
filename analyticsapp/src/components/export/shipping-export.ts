import type { ExportFormat } from "./export-config";
import {
  styleHeader,
  styleTitle,
  styleSubtitle,
  styleDataValue,
  styleSectionLabel,
  styleTotalRow,
} from "./excel-styles";

import {
  PDF_TABLE_STYLES,
  addPDFHeader,
  addPDFSectionTitle,
  addPDFFooter,
} from "./pdf-styles";

function normalizeEstados(estados: any, devoluciones: any) {
  return [
    { name: "Entregas activas", value: estados?.entregasActivas ?? 0 },
    {
      name: "Pendientes de coordinar",
      value: estados?.pendientesCoordinar ?? 0,
    },
    {
      name: "Devoluciones esta semana",
      value: devoluciones?.current ?? 0,
    },
    { name: "Canceladas", value: estados?.canceladas ?? 0 },
  ];
}
async function fetchShippingData() {
  const [estadosRes, semanalRes, variacionRes, devolucionesRes] =
    await Promise.all([
      fetch("/api/metricas/estados").then((r) => r.json()),
      fetch("/api/metricas/distribucion-semanal").then((r) => r.json()),
      fetch("/api/metricas/estados/variacion").then((r) => r.json()),
      fetch("/api/metricas/estados/variacion-devoluciones").then((r) =>
        r.json(),
      ),
    ]);

  return {
    estados: estadosRes?.data ?? estadosRes,
    semanal: semanalRes?.data ?? semanalRes,
    variacion: variacionRes?.data ?? variacionRes,

    devoluciones: devolucionesRes?.data ?? devolucionesRes,
  };
}

type ShippingData = Awaited<ReturnType<typeof fetchShippingData>>;

async function exportExcel(data: any) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet("Shipping");

  const estadosArray = normalizeEstados(data.estados, data.devoluciones);

  // Header
  ws.addRow(["Estado", "Cantidad"]);

  // Data
  estadosArray.forEach((e) => {
    ws.addRow([e.name, e.value]);
  });

  const buffer = await wb.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shipping-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

  a.click();
}

async function exportPDF(data: any) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = 20;

  // ─────────────────────────────
  // 1. KPIs PRINCIPALES
  // ─────────────────────────────

  const kpis = normalizeEstados(data.estados, data.devoluciones);

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Valor"]],
    body: kpis.map((k) => [k.name, k.value]),
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ─────────────────────────────
  // 2. DISTRIBUCIÓN SEMANAL
  // ─────────────────────────────

  const weekly = Array.isArray(data.semanal) ? data.semanal : [];

  autoTable(doc, {
    startY: y,
    head: [["Día", "Entregas", "Devoluciones"]],
    body: weekly.map((d: any) => [
      d.day,
      `${d.entregas}%`,
      `${d.devoluciones}%`,
    ]),
  });

  doc.save(`shipping-export-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportShipping(format: "excel" | "pdf") {
  const data = await fetchShippingData();

  if (format === "excel") {
    await exportExcel(data);
  } else {
    await exportPDF(data);
  }
}
