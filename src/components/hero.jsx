import React, { useState, useEffect, useRef } from "react";
import { BookingFlow } from "./booking-flow.jsx";
import heroImage from "../assets/heroimage.jpeg";
import {
  createOrderForPricing,
  confirmRegistration,
  resendConfirmationCode,
  deepGet,
  loadGoogleMaps,
} from "../api/client.js";
import { toApiValues } from "../api/quote-values.js";

// Hero — full-viewport editorial headline, centered.
// Quote form lives in its own full-width band below.

function Hero({ quoteState }) {
  return (
    <section className="hero hero-solo" id="top">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="eyebrow">SINGAPORE · BASED · APAC WIDE</div>
          <h1 className="display mt-24">
            Move to the USA<br />
            <span className="serif">with Confidence</span>
          </h1>

          <div className="hero-desc mt-32">
            <p className="lede">
              Moving to the USA involves careful planning, international shipping,
              customs clearance, and the right relocation support. Whether you are
              relocating for work, education, business, or family reasons, a successful
              move starts with choosing experienced international moving specialists.
            </p>
            <p className="lede mt-16">
              APAC Relocation provides end-to-end international moving services for
              individuals, families, and businesses relocating to the USA. From sea and
              air freight to customs documentation and destination delivery, our team
              manages every stage of your move.
            </p>
            <p className="lede mt-16">
              Plan your relocation the right way. Share your inventory, choose your
              preferred survey method, and receive accurate moving estimates from
              trusted international movers.
            </p>
          </div>
        </div>

        <img
          className="hero-right-img"
          src={heroImage}
          alt="APAC Relocation — professional international movers helping a family relocate to the United States"
        />

      </div>
    </section>
  );
}

// ── Full-width quote band ───────────────────────────────────────────────────
// Sits directly under the hero; horizontal row of inputs with a single big CTA.

