# Getting weather data: Google WeatherNext 3 and DWD

What each source actually requires — accounts, approvals, keys, formats, licences — and what you get for the trouble. Every URL and identifier below was probed live on **7 September 2026**; see [Verification log](#verification-log) at the end for what was checked how.

## The short version

| | **WeatherNext 3 (raw)** | **Maps Platform Weather API** | **DWD Open Data** |
|---|---|---|---|
| Account needed | Google Account | GCP project with billing | none |
| Approval | manual, 5–7 business days | none | none |
| Credentials | Google Cloud ADC / OAuth | API key | none |
| Cost | GCP usage (BigQuery/GCS/EE) | per request, billing required | free |
| Format | Zarr v3, BigQuery tables, EE `ImageCollection` | JSON | KMZ, GRIB2, CAP-XML, CSV |
| Coverage | global | global | Germany strong, Europe/global thinner |
| Ensemble | 64 members | no | yes (ICON-EPS), plus MOSMIX percentiles |
| Licence | mixed (see below) | Maps Platform ToS | GeoNutzV, attribution required |
| Time to first byte | a week | ~30 minutes | ~2 minutes |

If you want data *today* and you care about Germany, use DWD. If you want a global 64-member AI ensemble and can wait a week for the allowlist, use WeatherNext 3. If you just want "what's the weather at this lat/lon" as JSON with no GIS stack, use the Maps Platform Weather API — but note it is *not* raw WeatherNext output.

---

## Google WeatherNext 3

WeatherNext 3 is Google DeepMind's global probabilistic forecast model, announced 3 September 2026. It runs a new initialization **every UTC hour**, emits **64 ensemble members**, and reaches **15 days (360 h)** on the 00/06/12/18 UTC cycles; the 20 interim hourly runs go out 48 h. Resolution is tiered: 0.05° for station-calibrated surface variables (temperature, dew point), 0.1° for the gridded surface fields, 0.25° for atmospheric pressure levels.

It is **not open source**. The research-model line (GraphCast, GenCast and friends) is on GitHub under open licences, but the operational WeatherNext 3 weights are not published — you consume its output, you don't run it.

There are three doors, and they are not equivalent.

### Door 1 — raw forecast data (the real thing, gated)

One request form gates all three delivery surfaces at once. Submit it, wait, and your **Google Account** is allowlisted for Cloud Storage, BigQuery and Earth Engine simultaneously.

**Request form:** <https://docs.google.com/forms/d/e/1FAIpQLSeCf1JY8G78UDWzbm0ly9kJxfSjUIJT5WyMR_HiNqCm-IHIBg/viewform>

Reviewed on a rolling basis, typically approved in **5–7 business days**. You do not need a paid Google Cloud contract — a plain `@gmail.com` account qualifies. Use the same Google Account email you will authenticate with, because the allowlist is bound to the account, not to the GCP project.

Once approved:

**a) Cloud Storage (Zarr v3)** — the only surface that carries the full 64-member ensemble and the 3D pressure levels.

```
gs://weathernext3_spatial/              # full ensemble
gs://weathernext3_statistics_spatial/   # precomputed distribution statistics
```

Read with `xarray` + `zarr` + `gcsfs`; authenticate with `gcloud auth application-default login`. Budget for real volume — a 64-member, hourly, 15-day global run is not something you casually pull over a home connection. Egress is billed to your project.

**b) BigQuery** — subscribe through Analytics Hub rather than querying a fixed dataset ID. The publisher side is:

| | |
|---|---|
| Publisher project | `gcp-public-data-weathernext` |
| Data exchange | `weathernext_19397e1bcb7` |
| Listing (WeatherNext 3) | `weathernext_3_1a067c1e929` |
| Location | `us` |

Click **Add dataset to project**, pick your own destination dataset name, and the tables link in as `YOUR_PROJECT.YOUR_DATASET.weathernext_3_0_0_0p1deg` and `…_0p05deg`. Because you choose the destination name, there is no canonical BigQuery dataset ID to hard-code.

Schema shape: one row per grid cell per run, with the time series nested.

- `init_time` — `TIMESTAMP`, **the partition key**
- `geography` — `GEOGRAPHY` point
- `geography_polygon` — `GEOGRAPHY` polygon (the cell footprint)
- `forecast` — `RECORD, REPEATED`, each entry holding `time`, `hours`, and the per-variable statistics `_mean`, `_p10`, `_p25`, `_p50`, `_p75`, `_p90`

The 0.1° table carries 19 gridded surface variables × 6 statistics ≈ 114 metrics; the 0.05° table carries the station-head temperature and dew point (12 metrics).

