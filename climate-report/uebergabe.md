# Übergabe: Interaktives Klimatrend-Dashboard München

Stand: 17.06.2026. Sprache: Deutsch. Zweck dieses Dokuments: nahtlos in einem anderen Chat/Kontext weiterarbeiten.

## 1. Ziel & aktueller Stand
Eigenständiges, interaktives Dashboard zum Klimatrend Münchens (Erwärmung, Extremwerte, Phänologie, Niederschlag/UV) mit Schiebereglern, Extrapolation bis 2036 (gestrichelt) und Datenquellen-Protokoll.

**Deliverables in `/mnt/user-data/outputs/`:**
- `muenchen-klimatrend.jsx` — **aktuellste** Fassung (React, self-contained). Enthält den neuen Extremwerte-Abschnitt. Stand 17.06.2026, 22:40 MESZ. Mit esbuild build-validiert.
- `muenchen-klimatrend.html` — ältere eigenständige HTML-Datei (Vanilla JS). **Noch ohne** Extremwerte-Abschnitt → bei Bedarf auf .jsx-Stand nachziehen.
- `/home/claude/data.json`, `/home/claude/app.js`, `/home/claude/template.html`, `/home/claude/build_klima.py` — Bausteine.

## 2. Datenquellen (alle real gefetcht)
- **Temperatur Monatsmittel München-Maxvorstadt 1982–2019**: P. James, LMU — `meteo.physik.uni-muenchen.de/~paul.james/munich_tables_tm.html`
- **2020–2025**: LMU „quicklooks" (gleiche Station, laufende Reihe)
- **Referenzmittel München-Stadt** (DWD/Stat. Amt München, °C): 1961–90 = 9,14 · 1971–2000 = 9,49 · 1981–2010 = 9,72 · 1991–2020 = 10,11
- **Niederschlag/Regentage/Sonne/T-Klimatologie München-Stadt** (DWD via wetterdienst.de, Basis 06/2021–05/2026):
  - precip(mm) = [50,43,38,46,99,118,106,138,89,54,77,68]
  - raindays = [14,13,11,12,14,13,20,16,13,13,18,16]
  - sun(h) = [95,107,180,200,241,291,243,245,200,137,84,65]
  - tmean = [1.9,4.6,7.0,10.1,14.9,19.8,20.1,19.7,15.7,11.6,5.3,2.9]
  - tmax = [5.2,8.4,12.3,15.3,20.4,25.8,25.6,25.3,21.1,16.6,8.7,5.6]
  - tmin = [-1.3,1.3,2.4,5.0,9.4,14.1,15.1,14.7,11.0,7.5,2.3,0.3]
- **UV-Index typisch** (BfS/STAR-Niveau, ~48° N, wolkenfreier Tageshöchst-UVI) = [1,2,3,5,6,7,7,6,5,3,1,1]
- **Jahres-Extreme Maxvorstadt 1982–2019** (P. James, Tabellen hx/ln/30):
  - Jahre = 1982…2019 (38 Werte)
  - heißester Tag (°C) = [30.8,36.4,35.7,31.8,31.0,30.3,34.1,33.1,31.4,32.4,34.1,31.0,33.9,34.4,30.9,28.3,33.8,32.7,32.9,31.9,32.7,37.3,30.9,33.6,35.2,35.7,33.8,35.3,34.3,35.6,35.6,37.7,34.6,37.6,35.4,36.5,36.1,35.0]
  - kälteste Nacht (°C) = [-14.4,-11.6,-10.2,-20.2,-15.4,-20.0,-8.6,-8.5,-10.8,-15.7,-10.6,-12.8,-9.6,-11.5,-15.9,-13.7,-10.4,-11.2,-14.4,-15.4,-11.4,-13.0,-10.2,-13.9,-13.4,-7.3,-7.5,-15.1,-10.2,-9.6,-15.0,-8.4,-10.9,-7.6,-8.2,-12.3,-13.5,-7.2]
  - Hitzetage ≥30 °C = [4,10,3,6,2,1,4,2,4,3,15,3,15,3,3,0,9,3,7,8,7,25,2,12,26,13,16,12,16,9,13,24,10,37,13,33,33,17]

(Monatsmittel 1982–2025 als 44×12-Array sind in `data.json` und in beiden Deliverables eingebettet.)

## 3. Berechnete Kernergebnisse (OLS aus den Daten)
- **Jahresmittel-Trend 1982–2025:** +0,67 °C/Dekade (R²=0,63); Fit 2025 ≈ 11,9 °C; **Extrapolation 2036 ≈ 12,6 °C**; Erwärmung 1982→2025 ≈ +2,9 °C.
- **Dekadenmittel (°C):** 9,32 (82–89) · 9,76 (90er) · 10,62 (00er) · 11,24 (10er) · 11,64 (20–25).
- **Monats-Trends (°C/Dek):** Jan +0,58 · Feb +1,06 · Mär +0,75 · Apr +0,87 · Mai +0,36 · Jun +1,17 · Jul +0,58 · Aug +0,65 · Sep +0,44 · Okt +0,51 · Nov +0,60 · Dez +0,44. (Stärkste Erwärmung: Jun, Feb, Apr.)
- **Phänologie-Proxy (therm. Saison, Schwelle 5 °C):** Frühlingsbeginn −6,8 T/Dek (früher), Herbstende +3,1 T/Dek (später), Saisonlänge +9,9 T/Dek.
- **Extremwerte-Extrapolation 2036:** heißester Tag ≈ **37,7 °C** (+1,11/Dek, R²=0,30) · kälteste Nacht ≈ **−8,1 °C** (+1,09/Dek, R²=0,14) · Hitzetage ≈ **32** (+5,93 d/Dek, R²=0,47). **Wichtig: niedrige R² → große Streuung, „Erwartung" statt Punktprognose.**
- **Rekorde Maxvorstadt:** heißester 37,7 °C (2013) · kälteste −20,2 °C (1985) · meiste Hitzetage 37 (2015).
- **Amtlicher Stadt-Rekord (München-Stadt):** 37,5 °C (27.07.1983) · −30,5 °C (22.01.1942).
- **2036 mittlere Tagesextreme (aus Klimatologie + Trend):** Sommer mittl. Tagesmax ~26–27 °C, Winter mittl. Tagesmin ~ −0,6 bis +1 °C.

