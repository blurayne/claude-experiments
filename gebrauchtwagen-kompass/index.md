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
- **Motoren-Verbrauch (Auris · Corolla · Avensis):** umschaltbare
  Verbrauchskurven der Toyota-Triebwerke (1.8/2.0 Hybrid, 1.2 Turbo, 1.33/1.6/1.8
  Benziner, 1.4/1.6/2.0 D-4D Diesel) gegen den 1.8 Hybrid — Praxis-Richtwerte
  je Tempo.
- **Gesamtkosten (TCO):** Kaufpreis, Steuer, Wartung, Versicherung und
  Spritkosten über die geplante Haltedauer.
- **Bewertungs-Matrix:** Zuverlässigkeit, AB-Ruhe, Schlauf-/Schlaftauglichkeit
  und Laderaum als Punkte-Dots.
- **Karosserie-Silhouetten & Größenvergleich** maßstäblich, inkl. Lade- und
  Schlaflängen — die Silhouetten sind jetzt **modellspezifisch** (eigene
  Dachlinie/Proportionen je Auto statt generischer Karosserie-Schablone).
- **Direktvergleich (Head-to-Head):** zwei Fahrzeuge per Selectbox
  gegenüberstellen — kuratierte Duelle (z. B. Civic Tourer vs. Auris Hybrid,
  Octavia vs. Auris, A4 vs. Insignia) mit redaktionellem Fazit, für alle
  übrigen Paarungen ein datengetriebener Vergleich aus den Fahrzeugwerten.
- **Klartext-Notizen** je Fahrzeug: typische Schwachstellen, Forenstimmung,
  Außenparker-Tauglichkeit und „passt-zu-dir"-Einschätzung.

Alle €-Werte sind Marktrichtwerte (Stand Juni 2026, mobile.de / AutoScout24 /
ADAC). Sprit: Super E10 1,72 €/L, Diesel 1,65 €/L.

## Technik

Eigenständige HTML-Seite — **keine externen Abhängigkeiten**. React 18,
ReactDOM, PropTypes und [Recharts](https://recharts.org/) liegen lokal in
[`vendor/`](vendor/); das JSX ist zu reinem JavaScript vorkompiliert und inline
eingebettet (kein Babel im Browser). Die Seite läuft damit komplett offline.

## Dateien

- [`index.html`](index.html) — das interaktive Dashboard (standalone, CDN-frei).
- [`GebrauchtwagenKompass.jsx`](GebrauchtwagenKompass.jsx) — der React-Quellcode.
- [`vendor/`](vendor/) — gepinnte Libraries (React 18.3.1, ReactDOM 18.3.1, PropTypes 15.8.1, Recharts 2.15.4).
