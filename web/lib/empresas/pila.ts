import { monthPrefix, pilaDueBusinessDay } from "./law";
import type { Company, Employee } from "./types";
import type { PilaSlice, WorkerPayroll } from "./payroll";

/** Registro tipo 1 del archivo tipo 2, Anexo Técnico 2 (Resolución 2388 de 2016). */
export const PILA_HEADER_LENGTH = 359;
/** Registro tipo 2. La Resolución 1529 de 2026 ajusta validaciones de documento; el operador confirma la longitud vigente. */
export const PILA_DETAIL_LENGTH = 686;

function strip(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 .@-]/g, "");
}

function padA(value: string, length: number): string {
  return strip(value).slice(0, length).padEnd(length, " ");
}

function padN(value: number, length: number): string {
  return String(Math.max(0, Math.round(value))).slice(-length).padStart(length, "0");
}

function rate(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

function blank(length: number): string {
  return " ".repeat(length);
}

export function buildPilaDetail(employee: Employee, slice: PilaSlice, sequence: number, company: Company): string {
  const parts = [
    "02",
    padN(sequence, 5),
    padA(employee.docType, 2),
    padA(employee.documentNumber, 16),
    "01",
    "00",
    blank(1),
    blank(1),
    padA(company.departmentCode, 2),
    padA(company.cityCode, 3),
    padA(employee.firstSurname, 20),
    padA(employee.secondSurname, 30),
    padA(employee.firstName, 20),
    padA(employee.secondName, 30),
    slice.ing ? "X" : " ",
    " ",
    blank(13),
    "00",
    padA(employee.afpCode, 6),
    blank(6),
    padA(employee.epsCode, 6),
    blank(6),
    padA(employee.ccfCode, 6),
    padN(slice.days, 2),
    padN(slice.days, 2),
    padN(slice.days, 2),
    padN(slice.days, 2),
    padN(slice.salaryBasic, 9),
    slice.integral ? "X" : " ",
    padN(slice.ibc, 9),
    padN(slice.ibc, 9),
    padN(slice.ibc, 9),
    padN(slice.ibc, 9),
    rate(slice.pensionRate, 5),
    padN(slice.pensionPay, 9),
    padN(0, 9),
    padN(0, 9),
    padN(slice.pensionPay, 9),
    padN(slice.fspSolidaridad, 9),
    padN(slice.fspSubsistencia, 9),
    padN(0, 9),
    rate(slice.healthRate, 5),
    padN(slice.healthPay, 9),
    padN(0, 9),
    blank(15),
    padN(0, 9),
    blank(15),
    padN(0, 9),
    rate(slice.arlRate, 7),
    padN(1, 9),
    padN(slice.arlPay, 9),
    rate(slice.ccfRate, 5),
    padN(slice.ccfPay, 9),
    rate(slice.senaRate, 5),
    padN(slice.senaPay, 9),
    rate(slice.icbfRate, 5),
    padN(slice.icbfPay, 9),
    rate(0, 5),
    padN(0, 9),
    rate(0, 5),
    padN(0, 9),
    blank(2),
    blank(16),
    slice.exonerated ? "S" : "N",
    padA(company.arlCode, 6),
    String(employee.riskClass),
    " ",
    blank(150),
    padN(slice.ibc, 9),
    padN(Math.min(slice.hours, 999), 3),
    blank(10),
  ];
  return parts.join("");
}

export function buildPilaHeader(company: Company, periodLabel: string, cotizantes: number, nomina: number): string {
  const parts = [
    "01",
    "1",
    padN(1, 4),
    padA(company.name, 200),
    padA(company.personType === "J" ? "NI" : "CC", 2),
    padA(company.nit, 16),
    padN(Number(company.dv) || 0, 1),
    "E",
    blank(10),
    blank(10),
    "U",
    blank(10),
    blank(40),
    padA(company.arlCode, 6),
    padA(periodLabel, 7),
    padA(periodLabel, 7),
    padN(0, 10),
    blank(10),
    padN(cotizantes, 5),
    padN(nomina, 12),
    "01",
    "00",
  ];
  return parts.join("");
}

export function buildPilaFile(
  company: Company,
  employees: Employee[],
  slips: WorkerPayroll[],
  year: number,
  month: number,
): { text: string; headerLength: number; detailLength: number; cotizantes: number } {
  const period = monthPrefix(year, month);
  const rows = slips
    .map((slip) => ({ slip, employee: employees.find((item) => item.id === slip.workerId) }))
    .filter((row): row is { slip: WorkerPayroll; employee: Employee } => Boolean(row.employee && row.slip.pila.days > 0));
  const header = buildPilaHeader(
    company,
    period,
    rows.length,
    rows.reduce((sum, row) => sum + row.slip.pila.ibc, 0),
  );
  const details = rows.map((row, index) => buildPilaDetail(row.employee, row.slip.pila, index + 1, company));
  return {
    text: [header, ...details].join("\r\n") + "\r\n",
    headerLength: header.length,
    detailLength: details[0]?.length ?? 0,
    cotizantes: rows.length,
  };
}

export function pilaCsv(employees: Employee[], slips: WorkerPayroll[]): string {
  const header = [
    "documento",
    "nombre",
    "dias",
    "ibc",
    "pension",
    "salud",
    "arl",
    "caja",
    "sena",
    "icbf",
    "fsp_solidaridad",
    "fsp_subsistencia",
    "exonerado",
  ];
  const lines = slips
    .filter((slip) => slip.pila.days > 0)
    .map((slip) => {
      const employee = employees.find((item) => item.id === slip.workerId);
      const name = employee ? `${employee.firstName} ${employee.firstSurname}` : slip.workerId;
      return [
        employee?.documentNumber ?? "",
        name,
        slip.pila.days,
        slip.pila.ibc,
        slip.pila.pensionPay,
        slip.pila.healthPay,
        slip.pila.arlPay,
        slip.pila.ccfPay,
        slip.pila.senaPay,
        slip.pila.icbfPay,
        slip.pila.fspSolidaridad,
        slip.pila.fspSubsistencia,
        slip.pila.exonerated ? "S" : "N",
      ].join(";");
    });
  return [header.join(";"), ...lines].join("\n");
}

export function dueLabel(nit: string): string {
  return `Día hábil ${pilaDueBusinessDay(nit)} del mes siguiente`;
}
