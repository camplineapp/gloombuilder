"use client";

import { useState, useEffect, useRef } from "react";
import { EX, TAGS, DIFFS, SITES, EQUIP, mapSupabaseExercise } from "@/lib/exercises";
import type { Section, SectionExercise, ExerciseData } from "@/lib/exercises";
import { loadSeedExercises } from "@/lib/db";
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

interface BuilderScreenProps {
  onClose: () => void;
  onSave: (beatdown: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean;
  }) => void;
  editData?: {
    id: string; nm: string; desc: string; d: string; secs: Section[];
    tg: string[]; dur: string | null; sites: string[]; eq: string[]; isPublic?: boolean;
  };
  onUpdate?: (id: string, data: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    dur: string | null; sites: string[]; eq: string[];
  }) => void;
}

export default function BuilderScreen({ onClose, onSave, editData, onUpdate }: BuilderScreenProps) {
  const [bT, setBT] = useState(editData?.nm || "");
  const [bD, setBD] = useState(editData?.desc || "");
  const [bDur, setBDur] = useState<string | null>(editData?.dur || null);
  const [bDiff, setBDiff] = useState<string | null>(editData?.d || null);
  const [bSites, setBSites] = useState<string[]>(editData?.sites || []);
  const [bEq, setBEq] = useState<string[]>(editData?.eq || []);
  const [secs, setSecs] = useState<Section[]>(editData?.secs && editData.secs.length > 0 ? editData.secs : [
    { label: "Warmup", color: G, exercises: [], note: "" },
    { label: "The Thang", color: A, exercises: [], note: "" },
    { label: "Mary", color: P, exercises: [], note: "" },
  ]);
  const [shareLib, setShareLib] = useState(editData?.isPublic || false);
  const [toast, setToast] = useState("");
  const [allEx, setAllEx] = useState<ExerciseData[]>(EX);

  useEffect(() => {
    loadSeedExercises().then(rows => {
      if (rows.length > 0) {
        const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
        setAllEx(mapped);
      }
    });
  }, []);

  const [editEx, setEditEx] = useState<{ si: number; ei: number } | null>(null);
  const [eL, setEL] = useState<string | null>(null);
  const [aS, setAS] = useState("");
  const [pk2, setPk2] = useState(false);
  const [pkI, setPkI] = useState(0);
  const [pS, setPS] = useState("");
  const [pTg, setPTg] = useState<string | null>(null);
  const [exD, setExD] = useState<ExerciseData | null>(null);
  const [copyModal, setCopyModal] = useState(false);
  // Quick-add inline autocomplete
  const [qaQ, setQaQ] = useState("");
  const [qaSec, setQaSec] = useState<number | null>(null);
  const qaRef = useRef<HTMLInputElement>(null);
  // Transition
  const [trSec, setTrSec] = useState<number | null>(null);
  const [trText, setTrText] = useState("");
  const trRef = useRef<HTMLInputElement>(null);

  const qaSearch = (q: string) => {
    if (q.length < 2) return [];
    const ql = q.toLowerCase();
    const scored = allEx.map(e => {
      const nl = e.n.toLowerCase();
      const fl = e.f.toLowerCase();
      if (nl === ql) return { ...e, score: 0 };
      if (nl.startsWith(ql)) return { ...e, score: 1 };
      if (nl.includes(ql)) return { ...e, score: 2 };
      if (fl.includes(ql)) return { ...e, score: 3 };
      if ((e.d || "").toLowerCase().includes(ql)) return { ...e, score: 4 };
      return null;
    }).filter(Boolean) as (ExerciseData & { score: number })[];
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 5);
  };
  const qaResults = qaSearch(qaQ);

  const addFromQA = (name: string, si: number, isCustom: boolean) => {
    const add: SectionExercise = { n: name, r: "10", c: "IC", nt: "" };
    setSecs(secs.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setQaQ("");
    fl(name + (isCustom ? " added as custom" : " added"));
    setTimeout(() => qaRef.current?.focus(), 100);
  };

  const addTransition = (si: number) => {
    if (!trText.trim()) return;
    const add: SectionExercise = { n: trText.trim(), r: "", c: "", nt: "", type: "transition" } as SectionExercise;
    setSecs(secs.map((s, i) => i !== si ? s : { ...s, exercises: [...s.exercises, add] }));
    setTrText("");
    setTrSec(null);
    fl("Transition added");
  };

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const sC = [G, "#3b82f6", A, R, P, "#ec4899", "#06b6d4"];

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  const updateEx = (si: number, ei: number, key: string, val: string) => {
    setSecs(secs.map((sec, i) => i !== si ? sec : {
      ...sec, exercises: sec.exercises.map((x, j) => j !== ei ? x : { ...x, [key]: val })
    }));
  };
  const moveExFn = (si: number, ei: number, dir: number) => {
    const sec = secs[si]; const ni = ei + dir;
    if (ni < 0 || ni >= sec.exercises.length) return;
    setSecs(secs.map((s, i) => {
      if (i !== si) return s;
      const x = [...s.exercises]; const tmp = x[ei]; x[ei] = x[ni]; x[ni] = tmp;
      return { ...s, exercises: x };
    }));
  };
  const removeEx = (si: number, ei: number) => {
    setSecs(secs.map((s, i) => i !== si ? s : { ...s, exercises: s.exercises.filter((_, j) => j !== ei) }));
    setEditEx(null);
  };
  const moveSec = (si: number, dir: number) => {
    const ni = si + dir; if (ni < 0 || ni >= secs.length) return;
    const u = [...secs]; const m = u.splice(si, 1)[0]; u.splice(ni, 0, m); setSecs(u);
  };

  // ════ EXERCISE DETAIL MODAL ════
  const exDM = exD ? (
    <div onClick={() => setExD(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111318", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430, maxHeight: "65vh", overflowY: "auto", border: "1px solid " + BD, borderBottom: "none" }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "0 auto 24px" }} />
        <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: T1 }}>{exD.n}</div>
        <div style={{ fontFamily: F, color: T4, fontSize: 13, marginTop: 6 }}>{exD.f}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>{exD.t.map(t => <span key={t} style={{ background: A + "12", color: A, fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: F, textTransform: "uppercase" }}>{t}</span>)}</div>
        {exD.d ? <><div style={{ fontFamily: F, marginTop: 20, color: T5, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Description</div><div style={{ fontFamily: F, color: T3, fontSize: 15, lineHeight: 1.7, marginTop: 8 }}>{exD.d}</div></> : null}
        <div style={{ fontFamily: F, marginTop: 20, color: T5, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>How to execute</div>
        <div style={{ fontFamily: F, color: T3, fontSize: 15, lineHeight: 1.8, marginTop: 8 }}>{exD.h.split(/(?=\d+\.\s)/).filter(Boolean).map((step, i) => <div key={i} style={{ marginBottom: 4 }}>{step.trim()}</div>)}</div>
      </div>
    </div>
  ) : null;

  // ════ EXERCISE PICKER ════
  const pkM = pk2 ? (() => {
    const sec = secs[pkI];
    if (!sec) return null;
    const fi = allEx.filter(e => {
      const ms = !pS || e.n.toLowerCase().includes(pS.toLowerCase()) || e.f.toLowerCase().includes(pS.toLowerCase()) || (e.d || "").toLowerCase().includes(pS.toLowerCase());
      const mt = !pTg || e.t.includes(pTg);
      return ms && mt;
    });
    if (pS.trim()) {
      const q = pS.toLowerCase();
      fi.sort((a, b) => {
        const scoreOf = (e: typeof a) => {
          if (e.n.toLowerCase() === q) return 0;
          if (e.n.toLowerCase().startsWith(q)) return 1;
          if (e.n.toLowerCase().includes(q)) return 2;
          if (e.f.toLowerCase().includes(q)) return 3;
          return 4;
        };
        return scoreOf(a) - scoreOf(b);
      });
    }
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
                <div style={{ fontFamily: F, color: T4, fontSize: 12, marginTop: 3 }}>{e.d || e.f}</div>
              </div>
              <button onClick={() => {
                const add: SectionExercise = { n: e.n, r: "10", c: "IC", nt: "" };
                setSecs(secs.map((s, i) => i !== pkI ? s : { ...s, exercises: [...s.exercises, add] }));
                setPk2(false);
              }} style={{ fontFamily: F, background: sec.color, color: BG, border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 12 }}>+ Add</button>
            </div>
          ))}
        </div>
      </div>
    );
  })() : null;

  return (
    <div style={{ padding: "0 24px" }}>
      {exDM}{pkM}{toastEl}
      {copyModal ? <CopyModal secs={secs} beatdownName={bT || "Untitled Beatdown"} beatdownDesc={bD} qName="The Bishop" onClose={() => setCopyModal(false)} onToast={fl} /> : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onClose} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>{editData ? "← Locker" : "← Home"}</button>
        <button onClick={() => setCopyModal(true)} style={{ fontFamily: F, background: A + "15", color: A, border: "1px solid " + A + "30", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Copy for Slack</button>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: T1, marginBottom: 4 }}>{editData ? "Edit beatdown" : "Build beatdown"}</div>
      <input value={bT} maxLength={50} onChange={e => setBT(e.target.value)} placeholder="Name this beatdown..." style={{ ...ist, background: "none", border: "none", borderBottom: "2px solid " + BD, borderRadius: 0, fontSize: 22, fontWeight: 800, color: T1, padding: "0 0 10px" }} />
      <textarea value={bD} onChange={e => setBD(e.target.value)} placeholder="Describe this beatdown..." rows={2} style={{ ...ist, marginTop: 10, resize: "vertical", fontStyle: "italic" }} />
      <div style={{ color: T5, fontSize: 12, marginTop: 8 }}>by The Bishop · F3 Essex</div>

      {/* Share toggle — hidden in edit mode */}
      {!editData ? (
      <div onClick={() => { if (!shareLib) { if (confirm("Share to community? This can't be undone.")) setShareLib(true); } else { setShareLib(false); } }} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 14px", background: shareLib ? G + "10" : CD, border: "1px solid " + (shareLib ? G + "25" : BD), borderRadius: 10, cursor: "pointer" }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (shareLib ? G : T5), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: BG, background: shareLib ? G : "transparent" }}>{shareLib ? "✓" : ""}</div>
        <span style={{ fontSize: 13, color: shareLib ? G : T4 }}>Share to community library</span>
      </div>
      ) : null}

      {/* Beatdown details */}
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5 }}>Beatdown details</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T5, padding: "7px 0" }}>Duration:</span>
          {["30 min", "45 min", "60 min"].map(d => {
            const sel = bDur === d;
            return <button key={d} onClick={() => setBDur(sel ? null : d)} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: "1px solid " + (sel ? G + "30" : BD), padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{d}</button>;
          })}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T5, padding: "7px 0" }}>Difficulty:</span>
          {DIFFS.map(d => {
            const sel = bDiff === d.id;
            return <button key={d.id} onClick={() => setBDiff(sel ? null : d.id)} style={{ fontFamily: F, background: sel ? d.c + "20" : "rgba(255,255,255,0.04)", color: sel ? d.c : T4, border: "1px solid " + (sel ? d.c + "30" : BD), padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{d.l}</button>;
          })}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T5, padding: "7px 0" }}>AO site:</span>
          {SITES.map(sv => {
            const sel = bSites.includes(sv.id);
            return <button key={sv.id} onClick={() => setBSites(sel ? bSites.filter(x => x !== sv.id) : [...bSites, sv.id])} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: "1px solid " + (sel ? G + "30" : BD), padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{sv.l}</button>;
          })}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T5, padding: "7px 0" }}>Equipment:</span>
          {EQUIP.map(e => {
            const sel = bEq.includes(e.id);
            return <button key={e.id} onClick={() => setBEq(sel ? bEq.filter(x => x !== e.id) : [...bEq, e.id])} style={{ fontFamily: F, background: sel ? P + "20" : "rgba(255,255,255,0.04)", color: sel ? P : T4, border: "1px solid " + (sel ? P + "30" : BD), padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{e.l}</button>;
          })}
        </div>
      </div>

      {/* Sections */}
      {secs.map((sec, si) => (
        <div key={si} style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => moveSec(si, -1)} disabled={si === 0} style={{ background: "none", border: "none", color: si === 0 ? T6 : T4, cursor: si === 0 ? "default" : "pointer", fontSize: 10, padding: "1px 4px" }}>▲</button>
                <button onClick={() => moveSec(si, 1)} disabled={si === secs.length - 1} style={{ background: "none", border: "none", color: si === secs.length - 1 ? T6 : T4, cursor: si === secs.length - 1 ? "default" : "pointer", fontSize: 10, padding: "1px 4px" }}>▼</button>
              </div>
              {eL === String(si) ? (
                <input autoFocus value={sec.label} maxLength={60} onChange={e => setSecs(secs.map((s, i) => i !== si ? s : { ...s, label: e.target.value }))} onBlur={() => setEL(null)} onKeyDown={e => { if (e.key === "Enter") setEL(null); }} style={{ fontFamily: F, color: sec.color, fontSize: 13, textTransform: "uppercase", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 12px", outline: "none", width: 200, fontWeight: 700 }} />
              ) : (
                <div onClick={() => setEL(String(si))} style={{ color: sec.color, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, cursor: "pointer", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{sec.label} ({sec.exercises.length})</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {si > 0 ? <button onClick={() => setSecs(secs.filter((_, j) => j !== si))} style={{ fontFamily: F, background: "rgba(239,68,68,0.08)", color: R, border: "1px solid rgba(239,68,68,0.12)", padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>✕</button> : null}
            </div>
          </div>
          {sec.exercises.map((ex, ei) => {
            // ── Transition line ──
            if (ex.type === "transition") {
              return (
                <div key={ei} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 4, borderLeft: "3px solid " + sec.color + "15", borderRadius: "0 10px 10px 0", background: "rgba(255,255,255,0.015)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                    <button onClick={() => moveExFn(si, ei, -1)} disabled={ei === 0} style={{ background: "none", border: "none", color: ei === 0 ? T6 : T3, cursor: ei === 0 ? "default" : "pointer", fontSize: 11, padding: "1px 5px", lineHeight: 1 }}>▲</button>
                    <button onClick={() => moveExFn(si, ei, 1)} disabled={ei === sec.exercises.length - 1} style={{ background: "none", border: "none", color: ei === sec.exercises.length - 1 ? T6 : T3, cursor: ei === sec.exercises.length - 1 ? "default" : "pointer", fontSize: 11, padding: "1px 5px", lineHeight: 1 }}>▼</button>
                  </div>
                  <span style={{ fontSize: 12, color: T4 }}>↗</span>
                  <span style={{ fontFamily: F, fontSize: 14, color: T3, fontStyle: "italic", flex: 1 }}>{ex.n}</span>
                  <button onClick={() => removeEx(si, ei)} style={{ fontFamily: F, background: "rgba(239,68,68,0.08)", color: R, border: "1px solid rgba(239,68,68,0.12)", padding: "4px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>✕</button>
                </div>
              );
            }
            // ── Regular exercise ──
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
                      {allEx.some(x => x.n.toLowerCase() === ex.n.toLowerCase()) ? <span style={{ fontSize: 11, color: T5 }}>ⓘ</span> : <span style={{ fontSize: 9, color: A, background: A + "15", padding: "2px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>Custom</span>}
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
                    <span onClick={() => { const i = allEx.find(x => x.n.toLowerCase() === ex.n.toLowerCase()); if (i) setExD(i); }} style={{ color: T1, fontSize: 15, fontWeight: 700, cursor: "pointer", borderBottom: "1px dashed rgba(255,255,255,0.2)" }}>{ex.n} <span style={{ fontSize: 10, color: T5 }}>ⓘ</span></span>
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
          {/* ════ INLINE QUICK-ADD ════ */}
          <div style={{ position: "relative", marginTop: sec.exercises.length > 0 ? 8 : 0 }}>
            <input
              ref={qaSec === si ? qaRef : null}
              value={qaSec === si ? qaQ : ""}
              onFocus={() => { setQaSec(si); setQaQ(""); }}
              onChange={e => { setQaSec(si); setQaQ(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter" && qaQ.trim().length >= 2 && qaSec === si) { addFromQA(qaQ.trim(), si, true); } }}
              placeholder="Type exercise name..."
              style={{ ...ist, borderColor: qaSec === si && qaQ.length >= 2 ? sec.color + "50" : BD }}
            />
            {qaSec === si && qaQ.length >= 2 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#1a1a1e", border: "1px solid " + sec.color + "30", borderRadius: 12, marginTop: 4, overflow: "hidden" }}>
                {/* Custom always on top */}
                <div onClick={() => addFromQA(qaQ.trim(), si, true)} style={{ padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: A + "06", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ fontFamily: F, fontSize: 14, color: A, fontWeight: 600 }}>Add &ldquo;{qaQ.trim()}&rdquo; as custom</div>
                    <div style={{ fontFamily: F, fontSize: 11, color: T5, marginTop: 2 }}>Won&apos;t be linked to exercise database</div>
                  </div>
                  <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: A, background: A + "15", padding: "4px 10px", borderRadius: 6 }}>+ Add</span>
                </div>
                {/* Database matches */}
                {qaResults.map((ex, i) => (
                  <div key={i} onClick={() => addFromQA(ex.n, si, false)} style={{ padding: "11px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < qaResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T1 }}>{ex.n}</div>
                      {ex.f !== ex.n ? <div style={{ fontFamily: F, fontSize: 11, color: T5, marginTop: 2 }}>{ex.f}</div> : null}
                    </div>
                    <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: sec.color, background: sec.color + "15", padding: "4px 10px", borderRadius: 6 }}>+ Add</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Secondary actions */}
          <div style={{ display: "flex", gap: 16, marginTop: 8, paddingLeft: 4 }}>
            <span onClick={() => { setPk2(true); setPkI(si); setPS(""); setPTg(null); }} style={{ fontFamily: F, color: T5, fontSize: 12, cursor: "pointer", textDecoration: "underline", textDecorationColor: T5 + "40", textUnderlineOffset: "3px" }}>Browse all exercises</span>
            <span onClick={() => { setTrSec(si); setTrText(""); setTimeout(() => trRef.current?.focus(), 100); }} style={{ fontFamily: F, color: T5, fontSize: 12, cursor: "pointer", textDecoration: "underline", textDecorationColor: T5 + "40", textUnderlineOffset: "3px" }}>+ Transition</span>
          </div>
          {trSec === si && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input ref={trRef} value={trText} onChange={e => setTrText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTransition(si); }} placeholder="e.g., Mosey to the bleachers" style={{ ...ist, flex: 1, fontStyle: "italic" }} />
              <button onClick={() => addTransition(si)} style={{ fontFamily: F, background: sec.color + "15", color: sec.color, border: "1px solid " + sec.color + "30", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
            </div>
          )}
          <textarea value={sec.note || ""} onChange={e => setSecs(secs.map((s, i) => i !== si ? s : { ...s, note: e.target.value }))} placeholder={"Q notes for " + sec.label + "..."} rows={2} style={{ ...ist, marginTop: 8, resize: "vertical", fontStyle: "italic", background: "rgba(255,255,255,0.03)" }} />
        </div>
      ))}

      {/* Add section */}
      <div style={{ marginTop: 28, display: "flex", gap: 8 }}>
        <input value={aS} maxLength={60} onChange={e => setAS(e.target.value)} placeholder="New section name..." style={{ ...ist, flex: 1 }} />
        <button onClick={() => { if (!aS.trim()) return; setSecs([...secs, { label: aS.trim(), color: sC[secs.length % sC.length], exercises: [], note: "" }]); setAS(""); }} style={{ fontFamily: F, background: "rgba(255,255,255,0.04)", color: T3, border: "1px solid " + BD, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>+ Section</button>
      </div>

      {/* Save */}
      <div style={{ marginTop: 32 }}>
        {editData?.isPublic ? <div style={{ fontFamily: F, fontSize: 12, color: A, textAlign: "center", marginBottom: 10 }}>This beatdown is shared. Edits will be visible to everyone.</div> : null}
        <button onClick={() => {
          const nm = bT.trim() || "Untitled";
          const tgs = [bDur, (DIFFS.find(x => x.id === bDiff) || { l: "" }).l, ...bSites.map(s => (SITES.find(x => x.id === s) || { l: "" }).l), ...bEq.filter(e => e !== "none").map(e => (EQUIP.find(x => x.id === e) || { l: "" }).l)].filter((v): v is string => Boolean(v));
          if (editData && onUpdate) {
            onUpdate(editData.id, { nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, dur: bDur, sites: bSites, eq: bEq });
          } else {
            onSave({ nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, src: "Manual", dur: bDur, sites: bSites, eq: bEq, share: shareLib });
          }
        }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>{editData ? "Save changes" : "Save to locker"}</button>
      </div>
    </div>
  );
}