// ── OTP verification gate ───────────────────────────────────────────────────
// Shown after "Get my quote" — the create-order call emails a 6-digit code to
// new customers; this screen verifies it before the live quote.
function OtpGate({ email, onVerified, onBack }) {
  const LEN = 6;
  const [digits, setDigits] = useState(() => Array(LEN).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const refs = useRef([]);

  useEffect(() => { refs.current[0] && refs.current[0].focus(); }, []);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const masked = (() => {
    const [user, domain] = (email || "").split("@");
    if (!domain) return "your email";
    const head = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
    return head + "\u2022\u2022\u2022@" + domain;
  })();

  const setDigit = (i, v) => {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => { const n = [...prev]; n[i] = c; return n; });
    setError("");
    if (c && i < LEN - 1) refs.current[i + 1] && refs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1].focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1].focus();
    if (e.key === "ArrowRight" && i < LEN - 1) refs.current[i + 1].focus();
  };
  const onPaste = (e) => {
    const txt = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, LEN);
    if (!txt) return;
    e.preventDefault();
    const n = Array(LEN).fill("");
    txt.split("").forEach((d, i) => (n[i] = d));
    setDigits(n);
    setError("");
    const last = Math.min(txt.length, LEN - 1);
    refs.current[last] && refs.current[last].focus();
  };

  const entered = digits.join("");
  const full = entered.length === LEN;

  const verify = async () => {
    if (!full || verifying) return;
    setVerifying(true);
    setError("");
    try {
      await confirmRegistration(entered, email);
      onVerified();
    } catch (e) {
      const msg = (e.message || "").toLowerCase();
      // Account already confirmed on a previous visit — nothing left to verify.
      if (msg.includes("already") && msg.includes("confirm")) {
        onVerified();
        return;
      }
      setError(e.message || "That code doesn't match. Check your email and try again.");
      setDigits(Array(LEN).fill(""));
      refs.current[0] && refs.current[0].focus();
      setVerifying(false);
    }
  };
  const resend = async () => {
    setDigits(Array(LEN).fill(""));
    setError("");
    setNotice("");
    try {
      await resendConfirmationCode(email);
      setNotice("A new code is on its way to your inbox.");
      setSeconds(30);
    } catch (e) {
      setError(e.message || "Couldn't resend the code. Please try again.");
    }
    refs.current[0] && refs.current[0].focus();
  };

  return (
    <div className="otp">
      <div className="otp-card">
        <div className="otp-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
            <line x1="10" y1="18.5" x2="14" y2="18.5" />
          </svg>
        </div>
        <div className="text-mono-sm">SECURE · VERIFICATION</div>
        <h3 className="otp-title">Verify your email</h3>
        <p className="otp-sub">
          We sent a 6-digit code to <span className="mono">{masked}</span>. Enter it below to
          unlock your live quote.
        </p>

        <div className="otp-inputs" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              className={"otp-box" + (error ? " err" : "") + (d ? " filled" : "")}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
            />
          ))}
        </div>

        {error && <div className="otp-error mono">{error}</div>}
        {notice && !error && <div className="otp-notice mono">{notice}</div>}

        <button className="btn primary otp-verify" disabled={!full || verifying} onClick={verify}>
          {verifying ? "Verifying…" : "Verify & continue"} <span className="arr">→</span>
        </button>

        <div className="otp-foot">
          <button type="button" className="otp-link" onClick={onBack}>← Edit details</button>
          {seconds > 0 ? (
            <span className="muted mono">Resend in 0:{String(seconds).padStart(2, "0")}</span>
          ) : (
            <button type="button" className="otp-link" onClick={resend}>Resend code</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── City autocomplete (origin & destination) ────────────────────────────────
// Text input backed by google.maps.places.Autocomplete. The selected place is
// normalized to "City, Country" — the shape the backend's lead creation wants.
// Without an API key (VITE_GOOGLE_PLACES_API_KEY in .env) loadGoogleMaps()
// resolves to null and this degrades to a plain text field.
function CityAutocomplete({ value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const acRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || !g || !g.maps?.places?.Autocomplete || !inputRef.current) return;
      // No type restriction — cities, states, countries and addresses are all
      // selectable; whatever Google suggests is normalized below.
      const ac = new g.maps.places.Autocomplete(inputRef.current, {
        fields: ["address_components", "name"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace() || {};
        const comps = place.address_components || [];
        const get = (t) => (comps.find((c) => c.types.includes(t)) || {}).long_name;
        const city = get("locality") || get("postal_town") || get("administrative_area_level_1");
        const country = get("country");
        const next =
          city && country && city !== country ? `${city}, ${country}`
          : country || place.name || inputRef.current.value;
        onChangeRef.current(next);
      });
      acRef.current = ac;
    });
    return () => {
      cancelled = true;
      if (acRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(acRef.current);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      className="qc-input"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function QuoteBand({ values, setValues, scrollToCalc }) {
  const update = (k, v) => setValues({ ...values, [k]: v });
  const [started, setStarted] = useState(false);
  const [gate, setGate] = useState("form"); // form | otp
  const [orderId, setOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const reset = () => { setStarted(false); setGate("form"); setOrderId(null); setFormError(""); };

  // Step 1 — "Get my quote" creates the order. New customers get an OTP email;
  // already-verified ones drop straight into the booking flow.
  const submitQuote = async () => {
    if (submitting) return;
    setFormError("");
    if (
      !(values.origin || "").trim() || !(values.dest || "").trim() || !values.date ||
      !(values.name || "").trim() || !(values.email || "").trim() || !(values.phone || "").trim()
    ) {
      setFormError("Please fill in every field so we can prepare your quote.");
      return;
    }
    // The backend's lead creation 500s (PRO_ERR_008) when it can't resolve a
    // destination country, so require "City, State" rather than a bare city.
    if (values.dest.split(",").map((s) => s.trim()).filter(Boolean).length < 2) {
      setFormError('Please include the destination state — e.g. "San Francisco, CA" rather than just "San Francisco".');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      setFormError("That email address doesn't look right — please check it.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrderForPricing(toApiValues(values));
      const id = deepGet(res, ["order_id", "orderId", "orderID"]);
      if (!id) throw new Error("We couldn't create your order. Please try again.");
      setOrderId(id);
      // user_exist === true → the account is already verified, skip the OTP screen.
      const exists = deepGet(res, ["user_exist", "userExist", "user_exists"]);
      if (exists === true || exists === "true") setStarted(true);
      else setGate("otp");
    } catch (e) {
      setFormError(e.message || "Something went wrong creating your quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Once "Get my quote" is clicked, focus the page on just the form/flow —
  // hide every other page section until the customer resets.
  const flowActive = started || gate === "otp";
  useEffect(() => {
    document.body.classList.toggle("booking-active", flowActive);
    if (flowActive) {
      const el = document.getElementById("quote-band");
      if (el) window.scrollTo({ top: Math.max(0, el.offsetTop - 24), behavior: "smooth" });
    }
    return () => document.body.classList.remove("booking-active");
  }, [flowActive]);

  return (
    <section className="quote-band" id="quote-band">
      <div className="wrap">
        <div className="quote-band-hd">
          <div>
            {/* The flow hides the rest of the page (body.booking-active), so this
                is the only way back out to the landing page. */}
            {flowActive && (
              <button type="button" className="quote-band-home" onClick={reset}>
                <span className="arr">←</span> Back to home
              </button>
            )}
            <div className="eyebrow">INSTANT · QUOTE · 01</div>
            <h2 className="h1 mt-16">
              {started
                ? <>Real-time booking, <span className="serif">step by step.</span></>
                : gate === "otp"
                ? <>One quick check, <span className="serif">then your quote.</span></>
                : <>Tell us where you're moving. <span className="serif">We'll show you the cost.</span></>}
            </h2>
            {started && (
              <div className="quote-band-desc">
                <p>
                  Plan your international move in just a few simple steps. Use our
                  AI-powered video survey to create your inventory, receive a real-time
                  quotation, complete your payment securely, and confirm your booking —
                  all from one place.
                </p>
              </div>
            )}
            {!started && gate !== "otp" && (
              <div className="quote-band-desc">
                <p>
                  Planning an international move? Get a real-time estimate for your{" "}
                  <strong>move to the USA</strong> based on your destination, shipment
                  size, moving date, and preferred shipping method.
                </p>
                <p>
                  Whether you're planning a household relocation, corporate move, or
                  long-term relocation, our instant quote tool helps you compare options
                  and plan your <strong>international moving</strong> journey with
                  confidence.
                </p>
              </div>
            )}
          </div>
          <div className="quote-band-meta">
            <span><i />Real-time pricing</span>
            <span><i />AI video survey</span>
            <span><i />Pay &amp; book online</span>
          </div>
        </div>

        {started ? (
          <BookingFlow values={values} orderId={orderId} onReset={reset} />
        ) : gate === "otp" ? (
          <OtpGate
            email={values.email}
            onVerified={() => { setGate("form"); setStarted(true); }}
            onBack={() => setGate("form")}
          />
        ) : (
          <>
        <div className="quote-row single-row">
          <div className="quote-cell no-caret">
            <span className="qc-label">Moving from</span>
            <CityAutocomplete
              value={values.origin}
              placeholder="City, country"
              onChange={(v) => update("origin", v)}
            />
          </div>
          <div className="quote-cell no-caret">
            <span className="qc-label">Moving to</span>
            <CityAutocomplete
              value={values.dest}
              placeholder="City, state"
              onChange={(v) => update("dest", v)}
            />
          </div>
          <label className="quote-cell no-caret">
            <span className="qc-label">Moving date</span>
            <input
              className="qc-input"
              type="date"
              value={values.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label className="quote-cell">
            <span className="qc-label">Move type</span>
            <select
              className="qc-select"
              value={values.size}
              onChange={(e) => update("size", e.target.value)}
            >
              <option>Full Household</option>
              <option>Partial Household</option>
              <option>Few Boxes</option>
            </select>
          </label>
          <label className="quote-cell no-caret">
            <span className="qc-label">Name</span>
            <input
              className="qc-input"
              type="text"
              placeholder="Full name"
              value={values.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="quote-cell no-caret">
            <span className="qc-label">Email</span>
            <input
              className="qc-input"
              type="email"
              placeholder="you@email.com"
              value={values.email || ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </label>
          <label className="quote-cell no-caret">
            <span className="qc-label">Phone number</span>
            <input
              className="qc-input"
              type="tel"
              placeholder="+65 XXXX XXXX"
              value={values.phone || ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>
        </div>

        <div className="quote-submit">
          <button className="btn primary" disabled={submitting} onClick={submitQuote}>
            {submitting ? "Creating your quote…" : "Get my quote"} <span className="arr">→</span>
          </button>
        </div>

        {formError && <div className="quote-error mono">{formError}</div>}

        <div className="quote-band-foot">
          <span><span className="check">✓</span> 14-day price lock</span>
          <span><span className="check">✓</span> FIDI &amp; IAM accredited</span>
          <span><span className="check">✓</span> FMC OTI licensed</span>
          <span><span className="check">✓</span> Verified customer reviews</span>
        </div>
        </>
        )}
      </div>
    </section>
  );
}

export { Hero, QuoteBand };
