"use client";
import { useState, useEffect } from "react";
import type { Section } from "@/lib/exercises";

const BG = "#0E0E10";
const CARD_BG = "#111114";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const T1 = "#F0EDE8";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const T2 = "#D0C8BC";
const F = "'Outfit', system-ui, sans-serif";

const PREBLAST_TYPES = ["Bootcamp","Run","Bike","Ruck","Mobility","Gear","QSource","2nd F","3rd F","CSAUP","Convergence"];
const DEFAULT_TYPE = "Bootcamp";

export interface AttachedBeatdown {
  id: string;
  title: string;
  duration?: string | null;
  difficulty?: string | null;
  sections?: Array<{
    label: string;
    color?: string;
    exercises: Array<{ name: string; reps?: string | null; cadence?: string | null; }>;
  }>;
}

export interface UserBeatdown {
  id: string;
  nm: string;
  desc: string;
  secs: Section[];
  tg: string[];
  dur?: string | null;
}

interface PreblastComposerProps {
  onClose: () => void;
  qName: string;
  ao: string;
  attachedBeatdown?: AttachedBeatdown | null;
  userBeatdowns?: UserBeatdown[];
}

function formatWhen(isoLocal: string): string {
  if (!isoLocal) return "";
  const d = new Date(isoLocal);
  if (isNaN(d.getTime())) return isoLocal;
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = days[d.getDay()];
  const mo = months[d.getMonth()];
  const dt = d.getDate();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m < 10 ? "0" + m : "" + m;
  return day + " - " + mo + " " + dt + " - " + h + ":" + mm + ampm;
}

function toAttached(bd: UserBeatdown): AttachedBeatdown {
  const difficulty = (bd.tg || []).find(t => /BEAST|HARD|MOD|EASY|EPIC|GUT/i.test(t)) || null;
  return {
    id: bd.id,
    title: bd.nm,
    duration: bd.dur || null,
    difficulty: difficulty,
    sections: (bd.secs || []).map(s => ({
      label: s.label,
      color: s.color,
      exercises: (s.exercises || []).map(ex => ({
        name: ex.n || ex.name || "",
        reps: ex.r || null,
        cadence: ex.c || null,
      })),
    })),
  };
}

function buildPreblastText(args: {
  type: string; message: string; qName: string; ao: string;
  whenIso: string | null; locationText: string | null; beatdown: AttachedBeatdown | null;
}): string {
  const { type, message, qName, ao, whenIso, locationText, beatdown } = args;
  const lines: string[] = [];
  lines.push("📣 " + type.toUpperCase() + " - " + (qName || "Q") + " - " + (ao || "F3"));
  lines.push("");
  if (whenIso) lines.push("📅 " + formatWhen(whenIso));
  if (locationText) {
    const isUrl = locationText.startsWith("http://") || locationText.startsWith("https://");
    if (isUrl) {
      lines.push("📍");
      lines.push(locationText);
    } else {
      lines.push("📍 " + locationText);
    }
  }
  if (whenIso || locationText) lines.push("");
  if (message.trim()) { lines.push(message.trim()); lines.push(""); }
  if (beatdown && beatdown.sections && beatdown.sections.length > 0) {
    const meta: string[] = [];
    if (beatdown.duration) meta.push(beatdown.duration);
    if (beatdown.difficulty) meta.push(beatdown.difficulty);
    const metaStr = meta.length > 0 ? " (" + meta.join(" - ") + ")" : "";
    lines.push("💪 THE PLAN: " + beatdown.title + metaStr);
    lines.push("-------------------------");
    for (const sec of beatdown.sections) {
      lines.push(sec.label.toUpperCase());
      for (const ex of sec.exercises) {
        const parts: string[] = [];
        if (ex.reps) parts.push(ex.reps);
        parts.push(ex.name);
        if (ex.cadence) parts.push(ex.cadence);
        lines.push("  - " + parts.join(" "));
      }
      lines.push("");
    }
  } else if (beatdown) {
    lines.push("Beatdown: " + beatdown.title);
    lines.push("");
  }
  lines.push("—");
  lines.push("via GloomBuilder");
  lines.push("gloombuilder.app");
  return lines.join("\n");
}

