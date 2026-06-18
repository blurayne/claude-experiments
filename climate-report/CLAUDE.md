# München Klimatrend — Projektdokumentation

## Projekt-Übersicht

Eigenständiges, interaktives Klimadashboard für München (Erwärmung, Extremwerte, Phänologie, Niederschlag/UV) mit Schiebereglern und Extrapolation bis 2036. Ausgabe: `climate.html` (standalone, kein Build-Schritt nötig).

**Deliverables:**
- `climate.html` — aktuelle Fassung, standalone HTML (React via CDN + Babel in-browser)
- `climate.jsx` — Quellcode (React JSX, identisch mit HTML-Inhalt ohne Wrapper)
- `climate.md` — Übergabedokument (Kontextinformation aus Vorgängersession)

---

## Datenquellen (vollständig)

### Temperatur-Monatsmittel (Primärreihe, Abschnitt 01/03/04)
| Quelle | Zeitraum | Station | Typ |
|--------|----------|---------|-----|
| P. James, LMU München — Klimatabellen München-Maxvorstadt | 1982–2019 | Maxvorstadt | Messung |
| LMU München „quicklooks" (gleiche Station) | 2020–2025 | Maxvorstadt | Messung |

URL: `meteo.physik.uni-muenchen.de/~paul.james/munich_tables_tm.html`

**Hinweis:** LMU Maxvorstadt ist ~0,6 °C wärmer als DWD München-Stadt (urbaner Wärmeinseleffekt). Die Reihe ist intern konsistent für 1982–2025.

### DWD Referenzmittel (30-Jahres-Normen, Horizontlinien in Abschnitt 01)
| Periode | Jahresmittel |
|---------|-------------|
| 1961–90 | 9,14 °C |
| 1971–2000 | 9,49 °C |
| 1981–2010 | 9,72 °Cx |
| 1991–2020 | 10,11 °C |

Quelle: DWD via Statistisches Amt München — Station München-Stadt

### Extremwerte (Abschnitt 02) — DWD Open Data
- **Quelle:** DWD CDC Open Data — Station München-Stadt **03379**
- **Pfad:** `opendata.dwd.de/climate_environment/CDC/observations_germany/climate/daily/kl/`
  - Historisch: `tageswerte_KL_03379_19540601_20251231_hist.zip`
  - Aktuell: `tageswerte_KL_03379_akt.zip` (bis 2026-06-16)
- **Verarbeitung:** TXK (Tagesmax.) → Jahresmax. = heißester Tag; TNK (Tagesmin.) → Jahresmin. = kälteste Nacht; Tage mit TXK ≥ 30 °C = Hitzetage
- **Zeitraum:** 1982–2025 (44 vollständige Jahre)
- **Datei:** `/tmp/dwd/daily_hist/` und `/tmp/dwd/daily_akt/`

**Aktuelle Rekorde (DWD München-Stadt):**
- Heißester Tag: 37,5 °C (27.07.1983)
- Kälteste Nacht: −22,2 °C (1987)
- Meiste Hitzetage: **38 (2025 — neuer Rekord!)**
- Amtlicher Gesamtrekord kalt: −30,5 °C (22.01.1942)

### Monatliche Klimatologie (Abschnitt 05) — DWD Open Data
- **Quelle:** DWD CDC — Station München-Stadt **03379**
- **Pfad:** `opendata.dwd.de/climate_environment/CDC/observations_germany/climate/monthly/kl/`
  - `monatswerte_KL_03379_19540601_20251231_hist.zip`
  - `monatswerte_KL_03379_akt.zip`
- **Basis:** 06/2021–05/2026 (5 vollständige Jahre)
- **Bestätigt:** Niederschlag, Sonnenstunden aus dem Dashboard stimmen mit DWD-Daten überein

### UV-Index (Abschnitt 05)
- **Quelle:** BfS/UV-Messnetz (STAR), typischer wolkenfreier Tageshöchst-UVI ~48° N
- Keine Jahreszeitreihe — statischer Jahresgang

---

