# Bahn vs. Auto — Anfahrts-Rechner

Ein kleiner, eigenständiger Rechner (eine HTML-Datei, kein Backend), der prüft, ob sich eine Anfahrt eher mit der **Bahn** oder mit dem **Auto** rentiert.

**➡️ [Zum Rechner](rechner.html)**

## Was er kann

- **Berechnungen benennen, speichern und wechseln:** Ein Namensfeld plus „Speichern"/„Löschen" legt die komplette Eingabe unter diesem Namen im localStorage des Browsers ab; über eine Auswahlbox wechselt man zwischen gespeicherten Berechnungen („— neue Berechnung —" setzt auf die Standardwerte zurück). Der aktuelle Formularstand überlebt außerdem jeden Reload automatisch.
- **Kilometerpauschale (optional):** Per Checkbox zuschaltbares Feld (Standard 0,30 €/km). Wenn aktiv, wird die Pauschale als Erstattung (Arbeitgeber/Steuer) explizit vorgerechnet — in Ergebnistabelle, Rechenweg und Export steht dann „Fahrtkosten − Kilometerpauschale = Gesamtkosten".
- **Personenanzahl:** Bahntickets zählen pro Person, das Auto fährt für alle — bei 2+ Personen kippt der Vergleich oft. Der Faktor wird im Rechenweg ausgewiesen („17,50 € Ticket hin × 3 Personen …").
- **Teilen per Link / Parameter in der URL:** Alle Eingaben stehen platzsparend als Kurz-Parameter im URL-Hash (z. B. `#n=Ausflug&r=1&p=3&bh=1:30h&kh=17,50&km=120`) — nur Abweichungen vom Standard werden kodiert. Die URL wird beim Tippen und beim Speichern automatisch nachgeführt; „Link kopieren" legt genau diese Adresse in die Zwischenablage. Beim Öffnen einer solchen URL wird die Berechnung sofort wiederhergestellt (URL-Parameter haben Vorrang vor dem localStorage-Stand), ganz ohne Server. Ältere base64-Links (`#z=…`) bleiben lesbar.
- **Hinfahrt** wird immer gerechnet, **Rückfahrt** ist per Häkchen zuschaltbar. Beim Aktivieren erscheinen die zusätzlichen Felder und werden — solange man sie nicht selbst ändert — automatisch aus den Hinfahrt-Werten vorbelegt.
- **Flexible Zeiteingaben:** `1h 50m`, `10min`, `1:30h`, `1,5h` oder einfach `90` (Minuten) werden alle verstanden; unter jedem Feld steht die geparste Dauer.
- **Bahn-Seite:** Fußwege vom/zum Bahnhof an Start und Ziel (Standard je 20 min), Unkosten für die Anfahrt zum Bahnhof (Standard 5 €), Fahrtdauer, erwartete Verspätung (Standard 30 min) und Ticketkosten — jeweils für Hin- und ggf. Rückfahrt.
- **Auto-Seite:** Fahrzeit als Min–Max-Spanne (gilt für Hin- wie Rückfahrt), Strecke in km, Benzinpreis pro Liter und Verschleißkosten pro km. Als Richtwert für einen ~10 Jahre alten Toyota Auris sind **0,10 €/km** Verschleiß (Wartung, Reparaturen, Reifen, Restwertverlust) und 6,5 l/100 km voreingestellt.
- **Ergebnis:** Vergleichstabelle (Zeitspanne inkl. Verspätungsrisiko, Gesamtkosten), ein Klartext-Urteil — bei Zielkonflikt inklusive „€ pro gesparter Stunde" — und ein aufklappbarer Rechenweg.
- **Copy'n'Paste:** Das Ergebnis lässt sich per Knopfdruck als Klartext oder als HTML (mit Tabelle) in die Zwischenablage kopieren, z. B. für Chats oder E-Mails.
- 💡 Eingebauter Hinweis: die Ankunft am jeweiligen Zieltag in [maps.google.com](https://maps.google.com) prüfen und die Bahn passend buchen.

## Dateien

- [`rechner.html`](rechner.html) — der komplette Rechner (HTML + CSS + Vanilla-JS, hell/dunkel je nach Systemeinstellung).
