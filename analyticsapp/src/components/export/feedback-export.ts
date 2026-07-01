import type { ExportFormat } from "./export-config";
import {
  styleHeader, styleTitle, styleSubtitle,
  styleDataValue, styleSectionLabel, styleTotalRow,
} from "./excel-styles";
import { PDF_TABLE_STYLES, addPDFHeader, addPDFSectionTitle, addPDFFooter } from "./pdf-styles";

async function fetchFeedbackData() {
  const [
    resumen, tendencia, distribucion,
    rankAlq, rankProp, rankVeh,
    tiempo, emisores, rechazos,
  ] = await Promise.all([
    fetch("/api/metrics/resumen").then((r) => r.json()),
    fetch("/api/metrics/tendencia?granularidad=mes&cantidad=12").then((r) => r.json()),
    fetch("/api/metrics/distribucion").then((r) => r.json()),
    fetch("/api/metrics/ranking/alquilador?orden=desc&limit=10").then((r) => r.json()),
    fetch("/api/metrics/ranking/propietario?orden=desc&limit=10").then((r) => r.json()),
    fetch("/api/metrics/ranking/vehiculo?orden=desc&limit=10").then((r) => r.json()),
    fetch("/api/metrics/moderacion-tiempo").then((r) => r.json()),
    fetch("/api/metrics/emisores-recurrentes?min_resenas=3&limit=20").then((r) => r.json()),
    fetch("/api/metrics/rechazos-por-emisor?min_resenas=2&umbral_tasa=0.5&limit=20").then((r) => r.json()),
  ]);
  return { resumen, tendencia, distribucion, rankAlq, rankProp, rankVeh, tiempo, emisores, rechazos };
}

type FeedbackData = Awaited<ReturnType<typeof fetchFeedbackData>>;

// ─── EXCEL ────────────────────────────────────────────────────────────────────

