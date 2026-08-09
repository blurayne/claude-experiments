# Rom an der Mosel — Trier-Guide 17.–23. August 2026

Interaktiver deutscher **Reise-Guide für Trier**, gebaut nach der Vorlage des
[Freizeit-Guides Lamer Winkel](../freizeitguide-lamer-winkel/), aber auf ein
Interesse zugespitzt: **Was muss man als Rom-Fan gesehen haben — und wo sollte
man gegessen haben?** 62 Einträge (48 Ziele + 14 Termine) aus Deutschland und
Luxemburg, 105 Belege, Recherche-Stand 09.08.2026, Reisewoche 17.–23.08.2026.

Die Seite ist eine einzelne, in sich geschlossene Datei:
[`index.html`](index.html). Daneben liegt das Rechenskript
[`build_geo.py`](build_geo.py), das die Entfernungen erzeugt.

## Worum geht's

Trier ist keine Stadt mit Römerresten, sondern eine römische Stadt mit einer
Stadt darauf. Der Guide bündelt jedes Ziel als eigene Karte mit Entfernung,
Anreisezeit, Preis, Öffnungszeiten, einer Zeile **„Für Rom-Fans ▸"** — warum
gerade dieses Ziel für dieses Interesse zählt — und allen Belegquellen.

Inhaltlich abgedeckt:

- **Alle neun Bauten des UNESCO-Welterbes**: Porta Nigra, Amphitheater,
  Kaiserthermen, Barbarathermen, Römerbrücke, Igeler Säule, Konstantin-Basilika,
  Dom St. Peter, Liebfrauenkirche.
- **Die römischen Bäder** — der ausdrückliche Schwerpunkt: drei Thermenanlagen
  im Stadtgebiet plus zwei Privatbäder im Umland (Villa Urbana Longuich als
  Ausgrabung, Villa Borg rekonstruiert mit funktionierender Hypokaustenheizung),
  in Kapitel 4 als Direktvergleich tabelliert.
- **Römisches Umland**: Gladiatorenmosaik Nennig, Villa Otrang, Villa Borg,
  Villa Echternach (LU), Villa Rustica Wittlich, Tempelbezirk Tawern,
  Kelteranlagen Piesport und Brauneberg, Ruwerwasserleitung, Qanat Pölich,
  Römerweinschiff Stella Noviomagi.
- **Wo man als Rom-Fan gegessen haben sollte**: „Zum Domstein" am Hauptmarkt
  (Küche nach Apicius, Römerkeller mit Pfeiler der konstantinischen
  Doppelkirche), die Taverne der Villa Borg (ebenfalls Apicius-Rezepte) und der
  um 330 n. Chr. gebaute älteste Weinkeller Deutschlands — dazu Weinstuben,
  Sternegastronomie und das Viezfest.
- **Museen, Stadt und Umland** für die Tage dazwischen, inklusive
  Schlechtwetter-Filter.

Dazu ein **Tagesplan für den 17.–23. August** in Kapitel 0, der die festen
Termine der Woche einsortiert und den Montag markiert, an dem Landesmuseum,
Simeonstift und Villa Borg geschlossen sind.

## Bedienelemente

- **Startort-Umschalter** Porta Nigra ↔ Hauptbahnhof — rechnet alle
  Entfernungen und Zeiten neu.
- **Umkreis-Regler**, umschaltbar zwischen **Anreiseminuten** und **Kilometern**
  (bis 90).
- **„🏛 Reisewoche 17.–23.08."** — setzt Datum *und* Zeitfenster in einem Klick;
  daneben „Heute" für den Normalbetrieb.
- **Zeitfenster** für Termine, tagesgenau von „nur heute" bis zwei Jahre.
- **Filter** für Typ (Ziel / Termin), Land (DE / LU) und Kategorie: 🏛 Rom-Pflicht,
  🏺 Römisch, ♨️ Bäder & Thermen, 🖼 Museum, 🍷 Wein, 🍽 Essen, 🏙 Stadt & Kirche,
  🌿 Natur & Aussicht, ☔ Schlechtwetter, 0 € Gratis, ⭐ Favoriten, 📱 Portal-Fund.
- **Sortierung** nach Entfernung oder Termin, ab frei wählbarem Datum.
- **Favoriten** per Stern, in `localStorage` gespeichert.
- **Nacht-/Tagmodus** über den Schalter oben rechts.

## Zwei Ansichten: Radar und Karte

- **◎ Radar** — selbstgezeichnetes SVG: Richtung = tatsächliche Himmelsrichtung
  ab dem gewählten Startort, Abstand = Anreiseminuten oder Kilometer. Zoombar
  (zwei Finger) und verschiebbar (ein Finger), funktioniert ohne Netz.
