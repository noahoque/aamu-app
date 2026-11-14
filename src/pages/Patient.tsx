import React, { useState } from "react";
import { Link, useParams } from "react-router";
import { extractLive } from "../ai/extractions";
import { Popover } from "../components/Popover";
import { MeasureLink, SourceChip, SourceLink } from "../components/SourceLink";
import { Chip, Icon } from "../components/ui";
import type { LabName, Patient, Visit } from "../data/types";
import { daysBetween, fmtLong, fmtShort } from "../rules/dates";
import { riskRows } from "../rules/risk";
import { LAB_DEFS, LAB_ORDER, isAbnormal, refText, series, trend } from "../rules/labs";
import { PATHWAY_SOURCES, type PathwayHit, type Reason } from "../rules/pathways";
import { STATUS_LABEL, useAppState } from "../state";
import { colors } from "../theme";
import { SYMPTOM_LABELS, type Symptom } from "../../shared/symptoms";
import { ReferralDialog, RejectDialog } from "./ReferralDialog";
import { ScreeningInviteDialog } from "./ScreeningInvite";

// ---------------------------------------------------------------------------
// Horizon timeline: the patient's year as a line, contacts as points (like the logo).

const Horizon: React.FC<{ p: Patient; flaggedAt?: string; today: string }> = ({ p, flaggedAt, today }) => {
  const start = `${today.slice(0, 4)}-01-01`;
  const span = Math.max(daysBetween(start, today), 1);
  const x = (d: string) => `${(daysBetween(start, d) / span) * 100}%`;
  return (
    <div style={{ position: "relative", height: 64, margin: "6px 8px 0" }} aria-label="Yhteydenotot aikajanalla">
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 3, borderRadius: 2, background: colors.containerHigh }} />
      {p.visits.map((v) => {
        const flag = v.date === flaggedAt;
        const size = flag ? 18 : 12;
        return (
          <div key={v.id} title={`${fmtShort(v.date)} ${v.kind}`} style={{ position: "absolute", left: x(v.date), top: 31.5 - size / 2, width: size, height: size, marginLeft: -size / 2, borderRadius: size / 2, background: flag ? colors.error : colors.text3, boxShadow: `0 0 0 3px ${colors.bg}` }} />
        );
      })}
      {p.visits.map((v) => (
        <span key={`l${v.id}`} className="num" style={{ position: "absolute", left: x(v.date), top: 44, transform: "translateX(-50%)", fontSize: 12, color: v.date === flaggedAt ? colors.error : colors.text3, whiteSpace: "nowrap" }}>
          {fmtShort(v.date)}
        </span>
      ))}
      <span style={{ position: "absolute", right: 0, top: 6, fontSize: 12, color: colors.text3 }}>tänään {fmtShort(today)}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// A note with the AI evidence phrases highlighted.

function highlight(note: string, symptoms: Symptom[]) {
  const ranges = symptoms
    .map((s) => ({ start: note.indexOf(s.evidence), s }))
    .filter((r) => r.start >= 0)
    .map((r) => ({ ...r, end: r.start + r.s.evidence.length }))
    .sort((a, b) => a.start - b.start)
    .filter((r, i, xs) => i === 0 || r.start >= xs[i - 1].end);
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const r of ranges) {
    out.push(note.slice(at, r.start));
    out.push(
      <mark key={r.start} title={`Tekoäly: ${SYMPTOM_LABELS[r.s.code]}`} style={{ borderRadius: 4, background: "rgba(179, 38, 30, 0.14)", boxShadow: "0 0 0 2px rgba(179, 38, 30, 0.14)", color: colors.onErrorContainer, fontWeight: 500 }}>
        {r.s.evidence}
      </mark>,
    );
    at = r.end;
  }
  out.push(note.slice(at));
  return out;
}

