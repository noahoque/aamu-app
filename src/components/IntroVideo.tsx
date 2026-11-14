import React, { useState } from "react";
import { colors } from "../theme";
import { Dialog } from "./Dialog";
import { Wordmark } from "./Logo";
import { Icon } from "./ui";

// The demo video as a quick tutorial: shown every time the app is opened on the home screen
// (Työlista), and from the "Esittely" button. Direct links to other screens, or ?esittely=0, skip it.
export const VIDEO_SRC = "/aamu-esittely.mp4";

const showOnLoad = () => {
  const { pathname, search } = window.location;
  return pathname === "/" && new URLSearchParams(search).get("esittely") !== "0";
};

export function useIntro() {
  const [open, setOpen] = useState(showOnLoad);
  return { open, show: () => setOpen(true), close: () => setOpen(false) };
}

export const IntroVideo: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Dialog onClose={onClose} label="Aamu-esittely" width={1800} compact>
    <div style={{ display: "flex", alignItems: "center", gap: 16, paddingRight: 48 }}>
      <Wordmark size={26} />
      <span style={{ fontSize: 16, color: colors.text2 }}>Esittely: mitä Aamu tekee, ennen kuin kokeilet itse</span>
    </div>
    <video
      src={VIDEO_SRC}
      poster="/aamu-esittely-poster.jpg"
      controls
      playsInline
      preload="metadata"
      style={{ display: "block", width: "100%", aspectRatio: "16 / 9", maxHeight: "calc(100vh - 170px)", objectFit: "contain", marginTop: 14, borderRadius: 16, background: colors.dark }}
    />
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
      <span className="info">
        <Icon name="info" size={16} />
        Kaikki potilastiedot ovat synteettisiä. Esittelyn saa auki uudelleen yläpalkin Esittely-painikkeesta.
      </span>
      <button className="btn primary" onClick={onClose} style={{ marginLeft: "auto" }}>
        Avaa sovellus
      </button>
    </div>
  </Dialog>
);