async function exportExcel(data: FeedbackData) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AlquilAutos Analytics";
  wb.created = new Date();

  const fecha   = new Date().toLocaleDateString("es-AR");
  const rs      = data.resumen;
  const meses: { periodo: string; cantidad_resenas: number; calificacion_promedio: number }[] =
    data.tendencia?.datos ?? [];
  const dist: { calificacion: number; cantidad: number; porcentaje: number }[] =
    data.distribucion?.distribucion ?? [];
  const rankAlq:  { id_alquilador: string;  calificacion_promedio: number; cantidad_resenas: number }[] =
    data.rankAlq?.ranking ?? [];
  const rankProp: { id_propietario: string; calificacion_promedio: number; cantidad_resenas: number }[] =
    data.rankProp?.ranking ?? [];
  const rankVeh:  { id_vehiculo: string;    calificacion_promedio: number; cantidad_resenas: number }[] =
    data.rankVeh?.ranking ?? [];
  const tiempo = data.tiempo;
  const emisores: { id_emisor: string; cantidad_resenas: number; calificacion_promedio_emitida: number; ultima_resena: string }[] =
    data.emisores?.emisores ?? [];
  const rechazos: { id_emisor: string; total_resenas: number; resenas_rechazadas: number; tasa_rechazo: number }[] =
    data.rechazos?.emisores ?? [];

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [{ key: "a", width: 42 }, { key: "b", width: 22 }];

  ws1.addRow(["AlquilAutos Analytics — Feedback App"]);
  styleTitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([`Exportado el ${fecha}`]);
  styleSubtitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([]);

  const hdr1 = ws1.addRow(["Indicador", "Valor"]);
  hdr1.height = 20;
  styleHeader(hdr1.getCell(1));
  styleHeader(hdr1.getCell(2));

  const resumenRows: [string, string | number][] = [
    ["Total de reseñas",                 rs?.total_resenas               ?? "—"],
    ["Reseñas aprobadas",                rs?.total_aprobadas             ?? "—"],
    ["Reseñas rechazadas",               rs?.total_rechazadas            ?? "—"],
    ["Reseñas pendientes de moderación", rs?.total_pendientes            ?? "—"],
    ["Tasa de aprobación (%)",           rs?.tasa_aprobacion             ?? "—"],
    ["Calificación promedio global",     rs?.calificacion_promedio_global ?? "—"],
    ["Reseñas con respuesta",            rs?.resenas_con_respuesta       ?? "—"],
    ["Tasa de respuesta (%)",            rs?.tasa_respuesta              ?? "—"],
    ["Reseñas en la última semana",      rs?.resenas_ultima_semana       ?? "—"],
    ["Reseñas en el último mes",         rs?.resenas_ultimo_mes          ?? "—"],
  ];

  resumenRows.forEach(([label, value], i) => {
    const row = ws1.addRow([label, value]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  // ── Hoja 2: Tendencia mensual ────────────────────────────────────────────
  const ws2 = wb.addWorksheet("Tendencia mensual");
  ws2.columns = [
    { key: "a", width: 18 },
    { key: "b", width: 22 },
    { key: "c", width: 24 },
  ];

  ws2.addRow(["Reseñas aprobadas por mes"]);
  styleTitle(ws2.lastRow!.getCell(1));
  ws2.mergeCells(`A${ws2.rowCount}:C${ws2.rowCount}`);
  ws2.addRow([]);

  const hdr2 = ws2.addRow(["Período", "Cantidad reseñas", "Calif. promedio"]);
  hdr2.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdr2.getCell(c)));

  meses.forEach((m, i) => {
    const row = ws2.addRow([m.periodo, m.cantidad_resenas, m.calificacion_promedio]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws2.addRow([]);
  const totMeses = ws2.addRow([
    "Total acumulado",
    meses.reduce((a, m) => a + m.cantidad_resenas, 0),
    meses.length > 0
      ? (meses.reduce((a, m) => a + m.calificacion_promedio, 0) / meses.length).toFixed(2)
      : "—",
  ]);
  totMeses.height = 20;
  styleTotalRow(totMeses.getCell(1), "left");
  styleTotalRow(totMeses.getCell(2), "center");
  styleTotalRow(totMeses.getCell(3), "center");

  // ── Hoja 3: Distribución de calificaciones ───────────────────────────────
  const ws3 = wb.addWorksheet("Distribución");
  ws3.columns = [{ key: "a", width: 22 }, { key: "b", width: 16 }, { key: "c", width: 18 }];

  ws3.addRow(["Distribución de calificaciones (1★ – 5★)"]);
  styleTitle(ws3.lastRow!.getCell(1));
  ws3.mergeCells(`A${ws3.rowCount}:C${ws3.rowCount}`);
  ws3.addRow([]);

  const hdr3 = ws3.addRow(["Calificación", "Cantidad", "Porcentaje"]);
  hdr3.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdr3.getCell(c)));

  const distSorted = [...dist].sort((a, b) => b.calificacion - a.calificacion);
  distSorted.forEach((d, i) => {
    const row = ws3.addRow([`${d.calificacion} estrella${d.calificacion !== 1 ? "s" : ""}`, d.cantidad, `${d.porcentaje}%`]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws3.addRow([]);
  const totDist = ws3.addRow(["Total", dist.reduce((a, d) => a + d.cantidad, 0), "100%"]);
  totDist.height = 20;
  styleTotalRow(totDist.getCell(1), "left");
  styleTotalRow(totDist.getCell(2), "center");
  styleTotalRow(totDist.getCell(3), "center");

  // ── Hoja 4: Rankings ────────────────────────────────────────────────────
  const ws4 = wb.addWorksheet("Rankings");
  ws4.columns = [{ key: "a", width: 8 }, { key: "b", width: 28 }, { key: "c", width: 22 }, { key: "d", width: 18 }];

  const addRankingBlock = (
    ws: typeof ws4,
    title: string,
    rows: { id: string; calificacion_promedio: number; cantidad_resenas: number }[]
  ) => {
    ws.addRow([title]);
    styleTitle(ws.lastRow!.getCell(1));
    ws.mergeCells(`A${ws.rowCount}:D${ws.rowCount}`);

    const hdr = ws.addRow(["#", "Entidad", "Calif. promedio", "Reseñas"]);
    hdr.height = 20;
    [1, 2, 3, 4].forEach((c) => styleHeader(hdr.getCell(c)));

    rows.forEach((r, i) => {
      const row = ws.addRow([i + 1, r.id, r.calificacion_promedio, r.cantidad_resenas]);
      row.height = 18;
      styleDataValue(row.getCell(1), i % 2 === 1);
      styleSectionLabel(row.getCell(2), i % 2 === 1);
      styleDataValue(row.getCell(3), i % 2 === 1);
      styleDataValue(row.getCell(4), i % 2 === 1);
    });

    ws.addRow([]);
  };

  addRankingBlock(ws4, "Ranking — Alquiladores",  rankAlq.map((r) => ({ id: (r as any).nombre_entidad ?? `Alquilador #${r.id_alquilador}`,   calificacion_promedio: r.calificacion_promedio, cantidad_resenas: r.cantidad_resenas })));
  addRankingBlock(ws4, "Ranking — Propietarios",  rankProp.map((r) => ({ id: (r as any).nombre_entidad ?? `Propietario #${r.id_propietario}`, calificacion_promedio: r.calificacion_promedio, cantidad_resenas: r.cantidad_resenas })));
  addRankingBlock(ws4, "Ranking — Vehículos",     rankVeh.map((r) => ({ id: (r as any).nombre_entidad ?? `Vehículo #${r.id_vehiculo}`,       calificacion_promedio: r.calificacion_promedio, cantidad_resenas: r.cantidad_resenas })));

  // ── Hoja 5: Moderación y alertas ────────────────────────────────────────
  const ws5 = wb.addWorksheet("Moderación");
  ws5.columns = [{ key: "a", width: 38 }, { key: "b", width: 20 }, { key: "c", width: 20 }];

  ws5.addRow(["Estadísticas de Moderación"]);
  styleTitle(ws5.lastRow!.getCell(1));
  ws5.mergeCells(`A${ws5.rowCount}:C${ws5.rowCount}`);
  ws5.addRow([]);

  const hdrMod = ws5.addRow(["Indicador", "Valor"]);
  hdrMod.height = 20;
  styleHeader(hdrMod.getCell(1));
  styleHeader(hdrMod.getCell(2));

  const modRows: [string, string | number][] = [
    ["Total de moderaciones",           tiempo?.total_moderaciones   ?? "—"],
    ["Tiempo promedio (días)",          tiempo?.promedio_dias        ?? "—"],
    ["Mediana (días)",                  tiempo?.mediana_dias         ?? "—"],
    ["Percentil 90 (días)",             tiempo?.percentil_90_dias    ?? "—"],
    ["Promedio — Aprobadas (días)",     tiempo?.por_estado?.["Aprobada"]?.promedio_dias  ?? "—"],
    ["Promedio — Rechazadas (días)",    tiempo?.por_estado?.["Rechazada"]?.promedio_dias ?? "—"],
  ];
  modRows.forEach(([label, value], i) => {
    const row = ws5.addRow([label, value]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  // Rechazos por emisor
  if (rechazos.length > 0) {
    ws5.addRow([]);
    ws5.addRow(["Emisores con alta concentración de rechazos"]);
    styleTitle(ws5.lastRow!.getCell(1));
    ws5.mergeCells(`A${ws5.rowCount}:C${ws5.rowCount}`);

    ws5.columns = [{ key: "a", width: 24 }, { key: "b", width: 14 }, { key: "c", width: 18 }, { key: "d", width: 14 }];
    const hdrRech = ws5.addRow(["Emisor", "Total", "Rechazadas", "Tasa (%)"]);
    hdrRech.height = 20;
    [1, 2, 3, 4].forEach((c) => styleHeader(hdrRech.getCell(c)));

    rechazos.forEach((r, i) => {
      const row = ws5.addRow([(r as any).nombre_entidad ?? `#${r.id_emisor}`, r.total_resenas, r.resenas_rechazadas, `${r.tasa_rechazo}%`]);
      row.height = 18;
      styleSectionLabel(row.getCell(1), i % 2 === 1);
      styleDataValue(row.getCell(2), i % 2 === 1);
      styleDataValue(row.getCell(3), i % 2 === 1);
      styleDataValue(row.getCell(4), i % 2 === 1);
    });
  }

  // Emisores recurrentes
  if (emisores.length > 0) {
    ws5.addRow([]);
    ws5.addRow(["Emisores recurrentes"]);
    styleTitle(ws5.lastRow!.getCell(1));
    ws5.mergeCells(`A${ws5.rowCount}:C${ws5.rowCount}`);

    ws5.columns = [{ key: "a", width: 24 }, { key: "b", width: 14 }, { key: "c", width: 26 }];
    const hdrEm = ws5.addRow(["Emisor", "Reseñas", "Calif. promedio emitida"]);
    hdrEm.height = 20;
    [1, 2, 3].forEach((c) => styleHeader(hdrEm.getCell(c)));

    emisores.forEach((e, i) => {
      const row = ws5.addRow([(e as any).nombre_entidad ?? `#${e.id_emisor}`, e.cantidad_resenas, e.calificacion_promedio_emitida]);
      row.height = 18;
      styleSectionLabel(row.getCell(1), i % 2 === 1);
      styleDataValue(row.getCell(2), i % 2 === 1);
      styleDataValue(row.getCell(3), i % 2 === 1);
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `feedback-metrics-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

async function exportPDF(data: FeedbackData) {
  const { default: jsPDF }    = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const rs  = data.resumen;

  let y = addPDFHeader(doc, "Feedback App");

  // ── Resumen global ────────────────────────────────────────────────────────
  y = addPDFSectionTitle(doc, "RESUMEN GLOBAL", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de reseñas",                 String(rs?.total_resenas               ?? "—")],
      ["Reseñas aprobadas",                String(rs?.total_aprobadas             ?? "—")],
      ["Reseñas rechazadas",               String(rs?.total_rechazadas            ?? "—")],
      ["Pendientes de moderación",         String(rs?.total_pendientes            ?? "—")],
      ["Tasa de aprobación",               rs ? `${rs.tasa_aprobacion}%`          : "—"],
      ["Calificación promedio global",     rs ? `${rs.calificacion_promedio_global}/5` : "—"],
      ["Tasa de respuesta a reseñas",      rs ? `${rs.tasa_respuesta}%`           : "—"],
      ["Reseñas en el último mes",         String(rs?.resenas_ultimo_mes          ?? "—")],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Distribución ──────────────────────────────────────────────────────────
  const dist: { calificacion: number; cantidad: number; porcentaje: number }[] =
    data.distribucion?.distribucion ?? [];
  const distSorted = [...dist].sort((a, b) => b.calificacion - a.calificacion);

  y = addPDFSectionTitle(doc, "DISTRIBUCIÓN DE CALIFICACIONES", y);
  autoTable(doc, {
    startY: y,
    head: [["Calificación", "Cantidad", "Porcentaje"]],
    body: distSorted.map((d) => [
      `${d.calificacion} estrella${d.calificacion !== 1 ? "s" : ""}`,
      String(d.cantidad),
      `${d.porcentaje}%`,
    ]),
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 55, halign: "center" }, 2: { cellWidth: 45, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Tendencia mensual ─────────────────────────────────────────────────────
  const meses: { periodo: string; cantidad_resenas: number; calificacion_promedio: number }[] =
    data.tendencia?.datos ?? [];

  if (y > 210) { doc.addPage(); y = 20; }
  y = addPDFSectionTitle(doc, "RESEÑAS APROBADAS POR MES", y);
  autoTable(doc, {
    startY: y,
    head: [["Período", "Reseñas", "Calif. promedio"]],
    body: meses.map((m) => [m.periodo, String(m.cantidad_resenas), String(m.calificacion_promedio)]),
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 60, halign: "center" }, 2: { cellWidth: 50, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Rankings ──────────────────────────────────────────────────────────────
  const addRankingPDF = (
    title: string,
    rows: { id: string; calificacion_promedio: number; cantidad_resenas: number }[]
  ) => {
    if (y > 210) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, title, y);
    autoTable(doc, {
      startY: y,
      head: [["#", "Entidad", "Calif. promedio", "Reseñas"]],
      body: rows.map((r, i) => [String(i + 1), r.id, `${r.calificacion_promedio} / 5`, String(r.cantidad_resenas)]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 12, halign: "center" }, 1: { cellWidth: 90 }, 2: { cellWidth: 48, halign: "center" }, 3: { cellWidth: 30, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  };

  addRankingPDF("RANKING — ALQUILADORES",  (data.rankAlq?.ranking ?? []).map((r: any) => ({ id: r.nombre_entidad ?? `Alquilador #${r.id_alquilador}`,   calificacion_promedio: r.calificacion_promedio, cantidad_resenas: r.cantidad_resenas })));
  addRankingPDF("RANKING — PROPIETARIOS",  (data.rankProp?.ranking ?? []).map((r: any) => ({ id: r.nombre_entidad ?? `Propietario #${r.id_propietario}`, calificacion_promedio: r.calificacion_promedio, cantidad_resenas: r.cantidad_resenas })));
  addRankingPDF("RANKING — VEHÍCULOS",     (data.rankVeh?.ranking ?? []).map((r: any) => ({ id: r.nombre_entidad ?? `Vehículo #${r.id_vehiculo}`,       calificacion_promedio: r.calificacion_promedio, cantidad_resenas: r.cantidad_resenas })));

  // ── Moderación ────────────────────────────────────────────────────────────
  const tiempo = data.tiempo;
  if (tiempo) {
    if (y > 210) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, "ESTADÍSTICAS DE MODERACIÓN", y);
    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total de moderaciones",        String(tiempo.total_moderaciones)],
        ["Tiempo promedio (días)",        String(tiempo.promedio_dias)],
        ["Mediana (días)",                String(tiempo.mediana_dias)],
        ["Percentil 90 (días)",           String(tiempo.percentil_90_dias)],
        ["Promedio aprobación (días)",    String(tiempo.por_estado?.["Aprobada"]?.promedio_dias ?? "—")],
        ["Promedio rechazo (días)",       String(tiempo.por_estado?.["Rechazada"]?.promedio_dias ?? "—")],
      ],
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Rechazos por emisor ───────────────────────────────────────────────────
  const rechazos: any[] = data.rechazos?.emisores ?? [];
  if (rechazos.length > 0) {
    if (y > 210) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, "EMISORES CON ALTA CONCENTRACIÓN DE RECHAZOS", y);
    autoTable(doc, {
      startY: y,
      head: [["Emisor", "Total", "Rechazadas", "Tasa (%)"]],
      body: rechazos.map((r) => [r.nombre_entidad ?? `#${r.id_emisor}`, String(r.total_resenas), String(r.resenas_rechazadas), `${r.tasa_rechazo}%`]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 35, halign: "center" }, 2: { cellWidth: 40, halign: "center" }, 3: { cellWidth: 40, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  addPDFFooter(doc);
  doc.save(`feedback-metrics-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function exportFeedback(format: ExportFormat): Promise<void> {
  const data = await fetchFeedbackData();
  if (format === "excel") await exportExcel(data);
  else await exportPDF(data);
}
