"use client";

import { useState, useEffect } from "react";
import { EX, DIFFS, SITES, EQUIP, generate, mapSupabaseExercise, normalizeSection } from "@/lib/exercises";
import type { GenConfig, Section, ExerciseData } from "@/lib/exercises";
import { loadSeedExercises } from "@/lib/db";
import CopyModal from "@/components/CopyModal";
import SectionEditor from "@/components/SectionEditor";
import type { AttachedBeatdown } from "@/components/PreblastComposer";

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
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, borderRadius: 10,
  color: T2, padding: "12px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: F,
};

interface GeneratorScreenProps {
  onClose: () => void;
  onSave: (beatdown: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean;
  }) => void;
  onRunThis?: (secs: Section[], title: string, dur: string, saveData: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean;
  }) => void;
  profName?: string;
  onSendPreblast?: (bd: AttachedBeatdown) => void;
  userExercises?: { id: string; nm: string; desc: string; tags: string[]; how: string }[];
  communityExercises?: { nm: string; desc: string; tags: string[]; how: string }[];
}

export default function GeneratorScreen({ onClose, onSave, onRunThis, profName, onSendPreblast, userExercises, communityExercises }: GeneratorScreenProps) {
  const [gs, setGs] = useState(0);
  const [gc, setGc] = useState<GenConfig>({ dur: null, diff: null, sites: [], eq: [] });
  const [gr, setGr] = useState<Section[] | null>(null);
  const [grT, setGrT] = useState("");
  const [grD, setGrD] = useState("");
  const [ld, setLd] = useState(false);
  const [shareLib, setShareLib] = useState(false);
  const [saving, setSaving] = useState(false);
  const [grDetailsOpen, setGrDetailsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [allEx, setAllEx] = useState<ExerciseData[]>(EX);

  // Load exercises from Supabase on mount + merge user custom + community exercises
  useEffect(() => {
    loadSeedExercises().then(rows => {
      if (rows.length > 0) {
        const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
        const seedNames = new Set(mapped.map(e => e.n.toLowerCase()));
        const userMapped: ExerciseData[] = (userExercises || []).map(ux => ({
          n: ux.nm, f: ux.nm, t: ux.tags || [], s: [], h: ux.how || "", d: ux.desc || "",
        }));
        const uniqueUser = userMapped.filter(u => !seedNames.has(u.n.toLowerCase()));
        const allNames = new Set([...seedNames, ...uniqueUser.map(u => u.n.toLowerCase())]);
        const communityMapped: ExerciseData[] = (communityExercises || []).map(ce => ({
          n: ce.nm, f: ce.nm, t: ce.tags || [], s: [], h: ce.how || "", d: ce.desc || "",
        }));
        const uniqueCommunity = communityMapped.filter(c => !allNames.has(c.n.toLowerCase()));
        setAllEx([...mapped, ...uniqueUser, ...uniqueCommunity]);
      }
    });
  }, [userExercises, communityExercises]);

  const [copyModal, setCopyModal] = useState(false);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  // Exercise detail modal + picker handled by SectionEditor

  // ════ LOADING ════
  if (ld) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: 3 }}>Building your beatdown...</div>
      </div>
    );
  }

  // ════ RESULT ════
  if (gr) {
    return (
      <div style={{ padding: "0 24px" }}>
        {toastEl}
        {copyModal && gr ? <CopyModal secs={gr} beatdownName={grT || "Generated Beatdown"} beatdownDesc={grD} qName={profName || "Q"} onClose={() => setCopyModal(false)} onToast={fl} /> : null}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 16, borderBottom: "1px solid " + BD }}>
          <button onClick={() => { setGr(null); setGs(0); onClose(); }} style={{ fontFamily: F, color: T3, background: "none", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 600, padding: "8px 0" }}>← Home</button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: T4, fontSize: 12, fontFamily: F }}>Tap to reroll</span>
            <button onClick={() => {
              const fresh = generate(gc, allEx).map(s => normalizeSection(s as unknown as Record<string,unknown>));
              setGr(prev => prev ? prev.map((sec, i) => {
                const f = fresh[i]; if (!f) return sec;
                let ni = 0;
                return { ...sec, exercises: sec.exercises.map(ex => (ex as any).locked ? ex : (ni < f.exercises.length ? f.exercises[ni++] : ex)) };
              }) : fresh);
            }} style={{ fontFamily: F, background: G + "12", border: "1px solid " + G + "30", borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: G, fontSize: 13, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" /><path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14" /></svg>
              Classics
            </button>
            <button onClick={() => {
              const fresh = generate(gc, allEx, true).map(s => normalizeSection(s as unknown as Record<string,unknown>));
              setGr(prev => prev ? prev.map((sec, i) => {
                const f = fresh[i]; if (!f) return sec;
                let ni = 0;
                return { ...sec, exercises: sec.exercises.map(ex => (ex as any).locked ? ex : (ni < f.exercises.length ? f.exercises[ni++] : ex)) };
              }) : fresh);
            }} style={{ fontFamily: F, background: P + "12", border: "1px solid " + P + "30", borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: P, fontSize: 13, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" /><path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14" /></svg>
              Full Library
            </button>
          </div>
        </div>

        {/* Beatdown name + description */}
        <div style={{ padding: "0 4px 16px" }}>
          <div style={{ color: T4, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Edit your beatdown</div>
          <input value={grT} maxLength={50} onChange={e => setGrT(e.target.value)} placeholder="Name this beatdown..." style={{ width: "100%", background: "none", border: "none", borderBottom: "2px solid " + BD, color: T1, fontSize: 26, fontWeight: 800, padding: "4px 0 10px", fontFamily: F, outline: "none", boxSizing: "border-box" }} />
          <textarea value={grD} onChange={e => setGrD(e.target.value)} placeholder="Describe this beatdown..." rows={2} style={{ width: "100%", background: "none", border: "none", color: T3, fontSize: 16, fontStyle: "italic", padding: "10px 0 4px", fontFamily: F, outline: "none", boxSizing: "border-box", fontWeight: 500, resize: "vertical" as const }} />
          <div style={{ color: T4, fontSize: 13, marginTop: 8, fontFamily: F }}>by The Bishop · F3 Essex</div>
        </div>

        {/* Share toggle */}
        <div onClick={() => setShareLib(!shareLib)} style={{ background: shareLib ? G + "10" : CD, border: "1px solid " + (shareLib ? G + "25" : BD), borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid " + (shareLib ? G : T4), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: BG, background: shareLib ? G : "transparent", fontWeight: 800 }}>{shareLib ? "✓" : ""}</div>
          <span style={{ fontSize: 16, color: shareLib ? G : T4, fontWeight: 600, fontFamily: F }}>Share to community library</span>
        </div>

        {/* Beatdown Details — collapsed by default, shows summary from wizard picks */}
        <div style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
          <div onClick={() => setGrDetailsOpen(!grDetailsOpen)} style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <span style={{ color: T2, fontSize: 13, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", fontFamily: F }}>Beatdown Details</span>
              {!grDetailsOpen && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {gc.dur && <span style={{ fontFamily: F, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: G, fontSize: 14, fontWeight: 700, padding: "5px 12px", borderRadius: 8 }}>{gc.dur}</span>}
                  {gc.diff && <span style={{ fontFamily: F, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: A, fontSize: 14, fontWeight: 700, padding: "5px 12px", borderRadius: 8, textTransform: "capitalize" as const }}>{gc.diff}</span>}
                  {(gc.sites || []).map(s => <span key={s} style={{ fontFamily: F, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: T3, fontSize: 14, fontWeight: 600, padding: "5px 12px", borderRadius: 8, textTransform: "capitalize" as const }}>{s}</span>)}
                </div>
              )}
            </div>
            <span style={{ color: T5, fontSize: 16, fontFamily: F }}>{grDetailsOpen ? "▾" : "▸"}</span>
          </div>
          {grDetailsOpen && (
            <div style={{ padding: "12px 18px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {gc.dur && <span style={{ fontFamily: F, background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)", color: G, fontSize: 15, fontWeight: 700, padding: "8px 16px", borderRadius: 10 }}>{gc.dur}</span>}
              {gc.diff && <span style={{ fontFamily: F, background: "rgba(245,158,11,0.15)", border: "1.5px solid rgba(245,158,11,0.4)", color: A, fontSize: 15, fontWeight: 700, padding: "8px 16px", borderRadius: 10, textTransform: "capitalize" as const }}>{gc.diff}</span>}
              {(gc.sites || []).map(s => <span key={s} style={{ fontFamily: F, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: T2, fontSize: 15, fontWeight: 600, padding: "8px 16px", borderRadius: 10, textTransform: "capitalize" as const }}>{s}</span>)}
              {(gc.eq || []).map(e => <span key={e} style={{ fontFamily: F, background: "rgba(167,139,250,0.12)", border: "1.5px solid rgba(167,139,250,0.35)", color: P, fontSize: 15, fontWeight: 600, padding: "8px 16px", borderRadius: 10, textTransform: "capitalize" as const }}>{e}</span>)}
              <div style={{ width: "100%", marginTop: 4 }}><span style={{ fontFamily: F, color: T5, fontSize: 13 }}>Generated with these settings. To change, start a new generation.</span></div>
            </div>
          )}
        </div>

        {/* Section Editor */}
        <SectionEditor sections={gr} onSectionsChange={setGr} allEx={allEx} onSectionReroll={(sectionIdx, mode) => {
          const goRogue = mode === "rogue";
          const sec = gr![sectionIdx];
          const secName = (sec.name || sec.label || "").toLowerCase();
          // Match section to generated pool: Warmup→0, Mary→2, everything else→1 (Thang)
          let sourceIdx = 1;
          if (secName.includes("warmup") || secName.includes("warm-up") || secName.includes("warm up")) sourceIdx = 0;
          else if (secName.includes("mary")) sourceIdx = 2;
          // Count non-transition exercises — this is how many we need to generate
          let exCount = sec.exercises.filter(e => e.type !== "transition").length;
          // Default counts for empty sections
          if (exCount === 0) {
            if (sourceIdx === 0) exCount = 4;       // Warmup default
            else if (sourceIdx === 2) exCount = 6;  // Mary default
            else exCount = 15;                       // Thang/custom default
          }
          // Generate batches until we have enough unique exercises
          // Exclude locked exercises from the pool and only fill unlocked slots
          const lockedNames = sec.exercises.filter(e => (e as any).locked).map(e => ((e as any).name || e.n || "").toLowerCase());
          const unlockedCount = exCount - lockedNames.length;
          if (unlockedCount <= 0 && exCount > 0) {
            // All exercises locked, nothing to reroll
          } else {
          const collected: typeof sec.exercises = [];
          const seen = new Set<string>(lockedNames);
          const target = unlockedCount > 0 ? unlockedCount : exCount;
          for (let attempt = 0; attempt < 5 && collected.length < target; attempt++) {
            const fresh = generate(gc, allEx, goRogue).map(s => normalizeSection(s as unknown as Record<string,unknown>));
            const sourceSec = fresh[sourceIdx];
            if (sourceSec) {
              for (const ex of sourceSec.exercises) {
                const name = (ex as any).name || ex.n || "";
                if (!seen.has(name.toLowerCase()) && collected.length < target) {
                  seen.add(name.toLowerCase());
                  collected.push(ex);
                }
              }
            }
          }
          if (collected.length > 0) {
            // Rebuild: locked stay in place, unlocked get replaced
            let newIdx = 0;
            const finalExercises = sec.exercises.map(ex => {
              if ((ex as any).locked) return ex;
              if (newIdx < collected.length) return collected[newIdx++];
              return ex;
            });
            setGr(prev => prev ? prev.map((s, i) => i !== sectionIdx ? s : { ...s, exercises: finalExercises }) : prev);
          }
          } // end else (has unlocked exercises)
        }} onExerciseLock={(sectionIdx, exerciseIdx) => {
          setGr(prev => {
            if (!prev) return prev;
            return prev.map((s, i) => i !== sectionIdx ? s : {
              ...s,
              exercises: s.exercises.map((ex, j) => j !== exerciseIdx ? ex : { ...ex, locked: !(ex as any).locked } as any),
            });
          });
        }} />

        {/* Action area — Round 3: Layer 1 primary + Layer 2 icon pills */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
          {/* LAYER 1 — PRIMARY */}
          <button disabled={saving} onClick={() => {
            if (saving) return; setSaving(true);
            const nm = grT.trim() || "Generated Beatdown";
            const tgs = [gc.dur, ...(gc.sites || []), ...(gc.eq || [])].filter(Boolean) as string[];
            onSave({ nm, desc: grD, d: gc.diff || "medium", secs: JSON.parse(JSON.stringify(gr)), tg: tgs, src: "Generated", dur: gc.dur, sites: gc.sites, eq: gc.eq, share: shareLib });
          }} style={{ fontFamily: F, width: "100%", padding: "20px 0", borderRadius: 14, fontSize: 18, fontWeight: 800, cursor: saving ? "default" : "pointer", background: saving ? "#1a1a1e" : G, color: saving ? T4 : BG, border: "none", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save"}</button>

          {/* LAYER 2 — SECONDARY ROW (icon pills) */}
          {!saving && (
            <div style={{ display: "flex", gap: 6 }}>
              {onRunThis && (
                <button onClick={() => {
                  setSaving(true);
                  const nm = grT.trim() || "Generated Beatdown";
                  const tgs = [gc.dur, ...(gc.sites || []), ...(gc.eq || [])].filter(Boolean) as string[];
                  const saveData = { nm, desc: grD, d: gc.diff || "medium", secs: JSON.parse(JSON.stringify(gr)), tg: tgs, src: "Generated", dur: gc.dur, sites: gc.sites, eq: gc.eq, share: shareLib };
                  onRunThis(JSON.parse(JSON.stringify(gr!)), nm, gc.dur || "45 min", saveData);
                }} style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.30)", color: G, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 14, lineHeight: 1, marginBottom: 6 }}>▶</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>Run This</span>
                </button>
              )}
              <button
                onClick={() => onSendPreblast?.({
                  id: "draft",
                  title: grT || "Untitled beatdown",
                  duration: gc.dur,
                  difficulty: DIFFS.find(d => d.id === gc.diff)?.l ?? null,
                  sections: (gr || []).map(s => ({
                    label: s.label,
                    color: s.color,
                    exercises: s.exercises.map(e => ({ name: e.n, reps: e.r ?? null, cadence: e.c ?? null })),
                  })),
                })}
                style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.30)", color: P, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <span style={{ fontSize: 14, lineHeight: 1, marginBottom: 6 }}>📣</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>Preblast</span>
              </button>
              <button onClick={() => setCopyModal(true)} style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.30)", color: A, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 14, lineHeight: 1, marginBottom: 6 }}>📓</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>Backblast</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  // ════ WIZARD ════
  const pr = (
    <div style={{ padding: "0 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {gs > 0 ? <button onClick={() => setGs(gs - 1)} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Back</button> : <button onClick={onClose} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Home</button>}
        <div style={{ fontSize: 13, color: T5 }}>Step {gs + 1} of 4</div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= gs ? G : BD }} />)}
      </div>
    </div>
  );

  // Step 1: Duration
  if (gs === 0) return (
    <div>{pr}{toastEl}
      <div style={{ padding: "32px 24px 0" }}><div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>How long?</div></div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {["30 min", "45 min", "60 min"].map(d => (
          <button key={d} onClick={() => { setGc({ ...gc, dur: d }); setGs(1); }} style={{ width: "100%", textAlign: "left", borderRadius: 16, padding: 22, border: "1px solid " + BD, background: CD, cursor: "pointer", fontFamily: F }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T1 }}>{d}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Difficulty
  if (gs === 1) return (
    <div>{pr}{toastEl}
      <div style={{ padding: "32px 24px 0" }}><div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>How much suffering?</div></div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {DIFFS.map(d => (
          <button key={d.id} onClick={() => { setGc({ ...gc, diff: d.id }); setGs(2); }} style={{ width: "100%", textAlign: "left", borderRadius: 16, padding: "20px 22px", border: "1px solid " + d.c + "20", background: d.c + "08", cursor: "pointer", fontFamily: F }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: d.c }}>{d.l}</div><div style={{ fontSize: 13, color: T4, marginTop: 4 }}>{d.d}</div></div>
              <div style={{ fontSize: 13, color: T5 }}>{d.r}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 3: AO Sites
  if (gs === 2) return (
    <div>{pr}{toastEl}
      <div style={{ padding: "32px 24px 0" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>What&apos;s at your AO?</div>
        <div style={{ fontSize: 14, color: T4, marginTop: 6 }}>Select all — most AOs are a combo</div>
      </div>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {SITES.map(sv => {
          const sel = gc.sites.includes(sv.id);
          return (
            <button key={sv.id} onClick={() => setGc({ ...gc, sites: sel ? gc.sites.filter(x => x !== sv.id) : [...gc.sites, sv.id] })} style={{ borderRadius: 14, padding: "18px 16px", border: "1px solid " + (sel ? "rgba(34,197,94,0.3)" : BD), background: sel ? "rgba(34,197,94,0.08)" : CD, cursor: "pointer", fontFamily: F, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: sel ? G : T3 }}>{sv.l}</div>
              {sel ? <div style={{ width: 20, height: 20, borderRadius: "50%", background: G, margin: "8px auto 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: BG, fontWeight: 700 }}>✓</div> : null}
            </button>
          );
        })}
      </div>
      {gc.sites.length > 0 ? <div style={{ padding: "0 24px" }}><button onClick={() => setGs(3)} style={{ fontFamily: F, width: "100%", padding: "14px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Next →</button></div> : null}
    </div>
  );

  // Step 4: Equipment
  if (gs === 3) return (
    <div>{pr}{toastEl}
      <div style={{ padding: "32px 24px 0" }}><div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>Equipment</div></div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {EQUIP.map(e => {
          const sel = gc.eq.includes(e.id);
          return (
            <button key={e.id} onClick={() => setGc({ ...gc, eq: sel ? gc.eq.filter(x => x !== e.id) : [...gc.eq, e.id] })} style={{ width: "100%", textAlign: "left", borderRadius: 14, padding: "18px 22px", border: "1px solid " + (sel ? P + "30" : BD), background: sel ? P + "10" : CD, cursor: "pointer", fontFamily: F, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: sel ? P : T2 }}>{e.l}</span>
              {sel ? <span style={{ color: P, fontWeight: 700 }}>✓</span> : null}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "8px 24px 0" }}>
        <button onClick={() => { setLd(true); setTimeout(() => { setGr(generate(gc, allEx).map(s => normalizeSection(s as unknown as Record<string,unknown>))); setGrT(""); setGrD(""); setLd(false); }, 1000); }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Generate beatdown</button>
      </div>
    </div>
  );

  return null;
}
