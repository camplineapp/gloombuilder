"use client";

import { useState, useEffect, useRef } from "react";
import { EX, mapSupabaseExercise } from "@/lib/exercises";
import type { Section, SectionExercise, ExerciseData } from "@/lib/exercises";
import { loadSeedExercises } from "@/lib/db";
import { parseNotepad, type ParseResult } from "@/lib/notepadParser";
import { DRAFT_KEYS, loadDraft, saveDraft, clearDraft, PICKUP_INTENT_KEY } from "@/lib/drafts";

type NotepadDraft = {
  title: string;
  text: string;
};

const G = "#22c55e";
const A = "#f59e0b";
const BG = "#0E0E10";
const CARD_BG = "#111114";
const EX_BG = "#1a1a1f";
const BD = "rgba(255,255,255,0.07)";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";
const MONO = "'Courier New', Courier, monospace";

const ist: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, borderRadius: 10,
  color: T2, padding: "12px 14px", fontSize: 17, outline: "none", boxSizing: "border-box", fontFamily: F,
};

interface NotepadScreenProps {
  onClose: () => void;
  onSave: (beatdown: {
    nm: string;
    desc: string;
    d: string;
    secs: Section[];
    tg: string[];
    dur: string | null;
    sites: string[];
    eq: string[];
    isPublic: boolean;
    fromNotepad: true;
  }) => Promise<string | null>;
  onSavedNew: (newId: string) => void;
  userExercises: { id: string; nm: string; desc: string; tags: string[]; how: string }[];
  profName: string;
}

const PLACEHOLDER = `Warmup
Side Straddle Hop x20
Imperial Walker x20
Mountain Climber x10
- Slow and controlled

The Thang
- Finish 5 Rounds
Merkin 10
> Mosey to corner
Squat 20

Mary
American Hammer x20
Plank 60sec`;

type HelpRow = { key: string; desc: string; warning?: string };
const HELP_ROWS: HelpRow[] = [
  {
    key: "Section",
    desc: "A blank line above creates a new section.",
    warning: "Don't leave a blank line between a section header and its first exercise.",
  },
  { key: "x10", desc: "Add x10 or 60sec for reps or time." },
  { key: "- text", desc: "Coaching note for the line above." },
  { key: "> text", desc: "Mosey or run between exercises." },
];

