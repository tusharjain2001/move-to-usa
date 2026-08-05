import React, { useState, useEffect } from "react";
import logoUrl from "../assets/logo.png";

// Shared UI bits: Logo, Nav, Footer, Placeholder helpers, Section header

function Logo({ small }) {
  return (
    <div className="logo-mark" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src={logoUrl}
        alt="APAC Relocation"
        height={small ? 28 : 36}
        style={{ height: small ? 28 : 36, width: "auto", display: "block" }}
      />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="wrap nav-inner">
        <a href="#top"><Logo /></a>
        <div className="nav-cta">
          <div className="nav-contacts mono">
            <a href="mailto:contact@apacrelocation.com">contact@apacrelocation.com</a>
            <span className="nav-contacts-sep" />
            <a href="tel:+6565201914">+65 6520 1914</a>
            <span className="nav-contacts-sep" />
            <a
              href="https://wa.me/6580230461"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-wa"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.4 4.6.8.3 1.4.5 1.9.6.8.2 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.8.9-3-.2-.3c-.9-1.4-1.3-3-1.3-4.6C3.6 7 7.4 3.3 12 3.3c2.2 0 4.3.9 5.9 2.5 1.6 1.6 2.5 3.7 2.5 5.9-.1 4.7-3.8 8.5-8.4 8.5z"/>
              </svg>
              +65 8023 0461
            </a>
          </div>
          <a href="#quote-band" className="btn primary">
            Get instant quote <span className="arr">→</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function SectionHeader({ kicker, title, lede, align = "left", id }) {
  return (
    <header className={"sect-hd " + align} id={id}>
      <div className="eyebrow">{kicker}</div>
      <h2 className="h1 mt-16" style={{ maxWidth: 22 + "ch" }}>{title}</h2>
      {lede && <p className="lede mt-16">{lede}</p>}
    </header>
  );
}

function Placeholder({ label, ratio = "wide", corner, children, style, className }) {
  return (
    <div className={"placeholder ratio-" + ratio + (className ? " " + className : "")} style={style}>
      {corner && <div className="corner"><i />{corner}</div>}
      {children}
      <span>{label}</span>
    </div>
  );
}

// Footer links mirror www.apacrelocation.com's footer (client request, Jul 2026),
// minus the "Relocate to Singapore" column/link which the client asked to drop.
const SITE = "https://apacrelocation.com";
// The client's US city pages live under the USA landing page and use an
// "-america" suffix (verified against apacrelocation.com/sitemap.xml, 5 Aug 2026).
const USA = "/moving/international-movers/moving-to-the-usa-best-international-mover-from-singapore";
const FOOTER_COLS = [
  {
    h: "International Moving",
    links: [
      ["Asia", "/moving/international-movers/moving-to-asia/"],
      ["Singapore", "/moving/international-movers/moving-to-singapore/"],
      ["India", "/moving/international-movers/moving-to-india-from-singapore/"],
      ["Australia", "/moving/international-movers/moving-to-australia-from-singapore/"],
      ["New Zealand", "/moving/international-movers/moving-to-new-zealand-from-singapore/"],
      ["America", USA + "/"],
      ["New York", USA + "/moving-to-new-york-america/"],
      ["Los Angeles", USA + "/moving-to-los-angeles-america/"],
      ["Europe", "/moving/international-movers/moving-to-europe-from-singapore/"],
      ["UK", "/moving/international-movers/moving-to-europe-from-singapore/moving-to-uk-from-singapore/"],
      ["Germany", "/moving/international-movers/moving-to-europe-from-singapore/moving-to-germany-from-singapore/"],
      ["Switzerland", "/moving/international-movers/moving-to-europe-from-singapore/moving-to-switzerland/"],
      ["Africa", "/moving/international-movers/moving-to-africa/"],
    ],
  },
  {
    h: "Global Relocation",
    links: [
      ["Asia", "/relocate/relocate-to-asia/"],
      ["India", "/relocate/relocate-to-india/"],
      ["Australia", "/relocate/relocate-to-australia/"],
      ["New Zealand", "/relocate/relocate-to-newzealand/"],
      ["USA", "/relocate/relocate-to-usa/"],
      ["Europe", "/relocate/relocate-to-europe/"],
      ["France", "/relocate/relocate-to-france/"],
      ["Germany", "/relocate/relocate-to-germany/"],
      ["Switzerland", "/relocate/relocate-to-switzerland/"],
      ["UK", "/relocate/relocate-to-uk/"],
    ],
  },
  {
    h: "Community",
    links: [
      ["Blog", "/blogs/"],
      ["Events", "/events/"],
      ["Popular Destinations", "/community-popular-destination/"],
      ["Relocation Guide", "/relocation-guide/"],
      ["Travel Insurance", "/travel-insurance/"],
      ["Storage", "/storage/"],
      ["Relocation Services", "/relocation-services/"],
      ["Excess Baggage", "/excess-baggage/"],
      ["Moving Quotes", "/international-moving-quotes/"],
      ["About Us", "/about-us/"],
      ["Contact Us", "/contact-us/"],
    ],
  },
];
const SOCIALS = [
  {
    label: "Facebook",
    url: "https://www.facebook.com/apacrelocation",
    d: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/apac-relocation/",
    d: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z",
  },
  {
    label: "X",
    url: "https://x.com/ApacRelocation?lang=en",
    d: "M18.9 2H22l-7.86 8.98L23.24 22h-6.61l-5.18-6.77L5.53 22H2.4l8.4-9.6L1.1 2h6.78l4.68 6.19L18.9 2zm-1.16 18.13h1.72L6.94 3.77H5.1l12.64 16.36z",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@apacrelocation263",
    d: "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z",
  },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <ul className="muted mt-24 footer-addr">
              <li>APAC RELOCATION PTE LTD</li>
              <li>2, ANG MO KIO STREET 64</li>
              <li>#02-03A, ECON BUILDING</li>
              <li>SINGAPORE 569084</li>
              <li className="mt-8"><a href="mailto:contact@apacrelocation.com">contact@apacrelocation.com</a></li>
              <li><a href="tel:+6565201914">+65 6520 1914</a></li>
              <li><a href="https://wa.me/6580230461" target="_blank" rel="noopener noreferrer">WhatsApp +65 8023 0461</a></li>
            </ul>
            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.h}>
              <div className="footer-h">{col.h}</div>
              <ul>
                {col.links.map(([label, path]) => (
                  <li key={label}>
                    <a href={SITE + path} target="_blank" rel="noopener noreferrer">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
            © 2026 APAC RELOCATION PTE LTD · www.apacrelocation.com
          </div>
          <div className="footer-meta mono">
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Modern slavery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Logo, Nav, SectionHeader, Placeholder, Footer };
