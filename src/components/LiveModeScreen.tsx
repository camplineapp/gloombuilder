"use client";

import { useState, useEffect, useRef } from "react";
import type { Section, SectionExercise, ExerciseData } from "@/lib/exercises";
import { EX, mapSupabaseExercise } from "@/lib/exercises";
import { loadSeedExercises } from "@/lib/db";
import CopyModal from "@/components/CopyModal";

// ════ LIVE MODE COLORS (from spec — stone palette for focused dark UI) ════
const C = {
  bg: "#0E0E10",
  solidCard: "#1a1a1e",
  solidOverlay: "#111113",
  border: "rgba(255,255,255,0.10)",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.12)",
  greenGlow: "rgba(34,197,94,0.25)",
  amber: "#f59e0b",
  red: "#ef4444",
  t1: "#fafaf9",
  t2: "#d6d3d1",
  t3: "#a8a29e",
  t4: "#78716c",
};
const F = "'Outfit', system-ui, sans-serif";

// ════ SMART TIMER PARSER — no toggle, no user choice ════
function parseReps(repsText: string): { isTimer: boolean; seconds: number; display: string } {
  if (!repsText) return { isTimer: false, seconds: 0, display: repsText };
  const t = repsText.trim().toLowerCase();
  const secMatch = t.match(/^(\d+)\s*(?:sec(?:onds?)?|s)$/);
  if (secMatch) return { isTimer: true, seconds: parseInt(secMatch[1]), display: repsText };
  const minMatch = t.match(/^(\d+)\s*(?:min(?:utes?)?|m)$/);
  if (minMatch) return { isTimer: true, seconds: parseInt(minMatch[1]) * 60, display: repsText };
  const colonMatch = t.match(/^(\d+):(\d{2})$/);
  if (colonMatch) return { isTimer: true, seconds: parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]), display: repsText };
  return { isTimer: false, seconds: 0, display: repsText };
}

interface FlatExercise {
  name: string;
  reps: string;
  cadence: string;
  note: string;
  howTo: string;
  isTimer: boolean;
  seconds: number;
  display: string;
  sectionName: string;
  sectionIndex: number;
  isFirstInSection: boolean;
  globalIndex: number;
  isTransition: boolean;
}

