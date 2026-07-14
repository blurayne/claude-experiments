# Universal-Recherche-Protokoll (adversarial)

Wiederverwendbare Prompt-Vorlage für tiefe, adversariale Recherche zu beliebigen Themen — Kontroversen, Technik-/Produktbewertungen, Studienlagen, Kaufentscheidungen, Politik-Claims. Verallgemeinert aus sechs projektspezifischen Regeln (Sachebene erzwingen, Autoritäten deklassieren, adversarial prüfen, Nischen-Schicht öffnen, Abbruchkriterium ändern, Verdikt-Format) und abgeglichen mit etabliertem Analyse-Handwerk: Analysis of Competing Hypotheses, ICD 203, Key Assumptions Check, GRADE-Evidenzhierarchie.

Kerngedanke: **„Vorwurf vs. Verteidigung" → „Hypothesen H1…Hn"**. Nicht jedes Thema hat zwei Lager, aber jedes Thema hat konkurrierende Erklärungen oder Bewertungen. Das Protokoll deklassiert institutionelle Stimmen zu Parteien mit Interessenlage, verlangt aktives Widerlegen jeder Hypothese (auch der eigenen Favoritin), und ersetzt das runde Fazit durch eine Belegtabelle, eine Restliste des Ungeprüften und ein dreistufiges Verdikt (belegt/teilbelegt/unbelegt) je Hypothese.

## Dateien

- [`protokoll.md`](protokoll.md) — das Protokoll selbst: Copy-&-Paste-Prompt-Vorlagen in drei Längen (Voll-, Kompakt- und Ein-Satz-Version), optionale Module (Zahlen-Deklassifizierung, HTML-Report-Format, Szenario-Slider, Zeitbudget) sowie die Herkunftstabelle der einzelnen Mechanismen.
- [`agenten-vorlage.md`](agenten-vorlage.md) — fertige `CLAUDE.md`/`AGENTS.md`-Instruktionsdatei, falls Coding-Agenten in einem anderen Projekt automatisch (nicht nur auf Zuruf) nach diesem Protokoll recherchieren sollen.

Eine noch kürzere Fassung dieses Protokolls steckt im [`AGENTS.md`](../AGENTS.md) dieses Repositories und gilt dort für alle Subfolder.

## Bekannte Kosten

Mehr Toolcalls, längere Laufzeit, unbequemere Ergebnisse (Restlisten statt runder Geschichten) und gelegentlich das Verdikt „überwiegend nicht prüfbar" — das ist kein Fehler des Protokolls, sondern sein Zweck. Die Schnellversion einer Recherche optimiert auf Kohärenz; dieses Protokoll optimiert auf Falsifizierbarkeit.
