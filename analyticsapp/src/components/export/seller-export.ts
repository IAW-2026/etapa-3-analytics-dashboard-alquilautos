import type { ExportFormat } from "./export-config";
import {
  styleHeader, styleTitle, styleSubtitle,
  styleDataValue, styleSectionLabel, styleTotalRow,
} from "./excel-styles";
import { PDF_TABLE_STYLES, addPDFHeader, addPDFSectionTitle, addPDFFooter } from "./pdf-styles";
import type {
  VehiculoTop,
  PropietarioTop,
  DistribucionMarca,
  IngresoPeriodo,
  ActividadRecienteData,
} from "@/lib/seller-metrics.types";

async function fetchSellerData() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [resumen, ocupacion, vehiculosTop, propietariosTop, marcas, ingresos, tasa, actividad] =
    await Promise.all([
      fetch("/api/resumen-general").then((r) => r.json()),
      fetch(`/api/ocupacion-vehiculos?desde=${desde}&hasta=${hasta}`).then((r) => r.json()),
      fetch("/api/vehiculos-top?limit=10").then((r) => r.json()),
      fetch("/api/propietarios-top?limit=10").then((r) => r.json()),
      fetch("/api/distribucion-marcas").then((r) => r.json()),
      fetch("/api/ingresos-por-periodo?granularity=month").then((r) => r.json()),
      fetch("/api/tasa-conversion").then((r) => r.json()),
      fetch("/api/actividad-reciente?limit=10").then((r) => r.json()),
    ]);

  return { resumen, ocupacion, vehiculosTop, propietariosTop, marcas, ingresos, tasa, actividad };
}

type SellerData = Awaited<ReturnType<typeof fetchSellerData>>;

// ─── EXCEL ────────────────────────────────────────────────────────────────────

