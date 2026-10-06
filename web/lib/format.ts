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

export function formatHours(hours: number): string {
  return hours.toFixed(2).replace(/\.?0+$/, "");
}

export function formatTime(time: string, use24h: boolean): string {
  const [hStr, mStr] = time.split(":");
  const h = Number.parseInt(hStr, 10);
  const m = Number.parseInt(mStr, 10);
  if (use24h) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
