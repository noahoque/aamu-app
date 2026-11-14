import React from "react";
import { Icon } from "../components/ui";
import { CLINICAL, CLINICAL_KEYS, FACTS, ROADMAP_MEASURES, SOURCES } from "../references";
import { colors } from "../theme";

// Where each roadmap measure is used in the app (Finnish version of `usedFor` in references.ts).
const USED_IN: Record<string, string> = {
  "2.5.2": "Lähete ja tutkimusten valinta; suositukset 1–3",
  "3.4.2": "G8-haurausseula lähetteessä (75 vuoden raja on Aamun oma valinta)",
  "3.2.1": "Suositus 5: levinneisyys ja hoitopolun aikaleimat rakenteisesti. Syöpäilmoitusta ei tehdä epäilyvaiheessa.",
  "4.1.4": "Tausta: kliinisten ilmoitusten kattavuus laskenut yli 90 %:sta alle 50 %:iin",
  "3.5.3": "Tekoälypoiminta ja hälytykset potilastietojärjestelmässä; suositus 1",
  "3.1.2": "Hoitoonpääsyn seuranta tavoiteaikoja vasten (Tavoite 3). Esimerkkitavoitteet, kunnes syöpäkohtaiset ajat on määritetty.",
};

const Ext: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
    {children}
    <Icon name="link" size={14} />
  </a>
);

export const SourcesPage: React.FC = () => (
  <>
    <h1>Lähteet</h1>
    <div className="sub">Jokainen sovelluksen todellinen luku ja tiekartan toimenpide linkittyy tänne · tarkistettu 14.11.2026</div>

    <h2 style={{ marginTop: 28 }}>Kliiniset suositukset ja tietokannat</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24, marginTop: 12, alignItems: "start" }}>
      {CLINICAL.map((g) => (
        <section key={g.id} className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2>{g.name}</h2>
            {g.login ? <span style={{ fontSize: 12, fontWeight: 500, color: colors.text3, padding: "3px 8px", borderRadius: 8, boxShadow: `inset 0 0 0 1px ${colors.outlineVariant}` }}>{g.login}</span> : null}
          </div>
          <div style={{ fontSize: 14, color: colors.text2, marginTop: 8, lineHeight: 1.45 }}>{g.what}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
            {g.items.map((it) => (
              <li key={it.key} style={{ padding: "11px 0", borderTop: `1px solid ${colors.outlineVariant}`, fontSize: 15, lineHeight: 1.4 }}>
                <Ext href={SOURCES[it.key].url}>{SOURCES[it.key].title}</Ext>
                <div style={{ fontSize: 13, color: colors.text3, marginTop: 3 }}>Aamussa: {it.usedFor}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24, alignItems: "start" }}>
      <section className="card">
        <h2>Asiakirjat</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
          {Object.entries(SOURCES).filter(([k]) => !CLINICAL_KEYS.has(k)).map(([k, s]) => (
            <li key={k} style={{ padding: "12px 0", borderTop: `1px solid ${colors.outlineVariant}`, fontSize: 15, lineHeight: 1.4 }}>
              {s.url ? <Ext href={s.url}>{s.title}</Ext> : <span>{s.title} <span style={{ color: colors.text3 }}>(Junction 2026 -haasteaineisto)</span></span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Luvut</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
          {FACTS.map((f) => (
            <li key={f.claim} style={{ padding: "12px 0", borderTop: `1px solid ${colors.outlineVariant}` }}>
              <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.35 }}>{f.claim}</div>
              <div style={{ fontSize: 13, color: colors.text3, marginTop: 4 }}>{f.source}</div>
              {"note" in f ? <div style={{ fontSize: 13, color: colors.text2, marginTop: 4 }}>{f.note}</div> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>

    <section className="card outline" style={{ marginTop: 24 }}>
      <h2>Syöpästrategian tiekartan toimenpiteet</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
        {ROADMAP_MEASURES.map((m) => (
          <li key={m.id} style={{ display: "grid", gridTemplateColumns: "70px minmax(0, 1fr) 90px", gap: 16, padding: "14px 0", borderTop: `1px solid ${colors.outlineVariant}` }}>
            <span className="num" style={{ fontSize: 18, fontWeight: 500, color: colors.primary }}>
              {m.id}
            </span>
            <div>
              <div style={{ fontSize: 16, lineHeight: 1.4 }}>{m.title}</div>
              <div style={{ fontSize: 14, color: colors.text2, marginTop: 4 }}>Aamussa: {USED_IN[m.id]}</div>
            </div>
            <span style={{ textAlign: "right" }}>
              <Ext href={`${SOURCES.roadmap.url}#page=${m.page}`}>s. {m.page}</Ext>
            </span>
          </li>
        ))}
      </ul>
    </section>

    <div className="info" style={{ marginTop: 20 }}>
      <Icon name="info" size={16} />
      Synteettisiä: potilaat, käyntimerkinnät ja laboratorioarvot sekä hoitoonpääsyn esimerkkitavoitteet.
    </div>
  </>
);
