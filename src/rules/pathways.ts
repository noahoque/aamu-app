// Pathway rules. Each is a pure function from one patient's record (plus the symptoms the AI step
// extracted from the free-text notes) to a flag with its reasons, or null.
// Thresholds follow NICE NG12 where it has one; see the `rule` text and `source` of each reason.
import type { Patient, Visit } from "../data/types";
import type { UnitId } from "../data/units";
import type { SOURCES } from "../references";
import { SYMPTOM_LABELS, type Symptom, type SymptomCode } from "../../shared/symptoms";
import { addDays, daysBetween, fmtShort, maxDate } from "./dates";
import { describeTrend, isHigh, isLow, LAB_DEFS, markerTrend, series } from "./labs";

export type SourceKey = keyof typeof SOURCES;
export type SourceRef = { source: SourceKey; page?: number; measure?: string };

export type Reason = {
  fact: string;
  rule: string;
  kind: "rule" | "ai";
  source?: SourceRef;
  /** For AI reasons: the exact phrases in the notes. */
  evidence?: { visitId: string; text: string }[];
};

export type ReferralTest = { name: string; note: string; suggested?: boolean };

export type PathwayHit = {
  id: string;
  /** Short name in the worklist "Polku" column. */
  pathway: string;
  /** Referral pathway text on the referral form. */
  referralPath: string;
  flaggedAt: string;
  reasons: Reason[];
  /** Short phrases for the worklist "Hälytyksen perusteet" column. */
  summary: string[];
  /** Short phrases for the referral "Perusteet" field. */
  referralBasis: string[];
  /** Tests the GP orders with the referral (suggested ones pre-ticked). */
  tests: ReferralTest[];
  /** Default receiving unit; the doctor can change it. */
  unit: UnitId;
  /** What the specialist will likely do next (biopsy, molecular/genetic tests). Shown for
   * information only: the specialist orders these, not the GP. */
  followUp: ReferralTest[];
};

export type SymptomsByVisit = Record<string, Symptom[]>;
type Ctx = { p: Patient; symptoms: SymptomsByVisit; today: string };
type Mention = { visit: Visit; s: Symptom };

const AI_RULE = "Tekoäly: poimittu käyntimerkinnöistä";
const NICE: SourceRef = { source: "ovarianCa125" };

const smokes = (p: Patient) => p.risk.smoking === "current";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Mentions of the given symptoms in the notes, oldest first. */
function mentions(ctx: Ctx, codes: readonly SymptomCode[]): Mention[] {
  const out: Mention[] = [];
  for (const visit of [...ctx.p.visits].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const s of ctx.symptoms[visit.id] ?? []) if (codes.includes(s.code)) out.push({ visit, s });
  }
  return out;
}

/** "laihtunut 4 kg" for weight loss with an amount, otherwise the plain label. */
const phrase = (s: Symptom) => (s.code === "weight_loss" && s.quantity ? `laihtunut ${s.quantity}` : SYMPTOM_LABELS[s.code]);

/** Distinct symptoms, latest mention of each, newest first. */
function latestDistinct(ms: Mention[]): Mention[] {
  const seen = new Map<SymptomCode, Mention>();
  for (const m of [...ms].reverse()) if (!seen.has(m.s.code)) seen.set(m.s.code, m);
  return [...seen.values()];
}

function aiReason(ms: Mention[], fact: string): Reason {
  return { fact, rule: AI_RULE, kind: "ai", evidence: ms.map((m) => ({ visitId: m.visit.id, text: m.s.evidence })) };
}

/** Longest duration the notes support, counted up to `asOf`. */
function durationDays(ms: Mention[], asOf: string) {
  return Math.max(0, ...ms.map((m) => daysBetween(addDays(m.visit.date, -(m.s.durationDays ?? 0)), asOf)));
}

const contactsWithin = (p: Patient, asOf: string, days: number) =>
  p.visits.filter((v) => {
    const d = daysBetween(v.date, asOf);
    return d >= 0 && d < days;
  }).length;

