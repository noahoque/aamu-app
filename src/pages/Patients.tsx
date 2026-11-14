import React from "react";
import { useNavigate } from "react-router";
import { Chip } from "../components/ui";
import { PATIENTS } from "../data/patients";
import { LANGUAGE_NAMES } from "../rules/equity";
import { STATUS_LABEL, useAppState } from "../state";
import { colors } from "../theme";

const CARE: Record<string, string> = { public: "Vain julkinen", occupational: "Työterveys", private: "Yksityinen", mixed: "Julkinen ja yksityinen" };
const COLS = "190px 90px 140px 200px 110px minmax(0, 1fr)";

export const PatientsPage: React.FC = () => {
  const { rows } = useAppState();
  const navigate = useNavigate();
  return (
    <>
      <h1>Potilaat</h1>
      <div className="sub">Kaikki esimerkkipotilaat, myös ne joista ei ole hälytystä · synteettinen data</div>
      <div style={{ marginTop: 24 }}>
        <div style={{ height: 44, display: "grid", gridTemplateColumns: COLS, gap: 20, alignItems: "center", padding: "0 12px", borderBottom: `1px solid ${colors.outlineVariant}`, fontSize: 14, fontWeight: 500, color: colors.text2 }}>
          <span>Potilas</span>
          <span>Ikä</span>
          <span>Asiointikieli</span>
          <span>Hoito</span>
          <span>Etäisyys</span>
          <span>Hälytys</span>
        </div>
        {PATIENTS.map((p) => {
          const row = rows.find((r) => r.id === p.id);
          return (
            <div
              key={p.id}
              className="row"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/potilas/${p.id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/potilas/${p.id}`)}
              style={{ height: 60, display: "grid", gridTemplateColumns: COLS, gap: 20, alignItems: "center", padding: "0 12px", cursor: "pointer", boxShadow: `inset 0 -1px 0 ${colors.outlineVariant}`, fontSize: 16, color: colors.text2 }}
            >
              <span style={{ fontSize: 18, fontWeight: 500, color: colors.text }}>{p.name}</span>
              <span className="num">
                {p.sex} {p.age}
              </span>
              <span>{LANGUAGE_NAMES[p.language]}</span>
              <span>{CARE[p.careType]}</span>
              <span className="num">{p.distanceKm} km</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {row ? (
                  <>
                    <Chip tone={STATUS_LABEL[row.status].tone} size={13}>
                      {STATUS_LABEL[row.status].label}
                    </Chip>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.pathway}</span>
                  </>
                ) : (
                  <span style={{ color: colors.text3 }}>Ei hälytystä</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};
