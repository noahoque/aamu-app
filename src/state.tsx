import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { INITIAL_EXTRACTIONS, type ExtractionEntry } from "./ai/extractions";
import { DEMO_TODAY, INITIAL_STATUS, PATIENTS } from "./data/patients";
import type { WorkStatus } from "./data/types";
import { evaluatePatient, worklistRows, type Evaluation, type WorklistRow } from "./rules/evaluate";
import type { SymptomsByVisit } from "./rules/pathways";
import type { ExtractionResponse } from "../shared/symptoms";
import { TRACKS, type ReferralTrack } from "./data/referrals";
import { evaluateTrack, sortTracks, type TrackResult } from "./rules/tracking";

// Demo state: worklist statuses, the doctor's decisions and live AI re-runs.
// Kept in localStorage so a page reload keeps the demo where it was; "Nollaa demo" clears it.

export type Decision = { patientId: string; at: string; action: "confirmed" | "rejected" | "referred" | "invited"; detail?: string; unit?: string };

type Persisted = {
  status: Record<string, WorkStatus>;
  decisions: Decision[];
  invited: Record<string, string>;
  live: Record<string, ExtractionEntry>;
  /** Coordinator has logged a follow-up on a delayed referral (track id → date). */
  followups: Record<string, string>;
};

const KEY = "aamu-demo-v1";
const EMPTY: Persisted = { status: { ...INITIAL_STATUS }, decisions: [], invited: {}, live: {}, followups: {} };

const load = (): Persisted => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Persisted) } : EMPTY;
  } catch {
    return EMPTY;
  }
};

const now = () => `${DEMO_TODAY}T${new Date().toTimeString().slice(0, 5)}`;

type Ctx = {
  today: string;
  rows: WorklistRow[];
  status: Record<string, WorkStatus>;
  decisions: Decision[];
  invited: Record<string, string>;
  extractions: Record<string, ExtractionEntry>;
  evaluate: (id: string) => Evaluation | null;
  tracks: TrackResult[];
  followups: Record<string, string>;
  logFollowup: (trackId: string) => void;
  confirm: (id: string) => void;
  reject: (id: string, reason: string) => void;
  refer: (id: string, detail: string, unit?: string) => void;
  invite: (id: string, detail: string) => void;
  applyLive: (res: ExtractionResponse) => void;
  reset: () => void;
};

const AppState = createContext<Ctx | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [s, setS] = useState<Persisted>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      // Storage blocked: the demo still works for this session.
    }
  }, [s]);

  const extractions = useMemo(() => ({ ...INITIAL_EXTRACTIONS, ...s.live }), [s.live]);
  const symptoms: SymptomsByVisit = useMemo(() => Object.fromEntries(Object.entries(extractions).map(([k, v]) => [k, v.symptoms])), [extractions]);
  const rows = useMemo(() => worklistRows(PATIENTS, symptoms, DEMO_TODAY, s.status), [symptoms, s.status]);

  // Referral tracking: the synthetic tracks plus every patient referred in this demo.
  const tracks = useMemo(() => {
    const inApp: ReferralTrack[] = s.decisions
      .filter((d) => d.action === "referred" && !TRACKS.some((t) => t.id === d.patientId))
      .map((d) => {
        const p = PATIENTS.find((x) => x.id === d.patientId)!;
        const pathway = evaluatePatient(p, symptoms, DEMO_TODAY).primary?.pathway ?? "";
        return { id: p.id, name: p.name, sex: p.sex, age: p.age, pathway, careType: p.careType, distanceKm: p.distanceKm, language: p.language, unit: d.unit, milestones: { sent: d.at.slice(0, 10) } };
      });
    return sortTracks([...TRACKS, ...inApp].map((t) => evaluateTrack(t, DEMO_TODAY)));
  }, [s.decisions, symptoms]);

  const decide = useCallback((d: Omit<Decision, "at">, status?: WorkStatus) => {
    setS((x) => ({ ...x, decisions: [...x.decisions, { ...d, at: now() }], status: status ? { ...x.status, [d.patientId]: status } : x.status }));
  }, []);

  const value: Ctx = {
    today: DEMO_TODAY,
    rows,
    status: s.status,
    decisions: s.decisions,
    invited: s.invited,
    extractions,
    evaluate: (id) => {
      const p = PATIENTS.find((x) => x.id === id);
      return p ? evaluatePatient(p, symptoms, DEMO_TODAY) : null;
    },
    tracks,
    followups: s.followups,
    logFollowup: (trackId) => setS((x) => ({ ...x, followups: { ...x.followups, [trackId]: DEMO_TODAY } })),
    confirm: (id) => decide({ patientId: id, action: "confirmed" }, "confirmed"),
    reject: (id, reason) => decide({ patientId: id, action: "rejected", detail: reason }, "rejected"),
    refer: (id, detail, unit) => decide({ patientId: id, action: "referred", detail, unit }, "referred"),
    invite: (id, detail) => {
      decide({ patientId: id, action: "invited", detail });
      setS((x) => ({ ...x, invited: { ...x.invited, [id]: DEMO_TODAY } }));
    },
    applyLive: (res) =>
      setS((x) => ({
        ...x,
        live: { ...x.live, ...Object.fromEntries(res.results.map((r) => [r.noteId, { source: res.source, model: res.model, symptoms: r.symptoms, live: true }])) },
      })),
    reset: () => setS({ ...EMPTY, status: { ...INITIAL_STATUS } }),
  };
  return <AppState.Provider value={value}>{children}</AppState.Provider>;
};

export const useAppState = () => {
  const c = useContext(AppState);
  if (!c) throw new Error("useAppState outside AppStateProvider");
  return c;
};

export const STATUS_LABEL: Record<WorkStatus, { label: string; tone: "error" | "neutral" | "success" | "primary" | "outline" }> = {
  none: { label: "Ei jatkotoimia", tone: "error" },
  contacted: { label: "Kutsuttu", tone: "neutral" },
  confirmed: { label: "Vahvistettu", tone: "primary" },
  referred: { label: "Lähetetty", tone: "success" },
  rejected: { label: "Hylätty", tone: "outline" },
};
