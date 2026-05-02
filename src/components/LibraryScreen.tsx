"use client";

import { useState, useEffect } from "react";
import { loadSeedExercises, addComment, loadComments, deleteComment, updateComment } from "@/lib/db";
import { mapSupabaseExercise } from "@/lib/exercises";
import type { ExerciseData } from "@/lib/exercises";
import ThumbsUpIcon from "@/components/ThumbsUpIcon";
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
  width: "100%", background: CD, border: "1px solid " + BD, borderRadius: 12,
  color: T1, padding: "14px 16px", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: F,
};

const REGIONS = ["All","Northeast","Southeast","Midwest","Southwest","West","Mid-Atlantic","Pacific NW"];
const SITES = [{id:"field",l:"Open field"},{id:"track",l:"Track"},{id:"benches",l:"Benches"},{id:"hills",l:"Hills"},{id:"stairs",l:"Stairs"},{id:"parking",l:"Parking lot"},{id:"pullup",l:"Pull-up bars"},{id:"walls",l:"Walls"}];
const TAGS = ["Warm-Up","Mary","Core","Cardio","Full Body","Legs","Chest","Arms","Shoulders","Static","Transport","Coupon"];

const TYPE_TAGS = [
  { value: "Warm-Up", label: "Warm-up" },
  { value: "Mary", label: "Mary" },
  { value: "Cardio", label: "Cardio" },
  { value: "Static", label: "Static" },
  { value: "Transport", label: "Transport" },
  { value: "Coupon", label: "Coupon" },
];

const BODY_TAGS = [
  { value: "Full Body", label: "Full body" },
  { value: "Core", label: "Core" },
  { value: "Legs", label: "Legs" },
  { value: "Chest", label: "Chest" },
  { value: "Arms", label: "Arms" },
  { value: "Shoulders", label: "Shoulders" },
];

interface Comment { au: string; ao: string; txt: string; dt: string }
interface Exercise { n: string; r: string; c: string; nt: string }
interface Section { label: string; color: string; exercises: Exercise[]; note: string }
interface FeedItem {
  id: number | string; src: string; nm: string; au: string; auId?: string; ao: string; reg: string;
  d: string; dur: string | null; aoT: string[]; v: number; u: number; cm: number;
  ds: string; dt: string; createdAt?: string; tp: string; tg?: string[]; et?: string[];
  howTo?: string; inspiredBy?: string; comments: Comment[]; secs?: Section[];
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
  userVotes?: Set<string>;
  onToggleVote?: (id: string, itemType?: "beatdown" | "exercise") => void;
  onSteal?: (id: string, itemType: "beatdown" | "exercise") => void;
  onRunBeatdown?: (item: FeedItem) => void;
  onRefresh?: () => void;
  // V2-4: tap author name → open their Q Profile
  onOpenProfile?: (userId: string | null) => void;
  currentUserId?: string;
  onSendPreblast?: (bd: AttachedBeatdown) => void;
  // Item 3: hardware back coordination
  onLibDetChange?: (open: boolean) => void;
  registerBackHandler?: (handler: () => void) => void;
}

