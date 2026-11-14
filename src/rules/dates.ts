const DAY = 86_400_000;

const toUtc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Whole days from `from` to `to` (positive when `to` is later). */
export const daysBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / DAY);

export const addDays = (iso: string, days: number) => new Date(toUtc(iso) + days * DAY).toISOString().slice(0, 10);

/** "2026-05-14" → "14.5." */
export const fmtShort = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.`;
};

/** "2026-05-14" → "14.5.2026" */
export const fmtLong = (iso: string) => `${fmtShort(iso)}${iso.slice(0, 4)}`;

/** ISO week number, e.g. 14.5.2026 → 20. */
export const isoWeek = (iso: string) => {
  const d = new Date(toUtc(iso));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / DAY + 1) / 7);
};

export const maxDate = (dates: string[]) => dates.reduce((a, b) => (b > a ? b : a), "");
