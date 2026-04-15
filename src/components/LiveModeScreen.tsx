"use client";

import { useState, useEffect, useRef } from "react";
import type { Section, SectionExercise } from "@/lib/exercises";
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
  isTimer: boolean;
  seconds: number;
  display: string;
  sectionName: string;
  sectionIndex: number;
  isFirstInSection: boolean;
  globalIndex: number;
  isTransition: boolean;
}

function flattenBeatdown(sections: Section[]): FlatExercise[] {
  const flat: FlatExercise[] = [];
  sections.forEach((sec, si) => {
    sec.exercises.forEach((ex: SectionExercise, ei: number) => {
      const isTransition = ex.type === "transition";
      let parsed = isTransition ? { isTimer: false, seconds: 0, display: "" } : parseReps(ex.r);
      // Smart cadence detection: if reps is a plain number but cadence is time-related
      if (!isTransition && !parsed.isTimer && ex.c) {
        const cl = ex.c.trim().toLowerCase();
        const repsNum = parseInt(ex.r);
        if (!isNaN(repsNum) && /^(sec(onds?)?|s|min(utes?|s)?|m)$/i.test(cl)) {
          const multiplier = /^(min(utes?|s)?|m)$/i.test(cl) ? 60 : 1;
          parsed = { isTimer: true, seconds: repsNum * multiplier, display: `${ex.r} ${ex.c}` };
        }
      }
      flat.push({
        name: ex.n,
        reps: ex.r,
        cadence: ex.c,
        note: ex.nt || "",
        ...parsed,
        sectionName: sec.label,
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
function PreLaunchScreen({ title, qName, ao, duration, sections, exercises, onStart }: {
  title: string; qName: string; ao: string; duration: string; sections: Section[]; exercises: FlatExercise[]; onStart: () => void;
}) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", padding: "0 20px", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: `radial-gradient(circle, ${C.greenGlow} 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", paddingTop: 60 }}>
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
function ExerciseScreen({ exercise, exercises, currentIndex, totalExercises, onNext, onJumpList, onExit, elapsedTime, sectionJustChanged }: {
  exercise: FlatExercise; exercises: FlatExercise[]; currentIndex: number; totalExercises: number;
  onNext: () => void; onJumpList: () => void; onExit: () => void; elapsedTime: number; sectionJustChanged: boolean;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const progress = ((currentIndex + 1) / totalExercises) * 100;
  const nextEx = currentIndex < totalExercises - 1 ? exercises[currentIndex + 1] : null;
  const nameLen = exercise.name.length;
  const nameFontSize = nameLen > 20 ? 38 : nameLen > 14 ? 46 : 56;

  useEffect(() => {
    setIsPaused(false);
    if (sectionJustChanged) {
      setShowBanner(true);
      const t = setTimeout(() => setShowBanner(false), 2200);
      return () => clearTimeout(t);
    } else {
      setShowBanner(false);
    }
  }, [currentIndex, sectionJustChanged]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", userSelect: "none" }}>
      {/* ═══ TOP BAR ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 14px 0" }}>
        <button onClick={onExit} style={{ fontFamily: F, background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 12, color: C.t3, fontSize: 18, fontWeight: 700, cursor: "pointer", padding: "12px 18px", minWidth: 54, textAlign: "center" }}>✕</button>
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

      {/* ═══ MAIN TELEPROMPTER ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
        {exercise.isTransition ? (
          <>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.t4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Transition</div>
            <div style={{ fontFamily: F, fontSize: 36, fontWeight: 800, color: C.t2, textAlign: "center", fontStyle: "italic", lineHeight: 1.2 }}>
              ↗ {exercise.name}
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: F, fontSize: nameFontSize, fontWeight: 900, color: C.t1, textAlign: "center", margin: 0, lineHeight: 1.05, letterSpacing: -1 }}>
              {exercise.name}
            </h1>
            {exercise.note && (
              <p style={{ fontFamily: F, fontSize: 18, color: C.t3, textAlign: "center", margin: "8px 0 0", fontStyle: "italic", fontWeight: 500 }}>{exercise.note}</p>
            )}
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
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <span style={{ fontFamily: F, fontSize: 80, fontWeight: 900, color: C.green, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{exercise.display}</span>
                <div style={{ fontFamily: F, fontSize: 22, fontWeight: 800, marginTop: 8, letterSpacing: 2, textTransform: "uppercase", color: exercise.cadence === "IC" ? C.amber : C.t3 }}>
                  {exercise.cadence === "IC" ? "In Cadence" : exercise.cadence === "OYO" ? "On Your Own" : exercise.cadence}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ UP NEXT ═══ */}
      {nextEx && (
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
function CompletionScreen({ title, qName, ao, sections, exercises, elapsedTime, onDone, onCopyBackblast }: {
  title: string; qName: string; ao: string; sections: Section[]; exercises: FlatExercise[]; elapsedTime: number;
  onDone: () => void; onCopyBackblast: () => void;
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
              <span style={{ fontFamily: F, fontSize: 18, color: C.t2, fontWeight: 700 }}>{s.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: F, fontSize: 17, color: C.t3, fontWeight: 600 }}>{s.exercises.filter((e: SectionExercise) => e.type !== "transition").length}</span>
                <span style={{ color: C.green, fontSize: 18, fontWeight: 700 }}>✓</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onCopyBackblast} style={{
          fontFamily: F, width: "100%", padding: "22px 0", border: "none", borderRadius: 16,
          fontSize: 20, fontWeight: 800, cursor: "pointer",
          background: C.green, color: "#000",
          boxShadow: `0 0 30px ${C.green}44`,
        }}>
          Copy Backblast
        </button>
        <button onClick={onDone} style={{
          fontFamily: F, width: "100%", padding: "20px 0", background: C.solidCard, border: `1px solid ${C.border}`, borderRadius: 16,
          fontSize: 18, fontWeight: 700, color: C.t2, cursor: "pointer", marginTop: 14,
        }}>
          Done — Back to Locker
        </button>
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
  const exercises = flattenBeatdown(sections);
  const [screen, setScreen] = useState<"prelaunch" | "exercise" | "complete">("prelaunch");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showJumpList, setShowJumpList] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sectionJustChanged, setSectionJustChanged] = useState(false);
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

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

  const handleExit = () => {
    setScreen("prelaunch");
    setShowExitConfirm(false);
    setElapsedTime(0);
  };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#000", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: F, background: C.bg, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {toastEl}
      {showCopyModal && (
        <CopyModal secs={sections} beatdownName={beatdownTitle} beatdownDesc="" qName={qName} onClose={() => setShowCopyModal(false)} onToast={fl} />
      )}
      {screen === "prelaunch" && (
        <PreLaunchScreen title={beatdownTitle} qName={qName} ao={ao} duration={duration} sections={sections} exercises={exercises} onStart={startBeatdown} />
      )}
      {screen === "exercise" && (
        <ExerciseScreen exercise={exercises[currentIndex]} exercises={exercises} currentIndex={currentIndex} totalExercises={exercises.length}
          onNext={handleNext} onJumpList={() => setShowJumpList(true)} onExit={() => setShowExitConfirm(true)}
          elapsedTime={elapsedTime} sectionJustChanged={sectionJustChanged} />
      )}
      {screen === "complete" && (
        <CompletionScreen title={beatdownTitle} qName={qName} ao={ao} sections={sections} exercises={exercises} elapsedTime={elapsedTime}
          onDone={onClose} onCopyBackblast={() => setShowCopyModal(true)} />
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
