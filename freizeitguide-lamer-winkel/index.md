# Freizeit-Guide Lamer Winkel & Bad Kötzting

Interaktiver deutscher **Freizeit-Guide für Familien** rund um Lam und Bad
Kötzting im Bayerischen Wald — 97 Einträge (74 Einrichtungen + 23 Events)
aus Deutschland und Tschechien, ausgelegt auf ein Kind von etwa 7 Jahren.
Recherche-Stand 08.08.2026, Termine bis 15.01.2027 erfasst.

Die Seite ist eine einzelne, in sich geschlossene Datei:
[`index.html`](index.html).

## Worum geht's

Statt einer Linkliste bündelt der Guide jedes Ziel als eigene Karte mit
Entfernung, Fahrzeit, Preis, Öffnungszeiten, einer Einschätzung „taugt das
für ein 7-jähriges Kind?" und **allen** Belegquellen (206 Links). Entfernung
und Fahrzeit stammen aus einer OSRM-Routenberechnung auf OpenStreetMap-Daten
ab Marktplatz Lam bzw. Marktplatz Bad Kötzting — ohne Verkehr, Baustellen
und Parkplatzsuche, also Untergrenze.

Bedienelemente:

- **Startort-Umschalter** Lam ↔ Bad Kötzting — rechnet alle Entfernungen und
  Fahrzeiten neu.
- **Umkreis-Regler** in Fahrminuten oder Kilometern (bis 90).
- **Filter** für Typ (Einrichtung / Event), Land (DE / CZ), Kategorie
  (Bäder, Tiere, Action, Themenwege, Spielplätze …) und Favoriten.
- **Zeitfenster** für Termine, tagesgenau von „nur heute" über 1 bis 10 Tage
  bis hinauf zu zwei Jahren.
- **Sortierung** nach Entfernung oder Termin, ab frei wählbarem Datum.
- **Favoriten** per Stern, in `localStorage` gespeichert.
- **Nacht-/Tagmodus** über den Schalter oben rechts.

## Zwei Ansichten: Radar und Karte

- **◎ Radar** — selbstgezeichnetes SVG: Richtung = tatsächliche
  Himmelsrichtung ab dem gewählten Startort, Abstand = Fahrminuten oder
  Kilometer. Zoombar (zwei Finger) und verschiebbar (ein Finger),
  funktioniert ohne Netz.
