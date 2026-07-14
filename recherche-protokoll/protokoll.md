# Universal-Recherche-Protokoll (adversarial)

Wiederverwendbare Prompt-Vorlage für tiefe Recherche zu beliebigen Themen — Kontroversen, Technik-Bewertungen, Studienlagen, Kaufentscheidungen, Politik-Claims. Verallgemeinert aus sechs projektspezifischen Regeln (Sachebene, Autoritäten-Deklassierung, adversariale Prüfung, Nischen-Schicht, Abbruchkriterium, Verdikt-Format) und abgeglichen mit etabliertem Analyse-Handwerk (ACH, ICD 203, Key Assumptions Check).

Kernverallgemeinerung: **„Vorwurf vs. Verteidigung" → „Hypothesen H1…Hn"**. Nicht jedes Thema hat zwei Lager — aber jedes Thema hat konkurrierende Erklärungen/Bewertungen. Das Protokoll funktioniert für n Seiten, auch für n=1 („stimmt Behauptung X?") und für lagerlose Fragen („welches Produkt/Framework/Modell?").

---

## V1 — Vollversion (copy & paste)

```text
RECHERCHE-AUFTRAG: {THEMA / FRAGE}

Arbeite nach folgendem Protokoll. Es ist verbindlich, auch wenn es den Aufwand erhöht.

0 · ZERLEGEN STATT URTEILEN
Formuliere die Frage zuerst als konkurrierende Hypothesen (H1…Hn), nicht als
Lagerfrage. Zerlege dann jede Hypothese in atomare, einzeln prüfbare
Einzelbehauptungen — je mit Urheber, Datum und Original-Wortlaut.

1 · SACHEBENE ERZWINGEN, META-EBENE VERBIETEN
Prüfe jede Einzelbehauptung am Primärmaterial. Die Debatte ÜBER die Sache
(wer empört sich, wer applaudiert, wie wird berichtet) ist Kontext, nie Beleg.

2 · AUTORITÄTEN DEKLASSIEREN
Institutionelle Stimmen — Verbände, offene Briefe, Jurys, Preisgremien,
Pressestellen, Sell-Side-Research, NGOs, Ministerien, Hersteller — zählen als
Meinungen mit Eigeninteresse, nicht als Belege. Benenne bei JEDER zitierten
Stimme die Interessenlage. Klassifiziere jede Kernaussage:
[A Messdaten | B Modell-/Schätzrechnung | C Experteneinschätzung | D Interessenzitat].

3 · ZIRKULARITÄT BRECHEN
Verfolge jede Zahl und jedes Zitat bis zur Erstquelle. Zähle unabhängige
Quellen, nicht Wiederholungen. Prüfe, ob Sekundärverwertung die
Originalformulierung verschärft oder verschoben hat — zitiere das
Original-Wording, wenn ja.

4 · ALLE SEITEN ADVERSARIAL PRÜFEN
Steelmanne jede Hypothese, dann versuche aktiv, JEDE zu widerlegen — auch die,
zu der deine Zwischenergebnisse tendieren. Suche gezielt nach der stärksten
Gegenevidenz zu deinem sich abzeichnenden Ergebnis. Ein geprüfter Punkt pro
Seite reicht nicht.

5 · NISCHEN-SCHICHT ÖFFNEN
Primärmaterial vor Berichterstattung: Rohdaten, Originaldokumente/-studien,
Transkripte, Register-/Gerichtsakten, Preprints, Fachmedien ALLER Lager,
ggf. fremdsprachige Quellen. Bleib nicht auf Suchseite 1 stehen; suche auch
mit der Terminologie der jeweils anderen Seite.

6 · ANNAHMEN & GENERALISIERUNG DISZIPLINIEREN
Nenne die tragenden Annahmen jeder Schlussfolgerung explizit (was kippt, wenn
die Annahme fällt?). Verallgemeinere nur, wo die Beleglage es hergibt — und
markiere jede Verallgemeinerung und jeden Einzelfall-Schluss als solche(n).

7 · ABBRUCHKRITERIUM ÄNDERN
Höre nicht auf, wenn die Geschichte rund ist, sondern wenn die Prüfliste
abgearbeitet oder ihre Grenzen dokumentiert sind. Pflicht-Output:
(a) Tabelle aller Einzelbehauptungen mit Prüfstatus
    [bestätigt | teilbestätigt | entkräftet | nicht prüfbar]
    + Beleg/Erstquelle je Zeile;
(b) Restliste des NICHT Geprüften mit Grund (Paywall, Bot-Blockade, Video
    ohne Transkript, Zeitbudget, fehlende Daten).

8 · VERDIKT-FORMAT
Kein Ja/Nein, kein Lagerurteil. Dreistufig und GETRENNT je Hypothese:
belegt / teilbelegt / unbelegt. Kennzeichne Konfidenz sprachlich kalibriert
(sehr wahrscheinlich / wahrscheinlich / unklar / unwahrscheinlich) und trenne
Konfidenz von Relevanz. Nenne zuerst die offenen Fragen, die das Ergebnis
kippen könnten.
```

