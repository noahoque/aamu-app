import { extractWithFallback } from "../../shared/fallbackExtractor";
import { groundSymptoms, type ExtractionResponse, type NoteInput, type NoteResult } from "../../shared/symptoms";

/** Any model that turns notes into symptoms. Swap Gemini for another provider by implementing this. */
export interface SymptomExtractor {
  readonly model: string;
  /** Raw, ungrounded output: one entry per note id the model answered for. */
  extract(notes: NoteInput[]): Promise<{ noteId: string; symptoms: unknown[] }[]>;
}

/** Ground the model's answer in the notes: unknown note ids and invented evidence are dropped. */
export function groundResults(notes: NoteInput[], raw: { noteId: string; symptoms: unknown[] }[]): { results: NoteResult[]; dropped: number } {
  let dropped = 0;
  const results = notes.map((n) => {
    const answer = raw.find((r) => r.noteId === n.id);
    const g = groundSymptoms(n.text, Array.isArray(answer?.symptoms) ? answer.symptoms : []);
    dropped += g.dropped;
    return { noteId: n.id, symptoms: g.symptoms };
  });
  return { results, dropped };
}

/** Use the model if there is one; on any failure, fall back to keywords and say why. */
export async function extractNotes(notes: NoteInput[], extractor: SymptomExtractor | null): Promise<ExtractionResponse> {
  if (extractor) {
    try {
      const raw = await extractor.extract(notes);
      return { source: "gemini", model: extractor.model, ...groundResults(notes, raw) };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { source: "fallback", results: extractWithFallback(notes), dropped: 0, error };
    }
  }
  return { source: "fallback", results: extractWithFallback(notes), dropped: 0, error: "GEMINI_API_KEY puuttuu" };
}
