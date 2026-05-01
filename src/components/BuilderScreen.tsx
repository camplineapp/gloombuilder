"use client";

import { useState, useEffect, useRef } from "react";
import { EX, DIFFS, SITES, EQUIP, mapSupabaseExercise, normalizeSection } from "@/lib/exercises";
import type { Section, ExerciseData } from "@/lib/exercises";
import { loadSeedExercises } from "@/lib/db";
import SectionEditor from "@/components/SectionEditor";
import type { AttachedBeatdown } from "@/components/PreblastComposer";
import { DRAFT_KEYS, loadDraft, saveDraft, clearDraft, formatTimeAgo } from "@/lib/drafts";

const G = "#22c55e";
const A = "#f59e0b";
const P = "#a78bfa";
const BG = "#0E0E10";
const BD = "rgba(255,255,255,0.07)";
const CD = "rgba(255,255,255,0.028)";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, borderRadius: 10,
  color: T2, padding: "12px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: F,
};

// Helper: look up human-readable label for site/equipment IDs
const siteLabel = (id: string) => SITES.find(s => s.id === id)?.l || id;
const eqLabel = (id: string) => EQUIP.find(e => e.id === id)?.l || id;

interface BuilderScreenProps {
  onClose: () => void;
  backLabel?: string;
  onSave: (beatdown: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean;
  }) => Promise<string | null>;
  editData?: {
    id: string; nm: string; desc: string; d: string; secs: Section[];
    tg: string[]; dur: string | null; sites: string[]; eq: string[]; isPublic?: boolean;
  };
  onUpdate?: (id: string, data: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    dur: string | null; sites: string[]; eq: string[];
  }) => Promise<boolean>;
  onRunThis?: (secs: Section[], title: string, dur: string, saveData: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean;
  }) => void;
  onRunBeatdown?: () => void;
  onShareBeatdown?: () => void;
  onUnshareBeatdown?: () => void;
  onDeleteBeatdown?: () => void;
  onSendPreblast?: (bd: AttachedBeatdown) => void;
  onSavedNew?: (newId: string) => void;
  onOpenCopyModal?: (ctx: { secs: Section[]; beatdownName: string; beatdownDesc: string }) => void;
  profName?: string;
  userExercises?: { id: string; nm: string; desc: string; tags: string[]; how: string }[];
  communityExercises?: { nm: string; desc: string; tags: string[]; how: string }[];
}

function defaultSections(): Section[] {
  return [
    { id: undefined, name: "Warmup", label: "Warmup", color: G, qNotes: "", note: "", exercises: [] },
    { id: undefined, name: "The Thang", label: "The Thang", color: A, qNotes: "", note: "", exercises: [] },
    { id: undefined, name: "Mary", label: "Mary", color: P, qNotes: "", note: "", exercises: [] },
  ].map(s => normalizeSection(s as Record<string, unknown>));
}

