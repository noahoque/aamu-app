import React, { useEffect, useRef, useState } from "react";

/** A trigger that toggles a floating panel; closes on outside click or Escape. */
export const Popover: React.FC<{
  trigger: (open: boolean) => React.ReactNode;
  children: React.ReactNode;
  width?: number;
  align?: "left" | "right";
  label: string;
  onOpenChange?: (open: boolean) => void;
}> = ({ trigger, children, width = 380, align = "left", label, onOpenChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const set = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && set(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && set(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        className="chip-btn"
        aria-expanded={open}
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          set(!open);
        }}
        style={{ display: "inline-flex" }}
      >
        {trigger(open)}
      </button>
      {open ? (
        <span
          className="float pop"
          role="dialog"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            [align]: 0,
            width,
            zIndex: 50,
            padding: "18px 22px",
            display: "block",
            textAlign: "left",
            fontWeight: 400,
            whiteSpace: "normal",
            cursor: "default",
          }}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
};
