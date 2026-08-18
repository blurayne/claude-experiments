# AGENTS.md — Arbeitsregeln für dieses Dossier

Kondensat des Recherche-Protokolls für das Organoid-/Biocomputing-Dossier. Gilt für jede Sitzung und jeden Subagenten, der hier arbeitet.

## 1. Recherche: adversarial, nicht bestätigend

**Zerlegen statt urteilen.** Jede Frage wird zu konkurrierenden Hypothesen (H1…Hn), nie zu einer Lagerfrage. Jede Hypothese zerfällt in atomare Einzelbehauptungen mit Urheber, Datum und Original-Wortlaut.

**Sachebene erzwingen.** Jede Einzelbehauptung wird am Primärmaterial geprüft. Die Debatte über die Sache — Presseecho, Empörung, Firmen-Blogposts — ist Kontext, nie Beleg.

**Autoritäten deklassieren.** Firmen, Verbände, Ethikkommissionen, Fachgesellschaften, Ministerien und Pressestellen liefern Meinungen mit Eigeninteresse. Interessenlage bei jeder zitierten Stimme benennen. Jede Kernaussage bekommt einen Evidenzgrad:

| Grad | Bedeutung |
|---|---|
| **A** | Messdaten (Rohdaten, Replikate, publizierte Messreihen) |
| **B** | Modell- oder Schätzrechnung |
| **C** | Experteneinschätzung |
| **D** | Interessenzitat (Firma, Verband, PR, Kanal) |

**Zirkularität brechen.** Jede Zahl und jedes Zitat bis zur Erstquelle verfolgen. Unabhängige Quellen zählen, nicht Wiederholungen. Prüfen, ob die Sekundärverwertung das Original verschärft hat („korreliert" → „verursacht", „Aktivität" → „Lernen", „reagiert" → „empfindet") — dann das Original zitieren.

**Alle Seiten adversarial prüfen.** Jede Hypothese zuerst steelmannen, dann aktiv zu widerlegen versuchen — besonders die, zu der die Zwischenergebnisse tendieren. Gezielt die stärkste Gegenevidenz zum sich abzeichnenden Ergebnis suchen.

