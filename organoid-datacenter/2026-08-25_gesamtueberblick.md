# Rechnen auf lebendem Hirngewebe: der Gesamtüberblick

Die Lesefassung über alle drei Reports hinweg, ohne Prüfapparat. Wer Verdikte, Evidenzgrade und Belegtabellen sucht, findet sie im [Hauptdossier](2026-08-18_organoid-datacenter.md), in der [Bewusstseins-Vertiefung](2026-08-23_bewusstsein-fuenf-episoden.md) und in der [Thesenblock-Synthese](2026-08-25_thesenbloecke.md). Stand: 25. August 2026.

## Worum es geht

Seit etwa 2013 lassen sich aus menschlichen Stammzellen dreidimensionale Zellaggregate züchten, die sich selbst zu hirnähnlichem Gewebe organisieren. Unter dem Schlagwort „Hirnorganoid" laufen dabei drei verschiedene Dinge, und fast alle Verwirrung im Feld beginnt damit, dass sie zusammengeworfen werden. Es gibt Monolayer-Kulturen, also kortikale Neuronen in einer flachen Schicht auf einem Elektrodenarray. Es gibt Neuronen auf planaren Chips wie im CL1 von Cortical Labs, 800.000 Zellen, reprogrammiert aus Haut- oder Blutproben erwachsener Spender. Und es gibt echte 3D-Organoide von etwa einem halben Millimeter Durchmesser, wie FinalSpark sie betreibt. Die berühmteste Lernstudie lief auf Monolayern, die Entwicklungsbiologie-Literatur betrifft Organoide. Wer Befunde vom einen aufs andere überträgt, erzählt bereits eine andere Geschichte als die Papers.

## Was man heute kaufen kann

Die Infrastruktur ist real und hat Preisschilder. Der CL1 kam im März 2025 heraus, kostet 35.000 Dollar (20.000 im 30er-Rack) und lässt sich per Python-SDK ansprechen. Cortical Labs betreibt dazu die „Cortical Cloud" mit Standorten in Singapur und Melbourne, Fernzugriff für 300 Dollar pro Woche. FinalSpark in Vevey vermietet seit Mai 2024 den Zugriff auf 16 Organoide für 500 Dollar im Monat und hat nach eigenen Angaben über 1.000 Organoide in drei Jahren verbraucht. Von 34 Universitäten, die Zugang wollten, bekamen ihn acht.

Das Bemerkenswerte daran ist die Schieflage zwischen Angebot und Anwendung. Man kann die Geräte kaufen und mieten, aber was auf ihnen gerechnet wird, sind bisher ausschließlich selbstdefinierte Demonstrationen. Eine Aufgabe, die jemand außerhalb der Herstellerlabore mit diesem Substrat gelöst hätte, gibt es nicht.

## Was das Gewebe wirklich tut

Der empirische Kern des ganzen Feldes ist das DishBrain-Experiment von Kagan und Kollegen (*Neuron*, 2022). Kortikale Zellkulturen bekamen über Elektroden die Ballposition eines vereinfachten Pong eingespielt und steuerten das Paddle. Trafen sie, folgte vorhersagbare Stimulation, verfehlten sie, folgte unstrukturiertes Rauschen. Über 399 Sitzungen mit vier Kontrollarmen verbesserten sich die Kulturen messbar innerhalb von etwa zwanzig Minuten.

Die Studie ist besser kontrolliert als ihr Ruf. Ihre wichtigste Grenze benennen die Autoren selbst: Lernen über Sitzungsgrenzen hinweg trat nicht robust auf. Die Kulturen fingen jeden Tag von vorn an. Es gibt also kurzfristige Anpassung, aber kein Gedächtnis über Tage, und damit kein Subjekt, dem über die Zeit etwas widerfahren könnte. Eine unabhängige Replikation durch eine Gruppe ohne kommerzielles Interesse steht bis heute aus, was bei einem Feld dieser Sichtbarkeit für sich spricht.

Die Folgearbeit der Gruppe (arXiv:2405.16946) zeigt, dass die Kulturen unter Echtzeitbedingungen stichprobeneffizienter lernen als die Vergleichsalgorithmen DQN, A2C und PPO, also aus weniger Beispielen. Das ist der wahre Kern hinter allen „schlägt KI"-Schlagzeilen, und er ist eng: eine Aufgabe, eine Metrik, dieselben Autoren.

## Von Pong zu Doom

Das Doom-Motiv, das durch die Berichterstattung geistert, hat zwei reale Wurzeln, und sie könnten unterschiedlicher kaum sein.

