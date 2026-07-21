# KI-Rentabilität — Lokale KI 2026: rechnet sich das?

Interaktiver deutscher Analyse-Report (Stand 19. Juli 2026), ob sich der Eigenbetrieb lokaler KI-Modelle — **Gemma 4** und **Qwen 3.5/3.6** — auf eigener Hardware rechnet, verglichen mit Cloud-Abos, Budget-APIs und gemieteten Open-Weights (OpenRouter, DeepInfra, Bedrock). Betrachtete Workloads: intensives Coding (1–8 h/Tag) plus sparsame Familiennutzung (3 Personen).

## Report

- **[lokale-ki-rentabilitaet.html](lokale-ki-rentabilitaet.html)** — der vollständige Report (eigenständige HTML-Datei mit eingebettetem Chart.js, Hell-/Dunkel-Umschalter)

## Inhalt

1. **Kurzfazit** — Speicherkrise treibt GPU-Preise (RTX 5090 ≈ 3.900 €), MoE-Modelle als Lichtblick, Sweet Spots (gebrauchte RTX 3090 24 GB, Strix-Halo-Mini-PC 128 GB), ehrliche Rechnung gegen Abo/API.
2. **Die Modelle** — Gemma 4 vs. Qwen 3.5/3.6: Größen, VRAM-Bedarf (Q4), Kontext, Multimodalität, MoE-Architekturen (26B-A4B, 35B-A3B) und MTP-Drafter.
3. **Hardware-Matrix (Juli 2026)** — Kaufoptionen von Edge bis High-End mit Preisen und Verbrauch.
4. **Interaktiver Kosten-Rechner** — Anschaffung, Stromkosten und Betriebsmodus (Leerlauf als großer Hebel) gegen Abo-/API-Kosten.
5. **Software-Stack** — lokal + remote unter einem Dach.
6. **Sprache ↔ Text** — Whisper & Co. für Diktat und Voice.
7. **Drei vertretbare Setups** und eine **Setup-Blaupause** („eine Box für alles").
8. **Annahmen & Rechenweg** mit Quellenangaben.