- **🗺 Karte** — echte [Leaflet](https://leafletjs.com/)-Karte mit drei
  umschaltbaren OpenStreetMap-Ebenen (siehe unten), beschrifteten Markern
  und Popups, die das Ziel direkt in Google Maps oder OpenStreetMap öffnen.

Beide Ansichten lassen sich per **⛶ Vollbild** groß schalten (mit
Rückfall-Darstellung für iOS-Safari, das `requestFullscreen` auf Elementen
nicht kennt).

### Gebündelte Beschriftungen

11 Koordinaten tragen mehr als ein Ziel — das Fest am Ort der Einrichtung,
sieben Drachenstich-Termine auf demselben Festplatz in Furth im Wald.
Einzeln gezeichnet legen sich ihre Namen übereinander. Deshalb zeichnen
Radar und Karte **einen Punkt je Koordinate** und stapeln die Namen
darunter, eine Zeile je Ziel; ab fünf Zielen zählt die letzte Zeile den Rest
(„+3 weitere hier"). Der Punkt wächst mit der Zahl der Ziele, die auf ihm
liegen, und führt eine Einrichtung vor einem Event als Farbgeber an.

**Ein Klick auf eine Namenszeile scrollt zur ausführlichen Karteikarte**
und hebt sie kurz hervor — im Radar wie auf der Karte, aus dem Vollbild
heraus wird dieses zuerst beendet. Ein Klick auf den Punkt selbst öffnet
weiterhin das Popup, das alle Ziele dieser Koordinate mit Entfernung,
Fahrzeit und Links auflistet.

Das Bündeln greift nur bei *identischer* Koordinate. Ziele, die nur
nahe beieinander liegen, überlagern sich im Radar bei Zoomstufe 1 nach wie
vor — dafür ist der Zoomregler da.

## Kartenebenen (OpenStreetMap)

Die Ebenenauswahl sitzt oben rechts in der Karte und ist auf Displays ab
700 px **offen ausgeklappt**; auf schmalen Displays bleibt sie hinter dem
Ebenen-Symbol, damit sie die Karte nicht zudeckt.

| Ebene | Kachelserver | Eigene Kacheln bis |
| --- | --- | --- |
| Straßen & Orte | `tile.openstreetmap.org` (OSM Standard) | Zoom 19 |
| Kontrastreich | `tile-{a,b}.openstreetmap.fr/hot` (Humanitarian OSM Team) | Zoom 19 |
| Topografie | `{a,b,c}.tile.opentopomap.org` (OpenTopoMap, CC-BY-SA) | Zoom 17 |

Alle drei sind frei zugänglich und brauchen **keinen API-Schlüssel und keine
Anmeldung**. Zwei Details sorgen dafür, dass auch wirklich immer etwas zu
sehen ist:

- **`maxNativeZoom`** statt eines kleineren `maxZoom`: OpenTopoMap liefert
  nur bis Stufe 17 eigene Kacheln. Ohne diese Angabe würde die Karte auf
  Stufe 17 gedeckelt; so werden die Kacheln darüber hochskaliert und die
  Karte bleibt bis Stufe 19 zoombar.
- **Kachel-Wache**: HOT und OpenTopoMap sind Gemeinschaftsserver und
  zeitweise überlastet. Kommt nach mehreren Fehlversuchen keine einzige
  Kachel an, schaltet die Karte automatisch auf „Straßen & Orte" zurück und
  zeigt einen kurzen Hinweis, statt leer zu bleiben.

## Inhalt der Kapitel

0. Kurzfazit & Bedienung
1. Guide: Umkreis, Datum, Typ, Sortierung (Radar/Karte + Kartenraster)
2. Social-Media-Runde: was dort steht — und was davon hält
3. Vorgehen: Gemeinde für Gemeinde
4. Schwimmbäder & Badeseen im Direktvergleich
5. Was für diesen Report offen bleibt
6. Belegtabelle — Kernbehauptungen einzeln geprüft
7. Restliste — nicht Geprüftes, mit Grund
8. Quellenverzeichnis
9. Der Prompt, der genau diesen Report erzeugt

Jede Angabe trägt eine Evidenzstufe: **A** Erstquelle 2025/26 ·
**B** Portal/Verzeichnis/Kartendienst · **C** Blog, Rezension, ältere
Angabe · **D** ungeprüft.

## Datenpflege

Entfernt wurden zwei Event-Karten, die nur den Regelbetrieb ihrer
Einrichtung wiederholten — gleiche Wochentage, gleiche Uhrzeiten, gleiche
Preise, gleiche Quellen: „Führung Besucherbergwerk Fürstenzeche" (deckte
sich mit `fuerstenzeche`) und „Führung Further Felsengänge" (deckte sich
mit `felsengaenge`). Treffpunkt, Parkplatz und Saisonende stehen jetzt auf
der Karte der Einrichtung selbst, ebenso der zusätzliche Kalenderlink.

Einträge ohne eigene Koordinate übernehmen per `geo:"<id>"` den Punkt eines
anderen Eintrags. Das stimmt, solange der Termin am Ort der Einrichtung
stattfindet. In einigen Fällen stimmt es **nicht** — die Beschreibung nennt
dort selbst eine andere Adresse: `ev-rauhnacht` (Dorfanger Engelshütt),
`ev-sperlhammer` und `ev-schupfa` (Ortsteile von Bad Kötzting),
`ev-festschiessen` (Schießsportzentrum Eschlkamer Straße), `ev-flohmarkt`
(Lagerplatz Kötztinger Straße), `ev-volksfest` (Festwiese),
`ev-panduren`/`ev-country` (Stadtpark Waldmünchen). Vier weitere Einträge
haben von Natur aus keinen Punkt: `ev-woidwander`, `ev-perchten`,
`ev-christkindl` (vier Städte in einem Eintrag) und `sternenpark` (eine
ganze Region, sitzt auf dem Gebäude der Sternwarte Neuhütte).

Diese Koordinaten sind bewusst **nicht** geraten: jeder Eintrag trägt mit
`kl/kb`, `ml/mb` und `dl/db` geroutete Werte, die zu seiner Koordinate
gehören. Eine Koordinate zu ändern, ohne neu zu routen, würde genau die
Zahlen falsch machen, mit denen der Guide arbeitet.

## Abhängigkeiten

Zur Laufzeit aus dem CDN: [Leaflet 1.9.4](https://leafletjs.com/) (Karte)
und Google Fonts (Baloo 2, Comic Neue, Nunito, IBM Plex Mono). Ohne Netz
bleiben Liste und Radar voll benutzbar; die Karte zeigt dann einen Hinweis.