Die eine ist ein Bastlerprojekt. Der YouTube-Kanal The Thought Emporium züchtet seit 2023 kortikale Rattenneuronen auf einem Array mit 46 Elektroden und versucht, ihnen ein stark vereinfachtes Doom beizubringen. Das Spiel ist dafür auf eine Handvoll Ja-Nein-Entscheidungen heruntergebrochen, vorwärts, drehen, schießen, und die Rückmeldung läuft über Klänge, ein angenehmes Signal für den Abschuss, ein unangenehmes für den Sturz in den Giftsee ([PC Gamer](https://www.pcgamer.com/mad-scientist-youtuber-grows-a-rat-brain-that-is-learning-to-play-doom/), [Destructoid](https://www.destructoid.com/scientists-are-trying-to-grow-neurons-that-can-play-doom/)). Es ist ein dokumentiertes, laufendes Experiment, kein publiziertes Ergebnis.

Die andere Wurzel ist eine Demonstration von Cortical Labs auf dem CL1. Bei einem Hackathon mit Stanford koppelte der Forscher Sean Cole rund 200.000 menschliche Neuronen mit einem klassischen Lernalgorithmus, und die so gesteuerte Spielfigur lief durch die Gänge, feuerte auf Gegner und starb oft. Besser als Zufall, schneller trainiert als ein reines Silizium-System, sagt die Firma, aber weit von kompetentem Spiel entfernt ([AOL/Tech-Bericht](https://www.aol.com/articles/human-neurons-chip-learned-play-110000888.html)).

Der Fall ist lehrreich, weil er das Verdichtungsmuster des Feldes in einem Satz zeigt. Aus „Neuronen plus Lernalgorithmus steuern in einer Firmendemo eine Doom-Figur" wird in der Weitererzählung „Organoide spielen Doom". Im untersuchten Kanal steht die Kurzform genau so, ohne Quelle und ohne den Algorithmus zu erwähnen. Der wahre Kern existiert, die Pointe entsteht durch das Weglassen des Hybrid-Charakters.

## Die Energieerzählung

Die bekannteste Zahl des Feldes lautet, Bioprozessoren verbrauchten eine Million Mal weniger Strom als Chips. Sie stammt aus keiner Messung. Im FinalSpark-Paper steht sie nicht; dort werden nur die 20 Watt des menschlichen Gehirns (nach Clark und Sokoloff 1999) und die rund 10 GWh des GPT-3-Trainings (nach de Vries 2023) zitiert, und Mitgründer Fred Jordan hat den Faktor öffentlich aus dem Vergleich mit einer hypothetischen Silizium-Simulation hergeleitet.

Gemessen zieht ein CL1-Rack 850 bis 1.000 Watt, so viel wie ein GPU-Server. Der Strom fließt nicht in die Neuronen, sondern in die Maschine, die den fehlenden Körper ersetzt, also Inkubation, Temperaturregelung, Perfusion und Verstärker. Rechnet man mit den belegten Werten nach, liegt die Energie pro Operation heute um Größenordnungen über der eines Beschleunigers. Der physikalische Reiz der Idee bleibt bestehen, nur zeigt die Messung am realen Gerät derzeit in die Gegenrichtung.

## Wie nah am Gehirn?

Organoide entwickeln die groben Zellklassen echten Kortexgewebes, aber Bhaduri und Kollegen (*Nature*, 2020) zeigten, dass Zellstress in der Kultur die Ausdifferenzierung der Subtypen stört. Transplantiert man das Gewebe in einen Mauskortex, geht der Stress zurück und die Identitäten verbessern sich. Das Defizit liegt in der Schale, nicht im Gewebe.

Manche vermeintlichen Grundgrenzen sind inzwischen gefallen. Mikroglia entstehen von selbst (Ormel 2018), Vaskularisierung gelingt (Mansour 2018, Shi 2020 mit über 200 Tagen), und Gabriel und Kollegen (2021) fanden bilaterale optische Vesikel mit lichtempfindlichem Gewebe, den wahren Kern der „Organoide entwickeln Augen"-Meldungen.

Was bleibt, ist die Entwicklungsstufe. Die Reifung endet vor der Geburt, kortikale Schichtung und Gyrifizierung bleiben unvollständig, die Aktivität wird von Delta-Wellen dominiert, wie man sie bei Frühgeborenen und im Tiefschlaf sieht. Bei der Lebensdauer reicht die Spanne von wenigen Stunden in den Anfängen über „bis 100 Tage" bei FinalSpark und „bis sechs Monate" beim CL1 bis zu mehrjährigen Laborrekorden, und genau zwischen typischem Wert und Rekord wird in der öffentlichen Erzählung selten unterschieden.

## Bewusstsein, Schmerz, Moral

Hier klaffen öffentliche Aufmerksamkeit und Datenlage am weitesten auseinander. Der Sentienz-Streit entzündete sich daran, dass Kagan und Kollegen „sentience" im Titel führten, es aber als „responsive to sensory impressions" definierten, ein technischer Begriff nach Friston, der nichts über Erleben sagt. 29 Neurowissenschaftler, darunter Sabatini, Svoboda und Mainen, widersprachen in derselben Zeitschrift; die Antwort der Autoren hieß bezeichnenderweise „Scientific communication and the semantics of sentience". Es war ein Streit über Wörter, nicht über Messwerte.

In der Sache fehlen einem kortikalen Organoid Peripherie, Rückenmark und Thalamus, also die gesamte Bahn, über die Schmerzsignale entstehen und laufen. Die US-Akademien halten Bewusstsein oder Schmerzempfinden auf absehbare Zeit für äußerst unwahrscheinlich und ergänzen zugleich, dass die etablierten Messverfahren auf Organoide gar nicht anwendbar sind. Selbst Andrea Lavazza, die stärkste Stimme für Vorsorge, sieht die heutige Technik nicht über das Äquivalent eines pränatalen Gehirns hinauskommen.

Juristisch haben Kataoka, Lee und Sawai die Frage sauber sortiert. Rechtspersönlichkeit ist eine Zuschreibung, die auch Schiffen und Flüssen zukommen kann, und hängt nicht an der Empfindungsfrage. Ein eigenes Organoid-Recht existiert nicht, ein Vakuum aber auch nicht, weil Gewebe-, Biobank- und Einwilligungsrecht greifen.

## Die Ränder des Themas

Um den Kern herum wächst ein Kranz von Strängen, die die nächste Ausbaustufe andeuten. Organoide werden mit Rückenmarks-Organoiden zu Assembloiden gekoppelt und in Mäuse implantiert, wo sie sich funktional mit dem visuellen Kortex verbinden. Es gibt Roboterkörper mit organoider Steuerung, Muskel- und Hautgewebe für Maschinen, Experimente mit Hühnerembryonen zur Vaskularisierung und humanisierte Tiere. Seit Sommer 2026 kommt postmortales Gewebe dazu, also Hirnschnitte, die Stunden bis Tage nach dem Tod wieder Aktivität zeigen und in Demonstrationen Geräte steuern.

Medizinisch laufen parallel die eigentlich handfesten Anwendungen, Krankheitsmodelle für Parkinson und Entwicklungsstörungen, Transplantationsansätze nach Schlaganfall, dazu die Mahnung aus der Neurotechnik-Geschichte, dass bionische Implantate ihre Träger im Stich lassen, wenn der Anbieter insolvent geht. Am Rand stehen DARPA-Interesse an Organ-on-Chip seit 2012 und die australische Militärfinanzierung im Umfeld von DishBrain.

## Die Erzählmaschine

Begleitet wird das alles von einer Berichterstattung, die einem festen Muster folgt, exemplarisch untersucht am Kanal Gabriel Torch mit 68.200 Abonnenten und 618 extrahierten Behauptungen. Am Anfang steht fast immer ein echter Befund. Dann wird verdichtet: aus taktiler Kodierung wird Fühlen, aus einem Stichprobenvorteil Überlegenheit, aus „building blocks necessary for learning" ein „demonstrated learning", aus einem Laborrekord die normale Lebensdauer, aus einer Hybrid-Demo mit Lernalgorithmus ein „they did play Doom". Danach folgt jahrelange Wiederholung, in der die Superlative driften, ohne dass eine frühere Zahl je korrigiert wird.

Explizit falsch ist dabei erstaunlich wenig, und Bewusstsein wird nie direkt behauptet, im Gegenteil mehrfach verneint. Die Wirkung entsteht über die Reihenfolge der Sätze, über Titel, die stärker sind als ihr Text, und über Absicherungen, die zwar vorhanden sind, aber an anderer Stelle stehen als die starke Aussage. Nur 12 Prozent der Behauptungen nennen überhaupt eine Quelle.

## Wo das Thema steht

In einem Satz: Die Infrastruktur ist angekommen, der Anwendungsgrund noch nicht, und das Bewusstseinsthema, das die Schlagzeilen dominiert, ist von allen Teilfragen die am weitesten entfernte.

Die eigentlichen Weichen der nächsten Jahre sind unspektakulärer. Ob jemand außerhalb der Herstellergruppe den Lerneffekt repliziert. Ob ein Assembloid Gedächtnis über Tage zeigt, denn damit würde aus der Bewusstseinsdebatte über eine künftige Konfiguration eine über eine gegenwärtige. Und ob je eine Energiemessung pro Operation am realen Gerät die Effizienzerzählung einholt, die dem Feld seinen Namen als grüne KI-Alternative gegeben hat.

## Material

Die drei Reports mit vollständigem Prüfapparat, Belegtabellen und Quellenverzeichnissen: [Hauptdossier vom 18. August](2026-08-18_organoid-datacenter.md), [Bewusstsein in fünf Episoden vom 23. August](2026-08-23_bewusstsein-fuenf-episoden.md), [Thesenblöcke im Gesamtbild vom 25. August](2026-08-25_thesenbloecke.md). Rohmaterial unter `sources/`, Claim-Bestand in `research/claims.md`.