```sql
SELECT
  t.geography_polygon,
  f.time AS forecast_time,
  f.temperature_2m_mean - 273.15 AS temp_c,
  f.total_precipitation_1hr_mean * 1000 AS precip_mm
FROM `YOUR_PROJECT.YOUR_DATASET.weathernext_3_0_0_0p1deg` AS t,
  t.forecast AS f
WHERE t.init_time = TIMESTAMP('2026-08-26 00:00:00 UTC')
  AND f.hours <= 120
ORDER BY f.time;
```

Always filter on `init_time` — it is the partition key, and forgetting it turns a cheap query into a full-table scan of a global hourly archive. Never `SELECT *`. For spatial joins use `ST_INTERSECTS` against `geography_polygon`.

**c) Earth Engine** — the convenient surface, but it only exposes the precomputed statistics, not the individual members.

```
projects/gcp-public-data-weathernext/assets/weathernext_3_0_0_0p1deg
projects/gcp-public-data-weathernext/assets/weathernext_3_0_0_0p05deg
```

```python
import ee
ee.Initialize(project="YOUR_PROJECT_ID")

col = ee.ImageCollection(
    "projects/gcp-public-data-weathernext/assets/weathernext_3_0_0_0p1deg"
)
run = col.filter(ee.Filter.eq("start_time", "2026-05-01T00:00:00Z"))
```

Bands follow `<variable>_<statistic>`, e.g. `temperature_2m_mean`, `temperature_2m_p50`, `u_component_of_wind_10m_mean`.

**Older generations**, still published for benchmarking:

| Model | Released | Grid | Members | Earth Engine asset |
|---|---|---|---|---|
| WeatherNext 3 | Aug 2026 | 0.05° / 0.1° / 0.25° | 64 | `…/weathernext_3_0_0_0p1deg`, `…_0p05deg` |
| WeatherNext 2 | Jun 2025 | 0.25° | 64 | `…/weathernext_2_0_0` |
| WeatherNext Graph | Nov 2023 | 0.25° | deterministic | `…/59572747_4_0` — **deprecated 15 July 2026** |

Don't start anything new on WeatherNext Graph.

### Door 2 — custom inference

Google Cloud offers on-demand inference on dedicated accelerators, letting you set ensemble size and forecast horizon yourself. This is an enterprise sales motion, not a self-serve API — assume a contract conversation and enterprise pricing.

### Door 3 — Maps Platform Weather API

The pragmatic option, and the one most projects actually want. Straight JSON over HTTPS, no allowlist, live now.

```
https://weather.googleapis.com/v1/currentConditions:lookup
https://weather.googleapis.com/v1/forecast/hours:lookup      # up to 240 h
https://weather.googleapis.com/v1/forecast/days:lookup       # up to 10 days
https://weather.googleapis.com/v1/history/hours:lookup       # last 24 h
```

```bash
curl -X GET "https://weather.googleapis.com/v1/currentConditions:lookup\
?key=YOUR_API_KEY&location.latitude=48.1351&location.longitude=11.5820"
```

Add `unitsSystem=IMPERIAL` if you must; the default is metric.

**Requirements:** a GCP project, the Weather API enabled, **billing enabled** (mandatory — there is no keyless free tier), and an API key or OAuth token on every request. Restrict the key by referrer or IP; it travels in the query string.

**The important caveat:** this is not WeatherNext output. Google describes the Weather API as official-source data blended with proprietary AI prediction, refreshed every 15–30 minutes — WeatherNext 3 upgrades what feeds it, but you get a post-processed forecast, not raw model fields. No ensemble members, no percentiles, no gridded arrays. If you need spread, tail risk, or your own downstream model, this door is the wrong one.

### Licensing

Two regimes, split by age:

- **Real-time data** — GDM Real-Time Weather Forecasting Experimental Data Terms of Use. Read them before shipping anything commercial; "experimental" is doing work in that name.
- **Historical data (older than one hour)** — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution required, otherwise permissive.

Questions and bug reports go to `weathernext@google.com`.

---

## DWD (Deutscher Wetterdienst)

Since the 2017 amendment to the DWD-Gesetz, the DWD has a statutory mandate to publish its weather and climate data largely free of charge. In practice that means **no registration, no API key, no rate limit, no terms click-through** — just an HTTPS file server at <https://opendata.dwd.de>.

It is also not a REST API in any modern sense. It is directory listings of KMZ, GRIB2, CAP-XML and CSV. You do the parsing. Plan for that up front: the effort is in the formats, not the access.

The DWD warns explicitly that **service and availability levels are not guaranteed** for Open Data. For anything that must not go dark, they point you at their commercial geodata service.

### MOSMIX — station point forecasts (start here)

MOSMIX statistically post-processes ICON (DWD) and IFS (ECMWF) into point forecasts for roughly 5,400 stations worldwide, mostly Germany and Europe, out to ten days. It includes probabilistic elements such as gust and precipitation-threshold probabilities. For "what will the weather be at this town", it is the single best free product in Germany — and it beats raw gridded model output because the bias correction is already done.

