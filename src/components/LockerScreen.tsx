"use client";

import { useState, useEffect } from "react";
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
  id: string; nm: string; desc: string; tags: string[]; how: string; src: string; inspiredBy?: string; shared?: boolean;
}

interface SharedItem {
  id: number | string; nm: string; au: string; ao: string; d: string; ds: string; dt: string;
  tp: string; tg?: string[]; et?: string[];
}

// ════ ACTION SHEET (bottom sheet with options) ════
function ActionSheet({ items, onClose }: { items: { label: string; color: string; icon: string; onClick: () => void }[]; onClose: () => void }) {
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1c1c20", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, border: "1px solid rgba(255,255,255,0.10)", borderBottom: "none" }}>
        <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "10px auto 4px" }} />
        <div style={{ padding: "4px 0 12px" }}>
          {items.map((item, i) => (
            <button key={i} onClick={() => { item.onClick(); onClose(); }} style={{
              fontFamily: F, width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "16px 24px", background: "none", border: "none", borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              color: item.color, fontSize: 16, fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{
          fontFamily: F, width: "100%", padding: "18px 0", background: "rgba(255,255,255,0.04)",
          border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", color: T3, fontSize: 16, fontWeight: 700, cursor: "pointer",
          borderRadius: "0 0 0 0",
        }}>Cancel</button>
      </div>
    </div>
  );
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
  onUpdateExercise?: (id: string, data: { nm: string; desc?: string; how: string; tags: string[] }) => void;
  onEditBeatdown?: (bd: LockerBeatdown) => void;
  onRunBeatdown?: (bd: LockerBeatdown) => void;
}

export default function LockerScreen({ lk, setLk, lkEx, setLkEx, lkBm, sharedItems = [], onNavigate, onDeleteBeatdown, onDeleteExercise, onShareBeatdown, onShareExercise, onRemoveBookmark, onSteal, onUpdateExercise, onEditBeatdown, onRunBeatdown }: LockerScreenProps) {
  const [lT, setLT] = useState(0);
  const [toast, setToast] = useState("");
  const [edLkExI, setEdLkExI] = useState<number | null>(null);
  const [edLkExD, setEdLkExD] = useState<LockerExercise | null>(null);
  const [copySecs, setCopySecs] = useState<LockerBeatdown | null>(null);
  const [actionSheet, setActionSheet] = useState<{ items: { label: string; color: string; icon: string; onClick: () => void }[] } | null>(null);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 100 }}>{toast}</div>
  ) : null;

  // ═══ Beatdown action sheet builder ═══
  const openBdActions = (bd: LockerBeatdown) => {
    const items: { label: string; color: string; icon: string; onClick: () => void }[] = [
      { label: "Edit", color: T2, icon: "✎", onClick: () => onEditBeatdown?.(bd) },
      { label: "Copy for Slack", color: T2, icon: "📋", onClick: () => setCopySecs(bd) },
    ];
    if (!bd.isPublic) {
      items.push({ label: "Share to Library", color: A, icon: "↗", onClick: () => { if (confirm("Share this beatdown to the community library?")) onShareBeatdown?.(bd.id); } });
    } else {
      items.push({ label: "Shared", color: G, icon: "✓", onClick: () => {} });
    }
    items.push({ label: "Delete", color: R, icon: "🗑", onClick: () => { if (confirm("Delete this beatdown? This can't be undone.")) onDeleteBeatdown?.(bd.id); } });
    setActionSheet({ items });
  };

  // ═══ Exercise action sheet builder ═══
  const openExActions = (ex: LockerExercise, idx: number) => {
    const items: { label: string; color: string; icon: string; onClick: () => void }[] = [
      { label: "Edit", color: T2, icon: "✎", onClick: () => { setEdLkExI(idx); setEdLkExD({ ...ex }); } },
    ];
    if (!ex.shared) {
      items.push({ label: "Share to Library", color: A, icon: "↗", onClick: () => { if (confirm("Share this exercise to the community library?")) onShareExercise?.(ex.id); } });
    } else {
      items.push({ label: "Shared", color: G, icon: "✓", onClick: () => {} });
    }
    items.push({ label: "Delete", color: R, icon: "🗑", onClick: () => { if (confirm("Delete this exercise? This can't be undone.")) onDeleteExercise?.(ex.id); } });
    setActionSheet({ items });
  };

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
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Description</label>
          <textarea value={edLkExD.desc || ""} maxLength={200} onChange={e => setEdLkExD({ ...edLkExD, desc: e.target.value })} rows={2} placeholder="Short description of what this exercise is..." style={{ ...ist, resize: "vertical" as const }} />
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
        <button onClick={() => { onUpdateExercise?.(edLkExD.id, { nm: edLkExD.nm, desc: edLkExD.desc, how: edLkExD.how, tags: edLkExD.tags }); setEdLkExI(null); setEdLkExD(null); }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save exercise</button>
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

        {/* ════ BEATDOWNS TAB ════ */}
        {lT === 0 ? (
          <div>
            {lk.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40, border: "1px dashed " + BD, borderRadius: 14 }}>No beatdowns yet</div> : null}
            {lk.map((bd) => (
              <div key={bd.id} style={{ background: CD, border: "1px solid " + BD, borderRadius: 14, padding: "16px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T2, fontFamily: F }}>{bd.nm}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ fontSize: 12, color: T5, fontFamily: F }}>{bd.dt} · {bd.src}</div>
                      {bd.isPublic && <span style={{ fontSize: 10, fontWeight: 700, color: G, background: G + "15", padding: "2px 8px", borderRadius: 5, fontFamily: F }}>✓ Shared</span>}
                    </div>
                    {bd.inspiredBy ? <div style={{ fontSize: 11, color: A, marginTop: 4, fontFamily: F }}>Inspired by {bd.inspiredBy}</div> : null}
                    {bd.desc ? <div style={{ fontSize: 12, color: T4, marginTop: 6, fontStyle: "italic", fontFamily: F, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>{bd.desc}</div> : null}
                  </div>
                  <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 10, padding: "3px 9px", borderRadius: 5, fontWeight: 700, fontFamily: F, textTransform: "uppercase", flexShrink: 0 }}>{bd.d}</span>
                </div>
                {bd.tg && bd.tg.length > 0 ? <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>{bd.tg.filter(t => !["Easy","Medium","Hard","Beast"].includes(t)).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.04)", color: T4, fontSize: 10, padding: "2px 9px", borderRadius: 5, fontFamily: F }}>{t}</span>)}</div> : null}
                {/* ═══ SIMPLIFIED ACTIONS: Run This + ⋯ More ═══ */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={() => onRunBeatdown?.(bd)} style={{
                    fontFamily: F, flex: 1, padding: "12px 0", background: G, color: "#000", border: "none",
                    borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}>Run This</button>
                  <button onClick={() => openBdActions(bd)} style={{
                    fontFamily: F, width: 48, height: 48, background: "rgba(255,255,255,0.04)",
                    border: "1px solid " + BD, borderRadius: 12, color: T3, fontSize: 20,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, letterSpacing: 2,
                  }}>···</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* ════ EXERCISES TAB ════ */}
        {lT === 1 ? (
          <div>
            {lkEx.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 20 }}>No custom exercises yet</div> : null}
            {lkEx.map((ex, i) => (
              <div key={ex.id} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + P + "40", borderRadius: 14, padding: "16px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T2, fontFamily: F }}>{ex.nm}</div>
                      {ex.shared && <span style={{ fontSize: 10, fontWeight: 700, color: G, background: G + "15", padding: "2px 8px", borderRadius: 5, fontFamily: F }}>✓ Shared</span>}
                    </div>
                    {ex.inspiredBy ? <div style={{ fontSize: 11, color: A, marginTop: 4, fontFamily: F }}>Inspired by {ex.inspiredBy}</div> : null}
                    {ex.desc ? <div style={{ fontSize: 13, color: T3, marginTop: 6, lineHeight: 1.5, fontFamily: F, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{ex.desc}</div> : null}
                  </div>
                  <button onClick={() => openExActions(ex, i)} style={{
                    fontFamily: F, width: 40, height: 40, background: "rgba(255,255,255,0.04)",
                    border: "1px solid " + BD, borderRadius: 10, color: T3, fontSize: 18,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, letterSpacing: 2, marginLeft: 8,
                  }}>···</button>
                </div>
                {ex.tags && ex.tags.length > 0 ? <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>{ex.tags.map(t => <span key={t} style={{ background: "rgba(255,255,255,0.04)", color: T4, fontSize: 10, padding: "2px 9px", borderRadius: 5, fontFamily: F }}>{t}</span>)}</div> : null}
              </div>
            ))}
          </div>
        ) : null}

        {/* ════ BOOKMARKED TAB ════ */}
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
                        <div style={{ fontSize: 15, fontWeight: 700, color: T2, fontFamily: F }}>{bd.nm}</div>
                        <span style={{ background: isBd ? A + "12" : P + "12", color: isBd ? A : P, fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: F }}>{isBd ? "Beatdown" : "Exercise"}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T4, marginTop: 4, fontFamily: F }}>{bd.au} · {bd.ao}</div>
                      {bd.ds ? <div style={{ fontSize: 12, color: T5, marginTop: 4, fontFamily: F, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{bd.ds}</div> : null}
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

      {/* ═══ ACTION SHEET ═══ */}
      {actionSheet && <ActionSheet items={actionSheet.items} onClose={() => setActionSheet(null)} />}

      {/* ═══ COPY MODAL ═══ */}
      {copySecs ? <CopyModal secs={copySecs.secs} beatdownName={copySecs.nm} beatdownDesc={copySecs.desc} qName="The Bishop" onClose={() => setCopySecs(null)} onToast={fl} /> : null}
      {toastEl}
    </div>
  );
}
