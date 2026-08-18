# Rechenzentren aus Hirngewebe: Was davon gemessen ist

Ein adversariales Dossier zu Organoid-Compute, zum Vergleich mit LLMs und zur Frage, ab wann Moralstatus empirisch relevant wird.

Stand: 18. August 2026. Methodik: [AGENTS.md](AGENTS.md). Plan: [research/2026-08-18_rechercheplan.md](research/2026-08-18_rechercheplan.md). Claim-Rohbestand: [research/claims.md](research/claims.md).

Evidenzgrade: **A** Messdaten, **B** Modell- oder Schätzrechnung, **C** Experteneinschätzung, **D** Interessenzitat.

---

## Kurzbefund

| | Hypothese | Verdikt | Konfidenz |
|---|---|---|---|
| H1 | Organoid-Compute ist ein nutzbares Rechensubstrat | **teilbelegt** | Geräte sind käuflich und laufen in Rechenzentren (sehr wahrscheinlich). Dass sie Rechenaufgaben außerhalb eigener Benchmarks lösen, ist unbelegt. |
| H2 | Die berichteten Lernleistungen sind Plastizität | **teilbelegt** | Kontrollbedingungen existieren und die Effekte sind statistisch deutlich (wahrscheinlich). Lernen über Sitzungsgrenzen hinweg fehlt (von den Autoren selbst eingeräumt). |
| H3 | Der Energievorteil ist real und skaliert | **unbelegt** in der verbreiteten Form | Der Faktor „eine Million" steht in keiner Primärquelle. Gemessen zieht ein CL1-Rack 850 bis 1.000 Watt (sehr wahrscheinlich). |
| H4 | Organoide entwickeln sich wie fetales Hirngewebe | **teilbelegt** | Zelltypklassen entstehen, Subtypspezifikation und Reifung divergieren nachweisbar (sehr wahrscheinlich). Einzelne Defizite sind inzwischen behoben. |
| H5 | Es gibt Evidenz für Nozizeption oder Schmerz | **unbelegt** | Keine Primärstudie zeigt Nozizeption. Die US-Akademien halten Schmerzempfinden auf absehbare Zeit für äußerst unwahrscheinlich. Selbst die stärkste Vorsichtsposition räumt es ein. |
| H6 | Ein Pfad zu Fähigkeiten jenseits von LLMs | **teilbelegt** | Ein Stichproben-Effizienzvorteil in einem eng gefassten Pong-Setting ist publiziert (wahrscheinlich). Er stammt von derselben Gruppe und überträgt sich auf nichts anderes. |
| H7 | Moralstatus und Recht sind entscheidungsreif | **unbelegt** | Die juristische Analyse existiert und ist präzise. Die empirische Voraussetzung, an der sie hängt, ist nicht erfüllt. |

Die Frage nach William Gibson lässt sich damit beantworten, allerdings anders als die Schlagzeilen sie stellen. Angekommen ist die Infrastruktur: Man kann heute ein Gerät mit menschlichen Neuronen kaufen, per Python-SDK ansprechen und in einem Rechenzentrum in Singapur mieten. Nicht angekommen ist der Grund, warum man das tun sollte. Und am weitesten entfernt ist das, was die Berichterstattung ins Zentrum stellt, nämlich ein empfindungsfähiges Etwas in der Petrischale.

---

## Eine Unterscheidung, die fast überall fehlt

Drei verschiedene Dinge laufen in der Berichterstattung unter „Hirnorganoid".

**Monolayer-Kulturen.** Ausgesäte kortikale Neuronen in einer Schicht auf einem Elektrodenarray. Das ist das Substrat von DishBrain, dem Pong-Experiment von 2022. Kagan und Kollegen beschreiben es selbst als „incredibly simple" gegenüber dreidimensionalen Gehirnen (Grad A, Eigenangabe der Autoren).

**Neuronen auf planarem Array.** Der CL1 von Cortical Labs. 800.000 Neuronen, aus Haut- oder Blutproben erwachsener Spender reprogrammiert, auf einer strukturierten Metall-Glas-Schnittstelle.

**Echte 3D-Organoide.** Kugelige Zellaggregate von etwa einem halben Millimeter Durchmesser, wie sie FinalSpark auf Multi-Elektroden-Arrays betreibt, und wie sie in der Entwicklungsbiologie seit Lancaster und Knoblich verwendet werden.

Die Unterscheidung ist nicht pedantisch. Die berühmteste Lernstudie lief auf Monolayern, nicht auf Organoiden. Die Divergenz-Literatur zu Zellstress und Subtypspezifikation betrifft Organoide, nicht Monolayer. Wer beides zusammenwirft, überträgt Befunde auf Systeme, für die sie nicht erhoben wurden. Im untersuchten YouTube-Kanal passiert das durchgängig, und in der Fachpresse häufig.

---

## Säule 1: Technik

### Die Geräte, mit Preisschild

**Cortical Labs CL1.** Vorstellung März 2025, erste 115 Einheiten ab Sommer 2025 ausgeliefert. 35.000 US-Dollar pro Einheit, 20.000 beim Kauf im 30er-Rack. Fernzugriff als „wetware-as-a-service" für 300 Dollar pro Woche und Einheit. 800.000 menschliche Neuronen, 59 Eingangselektroden (der DishBrain-Prototyp hatte acht), Latenz unter einer Millisekunde (vorher fünf). Zelllebensdauer laut Herstellerseite „up to 6 months". Leistungsaufnahme 850 bis 1.000 Watt pro Rack (Grad D für die Herstellerangaben, Grad C für die Messungen in der Fachpresse).

Cortical Labs betreibt inzwischen die „Cortical Cloud" mit Rechenzentren in **Singapur und Melbourne**. Die Beschreibung auf der Herstellerseite lautet „an always-on network of living neurons", der Zugang läuft über ein Python-SDK und Jupyter-Notebooks. Damit existiert der Sache nach, was die Schlagzeilen „Rechenzentrum aus menschlichen Hirnzellen" nennen. Belastbare Zahlen zur installierten Kapazität veröffentlicht die Firma nicht.

**FinalSpark Neuroplatform.** Start 15. Mai 2024 in Vevey. Das begleitende Paper in *Frontiers in Artificial Intelligence* nennt über 1.000 verwendete Organoide über drei Jahre, vier MEAs mit je vier Organoiden, acht Elektroden pro Organoid, also 32 Elektroden insgesamt. Lebensdauer: anfangs wenige Stunden, „up to 100 days in best cases" (Grad A).

