#!/usr/bin/env python3
"""Build earth-map.webp for Galactic Transit: today's real land from basemap's bundled
GSHHG data (public domain), cut into plates, with a continentality channel.

    python3 tools/build_earth_map.py            # writes ../earth-map.webp and a preview

Layout, 2048x1024 equirectangular, lon -180..180 left to right, lat +90..-90 top to bottom:
  R  land (255) or sea (0), from basemap's 5-minute land/sea mask
  G  plate id x 32: 0 Antarctica, 1 India, 2 Australia, 3 S. America, 4 N. America,
     5 Africa (with Arabia), 6 Eurasia — the polygons below are drawn by hand and are a
     schematic of the major plates, not a plate model
  B  continentality: the land mask blurred (sigma ~4 degrees), 0 at sea, high in the
     interiors — the shader uses it for aridity and, inverted, as a stand-in for depth
     when the oceans go
Needs: numpy, Pillow, matplotlib, basemap + basemap-data (pip).
"""
import numpy as np
from PIL import Image
from matplotlib.path import Path
from mpl_toolkits.basemap import maskoceans
from pathlib import Path as P

W, H = 2048, 1024
lons = (np.arange(W) + 0.5) / W * 360 - 180
lats = 90 - (np.arange(H) + 0.5) / H * 180
LON, LAT = np.meshgrid(lons, lats)

# --- land from the bundled 5-minute mask (maskoceans masks ocean cells; lakes count as land here)
land = ~maskoceans(LON, LAT, np.zeros_like(LON), inlands=False, resolution='l', grid=5).mask

# --- plates: schematic polygons in lon/lat, first match wins
PLATES = [
  ('Antarctica', [(-180,-60),(180,-60),(180,-90),(-180,-90)]),
  ('India',      [(65,25),(75,32),(90,28),(92,20),(80,5),(76,6),(68,20)]),
  ('Australia',  [(110,-10),(150,-8),(155,-25),(180,-30),(180,-50),(165,-50),(140,-45),(112,-38)]),
  ('S. America', [(-82,10),(-60,13),(-35,0),(-35,-25),(-50,-40),(-70,-56),(-76,-45),(-82,-10)]),
  ('N. America', [(-170,72),(-60,84),(-10,84),(-10,60),(-45,58),(-52,45),(-75,38),(-75,20),(-83,8),(-95,15),(-110,22),(-125,32),(-135,50),(-170,55)]),
  ('Africa',     [(-20,37),(10,38),(36,38),(60,30),(60,12),(52,10),(52,-5),(53,-28),(40,-36),(20,-36),(10,-20),(-18,10)]),
  ('Eurasia',    [(-12,60),(-12,36),(30,36),(45,37),(60,30),(70,24),(75,30),(92,26),(100,10),(110,0),(120,5),(130,25),(145,40),(160,60),(180,68),(180,80),(30,82),(-12,80)]),
]
pts = np.column_stack([LON.ravel(), LAT.ravel()])
plate = np.full(W*H, -1, dtype=np.int16)
for k, (name, poly) in enumerate(PLATES):
    inside = Path(poly).contains_points(pts)
    plate[(plate < 0) & inside] = k
# land the polygons missed (islands, coasts on the edges): by rule
miss = (plate < 0)
lonf, latf = LON.ravel(), LAT.ravel()
plate[miss & (latf < -60)] = 0
plate[miss & (lonf > -170) & (lonf < -30) & (latf >= 12)] = 4
plate[miss & (lonf > -170) & (lonf < -30) & (latf < 12) & (latf >= -60)] = 3
plate[miss & ((lonf >= -30) | (lonf <= -170)) & (latf > -10) & (latf >= -60)] = 6
plate[miss & ((lonf >= -30) | (lonf <= -170)) & (latf <= -10) & (latf >= -60)] = 2
plate = plate.reshape(H, W)

# --- continentality: a blur of the land mask, wrapping in longitude
def blur(a, sigma):
    r = int(3*sigma); x = np.arange(-r, r+1); k = np.exp(-x*x/(2*sigma*sigma)); k /= k.sum()
    t = np.apply_along_axis(lambda v: np.convolve(np.concatenate([v[-r:], v, v[:r]]), k, mode='same')[r:-r], 1, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 0, t)
cont = blur(land.astype(float), 46.0)         # ~4 degrees at 2048 px per 360
cont = np.clip(cont / max(1e-6, np.percentile(cont[land], 95)), 0, 1)

rgb = np.zeros((H, W, 3), np.uint8)
rgb[..., 0] = land * 255
rgb[..., 1] = (plate * 32).astype(np.uint8)
rgb[..., 2] = (cont * 255).astype(np.uint8)
out = P(__file__).resolve().parent.parent / 'earth-map.webp'
Image.fromarray(rgb).save(out, lossless=True, method=6)
# preview: plates coloured, sea dark
cols = np.array([[210,210,230],[230,120,60],[240,200,60],[80,200,120],[80,120,230],[200,80,80],[150,100,220]])
prev = np.where(land[..., None], cols[np.clip(plate,0,6)], np.array([[[8,20,50]]])).astype(np.uint8)
Image.fromarray(prev).resize((1024, 512)).save(P(__file__).resolve().parent / 'earth-map-preview.png')
print(f'land fraction {100*land.mean():.1f}%  plates: ' + ', '.join(f'{n} {100*((plate==k)&land).sum()/land.sum():.0f}%' for k,(n,_) in enumerate(PLATES)))
print('wrote', out, out.stat().st_size//1024, 'KB')
