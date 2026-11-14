import { extractWithFallback } from "../../shared/fallbackExtractor";
import type { ExtractionResponse, ExtractionSource, NoteInput, Symptom } from "../../shared/symptoms";
import { PATIENTS } from "../data/patients";

export type ExtractionEntry = { source: ExtractionSource; model?: string; symptoms: Symptom[]; live?: boolean };

// Precomputed by `npm run extract` (Gemini, or the keyword fallback without a key).
// import.meta.glob returns {} if the file does not exist yet, so the app still starts.
const files = import.meta.glob<{ default: Record<string, ExtractionEntry> }>("../data/extractions.json", { eager: true });
const PRECOMPUTED: Record<string, ExtractionEntry> = Object.values(files)[0]?.default ?? {};

/** Precomputed results where available, keyword fallback for any note without one. */
export const INITIAL_EXTRACTIONS: Record<string, ExtractionEntry> = (() => {
  const notes = PATIENTS.flatMap((p) => p.visits.map((v) => ({ id: v.id, text: v.note })));
  const missing = notes.filter((n) => !PRECOMPUTED[n.id]);
  const out: Record<string, ExtractionEntry> = { ...PRECOMPUTED };
  for (const r of extractWithFallback(missing)) out[r.noteId] = { source: "fallback", symptoms: r.symptoms };
  return out;
})();

export type ApiStatus = { gemini: boolean; model: string | null };

export async function fetchStatus(): Promise<ApiStatus | null> {
  try {
    const res = await fetch("/api/status");
    return res.ok ? ((await res.json()) as ApiStatus) : null;
  } catch {
    return null;
  }
}

/** Run extraction live through the server. If the server is unreachable, run the fallback here. */
export async function extractLive(notes: NoteInput[]): Promise<ExtractionResponse> {
  try {
    const res = await fetch("/api/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes }) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ExtractionResponse;
  } catch (err) {
    return { source: "fallback", results: extractWithFallback(notes), dropped: 0, error: `Palvelin ei vastaa (${err instanceof Error ? err.message : err})` };
  }
}
