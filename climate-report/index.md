# climate-report

Interaktives Klimatrend-Dashboard für München: Erwärmungstrend mit Extrapolation
bis 2036, Extremwerte (heißester Tag, kälteste Nacht, Hitzetage), Monats-Matrix
(Heatmap), Phänologie-Proxy sowie Niederschlag/Sonne/UV — alles aus real
gefetchten Datenquellen (LMU München-Maxvorstadt für Monatsmittel, DWD
München-Stadt #03379 für Extremwerte und Klimatologie).

Das Dashboard ist eine eigenständige HTML-Seite (React via CDN, kein
Build-Schritt nötig) mit Schiebereglern und SVG-Charts.

Dazu gehört ein zweiter, verlinkter Report: der **[Hitze-Report Bayern](hitze-report.html)**
(Hitzeglocke 2026, Temperaturprojektion bis 2100, Hitze-Sterblichkeit nach Alter). Beide
Seiten sind gegenseitig verlinkt — vom Dashboard über die „🔥 Hitze-Report"-Schaltfläche
oben rechts, vom Hitze-Report über den „↩ München Klimatrend"-Link oben.

## Dateien

- [`index.html`](index.html) — das interaktive Dashboard (standalone, React via CDN).
- [`hitze-report.html`](hitze-report.html) — Hitze-Report Bayern: Hitzeglocke, Projektion bis 2100 und Hitze-Sterblichkeit (standalone, SVG-Charts), verlinkt mit dem Dashboard.
- [`climate.jsx`](climate.jsx) — der React-Quellcode (identisch mit dem HTML-Inhalt ohne Wrapper).
- [`package.json`](package.json) / [`package-lock.json`](package-lock.json) — Dev-Dependencies (Babel) für die JSX-Quelle.
- [`CLAUDE.md`](CLAUDE.md) — Projektdokumentation (Datenquellen, Architektur, Kernergebnisse).
- [`uebergabe.md`](uebergabe.md) — Übergabedokument aus der Vorgängersession.
