import { parseTimeToMinutes } from "./dates.js";
import type { LegalSnapshot } from "./types.js";
import type { HourBreakdown, WorkDayEntry } from "./models.js";

const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60;
const MINUTES_PER_DAY = 24 * 60;

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function isNightAt(minute: number, nightStart: number, nightEnd: number): boolean {
  const m = minute % MINUTES_PER_DAY;
  return m < nightEnd || m >= nightStart;
}

function workedMinuteRanges(startMin: number, endMin: number): [number, number][] {
  if (endMin <= startMin) return [];
  if (endMin <= LUNCH_START || startMin >= LUNCH_END) return [[startMin, endMin]];
  const ranges: [number, number][] = [];
  if (startMin < LUNCH_START) ranges.push([startMin, Math.min(LUNCH_START, endMin)]);
  if (endMin > LUNCH_END) ranges.push([Math.max(LUNCH_END, startMin), endMin]);
  return ranges;
}

function chronologySegments(
  startMin: number,
  endMin: number,
  nightStart: number,
  nightEnd: number,
): [number, boolean][] {
  const result: [number, boolean][] = [];
  for (const [segStart, segEnd] of workedMinuteRanges(startMin, endMin)) {
    const boundaries = new Set<number>([segStart, segEnd]);
    let dayAnchor = Math.floor(segStart / MINUTES_PER_DAY) * MINUTES_PER_DAY - MINUTES_PER_DAY;
    while (dayAnchor <= segEnd) {
      boundaries.add(dayAnchor + nightEnd);
      boundaries.add(dayAnchor + nightStart);
      boundaries.add(dayAnchor + MINUTES_PER_DAY);
      dayAnchor += MINUTES_PER_DAY;
    }
    const sorted = Array.from(boundaries)
      .filter((b) => b >= segStart && b <= segEnd)
      .sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i];
      const to = sorted[i + 1];
      if (to > from) {
        result.push([(to - from) / 60, isNightAt(from, nightStart, nightEnd)]);
      }
    }
  }
  return result;
}

function allocateHours(
  segments: [number, boolean][],
  jornada: number,
  restDay: boolean,
): HourBreakdown {
  let remainingOrdinary = jornada;
  let normalDiurna = 0;
  let nocturnaOrd = 0;
  let extraDiurna = 0;
  let extraNocturna = 0;
  let dominicalDiurna = 0;
  let dominicalNocturna = 0;
  let extraDominicalDiurna = 0;
  let extraDominicalNocturna = 0;

  for (const [hours, isNight] of segments) {
    let left = hours;
    const ordinary = Math.min(left, Math.max(remainingOrdinary, 0));
    if (ordinary > 0) {
      if (restDay) {
        if (isNight) dominicalNocturna += ordinary;
        else dominicalDiurna += ordinary;
      } else if (isNight) nocturnaOrd += ordinary;
      else normalDiurna += ordinary;
      remainingOrdinary -= ordinary;
      left -= ordinary;
    }
    if (left > 0) {
      if (restDay) {
        if (isNight) extraDominicalNocturna += left;
        else extraDominicalDiurna += left;
      } else if (isNight) extraNocturna += left;
      else extraDiurna += left;
    }
  }

  return {
    normalDiurna: round2(normalDiurna),
    nocturnaOrdinaria: round2(nocturnaOrd),
    extraDiurna: round2(extraDiurna),
    extraNocturna: round2(extraNocturna),
    dominicalDiurna: round2(dominicalDiurna),
    dominicalNocturna: round2(dominicalNocturna),
    extraDominicalDiurna: round2(extraDominicalDiurna),
    extraDominicalNocturna: round2(extraDominicalNocturna),
  };
}

export function calculateHours(
  entry: WorkDayEntry,
  dailyHours: number,
  isRestDay: boolean,
  snapshot: LegalSnapshot,
): HourBreakdown {
  const nightStart = snapshot.nightStartHour * 60;
  const nightEnd = snapshot.nightEndHour * 60;
  const startMin = parseTimeToMinutes(entry.start);
  let endMin = parseTimeToMinutes(entry.end);
  if (endMin <= startMin) endMin += MINUTES_PER_DAY;

  const restDay =
    entry.dayType === "FESTIVO_DOMINICAL" ||
    entry.dayType === "FESTIVO_NOCTURNO" ||
    isRestDay;
  return allocateHours(
    chronologySegments(startMin, endMin, nightStart, nightEnd),
    dailyHours,
    restDay,
  );
}
