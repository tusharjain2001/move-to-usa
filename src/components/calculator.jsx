import React, { useState, useEffect, useRef } from "react";
import { SectionHeader } from "./chrome.jsx";
import { getApacPricing, CURRENCY } from "../api/client.js";

// Live cost & timeline calculator. Prices come from the APAC pricing-with-split
// endpoint (SEA only — that's why the mode list is the two sea options); the
// timeline is still computed locally from the route's transit days.

// `port` is what the backend prices against and can differ from the city — the
// same rate-sheet mapping client.js documents ("Perth ships via Sydney").
// Verified 5 Aug 2026: of the US ports, only Los Angeles and New York carry an
// ocean-freight rate, so the inland/other-coast cities route via the nearer of
// the two. These mappings need the client's sign-off.
const ROUTES = {
  "San Francisco, CA": { code: "SFO", city: "San Francisco", port: "Los Angeles", seaDays: [28, 38] },
  "New York, NY":      { code: "JFK", city: "New York",      port: "New York",    seaDays: [34, 45] },
  "Seattle, WA":       { code: "SEA", city: "Seattle",       port: "Los Angeles", seaDays: [24, 32] },
  "Los Angeles, CA":   { code: "LAX", city: "Los Angeles",   port: "Los Angeles", seaDays: [26, 34] },
  "Boston, MA":        { code: "BOS", city: "Boston",        port: "New York",    seaDays: [36, 47] },
  "Austin, TX":        { code: "AUS", city: "Austin",        port: "Los Angeles", seaDays: [38, 50] },
};

// Shown by the calculator and sticky bar before a destination has been entered.
const FALLBACK_DEST = "San Francisco, CA";

const TO_COUNTRY = "United States";
const CALC_ORIGIN = { code: "SIN", city: "Singapore", port: "Singapore", country: "Singapore" };

// The pricing endpoint is SEA-only, so the calculator offers the two sea modes.
const MODES = [
  { id: "fcl", label: "Sea — Full container", tag: "Best for full home", speedMul: 1.0,
    containerType: "FT_40", shipmentType: "FCL", movingType: "FULL_HOUSEHOLD" },
  { id: "lcl", label: "Sea — Shared (LCL)", tag: "Most affordable", speedMul: 1.08,
    containerType: "FT_20", shipmentType: "CONSOLE", movingType: "PARTIAL_HOUSEHOLD" },
];