function flattenBeatdown(sections: Section[], allEx?: ExerciseData[]): FlatExercise[] {
  const flat: FlatExercise[] = [];
  sections.forEach((sec, si) => {
    // Support both old (label/note) and new (name/qNotes) section fields
    const secName = (sec as any).name || sec.label || "Section";
    sec.exercises.forEach((ex: SectionExercise, ei: number) => {
      const isTransition = ex.type === "transition";
      // Support both old (n/r/c/nt) and new (name/mode/value/unit/cadence/note) fields
      const exName = (ex as any).name || ex.n || "";
      const exNote = (ex as any).note || ex.nt || "";
      const exCad = (ex as any).cadence || ex.c || "";

      // Look up howTo from seed exercises
      const found = allEx?.find(se => se.n.toLowerCase() === exName.toLowerCase());
      const howTo = found?.h || "";

      // Build reps string from new format if available
      let repsStr = ex.r || "";
      const exMode = (ex as any).mode;
      if (!repsStr && exMode === "time") repsStr = `${(ex as any).value} ${(ex as any).unit}`;
      if (!repsStr && exMode === "distance") repsStr = `${(ex as any).value} ${(ex as any).unit}`;
      if (!repsStr && exMode === "reps" && (ex as any).value !== undefined) repsStr = String((ex as any).value);

      let parsed = isTransition ? { isTimer: false, seconds: 0, display: "" } : parseReps(repsStr);

      // Handle new time mode directly
      if (!isTransition && exMode === "time" && !parsed.isTimer) {
        const val = (ex as any).value;
        const unit = (ex as any).unit;
        const seconds = unit === "min" ? val * 60 : val;
        parsed = { isTimer: true, seconds, display: repsStr };
      }

      // Legacy cadence-as-timer fallback
      if (!isTransition && !parsed.isTimer && exCad) {
        const cl = exCad.trim().toLowerCase();
        const repsNum = parseInt(repsStr);
        if (!isNaN(repsNum) && /^(sec(onds?)?|s|min(utes?|s)?|m)$/i.test(cl)) {
          const multiplier = /^(min(utes?|s)?|m)$/i.test(cl) ? 60 : 1;
          parsed = { isTimer: true, seconds: repsNum * multiplier, display: `${repsStr} ${exCad}` };
        }
      }

      flat.push({
        name: exName,
        reps: repsStr,
        cadence: exCad,
        note: exNote,
        howTo,
        ...parsed,
        sectionName: secName,
        sectionIndex: si,
        isFirstInSection: ei === 0,
        globalIndex: flat.length,
        isTransition,
      });
    });
  });
  return flat;
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ════ COUNTDOWN TIMER ════
function CountdownTimer({ seconds, isPaused }: { seconds: number; isPaused: boolean }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { setRemaining(seconds); }, [seconds]);
  useEffect(() => {
    if (isPaused || remaining <= 0) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => { if (prev <= 1) { if (intervalRef.current) clearInterval(intervalRef.current); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, seconds, remaining]);

  const pct = ((seconds - remaining) / seconds) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}`;
  const isLow = remaining <= 5 && remaining > 0;
  const isDone = remaining === 0;
  const circumference = 2 * Math.PI * 84;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <svg width={190} height={190} viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={95} cy={95} r={84} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
          <circle cx={95} cy={95} r={84} fill="none" stroke={isDone ? C.green : isLow ? C.red : C.green} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset 0.3s linear, stroke 0.3s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: F, fontSize: isDone ? 36 : 64, fontWeight: 900, fontVariantNumeric: "tabular-nums",
          color: isDone ? C.green : isLow ? C.red : C.t1,
          animation: isLow ? "lm-pulse 1s ease-in-out infinite" : isDone ? "lm-donePulse 1.5s ease-in-out infinite" : "none",
        }}>
          {isDone ? "DONE" : display}
        </div>
      </div>
    </div>
  );
}

// ════ PRE-LAUNCH ════
function PreLaunchScreen({ title, qName, ao, duration, sections, exercises, onStart, onClose }: {
  title: string; qName: string; ao: string; duration: string; sections: Section[]; exercises: FlatExercise[]; onStart: () => void; onClose: () => void;
}) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", padding: "0 20px", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: `radial-gradient(circle, ${C.greenGlow} 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Back button */}
        <button onClick={onClose} style={{ fontFamily: F, background: "none", border: "none", color: C.t3, fontSize: 15, fontWeight: 600, cursor: "pointer", padding: "16px 0 0", textAlign: "left" as const }}>← Back</button>
        <div style={{ textAlign: "center", paddingTop: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.greenDim, border: `1px solid ${C.green}33`, borderRadius: 24, padding: "8px 18px", marginBottom: 24, fontFamily: F, fontSize: 14, fontWeight: 700, color: C.green, letterSpacing: 1.5, textTransform: "uppercase" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
            Live Mode
          </div>
          <h1 style={{ fontFamily: F, fontSize: 34, fontWeight: 800, color: C.t1, margin: "0 0 8px", lineHeight: 1.15 }}>{title}</h1>
          <p style={{ fontFamily: F, fontSize: 16, color: C.t3, margin: "0 0 28px" }}>by {qName} · {ao}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 28 }}>
            {[{ label: "Exercises", value: String(exercises.filter(e => !e.isTransition).length) }, { label: "Sections", value: String(sections.length) }, { label: "Duration", value: duration }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F, fontSize: 28, fontWeight: 800, color: C.t1 }}>{s.value}</div>
                <div style={{ fontFamily: F, fontSize: 13, color: C.t3, textTransform: "uppercase", letterSpacing: 1, marginTop: 3, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={onStart} style={{ fontFamily: F, width: "100%", padding: "22px 0", background: C.green, border: "none", borderRadius: 16, fontSize: 20, fontWeight: 800, color: "#000", cursor: "pointer", boxShadow: `0 0 40px ${C.green}44` }}>
            Start Beatdown
          </button>
          <p style={{ fontFamily: F, fontSize: 14, color: C.t4, marginTop: 10 }}>Screen stays awake during Live Mode</p>
        </div>
        <div style={{ marginTop: 24, paddingBottom: 40 }}>
          <div style={{ fontFamily: F, fontSize: 12, fontWeight: 800, color: C.t4, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, textAlign: "center" }}>What&apos;s Inside</div>
          <div style={{ background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "12px 18px" }}>
            {sections.map((sec, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < sections.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.t2 }}>{sec.label}</span>
                <span style={{ fontFamily: F, fontSize: 15, color: C.t3 }}>{sec.exercises.filter((e: SectionExercise) => e.type !== "transition").length} exercises</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════ EXERCISE TELEPROMPTER ════
function ExerciseScreen({ exercise, exercises, currentIndex, totalExercises, onNext, onPrev, onJumpList, onExit, elapsedTime, sectionJustChanged }: {
  exercise: FlatExercise; exercises: FlatExercise[]; currentIndex: number; totalExercises: number;
  onNext: () => void; onPrev: () => void; onJumpList: () => void; onExit: () => void; elapsedTime: number; sectionJustChanged: boolean;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const progress = ((currentIndex + 1) / totalExercises) * 100;
  const nextEx = currentIndex < totalExercises - 1 ? exercises[currentIndex + 1] : null;
  const nameLen = exercise.name.length;
  const nameFontSize = nameLen > 20 ? 42 : nameLen > 14 ? 52 : 64;

  useEffect(() => {
    setIsPaused(false);
    setShowInfo(false);
    if (sectionJustChanged) {
      setShowBanner(true);
      const t = setTimeout(() => setShowBanner(false), 2200);
      return () => clearTimeout(t);
    } else {
      setShowBanner(false);
    }
  }, [currentIndex, sectionJustChanged]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setTouchStart(x);
  };
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setSwipeX(x - touchStart);
  };
  const handleTouchEnd = () => {
    if (Math.abs(swipeX) > 60) {
      if (swipeX < 0) onNext();
      if (swipeX > 0 && currentIndex > 0) onPrev();
    }
    setSwipeX(0);
    setTouchStart(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", userSelect: "none" }}>
      {/* ═══ TOP BAR — red exit button ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 14px 0" }}>
        <button onClick={onExit} style={{ fontFamily: F, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", borderRadius: 12, color: C.red, fontSize: 18, fontWeight: 700, cursor: "pointer", padding: "12px 18px", minWidth: 54, textAlign: "center" }}>✕</button>
        <div style={{ fontFamily: F, fontSize: 32, fontWeight: 900, color: C.t1, fontVariantNumeric: "tabular-nums", background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "8px 22px", letterSpacing: 1.5, lineHeight: 1 }}>
          {formatTime(elapsedTime)}
        </div>
        <button onClick={onJumpList} style={{ fontFamily: F, background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 12, color: C.t3, fontSize: 18, fontWeight: 700, cursor: "pointer", padding: "12px 18px", minWidth: 54, textAlign: "center" }}>☰</button>
      </div>

      {/* ═══ PROGRESS ═══ */}
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", margin: "12px 14px 0", borderRadius: 3 }}>
        <div style={{ height: "100%", background: C.green, width: `${progress}%`, borderRadius: 3, transition: "width 0.4s ease", boxShadow: `0 0 12px ${C.green}66` }} />
      </div>

      {/* ═══ SECTION LABEL ═══ */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, padding: "16px 14px 0" }}>
        <div style={{
          fontFamily: F, fontSize: 16, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 3,
          padding: showBanner ? "8px 20px" : "0",
          background: showBanner ? C.solidCard : "transparent",
          border: showBanner ? `2px solid ${C.green}` : "2px solid transparent",
          borderRadius: 12, transition: "all 0.3s ease",
        }}>
          {exercise.sectionName}
        </div>
        <span style={{ fontFamily: F, fontSize: 16, fontWeight: 800, color: C.t3, background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "4px 14px" }}>
          {currentIndex + 1} / {totalExercises}
        </span>
      </div>

      {/* ═══ MAIN TELEPROMPTER — swipeable ═══ */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={(e) => { if (touchStart !== null) handleTouchMove(e); }}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => { if (touchStart !== null) handleTouchEnd(); }}
        style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px",
          cursor: "grab",
          transform: `translateX(${swipeX * 0.3}px)`,
          transition: swipeX === 0 ? "transform 0.2s ease" : "none",
          opacity: Math.max(0.5, 1 - Math.abs(swipeX) / 500),
        }}
      >
        {exercise.isTransition ? (
          <>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.t4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Transition</div>
            <div style={{ fontFamily: F, fontSize: 36, fontWeight: 800, color: C.t2, textAlign: "center", fontStyle: "italic", lineHeight: 1.2 }}>
              ↗ {exercise.name}
            </div>
          </>
        ) : (
          <>
            {/* Exercise name — tap to show how-to */}
            <h1
              onClick={() => { if (exercise.howTo) setShowInfo(!showInfo); }}
              style={{
                fontFamily: F, fontSize: nameFontSize, fontWeight: 900, color: C.t1, textAlign: "center", margin: 0, lineHeight: 1.05, letterSpacing: -1,
                cursor: exercise.howTo ? "pointer" : "default",
                borderBottom: exercise.howTo && !showInfo ? "2px dashed rgba(167,139,250,0.35)" : "none",
                paddingBottom: exercise.howTo && !showInfo ? 6 : 0,
              }}
            >
              {exercise.name}
            </h1>
            {exercise.note && !showInfo && (
              <p style={{ fontFamily: F, fontSize: 18, color: C.t3, textAlign: "center", margin: "8px 0 0", fontStyle: "italic", fontWeight: 500 }}>{exercise.note}</p>
            )}

            {/* ═══ HOW-TO EXPANSION (tap name to toggle) ═══ */}
            {showInfo && (
              <div
                onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
                style={{
                  marginTop: 16, padding: "18px 20px",
                  background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.18)", borderRadius: 16,
                  maxHeight: 280, overflowY: "auto", cursor: "pointer", width: "100%",
                  WebkitOverflowScrolling: "touch" as any,
                }}
              >
                <div style={{ fontFamily: F, fontSize: 12, fontWeight: 800, color: "rgba(167,139,250,0.7)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>How to execute</div>
                {exercise.howTo.split(/(?=\d+\.\s)/).filter(Boolean).map((step, i) => {
                  const stepText = step.replace(/^\d+\.\s*/, "").trim();
                  const stepNum = step.match(/^(\d+)\./)?.[1];
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      {stepNum && <span style={{ fontFamily: F, color: "rgba(167,139,250,0.6)", fontSize: 18, fontWeight: 800, flexShrink: 0, minWidth: 22, textAlign: "right" as const }}>{stepNum}.</span>}
                      <span style={{ fontFamily: F, color: C.t2, fontSize: 18, lineHeight: 1.5 }}>{stepText}</span>
                    </div>
                  );
                })}
                <div style={{ fontFamily: F, fontSize: 15, color: "rgba(167,139,250,0.5)", marginTop: 16, textAlign: "center", fontWeight: 600, padding: "8px 0" }}>tap anywhere to close</div>
              </div>
            )}

            {/* Reps + Cadence — hidden when info is showing */}
            {!showInfo && (
              <>
                {exercise.isTimer ? (
                  <div style={{ marginTop: 20 }}>
                    <CountdownTimer seconds={exercise.seconds} isPaused={isPaused} />
                    <button onClick={() => setIsPaused(!isPaused)} style={{
                      fontFamily: F, display: "block", margin: "24px auto 0", background: C.solidCard, border: `1px solid ${C.border}`,
                      borderRadius: 14, padding: "16px 44px", color: C.t2, fontSize: 19, fontWeight: 700, cursor: "pointer",
                    }}>
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <span style={{ fontFamily: F, fontSize: 48, fontWeight: 800, color: C.green, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{exercise.display}</span>
                    <div style={{ fontFamily: F, fontSize: 18, fontWeight: 700, marginTop: 6, letterSpacing: 2, textTransform: "uppercase", color: exercise.cadence === "IC" ? C.amber : C.t3 }}>
                      {exercise.cadence === "IC" ? "In Cadence" : exercise.cadence === "OYO" ? "On Your Own" : exercise.cadence}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ═══ UP NEXT ═══ */}
      {nextEx && !showInfo && (
        <div style={{ margin: "20px 14px 0", padding: "14px 18px", textAlign: "center", background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 14 }}>
          <div style={{ fontFamily: F, fontSize: 13, color: C.t4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>Up Next</div>
          {nextEx.isFirstInSection && nextEx.sectionName !== exercise.sectionName ? (
            <div style={{ fontFamily: F, fontSize: 22, color: C.green, fontWeight: 800 }}>{nextEx.sectionName}</div>
          ) : nextEx.isTransition ? (
            <div style={{ fontFamily: F, fontSize: 20, color: C.t2, fontWeight: 700, fontStyle: "italic" }}>↗ {nextEx.name}</div>
          ) : (
            <>
              <div style={{ fontFamily: F, fontSize: 22, color: C.t1, fontWeight: 800 }}>{nextEx.name}</div>
              <div style={{ fontFamily: F, fontSize: 17, color: C.t3, fontWeight: 600, marginTop: 4 }}>{nextEx.display} · {nextEx.cadence}</div>
            </>
          )}
        </div>
      )}

      {/* ═══ NEXT BUTTON ═══ */}
      <div style={{ padding: "16px 14px 34px" }}>
        <button onClick={onNext} style={{
          fontFamily: F, width: "100%", padding: "26px 0", background: C.green, border: "none", borderRadius: 16,
          fontSize: 24, fontWeight: 900, color: "#000", cursor: "pointer", boxShadow: `0 0 28px ${C.green}33`,
        }}>
          {currentIndex === totalExercises - 1 ? "Finish Beatdown" : "Next →"}
        </button>
      </div>

      <style>{`
        @keyframes lm-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes lm-donePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
}

// ════ JUMP LIST ════
function JumpList({ exercises, currentIndex, onJump, onClose }: {
  exercises: FlatExercise[]; currentIndex: number; onJump: (i: number) => void; onClose: () => void;
}) {
  let currentSection = "";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: C.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: C.t1, margin: 0 }}>Jump To</h3>
        <button onClick={onClose} style={{ fontFamily: F, background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 14, color: C.t2, fontSize: 17, fontWeight: 700, cursor: "pointer", padding: "12px 22px" }}>Close</button>
      </div>
      {currentIndex > 0 && (
        <div style={{ padding: "12px 16px 4px" }}>
          <button onClick={() => onJump(currentIndex - 1)} style={{
            fontFamily: F, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: "16px 16px", cursor: "pointer", fontSize: 17, fontWeight: 700, color: C.t2,
          }}>
            ← Back to {exercises[currentIndex - 1].name}
          </button>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 14px 40px", WebkitOverflowScrolling: "touch" }}>
        {exercises.map((ex, i) => {
          const showSection = ex.sectionName !== currentSection;
          if (showSection) currentSection = ex.sectionName;
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div key={i}>
              {showSection && (
                <div style={{ fontFamily: F, fontSize: 14, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 2.5, padding: "18px 0 10px", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                  {ex.sectionName}
                </div>
              )}
              <button onClick={() => onJump(i)} style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left" as const,
                background: isCurrent ? C.solidCard : "transparent",
                border: isCurrent ? `2px solid ${C.green}` : "2px solid transparent",
                borderRadius: 14, padding: "14px 14px", cursor: "pointer", marginBottom: 4,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: F, fontSize: 16, fontWeight: 800, flexShrink: 0,
                  background: isCurrent ? C.green : isPast ? "rgba(255,255,255,0.08)" : "transparent",
                  color: isCurrent ? "#000" : isPast ? C.t4 : C.t3,
                  border: !isCurrent && !isPast ? "2px solid rgba(255,255,255,0.12)" : "none",
                }}>
                  {isPast ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: F, fontSize: 19, fontWeight: 700,
                    color: isCurrent ? C.t1 : isPast ? C.t4 : C.t2,
                    textDecoration: isPast ? "line-through" : "none",
                    fontStyle: ex.isTransition ? "italic" : "normal",
                  }}>{ex.isTransition ? `↗ ${ex.name}` : ex.name}</div>
                  {!ex.isTransition && <div style={{ fontFamily: F, fontSize: 15, color: C.t4, fontWeight: 500, marginTop: 2 }}>{ex.display} · {ex.cadence}</div>}
                </div>
                {isCurrent && <span style={{ fontFamily: F, fontSize: 13, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 1.5, flexShrink: 0 }}>Now</span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════ COMPLETION ════
function CompletionScreen({ title, qName, ao, sections, exercises, elapsedTime, onDone, onReview, onRunAgain }: {
  title: string; qName: string; ao: string; sections: Section[]; exercises: FlatExercise[]; elapsedTime: number;
  onDone: () => void; onReview: () => void; onRunAgain: () => void;
}) {
  const mins = Math.floor(elapsedTime / 60);
  const secs = elapsedTime % 60;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative" }}>
      <div style={{ position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", width: 350, height: 350, background: `radial-gradient(circle, ${C.greenGlow} 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 380, width: "100%" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>💪</div>
        <h1 style={{ fontFamily: F, fontSize: 32, fontWeight: 900, color: C.t1, margin: "0 0 6px" }}>Beatdown Complete</h1>
        <p style={{ fontFamily: F, fontSize: 18, color: C.t3, margin: "0 0 28px", fontWeight: 500 }}>{title}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
          <div style={{ background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 16px" }}>
            <div style={{ fontFamily: F, fontSize: 40, fontWeight: 900, color: C.green, fontVariantNumeric: "tabular-nums" }}>{mins}:{secs.toString().padStart(2, "0")}</div>
            <div style={{ fontFamily: F, fontSize: 15, color: C.t3, fontWeight: 600, textTransform: "uppercase", marginTop: 4 }}>Total Time</div>
          </div>
          <div style={{ background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 16px" }}>
            <div style={{ fontFamily: F, fontSize: 40, fontWeight: 900, color: C.green }}>{exercises.filter(e => !e.isTransition).length}</div>
            <div style={{ fontFamily: F, fontSize: 15, color: C.t3, fontWeight: 600, textTransform: "uppercase", marginTop: 4 }}>Exercises</div>
          </div>
        </div>
        <div style={{ background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 24 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < sections.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontFamily: F, fontSize: 18, color: C.t2, fontWeight: 700 }}>{(s as any).name || s.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: F, fontSize: 17, color: C.t3, fontWeight: 600 }}>{s.exercises.filter((e: SectionExercise) => e.type !== "transition").length}</span>
                <span style={{ color: C.green, fontSize: 18, fontWeight: 700 }}>✓</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button onClick={onReview} style={{ fontFamily: F, flex: 1, padding: "22px 0", border: "none", borderRadius: 16, fontSize: 18, fontWeight: 800, cursor: "pointer", background: C.green, color: "#000", boxShadow: `0 0 30px ${C.green}44` }}>
            Review Beatdown
          </button>
          <button onClick={onRunAgain} style={{ fontFamily: F, flex: 1, padding: "22px 0", border: "none", borderRadius: 16, fontSize: 18, fontWeight: 800, cursor: "pointer", background: C.amber, color: "#000", boxShadow: `0 0 30px ${C.amber}33` }}>
            Run Again
          </button>
        </div>
        <button onClick={onDone} style={{ fontFamily: F, width: "100%", padding: "16px 0", background: "transparent", border: "none", fontSize: 16, fontWeight: 600, color: C.t4, cursor: "pointer" }}>
          Done — Back to Locker
        </button>
      </div>
    </div>
  );
}

// ════ REVIEW BEATDOWN (post-workout edit before copy) ════
function ReviewScreen({ sections, exercises, elapsedTime, qName, beatdownTitle, onBack, onCopied, onCopyBackblast, onEditsChanged }: {
  sections: Section[]; exercises: FlatExercise[]; elapsedTime: number; qName: string; beatdownTitle: string;
  onBack: () => void; onCopied: (msg: string) => void; onCopyBackblast: () => void; onEditsChanged: (editedSecs: Section[]) => void;
}) {
  const [edits, setEdits] = useState(() =>
    exercises.map(ex => ({
      name: ex.name, reps: ex.display || ex.reps, cadence: ex.cadence,
      note: ex.note || "", qNote: "", removed: false, sectionName: ex.sectionName, isTransition: ex.isTransition,
    }))
  );
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const updateEdit = (i: number, field: string, value: string | boolean) => {
    setEdits(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  };

  // Build edited sections from edits and push to parent whenever edits change
  useEffect(() => {
    const sectionMap = new Map<string, SectionExercise[]>();
    const sectionOrder: string[] = [];
    edits.forEach(ex => {
      if (ex.removed) return;
      if (!sectionMap.has(ex.sectionName)) {
        sectionMap.set(ex.sectionName, []);
        sectionOrder.push(ex.sectionName);
      }
      const arr = sectionMap.get(ex.sectionName)!;
      if (ex.isTransition) {
        arr.push({ n: ex.name, r: "", c: "", nt: "", type: "transition", name: ex.name });
      } else {
        const noteText = ex.qNote ? (ex.note ? `${ex.note} · ${ex.qNote}` : ex.qNote) : ex.note;
        arr.push({ n: ex.name, r: ex.reps, c: ex.cadence, nt: noteText, name: ex.name, note: noteText });
      }
    });
    const editedSecs: Section[] = sectionOrder.map((sName, i) => {
      const origSec = sections.find(s => ((s as any).name || s.label) === sName);
      return {
        label: sName, name: sName, color: origSec?.color || "#22c55e",
        exercises: sectionMap.get(sName) || [], note: "", qNotes: "",
        id: (origSec as any)?.id || String(i),
      };
    });
    onEditsChanged(editedSecs);
  }, [edits]);

  const activeCount = edits.filter(e => !e.removed && !e.isTransition).length;

  const generateBackblast = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const mins = Math.floor(elapsedTime / 60);
    let text = "";
    if (beatdownTitle) text += `*${beatdownTitle}*\n`;
    text += `*Q:* ${qName}\n*Date:* ${dateStr}\n*PAX:* _[fill in]_\n*Total PAX:* _[count]_\n\n`;
    let currentSection = "";
    edits.forEach(ex => {
      if (ex.removed) return;
      if (ex.isTransition) { text += `↗ ${ex.name}\n`; return; }
      if (ex.sectionName !== currentSection) {
        currentSection = ex.sectionName;
        text += `── ${currentSection} ──\n`;
      }
      text += `${ex.reps} ${ex.name} ${ex.cadence}\n`;
      if (ex.qNote) text += `  > ${ex.qNote}\n`;
    });
    text += `\n*Elapsed:* ~${mins} min\n\nBuilt with GloomBuilder · gloombuilder.app`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateBackblast());
    setCopied(true);
    onCopied("Backblast copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  let currentSection = "";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px", borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ fontFamily: F, background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 14, color: C.t2, fontSize: 15, fontWeight: 700, cursor: "pointer", padding: "10px 18px" }}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: C.t1 }}>Review Beatdown</div>
          <div style={{ fontFamily: F, fontSize: 15, color: C.t3, marginTop: 4, fontWeight: 600 }}>{activeCount} exercises · Tap any to edit</div>
        </div>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 14px 140px", WebkitOverflowScrolling: "touch" as any }}>
        {edits.map((ex, i) => {
          if (ex.isTransition) return null;
          const showSection = ex.sectionName !== currentSection;
          if (showSection) currentSection = ex.sectionName;
          const isExpanded = expandedIdx === i;
          return (
            <div key={i}>
              {showSection && (
                <div style={{ fontFamily: F, fontSize: 14, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 2.5, padding: "18px 0 10px", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                  {ex.sectionName}
                </div>
              )}
              <div style={{ background: isExpanded ? C.solidCard : "transparent", border: isExpanded ? `1px solid ${C.green}40` : "1px solid transparent", borderRadius: 14, marginBottom: 4, overflow: "hidden" }}>
                <button onClick={() => setExpandedIdx(isExpanded ? null : i)} style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left" as const,
                  background: "transparent", border: "none", borderRadius: 14, padding: "14px 14px", cursor: "pointer",
                  opacity: ex.removed ? 0.35 : 1,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0, background: ex.removed ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)", color: ex.removed ? C.red : C.green }}>
                    {ex.removed ? "✕" : "✓"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: F, fontSize: 19, fontWeight: 700, color: ex.removed ? C.t4 : C.t1, textDecoration: ex.removed ? "line-through" : "none" }}>{ex.name}</div>
                    <div style={{ fontFamily: F, fontSize: 15, color: ex.removed ? C.t4 : C.t3, fontWeight: 500, marginTop: 2 }}>
                      {ex.reps} · {ex.cadence}
                      {ex.qNote && <span style={{ color: "#a78bfa", marginLeft: 8 }}>✎ noted</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: C.t4, flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                </button>
                {isExpanded && (
                  <div style={{ padding: "0 14px 16px", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                      <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.t3, width: 55 }}>Reps</span>
                      <input value={ex.reps} onChange={(e) => updateEdit(i, "reps", e.target.value)} style={{ flex: 1, fontFamily: F, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.t1, fontSize: 17, fontWeight: 700, padding: "10px 14px", outline: "none", fontVariantNumeric: "tabular-nums" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                      <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.t3, width: 55 }}>Count</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(["IC", "OYO"] as const).map(cad => (
                          <button key={cad} onClick={() => updateEdit(i, "cadence", cad)} style={{
                            fontFamily: F, padding: "10px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
                            background: ex.cadence === cad ? (cad === "IC" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.03)",
                            color: ex.cadence === cad ? (cad === "IC" ? C.amber : C.t2) : C.t4,
                            border: `1px solid ${ex.cadence === cad ? (cad === "IC" ? "rgba(245,158,11,0.30)" : C.border) : "transparent"}`,
                          }}>{cad}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.t3 }}>Q Note</span>
                      <input value={ex.qNote} onChange={(e) => updateEdit(i, "qNote", e.target.value)} placeholder="Modified reps, swapped exercise, skipped..." style={{ width: "100%", fontFamily: F, marginTop: 6, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 10, color: C.t2, fontSize: 15, padding: "10px 14px", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                      {ex.removed
                        ? <button onClick={() => updateEdit(i, "removed", false)} style={{ fontFamily: F, background: "none", border: `1px solid ${C.green}30`, borderRadius: 10, padding: "8px 16px", fontSize: 14, color: C.green, cursor: "pointer", fontWeight: 700 }}>Restore</button>
                        : <button onClick={() => updateEdit(i, "removed", true)} style={{ fontFamily: F, background: "none", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "8px 16px", fontSize: 14, color: C.red, cursor: "pointer", fontWeight: 600 }}>Remove</button>
                      }
                      <button onClick={() => setExpandedIdx(null)} style={{ fontFamily: F, background: C.green, border: "none", borderRadius: 10, padding: "8px 22px", fontSize: 15, fontWeight: 800, color: "#000", cursor: "pointer" }}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.bg, borderTop: `1px solid ${C.border}`, padding: "14px 16px 28px" }}>
        <div style={{ maxWidth: 430, margin: "0 auto" }}>
          <button onClick={onCopyBackblast} style={{
            fontFamily: F, width: "100%", padding: "22px 0", border: "none", borderRadius: 16, fontSize: 20, fontWeight: 800, cursor: "pointer",
            background: C.green, color: "#000",
            boxShadow: `0 0 30px ${C.green}44`,
          }}>
            Copy for Slack
          </button>
        </div>
      </div>
    </div>
  );
}

// ════ EXIT CONFIRMATION ════
function ExitConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.solidOverlay, border: `1px solid ${C.border}`, borderRadius: 22, padding: "32px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
        <h3 style={{ fontFamily: F, fontSize: 26, fontWeight: 800, color: C.t1, margin: "0 0 10px" }}>End Workout?</h3>
        <p style={{ fontFamily: F, fontSize: 17, color: C.t3, margin: "0 0 28px", fontWeight: 500 }}>You can always run this again from your Locker.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ fontFamily: F, flex: 1, padding: "20px 0", background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 14, fontSize: 18, fontWeight: 700, color: C.t2, cursor: "pointer" }}>Keep Going</button>
          <button onClick={onConfirm} style={{ fontFamily: F, flex: 1, padding: "20px 0", background: C.red, border: "none", borderRadius: 14, fontSize: 18, fontWeight: 800, color: "#fff", cursor: "pointer" }}>End</button>
        </div>
      </div>
    </div>
  );
}

// ════ MAIN CONTROLLER ════
interface LiveModeScreenProps {
  beatdownTitle: string;
  qName: string;
  ao: string;
  duration: string;
  sections: Section[];
  onClose: () => void;
}

export default function LiveModeScreen({ beatdownTitle, qName, ao, duration, sections, onClose }: LiveModeScreenProps) {
  const [seedEx, setSeedEx] = useState<ExerciseData[]>(EX);
  const exercises = flattenBeatdown(sections, seedEx);
  const [screen, setScreen] = useState<"prelaunch" | "exercise" | "complete" | "review">("prelaunch");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showJumpList, setShowJumpList] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [editedSections, setEditedSections] = useState<Section[] | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sectionJustChanged, setSectionJustChanged] = useState(false);
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  // Load seed exercises for how-to lookup
  useEffect(() => {
    loadSeedExercises().then(rows => {
      if (rows.length > 0) {
        const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
        setSeedEx(mapped);
      }
    });
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (screen === "exercise") {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen]);

  // Wake Lock
  useEffect(() => {
    if (screen === "exercise") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (nav.wakeLock) {
        nav.wakeLock.request("screen").then((wl: any) => { wakeLockRef.current = wl; }).catch(() => {});
      }
    } else {
      wakeLockRef.current?.release?.().catch(() => {});
      wakeLockRef.current = null;
    }
    return () => { wakeLockRef.current?.release?.().catch(() => {}); };
  }, [screen]);

  const startBeatdown = () => {
    setCurrentIndex(0);
    setElapsedTime(0);
    setSectionJustChanged(true);
    setScreen("exercise");
  };

  const goToExercise = (index: number) => {
    setSectionJustChanged(exercises[index].sectionName !== exercises[currentIndex]?.sectionName);
    setCurrentIndex(index);
    setScreen("exercise");
    setShowJumpList(false);
  };

  const handleNext = () => {
    if (currentIndex >= exercises.length - 1) { setScreen("complete"); return; }
    const next = exercises[currentIndex + 1];
    setSectionJustChanged(next.sectionName !== exercises[currentIndex].sectionName);
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    setSectionJustChanged(exercises[currentIndex - 1].sectionName !== exercises[currentIndex].sectionName);
    setCurrentIndex(currentIndex - 1);
  };

  const handleExit = () => {
    setScreen("complete");
    setShowExitConfirm(false);
  };

  const handleRunAgain = () => {
    setCurrentIndex(0);
    setElapsedTime(0);
    setSectionJustChanged(true);
    setScreen("exercise");
  };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#000", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: F, background: C.bg, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {toastEl}
      {showCopyModal && (
        <CopyModal secs={editedSections || sections} beatdownName={beatdownTitle} beatdownDesc="" qName={qName} onClose={() => { setShowCopyModal(false); if (screen === "review") setScreen("complete"); }} onToast={fl} />
      )}
      {screen === "prelaunch" && (
        <PreLaunchScreen title={beatdownTitle} qName={qName} ao={ao} duration={duration} sections={sections} exercises={exercises} onStart={startBeatdown} onClose={onClose} />
      )}
      {screen === "exercise" && (
        <ExerciseScreen exercise={exercises[currentIndex]} exercises={exercises} currentIndex={currentIndex} totalExercises={exercises.length}
          onNext={handleNext} onPrev={handlePrev} onJumpList={() => setShowJumpList(true)} onExit={() => setShowExitConfirm(true)}
          elapsedTime={elapsedTime} sectionJustChanged={sectionJustChanged} />
      )}
      {screen === "complete" && (
        <CompletionScreen title={beatdownTitle} qName={qName} ao={ao} sections={sections} exercises={exercises} elapsedTime={elapsedTime}
          onDone={onClose} onReview={() => setScreen("review")} onRunAgain={handleRunAgain} />
      )}
      {screen === "review" && (
        <ReviewScreen sections={sections} exercises={exercises} elapsedTime={elapsedTime} qName={qName} beatdownTitle={beatdownTitle}
          onBack={() => setScreen("complete")} onCopied={fl} onCopyBackblast={() => setShowCopyModal(true)} onEditsChanged={setEditedSections} />
      )}
      {showJumpList && (
        <JumpList exercises={exercises} currentIndex={currentIndex} onJump={goToExercise} onClose={() => setShowJumpList(false)} />
      )}
      {showExitConfirm && (
        <ExitConfirm onConfirm={handleExit} onCancel={() => setShowExitConfirm(false)} />
      )}
    </div>
  );
}
