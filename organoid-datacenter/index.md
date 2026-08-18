# Organoid-Datacenter

Ein adversariales Dossier zu Organoid-Compute: Rechnen auf lebendem menschlichem Hirngewebe. Geprüft wird, was daran gemessen ist, wie es sich zu LLMs verhält, und ab wann Bewusstseins-, Moral- und Rechtsfragen empirisch relevant werden statt bloß rhetorisch.

Ausgangspunkt war ein YouTube-Kanal, der das Thema seit Jahren begleitet. Er wird hier nicht als Beleg behandelt, sondern als Prüfgegenstand: 618 seiner Behauptungen wurden extrahiert und gegen Primärliteratur gehalten.

## Das Dossier

- **[2026-08-18_organoid-datacenter.html](2026-08-18_organoid-datacenter.html)** — die Lesefassung. Dunkles Theme mit Hell-Umschalter, Evidenzgrad-Chips A bis D, Quellen-Duell zum Sentienz-Streit, und ein interaktives Rechenmodell zur Energiefrage.
- **[2026-08-18_organoid-datacenter.md](2026-08-18_organoid-datacenter.md)** — inhaltsgleiche Markdown-Fassung, damit der Text diffbar bleibt.

## Ergebnis in einem Satz

Angekommen ist die Infrastruktur. Man kann ein Gerät mit 800.000 menschlichen Neuronen für 35.000 Dollar kaufen und Rechenzeit in einem Rechenzentrum in Singapur mieten. Nicht angekommen ist der Grund, warum man das tun sollte, und am weitesten entfernt ist das, was die Schlagzeilen ins Zentrum stellen.

Die sieben Hypothesen im Einzelnen, dreistufig verdiktet, stehen im Kurzbefund des Dossiers. Zwei fallen auf **unbelegt**: der Faktor „eine Million weniger Energie", der in keiner Primärquelle steht, und Schmerzempfinden in Organoiden, das selbst die stärkste Vorsichtsposition der Ethikliteratur nicht behauptet.

## Methodik und Material

- **[AGENTS.md](AGENTS.md)** — das kondensierte Recherche-Protokoll: Hypothesen statt Lagerurteile, Evidenzgrade, Zahlen-Regel, Verdikt-Format, Prosa-Regeln.
- **[research/2026-08-18_rechercheplan.md](research/2026-08-18_rechercheplan.md)** — Plan, Hypothesen H1 bis H7 und ihre Gegenhypothesen, bekannte Grenzen.
- **[research/claims.md](research/claims.md)** — 618 extrahierte Behauptungen mit Video-ID, Datum, Zeitstempel, Original-Wortlaut und genannter Quelle.
- **[research/claims/](research/claims/)** — die acht Extraktions-Batches im Rohzustand.

## Rohmaterial

Alles unter [sources/](sources/) ist unredigiert.

- `sources/youtube/channel_videos.txt` — alle 802 Videos des Kanals
- `sources/youtube/selection.tsv` — die 217 ausgewählten Videos, nach `core` und `wide` getrennt
- `sources/youtube/transcripts/` — 91 entdoppelte, zeitgestempelte Transkripte
- `sources/youtube/metadata.jsonl` — Metadaten und Beschreibungen aller 217 ausgewählten Videos. Destillat der vollen yt-dlp-Info-JSONs, die zu 99 Prozent aus Format-Listen bestehen und deshalb nicht mitcommittet sind.
- `sources/youtube/core/*.vtt` — die rohen Untertitelspuren
- `sources/papers/` — heruntergeladene Primärdokumente

## Skripte

- `sources/youtube/fetch_meta.sh` — zieht Metadaten des ganzen Kanals über yt-dlp
- `sources/youtube/select_relevant.py` — Zweistufen-Auswahl nach Titel-Stichwörtern
- `sources/youtube/crawl.sh` — parallelisierter Crawl von Info-JSON und Untertiteln
- `sources/youtube/build_transcripts.py` — VTT zu lesbarem Transkript, entfernt die Dopplungen der rollenden Untertitel
