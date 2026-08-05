# Port this API integration into another project

The whole "Get Quote" integration lives in **one UI-agnostic file**: `src/api/client.js`.
Every component only imports functions from it. So porting = copy that file + wire the
same 8 calls into the other project's existing screens.

## What to copy

1. `src/api/client.js` — copy **verbatim**. Nothing in it is specific to this site.
2. `docs/API-INTEGRATION-PLAN.md` — the call-by-call spec (endpoints, payload quirks,
   what was verified against the live API).
3. `docs/PORT-TO-ANOTHER-PROJECT.md` — this file.
4. `.env` → `VITE_GOOGLE_PLACES_API_KEY=...` (only needed if the other project uses
   address autocomplete).

Put 1 in `src/api/client.js` of the new project and 2–3 in its `docs/`.

## Prompt to give Claude Code in the other project

> I've copied `src/api/client.js` and `docs/API-INTEGRATION-PLAN.md` from another
> project that already has this integration working end-to-end against
> `https://api.moversly.com`. Read both files first.
>
> Integrate the exact same 8-step booking flow into this project's existing quote /
> booking section, using `src/api/client.js` **as-is** — do not rewrite the client,
> do not change endpoints, payload shapes, or the constants at the top of the file.
> The API layer is already verified working; only the UI wiring is new.
>
> Rules:
> - **Do not change any design, layout, copy, or styling.** Only replace fake/simulated
>   logic behind the existing screens with the real calls.
> - Thread one `order_id` (from step 1) through steps 4–8.
> - Add loading + error states on every call using the existing button/disabled styles.
> - Keep the same defaults: `CURRENCY = "SGD"`, `DEFAULT_SHIPMENT_MODE = "SEA"`,
>   `DEFAULT_SHIPMENT_TYPE = "CONSOLE"`, `TEST_LEAD = true`.
> - Do not "improve" payloads. The comments in `client.js` document backend quirks that
>   cause hard failures if changed (see "Non-negotiables" below).
>
> Before writing code, map this project's existing screens to the 8 steps and show me
> the mapping.

## The 8 steps (what to wire where)

| # | Screen | Call from `client.js` |
|---|---|---|
| 1 | Quote form submit | `createOrderForPricing(values)` → returns `order_id`, `user_exist` |
| 2 | OTP screen | `confirmRegistration(code, email)` / `resendConfirmationCode(email)` |
| 3 | Video survey | `analyzeVideoStream(file, onMessage)` → SSE, use the `complete` message |
| 4 | Items editor → continue | `updateOrderWithItems({orderId, values, items, totalVolumeM3, recommendedContainer})` |
| 5 | Quote summary | `getSeaPricing(step4Response)` or `getAirPricing(orderId)` |
| 6 | (background, after 5) | `savePricingSplit(step5Response)` |
| 7 | Payment | `createPaymentIntent({orderId, email, name, amount, currency})` → Stripe `clientSecret`, pay in-page with `loadStripe()` + Payment Element |
| 8 | Confirmation | `getOrder(orderId)` |

Standalone (not part of the flow): `getApacPricing({...})` powers the live price
calculator, and `loadGoogleMaps()` powers address autocomplete.

`deepGet(obj, names)` is the helper used to pull fields out of the API's nested/
inconsistently-named responses — reuse it instead of hardcoding response paths.

## Non-negotiables (these break the backend if changed)

- Step 1 must send `order_id: ""`, `items: []`, `volume: {unit: "CUBIC_M"}` — otherwise
  the backend returns `PRO_ERR_008`.
- `moving_date` is **epoch milliseconds as a number**, not an ISO string.
- Item `dimensions` must be `L x W x H` — lowercase `x`, no unit suffix. `×` or a
  trailing `cm` throws `IllegalArgumentException` server-side (`cleanDims` handles it).
- Step 6 takes only the **subset** of the step-5 response listed in `savePricingSplit`.
  Sending the full object causes a server NPE.
- Step 5 chatbot pricing takes the step-4 response **verbatim** — it already carries the
  resolved ports, container type, and freight/destination companies.
- Volume units differ per endpoint: `CUBIC_M` in steps 1/4, `CUBIC_FT` in pricing.
- Step 7 returns a Stripe `clientSecret`, **not** a PayNow URL. Card + PayNow are both
  completed in-page via Stripe Payment Element.
- Video analysis is on a **different host**
  (`https://furniture-volume-calculator.eigenai.co`), FormData fields `file` + `model`.

## Data shapes the UI must produce

Items passed to `updateOrderWithItems` need this shape (the client converts them):

```js
{ name, dimensions: "120 x 60 x 75", qty: 1, vol: 0.54 /* m³ per unit */,
  weightKg: 45 /* optional — falls back to 110 kg/m³ */, room: "Living Room" /* optional */ }
```

`values` (the quote form) needs: `name, email, phone, origin, dest, date, size, mode`,
where `origin`/`dest` are `"City, Country"` strings and `size` is one of
`"Full Household" | "Partial Household" | "Few Boxes"`.

## If the other project isn't React/Vite

`client.js` is plain ES modules + `fetch` — it works anywhere. Only two things are
Vite-specific:
- `import.meta.env.VITE_GOOGLE_PLACES_API_KEY` in `loadGoogleMaps()`
- `loadGoogleMaps()` / `loadStripe()` inject `<script>` tags, so they need a browser DOM.