// ---------------------------------------------------------------------------
// Ovarian: NICE NG12 1.5.6–1.5.9. Women 50+ with persistent bloating, early satiety, pelvic/abdominal
// pain or urinary frequency → CA-125; CA-125 ≥ 35 → urgent ultrasound.

const OVARIAN_SYMPTOMS: SymptomCode[] = ["bloating", "early_satiety", "weight_loss", "abdominal_pain", "urinary_frequency"];

function ovarian(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  if (p.sex !== "N" || p.age < 50) return null;

  const ca = series(p.labs, "CA-125");
  const caHigh = ca.filter((r) => isHigh("CA-125", p.sex, r.value));
  const followedUp = caHigh.length > 0 && p.procedures.some((x) => /ultraääni/i.test(x.name) && x.date >= caHigh[0].date);
  const caFlag = caHigh.length > 0 && !followedUp;

  const ms = mentions(ctx, OVARIAN_SYMPTOMS);
  const distinct = latestDistinct(ms);
  const flaggedAt = maxDate([...caHigh.map((r) => r.date), ...ms.map((m) => m.visit.date)]);
  if (!flaggedAt) return null;
  const contacts = contactsWithin(p, flaggedAt, 120);
  // Without a raised CA-125, two symptoms only call for a CA-125 test (NICE); flag at three or more.
  const comboFlag = distinct.length >= 3 && contacts >= 3;
  if (!caFlag && !comboFlag) return null;

  const reasons: Reason[] = [];
  const summary: string[] = [];
  const basis: string[] = [];

  if (caHigh.length) {
    reasons.push({
      fact: `CA-125 koholla: ${caHigh.map((r) => r.value).join(" → ")} ${LAB_DEFS["CA-125"].unit}`,
      rule: followedUp ? "Sääntö: yli viitearvon" : "Sääntö: yli viitearvon, ei jatkotutkimusta",
      kind: "rule",
      source: NICE,
    });
    summary.push("CA-125 koholla");
    basis.push(`CA-125 ${caHigh[caHigh.length - 1].value}`);
  }

  const t = markerTrend(p);
  if (t) {
    reasons.push({ fact: describeTrend(t), rule: t.count === 3 ? "Sääntö: kolmen arvon yhteinen trendi" : "Sääntö: kahden arvon yhteinen trendi", kind: "rule" });
    if (t.rising.includes("Trombosyytit")) {
      summary.push("trombosyytit ↑");
      const plt = series(p.labs, "Trombosyytit");
      basis.push(`trombosyytit ${plt[plt.length - 1].value}`);
    }
  }

  if (distinct.length) {
    // The three most recent distinct symptoms, in a fixed clinical order.
    const top = distinct.slice(0, 3).sort((a, b) => OVARIAN_SYMPTOMS.indexOf(a.s.code) - OVARIAN_SYMPTOMS.indexOf(b.s.code));
    reasons.push(aiReason(ms.filter((m) => top.some((x) => x.s.code === m.s.code)), cap(top.map((m) => phrase(m.s)).join(", "))));
    const wl = distinct.find((m) => m.s.code === "weight_loss");
    const key = wl ?? top[0];
    summary.push(phrase(key.s));
    basis.push(phrase(key.s));
  }

  if (comboFlag) {
    reasons.push({ fact: `Nainen yli 50 v, ${contacts}. yhteydenotto / 4 kk`, rule: "Sääntö: munasarjasyövän oireyhdistelmä", kind: "rule", source: NICE });
  }

  return {
    id: "ovarian",
    pathway: "Munasarja",
    referralPath: "Nopea diagnostinen polku · gynekologia",
    flaggedAt,
    reasons,
    summary,
    referralBasis: basis,
    unit: "gyn",
    followUp: [
      { name: "Kudosnäyte", note: "leikkauksessa tai ohjattu neulanäyte, patologin tutkimus" },
      { name: "BRCA1/2-geenitesti", note: "perinnöllinen alttius, tarjotaan kaikille munasarjasyöpäpotilaille" },
      { name: "Kasvaimen HRD-tutkimus", note: "ohjaa hoidon valintaa" },
    ],
    tests: [
      { name: "Gynekologinen ultraääni", note: "emättimen kautta", suggested: true },
      { name: "Vartalon TT", note: "rintakehä, vatsa ja lantio", suggested: true },
      { name: "Kasvainmerkkiaineet", note: "CA-125-kontrolli, CEA" },
      { name: "Kolonoskopia", note: "jos löydös viittaa suolistoon" },
      { name: "Gastroskopia", note: "jos ylävatsaoireita" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Endometrial: NICE NG12 1.5.11. Women 55+ with post-menopausal bleeding → suspected cancer pathway.

function postmenopausalBleeding(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  if (p.sex !== "N" || p.age < 55) return null;
  const ms = mentions(ctx, ["postmenopausal_bleeding"]);
  if (!ms.length) return null;
  return {
    id: "endometrial",
    pathway: "Gynekologinen",
    referralPath: "Nopea diagnostinen polku · gynekologia",
    flaggedAt: ms[ms.length - 1].visit.date,
    reasons: [
      aiReason(ms, "Vuoto vaihdevuosien jälkeen"),
      { fact: "Nainen yli 55 v, vuoto vaihdevuosien jälkeen", rule: "Sääntö: kohdun runkosyövän kriteeri", kind: "rule", source: NICE },
    ],
    summary: ["Vuoto vaihdevuosien jälkeen"],
    referralBasis: ["vuoto vaihdevuosien jälkeen", `ikä ${p.age} v`],
    unit: "gyn",
    followUp: [
      { name: "Patologin tutkimus koepalasta", note: "kudostyyppi ja erilaistumisaste" },
      { name: "MMR/MSI-tutkimus", note: "Lynchin oireyhtymän seulonta kasvaimesta" },
    ],
    tests: [
      { name: "Gynekologinen ultraääni", note: "emättimen kautta, kohdun limakalvon paksuus", suggested: true },
      { name: "Kohdun limakalvon koepala", note: "endometriumbiopsia", suggested: true },
      { name: "Papa-koe / HPV-testi", note: "seulonta jäänyt väliin" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Colorectal: NICE NG12 1.3.1. Iron-deficiency anaemia at 60+ → suspected cancer pathway.

function ironDeficiencyAnaemia(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  if (p.age < 60) return null;
  const hb = series(p.labs, "Hemoglobiini");
  const fer = series(p.labs, "Ferritiini");
  const lastHb = hb[hb.length - 1];
  const lastFer = fer[fer.length - 1];
  if (!lastHb || !lastFer || !isLow("Hemoglobiini", p.sex, lastHb.value) || !isLow("Ferritiini", p.sex, lastFer.value)) return null;
  if (p.procedures.some((x) => /kolonoskopia/i.test(x.name))) return null;

  const flaggedAt = maxDate([lastHb.date, lastFer.date]);
  const reasons: Reason[] = [
    { fact: `Hb ${hb.map((r) => r.value).join(" → ")} g/l, ferritiini ${lastFer.value} µg/l`, rule: "Sääntö: raudanpuuteanemia yli 60 v", kind: "rule", source: NICE },
    { fact: "Ei kolonoskopiaa eikä gastroskopiaa", rule: "Sääntö: ei jatkotutkimusta", kind: "rule" },
  ];
  const iron = p.prescriptions.find((x) => x.atc.startsWith("B03A"));
  if (iron && hb.length >= 2 && lastHb.value < hb[hb.length - 2].value && iron.date < lastHb.date) {
    reasons.push({ fact: `Hb laskee rautalääkkeestä huolimatta (aloitettu ${fmtShort(iron.date)})`, rule: "Sääntö: ei hoitovastetta", kind: "rule" });
  }
  const ms = latestDistinct(mentions(ctx, ["fatigue", "dyspnoea"]));
  if (ms.length) reasons.push(aiReason(ms, cap(ms.map((m) => phrase(m.s)).join(", "))));

  return {
    id: "colorectal",
    pathway: "Suolisto",
    referralPath: "Nopea diagnostinen polku · gastroenterologia",
    flaggedAt,
    reasons,
    summary: ["Raudanpuuteanemia", "ei kolonoskopiaa"],
    referralBasis: [`Hb ${lastHb.value}`, `ferritiini ${lastFer.value}`, "ei kolonoskopiaa"],
    unit: "gastro",
    followUp: [
      { name: "Koepalat tähystyksessä", note: "patologin tutkimus" },
      { name: "MMR/MSI-tutkimus", note: "Lynchin oireyhtymä ja hoidon valinta" },
      { name: "RAS/BRAF-tutkimus", note: "levinneessä taudissa" },
    ],
    tests: [
      { name: "Kolonoskopia", note: "koko paksusuoli", suggested: true },
      { name: "Gastroskopia", note: "ylä-GI-vuodon poissulku", suggested: true },
      { name: "Ulosteen veritesti", note: "FIT, jos tähystys viivästyy" },
      { name: "Vartalon TT", note: "jos tähystys ei onnistu" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Pancreatic: NICE NG12 1.2.5 (CT at 60+ with weight loss and new-onset diabetes).
// Aamu uses a lower age limit, 50, to match the research on new-onset diabetes.

function newDiabetesWeightLoss(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  if (p.age < 50) return null;
  const a1c = series(p.labs, "HbA1c");
  const firstHigh = a1c.find((r) => r.value >= 48);
  const drugs = p.prescriptions.filter((x) => x.atc.startsWith("A10")).sort((a, b) => a.date.localeCompare(b.date));
  const dates = [firstHigh?.date, drugs[0]?.date].filter((d): d is string => !!d);
  if (!dates.length) return null;
  const diabetesDate = dates.sort()[0];
  if (daysBetween(diabetesDate, ctx.today) > 180) return null; // not new

  const wl = mentions(ctx, ["weight_loss"]);
  if (!wl.length) return null;
  const latestWl = latestDistinct(wl)[0];

  const facts = [a1c.length ? `HbA1c ${a1c.map((r) => r.value).join(" → ")} mmol/mol` : "", drugs.length ? `${drugs[0].drug.split(" ")[0].toLowerCase()} aloitettu` : ""].filter(Boolean);
  return {
    id: "pancreatic",
    pathway: "Haima",
    referralPath: "Nopea diagnostinen polku · gastroenterologia",
    flaggedAt: maxDate([diabetesDate, latestWl.visit.date]),
    reasons: [
      { fact: `Uusi diabetes: ${facts.join(", ")}`, rule: "Sääntö: uusi diabetes yli 50-vuotiaalla", kind: "rule" },
      aiReason(wl, cap(phrase(latestWl.s))),
      { fact: "Uusi diabetes ja laihtuminen yhdessä", rule: "Sääntö: haimasyövän oireyhdistelmä", kind: "rule", source: NICE },
    ],
    summary: ["Uusi diabetes yli 50 v", phrase(latestWl.s)],
    referralBasis: ["uusi diabetes", phrase(latestWl.s), `ikä ${p.age} v`],
    unit: "gastro",
    followUp: [
      { name: "Ohjattu neulanäyte", note: "endoskooppinen ultraääni (EUS), patologin tutkimus" },
      { name: "Perinnöllisyystutkimus", note: "BRCA ym., jos suvussa syöpiä" },
    ],
    tests: [
      { name: "Vatsan TT", note: "haimaprotokolla", suggested: true },
      { name: "Vatsan ultraääni", note: "jos TT ei ole heti saatavilla" },
      { name: "Kasvainmerkkiaineet", note: "CA 19-9" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Lung: NICE NG12 1.1.2. 40+ with a cough over three weeks → urgent chest X-ray.

function persistentCough(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  if (p.age < 40) return null;
  const ms = mentions(ctx, ["cough"]);
  if (!ms.length) return null;
  const flaggedAt = ms[ms.length - 1].visit.date;
  if (durationDays(ms, flaggedAt) <= 21) return null;
  const abx = p.prescriptions.filter((x) => x.atc.startsWith("J01") && daysBetween(x.date, flaggedAt) >= 0 && daysBetween(x.date, flaggedAt) < 90);

  const other = latestDistinct(mentions(ctx, ["dyspnoea", "weight_loss"]));
  const reasons: Reason[] = [
    aiReason([...ms, ...other], ["Yskä yli 3 viikkoa", ...other.map((m) => phrase(m.s))].join(", ")),
    { fact: "Yli 40 v, yskä yli 3 viikkoa", rule: "Sääntö: keuhkosyövän kriteeri (thoraxkuva)", kind: "rule", source: NICE },
  ];
  if (abx.length >= 2) reasons.push({ fact: `${abx.length} antibioottikuuria / 3 kk`, rule: "Sääntö: reseptitiedot, ei hoitovastetta", kind: "rule" });
  if (smokes(p)) reasons.push({ fact: "Tupakoi", rule: "Sääntö: riskitekijä potilastiedoissa", kind: "rule" });

  return {
    id: "lung",
    pathway: "Keuhko",
    referralPath: "Nopea diagnostinen polku · keuhkosairaudet",
    flaggedAt,
    reasons,
    summary: ["Yskä yli 3 viikkoa", ...(abx.length >= 2 ? [`${abx.length} antibioottikuuria`] : [])],
    referralBasis: ["yskä yli 3 viikkoa", ...(abx.length ? [`${abx.length} antibioottikuuria`] : []), ...(smokes(p) ? ["tupakoi"] : [])],
    unit: "pulm",
    followUp: [
      { name: "Bronkoskopia ja koepala", note: "tai TT-ohjattu neulanäyte" },
      { name: "Kasvaimen molekyylitutkimukset", note: "EGFR, ALK, PD-L1: ohjaavat hoidon valintaa" },
      { name: "PET-TT", note: "levinneisyyden selvitys" },
    ],
    tests: [
      { name: "Keuhkojen röntgen", note: "thoraxkuva", suggested: true },
      { name: "Rintakehän TT", note: "jos röntgen normaali ja oireet jatkuvat" },
      { name: "Spirometria", note: "keuhkojen toiminta" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Laryngeal: NICE NG12 1.8.1. 45+ with persistent unexplained hoarseness.

function persistentHoarseness(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  if (p.age < 45) return null;
  const ms = mentions(ctx, ["hoarseness"]);
  if (!ms.length) return null;
  const flaggedAt = ms[ms.length - 1].visit.date;
  const days = durationDays(ms, flaggedAt);
  if (days < 21) return null;
  const weeks = Math.round(days / 7);
  const reasons: Reason[] = [
    aiReason(ms, `Käheys ${weeks} viikkoa`),
    { fact: "Yli 45 v, käheys yli 3 viikkoa", rule: "Sääntö: kurkunpääsyövän kriteeri", kind: "rule", source: NICE },
  ];
  if (smokes(p)) reasons.push({ fact: "Tupakoi", rule: "Sääntö: riskitekijä potilastiedoissa", kind: "rule" });
  return {
    id: "head-neck",
    pathway: "Pää-kaula",
    referralPath: "Nopea diagnostinen polku · korva-, nenä- ja kurkkutaudit",
    flaggedAt,
    reasons,
    summary: [`Käheys ${weeks} viikkoa`, ...(smokes(p) ? ["tupakoi"] : [])],
    referralBasis: [`käheys ${weeks} viikkoa`, ...(smokes(p) ? ["tupakoi"] : [])],
    unit: "ent",
    followUp: [
      { name: "Koepala nukutuksessa", note: "suora laryngoskopia, patologin tutkimus" },
      { name: "HPV/p16-tutkimus", note: "nielun kasvaimista" },
      { name: "Kaulan ja rintakehän TT/MK", note: "levinneisyys" },
    ],
    tests: [
      { name: "Kurkunpään tähystys", note: "nenänielun ja kurkunpään fiberoskopia", suggested: true },
      { name: "Keuhkojen röntgen", note: "tupakoijalla", suggested: smokes(p) },
      { name: "Kaulan ultraääni", note: "jos imusolmukelöydös" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Non-specific symptoms: rising platelets above the reference range and repeated contacts.
// Only used when no organ-specific pathway fits (the Finnish "epämääräiset oireet" pathway).

function vagueSymptoms(ctx: Ctx): PathwayHit | null {
  const { p } = ctx;
  const plt = series(p.labs, "Trombosyytit");
  const last = plt[plt.length - 1];
  if (!last || !isHigh("Trombosyytit", p.sex, last.value) || plt.length < 3 || !(plt[plt.length - 3].value < plt[plt.length - 2].value && plt[plt.length - 2].value < last.value)) return null;
  const flaggedAt = maxDate([last.date, ...p.visits.map((v) => v.date)]);
  const contacts = contactsWithin(p, flaggedAt, 90);
  if (contacts < 4) return null;

  const reasons: Reason[] = [
    { fact: `Trombosyytit ${plt.slice(-3).map((r) => r.value).join(" → ")} E9/l`, rule: "Sääntö: yli viitearvon ja nousussa", kind: "rule", source: NICE },
    { fact: `${contacts} käyntiä / 3 kk`, rule: "Sääntö: toistuvat yhteydenotot", kind: "rule" },
  ];
  const ms = latestDistinct(mentions(ctx, ["fatigue", "back_pain", "appetite_loss", "weight_loss", "abdominal_pain"]));
  if (ms.length) reasons.push(aiReason(ms, cap(ms.map((m) => phrase(m.s)).join(", "))));

  return {
    id: "non-specific",
    pathway: "Epämääräiset",
    referralPath: "Nopea diagnostinen polku · epämääräiset oireet",
    flaggedAt,
    reasons,
    summary: ["Trombosyytit nousussa", `${contacts} käyntiä / 3 kk`],
    referralBasis: [`trombosyytit ${last.value}`, `${contacts} käyntiä / 3 kk`],
    unit: "rapid",
    followUp: [
      { name: "Kohdennettu koepala", note: "TT-löydöksen perusteella, patologin tutkimus" },
      { name: "Jatkolähete elinkohtaiselle polulle", note: "kun löydös paikantuu" },
    ],
    tests: [
      { name: "Vartalon TT", note: "rintakehä, vatsa ja lantio", suggested: true },
      { name: "Laaja laboratoriopaketti", note: "PVK, maksa-arvot, kalsium, PLV" },
      { name: "Gastroskopia", note: "jos ylävatsaoireita" },
    ],
  };
}

/** Organ-specific rules, most specific first. */
const SPECIFIC = [ovarian, postmenopausalBleeding, ironDeficiencyAnaemia, newDiabetesWeightLoss, persistentCough, persistentHoarseness];

/** `p` must already be limited to records up to `today` (see evaluatePatient). */
export function pathwayHits(p: Patient, symptoms: SymptomsByVisit, today: string): PathwayHit[] {
  const ctx = { p, symptoms, today };
  const hits = SPECIFIC.map((r) => r(ctx)).filter((h): h is PathwayHit => h !== null);
  if (hits.length) return hits;
  const vague = vagueSymptoms(ctx);
  return vague ? [vague] : [];
}
