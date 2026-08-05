// API client for the Get Quote booking flow.

const BASE = "https://api.moversly.com";

// Defaults the quote form doesn't capture — change here if the client decides otherwise.
export const CURRENCY = "SGD";
export const DEFAULT_SHIPMENT_MODE = "SEA"; // AIR | SEA | ROAD
export const DEFAULT_SHIPMENT_TYPE = "CONSOLE"; // CONSOLE | FCL
// Backend team asked for this flag while their testing is in progress (15 Jul 2026).
// Set to false / remove once they confirm testing is done.
export const TEST_LEAD = true;
const M3_TO_FT3 = 35.3147;
const FALLBACK_KG_PER_M3 = 110; // used only when an item has no weight from the AI survey

async function req(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      body: body instanceof FormData ? body : body != null ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error || data.detail)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Find the first matching key anywhere in a nested response object (case-insensitive).
export function deepGet(obj, names) {
  const want = names.map((n) => n.toLowerCase());
  const queue = [obj];
  const seen = new Set();
  while (queue.length) {
    const cur = queue.shift();
    if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
    seen.add(cur);
    for (const name of want) {
      for (const [k, v] of Object.entries(cur)) {
        if (k.toLowerCase() === name && v != null && v !== "") return v;
      }
    }
    for (const v of Object.values(cur)) {
      if (v && typeof v === "object") queue.push(v);
    }
  }
  return undefined;
}

const MOVING_TYPE = {
  "Full Household": "FULL_HOUSEHOLD",
  "Partial Household": "PARTIAL_HOUSEHOLD",
  "Few Boxes": "FEW_BOXES",
};
const countryOf = (s) => {
  const parts = (s || "").split(",").map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
};
const cityOf = (s) => ((s || "").split(",")[0] || "").trim();
const round2 = (n) => Math.round(n * 100) / 100;

export function buildBaseOrderPayload(values) {
  // The backend parses moving_date as a number → epoch milliseconds.
  const ts = Date.parse(values.date || "");
  return {
    name: values.name || "",
    email: values.email || "",
    phone: (values.phone || "").replace(/[\s-]/g, ""),
    origin_country: countryOf(values.origin) || "Singapore",
    origin_postal_code: "",
    origin_address: values.origin || "",
    destination_country: countryOf(values.dest),
    destination_postal_code: "",
    destination_address: values.dest || "",
    moving_date: Number.isFinite(ts) ? ts : 0,
    shipment_mode: values.mode || DEFAULT_SHIPMENT_MODE,
    shipment_type: DEFAULT_SHIPMENT_TYPE,
    need_packing: true,
    moving_type: MOVING_TYPE[values.size] || "FULL_HOUSEHOLD",
    test_lead: TEST_LEAD,
  };
}

// Step 1 — create the order (sends the OTP email for new users, returns order_id).
// order_id/items/volume must be present (as empty) or the backend fails with PRO_ERR_008.
export function createOrderForPricing(values) {
  return req("/api/v1/order/create-order-for-pricing", {
    method: "POST",
    body: {
      order_id: "",
      ...buildBaseOrderPayload(values),
      items: [],
      volume: { unit: "CUBIC_M" },
    },
  });
}

// Step 2 — email OTP
export function confirmRegistration(code, email) {
  return req("/api/v1/auth/confirm-registration/using-email", {
    method: "POST",
    body: { code, user_name: email },
  });
}
export function resendConfirmationCode(email) {
  return req("/api/v1/auth/resend-confirmation-code/using-email", {
    method: "POST",
    body: { user_name: email },
  });
}

// Step 3 — upload video, read the streamed SSE analysis, return the "complete"
// message. Hosted on a separate AI service; the request/response format matches
// the working survey app: FormData fields `file` + `model`, SSE lines
// ("data: {json}") with type partial | complete | error.
export const VIDEO_API_BASE = "https://furniture-volume-calculator.eigenai.co";

