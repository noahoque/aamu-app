import React from "react";
import { colors, fonts } from "../theme";

// Building blocks ported from the demo video (ajoissa-video/src/components/ui.tsx),
// with the frame-based animation replaced by CSS transitions.

export type Tone = "neutral" | "primary" | "error" | "success" | "equity" | "outline" | "dark" | "flag";
const TONES: Record<Tone, { bg: string; fg: string; border?: string }> = {
  neutral: { bg: colors.containerHigh, fg: colors.text2 },
  primary: { bg: colors.primaryContainer, fg: colors.onPrimaryContainer },
  error: { bg: colors.errorContainer, fg: colors.onErrorContainer },
  success: { bg: colors.successContainer, fg: colors.onSuccessContainer },
  equity: { bg: colors.equityContainer, fg: colors.onEquityContainer },
  outline: { bg: "transparent", fg: colors.text2, border: colors.outline },
  dark: { bg: colors.text, fg: "#fff" },
  flag: { bg: colors.error, fg: "#fff" },
};

export const Chip: React.FC<{ tone?: Tone; size?: number; icon?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties; title?: string }> = ({
  tone = "neutral",
  size = 15,
  icon,
  children,
  style,
  title,
}) => {
  const t = TONES[tone];
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: size * 2,
        padding: `0 ${size * 0.8}px`,
        borderRadius: 10,
        background: t.bg,
        color: t.fg,
        boxShadow: t.border ? `inset 0 0 0 1px ${t.border}` : undefined,
        fontFamily: fonts.sans,
        fontSize: size,
        fontWeight: 500,
        whiteSpace: "nowrap",
        transition: "background 200ms, color 200ms",
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
};

/** Toggle switch: capsule track, white knob. */
export const Switch: React.FC<{ on: boolean; onChange: (on: boolean) => void; label: string }> = ({ on, onChange, label }) => (
  <button
    role="switch"
    aria-checked={on}
    aria-label={label}
    className="chip-btn"
    onClick={() => onChange(!on)}
    style={{
      position: "relative",
      width: 58,
      height: 34,
      borderRadius: 17,
      flex: "none",
      background: on ? colors.primary : colors.containerHigh,
      boxShadow: on ? "none" : `inset 0 0 0 1px ${colors.outline}`,
      transition: "background 200ms var(--ease)",
    }}
  >
    <span
      style={{
        position: "absolute",
        left: on ? 27 : 3,
        top: 3,
        width: 28,
        height: 28,
        borderRadius: 14,
        background: "#FFFFFF",
        boxShadow: "0 2px 6px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.04)",
        transition: "left 220ms var(--ease)",
      }}
    />
  </button>
);

export const Checkbox: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    aria-hidden="true"
    style={{
      width: 26,
      height: 26,
      flex: "none",
      borderRadius: 7,
      background: on ? colors.primary : colors.bg,
      boxShadow: on ? "none" : `inset 0 0 0 2px ${colors.outline}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 160ms",
    }}
  >
    <span style={{ opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.6})`, transition: "all 160ms var(--ease)", display: "flex" }}>
      <Icon name="check" size={18} color="#fff" />
    </span>
  </span>
);

/** Round icon badge used in card and dialog headers. */
export const Badge: React.FC<{ icon: IconName; tone?: "primary" | "success" | "equity" | "error"; size?: number; square?: boolean }> = ({ icon, tone = "primary", size = 44, square }) => {
  const t = { primary: [colors.primaryContainer, colors.onPrimaryContainer], success: [colors.successContainer, colors.success], equity: [colors.equityContainer, colors.onEquityContainer], error: [colors.errorContainer, colors.error] }[tone];
  return (
    <span style={{ width: size, height: size, flex: "none", borderRadius: square ? 12 : size / 2, background: t[0], display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={t[1]} />
    </span>
  );
};

export type IconName =
  | "check"
  | "flag"
  | "doc"
  | "lab"
  | "pill"
  | "notes"
  | "info"
  | "list"
  | "person"
  | "chart"
  | "send"
  | "spark"
  | "pin"
  | "lang"
  | "home"
  | "close"
  | "back"
  | "search"
  | "reset"
  | "link"
  | "book"
  | "play";

/** A small set of outline icons drawn on a 24px grid. */
export const Icon: React.FC<{ name: IconName; size?: number; color?: string }> = ({ name, size = 20, color = "currentColor" }) => {
  const p = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    check: <path d="M5 12.5l4.5 4.5L19 7.5" {...p} />,
    flag: (
      <>
        <path d="M5 21V4" {...p} />
        <path d="M5 4h11l-2 4 2 4H5" {...p} />
      </>
    ),
    doc: (
      <>
        <path d="M7 3h7l5 5v13H7z" {...p} />
        <path d="M14 3v5h5M10 13h6M10 17h6" {...p} />
      </>
    ),
    lab: (
      <>
        <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" {...p} />
        <path d="M7.5 15h9" {...p} />
      </>
    ),
    pill: (
      <>
        <rect x="3" y="8.5" width="18" height="7" rx="3.5" {...p} transform="rotate(-35 12 12)" />
        <path d="M9.5 8.3l4.8 7.3" {...p} />
      </>
    ),
    notes: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" {...p} />
        <path d="M8 8h8M8 12h8M8 16h5" {...p} />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" {...p} />
        <path d="M12 11v5M12 8h.01" {...p} />
      </>
    ),
    list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" {...p} />,
    person: (
      <>
        <circle cx="12" cy="8" r="4" {...p} />
        <path d="M4 21c1-4 4-6 8-6s7 2 8 6" {...p} />
      </>
    ),
    chart: <path d="M4 20V4M4 20h16M8 16l4-5 3 3 5-7" {...p} />,
    send: <path d="M4 12l16-8-6 16-3-7z" {...p} />,
    spark: <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" {...p} />,
    pin: (
      <>
        <path d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11z" {...p} />
        <circle cx="12" cy="10" r="2" {...p} />
      </>
    ),
    lang: (
      <>
        <path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 6 8M11 5c-.5 3-2.5 6-6 8" {...p} />
        <path d="M13 21l4-9 4 9M14.5 18h5" {...p} />
      </>
    ),
    home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" {...p} />,
    close: <path d="M6 6l12 12M18 6L6 18" {...p} />,
    back: <path d="M15 5l-7 7 7 7" {...p} />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" {...p} />
        <path d="M15.5 15.5L20 20" {...p} />
      </>
    ),
    reset: (
      <>
        <path d="M4 12a8 8 0 1 0 2.4-5.7" {...p} />
        <path d="M4 4v4h4" {...p} />
      </>
    ),
    link: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" {...p} />,
    play: <path d="M8 5v14l11-7z" {...p} />,
    book: (
      <>
        <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" {...p} />
        <path d="M5 17a3 3 0 0 1 3-3h10" {...p} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      {paths[name]}
    </svg>
  );
};