## 4. Aufbau der `.jsx`
- React, `export default function App`, `useState`/`useEffect`.
- `const DATA` (Monatsmittel + Aux-Arrays), `const EXT` (Extremreihen), `const CSS` (dunkles „Observatorium"-Theme).
- **Imperatives SVG-Rendering** (`document.createElementNS`) wird über React-State in `useEffect` getriggert — Charts schreiben in Container-`id`s, Statwerte via `setTxt`.
- **State:** `startYear` (1982–2010), `threshold` (4–12 °C), `month` (1–12), `showExtrap`, `showCorridor`.
- **Effekte:** Mount → renderStripes/Decades/Heatmap/Extremes; `[startYear,showExtrap,showCorridor]` → renderTrend; `[threshold,showExtrap]` → renderPhenology; `[month]` → renderSeasonal.
- **Abschnitte:** 01 Erwärmungstrend & Extrapolation · 02 Extremwerte 2036 · 03 Monats-Matrix (Heatmap) · 04 Phänologie (Proxy) · 05 Niederschlag/Sonne/UV · 06 Datenquellen-Protokoll.
- **Render-Funktionen:** renderStripes, renderTrend, renderDecades, renderHeatmap, renderPhenology, renderSeasonal, renderExtTemp, renderExtDays, renderExtremes. **Helfer:** mean, ols, anomColor, E, frame, gridY, seasonFor, doyToDate, setTxt.
- **Design-Tokens:** bg #0d1520; warm #df6a2e / heiß #c11f2b / kühl #3a82c4 / grün #5fae7a; Fonts Space Grotesk + IBM Plex Mono (System-Fallback); Basisperiode für Anomalien = 1982–2010; Wärmestreifen-Hero.
- **Validierung:** `esbuild --bundle --external:react` ohne Fehler; alle referenzierten `id`s genau 1×.

## 5. Offen / nächster Schritt (Priorität)
**Phänologie (Abschnitt 04) ist noch Temperatur-Proxy → durch echte DWD-Beobachtung ersetzen.**
- **3 Leitarten:** Sommer-Linde (Leitart), Stiel-Eiche (Herbstsignal), Spitz-Ahorn (3. Reihe) — typische Großstadt-Straßenbäume.
- **Phasen:** „Beginn der Blattentfaltung" (Austrieb, Frühjahr) und „Eintritt der Blattverfärbung" / „Beginn des Blattfalls" (Herbst).
- **Datenquelle:** DWD CDC. `cdc.dwd.de`-Portal ist eine JS-App → **nicht direkt abrufbar**. Open-Data-Pfad: `opendata.dwd.de/.../phenology/...` Dateien `PH_Jahresmelder_*<Art>.txt`, sortiert nach `Stations_id`, `Referenzjahr`, `Phase_id`. Archiv ab 1951.
- **Workflow:** User exportiert CSV/TXT (gewählte München-Station + die zwei Phasen je Art) und lädt hoch → pro Jahr Austriebs-/Verfärbungstermin der nächstgelegenen Station berechnen, OLS-Trend + Extrapolation 2036, in Abschnitt 04 einbauen (statt/ergänzend zum Proxy), Quelle im Protokoll ergänzen.
- **Referenz-Trends (DWD):** Birke Blattentfaltung ~−3,7 T/Dek, Rosskastanie ~−4 T/Dek (früher); Blattverfärbung tendenziell später; Trends ab 1981 deutlicher. **Vorsicht:** Rosskastanie-Herbstverfärbung durch Kastanienminiermotte verfälscht (nur Frühjahr nutzen); Platane ist NICHT im DWD-Programm.

**Weitere offene Punkte:**
- `muenchen-klimatrend.html` (Vanilla) bei Bedarf auf .jsx-Stand bringen (Extremwerte-Abschnitt fehlt dort noch).
- Optional: Extremreihe um 2020–2025 verlängern (quicklooks), falls dort hx/ln/T≥30 verfügbar.

## 6. Tool-/Umgebungs-Einschränkungen (relevant für Wiederaufnahme)
- bash-Netz nur: github, pypi, npm, ubuntu, crates. `open-meteo` und `dwd.de` **nicht** direkt erreichbar.
- `web_fetch` nur auf URLs, die zuvor in Such-/Fetch-Ergebnissen erschienen sind.
- Daher: DWD-CDC-Daten müssen vom User exportiert und hochgeladen werden (dann via bash/Python verarbeitbar).
