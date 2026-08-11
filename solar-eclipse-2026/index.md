# Sonnenfinsternis 12.08.2026 — Augenschutz & Ephemeriden

Zwei Dossiers rund um die partielle Sonnenfinsternis vom **12. August 2026** (Maximum in Lam / Bayerischer Wald um 20:14 MESZ, 87,4 % Bedeckung, Sonnenhöhe 1,8°): eines zur Frage, womit man sicher hinschaut, eines dazu, wann und wo überhaupt etwas zu sehen ist.

## Dossiers

### [Schweißglas & Augenschutz — Verifikationsdossier](2026-08-11_schweissglas-augenschutz_dossier.html)

Konsolidierter Stand (11.08.2026) zur Frage, ob und wie Schweißerschutzgläser — einzeln und **gestapelt** — für die direkte Sonnenbeobachtung taugen. Adversarial aufgebaut: vier Hypothesen mit dreistufigem Verdikt, Formeln gegen Labormesswerte verifiziert, Grenzwerte aus den Normtexten, Positionen der Fachgesellschaften und eine Faktenprüfung der Gegenbehauptungen. 18 Kapitel mit Inhaltsverzeichnis.

Die vier Hypothesen:

- **H1 — „DIN 5 + DIN 11 gestapelt ist für den direkten Sonnenblick sicher."** → belegt, mit einer ehrlichen Grenze (Stufe 15, τ = 1,0·10⁻⁶, innerhalb beider ISO-Fenster — aber nicht zertifiziert).
- **H2 — „Beim Stapeln addieren sich die Schutzstufen nicht."** → entkräftet (Beer–Lambert, N = N₁ + N₂ − 1, dreifach unabhängig bestätigt).
- **H3 — „60 Sekunden Test durch den Stapel waren eine Überdosis."** → entkräftet (60 s ≡ 60 µs ungefiltert, Sicherheitsabstand Faktor ~5·10⁵).
- **H4 — „Infrarot ist die Schwachstelle des Stapels."** → teilentkräftet, für diesen Fall unkritisch.

Inhalt im Einzelnen:

- **Transmissionsleiter** — selbstgezeichnetes SVG über neun Größenordnungen, von der nackten Sonne bis zum blinden Doppel-11-Stapel, mit dem ISO-Fenster 2015 und dem verengten Entwurf 2025.
- **Physik verifiziert** — EN-169-Stufenformel `N = 1 + (7/3)·log₁₀(1/τ)`, gegen die Labormessungen aus Chou et al. 2021 (AJ 162:103) geprüft, plus Gesamttabelle aller Stufen gegen beide ISO-Fassungen.
- **Interaktiver Stapelrechner** — zwei Slider für die Schutzstufen, mit Transmission, Leuchtdichte des Sonnenbildes und Normurteil (zu hell / im Fenster / normwidrig dunkel).
- **Positionslage** — DOG, BVA, BfS, AAS, NASA und die peer-reviewte Messstudie im Vergleich.
- **Fallbeispiel Hardware** — die tatsächlich vorhandenen Teile mit Herstellerangaben im Volltext (GSF/CFH-Schutzbrille Stufe 5, Zertifizierungsstelle ECS 1883, PSA-Kategorie II nach VO (EU) 2016/425): aus der Modellrechnung wird ein Beispiel mit belegten Eingangsgrößen.
- **Normenlandschaft** — EN 166 ist seit 11/2025 durch EN ISO 16321 abgelöst; warum die Vorzahl vor dem Bindestrich (—/2/4/5–6) über vier verschiedene Stufenskalen entscheidet und wo die realistische Verwechslung lauert.
- **Dosimetrie** — der 60-Sekunden-Fall durchgerechnet (Bunsen-Roscoe-Reziprozität), dazu die klinische Referenz der Leicester-Kohorte von der Finsternis 1999.
- **Spektralbilanz** — eigenes Spektralmodell (Planck 5778 K, Rayleigh, Aerosol, Ozon, Wasserdampf- und O₂/CO₂-Banden für Lam auf 576 m) und was bei Luftmasse 20,5 bandweise am Boden, hinter dem Filter und auf der Netzhaut ankommt.
- **Spektralvergleich** — modellierte Transmissionskurven von 280 bis 2000 nm für sechs Filter (Stapel, Einzelgläser, zertifizierte ISO-Brille, unterdichte Fälschung), an den Herstellerangaben der DIN-5-Scheibe verankert und über Beer-Lambert skaliert.
- **Betriebsplan** — die Sonne verliert zwischen 1. Kontakt und Maximum den Faktor ~50, ein Filter kann nicht beide Enden bedienen: Helligkeitstabelle über den Abend und der Wechsel von Stufe 15 auf Stufe 13, plus warum mehr Dunkelheit schadet.
- **Fallrecherche** — systematische Suche nach Retinopathie-Fällen durch Schweißfilter ≥ Stufe 12: null Treffer, samt epistemischer Einordnung, warum „null Fälle" kein Beweis ist.
- **Fälschungen 2026** — die Datenlage am Vortag: keine belastbare Quote, aber vier Datenpunkte (u. a. der UFC-Que-Choisir-Labortest vom 05.08.2026, in dem alle zehn geprüften Modelle optisch normgerecht filtern, mehrere aber bei Kennzeichnung und Konformitätsnachweis durchfallen).
- **Beschaffung** — Verkäuferprüfung auf Marktplätzen (Hersteller vs. Freezone-Zwischenhändler) und eine Prüfreihenfolge für jeden Brillenkauf.
- **Praxis** — Regelwerk für den Abend des 12.08. in Lam: Kontaktzeiten, Reihenfolge beim Auf- und Absetzen, Zimmerprobe, Kennzeichnungsprobe, Projektion für Kinder.
- **Belegtabelle & Restliste** — tragende Einzelbehauptungen mit Prüfstatus (A/B/C) und Erstquelle, dazu was ausdrücklich *nicht* geprüft wurde.

