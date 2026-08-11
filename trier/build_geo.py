#!/usr/bin/env python3
"""Erzeugt den Geodaten-Block (G = {...}) für index.html.

Warum eigenes Rechnen statt Routing: In der Umgebung, in der dieser Guide
entstanden ist, waren OSRM, Valhalla und Nominatim per Netzwerkrichtlinie
gesperrt (403 am Egress-Proxy). Statt Fahrzeiten frei zu erfinden, rechnet
dieses Skript sie nach einem offengelegten, nachvollziehbaren Modell:

  Luftlinie   -> Haversine über die Koordinaten (exakt)
  Wegstrecke  -> Luftlinie * UMWEG (Umwegfaktor)
  Zeit        -> bis FUSSGRENZE km zu Fuß mit GEHTEMPO, darüber mit dem Auto
                 mit entfernungsabhängiger Reisegeschwindigkeit
  Peilung     -> Anfangskurs (forward azimuth), für das Radar

Jede so erzeugte Zahl ist damit eine *Rechnung*, keine Messung — im Guide
steht das an jeder Stelle dabei, an der die Zahlen auftauchen.
"""

import math

# --- Modellparameter, bewusst an einer Stelle und benannt ---------------
UMWEG = 1.28          # Straßen-/Gassenumweg gegenüber der Luftlinie
FUSSGRENZE = 2.2      # km Luftlinie, bis zu der zu Fuß gerechnet wird
GEHTEMPO = 4.7        # km/h, Altstadtpflaster und Ampeln eingerechnet
GEHZUSCHLAG = 2       # min, Orientierung und Übergänge
FAHRZUSCHLAG = 4      # min, Anfahren, Parken suchen ist NICHT enthalten


def tempo(luft_km):
    """Reisegeschwindigkeit nach Entfernungsband (Stadt -> Land -> Autobahn)."""
    if luft_km < 8:
        return 32.0
    if luft_km < 20:
        return 50.0
    if luft_km < 40:
        return 62.0
    return 72.0


R_ERDE = 6371.0088


def haversine(a, b):
    la1, lo1 = math.radians(a[0]), math.radians(a[1])
    la2, lo2 = math.radians(b[0]), math.radians(b[1])
    dla, dlo = la2 - la1, lo2 - lo1
    h = math.sin(dla / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlo / 2) ** 2
    return 2 * R_ERDE * math.asin(math.sqrt(h))


def peilung(a, b):
    la1, lo1 = math.radians(a[0]), math.radians(a[1])
    la2, lo2 = math.radians(b[0]), math.radians(b[1])
    dlo = lo2 - lo1
    y = math.sin(dlo) * math.cos(la2)
    x = math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(dlo)
    return round((math.degrees(math.atan2(y, x)) + 360) % 360)


def strecke(start, ziel, zu_fuss):
    """Ein Ziel ist entweder ein Fußziel oder ein Fahrziel — für BEIDE
    Startpunkte gleich. Sonst stünde dasselbe Ziel je nach Startort einmal
    als 33-Minuten-Fußweg und einmal als 10-Minuten-Fahrt da, und der
    Umkreisregler verglich Äpfel mit Birnen."""
    luft = haversine(start, ziel)
    km = round(luft * UMWEG, 1)
    if zu_fuss:
        minuten = round(luft * UMWEG / GEHTEMPO * 60 + GEHZUSCHLAG)
        art = "fuss"
    else:
        minuten = round(luft * UMWEG / tempo(luft) * 60 + FAHRZUSCHLAG)
        art = "auto"
    return km, max(minuten, 1), peilung(start, ziel), art


# --- Startpunkte -------------------------------------------------------
PORTA_NIGRA = (49.75972, 6.64400)
HAUPTBAHNHOF = (49.75630, 6.65410)
# Dritter Start: Kenn, rund 9 km moselabwärts, oft die Unterkunft für Trier.
KENN = (49.80194, 6.72250)

