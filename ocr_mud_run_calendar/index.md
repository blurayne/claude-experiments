# OCR- & Mud-Run-Kalender

Interaktiver Event-Kalender für Hindernisläufe (OCR), Matschläufe, Vereins-Crossläufe, reine Laufevents und offene OCR-Trainingsmöglichkeiten, erreichbar von zwei Ursprungsorten:

- **München** (PLZ 81373)
- **Lam im Bayerischen Wald** (PLZ 93462)

Enthalten sind die großen kommerziellen OCR-Serien (Spartan Race, XLETIX, Muddy Angel Run, Mud Masters, Getting Tough, Survival Race Kids, …) genauso wie kleine, familiäre „Dreckläufe“ von lokalen Vereinen (Rock the Race Würzburg, WertachXrun mit der Deutschen Meisterschaft im Hindernislauf, INN RUN Passau, …), reine Laufevents (Marathon München, Laufcup Cham, die Stadt- und Volksläufe im Korridor München–Lam von Erding über Landshut, Straubing und Deggendorf bis Regensburg, der U.Trail Lamer Winkel, …), wiederkehrende Läufe wie der Westpark parkrun sowie offene OCR-Trainingsgeländer (z. B. OCR Munich e.V.) – inklusive Kinder- und Familienläufen. Auch grenznahe Events in Österreich (Innsbruckathlon, Linzathlon, OCR Challenge Hohenems) und Tschechien (Gladiator Race, Predator Race, Army Run) sind erfasst.

## Dateien

- **[kalender.html](kalender.html)** – der interaktive Kalender:
  - Umschalter für den **Ursprungsort** (München oder Lam)
  - Slider für die **Reichweite** (25–400 km Luftlinie)
  - **Datumsfeld „Ab wann“** (Startdatum des Zeitfensters, vorbelegt mit heute)
  - Slider für den **Zeitraum** (wie viele Tage ab dem Startdatum, 2 Wochen bis ~18 Monate)
  - Haken **„vergangene Events anzeigen“**: Events ohne kommenden Termin im Fenster erscheinen ausgegraut mit ihrem letzten gelaufenen Termin („bereits gelaufen“); bei kommenden Events wird zusätzlich „zuletzt gelaufen“ eingeblendet. Die Datenbank enthält dafür die belegten Termine der letzten 2 Jahre (Juli 2024 – Juli 2026) je Event.
  - Slider für die **max. Startgebühr** (Kostenfilter; Events ohne Preisangabe bleiben sichtbar)
  - **Sortierung** wählbar: nächstes Event zuerst oder nach Entfernung
  - Filter nach **Art** (OCR-/Hindernisläufe / reine Laufevents / offenes Training) und nach Event-Typ (Großevents / kleine Vereins-Events / nur mit Kids-Lauf)
  - Wiederkehrende Termine (parkrun, Social Runs, offenes Training) mit Badge „wiederkehrend" – ihr nächstes Vorkommen wird automatisch berechnet; per Haken lassen sie sich auch komplett aus der Liste ausblenden
  - Alle Filtereinstellungen werden im **localStorage des Browsers** gespeichert und beim nächsten Besuch automatisch wiederhergestellt (außer dem Datumsfeld „Ab wann", das immer auf heute vorbelegt wird); ein Button „Einstellungen zurücksetzen" stellt die Standardwerte wieder her
  - pro Event: **Strecken als Chips**, Preisspanne (von–bis) und Kostenstaffelung nach Distanz/Buchungsphase
- **[events.js](events.js)** – die Event-Datenbank (Name, Ort, Koordinaten, Termine, Strecken, Kids-Angebot, Preisstaffelung, Website). Neue Events einfach als weiteres Objekt ergänzen.
- **[EVENTS.md](EVENTS.md)** – Archiv-/Nachschlagetabelle aller erfassten Events nach Art gruppiert (zum schnellen Finden ähnlicher Events, nicht die Live-Datenquelle).
- **[AGENTS.md](AGENTS.md)** – Rechercheansatz und genutzte Quellen (Aggregatoren wie mudradar.de, larasch.de, hdsports.org, spoferan.com, parkrun.com.de sowie die offiziellen Veranstalterseiten).

## Hinweise zu den Daten

- Entfernungen werden als **Luftlinie** per Haversine-Formel berechnet; die Fahrstrecke ist typischerweise 20–40 % länger.
- Termine, die noch nicht offiziell bestätigt sind, wurden aus den Vorjahren abgeleitet und sind im Kalender als **„Termin geschätzt“** markiert – vor einer Anmeldung immer die Event-Website prüfen.
- Datenstand: Juli 2026.
