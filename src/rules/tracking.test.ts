import { describe, expect, it } from "vitest";
import { DEMO_TODAY } from "../data/patients";
import { TRACKS, type ReferralTrack } from "../data/referrals";
import { evaluateTrack, onTimeShare, sortTracks } from "./tracking";

const base: ReferralTrack = { id: "X", name: "Potilas X", sex: "N", age: 60, pathway: "Rinta", careType: "public", distanceKm: 10, language: "fi", milestones: {} };
const at = (milestones: ReferralTrack["milestones"]) => evaluateTrack({ ...base, milestones }, DEMO_TODAY);

describe("treatment-time tracking (Goal 3)", () => {
  it("a fresh referral is on track and waits for assessment", () => {
    const r = at({ sent: DEMO_TODAY });
    expect(r.overall).toBe("onTrack");
    expect(r.current).toMatchObject({ step: "assessed", due: "2026-05-30", state: "open" });
    expect(r.steps.find((s) => s.step === "treatment")?.state).toBe("waiting");
  });

  it("is at risk 3 days before the due date and late after it", () => {
    expect(at({ sent: "2026-05-05" }).overall).toBe("atRisk"); // assessment due 19.5.
    const late = at({ sent: "2026-04-30" }); // due 14.5.
    expect(late.overall).toBe("late");
    expect(late.current?.overBy).toBe(2);
  });

  it("counts treatment time from diagnosis", () => {
    const r = at({ sent: "2026-03-30", assessed: "2026-04-08", diagnosis: "2026-04-21" });
    expect(r.current).toMatchObject({ step: "treatment", due: "2026-05-12", state: "late", overBy: 4 });
  });

  it("a finished pathway is treated, or treated late if any step went over", () => {
    expect(at({ sent: "2026-04-06", assessed: "2026-04-15", diagnosis: "2026-04-30", treatment: "2026-05-12" })).toMatchObject({ overall: "treated", totalDays: 36 });
    expect(at({ sent: "2026-04-01", assessed: "2026-04-20", diagnosis: "2026-04-25", treatment: "2026-05-01" }).overall).toBe("treatedLate");
  });

  it("demo data: two patients over time, one at risk, most urgent first", () => {
    const results = sortTracks(TRACKS.map((t) => evaluateTrack(t, DEMO_TODAY)));
    expect(results.map((r) => [r.track.id, r.overall])).toEqual([
      ["M", "late"],
      ["I", "late"],
      ["K", "atRisk"],
      ["E", "onTrack"],
      ["L", "onTrack"],
      ["J", "treated"],
    ]);
    // I 2/3, M 0/2, K 0/1, E 1/1, L 2/2, J 3/3 (open steps not yet over time are not counted).
    expect(onTimeShare(results)).toEqual({ met: 8, total: 12, pct: 67 });
  });
});
