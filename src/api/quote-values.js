// Adapts the quote form's display values to what the API expects.
//
// The "Moving to" field captures "City, State" (this site only ships to the
// USA), but the backend reads the last comma-separated part of the address as
// the country — so "San Francisco, CA" would be filed under country "CA".
// Swap a trailing US state (code or full name) for "United States" in the
// payload only; the UI keeps showing exactly what the customer typed.

const STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC", "PR", "GU", "VI", "AS", "MP",
]);

const STATE_NAMES = new Set([
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
  "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
  "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine",
  "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
  "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey",
  "new mexico", "new york", "north carolina", "north dakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
  "south dakota", "tennessee", "texas", "utah", "vermont", "virginia",
  "washington", "west virginia", "wisconsin", "wyoming",
  "district of columbia", "puerto rico", "guam", "us virgin islands",
]);

const USA_ALIASES = new Set([
  "usa", "us", "u.s.", "u.s.a.", "america", "united states",
  "united states of america",
]);

export const US_COUNTRY = "United States";

// "San Francisco, CA" → "San Francisco, United States"
// "New York, NY, USA" → "New York, NY, United States"
// "Sydney, Australia"  → unchanged
export function destForApi(dest) {
  const parts = (dest || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return (dest || "").trim();
  const last = parts[parts.length - 1];
  const lower = last.toLowerCase();
  const isUs =
    STATE_CODES.has(last.toUpperCase().replace(/\./g, "")) ||
    STATE_NAMES.has(lower) ||
    USA_ALIASES.has(lower);
  if (!isUs) return parts.join(", ");
  return [...parts.slice(0, -1), US_COUNTRY].join(", ");
}

// The object every client.js call should be handed — never the raw form state.
export function toApiValues(values) {
  return { ...values, dest: destForApi(values.dest) };
}