export default function PreblastComposer({ onClose, qName, ao, attachedBeatdown, userBeatdowns }: PreblastComposerProps) {
  const [type, setType] = useState<string>(DEFAULT_TYPE);
  const [customType, setCustomType] = useState<string>("");
  const [showTypeGrid, setShowTypeGrid] = useState(false);
  const [editingCustom, setEditingCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [whenIso, setWhenIso] = useState<string | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [bdAttached, setBdAttached] = useState<AttachedBeatdown | null>(attachedBeatdown || null);
  const [showBdPicker, setShowBdPicker] = useState(false);
  const [view, setView] = useState<"form" | "preview">("form");
  const [copied, setCopied] = useState(false);

  const effectiveType = editingCustom ? customType.trim() : type;
  const canGenerate = !!effectiveType && !editingCustom && message.trim().length > 0 && message.length <= 240;

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  function handlePickType(t: string) {
    if (t === "Custom") {
      setEditingCustom(true);
      setShowTypeGrid(false);
    } else {
      setType(t);
      setEditingCustom(false);
      setCustomType("");
      setShowTypeGrid(false);
    }
  }

  function commitCustomType() {
    const trimmed = customType.trim();
    if (trimmed) { setType(trimmed); setEditingCustom(false); }
  }

  const previewText = buildPreblastText({
    type: effectiveType, message, qName, ao, whenIso, locationText, beatdown: bdAttached,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = previewText;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    const nav = navigator as Navigator & { share?: (data: { text?: string; title?: string }) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ text: previewText, title: "Preblast" }); } catch {}
    } else { handleCopy(); }
  }

  const beatdownsAvailable = userBeatdowns || [];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)", zIndex: 99 }} />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#141416", borderRadius: "22px 22px 0 0", padding: "14px 22px 24px", borderTop: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 -8px 28px rgba(0,0,0,0.6)", maxHeight: "92vh", overflowY: "auto", fontFamily: F, zIndex: 100 }}>
        <div style={{ width: 44, height: 5, background: BD, borderRadius: 3, margin: "0 auto 14px" }} />

        {showBdPicker ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <button onClick={() => setShowBdPicker(false)} style={{ fontFamily: F, color: T3, fontSize: 14, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {"\u2190"} Back
              </button>
              <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Pick a beatdown</div>
              <div style={{ width: 60 }} />
            </div>
            {beatdownsAvailable.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: T4, fontSize: 13 }}>
                You don{"\u2019"}t have any saved beatdowns yet.<br />Generate or build one first to attach it.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "60vh", overflowY: "auto", paddingBottom: 8 }}>
                {beatdownsAvailable.map(bd => (
                  <button key={bd.id} onClick={() => { setBdAttached(toAttached(bd)); setShowBdPicker(false); }} style={{ background: CARD_BG, border: "1px solid " + BD, borderRadius: 11, padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: F, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T1 }}>{bd.nm}</div>
                    <div style={{ fontSize: 11, color: T4 }}>
                      {bd.dur || ""}{bd.dur && bd.tg && bd.tg.length > 0 ? " - " : ""}{(bd.tg || []).slice(0, 2).join(" - ")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : view === "form" ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 18, color: T1 }}>New Preblast</div>

            <div style={{ fontSize: 10, fontWeight: 800, color: T5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>
              {showTypeGrid ? "Type - choose one" : "Type"}
            </div>

            {editingCustom ? (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value.slice(0, 20))} onBlur={commitCustomType} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitCustomType(); } }} placeholder="Custom type label..." style={{ flex: 1, background: A + "1A", border: "1px solid " + A + "66", borderRadius: 9, color: T1, fontFamily: F, fontSize: 13, padding: "9px 12px", outline: "none" }} autoFocus maxLength={20} />
                  <button onClick={() => { setEditingCustom(false); setCustomType(""); setType(DEFAULT_TYPE); }} style={{ fontFamily: F, color: T4, fontSize: 11, background: "none", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}>Cancel</button>
                </div>
                <div style={{ fontSize: 10, color: T5 }}>{customType.length} / 20</div>
              </div>
            ) : showTypeGrid ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginBottom: 18, border: "1px solid " + BD, borderRadius: 11, padding: 8, background: "rgba(255,255,255,0.02)" }}>
                {PREBLAST_TYPES.map((t) => {
                  const selected = type === t;
                  return (
                    <button key={t} onClick={() => handlePickType(t)} style={{ background: selected ? G + "26" : "rgba(255,255,255,0.04)", border: "1px solid " + (selected ? G + "66" : BD), color: selected ? G : T2, fontFamily: F, fontSize: 10, fontWeight: 700, padding: "8px 2px", borderRadius: 7, cursor: "pointer", textAlign: "center", lineHeight: 1.2 }}>{t}</button>
                  );
                })}
                <button onClick={() => handlePickType("Custom")} style={{ background: A + "1A", border: "1px dashed " + A + "66", color: A, fontFamily: F, fontSize: 10, fontWeight: 700, padding: "8px 2px", borderRadius: 7, cursor: "pointer", textAlign: "center" }}>Custom</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ background: G + "26", border: "1px solid " + G + "66", color: G, fontSize: 13, fontWeight: 800, padding: "8px 14px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{type}</span>
                <button onClick={() => setShowTypeGrid(true)} style={{ fontFamily: F, color: T4, fontSize: 12, background: "none", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}>Change</button>
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 800, color: T5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>
              Message <span style={{ color: G, fontSize: 9, marginLeft: 4 }}>REQUIRED</span>
            </div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 240))} placeholder="What's the call? Coupon party at the Yard. Be there or square..." style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid " + BD, borderRadius: 12, color: T1, fontFamily: F, fontSize: 14, padding: "12px 14px", minHeight: 140, resize: "vertical", outline: "none", lineHeight: 1.5 }} maxLength={240} />
              <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 10, color: message.length > 220 ? A : T5, fontFamily: F }}>{message.length} / 240</div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 800, color: T5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Add details (optional)</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <label style={{ flex: 1, background: whenIso ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.03)", border: "1px solid " + (whenIso ? "rgba(34,197,94,0.4)" : BD), borderRadius: 10, padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: whenIso ? G : T4, position: "relative" }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{"\uD83D\uDCC5"}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: F }}>When</span>
                <input type="datetime-local" value={whenIso || ""} onChange={(e) => setWhenIso(e.target.value || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} aria-label="Pick date and time" />
              </label>
              <button onClick={() => { if (locationText !== null) { setLocationText(null); setLocationInput(""); } else { setLocationText(""); setLocationInput(""); } }} style={{ flex: 1, background: locationText !== null ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.03)", border: "1px solid " + (locationText !== null ? "rgba(34,197,94,0.4)" : BD), borderRadius: 10, padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: locationText !== null ? G : T4, fontFamily: F }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{"\uD83D\uDCCD"}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Location</span>
              </button>
              <button onClick={() => setShowBdPicker(true)} style={{ flex: 1, background: bdAttached ? "rgba(245,158,11,0.10)" : "rgba(255,255,255,0.03)", border: "1px solid " + (bdAttached ? "rgba(245,158,11,0.4)" : BD), borderRadius: 10, padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: bdAttached ? A : T4, fontFamily: F }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{"\uD83D\uDCAA"}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Beatdown</span>
              </button>
            </div>

            {whenIso && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 9, padding: "8px 10px", marginBottom: 6 }}>
                <span style={{ color: G, fontSize: 14 }}>{"\uD83D\uDCC5"}</span>
                <span style={{ flex: 1, color: T1, fontSize: 12, fontWeight: 600 }}>{formatWhen(whenIso)}</span>
                <button onClick={() => setWhenIso(null)} style={{ color: T4, background: "rgba(255,255,255,0.06)", border: "none", width: 20, height: 20, borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Remove when">{"\u2715"}</button>
              </div>
            )}

            {locationText !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 9, padding: "8px 10px", marginBottom: 6 }}>
                <span style={{ color: G, fontSize: 14 }}>{"\uD83D\uDCCD"}</span>
                <input type="text" value={locationInput} onChange={(e) => { const v = e.target.value; setLocationInput(v); setLocationText(v); }} placeholder="Paste map URL or address" autoFocus style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: T1, fontFamily: F, fontSize: 12, fontWeight: 600, outline: "none", padding: 0, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} maxLength={500} />
                <button onClick={() => { setLocationText(null); setLocationInput(""); }} style={{ color: T4, background: "rgba(255,255,255,0.06)", border: "none", width: 20, height: 20, borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Remove location">{"\u2715"}</button>
              </div>
            )}

            {bdAttached && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 9, padding: "8px 10px", marginBottom: 6 }}>
                <span style={{ color: A, fontSize: 14 }}>{"\uD83D\uDCAA"}</span>
                <span style={{ flex: 1, color: T1, fontSize: 12, fontWeight: 600 }}>{bdAttached.title}</span>
                <button onClick={() => setBdAttached(null)} style={{ color: T4, background: "rgba(255,255,255,0.06)", border: "none", width: 20, height: 20, borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Remove beatdown">{"\u2715"}</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, color: T3, fontFamily: F, fontSize: 13, fontWeight: 700, padding: "11px 16px", borderRadius: 11, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setView("preview")} disabled={!canGenerate} style={{ flex: 1, background: canGenerate ? G : G + "33", border: "none", color: canGenerate ? BG : "rgba(14,14,16,0.6)", fontFamily: F, fontSize: 13, fontWeight: 800, padding: "11px 0", borderRadius: 11, cursor: canGenerate ? "pointer" : "not-allowed" }}>{"\u26A1"} Generate</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <button onClick={() => setView("form")} style={{ fontFamily: F, color: T3, fontSize: 14, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}>{"\u2190"} Edit</button>
              <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Preview</div>
              <div style={{ width: 60 }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, color: T5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>Your preblast (paste anywhere)</div>
            <div style={{ background: CARD_BG, border: "1px solid " + BD, borderRadius: 11, padding: 14, fontFamily: "'Courier New', monospace", fontSize: 11, color: T2, lineHeight: 1.55, marginBottom: 14, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: "50vh", overflowY: "auto" }}>{previewText}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCopy} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: T1, border: "1px solid " + BD, fontFamily: F, fontSize: 13, fontWeight: 800, padding: "12px 0", borderRadius: 11, cursor: "pointer" }}>{copied ? "\u2713 Copied" : "\uD83D\uDCCB Copy"}</button>
              <button onClick={handleShare} style={{ flex: 1, background: G, color: BG, border: "none", fontFamily: F, fontSize: 13, fontWeight: 800, padding: "12px 0", borderRadius: 11, cursor: "pointer" }}>{"\u2197"} Share</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
