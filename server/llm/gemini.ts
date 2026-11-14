import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { SYMPTOM_CODES, SYMPTOM_DESCRIPTIONS, type NoteInput } from "../../shared/symptoms";
import type { SymptomExtractor } from "./provider";

// Symptom extraction with Gemini (Google AI Studio free tier).
// Free-tier input may be used by Google to improve its products, so this must only ever see
// synthetic data. A real deployment would use a paid/enterprise or on-premises model.

const SYSTEM = `You read short Finnish primary-care notes and list the symptoms the patient reports.
Rules:
- Use only these codes:
${SYMPTOM_CODES.map((c) => `  ${c}: ${SYMPTOM_DESCRIPTIONS[c]}`).join("\n")}
- "evidence" must be copied character for character from the note: the shortest phrase that shows the symptom. Never translate or paraphrase it.
- Skip symptoms the note denies (e.g. "ei kuumetta") and things that are not symptoms (lab results, plans, diagnoses).
- "durationDays": only if the note states how long the symptom has lasted (1 viikko = 7, 2 kk = 60).
- "quantity": only for weight_loss when the note gives an amount, e.g. "4 kg".
- Return every note id you were given, with an empty list if there are no symptoms.
You do not diagnose. You only extract.`;

const SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          noteId: { type: Type.STRING },
          symptoms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING, enum: [...SYMPTOM_CODES] },
                evidence: { type: Type.STRING },
                durationDays: { type: Type.INTEGER },
                quantity: { type: Type.STRING },
              },
              required: ["code", "evidence"],
              propertyOrdering: ["code", "evidence", "durationDays", "quantity"],
            },
          },
        },
        required: ["noteId", "symptoms"],
        propertyOrdering: ["noteId", "symptoms"],
      },
    },
  },
  required: ["results"],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const statusOf = (err: unknown) => (typeof err === "object" && err && "status" in err ? Number((err as { status: unknown }).status) : 0);

export class GeminiExtractor implements SymptomExtractor {
  private ai: GoogleGenAI;
  constructor(
    apiKey: string,
    readonly model: string,
  ) {
    this.ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 30_000 } });
  }

  async extract(notes: NoteInput[]) {
    const contents = `Notes (JSON):\n${JSON.stringify(notes.map((n) => ({ id: n.id, text: n.text })))}`;
    // Free-tier limits are low: retry rate-limit / overload errors a couple of times.
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await this.ai.models.generateContent({
          model: this.model,
          contents,
          config: { systemInstruction: SYSTEM, responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0 },
        });
        const parsed = JSON.parse(res.text ?? "{}") as { results?: { noteId: string; symptoms: unknown[] }[] };
        if (!Array.isArray(parsed.results)) throw new Error("Gemini returned no results array");
        return parsed.results;
      } catch (err) {
        const status = statusOf(err);
        if ((status === 429 || status === 503) && attempt < 2) {
          await sleep(attempt === 0 ? 5_000 : 20_000);
          continue;
        }
        throw err;
      }
    }
  }
}
