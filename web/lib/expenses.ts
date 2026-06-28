export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  HOUSING: "Vivienda",
  FOOD: "Alimentación",
  TRANSPORT: "Transporte",
  HEALTH: "Salud",
  LEISURE: "Ocio",
  EDUCATION: "Educación",
  OTHER: "Otros",
};

export const EXPENSE_CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export interface ExpenseRow {
  id: string;
  label: string;
  amount: number;
  category: string;
  is_fixed: boolean;
  year_month: string;
  date_iso: string;
}

export interface ExpenseSummary {
  year: number;
  month: number;
  totalExpenses: number;
  netTotal: number;
  balance: number;
  items: {
    label: string;
    amount: number;
    categoryLabel: string;
    isFixed: boolean;
  }[];
}

export function buildExpenseSummary(
  rows: ExpenseRow[],
  yearMonth: string,
  netTotal: number,
): ExpenseSummary {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const items = rows
    .filter((row) => row.is_fixed || row.year_month === yearMonth)
    .map((row) => ({
      label: row.label,
      amount: row.amount,
      categoryLabel: EXPENSE_CATEGORY_LABELS[row.category] ?? row.category,
      isFixed: row.is_fixed,
    }))
    .sort((a, b) => b.amount - a.amount);
  const totalExpenses = items.reduce((sum, item) => sum + item.amount, 0);
  return {
    year,
    month,
    totalExpenses,
    netTotal,
    balance: netTotal - totalExpenses,
    items,
  };
}

export function currentYearMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}
