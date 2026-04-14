"use client";

import { useState, useEffect } from "react";
import { loadSeedExercises } from "@/lib/db";
import { mapSupabaseExercise } from "@/lib/exercises";
import type { ExerciseData } from "@/lib/exercises";

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
  width: "100%", background: CD, border: "1px solid " + BD, borderRadius: 12,
  color: T1, padding: "14px 16px", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: F,
};

const REGIONS = ["All","Northeast","Southeast","Midwest","Southwest","West","Mid-Atlantic","Pacific NW"];
const SITES = [{id:"field",l:"Open field"},{id:"track",l:"Track"},{id:"benches",l:"Benches"},{id:"hills",l:"Hills"},{id:"stairs",l:"Stairs"},{id:"parking",l:"Parking lot"},{id:"pullup",l:"Pull-up bars"},{id:"walls",l:"Walls"}];
const TAGS = ["Warm-Up","Mary","Core","Cardio","Full Body","Legs","Chest","Arms","Shoulders","Static","Transport","Coupon"];

interface Comment { au: string; ao: string; txt: string; dt: string }
interface Exercise { n: string; r: string; c: string; nt: string }
interface Section { label: string; color: string; exercises: Exercise[]; note: string }
interface FeedItem {
  id: number | string; src: string; nm: string; au: string; ao: string; reg: string;
  d: string; dur: string | null; aoT: string[]; v: number; u: number; cm: number;
  ds: string; dt: string; tp: string; tg?: string[]; et?: string[];
  comments: Comment[]; secs?: Section[];
}

// Sample data removed — Library now uses only Supabase data

function dc(d: string) {
  if (d === "easy" || d === "Beginner") return G;
  if (d === "medium" || d === "Intermediate") return A;
  if (d === "hard" || d === "Advanced") return R;
  if (d === "beast" || d === "Beast") return "#dc2626";
  return T4;
}

function srcBadge(s: string) {
  if (s === "Hand Built") return { bg: "#E8A820" + "18", c: "#E8A820", l: "Hand Built" };
  return { bg: "#22c55e" + "15", c: "#22c55e", l: "GloomBuilder" };
}

interface LibraryScreenProps {
  sharedItems?: FeedItem[];
  profName?: string;
}

