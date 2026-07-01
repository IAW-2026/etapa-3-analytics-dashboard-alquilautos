import type { ExportFormat } from "./export-config";
import {
  styleHeader, styleTitle, styleSubtitle,
  styleDataValue, styleSectionLabel, styleTotalRow,
} from "./excel-styles";
import { PDF_TABLE_STYLES, addPDFHeader, addPDFSectionTitle, addPDFFooter } from "./pdf-styles";

async function fetchBuyerData() {
  const [total, onboarding, edad, nuevos, totalFav, masFav, porUsuario, promedio] =
    await Promise.all([
      fetch("/api/alquiladores/total").then((r) => r.json()),
      fetch("/api/alquiladores/onboarding").then((r) => r.json()),
      fetch("/api/alquiladores/edad").then((r) => r.json()),
      fetch("/api/alquiladores/nuevos-por-mes").then((r) => r.json()),
      fetch("/api/favoritos/total").then((r) => r.json()),
      fetch("/api/favoritos/mas-favoriteados").then((r) => r.json()),
      fetch("/api/favoritos/por-usuario").then((r) => r.json()),
      fetch("/api/favoritos/promedio").then((r) => r.json()),
    ]);
  return { total, onboarding, edad, nuevos, totalFav, masFav, porUsuario, promedio };
}

type BuyerData = Awaited<ReturnType<typeof fetchBuyerData>>;

// ─── EXCEL ────────────────────────────────────────────────────────────────────

