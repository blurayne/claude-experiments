# Gebrauchtwagen-Kompass

Ein interaktives Entscheidungs-Dashboard für die Gebrauchtwagen-Suche — gebaut
als eigenständige Seite im Look eines Marine-/Instrumenten-Kompasses (dunkles
Cockpit-Theme).

## Worum geht's

Das Tool stellt eine Handvoll konkreter Gebrauchtwagen-Kandidaten gegenüber und
hilft, sie entlang eines realen Nutzungsprofils zu vergleichen:

- **Profil:** ~6.000 km/Jahr (≈500 km/Monat), Stadt + Autobahn, Kurzausflüge,
  Außenparker (keine Garage), Budget ≤ 14.000 €.
- **Prioritäten:** ruhiges Fahrwerk auf der Autobahn, Schlafoption, maximale
  Zuverlässigkeit, viel Auto fürs Geld.

## Was das Dashboard zeigt

- **Verbrauchskurven** je Tempo (Stadt · 120 · 140 · 160 · 175 km/h) auf Basis
  von ADAC-EcoTest-, Test- und Forenwerten (Hochgeschwindigkeitspunkte teils
  physikalisch interpoliert und als Schätzung gekennzeichnet).
- **Gesamtkosten (TCO):** Kaufpreis, Steuer, Wartung, Versicherung und
  Spritkosten über die geplante Haltedauer.
- **Bewertungs-Matrix:** Zuverlässigkeit, AB-Ruhe, Schlauf-/Schlaftauglichkeit
  und Laderaum als Punkte-Dots.
- **Karosserie-Silhouetten & Größenvergleich** maßstäblich, inkl. Lade- und
  Schlaflängen.
- **Klartext-Notizen** je Fahrzeug: typische Schwachstellen, Forenstimmung,
  Außenparker-Tauglichkeit und „passt-zu-dir"-Einschätzung.

Alle €-Werte sind Marktrichtwerte (Stand Juni 2026, mobile.de / AutoScout24 /
ADAC). Sprit: Super E10 1,72 €/L, Diesel 1,65 €/L.

## Technik

Eigenständige HTML-Seite — kein Build nötig. React 18 + [Recharts](https://recharts.org/)
werden per CDN geladen, JSX wird über Babel Standalone im Browser transpiliert.

## Dateien

- [`index.html`](index.html) — das interaktive Dashboard (standalone).
- [`GebrauchtwagenKompass.jsx`](GebrauchtwagenKompass.jsx) — der React-Quellcode.
