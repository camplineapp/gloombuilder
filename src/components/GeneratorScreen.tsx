"use client";

import { useState } from "react";
import { EX, TAGS, DIFFS, SITES, EQUIP, generate } from "@/lib/exercises";
import type { GenConfig, Section, SectionExercise, ExerciseData } from "@/lib/exercises";
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
}

export default function GeneratorScreen({ onClose, onSave }: GeneratorScreenProps) {
  const [gs, setGs] = useState(0);
  const [gc, setGc] = useState<GenConfig>({ dur: null, diff: null, sites: [], eq: [] });
  const [gr, setGr] = useState<Section[] | null>(null);
  const [grT, setGrT] = useState("");
  const [grD, setGrD] = useState("");
  const [ld, setLd] = useState(false);
  const [shareLib, setShareLib] = useState(false);
  const [toast, setToast] = useState("");

  // Section editor state
  const [editEx, setEditEx] = useState<{ si: number; ei: number } | null>(null);
  const [eL, setEL] = useState<string | null>(null);
  const [aS, setAS] = useState("");

  // Exercise picker state
  const [pk2, setPk2] = useState(false);
  const [pkI, setPkI] = useState(0);
  const [pS, setPS] = useState("");
  const [pTg, setPTg] = useState<string | null>(null);

  // Exercise detail modal
  const [exD, setExD] = useState<ExerciseData | null>(null);
  const [copyModal, setCopyModal] = useState(false);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  // Section helpers
  const updateEx = (si: number, ei: number, key: string, val: string) => {
    if (!gr) return;
    setGr(gr.map((sec, i) => i !== si ? sec : {
      ...sec, exercises: sec.exercises.map((x, j) => j !== ei ? x : { ...x, [key]: val })
    }));
  };
  const moveExFn = (si: number, ei: number, dir: number) => {
    if (!gr) return;
    const sec = gr[si]; const ni = ei + dir;
    if (ni < 0 || ni >= sec.exercises.length) return;
    setGr(gr.map((s, i) => {
      if (i !== si) return s;
      const x = [...s.exercises]; const tmp = x[ei]; x[ei] = x[ni]; x[ni] = tmp;
      return { ...s, exercises: x };
    }));
  };
  const removeEx = (si: number, ei: number) => {
    if (!gr) return;
    setGr(gr.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.filter((_, j) => j !== ei) }));
    setEditEx(null);
  };
  const moveSec = (si: number, dir: number) => {
    if (!gr) return;
    const ni = si + dir; if (ni < 0 || ni >= gr.length) return;
    const u = [...gr]; const m = u.splice(si, 1)[0]; u.splice(ni, 0, m); setGr(u);
  };
  const sC = [G, "#3b82f6", A, R, P, "#ec4899", "#06b6d4"];

  // ════ EXERCISE DETAIL MODAL ════
  const exDM = exD ? (
    <div onClick={() => setExD(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111318", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430, maxHeight: "65vh", overflowY: "auto", border: "1px solid " + BD, borderBottom: "none" }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "0 auto 24px" }} />
        <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: T1 }}>{exD.n}</div>
        <div style={{ fontFamily: F, color: T4, fontSize: 13, marginTop: 6 }}>{exD.f}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>{exD.t.map(t => <span key={t} style={{ background: A + "12", color: A, fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: F, textTransform: "uppercase" }}>{t}</span>)}</div>
        <div style={{ fontFamily: F, marginTop: 24, color: T5, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>How to execute</div>
        <div style={{ fontFamily: F, color: T3, fontSize: 15, lineHeight: 1.8, marginTop: 12 }}>{exD.h}</div>
      </div>
    </div>
  ) : null;

  // ════ EXERCISE PICKER ════
  const pkM = pk2 && gr ? (() => {
    const sec = gr[pkI];
    if (!sec) return null;
    const fi = EX.filter(e => {
      const ms = !pS || e.n.toLowerCase().includes(pS.toLowerCase()) || e.f.toLowerCase().includes(pS.toLowerCase());
      const mt = !pTg || e.t.includes(pTg);
      return ms && mt;
    });
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 150, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: F, color: T1, fontSize: 18, fontWeight: 700 }}>Add to {sec.label}</span>
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
          {fi.map(e => (
            <div key={e.n} style={{ padding: "14px 16px", background: CD, border: "1px solid " + BD, borderRadius: 14, marginBottom: 6, display: "flex", alignItems: "center" }}>
              <div onClick={() => setExD(e)} style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontFamily: F, color: T2, fontWeight: 600, fontSize: 15 }}>{e.n} <span style={{ fontSize: 11, color: T5 }}>ⓘ</span></div>
                <div style={{ fontFamily: F, color: T4, fontSize: 12, marginTop: 3 }}>{e.f}</div>
              </div>
              <button onClick={() => {
                const add: SectionExercise = { n: e.n, r: "10", c: "IC", nt: "" };
                setGr(gr!.map((s, i) => i !== pkI ? s : { ...s, exercises: [...s.exercises, add] }));
                setPk2(false);
              }} style={{ fontFamily: F, background: sec.color, color: BG, border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 12 }}>+ Add</button>
            </div>
          ))}
        </div>
      </div>
    );
  })() : null;

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
        {exDM}{pkM}{toastEl}
        {copyModal && gr ? <CopyModal secs={gr} beatdownName={grT || "Generated Beatdown"} beatdownDesc={grD} qName="The Bishop" onClose={() => setCopyModal(false)} onToast={fl} /> : null}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => { setGr(null); setGs(0); onClose(); }} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Home</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setCopyModal(true)} style={{ fontFamily: F, background: A + "15", color: A, border: "1px solid " + A + "30", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Copy for Slack</button>
            <button onClick={() => { setGr(generate(gc)); setGrT(""); setGrD(""); }} style={{ fontFamily: F, background: A + "15", color: A, border: "1px solid " + A + "30", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Reroll</button>
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T1, marginBottom: 4 }}>Edit your beatdown</div>
        <input value={grT} maxLength={50} onChange={e => setGrT(e.target.value)} placeholder="Name this beatdown..." style={{ ...ist, background: "none", border: "none", borderBottom: "2px solid " + BD, borderRadius: 0, fontSize: 22, fontWeight: 800, color: T1, padding: "0 0 10px" }} />
        <textarea value={grD} onChange={e => setGrD(e.target.value)} placeholder="Describe this beatdown..." rows={2} style={{ ...ist, marginTop: 10, resize: "vertical", fontStyle: "italic" }} />
        <div style={{ color: T5, fontSize: 12, marginTop: 8 }}>by The Bishop · F3 Essex</div>
        {/* Share toggle */}
        <div onClick={() => setShareLib(!shareLib)} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 14px", background: shareLib ? G + "10" : CD, border: "1px solid " + (shareLib ? G + "25" : BD), borderRadius: 10, cursor: "pointer" }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (shareLib ? G : T5), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: BG, background: shareLib ? G : "transparent" }}>{shareLib ? "✓" : ""}</div>
          <span style={{ fontSize: 13, color: shareLib ? G : T4 }}>Share to community library</span>
        </div>
        {/* Sections */}
        {gr.map((sec, si) => (
          <div key={si} style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveSec(si, -1)} disabled={si === 0} style={{ background: "none", border: "none", color: si === 0 ? T6 : T4, cursor: si === 0 ? "default" : "pointer", fontSize: 10, padding: "1px 4px" }}>▲</button>
                  <button onClick={() => moveSec(si, 1)} disabled={si === gr.length - 1} style={{ background: "none", border: "none", color: si === gr.length - 1 ? T6 : T4, cursor: si === gr.length - 1 ? "default" : "pointer", fontSize: 10, padding: "1px 4px" }}>▼</button>
                </div>
                {eL === String(si) ? (
                  <input autoFocus value={sec.label} maxLength={25} onChange={e => setGr(gr.map((s, i) => i !== si ? s : { ...s, label: e.target.value }))} onBlur={() => setEL(null)} onKeyDown={e => { if (e.key === "Enter") setEL(null); }} style={{ fontFamily: F, color: sec.color, fontSize: 13, textTransform: "uppercase", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px", outline: "none", width: 150, fontWeight: 700 }} />
                ) : (
                  <div onClick={() => setEL(String(si))} style={{ color: sec.color, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, cursor: "pointer", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{sec.label} ({sec.exercises.length})</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setPk2(true); setPkI(si); setPS(""); setPTg(null); }} style={{ fontFamily: F, background: sec.color + "12", color: sec.color, border: "1px dashed " + sec.color + "40", padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add</button>
                {si > 0 ? <button onClick={() => setGr(gr.filter((_, j) => j !== si))} style={{ fontFamily: F, background: "rgba(239,68,68,0.08)", color: R, border: "1px solid rgba(239,68,68,0.12)", padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>✕</button> : null}
              </div>
            </div>
            {sec.exercises.length === 0 ? <div onClick={() => { setPk2(true); setPkI(si); setPS(""); setPTg(null); }} style={{ border: "1px dashed " + BD, borderRadius: 14, padding: 24, textAlign: "center", color: T6, fontSize: 13, cursor: "pointer" }}>Tap to add exercises</div> : null}
            {/* Exercises */}
            {sec.exercises.map((ex, ei) => {
              const isOpen = editEx?.si === si && editEx?.ei === ei;
              if (!isOpen) {
                return (
                  <div key={ei} onClick={() => setEditEx({ si, ei })} style={{ background: CD, borderLeft: "3px solid " + sec.color + "40", borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 4, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                          <button onClick={ev => { ev.stopPropagation(); moveExFn(si, ei, -1); }} disabled={ei === 0} style={{ background: "none", border: "none", color: ei === 0 ? T6 : T3, cursor: ei === 0 ? "default" : "pointer", fontSize: 11, padding: "1px 5px", lineHeight: 1 }}>▲</button>
                          <button onClick={ev => { ev.stopPropagation(); moveExFn(si, ei, 1); }} disabled={ei === sec.exercises.length - 1} style={{ background: "none", border: "none", color: ei === sec.exercises.length - 1 ? T6 : T3, cursor: ei === sec.exercises.length - 1 ? "default" : "pointer", fontSize: 11, padding: "1px 5px", lineHeight: 1 }}>▼</button>
                        </div>
                        <span style={{ color: T2, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.n}</span>
                      </div>
                      <span style={{ color: sec.color, fontSize: 12, fontWeight: 600, flexShrink: 0, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>x{ex.r} {ex.c}</span>
                    </div>
                    {ex.nt ? <div style={{ color: T4, fontSize: 11, fontStyle: "italic", marginTop: 4, marginLeft: 28, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.nt}</div> : null}
                  </div>
                );
              }
              return (
                <div key={ei} style={{ background: "rgba(255,255,255,0.04)", borderLeft: "3px solid " + sec.color, borderRadius: "0 12px 12px 0", padding: "14px 16px", marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={() => moveExFn(si, ei, -1)} disabled={ei === 0} style={{ background: "none", border: "none", color: ei === 0 ? T6 : T3, cursor: ei === 0 ? "default" : "pointer", fontSize: 12, padding: "2px 6px", lineHeight: 1 }}>▲</button>
                        <button onClick={() => moveExFn(si, ei, 1)} disabled={ei === sec.exercises.length - 1} style={{ background: "none", border: "none", color: ei === sec.exercises.length - 1 ? T6 : T3, cursor: ei === sec.exercises.length - 1 ? "default" : "pointer", fontSize: 12, padding: "2px 6px", lineHeight: 1 }}>▼</button>
                      </div>
                      <span onClick={() => { const i = EX.find(x => x.n === ex.n); if (i) setExD(i); }} style={{ color: T1, fontSize: 15, fontWeight: 700, cursor: "pointer", borderBottom: "1px dashed rgba(255,255,255,0.2)" }}>{ex.n} <span style={{ fontSize: 10, color: T5 }}>ⓘ</span></span>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <button onClick={() => setEditEx(null)} style={{ background: "none", border: "none", color: G, cursor: "pointer", fontSize: 12, fontFamily: F, fontWeight: 600 }}>Done</button>
                      <button onClick={() => removeEx(si, ei)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: R, cursor: "pointer", fontSize: 12, padding: "4px 10px", borderRadius: 6, fontFamily: F }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <span style={{ color: T5, fontSize: 10, fontWeight: 600 }}>REPS</span>
                    <input value={ex.r} maxLength={10} onChange={e => updateEx(si, ei, "r", e.target.value)} style={{ fontFamily: F, width: 60, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: sec.color, textAlign: "center", padding: "6px 0", fontSize: 14, fontWeight: 700, outline: "none" }} />
                    <span style={{ color: T5, fontSize: 10, fontWeight: 600 }}>CADENCE</span>
                    <input value={ex.c} maxLength={15} onChange={e => updateEx(si, ei, "c", e.target.value)} placeholder="IC, OYO..." style={{ fontFamily: F, flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: T3, padding: "6px 10px", fontSize: 12, outline: "none" }} />
                  </div>
                  <input value={ex.nt} maxLength={100} onChange={e => updateEx(si, ei, "nt", e.target.value)} placeholder="Add a note..." style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, color: T3, padding: "8px 10px", fontSize: 12, outline: "none", marginTop: 8, fontStyle: "italic", boxSizing: "border-box", fontFamily: F }} />
                </div>
              );
            })}
            <textarea value={sec.note || ""} onChange={e => setGr(gr.map((s, i) => i !== si ? s : { ...s, note: e.target.value }))} placeholder={"Q notes for " + sec.label + "..."} rows={2} style={{ ...ist, marginTop: 8, resize: "vertical", fontStyle: "italic", background: "rgba(255,255,255,0.03)" }} />
          </div>
        ))}
        {/* Add section */}
        <div style={{ marginTop: 28, display: "flex", gap: 8 }}>
          <input value={aS} maxLength={25} onChange={e => setAS(e.target.value)} placeholder="New section name..." style={{ ...ist, flex: 1 }} />
          <button onClick={() => { if (!aS.trim()) return; setGr([...gr, { label: aS.trim(), color: sC[gr.length % sC.length], exercises: [], note: "" }]); setAS(""); }} style={{ fontFamily: F, background: "rgba(255,255,255,0.04)", color: T3, border: "1px solid " + BD, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>+ Section</button>
        </div>
        {/* Save */}
        <div style={{ marginTop: 32 }}>
          <button onClick={() => {
            const nm = grT.trim() || "Generated Beatdown";
            const tgs = [gc.dur, (DIFFS.find(x => x.id === gc.diff) || { l: "" }).l, ...gc.sites.map(s => (SITES.find(x => x.id === s) || { l: "" }).l), ...gc.eq.filter(e => e !== "none").map(e => (EQUIP.find(x => x.id === e) || { l: "" }).l)].filter((v): v is string => Boolean(v));
            onSave({ nm, desc: grD, d: gc.diff || "medium", secs: JSON.parse(JSON.stringify(gr)), tg: tgs, src: "Generated", dur: gc.dur, sites: gc.sites, eq: gc.eq, share: shareLib });
          }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save to locker</button>
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
        <button onClick={() => { setLd(true); setTimeout(() => { setGr(generate(gc)); setGrT(""); setGrD(""); setLd(false); }, 1000); }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Generate beatdown</button>
      </div>
    </div>
  );

  return null;
}
