#!/usr/bin/env python3
"""Erzeugt das Spektralklassen-Chart für das Behelfsfilter-Kapitel."""

OK, WARN, BAD, UNK = 'ok', 'warn', 'bad', 'unk'
COL = {OK: '#5fbf6e', WARN: '#f5a623', BAD: '#e8604c', UNK: '#9b8cf0'}

BANDS = [
    ('UV-B', '280–315'), ('UV-A', '315–400'), ('Blau', '400–500'),
    ('Sichtbar', '500–780'), ('IR-A', '780–1400'), ('IR-B/C', '1400–2000'),
]

ROWS = [
    ('ISO-Finsternisbrille', 'zertifiziert nach 12312-2', 'ref',
     [(OK, '✓')] * 6, '1·10⁻⁵'),
    ('Solarfolie ND 5.0', 'aluminisiert, planoptisch', 'ref',
     [(OK, '✓')] * 6, '1·10⁻⁵'),
    ('Stapel 5 + 11', 'Schutzstufe 15', 'test',
     [(OK, '✓'), (OK, '✓'), (OK, '✓'), (OK, '✓'),
      (WARN, '~'), (WARN, '~')], '1,0·10⁻⁶'),
    ('Schweißglas DIN 14', 'einzeln', 'test',
     [(OK, '✓'), (OK, '✓'), (OK, '✓'), (OK, '✓'),
      (WARN, '~'), (WARN, '~')], '2,7·10⁻⁶'),
    ('Sonnenbrille Kat. 3', 'EN 1836', 'alt',
     [(BAD, '✗'), (BAD, '✗'), (BAD, '3·10³×'),
      (BAD, '3·10³×'), (BAD, '~30×'), (UNK, '?')], '1·10⁻¹'),
    ('3 × Sonnenbrille', 'gestapelt', 'alt',
     [(BAD, '✗'), (BAD, '✗'), (BAD, '30×'),
      (BAD, '30×'), (BAD, '~20×'), (UNK, '?')], '1·10⁻³'),
    ('Gletscherbrille Kat. 4', 'EN 1836', 'alt',
     [(BAD, '✗'), (BAD, '✗'), (BAD, '1,5·10³×'),
      (BAD, '1,5·10³×'), (BAD, '✗'), (UNK, '?')], '5·10⁻²'),
    ('CD / DVD', 'zugleich Beugungsgitter', 'alt',
     [(WARN, '~'), (WARN, '~'), (UNK, '?'), (UNK, '?'), (UNK, '?'), (UNK, '?')], 'unbekannt'),
    ('Farbfilm · Röntgenfolie', 'Dichte aus Farbstoff', 'alt',
     [(WARN, '~'), (WARN, '~'), (UNK, '?'), (UNK, '?'), (BAD, '✗'), (UNK, '?')], 'unbekannt'),
    ('Berußtes Glas', 'Material neutral, Schicht nicht', 'alt',
     [(WARN, '~'), (WARN, '~'), (UNK, '?'), (UNK, '?'), (UNK, '?'), (UNK, '?')], 'unbekannt'),
    ('Rettungsdecke, gefaltet', 'Pinholes in den Knicken', 'alt',
     [(UNK, '?')] * 6, 'unbekannt'),
]

W = 980
LEFT, COLW, GAP = 262, 92, 4
TAUX = LEFT + 6 * COLW + 14
HEAD, ROWH, ROWGAP = 44, 34, 5
H = HEAD + len(ROWS) * (ROWH + ROWGAP) + 8

out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Spektralklassen der Filtermedien">']
out.append('<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" '
           'patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" '
           f'stroke="{COL[UNK]}" stroke-width="2.4" stroke-opacity=".55"/></pattern></defs>')

# Kopfzeile
for i, (name, rng) in enumerate(BANDS):
    x = LEFT + i * COLW
    out.append(f'<text x="{x + COLW/2 - GAP/2:.1f}" y="18" text-anchor="middle" fill="currentColor" '
               f'fill-opacity=".85" font-family="IBM Plex Mono" font-size="11" font-weight="600">{name}</text>')
    out.append(f'<text x="{x + COLW/2 - GAP/2:.1f}" y="31" text-anchor="middle" fill="currentColor" '
               f'fill-opacity=".45" font-family="IBM Plex Mono" font-size="9">{rng} nm</text>')
out.append(f'<text x="{TAUX + 60}" y="18" text-anchor="middle" fill="currentColor" fill-opacity=".85" '
           f'font-family="IBM Plex Mono" font-size="11" font-weight="600">τ sichtbar</text>')
out.append(f'<text x="{TAUX + 60}" y="31" text-anchor="middle" fill="currentColor" fill-opacity=".45" '
           f'font-family="IBM Plex Mono" font-size="9">ISO: 6·10⁻⁷ … 3,2·10⁻⁵</text>')
out.append(f'<line x1="0" y1="{HEAD-8}" x2="{W}" y2="{HEAD-8}" stroke="currentColor" stroke-opacity=".2"/>')

for r, (label, sub, kind, cells, tau) in enumerate(ROWS):
    y = HEAD + r * (ROWH + ROWGAP)
    weight = '600' if kind in ('ref', 'test') else '500'
    op = '.95' if kind == 'test' else ('.8' if kind == 'ref' else '.7')
    out.append(f'<text x="0" y="{y + 14}" fill="currentColor" fill-opacity="{op}" '
               f'font-family="Space Grotesk,sans-serif" font-size="12.5" font-weight="{weight}">{label}</text>')
    out.append(f'<text x="0" y="{y + 27}" fill="currentColor" fill-opacity=".42" '
               f'font-family="IBM Plex Mono" font-size="9.5">{sub}</text>')
    if kind == 'test':
        out.append(f'<rect x="-8" y="{y-2}" width="{W+8}" height="{ROWH+4}" fill="currentColor" '
                   f'fill-opacity=".045" rx="3"/>')
    for i, (state, txt) in enumerate(cells):
        x = LEFT + i * COLW
        c = COL[state]
        fill = 'url(#hatch)' if state == UNK else c
        fo = '1' if state == UNK else '.22'
        out.append(f'<rect x="{x}" y="{y}" width="{COLW-GAP}" height="{ROWH}" rx="3" '
                   f'fill="{fill}" fill-opacity="{fo}" stroke="{c}" stroke-opacity=".65"/>')
        out.append(f'<text x="{x + (COLW-GAP)/2:.1f}" y="{y + ROWH/2 + 4:.1f}" text-anchor="middle" '
                   f'fill="{c}" font-family="IBM Plex Mono" font-size="11" font-weight="600">{txt}</text>')
    # τ wird nach der ISO-Fensterlage eingefärbt, nicht pauschal grün
    if tau == 'unbekannt':
        tc, topa = 'currentColor', '.45'
    else:
        mant, exp = tau.split('·10⁻')
        val = float(mant.replace(',', '.')) * 10 ** -int(exp.translate(str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')))
        tc = COL[OK] if 6.1e-7 <= val <= 3.2e-5 else COL[BAD]
        topa = '.95'
    out.append(f'<text x="{TAUX + 60}" y="{y + ROWH/2 + 4:.1f}" text-anchor="middle" fill="{tc}" '
               f'fill-opacity="{topa}" font-family="IBM Plex Mono" font-size="11">{tau}</text>')

out.append('</svg>')
open('/tmp/claude-0/-home-user-claude-experiments/7f3d1c88-023f-5ba9-b89f-3efe1a966c06/scratchpad/bands.svg',
     'w', encoding='utf-8').write('\n'.join(out))
print('ok', H)
