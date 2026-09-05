# Booklet-Reihenfolge-Rechner

Ein kleiner, eigenständiger Rechner (eine HTML-Datei, kein Backend), der aus einem Seitenbereich die **Blattreihenfolge für ein geheftetes Booklet** berechnet — also für Duplexdruck mit „2 Seiten pro Blatt“, gefalzt und in der Mitte geheftet.

**➡️ [Zum Rechner](rechner.html)**

## Was er kann

- **Seitenbereich statt Seitenzahl:** Man gibt „von Seite“ und „bis Seite“ des Booklet-Inhalts an (ohne Umschlag), so wie die Seiten im Quell-PDF nummeriert sind. Der Rechner rechnet mit den echten Dokumentseiten, nicht mit 1…n.
- **Automatische Leerseiten:** Ein Booklet geht nur in Vierergruppen auf. Fehlende Seiten bis zum nächsten Vielfachen von 4 werden als „leer“ ergänzt und im Ergebnis ausgewiesen — inklusive Hinweis, an welcher Stelle des Dokuments sie eingefügt werden müssen.
- **Kennzahlen auf einen Blick:** Booklet-Seiten, nötige Leerseiten, Blatt gesamt.
- **Blatt-Tabelle:** Pro Blatt die vier Positionen (Vorderseite links/rechts, Rückseite links/rechts) — gut zum Kontrollieren beim Falzen.
- **Wendekante umschaltbar:** *Lange Kante* (Standard für Hochformat) oder *kurze Kante*; bei kurzer Kante werden links/rechts auf der Rückseite getauscht.
- **Druckreihenfolge zum Kopieren:** Die flache Seitenfolge als eine Zeile, per Knopfdruck in der Zwischenablage — direkt in das Feld für den benutzerdefinierten Seitenbereich im Druckdialog.
- **Beispiel-PDF:** Verlinkt ist die Download-Seite des [Immunologie-Buchs von das-immunsystem.de](https://das-immunsystem.de/fuer-jedermann/immunologie-buch/download/) zum Ausprobieren.

## Dateien

- [`rechner.html`](rechner.html) — der komplette Rechner (HTML + CSS + Vanilla-JS, dunkles Theme).
