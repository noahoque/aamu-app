import React from "react";
import { MeasureLink, SourceLink } from "../components/SourceLink";
import { Chip, Icon, type Tone } from "../components/ui";
import { MILESTONES, TARGETS } from "../data/referrals";
import { daysBetween, fmtLong, fmtShort } from "../rules/dates";
import { equityOf } from "../rules/equity";
import { onTimeShare, type TrackResult } from "../rules/tracking";
import { GOAL3 } from "../references";
import { useAppState } from "../state";
import { colors } from "../theme";

// Goal 3 indicator: "Potilaat pääsevät hoitoon tavoiteaikojen puitteissa".
// After the referral is sent, every patient is followed to treatment start, and the coordinator
// sees who is about to miss a target time while there is still time to act.

const OVERALL: Record<TrackResult["overall"], { label: string; tone: Tone }> = {
  late: { label: "Ylittynyt", tone: "error" },
  atRisk: { label: "Uhkaa ylittyä", tone: "equity" },
  onTrack: { label: "Ajassa", tone: "primary" },
  treated: { label: "Hoito aloitettu", tone: "success" },
  treatedLate: { label: "Hoito aloitettu, viiveellä", tone: "neutral" },
};

const COLS = "170px 110px minmax(230px, 1fr) minmax(190px, 230px) 160px";

