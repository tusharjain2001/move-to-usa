# API Integration Plan — "Get Quote" Section (Quote Band + Booking Flow)

Scope: **Section 2 only** — the "INSTANT · QUOTE · 01" band under the hero
(`src/components/hero.jsx` → `QuoteBand`, `OtpGate`) and the booking flow it opens
(`src/components/booking-flow.jsx`). **Design/UI stays exactly the same** — only the
fake/simulated logic behind each screen is replaced with real API calls.

---

## Current flow vs. what gets integrated

| # | UI screen (existing, unchanged) | Currently | API to integrate |
|---|---|---|---|
| 1 | Quote form — origin, destination, date, move type, name, email, phone → **"Get my quote"** button | Just switches to OTP screen, nothing saved | `POST /api/v1/order/create-order-for-pricing` (Step 1 — create order, triggers OTP email, returns `order_id`) |
| 2 | OTP verification screen (6-digit boxes) | Fake — random code shown on screen ("DEMO CODE") | `POST /api/v1/auth/confirm-registration/using-email` (verify) + `POST /api/v1/auth/resend-confirmation-code/using-email` ("Resend code" link) |
| 3 | AI Video Survey screen (room scan, detected items list) | Fully simulated — hardcoded item presets per room, fake progress bars | `POST /api/analyze-video-stream` (upload video binary, read streamed response, use only the `"type": "complete"` message → `items[]`, `totalVolume`, `recommendedContainer`) |
| 4 | Items editor ("Review & edit your inventory") → **"Continue to quote"** | Only local state, totals computed in browser | `POST /api/v1/order/create-order-for-pricing` again (Step 4 — same `order_id`, now with `items`, `volume`, `totalVolume`, `totalWeight`, `recommendedContainer`) → returns `container_type`, `freight_company_name`, `destination_company_name` |
| 5 | Quote summary (total + cost breakdown card) | Local `pricing()` formula (fake numbers) | **SEA:** `POST /api/v1/order/get-pricing-with-split-for-chatbot` (uses `freight_company_name` / `destination_company_name` from step 4). **AIR:** `POST /api/v1/order/pricing/air-shipment?orderId=…` — breakdown (Freight / Destination / Packing / Trucking / Haulage / Margin) rendered into the existing breakdown list |
| 6 | (Background — right after step 5 succeeds, no UI) | — | `POST /api/v1/order/create-pricing-with-split` — persist the pricing split (payload = step-5 response, verbatim) |
| 7 | Payment screen ("Pay … & book") | Fake `setTimeout` then success | `POST /api/v1/order/survey-app/payment-intent` `{orderId, email, name, amount:{currency:"SGD", amount}}` → card / PayNow URL, open it for the customer |
| 8 | Confirmation screen (Order ID, summary grid) | Random `APX-xxxxx` ID | `GET /api/v1/order/{order_id}` — real order ID, route, volume, amount paid, dates |

---

## Detailed call-by-call mapping

### 1. Create order — on "Get my quote"
`POST /api/v1/order/create-order-for-pricing`

Form field → payload mapping:

| Payload field | Source in UI |
|---|---|
| `name` / `email` / `phone` | Name / Email / Phone inputs |
| `origin_country` | `"Malaysia"` (origin select is always a Malaysian city) |
| `origin_address` | Selected origin city (e.g. "Kuala Lumpur, Malaysia") |
| `origin_postal_code` | ⚠️ no field in the form — send empty / derive per city (see Open Questions) |
| `destination_country` | Parsed from "Moving to" text ("Sydney, Australia" → "Australia") |
| `destination_address` | Full "Moving to" value |
| `destination_postal_code` | ⚠️ no field — empty (see Open Questions) |
| `moving_date` | Date input |
| `shipment_mode` | ⚠️ no field — default `"SEA"` (see Open Questions) |
| `shipment_type` | Default `"CONSOLE"`; switch to `"FCL"` if the API's `recommendedContainer` says so later |
| `need_packing` | Default `true` |
| `moving_type` | Move type select: Full Household → `FULL_HOUSEHOLD`, Partial Household → `PARTIAL_HOUSEHOLD`, Few Boxes → `FEW_BOXES` |

Store `order_id` from the response in flow state — reused in steps 4–8.

