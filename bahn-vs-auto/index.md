# Bahn vs. Auto — Anfahrts-Rechner

Ein kleiner, eigenständiger Rechner (eine HTML-Datei, kein Backend), der prüft, ob sich eine Anfahrt eher mit der **Bahn** oder mit dem **Auto** rentiert.

**➡️ [Zum Rechner](rechner.html)**

## Was er kann

- **Berechnungen benennen, speichern und wechseln:** Ein Namensfeld plus „Speichern"/„Löschen" legt die komplette Eingabe unter diesem Namen im localStorage des Browsers ab; über eine Auswahlbox wechselt man zwischen gespeicherten Berechnungen („— neue Berechnung —" setzt auf die Standardwerte zurück). Der aktuelle Formularstand überlebt außerdem jeden Reload automatisch.
- **Kilometerpauschale (optional):** Per Checkbox zuschaltbares Feld (Standard 0,30 €/km). Wenn aktiv, wird die Pauschale als Erstattung (Arbeitgeber/Steuer) explizit vorgerechnet — in Ergebnistabelle, Rechenweg und Export steht dann „Fahrtkosten − Kilometerpauschale = Gesamtkosten".
- **Personenanzahl:** Bahntickets zählen pro Person, das Auto fährt für alle — bei 2+ Personen kippt der Vergleich oft. Der Faktor wird im Rechenweg ausgewiesen („17,50 € Ticket hin × 3 Personen …").
- **Teilen per Link:** „Link kopieren" packt die komplette Berechnung in die URL (Hash, base64) — der Empfänger sieht beim Öffnen sofort dieselben Zahlen, ganz ohne Server oder localStorage.
- **Hinfahrt** wird immer gerechnet, **Rückfahrt** ist per Häkchen zuschaltbar. Beim Aktivieren erscheinen die zusätzlichen Felder und werden — solange man sie nicht selbst ändert — automatisch aus den Hinfahrt-Werten vorbelegt.
- **Flexible Zeiteingaben:** `1h 50m`, `10min`, `1:30h`, `1,5h` oder einfach `90` (Minuten) werden alle verstanden; unter jedem Feld steht die geparste Dauer.
- **Bahn-Seite:** Fußwege vom/zum Bahnhof an Start und Ziel (Standard je 20 min), Unkosten für die Anfahrt zum Bahnhof (Standard 5 €), Fahrtdauer, erwartete Verspätung (Standard 30 min) und Ticketkosten — jeweils für Hin- und ggf. Rückfahrt.
- **Auto-Seite:** Fahrzeit als Min–Max-Spanne (gilt für Hin- wie Rückfahrt), Strecke in km, Benzinpreis pro Liter und Verschleißkosten pro km. Als Richtwert für einen ~10 Jahre alten Toyota Auris sind **0,10 €/km** Verschleiß (Wartung, Reparaturen, Reifen, Restwertverlust) und 6,5 l/100 km voreingestellt.
- **Ergebnis:** Vergleichstabelle (Zeitspanne inkl. Verspätungsrisiko, Gesamtkosten), ein Klartext-Urteil — bei Zielkonflikt inklusive „€ pro gesparter Stunde" — und ein aufklappbarer Rechenweg.
- **Copy'n'Paste:** Das Ergebnis lässt sich per Knopfdruck als Klartext oder als HTML (mit Tabelle) in die Zwischenablage kopieren, z. B. für Chats oder E-Mails.
- 💡 Eingebauter Hinweis: die Ankunft am jeweiligen Zieltag in [maps.google.com](https://maps.google.com) prüfen und die Bahn passend buchen.

## Dateien

- [`rechner.html`](rechner.html) — der komplette Rechner (HTML + CSS + Vanilla-JS, hell/dunkel je nach Systemeinstellung).