export async function analyzeVideoStream(file, onMessage) {
  const fd = new FormData();
  fd.append("file", file, file.name || "survey-recording.mp4");
  fd.append("model", "gemini-2.5-flash");
  let res;
  try {
    res = await fetch(VIDEO_API_BASE + "/api/analyze-video-stream", { method: "POST", body: fd });
  } catch {
    throw new Error("Could not reach the video analysis service.");
  }
  if (!res.ok || !res.body) throw new Error(`Video analysis failed (${res.status})`);

  let complete = null;
  const handleLine = (line) => {
    const l = (line || "").trim();
    if (!l.startsWith("data:")) return;
    let msg;
    try { msg = JSON.parse(l.slice(5).trim()); } catch { return; }
    if (onMessage) onMessage(msg);
    if (msg.type === "error") throw new Error(msg.message || "Analysis failed. Please try again.");
    if (msg.type === "complete") {
      if (!msg.success || !(msg.items && msg.items.length)) {
        throw new Error(msg.error || "No furniture detected in the recording. Please try again.");
      }
      complete = msg;
    }
  };

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) handleLine(line);
  }
  handleLine(buf);

  if (!complete) throw new Error("Video analysis did not return a result. Please try again.");
  return complete;
}

// The backend parses dimensions expecting 'L x W x H' (lowercase x, no unit) —
// "×" or a trailing "cm" throw IllegalArgumentException server-side.
const cleanDims = (s) =>
  (s || "").replace(/×/g, "x").replace(/\s*(cm|mm|m|ft|in)\.?\s*$/i, "").trim();

// Step 4 — update the same order with items + volume; returns container/company info.
// Field names follow the backend's OpenAPI schema (snake_case totals, per-item quantity).
export function updateOrderWithItems({ orderId, values, items, totalVolumeM3, recommendedContainer }) {
  // room_name: the AI survey tags each item with the room it was scanned in;
  // send the room(s) covered. When unknown (boxes, manual items) it's omitted
  // and the backend defaults to "Living Room".
  const roomNames = [...new Set(items.map((it) => it.room).filter(Boolean))];
  const apiItems = items.map((it) => {
    const qty = Number(it.qty) || 1;
    const volM3 = Number(it.vol) || 0; // per unit
    const weight = Number(it.weightKg) || volM3 * FALLBACK_KG_PER_M3;
    return {
      name: it.name,
      dimensions: cleanDims(it.dimensions),
      quantity: String(qty),
      volumeFt3: (volM3 * M3_TO_FT3).toFixed(2),
      volumeM3: volM3.toFixed(2),
      weightKg: String(Math.round(weight)),
    };
  });
  const totalWeight = Math.round(
    items.reduce((a, it) => {
      const qty = Number(it.qty) || 1;
      const volM3 = (Number(it.vol) || 0) * qty;
      return a + ((Number(it.weightKg) || 0) * qty || volM3 * FALLBACK_KG_PER_M3);
    }, 0)
  );
  return req("/api/v1/order/create-order-for-pricing", {
    method: "POST",
    body: {
      order_id: orderId,
      ...buildBaseOrderPayload(values),
      ...(roomNames.length ? { room_name: roomNames.join(", ") } : {}),
      volume: { magnitude: totalVolumeM3.toFixed(2), unit: "CUBIC_M" },
      items: apiItems,
      total_volume: Math.round(totalVolumeM3),
      total_volume_ft3: Math.round(totalVolumeM3 * M3_TO_FT3),
      total_weight: totalWeight,
      recommended_container: recommendedContainer || "",
    },
  });
}

