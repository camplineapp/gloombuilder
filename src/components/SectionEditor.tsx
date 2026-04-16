"use client";

import { useState, useRef } from "react";
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

// ── COLOR CONSTANTS ──────────────────────────────────────────────────────────
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
const T6 = "#5A534C";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid " + BD,
  borderRadius: 10,
  color: T2,
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: F,
};

const sC = [G, A, P, R, "#3b82f6", "#ec4899", "#06b6d4"];

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
    const human = parsed.unit === "sec"
      ? `${parsed.value}-second timer`
      : `${parsed.value}-minute timer`;
    return { icon: "⏱", color: A, text: human };
  }
  if (parsed.mode === "distance") {
    return { icon: "📏", color: P, text: `Distance: ${parsed.value} ${parsed.unit}` };
  }
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
  if (cad === "IC") return "IC";
  if (cad === "OYO") return "OYO";
  if (cad === "time" || ex.mode === "time") return "";
  if (!cad) return "";
  return cad;
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────────
interface ExerciseCardProps {
  ex: SectionExercise;
  sectionColor: string;
  onTap: () => void;
  dragListeners?: Record<string, unknown>;
  isDragging?: boolean;
  allEx?: ExerciseData[];
}

function ExerciseCard({ ex, sectionColor, onTap, dragListeners, isDragging, allEx }: ExerciseCardProps) {
  const isTransition = ex.type === "transition";
  const exName = ex.name || ex.n || "";
  const isCustom = allEx ? !allEx.some(x => x.n.toLowerCase() === exName.toLowerCase()) : false;
  const amountStr = formatExerciseDisplay(ex);
  const cadStr = formatCadenceDisplay(ex);

  return (
    <div
      onClick={onTap}
      style={{
        background: CD,
        border: `1px solid ${BD}`,
        borderLeft: `4px ${isTransition ? "dashed" : "solid"} ${sectionColor}`,
        borderRadius: "0 14px 14px 0",
        padding: "14px 14px 14px 10px",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        userSelect: "none",
        opacity: isDragging ? 0.4 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {/* Drag handle */}
      <div
        {...dragListeners}
        onClick={e => e.stopPropagation()}
        style={{
          color: sectionColor,
          fontSize: 22,
          flexShrink: 0,
          width: 28,
          textAlign: "center",
          opacity: 0.85,
          lineHeight: 1,
          cursor: "grab",
          touchAction: "none",
        }}
      >
        ≡
      </div>

      {/* Card body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isTransition ? (
          <>
            <div style={{
              color: sectionColor,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: F,
            }}>
              <span>↗</span> Transition
            </div>
            <div style={{ color: T2, fontSize: 16, fontStyle: "italic", marginTop: 3, fontWeight: 500, fontFamily: F }}>
              {exName}
            </div>
          </>
        ) : (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}>
              <span style={{ color: T1, fontSize: 19, fontWeight: 700, fontFamily: F, lineHeight: 1.2 }}>
                {exName}
              </span>
              {isCustom && (
                <span style={{
                  fontSize: 10,
                  color: A,
                  background: A + "15",
                  padding: "2px 7px",
                  borderRadius: 4,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontFamily: F,
                }}>
                  Custom
                </span>
              )}
            </div>
            <div style={{
              color: T2,
              fontSize: 16,
              fontWeight: 600,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: F,
            }}>
              {ex.mode === "time" && <span style={{ color: A, fontSize: 14 }}>⏱</span>}
              {ex.mode === "distance" && <span style={{ color: P, fontSize: 14 }}>📏</span>}
              <span>{amountStr}{cadStr ? ` · ${cadStr}` : ""}</span>
            </div>
            {(ex.note || ex.nt) ? (
              <div style={{ color: T3, fontSize: 15, fontStyle: "italic", marginTop: 3, fontWeight: 500, fontFamily: F }}>
                {ex.note || ex.nt}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

// ── SORTABLE EXERCISE CARD ────────────────────────────────────────────────────
function SortableExerciseCard({
  ex, sectionColor, onTap, allEx,
}: { ex: SectionExercise; sectionColor: string; onTap: () => void; allEx?: ExerciseData[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ex.id || ex.n || "x",
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseCard
        ex={ex}
        sectionColor={sectionColor}
        onTap={onTap}
        dragListeners={listeners as Record<string, unknown>}
        isDragging={isDragging}
        allEx={allEx}
      />
    </div>
  );
}

// ── EXERCISE EDIT SHEET ───────────────────────────────────────────────────────
interface EditSheetProps {
  exercise: SectionExercise;
  sectionColor: string;
  allEx: ExerciseData[];
  onSave: (updated: SectionExercise) => void;
  onDelete: () => void;
  onClose: () => void;
}

function ExerciseEditSheet({ exercise, sectionColor, allEx, onSave, onDelete, onClose }: EditSheetProps) {
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

    // Build legacy r for backward compat
    let rLegacy = amountText;
    if (parsed?.mode === "reps") rLegacy = String(parsed.value);

    const updated: SectionExercise = {
      ...exercise,
      name: exName, n: exName,
      mode, value, unit,
      cadence: finalCadence, c: finalCadence,
      r: rLegacy,
      note, nt: note,
    };
    onSave(updated);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111318",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxWidth: 430,
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid " + BD,
          borderBottom: "none",
        }}
      >
        {/* Grab handle */}
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px 12px", fontFamily: F,
        }}>
          <button onClick={onClose} style={{ color: T3, background: "none", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: F, padding: 0 }}>Cancel</button>
          <div style={{ color: T1, fontSize: 17, fontWeight: 700 }}>Edit exercise</div>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ padding: "0 20px 40px", fontFamily: F }}>
          {/* Exercise name (Phase 2: add "Change" tap) */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${sectionColor}30`,
            borderLeft: `4px solid ${sectionColor}`,
            borderRadius: "0 12px 12px 0",
            padding: "14px 16px",
            marginBottom: 24,
          }}>
            <div style={{ color: T1, fontSize: 19, fontWeight: 700, fontFamily: F }}>{exName}</div>
          </div>

          {/* HOW MUCH? */}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>HOW MUCH?</div>
          <input
            value={amountText}
            onChange={e => setAmountText(e.target.value)}
            placeholder="20 · 45 sec · 50 yds..."
            autoFocus
            style={{
              width: "100%", background: "rgba(255,255,255,0.06)",
              border: `2px solid ${sectionColor}66`, borderRadius: 12,
              color: T1, padding: "16px 18px", fontSize: 17, fontWeight: 500,
              outline: "none", boxSizing: "border-box", fontFamily: F,
            }}
          />
          {/* Live classification */}
          {classification && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 16 }}>{classification.icon}</span>
              <span style={{ color: classification.color, fontSize: 14, fontWeight: 600, fontFamily: F }}>{classification.text}</span>
            </div>
          )}
          <div style={{ color: T4, fontSize: 11, fontStyle: "italic", marginTop: 4, marginBottom: 22, fontFamily: F }}>
            Try: 20 · 45 sec · 50 yds · 3 laps
          </div>

          {/* CADENCE */}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>CADENCE</div>
          <div style={{ display: "flex", gap: 8, marginBottom: cadence === "Custom" ? 10 : 22 }}>
            {["IC", "OYO", "Custom"].map(opt => {
              const isSelected = cadence === opt;
              const chipColor = opt === "IC" ? G : opt === "OYO" ? A : T3;
              return (
                <button key={opt} onClick={() => setCadence(opt)} style={{
                  flex: 1, height: 48,
                  background: isSelected ? `${chipColor}20` : "rgba(255,255,255,0.04)",
                  border: `${isSelected ? 2 : 1}px solid ${isSelected ? chipColor : BD}`,
                  color: isSelected ? chipColor : T3,
                  fontSize: 15, fontWeight: isSelected ? 700 : 500,
                  borderRadius: 12, cursor: "pointer", fontFamily: F,
                }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {cadence === "Custom" && (
            <input
              value={customCadence}
              onChange={e => setCustomCadence(e.target.value)}
              placeholder="e.g., 30-20-10 pyramid"
              autoFocus
              style={{ ...ist, marginBottom: 22 }}
            />
          )}

          {/* NOTE */}
          <div style={{ color: T2, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>NOTE (optional)</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            style={{ ...ist, resize: "vertical" as const, marginBottom: 22 }}
          />

          {/* How to do this exercise */}
          {exData && (
            <>
              <div
                onClick={() => setShowHowTo(!showHowTo)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "14px 16px", marginBottom: showHowTo ? 10 : 22,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ color: P, fontSize: 16 }}>?</span>
                <span style={{ color: T2, fontSize: 15, fontWeight: 600, fontFamily: F, flex: 1 }}>How to do this exercise</span>
                <span style={{ color: T4 }}>{showHowTo ? "▲" : "›"}</span>
              </div>
              {showHowTo && (
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "14px 16px", marginBottom: 22,
                }}>
                  {exData.h.split(/(?=\d+\.\s)/).filter(Boolean).map((step, i) => (
                    <div key={i} style={{ color: T3, fontSize: 14, lineHeight: 1.7, marginBottom: 4, fontFamily: F }}>{step.trim()}</div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Save */}
          <button onClick={handleSave} style={{
            width: "100%", padding: "20px 0", background: G, border: "none",
            color: BG, fontSize: 18, fontWeight: 800, borderRadius: 14,
            cursor: "pointer", fontFamily: F, marginBottom: 10,
          }}>
            Save changes
          </button>

          {/* Delete */}
          <button onClick={onDelete} style={{
            width: "100%", padding: "18px 0", background: "transparent",
            border: `2px solid ${R}`, color: R, fontSize: 16, fontWeight: 700,
            borderRadius: 14, cursor: "pointer", fontFamily: F,
          }}>
            Delete exercise
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SECTION EDITOR PROPS ──────────────────────────────────────────────────────
export interface SectionEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  allEx: ExerciseData[];
}

// ── MAIN SECTION EDITOR ───────────────────────────────────────────────────────
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
  const [newSecName, setNewSecName] = useState("");
  const [toast, setToast] = useState("");

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  // dnd-kit sensors (long-press 200ms for mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const update = (newSecs: Section[]) => onSectionsChange(newSecs);

  const handleExDragEnd = (si: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sec = sections[si];
    const oldIdx = sec.exercises.findIndex(e => (e.id || e.n) === active.id);
    const newIdx = sec.exercises.findIndex(e => (e.id || e.n) === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: arrayMove(s.exercises, oldIdx, newIdx) }));
  };

  const handleMoveSec = (si: number, dir: number) => {
    const ni = si + dir;
    if (ni < 0 || ni >= sections.length) return;
    const u = [...sections];
    const m = u.splice(si, 1)[0];
    u.splice(ni, 0, m);
    update(u);
  };

  const handleDeleteSec = (si: number) => {
    const sec = sections[si];
    const hasExercises = sec.exercises.length > 0;
    if (hasExercises && !confirm(`Delete "${sec.name || sec.label}" and all its exercises?`)) return;
    update(sections.filter((_, j) => j !== si));
  };

  const handleAddExercise = (si: number, name: string, isCustom: boolean) => {
    const id = generateId();
    const add: SectionExercise = {
      id, type: "exercise", name, n: name,
      mode: "reps", value: 10, cadence: "IC",
      r: "10", c: "IC", note: "", nt: "",
    };
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setQaQ("");
    fl(name + (isCustom ? " added as custom" : " added"));
    setTimeout(() => qaRef.current?.focus(), 100);
  };

  const handleAddTransition = (si: number) => {
    if (!trText.trim()) return;
    const id = generateId();
    const add: SectionExercise = {
      id, type: "transition", name: trText.trim(), n: trText.trim(),
      r: "", c: "", nt: "", note: "",
    };
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setTrText("");
    setTrSec(null);
    fl("Transition added");
  };

  const handleSaveExercise = (sectionIdx: number, updated: SectionExercise) => {
    update(sections.map((s, si) =>
      si !== sectionIdx ? s : {
        ...s,
        exercises: s.exercises.map(e => (e.id === updated.id || e.n === updated.n) ? updated : e),
      }
    ));
    setEditSheet(null);
  };

  const handleDeleteExercise = (sectionIdx: number, exId: string | undefined, exName: string) => {
    update(sections.map((s, si) =>
      si !== sectionIdx ? s : {
        ...s,
        exercises: s.exercises.filter(e => exId ? e.id !== exId : e.n !== exName),
      }
    ));
    setEditSheet(null);
  };

  const handleAddSection = () => {
    if (!newSecName.trim()) return;
    const color = sC[sections.length % sC.length];
    const id = generateId();
    const label = newSecName.trim();
    update([...sections, { id, name: label, label, color, qNotes: "", note: "", exercises: [] }]);
    setNewSecName("");
  };

  const handleRenameSection = (si: number, newLabel: string) => {
    update(sections.map((s, i) => i !== si ? s : { ...s, name: newLabel, label: newLabel }));
    setEditLabel(null);
  };

  const handleQNotesChange = (si: number, text: string) => {
    update(sections.map((s, i) => i !== si ? s : { ...s, qNotes: text, note: text }));
  };

  const handleAddFromPicker = (si: number, exName: string) => {
    const id = generateId();
    const add: SectionExercise = { id, type: "exercise", name: exName, n: exName, mode: "reps", value: 10, cadence: "IC", r: "10", c: "IC", note: "", nt: "" };
    update(sections.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setPk2(false);
    fl(exName + " added");
  };

  // Quick-add search
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

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300, pointerEvents: "none" }}>{toast}</div>
  ) : null;

  // ── Exercise Picker Modal (Phase 1: keep existing design, Phase 3 rebuilds) ──
  const pickerSec = sections[pkI];
  const pickerFi = pk2 && pickerSec ? (() => {
    const fi = allEx.filter(e => {
      const ms = !pS || e.n.toLowerCase().includes(pS.toLowerCase()) || e.f.toLowerCase().includes(pS.toLowerCase()) || (e.d || "").toLowerCase().includes(pS.toLowerCase());
      const mt = !pTg || e.t.includes(pTg);
      return ms && mt;
    });
    if (pS.trim()) {
      const q = pS.toLowerCase();
      fi.sort((a, b) => {
        const sc = (e: typeof a) => {
          if (e.n.toLowerCase() === q) return 0;
          if (e.n.toLowerCase().startsWith(q)) return 1;
          if (e.n.toLowerCase().includes(q)) return 2;
          if (e.f.toLowerCase().includes(q)) return 3;
          return 4;
        };
        return sc(a) - sc(b);
      });
    }
    return fi;
  })() : [];

  const pickerModal = pk2 && pickerSec ? (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 150, display: "flex", flexDirection: "column", fontFamily: F }}>
      <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ color: T1, fontSize: 18, fontWeight: 700 }}>Browse library</span>
          <div style={{ color: pickerSec.color, fontSize: 12, marginTop: 2 }}>{pickerSec.name || pickerSec.label} · adding to this section</div>
        </div>
        <span onClick={() => setPk2(false)} style={{ color: T4, cursor: "pointer", fontSize: 22 }}>✕</span>
      </div>
      <div style={{ padding: "0 24px 10px" }}>
        <input value={pS} onChange={e => setPS(e.target.value)} placeholder="Search exercises..." autoFocus style={{ ...ist, borderRadius: 12, padding: "13px 16px", fontSize: 15 }} />
      </div>
      <div style={{ padding: "0 24px 10px", display: "flex", gap: 5, flexWrap: "wrap" }}>
        {TAGS.map(t => {
          const sel = pTg === t;
          return <button key={t} onClick={() => setPTg(sel ? null : t)} style={{ fontFamily: F, background: sel ? A + "20" : "rgba(255,255,255,0.04)", color: sel ? A : T5, border: "1px solid " + (sel ? A + "30" : BD), padding: "5px 11px", borderRadius: 20, fontSize: 10, cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>{t}</button>;
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        {pickerFi.map(e => (
          <div key={e.n} style={{ padding: "14px 16px", background: CD, border: "1px solid " + BD, borderRadius: 14, marginBottom: 6, display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, cursor: "pointer" }}>
              <div style={{ color: T1, fontWeight: 700, fontSize: 16, fontFamily: F }}>{e.n}</div>
              <div style={{ color: T4, fontSize: 12, marginTop: 3, fontFamily: F }}>{e.d || e.f}</div>
            </div>
            <button onClick={() => handleAddFromPicker(pkI, e.n)} style={{ fontFamily: F, background: G, color: BG, border: "none", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", flexShrink: 0, marginLeft: 12 }}>+ Add</button>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Sections */}
      {sections.map((sec, si) => {
        const sColor = sec.color;
        const secLabel = sec.name || sec.label || "Section";
        const exIds = sec.exercises.map(e => e.id || e.n || String(si * 1000 + sec.exercises.indexOf(e)));

        return (
          <div key={sec.id || si} style={{ marginTop: 24 }}>
            {/* Section header — Phase 1 keeps ▲▼ for sections (Phase 2: drag) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Section ▲▼ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => handleMoveSec(si, -1)} disabled={si === 0} style={{ background: "none", border: "none", color: si === 0 ? T6 : T4, cursor: si === 0 ? "default" : "pointer", fontSize: 10, padding: "1px 4px" }}>▲</button>
                  <button onClick={() => handleMoveSec(si, 1)} disabled={si === sections.length - 1} style={{ background: "none", border: "none", color: si === sections.length - 1 ? T6 : T4, cursor: si === sections.length - 1 ? "default" : "pointer", fontSize: 10, padding: "1px 4px" }}>▼</button>
                </div>
                {/* Section name / rename */}
                {editLabel === si ? (
                  <input
                    autoFocus
                    value={secLabel}
                    maxLength={60}
                    onChange={e => {
                      update(sections.map((s, i) => i !== si ? s : { ...s, name: e.target.value, label: e.target.value }));
                    }}
                    onBlur={() => setEditLabel(null)}
                    onKeyDown={e => { if (e.key === "Enter") setEditLabel(null); }}
                    style={{ fontFamily: F, color: sColor, fontSize: 14, textTransform: "uppercase", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px", outline: "none", width: 200, fontWeight: 700 }}
                  />
                ) : (
                  <div
                    onClick={() => setEditLabel(si)}
                    style={{ color: sColor, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", cursor: "pointer", fontFamily: F }}
                  >
                    {secLabel} ({sec.exercises.length})
                  </div>
                )}
              </div>
              {/* Delete section (keep first section protected) */}
              {si > 0 ? (
                <button onClick={() => handleDeleteSec(si)} style={{ fontFamily: F, background: "rgba(239,68,68,0.08)", color: R, border: "1px solid rgba(239,68,68,0.12)", padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>✕</button>
              ) : null}
            </div>

            {/* Exercises — dnd-kit sorted within section */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExDragEnd(si)}>
              <SortableContext items={exIds} strategy={verticalListSortingStrategy}>
                {sec.exercises.map(ex => (
                  <SortableExerciseCard
                    key={ex.id || ex.n}
                    ex={ex}
                    sectionColor={sColor}
                    allEx={allEx}
                    onTap={() => setEditSheet({ sectionIdx: si, exercise: ex })}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Quick-add input */}
            <div style={{ position: "relative", marginTop: sec.exercises.length > 0 ? 8 : 0 }}>
              <input
                ref={qaSec === si ? qaRef : null}
                value={qaSec === si ? qaQ : ""}
                onFocus={() => { setQaSec(si); setQaQ(""); }}
                onChange={e => { setQaSec(si); setQaQ(e.target.value); }}
                onKeyDown={e => {
                  if (e.key === "Enter" && qaQ.trim().length >= 2 && qaSec === si) {
                    handleAddExercise(si, qaQ.trim(), true);
                  }
                }}
                placeholder="Type exercise name..."
                style={{
                  ...ist,
                  border: `2px solid ${qaSec === si && qaQ.length >= 2 ? sColor + "66" : BD}`,
                  background: `${sColor}04`,
                  fontSize: 17,
                  padding: "16px 18px",
                  borderRadius: 12,
                }}
              />
              {/* Autocomplete dropdown */}
              {qaSec === si && qaQ.length >= 2 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#1a1a1e", border: "1px solid " + sColor + "30", borderRadius: 12, marginTop: 4, overflow: "hidden" }}>
                  {/* Custom always on top */}
                  <div
                    onClick={() => handleAddExercise(si, qaQ.trim(), true)}
                    style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: A + "06", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <div style={{ fontFamily: F, fontSize: 14, color: A, fontWeight: 600 }}>Add &ldquo;{qaQ.trim()}&rdquo; as custom</div>
                      <div style={{ fontFamily: F, fontSize: 11, color: T5, marginTop: 2 }}>Won&apos;t be linked to exercise database</div>
                    </div>
                    <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: A, background: A + "15", padding: "5px 12px", borderRadius: 6 }}>+ Add</span>
                  </div>
                  {/* Database matches */}
                  {qaResults.map((ex, i) => (
                    <div
                      key={i}
                      onClick={() => handleAddExercise(si, ex.n, false)}
                      style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < qaResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                    >
                      <div>
                        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T1 }}>{ex.n}</div>
                        {ex.f !== ex.n ? <div style={{ fontFamily: F, fontSize: 11, color: T5, marginTop: 2 }}>{ex.f}</div> : null}
                      </div>
                      <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: sColor, background: sColor + "15", padding: "5px 12px", borderRadius: 6 }}>+ Add</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Browse library | Transition */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => { setPk2(true); setPkI(si); setPS(""); setPTg(null); }}
                style={{ flex: 1, height: 44, background: CD, border: "1px solid " + BD, color: T2, fontSize: 14, fontWeight: 700, borderRadius: 10, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <span style={{ color: sColor }}>⌕</span> Browse library
              </button>
              <button
                onClick={() => { setTrSec(si); setTrText(""); setTimeout(() => trRef.current?.focus(), 100); }}
                style={{ flex: 1, height: 44, background: sColor + "08", border: "1px solid " + sColor + "30", color: sColor, fontSize: 14, fontWeight: 700, borderRadius: 10, cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <span>↗</span> Transition
              </button>
            </div>

            {/* Transition text input */}
            {trSec === si && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  ref={trRef}
                  value={trText}
                  onChange={e => setTrText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddTransition(si); }}
                  placeholder="e.g., Mosey to the bleachers"
                  style={{ ...ist, flex: 1, fontStyle: "italic", borderColor: sColor + "40" }}
                />
                <button onClick={() => handleAddTransition(si)} style={{ fontFamily: F, background: sColor + "15", color: sColor, border: "1px solid " + sColor + "30", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
              </div>
            )}

            {/* Q notes (Phase 1: textarea at bottom; Phase 2: moves to top as collapsible card) */}
            <textarea
              value={sec.qNotes || sec.note || ""}
              onChange={e => handleQNotesChange(si, e.target.value)}
              placeholder={`Q notes for ${secLabel}...`}
              rows={2}
              style={{ ...ist, marginTop: 10, resize: "vertical" as const, fontStyle: "italic", background: "rgba(255,255,255,0.03)", borderColor: BD }}
            />
          </div>
        );
      })}

      {/* + Add Section at bottom (Phase 2: moves inline after each section) */}
      <div style={{ marginTop: 28, display: "flex", gap: 8 }}>
        <input
          value={newSecName}
          maxLength={60}
          onChange={e => setNewSecName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAddSection(); }}
          placeholder="New section name..."
          style={{ ...ist, flex: 1 }}
        />
        <button
          onClick={handleAddSection}
          style={{ fontFamily: F, background: "rgba(255,255,255,0.04)", color: T3, border: "1px solid " + BD, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
        >
          + Section
        </button>
      </div>

      {/* Exercise Edit Sheet */}
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

      {/* Exercise Picker Modal */}
      {pickerModal}

      {toastEl}
    </>
  );
}
