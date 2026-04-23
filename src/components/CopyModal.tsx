"use client";

import { useState, useEffect } from "react";
import type { Section, SectionExercise } from "@/lib/exercises";

const CD = "rgba(255,255,255,0.028)";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const BG = "#0E0E10";
const T1 = "#F0EDE8";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + BD, borderRadius: 10,
  color: "#D0C8BC", padding: "12px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: F,
};

interface CopyModalProps {
  secs: Section[];
  beatdownName?: string;
  beatdownDesc?: string;
  qName?: string;
  inspiredBy?: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function CopyModal({ secs, beatdownName, beatdownDesc, qName, inspiredBy, onClose, onToast }: CopyModalProps) {
  const [step, setStep] = useState<"bb">("bb");

  // ═══ TASK 2: Body scroll lock when modal is open ═══
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ═══ TASK 3: Auto-close after copy with delay ═══
  const handleCopy = (text: string, toastMsg: string) => {
    navigator.clipboard.writeText(text);
    onToast(toastMsg);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const [bb, setBb] = useState({
    ao: "F3 Essex",
    date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }),
    time: "5:15 AM",
    cond: "",
    q: qName || "Q",
    fngs: "",
    pax: "",
    cnt: "",
    cot: "",
    ann: "",
  });

  // ── Helpers for dual-format (old: n/r/c/nt/label/note, new: name/value/cadence/note/name/qNotes)
  const _sLabel = (s: Section) => (s as any).name || s.label || "Section";
  const _sNotes = (s: Section) => (s as any).qNotes || s.note || "";
  const _exName = (e: SectionExercise) => (e as any).name || e.n || "";
  const _exNote = (e: SectionExercise) => (e as any).note || e.nt || "";
  const _exReps = (e: SectionExercise): string => {
    const ex = e as any;
    if (ex.mode === "time") return ex.value + " " + ex.unit;
    if (ex.mode === "distance") return ex.value + " " + ex.unit;
    if (ex.mode === "reps" && ex.value !== undefined && ex.value !== "") return String(ex.value);
    return e.r || "";
  };
  const _exCad = (e: SectionExercise): string => {
    const ex = e as any;
    const cad = ex.cadence || e.c || "";
    if (ex.mode === "time" || ex.mode === "distance") return "";
    return cad;
  };

  // ═══ Build exercise-only text (for Copy Exercise Only button) ═══
  let exOnlyText = "";
  if (beatdownName) exOnlyText += beatdownName + "\n";
  if (beatdownName) exOnlyText += "Q: " + (qName || "Q") + "\n";
  if (inspiredBy) exOnlyText += "Inspired by: " + inspiredBy + "\n";
  secs.forEach(s => {
    exOnlyText += "\n── " + _sLabel(s) + " ──\n\n";
    if (_sNotes(s)) exOnlyText += _sNotes(s).split("\n").map((ln: string) => "> " + ln).join("\n") + "\n\n";
    s.exercises.forEach(e => {
      if (e.type === "transition") {
        exOnlyText += "↗ " + _exName(e) + "\n";
      } else {
        const reps = _exReps(e);
        const cad = _exCad(e);
        exOnlyText += (reps ? reps + " " : "") + _exName(e) + (cad ? " " + cad : "") + "\n";
        if (_exNote(e)) exOnlyText += "  > " + _exNote(e) + "\n";
      }
    });
  });
  exOnlyText += "\nBuilt with GloomBuilder · gloombuilder.app";

