import React, { useState } from "react";
import { SectionHeader, Placeholder } from "./chrome.jsx";
// Client-supplied city photography (src/assets/country images/).
import sanFranciscoPhoto from "../assets/country images/San Francisco.jpeg";
import seattlePhoto from "../assets/country images/SEATTLE.jpeg";
import losAngelesPhoto from "../assets/country images/LOS ANGELES.jpeg";
import austinPhoto from "../assets/country images/AUSTIN.jpeg";
import bostonPhoto from "../assets/country images/BOSTON.jpeg";
import newYorkPhoto from "../assets/country images/NEW YORK.jpeg";

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
    summary: "Designed for professionals employed in specialized occupations by a US-based employer.",
    requires: ["Bachelor's degree", "Employer sponsor", "LCA filed"],
  },
  {
    code: "L-1",
    name: "Intra-Company Transfer",
    category: "Work",
    durationMonths: 36,
    cap: "No cap",
    leadTime: "2–6 months",
    cost: "$2,500–$6,500",
    family: "L-2 + work permit",
    greenCardPath: "Yes (L-1A fast)",
    summary: "For employees transferring from an overseas office to a US office within the same organization.",
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
    summary: "For individuals with extraordinary ability in business, science, education, athletics, or the arts.",
    requires: ["3 of 8 criteria", "Sustained acclaim", "US engagement"],
  },
  {
    code: "EB-5",
    name: "Investor Visa",
    category: "Investor",
    durationMonths: 999,
    cap: "Per-country quota",
    leadTime: "24–48 months",
    cost: "$800K–$1.05M + fees",
    family: "Spouse + under-21",
    greenCardPath: "Direct",
    summary: "For individuals investing in qualifying US business ventures that create employment opportunities.",
    requires: ["$800K investment", "Lawful source", "Job creation"],
  },
  {
    code: "E-2",
    name: "Treaty Investor",
    category: "Investor",
    durationMonths: 60,
    cap: "No cap · treaty",
    leadTime: "3–6 months",
    cost: "$5,000–$15,000",
    family: "E-2 dependents + work",
    greenCardPath: "No (renewable)",
    summary: "For investors from eligible treaty countries seeking to establish or acquire a business in the United States.",
    requires: ["Treaty country", "Substantial investment", "Active business"],
  },
  {
    code: "F-1",
    name: "Student Visa",
    category: "Student",
    durationMonths: 48,
    cap: "No cap",
    leadTime: "1–3 months",
    cost: "$510 + SEVIS",
    family: "F-2 dependents",
    greenCardPath: "Via OPT → H-1B",
    summary: "For international students pursuing full-time academic programs at accredited US institutions.",
    requires: ["I-20 from school", "Financial proof", "Ties to home"],
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
    summary: "For spouses of US citizens seeking permanent residence.",
    requires: ["Bona fide marriage", "I-130 + DS-260", "Affidavit of support"],
  },
  {
    code: "F1–F4",
    name: "Family-Based Immigration",
    category: "Family",
    durationMonths: 999,
    cap: "226,000/yr · 7% per country",
    leadTime: "2–15+ years",
    cost: "$1,200–$3,500",
    family: "Spouse + under-21",
    greenCardPath: "Direct",
    summary: "For eligible family members sponsored by US citizens or permanent residents.",
    requires: ["Qualifying relative", "I-130 petition", "Affidavit of support"],
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
    summary: "For individuals demonstrating extraordinary achievements in their field.",
    requires: ["Self-petition OK", "Extraordinary ability", "US plan of work"],
  },
];

const VISA_CATS = ["All", "Work", "Investor", "Student", "Family"];

// Closing block — how the visa timeline ties back into the move itself.
const VISA_PLAN = [
  "Relocation planning",
  "Shipping coordination",
  "Customs guidance",
  "Destination support",
  "Dedicated move manager",
];