Was die Organoide dort taten, ist im Paper nachlesbar und bescheidener als die Berichterstattung: Modulation spontaner Aktivität durch hochfrequente Stimulation mit 95,5 Prozent Klassifikationsgenauigkeit, Parameteroptimierung zur Auslösung von Aktionspotentialen, und eine Closed-Loop-Bedingung mit Dopamin-Freisetzung als Belohnungssignal. Eine gelöste Rechenaufgabe ist das nicht. Es sind Aktivitätsänderungen.

### Was DishBrain wirklich zeigte

Kagan et al., *Neuron* 110:3952–3969.e8, DOI 10.1016/j.neuron.2022.09.001. Die Studie ist besser kontrolliert, als ihre Kritik vermuten lässt, und schwächer, als ihr Titel verspricht.

Kontrollbedingungen gab es: Medium ohne Zellen (sechs MEAs, 80 Sitzungen), Ruhebedingung ohne sensorische Information (20 Kulturen, 42 Sitzungen), eine In-silico-Kontrolle mit zufällig bewegtem Paddle (drei Seeds, 38 Sitzungen). Dazu 101 Sitzungen mit Mauszellen (neun Kulturen) und 138 mit menschlichen Zellen (elf Kulturen), insgesamt 399 Sitzungen. In einem zweiten Experiment mit 486 Sitzungen wurde die Rückkopplung variiert.

Die Effekte sind statistisch deutlich. Für menschliche kortikale Zellen berichten die Autoren eine Verbesserung über die Zeit mit t = 10,44 und p = 3,92 × 10⁻¹⁹, eine Zunahme langer Ballwechsel mit t = 10,38, eine Abnahme der Aufschlagfehler mit t = 5,95. In der Bedingung ohne Rückkopplung trat kein signifikantes Lernen auf. Wer behauptet, hier sei ohne Kontrollen gearbeitet worden, hat das Paper nicht gelesen. Diese Version der Gegenhypothese ist **entkräftet**.

Die entscheidende Einschränkung stammt von den Autoren selbst: „Between-session learning over multiple days was not robustly observed." Die Kulturen lernten die Assoziation in jeder Sitzung neu. Was gezeigt ist, ist kurzfristige, aktivitätsabhängige Anpassung innerhalb von etwa 20 Minuten. Was nicht gezeigt ist, ist Gedächtnis über Tage. Genau das ist die Grenze zwischen „Plastizität" und dem, was man umgangssprachlich Lernen nennt.

Weitere Selbstauskünfte der Autoren: Die sensorische Stimulation sei „much coarser compared with that for even simple in vivo organisms", Propriozeption fehle, und die Monolayer-Architektur sei einfach. Das Wort „pain" kommt im gesamten Paper nicht vor.

### Der Streit um das Wort

Der Titel sagt „exhibit sentience". Das Abstract sagt „apparent learning" und nennt das Ergebnis „synthetic biological intelligence". Die Definition, auf die sich die Autoren stützen, steht in der Einleitung und lautet, Sentienz sei „responsive to sensory impressions" (nach Friston, Wiese und Hobson 2020). Das ist ein technischer, entleerter Begriff. Er sagt nichts über Erleben.

29 Neurowissenschaftler widersprachen in *Neuron* 111:604–605 (DOI 10.1016/j.neuron.2023.02.009), unter ihnen Bernardo Sabatini, Karel Svoboda, Zachary Mainen, Daeyeol Lee und Jeffrey Schall. Ihre Einwände im Wortlaut:

> „attributing intelligence to a network that displays short-term plasticity is not supported by relevant scientific fields such as machine learning, neurobiology, and psychology."

> „The term sentience is notoriously hard to define but refers to a process that encompasses feeling, sensing, and subjective evaluation. The application of intelligence and sentience to neurons-in-a-dish in this paper is not based on any established or robust consensus on the definitions of these very important terms."

> „Instead, it is based on the authors' own recent theoretical propositions, which are general enough to allow the term to be applied to nearly any interactive computational system of even modest complexity."

> „Strong conclusions are compromised by weak results, some of which fail to adequately match control and experimental conditions."

Dazu ein Vorwurf fehlender Gelehrsamkeit: Kagan et al. würdigten frühere Arbeiten zu biologischen Netzen in geschlossenen Regelkreisen nicht, etwa Tessadori et al. 2012. Und ein wissenschaftskommunikativer Einwand, der für dieses Dossier zentral ist:

> „Media tend to directly republish information included in abstracts and significance statements, and interviews of scientists by media tend to amplify these statements."

Die Kritiker benennen auch die Interessenlage der Gegenseite, nämlich „potential future financial benefits for the possible usage of the methods in this paper". Cortical Labs ist ein Unternehmen, Kagan dessen wissenschaftlicher Leiter. Umgekehrt erklären die Kritiker für ihre beiden korrespondierenden Autoren, keine Patente oder Interessen zu haben; die übrigen 27 sind Mitzeichner.

Die Antwort von Kagan und Kollegen erschien in derselben Ausgabe, *Neuron* 111:606–607, unter dem Titel „Scientific communication and the semantics of sentience". Der Titel räumt ein, worum der Streit geht. Es ist ein Streit über Wortgebrauch, nicht über Messwerte.

Bewertung: Die Messungen halten. Die Begriffe halten nicht. Wer aus diesem Paper Empfindungsfähigkeit liest, liest den Titel, nicht die Daten.

### Was seither dazugekommen ist

Alam El Din et al. 2025, *Communications Biology*, DOI 10.1038/s42003-025-08632-5, aus dem Umfeld von Smirnova, Hartung und Kagan. Die Gruppe zeigt an Organoiden bis Woche 14 Synapsenbildung, glutamaterge und GABAerge Rezeptorexpression, eingangsspezifische Kurz- und Langzeitpotenzierung sowie -depression nach Theta-Burst-Stimulation, funktionelle Konnektivität und Kritikalität. Gemessen mit hochdichten MEAs, Calcium-Imaging und qPCR auf ARC, NPAS4, FOS, EGR1, BDNF und NPTX2 (Grad A).

Kritikalität quantifizieren sie über drei Maße: Deviation from Criticality Coefficient, Branching Ratio, Shape Collapse Error. Der Titel des Papers ist präzise gewählt: „the building blocks necessary for basic learning and memory". Bausteine, nicht Lernen. Aussagen über Bewusstsein macht das Paper nicht.

