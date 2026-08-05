# API Integration — Complete Technical Guide

Everything about how the "Get Quote" section (Section 2) is integrated with the
Moversly backend. Written so you can walk a technical client through any part
of it.

---

## 1. Architecture at a glance

**3 files do all the work:**

| File | Role |
|---|---|
| `src/api/client.js` | The API layer. Every endpoint has one function here. Base URLs, payload builders, response parsing, Stripe loader. No UI code. |
| `src/components/hero.jsx` | The quote form (`QuoteBand`), the custom origin dropdown (`OriginSelect`), and the email OTP screen (`OtpGate`). Calls Steps 1–2. |
| `src/components/booking-flow.jsx` | The 4-step booking flow (Inventory → Quote → Payment → Confirm). Calls Steps 3–8. |

**Two backends:**

- `https://api.moversly.com` — orders, auth/OTP, pricing, payment (Java/Spring;
  its OpenAPI spec is public at `https://api.moversly.com/v3/api-docs`)
- `https://furniture-volume-calculator.eigenai.co` — the AI video analysis
  service (separate host; streams results over SSE)

Both are hardcoded in `client.js` (`BASE` and `VIDEO_API_BASE`). CORS is open
on both, so the browser calls them directly — no proxy server needed.

**The customer journey and which API fires when:**

```
Fill quote form → [1] create order (+OTP email if new user)
      ↓
OTP screen (new users only) → [2] confirm code / resend
      ↓
Room-by-room AI video survey → [3] analyze video (per room, SSE stream)
      ↓
Review/edit items → "Continue to quote" → [4] update order with inventory
      ↓
Quote screen opens → [5] fetch live pricing → [6] save pricing split (automatic)
      ↓
"Pay & book" → [7] payment intent → Stripe Payment Element (card / PayNow)
      ↓
Confirmation → [8] fetch full order
```

One `order_id` (created in Step 1) threads through every later call. It's held
in `QuoteBand` state and passed into `BookingFlow` as a prop.

---

## 2. Step-by-step: every API in detail

### Step 1 — Create order
`POST /api/v1/order/create-order-for-pricing`

- **Trigger:** "Get my quote" button → `submitQuote()` in `hero.jsx`
- **Code:** `createOrderForPricing(values)` in `client.js`
- **Purpose:** creates the lead/order, sends an OTP email to new users, returns `order_id`.

Payload (built by `buildBaseOrderPayload()` + Step-1 extras):

```json
{
  "order_id": "",
  "name": "…", "email": "…", "phone": "…",
  "origin_country": "Singapore", "origin_postal_code": "", "origin_address": "Singapore",
  "destination_country": "Australia", "destination_postal_code": "", "destination_address": "Sydney, Australia",
  "moving_date": 1786752000000,
  "shipment_mode": "SEA", "shipment_type": "CONSOLE",
  "need_packing": true, "moving_type": "FULL_HOUSEHOLD",
  "items": [], "volume": { "unit": "CUBIC_M" }
}
```

**Quirks discovered (all verified against the live API):**
- `moving_date` must be **epoch milliseconds** (a date string like
  `"2026-08-15"` throws a `NumberFormatException` server-side). The form's
  date is converted with `Date.parse()`.
- `order_id: ""`, `items: []` and `volume: {unit}` must be **present even when
  empty** — omitting them causes `PRO_ERR_008 "Error creating lead"` (Java
  NPE downstream). This was found by capturing the working survey app's payload.
- `shipment_type` must be present or the backend NPEs ("Name is null" —
  enum lookup on null).
- `moving_type` mapping: Full Household → `FULL_HOUSEHOLD`, Partial Household
  → `PARTIAL_HOUSEHOLD`, Few Boxes → `FEW_BOXES`.

Response = a `PricingSplitRequest` object. We use two fields:
- `order_id` → stored for all later calls
- `user_exist` → `true` means the email is already registered/verified →
  **skip the OTP screen** and go straight into the flow.

### Step 2 — Email OTP
`POST /api/v1/auth/confirm-registration/using-email`
`POST /api/v1/auth/resend-confirmation-code/using-email`