function Visa() {
  const [cat, setCat] = useState("All");
  const list = VISAS.filter((v) => cat === "All" || v.category === cat);
  return (
    <section className="band cream" id="visa">
      <div className="wrap">
        <div className="services-hd top">
          <div>
            <div className="eyebrow">VISA · OPTIONS · 06</div>
            <h2 className="h1 mt-16">
              Explore your pathway<br />
              <span className="serif">to the USA.</span>
            </h2>
          </div>
          {/* div, not p — the document's intro runs to two paragraphs. */}
          <div className="lede" style={{ maxWidth: 42 + "ch" }}>
            <p>
              Choosing the right visa is an important part of your relocation journey.
              Whether you're moving for employment, education, investment, or family
              reasons, understanding your options can help you plan your move more
              effectively.
            </p>
            <p className="mt-16">
              Our relocation specialists work alongside individuals, families, and
              professionals planning to move to the USA, helping them coordinate their
              relocation timeline with their immigration plans.
            </p>
          </div>
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

        <div className="card mt-48">
          <h3 className="h3">Planning your relocation</h3>
          <p className="muted mt-12" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 70 + "ch" }}>
            Every visa pathway comes with different timelines, documentation requirements,
            and relocation considerations. Our team helps coordinate your international
            moving schedule alongside your relocation plans, helping make your transition
            to the United States as smooth as possible.
          </p>
          <div className="services-footer mt-24">
            {VISA_PLAN.map((p) => (
              <div key={p} className="chip"><span className="mono">✓</span> {p}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Destinations ──────────────────────────────────────────────────────────────

// Order follows the client's content document. Cities without a client-supplied
// photo fall back to the original Placeholder tile until artwork arrives.
const DEST = [
  {
    city: "New York",
    state: "New York",
    code: "JFK",
    photo: newYorkPhoto,
    coord: { x: 84, y: 30 },
    transit: "34–45 days",
    air: "7–10 days",
    avgCost: "SGD 8,600",
    population: "20.1M metro",
    climate: "Variable · 28–85°F",
    apac: "14% APAC heritage",
    why: "A global center for finance, business, media, and culture. New York remains one of the most sought-after destinations for professionals, entrepreneurs, and international families.",
    highlights: ["Global business opportunities", "Diverse communities", "World-class education", "Extensive public transport"],
    accent: "var(--ink)",
  },
  {
    city: "Los Angeles",
    state: "California",
    code: "LAX",
    photo: losAngelesPhoto,
    coord: { x: 9, y: 58 },
    transit: "26–34 days",
    air: "6–9 days",
    avgCost: "SGD 8,200",
    population: "13M metro",
    climate: "Warm · 60–85°F",
    apac: "16% APAC heritage",
    why: "Known for its entertainment industry, technology sector, and year-round lifestyle, Los Angeles attracts professionals and families from around the world.",
    highlights: ["Strong job market", "International community", "Technology & creative industries", "Lifestyle & climate benefits"],
    accent: "var(--gold)",
  },
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
    why: "A leading destination for innovation, entrepreneurship, and technology professionals relocating to the United States.",
    highlights: ["Technology hub", "Startup ecosystem", "Global workforce", "Innovation-driven economy"],
    accent: "var(--accent)",
  },
  {
    city: "Seattle",
    state: "Washington",
    code: "SEA",
    photo: seattlePhoto,
    coord: { x: 10, y: 18 },
    transit: "24–32 days",
    air: "5–8 days",
    avgCost: "SGD 7,900",
    population: "4.0M metro",
    climate: "Cool · 45–70°F",
    apac: "20% APAC heritage",
    why: "Home to some of the world's largest employers, Seattle offers strong career opportunities and a high quality of life.",
    highlights: ["Technology sector", "Growing economy", "Family-friendly communities", "International workforce"],
    accent: "var(--sage)",
  },
  {
    city: "Austin",
    state: "Texas",
    code: "AUS",
    photo: austinPhoto,
    coord: { x: 47, y: 75 },
    transit: "38–50 days",
    air: "8–11 days",
    avgCost: "SGD 8,700",
    population: "2.4M metro",
    climate: "Hot · 50–95°F",
    apac: "8% APAC heritage",
    why: "One of the fastest-growing cities in the United States, known for innovation, affordability, and career growth opportunities.",
    highlights: ["Expanding job market", "Business-friendly environment", "Strong technology sector", "Quality lifestyle"],
    accent: "var(--accent)",
  },
  {
    city: "Chicago",
    state: "Illinois",
    code: "ORD",
    photo: null,
    coord: { x: 62, y: 26 },
    transit: "36–48 days",
    air: "8–11 days",
    avgCost: "SGD 8,800",
    population: "9.5M metro",
    climate: "Variable · 20–85°F",
    apac: "7% APAC heritage",
    why: "A major financial, logistics, and commercial center offering excellent career opportunities and diverse neighborhoods.",
    highlights: ["International business hub", "Strong transport network", "Cultural diversity", "Affordable housing options"],
    accent: "var(--sage)",
  },
  {
    city: "Boston",
    state: "Massachusetts",
    code: "BOS",
    photo: bostonPhoto,
    coord: { x: 86, y: 24 },
    transit: "36–47 days",
    air: "8–11 days",
    avgCost: "SGD 8,900",
    population: "4.9M metro",
    climate: "Variable · 30–80°F",
    apac: "11% APAC heritage",
    why: "Popular among students, researchers, healthcare professionals, and families seeking access to leading educational institutions.",
    highlights: ["World-renowned universities", "Healthcare sector", "Research opportunities", "Historic neighbourhoods"],
    accent: "var(--gold)",
  },
  {
    city: "Miami",
    state: "Florida",
    code: "MIA",
    photo: null,
    coord: { x: 84, y: 58 },
    transit: "38–50 days",
    air: "9–12 days",
    avgCost: "SGD 9,000",
    population: "6.2M metro",
    climate: "Warm · 60–90°F",
    apac: "2% APAC heritage",
    why: "A vibrant international city with strong business connections, multicultural communities, and attractive lifestyle opportunities.",
    highlights: ["International gateway city", "Growing business community", "Warm climate", "Diverse population"],
    accent: "var(--accent)",
  },
  {
    city: "Houston",
    state: "Texas",
    code: "IAH",
    photo: null,
    coord: { x: 53, y: 73 },
    transit: "36–48 days",
    air: "9–12 days",
    avgCost: "SGD 8,600",
    population: "7.5M metro",
    climate: "Hot · 45–95°F",
    apac: "8% APAC heritage",
    why: "A leading destination for professionals working in energy, engineering, healthcare, and international trade.",
    highlights: ["Energy industry hub", "Affordable living", "Career opportunities", "International community"],
    accent: "var(--ink)",
  },
  {
    city: "Washington",
    state: "District of Columbia",
    code: "IAD",
    photo: null,
    coord: { x: 82, y: 37 },
    transit: "36–47 days",
    air: "8–11 days",
    avgCost: "SGD 8,800",
    population: "6.4M metro",
    climate: "Variable · 30–88°F",
    apac: "11% APAC heritage",
    why: "A preferred destination for professionals working in government, consulting, policy, and international organizations.",
    highlights: ["Government sector", "International organizations", "Professional networking", "Career development opportunities"],
    accent: "var(--sage)",
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
          title="Popular cities for relocating to the USA."
          lede={
            <>
              <p>
                From major business hubs and technology centers to family-friendly
                communities and university cities, the United States offers a wide range of
                destinations for individuals, families, students, and professionals
                planning an international move.
              </p>
              <p className="mt-16">
                Explore some of the most popular destinations chosen by customers
                relocating to the USA. Tap a pin or card to compare.
              </p>
            </>
          }
        />

        <div className="dest-shell mt-48">
          <div className="dest-map card">
            <div className="dest-map-hd between">
              <div className="text-mono-sm">UNITED STATES · POPULAR DESTINATIONS</div>
              <div className="text-mono-sm">Singapore origin</div>
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
                <Placeholder label={`${d.city.toUpperCase()} — PHOTO`} ratio="wide" corner={`SIN→${d.code}`} />
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
                <div className="text-mono-sm mb-8">HIGHLIGHTS</div>
                <div className="dest-tags">
                  {d.highlights.map((h) => (
                    <span key={h} className="chip"><span className="mono">✓</span> {h}</span>
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

        <div className="card mt-48">
          <h3 className="h3">Find the right destination for your move</h3>
          <p className="muted mt-12" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 70 + "ch" }}>
            Whether you're planning an international moving journey, looking to move to the
            USA for career opportunities, or relocating your family for a better lifestyle,
            our relocation specialists can help you choose the destination that best suits
            your goals.
          </p>
        </div>
      </div>
    </section>
  );
}

export { Visa, Destinations };
