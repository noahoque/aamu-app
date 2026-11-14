import { describe, expect, it } from "vitest";
import { extractWithFallback } from "../../shared/fallbackExtractor";
import { DEMO_TODAY, INITIAL_STATUS, PATIENTS, patientById } from "../data/patients";
import type { Patient } from "../data/types";
import { daysBetween, fmtLong, isoWeek } from "./dates";
import { equityOf, sortRows } from "./equity";
import { evaluatePatient, worklistRows } from "./evaluate";
import { isHigh, isLow, markerTrend, describeTrend, refText } from "./labs";
import type { SymptomsByVisit } from "./pathways";
import { riskRows, riskSummary } from "./risk";
import { missedScreenings } from "./screening";

// Symptoms from the deterministic fallback extractor, so the tests never need the network.
const SYMPTOMS: SymptomsByVisit = Object.fromEntries(
  extractWithFallback(PATIENTS.flatMap((p) => p.visits.map((v) => ({ id: v.id, text: v.note })))).map((r) => [r.noteId, r.symptoms]),
);
const A = patientById("A")!;
const D = patientById("D")!;

describe("dates", () => {
  it("demo today is two days after Patient A's flag, in week 20", () => {
    expect(daysBetween("2026-05-14", DEMO_TODAY)).toBe(2);
    expect(isoWeek("2026-05-14")).toBe(20);
    expect(fmtLong("2026-05-14")).toBe("14.5.2026");
  });
});

describe("lab reference ranges", () => {
  it("CA-125 of 35 or more is raised (NICE NG12)", () => {
    expect(isHigh("CA-125", "N", 35)).toBe(true);
    expect(isHigh("CA-125", "N", 34.9)).toBe(false);
    expect(refText("CA-125", "N")).toBe("alle 35");
  });
  it("CRP of 10 is above 'alle 10', platelets of 360 are still in range", () => {
    expect(isHigh("CRP", "N", 10)).toBe(true);
    expect(isHigh("CRP", "N", 9)).toBe(false);
    expect(isHigh("Trombosyytit", "N", 360)).toBe(false);
    expect(isHigh("Trombosyytit", "N", 361)).toBe(true);
  });
  it("Hb range depends on sex", () => {
    expect(isLow("Hemoglobiini", "N", 116)).toBe(true);
    expect(isLow("Hemoglobiini", "N", 117)).toBe(false);
    expect(isLow("Hemoglobiini", "M", 130)).toBe(true);
    expect(refText("Hemoglobiini", "N")).toBe("117–155");
  });
  it("reads platelets, CRP and Hb together for Patient A", () => {
    const t = markerTrend(A)!;
    expect(t.count).toBe(3);
    expect(describeTrend(t)).toBe("Trombosyytit ja CRP nousussa, Hb laskussa");
  });
});

describe("Patient A (ovarian)", () => {
  const e = evaluatePatient(A, SYMPTOMS, DEMO_TODAY);

  it("gives the four flag reasons shown in the video", () => {
    expect(e.primary?.reasons.map(({ fact, rule }) => ({ fact, rule }))).toEqual([
      { fact: "CA-125 koholla: 48 → 64 kU/l", rule: "Sääntö: yli viitearvon, ei jatkotutkimusta" },
      { fact: "Trombosyytit ja CRP nousussa, Hb laskussa", rule: "Sääntö: kolmen arvon yhteinen trendi" },
      { fact: "Turvotus, nopea täyttyminen, laihtunut 4 kg", rule: "Tekoäly: poimittu käyntimerkinnöistä" },
      { fact: "Nainen yli 50 v, 4. yhteydenotto / 4 kk", rule: "Sääntö: munasarjasyövän oireyhdistelmä" },
    ]);
  });

  it("is flagged on 14.5. with the video's referral basis", () => {
    expect(e.primary?.flaggedAt).toBe("2026-05-14");
    expect(e.primary?.referralBasis.join(" · ")).toBe("CA-125 64 · trombosyytit 418 · laihtunut 4 kg");
    expect(e.hits).toHaveLength(1); // no extra non-specific flag on top of the ovarian one
  });

  it("AI evidence points at exact phrases in the notes", () => {
    const ai = e.primary!.reasons.find((r) => r.kind === "ai")!;
    for (const ev of ai.evidence!) {
      expect(A.visits.find((v) => v.id === ev.visitId)!.note).toContain(ev.text);
    }
  });

  it("still flags on the lab rules alone if the AI step returns nothing", () => {
    const noAi = evaluatePatient(A, {}, DEMO_TODAY);
    expect(noAi.primary?.pathway).toBe("Munasarja");
    expect(noAi.primary?.reasons.some((r) => r.kind === "ai")).toBe(false);
  });

  it("drops the ovarian flag when CA-125 was followed up by ultrasound and there are no symptoms", () => {
    const followed: Patient = { ...A, procedures: [{ date: "2026-04-25", name: "Gynekologinen ultraääni" }] };
    const e = evaluatePatient(followed, {}, DEMO_TODAY);
    expect(e.hits.map((h) => h.id)).not.toContain("ovarian");
    // Rising platelets above range with 4 visits / 3 months still go to the non-specific pathway.
    expect(e.primary?.pathway).toBe("Epämääräiset");
  });

  it("ignores records after today", () => {
    const early = evaluatePatient(A, SYMPTOMS, "2026-04-19");
    expect(early.primary).toBeNull();
  });
});

