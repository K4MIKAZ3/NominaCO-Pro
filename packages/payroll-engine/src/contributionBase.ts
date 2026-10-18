import type { PayrollLine } from "./types.js";

/**
 * IBC / base de cotización salud y pensión del trabajador.
 * El auxilio de transporte (código ST) NO forma parte de la base.
 */
export function contributionBase(earnings: PayrollLine[]): number {
  return earnings
    .filter((line) => line.code !== "ST")
    .reduce((sum, line) => sum + line.amount, 0);
}