  // ════ FULL BACKBLAST ════
  let bbText = "";
  if (beatdownName) bbText += beatdownName + "\n";
  bbText += "\nAO: " + bb.ao + "\nDate: " + bb.date + "\n";
  if (bb.time) bbText += "Time: " + bb.time + "\n";
  if (bb.cond) bbText += "Conditions: " + bb.cond + "\n";
  bbText += "Q: " + bb.q + "\n";
  if (inspiredBy) bbText += "Inspired by: " + inspiredBy + "\n";
  if (bb.fngs) bbText += "FNGs: " + bb.fngs + "\n";
  if (bb.pax) bbText += "PAX: " + bb.pax + "\n";
  if (bb.cnt) bbText += "Total PAX: " + bb.cnt + "\n";
  bbText += "\nWorkout:\n";
  secs.forEach(s => {
    bbText += "\n── " + _sLabel(s) + " ──\n\n";
    if (_sNotes(s)) bbText += _sNotes(s).split("\n").map((ln: string) => "> " + ln).join("\n") + "\n\n";
    s.exercises.forEach(e => {
      if (e.type === "transition") {
        bbText += "↗ " + _exName(e) + "\n";
      } else {
        const reps = _exReps(e);
        const cad = _exCad(e);
        bbText += (reps ? reps + " " : "") + _exName(e) + (cad ? " " + cad : "") + "\n";
        if (_exNote(e)) bbText += "  > " + _exNote(e) + "\n";
      }
    });
  });
  if (bb.cot) bbText += "\nCOT:\n" + bb.cot + "\n";
  if (bb.ann) bbText += "\nAnnouncements:\n" + bb.ann + "\n";
  bbText += "\nBuilt with GloomBuilder · gloombuilder.app";

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, zIndex: 200, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + BD }}>
        <div style={{ width: 40 }} />
        <div style={{ fontFamily: F, fontSize: 18, fontWeight: 800, color: A }}>Backblast</div>
        <span onClick={onClose} style={{ color: T4, cursor: "pointer", fontSize: 20 }}>✕</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 120px" }}>
        {/* AO */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>AO</label>
            <input value={bb.ao} onChange={e => setBb({ ...bb, ao: e.target.value })} style={ist} />
          </div>
        </div>
        {/* Date + Time */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Date</label>
            <input value={bb.date} onChange={e => setBb({ ...bb, date: e.target.value })} style={ist} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Time</label>
            <input value={bb.time} onChange={e => setBb({ ...bb, time: e.target.value })} style={ist} />
          </div>
        </div>
        {/* Conditions */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Conditions</label>
          <input value={bb.cond} onChange={e => setBb({ ...bb, cond: e.target.value })} placeholder="Clear, 52 degrees" style={ist} />
        </div>
        {/* Q + FNGs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Q</label>
            <input value={bb.q} onChange={e => setBb({ ...bb, q: e.target.value })} style={ist} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>FNGs</label>
            <input value={bb.fngs} onChange={e => setBb({ ...bb, fngs: e.target.value })} placeholder="None" style={ist} />
          </div>
        </div>
        {/* PAX */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>PAX (one per line)</label>
          <textarea value={bb.pax} onChange={e => setBb({ ...bb, pax: e.target.value })} rows={3} placeholder="Fall Guy, Tanker, T.I." style={{ ...ist, resize: "vertical" as const }} />
        </div>
        {/* Total PAX */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Total PAX</label>
            <input value={bb.cnt} onChange={e => setBb({ ...bb, cnt: e.target.value })} style={ist} />
          </div>
          <div style={{ flex: 1 }} />
        </div>
        {/* COT Message */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>COT Message</label>
          <textarea value={bb.cot} onChange={e => setBb({ ...bb, cot: e.target.value })} rows={3} placeholder="Closing thought, prayer, or challenge for the PAX..." style={{ ...ist, resize: "vertical" as const }} />
        </div>
        {/* Announcements */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F, color: T5, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 4, fontWeight: 600 }}>Announcements</label>
          <textarea value={bb.ann} onChange={e => setBb({ ...bb, ann: e.target.value })} rows={2} placeholder="Convergence, coffeeteria, etc." style={{ ...ist, resize: "vertical" as const }} />
        </div>
        {/* Preview */}
        <div style={{ borderTop: "1px solid " + BD, marginTop: 20, paddingTop: 20 }}>
          <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>Preview</div>
          <div style={{ fontFamily: F, fontSize: 13, color: T5, marginBottom: 14 }}>Clean text — works in any app</div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + BD, borderRadius: 14, padding: "16px 18px", fontFamily: "monospace", fontSize: 12, color: T3, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{bbText}</div>
          <button onClick={() => handleCopy(bbText, "Full backblast copied!")} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none", marginTop: 16 }}>Copy Full Backblast</button>
          <button onClick={() => handleCopy(exOnlyText, "Exercises copied!")} style={{ fontFamily: F, width: "100%", padding: "14px 0", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: T3, border: "1px solid " + BD, marginTop: 10 }}>Copy Exercise Only</button>
          <div style={{ textAlign: "center", marginTop: 10, fontFamily: F, fontSize: 13, color: T5 }}>Paste into #backblasts or any chat</div>
        </div>
      </div>
    </div>
  );
}
