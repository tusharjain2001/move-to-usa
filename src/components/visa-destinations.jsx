import React, { useState } from "react";
import { SectionHeader, Placeholder } from "./chrome.jsx";
import sanFranciscoPhoto from "../assets/sanfrancisco.jpeg";

// Visa option comparison cards (filterable) + Popular USA destinations (clickable cards with details).

const VISAS = [
  {
    code: "H-1B",
    name: "Specialty Occupation",
    category: "Work",
    durationMonths: 36,
    cap: "Annual lottery · 85,000",
    leadTime: "8–14 months",
    cost: "$3,500–$8,000",
    family: "H-4 dependents",
    greenCardPath: "Yes",
    summary: "The most common work visa for APAC tech, finance, and engineering hires. Employer-sponsored.",
    requires: ["Bachelor's degree", "Employer sponsor", "LCA filed"],
  },
  {
    code: "L-1A/B",
    name: "Intra-Company Transfer",
    category: "Work",
    durationMonths: 36,
    cap: "No cap",
    leadTime: "2–6 months",
    cost: "$2,500–$6,500",
    family: "L-2 + work permit",
    greenCardPath: "Yes (L-1A fast)",
    summary: "For executives, managers, and specialized employees transferring within an APAC-US company.",
    requires: ["1 year overseas", "Qualifying entity", "Specialized role"],
  },
  {
    code: "O-1",
    name: "Extraordinary Ability",
    category: "Work",
    durationMonths: 36,
    cap: "No cap",
    leadTime: "1–4 months",
    cost: "$5,000–$12,000",
    family: "O-3 dependents",
    greenCardPath: "Yes (EB-1)",
    summary: "For founders, researchers, and creatives with national or international recognition.",
    requires: ["3 of 8 criteria", "Sustained acclaim", "US engagement"],
  },
  {
    code: "EB-5",
    name: "Investor Green Card",
    category: "Investment",
    durationMonths: 999,
    cap: "Per-country quota",
    leadTime: "24–48 months",
    cost: "$800K–$1.05M + fees",
    family: "Spouse + under-21",
    greenCardPath: "Direct",
    summary: "Permanent residence via qualifying investment in a US business creating 10 jobs.",
    requires: ["$800K investment", "Lawful source", "Job creation"],
  },
  {
    code: "E-2",
    name: "Treaty Investor",
    category: "Investment",
    durationMonths: 60,
    cap: "No cap · treaty",
    leadTime: "3–6 months",
    cost: "$5,000–$15,000",
    family: "E-2 dependents + work",
    greenCardPath: "No (renewable)",
    summary: "For Singapore, Japan, Korea, Australia nationals investing in a US enterprise.",
    requires: ["Treaty country", "Substantial investment", "Active business"],
  },
  {
    code: "F-1",
    name: "Student Visa",
    category: "Study",
    durationMonths: 48,
    cap: "No cap",
    leadTime: "1–3 months",
    cost: "$510 + SEVIS",
    family: "F-2 dependents",
    greenCardPath: "Via OPT → H-1B",
    summary: "Full-time study at an accredited US institution. Includes 12–36 months of post-study work (OPT).",
    requires: ["I-20 from school", "Financial proof", "Ties to home"],
  },
  {
    code: "EB-1A",
    name: "Extraordinary Ability GC",
    category: "Family",
    durationMonths: 999,
    cap: "Per-country",
    leadTime: "12–24 months",
    cost: "$8,000–$18,000",
    family: "Spouse + under-21",
    greenCardPath: "Direct",
    summary: "Self-petition green card for top APAC researchers, executives, and athletes.",
    requires: ["Self-petition OK", "Extraordinary ability", "US plan of work"],
  },
  {
    code: "IR/CR-1",
    name: "Spouse of US Citizen",
    category: "Family",
    durationMonths: 999,
    cap: "Unlimited (citizen)",
    leadTime: "10–14 months",
    cost: "$1,500–$4,000",
    family: "Direct path",
    greenCardPath: "Direct",
    summary: "Permanent residence for spouses of US citizens — fastest family-based route.",
    requires: ["Bona fide marriage", "I-130 + DS-260", "Affidavit of support"],
  },
];

