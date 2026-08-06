import React, { useState, useEffect, useRef } from "react";
import { SectionHeader } from "./chrome.jsx";
import petPhoto from "../assets/country images/IATA, PET RELOCATION.jpeg";
import guidePhoto from "../assets/guide.jpeg";
import checklistPhoto from "../assets/checklist.jpeg";
import livingAbroadPhoto from "../assets/living abroad.jpeg";
import customsPhoto from "../assets/customs.jpeg";
import { ROUTES } from "./calculator.jsx";

// Pet teaser + animated stats + FAQ accordion + Contact form + Sticky quote widget.

function PetTeaser() {
  return (
    <section className="band cream" id="pets">
      <div className="wrap">
        <div className="pet-card card">
          <div className="pet-left">
            <div className="eyebrow">PET · RELOCATION · 08</div>
            <h2 className="h1 mt-16">
              The whole family flies.<br />
              <span className="serif">Pets included.</span>
            </h2>
            <p className="lede mt-24" style={{ maxWidth: 46 + "ch" }}>
              IATA Live Animal Regulations certified. We handle the rabies titre tests,
              USDA endorsements, in-cabin paperwork, and custom-built crates.
              For dogs, cats, birds, and the occasional rabbit.
            </p>
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

function Stats() {
  const stats = [
    { value: 12840, suffix: "", label: "Families moved", note: "Since 2014" },
    { value: 4.94, decimals: 2, suffix: "", label: "Verified rating", note: "2,108 reviews" },
    { value: 96.3, decimals: 1, suffix: "%", label: "On-time delivery", note: "Last 12 months" },
    { value: 37, suffix: "", label: "US ports of entry", note: "Full clearance" },
    { value: 0, suffix: "", label: "Hidden fees", note: "Fixed-price guarantee" },
    { value: 48, suffix: "h", label: "Quote turnaround", note: "Avg post-survey" },
  ];
  return (
    <section className="band ink stats">
      <div className="wrap">
        <div className="between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="eyebrow" style={{ color: "var(--gold)" }}>BY THE NUMBERS · 09</div>
          <div className="mono text-mono-sm" style={{ color: "rgba(246,242,236,0.6)" }}>
            VERIFIED 2025 · INDEPENDENT AUDIT
          </div>
        </div>
        <h2 className="h1 mt-24" style={{ maxWidth: 24 + "ch" }}>
          The kind of operating record<br />
          <span className="serif" style={{ color: "var(--gold)" }}>you can plan a life around.</span>
        </h2>

        <div className="stats-grid mt-48">
          {stats.map((s, i) => (
            <div key={i} className="stat-cell">
              <div className="stat-val">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div className="stat-lbl">{s.label}</div>
              <div className="stat-note">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How much does it cost to move from Singapore to the United States?",
    a: "All-in door-to-door averages SGD 6,400 (studio) to SGD 14,800 (4-bedroom). The biggest drivers are mode (sea vs air), volume, packing scope, and destination. Use our live calculator for an estimate within ±5% of your final invoice.",
  },
  {
    q: "How long does a Singapore → USA move actually take?",
    a: "Sea freight runs 26–47 days port-to-port plus 7–10 days of origin services and 5–7 days of US customs and delivery — call it 6 to 9 weeks door-to-door. Air freight collapses that to 3–4 weeks. Express courier for essential boxes lands in 5–8 days.",
  },
  {
    q: "What can't I ship into the United States?",
    a: "Alcohol, perishables, plant materials, firearms without an ATF permit, and certain electronics with lithium-ion above 100Wh. We send a personalized restricted-items list with every quote and walk you through US Customs Form 3299 for unaccompanied goods.",
  },
  {
    q: "Do I have to be present when you pack?",
    a: "Yes, on packing day. We need a designated decision-maker — you or a nominated proxy — for inventory sign-off. Most of our clients keep working until the moment we arrive, then hand us their keys.",
  },
  {
    q: "Do you handle the visa process too?",
    a: "We work with three Singapore-based US immigration partners and route every client to whichever team fits their visa class. We do not file the visa ourselves, but we coordinate timelines so your shipment and your I-94 arrive in step.",
  },
  {
    q: "What's covered by insurance — and at what cost?",
    a: "Our all-risk transit cover is 2.5% of declared value plus a SGD 180 administration fee. It includes door-to-door cover, war and strikes risk, and a 60-day storage-in-transit window. We process claims in-house — most resolve in under 21 days.",
  },
  {
    q: "Can you store my things if my US lease isn't ready?",
    a: "Yes. Origin storage in Singapore is SGD 4.40/m³/week (climate-controlled). Destination storage in any of our 9 US warehouses is SGD 6.20/m³/week. Both can be reserved up to 6 months ahead.",
  },
  {
    q: "What if my move size or date changes?",
    a: "Volume changes are recalculated against the same per-m³ rate locked in your quote — no re-pricing risk. Date changes inside 14 days of pack day incur a SGD 480 rebooking fee; outside that window, no charge.",
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
              Questions, <span className="serif">answered.</span>
            </h2>
            <p className="lede mt-24">
              Eight things almost everyone asks before signing a relocation contract.
              Couldn't find yours?
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