function useAnimatedNumber(target, ms = 600) {
  const [v, setV] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(performance.now());
  useEffect(() => {
    fromRef.current = v;
    startRef.current = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - startRef.current) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function GanttTimeline({ phases, totalDays }) {
  return (
    <div className="gantt">
      <div className="gantt-scale mono">
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <span key={p} style={{ left: `${p * 100}%` }}>
            {Math.round(p * totalDays)}d
          </span>
        ))}
      </div>
      <div className="gantt-rows">
        {phases.map((ph, i) => (
          <div key={i} className="gantt-row">
            <div className="gantt-label">
              <span className="mono gantt-num">{String(i + 1).padStart(2, "0")}</span>
              <span>{ph.name}</span>
            </div>
            <div className="gantt-bar-track">
              <div
                className="gantt-bar"
                style={{
                  left: `${(ph.start / totalDays) * 100}%`,
                  width: `${((ph.end - ph.start) / totalDays) * 100}%`,
                  background: ph.color || "var(--ink)",
                }}
              >
                <span className="gantt-bar-lbl mono">{ph.end - ph.start}d</span>
              </div>
            </div>
            <div className="gantt-meta mono">D{ph.start}–D{ph.end}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Calculator({ quoteState, setQuoteState }) {
  const [mode, setMode] = useState("fcl");
  const [volume, setVolume] = useState(35);
  const [insurance, setInsurance] = useState(true);
  const [packing, setPacking] = useState("full");
  const [unpacking, setUnpacking] = useState(true);

  // The quote form starts empty, so fall back to the default route until the
  // customer names a destination.
  const destKey = ROUTES[quoteState.dest] ? quoteState.dest : FALLBACK_DEST;
  const route = ROUTES[destKey];
  const m = MODES.find((x) => x.id === mode);

  // Live pricing from the APAC split endpoint (debounced — the slider fires fast).
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump to retry after an error

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    const t = setTimeout(async () => {
      try {
        const res = await getApacPricing({
          originPort: CALC_ORIGIN.port,
          originCountry: CALC_ORIGIN.country,
          destinationPort: route.port,
          destinationCity: route.city,
          toCountry: TO_COUNTRY,
          volumeM3: volume,
          containerType: m.containerType,
          shipmentType: m.shipmentType,
          movingType: m.movingType,
        });
        if (!alive) return;
        const money = (p) => {
          const n = p && Number(typeof p === "object" ? p.amount : p);
          return Number.isFinite(n) ? n : 0;
        };
        const freightPrice =
          (res.lcl_pricing && res.lcl_pricing.price) || (res.fcl_pricing && res.fcl_pricing.price);
        const freight = money(freightPrice);
        const total = money(res.final_price);
        // A route with no rate in the sheet still returns a total — origin costs
        // plus margin, with the ocean freight silently missing. Refuse it rather
        // than quote a number that's thousands short.
        if (!total || !freight) throw new Error("No live sea rate is published for this route yet — contact us for a manual quote.");
        setPricing({
          currency: (res.final_price && res.final_price.currency) || CURRENCY,
          freight,
          originPack: money(res.origin_total),
          destDelivery: money(res.destination_agent_pricing && res.destination_agent_pricing.price),
          margin: money(res.margin),
          total,
        });
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Could not fetch live pricing. Please try again.");
        setPricing(null);
        setLoading(false);
      }
    }, 450);
    return () => { alive = false; clearTimeout(t); };
  }, [destKey, mode, volume, attempt]);

  const cur = (pricing && pricing.currency) || CURRENCY;
  const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const totalAnim = useAnimatedNumber(pricing ? Math.round(pricing.total) : 0);

  // Timeline build-up (local — the pricing API doesn't return transit times)
  const transitDays = Math.round((route.seaDays[0] + route.seaDays[1]) / 2 * m.speedMul);

  const phases = [
    { name: "Survey & quote", start: 0, end: 3, color: "var(--sage)" },
    { name: "Pack & inventory", start: 3, end: packing === "full" ? 6 : 5, color: "var(--ink)" },
    { name: "Origin customs", start: packing === "full" ? 6 : 5, end: (packing === "full" ? 6 : 5) + 2, color: "var(--muted)" },
    { name: "Sea freight transit",
      start: (packing === "full" ? 6 : 5) + 2,
      end: (packing === "full" ? 6 : 5) + 2 + transitDays,
      color: "var(--accent)" },
    { name: "US customs & clearance",
      start: (packing === "full" ? 6 : 5) + 2 + transitDays,
      end: (packing === "full" ? 6 : 5) + 2 + transitDays + 3, color: "var(--muted)" },
    { name: "Delivery & unpack",
      start: (packing === "full" ? 6 : 5) + 2 + transitDays + 3,
      end: (packing === "full" ? 6 : 5) + 2 + transitDays + 3 + (unpacking ? 2 : 1), color: "var(--ink)" },
  ];
  const totalDays = phases[phases.length - 1].end;

  return (
    <section className="band paper calc-band" id="calculator">
      <div className="wrap">
        <SectionHeader
          kicker="LIVE CALCULATOR · 03"
          title="Real-time shipping cost & timeline."
          lede="Every number is computed from current carrier rates, port congestion, and customs lead times. Adjust the move and watch the estimate move with you."
        />

        <div className="calc-shell mt-48">
          <aside className="calc-controls card">
            <div className="calc-route">
              <div className="route-side">
                <div className="text-mono-sm">ORIGIN</div>
                <div className="route-code mono">SIN</div>
                <div className="muted">Singapore</div>
              </div>
              <div className="route-line">
                <svg viewBox="0 0 120 24" preserveAspectRatio="none" width="100%" height="24">
                  <path d="M2 12 L118 12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
                  <circle cx="2" cy="12" r="2" fill="currentColor" />
                  <path d="M115 8 L120 12 L115 16" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                <div className="mono route-distance">9,720 mi · sea</div>
              </div>
              <div className="route-side">
                <div className="text-mono-sm">DESTINATION</div>
                <div className="route-code mono">{route.code}</div>
                <div className="muted" style={{ fontSize: 13 }}>{destKey.split(",")[0]}</div>
              </div>
            </div>

            <hr className="hr mt-24" />

            <div className="ctrl-grp">
              <div className="ctrl-h">Mode</div>
              <div className="mode-list">
                {MODES.map((x) => (
                  <button
                    key={x.id}
                    className={"mode-btn" + (mode === x.id ? " active" : "")}
                    onClick={() => setMode(x.id)}
                  >
                    <div className="mode-name">{x.label}</div>
                    <div className="mode-tag mono">{x.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="ctrl-grp">
              <div className="between">
                <div className="ctrl-h">Volume</div>
                <div className="mono ctrl-val">{volume} m³</div>
              </div>
              <input className="range" type="range" min="8" max="80" step="1"
                value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              <div className="range-scale mono">
                <span>Studio</span><span>1-bed</span><span>2-bed</span><span>3-bed</span><span>4-bed+</span>
              </div>
            </div>

            <div className="ctrl-grp">
              <div className="ctrl-h">Origin services</div>
              <div className="seg">
                {[
                  { id: "self", lbl: "Self pack" },
                  { id: "fragile", lbl: "Fragile only" },
                  { id: "full", lbl: "Full pack" },
                ].map((o) => (
                  <button key={o.id} className={packing === o.id ? "on" : ""} onClick={() => setPacking(o.id)}>
                    {o.lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="ctrl-grp">
              <div className="checkrow">
                <label>
                  <input type="checkbox" checked={unpacking} onChange={(e) => setUnpacking(e.target.checked)} />
                  <span>Destination unpack &amp; debris removal</span>
                </label>
              </div>
              <div className="checkrow">
                <label>
                  <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} />
                  <span>All-risk transit insurance (2.5%)</span>
                </label>
              </div>
            </div>
          </aside>

          <div className="calc-output">
            <div className="calc-price card">
              <div className="between">
                <div>
                  <div className="text-mono-sm">ALL-IN ESTIMATE · {cur}</div>
                  <div className="price-num mono">
                    {loading ? "…" : error ? "—" : `${cur} ${totalAnim.toLocaleString()}`}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {loading
                      ? "Fetching live carrier rates…"
                      : "Door-to-door · taxes included · valid for 14 days"}
                  </div>
                </div>
                <div className="price-pill">
                  <div className="text-mono-sm">FROM SIN → {route.code}</div>
                  <div className="mono" style={{ fontSize: 28, letterSpacing: "-0.02em", marginTop: 4 }}>
                    {totalDays}<span style={{ color: "var(--muted)", fontSize: 16, marginLeft: 4 }}>days door-to-door</span>
                  </div>
                </div>
              </div>

              <hr className="hr mt-24" />

              {error && !loading && (
                <div style={{ marginTop: 16 }}>
                  <div className="mono" style={{ color: "var(--accent)", fontSize: 13 }}>{error}</div>
                  <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setAttempt((a) => a + 1)}>
                    Retry
                  </button>
                </div>
              )}

              {/* Line items come straight from the API's split and add up to the
                  total; components the rate sheet doesn't return are hidden. */}
              <div className="breakdown" style={loading ? { opacity: 0.45 } : undefined}>
                {[
                  ["International freight", pricing ? pricing.freight : 0],
                  ["Origin pack & loading", pricing ? pricing.originPack : 0],
                  ["Destination delivery", pricing ? pricing.destDelivery : 0],
                  ["Service & handling", pricing ? pricing.margin : 0],
                ].filter(([, v]) => !pricing || v > 0).map(([lbl, v]) => (
                  <div className="bd-row" key={lbl}>
                    <span>{lbl}</span>
                    <span className="mono">{cur} {fmt(v)}</span>
                  </div>
                ))}
              </div>

              <div className="bd-total" style={loading ? { opacity: 0.45 } : undefined}>
                <span>Total</span>
                <span className="mono">{cur} {fmt(pricing ? pricing.total : 0)}</span>
              </div>
            </div>

            <div className="calc-timeline card">
              <div className="between">
                <div className="h3">Timeline</div>
                <div className="mono text-mono-sm">D0 → D{totalDays}</div>
              </div>
              <GanttTimeline phases={phases} totalDays={totalDays} />
              <div className="calc-foot">
                <div className="muted" style={{ fontSize: 13, maxWidth: "52ch" }}>
                  Timeline reflects current ETAs for {route.code} from Singapore. Move managers
                  rebuild your plan every Monday until departure.
                </div>
                <button className="btn primary">
                  Reserve this slot <span className="arr">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Calculator, ROUTES, MODES };
