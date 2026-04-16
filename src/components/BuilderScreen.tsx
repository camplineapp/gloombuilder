"use client";

import { useState, useEffect } from "react";
import { EX, DIFFS, SITES, EQUIP, mapSupabaseExercise, normalizeSection } from "@/lib/exercises";
import type { Section, ExerciseData } from "@/lib/exercises";
import { loadSeedExercises } from "@/lib/db";
import CopyModal from "@/components/CopyModal";
import SectionEditor from "@/components/SectionEditor";

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
  onRunThis?: (secs: Section[], title: string, dur: string, saveData: {
    nm: string; desc: string; d: string; secs: Section[]; tg: string[];
    src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean;
  }) => void;
}

function defaultSections(): Section[] {
  return [
    { id: undefined, name: "Warmup", label: "Warmup", color: G, qNotes: "", note: "", exercises: [] },
    { id: undefined, name: "The Thang", label: "The Thang", color: A, qNotes: "", note: "", exercises: [] },
    { id: undefined, name: "Mary", label: "Mary", color: P, qNotes: "", note: "", exercises: [] },
  ].map(s => normalizeSection(s as Record<string, unknown>));
}

export default function BuilderScreen({ onClose, onSave, editData, onUpdate, onRunThis }: BuilderScreenProps) {
  const [bT, setBT] = useState(editData?.nm || "");
  const [bD, setBD] = useState(editData?.desc || "");
  const [bDur, setBDur] = useState<string | null>(editData?.dur || null);
  const [bDiff, setBDiff] = useState<string | null>(editData?.d || null);
  const [bSites, setBSites] = useState<string[]>(editData?.sites || []);
  const [bEq, setBEq] = useState<string[]>(editData?.eq || []);
  const [secs, setSecs] = useState<Section[]>(() => {
    if (editData?.secs && editData.secs.length > 0) {
      return editData.secs.map(s => normalizeSection(s as unknown as Record<string, unknown>));
    }
    return defaultSections();
  });
  const [shareLib, setShareLib] = useState(editData?.isPublic || false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [allEx, setAllEx] = useState<ExerciseData[]>(EX);
  const [copyModal, setCopyModal] = useState(false);

  useEffect(() => {
    loadSeedExercises().then(rows => {
      if (rows.length > 0) {
        const mapped = rows.map(r => mapSupabaseExercise(r as Record<string, unknown>));
        setAllEx(mapped);
      }
    });
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


  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    const nm = bT.trim() || "Untitled";
    const tgs = buildTags();
    if (editData && onUpdate) {
      onUpdate(editData.id, { nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, dur: bDur, sites: bSites, eq: bEq });
    } else {
      onSave({ nm, desc: bD, d: bDiff || "medium", secs: JSON.parse(JSON.stringify(secs)), tg: tgs, src: "Manual", dur: bDur, sites: bSites, eq: bEq, share: shareLib });
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
      {/* Copy Modal */}
      {copyModal && <CopyModal secs={secs} beatdownName={bT || "Untitled"} beatdownDesc={bD} qName="The Bishop" onClose={() => setCopyModal(false)} onToast={fl} />}
      {toastEl}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid " + BD }}>
        <button onClick={onClose} style={{ fontFamily: F, color: T3, background: "none", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 600, padding: "8px 0" }}>
          {editData ? "← Locker" : "← Home"}
        </button>
        <button onClick={() => setCopyModal(true)} style={{ fontFamily: F, background: A + "26", border: "1px solid " + A + "4D", color: A, fontSize: 15, fontWeight: 700, padding: "10px 16px", borderRadius: 10, cursor: "pointer" }}>
          Copy for Slack
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
          onClick={() => {
            if (!shareLib) { if (confirm("Share to community? This can't be undone.")) setShareLib(true); }
            else { setShareLib(false); }
          }}
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

      {/* Beatdown details card */}
      <div style={{ background: CD, border: "1px solid " + BD, borderRadius: 14, padding: 14, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ color: T2, fontSize: 13, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: F }}>Beatdown details</div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: T4, fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: F }}>Duration</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["30 min", "45 min", "60 min"].map(d => {
              const sel = bDur === d;
              return (
                <button key={d} onClick={() => setBDur(sel ? null : d)} style={{ fontFamily: F, background: sel ? G + "26" : "rgba(255,255,255,0.04)", color: sel ? G : T2, border: "1px solid " + (sel ? G : "rgba(255,255,255,0.1)"), padding: "8px 14px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: sel ? 700 : 600 }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: T4, fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: F }}>Difficulty</div>
          <div style={{ display: "flex", gap: 6 }}>
            {DIFFS.map(d => {
              const sel = bDiff === d.id;
              return (
                <button key={d.id} onClick={() => setBDiff(sel ? null : d.id)} style={{ fontFamily: F, background: sel ? d.c + "26" : "rgba(255,255,255,0.04)", color: sel ? d.c : T2, border: "1px solid " + (sel ? d.c : "rgba(255,255,255,0.1)"), padding: "8px 14px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: sel ? 700 : 600 }}>
                  {d.l}
                </button>
              );
            })}
          </div>
        </div>

        {/* AO site + Equipment (collapsed style) */}
        <details style={{ marginTop: 4 }}>
          <summary style={{ color: T4, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F, listStyle: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: G }}>+</span> AO site · Equipment
            {(bSites.length > 0 || bEq.length > 0) && (
              <span style={{ color: G, fontSize: 11, fontWeight: 700 }}>({bSites.length + bEq.length} selected)</span>
            )}
          </summary>
          <div style={{ marginTop: 10 }}>
            <div style={{ color: T5, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: F }}>AO Site</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {SITES.map(sv => {
                const sel = bSites.includes(sv.id);
                return (
                  <button key={sv.id} onClick={() => setBSites(sel ? bSites.filter(x => x !== sv.id) : [...bSites, sv.id])} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: "1px solid " + (sel ? G + "30" : BD), padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>
                    {sv.l}
                  </button>
                );
              })}
            </div>
            <div style={{ color: T5, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: F }}>Equipment</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {EQUIP.map(e => {
                const sel = bEq.includes(e.id);
                return (
                  <button key={e.id} onClick={() => setBEq(sel ? bEq.filter(x => x !== e.id) : [...bEq, e.id])} style={{ fontFamily: F, background: sel ? P + "20" : "rgba(255,255,255,0.04)", color: sel ? P : T4, border: "1px solid " + (sel ? P + "30" : BD), padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>
                    {e.l}
                  </button>
                );
              })}
            </div>
          </div>
        </details>
      </div>

      {/* Section Editor — the new heart of the builder */}
      <SectionEditor
        sections={secs}
        onSectionsChange={setSecs}
        allEx={allEx}
      />

      {/* Save + Run This */}
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        <button
          disabled={saving}
          onClick={handleSave}
          style={{ fontFamily: F, width: "100%", padding: "20px 0", borderRadius: 14, fontSize: 18, fontWeight: 800, cursor: saving ? "default" : "pointer", background: saving ? "#1a1a1e" : G, color: saving ? T4 : BG, border: "none", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving..." : (editData ? "Save changes" : "Save to locker")}
        </button>
        {!editData && onRunThis && !saving && (
          <button
            onClick={handleRunThis}
            style={{ fontFamily: F, width: "100%", padding: "18px 0", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer", background: "transparent", border: "2px solid " + G, color: G }}
          >
            Run This →
          </button>
        )}
      </div>
    </div>
  );
}
