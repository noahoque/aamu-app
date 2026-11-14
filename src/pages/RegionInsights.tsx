import React from "react";
import { Link } from "react-router";
import { MeasureLink, SourceLink } from "../components/SourceLink";
import { Chip } from "../components/ui";
import { PATHWAY_DELAYS, RECOMMENDATIONS, STAGE_COVERAGE } from "../data/content";
import { colors } from "../theme";

// The county view's first three answers, each from real, aggregate public data:
// 1. Where does the gap emerge?  2. What can't we measure yet?  3. What should we do?

const D = PATHWAY_DELAYS;
const segments = D.steps.slice(1).map((to, i) => ({
  from: D.steps[i],
  to,
  priv: D.private[i + 1] - D.private[i],
  pub: D.public[i + 1] - D.public[i],
}));
const totalGap = D.public[D.public.length - 1] - D.private[D.private.length - 1]; // 84
const specialist = D.steps.indexOf("Erikoislääkäri");
const gapBeforeSpecialist = D.public[specialist] - D.private[specialist]; // 86

export const Summary: React.FC = () => (
  <div className="card" style={{ background: colors.text, color: "#fff", padding: "24px 30px" }}>
    <div style={{ fontSize: 13, fontWeight: 500, color: colors.darkText3, letterSpacing: "0.04em", textTransform: "uppercase" }}>Tiivistelmä päättäjälle</div>
    <ol style={{ margin: "12px 0 0", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8, fontSize: 18, lineHeight: 1.4 }}>
      <li>
        <strong style={{ fontWeight: 500 }}>Ero:</strong> julkisen perusterveydenhuollon kautta hoitoon kuluu {D.public[D.public.length - 1]} pv, työterveyden tai yksityisen kautta {D.private[D.private.length - 1]} pv (lymfooma).
      </li>
      <li>
        <strong style={{ fontWeight: 500 }}>Missä:</strong> koko ero syntyy ennen erikoislääkärin vastaanottoa: hoitoon hakeutumisessa (+{segments[0].pub - segments[0].priv} pv), perusterveydenhuollossa ensikontaktista lähetteeseen (+{segments[1].pub - segments[1].priv + segments[2].pub - segments[2].priv} pv) ja lähetteen käsittelyssä (+{segments[3].pub - segments[3].priv} pv). Erikoislääkäriltä hoitoon julkinen reitti on jopa nopeampi.
      </li>
      <li>
        <strong style={{ fontWeight: 500 }}>Mitä tehdä:</strong> hälytykset ja yhdenvertaisuusjärjestys perusterveydenhuoltoon, yhtenäinen lähete ja hoitoonpääsyn seuranta tavoiteaikoja vasten (Tavoite 3).
      </li>
    </ol>
  </div>
);