export default function NotepadScreen({ onClose, onSave, onSavedNew, userExercises }: NotepadScreenProps) {
  const draftKey = DRAFT_KEYS.notepadDraft;
  // Modified Flavor B + Pick-up signal: only restore if the user
  // explicitly tapped Pick-up on Home (one-shot sessionStorage flag).
  // Drafts continue to autosave; Pick-up card on Home is the recovery path.
  const initialDraft = (() => {
    if (typeof window === "undefined") return null;
    if (sessionStorage.getItem(PICKUP_INTENT_KEY) !== "true") return null;
    sessionStorage.removeItem(PICKUP_INTENT_KEY);
    return loadDraft<NotepadDraft>(draftKey);
  })();

  const [title, setTitle] = useState(initialDraft?.data.title ?? "");
  const [text, setText] = useState(initialDraft?.data.text ?? "");
  const [showHelp, setShowHelp] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [parsedResult, setParsedResult] = useState<ParseResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [allEx, setAllEx] = useState<ExerciseData[]>(EX);

  useEffect(() => {
    if (!title.trim() && !text.trim()) return;
    const timer = setTimeout(() => {
      saveDraft<NotepadDraft>(draftKey, { title, text });
    }, 800);
    return () => clearTimeout(timer);
  }, [title, text, draftKey]);

  const userExRef = useRef(userExercises);
  userExRef.current = userExercises;

  // Merge seed + user exercises into the parser library (mirrors BuilderScreen 137-155)
  useEffect(() => {
    loadSeedExercises().then(rows => {
      if (rows.length > 0) {
        const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
        const seedNames = new Set(mapped.map(e => e.n.toLowerCase()));
        const userMapped: ExerciseData[] = (userExRef.current || []).map(ux => ({
          n: ux.nm, f: ux.nm, t: ux.tags || [], s: [], h: ux.how || "", d: ux.desc || "",
        }));
        const uniqueUser = userMapped.filter(u => !seedNames.has(u.n.toLowerCase()));
        setAllEx([...mapped, ...uniqueUser]);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced live parse (800ms)
  useEffect(() => {
    if (text.trim() === "") {
      setParsedResult(null);
      return;
    }
    const timer = setTimeout(() => {
      setParsedResult(parseNotepad({ text, exerciseLibrary: allEx }));
    }, 800);
    return () => clearTimeout(timer);
  }, [text, allEx]);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const exerciseCount = parsedResult?.exerciseCount ?? 0;
  const disabled = saving || title.trim() === "" || text.trim() === "" || (parsedResult !== null && exerciseCount === 0);

  const handleSave = async () => {
    if (saving) return;
    if (!title.trim()) { fl("Add a title"); return; }
    if (!text.trim()) { fl("Add some content"); return; }
    setSaving(true);
    try {
      const fresh = parseNotepad({ text, exerciseLibrary: allEx });
      if (fresh.exerciseCount === 0) {
        fl("Add at least one exercise");
        return;
      }
      const newId = await onSave({
        nm: title.trim(),
        desc: "",
        d: "",
        secs: fresh.sections,
        tg: [],
        dur: null,
        sites: [],
        eq: [],
        isPublic: false,
        fromNotepad: true,
      });
      if (newId) {
        clearDraft(draftKey);
        onSavedNew(newId);
      } else {
        fl("Couldn't save — try again");
      }
    } finally {
      setSaving(false);
    }
  };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  return (
    <div style={{ padding: "0 24px" }}>
      {toastEl}

      <button onClick={onClose} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 16, marginBottom: 20 }}>← Home</button>
      <div style={{ fontSize: 26, fontWeight: 800, color: T1, marginBottom: 4 }}>Notepad</div>
      <div style={{ fontSize: 15, color: T4, marginBottom: 20 }}>Type or paste a beatdown — we&apos;ll parse it into sections and exercises.</div>

      {/* Write / Preview toggle (mirrors LibraryScreen libT pill) */}
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid " + BD, padding: 3, marginBottom: 16 }}>
        {(["write", "preview"] as const).map(m => (
          <div
            key={m}
            onClick={() => setMode(m)}
            style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 15, fontWeight: mode === m ? 700 : 500, color: mode === m ? G : T4, background: mode === m ? "rgba(34,197,94,0.08)" : "transparent", borderRadius: 10, cursor: "pointer", textTransform: "capitalize", fontFamily: F }}
          >
            {m}
          </div>
        ))}
      </div>

      {mode === "write" && (
        <>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 14, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Title</label>
            <input value={title} maxLength={80} onChange={e => setTitle(e.target.value)} placeholder="Name this beatdown..." style={ist} />
          </div>

          {/* Beatdown notes label + help button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: F, color: T5, fontSize: 14, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Beatdown notes</span>
            <button
              onClick={() => setShowHelp(!showHelp)}
              aria-label="Show notepad syntax help"
              style={{ fontFamily: F, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.30)", color: A, fontSize: 16, fontWeight: 700, padding: "4px 10px", borderRadius: 8, cursor: "pointer", lineHeight: 1 }}
            >?</button>
          </div>

          {showHelp && (
            <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.20)", borderRadius: 10, padding: 11, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: 1.5 }}>HOW TO WRITE</span>
                <button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", color: T4, fontSize: 16, cursor: "pointer", fontFamily: F, lineHeight: 1, padding: 0 }}>✕</button>
              </div>
              {HELP_ROWS.map((row, idx) => (
                <div key={row.key} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: idx === HELP_ROWS.length - 1
                    ? 0
                    : (row.warning ? 10 : 4),
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: G, fontWeight: 700, width: 70, flexShrink: 0 }}>{row.key}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: F, fontSize: 13, color: T3, lineHeight: 1.4, display: "block" }}>{row.desc}</span>
                    {row.warning && (
                      <div style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 6,
                        padding: "6px 8px",
                        background: "rgba(245,158,11,0.06)",
                        borderLeft: "2px solid " + A,
                        borderRadius: 3,
                      }}>
                        <span style={{ fontFamily: F, fontSize: 12, color: A, flexShrink: 0, lineHeight: 1.4 }}>⚠</span>
                        <span style={{ fontFamily: F, fontSize: 12, color: A, fontStyle: "italic", lineHeight: 1.4 }}>{row.warning}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            style={{
              ...ist,
              fontFamily: MONO,
              fontSize: 17,
              fontWeight: 500,
              minHeight: 360,
              padding: 12,
              resize: "vertical" as const,
              lineHeight: 1.5,
              marginBottom: 16,
              color: T2,
            }}
          />
        </>
      )}

      {mode === "preview" && (
        <div style={{ marginBottom: 16 }}>
          {(parsedResult === null || exerciseCount === 0) ? (
            <div style={{ textAlign: "center", color: T5, padding: "40px 20px", border: "1px dashed " + BD, borderRadius: 14, fontSize: 15, fontFamily: F }}>
              Switch to Write tab to start typing your beatdown.
            </div>
          ) : (
            parsedResult.sections.map((sec, i) => (
              <PreviewSectionCard key={(sec.id || sec.label || "sec") + "-" + i} sec={sec} allEx={allEx} />
            ))
          )}
        </div>
      )}

      {/* Section/exercise meta line — shown when there's a parse */}
      {parsedResult && exerciseCount > 0 && (
        <div style={{ textAlign: "center", color: T5, fontSize: 14, fontFamily: F, marginBottom: 12 }}>
          {parsedResult.sections.length} {parsedResult.sections.length === 1 ? "section" : "sections"} · {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
        </div>
      )}

      {/* Save */}
      <button
        disabled={disabled}
        onClick={handleSave}
        style={{
          fontFamily: F,
          width: "100%",
          padding: "16px 0",
          borderRadius: 14,
          fontSize: 18,
          fontWeight: 800,
          cursor: disabled ? "default" : "pointer",
          background: G,
          color: BG,
          border: "none",
          opacity: disabled ? 0.5 : 1,
          marginBottom: 24,
        }}
      >
        {saving ? "Saving..." : "Save as beatdown"}
      </button>
    </div>
  );
}

// ── READ-ONLY PREVIEW CARDS ───────────────────────────────────────────────────

function PreviewSectionCard({ sec, allEx }: { sec: Section; allEx: ExerciseData[] }) {
  const sColor = sec.color;
  const secLabel = sec.name || sec.label || "Section";
  const exCount = sec.exercises.filter(e => e.type !== "transition").length;
  const qNotes = (sec.qNotes || sec.note || "").trim();

  return (
    <div style={{
      background: CARD_BG,
      borderRadius: 22,
      boxShadow: `0 0 0 1px ${sColor}40, 0 4px 24px ${sColor}0D`,
      marginBottom: 12,
    }}>
      <div style={{ borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
        <div style={{ height: 3, background: sColor }} />
        <div style={{ padding: "14px 18px 12px" }}>
          <div style={{ color: T1, fontSize: 23, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{secLabel}</div>
          <div style={{ color: T4, fontSize: 15, marginTop: 3, fontFamily: F, fontWeight: 500 }}>{exCount} {exCount === 1 ? "exercise" : "exercises"}</div>
        </div>
      </div>

      <div style={{ padding: "0 12px 14px" }}>
        {qNotes && (
          <div style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.20)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 10,
            color: T2,
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap" as const,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            fontFamily: F,
          }}>{qNotes}</div>
        )}

        {sec.exercises.map((ex, idx) => (
          <PreviewExerciseRow key={(ex.id || "ex") + "-" + idx} ex={ex} allEx={allEx} />
        ))}
      </div>
    </div>
  );
}

function fmtNotepadDisplay(ex: SectionExercise): { amount: string; cadence: string } {
  const reps = (ex.r || "").trim();
  const cad = (ex.c || "").trim();
  if (!reps) return { amount: "", cadence: "" };
  if (/^\d+(sec|min)$/i.test(reps)) return { amount: reps, cadence: "" };
  if (/^\d+$/.test(reps)) return { amount: `${reps} reps`, cadence: cad };
  return { amount: reps, cadence: cad };
}

function PreviewExerciseRow({ ex, allEx }: { ex: SectionExercise; allEx: ExerciseData[] }) {
  if (ex.type === "transition") {
    const exName = ex.name || ex.n || "";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 6 }}>
        <span style={{ color: T4, fontSize: 17, flexShrink: 0 }}>↗</span>
        <span style={{ color: T3, fontSize: 18, fontStyle: "italic", fontWeight: 500, fontFamily: F, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exName}</span>
      </div>
    );
  }

  const exName = ex.name || ex.n || "";
  const isCustom = !ex.exerciseId && !allEx.some(x => x.n.toLowerCase() === exName.toLowerCase());
  const { amount, cadence } = fmtNotepadDisplay(ex);
  const note = (ex.note || ex.nt || "").trim();

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ background: EX_BG, borderRadius: 14, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap", overflow: "hidden" }}>
            <span style={{ color: T1, fontSize: 20, fontWeight: 700, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{exName}</span>
            {isCustom && <span style={{ fontSize: 12, color: A, background: A + "15", padding: "2px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", flexShrink: 0, fontFamily: F }}>Custom</span>}
          </div>
          {amount && (
            <div style={{ color: T4, fontSize: 16, fontWeight: 600, marginTop: 3, fontFamily: F }}>
              <span>{amount}{cadence ? ` · ${cadence}` : ""}</span>
            </div>
          )}
        </div>
      </div>
      {note && (
        <div style={{
          background: "rgba(34,197,94,0.04)",
          borderLeft: "2px solid " + G + "30",
          padding: "8px 12px",
          marginTop: 4,
          borderRadius: 6,
          color: T3,
          fontSize: 15,
          fontStyle: "italic",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap" as const,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          fontFamily: F,
        }}>{note}</div>
      )}
    </div>
  );
}