- **Trigger:** OTP screen (`OtpGate` in `hero.jsx`) — Verify button / "Resend code" link
- **Code:** `confirmRegistration(code, email)`, `resendConfirmationCode(email)`
- Payload: `{ "code": "123456", "user_name": "<email>" }` — the email **is** the username.
- Only shown to new users (`user_exist: false`). If verification fails with an
  "already confirmed" message, we treat it as verified and continue.

### Step 3 — AI video analysis
`POST https://furniture-volume-calculator.eigenai.co/api/analyze-video-stream`

- **Trigger:** clicking a room chip in the video survey (`VideoSurvey` in
  `booking-flow.jsx`). The camera opens in the page (`getUserMedia`), the
  customer records a walkthrough (`MediaRecorder`), and on stop the recording
  uploads automatically. Fallback to a file picker if there's no camera/permission.
- **Code:** `analyzeVideoStream(file, onMessage)` in `client.js`
- **Request:** `multipart/form-data` with two fields:
  - `file` — the video (webm/mp4 depending on browser)
  - `model` — `"gemini-2.5-flash"` (the AI model the service runs)
- **Response:** Server-Sent Events stream. Each line looks like
  `data: {"type": "...", ...}`:
  - `type: "partial"` — progressive item updates while the video processes
  - `type: "complete"` — final result: `success`, `items[]`,
    `totalVolume` (CBM), `recommendedContainer`
  - `type: "error"` — failure with a `message`
- We read the stream with `response.body.getReader()`, split on newlines,
  parse each `data:` line, and **only trust the `complete` message** (per the
  API doc). Real example:
  `data: {"type":"complete","success":true,"items":[{"name":"Wardrobe","dimensions":"6.5 x 4 x 2","volume":"52","weight":"100"}],"totalVolume":52.0,"recommendedContainer":"40ft Container - FCL"}`
  — note the item `volume` is in **cubic feet** (dimensions in ft multiply out
  to it exactly), despite the doc saying CBM. `normalizeApiItem()` in
  `booking-flow.jsx` handles both this shape (`volume`/`weight`, ft³→m³
  conversion) and the doc's shape (`volumeM3`/`volumeFt3`/`weightKg`).
- Each room's scan is stored separately (`detected[roomId]`); re-scanning a
  room replaces just that room's items.

### Step 4 — Update order with inventory
`POST /api/v1/order/create-order-for-pricing` (same endpoint as Step 1, now with `order_id` filled)

- **Trigger:** "Continue to quote" in the items editor / box builder →
  `submitInventory()` in `BookingFlow`
- **Code:** `updateOrderWithItems({orderId, values, items, totalVolumeM3, recommendedContainer})`
- Adds to the Step-1 payload: `items[]` (with per-item `quantity` as a string),
  `volume: {magnitude, unit: "CUBIC_M"}`, and snake_case totals —
  `total_volume`, `total_volume_ft3`, `total_weight`, `recommended_container`.
  (The doc we were given said camelCase; the real schema at `/v3/api-docs` is
  snake_case.)
- Items without weight (video AI sometimes returns 0) get an estimated
  **110 kg/m³** fallback so `total_weight` is never zero.
- **Response is gold:** the backend resolves and returns `origin_port`,
  `destination_port`, `destination_city`, `to_country`, `container_type`
  (enum `FT_20 | FT_40 | HC_40 | NONE`), `freight_company`,
  `destination_company`, and the volume converted to `CUBIC_FT`. We store this
  **whole response** as `meta` and pass it verbatim into Step 5 — we never
  guess ports ourselves.

### Step 5 — Live pricing
SEA: `POST /api/v1/order/get-pricing-with-split-for-chatbot`
AIR: `POST /api/v1/order/pricing/air-shipment?orderId=…` (no body)

- **Trigger:** automatically when the quote screen mounts (`useEffect` in
  `QuoteSummary`)
- **Code:** `getSeaPricing(meta)` / `getAirPricing(orderId)`
- The SEA request body is essentially the Step-4 response passed through, plus
  `direct_loading: false, is_edited: false, from_survey_app: false`.
