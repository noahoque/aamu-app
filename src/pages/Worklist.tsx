import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Popover } from "../components/Popover";
import { SourceLink } from "../components/SourceLink";
import { Chip, Icon } from "../components/ui";
import { WAIT_PRIVATE_DAYS, WAIT_PUBLIC_DAYS } from "../data/content";
import { isoWeek } from "../rules/dates";
import { DISTANCE_LIMIT_KM, LANGUAGE_NAMES, sortRows, type SortMode } from "../rules/equity";
import type { WorklistRow } from "../rules/evaluate";
import { STATUS_LABEL, useAppState } from "../state";
import { colors } from "../theme";
import { ScreeningInviteDialog } from "./ScreeningInvite";

const COLS = "140px minmax(0, 1fr) 190px 110px 120px 12px";
const ROW_H = 76;
type Filter = "all" | "open" | "equity";

const CARE_TEXT: Record<string, string> = {
  occupational: "Käyttää työterveyshuoltoa",
  private: "Käyttää yksityistä terveydenhuoltoa",
  mixed: "Käyttää myös yksityistä tai työterveyttä",
};

/** "Why is this patient prioritised?" — the three equity criteria, with sources. */
const EquityDetails: React.FC<{ row: WorklistRow; top: boolean }> = ({ row, top }) => {
  const p = row.evaluation.patient;
  const e = row.equity;
  const items = [
    {
      icon: "home" as const,
      hit: e.publicOnly,
      label: "Vain julkinen perusterveydenhuolto",
      detail: e.publicOnly ? `Ensioireista hoitoon ${WAIT_PUBLIC_DAYS} pv vs. ${WAIT_PRIVATE_DAYS} pv työterveydessä (lymfooma)` : CARE_TEXT[p.careType],
      source: e.publicOnly ? <SourceLink source="lymphomaDelay" align="right" note="Lymfoomapotilaat, ensioireista hoidon alkuun. Tiekartan s. 11: julkisen reitin kautta noin kaksi kertaa pidempi." /> : null,
    },
    {
      icon: "pin" as const,
      hit: e.far,
      label: `Yli ${DISTANCE_LIMIT_KM} km sairaalaan`,
      detail: `${p.distanceKm} km lähimpään sairaalaan`,
      source: <SourceLink source="roadmap" page={12} align="right" note="Hoitotulokset heikompia, jos potilas asuu yli 50 km:n päässä hoitoyksiköstä (keuhkosyöpätutkimus, viite 9)." />,
    },
    {
      icon: "lang" as const,
      hit: e.minorityLanguage,
      label: "Vähemmistökieli",
      detail: `Asiointikieli ${LANGUAGE_NAMES[p.language]}${e.minorityLanguage ? " · tulkkaus ja ohjaus tarpeen" : ""}`,
      source: null,
    },
  ];
  return (
    <>
      <span style={{ display: "block", fontSize: 18, fontWeight: 500 }}>{top ? `Miksi ${row.name} on kärjessä?` : `Yhdenvertaisuus · ${row.name}`}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 10 }}>
        {items.map((c) => (
          <span key={c.label} style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr) 24px", alignItems: "center", gap: 12, padding: "10px 0", opacity: c.hit ? 1 : 0.55 }}>
            <span style={{ width: 40, height: 40, borderRadius: 20, background: c.hit ? colors.equityContainer : colors.container, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={c.icon} size={20} color={c.hit ? colors.onEquityContainer : colors.text3} />
            </span>
            <span>
              <span style={{ display: "block", fontSize: 16, fontWeight: 500 }}>{c.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: colors.text2, marginTop: 2 }}>
                {c.detail}
                {c.source}
              </span>
            </span>
            {c.hit ? <Icon name="check" size={22} color={colors.success} /> : <span style={{ fontSize: 20, color: colors.text3, textAlign: "center" }}>–</span>}
          </span>
        ))}
      </span>
    </>
  );
};

