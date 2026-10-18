import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contributionBase,
  liquidateMonth,
  resolveLegalSnapshot,
  type EmployeeProfile,
  type WorkDayEntry,
} from "../src/index.js";

const profile: EmployeeProfile = {
  name: "Ana Demo",
  documentId: "1000000001",
  jobTitle: "Operaria",
  monthlySalary: 1_750_905,
  dailyHours: 8,
  contractType: "INDEFINIDO",
  payPeriodType: "MONTHLY",
  pendingVacationDays: 0,
};

function weekdayEntriesForMarch(): WorkDayEntry[] {
  // Lun 2–vie 6, lun 9–vie 13, lun 16–vie 20, lun 23–vie 27 mar-2026
  const dates = [
    "2026-03-02",
    "2026-03-03",
    "2026-03-04",
    "2026-03-05",
    "2026-03-06",
    "2026-03-09",
    "2026-03-10",
    "2026-03-11",
    "2026-03-12",
    "2026-03-13",
    "2026-03-16",
    "2026-03-17",
    "2026-03-18",
    "2026-03-19",
    "2026-03-20",
    "2026-03-24", // 23 es festivo San José
    "2026-03-25",
    "2026-03-26",
    "2026-03-27",
  ];
  return dates.map((date) => ({
    date,
    start: "08:00",
    end: "17:00",
    dayType: "NORMAL" as const,
  }));
}

describe("payrollEngine Empresas", () => {
  it("liquida mes con IBC sin auxilio de transporte", () => {
    const payroll = liquidateMonth(profile, 2026, 3, weekdayEntriesForMarch());
    assert.ok(payroll.workedDays > 0);
    assert.ok(payroll.earnings.some((e) => e.code === "ST"));
    assert.equal(payroll.ibcTotal, contributionBase(payroll.earnings));
    assert.ok(payroll.ibcTotal < payroll.grossTotal);
    const salud = payroll.legalDeductions.find((d) => d.code === "SAL");
    assert.ok(salud);
    assert.equal(salud!.amount, Math.trunc(payroll.ibcTotal * 0.04));
  });

  it("usa snapshot H1 (dominical 1.8) en marzo 2026", () => {
    const s = resolveLegalSnapshot("2026-03-15");
    assert.equal(s.dominicalFactor, 1.8);
    assert.equal(s.weeklyHoursLimit, 44);
  });
});
