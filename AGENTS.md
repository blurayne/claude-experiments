# AGENTS.md

Ergänzt `CLAUDE.md` um eine Konvention, die für alle Agenten (nicht nur Claude Code) in diesem Repository gilt.

## Recherche-Protokoll (adversarial)

Sobald eine Aufgabe Recherche mit externen Quellen erfordert (Kontroversen, Bewertungen, Faktenchecks, Technik-/Produktvergleiche, Politik-Claims): dieses Protokoll anwenden. Bei trivialen Faktenfragen genügen die Regeln 2, 3 und 5. Deckt das Zeitbudget das Protokoll nicht: das sagen und eine Restliste liefern statt abzukürzen.

1. Frage als konkurrierende Hypothesen (H1…Hn) zerlegen, nicht als Lagerfrage; jede Hypothese in atomare, einzeln prüfbare Behauptungen (Urheber, Datum, Original-Wortlaut) aufteilen.
2. Jede Behauptung am Primärmaterial prüfen — Berichterstattung, Empörung oder Applaus darüber ist Kontext, kein Beleg.
3. Institutionelle Stimmen (Verbände, Jurys, Pressestellen, NGOs, Ministerien, Hersteller, Sell-Side) als Partei mit benannter Interessenlage behandeln; jede Kernaussage klassifizieren: [A Messdaten | B Modellrechnung | C Experteneinschätzung | D Interessenzitat].
4. Zahlen und Zitate bis zur Erstquelle zurückverfolgen, nur unabhängige Quellen zählen; verschärfte Sekundärformulierungen („exponiert"→„bedroht") am Original prüfen.
5. Jede Hypothese aktiv zu widerlegen versuchen — auch die favorisierte; gezielt nach der stärksten Gegenevidenz suchen.
6. Primärmaterial vor Sekundärberichten suchen (Rohdaten, Studien, Transkripte, Preprints, Fachmedien aller Lager, ggf. fremdsprachig); nicht bei Suchseite 1 stoppen.
7. Tragende Annahmen jeder Schlussfolgerung benennen; nur verallgemeinern, wo die Belege es tragen, und das kennzeichnen.
8. Erst abbrechen, wenn die Prüfliste abgearbeitet oder ihre Grenzen dokumentiert sind — nicht wenn die Geschichte „rund" ist.

**Pflicht-Output:** Belegtabelle je Behauptung [bestätigt/teilbestätigt/entkräftet/nicht prüfbar] mit Erstquelle · Restliste des Ungeprüften mit Grund (Paywall, Bot-Blockade, Zeitbudget …) · Verdikt je Hypothese dreistufig (belegt/teilbelegt/unbelegt) mit sprachlich kalibrierter Konfidenz, offene Fragen zuerst.

Volle Vorlage mit Copy-&-Paste-Prompts, optionalen Modulen und Herleitung: [`recherche-protokoll/`](recherche-protokoll/).
