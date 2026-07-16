# Bahn vs. Auto — Anfahrts-Rechner

Ein kleiner, eigenständiger Rechner (eine HTML-Datei, kein Backend), der prüft, ob sich eine Anfahrt eher mit der **Bahn** oder mit dem **Auto** rentiert.

**➡️ [Zum Rechner](rechner.html)**

## Was er kann

- **Hinfahrt** wird immer gerechnet, **Rückfahrt** ist per Häkchen zuschaltbar. Beim Aktivieren erscheinen die zusätzlichen Felder und werden — solange man sie nicht selbst ändert — automatisch aus den Hinfahrt-Werten vorbelegt.
- **Flexible Zeiteingaben:** `1h 50m`, `10min`, `1:30h`, `1,5h` oder einfach `90` (Minuten) werden alle verstanden; unter jedem Feld steht die geparste Dauer.
- **Bahn-Seite:** Fußwege vom/zum Bahnhof an Start und Ziel (Standard je 20 min), Unkosten für die Anfahrt zum Bahnhof (Standard 5 €), Fahrtdauer, erwartete Verspätung (Standard 30 min) und Ticketkosten — jeweils für Hin- und ggf. Rückfahrt.
- **Auto-Seite:** Fahrzeit als Min–Max-Spanne (gilt für Hin- wie Rückfahrt), Strecke in km, Benzinpreis pro Liter und Verschleißkosten pro km. Als Richtwert für einen ~10 Jahre alten Toyota Auris sind **0,10 €/km** Verschleiß (Wartung, Reparaturen, Reifen, Restwertverlust) und 6,5 l/100 km voreingestellt.
- **Ergebnis:** Vergleichstabelle (Zeitspanne inkl. Verspätungsrisiko, Gesamtkosten), ein Klartext-Urteil — bei Zielkonflikt inklusive „€ pro gesparter Stunde" — und ein aufklappbarer Rechenweg.
- **Copy'n'Paste:** Das Ergebnis lässt sich per Knopfdruck als Klartext oder als HTML (mit Tabelle) in die Zwischenablage kopieren, z. B. für Chats oder E-Mails.
- 💡 Eingebauter Hinweis: die Ankunft am jeweiligen Zieltag in [maps.google.com](https://maps.google.com) prüfen und die Bahn passend buchen.

## Dateien

- [`rechner.html`](rechner.html) — der komplette Rechner (HTML + CSS + Vanilla-JS, hell/dunkel je nach Systemeinstellung).
