"use client";

import { useState } from "react";
import type { Section } from "@/lib/exercises";
import CopyModal from "@/components/CopyModal";

const CD = "rgba(255,255,255,0.028)";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const R = "#ef4444";
const P = "#a78bfa";
const BG = "#0E0E10";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";
const TAGS = ["Warm-Up","Mary","Core","Cardio","Full Body","Legs","Chest","Arms","Shoulders","Static","Transport","Coupon"];

const ist: React.CSSProperties = {
  width: "100%", background: CD, border: "1px solid " + BD, borderRadius: 12,
  color: T1, padding: "14px 16px", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: F,
};

function dc(d: string) {
  if (d === "easy" || d === "Beginner") return G;
  if (d === "medium" || d === "Intermediate") return A;
  if (d === "hard" || d === "Advanced") return R;
  if (d === "beast" || d === "Beast") return "#dc2626";
  return T4;
}

interface LockerBeatdown {
  id: string; nm: string; dt: string; src: string; d: string; desc: string;
  secs: Section[]; tg: string[]; inspiredBy?: string; isPublic?: boolean;
}

interface LockerExercise {
  id: string; nm: string; tags: string[]; how: string; src: string; inspiredBy?: string; shared?: boolean;
}

interface SharedItem {
  id: number | string; nm: string; au: string; ao: string; d: string; ds: string; dt: string;
  tp: string; tg?: string[]; et?: string[];
}

interface LockerScreenProps {
  lk: LockerBeatdown[];
  setLk: (lk: LockerBeatdown[]) => void;
  lkEx: LockerExercise[];
  setLkEx: (lkEx: LockerExercise[]) => void;
  lkBm: Set<string>;
  sharedItems?: SharedItem[];
  onNavigate?: (view: string) => void;
  onDeleteBeatdown?: (id: string) => void;
  onDeleteExercise?: (id: string) => void;
  onShareBeatdown?: (id: string) => void;
  onShareExercise?: (id: string) => void;
  onRemoveBookmark?: (id: string, itemType: "beatdown" | "exercise") => void;
  onSteal?: (id: string, itemType: "beatdown" | "exercise") => void;
  onUpdateExercise?: (id: string, data: { nm: string; how: string; tags: string[] }) => void;
  onEditBeatdown?: (bd: LockerBeatdown) => void;
  onRunBeatdown?: (bd: LockerBeatdown) => void;
}

