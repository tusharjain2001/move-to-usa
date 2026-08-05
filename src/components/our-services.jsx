import React from "react";

// "Our services" — 6 discrete service cards with iconography.
// Sits between the live calculator (03) and the step-by-step guide.

const OUR_SERVICES = [
  {
    key: "packing",
    title: "Professional packing",
    body: "Export-grade materials, custom crating for fragile items, and full inventory documentation packed to US customs standards.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </svg>
    ),
  },
  {
    key: "freight",
    title: "Sea & air freight",
    body: "FCL and LCL sea freight to Los Angeles, New York, Seattle, Houston and all US ports. Air freight for time-sensitive shipments.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l1.5 3h15L21 17" />
        <path d="M5 17V9h14v8" />
        <path d="M12 4v5" />
        <path d="M9 9h6" />
      </svg>
    ),
  },
  {
    key: "customs",
    title: "US customs clearance",
    body: "Complete documentation support: inventory lists, personal effects declarations, and duty-exemption applications. No surprise delays.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    ),
  },
  {
    key: "door",
    title: "Door-to-door delivery",
    body: "From your Singapore home to your US front door. Real-time tracking throughout so you always know where your belongings are.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 3L3 10l7 3 3 7 8-17z" />
        <path d="M10 13l5-5" />
      </svg>
    ),
  },
  {
    key: "insurance",
    title: "Marine insurance",
    body: "Comprehensive marine cargo insurance for all sea freight shipments with A-rated underwriters for your peace of mind.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
  },
  {
    key: "vehicle",
    title: "Vehicle shipping",
    body: "RoRo and container shipping for cars and motorcycles. We handle US EPA and DOT compliance documentation.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
];

function OurServices() {
  return (
    <section className="band cream" id="our-services">
      <div className="wrap">
        <div className="eyebrow">OUR · SERVICES · 04</div>
        <h2 className="h1 mt-16" style={{ maxWidth: "18ch" }}>
          International moving <span className="serif">services</span> to the USA.
        </h2>
        <p className="lede mt-16" style={{ maxWidth: "62ch" }}>
          End-to-end relocation from your Singapore home to your US front door —
          managed by our experienced coordinators.
        </p>

        <div className="our-services-grid mt-48">
          {OUR_SERVICES.map((s) => (
            <article key={s.key} className="our-svc-card card">
              <div className="our-svc-icon">{s.icon}</div>
              <h3 className="h3 mt-32">{s.title}</h3>
              <p className="muted mt-12" style={{ fontSize: 15, lineHeight: 1.55 }}>
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { OurServices };
