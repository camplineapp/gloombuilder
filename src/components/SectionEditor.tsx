"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section, SectionExercise, ExerciseData } from "@/lib/exercises";
import { TAGS, parseSmartText, generateId } from "@/lib/exercises";

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
const sC = [G, A, P, R, "#3b82f6", "#ec4899", "#06b6d4"];

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
  return { icon: "🔢", color: T3, text: `${parsed.value} reps` };
}

function formatExerciseDisplay(ex: SectionExercise): string {
  if (ex.mode === "time") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "distance") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "reps" && ex.value !== undefined && ex.value !== "") return `${ex.value} reps`;
  if (ex.r) return `x${ex.r}`;
  return "";
}

function formatCadenceDisplay(ex: SectionExercise): string {
  const cad = ex.cadence || ex.c || "";
  if (ex.mode === "time" || ex.mode === "distance") return "";
  if (cad === "IC") return "IC";
  if (cad === "OYO") return "OYO";
  return cad || "";
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, sectionColor, onTap, onDelete, dragListeners, isDragging, allEx }: {
  ex: SectionExercise; sectionColor: string; onTap: () => void; onDelete?: () => void;
  dragListeners?: Record<string, unknown>; isDragging?: boolean; allEx?: ExerciseData[];
}) {
  const isTransition = ex.type === "transition";
  const exName = ex.name || ex.n || "";
  const isCustom = allEx ? !allEx.some(x => x.n.toLowerCase() === exName.toLowerCase()) : false;

  return (
    <div style={{ background: CD, border: `1px solid ${BD}`, borderLeft: `4px ${isTransition ? "dashed" : "solid"} ${sectionColor}`, borderRadius: "0 14px 14px 0", padding: "14px 14px 14px 10px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, userSelect: "none", opacity: isDragging ? 0.4 : 1, transition: "opacity 0.15s" }}>
      <div {...dragListeners} onClick={e => e.stopPropagation()} style={{ color: sectionColor, fontSize: 22, flexShrink: 0, width: 28, textAlign: "center", opacity: 0.85, lineHeight: 1, cursor: "grab", touchAction: "none" }}>≡</div>
      <div onClick={onTap} style={{ flex: 1, minWidth: 0, cursor: "pointer", overflow: "hidden" }}>
        {isTransition ? (
          <>
            <div style={{ color: sectionColor, fontSize: 13, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, fontFamily: F }}>↗ Transition</div>
            <div style={{ color: T2, fontSize: 16, fontStyle: "italic", marginTop: 3, fontWeight: 500, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exName}</div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap", overflow: "hidden" }}>
              <span style={{ color: T1, fontSize: 19, fontWeight: 700, fontFamily: F, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{exName}</span>
              {isCustom && <span style={{ fontSize: 10, color: A, background: A + "15", padding: "2px 7px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: F, flexShrink: 0 }}>Custom</span>}
            </div>
            <div style={{ color: T2, fontSize: 15, fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 6, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ex.mode === "time" && <span style={{ color: A, fontSize: 14, flexShrink: 0 }}>⏱</span>}
              {ex.mode === "distance" && <span style={{ color: P, fontSize: 14, flexShrink: 0 }}>📏</span>}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatExerciseDisplay(ex)}{formatCadenceDisplay(ex) ? ` · ${formatCadenceDisplay(ex)}` : ""}</span>
            </div>
            {(ex.note || ex.nt) ? <div style={{ color: T3, fontSize: 13, fontStyle: "italic", marginTop: 3, fontWeight: 500, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.note || ex.nt}</div> : null}
          </>
        )}
      </div>
      {/* Quick delete button */}
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ flexShrink: 0, width: 32, height: 32, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#ef4444", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}
        >✕</button>
      )}
    </div>
  );
}

function SortableExerciseCard({ ex, exKey, sectionColor, onTap, onDelete, allEx }: { ex: SectionExercise; exKey?: string; sectionColor: string; onTap: () => void; onDelete?: () => void; allEx?: ExerciseData[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exKey || ex.id || ex.n || "x" });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes}>
      <ExerciseCard ex={ex} sectionColor={sectionColor} onTap={onTap} onDelete={onDelete} dragListeners={listeners as Record<string, unknown>} isDragging={isDragging} allEx={allEx} />
    </div>
  );
}

// ── Q NOTES ───────────────────────────────────────────────────────────────────
function QNotes({ section, onChange }: { section: Section; onChange: (text: string) => void }) {
  const color = section.color;
  const text = section.qNotes || section.note || "";
  const hasNotes = text.trim().length > 0;
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(text);
  useEffect(() => { setDraft(text); }, [text]);

  if (!hasNotes && !expanded) {
    return (
      <button onClick={() => setExpanded(true)} style={{ width: "100%", background: color + "06", border: "1px solid " + color + "30", borderRadius: 10, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: F, textAlign: "left" }}>
        <span style={{ color, fontSize: 14 }}>✎</span>
        <span style={{ color, fontSize: 14, fontWeight: 700 }}>Add Q notes for this section</span>
        <span style={{ color, marginLeft: "auto", fontSize: 18, lineHeight: 1 }}>+</span>
      </button>
    );
  }

  if (hasNotes && !expanded) {
    return (
      <div style={{ background: color + "0D", border: "1px solid " + color + "40", borderLeft: "4px solid " + color, borderRadius: "0 12px 12px 0", padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ color, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: F }}>Q Notes</span>
          <button onClick={() => setExpanded(true)} style={{ background: "none", border: "none", color, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: F, marginLeft: "auto" }}>Edit</button>
        </div>
        <div style={{ color: T2, fontSize: 15, fontStyle: "italic", lineHeight: 1.5, fontFamily: F, whiteSpace: "pre-wrap" }}>{text}</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontFamily: F }}>Q Notes</div>
      <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={3} placeholder="Instructions, focus areas, encouragement..." style={{ ...ist, resize: "vertical" as const, fontStyle: "italic", borderColor: color + "40", background: color + "06" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button onClick={() => { onChange(draft); setExpanded(false); }} style={{ fontFamily: F, background: color + "15", color, border: "1px solid " + color + "30", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
        <button onClick={() => { setDraft(text); setExpanded(false); }} style={{ fontFamily: F, background: "none", color: T4, border: "1px solid " + BD, padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancel</button>
        {hasNotes && <button onClick={() => { onChange(""); setDraft(""); setExpanded(false); }} style={{ fontFamily: F, background: "none", color: R, border: "none", padding: "8px 0", fontSize: 13, cursor: "pointer", marginLeft: "auto" }}>Remove</button>}
      </div>
    </div>
  );
}

// ── EXERCISE EDIT SHEET ───────────────────────────────────────────────────────
function ExerciseEditSheet({ exercise, sectionColor, allEx, onSave, onDelete, onClose }: {
  exercise: SectionExercise; sectionColor: string; allEx: ExerciseData[];
  onSave: (updated: SectionExercise) => void; onDelete: () => void; onClose: () => void;
}) {
  const exName = exercise.name || exercise.n || "";
  const [amountText, setAmountText] = useState(exerciseToAmountString(exercise));
  const initCad = exercise.cadence || exercise.c || "IC";
  const isInitCustom = initCad !== "IC" && initCad !== "OYO" && initCad !== "";
  const [cadence, setCadence] = useState(isInitCustom ? "Custom" : (initCad || "IC"));
  const [customCadence, setCustomCadence] = useState(isInitCustom ? initCad : "");
  const [note, setNote] = useState(exercise.note || exercise.nt || "");
  const [showHowTo, setShowHowTo] = useState(false);
  const classification = classifyInput(amountText);
  const exData = allEx.find(x => x.n.toLowerCase() === exName.toLowerCase());

  const handleSave = () => {
    const parsed = parseSmartText(amountText);
    const finalCadence = cadence === "Custom" ? (customCadence.trim() || "OYO") : cadence;
    const mode = parsed?.mode || "reps";
    const value = parsed?.value ?? amountText;
    const unit = parsed?.unit;
    let rLegacy = amountText;
    if (parsed?.mode === "reps") rLegacy = String(parsed.value);
    onSave({ ...exercise, name: exName, n: exName, mode, value, unit, cadence: finalCadence, c: finalCadence, r: rLegacy, note, nt: note });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111318", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto", border: "1px solid " + BD, borderBottom: "none" }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "12px auto 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px" }}>
          <button onClick={onClose} style={{ color: T3, background: "none", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: F }}>Cancel</button>
          <div style={{ color: T1, fontSize: 17, fontWeight: 700, fontFamily: F }}>Edit exercise</div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ padding: "0 20px 40px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${sectionColor}30`, borderLeft: `4px solid ${sectionColor}`, borderRadius: "0 12px 12px 0", padding: "14px 16px", marginBottom: 24 }}>
            <div style={{ color: T1, fontSize: 19, fontWeight: 700, fontFamily: F }}>{exName}</div>
          </div>
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>HOW MUCH?</div>
          <input value={amountText} onChange={e => setAmountText(e.target.value)} placeholder="20 · 45 sec · 50 yds..." autoFocus style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `2px solid ${sectionColor}66`, borderRadius: 12, color: T1, padding: "16px 18px", fontSize: 17, fontWeight: 500, outline: "none", boxSizing: "border-box", fontFamily: F }} />
          {classification && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 16 }}>{classification.icon}</span>
              <span style={{ color: classification.color, fontSize: 14, fontWeight: 600, fontFamily: F }}>{classification.text}</span>
            </div>
          )}
          <div style={{ color: T4, fontSize: 11, fontStyle: "italic", marginTop: 4, marginBottom: 22, fontFamily: F }}>Try: 20 · 45 sec · 50 yds · 3 laps</div>
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>CADENCE</div>
          <div style={{ display: "flex", gap: 8, marginBottom: cadence === "Custom" ? 10 : 22 }}>
            {["IC", "OYO", "Custom"].map(opt => {
              const isSelected = cadence === opt;
              const chipColor = opt === "IC" ? G : opt === "OYO" ? A : T3;
              return <button key={opt} onClick={() => setCadence(opt)} style={{ flex: 1, height: 48, background: isSelected ? `${chipColor}20` : "rgba(255,255,255,0.04)", border: `${isSelected ? 2 : 1}px solid ${isSelected ? chipColor : BD}`, color: isSelected ? chipColor : T3, fontSize: 15, fontWeight: isSelected ? 700 : 500, borderRadius: 12, cursor: "pointer", fontFamily: F }}>{opt}</button>;
            })}
          </div>
          {cadence === "Custom" && <input value={customCadence} onChange={e => setCustomCadence(e.target.value)} placeholder="e.g., 30-20-10 pyramid" autoFocus style={{ ...ist, marginBottom: 22 }} />}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>NOTE (optional)</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." rows={2} style={{ ...ist, resize: "vertical" as const, marginBottom: 22 }} />
          {exData && (
            <>
              <div onClick={() => setShowHowTo(!showHowTo)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: showHowTo ? 10 : 22, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: P, fontSize: 16 }}>?</span>
                <span style={{ color: T2, fontSize: 15, fontWeight: 600, fontFamily: F, flex: 1 }}>How to do this exercise</span>
                <span style={{ color: T4 }}>{showHowTo ? "▲" : "›"}</span>
              </div>
              {showHowTo && <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>{exData.h.split(/(?=\d+\.\s)/).filter(Boolean).map((step, i) => <div key={i} style={{ color: T3, fontSize: 14, lineHeight: 1.7, marginBottom: 4, fontFamily: F }}>{step.trim()}</div>)}</div>}
            </>
          )}
          <button onClick={handleSave} style={{ width: "100%", padding: "20px 0", background: G, border: "none", color: BG, fontSize: 18, fontWeight: 800, borderRadius: 14, cursor: "pointer", fontFamily: F, marginBottom: 10 }}>Save changes</button>
          <button onClick={onDelete} style={{ width: "100%", padding: "18px 0", background: "transparent", border: `2px solid ${R}`, color: R, fontSize: 16, fontWeight: 700, borderRadius: 14, cursor: "pointer", fontFamily: F }}>Delete exercise</button>
        </div>
      </div>
    </div>
  );
}

// ── SORTABLE SECTION (separate component so useSortable works per-section) ────
function SortableSectionBlock({
  sec, si, sections, allEx, sensors,
  editLabel, qaQ, qaSec, trSec, trText,
  qaRef, trRef, qaResults,
  onEditSheet, onSetEditLabel, onSetQaSec, onSetQaQ, onSetTrSec, onSetTrText,
  onDeleteSec, onAddExercise, onAddTransition, onQNotesChange,
  onOpenPicker, onExDragEnd, onAddSection, onUpdate,
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
  onDeleteSec: () => void;
  onAddExercise: (name: string, isCustom: boolean) => void;
  onAddTransition: () => void;
  onQNotesChange: (text: string) => void;
  onOpenPicker: () => void;
  onExDragEnd: (event: DragEndEvent) => void;
  onAddSection: () => void;
  onUpdate: (secs: Section[]) => void;
}) {
  const secId = sec.id || sec.label || String(si);
  const sColor = sec.color;
  const exIds = sec.exercises.map((e, idx) => e.id ? `${e.id}-${idx}` : (e.n ? `${e.n}-${idx}` : `ex-${si}-${idx}`));

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: secId });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1, marginTop: 20 }} {...attributes}>

      {/* Section Header Card */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: sColor + "14", borderLeft: `4px solid ${sColor}`, borderRadius: "0 12px 12px 0", padding: "12px 12px 12px 10px", marginBottom: 10 }}>
        {/* Drag handle — only this triggers section drag */}
        <div {...listeners} style={{ color: sColor, fontSize: 22, flexShrink: 0, width: 24, textAlign: "center", opacity: 0.9, lineHeight: 1, cursor: "grab", touchAction: "none" }}>≡</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editLabel === si ? (
            <input
              autoFocus
              value={sec.name || sec.label || ""}
              maxLength={60}
              onChange={e => onUpdate(sections.map((s, i) => i !== si ? s : { ...s, name: e.target.value, label: e.target.value }))}
              onBlur={() => onSetEditLabel(null)}
              onKeyDown={e => { if (e.key === "Enter") onSetEditLabel(null); }}
              style={{ fontFamily: F, color: sColor, fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", background: "rgba(255,255,255,0.06)", border: "1px solid " + sColor + "40", borderRadius: 8, padding: "5px 10px", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
          ) : (
            <div style={{ color: sColor, fontSize: 20, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sec.name || sec.label}
            </div>
          )}
        </div>
        <button onClick={() => onSetEditLabel(si)} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: T2, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: F }}>✎</button>
        <button onClick={onDeleteSec} style={{ width: 36, height: 36, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: R, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: F }}>✕</button>
      </div>

      {/* Q Notes — TOP of section */}
      <QNotes section={sec} onChange={onQNotesChange} />

      {/* Exercise cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onExDragEnd}>
        <SortableContext items={exIds} strategy={verticalListSortingStrategy}>
          {sec.exercises.map((ex, exIdx) => (
            <SortableExerciseCard key={ex.id ? `${ex.id}-${exIdx}` : `${ex.n}-${exIdx}`} exKey={ex.id ? `${ex.id}-${exIdx}` : `${ex.n}-${exIdx}`} ex={ex} sectionColor={sColor} allEx={allEx} onTap={() => onEditSheet({ sectionIdx: si, exercise: ex })} onDelete={() => { const exId = ex.id; const exName = ex.n || ""; onUpdate(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.filter(e => exId ? e.id !== exId : e.n !== exName) })); }} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Quick-add input */}
      <div style={{ position: "relative", marginTop: sec.exercises.length > 0 ? 8 : 0 }}>
        <input
          ref={qaSec === si ? qaRef : null}
          value={qaSec === si ? qaQ : ""}
          onFocus={() => { onSetQaSec(si); onSetQaQ(""); }}
          onChange={e => { onSetQaSec(si); onSetQaQ(e.target.value); }}
          onKeyDown={e => { if (e.key === "Enter" && qaQ.trim().length >= 2 && qaSec === si) onAddExercise(qaQ.trim(), true); }}
          placeholder="Type exercise name..."
          style={{ width: "100%", background: `${sColor}04`, border: `2px solid ${qaSec === si && qaQ.length >= 2 ? sColor + "66" : BD}`, borderRadius: 12, color: T2, padding: "16px 18px", fontSize: 17, outline: "none", boxSizing: "border-box", fontFamily: F }}
        />
        {qaSec === si && qaQ.length >= 2 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#1a1a1e", border: "1px solid " + sColor + "30", borderRadius: 12, marginTop: 4, overflow: "hidden" }}>
            <div onClick={() => onAddExercise(qaQ.trim(), true)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: A + "06", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ fontFamily: F, fontSize: 14, color: A, fontWeight: 600 }}>Add &ldquo;{qaQ.trim()}&rdquo; as custom</div>
                <div style={{ fontFamily: F, fontSize: 11, color: T5, marginTop: 2 }}>Won&apos;t be linked to exercise database</div>
              </div>
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: A, background: A + "15", padding: "5px 12px", borderRadius: 6 }}>+ Add</span>
            </div>
            {qaResults.map((ex, i) => (
              <div key={i} onClick={() => onAddExercise(ex.n, false)} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < qaResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div>
                  <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T1 }}>{ex.n}</div>
                  {ex.f !== ex.n && <div style={{ fontFamily: F, fontSize: 11, color: T5, marginTop: 2 }}>{ex.f}</div>}
                </div>
                <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: sColor, background: sColor + "15", padding: "5px 12px", borderRadius: 6 }}>+ Add</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse library | Transition */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={onOpenPicker} style={{ flex: 1, height: 44, background: CD, border: "1px solid " + BD, color: T2, fontSize: 14, fontWeight: 700, borderRadius: 10, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ color: sColor }}>⌕</span> Browse library
        </button>
        <button onClick={() => { onSetTrSec(si); onSetTrText(""); setTimeout(() => trRef.current?.focus(), 100); }} style={{ flex: 1, height: 44, background: sColor + "08", border: "1px solid " + sColor + "30", color: sColor, fontSize: 14, fontWeight: 700, borderRadius: 10, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span>↗</span> Transition
        </button>
      </div>

      {/* Transition input */}
      {trSec === si && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input ref={trRef} value={trText} onChange={e => onSetTrText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") onAddTransition(); }} placeholder="e.g., Mosey to the bleachers" style={{ ...ist, flex: 1, fontStyle: "italic", borderColor: sColor + "40" }} />
          <button onClick={onAddTransition} style={{ fontFamily: F, background: sColor + "15", color: sColor, border: "1px solid " + sColor + "30", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
        </div>
      )}

      {/* + Add Section — after EVERY section */}
      <button onClick={onAddSection} style={{ width: "100%", marginTop: 16, background: "rgba(255,255,255,0.028)", border: "2px dashed rgba(255,255,255,0.18)", borderRadius: 12, padding: "14px 0", color: T3, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        + Add Section
      </button>
    </div>
  );
}

// ── SECTION EDITOR (MAIN) ─────────────────────────────────────────────────────
export interface SectionEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  allEx: ExerciseData[];
}

export default function SectionEditor({ sections, onSectionsChange, allEx }: SectionEditorProps) {
  const [editSheet, setEditSheet] = useState<{ sectionIdx: number; exercise: SectionExercise } | null>(null);
  const [editLabel, setEditLabel] = useState<number | null>(null);
  const [qaQ, setQaQ] = useState("");
  const [qaSec, setQaSec] = useState<number | null>(null);
  const qaRef = useRef<HTMLInputElement>(null);
  const [trSec, setTrSec] = useState<number | null>(null);
  const [trText, setTrText] = useState("");
  const trRef = useRef<HTMLInputElement>(null);
  const [pk2, setPk2] = useState(false);
  const [pkI, setPkI] = useState(0);
  const [pS, setPS] = useState("");
  const [pTg, setPTg] = useState<string | null>(null);
  const [toast, setToast] = useState("");

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
    const oi = sec.exercises.findIndex(e => (e.id || e.n) === active.id);
    const ni = sec.exercises.findIndex(e => (e.id || e.n) === over.id);
    if (oi === -1 || ni === -1) return;
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: arrayMove(s.exercises, oi, ni) }));
  };

  const handleDeleteSec = (si: number) => {
    const sec = sections[si];
    if (sec.exercises.length > 0 && !confirm(`Delete "${sec.name || sec.label}" and all its exercises?`)) return;
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
    const color = sC[(afterIdx + 1) % sC.length];
    const id = generateId();
    const newSec: Section = { id, name: "New Section", label: "New Section", color, qNotes: "", note: "", exercises: [] };
    const next = [...sections];
    next.splice(afterIdx + 1, 0, newSec);
    update(next);
    setTimeout(() => setEditLabel(afterIdx + 1), 60);
  };

  const handleSaveExercise = (si: number, updated: SectionExercise) => {
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.map(e => (e.id === updated.id || e.n === updated.n) ? updated : e) }));
    setEditSheet(null);
  };

  const handleDeleteExercise = (si: number, exId: string | undefined, exName: string) => {
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.filter(e => exId ? e.id !== exId : e.n !== exName) }));
    setEditSheet(null);
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
          <div key={e.n} style={{ padding: "14px 16px", background: CD, border: "1px solid " + BD, borderRadius: 14, marginBottom: 6, display: "flex", alignItems: "center" }}>
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
              onQNotesChange={(text) => update(sections.map((s, i) => i !== si ? s : { ...s, qNotes: text, note: text }))}
              onOpenPicker={() => { setPk2(true); setPkI(si); setPS(""); setPTg(null); }}
              onExDragEnd={handleExDragEnd(si)}
              onAddSection={() => handleAddSection(si)}
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
        />
      )}
      {pickerModal}
      {toastEl}
    </>
  );
}
