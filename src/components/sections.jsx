import React, { useState, useEffect, useRef } from "react";
import { SectionHeader } from "./chrome.jsx";
import petPhoto from "../assets/country images/IATA, PET RELOCATION.jpeg";
import guidePhoto from "../assets/guide.jpeg";
import checklistPhoto from "../assets/checklist.jpeg";
import livingAbroadPhoto from "../assets/living abroad.jpeg";
import customsPhoto from "../assets/customs.jpeg";
import { ROUTES } from "./calculator.jsx";

// Pet teaser + animated stats + FAQ accordion + Contact form + Sticky quote widget.

// The five stages of a pet move, per the client's content document. Rendered with
// the same card pattern as section 04 so no new layout is introduced.
const PET_SERVICES = [
  {
    key: "planning",
    title: "Pet travel planning",
    body: "Every destination has specific requirements for importing pets. Our team helps you understand travel timelines, documentation requirements, and transportation options before your move begins.",
    bullets: ["Personalized relocation planning", "Destination-specific guidance", "Travel coordination", "Relocation support"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "docs",
    title: "Documentation & compliance",
    body: "International pet travel often requires specific documentation and approvals. We help you prepare the necessary paperwork required for relocation to the United States.",
    bullets: ["Import documentation guidance", "Travel documentation support", "Compliance assistance", "Relocation coordination"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    ),
  },
  {
    key: "health",
    title: "Health & veterinary requirements",
    body: "Preparing your pet for international travel includes meeting health and vaccination requirements before departure.",
    bullets: ["Vaccination guidance", "Veterinary documentation support", "Travel preparation assistance", "Health compliance guidance"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.5S4 15.4 4 9.9A4.4 4.4 0 0 1 12 7.3 4.4 4.4 0 0 1 20 9.9c0 5.5-8 10.6-8 10.6z" />
        <path d="M12 10v5" />
        <path d="M9.5 12.5h5" />
      </svg>
    ),
  },
  {
    key: "transport",
    title: "Pet transportation",
    body: "Our specialists coordinate transportation solutions designed to prioritize the safety and comfort of your pets throughout the journey.",
    bullets: ["International pet transportation", "Airline coordination", "Travel crate guidance", "Journey planning"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16v-2l-8-5V4a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-4.5z" />
      </svg>
    ),
  },
  {
    key: "arrival",
    title: "Arrival support",
    body: "Upon arrival, we help ensure a smooth transition by providing guidance on destination requirements and relocation procedures.",
    bullets: ["Arrival coordination", "Relocation assistance", "Destination support", "Family relocation guidance"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5.5 9.8V20h13V9.8" />
        <path d="M9.5 20v-5.5h5V20" />
      </svg>
    ),
  },
];

function PetTeaser() {
  return (
    <section className="band cream" id="pets">
      <div className="wrap">
        <div className="pet-card card">
          <div className="pet-left">
            <div className="eyebrow">PET · RELOCATION · 08</div>
            <h2 className="h1 mt-16">
              Moving to the USA<br />
              <span className="serif">with pets.</span>
            </h2>
            {/* div, not p — the document's intro runs to two paragraphs. */}
            <div className="lede mt-24" style={{ maxWidth: 46 + "ch" }}>
              <p>
                For many families, pets are an important part of the relocation journey.
                Moving internationally with pets requires careful planning, documentation,
                health compliance, and transportation arrangements to ensure a safe and
                comfortable transition.
              </p>
              <p className="mt-16">
                Our pet relocation specialists help coordinate every stage of your pet's
                journey, so you can focus on your move while we handle the logistics.
              </p>
            </div>
            <div className="pet-stats mt-24">
              <div><span className="mono pet-stat">2,400+</span><span className="muted"> pets moved</span></div>
              <div><span className="mono pet-stat">0</span><span className="muted"> incidents since 2019</span></div>
              <div><span className="mono pet-stat">IPATA</span><span className="muted"> accredited</span></div>
            </div>
            <div className="mt-32 gap-12 row" style={{ flexWrap: "wrap" }}>
              <a className="btn primary" href="#contact">
                Plan a pet move <span className="arr">→</span>
              </a>
              <a className="btn ghost" href="#">
                See the IATA checklist
              </a>
            </div>
          </div>
          <div className="pet-right">
            <img
              className="pet-photo"
              src={petPhoto}
              alt="Pet relocation services — safe international travel for dogs, cats and other pets"
            />
            <div className="pet-badge">
              <div className="mono text-mono-sm">EST. PET MOVE</div>
              <div className="mono" style={{ fontSize: 32, letterSpacing: "-0.02em" }}>SGD 2,840</div>
              <div className="muted" style={{ fontSize: 12 }}>Mid-size dog, SIN → SFO, all-in</div>
            </div>
          </div>
        </div>

        <div className="our-services-grid mt-32">
          {PET_SERVICES.map((s) => (
            <article key={s.key} className="our-svc-card">
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

        <div className="card mt-32">
          <h3 className="h3">Relocating your entire family</h3>
          <p className="muted mt-12" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 70 + "ch" }}>
            Whether you're planning an international moving journey with household goods,
            personal belongings, or family pets, our relocation specialists help coordinate
            every aspect of your move to make the transition as smooth as possible.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────

function CountUp({ to, suffix = "", duration = 1400, decimals = 0 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(to * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  const formatted = decimals > 0
    ? n.toFixed(decimals)
    : Math.round(n).toLocaleString();
  return <span ref={ref} className="mono">{formatted}{suffix}</span>;
}

// "Dedicated" has no number to count up to, so cells carry an optional `text`
// that renders in place of the CountUp animation.
const STATS = [
  {
    value: 10000, suffix: "+",
    label: "International relocations managed",
    note: "Supporting individuals, families, and businesses with professional relocation services worldwide.",
  },
  {
    value: 3500, suffix: "+",
    label: "Moves to the USA coordinated",
    note: "Helping customers successfully relocate to major destinations across the United States.",
  },
  {
    value: 50, suffix: "+",
    label: "US cities served",
    note: "Supporting relocations to leading business, education, and lifestyle destinations throughout the country.",
  },
  {
    value: 98, suffix: "%",
    label: "On-time move coordination",
    note: "Carefully planned logistics and dedicated move management help keep relocations on schedule.",
  },
  {
    value: 4.9, decimals: 1, suffix: "★",
    label: "Customer satisfaction rating",
    note: "Consistently delivering positive relocation experiences through personalized support and professional service.",
  },
  {
    text: "Dedicated",
    label: "Relocation specialists",
    note: "Experienced move managers provide guidance throughout every stage of the relocation process.",
  },
];

const WHY_APAC = [
  "Personalized relocation planning",
  "Professional international moving services",
  "Air and sea freight solutions",
  "Customs documentation support",
  "Pet relocation assistance",
  "Global relocation network",
  "Dedicated move management",
  "Destination support services",
];

function Stats() {
  return (
    <section className="band ink stats">
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--gold)" }}>BY THE NUMBERS · 09</div>
        <h2 className="h1 mt-24" style={{ maxWidth: 30 + "ch" }}>
          Trusted by families, professionals<br />
          <span className="serif" style={{ color: "var(--gold)" }}>
            &amp; businesses moving to the USA.
          </span>
        </h2>
        <div className="lede mt-24" style={{ maxWidth: 62 + "ch", color: "rgba(255,255,255,0.72)" }}>
          <p>
            Every relocation represents a new beginning. Over the years, APAC Relocation
            has helped individuals, families, professionals, and organizations successfully
            relocate across international borders with confidence.
          </p>
          <p className="mt-16">
            Our experience, global network, and relocation expertise help deliver reliable
            moving solutions tailored to every customer.
          </p>
        </div>

        <div className="stats-grid mt-48">
          {STATS.map((s, i) => (
            <div key={i} className="stat-cell">
              <div className={"stat-val" + (s.text ? " is-text" : "")}>
                {s.text
                  ? <span className="mono">{s.text}</span>
                  : <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />}
              </div>
              <div className="stat-lbl">{s.label}</div>
              <div className="stat-note">{s.note}</div>
            </div>
          ))}
        </div>

        <h3 className="h3 mt-48">Why customers choose APAC Relocation</h3>
        <div className="services-footer mt-24">
          {WHY_APAC.map((w) => (
            <div key={w} className="chip"><span className="mono">✓</span> {w}</div>
          ))}
        </div>
        <p className="mt-24" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 70 + "ch", color: "rgba(255,255,255,0.72)" }}>
          Whether you're planning an international moving journey, preparing for moving to
          the USA, or looking for trusted relocation support, our team is committed to
          helping make your transition smooth, efficient, and stress-free.
        </p>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How much does it cost to move to the USA?",
    a: "The cost of an international move depends on several factors, including shipment volume, destination city, transportation method, and additional services required. Request a personalized quote to receive an accurate estimate based on your relocation requirements.",
  },
  {
    q: "How long does international moving to the USA take?",
    a: "Transit times vary depending on the origin location, destination, shipping method, customs procedures, and seasonal demand. Air freight is generally faster, while sea freight is often more cost-effective for larger household shipments.",
  },
  {
    q: "What shipping options are available when relocating to the USA?",
    a: "Customers can choose from:",
    bullets: [
      "Air freight",
      "Sea freight",
      "Full Container Load (FCL)",
      "Shared Container Load (LCL)",
      "Combined shipping solutions",
    ],
    after: "Our relocation specialists will recommend the most suitable option based on your timeline and budget.",
  },
  {
    q: "Do you provide packing services?",
    a: "Yes. Our professional packing teams use export-grade materials and proven packing techniques designed to protect your belongings during international transportation.",
  },
  {
    q: "Can I move my vehicle to the USA?",
    a: "Yes. We assist with vehicle shipping coordination and provide guidance on transportation and documentation requirements for eligible vehicles.",
  },
  {
    q: "Can I relocate with my pets?",
    a: "Yes. Our pet relocation specialists help coordinate documentation, travel requirements, transportation arrangements, and destination guidance for approved pets moving to the United States.",
  },
  {
    q: "Do you provide customs documentation support?",
    a: "Yes. Our relocation team provides guidance on customs documentation and import requirements to help support a smoother relocation experience.",
  },
  {
    q: "Do you offer storage solutions?",
    a: "Yes. Flexible short-term and long-term storage solutions are available for customers who require additional storage before, during, or after their relocation.",
  },
  {
    q: "Can businesses use your corporate relocation services?",
    a: "Absolutely. Our corporate relocation solutions support employee transfers, executive relocations, global mobility programs, and workforce relocation requirements.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="band paper" id="faq">
      <div className="wrap">
        <div className="faq-shell">
          <div className="faq-side">
            <div className="eyebrow">FAQ · 10</div>
            <h2 className="h1 mt-16">
              Moving to the USA:<br />
              <span className="serif">frequently asked questions.</span>
            </h2>
            <p className="lede mt-24">
              Planning an international move comes with plenty of questions. Here are some
              of the most common questions customers ask when preparing to move to the USA.
            </p>
            <a className="btn ghost mt-24" href="#contact">
              Ask a move manager <span className="arr">→</span>
            </a>
          </div>

          <ul className="faq-list">
            {FAQS.map((f, i) => (
              <li key={i} className={"faq-item" + (open === i ? " open" : "")}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span className="mono faq-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="faq-q-text">{f.q}</span>
                  <span className="faq-toggle mono">{open === i ? "−" : "+"}</span>
                </button>
                <div className="faq-a">
                  <p>{f.a}</p>
                  {f.bullets && (
                    <ul className="svc-bullets">
                      {f.bullets.map((b) => (
                        <li key={b}><span className="mono">✓</span> {b}</li>
                      ))}
                    </ul>
                  )}
                  {f.after && <p>{f.after}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Blog ─────────────────────────────────────────────────────────────────────

const BLOG_POSTS = [
  {
    tag: "VISA",
    photo: guidePhoto,
    title: "L-1A vs. EB-1: which route actually gets your family there faster?",
    excerpt: "A side-by-side of processing times, sponsor requirements, and where each path stalls.",
    date: "Jul 22, 2026",
    read: "6 min read",
  },
  {
    tag: "PACKING",
    photo: checklistPhoto,
    title: "The Singapore apartment packing timeline, week by week",
    excerpt: "What to sort, sell, and box in the eight weeks before your surveyor walks in.",
    date: "Jul 14, 2026",
    read: "5 min read",
  },
  {
    tag: "CUSTOMS",
    photo: customsPhoto,
    title: "US Customs Form 3299, explained line by line",
    excerpt: "The unaccompanied-goods form that trips up more first-time movers than any other.",
    date: "Jun 30, 2026",
    read: "8 min read",
  },
  {
    tag: "PETS",
    photo: livingAbroadPhoto,
    title: "Flying your dog into the US: the rabies titre test, demystified",
    excerpt: "Why the blood draw has to happen months ahead, and how to avoid a quarantine surprise.",
    date: "Jun 18, 2026",
    read: "4 min read",
  },
];

function Blog() {
  return (
    <section className="band paper" id="blog">
      <div className="wrap">
        <div className="between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="eyebrow">FROM THE JOURNAL · 12</div>
            <h2 className="h1 mt-16">
              Notes for the move, <span className="serif">before it happens.</span>
            </h2>
          </div>
          <a className="btn ghost" href="#">
            View all articles <span className="arr">→</span>
          </a>
        </div>

        <div className="blog-grid mt-48">
          {BLOG_POSTS.map((p, i) => (
            <a className="blog-card" href="#" key={i}>
              <div className="blog-card-media">
                <img src={p.photo} alt={`${p.tag.toLowerCase()} — ${p.title}`} loading="lazy" />
              </div>
              <div className="blog-body">
                <div className="text-mono-sm">{p.tag}</div>
                <h3 className="blog-title">{p.title}</h3>
                <p className="muted blog-excerpt">{p.excerpt}</p>
                <div className="blog-meta mono">
                  <span>{p.date}</span>
                  <span className="sq-dot" />
                  <span>{p.read}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "+65 ",
    moveDate: "", from: "Singapore", to: "San Francisco, CA",
    rooms: "2-bed apt", notes: "",
    contact: "email",
  });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <section className="band cream" id="contact">
      <div className="wrap">
        <div className="contact-shell">
          <div className="contact-side">
            <div className="eyebrow">GET · IN · TOUCH · 11</div>
            <h2 className="h1 mt-16">
              Speak to a move<br />
              manager, <span className="serif">today.</span>
            </h2>
            <p className="lede mt-24">
              Tell us a little about your move and we'll come back within 4 working hours
              with a survey slot and a senior manager assigned to your account.
            </p>

            <div className="contact-meta mt-32">
              <div className="contact-block">
                <div className="text-mono-sm">CALL</div>
                <div className="mono contact-big">+65 6520 1914</div>
                <div className="muted" style={{ fontSize: 13 }}>Mon–Sat · 09:00–19:00 SGT</div>
              </div>
              <div className="contact-block">
                <div className="text-mono-sm">EMAIL</div>
                <div className="mono contact-big">contact@apacrelocation.com</div>
                <div className="muted" style={{ fontSize: 13 }}>Replies within 4 working hours</div>
              </div>
              <div className="contact-block">
                <div className="text-mono-sm">WHATSAPP</div>
                <div className="mono contact-big">+65 8023 0461</div>
                <div className="muted" style={{ fontSize: 13 }}>Fastest channel · 7 days</div>
              </div>
            </div>
          </div>

          <form
            className="contact-form card"
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          >
            {submitted ? (
              <div className="contact-success">
                <div className="success-mark">
                  <svg width="32" height="32" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="11" fill="none" stroke="var(--success)" strokeWidth="1.5" />
                    <path d="M7 12 L11 16 L17 8" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="h2 mt-24">Got it, {form.name.split(" ")[0] || "thanks"}.</h3>
                <p className="lede mt-16">
                  A senior move manager will email you within 4 working hours with a survey
                  slot. Reference <span className="mono" style={{ background: "var(--cream)", padding: "2px 8px", borderRadius: 4 }}>APX-{Math.floor(Math.random() * 9000 + 22850)}</span>.
                </p>
                <button type="button" className="btn ghost mt-24" onClick={() => setSubmitted(false)}>
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <>
                <div className="between">
                  <div>
                    <div className="eyebrow no-dash">New enquiry</div>
                    <div className="h3 mt-8">Tell us about your move</div>
                  </div>
                  <div className="chip"><span className="dot" /> Avg reply · 47 min</div>
                </div>

                <div className="form-grid mt-24">
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>Full name</label>
                    <input required value={form.name} onChange={update("name")} placeholder="Wei Lin Tan" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input required type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input value={form.phone} onChange={update("phone")} placeholder="+65 9123 4567" />
                  </div>
                  <div className="field">
                    <label>Move from</label>
                    <select value={form.from} onChange={update("from")}>
                      <option>Singapore</option><option>Kuala Lumpur</option><option>Hong Kong</option>
                      <option>Tokyo</option><option>Seoul</option><option>Manila</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Move to</label>
                    <select value={form.to} onChange={update("to")}>
                      {Object.keys(ROUTES).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Approx. date</label>
                    <input type="date" value={form.moveDate} onChange={update("moveDate")} />
                  </div>
                  <div className="field">
                    <label>Home size</label>
                    <select value={form.rooms} onChange={update("rooms")}>
                      <option>Studio</option><option>1-bed apt</option>
                      <option>2-bed apt</option><option>3-bed home</option>
                      <option>4-bed home</option><option>5-bed +</option>
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>Anything else? (Pets, oversized items, visa class)</label>
                    <textarea rows="3" value={form.notes} onChange={update("notes")} placeholder="2 cats, a Yamaha upright piano, L-1A on hand…" />
                  </div>
                </div>

                <div className="form-foot mt-24">
                  <div className="contact-pref">
                    <span className="text-mono-sm">PREFERRED CONTACT</span>
                    <div className="seg" style={{ marginTop: 8 }}>
                      {["email", "phone", "whatsapp"].map((c) => (
                        <button key={c} type="button"
                          className={form.contact === c ? "on" : ""}
                          onClick={() => setForm({ ...form, contact: c })}>
                          {c[0].toUpperCase() + c.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn primary">
                    Send enquiry <span className="arr">→</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

// ── Sticky quote widget — collapses when calculator is in view ────────────────

function StickyQuote({ quoteState, scrollToCalc }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const qband = document.getElementById("quote-band");
    const calc = document.getElementById("calculator");
    const contact = document.getElementById("contact");
    const on = () => {
      const sy = window.scrollY;
      const qbandEnd = qband ? qband.offsetTop + qband.offsetHeight : 0;
      const calcTop = calc?.offsetTop ?? 0;
      const calcEnd = calcTop + (calc?.offsetHeight ?? 0);
      const contactTop = contact?.offsetTop ?? Infinity;
      // hide while quote-band itself is in view (gives the user that form);
      // hide inside the calculator (it has its own price card);
      // hide once contact is in view (form is there).
      const inCalc = sy + window.innerHeight * 0.6 > calcTop && sy < calcEnd;
      const inContact = sy + window.innerHeight * 0.6 > contactTop;
      setShow(sy > qbandEnd && !inCalc && !inContact);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className={"sticky-quote" + (show ? " in" : "")}>
      <div className="sticky-inner">
        <div className="sq-route mono">
          <span>SIN</span>
          <span className="arr">→</span>
          <span>{(ROUTES[quoteState.dest] || ROUTES["San Francisco, CA"]).code}</span>
        </div>
        <div className="sq-meta">
          <span>{quoteState.size}</span>
          <span className="sq-dot" />
          <span className="mono">From SGD 6,400</span>
        </div>
        <button className="btn primary" onClick={scrollToCalc}>
          Live quote <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}

export { PetTeaser, Stats, FAQ, Blog, Contact, StickyQuote };
