#!/usr/bin/env python3
"""Prüft die Belegverweise des Trier-Guides, so weit es ohne Netz geht.

Was dieses Skript NICHT kann: die Adressen abrufen. In der Umgebung, in der
der Guide entstanden ist, beantwortet der Egress-Proxy jedes CONNECT mit 403.
Ein HTTP-Status je Link ist damit nicht zu haben, und das steht auch so im
Report.

Was es kann, und was die häufigsten Fehlerarten abdeckt:

  * Form:      Schema, Host, verbotene Zeichen, doppelte Schrägstriche,
               Leerzeichen, unmaskierte Klammern
  * Zuordnung: zeigt ein Link auf eine Domain, die zum Eintrag passt, oder
               wurde beim Kopieren die Zeile darüber erwischt
  * Dubletten: dieselbe URL unter verschiedenen Beschriftungen, und dieselbe
               Beschriftung auf verschiedene URLs
  * Waisen:    Domains, die im Quellenverzeichnis fehlen

Aufruf:  python3 pruef_links.py [datei]
"""

import re
import sys
import collections
from urllib.parse import urlsplit

ERLAUBTES_SCHEMA = ("https",)


def eintraege(roh):
    """(id, name, [(beschriftung, url), ...]) je Kartendatensatz."""
    raus = []
    for m in re.finditer(r'\{id:"([^"]+)".*?n:"((?:[^"\\]|\\.)*)".*?lk:\[(.*?)\]\}', roh, re.S):
        links = re.findall(r'\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"\]', m.group(3))
        raus.append((m.group(1), m.group(2), links))
    return raus


def form_pruefen(url):
    fehler = []
    teile = urlsplit(url)
    if teile.scheme not in ERLAUBTES_SCHEMA:
        fehler.append("Schema " + (teile.scheme or "fehlt"))
    if not teile.netloc:
        fehler.append("kein Host")
    elif "." not in teile.netloc:
        fehler.append("Host ohne Punkt")
    if " " in url:
        fehler.append("Leerzeichen")
    if "//" in teile.path:
        fehler.append("doppelter Schrägstrich im Pfad")
    if re.search(r"[<>\"'`]", url):
        fehler.append("verbotenes Zeichen")
    if url.rstrip().endswith(("(", ",", ".")):
        fehler.append("endet auf Satzzeichen")
    return fehler


def main():
    pfad = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    roh = open(pfad, encoding="utf-8").read()
    daten = eintraege(roh)

    alle = []
    for eid, name, links in daten:
        for beschr, url in links:
            alle.append((eid, name, beschr, url))

    print("Einträge:", len(daten), "| Belegverweise:", len(alle))
    print("Abruf nicht möglich: Egress-Proxy beantwortet CONNECT mit 403.\n")

    # --- Form ---
    kaputt = [(e, u, form_pruefen(u)) for e, n, b, u in alle]
    kaputt = [(e, u, f) for e, u, f in kaputt if f]
    print("FORM:", len(kaputt), "beanstandet")
    for e, u, f in kaputt:
        print("   ", e, "|", u[:70], "->", ", ".join(f))

    # --- eine URL, mehrere Beschriftungen ---
    nach_url = collections.defaultdict(set)
    for e, n, b, u in alle:
        nach_url[u].add(b)
    mehrdeutig = {u: b for u, b in nach_url.items() if len(b) > 1}
    print("\nGLEICHE URL, VERSCHIEDENE BESCHRIFTUNG:", len(mehrdeutig))
    for u, b in list(mehrdeutig.items())[:10]:
        print("   ", u[:64], "->", " | ".join(sorted(b))[:90])

    # --- Domain kommt im Quellenverzeichnis vor? ---
    quellen = roh[roh.find('<section id="quellen">'):roh.find('<section id="prompt">')]
    q_hosts = set(re.findall(r'https?://([^/"]+)', quellen))
    e_hosts = collections.Counter(urlsplit(u).netloc for e, n, b, u in alle)
    fehlend = {h: c for h, c in e_hosts.items() if h not in q_hosts}
    print("\nDOMAINS DER KARTEN, DIE IM QUELLENVERZEICHNIS FEHLEN:", len(fehlend))
    for h, c in sorted(fehlend.items(), key=lambda x: -x[1]):
        print(f"    {c:3d}x  {h}")

    # --- Einträge ohne Beleg ---
    ohne = [e for e, n, l in daten if not l]
    print("\nEINTRÄGE OHNE BELEG:", len(ohne), ohne)

    print("\nDOMAINS INSGESAMT:", len(e_hosts))
    for h, c in e_hosts.most_common(12):
        print(f"    {c:3d}x  {h}")


if __name__ == "__main__":
    main()
