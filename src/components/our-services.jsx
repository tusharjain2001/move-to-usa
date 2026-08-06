import React from "react";

// "Our services" — 8 discrete service cards with iconography.
// Sits between the live calculator (03) and the step-by-step guide.

const OUR_SERVICES = [
  {
    key: "packing",
    title: "Professional packing",
    body: "Protect your belongings with export-grade packing materials, custom crating solutions, and detailed inventory management. Our experienced teams ensure every item is prepared for safe international transportation.",
    bullets: [
      "Export-grade packing materials",
      "Custom crating for fragile items",
      "Detailed inventory management",
      "Professional packing specialists",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </svg>
    ),
  },
  {
    key: "shipping",
    title: "International shipping",
    body: "Flexible shipping solutions designed to match your timeline, budget, and relocation requirements.",
    bullets: [
      "Air freight services",
      "Sea freight services",
      "Full Container Load (FCL)",
      "Less than Container Load (LCL)",
      "Real-time shipment tracking",
    ],
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
    title: "Customs clearance support",
    body: "Navigate customs requirements with confidence. Our relocation specialists assist with documentation preparation and customs procedures to help minimize delays.",
    bullets: [
      "Customs documentation guidance",
      "Import compliance support",
      "Personal effects documentation",
      "Relocation assistance",
    ],
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
    body: "Complete USA relocation services from origin to destination. We coordinate transportation, delivery, and optional unpacking support for a smoother relocation experience.",
    bullets: [
      "Door-to-door delivery",
      "Destination coordination",
      "Unpacking assistance",
      "Move-in support",
    ],
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
    body: "Comprehensive insurance solutions designed to protect your belongings throughout the relocation process.",
    bullets: [
      "Transit protection",
      "Household goods coverage",
      "International shipping protection",
      "Flexible coverage options",
    ],
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
    body: "Safe and reliable transportation solutions for cars, motorcycles, and other approved vehicles.",
    bullets: [
      "Vehicle transport coordination",
      "Import documentation support",
      "International vehicle shipping",
      "Destination delivery",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    key: "pets",
    title: "Pet relocation",
    body: "Moving with pets? Our dedicated pet relocation specialists help manage travel requirements, documentation, and transportation arrangements for a comfortable journey.",
    bullets: [
      "Pet travel planning",
      "Health documentation guidance",
      "Airline coordination",
      "Import requirement assistance",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.4" cy="9.2" r="1.8" />
        <circle cx="12" cy="7.2" r="1.8" />
        <circle cx="16.6" cy="9.2" r="1.8" />
        <path d="M12 12.2c-2.4 0-4.4 1.9-4.4 4 0 1.4 1.1 2.2 2.5 2.2h3.8c1.4 0 2.5-.8 2.5-2.2 0-2.1-2-4-4.4-4z" />
      </svg>
    ),
  },
  {
    key: "baggage",
    title: "Excess baggage shipping",
    body: "A cost-effective solution for shipping additional luggage, personal belongings, and non-household items when moving to the USA.",
    bullets: [
      "Personal effects shipping",
      "Student baggage solutions",
      "Flexible shipment options",
      "Worldwide delivery network",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="7.5" width="17" height="13" rx="2.5" />
        <path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M9.5 11.5v5" />
        <path d="M14.5 11.5v5" />
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
          Comprehensive international moving and relocation solutions designed for
          individuals, families, professionals, and businesses planning to move to the
          USA. From packing and shipping to customs clearance and destination support,
          our relocation specialists manage every stage of your journey.
        </p>

        <div className="our-services-grid mt-48">
          {OUR_SERVICES.map((s) => (
            <article key={s.key} className="our-svc-card card">
              <div className="our-svc-icon">{s.icon}</div>
              <h3 className="h3 mt-32">{s.title}</h3>
              <p className="muted mt-12" style={{ fontSize: 15, lineHeight: 1.55 }}>
                {s.body}
              </p>
              <ul className="svc-bullets mt-24">
                {s.bullets.map((b) => (
                  <li key={b}><span className="mono">✓</span> {b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { OurServices };