const VisitRow: React.FC<{ v: Visit; p: Patient; symptoms: Symptom[]; flag: boolean }> = ({ v, p, symptoms, flag }) => {
  const labs = p.labs.some((l) => l.date === v.date);
  const rx = p.prescriptions.filter((x) => x.date === v.date);
  return (
    <div style={{ padding: "12px 16px", borderRadius: 14, display: "grid", gridTemplateColumns: "64px minmax(0, 1fr)", gap: 16, background: flag ? colors.errorContainer : "transparent", boxShadow: flag ? "none" : `inset 0 -1px 0 ${colors.outlineVariant}` }}>
      <span className="num" style={{ fontSize: 16, fontWeight: 500, paddingTop: 16 }}>
        {fmtShort(v.date)}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: colors.text3 }}>
          {v.kind} · {v.who}
        </div>
        <div style={{ fontSize: 17, marginTop: 2, lineHeight: 1.4 }}>{highlight(v.note, symptoms)}</div>
        {symptoms.length || labs || rx.length || flag ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {symptoms.map((s) => (
              <Chip key={s.code} tone="primary" size={13} icon={<Icon name="spark" size={14} />}>
                Tekoäly: {SYMPTOM_LABELS[s.code]}
                {s.durationDays ? ` · ${s.durationDays} pv` : ""}
              </Chip>
            ))}
            {labs ? (
              <Chip tone="neutral" size={13} icon={<Icon name="lab" size={14} />}>
                Verikokeet
              </Chip>
            ) : null}
            {rx.map((x) => (
              <Chip key={x.drug} tone="neutral" size={13} icon={<Icon name="pill" size={14} />}>
                {x.drug}
              </Chip>
            ))}
            {flag ? (
              <Chip tone="flag" size={13} icon={<Icon name="flag" size={14} />}>
                Hälytys
              </Chip>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Lab table: the last three sampling dates, abnormal values marked.

const LabTable: React.FC<{ p: Patient }> = ({ p }) => {
  const dates = [...new Set(p.labs.map((l) => l.date))].sort().slice(-3);
  const names = LAB_ORDER.filter((n) => p.labs.some((l) => l.name === n));
  const cols = `150px repeat(${dates.length}, 84px) minmax(0, 1fr)`;
  return (
    <div className="card">
      <div style={{ display: "grid", gridTemplateColumns: cols, alignItems: "baseline", height: 32 }}>
        <h2>Laboratorioarvot</h2>
        {dates.map((d, j) => (
          <span key={d} className="num" style={{ fontSize: 13, textAlign: "right", color: j === dates.length - 1 ? colors.text : colors.text3, fontWeight: j === dates.length - 1 ? 500 : 400 }}>
            {fmtShort(d)}
          </span>
        ))}
        <span style={{ fontSize: 13, color: colors.text3, textAlign: "right" }}>viitearvo</span>
      </div>
      {names.length === 0 ? <div style={{ fontSize: 15, color: colors.text3, padding: "12px 0" }}>Ei laboratoriotuloksia.</div> : null}
      {names.map((n: LabName) => {
        const s = series(p.labs, n);
        const dir = trend(s.map((x) => x.value));
        return (
          <div key={n} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", height: 52, borderTop: `1px solid ${colors.outlineVariant}` }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 500 }}>
                {n}
                {n === "CA-125" ? <SourceLink source="ovarianCa125" note="NICE NG12: CA-125 ≥ 35 perusterveydenhuollossa → kiireellinen ultraääni." /> : null}
              </div>
              <div style={{ fontSize: 12, color: colors.text3 }}>{LAB_DEFS[n].unit}</div>
            </div>
            {dates.map((d, j) => {
              const v = s.find((x) => x.date === d)?.value;
              const last = j === dates.length - 1;
              const bad = v !== undefined && isAbnormal(n, p.sex, v);
              return (
                <span key={d} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span className="num" style={{ fontSize: last ? 19 : 16, fontWeight: last || bad ? 500 : 400, color: v === undefined ? colors.text3 : bad ? colors.onErrorContainer : colors.text2, background: bad ? colors.errorContainer : "transparent", borderRadius: 8, padding: bad ? "2px 8px" : 0 }}>
                    {v ?? "–"}
                    {last && v !== undefined && dir ? (dir === "up" ? " ↑" : " ↓") : ""}
                  </span>
                </span>
              );
            })}
            <span className="num" style={{ fontSize: 14, color: colors.text3, textAlign: "right", whiteSpace: "nowrap" }}>
              {refText(n, p.sex)}
            </span>
          </div>
        );
      })}
      {names.length ? (
        <div style={{ fontSize: 12, color: colors.text3, marginTop: 10 }}>Tyypilliset aikuisten viitearvot. Synteettiset arvot, tarkistettava lääkärin kanssa.</div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Risk factors: context for the doctor. They never raise a flag on their own.

const RiskCard: React.FC<{ p: Patient }> = ({ p }) => (
  <div className="card">
    <h2>Riskitekijät</h2>
    {riskRows(p).map((r) => (
      <div key={r.label} style={{ display: "grid", gridTemplateColumns: "130px minmax(0, 1fr)", gap: 12, alignItems: "baseline", padding: "10px 0", borderTop: `1px solid ${colors.outlineVariant}`, marginTop: r.label === "Tupakointi" ? 8 : 0 }}>
        <span style={{ fontSize: 15, color: colors.text3 }}>{r.label}</span>
        <span style={{ fontSize: 16, fontWeight: r.flag ? 500 : 400, color: r.flag ? colors.text : colors.text2 }}>{r.value}</span>
      </div>
    ))}
    <div style={{ fontSize: 12, color: colors.text3, marginTop: 8, lineHeight: 1.4 }}>
      Taustatietoa lääkärille. Riskitekijät eivät yksin nosta potilasta työlistalle. Päihteiden käyttöä ei kirjata: yhteys syöpään on heikko ja tieto arkaluonteinen.
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      <SourceChip source="khTobacco" label="Käypä hoito: tupakka" />
      <SourceChip source="khAlcohol" label="Käypä hoito: alkoholi" note="AUDIT-C:n seulontaraja: naiset ≥ 5, miehet ≥ 6 pistettä." />
      <SourceChip source="khObesity" label="Käypä hoito: lihavuus" align="right" />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Why the flag: transparent rules + AI, each with its kind and source.

const ReasonRow: React.FC<{ r: Reason }> = ({ r }) => (
  <div style={{ display: "grid", gridTemplateColumns: "28px minmax(0, 1fr)", padding: "8px 0" }}>
    <span style={{ paddingTop: 2 }}>{r.kind === "ai" ? <Icon name="spark" size={18} color={colors.primary} /> : <Icon name="check" size={18} color={colors.error} />}</span>
    <div>
      <div className="num" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.3 }}>
        {r.fact}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: colors.text3, marginTop: 2 }}>
        {r.rule}
        {r.source ? <SourceLink source={r.source.source} page={r.source.page} note="NICE NG12: Suspected cancer, recognition and referral. Aamun kynnysarvot perustuvat tähän, ellei toisin mainita." /> : null}
      </div>
    </div>
  </div>
);

/** Where the rule comes from: NICE threshold, the Finnish guideline situation, the research. */
const PathwaySources: React.FC<{ id: string }> = ({ id }) => {
  const g = PATHWAY_SOURCES[id];
  if (!g) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 10, paddingTop: 12, borderTop: `1px solid ${colors.outlineVariant}` }}>
      <span style={{ fontSize: 13, color: colors.text3, marginRight: 2 }}>Lähteet</span>
      <SourceChip source="ovarianCa125" label="NICE NG12" note="Aamun hälytyskynnykset perustuvat tähän, koska Suomessa ei ole suositusta syöpäepäilyn tunnistamiseen perusterveydenhuollossa." />
      {g.finnish ? (
        <SourceChip source={g.finnish} label={g.finnish === "khColorectal" ? "FICAN" : g.finnish === "khLungHistory" ? "Käypä hoito: poistettu" : "Käypä hoito"} note={g.finnishNote} />
      ) : (
        <Popover
          label="Käypä hoito"
          width={360}
          trigger={() => (
            <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", borderRadius: 9, fontSize: 13, color: colors.text3, boxShadow: `inset 0 0 0 1px ${colors.outlineVariant}`, whiteSpace: "nowrap" }}>
              Ei Käypä hoito -suositusta
            </span>
          )}
        >
          <span style={{ display: "block", fontSize: 14, lineHeight: 1.45, color: colors.text2 }}>{g.finnishNote} Kynnys on NICE NG12:sta. Tiekartan toimenpide 2.5.2 tuo yhtenäiset lähetekriteerit kansallisiin hoitoketjuihin.</span>
        </Popover>
      )}
      {g.evidence ? <SourceChip source={g.evidence} label="PubMed" align="right" note="Tutkimus säännön taustalla." /> : null}
      <SourceChip source="terveysportti" label="Terveysportti" align="right" note="Lääkäri tarkistaa tutkimukset ja hoidon Lääkärin tietokannoista. Vaatii kirjautumisen." />
    </div>
  );
};

const WhyCard: React.FC<{ hits: PathwayHit[]; patientId: string; onConfirm: () => void; onReject: () => void; onShowReferral: () => void }> = ({ hits, patientId, onConfirm, onReject, onShowReferral }) => {
  const { status, decisions } = useAppState();
  const st = status[patientId] ?? "none";
  const primary = hits[0];
  const mine = decisions.filter((d) => d.patientId === patientId);
  return (
    <div className="card" style={{ boxShadow: st === "none" ? `inset 0 0 0 2px ${colors.error}` : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Miksi hälytys?</h2>
        <span className="num" style={{ fontSize: 14, color: colors.error }}>
          {fmtLong(primary.flaggedAt)}
        </span>
      </div>
      {hits.map((h, i) => (
        <div key={h.id} style={{ marginTop: 10 }}>
          {hits.length > 1 ? <div style={{ fontSize: 13, fontWeight: 500, color: colors.text3, marginTop: i ? 10 : 0 }}>{i === 0 ? `Polku: ${h.pathway}` : `Myös: ${h.pathway}`}</div> : null}
          {h.reasons.map((r, j) => (
            <ReasonRow key={j} r={r} />
          ))}
        </div>
      ))}
      <PathwaySources id={primary.id} />

      {mine.length ? (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.outlineVariant}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {mine.map((d, i) => (
            <div key={i} style={{ fontSize: 14, color: colors.text2 }}>
              <span className="num" style={{ color: colors.text3 }}>
                {fmtLong(d.at.slice(0, 10))} {d.at.slice(11)} ·{" "}
              </span>
              {{ confirmed: "Hälytys vahvistettu", rejected: "Hälytys hylätty", referred: "Lähete lähetetty", invited: "Seulontakutsu lähetetty" }[d.action]}
              {d.detail ? `: ${d.detail}` : ""}
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        {st === "none" || st === "contacted" ? (
          <>
            <button className="btn" onClick={onReject}>
              Hylkää
            </button>
            <button className="btn primary" onClick={onConfirm} style={{ minWidth: 220 }}>
              <Icon name="check" size={18} color="#fff" />
              Vahvista hälytys
            </button>
          </>
        ) : st === "confirmed" ? (
          <button className="btn primary" onClick={onShowReferral}>
            <Icon name="send" size={18} color="#fff" />
            Jatka lähetteeseen
          </button>
        ) : (
          <>
            {st === "referred" ? (
              <Link to="/seuranta" className="btn small">
                Seuraa hoitoonpääsyä →
              </Link>
            ) : null}
            <Chip tone={STATUS_LABEL[st].tone} size={15} icon={<Icon name="check" size={16} />}>
              {STATUS_LABEL[st].label}
            </Chip>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// AI extraction panel: where the symptoms came from, and a live re-run.

const AiPanel: React.FC<{ p: Patient }> = ({ p }) => {
  const { extractions, applyLive } = useAppState();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const entries = p.visits.map((v) => extractions[v.id]).filter(Boolean);
  const src = entries[0];
  const label = src?.source === "gemini" ? `Gemini · ${src.model}` : "Varapoiminta (avainsanat)";
  const run = async () => {
    setBusy(true);
    setMsg(null);
    const res = await extractLive(p.visits.map((v) => ({ id: v.id, text: v.note })));
    applyLive(res);
    setBusy(false);
    const n = res.results.reduce((a, r) => a + r.symptoms.length, 0);
    setMsg(
      res.source === "gemini"
        ? `Gemini poimi ${n} oiretta${res.dropped ? `, ${res.dropped} hylätty (ilmaus ei löytynyt merkinnästä)` : ""}.`
        : `Gemini ei käytettävissä (${res.error ?? "tuntematon syy"}): käytettiin avainsanapoimintaa, ${n} oiretta.`,
    );
  };
  return (
    <div className="card outline" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Icon name="spark" size={20} color={colors.primary} />
        <h2>Tekoälypoiminta</h2>
        <Chip tone={src?.source === "gemini" ? "primary" : "neutral"} size={13}>
          {label} · {src?.live ? "ajettu juuri nyt" : "esilaskettu"}
        </Chip>
        <MeasureLink id="3.5.3" />
        <button className="btn small" onClick={run} disabled={busy} style={{ marginLeft: "auto" }}>
          {busy ? <span className="spin" /> : <Icon name="reset" size={16} />}
          Aja tekoälypoiminta uudelleen
        </button>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: colors.text2, marginTop: 10 }}>
        Tekoäly poimii vain oireet vapaatekstistä, ja jokainen poiminta on lainaus merkinnästä (korostettu yllä). Hälytyksen päättävät läpinäkyvät säännöt, ja päätöksen tekee aina lääkäri.
      </div>
      {msg ? <div style={{ fontSize: 14, color: colors.text, marginTop: 8 }}>{msg}</div> : null}
      <div className="info" style={{ marginTop: 8, fontSize: 13 }}>
        <Icon name="info" size={14} />
        Synteettinen data. Geminin ilmaisversio voi käyttää syötteitä palvelun kehittämiseen, joten oikeita potilastietoja ei saa käyttää.
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

export const PatientPage: React.FC = () => {
  const { id = "" } = useParams();
  const { evaluate, extractions, status, today, invited } = useAppState();
  const [dialog, setDialog] = useState<"referral" | "reject" | "invite" | null>(null);
  const { confirm } = useAppState();
  const e = evaluate(id);
  if (!e) return <div>Potilasta ei löydy. <Link to="/">Takaisin työlistaan</Link></div>;
  const p = e.patient;
  const hit = e.primary;
  const flagVisit = hit ? [...p.visits].reverse().find((v) => v.date <= hit.flaggedAt)?.id : undefined;
  const st = status[id] ?? "none";

  return (
    <>
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 500 }}>
        <Icon name="back" size={16} /> Työlista
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
        <h1>{p.name}</h1>
        <Chip tone="outline" size={14}>
          {p.sex} {p.age}
        </Chip>
        {e.equity.label ? (
          <Chip tone="equity" size={14} icon={<Icon name={e.equity.icon!} size={16} />}>
            {e.equity.label}
          </Chip>
        ) : null}
        {hit ? (
          <Chip tone={STATUS_LABEL[st].tone} size={14}>
            {STATUS_LABEL[st].label}
          </Chip>
        ) : null}
        <span style={{ marginLeft: "auto" }}>
          <Chip tone="neutral" size={14} icon={<Icon name="person" size={16} />}>
            Päätöksen tekee aina lääkäri
          </Chip>
        </span>
      </div>

      <Horizon p={p} flaggedAt={hit?.flaggedAt} today={today} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(460px, 540px)", gap: 32, marginTop: 12, alignItems: "start" }}>
        <section aria-label="Käynnit">
          <h2 style={{ margin: "0 0 6px 16px" }}>Käynnit ja merkinnät</h2>
          {p.visits.map((v) => (
            <VisitRow key={v.id} v={v} p={p} symptoms={extractions[v.id]?.symptoms ?? []} flag={v.id === flagVisit} />
          ))}
          <AiPanel p={p} />
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {hit ? (
            <WhyCard
              hits={e.hits}
              patientId={p.id}
              onConfirm={() => {
                confirm(p.id);
                setDialog("referral");
              }}
              onReject={() => setDialog("reject")}
              onShowReferral={() => setDialog("referral")}
            />
          ) : (
            <div className="card">
              <h2>Ei hälytystä</h2>
              <div style={{ fontSize: 15, color: colors.text2, marginTop: 8, lineHeight: 1.45 }}>Mikään sääntö ei täyty tämän potilaan tiedoilla. Aamu ei nosta potilasta työlistalle.</div>
            </div>
          )}
          <LabTable p={p} />
          <RiskCard p={p} />
          {e.screening.map((s) => (
            <div key={s.programme} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Icon name="lang" size={22} color={colors.onEquityContainer} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Seulonta väliin</div>
                <div style={{ fontSize: 14, color: colors.text2, marginTop: 2 }}>
                  {s.programme} · {s.missed}
                </div>
              </div>
              {invited[p.id] ? (
                <Chip tone="success" size={14} icon={<Icon name="check" size={16} />}>
                  Kutsu lähetetty
                </Chip>
              ) : (
                <button className="btn small primary" onClick={() => setDialog("invite")}>
                  <Icon name="send" size={16} color="#fff" /> Lähetä kutsu
                </button>
              )}
            </div>
          ))}
        </aside>
      </div>

      {dialog === "referral" && hit ? <ReferralDialog evaluation={e} onClose={() => setDialog(null)} /> : null}
      {dialog === "reject" ? <RejectDialog patientId={p.id} onClose={() => setDialog(null)} /> : null}
      {dialog === "invite" ? <ScreeningInviteDialog patientId={p.id} onClose={() => setDialog(null)} /> : null}
    </>
  );
};
