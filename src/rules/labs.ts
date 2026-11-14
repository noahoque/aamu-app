import type { LabName, LabResult, Patient, Sex } from "../data/types";

// Typical Finnish adult reference ranges (synthetic demo; check with your laboratory).
// `high` is the upper limit. When `refText` is "alle X", X itself is already abnormal
// (e.g. NICE NG12: CA-125 of 35 IU/ml or greater).
type Range = { low?: number; high?: number; highInclusive?: boolean };
type LabDef = { unit: string; short: string; range: Range | Record<Sex, Range> };

export const LAB_DEFS: Record<LabName, LabDef> = {
  "CA-125": { unit: "kU/l", short: "CA-125", range: { high: 35, highInclusive: true } },
  Trombosyytit: { unit: "E9/l", short: "Trombosyytit", range: { low: 150, high: 360 } },
  CRP: { unit: "mg/l", short: "CRP", range: { high: 10, highInclusive: true } },
  Hemoglobiini: { unit: "g/l", short: "Hb", range: { N: { low: 117, high: 155 }, M: { low: 134, high: 167 } } },
  Ferritiini: { unit: "µg/l", short: "ferritiini", range: { N: { low: 15, high: 150 }, M: { low: 30, high: 400 } } },
  HbA1c: { unit: "mmol/mol", short: "HbA1c", range: { low: 20, high: 42 } },
};

/** Display order in the lab table. */
export const LAB_ORDER: LabName[] = ["CA-125", "Trombosyytit", "CRP", "Hemoglobiini", "Ferritiini", "HbA1c"];

const rangeFor = (name: LabName, sex: Sex): Range => {
  const r = LAB_DEFS[name].range;
  return "N" in r ? r[sex] : r;
};

export const refText = (name: LabName, sex: Sex) => {
  const r = rangeFor(name, sex);
  if (r.low === undefined && r.high !== undefined) return r.highInclusive ? `alle ${r.high}` : `enintään ${r.high}`;
  return `${r.low}–${r.high}`;
};

export const isHigh = (name: LabName, sex: Sex, v: number) => {
  const r = rangeFor(name, sex);
  if (r.high === undefined) return false;
  return r.highInclusive ? v >= r.high : v > r.high;
};

export const isLow = (name: LabName, sex: Sex, v: number) => {
  const r = rangeFor(name, sex);
  return r.low !== undefined && v < r.low;
};

export const isAbnormal = (name: LabName, sex: Sex, v: number) => isHigh(name, sex, v) || isLow(name, sex, v);

/** All results for one test, oldest first. */
export const series = (labs: LabResult[], name: LabName) => labs.filter((l) => l.name === name).sort((a, b) => a.date.localeCompare(b.date));

/** Direction of the last three values: strictly rising, strictly falling, or neither. */
export function trend(values: number[]): "up" | "down" | null {
  const v = values.slice(-3);
  if (v.length < 3) return null;
  if (v[0] < v[1] && v[1] < v[2]) return "up";
  if (v[0] > v[1] && v[1] > v[2]) return "down";
  return null;
}

export type TrendResult = { rising: LabName[]; falling: LabName[]; count: number; lastDate: string };

/**
 * Platelets and CRP rising and Hb falling together: individually unremarkable changes that,
 * read together, point to something worth investigating.
 */
export function markerTrend(p: Patient): TrendResult | null {
  const rising: LabName[] = [];
  const falling: LabName[] = [];
  let lastDate = "";
  for (const [name, dir] of [["Trombosyytit", "up"], ["CRP", "up"], ["Hemoglobiini", "down"]] as const) {
    const s = series(p.labs, name);
    if (trend(s.map((x) => x.value)) !== dir) continue;
    (dir === "up" ? rising : falling).push(name);
    lastDate = s[s.length - 1].date > lastDate ? s[s.length - 1].date : lastDate;
  }
  const count = rising.length + falling.length;
  return count >= 2 ? { rising, falling, count, lastDate } : null;
}

/** "Trombosyytit ja CRP nousussa, Hb laskussa" */
export function describeTrend(t: TrendResult): string {
  const names = (xs: LabName[]) => xs.map((n) => LAB_DEFS[n].short).join(" ja ");
  const parts: string[] = [];
  if (t.rising.length) parts.push(`${names(t.rising)} nousussa`);
  if (t.falling.length) parts.push(`${names(t.falling)} laskussa`);
  return parts.join(", ");
}