async function exportExcel(data: SellerData) {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "AlquilAutos Analytics";
  wb.created = new Date();

  const fecha = new Date().toLocaleDateString("es-AR");

  const vehiculosTop: VehiculoTop[] = data.vehiculosTop ?? [];
  const propietariosTop: PropietarioTop[] = data.propietariosTop ?? [];
  const marcas: DistribucionMarca[] = data.marcas ?? [];
  const ingresos: IngresoPeriodo[] = data.ingresos ?? [];
  const porEstado: [string, number][] = Object.entries(data.resumen?.reservas?.por_estado ?? {});
  const ultimasReservas: ActividadRecienteData["ultimas_reservas"] = data.actividad?.ultimas_reservas ?? [];
  const nuevosPropietarios: ActividadRecienteData["nuevos_propietarios"] = data.actividad?.nuevos_propietarios ?? [];
  const pendientesVencidos: ActividadRecienteData["pendientes_vencidos"] = data.actividad?.pendientes_vencidos ?? [];

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Resumen");
  ws1.columns = [{ key: "a", width: 42 }, { key: "b", width: 22 }];

  ws1.addRow(["AlquilAutos Analytics — Seller App"]);
  styleTitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([`Exportado el ${fecha}`]);
  styleSubtitle(ws1.lastRow!.getCell(1));
  ws1.mergeCells(`A${ws1.rowCount}:B${ws1.rowCount}`);

  ws1.addRow([]);

  const resumenRows: [string, string | number][] = [
    ["Total de propietarios",   data.resumen?.total_propietarios ?? "—"],
    ["Vehículos publicados",    data.resumen?.vehiculos?.total ?? "—"],
    ["Vehículos disponibles",   data.resumen?.vehiculos?.disponibles ?? "—"],
    ["Vehículos alquilados",    data.resumen?.vehiculos?.alquilados ?? "—"],
    ["Reservas totales",        data.resumen?.reservas?.total ?? "—"],
    ["Ingresos totales (ARS)",  data.resumen?.ingresos_totales_ars ?? "—"],
    ["Ocupación promedio (%)",  data.ocupacion?.ocupacion_promedio_plataforma ?? "—"],
    ["Tasa de finalización (%)",  data.tasa?.tasa_conversion ?? "—"],
    ["Tasa de cancelación (%)",   data.tasa?.tasa_cancelacion ?? "—"],
    ["Días promedio de reserva",  data.tasa?.tiempo_promedio_ciclo_dias ?? "—"],
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

  // ── Hoja 2: Reservas por Estado ──────────────────────────────────────────
  const ws2 = wb.addWorksheet("Reservas por Estado");
  ws2.columns = [{ key: "a", width: 22 }, { key: "b", width: 16 }];

  ws2.addRow(["Reservas por estado"]);
  styleTitle(ws2.lastRow!.getCell(1));
  ws2.mergeCells(`A${ws2.rowCount}:B${ws2.rowCount}`);
  ws2.addRow([]);

  const hdr2 = ws2.addRow(["Estado", "Cantidad"]);
  hdr2.height = 20;
  styleHeader(hdr2.getCell(1));
  styleHeader(hdr2.getCell(2));

  porEstado.forEach(([estado, cantidad], i) => {
    const row = ws2.addRow([estado, cantidad]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  ws2.addRow([]);
  const totReservasRow = ws2.addRow(["Total", porEstado.reduce((a, [, c]) => a + c, 0)]);
  totReservasRow.height = 20;
  styleTotalRow(totReservasRow.getCell(1), "left");
  styleTotalRow(totReservasRow.getCell(2), "center");

  // ── Hoja 3: Top Vehículos ────────────────────────────────────────────────
  const ws3 = wb.addWorksheet("Top Vehículos");
  ws3.columns = [
    { key: "a", width: 6 }, { key: "b", width: 28 }, { key: "c", width: 24 },
    { key: "d", width: 14 }, { key: "e", width: 18 },
  ];

  ws3.addRow(["Vehículos con más alquileres completados"]);
  styleTitle(ws3.lastRow!.getCell(1));
  ws3.mergeCells(`A${ws3.rowCount}:E${ws3.rowCount}`);
  ws3.addRow([]);

  const hdr3 = ws3.addRow(["#", "Vehículo", "Propietario", "Alquileres", "Ingresos (ARS)"]);
  hdr3.height = 20;
  [1, 2, 3, 4, 5].forEach((c) => styleHeader(hdr3.getCell(c)));

  vehiculosTop.forEach((v, i) => {
    const row = ws3.addRow([
      i + 1,
      `${v.marca} ${v.modelo} (${v.anio})`,
      `${v.propietario?.nombre ?? ""} ${v.propietario?.apellido ?? ""}`.trim() || "—",
      v.cantidad_alquileres,
      v.ingresos_generados,
    ]);
    row.height = 18;
    styleDataValue(row.getCell(1), i % 2 === 1);
    styleSectionLabel(row.getCell(2), i % 2 === 1);
    styleSectionLabel(row.getCell(3), i % 2 === 1);
    styleDataValue(row.getCell(4), i % 2 === 1);
    styleDataValue(row.getCell(5), i % 2 === 1);
  });

  ws3.addRow([]);
  const totVehRow = ws3.addRow([
    "", "", "Total",
    vehiculosTop.reduce((a, v) => a + v.cantidad_alquileres, 0),
    vehiculosTop.reduce((a, v) => a + v.ingresos_generados, 0),
  ]);
  totVehRow.height = 20;
  styleTotalRow(totVehRow.getCell(3), "left");
  styleTotalRow(totVehRow.getCell(4), "center");
  styleTotalRow(totVehRow.getCell(5), "center");

  // ── Hoja 4: Top Propietarios ─────────────────────────────────────────────
  const ws4 = wb.addWorksheet("Top Propietarios");
  ws4.columns = [
    { key: "a", width: 6 }, { key: "b", width: 28 }, { key: "c", width: 28 },
    { key: "d", width: 14 }, { key: "e", width: 20 }, { key: "f", width: 18 },
  ];

  ws4.addRow(["Propietarios por ingresos generados"]);
  styleTitle(ws4.lastRow!.getCell(1));
  ws4.mergeCells(`A${ws4.rowCount}:F${ws4.rowCount}`);
  ws4.addRow([]);

  const hdr4 = ws4.addRow(["#", "Nombre", "Email", "Vehículos", "Reservas Finalizadas", "Ingresos (ARS)"]);
  hdr4.height = 20;
  [1, 2, 3, 4, 5, 6].forEach((c) => styleHeader(hdr4.getCell(c)));

  propietariosTop.forEach((p, i) => {
    const row = ws4.addRow([
      i + 1,
      `${p.nombre} ${p.apellido}`,
      p.email,
      p.cantidad_vehiculos,
      p.cantidad_reservas_finalizadas,
      p.ingresos_totales,
    ]);
    row.height = 18;
    styleDataValue(row.getCell(1), i % 2 === 1);
    styleSectionLabel(row.getCell(2), i % 2 === 1);
    styleSectionLabel(row.getCell(3), i % 2 === 1);
    styleDataValue(row.getCell(4), i % 2 === 1);
    styleDataValue(row.getCell(5), i % 2 === 1);
    styleDataValue(row.getCell(6), i % 2 === 1);
  });

  ws4.addRow([]);
  const totPropRow = ws4.addRow([
    "", "", "Total",
    propietariosTop.reduce((a, p) => a + p.cantidad_vehiculos, 0),
    propietariosTop.reduce((a, p) => a + p.cantidad_reservas_finalizadas, 0),
    propietariosTop.reduce((a, p) => a + p.ingresos_totales, 0),
  ]);
  totPropRow.height = 20;
  styleTotalRow(totPropRow.getCell(3), "left");
  styleTotalRow(totPropRow.getCell(4), "center");
  styleTotalRow(totPropRow.getCell(5), "center");
  styleTotalRow(totPropRow.getCell(6), "center");

  // ── Hoja 5: Distribución por Marca ───────────────────────────────────────
  const ws5 = wb.addWorksheet("Distribución por Marca");
  ws5.columns = [
    { key: "a", width: 20 }, { key: "b", width: 16 }, { key: "c", width: 22 }, { key: "d", width: 18 },
  ];

  ws5.addRow(["Vehículos agrupados por marca"]);
  styleTitle(ws5.lastRow!.getCell(1));
  ws5.mergeCells(`A${ws5.rowCount}:D${ws5.rowCount}`);
  ws5.addRow([]);

  const hdr5 = ws5.addRow(["Marca", "Vehículos", "Reservas Finalizadas", "Ingresos (ARS)"]);
  hdr5.height = 20;
  [1, 2, 3, 4].forEach((c) => styleHeader(hdr5.getCell(c)));

  marcas.forEach((m, i) => {
    const row = ws5.addRow([m.marca, m.cantidad_vehiculos, m.cantidad_reservas_finalizadas, m.ingresos_totales]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
    styleDataValue(row.getCell(4), i % 2 === 1);
  });

  ws5.addRow([]);
  const totMarcaRow = ws5.addRow([
    "Total",
    marcas.reduce((a, m) => a + m.cantidad_vehiculos, 0),
    marcas.reduce((a, m) => a + m.cantidad_reservas_finalizadas, 0),
    marcas.reduce((a, m) => a + m.ingresos_totales, 0),
  ]);
  totMarcaRow.height = 20;
  styleTotalRow(totMarcaRow.getCell(1), "left");
  styleTotalRow(totMarcaRow.getCell(2), "center");
  styleTotalRow(totMarcaRow.getCell(3), "center");
  styleTotalRow(totMarcaRow.getCell(4), "center");

  // ── Hoja 6: Ingresos por Período ─────────────────────────────────────────
  const ws6 = wb.addWorksheet("Ingresos por Período");
  ws6.columns = [{ key: "a", width: 16 }, { key: "b", width: 20 }, { key: "c", width: 20 }];

  ws6.addRow(["Ingresos por período (mensual)"]);
  styleTitle(ws6.lastRow!.getCell(1));
  ws6.mergeCells(`A${ws6.rowCount}:C${ws6.rowCount}`);
  ws6.addRow([]);

  const hdr6 = ws6.addRow(["Período", "Ingresos (ARS)", "Reservas"]);
  hdr6.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdr6.getCell(c)));

  ingresos.forEach((p, i) => {
    const row = ws6.addRow([p.periodo, p.ingresos, p.cantidad_reservas]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws6.addRow([]);
  const totIngRow = ws6.addRow([
    "Total",
    ingresos.reduce((a, p) => a + p.ingresos, 0),
    ingresos.reduce((a, p) => a + p.cantidad_reservas, 0),
  ]);
  totIngRow.height = 20;
  styleTotalRow(totIngRow.getCell(1), "left");
  styleTotalRow(totIngRow.getCell(2), "center");
  styleTotalRow(totIngRow.getCell(3), "center");

  // ── Hoja 7: Actividad Reciente ───────────────────────────────────────────
  const ws7 = wb.addWorksheet("Actividad Reciente");
  ws7.columns = [{ key: "a", width: 24 }, { key: "b", width: 28 }, { key: "c", width: 18 }];

  ws7.addRow(["Actividad reciente"]);
  styleTitle(ws7.lastRow!.getCell(1));
  ws7.mergeCells(`A${ws7.rowCount}:C${ws7.rowCount}`);
  ws7.addRow([]);

  ws7.addRow(["Últimas reservas"]);
  styleTitle(ws7.lastRow!.getCell(1));
  const hdrRes = ws7.addRow(["Estado", "Vehículo", "Fecha"]);
  hdrRes.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdrRes.getCell(c)));
  ultimasReservas.forEach((r, i) => {
    const row = ws7.addRow([r.estado, r.vehiculo, new Date(r.createdAt).toLocaleDateString("es-AR")]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleSectionLabel(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws7.addRow([]);
  ws7.addRow(["Nuevos propietarios"]);
  styleTitle(ws7.lastRow!.getCell(1));
  const hdrProp = ws7.addRow(["Nombre", "Email", "Fecha"]);
  hdrProp.height = 20;
  [1, 2, 3].forEach((c) => styleHeader(hdrProp.getCell(c)));
  nuevosPropietarios.forEach((p, i) => {
    const row = ws7.addRow([`${p.nombre} ${p.apellido}`, p.email, new Date(p.createdAt).toLocaleDateString("es-AR")]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleSectionLabel(row.getCell(2), i % 2 === 1);
    styleDataValue(row.getCell(3), i % 2 === 1);
  });

  ws7.addRow([]);
  ws7.addRow(["Pendientes vencidos (+24hs sin respuesta)"]);
  styleTitle(ws7.lastRow!.getCell(1));
  const hdrPend = ws7.addRow(["Vehículo", "Fecha"]);
  hdrPend.height = 20;
  [1, 2].forEach((c) => styleHeader(hdrPend.getCell(c)));
  pendientesVencidos.forEach((r, i) => {
    const row = ws7.addRow([r.vehiculo, new Date(r.createdAt).toLocaleDateString("es-AR")]);
    row.height = 18;
    styleSectionLabel(row.getCell(1), i % 2 === 1);
    styleDataValue(row.getCell(2), i % 2 === 1);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `seller-metrics-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

async function exportPDF(data: SellerData) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = addPDFHeader(doc, "Seller App");

  const vehiculosTop: VehiculoTop[] = data.vehiculosTop ?? [];
  const propietariosTop: PropietarioTop[] = data.propietariosTop ?? [];
  const marcas: DistribucionMarca[] = data.marcas ?? [];
  const ingresos: IngresoPeriodo[] = data.ingresos ?? [];
  const porEstado: [string, number][] = Object.entries(data.resumen?.reservas?.por_estado ?? {});

  // ── Resumen general ───────────────────────────────────────────────────────
  y = addPDFSectionTitle(doc, "RESUMEN GENERAL", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de propietarios",  String(data.resumen?.total_propietarios ?? "—")],
      ["Vehículos publicados",   String(data.resumen?.vehiculos?.total ?? "—")],
      ["Vehículos disponibles",  String(data.resumen?.vehiculos?.disponibles ?? "—")],
      ["Vehículos alquilados",   String(data.resumen?.vehiculos?.alquilados ?? "—")],
      ["Reservas totales",       String(data.resumen?.reservas?.total ?? "—")],
      ["Ingresos totales (ARS)", String(data.resumen?.ingresos_totales_ars ?? "—")],
      ["Ocupación promedio (%)", String(data.ocupacion?.ocupacion_promedio_plataforma ?? "—")],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Reservas por estado ───────────────────────────────────────────────────
  y = addPDFSectionTitle(doc, "RESERVAS POR ESTADO", y);
  autoTable(doc, {
    startY: y,
    head: [["Estado", "Cantidad"]],
    body: porEstado.map(([estado, cantidad]) => [estado, String(cantidad)]),
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Tasa de conversión ────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = addPDFSectionTitle(doc, "TASA DE CONVERSIÓN", y);
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Tasa de finalización (%)",  String(data.tasa?.tasa_conversion ?? "—")],
      ["Tasa de cancelación (%)",   String(data.tasa?.tasa_cancelacion ?? "—")],
      ["Días promedio de reserva",  String(data.tasa?.tiempo_promedio_ciclo_dias ?? "—")],
    ],
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Top vehículos ─────────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = addPDFSectionTitle(doc, "TOP VEHÍCULOS", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Vehículo", "Propietario", "Alquileres", "Ingresos (ARS)"]],
    body: vehiculosTop.map((v, i) => [
      String(i + 1),
      `${v.marca} ${v.modelo} (${v.anio})`,
      `${v.propietario?.nombre ?? ""} ${v.propietario?.apellido ?? ""}`.trim() || "—",
      String(v.cantidad_alquileres),
      String(v.ingresos_generados),
    ]),
    ...PDF_TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 10 }, 1: { cellWidth: 55 }, 2: { cellWidth: 45 },
      3: { cellWidth: 30, halign: "center" }, 4: { cellWidth: 40, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Top propietarios ──────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = addPDFSectionTitle(doc, "TOP PROPIETARIOS", y);
  autoTable(doc, {
    startY: y,
    head: [["#", "Nombre", "Vehículos", "Reservas Fin.", "Ingresos (ARS)"]],
    body: propietariosTop.map((p, i) => [
      String(i + 1),
      `${p.nombre} ${p.apellido}`,
      String(p.cantidad_vehiculos),
      String(p.cantidad_reservas_finalizadas),
      String(p.ingresos_totales),
    ]),
    ...PDF_TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 10 }, 1: { cellWidth: 70 }, 2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 35, halign: "center" }, 4: { cellWidth: 35, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Distribución por marca ────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = addPDFSectionTitle(doc, "DISTRIBUCIÓN POR MARCA", y);
  autoTable(doc, {
    startY: y,
    head: [["Marca", "Vehículos", "Reservas Fin.", "Ingresos (ARS)"]],
    body: marcas.map((m) => [
      m.marca, String(m.cantidad_vehiculos), String(m.cantidad_reservas_finalizadas), String(m.ingresos_totales),
    ]),
    ...PDF_TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 60 }, 1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 40, halign: "center" }, 3: { cellWidth: 40, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Ingresos por período ──────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = addPDFSectionTitle(doc, "INGRESOS POR PERÍODO", y);
  autoTable(doc, {
    startY: y,
    head: [["Período", "Ingresos (ARS)", "Reservas"]],
    body: ingresos.map((p) => [p.periodo, String(p.ingresos), String(p.cantidad_reservas)]),
    ...PDF_TABLE_STYLES,
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60, halign: "center" }, 2: { cellWidth: 60, halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Actividad reciente ────────────────────────────────────────────────────
  const ultimasReservas: ActividadRecienteData["ultimas_reservas"] = data.actividad?.ultimas_reservas ?? [];
  const nuevosPropietarios: ActividadRecienteData["nuevos_propietarios"] = data.actividad?.nuevos_propietarios ?? [];
  const pendientesVencidos: ActividadRecienteData["pendientes_vencidos"] = data.actividad?.pendientes_vencidos ?? [];

  if (ultimasReservas.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, "ÚLTIMAS RESERVAS", y);
    autoTable(doc, {
      startY: y,
      head: [["Estado", "Vehículo", "Fecha"]],
      body: ultimasReservas.map((r) => [r.estado, r.vehiculo, new Date(r.createdAt).toLocaleDateString("es-AR")]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 90 }, 2: { cellWidth: 50, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (nuevosPropietarios.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, "NUEVOS PROPIETARIOS", y);
    autoTable(doc, {
      startY: y,
      head: [["Nombre", "Email", "Fecha"]],
      body: nuevosPropietarios.map((p) => [`${p.nombre} ${p.apellido}`, p.email, new Date(p.createdAt).toLocaleDateString("es-AR")]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 70 }, 2: { cellWidth: 50, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  if (pendientesVencidos.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = addPDFSectionTitle(doc, "PENDIENTES VENCIDOS (+24HS)", y);
    autoTable(doc, {
      startY: y,
      head: [["Vehículo", "Fecha"]],
      body: pendientesVencidos.map((r) => [r.vehiculo, new Date(r.createdAt).toLocaleDateString("es-AR")]),
      ...PDF_TABLE_STYLES,
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90, halign: "center" } },
      margin: { left: 14, right: 14 },
    });
  }

  addPDFFooter(doc);
  doc.save(`seller-metrics-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function exportSeller(format: ExportFormat): Promise<void> {
  const data = await fetchSellerData();
  if (format === "excel") {
    await exportExcel(data);
  } else {
    await exportPDF(data);
  }
}
