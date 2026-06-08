const LOCALE = "es-CO";

export function formatMoney(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonthName(month: number): string {
  const name = new Date(2000, month - 1, 1).toLocaleDateString(LOCALE, { month: "short" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatMonthFull(year: number, month: number): string {
  const name = new Date(year, month - 1, 1).toLocaleDateString(LOCALE, {
    month: "long",
    year: "numeric",
  });
  return name.charAt(0).toUpperCase() + name.slice(1);
}
