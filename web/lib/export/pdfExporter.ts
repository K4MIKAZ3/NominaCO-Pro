import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SMMLV } from "@/lib/payroll/colombiaLaborLaw2026";
import { formatMoney, formatMonthName, formatTime } from "@/lib/format";
import { totalHourBreakdown } from "@/lib/payroll/models";
import type { EmployeeProfile, MonthlyPayroll, WorkDayEntry } from "@/lib/payroll/models";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 36;
const FOOTER_Y = PAGE_H - 28;

const BRAND = { r: 34, g: 197, b: 94 };
const BRAND_DARK = { r: 5, g: 46, b: 22 };
const MUTED = { r: 100, g: 116, b: 139 };
const DANGER = { r: 185, g: 28, b: 28 };
const SURFACE = { r: 248, g: 250, b: 252 };

let logoDataUrl: string | null = null;

async function loadLogoDataUrl(): Promise<string | null> {
  if (logoDataUrl) return logoDataUrl;
  try {
    const response = await fetch("/icon.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoDataUrl = typeof reader.result === "string" ? reader.result : null;
        resolve(logoDataUrl);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function downloadPdf(doc: jsPDF, fileName: string) {
  doc.save(fileName);
}

function drawFooter(doc: jsPDF) {
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, FOOTER_Y - 10, PAGE_W - MARGIN, FOOTER_Y - 10);
  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Ley 2466/2025 · SMMLV ${formatMoney(SMMLV)} · Uso personal · No constituye nómina oficial`,
    MARGIN,
    FOOTER_Y,
  );
  doc.text("nominapp.xyz · contacto@nominapp.xyz", PAGE_W - MARGIN, FOOTER_Y, { align: "right" });
}

function drawHeader(
  doc: jsPDF,
  logo: string | null,
  title: string,
  subtitle: string,
): number {
  let y = MARGIN;

  if (logo) {
    doc.addImage(logo, "PNG", MARGIN, y, 32, 32);
  } else {
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.roundedRect(MARGIN, y, 32, 32, 6, 6, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("N", MARGIN + 11, y + 22);
  }

  doc.setFontSize(14);
  doc.setTextColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
  doc.setFont("helvetica", "bold");
  doc.text("Nominapp", MARGIN + 40, y + 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text(title, MARGIN + 40, y + 28);

  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const badgeW = 88;
  doc.setFillColor(SURFACE.r, SURFACE.g, SURFACE.b);
  doc.roundedRect(PAGE_W - MARGIN - badgeW, y + 2, badgeW, 16, 4, 4, "F");
  doc.text("Uso personal", PAGE_W - MARGIN - badgeW / 2, y + 12, { align: "center" });

  doc.setFontSize(8);
  doc.text(subtitle, PAGE_W - MARGIN, y + 30, { align: "right" });

  y += 42;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);

  return y + 10;
}

function drawEmployeeCard(
  doc: jsPDF,
  profile: EmployeeProfile,
  periodLabel: string,
  y: number,
): number {
  const cardH = 52;
  doc.setFillColor(SURFACE.r, SURFACE.g, SURFACE.b);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, cardH, 6, 6, "F");

  const col1 = MARGIN + 12;
  const col2 = PAGE_W / 2 + 4;
  const row1 = y + 16;
  const row2 = y + 32;

  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text("Empleado", col1, row1 - 5);
  doc.text("Documento", col2, row1 - 5);
  doc.text("Cargo", col1, row2 - 5);
  doc.text("Período / generado", col2, row2 - 5);

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(profile.name || "—", col1, row1 + 4);
  doc.text(profile.documentId || "—", col2, row1 + 4);
  doc.setFont("helvetica", "normal");
  doc.text(profile.jobTitle || "—", col1, row2 + 4);
  doc.text(
    `${periodLabel} · ${new Date().toLocaleDateString("es-CO")}`,
    col2,
    row2 + 4,
  );

  return y + cardH + 10;
}

function drawSummaryStrip(
  doc: jsPDF,
  payroll: MonthlyPayroll,
  y: number,
): number {
  const items = [
    `Días trabajados: ${payroll.workedDays}`,
    `Valor día: ${formatMoney(payroll.dailyRate)}`,
    `Valor hora: ${formatMoney(Math.trunc(payroll.hourlyRate))}`,
  ];
  if (payroll.remuneratedRestDays > 0) {
    items.push(`Descansos rem.: ${payroll.remuneratedRestDays}`);
  }

  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.text(items.join("   ·   "), MARGIN, y);
  return y + 12;
}

function tableStyles(compact = false) {
  return {
    fontSize: compact ? 7.5 : 8,
    cellPadding: compact ? 2 : 2.5,
    lineColor: [226, 232, 240] as [number, number, number],
    lineWidth: 0.25,
  };
}

function drawNetoBox(doc: jsPDF, neto: number, y: number): number {
  const boxH = 34;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(1);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, boxH, 6, 6, "FD");

  doc.setFontSize(9);
  doc.setTextColor(BRAND_DARK.r, BRAND_DARK.g, BRAND_DARK.b);
  doc.setFont("helvetica", "bold");
  doc.text("NETO A RECIBIR", MARGIN + 14, y + 14);

  doc.setFontSize(16);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(formatMoney(neto), PAGE_W - MARGIN - 14, y + 22, { align: "right" });

  return y + boxH + 8;
}

export async function exportPayrollPdf(
  profile: EmployeeProfile,
  payroll: MonthlyPayroll,
  _use24Hour: boolean,
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const logo = await loadLogoDataUrl();
  const periodLabel = `${formatMonthName(payroll.month)} ${payroll.year}`;

  let y = drawHeader(doc, logo, "Liquidación personal", periodLabel);
  y = drawEmployeeCard(doc, profile, periodLabel, y);
  y = drawSummaryStrip(doc, payroll, y);

  const halfW = (PAGE_W - MARGIN * 2 - 8) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + halfW + 8;

  const earningsBody = payroll.earnings.map((line) => [line.label, formatMoney(line.amount)]);
  earningsBody.push(["Total devengado", formatMoney(payroll.grossTotal)]);

  autoTable(doc, {
    startY: y,
    margin: { left: leftX, right: PAGE_W - leftX - halfW },
    tableWidth: halfW,
    head: [["DEVENGADO", "Valor"]],
    body: earningsBody,
    theme: "plain",
    styles: tableStyles(),
    headStyles: {
      fillColor: [BRAND.r, BRAND.g, BRAND.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: halfW * 0.62 },
      1: { halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === earningsBody.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [236, 253, 245];
      }
    },
  });
  const leftBottom = doc.lastAutoTable.finalY;

  const deductionsBody = payroll.legalDeductions.map((line) => [
    line.label,
    `-${formatMoney(line.amount)}`,
  ]);
  for (const line of payroll.manualDeductions) {
    deductionsBody.push([line.label, `-${formatMoney(line.amount)}`]);
  }
  if (deductionsBody.length === 0) {
    deductionsBody.push(["Sin descuentos", "$ 0"]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: rightX, right: MARGIN },
    tableWidth: halfW,
    head: [["DESCUENTOS", "Valor"]],
    body: deductionsBody,
    theme: "plain",
    styles: tableStyles(),
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: halfW * 0.62 },
      1: { halign: "right", textColor: [DANGER.r, DANGER.g, DANGER.b] },
    },
  });
  const rightBottom = doc.lastAutoTable.finalY;
  y = Math.max(leftBottom, rightBottom) + 6;
  y = drawNetoBox(doc, payroll.netTotal, y);

  const b = payroll.breakdown;
  const hoursBody = [
    ["Ordinarias diurnas", `${b.normalDiurna} h`],
    ["Ordinarias nocturnas", `${b.nocturnaOrdinaria} h`],
    ["Extra diurna", `${b.extraDiurna} h`],
    ["Extra nocturna", `${b.extraNocturna} h`],
    ["Dominical/festivo diurno", `${b.dominicalDiurna} h`],
    ["Dominical/festivo nocturno", `${b.dominicalNocturna} h`],
    ["Total horas", `${totalHourBreakdown(b)} h`],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: PAGE_W - MARGIN * 2,
    head: [["Desglose de horas", "Horas"]],
    body: hoursBody,
    theme: "plain",
    styles: tableStyles(true),
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: (PAGE_W - MARGIN * 2) * 0.72 },
      1: { halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === hoursBody.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [236, 253, 245];
      }
    },
  });

  drawFooter(doc);
  downloadPdf(doc, `nomina_${payroll.year}_${payroll.month}.pdf`);
}

const DAY_TYPE_LABELS: Record<string, string> = {
  NORMAL: "Normal",
  FESTIVO_DOMINICAL: "Festivo / dom.",
  FESTIVO_NOCTURNO: "Festivo noct.",
};

export async function exportWorkDaysPdf(
  profile: EmployeeProfile,
  payroll: MonthlyPayroll,
  workDays: WorkDayEntry[],
  use24Hour: boolean,
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const logo = await loadLogoDataUrl();
  const periodLabel = `${formatMonthName(payroll.month)} ${payroll.year}`;

  let y = drawHeader(doc, logo, "Días laborados", periodLabel);
  y = drawEmployeeCard(doc, profile, periodLabel, y);

  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`Total días registrados: ${workDays.length}`, MARGIN, y);
  y += 10;

  const sorted = [...workDays].sort((a, b) => a.date.localeCompare(b.date));
  const body =
    sorted.length === 0
      ? [["—", "—", "—", "—", "Sin jornadas en este mes"]]
      : sorted.map((entry) => {
          const dateStr = new Date(`${entry.date}T12:00:00`).toLocaleDateString("es-CO", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          });
          return [
            dateStr,
            formatTime(entry.start, use24Hour),
            formatTime(entry.end, use24Hour),
            DAY_TYPE_LABELS[entry.dayType] ?? entry.dayType,
            entry.notes.trim() || "—",
          ];
        });

  const maxTableY = FOOTER_Y - 18;
  const availableH = maxTableY - y;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: PAGE_H - maxTableY },
    tableWidth: PAGE_W - MARGIN * 2,
    head: [["Fecha", "Entrada", "Salida", "Tipo", "Notas"]],
    body,
    theme: "striped",
    styles: {
      fontSize: sorted.length > 22 ? 7 : 7.5,
      cellPadding: sorted.length > 22 ? 1.8 : 2.2,
      overflow: "linebreak",
      lineColor: [226, 232, 240],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [BRAND.r, BRAND.g, BRAND.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 48, halign: "center" },
      2: { cellWidth: 48, halign: "center" },
      3: { cellWidth: 62 },
      4: { cellWidth: "auto" },
    },
    showHead: "everyPage",
    pageBreak: "avoid",
    rowPageBreak: "avoid",
    bodyStyles: {
      minCellHeight: sorted.length > 22 ? 10 : 12,
    },
  });

  drawFooter(doc);
  downloadPdf(doc, `dias_laborados_${payroll.year}_${payroll.month}.pdf`);
}
