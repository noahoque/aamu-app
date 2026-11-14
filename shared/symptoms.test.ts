import { describe, expect, it } from "vitest";
import { extractFromNote, parseDurationDays } from "./fallbackExtractor";
import { groundEvidence, groundSymptoms } from "./symptoms";

describe("grounding (hallucination guard)", () => {
  const note = "”Täyttyy nopeasti syödessä. Laihtunut 4 kg.”";

  it("keeps evidence that is in the note, tolerating case and quote marks", () => {
    expect(groundEvidence(note, "Laihtunut 4 kg")).toBe("Laihtunut 4 kg");
    expect(groundEvidence(note, "laihtunut 4 kg")).toBe("Laihtunut 4 kg");
    expect(groundEvidence('"Vatsa turvoksissa"', "”Vatsa turvoksissa”")).toBe('"Vatsa turvoksissa"');
  });

  it("drops symptoms whose evidence is not in the note, or with unknown codes", () => {
    const { symptoms, dropped } = groundSymptoms(note, [
      { code: "weight_loss", evidence: "Laihtunut 4 kg", quantity: "4 kg" },
      { code: "abdominal_pain", evidence: "Kova vatsakipu" }, // invented
      { code: "cancer", evidence: "Laihtunut" }, // not a code
      { code: "early_satiety", evidence: "Täyttyy nopeasti syödessä", durationDays: -3 },
    ]);
    expect(symptoms).toEqual([
      { code: "weight_loss", evidence: "Laihtunut 4 kg", quantity: "4 kg" },
      { code: "early_satiety", evidence: "Täyttyy nopeasti syödessä" },
    ]);
    expect(dropped).toBe(2);
  });
});

describe("fallback keyword extractor", () => {
  it("finds the video's symptoms with exact evidence", () => {
    expect(extractFromNote("”Täyttyy nopeasti syödessä. Laihtunut 4 kg.”")).toEqual([
      { code: "early_satiety", evidence: "Täyttyy nopeasti syödessä" },
      { code: "weight_loss", evidence: "Laihtunut 4 kg", quantity: "4 kg" },
    ]);
    expect(extractFromNote("”Vatsa turvoksissa, väsymystä 2 kk.” Verikokeet otettu.").map((s) => s.evidence)).toEqual(["Vatsa turvoksissa", "väsymystä"]);
  });

  it("reads durations", () => {
    expect(parseDurationDays("Käheys jatkunut 4 viikkoa")).toBe(28);
    expect(parseDurationDays("väsymystä 2 kk")).toBe(60);
    expect(parseDurationDays("Ääni käheä 1 viikko")).toBe(7);
    expect(extractFromNote("Käheys jatkunut 4 viikkoa, ei helpota.")[0]).toMatchObject({ code: "hoarseness", durationDays: 28 });
  });

  it("only reads bleeding as post-menopausal when the note says periods have stopped", () => {
    expect(extractFromNote("Verinen vuoto emättimestä viikon ajan. Kuukautiset loppuneet 2 v sitten.")[0]).toMatchObject({ code: "postmenopausal_bleeding" });
    expect(extractFromNote("Nenästä vuoto aamulla.")).toEqual([]);
  });

  it("finds nothing worrying in an ordinary flu note", () => {
    expect(extractFromNote("Flunssa 3 pv, kuumetta 38,2. Kotihoito-ohjeet.")).toEqual([]);
  });
});
