/**
 * Chequeo rápido del IBC web (paridad con ColombiaLaborLaw2026.contributionBase).
 * Ejecutar: node --experimental-strip-types web/scripts/check-ibc.mts
 *
 * No importa el módulo TS completo (evita resolución ESM de ./dates).
 */
const DESCUENTO_SALUD = 0.04;
const DESCUENTO_PENSION = 0.04;

function isNonContributoryEarningCode(code?: string): boolean {
  return code === "ST";
}

function contributionBase(
  earnings: { amount: number; code?: string }[],
): number {
  return earnings
    .filter((line) => !isNonContributoryEarningCode(line.code))
    .reduce((sum, line) => sum + line.amount, 0);
}

const earnings = [
  { amount: 1_633_333, code: "SBP" },
  { amount: 166_063, code: "ST" },
  { amount: 326_666, code: "DRD" },
  { amount: 163_333, code: "FER" },
];

const gross = earnings.reduce((s, e) => s + e.amount, 0);
const ibc = contributionBase(earnings);
const salud = Math.trunc(ibc * DESCUENTO_SALUD);
const pension = Math.trunc(ibc * DESCUENTO_PENSION);

if (gross !== 2_289_395) throw new Error(`gross ${gross}`);
if (ibc !== 2_123_332) throw new Error(`ibc ${ibc}`);
if (salud !== 84_933) throw new Error(`salud ${salud}`);
if (pension !== 84_933) throw new Error(`pension ${pension}`);

console.log(
  JSON.stringify({
    ok: true,
    gross,
    ibc,
    salud,
    pension,
    net: gross - salud - pension,
  }),
);
