# palestine-my-ass

Eine eigenständige, interaktive Faktencheck-Seite (Deutsch) zur Kontroverse um
die ARD-Journalistin **Sophie von der Tann** rund um den Friedrichs-Preis 2025.

## Worum es geht

Die Seite prüft die Kritik an der Journalistin Punkt für Punkt — inzwischen
**zehn Kritikpunkte** statt der ursprünglich sechs. Ausgangspunkt war ein
kursierendes Dokument (identifiziert als Transkript des Sander-Videos), das auf
„Pro-Hamas-Journalismus" schließt. Jeder Anklagepunkt wird einzeln geprüft und
eingeordnet in:

- **belegbar** – was sich anhand von Quellen nachweisen lässt,
- **Deutung / wertend** – was Interpretation ist,
- **nicht überprüfbar** – was sich nicht unabhängig verifizieren lässt,
- **bestritten / entkräftet** – was der Gegenseite widerspricht.

Claims und Gegenargumente stehen sich dabei wie in einem Hauptbuch („Ledger")
gegenüber, jeweils mit einem Verdikt-Label. Ergänzt wird das um Zahlen- und
Systemkontext (u. a. RIAS, TU Dortmund, 7.10., Methodikdebatte zu Opferzahlen),
Direktzitate und Timing-Analysen.

Seit 11.07.2026 (v3) liegen **beide Primärquellen als vollständige Transkripte**
vor und sind eigens ausgewertet: das Sander-Video (Ursprung der Vorwürfe, mit
O-Ton-Prüfung, UNRWA-Tunnel-Widerlegung und Quellenkritik an Sanders
Absolutaussagen) und der Frey-Podcast vom 04.12.2025 (datumsgenaues
Tagesschau-Sichtungsprotokoll 7.–17.10.2023, al-Ahli-Passage durch Zweitquelle
bestätigt, Jury-Begründung als eigener Streitpunkt). Die Kritikpunkte wurden
von sechs auf zehn erweitert (neu: Mai-2023-Video, Bethlehem/Bibas,
UNRWA-Tunnel — entkräftet, Preis-Umfeld), das Kritiker-Feld um Kahane,
Jüdische Rundschau, freitagsmedien, Havemann u. a. ergänzt. Das Gesamtverdikt
(kein „Pro-Hamas"-Beleg, aber pro-palästinensisches Framing-Muster) bleibt
bestehen — konkreter gestützt und zugleich schärfer begrenzt: Zwei
Vorzeige-Beispiele der Kritik fielen bei der Transkript-Prüfung in sich
zusammen.

Als Abschlusskapitel (v4) enthält die Seite eine **A/B-Gegenprobe**: Dieselbe
Frage („Hetzkampagne gegen von der Tann — was ist dran?") wurde einem zweiten
KI-Modell (Claude Opus 4.8) so gestellt, wie ein normaler Nutzer fragen würde —
ohne Kenntnis dieser Seite, mit Orientierung an „seriösen Stimmen"
(Journalistenverbände, RSF, Fachpresse). Ergebnis: das gegenteilige Urteil
(„staatlich mitbefeuerte Diffamierungskampagne, Kritik weitgehend belegfrei").
Das Kapitel vergleicht beide Antworten Punkt für Punkt und zieht die Lehre:
Autoritäts-Aggregation reproduziert die Selbstbeschreibung des Feldes —
Belege prüfen ersetzt sie nicht.

Die Darstellung ist meinungsstark und bezieht selbst Position (etwa mit einem
methodischen Vorbehalt gegenüber den Verteidigern der Journalistin) – sie
versteht sich als Medienkritik, nicht als neutrale Nachricht.

## Technik

Reine, eigenständige HTML/CSS-Seite – kein Build nötig. Enthält einen
Hell-/Dunkel-Umschalter; Schriften werden von Google Fonts geladen.

## Dateien

- [`report-2026-07-11.html`](report-2026-07-11.html) – **Neufassung (empfohlen)**:
  neu strukturiert (Kritikpunkte → Entlastung → Akteurs-Portraits →
  Journalismus-Genres → KI-Kontrollexperiment → Fazit) und neu gestaltet
  (eigenes Dossier-Layout mit Abschnitts-Navigation), ohne die
  Dokumenten-/Versionsgeschichte der Langfassung. Benannt nach dem
  Erstellungsdatum; spätere Neufassungen erhalten neue Timestamps.
- [`index.html`](index.html) – die ausführliche Langfassung (Faktencheck mit
  Transkript-Deep-Dives, Video-Register, Zahlen- und Systemkontext,
  Versionshistorie), verlinkt oben auf die Neufassung.
