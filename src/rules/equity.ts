import type { Language, Patient } from "../data/types";

// Equity priority: patients who are likely to wait longest for diagnosis are shown first.
// - Public primary care only: 207 vs 123 days from first symptom to treatment (UEF lymphoma study).
// - Over 50 km to the hospital: worse outcomes (roadmap p. 12, lung cancer study).
// - Minority language: needs interpreting and guidance.

export const DISTANCE_LIMIT_KM = 50;

export const LANGUAGE_NAMES: Record<Language, string> = {
  fi: "suomi",
  sv: "ruotsi",
  ru: "venäjä",
  et: "viro",
  ar: "arabia",
  so: "somali",
  uk: "ukraina",
  en: "englanti",
};

export type EquityCriterion = "public" | "distance" | "language";

export type Equity = {
  publicOnly: boolean;
  far: boolean;
  minorityLanguage: boolean;
  score: number;
  /** Short chip label, e.g. "Vain julkinen · 64 km", or null when no criterion applies. */
  label: string | null;
  /** Icon of the first criterion that applies. */
  icon: "home" | "pin" | "lang" | null;
};

export function equityOf(p: Pick<Patient, "careType" | "distanceKm" | "language">): Equity {
  const publicOnly = p.careType === "public";
  const far = p.distanceKm > DISTANCE_LIMIT_KM;
  const minorityLanguage = p.language !== "fi" && p.language !== "sv";
  const parts: string[] = [];
  if (publicOnly) parts.push("Vain julkinen");
  if (far) parts.push(parts.length ? `${p.distanceKm} km` : `${p.distanceKm} km sairaalaan`);
  if (minorityLanguage) parts.push(`${parts.length ? "kieli" : "Kieli"}: ${LANGUAGE_NAMES[p.language]}`);
  const score = Number(publicOnly) + Number(far) + Number(minorityLanguage);
  return {
    publicOnly,
    far,
    minorityLanguage,
    score,
    label: parts.length ? parts.join(" · ") : null,
    icon: publicOnly ? "home" : far ? "pin" : minorityLanguage ? "lang" : null,
  };
}

export type SortMode = "newest" | "equity";

/** Newest flag first; with equity priority, more criteria first, then newest. */
export function sortRows<T extends { daysAgo: number; equity: Equity }>(rows: T[], mode: SortMode): T[] {
  return [...rows].sort((a, b) => (mode === "equity" ? b.equity.score - a.equity.score : 0) || a.daysAgo - b.daysAgo);
}
