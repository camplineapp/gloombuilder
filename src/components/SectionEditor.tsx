"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section, SectionExercise, ExerciseData } from "@/lib/exercises";
import { TAGS, parseSmartText, generateId } from "@/lib/exercises";

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
const sC = [G, A, P, R, "#3b82f6", "#ec4899", "#06b6d4"];

const CARD_BG = "#111114";
const EX_BG = "#1a1a1f";
const BD = "rgba(255,255,255,0.07)";
const ist: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD,
  borderRadius: 10, color: T2, padding: "12px 14px", fontSize: 15,
  outline: "none", boxSizing: "border-box", fontFamily: F,
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function exerciseToAmountString(ex: SectionExercise): string {
  if (ex.mode === "time") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "distance") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "reps") return ex.value !== undefined && ex.value !== "" ? String(ex.value) : (ex.r || "");
  return ex.r || "";
}

function classifyInput(input: string): { icon: string; text: string; color: string } | null {
  const parsed = parseSmartText(input);
  if (!parsed) return null;
  if (parsed.mode === "time") {
    const human = parsed.unit === "sec" ? `${parsed.value}-second timer` : `${parsed.value}-minute timer`;
    return { icon: "⏱", color: A, text: human };
  }
  if (parsed.mode === "distance") return { icon: "📏", color: P, text: `Distance: ${parsed.value} ${parsed.unit}` };
  const val = String(parsed.value);
  return { icon: "🔢", color: T3, text: /^\d+$/.test(val.trim()) ? `${val} reps` : val };
}

function fmtAmount(ex: SectionExercise): string {
  if (ex.mode === "time") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "distance") return `${ex.value} ${ex.unit}`;
  const cad = ex.cadence || ex.c || "";
  const isCustomCad = cad !== "IC" && cad !== "OYO";
  if (ex.mode === "reps" && ex.value !== undefined && ex.value !== "") {
    const val = String(ex.value);
    if (isCustomCad || !/^\d+$/.test(val.trim())) return val;
    return `${val} reps`;
  }
  if (ex.r) {
    const rVal = String(ex.r);
    if (isCustomCad || !/^\d+$/.test(rVal.trim())) return rVal;
    return `${rVal} reps`;
  }
  return "";
}

function fmtCadence(ex: SectionExercise): string {
  const cad = ex.cadence || ex.c || "";
  if (ex.mode === "time" || ex.mode === "distance") return "";
  if (!cad) return "";
  const val = String(ex.value ?? ex.r ?? "");
  if (val && !/^\d+$/.test(val.trim())) return "";
  return cad;
}

// ── Drag handle style (prevents iOS text selection / Copy-Look Up-Translate) ──
const dragHandleStyle: React.CSSProperties = {
  cursor: "grab",
  touchAction: "none",
  lineHeight: 1,
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};

