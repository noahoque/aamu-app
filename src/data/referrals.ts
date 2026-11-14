// SYNTHETIC referred patients for the treatment-time tracker (Seuranta). Not real patients.
// Patients referred in the app (e.g. Patient A after "Lähetä") are added to these at runtime.
import type { CareType, Language, Sex } from "./types";

export type MilestoneKey = "sent" | "assessed" | "diagnosis" | "treatment";

export type ReferralTrack = {
  id: string;
  name: string;
  sex: Sex;
  age: number;
  pathway: string;
  careType: CareType;
  distanceKm: number;
  language: Language;
  /** ISO dates of the milestones reached so far. */
  milestones: Partial<Record<MilestoneKey, string>>;
  /** Stage (levinneisyysluokka) recorded at diagnosis, so early detection can be measured. */
  stage?: "I" | "II" | "III" | "IV";
};

export const MILESTONES: { key: MilestoneKey; label: string; short: string }[] = [
  { key: "sent", label: "Lähete lähetetty", short: "Lähete" },
  { key: "assessed", label: "Erikoislääkärin arvio", short: "Arvio" },
  { key: "diagnosis", label: "Diagnoosi", short: "Diagnoosi" },
  { key: "treatment", label: "Hoidon aloitus", short: "Hoito" },
];

/**
 * EXAMPLE target times, in days. Finland has not yet defined cancer-specific target times:
 * the roadmap schedules them for 2026–2028 (measure 3.1.2, p. 57). A wellbeing services county
 * sets its own here until then.
 */
export const TARGETS: { step: Exclude<MilestoneKey, "sent">; from: MilestoneKey; days: number; label: string }[] = [
  { step: "assessed", from: "sent", days: 14, label: "Arvio 14 pv lähetteestä" },
  { step: "diagnosis", from: "sent", days: 28, label: "Diagnoosi 28 pv lähetteestä" },
  { step: "treatment", from: "diagnosis", days: 21, label: "Hoito 21 pv diagnoosista" },
];

export const TRACKS: ReferralTrack[] = [
  { id: "I", name: "Potilas I", sex: "N", age: 63, pathway: "Rinta", careType: "public", distanceKm: 92, language: "fi", milestones: { sent: "2026-03-30", assessed: "2026-04-08", diagnosis: "2026-04-21" }, stage: "II" },
  { id: "M", name: "Potilas M", sex: "N", age: 71, pathway: "Haima", careType: "public", distanceKm: 40, language: "ru", milestones: { sent: "2026-04-10", assessed: "2026-04-28" } },
  { id: "K", name: "Potilas K", sex: "M", age: 59, pathway: "Keuhko", careType: "public", distanceKm: 67, language: "fi", milestones: { sent: "2026-04-20", assessed: "2026-05-07" } },
  { id: "E", name: "Potilas E", sex: "M", age: 62, pathway: "Epämääräiset", careType: "mixed", distanceKm: 15, language: "fi", milestones: { sent: "2026-05-08", assessed: "2026-05-14" } },
  { id: "L", name: "Potilas L", sex: "N", age: 47, pathway: "Suolisto", careType: "occupational", distanceKm: 9, language: "fi", milestones: { sent: "2026-04-24", assessed: "2026-04-29", diagnosis: "2026-05-08" }, stage: "I" },
  { id: "J", name: "Potilas J", sex: "M", age: 70, pathway: "Eturauhanen", careType: "mixed", distanceKm: 18, language: "fi", milestones: { sent: "2026-04-06", assessed: "2026-04-15", diagnosis: "2026-04-30", treatment: "2026-05-12" }, stage: "II" },
];