async function exportExcel(data: BuyerData) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AlquilAutos Analytics";
  wb.created = new Date();

  const fecha = new Date().toLocaleDateString("es-AR");

  const onbTotal   = (data.onboarding?.completo ?? 0) + (data.onboarding?.pendiente ?? 0);
  const onbPct     = onbTotal > 0 ? `${Math.round((data.onboarding.completo / onbTotal) * 100)}%` : "—";
  const adoptTotal = (data.porUsuario?.con_favoritos ?? 0) + (data.porUsuario?.sin_favoritos ?? 0);
  const adoptPct   = adoptTotal > 0 ? `${Math.round((data.porUsuario.con_favoritos / adoptTotal) * 100)}%` : "—";
  const edadTotal  = (data.edad?.menores_de_25 ?? 0) + (data.edad?.entre_25_y_40 ?? 0) + (data.edad?.mayores_de_40 ?? 0) + (data.edad?.sin_datos ?? 0);
  const pct        = (n: number) => edadTotal > 0 ? `${Math.round((n / edadTotal) * 100)}%` : "—";
  const meses: { mes: string; total: number }[] = data.nuevos?.meses ?? [];
  const vehiculos: { id_vehiculo: string; nombre: string | null; cantidad: number }[] = data.masFav?.vehiculos ?? [];

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [{ key: "a", width: 42 }, { key: "b", width: 22 }];

  ws1.addRow(["AlquilAutos Analytics — Buyer App"]);
  styleTitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([`Exportado el ${fecha}`]);
  styleSubtitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([]);

  const resumenRows: [string, string | number][] = [
    ["Total de alquiladores",             data.total?.total ?? "—"],
    ["Onboarding completo",               data.onboarding?.completo ?? "—"],
    ["Onboarding pendiente",              data.onboarding?.pendiente ?? "—"],
    ["Tasa de onboarding completado",     onbPct],
    ["Total de favoritos",                data.totalFav?.total ?? "—"],
    ["Promedio de favoritos por usuario", data.promedio?.promedio ?? "—"],
    ["Usuarios con al menos un favorito", data.porUsuario?.con_favoritos ?? "—"],
    ["Usuarios sin favoritos",            data.porUsuario?.sin_favoritos ?? "—"],
    ["Tasa de adopción de favoritos",     adoptPct],
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

  // ── Hoja 2: Crecimiento mensual ──────────────────────────────────────────
  const ws2 = wb.addWorksheet("Crecimiento mensual");
  ws2.columns = [{ key: "a", width: 20 }, { key: "b", width: 26 }];

  ws2.addRow(["Nuevos alquiladores por mes"]);
  styleTitle(ws2.lastRow!.getCell(1));
  ws2.mergeCells(`A${ws2.rowCount}:B${ws2.rowCount}`);
  ws2.addRow([]);

  const hdr2 = ws2.addRow(["Mes", "Nuevos alquiladores"]);
  hdr2.height = 20;
  styleHeader(hdr2.getCell(1));
  styleHeader(hdr2.getCell(2));

  meses.forEach((m, i) => {
    const row = ws2.addRow([m.mes, m.total]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  ws2.addRow([]);
  const totalRow = ws2.addRow(["Total acumulado", meses.reduce((a, m) => a + m.total, 0)]);
  totalRow.height = 20;
  styleTotalRow(totalRow.getCell(1), "left");
  styleTotalRow(totalRow.getCell(2), "center");

  // ── Hoja 3: Distribución por edad ────────────────────────────────────────
  const ws3 = wb.addWorksheet("Distribución por edad");
  ws3.columns = [{ key: "a", width: 26 }, { key: "b", width: 16 }, { key: "c", width: 16 }];

  ws3.addRow(["Distribución de alquiladores por edad"]);
  styleTitle(ws3.lastRow!.getCell(1));
  ws3.mergeCells(`A${ws3.rowCount}:C${ws3.rowCount}`);
  ws3.addRow([]);

  const hdr3 = ws3.addRow(["Segmento", "Cantidad", "Porcentaje"]);
  hdr3.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdr3.getCell(c)));

  const edadRows: [string, number | string, string][] = [
    ["Menores de 25 años", data.edad?.menores_de_25 ?? "—", pct(data.edad?.menores_de_25 ?? 0)],
    ["Entre 25 y 40 años", data.edad?.entre_25_y_40 ?? "—", pct(data.edad?.entre_25_y_40 ?? 0)],
    ["Mayores de 40 años", data.edad?.mayores_de_40 ?? "—", pct(data.edad?.mayores_de_40 ?? 0)],
    ["Sin datos",          data.edad?.sin_datos    ?? "—", pct(data.edad?.sin_datos ?? 0)],
  ];
  edadRows.forEach(([seg, cant, p], i) => {
    const row = ws3.addRow([seg, cant, p]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws3.addRow([]);
  const totEdad = ws3.addRow(["Total", edadTotal, "100%"]);
  totEdad.height = 20;
  styleTotalRow(totEdad.getCell(1), "left");
  styleTotalRow(totEdad.getCell(2), "center");
  styleTotalRow(totEdad.getCell(3), "center");

  // ── Hoja 4: Favoritos ────────────────────────────────────────────────────
  const ws4 = wb.addWorksheet("Favoritos");
  ws4.columns = [{ key: "a", width: 36 }, { key: "b", width: 22 }];

  ws4.addRow(["Favoritos — Adopción y ranking"]);
  styleTitle(ws4.lastRow!.getCell(1));
  ws4.mergeCells(`A${ws4.rowCount}:B${ws4.rowCount}`);
  ws4.addRow([]);

  const hdrFav = ws4.addRow(["Indicador", "Valor"]);
  hdrFav.height = 20;
  styleHeader(hdrFav.getCell(1));
  styleHeader(hdrFav.getCell(2));

  const favRows: [string, string | number][] = [
    ["Total de favoritos",     data.totalFav?.total ?? "—"],
    ["Promedio por usuario",   data.promedio?.promedio ?? "—"],
    ["Usuarios con favoritos", data.porUsuario?.con_favoritos ?? "—"],
    ["Usuarios sin favoritos", data.porUsuario?.sin_favoritos ?? "—"],
    ["Tasa de adopción",       adoptPct],
  ];
  favRows.forEach(([label, value], i) => {
    const row = ws4.addRow([label, value]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  if (vehiculos.length > 0) {
    ws4.addRow([]);
    ws4.columns = [{ key: "a", width: 6 }, { key: "b", width: 36 }, { key: "c", width: 20 }];

    const hdrTop = ws4.addRow(["#", "Vehículo", "Veces guardado"]);
    hdrTop.height = 20;
    [1, 2, 3].forEach((c) => styleHeader(hdrTop.getCell(c)));

    vehiculos.forEach((v, i) => {
      const row = ws4.addRow([i + 1, v.nombre ?? v.id_vehiculo, v.cantidad]);
      row.height = 18;
      styleDataValue(row.getCell(1), i % 2 === 1);
      styleSectionLabel(row.getCell(2), i % 2 === 1);
      styleDataValue(row.getCell(3), i % 2 === 1);
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `buyer-metrics-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

async function exportPDF(data: BuyerData) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = addPDFHeader(doc, "Buyer App");

  // ── Alquiladores ─────────────────────────────────────────────────────────
  const onbTotal = (data.onboarding?.completo ?? 0) + (data.onboarding?.pendiente ?? 0);
  const onbPct   = onbTotal > 0 ? `${Math.round((data.onboarding.completo / onbTotal) * 100)}%` : "—";

  y = addPDFSectionTitle(doc, "ALQUILADORES", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de alquiladores",         String(data.total?.total ?? "—")],
      ["Onboarding completo",           String(data.onboarding?.completo ?? "—")],
      ["Onboarding pendiente",          String(data.onboarding?.pendiente ?? "—")],
      ["Tasa de onboarding completado", onbPct],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Distribución por edad ─────────────────────────────────────────────────
  const edadTotal =
    (data.edad?.menores_de_25 ?? 0) +
    (data.edad?.entre_25_y_40 ?? 0) +
    (data.edad?.mayores_de_40 ?? 0) +
    (data.edad?.sin_datos ?? 0);
  const pct = (n: number) => edadTotal > 0 ? `${Math.round((n / edadTotal) * 100)}%` : "—";

  y = addPDFSectionTitle(doc, "DISTRIBUCIÓN POR EDAD", y);
  autoTable(doc, {
    startY: y,
    head: [["Segmento", "Cantidad", "Porcentaje"]],
    body: [
      ["Menores de 25 años", String(data.edad?.menores_de_25 ?? "—"), pct(data.edad?.menores_de_25 ?? 0)],
      ["Entre 25 y 40 años", String(data.edad?.entre_25_y_40 ?? "—"), pct(data.edad?.entre_25_y_40 ?? 0)],
      ["Mayores de 40 años", String(data.edad?.mayores_de_40 ?? "—"), pct(data.edad?.mayores_de_40 ?? 0)],
      ["Sin datos",          String(data.edad?.sin_datos    ?? "—"), pct(data.edad?.sin_datos ?? 0)],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 45, halign: "center" }, 2: { cellWidth: 45, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Crecimiento mensual ───────────────────────────────────────────────────
  const meses: { mes: string; total: number }[] = data.nuevos?.meses ?? [];

  y = addPDFSectionTitle(doc, "NUEVOS ALQUILADORES POR MES", y);
  autoTable(doc, {
    startY: y,
    head: [["Mes", "Nuevos alquiladores"]],
    body: meses.map((m) => [m.mes, String(m.total)]),
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Favoritos ─────────────────────────────────────────────────────────────
  const adopcionTotal = (data.porUsuario?.con_favoritos ?? 0) + (data.porUsuario?.sin_favoritos ?? 0);
  const adopcionPct   = adopcionTotal > 0 ? `${Math.round((data.porUsuario.con_favoritos / adopcionTotal) * 100)}%` : "—";

  if (y > 220) { doc.addPage(); y = 20; }

  y = addPDFSectionTitle(doc, "FAVORITOS", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de favoritos",     String(data.totalFav?.total ?? "—")],
      ["Promedio por usuario",   String(data.promedio?.promedio ?? "—")],
      ["Usuarios con favoritos", String(data.porUsuario?.con_favoritos ?? "—")],
      ["Usuarios sin favoritos", String(data.porUsuario?.sin_favoritos ?? "—")],
      ["Tasa de adopción",       adopcionPct],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Vehículos más guardados ───────────────────────────────────────────────
  const vehiculos: { id_vehiculo: string; nombre: string | null; cantidad: number }[] =
    data.masFav?.vehiculos ?? [];

  if (vehiculos.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }

    y = addPDFSectionTitle(doc, "VEHÍCULOS MÁS GUARDADOS", y);
    autoTable(doc, {
      startY: y,
      head: [["#", "Vehículo", "Veces guardado"]],
      body: vehiculos.map((v, i) => [String(i + 1), v.nombre ?? v.id_vehiculo, String(v.cantidad)]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 15, halign: "center" }, 1: { cellWidth: 120 }, 2: { cellWidth: 45, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
  }

  addPDFFooter(doc);
  doc.save(`buyer-metrics-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function exportBuyer(format: ExportFormat): Promise<void> {
  const data = await fetchBuyerData();
  if (format === "excel") {
    await exportExcel(data);
  } else {
    await exportPDF(data);
  }
}