Two flavours, and the size difference matters:

**MOSMIX_S** — all stations in one file, updated hourly, +240 h:

```
https://opendata.dwd.de/weather/local_forecasts/mos/MOSMIX_S/all_stations/kml/
  MOSMIX_S_LATEST_240.kmz
  MOSMIX_S_2026090711_240.kmz     # MOSMIX_S_<YYYYMMDDHH>_240.kmz
```

That file is **~35 MB compressed** and expands to a much larger KML. Pulling it hourly to read three stations is wasteful — use MOSMIX_L instead.

**MOSMIX_L** — one file per station, updated every 6 hours (03/09/15/21 UTC), richer parameter set:

```
https://opendata.dwd.de/weather/local_forecasts/mos/MOSMIX_L/single_stations/<STATION_ID>/kml/
  MOSMIX_L_LATEST_10865.kmz       # Munich, ~17 KB
  MOSMIX_L_2026090709_10865.kmz
```

17 KB per station per fetch. Station IDs are WMO-style five-digit codes (`10865` = München-Stadt). The catalogue is a fixed-width text file, ~300 KB:

<https://www.dwd.de/DE/leistungen/met_verfahren_mosmix/mosmix_stationskatalog.cfg?view=nasPublication&nn=495490>

Format notes: the payload is KML with a DWD-specific namespace — forecast values arrive as whitespace-separated series inside `<dwd:Forecast>` elements, aligned to a shared `<dwd:TimeStep>` list, with `-` for missing values. The element dictionary and namespace docs live under <https://opendata.dwd.de/weather/lib/> and <https://www.dwd.de/opendatahelp>. A KMZ is a ZIP; unzip, then parse the single KML inside.

### ICON — raw NWP model output (GRIB2)

```
https://opendata.dwd.de/weather/nwp/
  icon/          # global, 13 km, runs 00/06/12/18 UTC
  icon-eu/       # Europe nest, ~7 km
  icon-d2/       # Germany/Alps, ~2 km, runs every 3 h (00,03,…,21)
  icon-eps/      # global ensemble
  icon-eu-eps/   # European ensemble
  icon-d2-eps/   # convection-permitting ensemble
```

Files are one variable per one lead time, bzip2-compressed GRIB2:

```
https://opendata.dwd.de/weather/nwp/icon-d2/grib/00/t_2m/
  icon-d2_germany_icosahedral_single-level_2026090700_000_2d_t_2m.grib2.bz2
  icon-d2_germany_icosahedral_single-level_2026090700_001_2d_t_2m.grib2.bz2
```

Two things bite here. First, native ICON output is on a **triangular icosahedral grid**, not lat/lon — you need DWD's published regridding weights (or their `icon_tools`) to get a regular grid. Second, one file per variable per hour means a full ICON-D2 run is thousands of files; fetch only what you need.

