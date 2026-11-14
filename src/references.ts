// Sources for the numbers and roadmap measures behind Aamu (copied from the demo video project).
// Every real number and roadmap measure in the app links here (components/SourceLink.tsx).
// Checked 14.11.2026 against the documents below.

export const SOURCES = {
  strategy: {
    title: "Kansallinen syöpästrategia 2026–2035: Yhdessä syöpää vastaan",
    url: "https://valtioneuvosto.fi/documents/1271139/1329769/Kansallinen_syopastrategia_2026_2035.pdf/5057c3d1-e824-3933-0a32-7344843e9bf6?t=1762756763489",
  },
  roadmap: {
    title: "Kansallinen syöpästrategia 2026–2035: Toimeenpanon tiekartta vuosille 2026–2031",
    url: "https://stm.fi/documents/1271139/1359637/Kansallinen_syopastrategia_toimeenpanon_tiekartta_2026_2031.pdf/6e826620-351e-d6b4-5096-4706357adc45?t=1790152929568",
  },
  roadmapNews: {
    title: "STM: Tuore tiekartta kertoo, kuinka kansallista syöpästrategiaa toteutetaan vuosina 2026–2031",
    url: "https://stm.fi/-/tuore-tiekartta-kertoo-kuinka-kansallista-syopastrategiaa-toteutetaan-vuosina-2026-2031",
  },
  stageCoverage: {
    title: "Suomen Syöpärekisteri, Syöpä 2024 (uutisoituna: Verkkouutiset)",
    url: "https://www.verkkouutiset.fi/a/syopatiedoissa-isot-alueelliset-erot-yksi-seutu-erottuu/",
  },
  ovarianCa125: {
    title: "NICE NG12: Suspected cancer: recognition and referral (ovarian cancer, CA-125 in primary care)",
    url: "https://www.nice.org.uk/guidance/ng12",
  },
  lymphomaDelay: {
    title: "UEF: Nopeampi pääsy tutkimuksiin voisi parantaa lymfoomapotilaiden ennustetta",
    url: "https://www.uef.fi/fi/artikkeli/nopeampi-paasy-tutkimuksiin-voisi-parantaa-lymfoomapotilaiden-ennustetta-ja-vahentaa-kustannuksia",
  },
  // Step-by-step delays (slide 11). Distributed to Junction 2026 participants; no public URL.
  azDeck: {
    title:
      "Kuitunen H. Equitable Cancer Care – How Can We Ensure It in Finland (AstraZeneca, Junction 2026, dia 11). Aineisto: Kuitunen ym. Cancer Medicine 2026;15:e71920",
    url: "",
  },
  thlAccess: {
    title: "THL Ohjaus 21/2016: Hoitoonpääsyn seuranta syövän hoidossa – määrittelyt ja ohjeistus",
    url: "https://www.julkari.fi/handle/10024/131630",
  },
  // ---- Finnish clinical guidelines (Käypä hoito, FICAN) and Terveysportti. Checked 14.11.2026.
  khColorectal: {
    title: "FICAN: Kolorektaalisyövän kansallinen hoitosuositus (Terveysportti, Lääkärin tietokannat; uutinen Käypä hoito -sivustolla 3.4.2019)",
    url: "https://www.kaypahoito.fi/kolorektaalisyovan-kansallinen-hoitosuositus-julkaistu-terveysportissa",
  },
  khProstate: { title: "Käypä hoito: Eturauhassyöpä", url: "https://www.kaypahoito.fi/hoi11060" },
  khLungHistory: { title: "Käypä hoito: Keuhkosyöpä, suosituksen historiatiedot (suositus poistettu)", url: "https://www.kaypahoito.fi/nix01248" },
  khTobacco: { title: "Käypä hoito: Tupakka- ja nikotiiniriippuvuuden ehkäisy ja hoito", url: "https://www.kaypahoito.fi/hoi40020" },
  khAlcohol: { title: "Käypä hoito: Alkoholiongelmat", url: "https://www.kaypahoito.fi/hoi50028" },
  khAudit: { title: "Käypä hoito: AUDIT-kysely", url: "https://www.kaypahoito.fi/pgr00001" },
  khObesity: { title: "Käypä hoito: Lihavuus (lapset, nuoret ja aikuiset)", url: "https://www.kaypahoito.fi/hoi50124" },
  khDiabetes: { title: "Käypä hoito: Tyypin 2 diabetes", url: "https://www.kaypahoito.fi/hoi50056" },
  terveysportti: { title: "Terveysportti (Duodecim): Lääkärin tietokannat ja Lääkärin käsikirja", url: "https://www.terveysportti.fi/" },
  // ---- PubMed: research behind individual rules. PMIDs checked against titles 14.11.2026.
  pmThrombocytosis: {
    title: "Bailey SE ym. Clinical relevance of thrombocytosis in primary care: a prospective cohort study of cancer incidence using English electronic medical records and cancer registry data. Br J Gen Pract 2017. PMID 28533199",
    url: "https://pubmed.ncbi.nlm.nih.gov/28533199/",
  },
  pmOvarian: {
    title: "Hamilton W ym. Risk of ovarian cancer in women with symptoms in primary care: population based case-control study. BMJ 2009. PMID 19706933",
    url: "https://pubmed.ncbi.nlm.nih.gov/19706933/",
  },
  pmPancreas: {
    title: "Pannala R ym. New-onset diabetes: a potential clue to the early diagnosis of pancreatic cancer. Lancet Oncol 2009. PMID 19111249",
    url: "https://pubmed.ncbi.nlm.nih.gov/19111249/",
  },
  pmLung: {
    title: "Hamilton W ym. What are the clinical features of lung cancer before the diagnosis is made? A population based case-control study. Thorax 2005. PMID 16227326",
    url: "https://pubmed.ncbi.nlm.nih.gov/16227326/",
  },
  pmLymphomaSes: {
    title: "Socioeconomic Status and Access to Treatment in Diffuse Large B-Cell Lymphoma. Cancer Med 2026;15:e71920. PMID 42108510",
    url: "https://pubmed.ncbi.nlm.nih.gov/42108510/",
  },
  pmLymphomaDelay: {
    title: "Tokola S ym. Prolonged Time From Symptoms to Diagnosis Is Associated With an Inferior Progression-Free Survival in Diffuse Large B-Cell Lymphoma. Cancer Med 2025. PMID 41275414",
    url: "https://pubmed.ncbi.nlm.nih.gov/41275414/",
  },
} as const;

