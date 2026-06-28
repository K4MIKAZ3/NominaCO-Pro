import { jsPDF } from "jspdf";
import { SMMLV } from "@/lib/payroll/colombiaLaborLaw2026";
import { formatMoney, formatMonthName, formatTime } from "@/lib/format";
import { totalHourBreakdown } from "@/lib/payroll/models";
import type { EmployeeProfile, MonthlyPayroll, WorkDayEntry } from "@/lib/payroll/models";

const MARGIN = 40;
const LINE = 18;
const PAGE_W = 595;
const PAGE_H = 842;

function downloadPdf(doc: jsPDF, fileName: string) {
  doc.save(fileName);
}

function addPageIfNeeded(doc: jsPDF, y: { value: number }, extra = LINE * 2) {
  if (y.value + extra > PAGE_H - MARGIN) {
    doc.addPage();
    y.value = MARGIN;
  }
}

function drawLine(doc: jsPDF, y: { value: number }, text: string, fontSize = 11, bold = false) {
  addPageIfNeeded(doc, y);
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.text(text, MARGIN, y.value);
  y.value += LINE;
}

export function exportPayrollPdf(
  profile: EmployeeProfile,
  payroll: MonthlyPayroll,
  use24Hour: boolean,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const y = { value: MARGIN };

  drawLine(doc, y, "Nominapp — Liquidación personal", 16, true);
  drawLine(doc, y, "Uso personal · No constituye nómina oficial", 9);
  y.value += 8;
  drawLine(doc, y, `Empleado: ${profile.name}`);
  drawLine(doc, y, `Documento: ${profile.documentId || "—"}`);
  drawLine(doc, y, `Cargo: ${profile.jobTitle || "—"}`);
  drawLine(doc, y, `Período: ${formatMonthName(payroll.month)} ${payroll.year}`);
  drawLine(doc, y, `Generado: ${new Date().toLocaleDateString("es-CO")}`);
  y.value += 8;
  drawLine(doc, y, `Días trabajados: ${payroll.workedDays}`, 11, true);
  if (payroll.remuneratedRestDays > 0) {
    drawLine(doc, y, `Dominical/festivo remunerado: ${payroll.remuneratedRestDays} día(s)`, 9);
  }
  drawLine(
    doc,
    y,
    `Valor día: ${formatMoney(payroll.dailyRate)} · Valor hora: ${formatMoney(Math.trunc(payroll.hourlyRate))}`,
    9,
  );
  y.value += 4;

  drawLine(doc, y, "DEVENGADO", 11, true);
  for (const line of payroll.earnings) {
    drawLine(doc, y, `  ${line.label}: ${formatMoney(line.amount)}`);
  }
  drawLine(doc, y, `  Total devengado: ${formatMoney(payroll.grossTotal)}`, 11, true);
  y.value += 4;

  drawLine(doc, y, "DESCUENTOS LEGALES", 11, true);
  for (const line of payroll.legalDeductions) {
    drawLine(doc, y, `  ${line.label}: -${formatMoney(line.amount)}`);
  }
  if (payroll.manualDeductions.length > 0) {
    y.value += 4;
    drawLine(doc, y, "EGRESOS / PRÉSTAMOS MANUALES", 11, true);
    for (const line of payroll.manualDeductions) {
      drawLine(doc, y, `  ${line.label}: -${formatMoney(line.amount)}`);
    }
  }
  y.value += 4;
  drawLine(doc, y, `NETO A RECIBIR: ${formatMoney(payroll.netTotal)}`, 11, true);

  y.value += 8;
  drawLine(doc, y, "Desglose de horas", 11, true);
  const b = payroll.breakdown;
  drawLine(doc, y, `  Ordinarias diurnas: ${b.normalDiurna} h`);
  drawLine(doc, y, `  Ordinarias nocturnas: ${b.nocturnaOrdinaria} h`);
  drawLine(doc, y, `  Extra diurna: ${b.extraDiurna} h`);
  drawLine(doc, y, `  Extra nocturna: ${b.extraNocturna} h`);
  drawLine(doc, y, `  Dominical/festivo diurno: ${b.dominicalDiurna} h`);
  drawLine(doc, y, `  Dominical/festivo nocturno: ${b.dominicalNocturna} h`);
  drawLine(doc, y, `  Total horas: ${totalHourBreakdown(b)} h`);

  y.value += 8;
  drawLine(doc, y, `Base legal: Ley 2466/2025 · SMMLV ${formatMoney(SMMLV)}`, 9);
  drawLine(doc, y, "© 2026 Nominapp · contacto@nominapp.xyz · Uso personal", 9);

  downloadPdf(doc, `nomina_${payroll.year}_${payroll.month}.pdf`);
}

export function exportWorkDaysPdf(
  profile: EmployeeProfile,
  payroll: MonthlyPayroll,
  workDays: WorkDayEntry[],
  use24Hour: boolean,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const y = { value: MARGIN };

  drawLine(doc, y, "Nominapp — Días laborados", 16, true);
  drawLine(doc, y, `Uso personal · ${profile.name}`, 9);
  drawLine(doc, y, `Período: ${formatMonthName(payroll.month)} ${payroll.year}`);
  y.value += 8;

  if (workDays.length === 0) {
    drawLine(doc, y, "No hay días registrados en este mes.");
  } else {
    for (const entry of [...workDays].sort((a, b) => a.date.localeCompare(b.date))) {
      const dateStr = new Date(entry.date + "T12:00:00").toLocaleDateString("es-CO", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      drawLine(
        doc,
        y,
        `${dateStr}  ·  ${formatTime(entry.start, use24Hour)} – ${formatTime(entry.end, use24Hour)}  ·  ${entry.dayType}`,
        11,
        true,
      );
      if (entry.notes.trim()) {
        drawLine(doc, y, `  Notas: ${entry.notes}`, 9);
      }
      y.value += 4;
    }
  }

  y.value += 8;
  drawLine(doc, y, "Documento generado por Nominapp · contacto@nominapp.xyz", 9);

  downloadPdf(doc, `dias_laborados_${payroll.year}_${payroll.month}.pdf`);
}
