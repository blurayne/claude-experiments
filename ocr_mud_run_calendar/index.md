# OCR- & Mud-Run-Kalender

Interaktiver Event-Kalender für Hindernisläufe (OCR), Matschläufe und Vereins-Crossläufe, erreichbar von zwei Ursprungsorten:

- **München** (PLZ 81373)
- **Lam im Bayerischen Wald** (PLZ 93462)

Enthalten sind die großen kommerziellen Serien (Spartan Race, Mud Masters, Muddy Angel Run, …) genauso wie kleine, familiäre „Dreckläufe“ von lokalen Vereinen – inklusive Kinder- und Familienläufen.

## Dateien

- **[kalender.html](kalender.html)** – der interaktive Kalender:
  - Umschalter für den **Ursprungsort** (München oder Lam)
  - Slider für die **Reichweite** (25–400 km Luftlinie)
  - Slider für den **Zeitraum** (wie viele Tage im Voraus, 2 Wochen bis ~18 Monate)
  - Slider für die **max. Startgebühr** (Kostenfilter; Events ohne Preisangabe bleiben sichtbar)
  - **Sortierung** wählbar: nächstes Event zuerst oder nach Entfernung
  - Filter nach Event-Typ (Großevents / kleine Vereins-Events / nur mit Kids-Lauf)
  - pro Event: **Strecken als Chips**, Preisspanne (von–bis) und Kostenstaffelung nach Distanz/Buchungsphase
- **[events.js](events.js)** – die Event-Datenbank (Name, Ort, Koordinaten, Termine, Strecken, Kids-Angebot, Preisstaffelung, Website). Neue Events einfach als weiteres Objekt ergänzen.

## Hinweise zu den Daten

- Entfernungen werden als **Luftlinie** per Haversine-Formel berechnet; die Fahrstrecke ist typischerweise 20–40 % länger.
- Termine, die noch nicht offiziell bestätigt sind, wurden aus den Vorjahren abgeleitet und sind im Kalender als **„Termin geschätzt“** markiert – vor einer Anmeldung immer die Event-Website prüfen.
- Datenstand: Juli 2026.