Basic validation added before the call (required fields, email format) with an inline
error message — no design change, just prevents empty submits.

### 2. OTP — on the existing OTP screen
- The screen's copy currently says "sent by SMS to <phone>" — the API sends the OTP
  **by email**, so the masked value shown becomes the email (tiny copy fix, same design).
- The "DEMO CODE" pill is removed (it displays the fake code — can't exist with a real OTP).
- Verify button → `POST /api/v1/auth/confirm-registration/using-email` with
  `{ code: <entered digits>, user_name: <email> }`. Success → enter booking flow;
  failure → the existing red error state.
- "Resend code" link → `POST /api/v1/auth/resend-confirmation-code/using-email`.
- **Returning users:** OTP is only sent to *new* users. If the create-order response
  indicates an existing/confirmed user, skip the OTP screen and go straight to the flow.

### 3. Video survey — on the existing survey screen
`POST /api/analyze-video-stream` (binary video upload, streamed response)

- The room-chip UI stays; each "scan" becomes: pick/record a video → upload →
  the existing "AI · DETECTING" progress animation plays while the stream comes in.
- Only the streamed message with `"type": "complete"` is used; its `items[]` populate
  the detected-items panel (name, dimensions, volumeM3/Ft3, weightKg), and
  `totalVolume` (CBM) + `recommendedContainer` are stored for steps 4–5.
- "Skip — use standard preset" keeps working (preset items go into the editor as today).
- The **Box Builder** path (Few Boxes) needs no video call — its boxes are converted
  into the `items[]` shape for step 4.

### 4. Update order with inventory — on "Continue to quote"
`POST /api/v1/order/create-order-for-pricing` (same endpoint, now **with `order_id`**)

- Full payload resent + `items[]` (name, dimensions, volumeFt3, volumeM3, weightKg),
  `volume {magnitude, unit: "CUBIC_M"}`, `totalVolume`, `totalVolumeFt3`,
  `totalWeight`, `recommendedContainer`.
- Response gives `container_type`, `freight_company_name`,
  `destination_company_name`, updated volume — stored for pricing.

### 5. Pricing — when the quote summary screen opens
- **SEA** → `POST /api/v1/order/get-pricing-with-split-for-chatbot` with `order_id`,
  ports/cities, volume (`CUBIC_FT`), `container_type`, `shipment_type`,
  `freight_company` + `destination_company` from step 4,
  `direct_loading:false, is_edited:false, from_survey_app:false`.
- **AIR** → `POST /api/v1/order/pricing/air-shipment?orderId=…` (no payload).
- The local `pricing()` function is removed; the existing breakdown card renders the
  API's split: Freight, Destination, Packing, Trucking, Haulage, Margin and
  `final_price` as the big total. A loading state shows while fetching.

### 6. Save pricing split — immediately after step 5 succeeds
`POST /api/v1/order/create-pricing-with-split` — body is the step-5 response, unchanged.
Invisible to the user.

### 7. Payment — on "Pay & book"
`POST /api/v1/order/survey-app/payment-intent`
`{ orderId, email, name, amount: { currency: "SGD", amount: <final_price> } }`

- Returns the card / PayNow payment URL → opened for the customer.
- The existing method cards stay visually, but map to what the API supports
  (Card + PayNow). See Open Questions re: DuitNow/bank-transfer tiles.

### 8. Confirmation — after payment
`GET /api/v1/order/{order_id}` — real order ID, pricing, and shipment info fill the
existing confirmation card (replaces the random `APX-xxxxx`).

---

## Code changes (no design changes)

- **New:** `src/api/client.js` — small fetch wrapper (base URL from `VITE_API_BASE_URL`
  in `.env`, JSON handling, error normalization) and one function per endpoint.
- **`hero.jsx`:** wire `QuoteBand` submit to create-order; rewire `OtpGate` to the two
  auth endpoints (remove demo-code logic, email instead of SMS copy).
- **`booking-flow.jsx`:** thread `order_id` through the flow; real video upload in
  `VideoSurvey`; API items into `ItemsEditor`; API pricing into `QuoteSummary`;
  payment-intent in `PaymentForm`; real order fetch in `Confirmation`.
- Loading + error states on every call using existing button/disabled styles.

---

## Verified against the live API (2026-07-14)

Tested end-to-end with real calls to `https://api.moversly.com` (hardcoded in
`src/api/client.js`; spec at `/v3/api-docs`):

- **Step 1 create-order — WORKS** once the payload includes `order_id: ""`,
  `items: []`, `volume: {unit:"CUBIC_M"}`, and `moving_date` as **epoch millis**.
  Response carries `order_id` + `user_exist` (true → skip OTP).
- **Step 4 update-order — WORKS**; response returns resolved `origin_port`,
  `destination_port`, `container_type` (e.g. `FT_20`), `freight_company`,
  `destination_company`, and volume in `CUBIC_FT` — it is passed **verbatim**
  into Step 5.
- **Step 5 chatbot pricing — WORKS** (test quote: SGD 5,280.00). All split lines
  are `Money` objects (`fcl/lcl_pricing.price`, `packer_pricing.price`,
  `trucker_pricing.price`, `haulage.price`, `destination_agent_pricing.price`,
  `margin`, `final_price`).
- **Step 6 create-pricing-with-split — WORKS** with the minimal payload the
  working site sends (`order_id`, `volume`, `container_type`, `shipment_type`,
  `origin_port`, `destination_port`, `final_price`, `from_survey_app: true`).
  Sending the full step-5 response causes an NPE. Verified: returns
  `status: "COMPLETED"` + `pricing_split_id`.
- **Step 7 payment-intent — WORKS but returns a Stripe `clientSecret`**, not a
  PayNow URL. Payment is done in-page with Stripe Payment Element (card + PayNow),
  using the same publishable key as the working survey app
  (`pk_live_A4pq…`, set in `src/api/client.js`).
- **Step 8 GET order — WORKS.**
- **Step 3 video analysis** lives on a separate AI service:
  `https://furniture-volume-calculator.eigenai.co/api/analyze-video-stream`
  (found in the survey app bundle). FormData fields: `file` (video) +
  `model: "gemini-2.5-flash"`. Response is SSE (`data: {json}` lines) with
  `type: partial | complete | error`; items carry
  `{name, dimensions, quantity, volumeFt3, volumeM3, weightKg}`. CORS is open.

## Status: IMPLEMENTED (2026-07-14)

All eight steps are integrated. Defaults chosen for the open questions below —
each is a one-line change in `src/api/client.js`:

- Base URL: `VITE_API_BASE_URL` in `.env` (currently empty = same origin). **Must be set.**
- Postal codes: sent as empty strings.
- Shipment mode/type: `SEA` / `CONSOLE` (`DEFAULT_SHIPMENT_MODE`, `DEFAULT_SHIPMENT_TYPE`).
- Currency: `SGD` everywhere in the flow (`CURRENCY` constant).
- Payment: card + PayNow both open the hosted payment URL from the payment-intent
  API; the inline card form was replaced with a secure-redirect step (we can't
  collect card numbers we don't process). Bank transfer tile kept as manual
  instructions. DuitNow tile relabelled to PayNow.
- Video: hidden `<input type="file" accept="video/*" capture="environment">` —
  camera on mobile, file picker on desktop. Uploaded as `FormData` field `video`.
- Items with no weight from the AI get an estimated 110 kg/m³ fallback.
- Existing users: if create-order returns `is_new_user: false` the OTP screen is
  skipped; an "already confirmed" error on verify also passes through.

## Open questions for the client (blockers/decisions)

1. **API base URL(s)** — what host for `/api/v1/...`, and is `/api/analyze-video-stream`
   on the same host? Any API key / auth header?
2. **Postal codes & full addresses** — the quote form only captures city-level
   origin/destination. Send empty postal codes, or should two small fields be added?
3. **Shipment mode** — no AIR/SEA/ROAD choice in the form. Default everything to SEA,
   or infer/add a selector?
4. **Currency** — payment intent doc says `SGD`, but the UI displays `RM`. Which is it?
5. **Payment methods** — API provides card + PayNow. Keep the DuitNow/bank-transfer
   tiles (mapped to PayNow) or hide them?
6. **Video source** — record live from camera in the browser, or let users pick a
   video file (or both)?
7. **Existing users** — exact create-order response shape for an already-registered
   email, so the OTP screen can be skipped correctly.
