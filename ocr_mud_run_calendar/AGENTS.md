# Quellen & Rechercheansatz

Dieses Dokument hält fest, wie die Event-Datenbank (`events.js`) recherchiert wurde und welche Quellen dabei verwendet wurden — als Referenz für spätere Aktualisierungen.

## Vorgehen

Die Daten wurden per Websuche zusammengetragen (keine automatisierte API-Abfrage), in mehreren thematisch getrennten Durchgängen:

1. Große kommerzielle OCR-/Mud-Run-Serien (Spartan, XLETIX, Muddy Angel Run, Braveheart Battle, Motorman Run, tschechische Serien: Gladiator Race, Predator Race)
2. Kleine, von Vereinen getragene Hindernis-/Matsch-/Crossläufe in Bayern
3. Preisstaffelungen (Startgebühr nach Distanz/Buchungsphase) für alle Events aus 1+2
4. Termine der letzten 2 Jahre (Juli 2024 – Juli 2026) für alle Events, um die Ansicht „vergangene Events anzeigen" zu befüllen
5. Survival Race Kids (deutschlandweite Kinder-Hindernislaufserie)
6. Reine Laufevents (kein Hindernislauf) rund um München und Lam/Bayerischer Wald, inkl. Laufcup Cham
7. Wiederkehrende Läufe (parkrun, Social Runs) und offene OCR-Trainingsmöglichkeiten

Jede Rechercheaufgabe wurde als eigenständiger Web-Recherche-Agent mit klar abgegrenztem Auftrag durchgeführt; die Ergebnisse wurden von Hand gegen die offiziellen Veranstalterseiten geprüft, bevor sie in `events.js` übernommen wurden. Termine ohne aktuelle offizielle Bestätigung sind in der Datenbank mit `estimated: true` markiert.

## Genutzte Quellentypen

**Übersichts-/Aggregatorseiten für Lauf- und OCR-Events** (hier lohnt sich ein Blick bei künftigen Updates zuerst):