- **Response:** a `PricingSplit`. Every money value is a `Money` object
  `{currency, amount}` (amount is a string). The breakdown card reads:
  - `final_price.amount` → the big total (and `final_price.currency` drives
    every price label in the UI — SGD comes from the API, not hardcoded)
  - Split lines: `fcl_pricing.price` or `lcl_pricing.price` (freight),
    `packer_pricing.price` (packing), `trucker_pricing.price` (trucking),
    `haulage.price`, `destination_agent_pricing.price` (destination),
    `cargo_handling`, `warehouse_handling`, `material_delivery`, `margin`
  - Parsing lives in `normalizePricing()` in `booking-flow.jsx`; zero/absent
    lines are hidden.
- Verified live: Singapore → Sydney, 12.5 m³ CONSOLE priced **SGD 5,280.00**
  (freight 1,245.59 / packing 970.20 / trucking 638.20 / haulage 168.07 /
  destination 1,708.03 / margin 541.43).

### Step 6 — Save the pricing split
`POST /api/v1/order/create-pricing-with-split`

- **Trigger:** automatically, right after Step 5 succeeds (same `useEffect`);
  invisible to the customer. Non-fatal if it fails (logged as a console warning).
- **Code:** `savePricingSplit(step5Response)`
- **Important quirk:** the backend **NPEs if you send the full Step-5
  response** (the doc said "payload = response from step 5" — that's wrong in
  practice). The working survey app sends only this subset, which is what we
  send:

```json
{
  "order_id": "…",
  "volume": { "magnitude": "441.43", "unit": "CUBIC_FT" },
  "container_type": "FT_20",
  "shipment_type": "CONSOLE",
  "origin_port": "Singapore",
  "destination_port": "Sydney",
  "final_price": { "currency": "SGD", "amount": "5280.00" },
  "from_survey_app": true
}
```

- Response: `{status: "COMPLETED", pricing_split_id: "…", …}`.

### Step 7 — Payment (Stripe)
`POST /api/v1/order/survey-app/payment-intent`

- **Trigger:** the payment screen mounts (`PaymentForm` in `booking-flow.jsx`)
- **Code:** `createPaymentIntent({orderId, email, name, amount, currency})`
- Payload: `{ "orderId", "email", "name", "amount": {"currency": "SGD", "amount": "5280"} }`
  (`amount` is a `Money` — the amount is a **string**).
- **The doc said this returns a "PayNow URL" — it doesn't.** It returns a
  **Stripe PaymentIntent**: `{"clientSecret": "pi_…_secret_…", "id": "pi_…"}`.
- So payment is completed **in-page with Stripe's Payment Element**:
  1. We load Stripe.js from `js.stripe.com/v3` (`loadStripe()` in `client.js`)
     using the publishable key `pk_live_A4pq…` — the same key the client's
     survey app uses (publishable keys are safe to ship in frontend code).
  2. `stripe.elements({clientSecret})` + `elements.create("payment")` mounts
     the payment UI — **card and PayNow tabs appear automatically** (Stripe
     decides available methods from the account + SGD currency).
  3. "Pay now" calls `stripe.confirmPayment({redirect: "if_required"})`; on
     `succeeded`/`processing` we advance to the confirmation screen.
  - Bank transfer stays a manual-instructions tile (no API).
- ⚠️ The key is **live mode** — real cards get charged for real. There is a
  test key in the client's bundle (`pk_test_51PXgFL…`) but the backend creates
  the PaymentIntent with its own secret key, so test/live mode is decided
  server-side, not by us.

### Step 8 — Full order details
`GET /api/v1/order/{order_id}`

- **Trigger:** confirmation screen mounts (`Confirmation` in `booking-flow.jsx`)
- **Code:** `getOrder(orderId)`
- Shows the real `order_id` and uses the response volume when available;
  local state is the fallback if the call fails (the screen never breaks).

---

## 3. Cross-cutting implementation details

- **`req()` helper** (`client.js`): one fetch wrapper for all Moversly calls —
  JSON headers, response parsing, and error normalization (pulls
  `message`/`error`/`detail` out of error bodies so the UI shows the backend's
  actual message, e.g. "Error creating lead").