// Roadmap measures that Aamu features map to. Page numbers refer to the roadmap PDF.
export const ROADMAP_MEASURES = [
  {
    id: "2.5.2",
    title:
      "Tuetaan sujuvaa siirtymää erikoissairaanhoitoon määrittämällä kansallisiin hoitoketjuihin kuuluvat standardoidut lähetekriteerit",
    page: 52,
    usedFor: "Lähete (referral) with selectable tests, and the simulator's referral-criteria and fast-pathway steps",
    note: "Also covers symptom-based pathways (oirelähtöiset toimintamallit). There is no separate measure for a fast pathway for vague symptoms.",
  },
  {
    id: "3.4.2",
    title: "Toimintakykytietoa kerätään jo perusterveydenhuollossa ja se kirjataan lähetteeseen",
    page: 69,
    usedFor: "G8 / Clinical Frailty Scale block on the referral",
    note: "The roadmap names G8 and CFS but does not set an age limit; the 75+ rule in the app is our own choice.",
  },
  {
    id: "3.2.1",
    title: "Luodaan lainsäädännöllinen pohja THL:n Syöpärekisterin yhteyteen perustettavalle syövän hoidon laaturekisterille",
    page: 59,
    usedFor: "Not used in the video anymore (the cancer notification was removed). Context for the 58 % stage-unknown problem.",
    note: "Indirect match: the measure is the quality register. Its metrics are 90 % data coverage incl. stage, and 90 % of clinical notifications automated by 2030 (p. 60).",
  },
  {
    id: "4.1.4",
    title: "Kansallista syövän tietovarantoa muodostettaessa varmistetaan, että tieto on hyödynnettävissä myös Syöpärekisterin ja syövän laaturekisterin edellyttämän tietosisällön tuottamiseen",
    page: 81,
    usedFor: "Context only: clinical notification coverage fell from over 90 % to under 50 %",
  },
  {
    id: "3.5.3",
    title: "Edistetään digitaalisten työkalujen, tekoälyn ja innovaatioiden käyttöönottoa ja kehittämistä syövän hoidossa",
    page: 73,
    usedFor: "Flags in the patient record system / AI for early detection",
  },
  {
    id: "3.1.2",
    title: "Laaditaan syöpäkohtaiset hoitoketjukuvaukset, ja niiden pohjalta sovelletut alueelliset hoitoketjut, sekä mekanismi niiden ylläpitoon ja hallintaan",
    page: 56,
    usedFor: "Treatment-time tracking (Seuranta): Goal 3 indicator 'potilaat pääsevät hoitoon tavoiteaikojen puitteissa'",
    note: "2026–2028: hoitoketjukuvaukset viidestä syövästä ja syöpäkohtaiset hoitoonpääsyajat määritetty (p. 57). Until then the targets in the app are examples.",
  },
] as const;

/** Goal 3 of the national cancer strategy and its indicators (strategy p. 5). */
export const GOAL3 = {
  title: "Tavoite 3: Varmistetaan yhdenvertainen ja vaikuttava syövänhoito",
  page: 5,
  indicators: [
    "Potilaat pääsevät hoitoon tavoiteaikojen puitteissa",
    "Huonoennusteisten syöpien 5 vuoden elossaololuvut saavuttavat pohjoismaisen tason",
    "Syöpäkuolleisuus pienenee 10 %",
  ],
};

