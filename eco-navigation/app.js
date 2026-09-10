(() => {
  const { useState, useMemo } = React;
  const {
    ResponsiveContainer,
    ComposedChart,
    BarChart,
    Area,
    Line,
    Bar,
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
  const ROUTE_KEYS = D.route_order;
  const CMP = D.comparison;
  const C = {
    bg: "#0E1519",
    panel: "#15201F",
    panelHi: "#1B2A2A",
    line: "#26383A",
    ink: "#E7EFEF",
    dim: "#8AA0A1",
    faint: "#5C7172",
    eco: "#38C7A6",
    amber: "#E8B23A",
    good: "#5FB87A",
    bad: "#D9655A",
    elev: "#7FB7E8",
    curve: "#C792EA",
    climb: "#E8825A",
    aero: "#5FB8C8",
    roll: "#8E9AA0",
    accel: "#D6B85A"
  };
  const routeColor = (k) => ROUTES[k].color;
  const routeShort = (k) => ROUTES[k].short;
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
    return /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 0", minWidth: 84 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 10.5,
      color: C.faint,
      textTransform: "uppercase",
      letterSpacing: ".06em"
    } }, label), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 20,
      fontWeight: 700,
      color: color || C.ink,
      lineHeight: 1.2
    } }, value, /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 11.5,
      color: C.dim,
      fontWeight: 500,
      marginLeft: 3
    } }, unit)), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: C.dim } }, sub));
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
  function Pills({ value, onChange, options }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 } }, options.map(([v, lbl, col]) => {
      const on = value === v;
      const accent = col || C.eco;
      return /* @__PURE__ */ React.createElement("button", { key: v, onClick: () => onChange(v), style: {
        cursor: "pointer",
        fontSize: 12.5,
        padding: "6px 12px",
        borderRadius: 20,
        border: `1px solid ${on ? accent : C.line}`,
        background: on ? `${accent}1c` : "transparent",
        color: on ? accent : C.dim
      } }, lbl);
    }));
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
  const TOWNS = [
    ["Deggendorf", 48.8345, 12.958, 1],
    ["Teisnach", 49.0167, 12.9833, 1],
    ["Viechtach", 49.0786, 12.8856, 0],
    ["Bad K\xF6tzting", 49.1786, 12.8556, 0],
    ["Drachselsried", 49.097, 13.006, 0],
    ["Arnbruck", 49.123, 13.018, 0],
    ["Regen", 48.9744, 13.1281, 0],
    ["Bodenmais", 49.0714, 13.1, 0],
    ["Lam", 49.1975, 13.0553, 0],
    ["Engelsh\xFCtt", 49.2067, 13.0319, 1]
  ];
  function RouteMap({ shown }) {
    const W = 760, H = 500, PAD = 40;
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
    const visible = ROUTE_KEYS.filter((k) => shown === "all" || shown === k);
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: {
      width: "100%",
      height: "auto",
      background: "#0c1417",
      borderRadius: 8
    } }, visible.slice().reverse().map((k) => /* @__PURE__ */ React.createElement(
      "path",
      {
        key: k,
        d: poly(k),
        fill: "none",
        stroke: routeColor(k),
        strokeWidth: "3.2",
        strokeOpacity: 0.92,
        strokeLinejoin: "round"
      }
    )), TOWNS.map(([name, lat, lon, big], i) => {
      const [x, y] = px(lat, lon);
      return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: x,
          cy: y,
          r: big ? 5.5 : 3.6,
          fill: big ? C.eco : C.ink,
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
    }), /* @__PURE__ */ React.createElement("g", { transform: `translate(18,${H - 96})`, fontSize: "12" }, /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-8",
        y: "-14",
        width: "228",
        height: ROUTE_KEYS.length * 20 + 12,
        rx: "6",
        fill: "#0c1417",
        stroke: C.line
      }
    ), ROUTE_KEYS.map((k, i) => /* @__PURE__ */ React.createElement("g", { key: k, opacity: visible.includes(k) ? 1 : 0.28 }, /* @__PURE__ */ React.createElement(
      "line",
      {
        x1: "0",
        y1: i * 20,
        x2: "22",
        y2: i * 20,
        stroke: routeColor(k),
        strokeWidth: "3.5"
      }
    ), /* @__PURE__ */ React.createElement("text", { x: "30", y: i * 20 + 4, fill: C.ink }, routeShort(k), " \xB7 ", fmt(ROUTES[k].total_km, 1), " km"))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 8 } }, "Drawn from the real track geometry (equirectangular projection, longitude scaled by cos \u03C6). Routes A and B are CoMaps tracks; routes C and D are OSRM routes over the OpenStreetMap road network. All four share the first 22 km from Deggendorf to Teisnach."));
  }
  function RouteSummary() {
    return /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))",
      gap: 14
    } }, ROUTE_KEYS.map((k) => {
      const r = ROUTES[k], cv = r.curviness, e = r.elev_stats;
      const t = RES[k].auris.time_min;
      return /* @__PURE__ */ React.createElement(Card, { key: k, style: { borderTop: `3px solid ${routeColor(k)}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 700, color: routeColor(k) } }, r.name), /* @__PURE__ */ React.createElement("div", { style: {
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
          label: "Highest point",
          value: fmt(e.max_m),
          unit: "m",
          color: C.elev,
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
          color: C.elev,
          sub: `${e.pct_steep}% at \u22655 %`
        }
      ), /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Curviness",
          value: fmt(cv.deg_per_km),
          unit: "\xB0/km",
          color: C.curve,
          sub: `index ${cv.curviness_index}/100`
        }
      ), /* @__PURE__ */ React.createElement(
        Stat,
        {
          label: "Bends",
          value: fmt(cv.bends_per_km, 1),
          unit: "/km",
          color: C.curve,
          sub: `median R ${cv.median_curve_radius_m} m`
        }
      )), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 11.5,
        color: C.dim,
        marginTop: 12,
        borderTop: `1px solid ${C.line}`,
        paddingTop: 8
      } }, "~", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, fmt(r.stops_est, 1)), " expected stops", r.stops_measured && r.stop_inventory ? ` (OSM inventory: ${r.stop_inventory.traffic_signals || 0} signals \xB7 ${r.stop_inventory.roundabout || 0} roundabouts \xB7 ${r.stop_inventory.level_crossing || 0} level crossings)` : " (modelled)", " \xB7", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, r.elev_samples), " real elevation samples \xB7 ", r.osm_limit_pct, "% of speed limits from OSM"));
    }));
  }
  function WhichRoute() {
    return /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))",
      gap: 14
    } }, ROUTE_KEYS.map((k) => {
      const r = ROUTES[k];
      if (!r.tldr) return null;
      return /* @__PURE__ */ React.createElement(Card, { key: k, style: { borderLeft: `3px solid ${routeColor(k)}` } }, /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 8,
        flexWrap: "wrap"
      } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 14,
        fontWeight: 700,
        color: routeColor(k)
      } }, routeShort(k)), /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 12,
        fontWeight: 700,
        color: C.ink,
        background: C.panelHi,
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        padding: "2px 10px"
      } }, r.tldr.label)), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: C.dim,
        lineHeight: 1.55,
        marginTop: 10
      } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.good } }, "Choose it if"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: C.ink } }, r.tldr.choose_if)), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 12.5,
        color: C.dim,
        lineHeight: 1.55,
        marginTop: 8
      } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.bad } }, "Think twice if"), " ", r.tldr.avoid_if));
    }));
  }
  function Profiles() {
    const [sel, setSel] = useState("all");
    const show = sel === "all" ? ROUTE_KEYS : [sel];
    const datasets = useMemo(() => {
      const o = {};
      ROUTE_KEYS.forEach((k) => {
        const p = ROUTES[k].profile;
        o[k] = p.dist_km.map((d, i) => ({
          d,
          elevation: p.elevation[i],
          grade: p.grade_pct[i],
          curvature: p.curvature[i],
          speed: p.speed_kmh[i],
          legal: p.legal_kmh[i]
        }));
      });
      return o;
    }, []);
    const maxKm = Math.max(...ROUTE_KEYS.map((k) => ROUTES[k].total_km));
    const Chart = ({ title, dataKey, unit, area, refLine, hint }) => /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: C.ink } }, title), hint && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, margin: "2px 0 6px" } }, hint), /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 200 }, /* @__PURE__ */ React.createElement(ComposedChart, { margin: { top: 6, right: 14, bottom: 2, left: -8 } }, /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4" }), /* @__PURE__ */ React.createElement(
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
    ), /* @__PURE__ */ React.createElement(YAxis, { tick: { fill: C.dim, fontSize: 11 }, stroke: C.line, width: 48 }), /* @__PURE__ */ React.createElement(Tooltip, { content: /* @__PURE__ */ React.createElement(ProfileTip, { unit }) }), refLine !== void 0 && /* @__PURE__ */ React.createElement(
      ReferenceLine,
      {
        y: refLine,
        stroke: C.faint,
        strokeDasharray: "4 4"
      }
    ), show.map(
      (k) => (
        /* Filled areas only read well one at a time; with four routes
           overlaid the fills muddy each other, so fall back to lines. */
        area && show.length === 1 ? /* @__PURE__ */ React.createElement(
          Area,
          {
            key: k,
            data: datasets[k],
            type: "monotone",
            dataKey,
            name: routeShort(k),
            stroke: routeColor(k),
            fill: routeColor(k),
            fillOpacity: 0.16,
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
            name: routeShort(k),
            stroke: routeColor(k),
            strokeWidth: 1.7,
            dot: false,
            isAnimationActive: false
          }
        )
      )
    ))));
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      Pills,
      {
        value: sel,
        onChange: setSel,
        options: [
          ["all", "All routes"],
          ...ROUTE_KEYS.map((k) => [k, routeShort(k), routeColor(k)])
        ]
      }
    ), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Elevation profile (m above sea level)",
        hint: "Real EU-DEM 25 m terrain, sampled every 25 m along each track.",
        dataKey: "elevation",
        unit: "m",
        area: true
      }
    ), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Road grade (%)",
        hint: "Slope over a 300 m baseline. Positive is uphill in the direction of travel \u2014 this is the curve that drives the mountain-energy metric below.",
        dataKey: "grade",
        unit: "%",
        refLine: 0
      }
    ), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Curviness (\xB0 of heading change per 100 m)",
        hint: "Measured on a uniform 25 m grid, so the CoMaps and OSRM tracks are directly comparable.",
        dataKey: "curvature",
        unit: "\xB0/100m"
      }
    ), /* @__PURE__ */ React.createElement(
      Chart,
      {
        title: "Modelled driving speed (km/h)",
        hint: "Capped by the real OSM speed limit, by bend radius at 2.2 m/s\xB2 lateral acceleration, and by comfortable acceleration.",
        dataKey: "speed",
        unit: "km/h",
        refLine: 100
      }
    ));
  }
  const WORK_PARTS = [
    ["climb", "Climbing", C.climb],
    ["aero", "Air drag", C.aero],
    ["roll", "Rolling resistance", C.roll],
    ["accel", "Accelerating", C.accel]
  ];
  function EnergySplit({ carId }) {
    const data = ROUTE_KEYS.map((k) => {
      const w = RES[k][carId].work_kWh;
      return { route: routeShort(k), ...w };
    });
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 260 }, /* @__PURE__ */ React.createElement(BarChart, { data, margin: { top: 6, right: 16, bottom: 4, left: -6 } }, /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4", vertical: false }), /* @__PURE__ */ React.createElement(
      XAxis,
      {
        dataKey: "route",
        tick: { fill: C.dim, fontSize: 11 },
        stroke: C.line,
        interval: 0
      }
    ), /* @__PURE__ */ React.createElement(
      YAxis,
      {
        tick: { fill: C.dim, fontSize: 11 },
        stroke: C.line,
        width: 46,
        label: {
          value: "kWh at the wheel",
          angle: -90,
          position: "insideLeft",
          fill: C.faint,
          fontSize: 11,
          offset: 14
        }
      }
    ), /* @__PURE__ */ React.createElement(
      Tooltip,
      {
        contentStyle: {
          background: C.bg,
          border: `1px solid ${C.line}`,
          borderRadius: 8,
          fontSize: 12
        },
        formatter: (v, n) => [`${fmt(v, 2)} kWh`, n]
      }
    ), /* @__PURE__ */ React.createElement(Legend, { wrapperStyle: { fontSize: 12 } }), WORK_PARTS.map(([id, label, col]) => /* @__PURE__ */ React.createElement(Bar, { key: id, dataKey: id, name: label, stackId: "w", fill: col })))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.dim, marginTop: 6 } }, "Propulsion work at the wheel, split by which force it went against \u2014 before drivetrain losses and before any regenerative braking is credited back. ", /* @__PURE__ */ React.createElement("b", { style: { color: C.climb } }, "Climbing"), " is the part the terrain is responsible for."));
  }
  function MountainTax({ carId }) {
    const car = CARS.find((c) => c.id === carId);
    const data = ROUTE_KEYS.map((k) => {
      const m = RES[k][carId].mountain;
      return {
        route: routeShort(k),
        cost: m.cost_eur,
        pct: m.pct_of_trip,
        amount: m.amount,
        unit: m.unit,
        flat: m.flat_per100,
        real: RES[k][carId].per100,
        unit100: RES[k][carId].unit100,
        climb: m.climb_work_kWh,
        recovered: m.descent_recovered_kWh
      };
    });
    const cell = {
      padding: "7px 9px",
      fontSize: 12.5,
      borderBottom: `1px solid ${C.line}`,
      textAlign: "right",
      whiteSpace: "nowrap"
    };
    const head = {
      ...cell,
      color: C.faint,
      fontWeight: 600,
      textTransform: "uppercase",
      fontSize: 10.5,
      letterSpacing: ".04em"
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 6
    } }, "Energy lifted, and how much of it comes back"), /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 250 }, /* @__PURE__ */ React.createElement(
      BarChart,
      {
        data,
        margin: { top: 6, right: 16, bottom: 4, left: -6 },
        barGap: 3
      },
      /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4", vertical: false }),
      /* @__PURE__ */ React.createElement(
        XAxis,
        {
          dataKey: "route",
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line,
          interval: 0
        }
      ),
      /* @__PURE__ */ React.createElement(
        YAxis,
        {
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line,
          width: 46,
          unit: " kWh"
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
          formatter: (v, n, p) => n === "Climb work" ? [`${fmt(v, 1)} kWh lifted \u2014 costs \u20AC${fmt(p.payload.cost, 2)}, ${p.payload.pct}% of the trip`, n] : [`${fmt(v, 1)} kWh recovered`, n]
        }
      ),
      /* @__PURE__ */ React.createElement(Legend, { wrapperStyle: { fontSize: 12 } }),
      /* @__PURE__ */ React.createElement(
        Bar,
        {
          dataKey: "climb",
          name: "Climb work",
          fill: C.climb,
          radius: [3, 3, 0, 0]
        }
      ),
      /* @__PURE__ */ React.createElement(
        Bar,
        {
          dataKey: "recovered",
          name: "Won back on the descents",
          fill: C.good,
          radius: [3, 3, 0, 0]
        }
      )
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.dim, marginTop: 6 } }, "Potential energy the ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, car.name), " has to lift on each route, and how much of it regenerative braking hands back on the way down. What is left over \u2014 plus the drivetrain losses on both \u2014 is the euro figure in the table below. A car without regen wins back", " ", /* @__PURE__ */ React.createElement("i", null, "nothing"), ": every descent is heat in the brake discs.")), /* @__PURE__ */ React.createElement(Card, { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", minWidth: 620 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Route"), /* @__PURE__ */ React.createElement("th", { style: head }, "Real road"), /* @__PURE__ */ React.createElement("th", { style: head }, "Same road, flattened"), /* @__PURE__ */ React.createElement("th", { style: head }, "Mountain cost"), /* @__PURE__ */ React.createElement("th", { style: head }, "Share of trip"), /* @__PURE__ */ React.createElement("th", { style: head }, "Climb work"), /* @__PURE__ */ React.createElement("th", { style: head }, "Won back"))), /* @__PURE__ */ React.createElement("tbody", null, data.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { style: {
      ...cell,
      textAlign: "left",
      fontWeight: 600,
      color: routeColor(ROUTE_KEYS[i])
    } }, r.route), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(r.real, 2), " ", r.unit100.split("/")[0]), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.dim } }, fmt(r.flat, 2), " ", r.unit100.split("/")[0]), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.climb, fontWeight: 700 } }, "\u20AC", fmt(r.cost, 2)), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.climb } }, fmt(r.pct, 1), " %"), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(r.climb, 1), " kWh"), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: r.recovered > 0 ? C.good : C.faint } }, r.recovered > 0 ? `${fmt(r.recovered, 1)} kWh` : "none"))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 10 } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "How this is measured."), " Every trip is simulated twice: once over the real terrain, and once over the identical road with the grade set to zero \u2014 same distance, same bends, same speeds, same stops. The difference is the fuel the mountains cost.", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "Climb work"), " is the raw potential energy gained (m\xB7g\xB7\u0394h) and", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "won back"), " is how much of the descent a car with regenerative braking recovers \u2014 which is why the hybrid and the EV pay a smaller mountain bill than their weight alone would suggest.")));
  }
  const RADIUS_BANDS = [
    ["hairpin", "Hairpin (<45 m)", "#D9655A"],
    ["tight", "Tight (45\u201380 m)", "#E8825A"],
    ["moderate", "Moderate (80\u2013200 m)", "#E8B23A"],
    ["gentle", "Gentle (200\u2013500 m)", "#7FB7E8"],
    ["straight", "Straight (>500 m)", "#5FB87A"]
  ];
  function CurveTax({ carId }) {
    const car = CARS.find((c) => c.id === carId);
    const bandData = ROUTE_KEYS.map((k) => ({
      route: routeShort(k),
      ...ROUTES[k].curviness.pct_distance
    }));
    const cell = {
      padding: "7px 9px",
      fontSize: 12.5,
      borderBottom: `1px solid ${C.line}`,
      textAlign: "right",
      whiteSpace: "nowrap"
    };
    const head = {
      ...cell,
      color: C.faint,
      fontWeight: 600,
      textTransform: "uppercase",
      fontSize: 10.5,
      letterSpacing: ".04em"
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 6
    } }, "How much of each route is actually bendy"), /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 230 }, /* @__PURE__ */ React.createElement(
      BarChart,
      {
        data: bandData,
        layout: "vertical",
        margin: { top: 6, right: 16, bottom: 4, left: 22 }
      },
      /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: C.line, strokeDasharray: "2 4", horizontal: false }),
      /* @__PURE__ */ React.createElement(
        XAxis,
        {
          type: "number",
          domain: [0, 100],
          unit: " %",
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line
        }
      ),
      /* @__PURE__ */ React.createElement(
        YAxis,
        {
          type: "category",
          dataKey: "route",
          width: 110,
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line
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
          formatter: (v, n) => [`${fmt(v, 1)} % of the route`, n]
        }
      ),
      /* @__PURE__ */ React.createElement(Legend, { wrapperStyle: { fontSize: 11.5 } }),
      RADIUS_BANDS.map(([id, label, col]) => /* @__PURE__ */ React.createElement(Bar, { key: id, dataKey: id, name: label, stackId: "r", fill: col }))
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.dim, marginTop: 6 } }, "Share of each route's length by corner radius. The bands are the radii at which a driver genuinely has to slow down \u2014 below 80 m you are down to about 45 km/h at a comfortable 2.2 m/s\xB2 of lateral acceleration.")), /* @__PURE__ */ React.createElement(Card, { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", minWidth: 640 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Route"), /* @__PURE__ */ React.createElement("th", { style: head }, "Curviness"), /* @__PURE__ */ React.createElement("th", { style: head }, "Index"), /* @__PURE__ */ React.createElement("th", { style: head }, "Bends / km"), /* @__PURE__ */ React.createElement("th", { style: head }, "Median R"), /* @__PURE__ */ React.createElement("th", { style: head }, "Tightest"), /* @__PURE__ */ React.createElement("th", { style: head }, "Corner cost"), /* @__PURE__ */ React.createElement("th", { style: head }, "Time lost"))), /* @__PURE__ */ React.createElement("tbody", null, ROUTE_KEYS.map((k) => {
      const cv = ROUTES[k].curviness, cu = RES[k][carId].curves;
      return /* @__PURE__ */ React.createElement("tr", { key: k }, /* @__PURE__ */ React.createElement("td", { style: {
        ...cell,
        textAlign: "left",
        fontWeight: 600,
        color: routeColor(k)
      } }, routeShort(k)), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(cv.deg_per_km, 1), " \xB0/km"), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.curve, fontWeight: 700 } }, fmt(cv.curviness_index, 1)), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(cv.bends_per_km, 1)), /* @__PURE__ */ React.createElement("td", { style: cell }, cv.median_curve_radius_m, " m"), /* @__PURE__ */ React.createElement("td", { style: cell }, cv.min_curve_radius_m, " m"), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.curve, fontWeight: 700 } }, "\u20AC", fmt(cu.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: cell }, "+", fmt(cu.time_min_lost, 0), " min"));
    }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 10 } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "Curviness"), " is total heading change per kilometre, measured on a uniform 25 m grid so the CoMaps and OSRM tracks compare fairly; the ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "index"), " puts that on a 0\u2013100 scale where 300 \xB0/km is a genuinely serpentine mountain road.", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "Corner cost"), " and", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "time lost"), " come from re-running the same trip with the bend-radius speed cap removed, for the", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, car.name), " \u2014 so they are what the corners cost in fuel and minutes, over and above the hills and the distance. Cars with regenerative braking pay far less, because the energy shed entering a bend comes back on the way out.")));
  }
  const STOP_KINDS = [
    ["traffic_signals", "Traffic signals", "#E06060"],
    ["stop", "Stop signs", "#E8825A"],
    ["give_way", "Give-way signs", "#E8B23A"],
    ["level_crossing", "Level crossings", "#7FB7E8"],
    ["roundabout", "Roundabouts (slow-through)", "#C792EA"]
  ];
  function StopTax({ carId }) {
    const car = CARS.find((c) => c.id === carId);
    const data = ROUTE_KEYS.map((k) => ({
      route: routeShort(k),
      ...ROUTES[k].stops_by_kind || {}
    }));
    const cell = {
      padding: "7px 9px",
      fontSize: 12.5,
      borderBottom: `1px solid ${C.line}`,
      textAlign: "right",
      whiteSpace: "nowrap"
    };
    const head = {
      ...cell,
      color: C.faint,
      fontWeight: 600,
      textTransform: "uppercase",
      fontSize: 10.5,
      letterSpacing: ".04em"
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 6
    } }, "Expected stop events per trip, by cause"), /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 230 }, /* @__PURE__ */ React.createElement(
      BarChart,
      {
        data,
        layout: "vertical",
        margin: { top: 6, right: 16, bottom: 4, left: 22 }
      },
      /* @__PURE__ */ React.createElement(
        CartesianGrid,
        {
          stroke: C.line,
          strokeDasharray: "2 4",
          horizontal: false
        }
      ),
      /* @__PURE__ */ React.createElement(
        XAxis,
        {
          type: "number",
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line
        }
      ),
      /* @__PURE__ */ React.createElement(
        YAxis,
        {
          type: "category",
          dataKey: "route",
          width: 110,
          tick: { fill: C.dim, fontSize: 11 },
          stroke: C.line
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
          formatter: (v, n) => [`${fmt(v, 1)} expected events`, n]
        }
      ),
      /* @__PURE__ */ React.createElement(Legend, { wrapperStyle: { fontSize: 11.5 } }),
      STOP_KINDS.map(([id, label, col]) => /* @__PURE__ */ React.createElement(Bar, { key: id, dataKey: id, name: label, stackId: "s", fill: col }))
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.dim, marginTop: 6 } }, "Real OSM inventory \xD7 the probability of the event firing (45 % per signal, 90 % per stop sign, 20 % per give-way, 10 % per level crossing; roundabouts always force a slow-through). Each event is priced from the modelled speed at that exact spot.")), /* @__PURE__ */ React.createElement(Card, { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: {
      borderCollapse: "collapse",
      width: "100%",
      minWidth: 640
    } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Route"), /* @__PURE__ */ React.createElement("th", { style: head }, "Signals"), /* @__PURE__ */ React.createElement("th", { style: head }, "Roundabouts"), /* @__PURE__ */ React.createElement("th", { style: head }, "Level crossings"), /* @__PURE__ */ React.createElement("th", { style: head }, "Expected stops"), /* @__PURE__ */ React.createElement("th", { style: head }, "Stop cost"), /* @__PURE__ */ React.createElement("th", { style: head }, "Time lost"))), /* @__PURE__ */ React.createElement("tbody", null, ROUTE_KEYS.map((k) => {
      const inv = ROUTES[k].stop_inventory || {};
      const st = RES[k][carId].stops;
      return /* @__PURE__ */ React.createElement("tr", { key: k }, /* @__PURE__ */ React.createElement("td", { style: {
        ...cell,
        textAlign: "left",
        fontWeight: 600,
        color: routeColor(k)
      } }, routeShort(k)), /* @__PURE__ */ React.createElement("td", { style: cell }, inv.traffic_signals || 0), /* @__PURE__ */ React.createElement("td", { style: cell }, (inv.roundabout || 0) + (inv.mini_roundabout || 0)), /* @__PURE__ */ React.createElement("td", { style: cell }, inv.level_crossing || 0), /* @__PURE__ */ React.createElement("td", { style: { ...cell, fontWeight: 700, color: C.ink } }, fmt(ROUTES[k].stops_est, 1)), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: "#E06060", fontWeight: 700 } }, "\u20AC", fmt(st.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: cell }, "+", fmt(st.time_min_lost, 1), " min"));
    }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 10 } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, "Stop cost"), " is the third counterfactual: the same trip re-run on a ", /* @__PURE__ */ React.createElement("i", null, "green wave"), " \u2014 every signal green, every barrier open, every roundabout rolled through \u2014 for the", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, car.name), ". The inventory is measured from OpenStreetMap; only the per-class stop probabilities are assumptions. Like the curve tax, stops cost a regen car mostly", " ", /* @__PURE__ */ React.createElement("i", null, "time"), ": the braking energy comes back out of the battery, and the standing time is what remains.")));
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
      const row = { car: c.name.split(" (")[0], id: c.id };
      ROUTE_KEYS.forEach((k) => {
        row[k] = RES[k][c.id][metric];
        row[k + "_u"] = RES[k][c.id].unit100 || m.unit;
      });
      return row;
    });
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      Pills,
      {
        value: metric,
        onChange: setMetric,
        options: METRICS.map((x) => [x.id, x.label])
      }
    ), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 320 }, /* @__PURE__ */ React.createElement(
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
          height: 54
        }
      ),
      /* @__PURE__ */ React.createElement(YAxis, { tick: { fill: C.dim, fontSize: 11 }, stroke: C.line, width: 46 }),
      /* @__PURE__ */ React.createElement(
        Tooltip,
        {
          contentStyle: {
            background: C.bg,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            fontSize: 12
          },
          formatter: (v, n, p) => [`${fmt(v, m.d)} ${m.dyn ? p.payload[n + "_u"] : m.unit}`, routeShort(n)]
        }
      ),
      /* @__PURE__ */ React.createElement(
        Legend,
        {
          formatter: (v) => routeShort(v),
          wrapperStyle: { fontSize: 12 }
        }
      ),
      ROUTE_KEYS.map((k) => /* @__PURE__ */ React.createElement(Bar, { key: k, dataKey: k, fill: routeColor(k), radius: [3, 3, 0, 0] }))
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.dim, marginTop: 6 } }, m.label, m.dyn ? "" : ` (${m.unit})`, " per one-way trip", metric === "cost_eur" && " \u2014 German 2026 prices: petrol 1.79 \u20AC/L, diesel 1.69 \u20AC/L, electricity 0.40 \u20AC/kWh", ".")), /* @__PURE__ */ React.createElement(FullTable, null));
  }
  function FullTable() {
    const cell = { padding: "6px 9px", fontSize: 12.5, borderBottom: `1px solid ${C.line}`, textAlign: "right", whiteSpace: "nowrap" };
    const head = {
      ...cell,
      color: C.faint,
      fontWeight: 600,
      textTransform: "uppercase",
      fontSize: 10.5,
      letterSpacing: ".04em"
    };
    return /* @__PURE__ */ React.createElement(Card, { style: { marginTop: 16, overflowX: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 8
    } }, "All cars \xB7 all routes \xB7 per one-way trip"), /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", minWidth: 820 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Vehicle"), /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Route"), /* @__PURE__ */ React.createElement("th", { style: head }, "per 100 km"), /* @__PURE__ */ React.createElement("th", { style: head }, "Used"), /* @__PURE__ */ React.createElement("th", { style: head }, "Cost"), /* @__PURE__ */ React.createElement("th", { style: head }, "CO\u2082"), /* @__PURE__ */ React.createElement("th", { style: head }, "Time"), /* @__PURE__ */ React.createElement("th", { style: head }, "of which hills"), /* @__PURE__ */ React.createElement("th", { style: head }, "of which bends"), /* @__PURE__ */ React.createElement("th", { style: head }, "of which stops"))), /* @__PURE__ */ React.createElement("tbody", null, CARS.map((c) => ROUTE_KEYS.map((k, i) => {
      const r = RES[k][c.id];
      const best = ROUTE_KEYS.reduce((a, b) => RES[b][c.id].cost_eur < RES[a][c.id].cost_eur ? b : a);
      return /* @__PURE__ */ React.createElement("tr", { key: c.id + k }, i === 0 && /* @__PURE__ */ React.createElement(
        "td",
        {
          style: {
            ...cell,
            textAlign: "left",
            fontWeight: 600,
            color: C.ink,
            verticalAlign: "top"
          },
          rowSpan: ROUTE_KEYS.length
        },
        c.name,
        /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: 10.5,
          color: C.faint,
          fontWeight: 400
        } }, c.type)
      ), /* @__PURE__ */ React.createElement("td", { style: {
        ...cell,
        color: routeColor(k),
        fontWeight: 600,
        textAlign: "left"
      } }, routeShort(k)), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(r.per100, 2), " ", r.unit100.split("/")[0]), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(r.amount, 2), " ", r.unit), /* @__PURE__ */ React.createElement("td", { style: {
        ...cell,
        color: k === best ? C.good : C.ink,
        fontWeight: 700
      } }, "\u20AC", fmt(r.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(r.co2_kg, 1), " kg"), /* @__PURE__ */ React.createElement("td", { style: cell }, fmt(r.time_min, 0), " min"), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.climb } }, "\u20AC", fmt(r.mountain.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.curve } }, "\u20AC", fmt(r.curves.cost_eur, 2)), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: "#E06060" } }, "\u20AC", fmt(r.stops.cost_eur, 2)));
    })))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 8 } }, "Cheapest route per car highlighted in green."));
  }
  function Annual() {
    const [perMonth, setPerMonth] = useState(8);
    const MIN = 0.1, MAX = 10;
    const clamp = (v) => Math.max(MIN, Math.min(MAX, Math.round(v * 10) / 10));
    const step = (d) => setPerMonth((v) => clamp(v + d));
    const trips = Math.round(perMonth * 12);
    const stepBtn = {
      cursor: "pointer",
      width: 30,
      height: 30,
      borderRadius: 8,
      border: `1px solid ${C.line}`,
      background: C.panelHi,
      color: C.eco,
      fontSize: 18,
      fontWeight: 700,
      lineHeight: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto"
    };
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14
    } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.ink, fontSize: 13.5, fontWeight: 600 } }, "One-way trips per month"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => step(-0.1),
        disabled: perMonth <= MIN,
        "aria-label": "decrease by 0.1",
        style: {
          ...stepBtn,
          opacity: perMonth <= MIN ? 0.4 : 1
        }
      },
      "\u2212"
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "range",
        min: MIN,
        max: MAX,
        step: 0.1,
        value: perMonth,
        onChange: (e) => setPerMonth(clamp(+e.target.value)),
        style: { flex: "1 1 140px", accentColor: C.eco }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => step(0.1),
        disabled: perMonth >= MAX,
        "aria-label": "increase by 0.1",
        style: {
          ...stepBtn,
          opacity: perMonth >= MAX ? 0.4 : 1
        }
      },
      "+"
    ), /* @__PURE__ */ React.createElement("span", { style: {
      color: C.eco,
      fontWeight: 700,
      fontSize: 16,
      minWidth: 130,
      textAlign: "right"
    } }, fmt(perMonth, 1), "/month \xB7", " ", fmt(trips), "/yr")), /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
      gap: 10
    } }, CARS.map((c) => {
      const best = ROUTE_KEYS.reduce((a, b) => RES[b][c.id].cost_eur < RES[a][c.id].cost_eur ? b : a);
      const worst = ROUTE_KEYS.reduce((a, b) => RES[b][c.id].cost_eur > RES[a][c.id].cost_eur ? b : a);
      const save = (RES[worst][c.id].cost_eur - RES[best][c.id].cost_eur) * trips;
      const saveCo2 = (RES[worst][c.id].co2_kg - RES[best][c.id].co2_kg) * trips;
      const mtn = RES[best][c.id].mountain.cost_eur * trips;
      return /* @__PURE__ */ React.createElement("div", { key: c.id, style: {
        background: C.panelHi,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: 12,
        borderLeft: `3px solid ${CAR_COLORS[c.id]}`
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: C.ink } }, c.name.split(" (")[0]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.faint, marginBottom: 8 } }, c.type), ROUTE_KEYS.map((k) => /* @__PURE__ */ React.createElement("div", { key: k, style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12.5,
        color: C.dim
      } }, /* @__PURE__ */ React.createElement("span", null, routeShort(k)), /* @__PURE__ */ React.createElement("b", { style: { color: routeColor(k) } }, "\u20AC", fmt(RES[k][c.id].cost_eur * trips)))), /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: `1px solid ${C.line}`,
        fontSize: 12
      } }, /* @__PURE__ */ React.createElement("div", { style: { color: C.good } }, "Best route saves ", /* @__PURE__ */ React.createElement("b", null, "\u20AC", fmt(save)), "/yr"), /* @__PURE__ */ React.createElement("div", { style: { color: C.good } }, "& ", /* @__PURE__ */ React.createElement("b", null, fmt(saveCo2), " kg"), " CO\u2082/yr"), /* @__PURE__ */ React.createElement("div", { style: { color: C.climb, marginTop: 4 } }, "Climbing alone: ", /* @__PURE__ */ React.createElement("b", null, "\u20AC", fmt(mtn)), "/yr")));
    })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.dim, marginTop: 10 } }, "Linear extrapolation of the per-trip model. Round trips \u2248 double these figures. Electricity assumes home charging at 0.40 \u20AC/kWh."));
  }
  function WhatChanged() {
    if (!CMP) return null;
    const cell = { padding: "6px 9px", fontSize: 12.5, borderBottom: `1px solid ${C.line}`, textAlign: "right", whiteSpace: "nowrap" };
    const head = {
      ...cell,
      color: C.faint,
      fontWeight: 600,
      textTransform: "uppercase",
      fontSize: 10.5,
      letterSpacing: ".04em"
    };
    const ROWS = [
      ["peak_m", "Highest point", " m"],
      ["ascent_m", "Total ascent", " m"],
      ["descent_m", "Total descent", " m"],
      ["max_grade_pct", "Steepest grade", " %"],
      ["curviness", "Curviness", " \xB0/km"]
    ];
    const delta = (o, n) => {
      if (!o) return "\u2014";
      const p = 100 * (n - o) / Math.abs(o);
      return `${p > 0 ? "+" : ""}${fmt(p, 0)} %`;
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Card, { style: { overflowX: "auto", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", minWidth: 620 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Route"), /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Metric"), /* @__PURE__ */ React.createElement("th", { style: head }, "Modelled (v1)"), /* @__PURE__ */ React.createElement("th", { style: head }, "Real DEM (now)"), /* @__PURE__ */ React.createElement("th", { style: head }, "Change"))), /* @__PURE__ */ React.createElement("tbody", null, Object.keys(CMP.routes).map(
      (k) => ROWS.map(([id, label, unit], i) => {
        const [o, n] = CMP.routes[k][id];
        return /* @__PURE__ */ React.createElement("tr", { key: k + id }, i === 0 && /* @__PURE__ */ React.createElement(
          "td",
          {
            style: {
              ...cell,
              textAlign: "left",
              fontWeight: 600,
              color: routeColor(k),
              verticalAlign: "top"
            },
            rowSpan: ROWS.length
          },
          routeShort(k)
        ), /* @__PURE__ */ React.createElement("td", { style: { ...cell, textAlign: "left", color: C.dim } }, label), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.faint } }, fmt(o, 1), unit), /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.ink, fontWeight: 600 } }, fmt(n, 1), unit), /* @__PURE__ */ React.createElement("td", { style: {
          ...cell,
          color: n > o ? C.amber : C.dim,
          fontWeight: 600
        } }, delta(o, n)));
      })
    )))), /* @__PURE__ */ React.createElement(Card, { style: { overflowX: "auto", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: C.ink,
      marginBottom: 8
    } }, "What it did to the cost per trip"), /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", width: "100%", minWidth: 560 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...head, textAlign: "left" } }, "Car"), Object.keys(CMP.cars).map((k) => /* @__PURE__ */ React.createElement("th", { key: k, style: head, colSpan: 2 }, routeShort(k))))), /* @__PURE__ */ React.createElement("tbody", null, CARS.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", { style: {
      ...cell,
      textAlign: "left",
      color: C.ink,
      fontWeight: 600
    } }, c.name.split(" (")[0]), Object.keys(CMP.cars).map((k) => {
      const [o, n] = CMP.cars[k][c.id];
      const up = n > o;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: k }, /* @__PURE__ */ React.createElement("td", { style: { ...cell, color: C.faint, borderBottom: `1px solid ${C.line}` } }, "\u20AC", fmt(o, 2), " \u2192"), /* @__PURE__ */ React.createElement("td", { style: {
        ...cell,
        color: up ? C.bad : C.good,
        fontWeight: 700,
        textAlign: "left"
      } }, "\u20AC", fmt(n, 2)));
    })))))), /* @__PURE__ */ React.createElement(Card, { style: { borderLeft: `3px solid ${C.amber}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: C.ink, lineHeight: 1.65 } }, "The first version of this experiment had no network access, so its terrain was ", /* @__PURE__ */ React.createElement("b", null, "16 researched town elevations"), " interpolated along the track. It is now ", /* @__PURE__ */ React.createElement("b", null, fmt(ROUTE_KEYS.reduce((s, k) => s + ROUTES[k].elev_samples, 0)), " real EU-DEM samples"), ", one every 25 m. Three things were badly wrong:", /* @__PURE__ */ React.createElement("ul", { style: { margin: "8px 0 0", paddingLeft: 20 } }, /* @__PURE__ */ React.createElement("li", null, "The modelled profile ", /* @__PURE__ */ React.createElement("b", null, "missed an entire mountain pass"), ". Route A crosses the Eck saddle at ", /* @__PURE__ */ React.createElement("b", null, "843 m"), "; the old model topped out at 709 m and put the summit in the wrong place."), /* @__PURE__ */ React.createElement("li", null, "It understated climbing by more than half \u2014 ", /* @__PURE__ */ React.createElement("b", null, "957 m of real ascent"), " on route A versus 444 m modelled \u2014 because interpolating between town centres smooths away every intermediate hill."), /* @__PURE__ */ React.createElement("li", null, "Its steepest grade anywhere was ", /* @__PURE__ */ React.createElement("b", null, "2.1 %"), ". The real roads reach 9\u201312 %, which is what makes the mountain-energy metric worth having at all.")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, "The effect on cost splits neatly by drivetrain: the", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.good } }, "hybrid and the EV are essentially unchanged"), " (\u22122 to +1 %), because real descents hand energy back through regenerative braking, while the", " ", /* @__PURE__ */ React.createElement("b", { style: { color: C.bad } }, "three cars without regen got dearer"), " ", "(+4 to +16 %) \u2014 they buy every metre of climb with fuel and throw it away again as brake heat. (A small part of the shift also comes from the stop model: the measured OSM inventory found more stop-causing features than the old per-town guess.) The overall verdict did not move: ", /* @__PURE__ */ React.createElement("b", null, "Route A still wins for all five cars.")))));
  }
  function Provenance() {
    const p = D.meta.provenance;
    const items = [
      ["Geometry & distance", p.geometry, "real"],
      ["Curviness", p.curviness, "real"],
      ["Elevation & grade", p.elevation, "real"],
      ["Speed limits", p.speed_limits, "real"],
      ["Village zones", p.village_zones, "rule"],
      ["Stops at lights", p.stops, "model"],
      ["Energy & consumption", p.energy_model, "model"],
      ["Mountain, curve & stop taxes", p.mountain_curve_metrics, "model"],
      ["Prices & CO\u2082", p.prices_co2, "model"]
    ];
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
      gap: 12
    } }, items.map(([k, v, tone], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 12, color: C.dim } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 3 } }, /* @__PURE__ */ React.createElement(Badge, { tone }, tone === "real" ? "measured" : tone === "rule" ? "rule-based" : "modelled"), /* @__PURE__ */ React.createElement("b", { style: { color: C.ink, marginLeft: 6 } }, k)), v))));
  }
  function Verdict() {
    const a = ROUTE_KEYS[0];
    const ranked = ROUTE_KEYS.slice().sort((x, y) => RES[x].auris.cost_eur - RES[y].auris.cost_eur);
    const second = ranked[1];
    const gap = (RES[second].auris.cost_eur - RES[a].auris.cost_eur).toFixed(2);
    const mtnPct = RES[a].auris.mountain.pct_of_trip;
    return /* @__PURE__ */ React.createElement(Card, { style: { borderLeft: `3px solid ${C.eco}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: C.ink, lineHeight: 1.65 } }, /* @__PURE__ */ React.createElement("b", { style: { color: routeColor(a) } }, "Route A (via Arnbruck) still wins"), " ", "\u2014 now on real terrain, real speed limits and against two newly-found alternatives. It is the shortest at ", fmt(ROUTES[a].total_km, 1), " km and the cheapest for all five cars, even though it is the", " ", /* @__PURE__ */ React.createElement("i", null, "hilliest by peak"), ": it crosses the Eck saddle at", " ", ROUTES[a].elev_stats.max_m, " m, about 250 m higher than route B ever goes. Distance beats altitude here.", /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("b", null, "The new third route is real but second-best."), " ", routeShort("bodenmais"), " was found by routing the same origin and destination through every plausible intermediate town and scoring each candidate through the full energy model. At", " ", "\u20AC", RES.bodenmais.auris.cost_eur.toFixed(2), " it beats the existing route B (\u20AC", RES.koetzting.auris.cost_eur.toFixed(2), ") on", " ", /* @__PURE__ */ React.createElement("b", null, "cost for all five cars, and on time, distance and curviness"), " \u2014 though it climbs marginally more in total (1 060 m vs 1 050 m), crosses a far higher summit, and the measured OSM stop inventory puts the two routes level on expected stops (", fmt(ROUTES.bodenmais.stops_est, 1), " vs", " ", fmt(ROUTES.koetzting.stops_est, 1), "). So it is a genuinely better alternative than B, just not better than A, which stays \u20AC", gap, " cheaper.", " ", routeShort("regen"), " is the most distinct corridor of the four and has the fewest expected stops, but its extra climbing makes it the dearest."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement("b", { style: { color: C.climb } }, "The mountains are a sixth of the fuel bill."), " On route A the hybrid spends", " ", "\u20AC", RES[a].auris.mountain.cost_eur.toFixed(2), " of its", " ", "\u20AC", RES[a].auris.cost_eur.toFixed(2), " purely on gaining height \u2014 ", mtnPct, " % of the trip \u2014 and the old diesel pays", " ", "\u20AC", RES[a].merc.mountain.cost_eur.toFixed(2), ". Corners cost far less than hills (\u20AC", RES[a].auris.curves.cost_eur.toFixed(2), " for the hybrid) but they cost ", /* @__PURE__ */ React.createElement("i", null, "time"), ": about", " ", fmt(RES[a].auris.curves.time_min_lost, 0), " minutes on route A. All five cars remain fully capable of every route \u2014 real grades peak around 9\u201312 % on short ramps, which even the 51 kW Panda handles; the difference is efficiency and comfort, not capability.")));
  }
  function App() {
    const [mapSel, setMapSel] = useState("all");
    const [car, setCar] = useState("auris");
    const carPills = CARS.map((c) => [c.id, c.name.split(" (")[0], CAR_COLORS[c.id]]);
    const totalSamples = ROUTE_KEYS.reduce((s, k) => s + ROUTES[k].elev_samples, 0);
    return /* @__PURE__ */ React.createElement("div", { style: {
      maxWidth: 1040,
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
    } }, "\xB7 Deggendorf \u2192 Engelsh\xFCtt")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Badge, { tone: "real" }, "real EU-DEM terrain"), /* @__PURE__ */ React.createElement(Badge, { tone: "real" }, "real OSM speed limits"), /* @__PURE__ */ React.createElement(Badge, { tone: "model" }, "energy modelled"))), /* @__PURE__ */ React.createElement("p", { style: { color: C.dim, fontSize: 13.5, maxWidth: 760, marginTop: 8 } }, "Four ways through the Bavarian Forest compared for distance, hilliness, curviness, speed and \u2014 for five very different cars \u2014 energy use, cost and CO\u2082. Terrain is ", /* @__PURE__ */ React.createElement("b", { style: { color: C.ink } }, fmt(totalSamples), " real elevation samples"), " from the EU-DEM 25 m raster, speed limits come from OpenStreetMap, and two of the four routes were found by searching the road network for a genuinely better alternative."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 } }, [
      ["methodology.html", "\u{1F4D0} Method, algorithm & data sources"],
      ["data/results.csv", "\u2B07 results.csv"],
      ["data/route_metrics.csv", "\u2B07 route_metrics.csv"],
      ["data/eco_data.json", "\u2B07 data (JSON)"],
      ["data/gpx/", "\u2B07 GPX tracks"]
    ].map(([href, label], i) => /* @__PURE__ */ React.createElement("a", { key: i, href, style: {
      fontSize: 12.5,
      textDecoration: "none",
      color: i === 0 ? C.eco : C.dim,
      border: `1px solid ${i === 0 ? C.eco : C.line}`,
      background: i === 0 ? `${C.eco}14` : "transparent",
      borderRadius: 20,
      padding: "5px 12px",
      fontWeight: i === 0 ? 700 : 500
    } }, label))), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Click a route to isolate it on the map." }, "The four routes"), /* @__PURE__ */ React.createElement(
      Pills,
      {
        value: mapSel,
        onChange: setMapSel,
        options: [
          ["all", "All routes"],
          ...ROUTE_KEYS.map((k) => [k, routeShort(k), routeColor(k)])
        ]
      }
    ), /* @__PURE__ */ React.createElement(RouteMap, { shown: mapSel }), /* @__PURE__ */ React.createElement("div", { style: { height: 14 } }), /* @__PURE__ */ React.createElement(RouteSummary, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "The IF for each route \u2014 when it is the right choice, grounded in the measured data." }, "Which route, when?"), /* @__PURE__ */ React.createElement(WhichRoute, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Everything below the speed chart is measured, not assumed." }, "Profiles along the way"), /* @__PURE__ */ React.createElement(Profiles, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Pick a car \u2014 the split and both taxes are drivetrain-specific." }, "Where the energy actually goes"), /* @__PURE__ */ React.createElement(Pills, { value: car, onChange: setCar, options: carPills }), /* @__PURE__ */ React.createElement(EnergySplit, { carId: car }), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "What the climbing costs, after the descents pay back everything they can." }, "The mountain tax \u26F0"), /* @__PURE__ */ React.createElement(MountainTax, { carId: car }), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "How bendy each route is, and what those bends cost in fuel and minutes." }, "The curve tax \u219D"), /* @__PURE__ */ React.createElement(CurveTax, { carId: car }), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Red lights, signs, barriers and roundabouts \u2014 measured from OSM, priced per car." }, "The stop tax \u{1F6A6}"), /* @__PURE__ */ React.createElement(StopTax, { carId: car }), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "Per one-way trip. Switch the metric." }, "Energy, cost & CO\u2082 by car"), /* @__PURE__ */ React.createElement(Energy, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "How the per-trip gap compounds if you drive it regularly." }, "Annual impact"), /* @__PURE__ */ React.createElement(Annual, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "The same two routes, before and after the guessed terrain was replaced with measured terrain." }, "What the real elevation data changed"), /* @__PURE__ */ React.createElement(WhatChanged, null), /* @__PURE__ */ React.createElement(SectionTitle, null, "Verdict"), /* @__PURE__ */ React.createElement(Verdict, null), /* @__PURE__ */ React.createElement(SectionTitle, { hint: "What is measured vs. modelled \u2014 so you can trust each number for what it is." }, "Data provenance"), /* @__PURE__ */ React.createElement(Provenance, null), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 28,
      fontSize: 11.5,
      color: C.faint,
      borderTop: `1px solid ${C.line}`,
      paddingTop: 12
    } }, "Generated ", D.meta.generated, ". Full method, equations & data sources:", " ", /* @__PURE__ */ React.createElement("a", { href: "methodology.html", style: { color: C.eco } }, "methodology.html"), " ", "(source ", /* @__PURE__ */ React.createElement("code", null, "METHODOLOGY.md"), "). Pipeline:", " ", /* @__PURE__ */ React.createElement("code", null, "fetch_routes.py"), " \u2192 ", /* @__PURE__ */ React.createElement("code", null, "fetch_real_data.py"), " \u2192", " ", /* @__PURE__ */ React.createElement("code", null, "screen_routes.py"), " \u2192 ", /* @__PURE__ */ React.createElement("code", null, "build.py"), ". Raw tracks in", " ", /* @__PURE__ */ React.createElement("a", { href: "data/gpx/", style: { color: C.eco } }, "data/gpx/"), "; terrain and OSM caches in ", /* @__PURE__ */ React.createElement("code", null, "data/elevation_*.json"), " and", " ", /* @__PURE__ */ React.createElement("code", null, "data/speedlimits_*.json"), "."));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
