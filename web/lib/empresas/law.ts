/** Parámetros laborales y de seguridad social. Colombia, vigencia 2026. */

export const SMMLV = 1_750_905;
export const SUBSIDIO_TRANSPORTE = 249_095;
export const TOPE_TRANSPORTE = SMMLV * 2;
export const TOPE_EXONERACION = SMMLV * 10;
export const TOPE_IBC = SMMLV * 25;
export const SALARIO_INTEGRAL_MIN = SMMLV * 13;
export const DIAS_MES = 30;
export const UVT_2026 = 52_374;

export const ARL_RATE: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0.00522,
  2: 0.01044,
  3: 0.02436,
  4: 0.0435,
  5: 0.0696,
};

export const HOLIDAYS_2026 = new Set([
  "2026-01-01",
  "2026-01-12",
  "2026-03-23",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-05-18",
  "2026-06-08",
  "2026-06-15",
  "2026-06-29",
  "2026-07-20",
  "2026-08-07",
  "2026-08-17",
  "2026-10-12",
  "2026-11-02",
  "2026-11-16",
  "2026-12-08",
  "2026-12-25",
]);

const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

export function nitDv(nit: string): string {
  const digits = nit.replace(/\D/g, "").split("").reverse();
  const sum = digits.reduce((total, digit, index) => total + Number(digit) * (NIT_WEIGHTS[index] ?? 0), 0);
  const remainder = sum % 11;
  return String(remainder > 1 ? 11 - remainder : remainder);
}

export function isSunday(iso: string): boolean {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;
}

export function isRestDay(iso: string): boolean {
  return isSunday(iso) || HOLIDAYS_2026.has(iso);
}

/** +80 % hasta el 30 jun 2026, +90 % desde el 1 jul 2026, +100 % desde el 1 jul 2027. Ley 2466. */
export function dominicalFactor(iso: string): number {
  if (iso < "2026-07-01") return 1.8;
  if (iso < "2027-07-01") return 1.9;
  return 2;
}

/** Jornada máxima semanal: 44 h hasta el 14 jul 2026, 42 h desde el 15 jul. Ley 2101. */
export function weeklyHourLimit(iso: string): number {
  return iso < "2026-07-15" ? 44 : 42;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthPrefix(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function clampIbc(raw: number, days: number): number {
  if (days <= 0 || raw <= 0) return 0;
  const floor = Math.round((SMMLV * days) / DIAS_MES);
  return Math.min(TOPE_IBC, Math.max(floor, Math.round(raw)));
}

/** Fondo de solidaridad: 1 % desde 4 SMMLV; subsistencia adicional desde 16 SMMLV. */
export function fondoSolidaridad(ibc: number): { solidaridad: number; subsistencia: number } {
  if (ibc < SMMLV * 4) return { solidaridad: 0, subsistencia: 0 };
  const solidaridad = Math.round(ibc * 0.01);
  const sm = ibc / SMMLV;
  let extra = 0;
  if (sm >= 20) extra = 0.01;
  else if (sm >= 19) extra = 0.008;
  else if (sm >= 18) extra = 0.006;
  else if (sm >= 17) extra = 0.004;
  else if (sm >= 16) extra = 0.002;
  return { solidaridad, subsistencia: Math.round(ibc * extra) };
}

/** Día hábil del mes siguiente en que vence la PILA, según los dos últimos dígitos del NIT. */
export function pilaDueBusinessDay(nit: string): number {
  const tail = Number(nit.replace(/\D/g, "").slice(-2) || "0");
  const bands = [7, 14, 21, 28, 35, 42, 49, 56, 63, 69, 75, 81, 87, 93, 99];
  const index = bands.findIndex((limit) => tail <= limit);
  return (index === -1 ? bands.length : index) + 2;
}

export function qualifiesTransport(salary: number, integral: boolean): boolean {
  return !integral && salary <= TOPE_TRANSPORTE;
}

export function isExonerated(companyExonerated: boolean, monthlySalary: number): boolean {
  return companyExonerated && monthlySalary < TOPE_EXONERACION;
}