---

## V2 — Kompaktversion (für schnellere Durchläufe)

```text
Recherchiere {THEMA} nach folgendem Protokoll: Zerlege die Frage in
konkurrierende Hypothesen und atomare Einzelbehauptungen (mit Urheber, Datum,
Original-Wortlaut). Prüfe jede am Primärmaterial, nicht an Berichterstattung;
verfolge Zahlen und Zitate bis zur Erstquelle und zähle nur unabhängige
Quellen. Behandle institutionelle Stimmen aller Seiten (Verbände, Briefe,
Jurys, Hersteller, Sell-Side) als Partei und benenne ihre Interessenlage.
Versuche jede Hypothese aktiv zu widerlegen — auch deine Favoritin.
Verallgemeinere nur, wo die Belege es tragen, und markiere es. Liefere statt
eines Urteils: (a) Belegtabelle je Einzelbehauptung
[bestätigt/teilbestätigt/entkräftet/nicht prüfbar], (b) Liste des Ungeprüften
mit Grund, (c) dreistufiges Verdikt je Hypothese (belegt/teilbelegt/unbelegt)
mit kalibrierter Konfidenz.
```

---

## V3 — Ein-Satz-Version

```text
Zerlege {THEMA} in prüfbare Einzelbehauptungen, prüfe jede an der Erstquelle
statt an Berichterstattung, behandle institutionelle Stimmen aller Seiten als
Partei mit benannter Interessenlage, versuche jede Hypothese aktiv zu
widerlegen, und liefere statt eines Urteils eine Belegtabelle
(bestätigt/entkräftet/nicht prüfbar) plus die Liste des Ungeprüften.
```

---

## Optionale Module (bei Bedarf anhängen)

**M1 · Zahlen-Deklassifizierung** — für Themen mit Schlagzeilen-Zahlen:

```text
Deklassifiziere jede prominente Zahl: Was misst sie wirklich (Definition,
Nenner, Zeitraum, Original-Wording)? Wurde aus „exponiert" ein „bedroht", aus
„assoziiert" ein „verursacht", aus „bis zu" ein Mittelwert?
```

**M2 · Output-Format (Observatory-Report)**:

```text
Output als selbst-enthaltenes HTML im Report-Stil: dunkles Theme mit
Hell-Toggle, Space Grotesk / IBM Plex Mono, Evidenzgrad-Chips (A–D),
Quellen-Duell-Panels mit Prüfvermerk, theme-aware SVG-Charts, Belegtabelle,
Restliste, Quellenverzeichnis mit Links. Dateiname: YYYY-MM-DD_{slug}.html
```

**M3 · Prognose-/Szenario-Slider** (wenn quantifizierbar):

```text
Baue ein illustratives interaktives Rechenmodell (Slider) für die zentrale
quantitative Frage. Alle Parameter mit Default + Quelle bzw. „gesetzt, nicht
geschätzt"-Markierung; Modell ausdrücklich als Illustration, nicht Prognose,
kennzeichnen.
```

**M4 · Zeit-/Tiefenbudget**:

```text
Budget: {leicht: ~5 Quellen | standard: ~10–15 | tief: 20+ und Research-Modus
vorschlagen}. Wenn das Budget die Prüfliste nicht deckt: Restliste statt
Abkürzung.
```

---

## Herkunft der Mechanismen (zur Einordnung, nicht als Autoritätsbeweis)

| Protokoll-Regel                     | Etabliertes Pendant                                          |
| ------------------------------------ | -------------------------------------------------------------|
| 0 · Hypothesen statt Lagerfrage      | Analysis of Competing Hypotheses (Heuer/Pherson)              |
| 4 · aktives Widerlegen aller Seiten  | ACH-Kernschritt: Evidenz gegen jede Hypothese testen; Devil's Advocacy |
| 6 · tragende Annahmen benennen       | Key Assumptions Check; ICD 203 („state load-bearing assumptions") |
| 8 · kalibrierte Konfidenzsprache     | ICD 203 / Words of Estimative Probability                     |
| 3 · Zirkularität brechen             | „Circular reporting"-Prüfung, lateral reading (SIFT)           |
| 2 · Evidenzgrade A–D                 | GRADE-Logik (Evidenzhierarchie), vereinfacht                   |

Ironie-Fußnote in eigener Sache: Diese Namen sind selbst Autoritäten. Sie belegen nicht, dass das Protokoll funktioniert — sie zeigen nur, dass die Mechanismen unabhängig mehrfach erfunden und feldgetestet wurden. Regel 2 gilt auch hier.

## Bekannte Kosten

Mehr Toolcalls, längere Laufzeit, unbequemere Ergebnisse (Restlisten statt runder Geschichten), und gelegentlich das Verdikt „überwiegend nicht prüfbar" — das ist kein Fehler des Protokolls, sondern sein Zweck. Die Schnellversion einer Recherche optimiert auf Kohärenz; dieses Protokoll optimiert auf Falsifizierbarkeit.