export default function LockerScreen({ lk, setLk, lkEx, setLkEx, lkBm, sharedItems = [], onNavigate, onDeleteBeatdown, onDeleteExercise, onShareBeatdown, onShareExercise, onRemoveBookmark, onSteal, onUpdateExercise, onEditBeatdown, onRunBeatdown }: LockerScreenProps) {
  const [lT, setLT] = useState(0);
  const [toast, setToast] = useState("");
  const [edLkExI, setEdLkExI] = useState<number | null>(null);
  const [edLkExD, setEdLkExD] = useState<LockerExercise | null>(null);
  const [copySecs, setCopySecs] = useState<LockerBeatdown | null>(null);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 100 }}>{toast}</div>
  ) : null;

  // ════ EXERCISE EDIT ════
  if (lT === 1 && edLkExI !== null && edLkExD) {
    return (
      <div style={{ padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => { setEdLkExI(null); setEdLkExD(null); }} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Back</button>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T1, marginBottom: 16 }}>Edit exercise</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Name</label>
          <input value={edLkExD.nm} maxLength={50} onChange={e => setEdLkExD({ ...edLkExD, nm: e.target.value })} style={ist} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>How-to</label>
          <textarea value={edLkExD.how || ""} maxLength={500} onChange={e => setEdLkExD({ ...edLkExD, how: e.target.value })} rows={4} style={{ ...ist, resize: "vertical" as const }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 8, fontWeight: 600 }}>Tags</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {TAGS.map(t => {
              const sel = (edLkExD.tags || []).includes(t);
              return <button key={t} onClick={() => setEdLkExD({ ...edLkExD, tags: sel ? (edLkExD.tags || []).filter(x => x !== t) : [...(edLkExD.tags || []), t] })} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T5, border: "1px solid " + (sel ? G + "30" : BD), padding: "6px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>{t}</button>;
            })}
          </div>
        </div>
        {edLkExD.inspiredBy ? <div style={{ fontSize: 12, color: A, marginBottom: 14, fontStyle: "italic" }}>Inspired by {edLkExD.inspiredBy}</div> : null}
        <button onClick={() => { onUpdateExercise?.(edLkExD.id, { nm: edLkExD.nm, how: edLkExD.how, tags: edLkExD.tags }); setEdLkExI(null); setEdLkExD(null); }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save exercise</button>
        {toastEl}
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "0 24px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: T1 }}>Locker</div>
        <div style={{ fontSize: 13, color: T4, marginTop: 4 }}>Your beatdowns, exercises, and bookmarks</div>
      </div>

      <div style={{ margin: "18px 24px 0", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid " + BD, display: "flex", padding: 3 }}>
        {["Beatdowns", "Exercises", "Bookmarked"].map((sv, i) => (
          <div key={sv} onClick={() => setLT(i)} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: lT === i ? 700 : 500, color: lT === i ? G : T4, background: lT === i ? "rgba(34,197,94,0.08)" : "transparent", borderRadius: 10, cursor: "pointer", fontFamily: F }}>{sv}</div>
        ))}
      </div>

      <div style={{ padding: "16px 24px 0", display: "flex", flexDirection: "column", gap: 8 }}>

        {lT === 0 ? (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div onClick={() => onNavigate?.("gen")} style={{ flex: 1, background: CD, border: "1px dashed " + G + "30", borderRadius: 14, padding: "16px 14px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: G }}>+ Generate</div>
              </div>
              <div onClick={() => onNavigate?.("build")} style={{ flex: 1, background: CD, border: "1px dashed " + A + "30", borderRadius: 14, padding: "16px 14px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: A }}>+ Build manually</div>
              </div>
            </div>
            {lk.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40, border: "1px dashed " + BD, borderRadius: 14 }}>No beatdowns yet</div> : null}
            {lk.map((bd) => (
              <div key={bd.id} style={{ background: CD, border: "1px solid " + BD, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T2 }}>{bd.nm}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ fontSize: 12, color: T5 }}>{bd.dt} · {bd.src}</div>
                    </div>
                    {bd.inspiredBy ? <div style={{ fontSize: 11, color: A, marginTop: 4 }}>Inspired by {bd.inspiredBy}</div> : null}
                    {bd.desc ? <div style={{ fontSize: 12, color: T4, marginTop: 6, fontStyle: "italic" }}>{bd.desc}</div> : null}
                  </div>
                  <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 10, padding: "3px 9px", borderRadius: 5, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
                </div>
                {bd.tg && bd.tg.length > 0 ? <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>{bd.tg.filter(t => !["Easy","Medium","Hard","Beast"].includes(t)).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.04)", color: T4, fontSize: 10, padding: "2px 9px", borderRadius: 5, fontFamily: F }}>{t}</span>)}</div> : null}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onEditBeatdown?.(bd)} style={{ fontFamily: F, background: G + "12", color: G, border: "1px solid " + G + "20", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                    <button onClick={() => onRunBeatdown?.(bd)} style={{ fontFamily: F, background: G, color: "#000", border: "none", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Run This</button>
                    <button onClick={() => setCopySecs(bd)} style={{ fontFamily: F, background: "rgba(255,255,255,0.04)", color: T3, border: "1px solid " + BD, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Copy for Slack</button>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, paddingLeft: 2 }}>
                    {!bd.isPublic ? <span onClick={() => { if (confirm("Share to community? This can't be undone.")) onShareBeatdown?.(bd.id); }} style={{ fontFamily: F, color: A, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}>Share</span> : <span style={{ fontFamily: F, color: G, fontSize: 12, fontWeight: 600, padding: "4px 0" }}>✓ Shared</span>}
                    <span onClick={() => onDeleteBeatdown?.(bd.id)} style={{ fontFamily: F, color: R, fontSize: 12, cursor: "pointer", padding: "4px 0" }}>Delete</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {lT === 1 ? (
          <div>
            <div onClick={() => onNavigate?.("create-ex")} style={{ background: CD, border: "1px dashed " + G + "30", borderRadius: 14, padding: "20px 18px", textAlign: "center", cursor: "pointer", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: G }}>+ Create new exercise</div>
            </div>
            {lkEx.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 20 }}>No custom exercises yet</div> : null}
            {lkEx.map((ex, i) => (
              <div key={ex.id} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + P + "40", borderRadius: 14, padding: "16px 18px", marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T2 }}>{ex.nm}</div>
                {ex.inspiredBy ? <div style={{ fontSize: 11, color: A, marginTop: 4 }}>Inspired by {ex.inspiredBy}</div> : null}
                {ex.how ? <div style={{ fontSize: 12, color: T4, marginTop: 6, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{ex.how}</div> : null}
                {ex.tags && ex.tags.length > 0 ? <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>{ex.tags.map(t => <span key={t} style={{ background: "rgba(255,255,255,0.04)", color: T4, fontSize: 10, padding: "2px 9px", borderRadius: 5, fontFamily: F }}>{t}</span>)}</div> : null}
                <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <button onClick={() => { setEdLkExI(i); setEdLkExD({ ...ex }); }} style={{ fontFamily: F, background: G + "12", color: G, border: "1px solid " + G + "20", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                  {!ex.shared ? <button onClick={() => { if (confirm("Share to community? This can't be undone.")) onShareExercise?.(ex.id); }} style={{ fontFamily: F, background: A + "12", color: A, border: "1px solid " + A + "20", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Share</button> : <span style={{ color: G, fontSize: 12, padding: "6px 10px", display: "flex", alignItems: "center" }}>✓ Shared</span>}
                  <span onClick={() => onDeleteExercise?.(ex.id)} style={{ color: R, padding: "6px 10px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}>Delete</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {lT === 2 ? (
          <div>
            {lkBm.size === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40, border: "1px dashed " + BD, borderRadius: 14 }}>No bookmarks yet</div> : null}
            {sharedItems.filter(item => lkBm.has(String(item.id))).map(bd => {
              const isBd = bd.tp !== "exercise";
              return (
                <div key={bd.id} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + (isBd ? A + "40" : P + "40"), borderRadius: 14, padding: "16px 18px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T2 }}>{bd.nm}</div>
                        <span style={{ background: isBd ? A + "12" : P + "12", color: isBd ? A : P, fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>{isBd ? "Beatdown" : "Exercise"}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T4, marginTop: 4 }}>{bd.au} · {bd.ao}</div>
                      {bd.ds ? <div style={{ fontSize: 12, color: T5, marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{bd.ds}</div> : null}
                    </div>
                    <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 10, padding: "3px 9px", borderRadius: 5, fontWeight: 700, fontFamily: F, textTransform: "uppercase", flexShrink: 0 }}>{bd.d}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <button onClick={() => onSteal?.(String(bd.id), bd.tp as "beatdown" | "exercise")} style={{ fontFamily: F, background: P + "12", color: P, border: "1px solid " + P + "20", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Steal to locker</button>
                    <button onClick={() => onRemoveBookmark?.(String(bd.id), bd.tp as "beatdown" | "exercise")} style={{ fontFamily: F, background: "rgba(255,255,255,0.04)", color: T3, border: "1px solid " + BD, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

      </div>
      {copySecs ? <CopyModal secs={copySecs.secs} beatdownName={copySecs.nm} beatdownDesc={copySecs.desc} qName="The Bishop" onClose={() => setCopySecs(null)} onToast={fl} /> : null}
      {toastEl}
    </div>
  );
}