export default function BuilderScreen({ onClose, backLabel, onSave, editData, onUpdate, onRunThis, onRunBeatdown, onShareBeatdown, onUnshareBeatdown, onDeleteBeatdown, onSendPreblast, onSavedNew, onOpenCopyModal, profName, userExercises, communityExercises }: BuilderScreenProps) {
  const draftKey = editData ? DRAFT_KEYS.builderEdit(editData.id) : DRAFT_KEYS.builderNew;
  type BuilderDraft = {
    bT: string; bD: string; bDur: string | null; bDiff: string | null;
    bSites: string[]; bEq: string[]; secs: Section[]; shareLib: boolean;
  };
  const initialDraft = (() => {
    if (typeof window === "undefined") return null;
    return loadDraft<BuilderDraft>(draftKey);
  })();

  const computeInitialSecs = (): Section[] => {
    if (editData?.secs && editData.secs.length > 0) {
      return editData.secs.map(s => normalizeSection(s as unknown as Record<string, unknown>));
    }
    return defaultSections();
  };

  const [bT, setBT] = useState(initialDraft?.data.bT ?? editData?.nm ?? "");
  const [bD, setBD] = useState(initialDraft?.data.bD ?? editData?.desc ?? "");
  const [bDur, setBDur] = useState<string | null>(initialDraft?.data.bDur ?? editData?.dur ?? null);
  const [bDiff, setBDiff] = useState<string | null>(initialDraft?.data.bDiff ?? editData?.d ?? null);
  const [bSites, setBSites] = useState<string[]>(initialDraft?.data.bSites ?? editData?.sites ?? []);
  const [bEq, setBEq] = useState<string[]>(initialDraft?.data.bEq ?? editData?.eq ?? []);
  const [secs, setSecs] = useState<Section[]>(initialDraft?.data.secs ?? computeInitialSecs());
  const [shareLib, setShareLib] = useState(initialDraft?.data.shareLib ?? editData?.isPublic ?? false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [allEx, setAllEx] = useState<ExerciseData[]>(EX);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [unshareConfirm, setUnshareConfirm] = useState(false);
  const [draftRestored, setDraftRestored] = useState<{ timeAgo: string } | null>(null);

  useEffect(() => {
    if (initialDraft) {
      setDraftRestored({ timeAgo: formatTimeAgo(initialDraft.savedAt) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft<BuilderDraft>(draftKey, { bT, bD, bDur, bDiff, bSites, bEq, secs, shareLib });
    }, 800);
    return () => clearTimeout(timer);
  }, [bT, bD, bDur, bDiff, bSites, bEq, secs, shareLib, draftKey]);

  const handleDiscardDraft = () => {
    clearDraft(draftKey);
    setDraftRestored(null);
    setBT(editData?.nm ?? "");
    setBD(editData?.desc ?? "");
    setBDur(editData?.dur ?? null);
    setBDiff(editData?.d ?? null);
    setBSites(editData?.sites ?? []);
    setBEq(editData?.eq ?? []);
    setSecs(computeInitialSecs());
    setShareLib(editData?.isPublic ?? false);
  };

  const userExRef = useRef(userExercises);
  const commExRef = useRef(communityExercises);
  userExRef.current = userExercises;
  commExRef.current = communityExercises;

  useEffect(() => {
    loadSeedExercises().then(rows => {
      if (rows.length > 0) {
        const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
        const seedNames = new Set(mapped.map(e => e.n.toLowerCase()));
        const userMapped: ExerciseData[] = (userExRef.current || []).map(ux => ({
          n: ux.nm, f: ux.nm, t: ux.tags || [], s: [], h: ux.how || "", d: ux.desc || "",
        }));
        const uniqueUser = userMapped.filter(u => !seedNames.has(u.n.toLowerCase()));
        const allNames = new Set([...seedNames, ...uniqueUser.map(u => u.n.toLowerCase())]);
        const communityMapped: ExerciseData[] = (commExRef.current || []).map(ce => ({
          n: ce.nm, f: ce.nm, t: ce.tags || [], s: [], h: ce.how || "", d: ce.desc || "",
        }));
        const uniqueCommunity = communityMapped.filter(c => !allNames.has(c.n.toLowerCase()));
        setAllEx([...mapped, ...uniqueUser, ...uniqueCommunity]);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  const buildTags = () => [
    bDur,
    (DIFFS.find(x => x.id === bDiff) || { l: "" }).l,
    ...bSites.map(s => (SITES.find(x => x.id === s) || { l: "" }).l),
    ...bEq.filter(e => e !== "none").map(e => (EQUIP.find(x => x.id === e) || { l: "" }).l),
  ].filter((v): v is string => Boolean(v));

  // Check if any details have been set (for collapsed chip summary)
  const hasAnyDetails = bDur || bDiff || bSites.length > 0 || bEq.length > 0;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const nm = bT.trim() || "Untitled";
    const tgs = buildTags();
    try {
      if (editData && onUpdate) {
        const success = await onUpdate(editData.id, { nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, dur: bDur, sites: bSites, eq: bEq });
        if (success) {
          clearDraft(draftKey);
          setDraftRestored(null);
        }
      } else if (onSave) {
        const newId = await onSave({ nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, src: "Manual", dur: bDur, sites: bSites, eq: bEq, share: shareLib });
        if (newId) {
          clearDraft(draftKey);
          setDraftRestored(null);
          onSavedNew?.(newId);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRunThis = () => {
    if (saving) return;
    setSaving(true);
    const nm = bT.trim() || "Untitled";
    const tgs = buildTags();
    const saveData = { nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, src: "Manual", dur: bDur, sites: bSites, eq: bEq, share: shareLib };
    onRunThis?.(JSON.parse(JSON.stringify(secs)), nm, bDur || "45 min", saveData);
  };

  return (
    <div style={{ padding: "0 24px" }}>
      {toastEl}

      {/* Draft restored banner */}
      {draftRestored && (
        <div style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.30)", borderRadius: 10, padding: "10px 14px", marginTop: 16, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 13, fontWeight: 600, color: A, fontFamily: F }}>
          <span>↻ Draft restored from {draftRestored.timeAgo}</span>
          <button onClick={handleDiscardDraft} style={{ fontFamily: F, background: "transparent", border: "1px solid rgba(245,158,11,0.40)", color: A, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}>Discard</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid " + BD }}>
        <button onClick={onClose} style={{ fontFamily: F, color: T3, background: "none", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 600, padding: "8px 0" }}>
          {backLabel || (editData ? "← Locker" : "← Home")}
        </button>
      </div>

      {/* Beatdown name + description */}
      <div style={{ padding: "0 4px 16px" }}>
        <div style={{ color: T4, fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
          {editData ? "Edit beatdown" : "Build beatdown"}
        </div>
        <input
          value={bT}
          maxLength={50}
          onChange={e => setBT(e.target.value)}
          placeholder="Name this beatdown..."
          style={{ width: "100%", background: "none", border: "none", borderBottom: "2px solid " + BD, color: T1, fontSize: 26, fontWeight: 800, padding: "4px 0 10px", fontFamily: F, outline: "none", boxSizing: "border-box" }}
        />
        <textarea
          value={bD}
          onChange={e => setBD(e.target.value)}
          placeholder="Describe this beatdown..."
          rows={2}
          style={{ ...ist, marginTop: 10, resize: "vertical" as const, fontStyle: "italic", background: "none", border: "none", color: T3, fontSize: 16, fontWeight: 500, padding: "10px 0 4px" }}
        />
        <div style={{ color: T4, fontSize: 13, marginTop: 8 }}>by The Bishop · F3 Essex</div>
      </div>

      {/* Share toggle — hidden in edit mode */}
      {!editData ? (
        <div
          onClick={() => setShareLib(!shareLib)}
          style={{ background: shareLib ? G + "10" : CD, border: "1px solid " + (shareLib ? G + "25" : BD), borderRadius: 12, padding: "14px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid " + (shareLib ? G : T4), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: BG, background: shareLib ? G : "transparent", fontWeight: 800 }}>{shareLib ? "✓" : ""}</div>
          <span style={{ fontSize: 16, color: shareLib ? G : T4, fontWeight: 600, fontFamily: F }}>Share to community library</span>
        </div>
      ) : (
        editData.isPublic ? (
          <div style={{ fontFamily: F, fontSize: 12, color: A, textAlign: "center", marginBottom: 14 }}>This beatdown is shared. Edits will be visible to everyone.</div>
        ) : null
      )}

      {/* Beatdown details card — collapsible, shows chip summary when collapsed */}
      <div style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
        <div onClick={() => setDetailsOpen(!detailsOpen)} style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div>
            <span style={{ color: T2, fontSize: 13, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", fontFamily: F }}>Beatdown Details</span>
            {/* Collapsed chip summary — shows what's been set at a glance */}
            {!detailsOpen && hasAnyDetails && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {bDur && <span style={{ fontFamily: F, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: G, fontSize: 14, fontWeight: 700, padding: "5px 12px", borderRadius: 8 }}>{bDur}</span>}
                {bDiff && (() => { const d = DIFFS.find(x => x.id === bDiff); return d ? <span style={{ fontFamily: F, background: d.c + "15", border: "1px solid " + d.c + "40", color: d.c, fontSize: 14, fontWeight: 700, padding: "5px 12px", borderRadius: 8 }}>{d.l}</span> : null; })()}
                {bSites.map(s => <span key={s} style={{ fontFamily: F, background: G + "12", border: "1px solid " + G + "30", color: G, fontSize: 14, fontWeight: 600, padding: "5px 12px", borderRadius: 8 }}>{siteLabel(s)}</span>)}
                {bEq.map(e => <span key={e} style={{ fontFamily: F, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: P, fontSize: 14, fontWeight: 600, padding: "5px 12px", borderRadius: 8 }}>{eqLabel(e)}</span>)}
              </div>
            )}
          </div>
          <span style={{ color: T5, fontSize: 16, fontFamily: F }}>{detailsOpen ? "▾" : "▸"}</span>
        </div>
        {detailsOpen && (
          <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color: T5, fontSize: 11, fontWeight: 600, margin: "12px 0 8px", fontFamily: F }}>Duration</div>
            <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
              {["30 min", "45 min", "60 min"].map(d => { const sel = bDur === d; return <button key={d} onClick={() => setBDur(sel ? null : d)} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T2, border: sel ? "1.5px solid " + G : "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: sel ? 700 : 600 }}>{d}</button>; })}
            </div>
            <div style={{ color: T5, fontSize: 11, fontWeight: 600, marginBottom: 8, fontFamily: F }}>Difficulty</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              {DIFFS.map(d => { const sel = bDiff === d.id; return <button key={d.id} onClick={() => setBDiff(sel ? null : d.id)} style={{ fontFamily: F, background: sel ? d.c + "20" : "rgba(255,255,255,0.04)", color: sel ? d.c : T2, border: sel ? "1.5px solid " + d.c : "1px solid rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: sel ? 700 : 600 }}>{d.l}</button>; })}
            </div>
            <div style={{ color: T5, fontSize: 11, fontWeight: 600, marginBottom: 8, fontFamily: F }}>AO Site</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {SITES.map(sv => { const sel = bSites.includes(sv.id); return <button key={sv.id} onClick={() => setBSites(sel ? bSites.filter(x => x !== sv.id) : [...bSites, sv.id])} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: sel ? "1.5px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.08)", padding: "6px 12px", borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{sv.l}</button>; })}
            </div>
            <div style={{ color: T5, fontSize: 11, fontWeight: 600, marginBottom: 8, fontFamily: F }}>Equipment</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {EQUIP.map(e => { const sel = bEq.includes(e.id); return <button key={e.id} onClick={() => setBEq(sel ? bEq.filter(x => x !== e.id) : [...bEq, e.id])} style={{ fontFamily: F, background: sel ? P + "20" : "rgba(255,255,255,0.04)", color: sel ? P : T4, border: sel ? "1.5px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)", padding: "6px 12px", borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{e.l}</button>; })}
            </div>
          </div>
        )}
      </div>

      {/* Section Editor — the new heart of the builder */}
      <SectionEditor
        sections={secs}
        onSectionsChange={setSecs}
        allEx={allEx}
      />

      {/* Action area — Round 3: Layer 1 primary, Layer 2 icon pills, Layer 3 destructive footer */}
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        {/* LAYER 1 — PRIMARY */}
        <button
          disabled={saving}
          onClick={handleSave}
          style={{ fontFamily: F, width: "100%", padding: "20px 0", borderRadius: 14, fontSize: 18, fontWeight: 800, cursor: saving ? "default" : "pointer", background: saving ? "#1a1a1e" : G, color: saving ? T4 : BG, border: "none", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving..." : (editData ? "Save changes" : "Save")}
        </button>

        {/* LAYER 2 — SECONDARY ROW (icon pills) */}
        {!saving && (
          <div style={{ display: "flex", gap: 6 }}>
            {(editData ? onRunBeatdown : onRunThis) && (
              <button
                onClick={editData ? onRunBeatdown : handleRunThis}
                style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.30)", color: G, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, marginBottom: 5 }}>▶</span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase" }}>Live</span>
              </button>
            )}
            <button
              onClick={() => onSendPreblast?.({
                id: editData?.id ?? "draft",
                title: bT || "Untitled beatdown",
                duration: bDur,
                difficulty: DIFFS.find(d => d.id === bDiff)?.l ?? null,
                sections: secs.map(s => ({
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
            <button
              onClick={() => onOpenCopyModal?.({ secs, beatdownName: bT || "Untitled", beatdownDesc: bD })}
              style={{ fontFamily: F, flex: 1, padding: "10px 4px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.30)", color: A, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, marginBottom: 5 }}>📓</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase" }}>Backblast</span>
            </button>
          </div>
        )}

        {/* LAYER 3 — DESTRUCTIVE FOOTER (edit mode only) */}
        {editData && !saving && (
          <div style={{ marginTop: 18, paddingTop: 12, borderTop: "0.5px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {editData.isPublic ? (
              <span
                onClick={() => setUnshareConfirm(true)}
                style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}
              >
                Unshare
              </span>
            ) : (
              <span
                onClick={onShareBeatdown}
                style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#22c55e", cursor: "pointer" }}
              >
                Share to library
              </span>
            )}
            <span
              onClick={onDeleteBeatdown}
              style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}
            >
              Delete
            </span>
          </div>
        )}
      </div>
      {unshareConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 22, padding: "32px 28px", maxWidth: 360, width: "100%", textAlign: "center" }}>
            <h3 style={{ fontFamily: F, fontSize: 22, fontWeight: 800, color: T1, margin: "0 0 12px" }}>Unshare beatdown?</h3>
            <p style={{ fontFamily: F, fontSize: 15, color: T3, margin: "0 0 8px", lineHeight: 1.6 }}>
              This will remove <span style={{ color: T1, fontWeight: 700 }}>{bT || "this beatdown"}</span> from the Library.
            </p>
            <p style={{ fontFamily: F, fontSize: 14, color: "#ef4444", margin: "0 0 28px", lineHeight: 1.5 }}>
              All votes and comments from other PAX will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setUnshareConfirm(false)} style={{ fontFamily: F, flex: 1, padding: "18px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, fontSize: 16, fontWeight: 700, color: T2, cursor: "pointer" }}>Keep Shared</button>
              <button onClick={() => { setUnshareConfirm(false); onUnshareBeatdown?.(); }} style={{ fontFamily: F, flex: 1, padding: "18px 0", background: "#ef4444", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, color: "#fff", cursor: "pointer" }}>Unshare</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
