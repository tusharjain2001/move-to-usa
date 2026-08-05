import React, { useState, useEffect, useRef } from "react";
import {
  analyzeVideoStream,
  updateOrderWithItems,
  getSeaPricing,
  getAirPricing,
  savePricingSplit,
  createPaymentIntent,
  getOrder,
  deepGet,
  loadStripe,
  CURRENCY,
  DEFAULT_SHIPMENT_MODE,
} from "../api/client.js";
import { toApiValues } from "../api/quote-values.js";

// Real-time booking flow for the quote band.
// Step 0: form (handled by QuoteBand outside) → triggers entry into this flow.
// Step 1: inventory (AI video survey + items OR box builder, depending on move type)
// Step 2: quote summary + T&Cs
// Step 3: payment
// Step 4: order confirmation

const BF_STEPS = ["Inventory", "Quote", "Payment", "Confirm"];

// ── Item presets ────────────────────────────────────────────────────────────
// `box` = AI detection bounding box on the camera frame, in % {x,y,w,h}
const HOUSEHOLD_PRESET = [
  { name: "3-seater sofa", qty: 1, vol: 1.6, conf: 98, box: { x: 5, y: 56, w: 35, h: 32 } },
  { name: "Dining table (6-seat)", qty: 1, vol: 1.2, conf: 96, box: { x: 39, y: 54, w: 25, h: 24 } },
  { name: "Dining chair", qty: 6, vol: 0.18, conf: 92, box: { x: 45, y: 47, w: 11, h: 16 } },
  { name: "Queen bed + mattress", qty: 1, vol: 2.4, conf: 97, box: { x: 60, y: 58, w: 35, h: 30 } },
  { name: "Wardrobe (large)", qty: 2, vol: 2.1, conf: 95, box: { x: 80, y: 16, w: 17, h: 42 } },
  { name: "Bookshelf", qty: 3, vol: 1.1, conf: 94, box: { x: 4, y: 16, w: 14, h: 38 } },
  { name: "TV (55\")", qty: 1, vol: 0.3, conf: 99, box: { x: 41, y: 18, w: 21, h: 16 } },
  { name: "Refrigerator", qty: 1, vol: 1.0, conf: 97, box: { x: 64, y: 14, w: 13, h: 36 } },
  { name: "Washing machine", qty: 1, vol: 0.6, conf: 93, box: { x: 21, y: 64, w: 15, h: 24 } },
  { name: "Moving carton", qty: 24, vol: 0.18, conf: 90, box: { x: 26, y: 24, w: 12, h: 16 } },
];

const PARTIAL_PRESET = [
  { name: "2-seater sofa", qty: 1, vol: 1.2, conf: 98, box: { x: 7, y: 55, w: 31, h: 31 } },
  { name: "Queen bed + mattress", qty: 1, vol: 2.4, conf: 97, box: { x: 58, y: 56, w: 35, h: 31 } },
  { name: "Wardrobe (medium)", qty: 1, vol: 1.5, conf: 95, box: { x: 80, y: 18, w: 16, h: 40 } },
  { name: "Bookshelf", qty: 2, vol: 1.1, conf: 94, box: { x: 6, y: 16, w: 14, h: 38 } },
  { name: "TV (43\")", qty: 1, vol: 0.25, conf: 99, box: { x: 40, y: 18, w: 21, h: 16 } },
  { name: "Moving carton", qty: 14, vol: 0.18, conf: 90, box: { x: 41, y: 58, w: 14, h: 20 } },
];

const BOX_SIZES = {
  S: { label: "Small",  dims: "40 × 30 × 30 cm", vol: 0.036 },
  M: { label: "Medium", dims: "55 × 40 × 40 cm", vol: 0.088 },
  L: { label: "Large",  dims: "65 × 50 × 50 cm", vol: 0.163 },
};