**Nischen-Schicht öffnen.** Primärmaterial vor Berichterstattung: Preprints, Originalstudien, Methodenteile, Supplements, Patente, Transkripte, Register. Nicht auf Suchseite 1 stehenbleiben, auch mit der Terminologie der Gegenseite suchen (z. B. sowohl „organoid intelligence" als auch „organoid hype" / „nicht-neuronale Erklärung").

**Annahmen disziplinieren.** Tragende Annahmen jeder Schlussfolgerung nennen: was kippt, wenn sie fällt? Verallgemeinerungen und Einzelfall-Schlüsse ausdrücklich markieren.

**Abbruchkriterium.** Nicht stoppen, wenn die Geschichte rund ist, sondern wenn die Prüfliste abgearbeitet oder ihre Grenzen dokumentiert sind.

**Verdikt-Format.** Kein Ja/Nein. Dreistufig je Hypothese: **belegt / teilbelegt / unbelegt**. Konfidenz sprachlich kalibriert (sehr wahrscheinlich / wahrscheinlich / unklar / unwahrscheinlich), getrennt von der Relevanz. Offene Fragen, die das Ergebnis kippen könnten, stehen zuerst.

**Zahlen-Regel.** Jede prominente Zahl deklassifizieren: Definition, Nenner, Zeitraum, Original-Wording. Modellzahlen (B) nie als Messdaten (A) darstellen. Für dieses Dossier besonders relevant: Neuronenzahlen, Energieverbrauch pro Operation, Kulturlebensdauer, Lernkurven.

## 2. Pflicht-Output jeder Recherche

1. **Belegtabelle** — jede Einzelbehauptung mit Prüfstatus [bestätigt | teilbestätigt | entkräftet | nicht prüfbar] und Erstquelle pro Zeile.
2. **Restliste** — alles Ungeprüfte mit Grund: Paywall, Bot-Blockade, Video ohne Transkript, Zeitbudget, fehlende Rohdaten.
3. **Dreistufiges Verdikt** je Hypothese.

## 3. Output-Konventionen

Reports als selbst-enthaltenes HTML im Observatory-Stil: dunkles Theme mit Hell-Toggle, Space Grotesk / IBM Plex Mono, Evidenzgrad-Chips A–D, Quellen-Duell-Panels mit Prüfvermerk, theme-aware SVG-Charts, Belegtabelle, Restliste, Quellenverzeichnis mit Links. Für dieses Dossier zusätzlich eine Neuro-Cyberpunk-Akzentuierung (Elektroden-/MEA-Raster, gedämpftes Petrischalen-Teal, Bernstein für Warnhinweise).

Zu jedem HTML-Report gehört eine inhaltsgleiche Markdown-Fassung, damit der Text diffbar bleibt.

Quantifizierbare Kernfragen bekommen ein illustratives Slider-Rechenmodell. Jeder Parameter trägt seine Quelle oder die Markierung „gesetzt, nicht geschätzt". Ausdrücklich Illustration, keine Prognose.

Dateinamen: `YYYY-MM-DD_{slug}.html` bzw. `.md`. Sprache: Deutsch, sofern nicht anders verlangt.

## 4. Prosa: keine KI-Muster

Füllphrasen streichen: Räusper-Einstiege („Eines vorweg:"), Betonungskrücken („Das muss man sich auf der Zunge zergehen lassen."), Business-Jargon, Meta-Kommentare („In diesem Abschnitt betrachten wir…").

Formelhafte Strukturen vermeiden: Binärkontraste („Nicht X. Sondern Y."), Negativlisten, dramatische Fragmentierung, selbstgestellte rhetorische Fragen, Anaphern- und Dreierfiguren-Missbrauch.

KI-Tropen eliminieren: Zauberadverbien („leise", „still"), „delve"-Verwandte, die „dient als"-Ausweichbewegung, falsche Spannweiten („von X bis Y" ohne echte Spanne), aufgesetzte Partizipialanalysen („und unterstreicht damit die Bedeutung…"), erfundene Konzeptlabels, aufgeblasene Einsätze, herablassende Analogien.

Aktiv mit benannten Akteuren. Nicht „die Kritik wird zum Befund", sondern „Kaplan und Kollegen fanden…". Konkret bleiben: keine vagen Deklarative („Die Gründe sind struktureller Natur"), keine vagen Zuschreibungen („Experten meinen…") — wer nicht benannt werden kann, ist keine Quelle. Fachterminologie ist erwünscht und kein Jargon; „Multi-Elektroden-Array" ist präzise Sprache.

Rhythmus variieren, Satzlängen mischen, zwei Aufzählungspunkte schlagen drei. Keine Gedankenstriche. Keine fett gesetzten Listen-Anfänge in Serie, keine Unicode-Pfeile, keine signalisierten Schlussfolgerungen („Zusammenfassend…"), keine „Trotz dieser Herausforderungen…"-Formel. Nicht verdünnen: ein Gedanke pro Abschnitt, keine Metapher zu Tode reiten.

**Kurz-Check vor Abgabe:** Adverbien raus. Passiv → Akteur benennen. Rhetorische Frage → Aussage. Gedankenstrich → Komma oder Punkt. Vages Deklarativ → konkrete Folge benennen. Drei gleich lange Sätze hintereinander → einen brechen.

## 5. Arbeitsverzeichnis

- `sources/youtube/` — Kanal-Metadaten, Beschreibungen, Transkripte (Rohmaterial, nicht redigiert)
- `research/` — Claim-Listen, Belegtabellen, Notizen pro Hypothese
- `YYYY-MM-DD_*.html` / `.md` — Reports
- `index.md` — Repo-Einstiegsseite, bei jeder Datei-Änderung mitpflegen