> Das Dossier ersetzt keine augenärztliche Untersuchung. Bei Sehstörungen: 116117, im Notfall 112.

### [Sonnenfinsternisse München & Lam, 1976–2126](2026-08-11_sonnenfinsternisse-muenchen-lam_1976-2126.html)

Eigene Ephemeriden-Rechnung über 150 Jahre: alle **59 Ereignisse**, die von beiden Orten aus tatsächlich über dem Horizont stattfinden — mit Bedeckungsgrad, gesetzlicher Ortszeit, Sonnenhöhe, Geländehorizont und der klimatologischen Wahrscheinlichkeit, dass keine Wolke dazwischensteht. Rechengrundlagen: JPL DE440s über Skyfield 1.55, ERA5 1976–2025 (an DWD kalibriert), Copernicus DEM 90 m, Gebäudedaten aus OpenStreetMap.

Die drei Hypothesen:

- **H1 — „In 150 Jahren gibt es mehrere totale Finsternisse über München."** → entkräftet: genau eine, am 11.08.1999. Die Totalitäten 2061 und 2090 finden unter dem Horizont statt. Für Lam: null.
- **H2 — „2081 wird München wieder total."** → teilbelegt, knapp verfehlt: 99,82 % Bedeckung am 03.09.2081, die Nordgrenze der Totalität verläuft rund 15 km südlich des Marienplatzes.
- **H3 — „Der Bedeckungsgrad entscheidet, ob sich Hinfahren lohnt."** → unvollständig: der Geländehorizont in Lam liegt zwischen 2,3° und 9,6°; am 12.08.2026 verschwindet die Sonne dort hinter dem Osser-Kamm, während München noch 87 % sieht.

Dazu:

- **Horizontprofil** — SVG-Panorama mit dem aus Höhendaten gerechneten Geländehorizont (inklusive Erdkrümmung und Refraktion), jede Finsternis als Punkt nach Azimut und Höhe, Punktfläche = Bedeckungsgrad; umschaltbar München / Lam.
- **Datentabelle** — alle Ereignisse mit Kontaktzeiten, Höhe, Azimut, Dauer, dem in Lam real sichtbaren Bedeckungsgrad und den Wetterwahrscheinlichkeiten; filterbar nach Zeitraum und Mindestbedeckung.
- **Sichtbarkeitsrechner für die Stadt** — ab welcher Sonnenhöhe man in München über die Häuserzeile gegenüber schaut: Slider für Geschosszahl und Straßenbreite, kalibriert an 11.314 OSM-Gebäuden in Sendling/Westend/Isarvorstadt (Median 4 Geschosse).
- **Wetterchance mit offengelegtem Fehlschlag** — der erste Ansatz (Direktstrahlung aus dem Open-Meteo-Archiv, WMO-Schwelle 120 W/m²) ergab 2.921 Sonnenstunden gegen 1.845 gemessene und wurde verworfen; stattdessen ERA5-Bewölkung, in eine Sichtbarkeitsfunktion überführt und monatsweise an die DWD-Messreihe angepasst (RMSE 0,023).
- **Belegtabelle, Restliste und Quellen** mit offengelegter Interessenlage.

Beide Dokumente haben einen Dark/Light-Umschalter und kommen ohne externe Skripte aus (nur die Schriften kommen von Google Fonts).
