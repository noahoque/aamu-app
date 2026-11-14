// SYNTHETIC example data. Not real patients.
// Patient A follows the demo video (ajoissa-video/src/data.ts) exactly.
// Lab values and tests should be checked by a doctor before presenting (see README).
import type { Patient, WorkStatus } from "./types";

/** The demo's "today". Patient A was flagged 14.5.2026, two days ago (week 20). */
export const DEMO_TODAY = "2026-05-16";

export const PATIENTS: Patient[] = [
  {
    // Ovarian cancer. Vague abdominal symptoms, a urinary complaint treated as an infection,
    // and a raised CA-125 filed for a 3-month re-check.
    id: "A",
    name: "Potilas A",
    sex: "N",
    age: 58,
    careType: "public",
    distanceKm: 64,
    language: "fi",
    smoker: false,
    visits: [
      { id: "A1", date: "2026-01-12", kind: "Lääkärikäynti", who: "Lääkäri 1", note: "”Vatsa turvoksissa, väsymystä 2 kk.” Verikokeet otettu." },
      { id: "A2", date: "2026-02-15", kind: "Hoitajan puhelu + resepti", who: "Sairaanhoitaja", note: "Tiheä virtsaamistarve. Antibiootti virtsatieinfektioon." },
      { id: "A3", date: "2026-03-12", kind: "Lääkärikäynti", who: "Lääkäri 2", note: "”Vatsa yhä turvoksissa.” Ärtyvä suoli? Kontrollilabrat." },
      { id: "A4", date: "2026-04-20", kind: "Laboratorio", who: "Laboratorio", note: "CA-125 koholla. Kontrolli 3 kk:n päästä." },
      { id: "A5", date: "2026-05-14", kind: "Lääkärikäynti", who: "Lääkäri 3", note: "”Täyttyy nopeasti syödessä. Laihtunut 4 kg.”" },
    ],
    labs: [
      { date: "2026-01-12", name: "Trombosyytit", value: 330 },
      { date: "2026-01-12", name: "CRP", value: 4 },
      { date: "2026-01-12", name: "Hemoglobiini", value: 126 },
      { date: "2026-04-20", name: "CA-125", value: 48 },
      { date: "2026-04-20", name: "Trombosyytit", value: 401 },
      { date: "2026-04-20", name: "CRP", value: 9 },
      { date: "2026-04-20", name: "Hemoglobiini", value: 120 },
      { date: "2026-05-14", name: "CA-125", value: 64 },
      { date: "2026-05-14", name: "Trombosyytit", value: 418 },
      { date: "2026-05-14", name: "CRP", value: 14 },
      { date: "2026-05-14", name: "Hemoglobiini", value: 115 },
    ],
    prescriptions: [{ date: "2026-02-15", drug: "Nitrofurantoiini 75 mg", atc: "J01XE01", reason: "Virtsatieinfektio" }],
    procedures: [],
    screening: [],
  },
  {
    // Postmenopausal bleeding; also missed the cervical screening invitation. Russian-speaking.
    id: "D",
    name: "Potilas D",
    sex: "N",
    age: 56,
    careType: "occupational",
    distanceKm: 12,
    language: "ru",
    smoker: false,
    visits: [
      { id: "D1", date: "2026-03-03", kind: "Lääkärikäynti", who: "Työterveyslääkäri", note: "Kuumia aaltoja, kuukautiset loppuneet noin 2 v sitten. Tulkki paikalla (venäjä)." },
      { id: "D2", date: "2026-05-15", kind: "Hoitajan puhelu", who: "Sairaanhoitaja", note: "Verinen vuoto emättimestä viikon ajan. Kuukautiset loppuneet 2 v sitten. Tulkki puhelussa (venäjä)." },
    ],
    labs: [],
    prescriptions: [],
    procedures: [],
    screening: [{ programme: "cervical", invitedYear: 2025, attended: false }],
  },
  {
    // Iron-deficiency anaemia at 74, no colonoscopy. Lives far from the hospital.
    id: "F",
    name: "Potilas F",
    sex: "N",
    age: 74,
    careType: "private",
    distanceKm: 78,
    language: "fi",
    smoker: false,
    visits: [
      { id: "F1", date: "2026-02-10", kind: "Lääkärikäynti", who: "Lääkäri 4", note: "Väsymystä ja hengästymistä portaissa. Hb matala, rautalääke aloitettu." },
      { id: "F2", date: "2026-05-13", kind: "Laboratorio", who: "Laboratorio", note: "Hb laskenut rautalääkkeestä huolimatta." },
    ],
    labs: [
      { date: "2026-02-10", name: "Hemoglobiini", value: 112 },
      { date: "2026-02-10", name: "Ferritiini", value: 9 },
      { date: "2026-05-13", name: "Hemoglobiini", value: 104 },
      { date: "2026-05-13", name: "Ferritiini", value: 6 },
    ],
    prescriptions: [{ date: "2026-02-10", drug: "Ferrosulfaatti 100 mg", atc: "B03AA07", reason: "Raudanpuuteanemia" }],
    procedures: [],
    screening: [],
  },
  {
    // Persistent hoarseness in a smoker.
    id: "H",
    name: "Potilas H",
    sex: "N",
    age: 68,
    careType: "mixed",
    distanceKm: 21,
    language: "fi",
    smoker: true,
    visits: [
      { id: "H1", date: "2026-04-21", kind: "Lääkärikäynti", who: "Lääkäri 2", note: "Ääni käheä 1 viikko, ei flunssaa. Tupakoi 20 savuketta päivässä." },
      { id: "H2", date: "2026-05-12", kind: "Hoitajan puhelu", who: "Sairaanhoitaja", note: "Käheys jatkunut 4 viikkoa, ei helpota." },
    ],
    labs: [],
    prescriptions: [],
    procedures: [],
    screening: [],
  },
  {
    // New-onset diabetes over 50 with weight loss.
    id: "B",
    name: "Potilas B",
    sex: "M",
    age: 71,
    careType: "mixed",
    distanceKm: 22,
    language: "fi",
    smoker: false,
    visits: [
      { id: "B1", date: "2026-03-18", kind: "Lääkärikäynti", who: "Lääkäri 1", note: "Jano ja väsymys. Paino laskenut." },
      { id: "B2", date: "2026-05-11", kind: "Lääkärikäynti", who: "Lääkäri 1", note: "Uusi tyypin 2 diabetes. Laihtunut 6 kg ilman yritystä." },
    ],
    labs: [
      { date: "2026-03-18", name: "HbA1c", value: 46 },
      { date: "2026-05-11", name: "HbA1c", value: 58 },
    ],
    prescriptions: [{ date: "2026-05-11", drug: "Metformiini 500 mg", atc: "A10BA02", reason: "Tyypin 2 diabetes" }],
    procedures: [],
    screening: [],
  },
  {
    // Cough over three weeks, two antibiotic courses.
    id: "C",
    name: "Potilas C",
    sex: "M",
    age: 66,
    careType: "mixed",
    distanceKm: 35,
    language: "fi",
    smoker: true,
    visits: [
      { id: "C1", date: "2026-03-30", kind: "Lääkärikäynti + resepti", who: "Lääkäri 3", note: "Yskä 1 viikko, limaa. Keuhkoputkentulehdus?" },
      { id: "C2", date: "2026-04-21", kind: "Lääkärikäynti + resepti", who: "Lääkäri 3", note: "Yskä jatkuu, nyt 4 viikkoa. Toinen antibioottikuuri." },
      { id: "C3", date: "2026-05-10", kind: "Hoitajan puhelu", who: "Sairaanhoitaja", note: "Yskä ei helpota, hengästyy portaissa." },
    ],
    labs: [],
    prescriptions: [
      { date: "2026-03-30", drug: "Amoksisilliini 500 mg", atc: "J01CA04", reason: "Keuhkoputkentulehdus" },
      { date: "2026-04-21", drug: "Doksisykliini 100 mg", atc: "J01AA02", reason: "Pitkittynyt yskä" },
    ],
    procedures: [],
    screening: [],
  },
  {
    // Rising platelets and frequent visits with vague complaints.
    id: "E",
    name: "Potilas E",
    sex: "M",
    age: 62,
    careType: "mixed",
    distanceKm: 15,
    language: "fi",
    smoker: false,
    visits: [
      { id: "E1", date: "2026-02-20", kind: "Lääkärikäynti", who: "Lääkäri 4", note: "Väsymystä, ei selvää syytä." },
      { id: "E2", date: "2026-03-12", kind: "Lääkärikäynti", who: "Lääkäri 2", note: "Selkäkipua kaksi viikkoa." },
      { id: "E3", date: "2026-04-01", kind: "Lääkärikäynti", who: "Lääkäri 4", note: "Ruokahalu huono, väsymys jatkuu." },
      { id: "E4", date: "2026-05-07", kind: "Hoitajan puhelu", who: "Sairaanhoitaja", note: "Väsymys jatkuu, kontrollilabrat otettu." },
    ],
    labs: [
      { date: "2026-02-20", name: "Trombosyytit", value: 340 },
      { date: "2026-04-01", name: "Trombosyytit", value: 395 },
      { date: "2026-05-07", name: "Trombosyytit", value: 452 },
    ],
    prescriptions: [],
    procedures: [],
    screening: [],
  },
  {
    // Ordinary flu. Not flagged: shows the rules stay quiet when nothing points to cancer.
    id: "G",
    name: "Potilas G",
    sex: "M",
    age: 45,
    careType: "public",
    distanceKm: 30,
    language: "fi",
    smoker: false,
    visits: [{ id: "G1", date: "2026-04-02", kind: "Hoitajan vastaanotto", who: "Sairaanhoitaja", note: "Flunssa 3 pv, kuumetta 38,2. Kotihoito-ohjeet." }],
    labs: [],
    prescriptions: [],
    procedures: [],
    screening: [],
  },
];

/** Worklist status as the demo starts (C already contacted, E already referred). */
export const INITIAL_STATUS: Record<string, WorkStatus> = { C: "contacted", E: "referred" };

export const patientById = (id: string) => PATIENTS.find((p) => p.id === id);
