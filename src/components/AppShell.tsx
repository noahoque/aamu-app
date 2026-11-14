import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { PATIENTS } from "../data/patients";
import { useAppState } from "../state";
import { colors } from "../theme";
import { IntroVideo, useIntro } from "./IntroVideo";
import { LogoMark } from "./Logo";
import { Icon, type IconName } from "./ui";

type NavItem = { to: string; label: string; icon: IconName; desc: string };

// Grouped by who uses it. Within the care pathway, in the order a patient moves through it.
const NAV_GROUPS: { label: string; who: string; items: NavItem[] }[] = [
  {
    label: "Hoitopolku",
    who: "Koordinaattori ja lääkäri",
    items: [
      { to: "/", label: "Työlista", icon: "list", desc: "Uudet hälytykset" },
      { to: "/seuranta", label: "Seuranta", icon: "flag", desc: "Lähetteestä hoitoon" },
    ],
  },
  {
    label: "Johto",
    who: "Hyvinvointialue",
    items: [{ to: "/alue", label: "Alue", icon: "chart", desc: "Ero ja toimenpiteet" }],
  },
];

const BAR = 64;
const SIDEBAR = 248;

const GroupHeading: React.FC<{ label: string; who: string; first?: boolean }> = ({ label, who, first }) => (
  <div style={{ padding: "0 14px", marginTop: first ? 4 : 22, marginBottom: 6 }}>
    <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.text2 }}>{label}</div>
    <div style={{ fontSize: 12, color: colors.text3, marginTop: 1 }}>{who}</div>
  </div>
);

/** A sidebar row: icon, name with a one-line description, and an optional count. */
const NavRow: React.FC<{ item: NavItem; count?: number; alert?: boolean; active?: boolean; compact?: boolean }> = ({ item, count, alert, active = false, compact }) => (
  <NavLink to={item.to} end={item.to === "/"} style={{ textDecoration: "none", display: "block" }}>
    {({ isActive }) => {
      const on = isActive || active;
      return (
        <span
          style={{
            display: "grid",
            gridTemplateColumns: "24px minmax(0, 1fr) auto",
            alignItems: "center",
            gap: 12,
            padding: compact ? "8px 14px" : "10px 14px",
            borderRadius: 14,
            background: on ? colors.primaryContainer : "transparent",
            transition: "background 200ms",
          }}
          onMouseEnter={(e) => !on && (e.currentTarget.style.background = colors.container)}
          onMouseLeave={(e) => !on && (e.currentTarget.style.background = "transparent")}
        >
          <Icon name={item.icon} size={22} color={on ? colors.onPrimaryContainer : colors.text2} />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 16, fontWeight: 500, color: on ? colors.onPrimaryContainer : colors.text }}>{item.label}</span>
            {item.desc ? <span style={{ display: "block", fontSize: 13, color: on ? colors.onPrimaryContainer : colors.text3, marginTop: 1, lineHeight: 1.3 }}>{item.desc}</span> : null}
          </span>
          {count ? (
            <span className="num" title={alert ? "Ylittänyt tavoiteajan" : "Avoimet hälytykset"} style={{ minWidth: 24, height: 22, padding: "0 7px", borderRadius: 11, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", background: alert ? colors.error : on ? colors.bg : colors.containerHigh, color: alert ? "#fff" : colors.text2 }}>
              {count}
            </span>
          ) : null}
        </span>
      );
    }}
  </NavLink>
);

// Workspace-style shell from the video: top bar with search, navigation rail, white content panel.
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reset, tracks, rows } = useAppState();
  const lateCount = tracks.filter((t) => t.overall === "late").length;
  const openCount = rows.filter((r) => r.status === "none").length;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState("");
  const intro = useIntro();

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim().toLowerCase();
    const p = PATIENTS.find((x) => x.name.toLowerCase() === t || x.id.toLowerCase() === t || x.name.toLowerCase().endsWith(` ${t}`));
    if (p) {
      navigate(`/potilas/${p.id}`);
      setQ("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.surface }}>
      <header style={{ height: BAR, display: "flex", alignItems: "center", gap: 24, padding: "0 24px 0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: SIDEBAR - 32, flex: "none" }}>
          <LogoMark size={16} />
          <span style={{ fontSize: 22, fontWeight: 500, color: colors.text2, letterSpacing: "-0.02em" }}>Aamu</span>
        </div>
        <form onSubmit={search} style={{ flex: "0 1 520px", minWidth: 180 }}>
          <label style={{ height: 44, borderRadius: 22, background: colors.containerHigh, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", color: colors.text2 }}>
            <Icon name="search" size={20} />
            <input
              list="patients"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hae potilasta"
              aria-label="Hae potilasta"
              style={{ background: "transparent", border: 0, boxShadow: "none", padding: 0, fontSize: 16, outline: "none", borderRadius: 0, width: "100%", color: colors.text }}
            />
            <datalist id="patients">
              {PATIENTS.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </label>
        </form>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <span title="Kaikki potilastiedot ovat synteettisiä" style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: colors.container, fontSize: 13, color: colors.text3 }}>
            <Icon name="info" size={14} />
            Synteettinen data
          </span>
          <button className="btn small" onClick={intro.show} title="Katso esittelyvideo">
            <Icon name="play" size={18} />
            Esittely
          </button>
          <span title="AZ · Terveysasema, esimerkkialue" aria-label="Käyttäjä AZ" style={{ width: 36, height: 36, borderRadius: 18, background: colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500 }}>AZ</span>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <nav aria-label="Päävalikko" style={{ width: SIDEBAR, flex: "none", padding: "8px 12px 16px 12px", display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 0, height: `calc(100vh - ${BAR}px)`, overflowY: "auto" }}>
          {NAV_GROUPS.map((g, gi) => (
            <React.Fragment key={g.label}>
              <GroupHeading label={g.label} who={g.who} first={gi === 0} />
              {g.items.map((n) => (
                <NavRow key={n.to} item={n} count={n.to === "/" ? openCount : n.to === "/seuranta" ? lateCount : undefined} alert={n.to === "/seuranta"} />
              ))}
            </React.Fragment>
          ))}
          <span aria-hidden="true" style={{ height: 1, background: colors.outlineVariant, margin: "18px 14px 10px" }} />
          <NavRow item={{ to: "/potilaat", label: "Potilaat", icon: "person", desc: "" }} active={pathname.startsWith("/potilas/")} compact />
          <NavRow item={{ to: "/lahteet", label: "Lähteet", icon: "book", desc: "" }} compact />
          <button className="btn small" onClick={reset} title="Palauta demo alkutilaan" style={{ marginTop: "auto", alignSelf: "flex-start", marginLeft: 2, color: colors.text3, fontSize: 14, fontWeight: 400 }}>
            <Icon name="reset" size={16} />
            Nollaa demo
          </button>
        </nav>
        <main style={{ flex: 1, minWidth: 0, marginRight: 16, marginBottom: 16, minHeight: `calc(100vh - ${BAR + 16}px)`, background: colors.bg, borderRadius: 16, overflowX: "auto" }}>
          <div style={{ minWidth: 960, padding: "26px 32px 32px" }}>{children}</div>
        </main>
        {intro.open ? <IntroVideo onClose={intro.close} /> : null}
      </div>
    </div>
  );
};