export default function LibraryScreen({ sharedItems = [], profName = "" }: LibraryScreenProps) {
  const [libDet, setLibDet] = useState<FeedItem | null>(null);
  const [libSearch, setLibSearch] = useState("");
  const [libT, setLibT] = useState("beatdowns");
  const [libF, setLibF] = useState(false);
  const [fSort, setFSort] = useState("new");
  const [fD, setFD] = useState("All");
  const [fDu, setFDu] = useState("All");
  const [fR, setFR] = useState("All");
  const [fAo, setFAo] = useState("All");
  const [fSrc, setFSrc] = useState("All");
  const [fET, setFET] = useState("All");
  const [fExR, setFExR] = useState("All");
  const [showAllCmt, setShowAllCmt] = useState(false);
  const [cmtText, setCmtText] = useState("");
  const [votes, setVotes] = useState<Record<string | number, boolean>>({});
  const [toast, setToast] = useState("");
  const [exMode, setExMode] = useState<"shared" | "database">("shared");
  const [seedEx, setSeedEx] = useState<ExerciseData[]>([]);
  const [dbSearch, setDbSearch] = useState("");
  const [dbTag, setDbTag] = useState("All");
  const [dbDetail, setDbDetail] = useState<ExerciseData | null>(null);

  useEffect(() => {
    if (exMode === "database" && seedEx.length === 0) {
      loadSeedExercises().then(rows => {
        if (rows.length > 0) {
          const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
          setSeedEx(mapped);
        }
      });
    }
  }, [exMode, seedEx.length]);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const toggleVote = (id: number | string) => { setVotes({ ...votes, [id]: !votes[id] }); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 100 }}>{toast}</div>
  ) : null;

  const filterBtn = (label: string, sel: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: "1px solid " + (sel ? G + "30" : BD), padding: "7px 14px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{label}</button>
  );

  // ════ DETAIL VIEW ════
  if (libDet) {
    const bd = libDet;
    const voted = votes[bd.id];
    const comments = (bd.comments || []).slice().reverse();
    const shownComments = showAllCmt ? comments : comments.slice(0, 3);

    return (
      <div style={{ padding: "0 24px" }}>
        <button onClick={() => { setLibDet(null); setShowAllCmt(false); }} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>← Library</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>{bd.nm}</div>
            {bd.src && bd.tp !== "exercise" ? (() => { const sb = srcBadge(bd.src); return <div style={{ marginTop: 8 }}><span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 700, background: sb.bg, color: sb.c }}>{sb.l}</span></div>; })() : null}
            <div style={{ fontSize: 15, color: T4, marginTop: 6 }}>{bd.au} · {bd.ao}</div>
            <div style={{ fontSize: 13, color: T5, marginTop: 3 }}>{bd.dt}</div>
          </div>
          <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
        </div>
        <div style={{ fontSize: 16, color: T3, marginTop: 16, lineHeight: 1.7 }}>{bd.ds}</div>
        {(bd.tg || bd.et) ? <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>{(bd.tg || bd.et || []).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.05)", color: T4, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{t}</span>)}</div> : null}
        <div style={{ display: "flex", gap: 14, marginTop: 20, alignItems: "center" }}>
          <button onClick={() => toggleVote(bd.id)} style={{ fontFamily: F, background: voted ? G + "15" : "rgba(255,255,255,0.04)", color: voted ? G : T4, border: "1px solid " + (voted ? G + "30" : BD), padding: "8px 16px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>▲ {bd.v + (voted ? 1 : 0)}</button>
          <span style={{ fontSize: 13, color: T5 }}>Stolen {bd.u}x</span>
        </div>
        {bd.tp === "beatdown" && bd.secs && bd.secs.length > 0 ? <div style={{ marginTop: 24 }}>{bd.secs.map((sec, si) => (
          <div key={si} style={{ marginTop: 16 }}>
            <div style={{ color: sec.color, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>{sec.label}</div>
            {sec.exercises.map((ex, ei) => (
              <div key={ei} style={{ padding: "10px 14px", background: CD, borderLeft: "3px solid " + sec.color + "40", borderRadius: "0 10px 10px 0", marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T2, fontSize: 15, fontWeight: 600 }}>{ex.n}</span>
                  <span style={{ color: sec.color, fontSize: 13, fontWeight: 600 }}>x{ex.r} {ex.c}</span>
                </div>
                {ex.nt ? <div style={{ color: T4, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{ex.nt}</div> : null}
              </div>
            ))}
            {sec.note ? <div style={{ color: T4, fontSize: 13, marginTop: 6, fontStyle: "italic", padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>{sec.note}</div> : null}
          </div>
        ))}</div> : null}
        {/* Comments */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Comments ({comments.length})</div>
            {comments.length > 3 ? <button onClick={() => setShowAllCmt(!showAllCmt)} style={{ fontFamily: F, background: "none", border: "none", color: G, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{showAllCmt ? "Show less" : "View all"}</button> : null}
          </div>
          {shownComments.map((c, i) => (
            <div key={i} style={{ background: CD, border: "1px solid " + BD, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><span style={{ fontSize: 14, fontWeight: 700, color: T2 }}>{c.au}</span>{c.ao ? <span style={{ fontSize: 13, color: T4, marginLeft: 6 }}>· {c.ao}</span> : null}</div>
                <span style={{ fontSize: 12, color: T5 }}>{c.dt}</span>
              </div>
              <div style={{ fontSize: 15, color: T3, marginTop: 6, lineHeight: 1.55 }}>{c.txt}</div>
            </div>
          ))}
          {comments.length === 0 ? <div style={{ textAlign: "center", color: T6, padding: 16, fontSize: 13 }}>No comments yet. Be the first.</div> : null}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={cmtText} onChange={e => setCmtText(e.target.value)} placeholder="Add a comment..." style={{ ...ist, flex: 1 }} />
            <button onClick={() => { if (!cmtText.trim()) return; fl("Comment posted!"); setCmtText(""); }} style={{ fontFamily: F, background: G, color: BG, border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Post</button>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => fl("Saved!")} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save to locker</button>
        </div>
        {toastEl}
      </div>
    );
  }

  // ════ FILTERS ════
  if (libF) {
    return (
      <div style={{ padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>Filters</div>
          <span onClick={() => setLibF(false)} style={{ color: T4, cursor: "pointer", fontSize: 22 }}>✕</span>
        </div>
        {libT === "beatdowns" ? (
          <div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Difficulty</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","Easy","Medium","Hard","Beast"].map(o => filterBtn(o, fD === o, () => setFD(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Duration</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","30 min","45 min","60 min"].map(o => filterBtn(o, fDu === o, () => setFDu(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Region</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{REGIONS.map(o => filterBtn(o, fR === o, () => setFR(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>AO site type</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All", ...SITES.map(s => s.l)].map(o => filterBtn(o, fAo === o, () => setFAo(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Source</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","Hand Built","GloomBuilder"].map(o => filterBtn(o, fSrc === o, () => setFSrc(o)))}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Tag</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All", ...TAGS].map(o => filterBtn(o, fET === o, () => setFET(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Difficulty</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","Easy","Medium","Hard","Beast"].map(o => filterBtn(o, fD === o, () => setFD(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Region</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{REGIONS.map(o => filterBtn(o, fExR === o, () => setFExR(o)))}</div>
          </div>
        )}
        <button onClick={() => setLibF(false)} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Apply filters</button>
      </div>
    );
  }

  // ════ FEED LIST ════
  let feed = [...sharedItems];
  if (libSearch.trim()) {
    const q = libSearch.toLowerCase();
    feed = feed.filter(b => (b.nm || "").toLowerCase().includes(q) || (b.au || "").toLowerCase().includes(q) || (b.ao || "").toLowerCase().includes(q) || (b.ds || "").toLowerCase().includes(q));
  }
  if (libT === "beatdowns") {
    feed = feed.filter(b => b.tp === "beatdown");
    if (fD !== "All") feed = feed.filter(b => b.d === fD.toLowerCase());
    if (fDu !== "All") feed = feed.filter(b => b.dur === fDu);
    if (fR !== "All") feed = feed.filter(b => b.reg === fR);
    if (fAo !== "All") { const sId = SITES.find(s => s.l === fAo); feed = feed.filter(b => sId && b.aoT && b.aoT.includes(sId.id)); }
    if (fSrc !== "All") feed = feed.filter(b => b.src === fSrc);
  } else {
    feed = feed.filter(b => b.tp === "exercise");
    if (fET !== "All") feed = feed.filter(b => b.et && b.et.includes(fET));
    if (fD !== "All") feed = feed.filter(b => b.d === fD.toLowerCase());
    if (fExR !== "All") feed = feed.filter(b => b.reg === fExR);
  }
  if (fSort === "new") feed.sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime());
  if (fSort === "top") feed.sort((a, b) => b.v - a.v);
  if (fSort === "stolen") feed.sort((a, b) => b.u - a.u);

  const af = libT === "beatdowns"
    ? [fD, fDu, fR, fAo, fSrc].filter(v => v !== "All").length
    : [fET, fD, fExR].filter(v => v !== "All").length;

  return (
    <div style={{ padding: "0 24px" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 12 }}>Library</div>
      {!(libT === "exercises" && exMode === "database") ? <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search by title, Q name, AO..." style={{ ...ist, marginBottom: 14 }} /> : null}
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid " + BD, padding: 3, marginBottom: 16 }}>
        {["beatdowns", "exercises"].map(sv => (
          <div key={sv} onClick={() => setLibT(sv)} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: libT === sv ? 700 : 500, color: libT === sv ? G : T4, background: libT === sv ? "rgba(34,197,94,0.08)" : "transparent", borderRadius: 10, cursor: "pointer", textTransform: "capitalize" }}>{sv}</div>
        ))}
      </div>
      {/* Exercises sub-toggle */}
      {libT === "exercises" ? (
        <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid " + BD, padding: 2, marginBottom: 14 }}>
          {(["shared", "database"] as const).map(mode => (
            <div key={mode} onClick={() => setExMode(mode)} style={{ flex: 1, textAlign: "center", padding: "8px 0", fontSize: 12, fontWeight: exMode === mode ? 700 : 500, color: exMode === mode ? P : T4, background: exMode === mode ? P + "12" : "transparent", borderRadius: 8, cursor: "pointer" }}>{mode === "shared" ? "Shared" : "Exercise Database"}</div>
          ))}
        </div>
      ) : null}

      {/* Exercise Database view */}
      {libT === "exercises" && exMode === "database" ? (
        <div>
          <input value={dbSearch} onChange={e => setDbSearch(e.target.value)} placeholder="Search 904 exercises..." style={{ ...ist, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {["All", ...TAGS].map(t => (
              <button key={t} onClick={() => setDbTag(t)} style={{ fontFamily: F, background: dbTag === t ? P + "20" : "rgba(255,255,255,0.04)", color: dbTag === t ? P : T5, border: "1px solid " + (dbTag === t ? P + "30" : BD), padding: "5px 11px", borderRadius: 20, fontSize: 10, cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>{t}</button>
            ))}
          </div>
          {seedEx.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40 }}>Loading exercises...</div> : null}
          {seedEx.filter(e => {
            const mS = !dbSearch.trim() || e.n.toLowerCase().includes(dbSearch.toLowerCase()) || e.f.toLowerCase().includes(dbSearch.toLowerCase()) || e.h.toLowerCase().includes(dbSearch.toLowerCase());
            const mT = dbTag === "All" || e.t.includes(dbTag);
            return mS && mT;
          }).slice(0, 50).map(e => (
            <div key={e.n} onClick={() => setDbDetail(e)} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + P + "40", borderRadius: 14, padding: "14px 18px", marginBottom: 6, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T2 }}>{e.n}</div>
                  <div style={{ fontSize: 12, color: T4, marginTop: 3 }}>{e.f !== e.n ? e.f : ""}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: T3, marginTop: 6, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{e.h}</div>
              {e.t.length > 0 ? <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>{e.t.map(t => <span key={t} style={{ background: P + "10", color: P, fontSize: 10, padding: "2px 8px", borderRadius: 5, fontFamily: F, textTransform: "uppercase" }}>{t}</span>)}</div> : null}
            </div>
          ))}
          {seedEx.length > 0 && seedEx.filter(e => {
            const mS = !dbSearch.trim() || e.n.toLowerCase().includes(dbSearch.toLowerCase()) || e.f.toLowerCase().includes(dbSearch.toLowerCase()) || e.h.toLowerCase().includes(dbSearch.toLowerCase());
            const mT = dbTag === "All" || e.t.includes(dbTag);
            return mS && mT;
          }).length > 50 ? <div style={{ textAlign: "center", color: T5, padding: 16, fontSize: 12 }}>Showing first 50 results. Search to narrow down.</div> : null}

          {/* Exercise Database Detail */}
          {dbDetail ? (
            <div onClick={() => setDbDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div onClick={e => e.stopPropagation()} style={{ background: "#111318", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430, maxHeight: "65vh", overflowY: "auto", border: "1px solid " + BD, borderBottom: "none" }}>
                <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, margin: "0 auto 24px" }} />
                <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: T1 }}>{dbDetail.n}</div>
                {dbDetail.f !== dbDetail.n ? <div style={{ fontFamily: F, color: T4, fontSize: 13, marginTop: 6 }}>{dbDetail.f}</div> : null}
                <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>{dbDetail.t.map(t => <span key={t} style={{ background: P + "12", color: P, fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: F, textTransform: "uppercase" }}>{t}</span>)}</div>
                {dbDetail.s.length > 0 ? <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{dbDetail.s.map(s => <span key={s} style={{ background: A + "12", color: A, fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: F }}>{s}</span>)}</div> : null}
                <div style={{ fontFamily: F, marginTop: 24, color: T5, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>How to execute</div>
                <div style={{ fontFamily: F, color: T3, fontSize: 15, lineHeight: 1.8, marginTop: 12 }}>{dbDetail.h}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
      <>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ k: "new", l: "New" }, { k: "top", l: "Top voted" }, { k: "stolen", l: "Most stolen" }].map(sv => (
          <button key={sv.k} onClick={() => setFSort(sv.k)} style={{ fontFamily: F, background: fSort === sv.k ? G + "15" : "rgba(255,255,255,0.04)", color: fSort === sv.k ? G : T4, padding: "7px 14px", borderRadius: 10, fontSize: 13, border: "none", cursor: "pointer", fontWeight: fSort === sv.k ? 700 : 500 }}>{sv.l}</button>
        ))}
        <button onClick={() => setLibF(true)} style={{ fontFamily: F, marginLeft: "auto", background: af > 0 ? G + "15" : "rgba(255,255,255,0.04)", color: af > 0 ? G : T4, padding: "7px 14px", borderRadius: 10, fontSize: 12, border: "1px solid " + (af > 0 ? G + "30" : BD), cursor: "pointer", fontWeight: 600 }}>Filters{af > 0 ? " (" + af + ")" : ""}</button>
      </div>
      {feed.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40, border: "1px dashed " + BD, borderRadius: 14, marginBottom: 8 }}>No {libT} shared yet. Be the first!</div> : null}
      {feed.map(bd => (
        <div key={bd.id} onClick={() => setLibDet(bd)} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + (bd.tp === "exercise" ? P + "50" : A + "50"), borderRadius: 14, padding: "16px 18px", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T2 }}>{bd.nm}</div>
                {bd.src && bd.tp !== "exercise" ? (() => { const sb = srcBadge(bd.src); return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, fontWeight: 700, background: sb.bg, color: sb.c }}>{sb.l}</span>; })() : null}
              </div>
              <div style={{ fontSize: 14, color: T4, marginTop: 5 }}>{bd.au} · {bd.ao}{bd.au === profName ? <span style={{ color: G, fontSize: 11, marginLeft: 6 }}>· You</span> : null}</div>
              <div style={{ fontSize: 12, color: T5, marginTop: 3 }}>{bd.dt}</div>
            </div>
            <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
          </div>
          <div style={{ fontSize: 15, color: T3, marginTop: 10, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bd.ds}</div>
          {(bd.tg || bd.et || bd.dur) ? <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>{bd.dur ? <span style={{ background: G + "12", color: G, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F, fontWeight: 600 }}>{bd.dur}</span> : null}{(bd.tg || bd.et || []).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.05)", color: T4, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{t}</span>)}</div> : null}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", gap: 14, fontSize: 14, color: T4 }}>
              <span style={{ color: G, fontWeight: 600 }}>▲ {bd.v}</span>
              <span>Stolen {bd.u}x</span>
              {(bd.comments || []).length > 0 ? <span>{(bd.comments || []).length} comments</span> : null}
            </div>
            <span onClick={e => { e.stopPropagation(); fl("Saved!"); }} style={{ fontSize: 14, color: G, cursor: "pointer", padding: "4px 8px", fontWeight: 600 }}>Save</span>
          </div>
        </div>
      ))}
      {feed.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40 }}>No results match your filters</div> : null}
      </>
      )}
      {toastEl}
    </div>
  );
}
