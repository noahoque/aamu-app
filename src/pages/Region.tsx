import React from "react";
import { DataGap, Recommendations, Summary, WhereGap } from "./RegionInsights";

// County view for decision-makers: where the gap emerges (real data), what can't be measured yet,
// and what to do about it. Everything here is real, aggregate public data with sources.
export const RegionPage: React.FC = () => (
  <>
    <h1>Alue</h1>
    <div className="sub">Missä hoitopolun ero syntyy ja mitä sille tehdään · julkinen aggregaattiaineisto</div>
    <div style={{ marginTop: 22 }}>
      <Summary />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", gap: 24, marginTop: 24, alignItems: "start" }}>
      <WhereGap />
      <DataGap />
    </div>
    <div style={{ marginTop: 40 }}>
      <Recommendations />
    </div>
  </>
);
