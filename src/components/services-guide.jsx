import React, { useState } from "react";
import { SectionHeader } from "./chrome.jsx";

// Door-to-door services row + step-by-step interactive timeline guide.

const SERVICES = [
  {
    n: "01",
    title: "Pre-move survey",
    body: "Virtual or in-home walkthrough in Singapore. Inventory, customs paperwork, and a fixed quote within 48 hours.",
    bullets: ["Video or in-home", "48h fixed quote", "Bilingual surveyor"],
  },
  {
    n: "02",
    title: "Packing & loading",
    body: "FIDI-grade packing crews. Export-grade cartons, custom crates for art and pianos, full digital inventory.",
    bullets: ["Photo inventory", "Fragile crating", "Same-day loading"],
  },
  {
    n: "03",
    title: "Freight & customs",
    body: "Air, FCL, LCL or hybrid. We hold a Singapore CR licence and US FMC bond — no third-party broker required.",
    bullets: ["FMC OTI #024681N", "US ISF + AMS", "DDP terms available"],
  },
  {
    n: "04",
    title: "Delivery & unpack",
    body: "US-licensed delivery partners in every major metro. Unpacked, assembled, and debris removed — same day.",
    bullets: ["37 ports of entry", "White-glove unpack", "Settle-in concierge"],
  },
];

function Services() {
  return (
    <section className="band cream" id="services">
      <div className="wrap">
        <div className="services-hd">
          <div>
            <div className="eyebrow">DOOR · TO · DOOR · 02</div>
            <h2 className="h1 mt-16">
              One team. <span className="serif">One contract.</span><br />
              From your flat to your front door.
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: 44 + "ch" }}>
            Every APAC Relocation move is owned by a single dedicated move manager.
            No handoffs between agents, freight forwarders, or local movers — just one
            number, one invoice, one timeline.
          </p>
        </div>

        <div className="services-grid mt-48">
          {SERVICES.map((s) => (
            <article key={s.n} className="svc-card">
              <div className="svc-top">
                <span className="mono svc-num">{s.n}</span>
                <span className="svc-line" />
              </div>
              <h3 className="h3 mt-24">{s.title}</h3>
              <p className="muted mt-12" style={{ fontSize: 14, lineHeight: 1.5 }}>{s.body}</p>
              <ul className="svc-bullets mt-24">
                {s.bullets.map((b) => (
                  <li key={b}><span className="mono">✓</span> {b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="services-footer mt-48">
          <div className="chip"><span className="dot" /> Single point of contact</div>
          <div className="chip"><span className="dot" style={{ background: "var(--sage)" }} /> Fixed-price guarantee</div>
          <div className="chip"><span className="dot" style={{ background: "var(--gold)" }} /> Bilingual EN · 中文 · ID · TH · 한국어</div>
          <div className="chip"><span className="dot" style={{ background: "var(--ink)" }} /> 4.94★ verified rating</div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    week: "T − 12 weeks",
    title: "Get a quote & lock your plan",
    body: "Book a 20-min survey. We confirm volume, dates, and visa-aware customs strategy. A move manager is assigned in 48 hours.",
    tasks: ["Online survey or home visit", "Visa class confirmation", "Fixed quote signed"],
  },
  {
    week: "T − 8 weeks",
    title: "Paperwork & permits",
    body: "We file your US customs entry, ISF, and 3299 unaccompanied goods declaration. You sign — we do the rest.",
    tasks: ["CF-3299 prepared", "ISF + AMS filing", "Restricted-item review"],
  },
  {
    week: "T − 4 weeks",
    title: "Disconnect & downsize",
    body: "Concierge handles utilities, school records, banking, and a curated donation/sale plan for items you're not shipping.",
    tasks: ["Utility cut-offs", "School records transfer", "Sale & donation pickup"],
  },
  {
    week: "T − 1 week",
    title: "Pack day",
    body: "Our crew arrives, packs and inventories everything in 1–2 days. Loading the same week — you keep working until Friday.",
    tasks: ["Photo inventory", "Custom crating", "Container loading"],
  },
  {
    week: "T + 2 days",
    title: "You fly. We sail.",
    body: "You land in the US with a 30-day welcome kit (linens, kitchen basics). Your shipment is in transit, tracked daily.",
    tasks: ["Welcome kit at hotel", "Daily transit updates", "Arrival appointment booked"],
  },
  {
    week: "T + 4 weeks",
    title: "Move-in day",
    body: "Delivery, unpack, assemble, and debris removal — usually within one calendar day at destination.",
    tasks: ["US customs cleared", "Furniture assembled", "Settle-in concierge handoff"],
  },
];

function Guide() {
  const [active, setActive] = useState(0);
  return (
    <section className="band paper" id="guide">
      <div className="wrap">
        <SectionHeader
          kicker="STEP · BY · STEP · 05"
          title="How a move from Singapore actually unfolds."
          lede="Twelve weeks from quote to keys is typical. Click any step to see what's happening that week — and what we handle so you don't have to."
        />

        <div className="guide mt-48">
          <ol className="guide-rail">
            {STEPS.map((s, i) => (
              <li
                key={i}
                className={"guide-step" + (active === i ? " active" : "")}
                onClick={() => setActive(i)}
              >
                <div className="guide-week mono">{s.week}</div>
                <div className="guide-step-title">{s.title}</div>
                <span className="guide-dot" />
              </li>
            ))}
          </ol>

          <div className="guide-detail card">
            <div className="between">
              <div className="mono text-mono-sm">STEP {String(active + 1).padStart(2, "0")} / 06</div>
              <div className="mono text-mono-sm">{STEPS[active].week}</div>
            </div>
            <h3 className="h2 mt-16">{STEPS[active].title}</h3>
            <p className="lede mt-16">{STEPS[active].body}</p>

            <div className="guide-tasks mt-32">
              <div className="text-mono-sm mb-16">WE HANDLE</div>
              <ul>
                {STEPS[active].tasks.map((t) => (
                  <li key={t}><span className="mono">→</span> {t}</li>
                ))}
              </ul>
            </div>

            <div className="guide-nav mt-32">
              <button
                className="btn ghost"
                onClick={() => setActive(Math.max(0, active - 1))}
                disabled={active === 0}
              >
                ← Previous
              </button>
              <button
                className="btn primary"
                onClick={() => setActive(Math.min(STEPS.length - 1, active + 1))}
                disabled={active === STEPS.length - 1}
              >
                Next step <span className="arr">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Services, Guide };
