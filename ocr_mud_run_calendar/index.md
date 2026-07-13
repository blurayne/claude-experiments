# OCR- & Mud-Run-Kalender

Interaktiver Event-Kalender für Hindernisläufe (OCR), Matschläufe und Vereins-Crossläufe, erreichbar von zwei Ursprungsorten:

- **München** (PLZ 81373)
- **Lam im Bayerischen Wald** (PLZ 93462)

Enthalten sind die großen kommerziellen Serien (Spartan Race, Mud Masters, Muddy Angel Run, …) genauso wie kleine, familiäre „Dreckläufe“ von lokalen Vereinen – inklusive Kinder- und Familienläufen.

## Dateien

- **[kalender.html](kalender.html)** – der interaktive Kalender:
  - Umschalter für den **Ursprungsort** (München oder Lam)
  - Slider für die **Reichweite** (25–400 km Luftlinie)
  - **Datumsfeld „Ab wann“** (Startdatum des Zeitfensters, vorbelegt mit heute)
  - Slider für den **Zeitraum** (wie viele Tage ab dem Startdatum, 2 Wochen bis ~18 Monate)
  - Haken **„vergangene Events anzeigen“**: Events ohne kommenden Termin im Fenster erscheinen ausgegraut mit ihrem letzten gelaufenen Termin („bereits gelaufen“); bei kommenden Events wird zusätzlich „zuletzt gelaufen“ eingeblendet. Die Datenbank enthält dafür die belegten Termine der letzten 2 Jahre (Juli 2024 – Juli 2026) je Event.
  - Slider für die **max. Startgebühr** (Kostenfilter; Events ohne Preisangabe bleiben sichtbar)
  - **Sortierung** wählbar: nächstes Event zuerst oder nach Entfernung
  - Filter nach Event-Typ (Großevents / kleine Vereins-Events / nur mit Kids-Lauf)
  - pro Event: **Strecken als Chips**, Preisspanne (von–bis) und Kostenstaffelung nach Distanz/Buchungsphase
- **[events.js](events.js)** – die Event-Datenbank (Name, Ort, Koordinaten, Termine, Strecken, Kids-Angebot, Preisstaffelung, Website). Neue Events einfach als weiteres Objekt ergänzen.

## Hinweise zu den Daten

- Entfernungen werden als **Luftlinie** per Haversine-Formel berechnet; die Fahrstrecke ist typischerweise 20–40 % länger.
- Termine, die noch nicht offiziell bestätigt sind, wurden aus den Vorjahren abgeleitet und sind im Kalender als **„Termin geschätzt“** markiert – vor einer Anmeldung immer die Event-Website prüfen.
- Datenstand: Juli 2026.
