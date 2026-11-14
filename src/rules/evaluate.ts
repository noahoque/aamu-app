import type { Patient, WorkStatus } from "../data/types";
import { daysBetween } from "./dates";
import { equityOf, type Equity } from "./equity";
import { pathwayHits, type PathwayHit, type SymptomsByVisit } from "./pathways";
import { missedScreenings, type MissedScreening } from "./screening";

export type Evaluation = {
  patient: Patient;
  hits: PathwayHit[];
  /** The hit shown on the worklist (most specific). */
  primary: PathwayHit | null;
  equity: Equity;
  screening: MissedScreening[];
};

/** The record as it was on `today`: nothing from the future. */
export function asOf(p: Patient, today: string): Patient {
  const upTo = <T extends { date: string }>(xs: T[]) => xs.filter((x) => x.date <= today);
  return { ...p, visits: upTo(p.visits), labs: upTo(p.labs), prescriptions: upTo(p.prescriptions), procedures: upTo(p.procedures) };
}

export function evaluatePatient(p: Patient, symptoms: SymptomsByVisit, today: string): Evaluation {
  const record = asOf(p, today);
  const hits = pathwayHits(record, symptoms, today);
  return { patient: record, hits, primary: hits[0] ?? null, equity: equityOf(p), screening: missedScreenings(p, today) };
}

export type WorklistRow = {
  id: string;
  name: string;
  meta: string;
  reasons: string;
  pathway: string;
  daysAgo: number;
  equity: Equity;
  tag: string | null;
  status: WorkStatus;
  evaluation: Evaluation;
};

export function worklistRows(patients: Patient[], symptoms: SymptomsByVisit, today: string, status: Record<string, WorkStatus>): WorklistRow[] {
  return patients
    .map((p) => evaluatePatient(p, symptoms, today))
    .filter((e) => e.primary)
    .map((e) => {
      const hit = e.primary!;
      const daysAgo = daysBetween(hit.flaggedAt, today);
      return {
        id: e.patient.id,
        name: e.patient.name,
        meta: `${e.patient.sex} ${e.patient.age} · ${daysAgo} pv`,
        reasons: hit.summary.join(" · "),
        pathway: hit.pathway,
        daysAgo,
        equity: e.equity,
        tag: e.screening.length ? "Seulonta väliin" : null,
        status: status[e.patient.id] ?? "none",
        evaluation: e,
      };
    });
}