- **`deepGet(obj, names)`**: case-insensitive recursive key lookup used when
  reading responses, so minor backend field renames don't break the UI.
- **Loading/error states**: every button that triggers an API disables itself
  and changes label while in flight; errors render in red monospace
  (`.bf-api-error` / `.quote-error`) with Retry where it makes sense (pricing).
- **Currency**: flows from `final_price.currency` through quote → payment →
  confirmation. `SGD` is only a fallback constant.
- **Zero-price guard**: if `final_price` is 0 (route without rates), the
  Pay button stays disabled and the customer sees "We couldn't calculate a
  live price for this route yet…" — prevents SGD 0 bookings.
- **Defaults** (top of `client.js`, one-line changes):
  `DEFAULT_SHIPMENT_MODE = "SEA"`, `DEFAULT_SHIPMENT_TYPE = "CONSOLE"`,
  `CURRENCY = "SGD"`, weight fallback 110 kg/m³.

---

## 4. Known issues & backend gaps (tell the client)

1. **Malaysia origins have no rates.** With any real volume, KL / Penang /
   Johor Bahru fail at Step 4 with `500 PRO_ERR_008 "Error creating lead"`
   (verified: identical payloads from Singapore/India succeed; KL→London fails
   too, so it's origin-side, not destination). Log correlation IDs from our
   tests (14 Jul 2026): `14c1425e-8d57-4e52-bcfd-2cb372599cb0` (KL→Syd),
   `337fe396-8550-4e16-9184-0de1db877db4` (Penang→Syd),
   `d044715b-0155-41e5-b49c-7d4fb85f8f6e` (JB→Syd).
   The Malaysian cities are kept in the dropdown **so the client can reproduce
   the error**; fixing it = adding Malaysia port mappings + rates in the
   Moversly backend (zero frontend changes needed after).
   - Edge case: with **zero volume** the same route returns 200 but with an
     empty result (no port, no rates → SGD 0). That's the backend skipping the
     rate lookup, not Malaysia working.
2. **India origins price to 0.** Ports resolve (Mumbai → Nhava Sheva,
   Delhi → ICD Tughlakabad…) but `freight_company` comes back null → final
   price 0. Same behavior on the client's own survey app. Needs India rate
   data server-side.
3. **Doc vs reality** (in case the client asks why the doc wasn't enough):
   `moving_date` epoch-ms not string; totals snake_case not camelCase;
   Step 1 requires empty `order_id`/`items`/`volume`; Step 6 needs a trimmed
   payload not the full Step-5 response; Step 7 returns a Stripe clientSecret
   not a PayNow URL. All confirmed against `/v3/api-docs` and the survey app's
   real network traffic.

---

## 5. Likely technical questions & answers

**Q: Where do I change the API base URL?**
`BASE` at the top of `src/api/client.js` (video: `VIDEO_API_BASE`, same file).

**Q: How do you know the OTP was verified / how do returning users skip it?**
Step 1's response has `user_exist`. `true` → straight to the flow. `false` →
OTP screen; verify calls `confirm-registration/using-email`.

**Q: What happens if the video AI finds nothing?**
The `complete` message has `success: false` / empty items → we surface
"No furniture detected in the recording" and the customer can re-scan, or use
"Skip — use standard preset" which loads editable preset items.

**Q: Is the payment PCI compliant?**
Yes — card data never touches our code or the Moversly backend. Stripe's
Payment Element (an iframe served by Stripe) collects it; we only handle the
clientSecret and the confirmation result.

**Q: Why is pricing called with data from the order-update response instead of
the form?**
Because the backend resolves ports/companies itself (e.g. "Mumbai" →
"Nhava Sheva"). Reusing its own resolution guarantees the pricing call matches
what's stored on the order.

**Q: What's not integrated?**
Nothing from the 8-step doc. Extras that could be added later: Google Places
autocomplete for the destination field (needs the client's Maps API key), and
a Stripe webhook/return-URL flow to confirm payment server-side instead of
trusting the in-page confirmation.
