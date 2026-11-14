import "@fontsource/google-sans/latin-400.css";
import "@fontsource/google-sans/latin-500.css";
import "@fontsource/google-sans/latin-ext-400.css";
import "@fontsource/google-sans/latin-ext-500.css";
import "@fontsource/google-sans/cyrillic-400.css";
import "@fontsource/google-sans/cyrillic-500.css";
import "./styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "./components/AppShell";
import { PatientPage } from "./pages/Patient";
import { PatientsPage } from "./pages/Patients";
import { RegionPage } from "./pages/Region";
import { SourcesPage } from "./pages/Sources";
import { TrackingPage } from "./pages/Tracking";
import { WorklistPage } from "./pages/Worklist";
import { AppStateProvider } from "./state";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<WorklistPage />} />
            <Route path="/seuranta" element={<TrackingPage />} />
            <Route path="/potilaat" element={<PatientsPage />} />
            <Route path="/potilas/:id" element={<PatientPage />} />
            <Route path="/alue" element={<RegionPage />} />
            <Route path="/lahteet" element={<SourcesPage />} />
            <Route path="*" element={<WorklistPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>,
);