// ═══ EXERCISE DETAIL SHEET (with scroll lock) ═══
function ExerciseDetailSheet({ exData, onClose }: { exData: ExerciseData; onClose: () => void }) {
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
    <div onClick={onClose} onTouchMove={e => e.stopPropagation()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 250, display: "flex", alignItems: "flex-end", justifyContent: "center", touchAction: "none" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1c1c20", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, maxHeight: "75vh", overflowY: "auto", overscrollBehavior: "contain", border: "1px solid rgba(167,139,250,0.15)", borderBottom: "none", WebkitOverflowScrolling: "touch" as any }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "10px auto 0" }} />
        <div style={{ padding: "16px 22px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ color: T1, fontSize: 20, fontWeight: 800, fontFamily: F, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exData.n}</div>
            <button onClick={onClose} style={{ color: T3, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", fontSize: 22, cursor: "pointer", fontFamily: F, flexShrink: 0, padding: 0, width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 12 }}>✕</button>
          </div>
          {exData.f !== exData.n ? <div style={{ fontFamily: F, color: T4, fontSize: 13, marginTop: -8, marginBottom: 10 }}>{exData.f}</div> : null}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{exData.t.map(t => <span key={t} style={{ background: P + "12", color: P, fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: F, textTransform: "uppercase" }}>{t}</span>)}</div>
          {exData.s.length > 0 ? <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{exData.s.map(s => <span key={s} style={{ background: A + "12", color: A, fontSize: 10, padding: "3px 9px", borderRadius: 5, fontFamily: F }}>{s}</span>)}</div> : null}
          {exData.d ? <><div style={{ fontFamily: F, marginTop: 20, color: T5, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>Description</div><div style={{ fontFamily: F, color: T3, fontSize: 17, lineHeight: 1.65, marginTop: 8 }}>{exData.d}</div></> : null}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 20, paddingTop: 16 }}>
            <div style={{ fontFamily: F, color: T4, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>How to do it</div>
            <div>{exData.h.split(/\s(?=(?:[1-9]|1\d|20)\.\s[A-Z])/).filter(Boolean).map((step: string, i: number) => <div key={i} style={{ color: T3, fontSize: 18, lineHeight: 1.7, marginBottom: 5, fontFamily: F }}>{step.trim()}</div>)}</div>
          </div>
          {exData.t && exData.t.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
              {exData.t.filter((t: string) => t !== "IC" && t !== "OYO" && t !== "either").map((tag: string) => {
                const tagColor = tag === "Warm-Up" ? G : tag === "Mary" || tag === "Core" ? P : tag === "Cardio" || tag === "Full Body" ? "#ef4444" : tag === "Coupon" ? A : T3;
                return <span key={tag} style={{ background: tagColor + "15", color: tagColor, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, fontFamily: F }}>{tag}</span>;
              })}
              {exData.df && (
                <span style={{ background: (exData.df === 1 ? G : exData.df === 2 ? A : "#ef4444") + "15", color: exData.df === 1 ? G : exData.df === 2 ? A : "#ef4444", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, fontFamily: F }}>
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

export default function LibraryScreen({ sharedItems = [], profName = "", userVotes = new Set(), onToggleVote, onSteal, onRunBeatdown, onRefresh, onOpenProfile, currentUserId, onSendPreblast, onLibDetChange, registerBackHandler }: LibraryScreenProps) {
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
  const [toast, setToast] = useState("");
  const [dbComments, setDbComments] = useState<{ id: string; au: string; ao: string; txt: string; dt: string }[]>([]);
  const [cmtLoading, setCmtLoading] = useState(false);
  const [editCmtId, setEditCmtId] = useState<string | null>(null);
  const [editCmtText, setEditCmtText] = useState("");
  const [seedEx, setSeedEx] = useState<ExerciseData[]>([]);
  const [exSearch, setExSearch] = useState("");
  const [exType, setExType] = useState("All");
  const [exBody, setExBody] = useState("All");
  const [dbDetail, setDbDetail] = useState<ExerciseData | null>(null);

  useEffect(() => {
    if (seedEx.length === 0) {
      loadSeedExercises().then(rows => {
        if (rows.length > 0) {
          const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
          setSeedEx(mapped);
        }
      });
    }
  }, [seedEx.length]);

  // Sync detail view when sharedItems updates (e.g., after voting)
  useEffect(() => {
    if (libDet) {
      const updated = sharedItems.find(item => item.id === libDet.id);
      if (updated) setLibDet(updated);
    }
  }, [sharedItems]);

  // Load comments when detail view opens
  useEffect(() => {
    if (libDet) {
      setCmtLoading(true);
      loadComments(String(libDet.id)).then(rows => {
        const mapped = rows.map((r: Record<string, unknown>) => {
          const p = r.profiles as Record<string, unknown> | null;
          return {
            id: (r.id as string) || "",
            au: (p?.f3_name as string) || "Unknown",
            ao: ((p?.ao as string) || "") + ((p?.state as string) ? ", " + (p?.state as string) : ""),
            txt: (r.text as string) || "",
            dt: new Date(r.created_at as string).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
          };
        });
        setDbComments(mapped);
        setCmtLoading(false);
      });
    } else {
      setDbComments([]);
    }
  }, [libDet?.id]);

  // Item 3: notify parent when libDet open state changes
  useEffect(() => {
    onLibDetChange?.(libDet !== null);
  }, [libDet, onLibDetChange]);

  // Item 3: register back handler so parent's popstate can close libDet
  useEffect(() => {
    if (registerBackHandler) {
      registerBackHandler(() => {
        setLibDet(null);
        setShowAllCmt(false);
      });
    }
  }, [registerBackHandler]);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 100 }}>{toast}</div>
  ) : null;

  // Exercise detail modal — rendered as component for scroll lock
  const exDetailModal = dbDetail ? (
    <ExerciseDetailSheet exData={dbDetail} onClose={() => setDbDetail(null)} />
  ) : null;


  const filterBtn = (label: string, sel: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: "1px solid " + (sel ? G + "30" : BD), padding: "7px 14px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{label}</button>
  );

  // V2-4: handler for tapping an author name → open their Q Profile
  // Stops propagation so it doesn't trigger card-click. If author is current user, opens own profile.
  const handleAuthorTap = (e: React.MouseEvent, authorId: string | undefined) => {
    e.stopPropagation();
    if (!authorId || !onOpenProfile) return;
    if (authorId === currentUserId) {
      onOpenProfile(null);  // own profile
    } else {
      onOpenProfile(authorId);
    }
  };

  // ═══ DETAIL VIEW ═══
  if (libDet) {
    const bd = libDet;
    const voted = userVotes.has(String(bd.id));
    const comments = dbComments;
    const shownComments = showAllCmt ? comments : comments.slice(0, 3);

    return (
      <div style={{ padding: "0 24px" }}>
        {exDetailModal}

        <button onClick={() => { setLibDet(null); setShowAllCmt(false); }} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>← Library</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>{bd.nm}</div>
            {bd.src && bd.tp !== "exercise" ? (() => { const sb = srcBadge(bd.src); return <div style={{ marginTop: 8 }}><span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 700, background: sb.bg, color: sb.c }}>{sb.l}</span></div>; })() : null}
            {bd.tp === "exercise" && bd.au ? (
              <div style={{ fontSize: 13, color: G, fontWeight: 600, marginTop: 6, fontFamily: F }}>added by {bd.au}</div>
            ) : null}
            {bd.tp !== "exercise" ? (
              <div style={{ fontSize: 15, color: T4, marginTop: 6, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                {bd.auId && onOpenProfile ? (
                  <span onClick={e => handleAuthorTap(e, bd.auId)} style={{ color: G, fontWeight: 600, cursor: "pointer", padding: "4px 0", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: G + "60" }}>{bd.au}</span>
                ) : (
                  <span>{bd.au}</span>
                )}
                <span>· {bd.ao}</span>
              </div>
            ) : null}
            {bd.inspiredBy ? <div style={{ fontSize: 12, color: A, marginTop: 4 }}>Inspired by {bd.inspiredBy}</div> : null}
            {bd.dt ? <div style={{ fontSize: 13, color: T5, marginTop: 3 }}>{bd.dt}</div> : null}
          </div>
          <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
        </div>
        <div style={{ fontSize: 16, color: T3, marginTop: 16, lineHeight: 1.7 }}>{bd.ds}</div>
        {bd.tp === "exercise" && bd.howTo && bd.howTo !== bd.ds ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: F, color: T5, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>How to execute</div>
            <div>
              {bd.howTo.split(/\s(?=(?:[1-9]|1\d|20)\.\s[A-Z])/).filter(Boolean).map((step: string, i: number) => (
                <div key={i} style={{ color: T3, fontSize: 15, lineHeight: 1.7, marginBottom: 5, fontFamily: F }}>{step.trim()}</div>
              ))}
            </div>
          </div>
        ) : null}
        {(bd.tg || bd.et) ? <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>{(bd.tg || bd.et || []).filter(t => t !== bd.dur && !["Easy","Medium","Hard","Beast"].includes(t)).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.05)", color: T4, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{t}</span>)}</div> : null}
        <div style={{ display: "flex", gap: 14, marginTop: 20, alignItems: "center" }}>
          <button onClick={() => onToggleVote?.(String(bd.id), bd.tp === "exercise" ? "exercise" : "beatdown")} style={{ fontFamily: F, background: voted ? G + "15" : "rgba(255,255,255,0.04)", color: voted ? G : T4, border: "1px solid " + (voted ? G + "30" : BD), padding: "8px 16px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}><ThumbsUpIcon size={14} filled={voted} /> {bd.v}</button>
          <span style={{ fontSize: 13, color: T5 }}>Stolen {bd.u}x</span>
        </div>
        {bd.tp === "beatdown" && bd.secs && bd.secs.length > 0 ? <div style={{ marginTop: 24 }}>{bd.secs.map((sec, si) => {
          const sColor = sec.color || G;
          const secName = (sec as any).name || sec.label || "Section";
          const secNotes = (sec as any).qNotes || sec.note || "";
          const exCount = sec.exercises.filter(e => (e as any).type !== "transition").length;
          return (
          <div key={si} style={{ marginBottom: 10 }}>
            <div style={{ background: "#111114", borderRadius: 22, boxShadow: `0 0 0 1px ${sColor}40, 0 4px 24px ${sColor}0D` }}>
              <div style={{ borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
                <div style={{ height: 3, background: sColor }} />
                <div style={{ padding: "14px 18px 10px" }}>
                  <div style={{ color: T1, fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: F }}>{secName}</div>
                  <div style={{ color: T5, fontSize: 12, marginTop: 3, fontFamily: F }}>{exCount} {exCount === 1 ? "exercise" : "exercises"}</div>
                </div>
              </div>
              <div style={{ padding: "0 12px 14px" }}>
                {secNotes ? (
                  <div style={{ padding: "0 4px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: T4, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✎</span>
                    <div style={{ color: T2, fontSize: 14, fontStyle: "italic", lineHeight: 1.5, fontFamily: F, wordBreak: "break-word" as const }}>{secNotes}</div>
                  </div>
                ) : null}
                {sec.exercises.map((ex, ei) => {
                  const exName = (ex as any).name || ex.n || "";
                  const exNote = (ex as any).note || ex.nt || "";
                  const isTransition = (ex as any).type === "transition";
                  const exReps = (() => {
                    const a = ex as any;
                    if (a.mode === "time") return `${a.value} ${a.unit}`;
                    if (a.mode === "distance") return `${a.value} ${a.unit}`;
                    if (a.mode === "reps" && a.value !== undefined && a.value !== "") return `${a.value} reps`;
                    return ex.r ? `${ex.r} reps` : "";
                  })();
                  const exCad = (() => {
                    const a = ex as any;
                    const cad = a.cadence || ex.c || "";
                    if (a.mode === "time" || a.mode === "distance") return "";
                    return cad;
                  })();
                  const foundEx = seedEx.find(se => se.n.toLowerCase() === exName.toLowerCase());

                  if (isTransition) {
                    return (
                      <div key={ei} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 6, background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                        <span style={{ color: T4, fontSize: 15 }}>↗</span>
                        <span style={{ color: T3, fontSize: 16, fontStyle: "italic", fontWeight: 500, fontFamily: F }}>{exName}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={ei} onClick={() => { if (foundEx) setDbDetail(foundEx); }} style={{ background: "#1a1a1f", borderRadius: 14, padding: "13px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10, cursor: foundEx ? "pointer" : "default" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                          <span style={{ color: T1, fontSize: 18, fontWeight: 700, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, minWidth: 0 }}>{exName}</span>
                        </div>
                        <div style={{ color: T4, fontSize: 14, fontWeight: 600, marginTop: 3, fontFamily: F }}>
                          {exReps}{exCad ? ` · ${exCad}` : ""}
                        </div>
                        {exNote ? <div style={{ color: T5, fontSize: 13, fontStyle: "italic", marginTop: 2, fontFamily: F }}>{exNote}</div> : null}
                      </div>
                      {foundEx && (
                        <button onClick={e => { e.stopPropagation(); setDbDetail(foundEx); }} style={{ width: 28, height: 28, borderRadius: 8, background: P + "15", border: "1px solid " + P + "30", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: P, fontSize: 14, fontWeight: 700, fontFamily: F }}>?</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })}</div> : null}
        {/* Comments */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Comments ({comments.length})</div>
            {comments.length > 3 ? <button onClick={() => setShowAllCmt(!showAllCmt)} style={{ fontFamily: F, background: "none", border: "none", color: G, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{showAllCmt ? "Show less" : "View all"}</button> : null}
          </div>
          {shownComments.map((c, i) => (
            <div key={c.id || i} style={{ background: CD, border: "1px solid " + BD, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              {editCmtId === c.id ? (
                <div>
                  <textarea value={editCmtText} onChange={e => setEditCmtText(e.target.value)} rows={2} style={{ ...ist, resize: "vertical" as const, marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => {
                      const success = await updateComment(c.id, editCmtText);
                      if (success) {
                        setDbComments(dbComments.map(cm => cm.id === c.id ? { ...cm, txt: editCmtText } : cm));
                        setEditCmtId(null);
                        fl("Comment updated!");
                      }
                    }} style={{ fontFamily: F, background: G, color: BG, border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
                    <button onClick={() => setEditCmtId(null)} style={{ fontFamily: F, background: "rgba(255,255,255,0.04)", color: T4, border: "1px solid " + BD, padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><span style={{ fontSize: 14, fontWeight: 700, color: T2 }}>{c.au}</span>{c.ao ? <span style={{ fontSize: 13, color: T4, marginLeft: 6 }}>· {c.ao}</span> : null}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: T5 }}>{c.dt}</span>
                      {c.au === profName ? (
                        <>
                          <span onClick={() => { setEditCmtId(c.id); setEditCmtText(c.txt); }} style={{ fontSize: 11, color: T4, cursor: "pointer" }}>Edit</span>
                          <span onClick={async () => {
                            const success = await deleteComment(c.id);
                            if (success) {
                              setDbComments(dbComments.filter(cm => cm.id !== c.id));
                              fl("Comment deleted");
                              onRefresh?.();
                            }
                          }} style={{ fontSize: 11, color: R, cursor: "pointer" }}>Delete</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: T3, marginTop: 6, lineHeight: 1.55, wordBreak: "break-word", overflowWrap: "break-word" }}>{c.txt}</div>
                </>
              )}
            </div>
          ))}
          {cmtLoading ? <div style={{ textAlign: "center", color: T5, padding: 16, fontSize: 13 }}>Loading comments...</div> : null}
          {!cmtLoading && comments.length === 0 ? <div style={{ textAlign: "center", color: T6, padding: 16, fontSize: 13 }}>No comments yet. Be the first.</div> : null}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={cmtText} onChange={e => setCmtText(e.target.value)} placeholder="Add a comment..." style={{ ...ist, flex: 1 }} />
            <button onClick={async () => {
              if (!cmtText.trim()) return;
              const itemType = bd.tp === "exercise" ? "exercise" : "beatdown";
              const result = await addComment(String(bd.id), itemType as "beatdown" | "exercise", cmtText);
              if (result) {
                const p = result.profiles as Record<string, unknown> | null;
                setDbComments([{
                  id: (result.id as string) || "",
                  au: (p?.f3_name as string) || "You",
                  ao: ((p?.ao as string) || "") + ((p?.state as string) ? ", " + (p?.state as string) : ""),
                  txt: (result.text as string) || cmtText,
                  dt: "Just now",
                }, ...dbComments]);
                setCmtText("");
                fl("Comment posted!");
                onRefresh?.();
              } else {
                fl("Comment failed");
              }
            }} style={{ fontFamily: F, background: G, color: BG, border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Post</button>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          {/* LAYER 1 — PRIMARY */}
          <button onClick={() => { onSteal?.(String(bd.id), bd.tp as "beatdown" | "exercise"); fl("Saved!"); }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save</button>
          {/* LAYER 2 — SECONDARY ROW (icon pills) — beatdowns with sections only */}
          {bd.tp === "beatdown" && bd.secs && bd.secs.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={() => onRunBeatdown?.(bd)} style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.30)", color: G, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 16, lineHeight: 1, marginBottom: 5 }}>▶</span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase" }}>Live</span>
              </button>
              <button
                onClick={() => onSendPreblast?.({
                  id: String(bd.id),
                  title: bd.nm,
                  duration: bd.dur,
                  difficulty: bd.d,
                  sections: bd.secs?.map(s => ({
                    label: s.label,
                    color: s.color,
                    exercises: s.exercises.map(e => ({ name: e.n, reps: e.r ?? null, cadence: e.c ?? null })),
                  })),
                })}
                style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.30)", color: P, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, marginBottom: 5 }}>📣</span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase" }}>Preblast</span>
              </button>
            </div>
          )}
        </div>
        {toastEl}
      </div>
    );
  }

  // ═══ FILTERS ═══
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

  // ═══ FEED LIST ═══
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
      {exDetailModal}

      <div style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 12 }}>Library</div>
      {libT === "beatdowns" ? <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search by title, Q name, AO..." style={{ ...ist, marginBottom: 14 }} /> : null}
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid " + BD, padding: 3, marginBottom: 16 }}>
        {["beatdowns", "exercises"].map(sv => (
          <div key={sv} onClick={() => setLibT(sv)} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: libT === sv ? 700 : 500, color: libT === sv ? G : T4, background: libT === sv ? "rgba(34,197,94,0.08)" : "transparent", borderRadius: 10, cursor: "pointer", textTransform: "capitalize" }}>{sv}</div>
        ))}
      </div>

      {/* Unified exercises feed (Item 5) */}
      {libT === "exercises" ? (
        <div>
          {(() => {
            // Build communityExercises from sharedItems (already mapped server-side via dbToShared)
            const communityExercises: ExerciseData[] = sharedItems
              .filter(si => si.tp === "exercise")
              .map(si => ({
                n: si.nm,
                f: si.nm,
                t: si.et || [],
                s: [],
                h: si.howTo || "",
                d: si.ds || "",
                id: String(si.id),
                source: "community" as const,
                createdAt: si.createdAt,
                creatorName: si.au,
                voteCount: si.v ?? 0,
                commentCount: si.cm ?? 0,
              }));
            // Dedup: drop any community row whose name matches a seed name (shouldn't happen — seed and community are disjoint by source — but defense-in-depth)
            const seedNames = new Set(seedEx.map(e => e.n.toLowerCase()));
            const uniqueCommunity = communityExercises.filter(c => !seedNames.has(c.n.toLowerCase()));
            const allEx: ExerciseData[] = [...seedEx, ...uniqueCommunity];

            const q = exSearch.trim().toLowerCase();
            let filtered = allEx.filter(e => {
              const typeMatch = exType === "All" || e.t.includes(exType);
              const bodyMatch = exBody === "All" || e.t.includes(exBody);
              if (!typeMatch || !bodyMatch) return false;
              if (!q) return true;
              return (
                e.n.toLowerCase().includes(q) ||
                e.f.toLowerCase().includes(q) ||
                (e.d || "").toLowerCase().includes(q) ||
                (e.creatorName || "").toLowerCase().includes(q)
              );
            });

            if (q) {
              filtered.sort((a, b) => {
                const score = (e: ExerciseData) => {
                  const n = e.n.toLowerCase();
                  if (n === q) return 0;
                  if (n.startsWith(q)) return 1;
                  if (n.includes(q)) return 2;
                  if (e.f.toLowerCase().includes(q)) return 3;
                  if ((e.creatorName || "").toLowerCase().includes(q)) return 4;
                  if ((e.d || "").toLowerCase().includes(q)) return 5;
                  return 6;
                };
                return score(a) - score(b);
              });
            } else {
              filtered.sort((a, b) => {
                const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return tb - ta;
              });
            }
            const shown = filtered.slice(0, 50);

            // Click handler: community row → use original FeedItem from sharedItems (preserves auId, region, etc.); seed row → synthesize FeedItem
            const handleExClick = (e: ExerciseData) => {
              if (e.source === "community" && e.id) {
                const original = sharedItems.find(si => String(si.id) === e.id);
                if (original) { setLibDet(original); return; }
              }
              setLibDet({
                id: e.id || e.n,
                src: "Hand Built",
                nm: e.n,
                au: e.creatorName || "",
                ao: "",
                reg: "",
                d: e.df === 1 ? "easy" : e.df === 3 ? "hard" : "medium",
                dur: null,
                aoT: [],
                v: e.voteCount ?? 0,
                u: 0,
                cm: e.commentCount ?? 0,
                ds: e.d || "",
                dt: e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
                createdAt: e.createdAt,
                tp: "exercise",
                et: e.t,
                howTo: e.h,
                comments: [],
              });
            };

            return (
              <>
                <input value={exSearch} onChange={e => setExSearch(e.target.value)} placeholder={`Search ${allEx.length} exercises by name, alias, or PAX...`} style={{ ...ist, marginBottom: 10 }} />
                {/* TYPE row */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T5,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    marginBottom: 6,
                    paddingLeft: 2,
                  }}>Type</div>
                  <div style={{
                    display: "flex",
                    gap: 5,
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                    paddingBottom: 2,
                  }}>
                    {[{ value: "All", label: "All" }, ...TYPE_TAGS].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setExType(t.value)}
                        style={{
                          fontFamily: F,
                          background: exType === t.value ? P + "20" : "rgba(255,255,255,0.04)",
                          color: exType === t.value ? P : T5,
                          border: "1px solid " + (exType === t.value ? P + "30" : BD),
                          padding: "5px 11px",
                          borderRadius: 20,
                          fontSize: 10,
                          cursor: "pointer",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >{t.label}</button>
                    ))}
                  </div>
                </div>

                {/* BODY PART row */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T5,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    marginBottom: 6,
                    paddingLeft: 2,
                  }}>Body part</div>
                  <div style={{
                    display: "flex",
                    gap: 5,
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                    paddingBottom: 2,
                  }}>
                    {[{ value: "All", label: "All" }, ...BODY_TAGS].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setExBody(t.value)}
                        style={{
                          fontFamily: F,
                          background: exBody === t.value ? P + "20" : "rgba(255,255,255,0.04)",
                          color: exBody === t.value ? P : T5,
                          border: "1px solid " + (exBody === t.value ? P + "30" : BD),
                          padding: "5px 11px",
                          borderRadius: 20,
                          fontSize: 10,
                          cursor: "pointer",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >{t.label}</button>
                    ))}
                  </div>
                </div>
                {allEx.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40 }}>Loading exercises...</div> : null}
                {shown.map(e => (
                  <div key={e.id || e.n} onClick={() => handleExClick(e)} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + P + "40", borderRadius: 14, padding: "14px 18px", marginBottom: 6, cursor: "pointer" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T2 }}>{e.n}</div>
                    {e.f !== e.n ? <div style={{ fontSize: 12, color: T4, marginTop: 3 }}>{e.f}</div> : null}
                    {e.d ? <div style={{ fontSize: 13, color: T3, marginTop: 6, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{e.d}</div> : null}
                    {e.source === "community" && e.creatorName ? (
                      <div style={{ fontSize: 11, color: G, fontWeight: 600, marginTop: 6, fontFamily: F }}>added by {e.creatorName}</div>
                    ) : null}
                    {e.t.length > 0 ? <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>{e.t.map(t => <span key={t} style={{ background: P + "10", color: P, fontSize: 10, padding: "2px 8px", borderRadius: 5, fontFamily: F, textTransform: "uppercase" }}>{t}</span>)}</div> : null}
                  </div>
                ))}
                {filtered.length === 0 && allEx.length > 0 ? <div style={{ textAlign: "center", color: T5, padding: 40 }}>No exercises match your search</div> : null}
                {filtered.length > 50 ? <div style={{ textAlign: "center", color: T5, padding: 16, fontSize: 12 }}>Showing first 50 of {filtered.length} results. Search to narrow down.</div> : null}
              </>
            );
          })()}
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
              <div style={{ fontSize: 14, color: T4, marginTop: 5, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                {bd.auId && onOpenProfile ? (
                  <span onClick={e => handleAuthorTap(e, bd.auId)} style={{ color: G, fontWeight: 700, cursor: "pointer", padding: "4px 2px", textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: G + "60" }}>{bd.au}</span>
                ) : (
                  <span>{bd.au}</span>
                )}
                <span>· {bd.ao}</span>
                {bd.au === profName ? <span style={{ color: G, fontSize: 11, marginLeft: 2 }}>· You</span> : null}
              </div>
              {bd.inspiredBy ? <div style={{ fontSize: 11, color: A, marginTop: 3 }}>Inspired by {bd.inspiredBy}</div> : null}
              <div style={{ fontSize: 12, color: T5, marginTop: 3 }}>{bd.dt}</div>
            </div>
            <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
          </div>
          <div style={{ fontSize: 15, color: T3, marginTop: 10, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bd.ds}</div>
          {(bd.tg || bd.et || bd.dur) ? <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>{bd.dur ? <span style={{ background: G + "12", color: G, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F, fontWeight: 600 }}>{bd.dur}</span> : null}{(bd.tg || bd.et || []).filter(t => t !== bd.dur && !["Easy","Medium","Hard","Beast"].includes(t)).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.05)", color: T4, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{t}</span>)}</div> : null}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", gap: 14, fontSize: 14, color: T4 }}>
              {bd.tp === "beatdown" ? <span onClick={e => { e.stopPropagation(); onToggleVote?.(String(bd.id), "beatdown"); }} style={{ color: userVotes.has(String(bd.id)) ? G : T4, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}><ThumbsUpIcon size={14} filled={userVotes.has(String(bd.id))} /> {bd.v}</span> : <span onClick={e => { e.stopPropagation(); onToggleVote?.(String(bd.id), "exercise"); }} style={{ color: userVotes.has(String(bd.id)) ? G : T4, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}><ThumbsUpIcon size={14} filled={userVotes.has(String(bd.id))} /> {bd.v}</span>}
              <span>Stolen {bd.u}x</span>
              {bd.cm > 0 ? <span>{bd.cm} comments</span> : null}
            </div>
            <span onClick={e => { e.stopPropagation(); onSteal?.(String(bd.id), bd.tp as "beatdown" | "exercise"); fl("Saved!"); }} style={{ fontSize: 14, color: G, cursor: "pointer", padding: "4px 8px", fontWeight: 600 }}>Save</span>
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