DWD publishes tooling on GitHub under [`DeutscherWetterdienst`](https://github.com/DeutscherWetterdienst): a Python downloader, the regridding tools, and a Docker image bundling Python, ecCodes and the DWD GRIB tables. Use ecCodes or `cfgrib`/`xarray` to read the GRIB2. For incremental syncing, each subtree ships a `content.log(.bz2)` listing files with timestamps — poll that instead of scraping directory HTML.

### Warnings

Machine-readable CAP 1.2 XML, zipped, sliced several ways (by district, by commune union, by cell, `DIFF` for incremental and `STAT` for full status):

```
https://opendata.dwd.de/weather/alerts/cap/
  DISTRICT_CELLS_STAT/  DISTRICT_DWD_STAT/  DISTRICT_EVENT_STAT/
  COMMUNEUNION_*_STAT/  …_DIFF/
    Z_CAP_C_EDZW_LATEST_PVW_STATUS_PREMIUMDWD_COMMUNEUNION_DE.zip
    …_EN.zip  …_ES.zip  …_FR.zip  …_MUL.zip
```

There is also the endpoint the DWD WarnWetter app uses, which is far easier if you only need a banner:

```
https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json
```

It returns **JSONP**, not JSON — the body is `warnWetter.loadWarnings({...});`, so strip the wrapper before parsing. It is undocumented and unversioned; treat it as convenience, not contract.

### Observations and climate archive (CDC)

```
https://opendata.dwd.de/climate_environment/CDC/observations_germany/climate/
  1_minute/  5_minutes/  10_minutes/  hourly/  subdaily/  daily/  monthly/  annual/  multi_annual/
```

Each resolution splits into `recent/` (roughly the last 500 days) and `historical/` (back to the 19th century for some stations), as per-station zipped semicolon-CSV plus station description files. Missing values are `-999`. This is the archive to use for verification, model training, or "how unusual was this?" questions.

### Maps: WMS / WFS

For rendered layers — radar composites, warning polygons, model fields — the GeoServer speaks OGC:

```
https://maps.dwd.de/geoserver/ows?service=WMS&request=GetCapabilities&version=1.3.0
```

Drop-in for Leaflet or QGIS, no key.

### Licence and attribution

DWD Open Data falls under the *Verordnung über die Nutzung von Geodaten und Geodatendiensten* (GeoNutzV): free use including commercial and derivative works, **provided you attribute the source**. The conventional form is:

> Quelle: Deutscher Wetterdienst

with a modification note if you changed the data. Contact: `opendata@dwd.de`. Changes to the directory layout are announced in the server's news section before they land — worth watching if you hard-code paths, and you will hard-code paths.

### Wrappers, if you'd rather not parse KMZ and GRIB2

| Tool | What it gives you | Trade-off |
|---|---|---|
| [Bright Sky](https://brightsky.dev) | DWD observations and MOSMIX as clean JSON, free, no key | Germany-centric, third-party uptime |
| [Open-Meteo](https://open-meteo.com/en/docs/dwd-api) | ICON D2/EU/Global as JSON, free for non-commercial, no key | interpolated beyond 78 h; not DWD-official |
| [`wetterdienst`](https://wetterdienst.readthedocs.io) (Python) | MOSMIX-S/L, ICON DMO points, CDC observations, RADOLAN radar | a library, so you still own the runtime |

Verified live: `https://api.brightsky.dev/current_weather?lat=48.13&lon=11.58` returns current conditions for Munich with no credentials at all. For a prototype, that is a two-minute path to real data.

---

## Choosing

**Prototype, Germany, this afternoon.** Bright Sky or MOSMIX_L single-station KMZ. No account, no key, ~17 KB per fetch.

**Production forecast for German locations.** MOSMIX_L parsed directly from opendata.dwd.de, plus CAP warnings. Attribute DWD, cache aggressively, and remember there is no SLA.

**Global coverage, minimal engineering.** Maps Platform Weather API. Enable billing, restrict the key, accept that you get a post-processed forecast rather than model fields.

**Ensembles, probabilistic reasoning, or your own downstream model.** WeatherNext 3 via BigQuery for statistics, via GCS Zarr for the full 64 members. Submit the form first — the week of latency is the long pole, so start it before you need it.

**Both.** They complement rather than compete: DWD gives you high-resolution, bias-corrected, free German detail with a real observation archive; WeatherNext 3 gives you a global AI ensemble with calibrated spread. Verifying one against the other over the same stations would be a decent experiment in its own right.

---

## Verification log

Checked on 7 September 2026 from this machine. Live HTTP probes:

- `opendata.dwd.de/weather/local_forecasts/mos/` → `MOSMIX_L/`, `MOSMIX_S/`, `MOSMIX-SNOW_S/`
- `MOSMIX_S_LATEST_240.kmz` → HTTP 200, `content-length: 36,559,664`, `last-modified: Mon, 07 Sep 2026 11:39:34 GMT`
- `MOSMIX_L_LATEST_10865.kmz` → HTTP 200, `content-length: 17,195`
- `opendata.dwd.de/weather/nwp/` → `icon/`, `icon-eu/`, `icon-d2/`, and the three `-eps` variants; `icon/grib/` has 00/06/12/18, `icon-d2/grib/` has 00/03/…/21
- `icon-d2/grib/00/t_2m/` → the `icon-d2_germany_icosahedral_single-level_…grib2.bz2` naming shown above
- `alerts/cap/COMMUNEUNION_DWD_STAT/` → the `Z_CAP_C_EDZW_LATEST_…_{DE,EN,ES,FR,MUL}.zip` set
- `CDC/observations_germany/climate/` → the nine resolution subtrees listed
- `warnings.json` → HTTP 200, body `warnWetter.loadWarnings({...});` (JSONP confirmed; no active warnings at the time)
- MOSMIX station catalogue `.cfg` → HTTP 200, 299,502 bytes
- `maps.dwd.de/geoserver/ows?…GetCapabilities` → HTTP 200
- `api.brightsky.dev/current_weather?lat=48.13&lon=11.58` → HTTP 200, full JSON payload

Documentation read: `developers.google.com/weathernext` and its `guides/{access-forecast,models,bigquery,earth-engine}` pages, the Maps Platform Weather API overview and current-conditions reference, and `dwd.de/EN/ourservices/opendata/opendata.html`.

**Not verified** — no allowlist approval on this machine, so the WeatherNext GCS buckets, the Analytics Hub subscription flow and the Earth Engine assets are documented from Google's own pages, not from a successful request. Confirm the identifiers after your access is granted. Maps Platform per-SKU prices were not readable from the usage-and-billing page; check the Maps Platform pricing list directly.
