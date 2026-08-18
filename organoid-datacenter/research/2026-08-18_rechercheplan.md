# Rechercheplan — Organoid-Compute-Dossier

Stand: 2026-08-18. Arbeitsregeln in [AGENTS.md](../AGENTS.md).

## Frage

Wie weit ist Organoid-Compute wirklich, wie verhält es sich zu LLMs und anderen KI-Richtungen, und ab wann werden Bewusstseins-, Moral- und Rechtsfragen empirisch relevant statt bloß rhetorisch?

Gewichtung nach Absprache: zwei etwa gleich starke Säulen, Technik und Philosophie/Recht, verbunden durch eine Brückensektion.

## Material

**Kanal als Claim-Quelle.** `@bearbaitofficial`, 802 Videos. Die Betreiberin stellt sich im Video als Molekularbiologin vor. Der Kanal ist Prüfgegenstand, kein Beleg — Evidenzgrad D. Ausgewählt wurden 217 Videos:

- **core (91)** — Organoide, Biocomputing, körperlose Hirne, Neuronen-Robotik. Volltranskript plus Beschreibung.
- **wide (126)** — Bewusstsein, Sentienz, KI-Vergleich, Neuroprothetik. Nur Metadaten und Beschreibung.
- Der Rest des Kanals (Bären, Prionen, Kryptiden) bleibt draußen.

Zeitfenster: Claims der letzten zwei Jahre werden geprüft. Ältere Videos dienen der Claim-Drift-Analyse, also der Frage, ob aus „Signal" später „Lernen" und daraus „Bewusstsein" wurde.

**Primärliteratur.** Cortical Labs (DishBrain, CL1), FinalSpark, Johns Hopkins Organoid Intelligence, Arbeiten von Pașca, Lancaster, Muotri, Trujillo, dazu Preprints, Methodenteile, Supplements, Patente und Firmen-Dokumentation. Bewusst mitgesucht wird die Gegenliteratur: Replikationsversuche und Methodenkritik an DishBrain, Divergenzstudien zu Organoid-Transkriptomen, ethische Positionen, die Organoiden Moralstatus absprechen.

## Hypothesen

Jede wird zuerst gesteelmannt, dann aktiv angegriffen. Verdikt dreistufig, Konfidenz getrennt von Relevanz.

**H1 — Nutzbares Rechensubstrat.** Organoid-Compute ist heute kommerziell buchbar und löst Aufgaben.
Gegenhypothese: Es existieren Demonstratoren und Mietzugänge, aber keine Anwendung außerhalb selbstdefinierter Benchmarks.

**H2 — Lernen.** Die berichteten Leistungen (Pong, Doom, Navigation) sind Plastizität im neurowissenschaftlichen Sinn.
Gegenhypothese: Der Effekt entsteht in der Stimulationskodierung und der Auswertung; die entscheidende Kontrollbedingung fehlt oder fällt schwach aus.

**H3 — Energievorteil.** Der Effizienzvorsprung gegenüber LLM-Hardware ist real und skaliert.
Gegenhypothese: Es ist eine Modellrechnung (Grad B), die Inkubation, Medienwechsel, Kühlung und Ausfallraten ausblendet.

**H4 — Entwicklungstreue.** Organoide entwickeln sich zellulär und netzwerkmäßig wie fetales Hirngewebe.
Gegenhypothese: Sie divergieren systematisch — Stress-Signaturen, fehlende Vaskularisierung, fehlende Mikroglia, keine sensorische Peripherie, kein Körper.

**H5 — Nozizeption.** Es gibt Evidenz für Schmerz oder wenigstens Nozizeption.
Gegenhypothese: Die dafür nötigen Bahnen und Strukturen sind nachweislich nicht angelegt; „Reaktion auf Reiz" wird mit „Empfinden" verwechselt.

**H6 — Pfad zu Fähigkeiten jenseits von LLMs.** Biologische Substrate erreichen etwas, das Transformer-Architekturen prinzipiell fehlt.
Gegenhypothese: Der Vergleich ist kategorial schief; die Skalen trennen Größenordnungen, und die Behauptung lebt von der Analogie, nicht von Messdaten.

**H7 — Entscheidungsreife von Moralstatus und Recht.** Die Fragen sind praktisch beantwortbar und regelungsbedürftig.
Gegenhypothese: Die empirischen Voraussetzungen sind unerfüllt; die Debatte läuft der Sache voraus.

## Brückensektion

*Was müsste empirisch wahr sein, damit Moralstatus zur Frage wird?*

Hier laufen H4, H5 und H7 zusammen. Jede Moralstatus-Behauptung setzt stillschweigend eine empirische Bedingung voraus — integrierte Verarbeitung, wiederkehrende Schleifen, Bewertungssignale, Persistenz über Zeit. Die Sektion macht diese Bedingungen explizit und prüft für jede, wie die Beleglage steht. Damit wird sichtbar, welche ethische Position an welcher empirischen Frage hängt und was ihre Vertreter jeweils voraussetzen, ohne es zu sagen.

## Vorgehen

1. **Crawl.** yt-dlp zieht Metadaten und Untertitel; `build_transcripts.py` macht daraus entdoppelte, zeitgestempelte Transkripte. Kein Modell beteiligt.
2. **Claim-Extraktion.** Schnelles Modell (Haiku) liest die Transkripte und extrahiert atomare Behauptungen mit Video-ID, Zeitstempel, Original-Wortlaut und der im Video genannten Quelle. Keine Bewertung in diesem Schritt.
3. **Rückverfolgung.** Opus prüft jede Behauptung gegen die Erstquelle und protokolliert Verschärfungen zwischen Paper, Pressemitteilung und Video.
4. **Gegenevidenz.** Gezielte Suche nach der stärksten Widerlegung jeder Hypothese, auch und gerade der, zu der die Zwischenergebnisse tendieren.
5. **Verdikt und Bau.** Belegtabelle, Restliste, dreistufiges Verdikt; Markdown-Fassung, daraus das HTML.

## Ergebnisse

- `research/claims.md` — extrahierte Behauptungen mit Fundstelle
- `research/belegtabelle.md` — Prüfstatus und Erstquelle je Behauptung
- `research/restliste.md` — Ungeprüftes mit Grund
- `2026-08-18_organoid-datacenter.md` und `.html` — das Dossier
- `index.md` — Repo-Einstieg

Das HTML folgt den Observatory-Konventionen aus AGENTS.md, mit Neuro-Cyberpunk-Akzentuierung und einem Slider-Rechenmodell zur Energie- und Skalenfrage aus H3. Das Modell ist als Illustration deklariert, nicht als Prognose; jeder Parameter trägt Quelle oder die Markierung „gesetzt, nicht geschätzt".

## Bekannte Grenzen

Die Videoauswahl beruht auf Titel-Stichwörtern. Einschlägige Videos mit unauffälligem Titel fehlen dadurch möglicherweise; das gehört in die Restliste. Auto-Untertitel enthalten Erkennungsfehler, besonders bei Eigennamen und Fachbegriffen — jedes wörtliche Zitat aus einem Transkript wird vor Aufnahme ins Dossier am Video geprüft.
