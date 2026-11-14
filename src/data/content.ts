// Text and illustrative numbers from the demo video (ajoissa-video/src/data.ts).
// Real figures are linked to src/references.ts where they are shown.

// Lymphoma patients, first symptom → start of treatment, by first point of contact (UEF study).
export const WAIT_PUBLIC_DAYS = 207;
export const WAIT_PRIVATE_DAYS = 123;

// Missed screening invitation, in Finnish and in the patient's own language.
// Have both texts checked by native speakers before presenting.
export const SCREENING_PROGRAMMES = {
  cervical: { name: "Kohdunkaulan syövän seulonta", ageMin: 30, ageMax: 65 },
  breast: { name: "Rintasyövän seulonta", ageMin: 50, ageMax: 74 },
  colorectal: { name: "Suolistosyövän seulonta", ageMin: 56, ageMax: 74 },
} as const;

export const INVITATIONS: Record<string, { lang: string; text: string }> = {
  fi: { lang: "Suomi", text: "Sinut kutsutaan kohdunkaulan syövän seulontaan. Varaa aika terveysasemalta: 09 123 4567." },
  ru: { lang: "Русский", text: "Приглашаем вас на скрининг рака шейки матки. Запишитесь на приём в поликлинику: 09 123 4567." },
};

// ---- Where the gap emerges (REAL, aggregate) ----
// DLBCL lymphoma patients, median days from symptom onset to each step, by first point of contact.
// Kuitunen et al. Cancer Medicine 2026;15:e71920, as presented in the AstraZeneca Junction 2026 deck (slide 11).
export const PATHWAY_DELAYS = {
  steps: ["Ensioire", "Ensikontakti", "Lääkärin vastaanotto", "Lähete", "Erikoislääkäri", "Hoidon aloitus"],
  private: [0, 42, 43, 77, 118, 123], // private / occupational healthcare
  public: [0, 72, 94, 147, 204, 207], // public primary care
};

// ---- Data gap: share of cancers with stage (levinneisyys) recorded, 2024 (REAL) ----
// Syöpärekisteri, Syöpä 2024, as reported by Verkkouutiset 17.6.2026.
export const STAGE_COVERAGE = {
  national: 42,
  target: 70,
  regions: [
    { name: "Pirkanmaan hyvinvointialue", pct: 72 },
    { name: "Sisä-Suomen yhteistyöalue", pct: 60 },
  ],
  othersRange: [33, 42] as [number, number],
};

// ---- What to do: concrete proposals, each tied to the pathway step it fixes ----
export type Recommendation = {
  n: number;
  title: string;
  step: string;
  why: string;
  action: string;
  indicator: string;
  measures: ("2.5.2" | "3.5.3" | "3.1.2" | "3.2.1")[];
  inApp: { label: string; to: string };
};

export const RECOMMENDATIONS: Recommendation[] = [
  {
    n: 1,
    title: "Hälytykset perusterveydenhuollon potilastietoihin",
    step: "Havaitseminen",
    why: "Julkisella reitillä ensikontaktista lähetteeseen kuluu 75 pv vs. 35 pv yksityisellä.",
    action: "Säännöt ja tekoäly lukevat käynnit, laboratoriotulokset ja reseptit yhdessä. Koordinaattorin työlista nostaa potilaat, joilla ei ole jatkotoimia.",
    indicator: "Aika ensikontaktista lähetteeseen; vaiheissa I–II todettujen osuus",
    measures: ["3.5.3", "2.5.2"],
    inApp: { label: "Työlista", to: "/" },
  },
  {
    n: 2,
    title: "Yhdenvertaisuusjärjestys työlistaan",
    step: "Havaitseminen",
    why: "Ero syntyy julkisessa perusterveydenhuollossa; yli 50 km:n päässä asuvien hoitotulokset ovat heikompia.",
    action: "Ensin potilaat, jotka käyttävät vain julkista perusterveydenhuoltoa, asuvat yli 50 km:n päässä tai asioivat vähemmistökielellä.",
    indicator: "Julkisen ja yksityisen reitin viive-ero",
    measures: ["2.5.2"],
    inApp: { label: "Työlista", to: "/" },
  },
  {
    n: 3,
    title: "Yhtenäiset lähetekriteerit ja valmiiksi täytetty lähete",
    step: "Lähete",
    why: "Julkisella reitillä lähetteestä erikoislääkärille 57 pv vs. 41 pv.",
    action: "Lähete täyttyy hälytyksen perusteista; polku ehdottaa tutkimukset ja lääkäri valitsee. G8-haurausseula 75 vuotta täyttäneille.",
    indicator: "Aika lähetteestä erikoislääkärin arvioon; palautettujen lähetteiden osuus",
    measures: ["2.5.2"],
    inApp: { label: "Potilas A → Lähete", to: "/potilas/A" },
  },
  {
    n: 4,
    title: "Hoitoonpääsyn seuranta tavoiteaikoja vasten",
    step: "Diagnoosi ja hoidon aloitus",
    why: "Tavoite 3: potilaat pääsevät hoitoon tavoiteaikojen puitteissa. Syöpäkohtaiset tavoiteajat määritetään 2026–2028.",
    action: "Jokainen lähetetty potilas seurataan hoidon aloitukseen. Koordinaattori näkee viiveen uhan, kun siihen voi vielä vaikuttaa.",
    indicator: "Hoitoon tavoiteajassa (%)",
    measures: ["3.1.2"],
    inApp: { label: "Seuranta", to: "/seuranta" },
  },
  {
    n: 5,
    title: "Levinneisyysaste ja aikaleimat rakenteisesti kirjattuna",
    step: "Seuranta ja tietopohja",
    why: "Levinneisyysaste on kirjattu vain 42 %:ssa syövistä, joten vaikutusta ei voi nyt mitata.",
    action: "Lähete ja seuranta tallentavat hoitopolun aikaleimat rakenteisesti, joten mittarit syntyvät työn sivutuotteena.",
    indicator: "Levinneisyysasteen kattavuus (tavoite ≥ 70 %)",
    measures: ["3.2.1"],
    inApp: { label: "Seuranta", to: "/seuranta" },
  },
];