// Facts used in the video, with where they come from.
export const FACTS = [
  { claim: "Vähintään 70 % syövistä todetaan vaiheissa I–II vuoteen 2035 mennessä", source: "strategy + roadmap p. 53" },
  { claim: "Levinneisyysaste tiedossa 42 %:ssa syöpätapauksista (koko maa)", source: "stageCoverage" },
  { claim: "Ensioireista hoitoon 207 pv (perusterveydenhuolto) vs. 123 pv (työterveys / yksityinen), lymfoomapotilaat", source: "lymphomaDelay; roadmap p. 11 says public route takes about twice as long" },
  { claim: "Hoitotulokset heikompia, jos potilas asuu yli 50 km:n päässä hoitoyksiköstä", source: "roadmap p. 12 (lung cancer study, ref. 9)" },
  { claim: "Lymfooma: ero julkisen ja yksityisen reitin välillä syntyy ennen erikoislääkärin vastaanottoa (204 vs. 118 pv), hoidon aloitukseen 3 vs. 5 pv", source: "azDeck (dia 11)" },
  { claim: "Levinneisyysaste tiedossa: Pirkanmaa 72 %, Sisä-Suomen yhteistyöalue 60 %, muut alueet 33–42 %, tavoite vähintään 70 %", source: "stageCoverage" },
  { claim: "Syöpäkohtaiset hoitoonpääsyajat määritetään 2026–2028", source: "roadmap p. 57 (toimenpide 3.1.2)" },
  {
    claim: "Kustannussäästöt strategiakaudella yhteensä 298 M€",
    source: "roadmap p. 102",
    note: "Breakdown: 157 M€ prevention (tobacco, alcohol), 120 M€ clinical trials, 19 M€ palliative care, 2 M€ participation. None of it is from early detection.",
  },
] as const;

type Key = keyof typeof SOURCES;

/** Groups for the "Kliiniset suositukset ja tietokannat" section of the Sources page. */
export const CLINICAL: { id: string; name: string; what: string; login?: string; items: { key: Key; usedFor: string }[] }[] = [
  {
    id: "kh",
    name: "Käypä hoito",
    what: "Duodecimin ja erikoislääkäriyhdistysten kansalliset hoitosuositukset. Syöpäepäilyn tunnistamisesta perusterveydenhuollossa ei ole Käypä hoito -suositusta, joten Aamun hälytyskynnykset perustuvat NICE NG12 -ohjeeseen. Tiekartan toimenpide 2.5.2 tuo yhtenäiset lähetekriteerit kansallisiin hoitoketjuihin.",
    items: [
      { key: "khTobacco", usedFor: "Riskitekijät: tupakointi" },
      { key: "khAlcohol", usedFor: "Riskitekijät: alkoholi, AUDIT-C-rajat (naiset ≥ 5, miehet ≥ 6)" },
      { key: "khAudit", usedFor: "AUDIT-C-pisteet riskitekijäkortissa" },
      { key: "khObesity", usedFor: "Riskitekijät: painoindeksi" },
      { key: "khDiabetes", usedFor: "Uuden diabeteksen tausta haimapolulla" },
      { key: "khColorectal", usedFor: "Suolistopolku: hoitosuositus diagnoosin jälkeen" },
      { key: "khProstate", usedFor: "Seuranta: eturauhassyövän polku" },
      { key: "khLungHistory", usedFor: "Keuhkopolku: suomalainen suositus poistettu, kynnys NICE NG12:sta" },
    ],
  },
  {
    id: "tp",
    name: "Terveysportti",
    what: "Duodecimin Lääkärin tietokannat ja Lääkärin käsikirja. Lääkäri tarkistaa niistä tutkimukset ja hoidon. Sisältö vaatii kirjautumisen, joten Aamu linkittää vain etusivulle eikä lainaa sisältöä.",
    login: "Vaatii kirjautumisen",
    items: [{ key: "terveysportti", usedFor: "Lähetteen tutkimusten tarkistus; FICAN-hoitosuositukset" }],
  },
  {
    id: "pm",
    name: "PubMed",
    what: "Vertaisarvioidut tutkimukset yksittäisten sääntöjen ja lukujen takana.",
    items: [
      { key: "pmThrombocytosis", usedFor: "Sääntö: trombosyytit yli viitearvon ja nousussa" },
      { key: "pmOvarian", usedFor: "Munasarjapolku: oireyhdistelmä ja CA-125" },
      { key: "pmPancreas", usedFor: "Haimapolku: uusi diabetes ja laihtuminen" },
      { key: "pmLung", usedFor: "Keuhkopolku: pitkittynyt yskä" },
      { key: "pmLymphomaSes", usedFor: "207 vs. 123 päivää: julkinen ja yksityinen reitti (haasteaineiston dia 11)" },
      { key: "pmLymphomaDelay", usedFor: "Miksi viive ratkaisee: pidempi aika oireista diagnoosiin, huonompi ennuste" },
    ],
  },
];

export const CLINICAL_KEYS = new Set<string>(CLINICAL.flatMap((g) => g.items.map((i) => i.key)));
