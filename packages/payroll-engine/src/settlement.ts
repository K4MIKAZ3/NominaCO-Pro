import { isAfter, type LocalDate } from "./dates.js";
import { resolveLegalSnapshot } from "./legalSnapshots.js";
import type {
  EmployeeProfile,
  LiquidationEstimate,
  SemesterSettlement,
  WorkDayEntry,
  YearSettlementReport,
} from "./models.js";
import { liquidateDateRange } from "./payrollEngine.js";
import { dailyRate, prestacionesAmount } from "./rates.js";
import type { LegalSnapshot } from "./types.js";

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
  snapshots?: LegalSnapshot[],
): SemesterSettlement {
  if (isAfter(start, end)) {
    return {
      label,
      start,
      end,
      workedDays: 0,
      remuneratedRestDays: 0,
      primaAmount: 0,
      paymentDeadline: deadline,
    };
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
    snapshots,
  );
  const days = payroll.workedDays + payroll.remuneratedRestDays;
  const snapshot = resolveLegalSnapshot(end, snapshots);
  return {
    label,
    start,
    end,
    workedDays: payroll.workedDays,
    remuneratedRestDays: payroll.remuneratedRestDays,
    primaAmount: prestacionesAmount(profile.monthlySalary, days, snapshot),
    paymentDeadline: deadline,
  };
}

export function calculateSettlement(
  profile: EmployeeProfile,
  year: number,
  entries: WorkDayEntry[],
  manualHolidays: Set<LocalDate> = new Set(),
  pendingVacationDays: number = 0,
  asOf: LocalDate = todayIso(),
  snapshots?: LegalSnapshot[],
): YearSettlementReport {
  const yearEnd = minDate(asOf, `${year}-12-31`);
  const yearStart = `${year}-01-01`;
  if (isAfter(yearStart, yearEnd)) {
    return emptyReport(year, pendingVacationDays, yearEnd);
  }

  const yearEntries = entries.filter(
    (e) => e.date.startsWith(String(year)) && !isAfter(e.date, yearEnd),
  );

  const sem1Start = `${year}-01-01`;
  const sem1End = minDate(`${year}-06-30`, yearEnd);
  const sem2Start = `${year}-07-01`;

  const firstSemester = semesterSettlement(
    profile,
    yearEntries,
    manualHolidays,
    sem1Start,
    sem1End,
    "Primer semestre (ene–jun)",
    "30 de junio",
    snapshots,
  );

  const secondSemester = !isAfter(yearEnd, sem2Start)
    ? semesterSettlement(
        profile,
        yearEntries,
        manualHolidays,
        sem2Start,
        yearEnd,
        "Segundo semestre (jul–dic)",
        "20 de diciembre",
        snapshots,
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
    snapshots,
  );
  const annualDays = annualPayroll.workedDays + annualPayroll.remuneratedRestDays;
  const snapshot = resolveLegalSnapshot(yearEnd, snapshots);
  const cesantias = prestacionesAmount(profile.monthlySalary, annualDays, snapshot);
  const intereses = Math.trunc(
    (cesantias * snapshot.cesantiasInterestAnnual * annualDays) /
      snapshot.settlementYearDays,
  );

  const currentSemesterPrima = !isAfter(yearEnd, sem2Start)
    ? secondSemester.primaAmount
    : firstSemester.primaAmount;

  const vacaciones = Math.trunc(
    dailyRate(profile.monthlySalary, snapshot) * Math.max(0, pendingVacationDays),
  );

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
