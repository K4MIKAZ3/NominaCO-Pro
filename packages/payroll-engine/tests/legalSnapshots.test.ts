import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contributionBase,
  isOfficialHoliday,
  resolveLegalSnapshot,
  SNAPSHOT_2026_H2,
} from "../src/index.js";

describe("legal snapshots 2026", () => {
  it("usa dominical 80% y jornada 44h en junio", () => {
    const s = resolveLegalSnapshot("2026-06-15");
    assert.equal(s.dominicalFactor, 1.8);
    assert.equal(s.weeklyHoursLimit, 44);
    assert.equal(s.smmlv, 1_750_905);
    assert.equal(s.transportSubsidy, 249_095);
    assert.equal(s.uvt, 52_374);
  });

  it("pasa a dominical 90% el 1-jul y a 42h el 15-jul", () => {
    const early = resolveLegalSnapshot("2026-07-01");
    assert.equal(early.dominicalFactor, 1.9);
    assert.equal(early.weeklyHoursLimit, 44);

    const late = resolveLegalSnapshot("2026-07-15");
    assert.equal(late.dominicalFactor, 1.9);
    assert.equal(late.weeklyHoursLimit, 42);
  });

  it("incluye festivo Chiquinquirá 13-jul-2026 (Ley 2578)", () => {
    assert.equal(isOfficialHoliday("2026-07-13", SNAPSHOT_2026_H2), true);
    assert.equal(isOfficialHoliday("2026-07-09", SNAPSHOT_2026_H2), false);
  });

  it("excluye auxilio ST del IBC", () => {
    const ibc = contributionBase([
      { label: "Salario", amount: 1_000_000, code: "SBP" },
      { label: "Subsidio de transporte", amount: 249_095, code: "ST" },
      { label: "Recargo nocturno", amount: 50_000, code: "RN" },
    ]);
    assert.equal(ibc, 1_050_000);
  });
});
