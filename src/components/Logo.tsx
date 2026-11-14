import React from "react";
import { colors, fonts } from "../theme";

// Aamu mark (from the demo video): a horizon line with three points rising above it, each larger
// and warmer. The horizon is the patient's timeline; the points are small signs becoming one signal.
export const DOTS = [
  { x: 11, y: 15.4, r: 2.7, color: colors.dawn1 },
  { x: 21.5, y: 11, r: 3.7, color: colors.dawn2 },
  { x: 34, y: 5.4, r: 5.3, color: colors.dawn3 },
];
export const HORIZON_Y = 21;

export const LogoMark: React.FC<{ size?: number; line?: string }> = ({ size = 24, line = colors.text3 }) => (
  <svg width={size * 2} height={size} viewBox="0 0 48 24" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
    <line x1="2" y1={HORIZON_Y} x2="46" y2={HORIZON_Y} stroke={line} strokeWidth="2.8" strokeLinecap="round" />
    {DOTS.map((d, i) => (
      <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.color} />
    ))}
  </svg>
);

export const Wordmark: React.FC<{ size?: number; color?: string; line?: string }> = ({ size = 28, color = colors.text, line }) => (
  <span style={{ display: "flex", alignItems: "center", gap: size * 0.36 }}>
    <LogoMark size={size * 0.62} line={line} />
    <span style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: size, lineHeight: 1, letterSpacing: "-0.03em", color }}>Aamu</span>
  </span>
);
