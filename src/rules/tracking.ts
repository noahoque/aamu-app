// Goal 3: "potilaat pääsevät hoitoon tavoiteaikojen puitteissa".
// Each referred patient's milestones are checked against the target times (data/referrals.ts).
import { TARGETS, type MilestoneKey, type ReferralTrack } from "../data/referrals";
import { addDays, daysBetween } from "./dates";

export const AT_RISK_DAYS = 3;

export type StepState = "done" | "doneLate" | "open" | "atRisk" | "late" | "waiting";

export type StepResult = {
  step: Exclude<MilestoneKey, "sent">;
  label: string;
  state: StepState;
  /** Due date, once the step it is counted from has happened. */
  due?: string;
  /** Days used so far (open) or in total (done). */
  days?: number;
  /** Positive when over the target. */
  overBy?: number;
};

export type TrackResult = {
  track: ReferralTrack;
  steps: StepResult[];
  overall: "late" | "atRisk" | "onTrack" | "treated" | "treatedLate";
  /** The open step the coordinator should act on. */
  current?: StepResult;
  /** Days from referral to treatment start, when treated. */
  totalDays?: number;
};

export function evaluateTrack(track: ReferralTrack, today: string, targets = TARGETS): TrackResult {
  const m = track.milestones;
  const steps: StepResult[] = targets.map((t) => {
    const start = m[t.from];
    if (!start) return { step: t.step, label: t.label, state: "waiting" };
    const due = addDays(start, t.days);
    const end = m[t.step];
    if (end) {
      const days = daysBetween(start, end);
      return { step: t.step, label: t.label, due, days, state: days <= t.days ? "done" : "doneLate", overBy: Math.max(0, days - t.days) };
    }
    const days = daysBetween(start, today);
    const left = daysBetween(today, due);
    return { step: t.step, label: t.label, due, days, state: left < 0 ? "late" : left <= AT_RISK_DAYS ? "atRisk" : "open", overBy: Math.max(0, -left) };
  });

  const open = steps.filter((s) => s.state === "late" || s.state === "atRisk" || s.state === "open");
  const current = open.find((s) => s.state === "late") ?? open.find((s) => s.state === "atRisk") ?? open[0];
  let overall: TrackResult["overall"];
  if (m.treatment) overall = steps.some((s) => s.state === "doneLate") ? "treatedLate" : "treated";
  else if (open.some((s) => s.state === "late")) overall = "late";
  else if (open.some((s) => s.state === "atRisk")) overall = "atRisk";
  else overall = "onTrack";

  return { track, steps, overall, current, totalDays: m.treatment && m.sent ? daysBetween(m.sent, m.treatment) : undefined };
}

/** Share of steps that met their target, counting finished steps and steps already over time. */
export function onTimeShare(results: TrackResult[]): { met: number; total: number; pct: number } {
  const judged = results.flatMap((r) => r.steps).filter((s) => s.state === "done" || s.state === "doneLate" || s.state === "late");
  const met = judged.filter((s) => s.state === "done").length;
  return { met, total: judged.length, pct: judged.length ? Math.round((met / judged.length) * 100) : 100 };
}

/** Most urgent first: over time, then at risk, then on track, then treated. */
export function sortTracks(results: TrackResult[]): TrackResult[] {
  const rank = { late: 0, atRisk: 1, onTrack: 2, treatedLate: 3, treated: 4 };
  return [...results].sort((a, b) => rank[a.overall] - rank[b.overall] || (b.current?.overBy ?? 0) - (a.current?.overBy ?? 0));
}
