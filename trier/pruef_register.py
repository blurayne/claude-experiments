#!/usr/bin/env python3
"""Registerprüfung für den Trier-Guide.

Zählt die Merkmale, an denen KI-Detektoren deutschsprachige Sachprosa
festmachen: Gedankenstriche, Semikola im Fließtext, Schaltwörter wie
„darüber hinaus“, Dreierfiguren und die Gleichtaktung der Satzlängen.

Der Punkt ist nicht, jedes Vorkommen auszurotten. Der Punkt ist, die
Dichte sichtbar zu machen. Zwei Schaltwörter in einem Absatz sind das
Signal, nicht eines im ganzen Kapitel.

Aufruf:  python3 pruef_register.py [datei ...]
"""

import re
import sys
import statistics

SCHALTWOERTER = [
    "Darüber hinaus", "Des Weiteren", "Ferner", "Zudem", "Überdies",
    "Folglich", "Somit", "Mithin", "Zusammenfassend", "Abschließend",
    "Es ist wichtig", "Es sei angemerkt", "Insgesamt betrachtet",
]

AUFGEBLASEN = [
    "umfassend", "ganzheitlich", "nahtlos", "wegweisend", "vielschichtig",
    "robust", "innovativ", "maßgeblich", "essenziell", "essentiell",
    "hochmodern", "zukunftsweisend",
]

BLUMIG = [
    "Teppich aus", "Landschaft aus", "Symphonie", "Reise durch", "Mosaik aus",
    "Kaleidoskop", "Sinfonie",
]


def text_aus_html(roh):
    """Nur den sichtbaren Fließtext, ohne Stil- und Skriptblöcke."""
    roh = re.sub(r"<style.*?</style>", " ", roh, flags=re.S)
    roh = re.sub(r"<script.*?</script>", " ", roh, flags=re.S)
    roh = re.sub(r"<!--.*?-->", " ", roh, flags=re.S)
    roh = re.sub(r"<[^>]+>", " ", roh)
    import html as _html
    roh = _html.unescape(roh)
    return re.sub(r"\s+", " ", roh)


def datenfelder(roh):
    """Die Beschreibungs- und Einordnungstexte aus dem Datenblock."""
    felder = []
    for schluessel in ("d", "rom"):
        felder += re.findall(schluessel + r':"((?:[^"\\]|\\.)*)"', roh)
    return felder


def saetze(t):
    roh = re.split(r"(?<=[.!?])\s+", t)
    return [x for x in roh if len(x.split()) >= 3]


def bericht(name, t):
    print("=" * 62)
    print(name, f"({len(t.split())} Wörter)")
    print("=" * 62)
    striche = t.count("—")
    semi = t.count(";")
    print(f"  Gedankenstriche          {striche:4d}   {striche/max(len(t.split()),1)*1000:5.1f} je 1.000 Wörter")
    print(f"  Semikola                 {semi:4d}")
    for gruppe, woerter in (("Schaltwörter", SCHALTWOERTER),
                            ("Aufgeblasene Adjektive", AUFGEBLASEN),
                            ("Blumige Bilder", BLUMIG)):
        treffer = {w: len(re.findall(re.escape(w), t, re.I)) for w in woerter}
        treffer = {w: c for w, c in treffer.items() if c}
        print(f"  {gruppe:24s} {sum(treffer.values()):4d}   {treffer if treffer else ''}")

    s = saetze(t)
    if not s:
        return
    laengen = [len(x.split()) for x in s]
    print(f"  Sätze                    {len(s):4d}")
    print(f"  Länge im Mittel          {statistics.mean(laengen):6.1f} Wörter")
    print(f"  Standardabweichung       {statistics.pstdev(laengen):6.1f}   (unter 6 ist verdächtig gleichmäßig)")
    kurz = sum(1 for x in laengen if x <= 8)
    lang = sum(1 for x in laengen if x >= 30)
    print(f"  davon kurz (<=8 W.)      {kurz:4d}   ({kurz/len(s)*100:.0f} %)")
    print(f"  davon lang (>=30 W.)     {lang:4d}   ({lang/len(s)*100:.0f} %)")
    gleich = sum(1 for a, b in zip(laengen, laengen[1:]) if abs(a - b) <= 3)
    print(f"  Nachbarsätze fast gleich {gleich:4d}   ({gleich/max(len(laengen)-1,1)*100:.0f} % — unter 35 % ist gut)")
    print(f"  Fragesätze               {t.count('?'):4d}")


def main():
    dateien = sys.argv[1:] or ["index.html", "index.md"]
    for d in dateien:
        roh = open(d, encoding="utf-8").read()
        if d.endswith(".html"):
            # Der Prompt-Block listet die verpönten Wörter selbst auf. Wer ihn
            # mitzählt, misst die Regelliste statt der Prosa.
            ohne_prompt = re.sub(r'<pre id="promptText">.*?</pre>', " ", roh, flags=re.S)
            bericht(d + "  [Fließtext ohne Prompt]", text_aus_html(ohne_prompt))
            bericht(d + "  [Kartentexte]", " ".join(datenfelder(roh)))
        else:
            bericht(d, roh)


if __name__ == "__main__":
    main()
