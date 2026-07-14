# Ferienprogramm-Feuer-Kinder

Interaktiver **Ferien-Kompass** (deutsch) für die Sommerferien 2026 in Bayern
(3. August – 14. September) — ein filterbarer Katalog von Kursen, Camps und
offenen Angeboten für Kinder, umschaltbar zwischen zwei Standorten:
**München-Sendling** (PLZ 81373) und **Lam im Bayerischen Wald** (PLZ 93462).

## Worum geht's

Statt einer langen Linkliste bündelt die Seite über 175 konkrete Angebote
(162 in München, 14 in Lam) aus mehreren Anbietern in einzelnen Karten und
lässt sie nach den Kriterien filtern, die bei der Ferienplanung wirklich
zählen:

- **Standort-Umschalter** oben im Header: München (81373) ↔ Lam (93462) —
  wechselt Titel, Angebote, Kategorien und Quellenliste.
- **Entfernungs-Regler** (2–100 km, „alle" am rechten Anschlag): jede Karte
  zeigt die per Luftlinie berechnete Entfernung vom jeweiligen Standort
  (Sendling bzw. Lam) an. Für München reicht das Netz inzwischen bis zu
  100 km ins Umland — von Fürstenfeldbruck, Dachau, Starnberg/Ammersee,
  Erding, Freising und Ebersberg im Nahbereich bis raus nach Augsburg,
  Garmisch-Partenkirchen, Bad Tölz, Rosenheim/Chiemsee, Wasserburg/
  Mühldorf, Burghausen, Ingolstadt und Landshut im äußeren Ring.
- **Ferienwoche** (W1–W6, antippbar im Wochenraster oben) — zeigt live, wie
  viele Angebote pro Woche verfügbar sind.
- **Aktivität**: Robotik & Maker, Tanz, Sport & Bewegung, Kreativ & Kultur,
  Draußen & Natur, Forschen & Wissenschaft, Wasser & Baden, Tiere &
  Bauernhof, Sprachen & International — pro Standort werden nur Kategorien
  mit tatsächlichen Treffern angezeigt.
- **gratis / unter 60 €** und **nur freie Plätze** (blendet ausgebuchte
  Kurse/Wartelisten aus).
- **Alter** (Jahre) und **Volltextsuche** (z. B. „Roboter", „Skate", „Tanz").

Jede Karte zeigt Anbieter, Ort, Zielalter, betroffene Wochen, Preis, Status
(gratis/ausgebucht) und einen Direktlink zur Buchung. Ausgewählte Angebote
landen in einer **Merkliste** (unten sticky), die sich leeren, als Text
kopieren oder direkt drucken lässt (Druckansicht zeigt nur die gemerkten
Karten).

## Darstellung

Automatischer **Hell-/Dunkelmodus** (folgt der Systemeinstellung) mit
manuellem Umschalt-Button (Sonne/Mond-Icon oben rechts im Header); die Wahl
wird im Browser gemerkt.

## Quellen

Am Fuß der Seite steht eine kuratierte, standortabhängige Liste der
Kalender/Portale, aus denen die Angebote stammen. Für München u. a. HIMBEER
München mit Kind, Feierwerk-Ferienprogramm, der städtische Ferienpass,
FreizeitSport München, Musenkuss München, Kindaling, der Kreisjugendring
und das Deutsche Museum. Für Lam/Bayerischer Wald u. a. der Ferienkalender
des Landkreises Cham, der Kreisjugendring Cham, die Tourismusregion Lamer
Winkel und der Nationalpark Bayerischer Wald. Recherchestand: 14.07.2026 —
Preise, Termine und Restplätze ändern sich täglich, vor jeder Buchung
direkt beim Anbieter prüfen.

## Technik

Eigenständige HTML-Seite — **keine externen Abhängigkeiten** außer den
Google-Fonts-Links (Space Grotesk / IBM Plex Mono). Reines HTML/CSS/JS,
kein Build-Schritt, Filterlogik, Standort- und Theme-Umschaltung laufen
komplett im Browser.

## Dateien

- [`index.html`](index.html) — der interaktive Ferien-Kompass (standalone).
