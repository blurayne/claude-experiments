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

| Kategorie | UV 280–315 | UV 315–380 | Sichtbar max | Sichtbar min | IR 780–1400 |
|---|---|---|---|---|---|
| Solar (direkte Beobachtung) | τ_v | τ_v | 0,003 2 | 0,000 061 | 3 |
| Schweißen **W12** | 0,000 3 | 0,001 2 | 0,003 2 | 0,001 2 | 12 |
| Schweißen **W13** | 0,000 3 | 0,000 44 | 0,001 2 | 0,000 44 | 8 |
| Schweißen **W14** | 0,000 16 | 0,000 16 | 0,000 44 | 0,000 16 | 6 |
| Schweißen **W15** | 0,000 061 | 0,000 061 | 0,000 16 | 0,000 061 | 4 |

Der A-Anhang stellt zudem im Klartext fest: **Schweißerfilter der Stufen 12 bis 15 (nach ISO 16321) sind für das bloße Auge „equally suitable"** — W12 ausreichend, aber hell; W14 möglicherweise zu dunkel. Genau die Position, die DOG und AAS vertreten — hier aus der Norm selbst.

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
- **EuGH C-588/21 P** („Malamud", 5.3.2024), Pressemitteilung: [curia.europa.eu/…/cp240041en.pdf](https://curia.europa.eu/site/upload/docs/application/pdf/2024-03/cp240041en.pdf)
- **§ 5 UrhG**: [gesetze-im-internet.de/urhg/__5.html](https://www.gesetze-im-internet.de/urhg/__5.html)
- **Zugangsportal C-588/21 P**, Erläuterung: [ds.dk/…/public-access-portal](https://www.ds.dk/en/news/2024/public-access-portal-related-to-case-c-588-21-p-is-now-accessible)
- **Durchführungsbeschluss (EU) 2026/1279** (PSA-Normenliste): [eur-lex.europa.eu/…/32026D1279](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026D1279)

> Kein Ersatz für eine augenärztliche Untersuchung. Bei Sehstörungen: 116117, im Notfall 112.
