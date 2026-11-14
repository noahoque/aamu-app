// Symptom vocabulary shared by the client, the server and the extraction script.
// The AI step (Gemini or the keyword fallback) only maps free text to these codes.
// Everything that decides a flag lives in the transparent rules in src/rules/.

export const SYMPTOM_CODES = [
  "bloating",
  "early_satiety",
  "weight_loss",
  "abdominal_pain",
  "urinary_frequency",
  "fatigue",
  "postmenopausal_bleeding",
  "hoarseness",
  "cough",
  "dyspnoea",
  "thirst",
  "back_pain",
  "appetite_loss",
] as const;

export type SymptomCode = (typeof SYMPTOM_CODES)[number];

export type Symptom = {
  code: SymptomCode;
  /** Exact phrase from the note (always a substring of it after grounding). */
  evidence: string;
  /** How long the note says the symptom has lasted, in days. */
  durationDays?: number;
  /** An amount the note states, e.g. "4 kg" for weight loss. */
  quantity?: string;
};

/** Finnish labels, used in the UI and in flag reasons. */
export const SYMPTOM_LABELS: Record<SymptomCode, string> = {
  bloating: "turvotus",
  early_satiety: "nopea täyttyminen",
  weight_loss: "laihtuminen",
  abdominal_pain: "vatsakipu",
  urinary_frequency: "tiheä virtsaamistarve",
  fatigue: "väsymys",
  postmenopausal_bleeding: "vuoto vaihdevuosien jälkeen",
  hoarseness: "käheys",
  cough: "yskä",
  dyspnoea: "hengenahdistus",
  thirst: "jano",
  back_pain: "selkäkipu",
  appetite_loss: "ruokahaluttomuus",
};

/** English descriptions, given to the model so the codes are unambiguous. */
export const SYMPTOM_DESCRIPTIONS: Record<SymptomCode, string> = {
  bloating: "abdominal bloating or distension",
  early_satiety: "feeling full quickly / early satiety",
  weight_loss: "unintentional weight loss",
  abdominal_pain: "abdominal or pelvic pain",
  urinary_frequency: "urinary frequency or urgency",
  fatigue: "tiredness or fatigue",
  postmenopausal_bleeding: "vaginal bleeding after menopause (only if the note shows periods have stopped)",
  hoarseness: "hoarse voice",
  cough: "cough",
  dyspnoea: "shortness of breath / breathlessness",
  thirst: "excessive thirst",
  back_pain: "back pain",
  appetite_loss: "loss of appetite",
};

export type NoteInput = { id: string; text: string };
export type NoteResult = { noteId: string; symptoms: Symptom[] };

export type ExtractionSource = "gemini" | "fallback";
export type ExtractionResponse = {
  source: ExtractionSource;
  model?: string;
  results: NoteResult[];
  /** Symptoms the model returned whose evidence was not found in the note. */
  dropped: number;
  /** Why the fallback was used, if it was. */
  error?: string;
};

const QUOTES = /[”“„"]/g;

/**
 * Find `evidence` in `note` and return the note's own text for it, or null.
 * Tolerates case and quote-character differences only; anything else is a hallucination.
 */
export function groundEvidence(note: string, evidence: string): string | null {
  const ev = evidence.trim();
  if (!ev) return null;
  const exact = note.indexOf(ev);
  if (exact >= 0) return ev;
  const norm = (s: string) => s.replace(QUOTES, '"').toLowerCase();
  const i = norm(note).indexOf(norm(ev));
  return i >= 0 ? note.slice(i, i + ev.length) : null;
}

/** Keep only well-formed symptoms whose evidence is really in the note. */
export function groundSymptoms(note: string, raw: unknown[]): { symptoms: Symptom[]; dropped: number } {
  const symptoms: Symptom[] = [];
  let dropped = 0;
  for (const r of raw) {
    const s = r as Partial<Symptom>;
    const evidence = typeof s.evidence === "string" ? groundEvidence(note, s.evidence) : null;
    if (!s.code || !(SYMPTOM_CODES as readonly string[]).includes(s.code) || !evidence) {
      dropped++;
      continue;
    }
    const out: Symptom = { code: s.code, evidence };
    if (typeof s.durationDays === "number" && s.durationDays > 0) out.durationDays = Math.round(s.durationDays);
    if (typeof s.quantity === "string" && s.quantity.trim()) out.quantity = s.quantity.trim();
    // One entry per code per note.
    if (!symptoms.some((x) => x.code === out.code)) symptoms.push(out);
  }
  return { symptoms, dropped };
}
