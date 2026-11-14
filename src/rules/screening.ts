import { SCREENING_PROGRAMMES } from "../data/content";
import type { Patient, ScreeningRecord } from "../data/types";

export type MissedScreening = { record: ScreeningRecord; programme: string; missed: string };

/**
 * National screening the patient was invited to (within the programme's age range, in the last
 * two years) but did not attend.
 */
export function missedScreenings(p: Patient, today: string): MissedScreening[] {
  const year = Number(today.slice(0, 4));
  return p.screening
    .filter((s) => {
      const prog = SCREENING_PROGRAMMES[s.programme];
      return !s.attended && p.age >= prog.ageMin && p.age <= prog.ageMax && year - s.invitedYear <= 2;
    })
    .map((s) => ({ record: s, programme: SCREENING_PROGRAMMES[s.programme].name, missed: `Kutsu ${s.invitedYear} · ei käyntiä` }));
}
