"use client";

import { useState, useEffect } from "react";
import { loadSeedExercises } from "@/lib/db";
import { mapSupabaseExercise, EQUIP } from "@/lib/exercises";
import type { ExerciseData } from "@/lib/exercises";
import type { AttachedBeatdown } from "@/components/PreblastComposer";
import { colorForUserId, getInitials } from "@/lib/avatars";
import BeatdownDetailSheet from "@/components/BeatdownDetailSheet";
import type { FeedItem } from "@/components/BeatdownDetailSheet";

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

// FeedItem (and Comment/Section/Exercise) live in BeatdownDetailSheet.tsx
// and are imported above. Sample data removed — Library now uses only Supabase data.

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
  const [fEq, setFEq] = useState("All");
  const [fSrc, setFSrc] = useState("All");
  const [fET, setFET] = useState("All");
  const [fExR, setFExR] = useState("All");
  const [toast, setToast] = useState("");
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

  // Item 3: notify parent when libDet open state changes
  useEffect(() => {
    onLibDetChange?.(libDet !== null);
  }, [libDet, onLibDetChange]);

  // Item 3: register back handler so parent's popstate can close libDet
  useEffect(() => {
    if (registerBackHandler) {
      registerBackHandler(() => {
        setLibDet(null);
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
    return (
      <>
        {exDetailModal}
        <BeatdownDetailSheet
          item={libDet}
          onClose={() => setLibDet(null)}
          backLabel="← Library"
          seedEx={seedEx}
          onOpenExerciseDetail={ex => setDbDetail(ex)}
          userVotes={userVotes}
          onToggleVote={onToggleVote}
          onSteal={onSteal}
          onRunBeatdown={onRunBeatdown}
          onSendPreblast={onSendPreblast}
          onOpenProfile={onOpenProfile}
          onRefresh={onRefresh}
          profName={profName}
          currentUserId={currentUserId}
          onToast={fl}
        />
      </>
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
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Equipment</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All", ...EQUIP.map(e => e.l)].map(o => filterBtn(o, fEq === o, () => setFEq(o)))}</div>
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
    if (fEq !== "All") { const eId = EQUIP.find(e => e.l === fEq); feed = feed.filter(b => eId && b.eq && b.eq.includes(eId.id)); }
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
    ? [fD, fDu, fR, fAo, fEq, fSrc].filter(v => v !== "All").length
    : [fET, fD, fExR].filter(v => v !== "All").length;

  return (
    <div style={{ padding: "0 24px" }}>
      {exDetailModal}

      <div style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 12 }}>Library</div>
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
      <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search by title, Q name, AO..." style={{ ...ist, marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ k: "new", l: "New" }, { k: "top", l: "Top voted" }, { k: "stolen", l: "Most stolen" }].map(sv => (
          <button key={sv.k} onClick={() => setFSort(sv.k)} style={{ fontFamily: F, background: fSort === sv.k ? G + "15" : "rgba(255,255,255,0.04)", color: fSort === sv.k ? G : T4, padding: "7px 14px", borderRadius: 10, fontSize: 13, border: "none", cursor: "pointer", fontWeight: fSort === sv.k ? 700 : 500 }}>{sv.l}</button>
        ))}
        <button onClick={() => setLibF(true)} style={{ fontFamily: F, marginLeft: "auto", background: af > 0 ? G + "15" : "rgba(255,255,255,0.04)", color: af > 0 ? G : T4, padding: "7px 14px", borderRadius: 10, fontSize: 12, border: "1px solid " + (af > 0 ? G + "30" : BD), cursor: "pointer", fontWeight: 600 }}>Filters{af > 0 ? " (" + af + ")" : ""}</button>
      </div>
      {feed.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40, border: "1px dashed " + BD, borderRadius: 14, marginBottom: 8 }}>No {libT} shared yet. Be the first!</div> : null}
      {feed.map(bd => {
        const isOwn = bd.auId ? bd.auId === currentUserId : false;
        const avatarColor = colorForUserId(bd.auId || String(bd.id), isOwn);
        const initials = getInitials(bd.au);

        // Date formatter — "Apr 24" current year, "Apr 24, 2025" prior year
        let dateStr = bd.dt; // fallback to pre-formatted dt
        if (bd.createdAt) {
          const d = new Date(bd.createdAt);
          const currentYear = new Date().getFullYear();
          const opts: Intl.DateTimeFormatOptions = d.getFullYear() === currentYear
            ? { month: "short", day: "numeric" }
            : { month: "short", day: "numeric", year: "numeric" };
          dateStr = d.toLocaleDateString("en-US", opts);
        }

        const sb = bd.src ? srcBadge(bd.src) : null;
        const diffColor = dc(bd.d);

        return (
          <div key={bd.id} onClick={() => setLibDet(bd)} style={{
            background: CD,
            border: "1px solid " + BD,
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 8,
            cursor: "pointer",
          }}>
            {/* HEADER ROW — avatar + author/AO/date + duration pill */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div
                onClick={bd.auId && onOpenProfile ? (e => handleAuthorTap(e, bd.auId)) : undefined}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: avatarColor + "1f",
                  border: "2px solid " + avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: avatarColor,
                  flexShrink: 0,
                  letterSpacing: -0.5,
                  cursor: bd.auId && onOpenProfile ? "pointer" : "default",
                }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {bd.auId && onOpenProfile ? (
                    <span onClick={e => handleAuthorTap(e, bd.auId)} style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: T2,
                      cursor: "pointer",
                    }}>{bd.au}</span>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700, color: T2 }}>{bd.au}</span>
                  )}
                  {isOwn && (
                    <span style={{
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: G + "20",
                      color: G,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}>YOU</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: T5, marginTop: 2 }}>
                  {bd.ao}{bd.ao && dateStr ? " · " : ""}{dateStr}
                </div>
              </div>
              {bd.dur && (
                <span style={{
                  background: G + "15",
                  color: G,
                  fontSize: 12,
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontFamily: F,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>{bd.dur}</span>
              )}
            </div>

            {/* TITLE */}
            <div style={{ fontSize: 18, fontWeight: 700, color: T2, marginBottom: 6 }}>{bd.nm}</div>

            {/* INSPIRED-BY (if present) */}
            {bd.inspiredBy && (
              <div style={{ fontSize: 11, color: A, marginBottom: 6 }}>Inspired by {bd.inspiredBy}</div>
            )}

            {/* SOURCE + DIFFICULTY + TAGS row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {sb && (
                <span style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 5,
                  fontWeight: 700,
                  background: sb.bg,
                  color: sb.c,
                }}>{sb.l}</span>
              )}
              <span style={{
                background: diffColor + "15",
                color: diffColor,
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 5,
                fontWeight: 700,
                fontFamily: F,
                textTransform: "uppercase",
              }}>{bd.d}</span>
              {bd.tg && bd.tg.filter(t =>
                t !== bd.dur && !["Easy","Medium","Hard","Beast"].includes(t)
              ).length > 0 && (
                <span style={{ fontSize: 12, color: T4 }}>
                  · {bd.tg.filter(t =>
                    t !== bd.dur && !["Easy","Medium","Hard","Beast"].includes(t)
                  ).join(" · ")}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            {bd.ds && (
              <div style={{
                fontSize: 14,
                color: T3,
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                marginBottom: 12,
              }}>{bd.ds}</div>
            )}

            {/* 3-COUNTER FOOTER (always visible, vote interactive) */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 14,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.04)",
              fontSize: 13,
              color: T4,
            }}>
              <span
                onClick={e => { e.stopPropagation(); onToggleVote?.(String(bd.id), "beatdown"); }}
                style={{
                  color: userVotes.has(String(bd.id)) ? G : T4,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >👍 {bd.v}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>↻ {bd.u}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>💬 {bd.cm}</span>
            </div>
          </div>
        );
      })}
      {feed.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40 }}>No results match your filters</div> : null}
      </>
      )}
      {toastEl}
    </div>
  );
}
