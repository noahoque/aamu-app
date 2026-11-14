import type { Patient, RiskFactors } from "../data/types";

/** AUDIT-C limits for risky drinking (THL / Käypä hoito: women ≥ 5, men ≥ 6). */
export const auditCRaised = (p: Pick<Patient, "sex" | "risk">) => p.risk.auditC !== undefined && p.risk.auditC >= (p.sex === "N" ? 5 : 6);

const SMOKING: Record<RiskFactors["smoking"], string> = { never: "Ei tupakoi", former: "Lopettanut", current: "Tupakoi" };

export type RiskRow = { label: string; value: string; flag: boolean };

/** Rows for the patient's risk-factor card and the referral form. Missing data shows "Ei tietoa". */
export function riskRows(p: Pick<Patient, "sex" | "risk">): RiskRow[] {
  const r = p.risk;
  return [
    { label: "Tupakointi", value: `${SMOKING[r.smoking]}${r.packYears ? ` · ${r.packYears} askivuotta` : ""}`, flag: r.smoking === "current" },
    { label: "Alkoholi", value: r.auditC === undefined ? "Ei tietoa" : `AUDIT-C ${r.auditC}/12${auditCRaised(p) ? " · riskiraja ylittyy" : ""}`, flag: auditCRaised(p) },
    { label: "Painoindeksi", value: r.bmi === undefined ? "Ei tietoa" : `${r.bmi.toFixed(1).replace(".", ",")} kg/m²`, flag: r.bmi !== undefined && r.bmi >= 30 },
    { label: "Suku", value: r.familyHistory?.length ? r.familyHistory.join(", ") : "Ei tiedossa olevia syöpiä", flag: !!r.familyHistory?.length },
  ];
}

/** Short phrases for the referral, only the factors worth telling the specialist. */
export const riskSummary = (p: Pick<Patient, "sex" | "risk">) => riskRows(p).filter((x) => x.flag).map((x) => (x.label === "Suku" ? `suvussa: ${x.value}` : x.value.toLowerCase()));
