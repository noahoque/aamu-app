import React, { useState } from "react";
import { Dialog } from "../components/Dialog";
import { Badge, Chip, Icon } from "../components/ui";
import { INVITATIONS } from "../data/content";
import { patientById } from "../data/patients";
import { LANGUAGE_NAMES } from "../rules/equity";
import { fmtLong } from "../rules/dates";
import { missedScreenings } from "../rules/screening";
import { useAppState } from "../state";
import { colors } from "../theme";

// Missed-screening invitation, in Finnish and in the patient's own language.
export const ScreeningInviteDialog: React.FC<{ patientId: string; onClose: () => void }> = ({ patientId, onClose }) => {
  const { today, invited, invite } = useAppState();
  const p = patientById(patientId)!;
  const missed = missedScreenings(p, today)[0];
  const [sent, setSent] = useState(!!invited[patientId]);
  if (!missed) return null;

  const own = p.language !== "fi" ? INVITATIONS[p.language] : undefined;
  const versions = [INVITATIONS.fi, ...(own ? [own] : [])];
  const send = () => {
    invite(patientId, `${missed.programme}: ${versions.map((v) => v.lang).join(" + ")}`);
    setSent(true);
  };

  return (
    <Dialog onClose={onClose} label={`Seulontakutsu · ${p.name}`} width={880}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 48 }}>
        <Badge icon="lang" tone="equity" />
        <div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>Seulontakutsu · {p.name}</div>
          <div style={{ fontSize: 15, color: colors.text2, marginTop: 2 }}>
            {missed.programme} · {missed.missed}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${versions.length}, 1fr)`, gap: 14, marginTop: 22 }}>
        {versions.map((v) => (
          <div key={v.lang} style={{ borderRadius: 14, background: colors.container, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text3 }}>{v.lang}</div>
            <div style={{ fontSize: 16, lineHeight: 1.45, marginTop: 6 }}>{v.text}</div>
          </div>
        ))}
      </div>

      <div className="info" style={{ marginTop: 14 }}>
        <Icon name="info" size={16} />
        {p.language === "fi"
          ? "Kutsu lähetetään suomeksi."
          : own
            ? `Kutsu lähetetään suomeksi ja potilaan asiointikielellä (${LANGUAGE_NAMES[p.language]}). Demoteksti: käännös tarkistetaan ennen käyttöä.`
            : `Käännös kielelle ${LANGUAGE_NAMES[p.language]} puuttuu: kutsu lähetetään suomeksi.`}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 20 }}>
        {sent ? (
          <>
            <Chip tone="success" icon={<Icon name="check" size={16} />}>
              Kutsu lähetetty {fmtLong(invited[patientId] ?? today)}
            </Chip>
            <button className="btn" onClick={onClose}>
              Sulje
            </button>
          </>
        ) : (
          <>
            <button className="btn" onClick={onClose}>
              Peruuta
            </button>
            <button className="btn primary" onClick={send}>
              <Icon name="send" size={18} color="#fff" />
              {versions.length > 1 ? "Lähetä molemmilla kielillä" : "Lähetä kutsu"}
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
};