// ── Pricing helpers (live rates come from the API) ─────────────────────────
const fmtMoney = (n, currency) =>
  `${currency || CURRENCY} ${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Pull the total + line-item split out of the PricingSplit response.
// Each component carries a Money `price` object ({currency, amount}).
function normalizePricing(res) {
  const money = (m) => {
    if (m == null) return null;
    const n = typeof m === "object" ? Number(m.amount) : Number(m);
    return Number.isFinite(n) ? n : null;
  };
  const finalPrice = res.final_price || deepGet(res, ["final_price", "finalPrice"]);
  const total = money(finalPrice);
  const currency = (finalPrice && finalPrice.currency) || CURRENCY;
  const lines = [];
  const push = (label, m) => {
    const v = money(m);
    if (v !== null && v !== 0) lines.push({ label, value: v });
  };
  push("Ocean freight", (res.lcl_pricing && res.lcl_pricing.price) || (res.fcl_pricing && res.fcl_pricing.price));
  push("Packing", res.packer_pricing && res.packer_pricing.price);
  push("Trucking", res.trucker_pricing && res.trucker_pricing.price);
  push("Haulage", res.haulage && res.haulage.price);
  push("Destination charges", res.destination_agent_pricing && res.destination_agent_pricing.price);
  push("Cargo handling", res.cargo_handling);
  push("Warehouse handling", res.warehouse_handling);
  push("Material delivery", res.material_delivery);
  push("Margin", res.margin);
  // AIR responses (ValidPricingResponse) carry a single `price` Money instead.
  if (total === null && res.price) {
    return { total: money(res.price), currency: res.price.currency || CURRENCY, lines: [], raw: res };
  }
  return { total, currency, lines, raw: res };
}

// ── Step indicator ─────────────────────────────────────────────────────────
function BfStepIndicator({ step }) {
  return (
    <div className="bf-steps">
      {BF_STEPS.map((s, i) => (
        <div
          key={s}
          className={"bf-step" + (i === step ? " active" : "") + (i < step ? " done" : "")}
        >
          <span className="bf-step-n mono">
            {i < step ? "✓" : String(i + 1).padStart(2, "0")}
          </span>
          <span className="bf-step-l">{s}</span>
        </div>
      ))}
    </div>
  );
}

// ── AI Video Survey ─────────────────────────────────────────────────────────
// The AI service returns no frame coordinates, so detection tags are laid out
// on a grid over the camera frame purely for display.
const displayBox = (i) => ({
  x: 7 + (i % 3) * 31,
  y: 14 + (Math.floor(i / 3) % 3) * 27,
  w: 26,
  h: 21,
});

// Map an API item to the UI shape. The AI service has been seen returning two
// shapes: {name, dimensions, volume, weight} where volume is in CUBIC FEET, and
// {name, dimensions, quantity, volumeM3, volumeFt3, weightKg}. Handle both.
const FT3_PER_M3 = 35.3147;
const normalizeApiItem = (it, i) => {
  const volM3 =
    it.volumeM3 != null && it.volumeM3 !== "" ? Number(it.volumeM3)
    : it.volume_m3 != null ? Number(it.volume_m3)
    : it.volumeFt3 != null && it.volumeFt3 !== "" ? Number(it.volumeFt3) / FT3_PER_M3
    : it.volume != null ? Number(it.volume) / FT3_PER_M3
    : 0;
  return {
    name: it.name || "Item",
    qty: Number(it.qty || it.quantity) || 1,
    vol: Number.isFinite(volM3) ? Math.round(volM3 * 100) / 100 : 0,
    weightKg: Number(it.weightKg ?? it.weight_kg ?? it.weight) || 0,
    dimensions: it.dimensions || "",
    conf: it.confidence ? Math.round(Number(it.confidence)) : null,
    box: displayBox(i),
  };
};

// Pick a MediaRecorder format the browser supports (mp4 on Safari, webm elsewhere).
function pickRecorderMime() {
  if (!window.MediaRecorder) return "";
  const candidates = ["video/mp4", "video/webm;codecs=vp9", "video/webm"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

function VideoSurvey({ onComplete, preset }) {
  const [phase, setPhase] = useState("idle"); // idle, recording, analyzing, done
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);   // recording seconds
  const [detected, setDetected] = useState([]);
  const [removed, setRemoved] = useState(() => new Set());
  const [container, setContainer] = useState(""); // recommendedContainer from the AI
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  useEffect(() => stopCamera, []); // release the camera on unmount

  // Attach the live preview once the <video> element is rendered.
  useEffect(() => {
    if (phase === "recording" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  // Recording timer.
  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Animated progress while the upload/analysis request is in flight — the API
  // streams partial messages but no percentage, so it eases up to 92 and lands
  // on 100 when the "complete" message arrives.
  useEffect(() => {
    if (phase !== "analyzing") return;
    const tick = setInterval(() => setProgress((p) => Math.min(p + 1.4, 92)), 120);
    return () => clearInterval(tick);
  }, [phase]);

  // Step 3 — upload the recording and read the streamed analysis.
  const analyzeFile = async (file) => {
    setRemoved(new Set());
    setDetected([]);
    setError("");
    setProgress(0);
    setPhase("analyzing");
    try {
      const result = await analyzeVideoStream(file);
      const rawItems = deepGet(result, ["items", "Items"]) || [];
      setDetected(rawItems.map(normalizeApiItem));
      const rc = deepGet(result, ["recommendedContainer", "recommended_container"]);
      if (rc) setContainer(rc);
      setProgress(100);
      setPhase("done");
    } catch (err) {
      setError(err.message || "Video analysis failed. Please try again.");
      setProgress(0);
      setPhase("idle");
    }
  };

  const startRecording = async () => {
    setError("");
    const mime = pickRecorderMime();
    let stream;
    try {
      if (!mime) throw new Error("no recorder");
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
    } catch {
      // No camera, no permission, or no MediaRecorder — fall back to a file
      // picker (which opens the camera app on mobile).
      if (fileRef.current) fileRef.current.click();
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    const rec = new MediaRecorder(stream, { mimeType: mime });
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const type = mime.split(";")[0];
      const ext = type.includes("mp4") ? "mp4" : "webm";
      const file = new File([new Blob(chunksRef.current, { type })], `survey-recording.${ext}`, { type });
      stopCamera();
      if (file.size) analyzeFile(file);
      else { setPhase("idle"); setError("The recording came back empty. Please try again."); }
    };
    recorderRef.current = rec;
    setElapsed(0);
    setProgress(0);
    rec.start(500);
    setPhase("recording");
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  };

  const onVideoPicked = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (file) analyzeFile(file);
  };

  const removeItem = (i) =>
    setRemoved((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const kept = detected.filter((_, i) => !removed.has(i));
  const keptCount = kept.length;
  const interactive = phase === "done";
  const cameraOn = phase === "recording";
  const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bf-video">
      <div className="bf-video-stage">
        <div className="bf-video-cam">
          <div className="bf-video-grid" />
          {cameraOn && (
            <video ref={videoRef} className="bf-video-live" autoPlay playsInline muted />
          )}
          <div className="bf-video-scan" data-active={phase === "analyzing"} />

          {/* live AI detection boxes drawn over the camera frame */}
          <div className="bf-video-boxes">
            {detected.map((d, i) => {
              if (removed.has(i)) return null;
              return (
                <button
                  key={i}
                  type="button"
                  className="bf-bbox"
                  style={{
                    left: d.box.x + "%", top: d.box.y + "%",
                    width: d.box.w + "%", height: d.box.h + "%",
                    animationDelay: (i * 0.04) + "s",
                  }}
                  disabled={!interactive}
                  onClick={() => interactive && removeItem(i)}
                  title={interactive ? "Click to remove this item" : undefined}
                >
                  <span className="bf-bbox-tag mono">
                    <span className="bf-bbox-name">{d.name}{d.qty > 1 ? ` ×${d.qty}` : ""}</span>
                    <span className="bf-bbox-conf">{d.conf ? d.conf + "%" : "AI"}</span>
                  </span>
                  <span className="bf-bbox-remove mono">✕ Remove</span>
                </button>
              );
            })}
          </div>

          <div className="bf-video-corners">
            <span /><span /><span /><span />
          </div>
          <div className="bf-video-overlay">
            <span className="bf-video-status mono">
              <i className={"bf-dot " + phase} />
              {phase === "idle" && "READY · CAMERA OFF"}
              {phase === "recording" && "REC · WALKING THROUGH HOME"}
              {phase === "analyzing" && "AI · IDENTIFYING ITEMS"}
              {phase === "done" && "✓ SURVEY COMPLETE · TAP A BOX TO REMOVE"}
            </span>
            <span className="bf-video-tc mono">
              {phase === "analyzing" ? `${String(Math.floor(progress)).padStart(2, "0")}%` : clock(elapsed)}
            </span>
          </div>
          {phase !== "idle" && (
            <div className="bf-video-progress">
              <div className="bf-video-progress-bar" style={{ width: progress + "%" }} />
            </div>
          )}
        </div>

        <div className="bf-video-side">
          <div className="bf-video-side-h">
            <div className="text-mono-sm">AI · DETECTION FEED</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
              {keptCount}/{detected.length}
            </div>
          </div>
          <ul className="bf-detected">
            {phase === "idle" && (
              <li className="bf-detected-placeholder muted">
                Press start to walk through your home. AI will identify furniture and
                estimate shipping volume in real-time. Spot something you're not shipping?
                Tap its box on the video to remove it.
              </li>
            )}
            {detected.map((d, i) => {
              if (removed.has(i)) return null;
              return (
                <li key={i} className="bf-detected-item">
                  <span className="mono bf-detected-tag">{`#${String(i + 1).padStart(2, "0")}`}</span>
                  <span className="bf-detected-name">{d.name}</span>
                  <span className="mono muted">×{d.qty}</span>
                  <span className="mono bf-detected-vol">{d.vol.toFixed(2)} m³</span>
                  {interactive && (
                    <button
                      className="bf-detected-x"
                      onClick={() => removeItem(i)}
                      aria-label={"Remove " + d.name}
                      title="Remove"
                    >×</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bf-video-cta">
        {phase === "idle" && (
          <>
            <button className="btn primary" onClick={startRecording}>
              Start AI video survey <span className="arr">→</span>
            </button>
            <button className="btn ghost" onClick={() => onComplete(preset, "")}>
              Skip — use standard preset
            </button>
            {error && <div className="bf-api-error mono">{error}</div>}
          </>
        )}
        {phase === "recording" && (
          <button className="btn ghost" onClick={stopRecording}>
            Stop recording &amp; analyze →
          </button>
        )}
        {phase === "analyzing" && (
          <div className="bf-video-note mono">
            AI is identifying items in your walkthrough · this can take a moment.
          </div>
        )}
        {phase === "done" && (
          <>
            <button className="btn primary" disabled={kept.length === 0} onClick={() => onComplete(kept, container)}>
              Looks good — continue <span className="arr">→</span>
            </button>
            <div className="bf-video-note mono">
              {kept.length} item{kept.length === 1 ? "" : "s"} kept
              {removed.size > 0 ? ` · ${removed.size} removed` : ""} · Click a box to remove more.
            </div>
          </>
        )}
      </div>

      {/* Hidden video input — used when the browser has no camera access
          (opens the camera app on mobile, a file picker on desktop). */}
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={onVideoPicked}
      />
    </div>
  );
}