/** Four dots on a line: referral → assessment → diagnosis → treatment. */
const Steps: React.FC<{ r: TrackResult }> = ({ r }) => {
  const m = r.track.milestones;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${MILESTONES.length}, 1fr)`, position: "relative" }}>
      <div style={{ position: "absolute", left: "12.5%", right: "12.5%", top: 7, height: 2, background: colors.containerHigh }} />
      {MILESTONES.map((ms) => {
        const date = m[ms.key];
        const step = r.steps.find((s) => s.step === ms.key);
        const late = step?.state === "doneLate" || step?.state === "late";
        const isCurrent = r.current?.step === ms.key;
        const color = date ? (late ? colors.error : colors.primary) : isCurrent ? (step?.state === "late" ? colors.error : step?.state === "atRisk" ? colors.equity : colors.outline) : colors.containerHigh;
        return (
          <div key={ms.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: date ? color : colors.bg, boxShadow: date ? `0 0 0 3px ${colors.bg}` : `inset 0 0 0 2px ${color}, 0 0 0 3px ${colors.bg}` }} />
            <span style={{ fontSize: 12, color: colors.text3, marginTop: 4 }}>{ms.short}</span>
            <span className="num" style={{ fontSize: 12, color: late ? colors.error : colors.text2, fontWeight: date ? 500 : 400 }}>
              {date ? fmtShort(date) : isCurrent && step?.due ? `viim. ${fmtShort(step.due)}` : "–"}
              {ms.key === "diagnosis" && date && r.track.stage ? (
                <span title="Levinneisyysaste kirjattu diagnoosissa" style={{ display: "block", fontSize: 11, color: colors.text3, fontWeight: 400 }}>
                  levinneisyysaste {r.track.stage}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Kpi: React.FC<{ value: React.ReactNode; label: React.ReactNode; tone?: string }> = ({ value, label, tone = colors.text }) => (
  <div className="card" style={{ padding: "18px 24px" }}>
    <div className="num" style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em", color: tone, lineHeight: 1.1 }}>
      {value}
    </div>
    <div style={{ fontSize: 15, color: colors.text2, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>{label}</div>
  </div>
);

export const TrackingPage: React.FC = () => {
  const { tracks, today, followups, logFollowup } = useAppState();
  const share = onTimeShare(tracks);
  const late = tracks.filter((r) => r.overall === "late");
  const risk = tracks.filter((r) => r.overall === "atRisk");
  const treated = tracks.filter((r) => r.totalDays !== undefined);

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1>Hoitoonpääsyn seuranta</h1>
          <div className="sub">Lähetetyt potilaat lähetteestä hoidon aloitukseen · tilanne {fmtLong(today)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 22 }}>
        <Kpi value={`${share.pct} %`} label={
            <>
              vaiheista tavoiteajassa ({share.met}/{share.total})
              <SourceLink source="strategy" page={GOAL3.page} note={`${GOAL3.title}. Mittarit: ${GOAL3.indicators.join("; ")}.`} />
            </>
          } tone={share.pct >= 90 ? colors.success : colors.text} />
        <Kpi value={late.length} label="ylittänyt tavoiteajan" tone={late.length ? colors.error : colors.text} />
        <Kpi value={risk.length} label={`uhkaa ylittyä (≤ 3 pv jäljellä)`} tone={risk.length ? colors.onEquityContainer : colors.text} />
        <Kpi value={treated.length ? `${Math.round(treated.reduce((a, r) => a + r.totalDays!, 0) / treated.length)} pv` : "–"} label="lähetteestä hoitoon (aloitetut)" />
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ height: 44, display: "grid", gridTemplateColumns: COLS, gap: 20, alignItems: "center", padding: "0 12px", borderBottom: `1px solid ${colors.outlineVariant}`, fontSize: 14, fontWeight: 500, color: colors.text2 }}>
          <span>Potilas</span>
          <span>Polku</span>
          <span>Eteneminen</span>
          <span>Seuraava tavoite</span>
          <span>Tila</span>
        </div>
        {tracks.map((r) => {
          const t = r.track;
          const eq = equityOf(t);
          const o = OVERALL[r.overall];
          const cur = r.current;
          const needsAction = r.overall === "late" || r.overall === "atRisk";
          return (
            <div key={t.id} style={{ minHeight: 84, display: "grid", gridTemplateColumns: COLS, gap: 20, alignItems: "center", padding: "10px 12px", boxShadow: `inset 0 -1px 0 ${colors.outlineVariant}`, background: r.overall === "late" ? "rgba(249, 222, 220, 0.35)" : colors.bg }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{t.name}</div>
                <div className="num" style={{ fontSize: 14, color: colors.text3, marginTop: 2 }}>
                  {t.sex} {t.age} · lähete {fmtShort(t.milestones.sent!)}
                </div>
                {eq.label ? (
                  <div style={{ marginTop: 6 }}>
                    <Chip tone="equity" size={12} icon={<Icon name={eq.icon!} size={13} />}>
                      {eq.label}
                    </Chip>
                  </div>
                ) : null}
              </div>
              <span style={{ fontSize: 16, color: colors.text2 }}>
                {t.pathway}
                {t.unit ? <span style={{ display: "block", fontSize: 13, color: colors.text3, marginTop: 2 }}>{t.unit}</span> : null}
              </span>
              <Steps r={r} />
              <div style={{ fontSize: 15, color: colors.text2 }}>
                {cur ? (
                  <>
                    <div style={{ color: colors.text, fontWeight: 500 }}>{cur.label}</div>
                    <div className="num" style={{ marginTop: 2, color: cur.state === "late" ? colors.error : colors.text2 }}>
                      {cur.state === "late" ? `${cur.overBy} pv yli (oli ${fmtShort(cur.due!)})` : `viimeistään ${fmtShort(cur.due!)} · ${daysBetween(today, cur.due!)} pv jäljellä`}
                    </div>
                  </>
                ) : r.totalDays !== undefined ? (
                  <span className="num">Lähetteestä hoitoon {r.totalDays} pv</span>
                ) : (
                  "–"
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                <Chip tone={o.tone} size={14}>
                  {o.label}
                </Chip>
                {needsAction ? (
                  followups[t.id] ? (
                    <Chip tone="neutral" size={13} icon={<Icon name="check" size={14} />}>
                      Selvitetään {fmtShort(followups[t.id])}
                    </Chip>
                  ) : (
                    <button className="btn small" style={{ height: 32, padding: "0 10px", marginLeft: -10 }} onClick={() => logFollowup(t.id)} title="Kirjaa, että koordinaattori on ottanut yhteyttä hoitavaan yksikköön">
                      <Icon name="send" size={16} />
                      Selvitä viive
                    </button>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card outline" style={{ marginTop: 24, display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 24px" }}>
        <Icon name="info" size={20} color={colors.text3} />
        <div style={{ fontSize: 14, lineHeight: 1.5, color: colors.text2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <strong style={{ fontWeight: 500, color: colors.text }}>Esimerkkitavoitteet:</strong> {TARGETS.map((t) => t.label).join(" · ")}
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            Syöpäkohtaiset hoitoonpääsyajat määritetään vuosina 2026–2028. Siihen asti hyvinvointialue asettaa tavoitteet itse. Mittauspisteet THL:n ohjauksen mukaan.
            <MeasureLink id="3.1.2" align="right" note="2026–2028: kansalliset hoitoketjukuvaukset viidestä syövästä ja syöpäkohtaiset hoitoonpääsyajat määritetty (s. 57)." />
            <SourceLink source="thlAccess" align="right" note="Määrittelee hoitoonpääsyn seurannan mittauspisteet: lähetteen saapuminen, ensikäynti, hoitojonoon asettaminen, ensimmäinen syöpähoito." />
          </div>
          <div style={{ marginTop: 6 }}>Diagnoosin yhteydessä kirjataan levinneisyysaste, jotta varhain todettujen osuus voidaan seurata alueittain.</div>
          <div style={{ marginTop: 6 }}>Seurannan potilaat ovat synteettisiä. Työlistalta lähetetyt potilaat lisätään tähän automaattisesti.</div>
        </div>
      </div>
    </>
  );
};