- [larasch.de](https://www.larasch.de/) — bayerische/süddeutsche Lauf- und Cross-Termine, oft mit historischen Ergebnislisten
- [hdsports.org](https://www.hdsports.org/) — Laufkalender Ostbayern/Oberpfalz, u. a. Laufcup Cham, Crosslaufserien
- [spoferan.com](https://spoferan.com/) — Event-Anmeldeplattform mit Terminen für viele kleinere Läufe
- [mudradar.de](https://mudradar.de/) — Aggregator speziell für OCR-Events und OCR-Trainingsgeländer in Deutschland (Kategorie „OCR-Trainingslocation")
- [ocrbuddy](https://www.ocrbuddy.de/) bzw. vergleichbare OCR-Community-Seiten — Ankündigungen und Rückblicke zu Hindernisläufen
- [hindernislaufguru.de](https://hindernislaufguru.de/) — OCR-Blog mit Terminhistorie einzelner Läufe
- [my.raceresult.com](https://my.raceresult.com/) — Ergebnisdatenbank, liefert exakte Vergangenheitstermine vieler Läufe
- [parkrun.com.de](https://www.parkrun.com.de/) — offizielle Seite aller deutschen parkrun-Standorte samt Terminen

**Offizielle Veranstalter-/Serienseiten** (jeweils die Primärquelle für aktuelle/kommende Termine):

- Spartan: [de.spartan.com](https://de.spartan.com/), [spartan.com/en/race](https://www.spartan.com/)
- XLETIX: [xletix.com](https://www.xletix.com/)
- Muddy Angel Run: [muddyangelrun.com](https://www.muddyangelrun.com/)
- Braveheart Battle: [braveheartbattle.de](https://braveheartbattle.de/)
- Motorman Run: [motormanrun.de](https://motormanrun.de/)
- Gladiator Race: [gladiatorrace.cz](https://gladiatorrace.cz/)
- Predator Race: [predatorrace.cz](https://www.predatorrace.cz/)
- Survival Race (Kids): [survivalrace.de](https://survivalrace.de/)
- DragonRun Schnaittach: [fc-schnaittach.de/dragonrun](https://www.fc-schnaittach.de/dragonrun/)
- Rats-Runners Cup: [rats-runners.de](https://www.rats-runners.de/)
- Pettstädter Matschlauf: [kjr-bamberg-land.de](https://www.kjr-bamberg-land.de/veranstaltungen/sport/matschlauf)
- Minicrosslauf Pfeffenhausen: [minicrosslauf.de](https://www.minicrosslauf.de/)
- KidsCrossLauf München: [kidscrosslauf.de](https://www.kidscrosslauf.de/)
- RUNTERRA Race: [runterra.de](https://www.runterra.de/)
- The Muddy Älbler: [muddy-aelbler.de](https://muddy-aelbler.de/)
- Marathon München: [marathonmuenchen.org](https://marathonmuenchen.org/)
- SportScheck RUN München: [sportscheck.com/run-muenchen](https://www.sportscheck.com/run-muenchen.html)
- B2Run München: [b2run.de](https://www.b2run.de/)
- Wings for Life World Run: [wingsforlifeworldrun.com](https://www.wingsforlifeworldrun.com/)
- Tegernseelauf: [tegernseelauf.de](https://tegernseelauf.de/)
- Olympiaberg-Cross München: [olympiaberg-cross-muenchen.de](https://olympiaberg-cross-muenchen.de/)
- MRRC Silvesterlauf: [mrrc-muenchen.de](https://www.mrrc-muenchen.de/)
- Laufcup Cham (Lamer Woid-Reim, Gibacht-Berglauf, Bad Kötztinger Stadtlauf, Chamer Stadtlauf, Rötzer Schwarzwihrberglauf): [spvgg-lam-nordisch.de](https://spvgg-lam-nordisch.de/), [skiclub-furth.de](https://skiclub-furth.de/), [tvbadkoetzting-la.de](https://tvbadkoetzting-la.de/), [asv-cham.de](https://www.asv-cham.de/)
- ARBERLAND Ultra Trail: [woidlaeufer.de](https://www.woidlaeufer.de/)
- Regensburg Marathon: [regensburg-marathon.de](https://www.regensburg-marathon.de/)
- OCR Munich e.V.: [ocr-munich.de](https://www.ocr-munich.de/)
- SurvivalRunning Augsburg: [sr-augsburg.de](https://sr-augsburg.de/)
- Runtopia e.V.: [runtopia.jimdofree.com](https://runtopia.jimdofree.com/)
- adidas Runners Munich: [adidas.de/adidasrunners/community/munich](https://www.adidas.de/adidasrunners/community/munich)

**Lokalpresse/Vereinsberichte** wurden ergänzend herangezogen, wo Vereinsseiten keine harten Termine nannten (z. B. nordbayern.de, nn.de, fraenkischertag.de, marktspiegel.de, mainpost.de).

## Bekannte Lücken / Unsicherheiten

- Termine, die nur aus Vorjahresmustern abgeleitet wurden, tragen `estimated: true` und sollten vor einer Anmeldung gegen die Veranstalterseite geprüft werden.
- Für Tschechien (Region Lam) gibt es keinen parkrun-Standort; die nächstgelegenen parkruns liegen in München und Nürnberg.
- Manche Vereinsseiten (z. B. Buchental-Crosslauf, Arnstorfer Crosslauf) nennen keine öffentliche Preisliste — dort bleibt `priceMin`/`priceMax` bewusst `null` statt geraten.
- Koordinaten kleinerer Vereinsgelände (z. B. OCR-Trainingsgeländer) sind teils aus Adressangaben angenähert, nicht vermessen.

## Bei künftigen Updates

Für neue oder aktualisierte Events zuerst larasch.de, hdsports.org, spoferan.com und mudradar.de prüfen — dort sind die meisten bayerischen Lauf- und OCR-Termine gebündelt gelistet, bevor man einzelne Vereinsseiten abklappert.
