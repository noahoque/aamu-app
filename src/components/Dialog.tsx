import React, { useEffect } from "react";
import { Icon } from "./ui";

/** `compact` = less padding, for content that should use as much of the screen as possible (the intro video). */
export const Dialog: React.FC<{ onClose: () => void; label: string; width?: number; compact?: boolean; children: React.ReactNode }> = ({ onClose, label, width, compact, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="scrim" style={compact ? { padding: 12 } : undefined} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={label} style={{ width: width ? `min(${width}px, 100%)` : undefined, position: "relative", ...(compact ? { padding: "16px 20px", maxHeight: "calc(100vh - 24px)", borderRadius: 22 } : {}) }}>
        <button className="btn" aria-label="Sulje" onClick={onClose} style={{ position: "absolute", top: compact ? 8 : 20, right: compact ? 10 : 20, width: 44, height: 44, padding: 0, color: "var(--text2)" }}>
          <Icon name="close" size={22} />
        </button>
        {children}
      </div>
    </div>
  );
};
