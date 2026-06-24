import type { Cell } from "exceljs";

export const XL_COLORS = {
  BLUE:       "FF1A5CFF",
  BLUE_LIGHT: "FFE8EEFF",
  WHITE:      "FFFFFFFF",
  DARK:       "FF111827",
  GRAY:       "FF6B7280",
} as const;

export function styleHeader(cell: Cell) {
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: XL_COLORS.BLUE } };
  cell.font      = { bold: true, color: { argb: XL_COLORS.WHITE }, size: 10 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border    = { bottom: { style: "thin", color: { argb: XL_COLORS.WHITE } } };
}

export function styleTitle(cell: Cell) {
  cell.font      = { bold: true, color: { argb: XL_COLORS.BLUE }, size: 12 };
  cell.alignment = { horizontal: "left", vertical: "middle" };
}

export function styleSubtitle(cell: Cell) {
  cell.font = { italic: true, color: { argb: XL_COLORS.GRAY }, size: 9 };
}

export function styleDataLabel(cell: Cell) {
  cell.font      = { color: { argb: XL_COLORS.DARK }, size: 10 };
  cell.alignment = { horizontal: "left", vertical: "middle" };
}

export function styleDataValue(cell: Cell, shade: boolean) {
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: shade ? XL_COLORS.BLUE_LIGHT : XL_COLORS.WHITE } };
  cell.font      = { color: { argb: XL_COLORS.DARK }, size: 10 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
}

export function styleSectionLabel(cell: Cell, shade: boolean) {
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: shade ? XL_COLORS.BLUE_LIGHT : XL_COLORS.WHITE } };
  styleDataLabel(cell);
}

export function styleTotalRow(cell: Cell, align: "left" | "center" = "left") {
  cell.font      = { bold: true, color: { argb: XL_COLORS.BLUE } };
  cell.alignment = { horizontal: align };
}
