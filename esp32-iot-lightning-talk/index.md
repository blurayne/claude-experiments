# ESP32 as an IoT sensor — Lightning Talk

A 5-minute slide deck on using an **ESP32** as a battery-friendly IoT sensor:
read a BME280, ship the data to **InfluxDB**, and keep the firmware
fresh with **over-the-air** updates so you never have to unscrew the box again.

> The published page at `/esp32-iot-lightning-talk/` is this document. Open the
> slides below.

## Slides

- [`slides.html`](slides.html) — reveal.js deck, runs in any modern browser.
  - <kbd>space</kbd> / <kbd>→</kbd> next slide
  - <kbd>s</kbd> speaker notes
  - <kbd>f</kbd> fullscreen
  - <kbd>?</kbd> all shortcuts

## What's in the talk (≈ 5 min, 11 slides)

1. Arduino UNO vs **ESP32** — why ESP32 wins for IoT (WiFi/BT, dual-core, deep sleep, cheap).
2. Reading a sensor — **BME280** over I²C, ~10 lines of code.
3. Pushing to **InfluxDB** — line protocol explained:
   `measurement,tag=v field=1.0`.
4. The `influxdb-client-arduino` library — `Point` + `writePoint`.
5. End-to-end pipeline diagram — BME280 → ESP32 → InfluxDB → Grafana.
6. **Over-the-air updates** — why you need them once the device is deployed.
7. ESP32 partition layout — `ota_0` / `ota_1` / `otadata`, atomic flip with rollback.
8. `ArduinoOTA` — quick dev-bench pattern, mDNS-discovered.
9. **HTTPS pull + rollback** — the production pattern: signed firmware, cert pinning,
   mark-valid after self-test.
10. tl;dr.

## Mentioned libraries / tools

- [Adafruit BME280](https://github.com/adafruit/Adafruit_BME280_Library) — sensor driver.
- [`influxdb-client-arduino`](https://github.com/tobiasschuerg/InfluxDB-Client-for-Arduino) — InfluxDB v1/v2 client.
- [`ArduinoOTA`](https://docs.espressif.com/projects/arduino-esp32/en/latest/ota_web_update.html) — bundled with arduino-esp32.
- [`HTTPUpdate`](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ota.html) — pull-style OTA.
- Fleet tooling: [ESPHome](https://esphome.io/), [Mender](https://mender.io/), Toit, or a plain CI job that publishes signed `.bin` files to S3.
