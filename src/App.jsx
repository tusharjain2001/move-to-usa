import React, { useState, useEffect } from "react";
import { Nav, Footer } from "./components/chrome.jsx";
import { Hero, QuoteBand } from "./components/hero.jsx";
import { Services, Guide } from "./components/services-guide.jsx";
import { Calculator } from "./components/calculator.jsx";
import { OurServices } from "./components/our-services.jsx";
import { Visa, Destinations } from "./components/visa-destinations.jsx";
import { PetTeaser, Stats, FAQ, Blog, Contact, StickyQuote } from "./components/sections.jsx";
import {
  useTweaks, TweaksPanel, TweakSection,
  TweakToggle, TweakRadio, TweakColor,
} from "./components/tweaks-panel.jsx";

// App entry — orchestrates sections + Tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#089898", "#18b8e8", "#f59024"],
  "heroLayout": "split",
  "density": "regular",
  "dark": false,
  "showTicker": true,
  "scriptStyle": "serif"
}/*EDITMODE-END*/;

const PALETTES = [
  ["#089898", "#18b8e8", "#f59024"],   // APAC brand — logo teal · cyan · orange (default)
  ["#027174", "#e89436", "#f0b048"],   // deep teal
  ["#0e2a4a", "#f59024", "#f5b342"],   // navy + orange
  ["#b75d3a", "#5a6b4a", "#c9a96e"],   // editorial — terracotta · sage · gold
];

function applyPalette(p) {
  const r = document.documentElement;
  r.style.setProperty("--accent", p[0]);
  r.style.setProperty("--accent-soft", p[1]);
  r.style.setProperty("--sage", p[2]);
  r.style.setProperty("--gold", p[2]);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
    applyPalette(t.palette);
    document.body.classList.toggle("has-sticky", true);
    document.body.dataset.density = t.density;
    document.body.dataset.scriptStyle = t.scriptStyle;
  }, [t]);

  const [quoteState, setQuoteState] = useState({
    origin: "Singapore",
    dest: "",
    size: "Full Household",
    date: "2026-08-15",
    name: "",
    email: "",
    phone: "",
  });

  const scrollToCalc = () => {
    const el = document.getElementById("calculator");
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <>
      <Nav />
      <Hero quoteState={quoteState} />
      <QuoteBand values={quoteState} setValues={setQuoteState} scrollToCalc={scrollToCalc} />
      <Services />
      <Calculator quoteState={quoteState} setQuoteState={setQuoteState} />
      <OurServices />
      <Guide />
      <Visa />
      <Destinations />
      <PetTeaser />
      <Stats />
      <FAQ />
      <Blog />
      <Contact />
      <Footer />
      <StickyQuote quoteState={quoteState} scrollToCalc={scrollToCalc} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakColor
            label="Palette"
            value={t.palette}
            options={PALETTES}
            onChange={(v) => setTweak("palette", v)}
          />
          <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio
            label="Density"
            value={t.density}
            options={["compact", "regular", "comfy"]}
            onChange={(v) => setTweak("density", v)}
          />
          <TweakToggle label="Live ticker" value={t.showTicker} onChange={(v) => setTweak("showTicker", v)} />
        </TweakSection>
        <TweakSection label="Voice">
          <TweakRadio
            label="Accent type"
            value={t.scriptStyle}
            options={[
              { value: "serif", label: "Serif" },
              { value: "sans", label: "Sans" },
            ]}
            onChange={(v) => setTweak("scriptStyle", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

export default App;