/** Public vs private route, step by step: which steps add the delay. */
export const WhereGap: React.FC = () => {
  const max = Math.max(...segments.map((s) => Math.max(s.pub, s.priv)));
  return (
    <section className="card" aria-label="Missä ero syntyy">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 6 }}>
        <h2 style={{ whiteSpace: "nowrap" }}>Missä ero syntyy?</h2>
        <Chip tone="success" size={13}>
          Julkinen aineisto
        </Chip>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: colors.text3 }}>
          Lymfooma (DLBCL), mediaani päivinä
          <SourceLink source="azDeck" align="right" note="Ensioireesta kunkin vaiheen alkuun, ensikontaktin mukaan: julkinen perusterveydenhuolto vs. työterveys / yksityinen." />
        </span>
      </div>
      <div style={{ display: "flex", gap: 18, fontSize: 14, color: colors.text2, marginTop: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: colors.error }} /> Julkinen perusterveydenhuolto
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: colors.outline }} /> Työterveys / yksityinen
        </span>
      </div>
      <div style={{ marginTop: 12 }}>
        {segments.map((s) => {
          const diff = s.pub - s.priv;
          return (
            <div key={s.to} style={{ display: "grid", gridTemplateColumns: "250px minmax(0, 1fr) 90px", gap: 16, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${colors.outlineVariant}` }}>
              <span style={{ fontSize: 15 }}>
                {s.from} → <strong style={{ fontWeight: 500 }}>{s.to}</strong>
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  [s.pub, colors.error],
                  [s.priv, colors.outline],
                ].map(([v, c], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ height: 10, width: `${((v as number) / max) * 78}%`, minWidth: 2, borderRadius: 5, background: c as string }} />
                    <span className="num" style={{ fontSize: 13, color: colors.text2, whiteSpace: "nowrap" }}>
                      {v as number} pv
                    </span>
                  </div>
                ))}
              </div>
              <span className="num" style={{ textAlign: "right", fontSize: 18, fontWeight: 500, color: diff > 0 ? colors.error : colors.success }}>
                {diff > 0 ? `+${diff}` : diff} pv
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.45, color: colors.text }}>
        Kokonaisero <strong style={{ fontWeight: 500 }}>{totalGap} pv</strong>. Ennen erikoislääkärin vastaanottoa ero on jo <strong style={{ fontWeight: 500 }}>{gapBeforeSpecialist} pv</strong>: viive syntyy havaitsemisessa ja lähetteessä, ei erikoissairaanhoidossa.
      </div>
    </section>
  );
};

/** What the county can't measure yet: stage is recorded for 42 % of cancers. */
export const DataGap: React.FC = () => {
  const bars = [
    ...STAGE_COVERAGE.regions.map((r) => ({ name: r.name, lo: r.pct, hi: r.pct })),
    { name: "Muut alueet", lo: STAGE_COVERAGE.othersRange[0], hi: STAGE_COVERAGE.othersRange[1] },
  ];
  return (
    <section className="card" aria-label="Tietoaukko">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 6 }}>
        <h2 style={{ whiteSpace: "nowrap" }}>Tietoaukko: levinneisyys kirjattu</h2>
        <Chip tone="success" size={13}>
          Julkinen aineisto
        </Chip>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: colors.text3 }}>
          2024
          <SourceLink source="stageCoverage" align="right" note="Syöpärekisteri, Syöpä 2024: levinneisyystieto saatiin koko maassa 42 %:ssa syöpätapauksista. Tavoite vähintään 70 %." />
        </span>
      </div>
      <div className="num" style={{ fontSize: 56, fontWeight: 500, letterSpacing: "-0.04em", marginTop: 6, lineHeight: 1.1 }}>
        {STAGE_COVERAGE.national} %
      </div>
      <div style={{ fontSize: 15, color: colors.text2 }}>syövistä levinneisyystieto käytettävissä koko maassa</div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {bars.map((b) => (
          <div key={b.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>{b.name}</span>
              <span className="num" style={{ fontWeight: 500 }}>
                {b.lo === b.hi ? `${b.lo} %` : `${b.lo}–${b.hi} %`}
              </span>
            </div>
            <div style={{ position: "relative", height: 10, borderRadius: 5, background: colors.containerHigh, marginTop: 4 }}>
              <div style={{ position: "absolute", left: b.lo === b.hi ? 0 : `${b.lo}%`, width: b.lo === b.hi ? `${b.lo}%` : `${b.hi - b.lo}%`, top: 0, bottom: 0, borderRadius: 5, background: colors.primary, opacity: b.lo === b.hi ? 1 : 0.5 }} />
              <div style={{ position: "absolute", left: `${STAGE_COVERAGE.target}%`, top: -4, width: 2, height: 18, background: colors.text }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: colors.text3, marginTop: 10 }}>Pystyviiva: tavoite {STAGE_COVERAGE.target} %. Ilman levinneisyystietoa varhaisen toteamisen tavoitetta (70 % vaiheissa I–II) ei voi seurata.</div>
    </section>
  );
};

export const Recommendations: React.FC = () => (
  <section aria-label="Suositukset">
    <h2 style={{ fontSize: 24, letterSpacing: "-0.01em" }}>Mitä tehdä? Viisi toimenpidettä hyvinvointialueelle</h2>
    <div className="sub" style={{ marginTop: 4 }}>
      Kukin kohdistuu hoitopolun vaiheeseen, jossa ero syntyy, ja on käytössä tässä demossa.
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      {RECOMMENDATIONS.map((r) => (
        <div key={r.n} className="card outline" style={{ display: "grid", gridTemplateColumns: "44px minmax(0, 1fr) 260px", gap: 20, alignItems: "start", padding: "18px 24px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 500 }}>{r.n}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 19, fontWeight: 500 }}>{r.title}</span>
              <Chip tone="neutral" size={12}>
                {r.step}
              </Chip>
            </div>
            <div style={{ fontSize: 15, color: colors.text2, marginTop: 6, lineHeight: 1.45 }}>
              <strong style={{ fontWeight: 500, color: colors.text }}>Miksi:</strong> {r.why}
            </div>
            <div style={{ fontSize: 15, color: colors.text2, marginTop: 4, lineHeight: 1.45 }}>
              <strong style={{ fontWeight: 500, color: colors.text }}>Toimenpide:</strong> {r.action}
            </div>
            <div style={{ fontSize: 15, color: colors.text2, marginTop: 4, lineHeight: 1.45 }}>
              <strong style={{ fontWeight: 500, color: colors.text }}>Mittari:</strong> {r.indicator}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {r.measures.map((m) => (
                <MeasureLink key={m} id={m} align="right" />
              ))}
            </div>
            <Link to={r.inApp.to} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500 }}>
              Näytä: {r.inApp.label} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  </section>
);