const VISA_CATS = ["All", "Work", "Investment", "Study", "Family"];

function Visa() {
  const [cat, setCat] = useState("All");
  const list = VISAS.filter((v) => cat === "All" || v.category === cat);
  return (
    <section className="band cream" id="visa">
      <div className="wrap">
        <div className="services-hd">
          <div>
            <div className="eyebrow">VISA · OPTIONS · 06</div>
            <h2 className="h1 mt-16">
              Pick a path.<br />
              <span className="serif">We'll meet you at the embassy.</span>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: 42 + "ch" }}>
            Visa choice shapes everything — your customs forms, your tax residency, your kids'
            school enrollment. Our immigration partners hold a 96.3% first-attempt approval
            rate for APAC applicants since 2019.
          </p>
        </div>

        <div className="visa-filters mt-32">
          {VISA_CATS.map((c) => (
            <button
              key={c}
              className={"visa-filter" + (cat === c ? " on" : "")}
              onClick={() => setCat(c)}
            >
              {c}
              <span className="mono">
                {c === "All" ? VISAS.length : VISAS.filter((v) => v.category === c).length}
              </span>
            </button>
          ))}
        </div>

        <div className="visa-grid mt-32">
          {list.map((v) => (
            <article key={v.code} className="visa-card">
              <div className="between visa-card-hd">
                <div className="visa-code mono">{v.code}</div>
                <span className={"visa-tag tag-" + v.category.toLowerCase()}>{v.category}</span>
              </div>
              <h3 className="h3 mt-16">{v.name}</h3>
              <p className="muted mt-8" style={{ fontSize: 14 }}>{v.summary}</p>

              <dl className="visa-specs mt-24">
                <div><dt>Lead time</dt><dd className="mono">{v.leadTime}</dd></div>
                {/* USCIS fees are charged in USD — labelled so they don't read
                    as SGD alongside the SGD move prices elsewhere on the site. */}
                <div><dt>Government cost · USD</dt><dd className="mono">{v.cost}</dd></div>
                <div><dt>Cap</dt><dd className="mono" style={{ fontSize: 12 }}>{v.cap}</dd></div>
                <div><dt>Green card path</dt><dd className="mono">{v.greenCardPath}</dd></div>
              </dl>

              <div className="visa-reqs">
                <div className="text-mono-sm mb-8">REQUIREMENTS</div>
                <ul>
                  {v.requires.map((r) => <li key={r}><span className="mono">·</span> {r}</li>)}
                </ul>
              </div>

              <a className="visa-link mt-24" href="#contact">
                Talk to an immigration partner <span className="arr">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Destinations ──────────────────────────────────────────────────────────────

const DEST = [
  {
    city: "San Francisco",
    state: "California",
    code: "SFO",
    photo: sanFranciscoPhoto,
    coord: { x: 6, y: 48 },
    transit: "26–34 days",
    air: "6–9 days",
    avgCost: "SGD 8,400",
    population: "7.7M metro",
    climate: "Mild · 50–70°F",
    apac: "37% APAC heritage",
    why: "Bay Area tech corridor. Largest APAC professional community in the US.",
    neighborhoods: ["Mission Bay", "Sunset", "Palo Alto", "Mountain View"],
    accent: "var(--accent)",
  },
  {
    city: "Seattle",
    state: "Washington",
    code: "SEA",
    coord: { x: 10, y: 18 },
    transit: "24–32 days",
    air: "5–8 days",
    avgCost: "SGD 7,900",
    population: "4.0M metro",
    climate: "Cool · 45–70°F",
    apac: "20% APAC heritage",
    why: "Amazon, Microsoft, Boeing. Direct 12hr Singapore Airlines flight.",
    neighborhoods: ["Bellevue", "Capitol Hill", "Redmond", "Queen Anne"],
    accent: "var(--sage)",
  },
  {
    city: "Los Angeles",
    state: "California",
    code: "LAX",
    coord: { x: 9, y: 58 },
    transit: "26–34 days",
    air: "6–9 days",
    avgCost: "SGD 8,200",
    population: "13M metro",
    climate: "Warm · 60–85°F",
    apac: "16% APAC heritage",
    why: "Entertainment, biotech, creator economy. Largest APAC diaspora in the US.",
    neighborhoods: ["Pasadena", "Irvine", "Culver City", "Westwood"],
    accent: "var(--gold)",
  },
  {
    city: "Austin",
    state: "Texas",
    code: "AUS",
    coord: { x: 47, y: 75 },
    transit: "38–50 days",
    air: "8–11 days",
    avgCost: "SGD 8,700",
    population: "2.4M metro",
    climate: "Hot · 50–95°F",
    apac: "8% APAC heritage",
    why: "Texas tech triangle. No state income tax. Tesla, Oracle, Apple campuses.",
    neighborhoods: ["West Lake Hills", "Round Rock", "Mueller", "Cedar Park"],
    accent: "var(--accent)",
  },
  {
    city: "Boston",
    state: "Massachusetts",
    code: "BOS",
    coord: { x: 86, y: 24 },
    transit: "36–47 days",
    air: "8–11 days",
    avgCost: "SGD 8,900",
    population: "4.9M metro",
    climate: "Variable · 30–80°F",
    apac: "11% APAC heritage",
    why: "MIT, Harvard, biotech corridor. Strongest US healthcare cluster.",
    neighborhoods: ["Cambridge", "Brookline", "Newton", "Lexington"],
    accent: "var(--sage)",
  },
  {
    city: "New York",
    state: "New York",
    code: "JFK",
    coord: { x: 84, y: 30 },
    transit: "34–45 days",
    air: "7–10 days",
    avgCost: "SGD 8,600",
    population: "20.1M metro",
    climate: "Variable · 28–85°F",
    apac: "14% APAC heritage",
    why: "Global finance, fashion, media. Densest APAC professional network east of SF.",
    neighborhoods: ["Jersey City", "Long Island City", "Flushing", "Edison NJ"],
    accent: "var(--ink)",
  },
];

function Destinations() {
  const [active, setActive] = useState(0);
  const d = DEST[active];
  return (
    <section className="band paper" id="destinations">
      <div className="wrap">
        <SectionHeader
          kicker="POPULAR · DESTINATIONS · 07"
          title="Where APAC families land in 2026."
          lede="The six US metros our Singapore office sees most often, ranked by move volume. Tap a pin or card to compare."
        />

        <div className="dest-shell mt-48">
          <div className="dest-map card">
            <div className="dest-map-hd between">
              <div className="text-mono-sm">UNITED STATES · MOVE VOLUME</div>
              <div className="text-mono-sm">2025 Q4 · Singapore origin</div>
            </div>
            <div className="us-map">
              <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="us-map-svg">
                {/* abstract continental outline */}
                <path
                  d="M4 32 Q 3 22 9 16 Q 14 11 20 12 L 30 9 Q 38 6 46 9 L 56 6 Q 66 4 74 8 L 84 11 Q 92 14 95 22 L 96 32 Q 95 42 90 48 L 84 55 Q 78 63 70 64 L 56 66 Q 46 68 38 65 L 28 64 Q 18 62 12 56 Q 6 50 5 42 Z"
                  fill="var(--cream)"
                  stroke="var(--hair-strong)"
                  strokeWidth="0.3"
                />
                {/* state hairlines */}
                <g stroke="var(--hair)" strokeWidth="0.2" fill="none">
                  <path d="M30 12 L30 64" /><path d="M50 8 L50 67" /><path d="M70 8 L70 65" />
                  <path d="M5 32 L96 32" /><path d="M8 48 L94 48" />
                </g>
                {/* pins */}
                {DEST.map((p, i) => (
                  <g key={p.code} onClick={() => setActive(i)} style={{ cursor: "pointer" }}>
                    <circle
                      cx={p.coord.x} cy={p.coord.y}
                      r={active === i ? 2.2 : 1.4}
                      fill={active === i ? p.accent : "var(--ink)"}
                      stroke="var(--paper)"
                      strokeWidth="0.4"
                    />
                    {active === i && (
                      <circle cx={p.coord.x} cy={p.coord.y} r="4" fill="none"
                        stroke={p.accent} strokeWidth="0.3" opacity="0.6" />
                    )}
                    <text
                      x={p.coord.x + 2.5}
                      y={p.coord.y + 0.8}
                      fontSize="2"
                      fontFamily="var(--font-mono)"
                      fill="var(--ink)"
                      fontWeight={active === i ? 600 : 400}
                    >
                      {p.code}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="dest-map-foot">
              {DEST.map((p, i) => (
                <button
                  key={p.code}
                  className={"dest-tab" + (active === i ? " on" : "")}
                  onClick={() => setActive(i)}
                >
                  <span className="mono">{p.code}</span>
                  <span>{p.city}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dest-detail">
            {/* Only San Francisco has a real photo so far — the other five keep
                the placeholder rather than borrow a picture of another city. */}
            <div className="dest-photo">
              {d.photo ? (
                <>
                  <img
                    src={d.photo}
                    alt={`${d.city}, ${d.state} — popular destination for international moves from Singapore`}
                    loading="lazy"
                  />
                  <span className="dest-photo-corner mono">SIN→{d.code}</span>
                </>
              ) : (
                <Placeholder
                  ratio="wide"
                  corner={`SIN→${d.code}`}
                  label={`Editorial photo · ${d.city} skyline`}
                />
              )}
            </div>
            <div className="dest-detail-body card">
              <div className="between">
                <div>
                  <div className="text-mono-sm">{d.state.toUpperCase()} · {d.code}</div>
                  <h3 className="h2 mt-8" style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    {d.city}
                    <span className="serif muted" style={{ fontSize: 24 }}>{d.population}</span>
                  </h3>
                </div>
                <div className="mono" style={{ textAlign: "right", fontSize: 12, color: "var(--muted)" }}>
                  {String(active + 1).padStart(2, "0")} / {String(DEST.length).padStart(2, "0")}
                </div>
              </div>

              <p className="mt-16" style={{ fontSize: 15, lineHeight: 1.5 }}>{d.why}</p>

              <div className="dest-stats mt-24">
                <div className="numtile">
                  <div className="num" style={{ fontSize: 24 }}>{d.transit}</div>
                  <div className="lbl">Sea transit</div>
                </div>
                <div className="numtile">
                  <div className="num" style={{ fontSize: 24 }}>{d.air}</div>
                  <div className="lbl">Air transit</div>
                </div>
                <div className="numtile">
                  <div className="num" style={{ fontSize: 24 }}>{d.avgCost}</div>
                  <div className="lbl">Avg move cost</div>
                </div>
                <div className="numtile">
                  <div className="num" style={{ fontSize: 24 }}>{d.apac.split(" ")[0]}</div>
                  <div className="lbl">APAC community</div>
                </div>
              </div>

              <div className="mt-24">
                <div className="text-mono-sm mb-8">POPULAR NEIGHBORHOODS</div>
                <div className="dest-tags">
                  {d.neighborhoods.map((n) => (
                    <span key={n} className="chip">{n}</span>
                  ))}
                </div>
              </div>

              <div className="mt-24 between">
                <div className="muted mono" style={{ fontSize: 12 }}>
                  {d.climate}
                </div>
                <a className="btn ghost" href="#calculator">
                  Quote a move to {d.city} <span className="arr">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Visa, Destinations };