- **🗺 Karte** — [Leaflet](https://leafletjs.com/) mit drei umschaltbaren
  OpenStreetMap-Ebenen (Standard, Humanitarian/HOT, OpenTopoMap), beschrifteten
  Markern und Popups.

Beide Ansichten lassen sich per **⛶ Vollbild** groß schalten (mit
Rückfall-Darstellung für iOS-Safari). Ziele auf identischer Koordinate werden
gebündelt: ein Punkt, die Namen darunter gestapelt, jede Zeile springt zu ihrer
Karteikarte.

## Entfernungen: gerechnet, nicht geroutet

Anders als in der Vorlage stammen die Zahlen **nicht** aus einer
OSRM-Routenberechnung. In der Umgebung, in der dieser Guide entstanden ist,
waren OSRM, Valhalla und Nominatim per Netzwerkrichtlinie gesperrt (403 am
Egress-Proxy); auch der direkte Abruf einzelner Webseiten war blockiert, sodass
die Recherche vollständig über die Websuche lief.

Statt Fahrzeiten zu erfinden, rechnet [`build_geo.py`](build_geo.py) sie nach
einem offengelegten Modell:

| Schritt | Verfahren |
| --- | --- |
| Luftlinie | Haversine über die Koordinaten (exakt) |
| Wegstrecke | Luftlinie × Umwegfaktor **1,28** |
| Zeit zu Fuß | 4,7 km/h + 2 min, für Ziele bis 2,2 km Luftlinie |
| Zeit mit Auto | 32 / 50 / 62 / 72 km/h nach Entfernungsband + 4 min |
| Peilung | Anfangskurs (forward azimuth), für das Radar |

Ob ein Ziel als Fuß- oder Fahrziel gilt, entscheidet der Guide **je Ziel**, nicht
je Startpunkt — sonst stünde dasselbe Ziel je nach gewähltem Start einmal als
33-Minuten-Fußweg und einmal als 10-Minuten-Fahrt da, und der Umkreisregler
verglich Äpfel mit Birnen. Jede Karte zeigt die Art als 🚶 oder 🚗.

Die Koordinaten stammen aus Kartenkenntnis der Standorte, nicht aus einem
Geocoder. Deshalb zeigen die **Google-Maps-Links in den Kartenpopups auf die
Namenssuche** statt auf die reine Koordinate — ein Zahlendreher schickt damit
niemanden auf einen Feldweg. Der OpenStreetMap-Link nutzt weiterhin die
Koordinate.

## Inhalt der Kapitel

0. Kurzfazit, Bedienung und Sieben-Tage-Plan
1. Guide: Umkreis, Datum, Typ, Sortierung (Radar/Karte + Kartenraster)
2. Social-Media-Runde: was dort steht — und was davon hält
3. Vorgehen: Ort für Ort abgefragt (20 Gemeinden, tabelliert)
4. Römische Bäder im Direktvergleich — und der Rom-Fan-Teller
5. Was offen bleibt (7 ungelöste Punkte)
6. Belegtabelle — 33 Kernbehauptungen einzeln geprüft
7. Restliste — nicht Geprüftes, mit Grund
8. Quellenverzeichnis mit Evidenzgrad
9. Der Prompt, der genau diesen Report erzeugt

Jede Angabe trägt eine Evidenzstufe: **A** Erstquelle 2026 ·
**B** Portal/Verzeichnis/Kartendienst · **C** Blog, Rezension, ältere Angabe ·
**D** ungeprüft.

## Was in der Reisewoche tatsächlich läuft

Elf Termine fallen in den 17.–23.08.2026: die Zenturio-Erlebnisführung an der
Porta Nigra (Di/Sa/So), „Der Gladiator Valerius" im Amphitheater (Mi/Fr/Sa
18 Uhr), die Kellerführung der Vereinigten Hospitien (Mi/Fr 11 Uhr), das
Trierer Viezfest am Domfreihof (Sa 22.08., Eintritt frei), „Anatevka" Open-Air
auf dem Augustinerhof (Do–So), die St.-Rochus-Weinkirmes Nittel (21.–24.08.),
Sonntagsführungen in Tawern, Longuich und Wittlich, Fahrten des Römerweinschiffs
und der Wochenmarkt am Viehmarkt (Di/Fr).

Wichtig für die Planung: Die rheinland-pfälzischen Sommerferien enden vor dem
17. August. Damit entfallen die Ferien-Zusatztermine der Erlebnisführungen, und
der freie Eintritt für unter 18-Jährige (26.06.–09.08.2026) gilt nicht mehr.

## Der Prompt

Kapitel 9 enthält den vollständigen, wiederverwendbaren Prompt. Gegenüber der
Vorlage sind zwei Abschnitte neu:

- **Teil 0 — Themenanker**: macht das Interesse zum Filter (eigene
  „Pflicht"-Kategorie, thematische Begründung je Eintrag, thematisch gefilterte
  Gastronomie, Querverbindungen wie „römischer Weinbau an der Mosel").
- **Regel 10 — Notfallregel für gesperrte Dienste**: Ausfall benennen,
  Ersatz *rechnen* statt raten, Rechenskript mitliefern, Ersatzwerte als
  Rechnung kennzeichnen, Folgen abmildern.

## Abhängigkeiten

Zur Laufzeit aus dem CDN: [Leaflet 1.9.4](https://leafletjs.com/) (Karte) und
Google Fonts (Cinzel, EB Garamond, Nunito, IBM Plex Mono). Ohne Netz bleiben
Liste und Radar voll benutzbar; die Karte zeigt dann einen Hinweis.
