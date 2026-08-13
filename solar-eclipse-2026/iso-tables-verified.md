# ISO-12312-2-Tabellen — verifiziert & neu durchgerechnet

Anhang zum [Schweißglas-&-Augenschutz-Dossier](2026-08-11_schweissglas-augenschutz_dossier.html). Er hält die **Originalwerte** der Norm fest, die das Dossier bislang nur aus Sekundärquellen zitiert, belegt, **wie** sie beschafft wurden, und rechnet die zentrale Sicherheitsaussage (DIN 5 + DIN 11 gestapelt) noch einmal direkt gegen den Normtext durch.

Stand: 13.08.2026. Wiedergegeben werden Zahlenwerte (Fakten, nicht urheberrechtsfähig) und die eigene Nachrechnung — nicht der urheberrechtlich geschützte Fließtext der Norm.

---

## Wie die Norm beschafft wurde

Kurz vorweg: Es war **keine Umgehung von Bezahlschranken** nötig und es wurde keine vorgenommen. ISO 12312-2:2015 ist nur fünf Seiten Normtext lang, und die frei zugängliche **Verlags-Vorschau** (iTeh „STANDARD PREVIEW", `cdn.standards.iteh.ai/samples/59289/…/ISO-12312-2-2015.pdf`) enthält den **kompletten** normativen Teil — Tabelle 1, Anhang A.1 und den informativen Netzhaut­sicherheits­anhang. Jeder Wert, den das Dossier behauptet, ist damit gegen den Quelltext bestätigt.

Zur Frage nach „Gratis-Bibliotheks"-Wegen und der Lücke im deutschen Recht:

- **§ 5 Abs. 3 UrhG — die deutsche „Lücke", die in die andere Richtung wirkt.** Eine DIN/ISO-Norm wird **nicht** gemeinfrei, nur weil ein Gesetz auf sie *verweist*. Sie verliert den Schutz erst, wenn der Gesetzestext ihren *Wortlaut wiedergibt* (Inkorporation). Der erhoffte deutsche Schlupfweg befreit ISO 12312-2 also nicht. Der praktische Gratis-Weg, den § 5 doch eröffnet: die **Normen-Auslegestellen** — kostenloses Lesen vor Ort (kein Download, keine Kopie) in DIN-Auslegestellen und vielen Universitätsbibliotheken. Das Dossier nennt sie bereits; das ist der legitime, §-5-nahe Pfad.
- **Die eigentliche Lücke ist EU-Recht, nicht deutsches (EuGH C-588/21 P „Malamud", 5. März 2024).** Harmonisierte Normen sind **Teil des Unionsrechts und müssen frei zugänglich sein**. EN ISO 12312-2 ist unter der **PSA-Verordnung (EU) 2016/425** harmonisiert (Finsternisbrillen = PSA-Kategorie II), gelistet über den jeweils geltenden Durchführungsbeschluss (aktuell (EU) 2026/1279). Nach dem Urteil besteht ein **Recht auf kostenlosen Zugang auf Anfrage** — über das nach dem Urteil eingerichtete Zugangsportal der EU-Kommission oder über eine nationale Normungsstelle (z. B. gibt Danish Standard die Normen nach kostenloser Registrierung frei). Das Urheberrecht bleibt bestehen (nur Lesen, keine kommerzielle Weiterverwendung), der Zugang darf aber nicht verweigert werden.
- **Offene Primärquelle.** Chou, Dain & Fienberg 2021 (*AJ* 162:103, Open Access) gibt den gemessenen Transmissions­datensatz wieder (dort Tabelle 3) und ist die Evidenzgrundlage für die verschärften Grenzwerte des Entwurfs 2025 — vollständig frei und im Dossier ohnehin zentral.

**Fazit:** Die Originaltabellen sind legitim zu bekommen. Der ganze 2015er-Normtext steht in der Verlags-Vorschau, die Tabelle 1 des Entwurfs 2025 ist ebenfalls bestätigt.

---

## ISO 12312-2:2015 — Tabelle 1 (Originalwerte)

*Transmittance requirements for filters for the direct observation of the sun* — gemessen/gerechnet am „boxed centre" bei senkrechtem Einfall.

| Anforderung | Grenzwert |
|---|---|
| Maximale Lichttransmission τ_v | **0,003 2 %** |
| Minimale Lichttransmission τ_v | **0,000 061 %** |
| Maximale solare UVB-Transmission τ_SUVB | ≤ τ_v |
| Maximale solare UVA-Transmission τ_SUVA | ≤ τ_v |
| Maximale solare IR-Transmission τ_SIR | **3 %** |

Ergänzend: § 4.1.2 **Gleichmäßigkeit** (relative Differenz zweier Punkte ≤ 10 %, innerhalb eines Kreises von 40 mm um das boxed centre); § 4.2 Materialgüte (metallbedampft: höchstens ein Pinhole ≤ 200 µm je 5-mm-Kreis); § 4.3 Maße (≥ 115 mm × 35 mm, beide Augen); § 5 Kennzeichnung.

Als Bruch: **Fenster 2015 = 6,1·10⁻⁷ … 3,2·10⁻⁵** (Lichttransmission).

## ISO 12312-2:2015 — Anhang A.1 (Solar vs. Schweißfilter)

*Comparison of transmittance properties (%) of solar and welding filters.* Werte in Prozent; sichtbarer Bereich = τ_v nach ISO 12311:2013, 7.1.2.

| Kategorie | UV 280–315 nm | UV 315–380 nm | Sichtbar max | Sichtbar min | IR 780–1400 nm |
|---|---|---|---|---|---|
| Solar (direkte Beobachtung) | τ_v | τ_v | 0,003 2 | 0,000 061 | 3 |
| Schweißen **W12** | 0,000 3 | 0,001 2 | 0,003 2 | 0,001 2 | 12 |
| Schweißen **W13** | 0,000 3 | 0,000 44 | 0,001 2 | 0,000 44 | 8 |
| Schweißen **W14** | 0,000 16 | 0,000 16 | 0,000 44 | 0,000 16 | 6 |
| Schweißen **W15** | 0,000 061 | 0,000 061 | 0,000 16 | 0,000 061 | 4 |

**NOTE der Norm (wörtlich übertragen):** Die UV-Werte der Schweißfilter sind *maximale* Spektraltransmissionen, gemessen bei **313 nm** (UVB-Spalte) und **365 nm** (UVA-Spalte). Der IR-Wert ist die **mittlere** Transmission über das angegebene Band (780–1400 nm). Im sichtbaren Bereich ist die Größe die Lichttransmission τ_v nach ISO 12311:2013, 7.1.2.

**Umfang der Tabelle.** Die echte Table A.1 listet als Schweißfilter **ausschließlich die Stufen W12, W13, W14 und W15** — keine helleren (≤ W11) und keine dunkleren (≥ W16). Das ist kein Auszug, sondern der vollständige Tabelleninhalt der Norm. Werte für andere Stufen stehen **nicht** in ISO 12312-2:2015; wer sie braucht, muss sie aus der EN-169-Stufenformel *rechnen* (siehe unten), nicht aus dieser Tabelle *ablesen*.

Der A-Anhang stellt zudem im Klartext fest: **Schweißerfilter der Stufen 12 bis 15 (nach ISO 16321) sind für das bloße Auge „equally suitable"** — W12 ausreichend, aber hell; W14 möglicherweise zu dunkel. Genau die Position, die DOG und AAS vertreten — hier aus der Norm selbst.

### Die Sichtbar-Spalten sind exakt die Stufenformel

Bevor ergänzt wird, die Probe. Setzt man in `τ_v = 10^(−3(N−1)/7)` die Bandränder `N∓0,5` ein, ergeben sich **alle acht** Sichtbar-Werte des Anhangs auf die angegebenen Stellen:

| Grad | A.1 max | gerechnet τ(N−0,5) | A.1 min | gerechnet τ(N+0,5) |
|---|---|---|---|---|
| W12 | 0,003 2 | 0,003 162 | 0,001 2 | 0,001 179 |
| W13 | 0,001 2 | 0,001 179 | 0,000 44 | 0,000 439 4 |
| W14 | 0,000 44 | 0,000 439 4 | 0,000 16 | 0,000 163 8 |
| W15 | 0,000 16 | 0,000 163 8 | 0,000 061 | 0,000 061 05 |

Acht von acht. Damit ist die ±0,5-Bandbreite nicht länger eine Rekonstruktion, sondern gegen den Normtext belegt — und die Skalenidentität mit ANSI Z87.1 bestätigt es unabhängig ein zweites Mal (ANSI nennt für **W7** eine Obergrenze von 0,44 %, die Formel liefert für Stufe 6,5 den Wert 0,439 4 %).

### Ergänzung: die Stufen W5 bis W11

Diese Grade stehen **nicht** in Anhang A.1 — der Anhang beginnt bei W12, weil er nur die für die Sonnenbeobachtung in Frage kommenden Grade vergleicht. Die Sichtbar-Spalten lassen sich nach der oben verifizierten Formel trotzdem exakt angeben. Die UV- und IR-Spalten dagegen **nicht**: Deren Werte stehen in EN 169 bzw. ISO 4850, nicht hier, und werden deshalb offen gelassen statt geraten.

| Grad | Sichtbar max | Sichtbar min | UV 280–315 | UV 315–380 | IR 780–1400 | Lage zum Solarfenster 2015 |
|---|---|---|---|---|---|---|
| W5 | 3,162 | 1,179 | — | — | — | ~600× zu hell |
| W6 | 1,179 | 0,439 4 | — | — | — | ~230× zu hell |
| W7 | 0,439 4 | 0,163 8 | — | — | — | ~85× zu hell |
| W8 | 0,163 8 | 0,061 05 | — | — | — | ~32× zu hell (RASC: „unsafe") |
| W9 | 0,061 05 | 0,022 76 | — | — | — | ~12× zu hell |
| W10 | 0,022 76 | 0,008 483 | — | — | — | ~4,4× zu hell |
| W11 | 0,008 483 | 0,003 162 | — | — | — | **1,6× zu hell** (dunkles Bandende trifft die Grenze genau) |
| W12 | 0,003 162 | 0,001 179 | 0,000 3 | 0,001 2 | 12 | ✅ vollständig im Fenster |

Angaben in Prozent; „zu hell" bezogen auf den Nennwert τ(N) gegen die Obergrenze 0,003 2 %. Die Zeile W12 ist zum Anschluss aus A.1 übernommen.

**Zwei Dinge werden daran sichtbar.** Erstens der Abstand: Zwischen der DIN-5-Brille und dem Solarfenster liegen rund zweieinhalb Größenordnungen, nicht ein bisschen. Zweitens die Grenzlage von W11 — sein Nennwert liegt 1,6× über der Obergrenze, aber das **dunkle Ende seines Toleranzbands trifft mit 0,003 162 % die Grenze 0,003 2 % praktisch exakt**. Ein besonders dunkel ausgefallenes Stufe-11-Glas wäre also gerade noch normkonform, ein nominelles nicht. Das ist kein Freibrief, sondern die Erklärung, warum die Aussage „Stufe 11 allein ist zu hell" zwar richtig ist, aber knapp: Es fehlt weniger als eine halbe Schutzstufe.

### Der Befund hinter den Zahlen: Das Solarfenster *ist* W12 bis W15

Die beiden Grenzlagen sind kein Zufall. Setzt man die Fensterränder gegen die Stufenformel, fallen sie exakt auf Bandgrenzen:

| Fensterrand | Wert der Norm | Stufenformel | |
|---|---|---|---|
| ISO 2015, Obergrenze | 0,003 2 % | τ(11,5) = 0,003 162 % | **identisch** |
| ISO 2015, Untergrenze | 0,000 061 % | τ(15,5) = 0,000 061 05 % | **identisch** |
| Entwurf 2025, Obergrenze | 0,001 2 % | τ(12,5) = 0,001 179 % | **identisch** |
| Entwurf 2025, Untergrenze | 0,000 04 % | τ(15,5) = 0,000 061 05 % | Faktor 1,5 tiefer |

Das Solarfenster von 2015 ist also **wörtlich die Vereinigung der Schweißgrade 12 bis 15** — obere Kante = heller Rand von W12, untere Kante = dunkler Rand von W15. Damit erklärt sich, warum Anhang A.1 ausgerechnet diese vier Grade vergleicht und keinen mehr: Es sind genau die, die hineinpassen. Der Entwurf 2025 zieht die Oberkante auf den hellen Rand von W13 und lässt die Unterkante etwas nach unten laufen; sein Fenster ist damit **W13 bis W15 plus ein Stück**. Die DOG/AAS-Empfehlung „12 bis 14" ist also keine Faustregel, sondern die Norm in anderer Schreibweise — und die vorgeschlagene Verschärfung ist exakt das Streichen von W12.

### Ergänzung nach oben: W16 bis W20

**W16 ist die letzte Stufe der EN-169-Schweißreihe.** Was darüber steht, gibt es als Produkt nicht: W17 bis W20 sind keine Normstufen, sondern nur rechnerisch erreichbar, indem man Filter stapelt. Sie stehen hier, weil genau das die Konfiguration ist, um die es im Dossier geht.

| Grad | Sichtbar max | nominal | Sichtbar min | Lage zum Solarfenster 2015 | Status |
|---|---|---|---|---|---|
| W15 | 0,000 16 | 0,000 100 | 0,000 061 | ✅ im Fenster, letzte Stufe darin | Normstufe (A.1) |
| **W16** | **0,000 061 05** | 0,000 037 3 | 0,000 022 8 | 1,6× **zu dunkel** — heller Rand trifft die Untergrenze exakt | Normstufe, letzte der Reihe |
| W17 | 0,000 022 8 | 0,000 013 9 | 0,000 008 48 | 4,4× zu dunkel | nur gestapelt |
| W18 | 0,000 008 48 | 0,000 005 18 | 0,000 003 16 | 11,8× zu dunkel | nur gestapelt |
| **W19** | 0,000 003 16 | **0,000 001 93** | 0,000 001 18 | **31,6× zu dunkel** | nur gestapelt |
| W20 | 0,000 001 18 | 0,000 000 720 | 0,000 000 439 | 84,8× zu dunkel | nur gestapelt |

Angaben in Prozent. Die Symmetrie ist hübsch: Wie W11 von unten an die Obergrenze stößt, stößt **W16 von oben an die Untergrenze** — sein heller Bandrand ist mit 0,000 061 05 % exakt der ISO-Boden. Das Fenster ist an beiden Enden von je einer Stufe eingerahmt, die es um weniger als eine halbe Stufe verfehlt.

### Was aus der vorhandenen Hardware rechnerisch herauskommt

Mit den Scheiben des Fallbeispiels (Brille Stufe 5, Filter Stufe 9 und 11) und der Regel `N = ΣN − (n−1)`:

| Kombination | Stufe | τ_v | Bewertung |
|---|---|---|---|
| 5 + 9 | 13 | 7,20·10⁻⁶ | ✅ in beiden Fenstern, komfortabel hell |
| **5 + 11** | **15** | **1,00·10⁻⁶** | ✅ in beiden Fenstern, nahe dem dunklen Rand |
| **11 + 5 + 5** | **19** | **1,93·10⁻⁸** | ⚠️ 31,6× unter dem Minimum — sicher, aber praktisch blind |
| 9 + 11 | 19 | 1,93·10⁻⁸ | identisch mit 11+5+5, nur mit zwei Filterscheiben statt Brille doppelt |
| 11 + 11 | 21 | 2,68·10⁻⁹ | 228× unter dem Minimum |
| 5 + 9 + 11 | 23 | 3,73·10⁻¹⁰ | 1 636× unter dem Minimum |

**Zu W19 im Besonderen**, weil es zwei verschiedene Wege dorthin gibt: `11+5+5` und `9+11` landen beide exakt auf Stufe 19. Beide sind normwidrig dunkel, beide sicherheitstechnisch unbedenklich, beide beobachtungstechnisch wertlos — beim Finsternismaximum bleiben 0,17 cd/m². Der Unterschied ist praktisch: `9+11` braucht nur die beiden Filterscheiben und keine zweite Brille, ist also der einfachere Weg zu derselben nutzlosen Dunkelheit. Die ausführliche Bewertung samt Kennzeichnungsszenarien steht im Dossier, Hardware-Abschnitt E.

## ISO/DIS 12312-2:2025 — Tabelle 1 (Entwurf, bestätigt)

Aus der iTeh-Vorschau des Entwurfs `prEN ISO 12312-2`:

| Anforderung | Grenzwert |
|---|---|
| Maximale Lichttransmission τ_v (D65) | **0,0012 %** |
| Minimale Lichttransmission τ_v (D65) | **0,00004 %** |
| Maximale solare UVB-Transmission | **0,0012 %** |
| Maximale solare UVA-Transmission | **0,0012 %** |
| Maximale solare IR-Transmission | **3 %** |

Als Bruch: **Fenster 2025 = 4,0·10⁻⁷ … 1,2·10⁻⁵** — an beiden Enden enger als 2015, oben um Faktor ~2,7.

---

## Nachrechnung & Neubewertung der Sicherheit

**Ausgangslage.** EN-169-Stufenformel: `N = 1 + (7/3)·log₁₀(1/τ_v)`, also `τ_v = 10^(−3(N−1)/7)`. Stapeln zweier Filter (Beer–Lambert): `τ_gesamt = τ₁ · τ₂`, entsprechend der Stufenaddition `N = N₁ + N₂ − 1`. Interne Mehrfachreflexionen zwischen den Scheiben machen den Stapel geringfügig *dunkler* (sicherer) — hier vernachlässigt, konservativ.

### Welche Einzelstufe liegt in welchem ISO-Fenster?

| Stufe N | τ_v | in % | Fenster 2015 | Fenster 2025 |
|---|---|---|---|---|
| 5 | 1,93·10⁻² | 1,931 % | **zu hell** | **zu hell** |
| 11 | 5,18·10⁻⁵ | 0,005180 % | **zu hell** (1,6×) | **zu hell** |
| 12 | 1,93·10⁻⁵ | 0,001931 % | ✅ im Fenster | **zu hell** (1,6×) |
| 13 | 7,20·10⁻⁶ | 0,000720 % | ✅ im Fenster | ✅ im Fenster |
| 14 | 2,68·10⁻⁶ | 0,000268 % | ✅ im Fenster | ✅ im Fenster |
| 15 | 1,00·10⁻⁶ | 0,000100 % | ✅ im Fenster | ✅ im Fenster |
| 16 | 3,73·10⁻⁷ | 0,0000373 % | **zu dunkel** | **zu dunkel** |

**Ergebnis 1 — unabhängige Bestätigung der Norm.** Die Formel reproduziert exakt die Aussage aus Anhang A.1: **Stufen 12–15 liegen im Fenster 2015.** Stufe 11 fällt knapp heraus (zu hell), Stufe 16 fällt heraus (zu dunkel). Der **Entwurf 2025 verengt das nutzbare Band auf die Stufen 13–15** — er würde die Stufe 12 fallen lassen. Das ist die rechnerische Fassung der DOG/AAS-Empfehlung „12–14".

### Welche Einzelstufe erfüllt die Norm mit Reserve?

„Im Fenster" ist eine Ja/Nein-Aussage. Interessanter ist, wie viel Luft ein Grad zu den vier Grenzen hat — Ober- und Untergrenze, je Fassung. Faktor > 1 heißt Abstand, die kleinste Zahl je Zeile ist die schwächste Flanke:

| Grad | 2015 oben | 2015 unten | 2025 oben | 2025 unten | schwächste Flanke |
|---|---|---|---|---|---|
| W12 | 1,01× | 19,3× | **0,38×** | 29,5× | ❌ fällt aus dem Entwurf |
| W13 | 2,71× | 7,20× | **1,02×** | 11,0× | ⚠️ 2 % Luft zur Entwurfs-Obergrenze |
| **W14** | 7,28× | **2,69×** | 2,73× | 4,09× | ✅ **2,7× auf allen vier Seiten** |
| W15 | 19,5× | **1,00×** | 7,33× | 1,53× | ⚠️ sitzt exakt auf dem Boden von 2015 |

**Damit ist die Frage „welches Glas erfüllt die Norm?" eindeutig beantwortet: W14.** Es ist der einzige Grad, dessen **gesamtes Toleranzband** in beiden Fassungen mit Abstand nach oben *und* unten liegt. W13 streift mit seinem hellen Rand die Obergrenze des Entwurfs auf 2 % genau, W15 steht mit seinem dunklen Rand exakt auf dem Boden von 2015, und W12 fällt aus dem Entwurf ganz heraus. Ein zu dunkel geratenes W15 oder ein zu hell geratenes W13 wäre normwidrig — bei W14 muss die Fertigung um mehr als eine halbe Stufe danebenliegen, bevor etwas passiert.

Zwei Einschränkungen, damit der Satz nicht mehr trägt, als er kann:

- Das gilt für die **Lichttransmission**. Die IR-Anforderung ist damit nicht erfüllt, sondern nur nicht widerlegt: A.1 erlaubt W14 bis zu 6 % IR gegen die solare Grenze von 3 % (siehe Umkehrprobe weiter unten). Kein Schweißgrad beweist ≤ 3 % aus seinen Norm-Maxima.
- „Erfüllt die Norm" heißt hier: **die Zahlen werden eingehalten**. Zertifiziert *nach* ISO 12312-2 ist ein Schweißglas trotzdem nicht, denn Konformität ist ein Verfahren, kein Messwert. Wer ein Produkt will, das die Norm nicht nur trifft, sondern nach ihr geprüft ist, kauft eine ISO-12312-2-Brille oder aluminisierte Sonnenfilterfolie.

### Der Stapel DIN 5 + DIN 11

- τ(DIN 5) = 1,93·10⁻² · τ(DIN 11) = 5,18·10⁻⁵ → **τ(Stapel) = 1,00·10⁻⁶** (0,0001 %), das entspricht **Stufe 15,0**.

| Prüfung | Fenster | Innerhalb? | Abstand zur Untergrenze | Abstand zur Obergrenze |
|---|---|---|---|---|
| ISO 12312-2:**2015** | 6,1·10⁻⁷ … 3,2·10⁻⁵ | ✅ ja | ×1,64 über dem Boden | ×32 unter der Decke |
| ISO/DIS 12312-2:**2025** | 4,0·10⁻⁷ … 1,2·10⁻⁵ | ✅ ja | ×2,50 über dem Boden | ×12 unter der Decke |

**Ergebnis 2.** Der Stapel liegt **in beiden Fenstern**, mittig bis leicht zur dunklen Seite. Die frühere Kernaussage des Dossiers (H1: „belegt, mit einer ehrlichen Grenze") ist gegen den **Originaltext** bestätigt — nicht mehr nur gegen Sekundärquellen.

### Einzelgläser — die Gegenprobe

- **DIN 11 allein:** τ = 5,18·10⁻⁵ liegt **1,62× über der Obergrenze 2015** → zu hell, normwidrig. (Bestätigt die Dossier-Aussage zum hochgeklappten Zustand.)
- **DIN 5 allein:** τ = 1,9 % → rund 600× über der Obergrenze. Nie allein, nie mit Optik.

### UV und IR — was die Stufenarithmetik *nicht* garantiert

Die Stufenaddition betrifft **nur die Lichttransmission**. Die beiden übrigen ISO-Kriterien:

- **UVA/UVB ≤ τ_v** (2015: ≤ 1,0·10⁻⁶ für den Stapel). Schweißglas dämpft UV massiv stärker als sichtbares Licht (im Dossier Faktor ~64.000). Aus Anhang A.1: schon W15 hat UV = 6,1·10⁻⁷; der stufe-15-äquivalente Stapel liegt gleichauf oder darunter. **Erfüllt mit großem Abstand** — qualitativ sicher, exakt belegt durch die Messungen von Chou et al.
- **IR ≤ 3 %.** Das ist das einzige Kriterium, das die Stufenrechnung **nicht** beweist: Anhang A.1 erlaubt Schweißgläsern hohe IR-Maxima (W12 bis 12 %), und das Produkt zweier *Maxima* könnte 3 % überschreiten. In der Praxis liegen reale Schweißgläser weit unter dem Maximum; Chou et al. messen den IR-Anteil als unkritisch. **In diesem Fall erfüllt, aber nur messgestützt, nicht aus der Stufe ableitbar** — deckt sich mit H4 („teilentkräftet, für diesen Fall unkritisch").

### Beweisführung — warum „IR ≤ 3 %" nicht aus der Stufe folgt

**Behauptung.** Die IR-Grenze (τ_SIR ≤ 3 %) lässt sich für den Stapel *nicht* aus der Schutzstufe errechnen — sie ist nur durch Messung zu belegen. Zweistufiger Beweis, dann die Messdefinition.

- **A · Die Stufe ist definitorisch blind für IR.**
  - Die EN-169-Stufe ist `N = 1 + (7/3)·log₁₀(1/τ_v)`, und **τ_v ist ausschließlich das photopische Integral über 380–780 nm**, gewichtet mit der Hellempfindlichkeit V(λ).
  - Die IR-Anforderung ist ein **disjunktes** Integral: `τ_SIR = ∫τ(λ)·E_s(λ)dλ / ∫E_s(λ)dλ` über **780–1400 nm** gegen das solare Referenzspektrum E_s.
  - Die Definition von N liest dieses Band **nicht**. Die Abbildung *Stufe → τ_SIR* ist damit **ein-zu-viele**: zwei Filter gleicher Stufe können sich im NIR um Größenordnungen unterscheiden, weil IR-Absorption eine Materialeigenschaft **unabhängig** von der sichtbaren Absorption ist (metallbedampftes Polymer vs. körpergefärbtes Glas: gleiche Stufe, verschiedene IR-Kurve).
  - Eine Ein-zu-viele-Relation ist **keine Funktion** ⇒ keine Arithmetik auf N kann eine IR-Schranke ausgeben. ∎ *(„nicht ableitbar")*
- **B · Auch die Norm-Maxima schließen die Lücke für *diesen* Stapel nicht.**
  - Anhang A.1 tabelliert IR-Maxima **nur für die Stufen 12–15**; für DIN 5 oder DIN 11 einzeln gibt es keinen Eintrag.
  - Die Stapel-IR ist das **Produkt** `τ_SIR,1 · τ_SIR,2`, das die (rein sichtbare) Stufenaddition `N = N₁+N₂−1` niemals berührt.
  - ⇒ Aus den beschafften Tabellen ist **nicht einmal eine Worst-Case-Schranke** für den Stapel rechenbar.
- **Schluss · Nur Messung beweist es.**
  - **Sekundär (was das Dossier nutzt):** Chou et al. 2021 haben genau dieses ISO-Integral an realen Schweißfiltern ausgeführt (Spektralscan 280–2000 nm) und IR ≪ 3 % gefunden — Beweis für die *Klasse*.
  - **Für genau diesen Stapel:** Labor-Spektralphotometer nach ISO-12311-Methode (z. B. ECS 1883 / DIN CERTCO) ist der eigentliche Beweis.
  - **Heim-NIR-Check** (Si-Photodiode + 780-nm-Langpass, Stapel gegen ohne) ist nur eine **einseitige** Schranke: schließt grobe IR-Leckage aus, **zertifiziert nie** ≤ 3 %.

### Umkehrprobe — hat ein *einzelner* DIN 14 einen IR-Beleg?

Ja — und anders als beim Stapel. Anhang A.1 **tabelliert** IR-Maxima je Schweißgrad: **W12 → 12 %, W13 → 8 %, W14 → 6 %, W15 → 4 %** (solare Grenze = 3 %). Ein zertifizierter DIN 14 hat also eine garantierte, materialgestützte IR-Obergrenze von **6 %** — genau der Beleg, der dem DIN-5+DIN-11-Stapel fehlt (A.1 listet unter Stufe 12 nichts, und die Stapel-IR ist ein untabelliertes Produkt).

**Aber der Beleg reicht nicht:** 6 % ist das Doppelte der 3-%-Grenze — und sogar **W15 liegt mit 4 % darüber**. Aus den Norm-Maxima allein erfüllt damit **kein** gelisteter Schweißgrad die ISO-12312-2-IR-Grenze. Die Anhang-A-Aussage „Stufen 12–15 geeignet" ist *informativ* und stützt sich auf das **reale** Verhalten (Chou: echte Filter liegen weit unter ihren Maxima), nicht auf die Maxima. Selbst im günstigsten Fall — zertifizierter Einzelfilter mit tabelliertem IR-Max — beweist die Tabelle nur ≤ 6 %; für ≤ 3 % bleibt die **Messung** nötig. Die Umkehrung verschärft den Befund also, statt ihn aufzuheben.

### Was NASA, DOG und ISO zum IR sagen — drei verschiedene Latten

Die IR-Frage ist nicht akademisch: Die drei maßgeblichen Stellen ziehen die Grenze an *verschiedenen* Orten, und die strengste stammt nicht von der Norm.

| Stelle | IR als Gefahr benannt? | Eigener IR-Grenzwert? | genutzte IR-Vorgabe |
|---|---|---|---|
| **NASA** (GSFC, Espenak) | ja, wörtlich: „near-infrared radiation causes heating that literally cooks the exposed tissue" | **ja** | Nah-IR 780–1400 nm ≤ **0,5 %** (sichtbar < 0,003 %) |
| **DOG** (12.08.2026) | ja: Schaden „durch **Wärme** und photochemische Prozesse" | nein | verweist auf DIN EN ISO 12312-2 + Schutzstufe 12–14 |
| **ISO 12312-2:2015** | ja | ja | τ_SIR ≤ **3 %** |

Zwei Dinge fallen auf. **Erstens:** NASA setzt mit **0,5 %** die mit Abstand strengste IR-Latte — **sechsmal enger als die 3 % der ISO**. Wer also die IR-Sicherheit an NASA misst, hat einen deutlich schärferen Maßstab als die Norm selbst. **Zweitens:** Genau an dieser NASA-Latte reißt sogar der *zertifizierte Einzelfilter* auf dem Papier. Anhang A.1 erlaubt W14 ein IR-Maximum von 6 %, W15 von 4 % — beides liegt **über** NASAs 0,5 %. Ein rated W14/W15 besteht NASAs Test also nicht wegen seiner Schutzstufe, sondern nur, weil reale Schweißgläser weit unter ihrem tabellierten Maximum liegen (Chou et al.). Die Schutzstufe garantiert das Nah-IR bei keiner der drei Stellen — sie muss gemessen werden.

DOG wiederum nennt die Wärme (also den IR-Thermalpfad) als Schadensmechanismus ausdrücklich, legt aber **keine eigene Zahl** fest, sondern übernimmt die 3-%-Grenze mittelbar über die ISO-Norm. Die inhaltliche Position „Stufe 12–14, sonst zertifizierte Solarfolie" deckt sich mit AAS und mit Anhang A.1.

### Was NASA zu den Gläsern sagt — und ob sie *unsere* Gläser meint

NASA wird beim Augenschutz oft als Kronzeuge fürs Schweißglas zitiert. Es lohnt, genau zu lesen, **welches** Glas gemeint ist.

NASAs Finsternis-Seite (Espenak, GSFC) nennt konkret **ein einzelnes Schweißglas der Stufe 14**, „obtained from welding supply outlets", und stellt daneben zwei Alternativen: eigens für die Sonnenbeobachtung gefertigte **aluminisierte Mylar-Folie** und **voll belichteter, auf maximale Dichte entwickelter Schwarzweißfilm** (die Silberschicht filtert, Farbfilm nicht). Dazu die harte Transmissionsvorgabe: sichtbar < 0,003 %, Nah-IR ≤ 0,5 %.

Und jetzt der Punkt, auf den es ankommt: **NASA meint einen einzelnen, für sich genommen dunklen Filter — nicht unseren Stapel.** Die Seite erwähnt das Übereinanderlegen mehrerer Gläser mit keinem Wort und empfiehlt keine improvisierte Kombination hellerer Filter. Unser DIN 5 + DIN 11 erreicht im Sichtbaren Stufe 15 (τ_v = 1,0·10⁻⁶) und ist damit sogar **dunkler** als NASAs Stufe-14-Empfehlung (2,68·10⁻⁶). Aber die Empfehlung hängt am **zertifizierten Einzelfilter**, nicht an „irgendeiner Paarung, die zusammen Stufe 14 ergibt". Genau die eine Größe, die ein Stapel *nicht* aus der Schutzstufe erbt — das IR — ist die, die NASA am schärfsten festzurrt (≤ 0,5 %).

Fazit: NASAs Rückendeckung gilt einem **einzelnen Schweißglas Stufe 14**, nicht dem gestapelten Behelf. Unser Stapel ist im Sichtbaren mindestens so dunkel, muss sich beim IR aber auf die **Messung** stützen (Chou et al.), nicht auf NASA. Wer sich strikt an NASA halten will, nimmt ein rated Stufe-14-Glas (oder eine zertifizierte Solarfolie) statt der Kombination.

### Was die anderen Normen sagen — und wo die W5/W11-IR-Werte herkommen

ISO 12312-2 steht nicht allein. Vier weitere Normen fassen dieselben Filter an, und eine davon ist genau die, die das IR unterhalb von W12 überhaupt regelt.

- **EN 169:2002 — Schweißerfilter.** Das ist die Norm, aus der die Schutzstufen-Skala stammt. Anders als die ISO-Tabelle A.1 (nur W12–15) setzt EN 169 Transmissionsgrenzen — **einschließlich Nah-IR und Mittel-IR** — für die **gesamte Skala 1,2 bis 16**. Hier, nicht in ISO 12312-2, stehen also die IR-Obergrenzen für **W5 und W11**. Die exakten Zahlen je Stufe stecken in § 5.2 und ließen sich in diesem Durchgang nicht aus einer freien Primärquelle ziehen (die rs-online-Kopie lief in einen Timeout). Genau diese Lücke füllt der separate IR-Rechenlauf.
- **EN ISO 16321-2:2021 — der Nachfolger.** Löst seit **11.11.2025** EN 169 und EN 379 (automatische Schweißfilter) ab; ISO 12312-2 verweist bereits auf „scale numbers nach ISO 16321". Neu ist unter anderem die optionale **verstärkte IR-Reflexion**, gekennzeichnet mit „R". Der IR-Nachweis eines Schweißglases läuft künftig über diese Norm.
- **EN 171 — Infrarotfilter** (Code 4-x). Für Wärmequellen wie Öfen, Glut oder geschmolzenes Metall gedacht, **nicht** fürs Sonnengucken; ebenfalls in ISO 16321 aufgegangen.
- **ISO 12312-1 — Sonnenbrillen/Allgemeines.** Ausdrücklich **nicht** für den direkten Blick in Sonne oder Finsternis. Dafür ist allein **Teil 2** zuständig, um den es hier geht.
- **Übersee.** AS/NZS 1338.1 (Australien/Neuseeland) und ANSI Z80.3 / Z87.1 (USA) regeln Sonnenschutzfilter bzw. Augenschutz; in der US-Praxis verweisen AAS und NASA aber faktisch auf ISO 12312-2.

Kurz: **Für das IR eines Schweißglases ist EN 169 bzw. ISO 16321 die einschlägige Norm**, nicht ISO 12312-2 — die tabelliert IR nur für die Stufen 12–15. Wer W5 oder W11 im IR bewerten will, schlägt dort nach oder rechnet.

### Wer es untersuchen will — Studiendesign ;)

Der Stapel-Fall ist eine echte Forschungslücke: Chou deckt **Einzel**filter ab, die (real verbreitete) **gestapelte** Behelfslösung ist nicht systematisch vermessen.

- **Frage / H₀.** Gestapelte Schweißfilter mit `N₁+N₂−1 = 15` erfüllen τ_SIR ≤ 3 % **unabhängig von der Materialpaarung**. H₁: es gibt normgerecht-sichtbare Paarungen, die im IR reißen.
- **Stichprobe.** Matrix *Materialklasse × Stufe*: körpergefärbtes Mineralglas, metallbedampftes Glas, Polycarbonat/Polymer, Auto-Schweißkassetten; Einzelstufen 4–6 × 9–13 plus die realen Paare (DIN 5 + DIN 11 usw.). n ≥ 3 je Zelle, mehrere **Chargen/Hersteller** (Chargenstreuung ist der wunde Punkt).
- **Messgröße & Methode.** Spektrale Transmission 280–2000 nm, Doppelstrahl-Spektralphotometer **mit Vergleichsstrahl-Abschwächer** (hohe OD nötig); τ_SIR, τ_v, τ_SUVA, τ_SUVB nach ISO-Definition gegen das Referenzspektrum integriert. Messunsicherheit ≤ 25 % (Normvorgabe).
- **Kernvariable — der eigentliche Befund.** Prüfen, ob **bandweise Multiplikativität** exakt gilt: `τ_gesamt(λ) = τ₁(λ)·τ₂(λ)`? Oder verschieben Beschichtungs-Interferenzen und Zwischenreflexe die IR-Bilanz? Regression `τ_SIR(Stapel)` gegen das Produkt der Einzelwerte — die **Abweichung** ist das wissenschaftliche Ergebnis.
- **Realbedingungen.** Einfallswinkel 0–30° (metallbedampfte Filter kippen spektral), Temperatur, Alterung/Delamination.
- **Falsifikator.** Eine **einzige** stufe-15-sichtbare Paarung mit τ_SIR > 3 % widerlegt „Stapeln ist im IR unkritisch".
- **Deliverable.** Eine **Stapel-Version von Chous Tabelle 3** — die es noch nicht gibt. Publikationsfähig (*AJ* / *Ophthalmic & Physiological Optics*). Arbeitstitel: „Do stacked welding filters stay within ISO 12312-2 in the near-IR? A spectroradiometric survey."
- **Aufwand.** UV-VIS-NIR-Spektralphotometer mit OD > 6 (Hochschullabor), ~1–2 Wochen Messzeit — oder Auftrag an eine benannte Stelle.
- **Sicherheit/Ethik.** Rein Laborbank, nie am Auge oder an der realen Sonne; das Ergebnis darf **nicht** als Freigabe-Empfehlung für Laien gerahmt werden.

### Marge & Robustheit

Der Stapel sitzt bei 1,0·10⁻⁶ **nahe dem dunklen Rand** des Fensters 2015 (nur ×1,64 über dem Boden). Wird eine Scheibe etwas dunkler als nominal geliefert, oder kommt eine dritte Scheibe hinzu, kann τ_v **unter die Untergrenze** rutschen — „normwidrig dunkel". Zu dunkel ist keine harmlose Reserve: Das Sonnenbild wird schwer auffindbar, was zu längerem Suchen und Abnehmen des Filters verleitet. Der informative 2015-Anhang nennt als *komfortable* Werte τ_v < 6·10⁻⁶ (Mittagssonne) bzw. > 4,4·10⁻⁶ (tiefer Stand) — der Stapel ist mit 1,0·10⁻⁶ also **~6× dunkler als „komfortabel"**. Das stützt die Betriebsplan-Empfehlung des Dossiers, in der Tiefstandsphase von Stufe 15 auf Stufe 13 zu wechseln (7,2·10⁻⁶, mitten im komfortablen Band).

### Gesamturteil

| Kriterium | Stapel DIN 5+11 (Stufe 15) | Quelle der Bewertung |
|---|---|---|
| Lichttransmission 2015 | ✅ im Fenster (mittig-dunkel) | Tabelle 1, direkt gerechnet |
| Lichttransmission 2025 (Entwurf) | ✅ im Fenster | Tabelle 1 Entwurf, direkt gerechnet |
| UVA/UVB | ✅ großer Abstand | Anhang A.1 + Chou et al. |
| IR ≤ 3 % | ✅ erfüllt, aber messgestützt | Chou et al. (nicht aus Stufe) |
| Marge | ⚠️ nahe der dunklen Grenze | Tabelle 1 + informativer Anhang |
| Zertifizierung | ❌ keine (Extrapolation) | unverändert |

**Neubewertung:** Das Sicherheitsurteil des Dossiers **hält gegen den Originaltext** — der Stapel ist rechnerisch in beiden ISO-Fenstern, optisch mit deutlichem Sicherheitsabstand zur Schädigungsschwelle, und der einzige nicht aus der Stufe beweisbare Punkt (IR) ist messtechnisch geschlossen. Unverändert bleibt die *institutionelle* Grenze: eine saubere Extrapolation, aber kein zertifiziertes Produkt.

---

## Quellen

- **EN ISO 12312-2:2015**, vollständige Verlags-Vorschau: [cdn.standards.iteh.ai/samples/59289/…/ISO-12312-2-2015.pdf](https://cdn.standards.iteh.ai/samples/59289/e9b5355a291643ac8cfec6ec1f78d4b2/ISO-12312-2-2015.pdf)
- **prEN ISO 12312-2** (Entwurf 2025), Katalog & Vorschau: [standards.iteh.ai/…/pren-iso-12312-2](https://standards.iteh.ai/catalog/standards/cen/c4732134-617e-4e4a-b313-c5f363ceec7b/pren-iso-12312-2)
- **Chou, Dain, Fienberg 2021**, *AJ* 162:103, DOI [10.3847/1538-3881/ac013e](https://iopscience.iop.org/article/10.3847/1538-3881/ac013e) — Messdatensatz & Evidenz für den Entwurf
- **AAS zur Norm**: [eclipse.aas.org/eye-safety/iso12312-2](https://eclipse.aas.org/eye-safety/iso12312-2)
- **NASA/GSFC** (Espenak), Augensicherheit inkl. Nah-IR-Grenze ≤ 0,5 %: [eclipse.gsfc.nasa.gov/SEhelp/safety2.html](https://eclipse.gsfc.nasa.gov/SEhelp/safety2.html)
- **DOG-Pressemeldung** zur partiellen Sonnenfinsternis 12.08.2026 (Wärme + photochemisch, Schutzstufe 12–14): [dog.org/pressemeldungen/sonnenfinsternis](https://dog.org/pressemeldungen/sonnenfinsternis)
- **EN 169:2002** (Schweißerfilter, IR-Grenzen je Stufe 1,2–16), Katalog: [standards.iteh.ai/…/en-169-2002](https://standards.iteh.ai/catalog/standards/cen/373524e2-2c01-47bd-936c-c151c336c86e/en-169-2002)
- **EN ISO 16321-2:2021** (Schweiß-Augenschutz, löst EN 169/EN 379 ab), Katalog: [standards.iteh.ai/…/en-iso-16321-2-2021](https://standards.iteh.ai/catalog/standards/cen/ca0578d0-5cb2-4326-b8ef-8539fffa38b7/en-iso-16321-2-2021)
- **BSI-Überblick zu EN ISO 16321** (Umstellung 11.11.2025, „R"-Kennzeichnung): [bsigroup.com/…/understanding-en-iso-16321](https://www.bsigroup.com/en-US/insights-and-media/insights/blogs/a-new-era-in-eye-protection-understanding-en-iso-16321/)
- **EuGH C-588/21 P** („Malamud", 5.3.2024), Pressemitteilung: [curia.europa.eu/…/cp240041en.pdf](https://curia.europa.eu/site/upload/docs/application/pdf/2024-03/cp240041en.pdf)
- **§ 5 UrhG**: [gesetze-im-internet.de/urhg/__5.html](https://www.gesetze-im-internet.de/urhg/__5.html)
- **Zugangsportal C-588/21 P**, Erläuterung: [ds.dk/…/public-access-portal](https://www.ds.dk/en/news/2024/public-access-portal-related-to-case-c-588-21-p-is-now-accessible)
- **Durchführungsbeschluss (EU) 2026/1279** (PSA-Normenliste): [eur-lex.europa.eu/…/32026D1279](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026D1279)

> Kein Ersatz für eine augenärztliche Untersuchung. Bei Sehstörungen: 116117, im Notfall 112.