## Phänologie (Abschnitt 04) — Offener Punkt

**Aktueller Stand:** Temperaturbasierter Proxy (Schwellen-Interpolation aus Monatsmitteln)

**Geplante Erweiterung — echte DWD-Phänologiedaten:**
- **Datenquelle:** DWD CDC Open Data
  - `opendata.dwd.de/climate_environment/CDC/observations_germany/phenology/annual_reporters/wild/`
  - Historisch (vollständig, aber groß): `PH_Jahresmelder_Wildwachsende_Pflanze_Sommer-Linde_1925_2024_hist.txt` (~44 MB)
  - Aktuell (2023–2026): `PH_Jahresmelder_Wildwachsende_Pflanze_Sommer-Linde_akt.txt`
- **Zielarten & Phasen:**
  - Sommer-Linde (`Objekt_id=130`), Phase 4 = Blattentfaltung Beginn
  - Stiel-Eiche (`Objekt_id=132`), Phase 4 = Blattentfaltung, Phase 31 = herbstliche Blattverfärbung
  - Spitz-Ahorn (`Objekt_id=131`), Phase 5 = Blüte Beginn
- **Workflow:** Großdatei herunterladen → Bayern-Stationen in München-Nähe filtern → OLS-Trend → Abschnitt 04 ersetzen
- **Vorsicht:** Rosskastanie-Herbst durch Miniermotte verfälscht; Platane nicht im DWD-Programm

---

## Architektur (climate.jsx / climate.html)

```
DATA        — Monatsmittel LMU 1982–2025, Klimatologie DWD
EXT         — Jahresextreme DWD München-Stadt 1982–2025
CSS         — Dark-Theme Styles (inline)
App()       — React-Komponente, 5 State-Variablen
renderXxx() — Imperative SVG-Funktionen (document.createElementNS)
```

**Abschnitte:**
1. Erwärmungstrend & Extrapolation (OLS, Wärmestreifen, Dekaden)
2. Extremwerte 2036 (heißester Tag, kälteste Nacht, Hitzetage)
3. Monats-Heatmap (44 × 12 Anomalie-Matrix)
4. Phänologie-Proxy (thermische Saison, Schwellen-Interpolation)
5. Niederschlag / Sonne / UV (Jahresgang)
6. Datenquellen-Protokoll

---

## Deployment

`climate.html` ist vollständig standalone:
```
Öffnen mit Browser → funktioniert ohne Server/Build
CDN-Abhängigkeiten: React 18, ReactDOM 18, Babel Standalone (unpkg.com)
```

---

## DWD Open Data — URL-Struktur (Referenz)

```
https://opendata.dwd.de/climate_environment/CDC/
  observations_germany/
    climate/
      daily/kl/historical/   ← Tageswerte historisch
      daily/kl/recent/       ← Tageswerte aktuell
      monthly/kl/historical/ ← Monatswerte historisch
      monthly/kl/recent/     ← Monatswerte aktuell
    phenology/
      annual_reporters/wild/historical/  ← Jahresmelder historisch
      annual_reporters/wild/recent/      ← Jahresmelder aktuell

Stationsliste: KL_Monatswerte_Beschreibung_Stationen.txt
München-Stadt Station-ID: 03379 (48.1632°N, 11.5429°E, 515m, aktiv seit 1954)
```

---

## Berechnete Kernergebnisse (Stand 18.06.2026)

- **Jahresmittel-Trend 1982–2025:** ~+0,67 °C/Dekade (R²≈0,63); Fit 2025 ≈ 11,9 °C; Extrapolation 2036 ≈ 12,6 °C
- **Extremwert-Trends DWD 1982–2025:** heißester Tag ~+0,7 °C/Dek; kälteste Nacht ~+1,0 °C/Dek; Hitzetage ~+5–6 d/Dek
- **2025 neuer Hitzetage-Rekord:** 38 Tage (DWD München-Stadt)
- **DWD vs LMU Monatsmittel:** DWD ist systematisch ~0,6 °C kühler (Stadtstation vs Maxvorstadt-Mikroklima)
