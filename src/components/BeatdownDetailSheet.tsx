"use client";

import { useState, useEffect } from "react";
import { addComment, loadComments, deleteComment, updateComment } from "@/lib/db";
import type { ExerciseData } from "@/lib/exercises";
import ThumbsUpIcon from "@/components/ThumbsUpIcon";
import Avatar from "@/components/Avatar";

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

export interface Comment { au: string; ao: string; txt: string; dt: string }
export interface Exercise { n: string; r: string; c: string; nt: string }
export interface Section { label: string; color: string; exercises: Exercise[]; note: string }
export interface FeedItem {
  id: number | string; src: string; nm: string; au: string; auId?: string; auAvatarUrl?: string | null; ao: string; reg: string;
  d: string; dur: string | null; aoT: string[]; eq?: string[]; v: number; u: number; cm: number;
  ds: string; dt: string; createdAt?: string; tp: string; tg?: string[]; et?: string[];
  howTo?: string; inspiredBy?: string; comments: Comment[]; secs?: Section[];
}

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

interface BeatdownDetailSheetProps {
  item: FeedItem;
  onClose: () => void;
  backLabel: string;
  seedEx: ExerciseData[];
  onOpenExerciseDetail?: (ex: ExerciseData) => void;
  userVotes?: Set<string>;
  onToggleVote?: (id: string, itemType?: "beatdown" | "exercise") => void;
  onSteal?: (id: string, itemType: "beatdown" | "exercise") => void;
  onOpenProfile?: (userId: string | null) => void;
  onRefresh?: () => void;
  profName?: string;
  currentUserId?: string;
  currentAvatarUrl?: string | null;
  onToast?: (msg: string) => void;
}