// Step 5 — pricing. The step-4 response already carries the resolved ports,
// container type, and freight/destination companies — pass it through.
export function getSeaPricing(pricingRequest) {
  const p = pricingRequest || {};
  return req("/api/v1/order/get-pricing-with-split-for-chatbot", {
    method: "POST",
    body: {
      order_id: p.order_id,
      origin_port: p.origin_port || "",
      destination_port: p.destination_port || "",
      destination_city: p.destination_city || p.destination_port || "",
      to_country: p.to_country || "",
      volume: p.volume || { magnitude: "0", unit: "CUBIC_FT" },
      container_type: p.container_type || "NONE", // enum: FT_20 | FT_40 | HC_40 | NONE
      shipment_type: p.shipment_type || DEFAULT_SHIPMENT_TYPE,
      freight_company: p.freight_company || "",
      destination_company: p.destination_company || "",
      direct_loading: !!p.direct_loading,
      is_edited: false,
      from_survey_app: false,
    },
  });
}
// Live calculator pricing — APAC split endpoint (SEA only). Volume is sent in
// CUBIC_FT. The port can differ from the city (rate-sheet mapping, e.g.
// Perth ships via Sydney, Malaysia via Port Klang).
export function getApacPricing({ originPort, originCountry, destinationPort, destinationCity, toCountry, volumeM3, containerType, shipmentType, movingType }) {
  return req("/api/v1/order/get-pricing-with-split-for-apac", {
    method: "POST",
    body: {
      origin_port: originPort,
      origin_country: originCountry,
      destination_port: destinationPort || destinationCity,
      destination_city: destinationCity,
      to_country: toCountry,
      volume: { magnitude: ((Number(volumeM3) || 0) * M3_TO_FT3).toFixed(2), unit: "CUBIC_FT" },
      container_type: containerType, // FT_40 (full) | FT_20 (shared)
      shipment_type: shipmentType,   // FCL (full) | CONSOLE (shared)
      shipment_mode: "SEA",
      moving_type: movingType,       // FULL_HOUSEHOLD (full) | PARTIAL_HOUSEHOLD (shared)
      direct_loading: false,
      is_edited: false,
      from_survey_app: true,
    },
  });
}

export function getAirPricing(orderId) {
  return req(`/api/v1/order/pricing/air-shipment?orderId=${encodeURIComponent(orderId)}`, {
    method: "POST",
  });
}

// Step 6 — persist the pricing split. The backend expects only this subset of
// the step-5 response (sending the full object causes an NPE), with
// from_survey_app: true — matches the working site's payload exactly.
export function savePricingSplit(p) {
  return req("/api/v1/order/create-pricing-with-split", {
    method: "POST",
    body: {
      order_id: p.order_id,
      volume: p.volume,
      container_type: p.container_type || "NONE",
      shipment_type: p.shipment_type || DEFAULT_SHIPMENT_TYPE,
      origin_port: p.origin_port || "",
      destination_port: p.destination_port || "",
      final_price: p.final_price,
      from_survey_app: true,
    },
  });
}

// Step 7 — payment intent (card / PayNow URL). Money.amount is a string per the API schema.
export function createPaymentIntent({ orderId, email, name, amount, currency }) {
  return req("/api/v1/order/survey-app/payment-intent", {
    method: "POST",
    body: { orderId, email, name, amount: { currency: currency || CURRENCY, amount: String(amount) } },
  });
}

// Step 8 — full order details
export function getOrder(orderId) {
  return req(`/api/v1/order/${encodeURIComponent(orderId)}`);
}

// ── Stripe ──────────────────────────────────────────────────────────────────
// The payment-intent endpoint returns a Stripe clientSecret; payment (card +
// PayNow) is completed in-page with Stripe's Payment Element.
// Same publishable key the working survey app uses (publishable keys are public).
export const STRIPE_PUBLISHABLE_KEY = "pk_live_A4pqzjSx03dGMpIPIMrGzaIi00myhVoZVz";

// ── Google Maps (Places autocomplete) ───────────────────────────────────────
// Key comes from .env (VITE_GOOGLE_PLACES_API_KEY). Without a key this resolves
// to null and the address field behaves as a plain text input.
let googleMapsPromise = null;
export function loadGoogleMaps() {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  if (!key) return Promise.resolve(null);
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        return resolve(window.google);
      }
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
      s.async = true;
      s.onload = () => resolve(window.google || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }
  return googleMapsPromise;
}

let stripePromise = null;
export function loadStripe() {
  if (!STRIPE_PUBLISHABLE_KEY) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = new Promise((resolve, reject) => {
      if (window.Stripe) return resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
      const s = document.createElement("script");
      s.src = "https://js.stripe.com/v3";
      s.onload = () =>
        window.Stripe ? resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY)) : reject(new Error("Stripe.js failed to initialise."));
      s.onerror = () => reject(new Error("Could not load Stripe.js."));
      document.head.appendChild(s);
    });
  }
  return stripePromise;
}
