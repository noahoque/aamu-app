// Receiving units for a suspected-cancer referral from primary care. A GP refers to a specialty
// unit; pathology (biopsy reading) and oncology (treatment) come later in the pathway, ordered
// by the specialist, so they are not choices here.

export type UnitId = "gyn" | "gastro" | "pulm" | "ent" | "uro" | "internal" | "rapid";

export const UNITS: { id: UnitId; name: string; note: string }[] = [
  { id: "gyn", name: "Naistentaudit (gynekologia)", note: "munasarjat, kohtu, kohdunkaula" },
  { id: "gastro", name: "Gastroenterologia ja vatsakirurgia", note: "suolisto, mahalaukku, haima, maksa" },
  { id: "pulm", name: "Keuhkosairaudet", note: "keuhkot, välikarsina" },
  { id: "ent", name: "Korva-, nenä- ja kurkkutaudit", note: "kurkunpää, nielu, suu, kaula" },
  { id: "uro", name: "Urologia", note: "eturauhanen, virtsarakko, munuaiset" },
  { id: "internal", name: "Sisätaudit", note: "yleisoireet, veriarvojen muutokset" },
  { id: "rapid", name: "Nopean diagnostiikan yksikkö", note: "epämääräiset oireet, ei selvää elinkohdetta" },
];

export const unitName = (id: UnitId) => UNITS.find((u) => u.id === id)!.name;
