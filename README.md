# APAC Relocation — React (Vite)

The APAC Relocation landing page converted into a standard, buildable React project.

## Run it

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Structure

```
index.html                 # entry HTML — Google Fonts + #root + module script
src/
  main.jsx                 # React entry; mounts <App>, imports the three CSS files
  App.jsx                  # page composition + Tweaks panel wiring
  assets/
    logo.png               # brand logo (imported by chrome.jsx)
  styles/
    styles.css             # design system / tokens
    sections.css           # section layouts
    booking-flow.css       # booking-flow styles
  components/
    chrome.jsx             # Logo, Nav, SectionHeader, Placeholder, Footer
    hero.jsx               # Hero + QuoteBand
    booking-flow.jsx       # multi-step quote → inventory → pay → confirm flow
    calculator.jsx         # live cost & timeline calculator (exports ROUTES)
    our-services.jsx       # service cards
    services-guide.jsx     # door-to-door services + step-by-step guide
    visa-destinations.jsx  # visa comparison + destination map
    sections.jsx           # pet teaser, stats, FAQ, contact, sticky quote
    tweaks-panel.jsx       # in-app Tweaks panel + control primitives
```

## Notes

- Components were converted from a single-file in-browser (Babel) build into ES
  modules. Each file imports React and its dependencies explicitly and exports
  named components.
- The **Tweaks panel** (palette / dark mode / density / etc.) is driven by an
  editor host protocol via `postMessage`. Its default values still apply on load;
  the panel UI itself only opens inside that host, so in this standalone project it
  stays hidden. Remove `<TweaksPanel>…</TweaksPanel>` from `App.jsx` if you don't
  need it, or wire your own toggle.
- Placeholder image slots (`<Placeholder>`) mark where editorial photography
  should be dropped in.
