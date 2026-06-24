import type jsPDF from "jspdf";

export const PDF_COLORS = {
  BLUE:  [26, 92, 255] as [number, number, number],
  LIGHT: [232, 238, 255] as [number, number, number],
  GRAY:  [100, 100, 100] as [number, number, number],
  WHITE: [255, 255, 255] as [number, number, number],
  DARK:  [17, 24, 39] as [number, number, number],
};

export const PDF_TABLE_STYLES = {
  headStyles: {
    fillColor: PDF_COLORS.BLUE,
    textColor: PDF_COLORS.WHITE,
    fontStyle: "bold" as const,
    fontSize: 9,
  },
  bodyStyles: { fontSize: 9 },
  alternateRowStyles: { fillColor: PDF_COLORS.LIGHT },
  // fuerza centrado en columnas 1+ tanto en header como en body
  didParseCell: (data: any) => {
    if (data.column.index >= 1) {
      data.cell.styles.halign = "center";
    }
  },
};

export function addPDFHeader(doc: jsPDF, appName: string): number {
  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  doc.setFillColor(...PDF_COLORS.BLUE);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(...PDF_COLORS.WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AlquilAutos Analytics", 14, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${appName} — Reporte de métricas`, 14, 21);
  doc.setFontSize(9);
  doc.text(`Exportado el ${fecha}`, 196, 21, { align: "right" });
  doc.setTextColor(...PDF_COLORS.DARK);

  return 38;
}

export function addPDFSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.BLUE);
  doc.text(title, 14, y);
  doc.setTextColor(...PDF_COLORS.DARK);
  return y + 4;
}

export function addPDFFooter(doc: jsPDF) {
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.GRAY);
    doc.text(
      `AlquilAutos Analytics · Página ${i} de ${totalPages}`,
      105, 290,
      { align: "center" },
    );
  }
}
