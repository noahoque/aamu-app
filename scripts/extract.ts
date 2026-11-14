// Precompute symptom extractions for every visit note, so the demo works offline and
// within free-tier limits. One Gemini request per patient.
//   npm run extract              (Gemini if GEMINI_API_KEY is set, otherwise keyword fallback)
//   npm run extract -- --fallback (force the keyword fallback)
import { writeFileSync } from "node:fs";
import { env } from "../server/env";
import { GeminiExtractor } from "../server/llm/gemini";
import { extractNotes } from "../server/llm/provider";
import { PATIENTS } from "../src/data/patients";
import type { ExtractionSource, Symptom } from "../shared/symptoms";

const OUT = "src/data/extractions.json";
const forceFallback = process.argv.includes("--fallback");
const extractor = env.geminiKey && !forceFallback ? new GeminiExtractor(env.geminiKey, env.geminiModel) : null;

type Entry = { source: ExtractionSource; model?: string; symptoms: Symptom[] };
const out: Record<string, Entry> = {};
let dropped = 0;

console.log(extractor ? `Gemini: ${extractor.model}` : "Keyword fallback");
for (const [i, p] of PATIENTS.entries()) {
  const res = await extractNotes(p.visits.map((v) => ({ id: v.id, text: v.note })), extractor);
  if (res.error && extractor) console.warn(`  ${p.name}: fallback (${res.error})`);
  dropped += res.dropped;
  for (const r of res.results) out[r.noteId] = { source: res.source, ...(res.model ? { model: res.model } : {}), symptoms: r.symptoms };
  const n = res.results.reduce((a, r) => a + r.symptoms.length, 0);
  console.log(`  ${p.name}: ${n} oiretta (${res.source})`);
  // Stay well under free-tier requests-per-minute.
  if (extractor && i < PATIENTS.length - 1) await new Promise((r) => setTimeout(r, 7_000));
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${OUT}. Dropped ${dropped} symptom(s) whose evidence was not in the note.`);
