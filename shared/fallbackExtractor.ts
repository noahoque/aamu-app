import type { NoteInput, NoteResult, Symptom, SymptomCode } from "./symptoms";

// Deterministic Finnish keyword extractor. Used when Gemini is not configured or fails,
// so the demo never depends on the network. It is deliberately simple and is labelled
// "varapoiminta (avainsanat)" in the UI.

type Pattern = { code: SymptomCode; re: RegExp; requires?: RegExp; quantity?: RegExp };

const PATTERNS: Pattern[] = [
  // \p{L} instead of \w so Finnish letters (ä, ö) stay inside the match.
  { code: "bloating", re: /vatsa (?:yhä )?turvoksissa|turvotus|turvottaa/iu },
  { code: "early_satiety", re: /täyttyy nopeasti(?: syödessä)?/iu },
  { code: "weight_loss", re: /laihtunut(?: \d+(?:[,.]\d+)? ?kg)?|paino laskenut/iu, quantity: /(\d+(?:[,.]\d+)?) ?kg/iu },
  { code: "abdominal_pain", re: /(?:ala)?vatsakipu\p{L}*/iu },
  { code: "urinary_frequency", re: /tiheä virtsaamistarve/iu },
  { code: "fatigue", re: /väsymy\p{L}*|väsynyt/iu },
  { code: "postmenopausal_bleeding", re: /(?:verinen )?vuoto(?: emättimestä)?/iu, requires: /kuukautiset loppuneet|vaihdevuo/iu },
  { code: "hoarseness", re: /käheys|käheä/iu },
  { code: "cough", re: /yskä\p{L}*/iu },
  { code: "dyspnoea", re: /hengästy\p{L}*|hengenahdistu\p{L}*/iu },
  { code: "thirst", re: /\bjano\b|janottaa/iu },
  { code: "back_pain", re: /selkäkipu\p{L}*/iu },
  { code: "appetite_loss", re: /ruokahalu huono|ruokahaluttomuus/iu },
];

const NEGATION = /\b(?:ei|eikä)\s+$/i;

/** "4 viikkoa" → 28, "2 kk" → 60, "1 viikko" → 7, "10 pv" → 10. */
export function parseDurationDays(text: string): number | undefined {
  const m = text.match(/(\d+)\s*(viikko|viikkoa|vk|kk|kuukautta|kuukausi|pv|päivää|päivä)\b/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith("viik") || unit === "vk") return n * 7;
  if (unit === "kk" || unit.startsWith("kuukau")) return n * 30;
  return n;
}

/** The sentence (or clause up to a full stop) around a match, for duration lookup. */
function sentenceAround(text: string, index: number): string {
  const start = Math.max(text.lastIndexOf(".", index - 1), text.lastIndexOf("”", index - 1)) + 1;
  const endDot = text.indexOf(".", index);
  return text.slice(start, endDot < 0 ? text.length : endDot);
}

export function extractFromNote(text: string): Symptom[] {
  const out: Symptom[] = [];
  for (const p of PATTERNS) {
    if (p.requires && !p.requires.test(text)) continue;
    const m = p.re.exec(text);
    if (!m) continue;
    if (NEGATION.test(text.slice(Math.max(0, m.index - 6), m.index))) continue;
    const s: Symptom = { code: p.code, evidence: m[0] };
    const sentence = sentenceAround(text, m.index);
    const d = parseDurationDays(sentence);
    if (d) s.durationDays = d;
    if (p.quantity) {
      const q = sentence.match(p.quantity);
      if (q) s.quantity = `${q[1]} kg`;
    }
    out.push(s);
  }
  return out;
}

export function extractWithFallback(notes: NoteInput[]): NoteResult[] {
  return notes.map((n) => ({ noteId: n.id, symptoms: extractFromNote(n.text) }));
}