describe("worklist", () => {
  const rows = worklistRows(PATIENTS, SYMPTOMS, DEMO_TODAY, INITIAL_STATUS);
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  it("has the rows, reasons and pathways from the video", () => {
    const video = [
      { id: "D", meta: "N 56 · 1 pv", reasons: "Vuoto vaihdevuosien jälkeen", pathway: "Gynekologinen", equity: "Kieli: venäjä", tag: "Seulonta väliin" },
      { id: "A", meta: "N 58 · 2 pv", reasons: "CA-125 koholla · trombosyytit ↑ · laihtunut 4 kg", pathway: "Munasarja", equity: "Vain julkinen · 64 km", tag: null },
      { id: "F", meta: "N 74 · 3 pv", reasons: "Raudanpuuteanemia · ei kolonoskopiaa", pathway: "Suolisto", equity: "78 km sairaalaan", tag: null },
      { id: "H", meta: "N 68 · 4 pv", reasons: "Käheys 4 viikkoa · tupakoi", pathway: "Pää-kaula", equity: null, tag: null },
      { id: "B", meta: "M 71 · 5 pv", reasons: "Uusi diabetes yli 50 v · laihtunut 6 kg", pathway: "Haima", equity: null, tag: null },
      { id: "C", meta: "M 66 · 6 pv", reasons: "Yskä yli 3 viikkoa · 2 antibioottikuuria", pathway: "Keuhko", equity: null, tag: null },
      { id: "E", meta: "M 62 · 9 pv", reasons: "Trombosyytit nousussa · 4 käyntiä / 3 kk", pathway: "Epämääräiset", equity: null, tag: null },
    ];
    expect(sortRows(rows, "newest").map((r) => ({ id: r.id, meta: r.meta, reasons: r.reasons, pathway: r.pathway, equity: r.equity.label, tag: r.tag }))).toEqual(video);
  });

  it("does not flag Patient G (ordinary flu)", () => {
    expect(byId.G).toBeUndefined();
  });

  it("equity priority reorders the list as in the video", () => {
    expect(sortRows(rows, "newest").map((r) => r.id)).toEqual(["D", "A", "F", "H", "B", "C", "E"]);
    expect(sortRows(rows, "equity").map((r) => r.id)).toEqual(["A", "D", "F", "H", "B", "C", "E"]);
  });

  it("starts with C contacted and E referred, five open", () => {
    expect(byId.C.status).toBe("contacted");
    expect(byId.E.status).toBe("referred");
    expect(rows.filter((r) => r.status === "none")).toHaveLength(5);
    expect(rows.filter((r) => r.equity.score > 0)).toHaveLength(3);
  });
});

describe("equity criteria", () => {
  it("counts public-only care, distance over 50 km and minority language", () => {
    expect(equityOf(A)).toMatchObject({ publicOnly: true, far: true, minorityLanguage: false, score: 2, icon: "home" });
    expect(equityOf({ ...A, distanceKm: 50 }).far).toBe(false);
    expect(equityOf({ ...A, language: "sv" }).minorityLanguage).toBe(false);
    expect(equityOf({ ...A, language: "ru" }).label).toBe("Vain julkinen · 64 km · kieli: venäjä");
  });
});

describe("missed screening", () => {
  it("finds Patient D's missed cervical screening", () => {
    expect(missedScreenings(D, DEMO_TODAY)).toEqual([
      expect.objectContaining({ programme: "Kohdunkaulan syövän seulonta", missed: "Kutsu 2025 · ei käyntiä" }),
    ]);
  });
  it("ignores attended or out-of-age screenings", () => {
    expect(missedScreenings({ ...D, screening: [{ programme: "cervical", invitedYear: 2025, attended: true }] }, DEMO_TODAY)).toEqual([]);
    expect(missedScreenings({ ...D, age: 66 }, DEMO_TODAY)).toEqual([]);
  });
});

describe("referral unit, follow-up tests and risk factors", () => {
  const primary = (id: string) => evaluatePatient(patientById(id)!, SYMPTOMS, DEMO_TODAY).primary!;

  it("picks the default receiving unit from the pathway", () => {
    expect(primary("A").unit).toBe("gyn");
    expect(primary("F").unit).toBe("gastro");
    expect(primary("C").unit).toBe("pulm");
    expect(primary("H").unit).toBe("ent");
    expect(primary("E").unit).toBe("rapid");
  });

  it("lists biopsy and genetic testing as specialist follow-up, never as GP tests", () => {
    const a = primary("A");
    expect(a.followUp.map((t) => t.name)).toContain("BRCA1/2-geenitesti");
    expect(a.tests.map((t) => t.name)).not.toContain("BRCA1/2-geenitesti");
    expect(a.followUp.every((t) => !t.suggested)).toBe(true);
  });

  it("risk factors alone never raise a flag", () => {
    const G = patientById("G")!;
    const risky: Patient = { ...G, risk: { smoking: "current", packYears: 50, auditC: 12, bmi: 35, familyHistory: ["isä: keuhkosyöpä"] } };
    expect(evaluatePatient(risky, SYMPTOMS, DEMO_TODAY).primary).toBeNull();
  });

  it("smoking still shows on H's hoarseness flag; AUDIT-C uses sex-specific limits", () => {
    expect(primary("H").summary).toContain("tupakoi");
    expect(riskSummary(patientById("H")!)).toEqual(["tupakoi · 30 askivuotta", "audit-c 7/12 · riskiraja ylittyy"]);
    const man = { sex: "M" as const, risk: { smoking: "never" as const, auditC: 5 } };
    expect(riskRows(man)[1].flag).toBe(false);
    expect(riskRows({ ...man, sex: "N" })[1].flag).toBe(true);
  });
});
