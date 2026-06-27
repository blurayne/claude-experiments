(() => {
  const { useState, useMemo } = React;
  const {
    ResponsiveContainer,
    ComposedChart,
    AreaChart,
    LineChart,
    BarChart,
    Area,
    Line,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine
  } = Recharts;
  const D = window.ECO_DATA;
  const ROUTES = D.routes;
  const CARS = D.cars;
  const RES = D.results;
  const C = {
    bg: "#0E1519",
    panel: "#15201F",
    panelHi: "#1B2A2A",
    line: "#26383A",
    ink: "#E7EFEF",
    dim: "#8AA0A1",
    faint: "#5C7172",
    A: "#E0A800",
    B: "#E51B23",
    eco: "#38C7A6",
    amber: "#E8B23A",
    good: "#5FB87A",
    bad: "#D9655A",
    elev: "#7FB7E8",
    curve: "#C792EA",
    speed: "#65C7A8"
  };
  const ROUTE_KEYS = ["arnbruck", "koetzting"];
  const routeColor = (k) => k === "arnbruck" ? C.A : C.B;
  const CAR_COLORS = {
    auris: "#5FB87A",
    id3: "#4FA6E0",
    panda: "#E8B23A",
    opel: "#D9655A",
    merc: "#B08CE0"
  };
  const fmt = (n, d = 0) => Number(n).toLocaleString(
    "de-DE",
    { minimumFractionDigits: d, maximumFractionDigits: d }
  );
  function Stat({ label, value, unit, sub, color }) {
    return /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 0", minWidth: 90 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 11,
      color: C.faint,
      textTransform: "uppercase",
      letterSpacing: ".06em"
    } }, label), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 22,
      fontWeight: 700,
      color: color || C.ink,
      lineHeight: 1.2
    } }, value, /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 12,
      color: C.dim,
      fontWeight: 500,
      marginLeft: 3
    } }, unit)), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.dim } }, sub));
  }
  function Card({ children, style }) {
    return /* @__PURE__ */ React.createElement("div", { style: {
      background: C.panel,
      border: `1px solid ${C.line}`,
      borderRadius: 12,
      padding: 16,
      ...style
    } }, children);
  }
  function SectionTitle({ children, hint }) {
    return /* @__PURE__ */ React.createElement("div", { style: { margin: "30px 0 12px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: 18, color: C.ink, fontWeight: 700 } }, children), hint && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.dim, marginTop: 3 } }, hint));
  }
  function Badge({ children, tone }) {
    const col = tone === "real" ? C.good : tone === "model" ? C.amber : C.dim;
    return /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 10.5,
      color: col,
      border: `1px solid ${col}55`,
      background: `${col}14`,
      borderRadius: 20,
      padding: "2px 8px",
      whiteSpace: "nowrap"
    } }, children);
  }
  function ProfileTip({ active, payload, label, unit }) {
    if (!active || !payload || !payload.length) return null;
    return /* @__PURE__ */ React.createElement("div", { style: {
      background: C.bg,
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: "6px 10px",
      fontSize: 12
    } }, /* @__PURE__ */ React.createElement("div", { style: { color: C.dim, marginBottom: 2 } }, "km ", fmt(label, 1)), payload.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { color: p.color || C.ink } }, p.name, ": ", /* @__PURE__ */ React.createElement("b", null, fmt(p.value, 1)), " ", unit)));
  }
  function RouteMap() {
    const towns = [
      ["Deggendorf", 48.8345, 12.958, "start"],
      ["Teisnach", 49.0167, 12.9833, "split"],
      ["Viechtach", 49.0786, 12.8856, "B"],
      ["Bad K\xF6tzting", 49.1786, 12.8556, "B"],
      ["Drachselsried", 49.097, 13.006, "A"],
      ["Arnbruck", 49.123, 13.018, "A"],
      ["Engelsh\xFCtt", 49.2067, 13.0319, "end"]
    ];
    const W = 720, H = 460, PAD = 38;
    const all = [];
    ROUTE_KEYS.forEach((k) => {
      const p = ROUTES[k].profile;
      for (let i = 0; i < p.lat.length; i++) all.push([p.lat[i], p.lon[i]]);
    });
    const lats = all.map((a) => a[0]), lons = all.map((a) => a[1]);
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
    const meanLat = (latMin + latMax) / 2;
    const kx = Math.cos(meanLat * Math.PI / 180);
    const spanLat = latMax - latMin, spanLon = (lonMax - lonMin) * kx;
    const scale = Math.min((W - 2 * PAD) / spanLon, (H - 2 * PAD) / spanLat);
    const px = (lat, lon) => [
      PAD + (lon - lonMin) * kx * scale + (W - 2 * PAD - spanLon * scale) / 2,
      PAD + (latMax - lat) * scale + (H - 2 * PAD - spanLat * scale) / 2
    ];
    const poly = (k) => {
      const p = ROUTES[k].profile;
      let d = "";
      for (let i = 0; i < p.lat.length; i++) {
        const [x, y] = px(p.lat[i], p.lon[i]);
        d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
      }
      return d;
    };
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: {
      width: "100%",
      height: "auto",
      background: "#0c1417",
      borderRadius: 8
    } }, /* @__PURE__ */ React.createElement(
      "path",
      {
        d: poly("koetzting"),
        fill: "none",
        stroke: C.B,
        strokeWidth: "3.2",
        strokeOpacity: "0.9",
        strokeLinejoin: "round"
      }
    ), /* @__PURE__ */ React.createElement(
      "path",
      {
        d: poly("arnbruck"),
        fill: "none",
        stroke: C.A,
        strokeWidth: "3.2",
        strokeOpacity: "0.95",
        strokeLinejoin: "round"
      }
    ), towns.map(([name, lat, lon, kind], i) => {
      const [x, y] = px(lat, lon);
      const big = kind === "start" || kind === "end" || kind === "split";
      const col = kind === "A" ? C.A : kind === "B" ? C.B : kind === "split" ? C.eco : C.ink;
      return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: x,
          cy: y,
          r: big ? 5.5 : 3.6,
          fill: col,
          stroke: "#0c1417",
          strokeWidth: "1.5"
        }
      ), /* @__PURE__ */ React.createElement(
        "text",
        {
          x: x + 8,
          y: y + 4,
          fill: C.ink,
          fontSize: big ? 13 : 11.5,
          fontWeight: big ? 700 : 500,
          style: {
            paintOrder: "stroke",
            stroke: "#0c1417",
            strokeWidth: 3
          }
        },
        name
      ));
    }), /* @__PURE__ */ React.createElement("g", { transform: `translate(${W - 190},${H - 56})`, fontSize: "12" }, /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-10",
        y: "-16",
        width: "190",
        height: "58",
        rx: "6",
        fill: "#0c1417",
        stroke: C.line
      }
    ), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "-2", x2: "22", y2: "-2", stroke: C.A, strokeWidth: "3.5" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: "2", fill: C.ink }, "Route A \xB7 via Arnbruck"), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "20", x2: "22", y2: "20", stroke: C.B, strokeWidth: "3.5" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: "24", fill: C.ink }, "Route B \xB7 Viechtach/K\xF6tzting"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 8 } }, "Drawn from the real GPX track points (equirectangular projection, longitude scaled by cos \u03C6). Both routes share Deggendorf \u2192 Teisnach, then split."));
  }
  function RouteSummary() {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, ROUTE_KEYS.map((k) => {
      const r = ROUTES[k];
      const cv = r.curviness;
      const e = r.elev_stats;
      const t = RES[k].auris.time_min;
      return /* @__PURE__ */ React.createElement(Card, { key: k, style: { borderTop: `3px solid ${routeColor(k)}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: routeColor(k) } }, r.name), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        gap: 10,
        marginTop: 12,
        flexWrap: "wrap"
      } }, /* @__PURE__ */ React.createElement(Stat, { label: "Distance", value: fmt(r.total_km, 1), unit: "km" }), /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Drive time",
          value: fmt(t, 0),
          unit: "min",
          sub: `\xD8 ${fmt(RES[k].auris.avg_kmh, 0)} km/h`
        }
      ), /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Net climb",
          value: `+${fmt(e.net_m)}`,
          unit: "m",
          sub: `${e.start_m}\u2192${e.end_m} m`
        }
      )), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        gap: 10,
        marginTop: 14,
        flexWrap: "wrap"
      } }, /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Total ascent",
          value: fmt(e.ascent_m),
          unit: "m",
          color: C.elev
        }
      ), /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Curviness",
          value: fmt(cv.deg_per_km),
          unit: "\xB0/km",
          color: C.curve,
          sub: `${cv.pct_curvy}% in curves`
        }
      ), /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Tight bends",
          value: cv.sharp_curves,
          unit: "<80 m R",
          sub: `med. R ${cv.median_curve_radius_m} m`
        }
      )), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 11.5,
        color: C.dim,
        marginTop: 12,
        borderTop: `1px solid ${C.line}`,
        paddingTop: 8
      } }, "~", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, r.stops_est), " modelled stops (lights/junctions) \xB7 passes ", r.villages_passed.length, " built-up areas"));
    }));
  }
  function Profiles() {
    const [sel, setSel] = useState("both");
    const show = sel === "both" ? ROUTE_KEYS : [sel];
    const mkData = (k) => {
      const p = ROUTES[k].profile;
      return p.dist_km.map((d, i) => ({
        d,
        elevation: p.elevation[i],
        curvature: p.curvature[i],
        speed: p.speed_kmh[i],
        legal: p.legal_kmh[i]
      }));
    };
    const dataA = useMemo(() => mkData("arnbruck"), []);
    const dataB = useMemo(() => mkData("koetzting"), []);
    const datasets = { arnbruck: dataA, koetzting: dataB };
    const maxKm = Math.max(ROUTES.arnbruck.total_km, ROUTES.koetzting.total_km);
    const Chart = ({ title, dataKey, unit, color, area, refLine }) => /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 6
    } }, title), /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 190 }, /* @__PURE__ */ React.createElement(ComposedChart, { margin: { top: 4, right: 14, bottom: 2, left: -8 } }, /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4" }), /* @__PURE__ */ React.createElement(
      XAxis,
      {
        type: "number",
        dataKey: "d",
        domain: [0, maxKm],
        tick: { fill: C.dim, fontSize: 11 },
        stroke: C.line,
        tickFormatter: (v) => fmt(v, 0),
        unit: " km",
        allowDuplicatedCategory: false
      }
    ), /* @__PURE__ */ React.createElement(
      YAxis,
      {
        tick: { fill: C.dim, fontSize: 11 },
        stroke: C.line,
        width: 48,
        unit: unit === "\xB0/100m" ? "" : ""
      }
    ), /* @__PURE__ */ React.createElement(Tooltip, { content: /* @__PURE__ */ React.createElement(ProfileTip, { unit }) }), refLine && /* @__PURE__ */ React.createElement(
      ReferenceLine,
      {
        y: refLine,
        stroke: C.faint,
        strokeDasharray: "4 4",
        label: {
          value: refLine + "",
          fill: C.faint,
          fontSize: 10,
          position: "insideTopRight"
        }
      }
    ), show.map(
      (k) => area ? /* @__PURE__ */ React.createElement(
        Area,
        {
          key: k,
          data: datasets[k],
          type: "monotone",
          dataKey,
          name: k === "arnbruck" ? "A" : "B",
          stroke: routeColor(k),
          fill: routeColor(k),
          fillOpacity: 0.12,
          strokeWidth: 2,
          dot: false,
          isAnimationActive: false
        }
      ) : /* @__PURE__ */ React.createElement(
        Line,
        {
          key: k,
          data: datasets[k],
          type: "monotone",
          dataKey,
          name: k === "arnbruck" ? "A" : "B",
          stroke: routeColor(k),
          strokeWidth: 1.8,
          dot: false,
          isAnimationActive: false
        }
      )
    ))));
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [
      ["both", "Both routes"],
      ["arnbruck", "A \xB7 Arnbruck"],
      ["koetzting", "B \xB7 Viechtach/K\xF6tzting"]
    ].map(([v, lbl]) => /* @__PURE__ */ React.createElement("button", { key: v, onClick: () => setSel(v), style: {
      cursor: "pointer",
      fontSize: 12.5,
      padding: "6px 12px",
      borderRadius: 20,
      border: `1px solid ${sel === v ? C.eco : C.line}`,
      background: sel === v ? `${C.eco}1c` : "transparent",
      color: sel === v ? C.eco : C.dim
    } }, lbl))), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Elevation profile  (m a.s.l.) \u2014 modelled",
        dataKey: "elevation",
        unit: "m",
        area: true
      }
    ), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Curviness  (\xB0 heading change per 100 m) \u2014 from GPX",
        dataKey: "curvature",
        unit: "\xB0/100m"
      }
    ), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Modelled driving speed  (km/h)",
        dataKey: "speed",
        unit: "km/h",
        refLine: 100
      }
    ));
  }
  const METRICS = [
    { id: "cost_eur", label: "Cost", unit: "\u20AC", d: 2 },
    { id: "per100", label: "Consumption", unit: "/100 km", d: 2, dyn: true },
    { id: "co2_kg", label: "CO\u2082", unit: "kg", d: 1 },
    { id: "time_min", label: "Time", unit: "min", d: 0 }
  ];
  function Energy() {
    const [metric, setMetric] = useState("cost_eur");
    const m = METRICS.find((x) => x.id === metric);
    const data = CARS.map((c) => {
      const a = RES.arnbruck[c.id], b = RES.koetzting[c.id];
      return {
        car: c.name.split(" (")[0],
        id: c.id,
        A: a[metric],
        B: b[metric],
        Aunit: a.unit100 || m.unit,
        Bunit: b.unit100 || m.unit
      };
    });
    const unitFor = (row) => m.dyn ? row.Aunit : m.unit;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      gap: 8,
      marginBottom: 14,
      flexWrap: "wrap"
    } }, METRICS.map((x) => /* @__PURE__ */ React.createElement("button", { key: x.id, onClick: () => setMetric(x.id), style: {
      cursor: "pointer",
      fontSize: 12.5,
      padding: "6px 14px",
      borderRadius: 20,
      border: `1px solid ${metric === x.id ? C.eco : C.line}`,
      background: metric === x.id ? `${C.eco}1c` : "transparent",
      color: metric === x.id ? C.eco : C.dim
    } }, x.label))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 300 }, /* @__PURE__ */ React.createElement(
      BarChart,
      {
        data,
        margin: { top: 6, right: 16, bottom: 4, left: -6 },
        barGap: 2
      },
      /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4", vertical: false }),
      /* @__PURE__ */ React.createElement(
        XAxis,
        {
          dataKey: "car",
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line,
          interval: 0,
          angle: -12,
          textAnchor: "end",
          height: 50
        }
      ),
      /* @__PURE__ */ React.createElement(
        YAxis,
        {
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line,
          width: 46
        }
      ),
      /* @__PURE__ */ React.createElement(
        Tooltip,
        {
          contentStyle: {
            background: C.bg,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            fontSize: 12
          },
          formatter: (v, n, p) => [`${fmt(v, m.d)} ${m.dyn ? n === "A" ? p.payload.Aunit : p.payload.Bunit : m.unit}`, n === "A" ? "Route A" : "Route B"]
        }
      ),
      /* @__PURE__ */ React.createElement(
        Legend,
        {
          formatter: (v) => v === "A" ? "Route A \xB7 Arnbruck" : "Route B \xB7 Viechtach/K\xF6tzting",
          wrapperStyle: { fontSize: 12 }
        }
      ),
      /* @__PURE__ */ React.createElement(Bar, { dataKey: "A", fill: C.A, radius: [3, 3, 0, 0] }),
      /* @__PURE__ */ React.createElement(Bar, { dataKey: "B", fill: C.B, radius: [3, 3, 0, 0] })
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.dim, marginTop: 6 } }, m.label, m.dyn ? "" : ` (${m.unit})`, " per one-way trip", metric === "cost_eur" && " \u2014 German 2026 prices: petrol 1.79 \u20AC/L, diesel 1.69 \u20AC/L, electricity 0.40 \u20AC/kWh", ".")), /* @__PURE__ */ React.createElement(FullTable, null));
  }
  function FullTable() {
    const cell = { padding: "7px 9px", fontSize: 12.5, borderBottom: `1px solid ${C.line}`, textAlign: "right", whiteSpace: "nowrap" };
    const head = {
      ...cell,
      color: C.faint,
      fontWeight: 600,
      textAlign: "right",
      textTransform: "uppercase",
      fontSize: 10.5,
      letterSpacing: ".04em"
    };
    const Row = ({ c }) => {
      const a = RES.arnbruck[c.id], b = RES.koetzting[c.id];
      const save = b.cost_eur - a.cost_eur;
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: {
        ...cell,
        textAlign: "left",
        fontWeight: 600,
        color: C.ink
      }, rowSpan: 2 }, c.name, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 10.5,
        color: C.faint,
        fontWeight: 400
      } }, c.type)), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.A, fontWeight: 600, textAlign: "left" } }, "A \xB7 Arnbruck"), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(a.per100, 2), " ", a.unit100.split("/")[0]), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(a.amount, 2), " ", a.unit), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.ink, fontWeight: 700 } }, "\u20AC", fmt(a.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(a.co2_kg, 1), " kg"), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(a.time_min, 0), " min")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.B, fontWeight: 600, textAlign: "left" } }, "B \xB7 Viechtach/K\xF6tzting"), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(b.per100, 2), " ", b.unit100.split("/")[0]), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(b.amount, 2), " ", b.unit), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.ink, fontWeight: 700 } }, "\u20AC", fmt(b.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(b.co2_kg, 1), " kg"), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(b.time_min, 0), " min")));
    };
    return /* @__PURE__ */ React.createElement(Card, { style: { marginTop: 16, overflowX: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 8
    } }, "All cars \xB7 both routes \xB7 per one-way trip"), /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", minWidth: 620 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Vehicle"), /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Route"), /* @__PURE__ */ React.createElement("th", { style: head }, "per 100 km"), /* @__PURE__ */ React.createElement("th", { style: head }, "Used"), /* @__PURE__ */ React.createElement("th", { style: head }, "Cost"), /* @__PURE__ */ React.createElement("th", { style: head }, "CO\u2082"), /* @__PURE__ */ React.createElement("th", { style: head }, "Time"))), /* @__PURE__ */ React.createElement("tbody", null, CARS.map((c) => /* @__PURE__ */ React.createElement(Row, { key: c.id, c })))));
  }
  function Annual() {
    const [perWeek, setPerWeek] = useState(4);
    const trips = perWeek * 52;
    const rows = CARS.map((c) => {
      const a = RES.arnbruck[c.id], b = RES.koetzting[c.id];
      return {
        c,
        aCost: a.cost_eur * trips,
        bCost: b.cost_eur * trips,
        aCo2: a.co2_kg * trips,
        bCo2: b.co2_kg * trips
      };
    });
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14
    } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.ink, fontSize: 13.5, fontWeight: 600 } }, "One-way trips per week"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "range",
        min: 1,
        max: 14,
        value: perWeek,
        onChange: (e) => setPerWeek(+e.target.value),
        style: { flex: "1 1 160px", accentColor: C.eco }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: {
      color: C.eco,
      fontWeight: 700,
      fontSize: 16,
      minWidth: 110
    } }, perWeek, "/week \xB7 ", fmt(trips), "/yr")), /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))",
      gap: 10
    } }, rows.map(({ c, aCost, bCost, aCo2, bCo2 }) => {
      const dCost = bCost - aCost, dCo2 = bCo2 - aCo2;
      return /* @__PURE__ */ React.createElement("div", { key: c.id, style: {
        background: C.panelHi,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: 12,
        borderLeft: `3px solid ${CAR_COLORS[c.id]}`
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: C.ink } }, c.name.split(" (")[0]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.faint, marginBottom: 8 } }, c.type), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12.5,
        color: C.dim
      } }, /* @__PURE__ */ React.createElement("span", null, "A \xB7 Arnbruck"), /* @__PURE__ */ React.createElement("b", { style: { color: C.A } }, "\u20AC", fmt(aCost))), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12.5,
        color: C.dim
      } }, /* @__PURE__ */ React.createElement("span", null, "B \xB7 V./K\xF6tzting"), /* @__PURE__ */ React.createElement("b", { style: { color: C.B } }, "\u20AC", fmt(bCost))), /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: `1px solid ${C.line}`,
        fontSize: 12
      } }, /* @__PURE__ */ React.createElement("div", { style: { color: C.good } }, "Route A saves ", /* @__PURE__ */ React.createElement("b", null, "\u20AC", fmt(dCost)), "/yr"), /* @__PURE__ */ React.createElement("div", { style: { color: C.good } }, "& ", /* @__PURE__ */ React.createElement("b", null, fmt(dCo2), " kg"), " CO\u2082/yr")));
    })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 10 } }, "Linear extrapolation of the per-trip model. Round trips \u2248 double these figures. Electricity assumes home charging at 0.40 \u20AC/kWh."));
  }
  function Provenance() {
    const p = D.meta.provenance;
    const items = [
      ["Geometry & distance", p.geometry, "real"],
      ["Curviness", p.curviness, "real"],
      ["Village / speed zones", p.village_zones, "rule"],
      ["Speed limits", p.speed_limits, "rule"],
      ["Elevation & grade", p.elevation, "model"],
      ["Energy & consumption", p.energy_model, "model"],
      ["Prices & CO\u2082", p.prices_co2, "model"]
    ];
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
      gap: 10
    } }, items.map(([k, v, tone], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 12, color: C.dim } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 3 } }, /* @__PURE__ */ React.createElement(Badge, { tone }, tone === "real" ? "measured" : tone === "rule" ? "rule-based" : "modelled"), /* @__PURE__ */ React.createElement("b", { style: { color: C.ink, marginLeft: 6 } }, k)), v))));
  }
  function Verdict() {
    const a = RES.arnbruck, b = RES.koetzting;
    const dKm = (ROUTES.koetzting.total_km - ROUTES.arnbruck.total_km).toFixed(1);
    const costSaveAuris = (b.auris.cost_eur - a.auris.cost_eur).toFixed(2);
    return /* @__PURE__ */ React.createElement(Card, { style: { borderLeft: `3px solid ${C.eco}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: C.ink, lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.A } }, "Route A (via Arnbruck) wins on every metric."), " ", "It is ", /* @__PURE__ */ React.createElement("b", null, dKm, " km shorter"), ", climbs less in total (", ROUTES.arnbruck.elev_stats.ascent_m, " m vs ", ROUTES.koetzting.elev_stats.ascent_m, " m), and costs less per trip for all five cars \u2014 e.g. the Auris hybrid spends \u20AC", a.auris.cost_eur.toFixed(2), " vs \u20AC", b.auris.cost_eur.toFixed(2), " ", "(saving \u20AC", costSaveAuris, "). Route B\u2019s only advantage is marginally", " ", /* @__PURE__ */ React.createElement("i", null, "better per-100 km efficiency"), " on its faster, steadier B85 section \u2014 but the extra distance and the deeper drop-and-climb through Bad K\xF6tzting more than cancel it. All five cars are mechanically ", /* @__PURE__ */ React.createElement("b", null, "fully capable"), " ", "of both routes: modelled grades stay gentle (valley roads), so even the 51 kW Panda and the old Opel manage easily \u2014 the difference is efficiency and comfort, not capability. The hybrid and EV benefit most from the curvy, village-dotted terrain thanks to regenerative braking."));
  }
  function App() {
    return /* @__PURE__ */ React.createElement("div", { style: {
      maxWidth: 1e3,
      margin: "0 auto",
      padding: "28px 18px 60px",
      color: C.ink,
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "baseline",
      justifyContent: "space-between"
    } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 26, fontWeight: 800 } }, "Eco-Navigation ", /* @__PURE__ */ React.createElement("span", { style: {
      color: C.dim,
      fontWeight: 500,
      fontSize: 17
    } }, "\xB7 Deggendorf \u2192 Engelsh\xFCtt")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Badge, { tone: "real" }, "geometry from your GPX"), /* @__PURE__ */ React.createElement(Badge, { tone: "model" }, "elevation & energy modelled"))), /* @__PURE__ */ React.createElement("p", { style: { color: C.dim, fontSize: 13.5, maxWidth: 720, marginTop: 8 } }, "Two ways through the Bavarian Forest compared for distance, hilliness, curviness, speed and \u2014 for five very different cars \u2014 energy use, cost and CO\u2082. Geometry and curviness come straight from the two CoMaps GPX tracks; elevation, speed and energy are a transparent physics model (the GPX carried no elevation data, and routing/elevation APIs were unreachable from the build sandbox)."), /* @__PURE__ */ React.createElement(SectionTitle, null, "The two routes"), /* @__PURE__ */ React.createElement(RouteMap, null), /* @__PURE__ */ React.createElement("div", { style: { height: 14 } }), /* @__PURE__ */ React.createElement(RouteSummary, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Toggle routes. Elevation is modelled & smoothed; curviness is measured from the GPX." }, "Profiles along the way"), /* @__PURE__ */ React.createElement(Profiles, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Per one-way trip. Switch the metric." }, "Energy, cost & CO\u2082 by car"), /* @__PURE__ */ React.createElement(Energy, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "How the small per-trip gap compounds if you drive it regularly." }, "Annual impact"), /* @__PURE__ */ React.createElement(Annual, null), /* @__PURE__ */ React.createElement(SectionTitle, null, "Verdict"), /* @__PURE__ */ React.createElement(Verdict, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "What is measured vs. modelled \u2014 so you can trust each number for what it is." }, "Data provenance"), /* @__PURE__ */ React.createElement(Provenance, null), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 28,
      fontSize: 11.5,
      color: C.faint,
      borderTop: `1px solid ${C.line}`,
      paddingTop: 12
    } }, "Generated ", D.meta.generated, ". Model + data: ", /* @__PURE__ */ React.createElement("code", null, "build.py"), " \xB7 raw tracks in ", /* @__PURE__ */ React.createElement("code", null, "data/gpx/"), " \xB7 numbers in", " ", /* @__PURE__ */ React.createElement("code", null, "data/results.csv"), " and ", /* @__PURE__ */ React.createElement("code", null, "data/profile_*.csv"), ". To swap in real elevation, run ", /* @__PURE__ */ React.createElement("code", null, "fetch_real_data.py"), " where an elevation API is reachable, then rebuild."));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
