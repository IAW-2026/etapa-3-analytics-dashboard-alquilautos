import type { ExportFormat } from "./export-config";

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

const BLUE       = "FF1A5CFF";
const BLUE_LIGHT = "FFE8EEFF";
const WHITE      = "FFFFFFFF";
const DARK       = "FF111827";
const GRAY       = "FF6B7280";

type XLCell = import("exceljs").Cell;

function styleHeader(cell: XLCell) {
  cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
  cell.font   = { bold: true, color: { argb: WHITE }, size: 10 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = { bottom: { style: "thin", color: { argb: WHITE } } };
}

function styleTitle(cell: XLCell) {
  cell.font      = { bold: true, color: { argb: BLUE }, size: 12 };
  cell.alignment = { horizontal: "left", vertical: "middle" };
}

function styleSubtitle(cell: XLCell) {
  cell.font      = { italic: true, color: { argb: GRAY }, size: 9 };
}

function styleDataLabel(cell: XLCell) {
  cell.font      = { color: { argb: DARK }, size: 10 };
  cell.alignment = { horizontal: "left", vertical: "middle" };
}

function styleDataValue(cell: XLCell, shade: boolean) {
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: shade ? BLUE_LIGHT : WHITE } };
  cell.font      = { color: { argb: DARK }, size: 10 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
}

function styleSectionLabel(cell: XLCell, shade: boolean) {
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: shade ? BLUE_LIGHT : WHITE } };
  styleDataLabel(cell);
}