// ── EXERCISE INFO SHEET (bottom sheet — peek at exercise description + how-to) ─
function ExerciseInfoSheet({ exData, onClose }: { exData: ExerciseData; onClose: () => void }) {
  // Lock body scroll when info sheet is open
  useEffect(() => {
    const orig = document.body.style.overflow;
    const origPos = document.body.style.position;
    const origW = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.style.overflow = orig;
      document.body.style.position = origPos;
      document.body.style.width = origW;
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 250, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1c1c20", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430,
          maxHeight: "75vh", overflowY: "auto", overscrollBehavior: "contain",
          border: "1px solid rgba(167,139,250,0.15)", borderBottom: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Grab handle bar */}
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "10px auto 0" }} />

        <div style={{ padding: "16px 22px 32px" }}>
          {/* Header: name + close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ color: T1, fontSize: 20, fontWeight: 800, fontFamily: F, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exData.n}</div>
            <button onClick={onClose} style={{ color: T3, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", fontSize: 22, cursor: "pointer", fontFamily: F, flexShrink: 0, padding: 0, width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 12 }}>✕</button>
          </div>

          {/* Description */}
          {exData.d && (
            <div style={{ color: T3, fontSize: 17, lineHeight: 1.65, fontFamily: F, marginBottom: 16 }}>{exData.d}</div>
          )}

          {/* How-to */}
          {exData.h && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
              <div style={{ color: T4, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>How to do it</div>
              <div>
                {exData.h.split(/\s(?=(?:[1-9]|1\d|20)\.\s[A-Z])/).filter(Boolean).map((step, i) => (
                  <div key={i} style={{ color: T3, fontSize: 18, lineHeight: 1.7, marginBottom: 5, fontFamily: F }}>{step.trim()}</div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {exData.t && exData.t.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
              {exData.t.filter(t => t !== "IC" && t !== "OYO" && t !== "either").map(tag => {
                const tagColor = tag === "Warm-Up" ? G : tag === "Mary" || tag === "Core" ? P : tag === "Cardio" || tag === "Full Body" ? R : tag === "Coupon" ? A : T3;
                return (
                  <span key={tag} style={{ background: tagColor + "15", color: tagColor, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, fontFamily: F }}>{tag}</span>
                );
              })}
              {exData.df && (
                <span style={{ background: (exData.df === 1 ? G : exData.df === 2 ? A : R) + "15", color: exData.df === 1 ? G : exData.df === 2 ? A : R, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, fontFamily: F }}>
                  {exData.df === 1 ? "Beginner" : exData.df === 2 ? "Intermediate" : "Advanced"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, sectionColor, onTap, onDelete, onInfo, onLock, isLocked, dragListeners, isDragging, allEx }: {
  ex: SectionExercise; sectionColor: string; onTap: () => void; onDelete?: () => void;
  onInfo?: () => void; onLock?: () => void; isLocked?: boolean;
  dragListeners?: Record<string, unknown>; isDragging?: boolean; allEx?: ExerciseData[];
}) {
  const isTransition = ex.type === "transition";
  const exName = ex.name || ex.n || "";
  const isCustom = allEx ? !allEx.some(x => x.n.toLowerCase() === exName.toLowerCase()) : false;
  const hasInfo = !isCustom && allEx && allEx.some(x => x.n.toLowerCase() === exName.toLowerCase());
  const amountStr = fmtAmount(ex);
  const cadStr = fmtCadence(ex);

  if (isTransition) {
    return (
      <div onClick={onTap} style={{ display: "flex", alignItems: "stretch", marginBottom: 6, background: "rgba(255,255,255,0.03)", borderRadius: 10, opacity: isDragging ? 0.4 : 1, overflow: "hidden", cursor: "pointer" }}>
        {/* Wide drag strip — full left edge, 44px */}
        <div {...dragListeners} onClick={e => e.stopPropagation()} style={{ ...dragHandleStyle, width: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 18, borderRight: "1px solid rgba(255,255,255,0.04)" }}>≡</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px 9px 8px", minWidth: 0 }}>
          <span style={{ color: T4, fontSize: 15, flex: "0 0 auto" }}>↗</span>
          <span style={{ color: T3, fontSize: 16, fontStyle: "italic", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: F }}>{exName}</span>
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ color: T5, background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: "0 2px", flexShrink: 0, fontFamily: F }}>✕</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onTap} style={{ background: EX_BG, borderRadius: 14, marginBottom: 6, display: "flex", alignItems: "stretch", cursor: "pointer", userSelect: "none", opacity: isDragging ? 0.4 : 1, transition: "opacity 0.15s", overflow: "hidden", border: isLocked ? `1px solid ${G}25` : "1px solid transparent" }}>
      {/* Wide drag strip — 44px left edge, full height of the card */}
      <div {...dragListeners} onClick={e => e.stopPropagation()} style={{ ...dragHandleStyle, width: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: sectionColor + "50", fontSize: 22, borderRight: "1px solid rgba(255,255,255,0.04)" }}>≡</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "13px 12px 13px 10px", minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap", overflow: "hidden" }}>
            <span style={{ color: T1, fontSize: 18, fontWeight: 700, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{exName}</span>
            {isCustom && <span style={{ fontSize: 10, color: A, background: A + "15", padding: "2px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", flexShrink: 0, fontFamily: F }}>Custom</span>}
          </div>
          <div style={{ color: T4, fontSize: 14, fontWeight: 600, marginTop: 3, display: "flex", alignItems: "center", gap: 5, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ex.mode === "time" && <span style={{ color: A, fontSize: 13 }}>⏱</span>}
            {ex.mode === "distance" && <span style={{ color: P, fontSize: 13 }}>📏</span>}
            <span>{amountStr}{cadStr ? ` · ${cadStr}` : ""}</span>
          </div>
          {(ex.note || ex.nt) ? <div style={{ color: T5, fontSize: 13, fontStyle: "italic", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: F }}>{ex.note || ex.nt}</div> : null}
        </div>
        {/* Info button — only for database exercises, not custom */}
        {hasInfo && onInfo && (
          <button onClick={e => { e.stopPropagation(); onInfo(); }} style={{ width: 28, height: 28, borderRadius: 8, background: P + "15", border: "1px solid " + P + "30", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: P, fontSize: 14, fontWeight: 700, fontFamily: F }}>?</button>
        )}
        {/* Lock toggle — only on generator screen */}
        {onLock && (
          <button onClick={e => { e.stopPropagation(); onLock(); }} style={{ width: 28, height: 28, borderRadius: 8, background: isLocked ? G + "15" : "transparent", border: isLocked ? "1px solid " + G + "30" : "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: isLocked ? G : T5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" />{isLocked ? <path d="M7 11V7a5 5 0 0 1 10 0v4" /> : <path d="M7 11V7a5 5 0 0 1 9.9-1" />}</svg>
          </button>
        )}
        {onDelete && (
          <button onClick={e => { e.stopPropagation(); if (!isLocked) onDelete(); }} style={{ width: 28, height: 28, borderRadius: 8, background: isLocked ? "transparent" : "rgba(239,68,68,0.07)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLocked ? "default" : "pointer", flexShrink: 0, color: isLocked ? "rgba(255,255,255,0.08)" : T5, fontSize: 13, fontFamily: F }}>✕</button>
        )}
      </div>
    </div>
  );
}

function SortableExerciseCard({ ex, exKey, sectionColor, onTap, onDelete, onInfo, onLock, isLocked, allEx }: {
  ex: SectionExercise; exKey?: string; sectionColor: string;
  onTap: () => void; onDelete?: () => void; onInfo?: () => void; onLock?: () => void; isLocked?: boolean; allEx?: ExerciseData[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exKey || ex.id || ex.n || "x" });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes}>
      <ExerciseCard ex={ex} sectionColor={sectionColor} onTap={onTap} onDelete={onDelete} onInfo={onInfo} onLock={onLock} isLocked={isLocked} dragListeners={listeners as Record<string, unknown>} isDragging={isDragging} allEx={allEx} />
    </div>
  );
}

// ── EXERCISE EDIT SHEET ───────────────────────────────────────────────────────
function ExerciseEditSheet({ exercise, sectionColor, allEx, onSave, onDelete, onClose, onAddTransitionAfter }: {
  exercise: SectionExercise; sectionColor: string; allEx: ExerciseData[];
  onSave: (updated: SectionExercise) => void; onDelete: () => void; onClose: () => void;
  onAddTransitionAfter?: (text: string) => void;
}) {
  const origName = exercise.name || exercise.n || "";
  const [exName, setExName] = useState(origName);
  const [amountText, setAmountText] = useState(exerciseToAmountString(exercise));
  const initCad = exercise.cadence ?? exercise.c ?? "IC";
  const isInitCustom = initCad !== "IC" && initCad !== "OYO";
  const [cadence, setCadence] = useState(isInitCustom ? "Custom" : initCad);
  const [note, setNote] = useState(exercise.note || exercise.nt || "");
  const [showHowTo, setShowHowTo] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const classification = classifyInput(amountText);
  const exData = allEx.find(x => x.n.toLowerCase() === exName.toLowerCase());

  // FIX 2: Lock body scroll when edit sheet is open
  useEffect(() => {
    const orig = document.body.style.overflow;
    const origPos = document.body.style.position;
    const origW = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.style.overflow = orig;
      document.body.style.position = origPos;
      document.body.style.width = origW;
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSave = () => {
    const parsed = parseSmartText(amountText);
    const finalCadence = cadence === "Custom" ? "" : cadence;
    const mode = parsed?.mode || "reps";
    const value = parsed?.value ?? amountText;
    const unit = parsed?.unit;
    let rLegacy = amountText;
    if (parsed?.mode === "reps") rLegacy = String(parsed.value);
    onSave({ ...exercise, name: exName, n: exName, mode, value, unit, cadence: finalCadence, c: finalCadence, r: rLegacy, note, nt: note });
    if (transitionText.trim() && onAddTransitionAfter) {
      onAddTransitionAfter(transitionText.trim());
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111318", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430,
          maxHeight: "92vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none",
          overscrollBehavior: "contain", /* FIX 2: prevents scroll chaining to background */
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "12px auto 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px" }}>
          <button onClick={onClose} style={{ color: T3, background: "none", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: F }}>Cancel</button>
          <div style={{ color: T1, fontSize: 17, fontWeight: 700, fontFamily: F }}>Edit exercise</div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ padding: "0 20px 40px" }}>
          {/* Exercise name — editable for custom, read-only for database */}
          <div style={{ background: EX_BG, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            {exData ? (
              <div style={{ color: T1, fontSize: 19, fontWeight: 700, fontFamily: F }}>{exName}</div>
            ) : (
              <input value={exName} onChange={e => setExName(e.target.value)} maxLength={50} style={{ width: "100%", background: "none", border: "none", outline: "none", color: T1, fontSize: 19, fontWeight: 700, fontFamily: F, padding: 0 }} />
            )}
          </div>
          {/* How to do this exercise — right below name for quick reference */}
          {exData && (
            <>
              <div onClick={() => setShowHowTo(!showHowTo)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: showHowTo ? 10 : 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: P, fontSize: 16 }}>?</span>
                <span style={{ color: T2, fontSize: 15, fontWeight: 600, fontFamily: F, flex: 1 }}>How to do this exercise</span>
                <span style={{ color: T4 }}>{showHowTo ? "▲" : "›"}</span>
              </div>
              {showHowTo && <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>{exData.h.split(/\s(?=(?:[1-9]|1\d|20)\.\s[A-Z])/).filter(Boolean).map((step, i) => <div key={i} style={{ color: T3, fontSize: 17, lineHeight: 1.7, marginBottom: 4, fontFamily: F }}>{step.trim()}</div>)}</div>}
            </>
          )}
          {/* HOW MUCH */}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>HOW MUCH?</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => { const num = parseInt(amountText); if (!isNaN(num) && num > 5) setAmountText(String(num - 5)); }} style={{ fontFamily: F, width: 56, height: 56, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: T2, fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−5</button>
            <input value={amountText} onChange={e => setAmountText(e.target.value)} placeholder="20 · 45 sec · 50 yds..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `2px solid ${sectionColor}66`, borderRadius: 12, color: T1, padding: "16px 18px", fontSize: 17, fontWeight: 500, outline: "none", boxSizing: "border-box", fontFamily: F, textAlign: "center" }} />
            <button onClick={() => { const num = parseInt(amountText); if (!isNaN(num)) setAmountText(String(num + 5)); else setAmountText("5"); }} style={{ fontFamily: F, width: 56, height: 56, borderRadius: 12, background: G + "12", border: "1px solid " + G + "30", color: G, fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+5</button>
          </div>
          {classification && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}><span style={{ fontSize: 18 }}>{classification.icon}</span><span style={{ color: classification.color, fontSize: 15, fontWeight: 700, fontFamily: F }}>{cadence === "Custom" ? amountText : classification.text}</span></div>}
          <div style={{ color: T4, fontSize: 14, fontStyle: "italic", marginTop: 6, marginBottom: 22, fontFamily: F }}>Try: 20 · 45 sec · 50 yds · 3 laps</div>
          {/* CADENCE */}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>CADENCE</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {["IC", "OYO", "Custom"].map(opt => {
              const sel = cadence === opt;
              const cc = opt === "IC" ? G : opt === "OYO" ? A : T3;
              return <button key={opt} onClick={() => setCadence(opt)} style={{ flex: 1, height: 48, background: sel ? `${cc}20` : "rgba(255,255,255,0.04)", border: `${sel ? 2 : 1}px solid ${sel ? cc : BD}`, color: sel ? cc : T3, fontSize: 15, fontWeight: sel ? 700 : 500, borderRadius: 12, cursor: "pointer", fontFamily: F }}>{opt}</button>;
            })}
          </div>
          {/* NOTE */}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>NOTE (optional)</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={2} style={{ ...ist, resize: "vertical" as const, marginBottom: 22 }} />
          {/* TRANSITION AFTER THIS — right below Note */}
          {onAddTransitionAfter && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20, marginBottom: 20 }}>
              <div style={{ color: T2, fontSize: 13, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>TRANSITION AFTER THIS</div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", overflow: "hidden" }}>
                <span style={{ color: T5, fontSize: 17, padding: "0 12px", flexShrink: 0 }}>↗</span>
                <input
                  value={transitionText}
                  onChange={e => setTransitionText(e.target.value)}
                  placeholder="e.g. Mosey to the bleachers"
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: T2, fontSize: 16, fontStyle: "italic", fontFamily: F, padding: "16px 0" }}
                />
              </div>
              <div style={{ color: T5, fontSize: 13, marginTop: 6, fontFamily: F }}>Inserts a mosey line after {exName} in the beatdown</div>
            </div>
          )}
          {/* Save + Delete */}
          <button onClick={handleSave} style={{ width: "100%", padding: "20px 0", background: G, border: "none", color: BG, fontSize: 18, fontWeight: 800, borderRadius: 14, cursor: "pointer", fontFamily: F, marginBottom: 10 }}>Save changes</button>
          <button onClick={onDelete} style={{ width: "100%", padding: "18px 0", background: "transparent", border: `2px solid ${R}`, color: R, fontSize: 16, fontWeight: 700, borderRadius: 14, cursor: "pointer", fontFamily: F }}>Delete exercise</button>
        </div>
      </div>
    </div>
  );
}

// ── SORTABLE SECTION BLOCK ─────────────────────────────────────────────────────
function SortableSectionBlock({
  sec, si, sections, allEx, sensors,
  editLabel, qaQ, qaSec, trSec, trText,
  qaRef, trRef, qaResults,
  onEditSheet, onSetEditLabel, onSetQaSec, onSetQaQ, onSetTrSec, onSetTrText,
  onUpdate, onDeleteSec, onAddExercise, onAddTransition,
  onOpenPicker, onExDragEnd, onAddSection, onQNotesChange,
  onShowInfo, onSectionReroll, onExerciseLock,
}: {
  sec: Section; si: number; sections: Section[]; allEx: ExerciseData[];
  sensors: ReturnType<typeof useSensors>;
  editLabel: number | null; qaQ: string; qaSec: number | null;
  trSec: number | null; trText: string;
  qaRef: React.RefObject<HTMLInputElement | null>; trRef: React.RefObject<HTMLInputElement | null>;
  qaResults: (ExerciseData & { score: number })[];
  onEditSheet: (v: { sectionIdx: number; exercise: SectionExercise }) => void;
  onSetEditLabel: (v: number | null) => void;
  onSetQaSec: (v: number | null) => void; onSetQaQ: (v: string) => void;
  onSetTrSec: (v: number | null) => void; onSetTrText: (v: string) => void;
  onUpdate: (secs: Section[]) => void;
  onDeleteSec: () => void;
  onAddExercise: (name: string, isCustom: boolean) => void;
  onAddTransition: () => void;
  onOpenPicker: () => void;
  onExDragEnd: (event: DragEndEvent) => void;
  onAddSection: () => void;
  onQNotesChange: (text: string) => void;
  onShowInfo: (exName: string) => void;
  onSectionReroll?: (mode: "core" | "rogue") => void;
  onExerciseLock?: (exerciseIdx: number) => void;
}) {
  const secId = sec.id || sec.label || String(si);
  const sColor = sec.color;
  const secLabel = sec.name || sec.label || "Section";
  const exCount = sec.exercises.filter(e => e.type !== "transition").length;
  const exIds = sec.exercises.map((e, idx) => e.id ? `${e.id}-${idx}` : (e.n ? `${e.n}-${idx}` : `ex-${si}-${idx}`));
  const isRenaming = editLabel === si;
  const [qNotesOpen, setQNotesOpen] = useState(false);
  const [qNotesDraft, setQNotesDraft] = useState(sec.qNotes || sec.note || "");
  const hasQNotes = (sec.qNotes || sec.note || "").trim().length > 0;
  const [editTrIdx, setEditTrIdx] = useState<number | null>(null);
  const [editTrText, setEditTrText] = useState("");
  const [rerollMode, setRerollMode] = useState<"core" | "rogue">("core");

  const [renameText, setRenameText] = useState(secLabel);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: secId });

  const handleDelete = () => {
    if (sec.exercises.length > 0) {
      if (!confirm(`Delete "${secLabel}"? This will remove all ${sec.exercises.length} exercise${sec.exercises.length === 1 ? "" : "s"} in this section.`)) return;
    }
    onDeleteSec();
  };

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, marginBottom: 6 }} {...attributes}>

      {/* ── Section Card — overflow:visible so dropdown can escape ── */}
      <div style={{
        background: CARD_BG,
        borderRadius: 22,
        boxShadow: `0 0 0 1px ${sColor}40, 0 4px 24px ${sColor}0D`,
        opacity: isDragging ? 0.3 : 1,
        transition: "opacity 0.15s",
      }}>
        {/* Header area — overflow:hidden only here for stripe corner clipping */}
        <div style={{ borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
          <div style={{ height: 3, background: sColor }} />

          <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {/* Left: drag handle + section name (tap name to rename) */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
              {/* FIX 5: Section drag handle — userSelect + WebkitTouchCallout prevent iOS text selection */}
              <div {...listeners} style={{ ...dragHandleStyle, color: sColor, fontSize: 28, marginTop: 1, flexShrink: 0, opacity: 0.7 }}>≡</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isRenaming ? (
                  <input
                    autoFocus
                    value={renameText}
                    maxLength={60}
                    onChange={e => setRenameText(e.target.value)}
                    onBlur={() => { const nm = renameText.trim() || "Section"; onUpdate(sections.map((s, i) => i !== si ? s : { ...s, name: nm, label: nm })); onSetEditLabel(null); }}
                    onKeyDown={e => { if (e.key === "Enter") { const nm = renameText.trim() || "Section"; onUpdate(sections.map((s, i) => i !== si ? s : { ...s, name: nm, label: nm })); onSetEditLabel(null); } }}
                    style={{ background: "rgba(255,255,255,0.08)", border: `1.5px solid ${sColor}60`, borderRadius: 8, color: T1, fontSize: 20, fontWeight: 800, padding: "5px 12px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: F }}
                  />
                ) : (
                  <div
                    onClick={() => { setRenameText(secLabel); onSetEditLabel(si); }}
                    title="Tap to rename"
                    style={{ color: T1, fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "text" }}
                  >
                    {secLabel}
                  </div>
                )}
                <div style={{ color: T4, fontSize: 13, marginTop: 3, fontFamily: F, fontWeight: 500 }}>{exCount} {exCount === 1 ? "exercise" : "exercises"}{onExerciseLock && (() => { const lc = sec.exercises.filter(e => (e as any).locked).length; return lc > 0 ? ` · ${lc} locked` : ""; })()}</div>
              </div>
            </div>
            {/* Right: reroll toggle + delete button */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginTop: 1 }}>
              {onSectionReroll && (
                <button
                  onClick={() => {
                    onSectionReroll(rerollMode);
                    setRerollMode(rerollMode === "core" ? "rogue" : "core");
                  }}
                  style={{ width: 36, height: 36, borderRadius: 9, background: (rerollMode === "core" ? G : P) + "12", border: "1.5px solid " + (rerollMode === "core" ? G : P) + "30", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={rerollMode === "core" ? G : P} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
                    <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleDelete}
                style={{ width: 34, height: 34, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, color: R, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: F }}
              >✕</button>
            </div>
          </div>
        </div>

        {/* Body — overflow:visible so autocomplete dropdown can escape */}
        <div style={{ padding: "0 12px 14px" }}>

          {/* Q Notes — Option A: subtle inline text link when empty, compact display when has content */}
          {hasQNotes && !qNotesOpen ? (
            <div style={{ padding: "0 4px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: T4, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✎</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T2, fontSize: 14, fontStyle: "italic", lineHeight: 1.5, fontFamily: F, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>{sec.qNotes || sec.note}</div>
              </div>
              <button onClick={() => { setQNotesDraft(sec.qNotes || sec.note || ""); setQNotesOpen(true); }} style={{ color: sColor, background: "none", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F, flexShrink: 0 }}>Edit</button>
            </div>
          ) : qNotesOpen ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: T2, fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", fontFamily: F, marginBottom: 8 }}>Q Notes</div>
              <textarea
                autoFocus
                value={qNotesDraft}
                onChange={e => setQNotesDraft(e.target.value)}
                rows={3}
                placeholder="Instructions, cues, encouragement for the PAX..."
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1.5px solid ${sColor}40`, borderRadius: 12, color: T2, padding: "14px 16px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: F, fontStyle: "italic", resize: "vertical" as const, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { onQNotesChange(qNotesDraft); setQNotesOpen(false); }} style={{ fontFamily: F, background: sColor, color: BG, border: "none", padding: "12px 22px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Save</button>
                <button onClick={() => { setQNotesDraft(sec.qNotes || sec.note || ""); setQNotesOpen(false); }} style={{ fontFamily: F, background: "rgba(255,255,255,0.05)", color: T3, border: "1px solid rgba(255,255,255,0.1)", padding: "12px 22px", borderRadius: 10, fontSize: 16, cursor: "pointer" }}>Cancel</button>
                {hasQNotes && <button onClick={() => { onQNotesChange(""); setQNotesDraft(""); setQNotesOpen(false); }} style={{ fontFamily: F, background: "none", color: R, border: "none", padding: "12px 0", fontSize: 15, cursor: "pointer", marginLeft: "auto" }}>Remove</button>}
              </div>
            </div>
          ) : (
            <div style={{ padding: "0 4px 10px" }}>
              <span onClick={() => { setQNotesDraft(""); setQNotesOpen(true); }} style={{ color: T4, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: F }}>+ Add Q notes</span>
            </div>
          )}

          {/* Exercises */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onExDragEnd}>
            <SortableContext items={exIds} strategy={verticalListSortingStrategy}>
              {sec.exercises.map((ex, exIdx) => (
                <SortableExerciseCard
                  key={ex.id ? `${ex.id}-${exIdx}` : `${ex.n}-${exIdx}`}
                  exKey={ex.id ? `${ex.id}-${exIdx}` : `${ex.n}-${exIdx}`}
                  ex={ex} sectionColor={sColor} allEx={allEx}
                  onTap={() => {
                    if (ex.type === "transition") {
                      setEditTrIdx(exIdx);
                      setEditTrText(ex.name || ex.n || "");
                    } else {
                      onEditSheet({ sectionIdx: si, exercise: ex });
                    }
                  }}
                  onDelete={() => {
                    if ((ex as any).locked) return;
                    const exId = ex.id; const exName = ex.n || "";
                    onUpdate(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.filter(e => exId ? e.id !== exId : e.n !== exName) }));
                  }}
                  onInfo={() => onShowInfo(ex.name || ex.n || "")}
                  onLock={onExerciseLock ? () => onExerciseLock(exIdx) : undefined}
                  isLocked={(ex as any).locked || false}
                />
              ))}
              {/* Transition inline edit */}
              {editTrIdx !== null && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setEditTrIdx(null)}>
                  <div onClick={e => e.stopPropagation()} style={{ background: "#1c1c20", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, padding: "20px 22px 32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ color: T2, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: F }}>Edit transition</span>
                      <button onClick={() => setEditTrIdx(null)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: T3, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: T4, fontSize: 17, marginTop: 12 }}>↗</span>
                      <input
                        autoFocus
                        value={editTrText}
                        onChange={e => setEditTrText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && editTrText.trim()) {
                            const idx = editTrIdx;
                            onUpdate(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.map((ex2, j) => j !== idx ? ex2 : { ...ex2, name: editTrText.trim(), n: editTrText.trim() }) }));
                            setEditTrIdx(null);
                          }
                        }}
                        style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${sColor}60`, borderRadius: 12, color: T2, fontSize: 16, fontStyle: "italic", padding: "12px 14px", fontFamily: F, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <button onClick={() => {
                        if (editTrText.trim()) {
                          const idx = editTrIdx;
                          onUpdate(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.map((ex2, j) => j !== idx ? ex2 : { ...ex2, name: editTrText.trim(), n: editTrText.trim() }) }));
                        }
                        setEditTrIdx(null);
                      }} style={{ flex: 1, padding: "14px 0", background: sColor, color: BG, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: F }}>Save</button>
                      <button onClick={() => setEditTrIdx(null)} style={{ padding: "14px 20px", background: "rgba(255,255,255,0.05)", color: T3, border: "none", borderRadius: 12, fontSize: 16, cursor: "pointer", fontFamily: F }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </SortableContext>
          </DndContext>

          {/* ADD EXERCISE — hero input. position:relative here so dropdown positions relative to this */}
          <div style={{ position: "relative", marginTop: sec.exercises.length > 0 ? 8 : 0 }}>
            <div style={{
              background: CARD_BG,
              border: `2px solid ${sColor}55`,
              borderRadius: 15,
              display: "flex",
              alignItems: "stretch",
              overflow: "visible",
              boxShadow: `0 0 14px ${sColor}12`,
            }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 0 14px 16px" }}>
                <div style={{ color: sColor, fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 5, fontFamily: F, pointerEvents: "none" }}>Add Exercise</div>
                <input
                  ref={qaSec === si ? qaRef : null}
                  value={qaSec === si ? qaQ : ""}
                  onFocus={() => { onSetQaSec(si); onSetQaQ(""); }}
                  onChange={e => { onSetQaSec(si); onSetQaQ(e.target.value); }}
                  onKeyDown={e => { if (e.key === "Enter" && qaQ.trim().length >= 2 && qaSec === si) onAddExercise(qaQ.trim(), true); }}
                  placeholder="Start typing..."
                  style={{ background: "none", border: "none", outline: "none", color: T2, fontSize: 16, fontFamily: F, fontWeight: 500, padding: 0, width: "100%" }}
                />
              </div>
              <button onClick={onOpenPicker} style={{ padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", borderLeft: `1px solid ${sColor}33`, cursor: "pointer", flexShrink: 0 }}>
                <span style={{ color: sColor, fontSize: 28, lineHeight: 1 }}>⌕</span>
              </button>
            </div>

            {/* Autocomplete dropdown — z-index 9999 so it floats above card */}
            {qaSec === si && qaQ.length >= 2 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999, background: "#1c1c20", border: `1px solid ${sColor}40`, borderRadius: 14, marginTop: 4, overflow: "hidden", boxShadow: `0 8px 32px rgba(0,0,0,0.6)` }}>
                <div onClick={() => onAddExercise(qaQ.trim(), true)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: A + "08", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ fontFamily: F, fontSize: 15, color: A, fontWeight: 700 }}>Add &ldquo;{qaQ.trim()}&rdquo; as custom</div>
                    <div style={{ fontFamily: F, fontSize: 12, color: T5, marginTop: 2 }}>Won&apos;t be linked to exercise database</div>
                  </div>
                  <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: A, background: A + "15", padding: "6px 14px", borderRadius: 8 }}>+ Add</span>
                </div>
                {qaResults.map((ex, i) => (
                  <div key={i} onClick={() => onAddExercise(ex.n, false)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < qaResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: T1 }}>{ex.n}</div>
                      {ex.f !== ex.n && <div style={{ fontFamily: F, fontSize: 12, color: T5, marginTop: 2 }}>{ex.f}</div>}
                    </div>
                    <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: sColor, background: sColor + "15", padding: "6px 14px", borderRadius: 8 }}>+ Add</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transitions are added via the exercise edit sheet — tap any exercise card */}
        </div>
      </div>

      {/* + Add Section — outside the card */}
      <button onClick={onAddSection} style={{ width: "100%", marginTop: 8, background: "none", border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: 13, padding: "13px 0", color: T3, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
        + Add Section
      </button>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export interface SectionEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  allEx: ExerciseData[];
  onSectionReroll?: (sectionIdx: number, mode: "core" | "rogue") => void;
  onExerciseLock?: (sectionIdx: number, exerciseIdx: number) => void;
}

export default function SectionEditor({ sections, onSectionsChange, allEx, onSectionReroll, onExerciseLock }: SectionEditorProps) {
  const [editSheet, setEditSheet] = useState<{ sectionIdx: number; exercise: SectionExercise } | null>(null);
  const [editLabel, setEditLabel] = useState<number | null>(null);
  const [qaQ, setQaQ] = useState("");
  const [qaSec, setQaSec] = useState<number | null>(null);
  const qaRef = useRef<HTMLInputElement | null>(null);
  const [trSec, setTrSec] = useState<number | null>(null);
  const [trText, setTrText] = useState("");
  const trRef = useRef<HTMLInputElement | null>(null);
  const [pk2, setPk2] = useState(false);
  const [pkI, setPkI] = useState(0);
  const [pS, setPS] = useState("");
  const [pTg, setPTg] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  // FIX 4: Exercise info sheet state
  const [infoEx, setInfoEx] = useState<ExerciseData | null>(null);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const update = (s: Section[]) => onSectionsChange(s);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } }));

  const handleSecDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oi = sections.findIndex(s => (s.id || s.label) === active.id);
    const ni = sections.findIndex(s => (s.id || s.label) === over.id);
    if (oi === -1 || ni === -1) return;
    update(arrayMove(sections, oi, ni));
  };

  const handleExDragEnd = (si: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sec = sections[si];
    const exIds = sec.exercises.map((e, idx) => e.id ? `${e.id}-${idx}` : (e.n ? `${e.n}-${idx}` : `ex-${si}-${idx}`));
    const oi = exIds.indexOf(String(active.id));
    const ni = exIds.indexOf(String(over.id));
    if (oi === -1 || ni === -1) return;
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: arrayMove(s.exercises, oi, ni) }));
  };

  const handleDeleteSec = (si: number) => {
    if (sections[si].exercises.length > 0 && !confirm(`Delete "${sections[si].name || sections[si].label}" and all its exercises?`)) return;
    update(sections.filter((_, j) => j !== si));
  };

  const handleAddExercise = (si: number, name: string, isCustom: boolean) => {
    const id = generateId();
    const add: SectionExercise = { id, type: "exercise", name, n: name, mode: "reps", value: 10, cadence: "IC", r: "10", c: "IC", note: "", nt: "" };
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setQaQ(""); fl(name + (isCustom ? " added as custom" : " added"));
    setTimeout(() => qaRef.current?.focus(), 100);
  };

  const handleAddTransition = (si: number) => {
    if (!trText.trim()) return;
    const id = generateId();
    const add: SectionExercise = { id, type: "transition", name: trText.trim(), n: trText.trim(), r: "", c: "", nt: "", note: "" };
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setTrText(""); setTrSec(null); fl("Transition added");
  };

  const handleAddSection = (afterIdx: number) => {
    const color = sC[sections.length % sC.length];
    const id = generateId();
    const newSec: Section = { id, name: "New Section", label: "New Section", color, qNotes: "", note: "", exercises: [] };
    const next = [...sections];
    next.splice(afterIdx + 1, 0, newSec);
    update(next);
    setTimeout(() => setEditLabel(afterIdx + 1), 60);
  };

  const handleSaveExercise = (si: number, updated: SectionExercise) => {
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.map(e => e.id === updated.id ? updated : e) }));
    setEditSheet(null);
  };

  const handleDeleteExercise = (si: number, exId: string | undefined, exName: string) => {
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.filter(e => exId ? e.id !== exId : e.n !== exName) }));
    setEditSheet(null);
  };

  // FIX 4: Show exercise info sheet
  const handleShowInfo = (exName: string) => {
    const found = allEx.find(x => x.n.toLowerCase() === exName.toLowerCase());
    if (found) setInfoEx(found);
  };

  const qaResults = (() => {
    if (!qaQ || qaQ.length < 2) return [];
    const ql = qaQ.toLowerCase();
    const scored = allEx.map(e => {
      const nl = e.n.toLowerCase();
      if (nl === ql) return { ...e, score: 0 };
      if (nl.startsWith(ql)) return { ...e, score: 1 };
      if (nl.includes(ql)) return { ...e, score: 2 };
      if (e.f.toLowerCase().includes(ql)) return { ...e, score: 3 };
      if ((e.d || "").toLowerCase().includes(ql)) return { ...e, score: 4 };
      return null;
    }).filter(Boolean) as (ExerciseData & { score: number })[];
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 6);
  })();

  const sectionIds = sections.map(s => s.id || s.label || s.name || "s");
  const pickerSec = sections[pkI];
  const pickerFi = pk2 && pickerSec ? allEx.filter(e => {
    const ms = !pS || e.n.toLowerCase().includes(pS.toLowerCase()) || e.f.toLowerCase().includes(pS.toLowerCase()) || (e.d || "").toLowerCase().includes(pS.toLowerCase());
    const mt = !pTg || e.t.includes(pTg);
    return ms && mt;
  }).sort((a, b) => {
    if (!pS) return 0;
    const q = pS.toLowerCase();
    const sc = (e: typeof a) => { if (e.n.toLowerCase() === q) return 0; if (e.n.toLowerCase().startsWith(q)) return 1; if (e.n.toLowerCase().includes(q)) return 2; if (e.f.toLowerCase().includes(q)) return 3; return 4; };
    return sc(a) - sc(b);
  }) : [];

  const toastEl = toast ? <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300, pointerEvents: "none" }}>{toast}</div> : null;

  const pickerModal = pk2 && pickerSec ? (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 150, display: "flex", flexDirection: "column", fontFamily: F }}>
      <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><span style={{ color: T1, fontSize: 18, fontWeight: 700 }}>Browse library</span><div style={{ color: pickerSec.color, fontSize: 12, marginTop: 2 }}>{pickerSec.name || pickerSec.label} · adding to this section</div></div>
        <span onClick={() => setPk2(false)} style={{ color: T4, cursor: "pointer", fontSize: 22 }}>✕</span>
      </div>
      <div style={{ padding: "0 24px 10px" }}><input value={pS} onChange={e => setPS(e.target.value)} placeholder="Search exercises..." autoFocus style={{ ...ist, borderRadius: 12, padding: "13px 16px", fontSize: 15 }} /></div>
      <div style={{ padding: "0 24px 10px", display: "flex", gap: 5, flexWrap: "wrap" }}>
        {TAGS.map(t => { const sel = pTg === t; return <button key={t} onClick={() => setPTg(sel ? null : t)} style={{ fontFamily: F, background: sel ? A + "20" : "rgba(255,255,255,0.04)", color: sel ? A : T5, border: "1px solid " + (sel ? A + "30" : BD), padding: "5px 11px", borderRadius: 20, fontSize: 10, cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>{t}</button>; })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        {pickerFi.map(e => (
          <div key={e.n} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, marginBottom: 6, display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}><div style={{ color: T1, fontWeight: 700, fontSize: 16, fontFamily: F }}>{e.n}</div><div style={{ color: T4, fontSize: 12, marginTop: 3, fontFamily: F }}>{e.d || e.f}</div></div>
            <button onClick={() => { const id = generateId(); const add: SectionExercise = { id, type: "exercise", name: e.n, n: e.n, mode: "reps", value: 10, cadence: "IC", r: "10", c: "IC", note: "", nt: "" }; update(sections.map((s, i) => i !== pkI ? s : { ...s, exercises: [...s.exercises, add] })); setPk2(false); fl(e.n + " added"); }} style={{ fontFamily: F, background: G, color: BG, border: "none", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", flexShrink: 0, marginLeft: 12 }}>+ Add</button>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSecDragEnd}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          {sections.map((sec, si) => (
            <SortableSectionBlock
              key={sec.id || sec.label || si}
              sec={sec} si={si} sections={sections} allEx={allEx} sensors={sensors}
              editLabel={editLabel} qaQ={qaQ} qaSec={qaSec} trSec={trSec} trText={trText}
              qaRef={qaRef} trRef={trRef} qaResults={qaResults}
              onEditSheet={setEditSheet}
              onSetEditLabel={setEditLabel}
              onSetQaSec={setQaSec} onSetQaQ={setQaQ}
              onSetTrSec={setTrSec} onSetTrText={setTrText}
              onUpdate={update}
              onDeleteSec={() => handleDeleteSec(si)}
              onAddExercise={(name, isCustom) => handleAddExercise(si, name, isCustom)}
              onAddTransition={() => handleAddTransition(si)}
              onOpenPicker={() => { setPk2(true); setPkI(si); setPS(""); setPTg(null); }}
              onExDragEnd={handleExDragEnd(si)}
              onAddSection={() => handleAddSection(si)}
              onQNotesChange={(text) => update(sections.map((s, i) => i !== si ? s : { ...s, qNotes: text, note: text }))}
              onShowInfo={handleShowInfo}
              onSectionReroll={onSectionReroll ? (mode: "core" | "rogue") => onSectionReroll(si, mode) : undefined}
              onExerciseLock={onExerciseLock ? (exIdx: number) => onExerciseLock(si, exIdx) : undefined}
            />
          ))}
        </SortableContext>
      </DndContext>
      {editSheet && (
        <ExerciseEditSheet
          exercise={editSheet.exercise}
          sectionColor={sections[editSheet.sectionIdx]?.color || G}
          allEx={allEx}
          onSave={updated => handleSaveExercise(editSheet.sectionIdx, updated)}
          onDelete={() => handleDeleteExercise(editSheet.sectionIdx, editSheet.exercise.id, editSheet.exercise.n)}
          onClose={() => setEditSheet(null)}
          onAddTransitionAfter={(text) => {
            const si = editSheet.sectionIdx;
            const sec = sections[si];
            const exIdx = sec.exercises.findIndex(e => e.id === editSheet.exercise.id);
            if (exIdx === -1) return;
            const id = generateId();
            const tr = { id, type: "transition" as const, name: text, n: text, r: "", c: "", nt: "", note: "" };
            const newExercises = [...sec.exercises];
            newExercises.splice(exIdx + 1, 0, tr);
            update(sections.map((s, i) => i !== si ? s : { ...s, exercises: newExercises }));
            setEditSheet(null);
            fl("Transition added");
          }}
        />
      )}
      {/* FIX 4: Exercise info bottom sheet */}
      {infoEx && <ExerciseInfoSheet exData={infoEx} onClose={() => setInfoEx(null)} />}
      {pickerModal}
      {toastEl}
    </>
  );
}
