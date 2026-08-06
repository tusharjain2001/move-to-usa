import React, { useState } from "react";
import { SectionHeader } from "./chrome.jsx";

// Door-to-door services row + step-by-step interactive timeline guide.

const SERVICES = [
  {
    n: "01",
    title: "Relocation Planning",
    body: "Every successful move starts with a detailed consultation. Our specialists assess your requirements, shipment volume, destination, and timeline before creating a customized relocation plan.",
    bullets: ["Virtual or in-home survey", "Personal move coordinator", "Tailored relocation plan"],
  },
  {
    n: "02",
    title: "Professional Packing",
    body: "Our experienced packing teams use export-grade materials and proven packing techniques to protect household goods, personal belongings, and valuable items during international transit.",
    bullets: ["Export-quality packing", "Custom crating solutions", "Detailed inventory management"],
  },
  {
    n: "03",
    title: "International Shipping",
    body: "Flexible air freight and sea freight solutions designed around your schedule, budget, and relocation requirements.",
    bullets: ["Air & sea freight options", "Customs documentation guidance", "Real-time shipment tracking"],
  },
  {
    n: "04",
    title: "Destination Services",
    body: "From delivery and unpacking to pet relocation, excess baggage support, and settling-in assistance, we help make your transition to the USA as seamless as possible.",
    bullets: ["Door-to-door delivery", "Pet relocation support", "Excess baggage shipping", "Storage solutions"],
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
              Complete relocation support.<br />
              <span className="serif">From planning to settling in.</span>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: 44 + "ch" }}>
            Every APAC Relocation move is managed by a dedicated relocation specialist.
            From the initial survey to final delivery, we coordinate every stage of your
            international move, ensuring a smooth, stress-free relocation experience.
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
    title: "Start your relocation journey",
    body: "Begin with a personalized consultation to discuss your moving requirements, destination, timeline, and preferred shipping options.",
    tasks: ["Initial relocation consultation", "Move assessment", "Personal move coordinator", "Tailored relocation plan"],
  },
  {
    week: "T − 8 weeks",
    title: "Prepare documentation & move planning",
    body: "Our team helps organize essential documentation, shipping requirements, inventory preparation, and relocation planning to keep your move on track.",
    tasks: ["Documentation guidance", "Shipping preparation", "Inventory planning", "Customs support"],
  },
  {
    week: "T − 4 weeks",
    title: "Confirm your moving schedule",
    body: "Finalize moving dates, shipment details, and service requirements as you prepare your belongings for transportation.",
    tasks: ["Move scheduling", "Shipment confirmation", "Service coordination", "Destination planning"],
  },
  {
    week: "T − 1 week",
    title: "Professional packing & collection",
    body: "Our experienced packing specialists prepare your belongings using export-grade materials and detailed inventory procedures.",
    tasks: ["Professional packing", "Export-grade materials", "Inventory management", "Fragile item protection"],
  },
  {
    week: "T + 2 days",
    title: "International shipping",
    body: "Your shipment begins its journey through the selected transportation method, whether by air freight, sea freight, or a combined shipping solution.",
    tasks: ["Air freight options", "Sea freight solutions", "Shipment tracking", "Transit monitoring"],
  },
  {
    week: "T + 4 weeks",
    title: "Delivery & settling in",
    body: "Once your shipment arrives, our destination teams coordinate delivery and optional unpacking services to help you settle into your new home.",
    tasks: ["Destination delivery", "Unpacking support", "Move-in assistance", "Relocation guidance"],
  },
];

function Guide() {
  const [active, setActive] = useState(0);
  return (
    <section className="band paper" id="guide">
      <div className="wrap">
        <SectionHeader
          kicker="STEP · BY · STEP · 05"
          title="Planning your move to the USA."
          lede={
            <>
              <p>
                Every successful international relocation starts with a clear plan. From
                your initial consultation and shipment preparation to customs clearance
                and final delivery, our relocation specialists guide you through every
                stage of the moving process.
              </p>
              <p className="mt-16">
                Whether you're relocating for work, family, education, or business
                opportunities, our structured approach helps make moving to the USA
                simpler, more predictable, and stress-free.
              </p>
            </>
          }
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