Das ist wichtig, weil im untersuchten Kanal die Kritikalität mit Bewusstsein verknüpft wird („criticality thought necessary for consciousness", 16. August 2026). Notwendig und hinreichend sind hier verschiedene Dinge. Kritikalität findet man auch in Sandhaufen und Waldbränden.

---

## Die Energiefrage

Hier steht die prominenteste Zahl des Feldes, und sie hält der Prüfung nicht stand.

**Was behauptet wird.** Bioprozessoren verbrauchten „a million times less power" als digitale Prozessoren. Der Satz ging 2024 durch Tom's Hardware, Slashdot und die Nachfolgeberichterstattung, stets FinalSpark zugeschrieben.

**Was in der Primärquelle steht.** Nichts davon. Im Paper in *Frontiers in Artificial Intelligence* (DOI 10.3389/frai.2024.1376042) kommt kein Faktor „eine Million" für Energieeffizienz vor. Zwei Prüfdurchgänge mit gezielter Volltextsuche bestätigen das. Was dort steht, sind zwei zitierte Zahlen: das menschliche Gehirn arbeite mit etwa 86 Milliarden Neuronen bei 20 Watt (nach Clark und Sokoloff 1999), und das Training von GPT-3 habe etwa 10 GWh erfordert (nach de Vries 2023). Beides ist übernommene Literatur, keine eigene Messung. Eigene Energiemessungen an den Organoiden enthält das Paper nicht.

**Wie der Faktor entsteht.** Aus der Gegenüberstellung von 20 Watt biologischem Gehirn und dem geschätzten Bedarf einer Silizium-Simulation desselben. FinalSparks Mitgründer Fred Jordan hat das öffentlich so hergeleitet. Das ist eine Modellrechnung, Grad B. Sie wird als Messdatum, Grad A, weitergegeben. Genau die Verwechslung, die die Zahlen-Regel verbietet.

**Was gemessen ist.** Ein Rack CL1-Einheiten zieht 850 bis 1.000 Watt. Das ist die Größenordnung eines GPU-Servers. Der Strom fließt nicht in die Neuronen, sondern in Inkubation, Temperaturregelung, Perfusion, Verstärker und Steuerelektronik. Die 20 Watt des menschlichen Gehirns enthalten einen Körper, der Temperatur, pH und Nährstoffversorgung mitliefert. Ein Organoid in Kultur hat keinen Körper und braucht deshalb eine Maschine, die ihn ersetzt. Diese Maschine ist der Energieverbrauch.

Damit ist H3 in der verbreiteten Form **unbelegt**. Ein Effizienzvorteil auf der Ebene der reinen Signalverarbeitung bleibt physikalisch plausibel und ist der ernsthafte Kern der Idee. Für heutige Geräte ist er nicht nur unbewiesen, er zeigt in der Messung in die andere Richtung.

Das HTML-Dossier enthält zu dieser Frage ein Slider-Rechenmodell. Es ist ausdrücklich Illustration, keine Prognose, und jeder Parameter trägt seine Quelle oder die Markierung „gesetzt, nicht geschätzt".

Mit den belegten Werten, also 24 Millionen Neuronen pro Rack (30 × 800.000) und 925 Watt, und mit den gesetzten Annahmen von einem Spike pro Neuron und Sekunde und einer nutzbaren Operation pro Spike, ergibt sich: 3,9 × 10⁻⁵ Joule pro Operation biologisch gegen 7,0 × 10⁻¹³ Joule bei einem Beschleuniger mit 10¹⁵ Operationen pro Sekunde und 700 Watt. Das ist ein Faktor von etwa 5,5 × 10⁷ zuungunsten der Biologie. Gleichstand verlangte 1,3 × 10¹⁵ Operationen pro Sekunde aus dem Rack, also das Hundertmillionenfache dessen, was 24 Millionen Neuronen bei 1 Hz liefern.

Die beiden gesetzten Annahmen sind die Schwachstelle dieser Rechnung, und sie sind bewusst großzügig zugunsten der Biologie gewählt: Eine Operation pro Spike unterstellt, dass jeder Spike vollständig nutzbare Information trägt. Wer der Biologie mehr zutraut, kann im Modell nach oben schieben und sieht, wie weit es reicht. Der Punkt der Illustration ist nicht die exakte Zahl, sondern die Richtung des Vorzeichens. Sie steht der Marketingaussage entgegen.

---

## Vergleich mit LLMs

Es gibt eine einzige belastbare Publikation, die biologische Kulturen direkt gegen moderne Lernalgorithmen stellt: Khajehnejad, Habibollahi, Paul, Razi und Kagan, arXiv:2405.16946, eingereicht 27. Mai 2024. Verglichen wurden DishBrain-Kulturen mit DQN, A2C und PPO im selben vereinfachten Pong.

Das Ergebnis im Wortlaut: „when samples are limited to a real-world time course, even these very simple biological cultures outperformed deep RL algorithms across various game performance characteristics, implying a higher sample efficiency."

Was das trägt und was nicht. Es trägt eine Aussage über Stichprobeneffizienz unter Echtzeitbedingungen in einer Aufgabe. Es trägt keine Aussage über absolute Leistung, über Generalisierung, über andere Aufgaben oder über Skalierung. Die Autorengruppe ist dieselbe, die das Substrat kommerzialisiert, was die Interessenlage nicht entwertet, aber deklariert werden muss (Grad A für die Messung, Grad D für die Einordnung).

Der Vergleich mit LLMs selbst ist schief, und zwar in beide Richtungen. Ein Sprachmodell hat keine Aufgabe, in der es mit 800.000 Neuronen in einer Nährlösung konkurriert, und die Neuronen haben keine Aufgabe, in der sie Text verarbeiten. Die Skalen liegen bei den Parametern um sechs bis sieben Größenordnungen auseinander. Was die biologische Seite tatsächlich vorführt, ist Anpassung in Sekunden bis Minuten aus sehr wenigen Beispielen. Was die Transformer-Seite vorführt, ist Kompetenz aus sehr vielen Beispielen. Beide Beobachtungen sind interessant. Ein gemeinsamer Maßstab existiert nicht.

Deshalb steht H6 auf **teilbelegt** und nicht höher. Der Satz „Biocomputing ist der Weg zu echter KI" ist im untersuchten Kanal mehrfach zu finden. In der Literatur ist er eine Absichtserklärung. Die Roadmap-Papiere zur „organoid intelligence" aus Johns Hopkins (Morales Pantoja et al. 2023, Smirnova, Morales Pantoja und Hartung 2023) formulieren ihn selbst als Programm, nicht als Befund.

---

## Entwicklungstreue: Wie anders sind sie?

Hier ist die Beleglage am dichtesten, und sie hat meine Ausgangsvermutung teilweise widerlegt.

**Was divergiert.** Bhaduri et al. 2020, *Nature* 578:142–148, aus dem Labor von Arnold Kriegstein. Die Gruppe verglich Einzelzell-Transkriptome primärer menschlicher Kortexzellen mit Organoiden. Befund: Die groben Zellklassen entstehen, aber die Organoide „do not recapitulate distinct cellular subtype identities and appropriate progenitor maturation". Areale Signaturen erscheinen, sind aber räumlich nicht getrennt. Ursache ist ektopisch aktivierter Zellstress, und zwar kausal: Aktiviert man denselben Stress in primären Zellen in Kultur, verschlechtert sich die Subtypspezifikation ebenfalls (Grad A).

Interessant ist die Rettungsbedingung. Nach Transplantation in Mauskortex geht der Stress zurück, messbar an reduzierter Expression von PGK1, ARCN1 und GORASP2, und die Subtypidentitäten verbessern sich. Der Defekt liegt also nicht im Gewebe, sondern in der Kultur. Das ist die stärkste vorliegende Antwort auf die Frage, ob den Organoiden „echte Körperzellen zur Interaktion" fehlen: Ja, und man sieht am Transplantationsexperiment genau, was ihr Fehlen anrichtet.

**Was nicht mehr stimmt.** Die Behauptung, Organoiden fehlten grundsätzlich Mikroglia, ist überholt. Ormel et al. 2018, *Nature Communications*, DOI 10.1038/s41467-018-06684-2, zeigen, dass Mikroglia sich in zerebralen Organoiden von selbst entwickeln, mit charakteristischer verzweigter Morphologie und Phagozytose-Funktion. Ich hatte diese Lücke als Teil der Gegenhypothese angesetzt. Sie ist geschlossen.

Ähnlich bei der Vaskularisierung. Mansour et al. 2018, *Nature Biotechnology*, erreichen funktionelle Blutgefäße und Graft-zu-Host-Synapsen durch Transplantation. Shi et al. 2020, *PLoS Biology*, halten vaskularisierte Organoide über 200 Tage. Die Grenze ist damit keine prinzipielle mehr, sondern eine der Kulturbedingungen.

**Was bleibt.** Die Reifung endet vor der Geburt. Di Lullo und Kriegstein 2017 sowie Qian, Song und Ming 2019 halten fest, dass kortikale Schichtung, Gyrifizierung und komplexe neuronale Schaltkreise unvollständig bleiben. Quantitative Obergrenzen für nicht vaskularisierte Organoide, etwa eine kritische Größe für nekrotische Kerne, habe ich in der Literatur nicht in belastbarer Form gefunden; das gehört in die Restliste.

Der Kanal-Claim, Organoide entwickelten spontan funktionierende Augen, hat einen echten Kern. Gabriel et al. 2021, *Cell Stem Cell* 28:1740–1757.e8, berichten bilaterale optische Vesikel mit retinalen Vorläuferzellen, und „various light intensities could trigger photosensitive activity", zurücksetzbar nach transientem Photobleaching (Grad A). Lichtempfindliches Gewebe ist damit belegt. Sehen ist es nicht, und ein Empfänger, der aus dem Signal etwas machen könnte, existiert im Organoid nicht.

Verdikt H4: **teilbelegt**. Divergenz ist gemessen und mechanistisch verstanden. Sie ist teilweise reversibel, und mehrere Einzeldefizite sind seit 2018 behoben. Der harte Punkt bleibt die Entwicklungsstufe.

---

## Brücke: Was müsste wahr sein, damit Moralstatus zur Frage wird?

Jede Moralstatus-Behauptung setzt stillschweigend etwas Empirisches voraus. Vier Bedingungen tauchen in der Literatur immer wieder auf. Für jede lässt sich sagen, wie die Beleglage steht.

**Erstens, Integration über Distanz.** Unter der Global-Workspace-Perspektive braucht Erleben weiträumige kortiko-kortikale Kopplung. Lavazza hält fest, dass die Millimeter-Größe der Organoide genau das ausschließt. Bedingung nicht erfüllt, und zwar aus geometrischen Gründen.

**Zweitens, Bewertungssignale.** Etwas muss für das System besser oder schlechter sein können. Dopamin-Freisetzung im Closed Loop, wie bei FinalSpark, ist ein Reizmuster mit Belohnungsfunktion im Regelkreis. Dass es intern als Valenz repräsentiert wird, ist nicht gezeigt. Bedingung offen, und schwer prüfbar.

**Drittens, Persistenz.** Ohne Gedächtnis über die Sitzung hinaus gibt es kein Subjekt, dem etwas widerfährt. Kagan et al. beobachteten Lernen zwischen Sitzungen nicht robust. Bedingung nicht erfüllt.

**Viertens, Nozizeption.** Es braucht Bahnen, die Schädigungssignale erzeugen und weiterleiten. Nozizeptoren sitzen in der Peripherie, die Weiterleitung läuft über Spinalganglien und Thalamus. Ein kortikales Organoid hat keine Peripherie, kein Rückenmark und keinen Thalamus. Bedingung nicht erfüllt.

Damit ist die Brücke tragfähig genug für eine klare Aussage. Die ethische Debatte ist nicht deshalb voreilig, weil ihre Fragen falsch wären, sondern weil alle vier Voraussetzungen, an denen sie hängt, derzeit unerfüllt oder unprüfbar sind. Wer für Vorsicht argumentiert, argumentiert für Vorsicht gegenüber einer künftigen Konfiguration. Das ist legitim, sollte aber so gesagt werden.

---

## Säule 2: Bewusstsein, Moral, Recht

### Schmerz

Die Frage aus dem Ausgangsauftrag lautete, ob diese Zellen Schmerz empfinden und wie. Die Antwort ist so klar, wie sie in diesem Feld werden kann.

Der Nationale Forschungsrat der USA hat 2021 einen Bericht zu neuralen Organoiden, Transplantaten und Chimären vorgelegt. Befund III.5 im Wortlaut:

> „The complexity of neural organoids is currently limited. It is extremely unlikely that in the foreseeable future they would possess capacities that, given current understanding, would be recognized as awareness, consciousness, emotion, or the experience of pain."

Befund IV.2 ergänzt eine methodische Warnung, die in beide Richtungen schneidet:

> „Most current methods for assessing consciousness (sometimes called awareness or sentience) and pain cannot be applied to organoids because understanding of these capacities depends largely on observing behaviors in whole animals."

Man kann es also nicht direkt messen. Das ist kein Argument für Empfindungsfähigkeit, sondern eines für Zurückhaltung bei Behauptungen in beide Richtungen (Grad C, Expertengremium, ohne kommerzielles Eigeninteresse).

Die Gegenprobe an der stärksten Vorsichtsposition. Andrea Lavazza hat über ein Dutzend Arbeiten zu diesem Thema veröffentlicht und argumentiert konsequent für Vorsorge. Er stützt sich auf die Integrated Information Theory, auf den Perturbational Complexity Index und auf den Befund, dass ein auf EEG-Merkmalen von Frühgeborenen trainiertes Modell das Alter einer Organoidkultur aus deren Aktivität vorhersagen kann. Und selbst er kommt zu dem Schluss, „current biotechnologies seem incapable of producing cerebral organoids that mature beyond the equivalent of a prenatal brain", und nennt als fehlend: Vaskularisierung, Mikroglia, sensorische Eingänge und „structured relations with the external environment".

Wenn die stärkste Position für Vorsicht die empirische Behauptung nicht erhebt, dann erhebt sie niemand, der die Literatur kennt. Der Kanal-Claim vom September 2023, Organoide „experience pain and stimuli unlike your own brain", ist **entkräftet**. Der Claim vom April 2025, sie könnten „pain and pleasure" erfahren, ebenso.

Zu suchen wäre noch die Gegenevidenz zu meinem eigenen Ergebnis, also eine Primärstudie, die Nozizeption in Organoiden zeigt. Eine Abfrage über Europe PMC nach Hirn- oder Kortexorganoiden in Verbindung mit Nozizeption, Schmerz oder Leiden ergibt 478 Treffer, von denen die höchstzitierten sich mit Virusinfektion und Krankheitsmodellen befassen. Eine Arbeit, die Nozizeption in Organoiden untersucht, ist darunter nicht. Das ist ein Negativbefund und als solcher schwächer als ein Positivbefund; er steht in der Restliste.

### Bewusstsein

Zwei Dinge müssen getrennt bleiben. Der klinische Bewusstseinsbegriff verlangt Wachheit und Wachheitszyklen, und dafür braucht es Hirnstamm und aufsteigendes retikuläres System. Beides fehlt in kortikalen Organoiden. Der Kanal sagt das an einer Stelle korrekt („lack brainstem structures and fail to meet medical criteria for consciousness", 12. März 2025) und widerspricht sich an anderen Stellen selbst.

Der theoretische Bewusstseinsbegriff ist offen. Unter IIT wäre Integration graduell und ließe sich prinzipiell auch kleinen Systemen zusprechen. Unter Global Workspace scheitert es an der Reichweite der Verbindungen. Unter der temporo-spatialen Theorie, die Zilio und Lavazza diskutieren, ist die Frage nicht entschieden. Wer aus dieser Theorienlage eine Tatsachenbehauptung macht, macht aus Uneinigkeit Gewissheit.

Die US-Akademien halten auf dieser Basis fest: „it appears at present that neural organoids have no more moral standing than other in vitro human neural tissues or cultures."

### Recht

Hier existiert präzise Arbeit, und sie wird in der öffentlichen Debatte fast nie zitiert. Kataoka, Lee und Sawai, *Journal of Law and the Biosciences* 2023, DOI 10.1093/jlb/lsad007, trennen zwei Begriffe, die durchgängig verwechselt werden. Natürliche Rechtspersönlichkeit hängt an Eigenschaften des Wesens. Juristische Rechtspersönlichkeit ist eine Zuschreibung und kann Schiffen, Stiftungen und Flüssen zukommen. Aus der Frage „ist es empfindungsfähig?" folgt für die zweite Kategorie nichts, und aus einer Schutzregelung folgt nicht Personalität.

Was regulatorisch gilt, sagt Befund V.2 des Akademien-Berichts: „Neural organoids will not raise issues that require additional oversight until and unless they become significantly more complex." Für Transplantate und Chimären genügen die bestehenden Mechanismen, mit der Empfehlung, die Entwicklung zu beobachten.

Der Kanal-Claim vom Februar 2025, für im Labor gezogene körperlose menschliche Organe existiere kein Rechtsrahmen, ist damit **teilbestätigt**. Ein eigener Rahmen fehlt tatsächlich. Ein rechtliches Vakuum besteht nicht, weil das Gewebe als menschliches biologisches Material geregelt ist, über Einwilligung der Spender, Biobank- und Gewebevorschriften.

Zwei Nebenpunkte aus dem Kanal, die eine Prüfung wert waren. Die Aussage, kein US-Bundesgesetz verbiete ausdrücklich reproduktives Klonen von Menschen, ist im Kern korrekt und betrifft die Bundesebene, nicht die Einzelstaaten. Die Aussage, der Kongress habe mehrfach versucht, Chimärenforschung zu verbieten, trifft ebenfalls zu und bezieht sich auf wiederholte Anläufe zu Haushaltsklauseln. Beide Punkte sind für Organoid-Compute allerdings kaum relevant. Sie stehen im Kanal in einem Kontext, der ihre Reichweite überdehnt.

---

## Der Kanal als Claim-Quelle

Geprüft wurden 217 von 802 Videos des Kanals `@bearbaitofficial`, davon 91 im Volltranskript. Daraus wurden 618 prüfbare Behauptungen extrahiert, 485 davon aus den letzten zwei Jahren. Die Betreiberin stellt sich im Video als Molekularbiologin vor. Der Kanal ist damit Grad D, eine Stimme mit Reichweiteninteresse, kein Beleg.

Der Kanal arbeitet dicht an der Literatur. Viele Einzelangaben treffen zu: die Existenz von CL1 und Neuroplatform, die kommerzielle Verfügbarkeit, 16 Organoide pro Chip bei FinalSpark, DARPA-Interesse an Organ-on-Chip seit 2012, die Organoide aus dem Blut eines verstorbenen Musikers, die militärische Finanzierung im Umfeld von DishBrain. Das ist mehr, als bei Wissenschafts-Kanälen üblich ist.

Systematisch verschiebt sich etwas anderes, nämlich die Modalität. Aus „meets a formal definition of sentience" wird „is sentient". Aus „responds to stimuli" wird „experiences pain". Aus „the company claims" wird „it is".

Drei Belege für diese Drift, alle innerhalb des Kanals:

**Widerspruch zur Sentienz.** Am 12. März 2025 sagt der Kanal in einem Video beides: Organoide erfüllten funktionale Sentienz-Definitionen, und ihnen fehlten Hirnstammstrukturen, weshalb sie medizinische Bewusstseinskriterien verfehlten. Am 12. Januar 2025 heißt es, ohne Schlaf-Wach-Zyklus könnten sie medizinisch nicht als bewusst gelten. Zwischen April 2025 und September 2025 erscheint dann wiederholt die unqualifizierte Form: „technically sentient", „capable of having experiences and preferences". Der Vorbehalt verschwindet, die Aussage bleibt.

**Preisdrift.** Der CL1 kostet im Kanal durchgängig „about $30,000", von März 2025 bis Mai 2026. Der Listenpreis ist 35.000 Dollar, im Rack 20.000. Keine große Sache, aber ein Indikator: Die Zahl wurde einmal aufgenommen und nicht mehr geprüft.

**Lebensdauer-Drift.** Am 20. Mai 2026 heißt es, CL1-Organoide hätten drei Monate Lebensdauer. Am 4. August 2026 sind es etwa sechs Monate. Der Hersteller sagt „up to 6 months". Hier korrigiert sich der Kanal im Zeitverlauf nach oben, also zum Hersteller hin, ohne die frühere Angabe zu erwähnen.

Ein vierter Fall ist der interessanteste, weil er nicht Übertreibung ist, sondern eine sachliche Neuigkeit. Am 4. August 2026 berichtet der Kanal von einem Biocomputer-Rechenzentrum in Singapur. Das trifft zu, Cortical Labs betreibt die Cortical Cloud aus Singapur und Melbourne. Die begleitende Zahl von 1.000 Organoid-Einheiten ließ sich nicht verifizieren; die Firma veröffentlicht keine Kapazitätsangaben. Sie steht in der Restliste.

---

## Belegtabelle

Auswahl der tragenden Einzelbehauptungen. Vollständiger Rohbestand in [research/claims.md](research/claims.md).

| Behauptung | Urheber, Datum | Prüfstatus | Erstquelle | Grad |
|---|---|---|---|---|
| CL1 ist kommerziell verfügbar | Cortical Labs, 03/2025 | bestätigt | corticallabs.com; IEEE Spectrum | D/C |
| CL1 kostet ca. 30.000 USD | Kanal, 03/2025–05/2026 | entkräftet | Listenpreis 35.000 USD, 20.000 im 30er-Rack | C |
| CL1 enthält 800.000 Neuronen | Cortical Labs | bestätigt | Herstellerangabe, IEEE Spectrum | D |
| Zelllebensdauer CL1 3 Monate | Kanal, 05/2026 | entkräftet | Hersteller: „up to 6 months" | D |
| 59 Eingangselektroden, Latenz < 1 ms | Cortical Labs | bestätigt | IEEE Spectrum | C |
| Leistungsaufnahme 850–1.000 W pro Rack | Fachpresse | bestätigt | IEEE Spectrum | C |
| Rechenzentrum mit Hirngewebe in Singapur | Kanal, 08/2026 | bestätigt | corticallabs.com/cloud: Singapur, Melbourne | D |
| Dort 1.000 Organoid-Einheiten | Kanal, 08/2026 | nicht prüfbar | keine Kapazitätsangabe der Firma | – |
| Bioprozessoren brauchen 1 Mio. mal weniger Energie | FinalSpark/Presse, 2024 | entkräftet | Primärpaper enthält den Faktor nicht; Herleitung ist Modellrechnung | B als A dargestellt |
| Gehirn: 86 Mrd. Neuronen bei 20 W | FinalSpark-Paper | bestätigt als Zitat | Clark und Sokoloff 1999, zitiert | A (fremd) |
| GPT-3-Training ca. 10 GWh | FinalSpark-Paper | bestätigt als Zitat | de Vries 2023, zitiert | B |
| FinalSpark: >1.000 Organoide über 3 Jahre, 32 Elektroden | FinalSpark-Paper | bestätigt | 10.3389/frai.2024.1376042 | A |
| Organoid-Lebensdauer bis 100 Tage | FinalSpark-Paper | bestätigt | ebd. | A |
| Neuronen lernten Pong in 5 Minuten | Kagan et al. 2022 | teilbestätigt | „apparent learning within five minutes"; Effekt real, Begriff „Lernen" strittig | A |
| Kontrollbedingungen fehlten | Kritik-Lesart | entkräftet | 4 Kontrollarme, 399 Sitzungen | A |
| Lernen über Sitzungen hinweg | implizit im Kanal | entkräftet | Autoren: „not robustly observed" | A |
| Kagan et al. behaupteten Sentienz | Kanal, mehrfach | teilbestätigt | im Titel ja, definiert als „responsive to sensory impressions" | A |
| Organoide empfinden Schmerz | Kanal, 09/2023, 04/2025 | entkräftet | NASEM Befund III.5; „pain" fehlt in Kagan et al. | C/A |
| Organoide sind „technisch sentient" | Kanal, 2025–2026 | teilbestätigt | trifft nur für die entleerte Definition zu, nicht für Erleben | A/C |
| Organoide erfüllen klinische Bewusstseinskriterien | Kanal, 10/2024 | entkräftet | Hirnstamm und Wachheitszyklen fehlen; NASEM | C |
| Organoide entwickeln spontan Augen | Kanal, mehrfach | teilbestätigt | Gabriel et al. 2021: optische Vesikel, photosensitiv; kein Sehen | A |
| Organoide divergieren von fetalem Kortex | – | bestätigt | Bhaduri et al. 2020, Nature 578:142–148 | A |
| Organoiden fehlen Mikroglia | eigene Gegenhypothese | entkräftet | Ormel et al. 2018 | A |
| Vaskularisierung ist prinzipielle Grenze | eigene Gegenhypothese | entkräftet | Mansour et al. 2018; Shi et al. 2020 (>200 Tage) | A |
| Biologische Kulturen schlagen Deep RL | Kagan-Gruppe 2024 | teilbestätigt | arXiv:2405.16946, nur Stichprobeneffizienz, zeitgematcht | A |
| Kein Rechtsrahmen für körperlose Hirne | Kanal, 02/2025 | teilbestätigt | kein eigener Rahmen, aber Gewebe- und Einwilligungsrecht greift | C |
| Kein US-Bundesgesetz verbietet reproduktives Klonen | Kanal, 12/2025 | bestätigt | Bundesebene; Einzelstaaten abweichend | C |
| Organoide brauchen keine neue Aufsicht (noch) | – | bestätigt | NASEM Befund V.2 | C |
| Organoide aus Blut eines verstorbenen Musikers | Kanal, 04/2025 | nicht abgeschlossen | Projekt existiert; Details nicht am Primärmaterial geprüft | – |
| DARPA-Interesse an Organ-on-Chip seit 2012 | Kanal, 09/2024 | nicht abgeschlossen | plausibel, Programmdokumente nicht eingesehen | – |
| NeXorg sammelte über 42 Mio. USD ein | Kanal, 06/2026 | nicht prüfbar | keine unabhängige Quelle gefunden | – |

---

## Restliste

Ungeprüft geblieben, mit Grund:

- **Installierte Kapazität der Cortical Cloud.** Firma veröffentlicht keine Zahlen. Die Kanal-Angabe von 1.000 Einheiten bleibt offen.
- **Nozizeption in Organoiden, Positivbefund.** 478 Treffer in Europe PMC, keine Arbeit zum Thema unter den höchstzitierten. Ein systematisches Screening aller Treffer stand im Zeitbudget nicht zur Verfügung. Der Befund ist damit ein Negativbefund und schwächer als eine geprüfte Nichtexistenz.
- **Quantitative Größengrenze nicht vaskularisierter Organoide.** Diffusionsgrenzen und kritische Durchmesser für nekrotische Kerne werden in Reviews als Herausforderung genannt, aber nicht beziffert. Vermutlich in Primärarbeiten vorhanden, nicht gefunden.
- **Kagan et al., Antwort auf die Kritik, Volltext.** Titel und Fundstelle sind gesichert (Neuron 111:606–607). Der Volltext liegt hinter der Elsevier-Paywall, HTTP 403. Zitiert wird nur der Titel.
- **NeXorg, 42 Mio. USD.** Keine unabhängige Bestätigung gefunden. Firmenname möglicherweise durch die Auto-Untertitel verstümmelt.
- **Revivification, Alvin Lucier.** Projekt im Kanal genannt, Wikipedia-Seite existiert nicht, Primärmaterial der Ausstellung nicht eingesehen.
- **DARPA-Programmdokumente ab 2012.** Nicht eingesehen.
- **Videoauswahl.** Die 217 Videos wurden über Titel-Stichwörter ausgewählt. Einschlägige Videos mit unauffälligem Titel können fehlen. Die 126 Videos der zweiten Auswahlstufe liegen nur als Metadaten vor, nicht als Transkript.
- **Auto-Untertitel.** Alle Kanal-Zitate stammen aus maschinellen Untertiteln. Eigennamen sind darin häufig verstümmelt („Critical Labs" für Cortical Labs, „neurop platform" für Neuroplatform). Kein Zitat aus einem Transkript wurde am Video gegengehört.
- **Kritikalität und Bewusstsein.** Dass Kritikalität für Bewusstsein notwendig sei, wird im Kanal behauptet. Die Primärarbeit erhebt diese Behauptung nicht. Ob sie in der Bewusstseinsliteratur belastbar vertreten wird, wurde nicht geprüft.

---

## Was das Ergebnis kippen könnte

Zuerst die offenen Fragen, die das Verdikt ändern würden.

Eine unabhängige Replikation des DishBrain-Effekts durch eine Gruppe ohne kommerzielles Interesse liegt nicht vor. Fällt sie positiv aus, wird H2 stärker; fällt sie negativ aus, bricht der empirische Kern des Feldes weg. Bisher hat niemand außerhalb der Gruppe es öffentlich versucht, was für ein Feld dieser Sichtbarkeit auffällig ist.

Eine Messung der Energie pro Operation an einem realen Gerät, gegen einen Beschleuniger auf derselben Aufgabe, existiert nicht. Solange sie fehlt, ist jede Effizienzaussage in diesem Feld Grad B.

Ein Assembloid mit kortiko-hippocampaler Verschaltung würde die Persistenz-Bedingung aus der Brückensektion angreifen. Alam El Din et al. nennen es selbst als nächsten nötigen Schritt. Gelingt Gedächtnis über Tage, verschiebt sich die Diskussion um Moralstatus von einer künftigen zu einer gegenwärtigen.

Und eine methodische Warnung, die in beide Richtungen gilt: Der Befund IV.2 der US-Akademien sagt, dass die etablierten Verfahren zur Bewusstseins- und Schmerzmessung auf Organoide nicht anwendbar sind. Mein Verdikt zu H5 stützt sich deshalb auf ein Strukturargument, nämlich das Fehlen von Peripherie, Rückenmark und Thalamus, nicht auf eine negative Messung. Strukturargumente sind belastbar, solange die Struktur bekannt ist. Sie sind kein Beweis.

---

## Quellen

**Primärliteratur**

- Kagan BJ, Kitchen AC, Tran NT, Habibollahi F, Khajehnejad M, Parker BJ, Bhat A, Rollo B, Razi A, Friston KJ (2022). In vitro neurons learn and exhibit sentience when embodied in a simulated game-world. *Neuron* 110:3952–3969.e8. [doi:10.1016/j.neuron.2022.09.001](https://doi.org/10.1016/j.neuron.2022.09.001), [PMC9747182](https://pmc.ncbi.nlm.nih.gov/articles/PMC9747182/)
- Balcı F, Ben Hamed S, Boraud T, Bouret S, Brochier T, Brun C, Cohen JY, Coutureau E, Deffains M, Doyère V, Gregoriou GG, Heimel JA, Kilavik BE, Lee D, Leuthardt EC, Mainen ZF, Mathis M, Monosov IE, Naudé J, Orsborn AL, Padoa-Schioppa C, Procyk E, Sabatini B, Sallet J, Sandi C, Schall JD, Soltani A, Svoboda K, Wilson CRE, Zimmermann J (2023). A response to claims of emergent intelligence and sentience in a dish. *Neuron* 111:604–605. [doi:10.1016/j.neuron.2023.02.009](https://doi.org/10.1016/j.neuron.2023.02.009)
- Kagan BJ, Razi A, Bhat A, Kitchen AC, Tran NT, Habibollahi F, Khajehnejad M, Parker BJ, Rollo B, Friston KJ (2023). Scientific communication and the semantics of sentience. *Neuron* 111:606–607. [doi:10.1016/j.neuron.2023.02.008](https://doi.org/10.1016/j.neuron.2023.02.008)
- Khajehnejad M, Habibollahi F, Paul A, Razi A, Kagan BJ (2024). Biological neurons compete with deep reinforcement learning in sample efficiency in a simulated gameworld. [arXiv:2405.16946](https://arxiv.org/abs/2405.16946)
- Jordan FD et al. (2024). Open and remotely accessible Neuroplatform for research in wetware computing. *Frontiers in Artificial Intelligence*. [doi:10.3389/frai.2024.1376042](https://doi.org/10.3389/frai.2024.1376042)
- Alam El Din DM, Moenkemoeller L, Loeffler A, Habibollahi F, Schenkman J, Mitra A, van der Molen T, Ding L, Laird J, Schenke M, Johnson EC, Kagan BJ, Hartung T, Smirnova L (2025). Human neural organoid microphysiological systems show the building blocks necessary for basic learning and memory. *Communications Biology*. [doi:10.1038/s42003-025-08632-5](https://doi.org/10.1038/s42003-025-08632-5), [PMC12357958](https://pmc.ncbi.nlm.nih.gov/articles/PMC12357958/)
- Bhaduri A, Andrews MG, Mancia Leon W, Jung D, Shin D, Allen D, Jung D, Schmunk G, Haeussler M, Salma J, Pollen AA, Nowakowski TJ, Kriegstein AR (2020). Cell stress in cortical organoids impairs molecular subtype specification. *Nature* 578:142–148. [doi:10.1038/s41586-020-1962-0](https://doi.org/10.1038/s41586-020-1962-0)
- Gabriel E, Albanna W, Pasquini G et al. (2021). Human brain organoids assemble functionally integrated bilateral optic vesicles. *Cell Stem Cell* 28:1740–1757.e8. [doi:10.1016/j.stem.2021.07.010](https://doi.org/10.1016/j.stem.2021.07.010)
- Ormel PR, Vieira de Sá R, van Bodegraven EJ et al. (2018). Microglia innately develop within cerebral organoids. *Nature Communications*. [doi:10.1038/s41467-018-06684-2](https://doi.org/10.1038/s41467-018-06684-2)
- Mansour AA, Gonçalves JT, Bloyd CW et al. (2018). An in vivo model of functional and vascularized human brain organoids. *Nature Biotechnology*. [doi:10.1038/nbt.4127](https://doi.org/10.1038/nbt.4127)
- Shi Y, Sun L, Wang M et al. (2020). Vascularized human cortical organoids model cortical development in vivo. *PLoS Biology*. [doi:10.1371/journal.pbio.3000705](https://doi.org/10.1371/journal.pbio.3000705)

**Ethik, Recht, Gremien**

- National Academies of Sciences, Engineering, and Medicine (2021). *The Emerging Field of Human Neural Organoids, Transplants, and Chimeras*. Befunde III.5, IV.2, V.2. [nap.edu/26078](https://nap.nationalacademies.org/catalog/26078/)
- Lavazza A (2020). Human cerebral organoids and consciousness: a double-edged sword. *Monash Bioethics Review*. [doi:10.1007/s40592-020-00116-y](https://doi.org/10.1007/s40592-020-00116-y), [PMC7723930](https://pmc.ncbi.nlm.nih.gov/articles/PMC7723930/)
- Kataoka M, Lee TL, Sawai T (2023). The legal personhood of human brain organoids. *Journal of Law and the Biosciences*. [doi:10.1093/jlb/lsad007](https://doi.org/10.1093/jlb/lsad007)
- Koplin JJ, Savulescu J (2019). Moral limits of brain organoid research. *Journal of Law, Medicine & Ethics*. [doi:10.1177/1073110519897789](https://doi.org/10.1177/1073110519897789)
- Sawai T, Sakaguchi H, Thomas E, Takahashi J, Fujita M (2019). The ethics of cerebral organoid research: being conscious of consciousness. *Stem Cell Reports*. [doi:10.1016/j.stemcr.2019.08.003](https://doi.org/10.1016/j.stemcr.2019.08.003)
- Kataoka M, Niikawa T, Nagaishi N, Lee TL, Erler A, Savulescu J, Sawai T (2025). Beyond consciousness: ethical, legal, and social issues in human brain organoid research. *European Journal of Cell Biology*. [doi:10.1016/j.ejcb.2024.151470](https://doi.org/10.1016/j.ejcb.2024.151470)
- Morales Pantoja IE, Smirnova L, Muotri AR et al. (2023). First Organoid Intelligence (OI) workshop to form an OI community. *Frontiers in Artificial Intelligence*. [doi:10.3389/frai.2023.1116870](https://doi.org/10.3389/frai.2023.1116870)
- Smirnova L, Morales Pantoja IE, Hartung T (2023). Organoid intelligence (OI): the ultimate functionality of a brain microphysiological system. *ALTEX*. [doi:10.14573/altex.2303261](https://doi.org/10.14573/altex.2303261)

**Hersteller und Presse (Grad D beziehungsweise C)**

- Cortical Labs, [corticallabs.com/cl1](https://corticallabs.com/cl1.html) und [corticallabs.com/cloud](https://corticallabs.com/cloud)
- FinalSpark, [finalspark.com](https://finalspark.com/)
- IEEE Spectrum, [Biological computer for sale](https://spectrum.ieee.org/biological-computer-for-sale)
- Forbes, [A computer with 800,000 human neurons](https://www.forbes.com/sites/johnkoetsier/2025/06/04/hardware-software-meet-wetware-a-computer-with-800000-human-neurons/)
- Tom's Hardware, [World's first bioprocessor](https://www.tomshardware.com/pc-components/cpus/worlds-first-bioprocessor-uses-16-human-brain-organoids-for-a-million-times-less-power-consumption-than-a-digital-chip)

**Claim-Quelle (Grad D)**

- YouTube-Kanal `@bearbaitofficial`, 802 Videos, davon 217 ausgewählt und 91 im Volltranskript. Rohmaterial in [sources/youtube/](sources/youtube/), extrahierte Behauptungen in [research/claims.md](research/claims.md).