# --- Ziele -------------------------------------------------------------
# Koordinaten aus Kartenkenntnis der Standorte, nicht aus einem Geocoder
# (Nominatim war gesperrt). Deshalb zeigen die Google-Maps-Links im Guide
# auf die Namenssuche, nicht auf die Koordinate — ein Zahlendreher schickt
# damit niemanden in den Wald. Siehe Kapitel „Was offen bleibt“.
ZIELE = {
    # --- römisches Trier ---
    "porta-nigra":      (49.75972, 6.64400),
    "amphitheater":     (49.75090, 6.65220),
    "kaiserthermen":    (49.75050, 6.64380),
    "barbarathermen":   (49.75220, 6.63290),
    "viehmarktthermen": (49.75410, 6.63770),
    "basilika":         (49.75360, 6.64370),
    "roemerbruecke":    (49.75290, 6.63000),
    "kryptoportikus":   (49.75290, 6.64400),
    "dom":              (49.75630, 6.64370),
    "liebfrauen":       (49.75580, 6.64380),
    "landesmuseum":     (49.75190, 6.64440),
    "museum-am-dom":    (49.75730, 6.64480),
    "domschatz":        (49.75640, 6.64420),
    "simeonstift":      (49.75940, 6.64320),
    "igel":             (49.70750, 6.53750),
    # --- Stadt & Umfeld ---
    "hauptmarkt":       (49.75610, 6.64140),
    "karl-marx":        (49.75390, 6.63570),
    "petrisberg":       (49.75130, 6.67100),
    "mariensaeule":     (49.74970, 6.62220),
    "weinkulturpfad":   (49.74720, 6.66900),
    "roemerexpress":    (49.75940, 6.64440),
    "moselschiff":      (49.76070, 6.63200),
    "wochenmarkt":      (49.75410, 6.63770),
    # --- Wein & Essen ---
    "hospitien":        (49.75830, 6.63430),
    "domstein":         (49.75600, 6.64200),
    "kesselstatt":      (49.75560, 6.64320),
    "kiste":            (49.75410, 6.63940),
    "bagatelle":        (49.76250, 6.63200),
    "blesius":          (49.74520, 6.66560),
    "zurlauben":        (49.76200, 6.63200),
    "oechsle":          (49.75500, 6.64080),
    # --- römisches Umland ---
    "tawern":           (49.64780, 6.54600),
    "villa-otrang":     (50.00440, 6.55330),
    "villa-nennig":     (49.53480, 6.37110),
    "villa-borg":       (49.50110, 6.41940),
    "villa-longuich":   (49.82880, 6.77020),
    "villa-echternach": (49.81060, 6.41390),
    "villa-wittlich":   (49.98610, 6.89310),
    "kelter-piesport":  (49.88000, 6.92560),
    "kelter-brauneberg": (49.90420, 6.98190),
    "weinschiff":       (49.85560, 6.88940),
    "wasserleitung":    (49.73610, 6.75000),
    "qanat-poelich":    (49.81060, 6.80470),
    # --- römisches Umland, weiter gefasst (2026 ergänzt) ---
    "belginum":         (49.85541, 7.16458),
    "dalheim":          (49.53940, 6.25650),
    "bitburg-beda":     (49.97495, 6.52388),
    "titelberg":        (49.53750, 5.86250),
    "otzenhausen":      (49.62306, 7.00222),
    "bliesbruck":       (49.13530, 7.18310),
    "schwarzenacker":   (49.28260, 7.31600),
    "ausonius":         (49.92509, 7.35227),
    # --- makaber, bizarr, unterirdisch ---
    "matthias":         (49.74050, 6.63550),
    "paulin":           (49.76600, 6.64800),
    "maximin":          (49.76350, 6.64550),
    "judenfriedhof":    (49.75300, 6.63300),
    "dreikoenigenhaus": (49.75800, 6.64250),
    "frankenturm":      (49.75620, 6.63950),
    "klause":           (49.56200, 6.60500),
    "genoveva":         (49.83900, 6.62500),
    "teufelsschlucht":  (49.83900, 6.43100),
    "kasematten":       (49.61150, 6.13400),
    "muellerthal":      (49.79000, 6.31300),
    # --- zweites Programm: Kind, Katzen, ruhiger Tag ---
    "katzentempel":     (49.75510, 6.64070),
    "petrispark":       (49.75250, 6.67400),
    "nellspark":        (49.76600, 6.64500),
    "nordbad":          (49.76900, 6.62800),
    "suedbad":          (49.73900, 6.65000),
    "mattheiser":       (49.73400, 6.64700),
    "spielzeugmuseum":  (49.75630, 6.64150),
    "konditorei":       (49.75550, 6.64000),
    "cityquest":        (49.75950, 6.64430),
    "indoorpark":       (49.77700, 6.64000),
    "eifelpark":        (49.98630, 6.49970),
    "wildpark-weiskirchen": (49.55900, 6.80500),
    # --- Umland allgemein ---
    "roscheider-hof":   (49.70420, 6.58220),
    "saarburg":         (49.60670, 6.54970),
    "greifvogelpark":   (49.59890, 6.54860),
    "baumwipfelpfad":   (49.51580, 6.53860),
    "bernkastel":       (49.91610, 7.07000),
    "luxemburg":        (49.61100, 6.13190),
    "nittel":           (49.64060, 6.42780),
    # --- Events an eigenen Orten ---
    "augustinerhof":    (49.75630, 6.64010),
    "domfreihof":       (49.75700, 6.64350),
}


def main():
    zeilen = []
    for zid, koord in ZIELE.items():
        # Fußziel, sobald es von EINEM der beiden Startpunkte in Gehweite liegt
        nah = min(haversine(PORTA_NIGRA, koord), haversine(HAUPTBAHNHOF, koord))
        zu_fuss = nah <= FUSSGRENZE
        kp, mp, dp, art = strecke(PORTA_NIGRA, koord, zu_fuss)
        kh, mh, dh, _ = strecke(HAUPTBAHNHOF, koord, zu_fuss)
        # Kenn liegt rund 9 km außerhalb. Ob ein Ziel von dort zu Fuß zählt,
        # entscheidet die Kenner Entfernung selbst — sonst stünde für die
        # Altstadt eine unsinnige Gehzeit über neun Kilometer. Deshalb hat der
        # Kenn-Start eine eigene Fuß-/Fahr-Kennung (artk).
        zu_fuss_k = haversine(KENN, koord) <= FUSSGRENZE
        kk, mk, dk, artk = strecke(KENN, koord, zu_fuss_k)
        zeilen.append(
            ' "%s":{kp:%.1f,mp:%d,kh:%.1f,mh:%d,kk:%.1f,mk:%d,dp:%d,dh:%d,dk:%d,art:"%s",artk:"%s",la:%.5f,lo:%.5f},'
            % (zid, kp, mp, kh, mh, kk, mk, dp, dh, dk, art, artk, koord[0], koord[1])
        )
    print("const G={")
    print("\n".join(zeilen).rstrip(","))
    print("};")


if __name__ == "__main__":
    main()