async function exportExcel(data: BuyerData) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AlquilAutos Analytics";
  wb.created = new Date();

  const fecha = new Date().toLocaleDateString("es-AR");

  const onbTotal    = (data.onboarding?.completo ?? 0) + (data.onboarding?.pendiente ?? 0);
  const onbPct      = onbTotal > 0 ? `${Math.round((data.onboarding.completo / onbTotal) * 100)}%` : "—";
  const adoptTotal  = (data.porUsuario?.con_favoritos ?? 0) + (data.porUsuario?.sin_favoritos ?? 0);
  const adoptPct    = adoptTotal > 0 ? `${Math.round((data.porUsuario.con_favoritos / adoptTotal) * 100)}%` : "—";
  const edadTotal   = (data.edad?.menores_de_25 ?? 0) + (data.edad?.entre_25_y_40 ?? 0) + (data.edad?.mayores_de_40 ?? 0) + (data.edad?.sin_datos ?? 0);
  const pct         = (n: number) => edadTotal > 0 ? `${Math.round((n / edadTotal) * 100)}%` : "—";
  const meses: { mes: string; total: number }[] = data.nuevos?.meses ?? [];
  const vehiculos: { id_vehiculo: string; nombre: string | null; cantidad: number }[] = data.masFav?.vehiculos ?? [];

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [
    { key: "a", width: 42 },
    { key: "b", width: 22 },
  ];

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
  totalRow.getCell(1).font = { bold: true, color: { argb: BLUE } };
  totalRow.getCell(2).font = { bold: true, color: { argb: BLUE } };
  totalRow.getCell(2).alignment = { horizontal: "center" };

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
    ["Sin datos",           data.edad?.sin_datos   ?? "—", pct(data.edad?.sin_datos ?? 0)],
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
  [1, 2, 3].forEach((c) => {
    totEdad.getCell(c).font = { bold: true, color: { argb: BLUE } };
    totEdad.getCell(c).alignment = { horizontal: c === 1 ? "left" : "center" };
  });

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
    ["Total de favoritos",                data.totalFav?.total ?? "—"],
    ["Promedio por usuario",              data.promedio?.promedio ?? "—"],
    ["Usuarios con favoritos",            data.porUsuario?.con_favoritos ?? "—"],
    ["Usuarios sin favoritos",            data.porUsuario?.sin_favoritos ?? "—"],
    ["Tasa de adopción",                  adoptPct],
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

  // Descarga
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
  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const VIOLET = [26, 92, 255] as [number, number, number];
  const GRAY   = [100, 100, 100] as [number, number, number];
  const LIGHT  = [232, 238, 255] as [number, number, number];

  let y = 20;

  // Header
  doc.setFillColor(...VIOLET);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AlquilAutos Analytics", 14, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Buyer App — Reporte de métricas", 14, 21);
  doc.setFontSize(9);
  doc.text(`Exportado el ${fecha}`, 196, 21, { align: "right" });

  y = 38;
  doc.setTextColor(0, 0, 0);

  // ── Sección: KPIs principales ────────────────────────────────────────────
  const onbTotal = (data.onboarding?.completo ?? 0) + (data.onboarding?.pendiente ?? 0);
  const onbPct = onbTotal > 0
    ? `${Math.round((data.onboarding.completo / onbTotal) * 100)}%`
    : "—";

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...VIOLET);
  doc.text("ALQUILADORES", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de alquiladores", String(data.total?.total ?? "—")],
      ["Onboarding completo", String(data.onboarding?.completo ?? "—")],
      ["Onboarding pendiente", String(data.onboarding?.pendiente ?? "—")],
      ["Tasa de onboarding completado", onbPct],
    ],
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Sección: Distribución por edad ───────────────────────────────────────
  const edadTotal =
    (data.edad?.menores_de_25 ?? 0) +
    (data.edad?.entre_25_y_40 ?? 0) +
    (data.edad?.mayores_de_40 ?? 0) +
    (data.edad?.sin_datos ?? 0);
  const pct = (n: number) =>
    edadTotal > 0 ? `${Math.round((n / edadTotal) * 100)}%` : "—";

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...VIOLET);
  doc.text("DISTRIBUCIÓN POR EDAD", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Segmento", "Cantidad", "Porcentaje"]],
    body: [
      ["Menores de 25 años", String(data.edad?.menores_de_25 ?? "—"), pct(data.edad?.menores_de_25 ?? 0)],
      ["Entre 25 y 40 años", String(data.edad?.entre_25_y_40 ?? "—"), pct(data.edad?.entre_25_y_40 ?? 0)],
      ["Mayores de 40 años", String(data.edad?.mayores_de_40 ?? "—"), pct(data.edad?.mayores_de_40 ?? 0)],
      ["Sin datos", String(data.edad?.sin_datos ?? "—"), pct(data.edad?.sin_datos ?? 0)],
    ],
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 45, halign: "center" },
      2: { cellWidth: 45, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Sección: Crecimiento mensual ─────────────────────────────────────────
  const meses: { mes: string; total: number }[] = data.nuevos?.meses ?? [];

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...VIOLET);
  doc.text("NUEVOS ALQUILADORES POR MES", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Mes", "Nuevos alquiladores"]],
    body: meses.map((m) => [m.mes, String(m.total)]),
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90, halign: "center" } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Sección: Favoritos ───────────────────────────────────────────────────
  const adopcionTotal =
    (data.porUsuario?.con_favoritos ?? 0) + (data.porUsuario?.sin_favoritos ?? 0);
  const adopcionPct = adopcionTotal > 0
    ? `${Math.round((data.porUsuario.con_favoritos / adopcionTotal) * 100)}%`
    : "—";

  if (y > 220) { doc.addPage(); y = 20; }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...VIOLET);
  doc.text("FAVORITOS", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de favoritos", String(data.totalFav?.total ?? "—")],
      ["Promedio por usuario", String(data.promedio?.promedio ?? "—")],
      ["Usuarios con favoritos", String(data.porUsuario?.con_favoritos ?? "—")],
      ["Usuarios sin favoritos", String(data.porUsuario?.sin_favoritos ?? "—")],
      ["Tasa de adopción", adopcionPct],
    ],
    headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Vehículos más guardados ──────────────────────────────────────────────
  const vehiculos: { id_vehiculo: string; nombre: string | null; cantidad: number }[] =
    data.masFav?.vehiculos ?? [];

  if (vehiculos.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...VIOLET);
    doc.text("VEHÍCULOS MÁS GUARDADOS", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["#", "Vehículo", "Veces guardado"]],
      body: vehiculos.map((v, i) => [
        String(i + 1),
        v.nombre ?? v.id_vehiculo,
        String(v.cantidad),
      ]),
      headStyles: { fillColor: VIOLET, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 120 },
        2: { cellWidth: 45, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer en todas las páginas
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `AlquilAutos Analytics · Página ${i} de ${totalPages}`,
      105,
      290,
      { align: "center" },
    );
  }

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
