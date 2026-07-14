# Ferienprogramm-Feuer-Kinder

Interaktiver **Ferien-Kompass** (deutsch) für die Sommerferien 2026 in Bayern
(3. August – 14. September) — ein filterbarer Katalog von Kursen, Camps und
offenen Angeboten für Kinder im Umkreis von München-Sendling (PLZ 81373).

## Worum geht's

Statt einer langen Linkliste bündelt die Seite ~50 konkrete Angebote aus
mehreren Münchner Anbietern in einzelnen Karten und lässt sie nach den
Kriterien filtern, die bei der Ferienplanung wirklich zählen:

- **Ferienwoche** (W1–W6, antippbar im Wochenraster oben) — zeigt live, wie
  viele Angebote pro Woche verfügbar sind.
- **Aktivität**: Robotik & Maker, Tanz, Sport & Bewegung, Kreativ & Kultur,
  Draußen & Natur.
- **Sendling-nah**, **gratis / unter 60 €** und **nur freie Plätze**
  (blendet ausgebuchte Kurse/Wartelisten aus).
- **Alter** (Jahre) und **Volltextsuche** (z. B. „Roboter", „Skate", „Tanz").

Jede Karte zeigt Anbieter, Ort, Zielalter, betroffene Wochen, Preis, Status
(gratis/ausgebucht) und einen Direktlink zur Buchung. Ausgewählte Angebote
landen in einer **Merkliste** (unten sticky), die sich leeren, als Text
kopieren oder direkt drucken lässt (Druckansicht zeigt nur die gemerkten
Karten).

## Quellen

Am Fuß der Seite steht eine kuratierte Liste der Kalender/Portale, aus denen
die Angebote stammen und die laufend aktuell gehalten werden (u. a. HIMBEER
München mit Kind, Feierwerk-Ferienprogramm, der städtische Ferienpass,
FreizeitSport München, Musenkuss München, Kindaling und der
Kreisjugendring). Recherchestand: 14.07.2026 — Preise, Termine und
Restplätze ändern sich täglich, vor jeder Buchung direkt beim Anbieter
prüfen.

## Technik

Eigenständige HTML-Seite — **keine externen Abhängigkeiten** außer den
Google-Fonts-Links (Space Grotesk / IBM Plex Mono). Reines HTML/CSS/JS,
kein Build-Schritt, Filterlogik und Zustand laufen komplett im Browser.

## Dateien

- [`index.html`](index.html) — der interaktive Ferien-Kompass (standalone).