export const WorklistPage: React.FC = () => {
  const { rows, today, invited, tracks } = useAppState();
  const late = tracks.filter((t) => t.overall === "late");
  const atRisk = tracks.filter((t) => t.overall === "atRisk");
  const navigate = useNavigate();
  const [mode, setMode] = useState<SortMode>("newest");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [inviteFor, setInviteFor] = useState<string | null>(null);

  const sorted = sortRows(rows, mode);
  const order = Object.fromEntries(sorted.map((r, i) => [r.id, i]));
  const visible = sorted.filter((r) => (filter === "open" ? r.status === "none" : filter === "equity" ? r.equity.score > 0 : true));
  const pos = Object.fromEntries(visible.map((r, i) => [r.id, i]));
  const counts = { all: rows.length, open: rows.filter((r) => r.status === "none").length, equity: rows.filter((r) => r.equity.score > 0).length };
  const topId = sortRows(rows, "equity")[0]?.id;

  const filterChip = (f: Filter, label: string, tone: "primary" | "equity") => {
    const on = filter === f;
    return (
      <button className="chip-btn" aria-pressed={on} onClick={() => setFilter(on && f !== "all" ? "all" : f)}>
        <Chip tone={on ? tone : "outline"} icon={on ? <Icon name={f === "equity" ? "home" : "check"} size={16} /> : undefined}>
          {label} · {counts[f]}
        </Chip>
      </button>
    );
  };

  return (
    <>
      <h1>Työlista</h1>
      <div className="sub">Viikko {isoWeek(today)} · hälytykset ilman jatkotoimia</div>

      {late.length || atRisk.length ? (
        <Link to="/seuranta" className="card" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, padding: "12px 20px", background: colors.errorContainer, color: colors.onErrorContainer, textDecoration: "none" }}>
          <Icon name="flag" size={18} color={colors.error} />
          <span style={{ fontSize: 15 }}>
            <strong style={{ fontWeight: 500 }}>Hoitoonpääsy:</strong> {late.length} lähetettyä potilasta on ylittänyt tavoiteajan{atRisk.length ? `, ${atRisk.length} uhkaa ylittyä` : ""} ({[...late, ...atRisk].map((t) => t.track.name).join(", ")}).
          </span>
          <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 500, color: colors.primary }}>Avaa seuranta →</span>
        </Link>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, height: 36 }}>
        {filterChip("all", "Kaikki", "primary")}
        {filterChip("open", "Avoinna", "primary")}
        {filterChip("equity", "Yhdenvertaisuusprioriteetti", "equity")}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: colors.text2 }}>
          Järjestys:
          <span role="group" aria-label="Järjestys" style={{ display: "inline-flex", padding: 3, borderRadius: 20, background: colors.container }}>
            {(
              [
                ["newest", "Uusin ensin"],
                ["equity", "Yhdenvertaisuus ensin"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                className="chip-btn"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                style={{ height: 32, padding: "0 14px", borderRadius: 16, fontSize: 15, fontWeight: mode === m ? 500 : 400, background: mode === m ? colors.bg : "transparent", boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.12)" : "none", color: mode === m ? colors.text : colors.text2, transition: "all 200ms var(--ease)" }}
              >
                {label}
              </button>
            ))}
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{ marginTop: 24 }}>
        <div style={{ height: 44, display: "grid", gridTemplateColumns: COLS, gap: 20, alignItems: "center", padding: "0 12px", borderBottom: `1px solid ${colors.outlineVariant}`, fontSize: 14, fontWeight: 500, color: colors.text2 }}>
          <span>Potilas</span>
          <span>Hälytyksen perusteet</span>
          <span style={{ color: mode === "equity" ? colors.onEquityContainer : colors.text2 }}>Yhdenvertaisuus</span>
          <span>Polku</span>
          <span>Tila</span>
          <span />
        </div>
        <div style={{ position: "relative", height: visible.length * ROW_H, transition: "height 300ms var(--ease)" }}>
          {sorted.map((r) => {
            const shown = r.id in pos;
            const st = STATUS_LABEL[r.status];
            return (
              <div
                key={r.id}
                className="row"
                role="link"
                tabIndex={shown ? 0 : -1}
                aria-hidden={!shown}
                aria-label={`${r.name}: ${r.reasons}`}
                onClick={() => navigate(`/potilas/${r.id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/potilas/${r.id}`)}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (shown ? pos[r.id] : order[r.id]) * ROW_H,
                  height: ROW_H,
                  padding: "0 12px",
                  display: "grid",
                  gridTemplateColumns: COLS,
                  gap: 20,
                  alignItems: "center",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: colors.bg,
                  boxShadow: `inset 0 -1px 0 ${colors.outlineVariant}`,
                  opacity: shown ? 1 : 0,
                  pointerEvents: shown ? "auto" : "none",
                  zIndex: openId === r.id ? 20 : 1,
                  transition: "top 520ms var(--ease), opacity 220ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.surface)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.bg)}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>{r.name}</div>
                  <div className="num" style={{ fontSize: 14, color: colors.text3, marginTop: 2 }}>
                    {r.meta}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, minWidth: 0 }}>
                  {r.tag ? (
                    <button
                      className="chip-btn"
                      title="Avaa seulontakutsu"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInviteFor(r.id);
                      }}
                    >
                      {invited[r.id] ? (
                        <Chip tone="success" size={13} icon={<Icon name="check" size={14} />}>
                          Kutsu lähetetty
                        </Chip>
                      ) : (
                        <Chip tone="error" size={13} icon={<Icon name="flag" size={14} />}>
                          {r.tag}
                        </Chip>
                      )}
                    </button>
                  ) : null}
                  <span style={{ fontSize: 15, lineHeight: 1.3, color: colors.text2, display: "-webkit-box", WebkitLineClamp: r.tag ? 1 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.reasons}</span>
                </div>
                <div>
                  {r.equity.label ? (
                    <Popover
                      label={`Yhdenvertaisuusperusteet: ${r.name}`}
                      width={520}
                      onOpenChange={(o) => setOpenId(o ? r.id : null)}
                      trigger={() => (
                        <Chip tone="equity" size={14} icon={<Icon name={r.equity.icon!} size={16} />}>
                          {r.equity.label}
                        </Chip>
                      )}
                    >
                      <EquityDetails row={r} top={mode === "equity" && r.id === topId} />
                    </Popover>
                  ) : null}
                </div>
                <span style={{ fontSize: 16, color: colors.text2 }}>{r.pathway}</span>
                <div>
                  <Chip tone={st.tone} size={14}>
                    {st.label}
                  </Chip>
                </div>
                <span aria-hidden="true" style={{ fontSize: 22, color: colors.text3, textAlign: "right" }}>›</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info" style={{ marginTop: 18, minHeight: 20 }}>
        <Icon name="info" size={16} />
        {mode === "equity" ? (
          <>
            Ensin: vain julkinen perusterveydenhuolto · yli {DISTANCE_LIMIT_KM} km sairaalaan · vähemmistökieli. Napsauta keltaista merkkiä nähdäksesi perusteet.
          </>
        ) : (
          <>Uusin hälytys ensin. Hälytykset syntyvät läpinäkyvistä säännöistä; päätöksen tekee aina lääkäri.</>
        )}
      </div>

      {inviteFor ? <ScreeningInviteDialog patientId={inviteFor} onClose={() => setInviteFor(null)} /> : null}
    </>
  );
};
