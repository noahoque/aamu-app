import React, { useState } from "react";
import { Dialog } from "../components/Dialog";
import { MeasureLink } from "../components/SourceLink";
import { Badge, Checkbox, Chip, Icon } from "../components/ui";
import { UNITS, unitName, type UnitId } from "../data/units";
import { fmtLong } from "../rules/dates";
import type { Evaluation } from "../rules/evaluate";
import { riskSummary } from "../rules/risk";
import { useAppState } from "../state";
import { colors } from "../theme";

const G8_AGE = 75; // Aamu's own choice; the roadmap names G8 but sets no age limit.

const Field: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0, 1fr)", gap: 12, padding: "11px 0", borderBottom: `1px solid ${colors.outlineVariant}`, alignItems: "baseline" }}>
    <span style={{ fontSize: 15, color: colors.text3 }}>{k}</span>
    <span style={{ fontSize: 17 }}>{children}</span>
  </div>
);

const CardHead: React.FC<{ icon: "send" | "lab"; title: string; sub: string }> = ({ icon, title, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <Badge icon={icon} square />
    <div>
      <div style={{ fontSize: 22, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 15, color: colors.text2, marginTop: 2 }}>{sub}</div>
    </div>
  </div>
);

/** Pre-filled referral; the pathway suggests tests, the doctor picks them and sends. */
export const ReferralDialog: React.FC<{ evaluation: Evaluation; onClose: () => void }> = ({ evaluation, onClose }) => {
  const { today, refer, status } = useAppState();
  const p = evaluation.patient;
  const hit = evaluation.primary!;
  const [picked, setPicked] = useState<Set<string>>(() => new Set(hit.tests.filter((t) => t.suggested).map((t) => t.name)));
  const [unit, setUnit] = useState<UnitId>(hit.unit);
  const [extra, setExtra] = useState("");
  const risks = riskSummary(p);
  const [g8, setG8] = useState("");
  const [sent, setSent] = useState(status[p.id] === "referred");
  const needsG8 = p.age >= G8_AGE;
  const g8Value = Number(g8);
  const g8Ok = !needsG8 || (g8 !== "" && g8Value >= 0 && g8Value <= 17);

  const toggle = (name: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });

  const send = () => {
    const tests = hit.tests.filter((t) => picked.has(t.name)).map((t) => t.name);
    refer(p.id, [unitName(unit), tests.join(", "), needsG8 ? `G8 ${g8Value}/17` : "", extra.trim()].filter(Boolean).join(" · "), unitName(unit));
    setSent(true);
  };

  return (
    <Dialog onClose={onClose} label="Lähete">
      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingRight: 48 }}>
        <Badge icon="check" tone="success" size={52} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.01em" }}>Hälytys vahvistettu</div>
          <div style={{ fontSize: 16, color: colors.text2, marginTop: 4 }}>Lähete erikoissairaanhoitoon, valmiiksi täytetty · {fmtLong(today)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 28 }}>
        <div className="card outline" style={{ background: colors.surface, padding: "24px 28px" }}>
          <CardHead icon="send" title="Lähete" sub="Yhtenäinen nopean diagnostiikan lähete" />
          <div style={{ marginTop: 14 }}>
            <Field k="Potilas">
              {p.name} · {p.sex} {p.age}
            </Field>
            <Field k="Vastaanottaja">
              <select value={unit} onChange={(e) => setUnit(e.target.value as UnitId)} disabled={sent} aria-label="Vastaanottava yksikkö" style={{ padding: "8px 40px 8px 12px", fontSize: 16 }}>
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                    {u.id === hit.unit ? " · suositeltu" : ""}
                  </option>
                ))}
              </select>
              <span style={{ display: "block", fontSize: 13, color: colors.text3, marginTop: 4 }}>{UNITS.find((u) => u.id === unit)!.note}</span>
            </Field>
            <Field k="Polku">{hit.referralPath}</Field>
            <Field k="Perusteet">
              <span className="num">{hit.referralBasis.join(" · ")}</span>
            </Field>
            <Field k="Riskitekijät">{risks.length ? risks.join(" · ") : <span style={{ color: colors.text3 }}>Ei kirjattuja riskitekijöitä</span>}</Field>
            <Field k="Kriteerit">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                Yhtenäiset lähetekriteerit täyttyvät
                <MeasureLink id="2.5.2" note="Kansallisiin hoitoketjuihin kuuluvat standardoidut lähetekriteerit." />
              </span>
            </Field>
          </div>

          <div style={{ marginTop: 16, borderRadius: 16, background: colors.bg, boxShadow: `inset 0 0 0 1px ${colors.outlineVariant}`, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 500 }}>G8-haurausseula</span>
              <MeasureLink id="3.4.2" align="right" note="Tiekartta nimeää G8:n ja CFS:n, mutta ei ikärajaa. 75 vuoden raja on Aamun oma valinta." />
              {needsG8 ? (
                <Chip tone="primary" size={13} style={{ marginLeft: "auto" }}>
                  Liitetään · {p.age} v
                </Chip>
              ) : (
                <Chip tone="neutral" size={13} style={{ marginLeft: "auto" }}>
                  Ei tarvita · {p.age} v
                </Chip>
              )}
            </div>
            <div style={{ fontSize: 15, color: colors.text2, marginTop: 6 }}>Liitetään automaattisesti {G8_AGE} vuotta täyttäneiden lähetteisiin.</div>
            {needsG8 ? (
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontSize: 15 }}>
                G8-pisteet (0–17, ≤ 14 viittaa haurauteen)
                <input type="number" min={0} max={17} value={g8} onChange={(e) => setG8(e.target.value)} style={{ width: 90 }} disabled={sent} />
              </label>
            ) : null}
          </div>

          <label style={{ display: "block", marginTop: 16, fontSize: 15, color: colors.text3 }}>
            Lisätiedot lähetteeseen
            <textarea rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} disabled={sent} style={{ marginTop: 6, resize: "vertical" }} placeholder="Vapaaehtoinen" />
          </label>
        </div>

        <div className="card outline" style={{ background: colors.surface, padding: "24px 28px" }}>
          <CardHead icon="lab" title="Tutkimukset" sub="Polku ehdottaa, lääkäri valitsee" />
          <div style={{ marginTop: 14 }} role="group" aria-label="Tutkimukset">
            {hit.tests.map((t, j) => {
              const on = picked.has(t.name);
              return (
                <button
                  key={t.name}
                  className="chip-btn"
                  role="checkbox"
                  aria-checked={on}
                  disabled={sent}
                  onClick={() => toggle(t.name)}
                  style={{ width: "100%", minHeight: 58, display: "flex", alignItems: "center", gap: 16, textAlign: "left", borderRadius: 0, borderTop: j === 0 ? "none" : `1px solid ${colors.outlineVariant}`, cursor: sent ? "default" : "pointer" }}
                >
                  <Checkbox on={on} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 17, fontWeight: 500, color: on ? colors.text : colors.text2 }}>{t.name}</span>
                    <span style={{ display: "block", fontSize: 14, color: colors.text3, marginTop: 1 }}>{t.note}</span>
                  </span>
                  {t.suggested ? (
                    <Chip tone="primary" size={13} icon={<Icon name="spark" size={14} />} style={{ marginLeft: "auto" }}>
                      Suositeltu
                    </Chip>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${colors.outlineVariant}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 500 }}>Jatkotutkimukset erikoissairaanhoidossa</span>
              <Chip tone="neutral" size={13} style={{ marginLeft: "auto" }}>
                Tiedoksi
              </Chip>
            </div>
            <div style={{ fontSize: 14, color: colors.text3, marginTop: 4 }}>Erikoislääkäri tilaa nämä, jos löydökset sitä edellyttävät.</div>
            {hit.followUp.map((t) => (
              <div key={t.name} style={{ display: "flex", gap: 12, padding: "9px 0", alignItems: "baseline" }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: colors.text3, flex: "none", transform: "translateY(-3px)" }} />
                <span>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{t.name}</span>
                  <span style={{ fontSize: 14, color: colors.text3 }}> · {t.note}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div aria-label="Hoitopolku" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 20, fontSize: 14, color: colors.text2 }}>
        {["Perusterveydenhuolto", unitName(unit), "Patologia: kudosdiagnoosi", "Onkologia: hoito"].map((step, i) => (
          <React.Fragment key={step}>
            {i ? <span style={{ color: colors.text3 }}>→</span> : null}
            <span style={{ padding: "4px 12px", borderRadius: 999, background: i <= 1 ? colors.primaryContainer : colors.container, color: i <= 1 ? colors.onPrimaryContainer : colors.text2, fontWeight: i === 1 ? 500 : 400 }}>{step}</span>
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 24 }}>
        {sent ? (
          <>
            <Chip tone="success" icon={<Icon name="check" size={16} />}>
              Lähete lähetetty · {picked.size} tutkimusta
            </Chip>
            <button className="btn" onClick={onClose}>
              Sulje
            </button>
          </>
        ) : (
          <>
            {!g8Ok ? <span style={{ fontSize: 14, color: colors.error }}>Täytä G8-pisteet</span> : null}
            <button className="btn" onClick={onClose}>
              Myöhemmin
            </button>
            <button className="btn primary" onClick={send} disabled={picked.size === 0 || !g8Ok} style={{ width: 150 }}>
              <Icon name="send" size={18} color="#fff" />
              Lähetä
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
};

const REJECT_REASONS = ["Oireille löytynyt muu selitys", "Potilas jo tutkimuksissa", "Ei kliinisesti merkittävä", "Muu syy"];

/** Rejecting is a recorded decision with a reason, so rules can be reviewed later. */
export const RejectDialog: React.FC<{ patientId: string; onClose: () => void }> = ({ patientId, onClose }) => {
  const { reject } = useAppState();
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [note, setNote] = useState("");
  return (
    <Dialog onClose={onClose} label="Hylkää hälytys" width={620}>
      <div style={{ fontSize: 24, fontWeight: 500 }}>Hylkää hälytys</div>
      <div style={{ fontSize: 15, color: colors.text2, marginTop: 6 }}>Syy kirjataan, jotta sääntöjä voidaan arvioida jälkikäteen.</div>
      <div role="radiogroup" style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 18 }}>
        {REJECT_REASONS.map((r) => (
          <label key={r} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, padding: "8px 0", cursor: "pointer" }}>
            <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} style={{ width: 18, height: 18, accentColor: colors.primary }} />
            {r}
          </label>
        ))}
      </div>
      <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tarkenne (vapaaehtoinen)" style={{ marginTop: 10 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <button className="btn" onClick={onClose}>
          Peruuta
        </button>
        <button
          className="btn primary"
          onClick={() => {
            reject(patientId, [reason, note.trim()].filter(Boolean).join(": "));
            onClose();
          }}
        >
          Hylkää hälytys
        </button>
      </div>
    </Dialog>
  );
};