export default function BeatdownDetailSheet({
  item,
  onClose,
  backLabel,
  seedEx,
  onOpenExerciseDetail,
  userVotes = new Set(),
  onToggleVote,
  onSteal,
  onOpenProfile,
  onRefresh,
  profName = "",
  currentUserId,
  currentAvatarUrl,
  onToast,
}: BeatdownDetailSheetProps) {
  const [dbComments, setDbComments] = useState<{ id: string; auId?: string; auAvatarUrl?: string | null; au: string; ao: string; txt: string; dt: string }[]>([]);
  const [cmtLoading, setCmtLoading] = useState(false);
  const [cmtText, setCmtText] = useState("");
  const [editCmtId, setEditCmtId] = useState<string | null>(null);
  const [editCmtText, setEditCmtText] = useState("");
  const [showAllCmt, setShowAllCmt] = useState(false);
  const [localToast, setLocalToast] = useState("");

  // Load comments when item changes
  useEffect(() => {
    setCmtLoading(true);
    loadComments(String(item.id)).then(rows => {
      const mapped = rows.map((r: Record<string, unknown>) => {
        const p = r.profiles as Record<string, unknown> | null;
        return {
          id: (r.id as string) || "",
          auId: (r.user_id as string) || undefined,
          auAvatarUrl: (p?.avatar_url as string | null | undefined) ?? undefined,
          au: (p?.f3_name as string) || "Unknown",
          ao: ((p?.ao as string) || "") + ((p?.state as string) ? ", " + (p?.state as string) : ""),
          txt: (r.text as string) || "",
          dt: new Date(r.created_at as string).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        };
      });
      setDbComments(mapped);
      setCmtLoading(false);
    });
  }, [item.id]);

  const fl = (msg: string) => {
    if (onToast) {
      onToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(""), 2200);
    }
  };

  const toastEl = localToast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 100 }}>{localToast}</div>
  ) : null;

  const handleAuthorTap = (e: React.MouseEvent, authorId: string | undefined) => {
    e.stopPropagation();
    if (!authorId || !onOpenProfile) return;
    if (authorId === currentUserId) {
      onOpenProfile(null);
    } else {
      onOpenProfile(authorId);
    }
  };

  const bd = item;
  const isOwn = !!currentUserId && item.auId === currentUserId;
  const voted = userVotes.has(String(bd.id));
  const comments = dbComments;
  const shownComments = showAllCmt ? comments : comments.slice(0, 3);

  return (
    <div style={{ padding: "0 24px" }}>
      <button onClick={onClose} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>{backLabel}</button>
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
                  <div key={ei} onClick={() => { if (foundEx && onOpenExerciseDetail) onOpenExerciseDetail(foundEx); }} style={{ background: "#1a1a1f", borderRadius: 14, padding: "13px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10, cursor: foundEx ? "pointer" : "default" }}>
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
                      <button onClick={e => { e.stopPropagation(); if (onOpenExerciseDetail) onOpenExerciseDetail(foundEx); }} style={{ width: 28, height: 28, borderRadius: 8, background: P + "15", border: "1px solid " + P + "30", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: P, fontSize: 14, fontWeight: 700, fontFamily: F }}>?</button>
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
        {shownComments.map((c, i) => {
          const isOwnComment = !!currentUserId && c.auId === currentUserId;
          const isLast = i === shownComments.length - 1;
          return (
            <div key={c.id || i} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: isLast ? "none" : "0.5px solid rgba(255,255,255,0.07)" }}>
              <Avatar userId={c.auId || c.au} name={c.au} size={36} isOwn={isOwnComment} avatarUrl={c.auAvatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T2 }}>{c.au}</span>
                    {c.ao ? <span style={{ fontSize: 13, color: T4 }}>· {c.ao}</span> : null}
                    <span style={{ fontSize: 12, color: T5 }}>· {c.dt}</span>
                  </div>
                  {c.au === profName && editCmtId !== c.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span onClick={() => { setEditCmtId(c.id); setEditCmtText(c.txt); }} style={{ fontSize: 11, color: T4, cursor: "pointer" }}>Edit</span>
                      <span onClick={async () => {
                        const success = await deleteComment(c.id);
                        if (success) {
                          setDbComments(dbComments.filter(cm => cm.id !== c.id));
                          fl("Comment deleted");
                          onRefresh?.();
                        }
                      }} style={{ fontSize: 11, color: R, cursor: "pointer" }}>Delete</span>
                    </div>
                  ) : null}
                </div>
                {editCmtId === c.id ? (
                  <div style={{ marginTop: 6 }}>
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
                  <div style={{ fontSize: 15, color: T3, marginTop: 4, lineHeight: 1.55, wordBreak: "break-word", overflowWrap: "break-word" }}>{c.txt}</div>
                )}
              </div>
            </div>
          );
        })}
        {cmtLoading ? <div style={{ textAlign: "center", color: T5, padding: 16, fontSize: 13 }}>Loading comments...</div> : null}
        {!cmtLoading && comments.length === 0 ? <div style={{ textAlign: "center", color: T6, padding: 16, fontSize: 13 }}>No comments yet. Be the first.</div> : null}
        {(() => {
          return (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingTop: 16, marginTop: 8, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
              <Avatar userId={currentUserId || profName || "?"} name={profName} size={36} isOwn={true} avatarUrl={currentAvatarUrl} />
              <div style={{ flex: 1, display: "flex", gap: 8, minWidth: 0 }}>
                <input value={cmtText} onChange={e => setCmtText(e.target.value)} placeholder="Add a comment..." style={{ ...ist, flex: 1 }} />
                <button onClick={async () => {
                  if (!cmtText.trim()) return;
                  const itemType = bd.tp === "exercise" ? "exercise" : "beatdown";
                  const result = await addComment(String(bd.id), itemType as "beatdown" | "exercise", cmtText);
                  if (result) {
                    const p = result.profiles as Record<string, unknown> | null;
                    setDbComments([{
                      id: (result.id as string) || "",
                      auId: currentUserId,
                      auAvatarUrl: (p?.avatar_url as string | null | undefined) ?? undefined,
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
          );
        })()}
      </div>
      {!isOwn && (
        <div style={{ marginTop: 24 }}>
          <button onClick={() => { onSteal?.(String(bd.id), bd.tp as "beatdown" | "exercise"); }} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Steal</button>
        </div>
      )}
      {toastEl}
    </div>
  );
}
