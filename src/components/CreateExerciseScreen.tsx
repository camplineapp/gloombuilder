"use client";

import { useState } from "react";
import { TAGS } from "@/lib/exercises";

const CD = "rgba(255,255,255,0.028)";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const BG = "#0E0E10";
const T1 = "#F0EDE8";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, borderRadius: 10,
  color: "#D0C8BC", padding: "12px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: F,
};

interface CreateExerciseScreenProps {
  onClose: () => void;
  onSave: (exercise: { nm: string; tags: string[]; how: string; share: boolean }) => void;
}

export default function CreateExerciseScreen({ onClose, onSave }: CreateExerciseScreenProps) {
  const [cxN, setCxN] = useState("");
  const [cxH, setCxH] = useState("");
  const [cxT, setCxT] = useState<string[]>([]);
  const [cxShare, setCxShare] = useState(false);
  const [toast, setToast] = useState("");

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  return (
    <div style={{ padding: "0 24px" }}>
      {toastEl}
      <button onClick={onClose} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>← Home</button>
      <div style={{ fontSize: 24, fontWeight: 800, color: T1, marginBottom: 4 }}>Create exercise</div>
      <div style={{ fontSize: 13, color: T4, marginBottom: 24 }}>Add your own exercise to the locker</div>

      {/* Exercise name */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Exercise name</label>
        <input value={cxN} maxLength={50} onChange={e => setCxN(e.target.value)} placeholder="e.g. The Bishop Special" style={ist} />
      </div>

      {/* How-to */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>How-to</label>
        <textarea value={cxH} maxLength={500} onChange={e => setCxH(e.target.value)} placeholder="Describe how to perform this exercise..." rows={4} style={{ ...ist, resize: "vertical" as const }} />
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 8, fontWeight: 600 }}>Tags</label>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TAGS.map(t => {
            const sel = cxT.includes(t);
            return <button key={t} onClick={() => setCxT(sel ? cxT.filter(x => x !== t) : [...cxT, t])} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T5, border: "1px solid " + (sel ? G + "30" : BD), padding: "6px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>{t}</button>;
          })}
        </div>
      </div>

      {/* Share toggle */}
      <div onClick={() => setCxShare(!cxShare)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: cxShare ? G + "10" : CD, border: "1px solid " + (cxShare ? G + "25" : BD), borderRadius: 10, cursor: "pointer" }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (cxShare ? G : T5), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: BG, background: cxShare ? G : "transparent" }}>{cxShare ? "✓" : ""}</div>
        <span style={{ fontSize: 13, color: cxShare ? G : T4 }}>Share to community library</span>
      </div>

      {/* Save */}
      <button onClick={() => {
        if (!cxN.trim()) { fl("Name required"); return; }
        onSave({ nm: cxN, tags: cxT, how: cxH, share: cxShare });
      }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save exercise to locker</button>
    </div>
  );
}
