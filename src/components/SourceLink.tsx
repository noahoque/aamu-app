import React from "react";
import { ROADMAP_MEASURES, SOURCES } from "../references";
import type { SourceKey } from "../rules/pathways";
import { colors } from "../theme";
import { Popover } from "./Popover";
import { Icon } from "./ui";

// Every real number and every roadmap measure in the UI links to its source (src/references.ts).

const pdfPage = (url: string, page?: number) => (page && url ? `${url}#page=${page}` : url);

const SourceBody: React.FC<{ title: string; url: string; detail?: string; note?: string }> = ({ title, url, detail, note }) => (
  <>
    <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: colors.text3 }}>Lähde{detail ? ` · ${detail}` : ""}</span>
    <span style={{ display: "block", fontSize: 15, lineHeight: 1.4, marginTop: 4, color: colors.text }}>{title}</span>
    {note ? <span style={{ display: "block", fontSize: 13, lineHeight: 1.4, marginTop: 6, color: colors.text2 }}>{note}</span> : null}
    {url && !url.startsWith("#") ? (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 14, fontWeight: 500 }}>
        Avaa lähde <Icon name="link" size={14} />
      </a>
    ) : (
      <span style={{ display: "block", marginTop: 10, fontSize: 13, color: colors.text3 }}>Junction 2026 -haasteaineisto, ei julkista linkkiä</span>
    )}
  </>
);

/** Small ⓘ next to a number. */
export const SourceLink: React.FC<{ source: SourceKey; page?: number; note?: string; align?: "left" | "right" }> = ({ source, page, note, align }) => {
  const s = SOURCES[source];
  return (
    <Popover
      label={`Lähde: ${s.title}`}
      align={align}
      trigger={(open) => (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 11, color: open ? colors.primary : colors.text3, background: open ? colors.primaryContainer : "transparent", verticalAlign: "middle" }}>
          <Icon name="info" size={16} />
        </span>
      )}
    >
      <SourceBody title={s.title} url={pdfPage(s.url, page)} detail={page ? `s. ${page}` : undefined} note={note} />
    </Popover>
  );
};

/** Chip "Tiekartta 2.5.2" for a measure in the cancer strategy roadmap. */
export const MeasureLink: React.FC<{ id: (typeof ROADMAP_MEASURES)[number]["id"]; note?: string; align?: "left" | "right" }> = ({ id, note, align }) => {
  const m = ROADMAP_MEASURES.find((x) => x.id === id)!;
  return (
    <Popover
      label={`Tiekartan toimenpide ${id}`}
      width={420}
      align={align}
      trigger={(open) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 9, fontSize: 13, fontWeight: 500, background: open ? colors.primaryContainer : colors.bg, color: colors.onPrimaryContainer, boxShadow: `inset 0 0 0 1px ${colors.outlineVariant}`, whiteSpace: "nowrap" }}>
          <Icon name="book" size={14} />
          Tiekartta {id}
        </span>
      )}
    >
      <SourceBody title={`${m.id} ${m.title}`} url={pdfPage(SOURCES.roadmap.url, m.page)} detail={`syöpästrategian tiekartta 2026–2031, s. ${m.page}`} note={note} />
    </Popover>
  );
};

/** Labelled chip, e.g. "Käypä hoito" or "PubMed", that opens the source in a popover. */
export const SourceChip: React.FC<{ source: SourceKey; label: string; note?: string; muted?: boolean; align?: "left" | "right" }> = ({ source, label, note, muted, align }) => {
  const s = SOURCES[source];
  return (
    <Popover
      label={`Lähde: ${s.title}`}
      width={420}
      align={align}
      trigger={(open) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 9, fontSize: 13, fontWeight: 500, background: open ? colors.primaryContainer : colors.bg, color: muted ? colors.text3 : colors.onPrimaryContainer, boxShadow: `inset 0 0 0 1px ${colors.outlineVariant}`, whiteSpace: "nowrap" }}>
          <Icon name="book" size={14} />
          {label}
        </span>
      )}
    >
      <SourceBody title={s.title} url={s.url} note={note} />
    </Popover>
  );
};
