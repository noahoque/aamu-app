export type Sex = "N" | "M";
export type CareType = "public" | "occupational" | "private" | "mixed";
export type Language = "fi" | "sv" | "ru" | "et" | "ar" | "so" | "uk" | "en";

export type Visit = {
  id: string; // also the note id for AI extraction
  date: string; // ISO yyyy-mm-dd
  kind: string;
  who: string;
  note: string;
};

export type LabName = "CA-125" | "Trombosyytit" | "CRP" | "Hemoglobiini" | "Ferritiini" | "HbA1c";
export type LabResult = { date: string; name: LabName; value: number };

export type Prescription = { date: string; drug: string; atc: string; reason: string };
export type Procedure = { date: string; name: string };

export type ScreeningRecord = {
  programme: "cervical" | "breast" | "colorectal";
  invitedYear: number;
  attended: boolean;
};

export type Patient = {
  id: string;
  name: string;
  sex: Sex;
  age: number;
  careType: CareType;
  distanceKm: number; // to the nearest hospital
  language: Language;
  smoker: boolean;
  visits: Visit[];
  labs: LabResult[];
  prescriptions: Prescription[];
  procedures: Procedure[];
  screening: ScreeningRecord[];
};

export type WorkStatus = "none" | "contacted" | "confirmed" | "referred" | "rejected";
