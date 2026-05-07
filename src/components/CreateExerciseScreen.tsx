"use client";

import { useState, useEffect } from "react";
import { TAGS } from "@/lib/exercises";
import { DRAFT_KEYS, saveDraft, clearDraft } from "@/lib/drafts";

const CD = "rgba(255,255,255,0.028)";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const BG = "#0E0E10";
const T1 = "#F0EDE8";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, borderRadius: 10,
  color: "#D0C8BC", padding: "12px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: F,
};

interface CreateExerciseScreenProps {
  onClose: () => void;
  onSave: (exercise: { nm: string; tags: string[]; how: string; desc: string; share: boolean }) => Promise<void>;
  editData?: {
    id: string;
    nm: string;
    desc: string;
    how: string;
    tags: string[];
    isPublic: boolean;
  };
  onUpdate?: (id: string, data: { nm: string; desc?: string; how: string; tags: string[] }) => Promise<boolean>;
  onShareExercise?: () => void;
  onUnshareExercise?: () => void;
  onDeleteExercise?: () => void;
}

export default function CreateExerciseScreen({ onClose, onSave, editData, onUpdate, onShareExercise, onUnshareExercise, onDeleteExercise }: CreateExerciseScreenProps) {
  const draftKey = DRAFT_KEYS.exerciseNew;
  type ExerciseDraft = {
    cxN: string; cxDesc: string; cxH: string; cxT: string[]; cxShare: boolean;
  };
  // Modified Flavor B: no auto-restore on mount in either edit or new mode.
  // Edit mode never restored anyway (existing behavior); new mode now also skips.
  // Drafts continue to autosave in new mode (see effect below).
  const initialDraft = null as { data: ExerciseDraft } | null;

  const [cxN, setCxN] = useState(editData?.nm ?? initialDraft?.data.cxN ?? "");
  const [cxDesc, setCxDesc] = useState(editData?.desc ?? initialDraft?.data.cxDesc ?? "");
  const [cxH, setCxH] = useState(editData?.how ?? initialDraft?.data.cxH ?? "");
  const [cxT, setCxT] = useState<string[]>(editData?.tags ?? initialDraft?.data.cxT ?? []);
  const [cxShare, setCxShare] = useState(editData?.isPublic ?? initialDraft?.data.cxShare ?? false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (editData) return; // no autosave in edit mode
    const timer = setTimeout(() => {
      saveDraft<ExerciseDraft>(draftKey, { cxN, cxDesc, cxH, cxT, cxShare });
    }, 800);
    return () => clearTimeout(timer);
  }, [cxN, cxDesc, cxH, cxT, cxShare, draftKey, editData]);

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const handleSave = async () => {
    if (saving) return;
    if (!cxN.trim()) { fl("Name required"); return; }
    setSaving(true);
    try {
      if (editData && onUpdate) {
        await onUpdate(editData.id, { nm: cxN, desc: cxDesc, how: cxH, tags: cxT });
      } else {
        await onSave({ nm: cxN, tags: cxT, how: cxH, desc: cxDesc, share: cxShare });
        clearDraft(draftKey);
      }
    } finally {
      setSaving(false);
    }
  };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 300 }}>{toast}</div>
  ) : null;

  return (
    <div style={{ padding: "0 24px" }}>
      {toastEl}
      <button onClick={onClose} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>{editData ? "← Locker" : "← Home"}</button>
      <div style={{ fontSize: 24, fontWeight: 800, color: T1, marginBottom: 4 }}>{editData ? "Edit exercise" : "Create exercise"}</div>
      <div style={{ fontSize: 13, color: T4, marginBottom: 24 }}>{editData ? "Update your exercise details" : "Add your own exercise"}</div>

      {/* Exercise name */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Exercise name</label>
        <input value={cxN} maxLength={50} onChange={e => setCxN(e.target.value)} placeholder="e.g. The Bishop Special" style={ist} />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Description</label>
        <textarea value={cxDesc} maxLength={200} onChange={e => setCxDesc(e.target.value)} placeholder="Short description of what this exercise is..." rows={2} style={{ ...ist, resize: "vertical" as const }} />
      </div>

      {/* How-to */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>How-to</label>
        <textarea value={cxH} maxLength={500} onChange={e => setCxH(e.target.value)} placeholder="Step by step instructions to perform this exercise..." rows={4} style={{ ...ist, resize: "vertical" as const }} />
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 8, fontWeight: 600 }}>Tags</label>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TAGS.map(t => {
            const sel = cxT.includes(t);
            return <button key={t} onClick={() => setCxT(sel ? cxT.filter(x => x !== t) : [...cxT, t])} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T5, border: "1px solid " + (sel ? G + "30" : BD), padding: "6px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>{t}</button>;
          })}
        </div>
      </div>

      {/* Share toggle — hidden in edit mode (sharing controlled via Layer 3 footer) */}
      {!editData && (
        <div onClick={() => setCxShare(!cxShare)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: cxShare ? G + "10" : CD, border: "1px solid " + (cxShare ? G + "25" : BD), borderRadius: 10, cursor: "pointer" }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (cxShare ? G : T5), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: BG, background: cxShare ? G : "transparent" }}>{cxShare ? "✓" : ""}</div>
          <span style={{ fontSize: 13, color: cxShare ? G : T4 }}>Share to community library</span>
        </div>
      )}

      {/* Save */}
      <button disabled={saving} onClick={handleSave} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer", background: saving ? "#1a1a1e" : G, color: saving ? T4 : BG, border: "none", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : (editData ? "Save changes" : "Save exercise")}</button>

      {/* Layer 3 destructive footer (edit mode only) */}
      {editData && !saving && (
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: "0.5px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {editData.isPublic ? (
            <span onClick={() => onUnshareExercise?.()} style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Unshare</span>
          ) : (
            <span onClick={() => onShareExercise?.()} style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#22c55e", cursor: "pointer" }}>Share to library</span>
          )}
          <span onClick={() => onDeleteExercise?.()} style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Delete</span>
        </div>
      )}
    </div>
  );
}
