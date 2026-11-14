# Aamu

Clinical decision support for earlier cancer diagnosis (Junction 2026, AstraZeneca challenge).
Aamu reads primary-care visits, lab results and prescriptions, flags patients whose records
together suggest possible cancer, and puts them on a care coordinator's worklist.
**A doctor always makes the decision. All patient data is synthetic.**

The look, data and Finnish wording follow the demo video in `../ajoissa-video/`.

## Run it

You need Node.js 22 or newer.

```bash
npm install
npm run dev        # app on http://localhost:5173, API on :8787
npm test           # rule and extraction tests
```

The app works without any API key: symptoms then come from a deterministic Finnish keyword
extractor, labelled "Varapoiminta (avainsanat)" in the UI.

## AI symptom extraction with Gemini (free)

1. Get a free key at <https://aistudio.google.com/apikey> (no billing needed).
2. `cp .env.example .env` and set `GEMINI_API_KEY`. The key is read only by the server
   (`server/`, `scripts/`), never by the browser.
3. `npm run extract` calls Gemini once per patient and writes `src/data/extractions.json`.
   The app reads this file first, so the demo runs offline and free-tier limits don't matter.
4. On a patient page, **Aja tekoälypoiminta uudelleen** calls Gemini live through the server.

`GEMINI_MODEL` defaults to `gemini-flash-lite-latest`. Free-tier limits are small and vary by
model; check your project's rate-limit page in AI Studio.

**Free-tier input may be used by Google to improve its products.** That's acceptable here only
because all data is synthetic. A real deployment would use a paid/enterprise or on-premises model
(swap it in by implementing `SymptomExtractor` in `server/llm/provider.ts`).

How the AI is kept honest:

- The model only maps note text to a fixed list of symptom codes (`shared/symptoms.ts`).
- Every symptom must quote its evidence from the note. The server drops anything that isn't a
  literal substring of the note, so invented symptoms never reach the UI.
- Whether a patient is flagged is decided by the transparent rules in `src/rules/`, not the model.

## What's where

| Feature | Code |
|---|---|
| Worklist, equity priority (public care only, >50 km, minority language) | `src/pages/Worklist.tsx`, `src/rules/equity.ts` |
| Patient view: timeline, labs, flag reasons, confirm/reject | `src/pages/Patient.tsx` |
| Pathway rules (NICE NG12 thresholds) | `src/rules/pathways.ts`, `src/rules/labs.ts` |
| Referral with selectable tests, G8 for 75+ | `src/pages/ReferralDialog.tsx` |
| Missed-screening invitation in Finnish and Russian | `src/pages/ScreeningInvite.tsx`, `src/rules/screening.ts` |
| Treatment-time tracking (Goal 3), example target times | `src/pages/Tracking.tsx`, `src/rules/tracking.ts`, `src/data/referrals.ts` |
| Region view: where the gap emerges, data gap, five proposals | `src/pages/Region.tsx`, `src/pages/RegionInsights.tsx` |
| Sources for every real number and roadmap measure | `src/references.ts`, `src/components/SourceLink.tsx`, `/lahteet` |
| Synthetic patients | `src/data/patients.ts` |
| Gemini + keyword fallback | `server/llm/`, `shared/fallbackExtractor.ts` |

## Intro video

Opening the app on the home screen shows the ~3 min demo video (`public/aamu-esittely.mp4`, rendered
from `../ajoissa-video` with `npm run render:long`). The *Esittely* button reopens it.
Direct links to other screens, or `?esittely=0`, skip it.

## Demo script (matches the video)

1. **Työlista**: switch *Järjestys* to *Yhdenvertaisuus ensin*. Patient A moves to the top.
   Click A's yellow chip to see why (207 vs 123 days, 64 km, with sources).
2. Click D's red *Seulonta väliin* chip and send the invitation in Finnish and Russian.
3. Open **Potilas A**: CA-125, platelets, CRP and Hb read together; the AI-extracted phrases
   are highlighted in the notes; *Miksi hälytys?* lists the four reasons with rule or AI labels.
4. **Vahvista hälytys**, then tick ultrasound and CT in the referral and **Lähetä**.
   There is no cancer notification: that is filed after diagnosis, not on suspicion.
5. **Seuranta**: Patient A now appears as referred; two synthetic patients are over target time.
6. **Alue**: where the public/private gap emerges (real data), the stage-data gap, five proposals.
7. **Nollaa demo** (top bar) restores the starting state.

See `SUBMISSION.md` for the challenge write-up.

## Check before presenting

- Lab values, reference ranges and test lists are synthetic. Have a doctor check them.
- Have native speakers check the Finnish and Russian invitation texts (`src/data/content.ts`).
- The 75+ age limit for G8 is Aamu's own choice; the roadmap names G8 but sets no limit.
