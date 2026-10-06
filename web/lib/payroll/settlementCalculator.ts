import * as Law from "./colombiaLaborLaw2026";
import { isAfter, isBefore, type LocalDate } from "./dates";
import { liquidateDateRange } from "./payrollEngine";
import type {
  EmployeeProfile,
  LiquidationEstimate,
  ManualDeduction,
  SemesterSettlement,
  WorkDayEntry,
  YearSettlementReport,
} from "./models";

function prestacionesAmount(profile: EmployeeProfile, days: number): number {
  if (days <= 0) return 0;
  const base =
    profile.monthlySalary +
    (Law.qualifiesTransport(profile.monthlySalary) ? Law.SUBSIDIO_TRANSPORTE : 0);
  return Math.trunc((base * days) / Law.DIAS_ANIO_PRESTACIONES);
}

function emptyReport(
  year: number,
  vacationDays: number,
  end: LocalDate,
): YearSettlementReport {
  return {
    year,
    firstSemester: {
      label: "Primer semestre",
      start: `${year}-01-01`,
      end: `${year}-06-30`,
      workedDays: 0,
      remuneratedRestDays: 0,
      primaAmount: 0,
      paymentDeadline: "30 de junio",
    },
    secondSemester: {
      label: "Segundo semestre",
      start: `${year}-07-01`,
      end: `${year}-12-31`,
      workedDays: 0,
      remuneratedRestDays: 0,
      primaAmount: 0,
      paymentDeadline: "20 de diciembre",
    },
    annualCesantias: 0,
    annualInteresesCesantias: 0,
    liquidation: {
      cesantias: 0,
      interesesCesantias: 0,
      primaProporcional: 0,
      vacaciones: 0,
      pendingVacationDays: vacationDays,
      periodEnd: end,
      total: 0,
    },
  };
}

function semesterSettlement(
  profile: EmployeeProfile,
  allEntries: WorkDayEntry[],
  manualHolidays: Set<LocalDate>,
  start: LocalDate,
  end: LocalDate,
  label: string,
  deadline: string,
): SemesterSettlement {
  if (isAfter(start, end)) {
    return { label, start, end, workedDays: 0, remuneratedRestDays: 0, primaAmount: 0, paymentDeadline: deadline };
  }
  const slice = allEntries.filter((e) => !isAfter(e.date, end) && !isAfter(start, e.date));
  const payroll = liquidateDateRange(
    profile,
    start,
    end,
    slice,
    manualHolidays,
    parseInt(start.slice(0, 4), 10),
    parseInt(start.slice(5, 7), 10),
  );
  const days = payroll.workedDays + payroll.remuneratedRestDays;
  return {
    label,
    start,
    end,
    workedDays: payroll.workedDays,
    remuneratedRestDays: payroll.remuneratedRestDays,
    primaAmount: prestacionesAmount(profile, days),
    paymentDeadline: deadline,
  };
}

export function calculateSettlement(
  profile: EmployeeProfile,
  year: number,
  entries: WorkDayEntry[],
  manualHolidays: Set<LocalDate>,
  pendingVacationDays: number = 0,
  asOf: LocalDate = todayIso(),
): YearSettlementReport {
  const yearEnd = minDate(asOf, `${year}-12-31`);
  const yearStart = `${year}-01-01`;
  if (isAfter(yearStart, yearEnd)) {
    return emptyReport(year, pendingVacationDays, yearEnd);
  }

  const yearEntries = entries.filter((e) => e.date.startsWith(String(year)) && !isAfter(e.date, yearEnd));

  const sem1Start = `${year}-01-01`;
  const sem1End = minDate(`${year}-06-30`, yearEnd);
  const sem2Start = `${year}-07-01`;
  const sem2End = yearEnd;

  const firstSemester = semesterSettlement(
    profile,
    yearEntries,
    manualHolidays,
    sem1Start,
    sem1End,
    "Primer semestre (ene–jun)",
    "30 de junio",
  );

  const secondSemester = !isAfter(yearEnd, sem2Start)
    ? semesterSettlement(
        profile,
        yearEntries,
        manualHolidays,
        sem2Start,
        sem2End,
        "Segundo semestre (jul–dic)",
        "20 de diciembre",
      )
    : {
        label: "Segundo semestre (jul–dic)",
        start: sem2Start,
        end: `${year}-12-31`,
        workedDays: 0,
        remuneratedRestDays: 0,
        primaAmount: 0,
        paymentDeadline: "20 de diciembre",
      };

  const annualPayroll = liquidateDateRange(
    profile,
    yearStart,
    yearEnd,
    yearEntries,
    manualHolidays,
    year,
    1,
  );
  const annualDays = annualPayroll.workedDays + annualPayroll.remuneratedRestDays;
  const cesantias = prestacionesAmount(profile, annualDays);
  const intereses = Math.trunc(
    (cesantias * Law.INTERES_CESANTIAS_ANUAL * annualDays) / Law.DIAS_ANIO_PRESTACIONES,
  );

  const currentSemesterPrima = !isAfter(yearEnd, sem2Start)
    ? secondSemester.primaAmount
    : firstSemester.primaAmount;

  const vacaciones = Math.trunc(Law.dailyRate(profile.monthlySalary) * Math.max(0, pendingVacationDays));

  const liquidation: LiquidationEstimate = {
    cesantias,
    interesesCesantias: intereses,
    primaProporcional: currentSemesterPrima,
    vacaciones,
    pendingVacationDays: Math.max(0, pendingVacationDays),
    periodEnd: yearEnd,
    total: cesantias + intereses + currentSemesterPrima + vacaciones,
  };

  return {
    year,
    firstSemester,
    secondSemester,
    annualCesantias: cesantias,
    annualInteresesCesantias: intereses,
    liquidation,
  };
}

function todayIso(): LocalDate {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function minDate(a: LocalDate, b: LocalDate): LocalDate {
  return a < b ? a : b;
}
