# Aamu: so cancer is found in time, while it can still be cured

**Junction 2026 · AstraZeneca challenge: equitable and effective cancer care in Finland**

Aamu is an AI-assisted tool for wellbeing services counties. It finds patients whose primary-care
records together point to possible cancer, moves the patients most likely to wait longest to the
front, and follows every referral to the start of treatment against target times.
A doctor always makes the decision. All patient data in the demo is synthetic.

- **Live app:** https://aamu-app.vercel.app (opens with the 2:00 demo video)
- **Demo video:** `public/aamu-esittely.mp4`, exactly 2:00, Finnish narration
- **Slide deck:** `docs/aamu-diat.pdf` (9 slides, QR code to the live app)

## 1. The gap

Lymphoma patients whose first contact is **public primary care** wait **207 days** from first symptom
to treatment; through **occupational or private care**, **123 days** (Kuitunen et al., Cancer Medicine
2026; UEF). People living more than 50 km from the treating unit have worse outcomes (implementation
roadmap p. 12). The care system itself creates two speeds.

## 2. Where in the pathway it emerges

Step by step (AstraZeneca deck, slide 11), the public route is slower at every step **before** the
specialist visit and slightly faster after it:

| Step | Public | Private | Difference |
|---|---|---|---|
| Symptom → first contact | 72 | 42 | +30 |
| First contact → physician | 22 | 1 | +21 |
| Physician → referral | 53 | 34 | +19 |
| Referral → specialist | 57 | 41 | +16 |
| Specialist → treatment | 3 | 5 | −2 |

**The whole gap is in detection and referral, not in specialist care:** by the specialist visit the
public route is already 86 days behind; after it, it catches up 2 days (total gap 84 days).
And it can't be monitored today: stage is recorded for only **42 %** of cancers nationally
(Pirkanmaa 72 %, Sisä-Suomi 60 %, other areas 33–42 %; Syöpärekisteri, Syöpä 2024).

## 3. What to do (five proposals for a wellbeing services county)

Each one targets the step where the gap emerges, maps to a measure in the national cancer
strategy's implementation roadmap, and is working in the demo.

1. **Alerts in primary-care records** (detection; roadmap 3.5.3, 2.5.2). Transparent rules read
   visits, lab results and prescriptions together; AI extracts symptoms from free-text notes. A
   coordinator's worklist shows patients with no follow-up. → *Työlista*
2. **Equity priority** (detection). Patients using only public primary care, living >50 km from the
   hospital, or speaking a minority language come first. → *Työlista, "Yhdenvertaisuus ensin"*
3. **Uniform referral criteria, pre-filled referral** (referral; 2.5.2). The doctor picks the tests
   the pathway suggests; G8 frailty screen for 75+ (3.4.2). → *Patient A → Vahvista → Lähete*
4. **Treatment-time tracking against target times** (diagnosis and treatment start; **Goal 3**, 3.1.2).
   Every referred patient is followed to treatment; the coordinator sees delays while they can
   still be fixed. → *Seuranta*
5. **Structured stage and pathway timestamps** (data gap; 3.2.1). The referral and tracking record
   pathway dates as a by-product, so the indicators above can actually be measured. → *Seuranta*

Plus: missed-screening invitations in the patient's own language (Finnish + Russian).

## 4. Goal 3 indicator covered

**"Potilaat pääsevät hoitoon tavoiteaikojen puitteissa"**, Goal 3 of the National Cancer Strategy
2026–2035 (strategy p. 5; roadmap measure 3.1.2). The *Seuranta* view shows the share of pathway
steps within target, patients over time, and patients at risk. Cancer-specific target times are
scheduled to be defined in 2026–2028 (roadmap p. 57), so the demo uses **example targets** a county
can set itself (assessment 14 d, diagnosis 28 d from referral, treatment 21 d from diagnosis).

## 5. How the AI is used, and kept safe

- Gemini (Google AI Studio, free tier) only maps note text to a fixed list of symptoms.
- Every extracted symptom must quote its evidence word for word from the note; anything else is
  dropped by the server. Extracted phrases are highlighted in the patient view.
- The flag is decided by transparent, unit-tested rules (NICE NG12 thresholds), never by the model.
- Works offline with a deterministic keyword fallback. Free-tier input may be used by Google, so
  only synthetic data is used; a real deployment would use an enterprise or on-premises model.

## 6. Real vs synthetic

| Real, public, sourced in the app (ⓘ) | Synthetic (labelled in the app) |
|---|---|
| 207 / 123 days and per-step delays | Patients A–M, notes, lab values |
| Stage recorded 42 % (regional 33–72 %) | Example target times |
| >50 km worse outcomes | |
| Strategy goals and roadmap measures | |

## 7. Try it

```bash
npm install && npm run dev   # http://localhost:5173
```

1. **Työlista** → *Yhdenvertaisuus ensin*: Patient A moves to the top; click the yellow chip.
2. **Potilas A** → *Vahvista hälytys* → tick ultrasound + CT → *Lähetä*.
3. **Seuranta**: Patient A is now tracked; two patients are over target time.
4. **Alue**: the gap, where it emerges, and the five proposals.