// ── Items editor (after video survey) ──────────────────────────────────────
function ItemsEditor({ items, setItems, onNext, onBack, busy, apiError }) {
  const totalVol = items.reduce((a, it) => a + it.qty * it.vol, 0);
  const totalQty = items.reduce((a, it) => a + it.qty, 0);
  const [draft, setDraft] = useState({ name: "", qty: 1, vol: 0.5 });

  const update = (i, k, v) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    setItems(next);
  };
  const remove = (i) => setItems(items.filter((_, x) => x !== i));
  const add = () => {
    if (!draft.name.trim()) return;
    setItems([...items, { ...draft, qty: Number(draft.qty), vol: Number(draft.vol) }]);
    setDraft({ name: "", qty: 1, vol: 0.5 });
  };

  return (
    <div className="bf-items">
      <div className="bf-items-hd">
        <div>
          <div className="text-mono-sm">AI · IDENTIFIED · {items.length} ITEM TYPES</div>
          <h4 className="bf-items-title mt-8">Review &amp; edit your inventory</h4>
        </div>
        <div className="bf-items-totals">
          <div className="bf-items-totals-card">
            <div className="text-mono-sm">SHIPPING VOLUME</div>
            <div className="bf-big-num">{totalVol.toFixed(1)} <span>m³</span></div>
          </div>
          <div className="bf-items-totals-card">
            <div className="text-mono-sm">TOTAL ITEMS</div>
            <div className="bf-big-num">{totalQty}</div>
          </div>
        </div>
      </div>

      <div className="bf-table">
        <div className="bf-table-head">
          <span>Item</span>
          <span>Qty</span>
          <span>Volume (m³ ea.)</span>
          <span>Subtotal</span>
          <span />
        </div>
        {items.map((it, i) => (
          <div key={i} className="bf-table-row">
            <input
              className="bf-cell-input"
              type="text"
              value={it.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
            <input
              className="bf-cell-input num"
              type="number"
              min="0"
              value={it.qty}
              onChange={(e) => update(i, "qty", Number(e.target.value))}
            />
            <input
              className="bf-cell-input num"
              type="number"
              step="0.05"
              min="0"
              value={it.vol}
              onChange={(e) => update(i, "vol", Number(e.target.value))}
            />
            <span className="bf-cell-sub mono">{(it.qty * it.vol).toFixed(2)} m³</span>
            <button className="bf-cell-x" onClick={() => remove(i)} aria-label="Remove">×</button>
          </div>
        ))}
        <div className="bf-table-row bf-table-add">
          <input
            className="bf-cell-input"
            type="text"
            placeholder="Add an item (e.g. Piano)"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <input
            className="bf-cell-input num"
            type="number"
            min="1"
            value={draft.qty}
            onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
          />
          <input
            className="bf-cell-input num"
            type="number"
            step="0.05"
            min="0"
            value={draft.vol}
            onChange={(e) => setDraft({ ...draft, vol: e.target.value })}
          />
          <span />
          <button className="bf-cell-add" onClick={add}>+ Add</button>
        </div>
      </div>

      {apiError && <div className="bf-api-error mono">{apiError}</div>}

      <div className="bf-nav">
        <button className="btn ghost" onClick={onBack} disabled={busy}>← Redo survey</button>
        <button className="btn primary" onClick={() => onNext(totalVol)} disabled={busy}>
          {busy ? "Saving your inventory…" : "Continue to quote"} <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}

// ── Box builder ────────────────────────────────────────────────────────────
function BoxBuilder({ boxes, setBoxes, onNext, busy, apiError }) {
  const [draft, setDraft] = useState({ size: "M", contents: "", weight: 5, qty: 1 });
  const totalVol = boxes.reduce((a, b) => a + b.qty * BOX_SIZES[b.size].vol, 0);
  const totalQty = boxes.reduce((a, b) => a + b.qty, 0);
  const totalWt = boxes.reduce((a, b) => a + b.qty * b.weight, 0);

  const add = () => {
    if (!draft.contents.trim()) return;
    setBoxes([...boxes, { ...draft, qty: Number(draft.qty), weight: Number(draft.weight) }]);
    setDraft({ size: "M", contents: "", weight: 5, qty: 1 });
  };
  const remove = (i) => setBoxes(boxes.filter((_, x) => x !== i));

  return (
    <div className="bf-boxes">
      <div className="bf-items-hd">
        <div>
          <div className="text-mono-sm">BOX · BY · BOX BUILDER</div>
          <h4 className="bf-items-title mt-8">Add the boxes you're shipping</h4>
        </div>
        <div className="bf-items-totals">
          <div className="bf-items-totals-card">
            <div className="text-mono-sm">TOTAL VOLUME</div>
            <div className="bf-big-num">{totalVol.toFixed(2)} <span>m³</span></div>
          </div>
          <div className="bf-items-totals-card">
            <div className="text-mono-sm">BOXES · WEIGHT</div>
            <div className="bf-big-num">{totalQty} <span>· {totalWt} kg</span></div>
          </div>
        </div>
      </div>

      <div className="bf-box-builder">
        <div className="bf-size-grid">
          {Object.entries(BOX_SIZES).map(([k, v]) => (
            <label
              key={k}
              className={"bf-size-card" + (draft.size === k ? " active" : "")}
            >
              <input
                type="radio"
                name="bf-size"
                checked={draft.size === k}
                onChange={() => setDraft({ ...draft, size: k })}
                style={{ position: "absolute", opacity: 0 }}
              />
              <div className="bf-size-icon" data-size={k}>
                <div className="bf-box-3d" />
              </div>
              <div className="bf-size-label">{v.label}</div>
              <div className="bf-size-dims mono">{v.dims}</div>
              <div className="bf-size-vol mono">{v.vol.toFixed(2)} m³ ea.</div>
            </label>
          ))}
        </div>

        <div className="bf-box-row">
          <label className="bf-box-cell">
            <span className="bf-box-cell-l">Contents</span>
            <input
              type="text"
              placeholder="e.g. Books, kitchenware"
              value={draft.contents}
              onChange={(e) => setDraft({ ...draft, contents: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
          </label>
          <label className="bf-box-cell short">
            <span className="bf-box-cell-l">Weight (kg)</span>
            <input
              type="number"
              min="0"
              value={draft.weight}
              onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
            />
          </label>
          <label className="bf-box-cell short">
            <span className="bf-box-cell-l">Quantity</span>
            <input
              type="number"
              min="1"
              value={draft.qty}
              onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
            />
          </label>
          <button className="btn primary bf-box-add" onClick={add}>
            + Add box
          </button>
        </div>

        {boxes.length > 0 && (
          <div className="bf-box-list">
            {boxes.map((b, i) => (
              <div key={i} className="bf-box-pill">
                <span className="bf-box-pill-size mono">{b.size}</span>
                <span className="bf-box-pill-contents">{b.contents}</span>
                <span className="mono muted">×{b.qty}</span>
                <span className="mono muted">{b.weight}kg ea.</span>
                <span className="mono">{(b.qty * BOX_SIZES[b.size].vol).toFixed(2)} m³</span>
                <button className="bf-cell-x" onClick={() => remove(i)} aria-label="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        {boxes.length === 0 && (
          <div className="bf-box-empty muted">
            No boxes added yet. Pick a size above, describe the contents, and add as many
            as you need.
          </div>
        )}
      </div>

      {apiError && <div className="bf-api-error mono">{apiError}</div>}

      <div className="bf-nav">
        <button className="btn primary" onClick={() => onNext(totalVol)} disabled={boxes.length === 0 || busy}>
          {busy ? "Saving your inventory…" : "Continue to quote"} <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}

// ── Quote summary ──────────────────────────────────────────────────────────
function QuoteSummary({ orderId, volume, moveType, values, meta, onPay, onBack }) {
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [quote, setQuote] = useState(null);   // normalized live pricing from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);  // bump to retry

  // Step 5 — fetch live pricing, then Step 6 — persist the split.
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const mode = values.mode || DEFAULT_SHIPMENT_MODE;
        const res = mode === "AIR"
          ? await getAirPricing(orderId)
          : await getSeaPricing(meta);
        try {
          await savePricingSplit(res);
        } catch (e) {
          console.warn("create-pricing-with-split failed:", e);
        }
        if (!alive) return;
        const norm = normalizePricing(res);
        if (norm.total == null) throw new Error("We couldn't read the price from the server. Please retry.");
        setQuote(norm);
      } catch (e) {
        if (alive) setError(e.message || "Could not fetch live pricing.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [orderId, attempt]);

  return (
    <div className="bf-quote">
      <div className="bf-quote-head">
        <div>
          <div className="text-mono-sm">YOUR LIVE QUOTE</div>
          <h4 className="bf-items-title mt-8">
            {moveType} · {values.origin} → {values.dest}
          </h4>
          <div className="muted mt-8" style={{ fontSize: 14 }}>
            Door-to-door · Sea freight · 26–34 days transit · 14-day price lock
          </div>
        </div>
        <div className="bf-quote-hero">
          <div className="text-mono-sm">TOTAL · ALL-IN</div>
          <div className="bf-quote-total mono">
            {loading ? "…" : quote ? fmtMoney(quote.total, quote.currency) : "—"}
          </div>
          <div className="bf-quote-vol mono">{volume.toFixed(1)} m³</div>
        </div>
      </div>

      <div className="bf-quote-grid">
        <div className="bf-quote-card">
          <div className="bf-quote-card-h">Cost breakdown</div>
          {loading && <div className="bf-video-note mono">Fetching live carrier rates…</div>}
          {!loading && error && (
            <>
              <div className="bf-api-error mono">{error}</div>
              <button className="btn ghost mt-16" onClick={() => setAttempt((a) => a + 1)}>
                Retry
              </button>
            </>
          )}
          {!loading && !error && quote && (
            <>
              <ul className="bf-breakdown">
                {quote.lines.map((l) => (
                  <li key={l.label}>
                    <span>{l.label}</span>
                    <span className="mono">{fmtMoney(l.value, quote.currency)}</span>
                  </li>
                ))}
                <li className="bf-total">
                  <span>Total</span>
                  <span className="mono">{fmtMoney(quote.total, quote.currency)}</span>
                </li>
              </ul>
              {quote.total <= 0 && (
                <div className="bf-api-error mono">
                  We couldn't calculate a live price for this route yet. Please check your
                  inventory volume, or contact us for a manual quote.
                </div>
              )}
            </>
          )}
        </div>

        <div className="bf-quote-card">
          <div className="bf-quote-card-h">What's included</div>
          <ul className="bf-incl">
            <li><span className="mono">✓</span> Export-grade packing materials</li>
            <li><span className="mono">✓</span> Professional packing &amp; loading</li>
            <li><span className="mono">✓</span> Ocean freight to US port</li>
            <li><span className="mono">✓</span> US customs clearance (CF-3299)</li>
            <li><span className="mono">✓</span> Destination delivery &amp; unpack</li>
            <li><span className="mono">✓</span> A-rated marine insurance</li>
            <li><span className="mono">✓</span> 14-day price lock guarantee</li>
            <li><span className="mono">✓</span> Real-time tracking dashboard</li>
          </ul>
        </div>
      </div>

      <label className="bf-terms">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          I agree to the{" "}
          <a href="#terms" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
            Terms &amp; Conditions
          </a>
          {" "}and the 14-day price lock policy.
        </span>
      </label>

      <div className="bf-nav">
        <button className="btn ghost" onClick={onBack}>← Edit inventory</button>
        <button
          className="btn primary"
          disabled={!agreed || loading || !quote || quote.total <= 0}
          onClick={() => quote && quote.total > 0 && onPay(quote.total, quote.currency)}
        >
          {quote && quote.total > 0 ? `Pay ${fmtMoney(quote.total, quote.currency)} & book` : "Pay & book"} <span className="arr">→</span>
        </button>
      </div>

      {showTerms && (
        <div className="bf-modal" onClick={(e) => e.target === e.currentTarget && setShowTerms(false)}>
          <div className="bf-modal-card card">
            <div className="between">
              <div className="text-mono-sm">TERMS &amp; CONDITIONS · v2026.02</div>
              <button className="bf-cell-x" onClick={() => setShowTerms(false)}>×</button>
            </div>
            <h3 className="h3 mt-16">Service agreement</h3>
            <div className="bf-terms-body muted">
              <p>
                <strong>1. Price lock.</strong> The quoted total is held for 14 calendar days from
                the date of payment. Carrier surcharges that arise after the lock period may
                affect final invoicing.
              </p>
              <p>
                <strong>2. Liability.</strong> Goods are insured under a Lloyd's-syndicated A-rated
                marine cargo policy at 110% of declared value. Excluded items: cash, jewellery
                above SGD 5,000, perishables.
              </p>
              <p>
                <strong>3. Cancellation.</strong> Full refund up to 7 days before pack day.
                25% retention 6–3 days. 50% within 48 hours. No refund after crew dispatch.
              </p>
              <p>
                <strong>4. Customs.</strong> US customs may inspect any shipment. Inspection
                fees, if levied by CBP, are passed through at cost.
              </p>
              <p>
                <strong>5. Delivery window.</strong> Transit times are estimates based on
                current carrier schedules. Demurrage and port congestion outside our control
                are not the basis for refund.
              </p>
              <p>
                Full agreement available at apacrelocation.com/terms — emailed with your
                booking confirmation.
              </p>
            </div>
            <button className="btn primary mt-24" onClick={() => setShowTerms(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payment ────────────────────────────────────────────────────────────────
// The payment-intent API returns a Stripe clientSecret; card and PayNow are
// completed in-page with Stripe's Payment Element.
function PaymentForm({ orderId, amount, currency, values, onConfirm, onBack }) {
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [pmType, setPmType] = useState("card"); // method selected INSIDE the Stripe element
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const peRef = useRef(null);
  const mountRef = useRef(null);
  const secretRef = useRef("");

  // (Re)create and mount the Payment Element; methodOrder controls which
  // payment method tab is pre-selected (first in the list).
  const mountElement = (methodOrder) => {
    if (!stripeRef.current || !secretRef.current) return;
    if (peRef.current) { try { peRef.current.destroy(); } catch { /* already gone */ } }
    elementsRef.current = stripeRef.current.elements({ clientSecret: secretRef.current });
    peRef.current = elementsRef.current.create("payment", { paymentMethodOrder: methodOrder });
    peRef.current.on("change", (e) => setPmType((e.value && e.value.type) || ""));
    if (mountRef.current) peRef.current.mount(mountRef.current);
  };

  // Step 7 — create the payment intent, then mount the Payment Element.
  useEffect(() => {
    let alive = true;
    (async () => {
      setError("");
      try {
        const res = await createPaymentIntent({
          orderId,
          email: values.email,
          name: values.name,
          amount,
          currency,
        });
        const secret = deepGet(res, ["clientSecret", "client_secret"]);
        if (!secret) throw new Error("The server didn't return a payment session. Please try again.");
        const stripe = await loadStripe();
        if (!stripe) {
          throw new Error(
            "Online payment isn't configured yet (Stripe publishable key missing). Please use bank transfer, or contact us."
          );
        }
        if (!alive) return;
        stripeRef.current = stripe;
        secretRef.current = secret;
        mountElement(["card", "paynow"]);
        setReady(true);
      } catch (e) {
        if (alive) setError(e.message || "Could not start the payment. Please try again.");
      }
    })();
    return () => { alive = false; };
  }, [orderId]);

  // Our method tiles pre-select the matching tab inside the Stripe element
  // (and re-mount it after switching away to bank transfer and back).
  useEffect(() => {
    if (method !== "card" && method !== "paynow") return;
    if (!ready) return;
    mountElement(method === "paynow" ? ["paynow", "card"] : ["card", "paynow"]);
    setPmType(method === "paynow" ? "paynow" : "card");
  }, [method, ready]);

  const payNow = async () => {
    if (processing || !stripeRef.current || !elementsRef.current) return;
    setProcessing(true);
    setError("");
    try {
      const { error: err, paymentIntent } = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (err) throw new Error(err.message);
      const status = paymentIntent && paymentIntent.status;
      if (status === "succeeded" || status === "processing" || status === "requires_capture") {
        onConfirm();
      } else {
        throw new Error("Payment wasn't completed. Please try again.");
      }
    } catch (e) {
      setError(e.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bf-pay">
      <div className="bf-pay-grid">
        <div className="bf-pay-main">
          <div className="bf-pay-head">
            <div className="text-mono-sm">SECURE PAYMENT · 256-BIT TLS</div>
            <h4 className="bf-items-title mt-8">Choose how to pay</h4>
          </div>

          <div className="bf-pay-methods">
            {[
              { id: "card", label: "Card", sub: "Visa · Mastercard · Amex" },
              { id: "paynow", label: "PayNow", sub: "Singapore" },
              { id: "bank", label: "Bank transfer", sub: "DBS / OCBC / UOB" },
            ].map((m) => (
              <label key={m.id} className={"bf-pay-method" + (method === m.id ? " active" : "")}>
                <input
                  type="radio"
                  name="bf-pay"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                />
                <div>
                  <div className="bf-pay-method-l">{m.label}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{m.sub}</div>
                </div>
              </label>
            ))}
          </div>

          {(method === "card" || method === "paynow") && (
            <div className="bf-card-form">
              {!ready && !error && (
                <div className="bf-video-note mono">Loading secure payment…</div>
              )}
              <div ref={mountRef} className="bf-stripe-mount" />
              {pmType === "paynow" && ready && (
                <div className="muted" style={{ fontSize: 13 }}>
                  Click <strong>"Show PayNow QR"</strong> below — your QR code will appear
                  on screen. Scan it with your bank app to complete payment.
                </div>
              )}
              {error && <div className="bf-api-error mono">{error}</div>}
              <div className="bf-nav">
                <button type="button" className="btn ghost" onClick={onBack}>← Back</button>
                <button className="btn primary" disabled={!ready || processing} onClick={payNow}>
                  {processing
                    ? "Processing…"
                    : pmType === "paynow"
                    ? `Show PayNow QR · ${fmtMoney(amount, currency)}`
                    : `Pay ${fmtMoney(amount, currency)} now`} <span className="arr">→</span>
                </button>
              </div>
            </div>
          )}

          {method === "bank" && (
            <div className="bf-bank">
              <ul className="bf-breakdown">
                <li><span>Beneficiary</span><span className="mono">APAC Relocation Pte Ltd</span></li>
                <li><span>Bank</span><span className="mono">DBS Bank</span></li>
                <li><span>Account</span><span className="mono">003-947-2810</span></li>
                <li><span>SWIFT</span><span className="mono">DBSSSGSG</span></li>
                <li className="bf-total"><span>Amount</span><span className="mono">{fmtMoney(amount, currency)}</span></li>
              </ul>
              <div className="muted mt-16" style={{ fontSize: 13 }}>
                Send confirmation to accounts@apacrelocation.com — your move manager will
                acknowledge within 4 working hours.
              </div>
              <div className="bf-nav mt-32">
                <button className="btn ghost" onClick={onBack}>← Back</button>
                <button className="btn primary" onClick={onConfirm}>I've initiated transfer</button>
              </div>
            </div>
          )}
        </div>

        <aside className="bf-pay-aside">
          <div className="text-mono-sm">ORDER SUMMARY</div>
          <ul className="bf-breakdown mt-16">
            <li><span>Move type</span><span className="mono">{values.size}</span></li>
            <li><span>From</span><span className="mono">{values.origin}</span></li>
            <li><span>To</span><span className="mono">{values.dest}</span></li>
            <li><span>Ready date</span><span className="mono">{values.date}</span></li>
            <li className="bf-total"><span>Total</span><span className="mono">{fmtMoney(amount, currency)}</span></li>
          </ul>
          <div className="bf-pay-trust">
            <div className="bf-pay-trust-row"><span className="mono">✓</span> 256-bit TLS encryption</div>
            <div className="bf-pay-trust-row"><span className="mono">✓</span> Stripe-tokenized cards</div>
            <div className="bf-pay-trust-row"><span className="mono">✓</span> Full refund · 7 days</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Confirmation ───────────────────────────────────────────────────────────
function Confirmation({ orderId, values, amount, currency, volume, onReset }) {
  // Step 8 — pull the finalized order; fall back to local state if it fails.
  const [order, setOrder] = useState(null);
  useEffect(() => {
    let alive = true;
    getOrder(orderId)
      .then((res) => { if (alive) setOrder(res); })
      .catch(() => {});
    return () => { alive = false; };
  }, [orderId]);

  const shownVolume = Number(deepGet(order || {}, ["totalVolume", "total_volume"])) || volume;

  return (
    <div className="bf-confirm">
      <div className="bf-confirm-mark">
        <svg viewBox="0 0 64 64" width="64" height="64">
          <circle cx="32" cy="32" r="30" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <path d="M20 33 L29 42 L46 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-mono-sm">BOOKING CONFIRMED</div>
      <h3 className="bf-confirm-h">
        You're booked, {values.name?.split(" ")[0] || "friend"}.
      </h3>
      <p className="lede" style={{ maxWidth: "52ch" }}>
        Your move manager will email <span className="mono">{values.email || "you"}</span>{" "}
        within 4 working hours with your pack-day plan, customs paperwork, and tracking
        dashboard credentials.
      </p>

      <div className="bf-confirm-card">
        <div className="bf-confirm-row">
          <div className="text-mono-sm">ORDER ID</div>
          <div className="mono bf-confirm-big">{orderId}</div>
        </div>
        <div className="bf-confirm-grid">
          <div><div className="text-mono-sm">FROM → TO</div><div className="mono mt-8">{values.origin} → {values.dest}</div></div>
          <div><div className="text-mono-sm">MOVE TYPE</div><div className="mono mt-8">{values.size}</div></div>
          <div><div className="text-mono-sm">VOLUME</div><div className="mono mt-8">{shownVolume.toFixed(1)} m³</div></div>
          <div><div className="text-mono-sm">READY DATE</div><div className="mono mt-8">{values.date}</div></div>
          <div><div className="text-mono-sm">PAID</div><div className="mono mt-8">{fmtMoney(amount, currency)}</div></div>
          <div><div className="text-mono-sm">SURVEY SLOT</div><div className="mono mt-8">Next 48h</div></div>
        </div>
      </div>

      <div className="bf-confirm-next">
        <div className="text-mono-sm">WHAT HAPPENS NEXT</div>
        <ol className="bf-confirm-steps mt-16">
          <li><span className="mono">01</span> Confirmation email + dashboard link · within 4h</li>
          <li><span className="mono">02</span> Move manager call · within 48h</li>
          <li><span className="mono">03</span> Customs paperwork · 2 weeks before pack</li>
          <li><span className="mono">04</span> Pack day · crew arrives 09:00 SGT</li>
        </ol>
      </div>

      <div className="bf-nav center">
        <button className="btn ghost" onClick={onReset}>Book another move</button>
      </div>
    </div>
  );
}

// ── Flow controller ────────────────────────────────────────────────────────
function BookingFlow({ values, orderId, onReset }) {
  const moveType = values.size;
  const useBoxes = moveType === "Few Boxes";

  const [step, setStep] = useState(0); // 0=inventory, 1=quote, 2=payment, 3=confirmed
  const [items, setItems] = useState(
    moveType === "Partial Household" ? PARTIAL_PRESET : HOUSEHOLD_PRESET
  );
  const [boxes, setBoxes] = useState([]);
  const [surveyDone, setSurveyDone] = useState(false);
  const [volume, setVolume] = useState(0);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(CURRENCY); // from the live pricing response
  const [container, setContainer] = useState("");     // recommendedContainer from the AI survey
  const [meta, setMeta] = useState(null);             // ports/companies from the order-update API
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // sub-state for full/partial: video survey vs items editor
  const showVideo = !useBoxes && !surveyDone;

  // Step 4 — push the inventory onto the order, then move to the live quote.
  const submitInventory = async (list, vol) => {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await updateOrderWithItems({
        orderId,
        values: toApiValues(values),
        items: list,
        totalVolumeM3: vol,
        recommendedContainer: container,
      });
      // The response carries resolved ports, container type, and freight/destination
      // companies — it's the ready-made request body for the pricing call (Step 5).
      setMeta(res);
      setVolume(vol);
      setStep(1);
    } catch (e) {
      setSaveError(e.message || "Couldn't save your inventory. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Boxes → the same item shape the order-update API expects. The "×" and the
  // "cm" suffix in BOX_SIZES.dims are normalized by the client's cleanDims().
  const boxesAsItems = () =>
    boxes.map((b) => ({
      name: `${BOX_SIZES[b.size].label} box — ${b.contents}`,
      qty: b.qty,
      vol: BOX_SIZES[b.size].vol,
      weightKg: b.weight,
      dimensions: BOX_SIZES[b.size].dims,
    }));

  return (
    <div className="bf">
      <BfStepIndicator step={step} />

      {step === 0 && useBoxes && (
        <BoxBuilder
          boxes={boxes}
          setBoxes={setBoxes}
          busy={saving}
          apiError={saveError}
          onNext={(v) => submitInventory(boxesAsItems(), v)}
        />
      )}

      {step === 0 && !useBoxes && showVideo && (
        <VideoSurvey
          preset={moveType === "Partial Household" ? PARTIAL_PRESET : HOUSEHOLD_PRESET}
          onComplete={(detected, recommended) => {
            setItems(detected);
            if (recommended) setContainer(recommended);
            setSurveyDone(true);
          }}
        />
      )}

      {step === 0 && !useBoxes && !showVideo && (
        <ItemsEditor
          items={items}
          setItems={setItems}
          busy={saving}
          apiError={saveError}
          onNext={(v) => submitInventory(items, v)}
          onBack={() => setSurveyDone(false)}
        />
      )}

      {step === 1 && (
        <QuoteSummary
          orderId={orderId}
          volume={volume}
          moveType={moveType}
          values={values}
          meta={meta}
          onPay={(amt, cur) => { setAmount(amt); if (cur) setCurrency(cur); setStep(2); }}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <PaymentForm
          orderId={orderId}
          amount={amount}
          currency={currency}
          values={values}
          onConfirm={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Confirmation
          orderId={orderId}
          values={values}
          amount={amount}
          currency={currency}
          volume={volume}
          onReset={onReset}
        />
      )}
    </div>
  );
}

export { BookingFlow };
