import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { env } from "./env";
import { GeminiExtractor } from "./llm/gemini";
import { extractNotes } from "./llm/provider";
import type { NoteInput } from "../shared/symptoms";

const extractor = env.geminiKey ? new GeminiExtractor(env.geminiKey, env.geminiModel) : null;
const app = new Hono();

app.get("/api/status", (c) => c.json({ gemini: !!extractor, model: extractor?.model ?? null }));

app.post("/api/extract", async (c) => {
  const body = await c.req.json().catch(() => null);
  const notes = (body as { notes?: unknown } | null)?.notes;
  const valid =
    Array.isArray(notes) &&
    notes.length > 0 &&
    notes.length <= 50 &&
    notes.every((n) => typeof n?.id === "string" && typeof n?.text === "string" && n.text.length <= 4000);
  if (!valid) return c.json({ error: "Odotettiin { notes: [{ id, text }] } (1–50 merkintää)" }, 400);
  const res = await extractNotes(notes as NoteInput[], extractor);
  if (res.error) console.warn(`[extract] fallback: ${res.error}`);
  return c.json(res);
});

if (env.production) {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`Aamu API on http://localhost:${info.port} · ${extractor ? `Gemini (${extractor.model})` : "keyword fallback (no GEMINI_API_KEY)"}`);
});
