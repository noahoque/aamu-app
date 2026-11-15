# Aamu

**Spotting cancer earlier in primary care, so public healthcare patients don't wait longer.**
Junction 2026 · AstraZeneca challenge: equitable and effective cancer care in Finland.

- **Live demo:** https://aamu-app.vercel.app (opens with the 2-minute demo video)
- **Demo video:** [`public/aamu-esittely.mp4`](public/aamu-esittely.mp4) (2:00, Finnish narration)
- **Slide deck:** [`docs/aamu-diat.pdf`](docs/aamu-diat.pdf)
- **Challenge write-up:** [`SUBMISSION.md`](SUBMISSION.md)

> A doctor always makes the final decision. All patient data in the demo is synthetic.

## The problem

In Finland, lymphoma patients who first seek care at a public health centre wait **207 days** from
first symptoms to treatment; through private or workplace healthcare, **123 days**. Almost all of
the gap opens **before the specialist visit**, while the cancer is being recognised and referred.
The warning signs are usually there, but spread across separate visits, lab results and
prescriptions, so no one sees the whole picture. And because the stage of the cancer is recorded
for only **42 %** of cancers, the national goal of finding 70 % early can't even be measured.

## What Aamu does

1. **Finds patients who need a closer look.** Reads visits, lab results and prescriptions together
   and raises an alert when the combination suggests possible cancer, with the reasons and sources.
2. **Puts the right patients first.** The coordinator's worklist shows first those most likely to
   wait longest: people who rely only on public care, live over 50 km from a hospital, or speak a
   minority language. A missed screening invitation can be resent in the patient's own language.
3. **Makes referral quick.** One click gives the doctor a ready referral: the receiving specialty is
   preselected, recommended tests are ticked, relevant risk factors are included, and the
   specialist's likely next steps (biopsy, genetic testing) are shown for information.
4. **Follows every patient to treatment.** Each referral is tracked against target times, so delays
   are seen in time. The stage of the cancer is recorded at diagnosis, so early detection becomes
   measurable by region.
5. **Shows leaders where to act.** Where in the pathway the gap opens, and five concrete actions tied
   to Finland's national cancer strategy. A region can start with a risk-free pilot on its own past
   records.

## Try it in 2 minutes

1. **Työlista:** switch *Järjestys* to *Yhdenvertaisuus ensin*; Patient A moves to the top.
2. Open **Potilas A**: the notes, lab values and *Miksi hälytys?* show why she was flagged.
3. Click **Vahvista hälytys**, review the ready referral and **Lähetä**.
4. **Seuranta:** Patient A is now followed to treatment; delayed patients stand out.
5. **Alue:** where the public/private gap opens, and what to do about it.

*Nollaa demo* at the bottom of the sidebar resets the demo.

## Trust and safety

- **The doctor decides.** Aamu only highlights what might otherwise be missed; rejecting an alert
  records a reason so the rules can be reviewed.
- **Transparent rules decide alerts.** Thresholds follow NICE NG12, because Finland has no Käypä
  hoito guideline for recognising suspected cancer in primary care.
- **The AI can't invent symptoms.** It only picks symptoms out of free-text notes, and every symptom
  must quote the note word for word; anything else is discarded.
- **Every real number has a source.** The *Lähteet* page links the national cancer strategy, Käypä
  hoito, Terveysportti, PubMed studies and the cancer registry.
- **Synthetic data only.** The public demo uses the built-in keyword extraction, so no AI key is
  exposed; Gemini is used when a key is configured (below).

## Technology

React and TypeScript (Vite), a Node.js API (Hono), Google Gemini for symptom extraction, Vitest for
the rule tests, hosted on Vercel. Demo video narration by ElevenLabs.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev     # app on http://localhost:5173, API on :8787
npm test
```

Optional Gemini: get a free key at <https://aistudio.google.com/apikey>, copy `.env.example` to
`.env` and set `GEMINI_API_KEY`, then run `npm run extract` to precompute the extractions. The key
is only read by the server, never by the browser. Free-tier input may be used by Google, which is
acceptable only because all data is synthetic.

## Project structure

| Feature | Code |
|---|---|
| Worklist and equity priority | `src/pages/Worklist.tsx`, `src/rules/equity.ts` |
| Patient view: visits, lab values with reference ranges, alert reasons, risk factors | `src/pages/Patient.tsx`, `src/rules/labs.ts`, `src/rules/risk.ts` |
| Alert rules (NICE NG12) | `src/rules/pathways.ts` |
| Referral: receiving unit, recommended and follow-up tests, G8 for 75+ | `src/pages/ReferralDialog.tsx`, `src/data/units.ts` |
| Screening invitation in Finnish and Russian | `src/pages/ScreeningInvite.tsx`, `src/rules/screening.ts` |
| Tracking to treatment against target times | `src/pages/Tracking.tsx`, `src/rules/tracking.ts` |
| Region view: the gap, the data gap, five actions, pilot | `src/pages/Region.tsx`, `src/pages/RegionInsights.tsx` |
| Sources | `src/references.ts`, `src/pages/Sources.tsx` |
| AI extraction and keyword fallback | `server/llm/`, `shared/fallbackExtractor.ts` |
| Synthetic patients | `src/data/patients.ts` |
