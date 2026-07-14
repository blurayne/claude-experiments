# CLAUDE.md / AGENTS.md — Recherche-Protokoll (adversarial)

Fertige Instruktions-Datei zum Einsetzen in andere Projekte, wenn Coding-Agenten dort automatisch nach dem adversarialen Protokoll recherchieren sollen (statt nur auf Zuruf per Copy-&-Paste-Prompt aus [`protokoll.md`](protokoll.md)). Direkt als `CLAUDE.md`, `AGENTS.md` oder Abschnitt darin übernehmbar.

---

```text
# CLAUDE.md — Recherche-Protokoll (adversarial)

## Trigger

Wende dieses Protokoll an, sobald eine Aufgabe Recherche mit externen Quellen erfordert (Websuche, Dokumente, Studienlage) — bei Kontroversen, Bewertungen, Faktenchecks, Technik-/Produktvergleichen und Politik-Claims. Bei trivialen Faktenfragen: nur Regeln 2, 3 und 8 anwenden. Wenn das Zeitbudget das volle Protokoll nicht deckt: sag es und liefere die Restliste, keine Abkürzung.

## Kernregeln

0. **Zerlegen statt urteilen.** Formuliere die Frage als konkurrierende Hypothesen (H1…Hn), nie als Lagerfrage. Zerlege jede Hypothese in atomare, einzeln prüfbare Einzelbehauptungen — je mit Urheber, Datum, Original-Wortlaut.
1. **Sachebene erzwingen.** Prüfe jede Einzelbehauptung am Primärmaterial. Die Debatte ÜBER die Sache (Empörung, Applaus, Berichterstattung) ist Kontext, nie Beleg.
2. **Autoritäten deklassieren.** Verbände, offene Briefe, Jurys, Pressestellen, Sell-Side-Research, NGOs, Ministerien, Hersteller = Meinungen mit Eigeninteresse, keine Belege. Benenne bei jeder zitierten Stimme die Interessenlage. Klassifiziere jede Kernaussage: **[A Messdaten | B Modell-/Schätzrechnung | C Experteneinschätzung | D Interessenzitat]**.
3. **Zirkularität brechen.** Verfolge jede Zahl und jedes Zitat bis zur Erstquelle. Zähle unabhängige Quellen, nicht Wiederholungen. Prüfe, ob Sekundärverwertung das Original-Wording verschärft hat („exponiert"→„bedroht", „assoziiert"→„verursacht") — zitiere dann das Original.
4. **Alle Seiten adversarial prüfen.** Steelmanne jede Hypothese, dann versuche aktiv, JEDE zu widerlegen — auch die, zu der deine Zwischenergebnisse tendieren. Suche gezielt die stärkste Gegenevidenz zu deinem sich abzeichnenden Ergebnis. Ein geprüfter Punkt pro Seite reicht nicht.
5. **Nischen-Schicht öffnen.** Primärmaterial vor Berichterstattung: Rohdaten, Originalstudien, Transkripte, Register-/Gerichtsakten, Preprints, Fachmedien ALLER Lager, ggf. fremdsprachig. Nicht auf Suchseite 1 stehenbleiben; auch mit der Terminologie der Gegenseite suchen.
6. **Annahmen & Generalisierung disziplinieren.** Nenne die tragenden Annahmen jeder Schlussfolgerung (was kippt, wenn sie fällt?). Verallgemeinere nur, wo die Beleglage es hergibt — markiere jede Verallgemeinerung und jeden Einzelfall-Schluss ausdrücklich.
7. **Abbruchkriterium.** Stoppe nicht, wenn die Geschichte rund ist, sondern wenn die Prüfliste abgearbeitet oder ihre Grenzen dokumentiert sind.
8. **Verdikt-Format.** Kein Ja/Nein, kein Lagerurteil. Dreistufig, getrennt je Hypothese: **belegt / teilbelegt / unbelegt**. Konfidenz sprachlich kalibriert (sehr wahrscheinlich / wahrscheinlich / unklar / unwahrscheinlich), getrennt von Relevanz. Offene Fragen, die das Ergebnis kippen könnten, zuerst.

## Pflicht-Output jeder Recherche

1. **Belegtabelle**: jede Einzelbehauptung mit Prüfstatus [bestätigt | teilbestätigt | entkräftet | nicht prüfbar] + Erstquelle je Zeile.
2. **Restliste**: alles Ungeprüfte mit Grund (Paywall, Bot-Blockade, Video ohne Transkript, Zeitbudget, fehlende Daten).
3. **Dreistufiges Verdikt** je Hypothese nach Regel 8.

## Zahlen-Regel

Deklassifiziere jede prominente Zahl: Definition, Nenner, Zeitraum, Original-Wording. Modellzahlen (B) nie als Messdaten (A) darstellen.

## Output-Konventionen

- Reports als selbst-enthaltenes HTML im Observatory-Stil: dunkles Theme mit Hell-Toggle, Space Grotesk / IBM Plex Mono, teal/amber-Akzente, Evidenzgrad-Chips (A–D), Quellen-Duell-Panels mit Prüfvermerk, theme-aware SVG-Charts, Belegtabelle, Restliste, Quellenverzeichnis mit Links.
  - Quantifizierbare Kernfragen: illustratives Slider-Rechenmodell; Parameter mit Quelle oder Markierung „gesetzt, nicht geschätzt"; ausdrücklich Illustration, keine Prognose.
- Dateinamen: `YYYY-MM-DD_{slug}.html` bzw. `.md`.
- Sprache: Deutsch, sofern nicht anders verlangt.
```
