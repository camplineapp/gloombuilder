"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getProfileById,
  getProfileStats,
  getUserSharedBeatdowns,
  getUserSharedExercises,
  getMyAllBeatdowns,
  getMyAllExercises,
  type ProfileStats,
} from "@/lib/db";
import ThumbsUpIcon from "@/components/ThumbsUpIcon";
import { AVATAR_COLORS } from "@/lib/avatars";
import Avatar from "@/components/Avatar";

// Design tokens (matches Bible v14 + existing screens)
const BG = "#0E0E10";
const CARD_BG = "#111114";
const EX_BG = "#1a1a1f";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const R = "#ef4444";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const GOLD = "#E8A820";
const F = "'Outfit', system-ui, sans-serif";

// Difficulty pill colors per Bible v14
function difficultyColor(d: string): { bg: string; fg: string; border: string; label: string } {
  const norm = (d || "medium").toLowerCase();
  if (norm === "easy" || norm === "warm-up") return { bg: G + "1a", fg: G, border: G + "40", label: "EASY" };
  if (norm === "medium") return { bg: A + "1a", fg: A, border: A + "40", label: "MEDIUM" };
  if (norm === "hard") return { bg: R + "1a", fg: R, border: R + "40", label: "HARD" };
  if (norm === "beast") return { bg: "#dc262620", fg: "#dc2626", border: "#dc262640", label: "BEAST" };
  return { bg: A + "1a", fg: A, border: A + "40", label: norm.toUpperCase() };
}

interface QProfileScreenProps {
  userId: string;
  currentUserId: string;
  onClose: () => void;
  onOpenSettings?: () => void;
  // V2-4: tap a beatdown card → open it elsewhere (edit form for own, detail sheet for visitor)
  onOpenBeatdownDetail?: (beatdownId: string, rawRow?: Record<string, unknown>) => void;
  // Item 5B: tap an exercise card → open in edit mode
  onOpenExerciseDetail?: (exerciseId: string) => void;
  refreshKey?: number;
}

interface ProfileData {
  id: string;
  f3_name: string;
  ao: string;
  state: string;
  region: string;
}

interface BeatdownRow {
  id: string;
  name: string;
  difficulty: string;
  description: string;
  duration: number | null;
  vote_count: number | null;
  steal_count: number | null;
  comment_count: number | null;
  created_at: string;
  generated: boolean;
  is_public: boolean;
  tags: string[] | null;
  inspired_profile: { f3_name: string } | null;
  from_notepad?: boolean;
}

interface ExerciseRow {
  id: string;
  name: string;
  description: string;
  how_to: string;
  vote_count: number | null;
  created_at: string;
  source: "seed" | "community" | "private";
  body_part: string[] | null;
  inspired_profile: { f3_name: string } | null;
}

export default function QProfileScreen({
  userId,
  currentUserId,
  onClose,
  onOpenSettings,
  onOpenBeatdownDetail,
  onOpenExerciseDetail,
  refreshKey,
}: QProfileScreenProps) {
  const isOwn = userId === currentUserId;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [beatdowns, setBeatdowns] = useState<BeatdownRow[]>([]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [tab, setTab] = useState<"beatdowns" | "exercises">("beatdowns");
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, s, bds, exs] = await Promise.all([
      getProfileById(userId),
      getProfileStats(userId),
      isOwn ? getMyAllBeatdowns(userId) : getUserSharedBeatdowns(userId),
      isOwn ? getMyAllExercises(userId) : getUserSharedExercises(userId),
    ]);
    setProfile(p as ProfileData | null);
    setStats(s);
    setBeatdowns(bds as BeatdownRow[]);
    setExercises(exs as ExerciseRow[]);
    setLoading(false);
  }, [userId, isOwn, refreshKey]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);


  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: F,
        color: T4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
      }}>
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: F,
        color: T1,
        padding: "20px 18px",
      }}>
        <button onClick={onClose} style={{
          background: "transparent",
          border: "none",
          color: T2,
          fontFamily: F,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          padding: "4px 0",
          marginBottom: 24,
        }}>← Back</button>
        <div style={{ textAlign: "center", color: T4, fontSize: 14, marginTop: 60 }}>
          Profile not found.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: F,
      color: T1,
      padding: "16px 18px 0",
    }}>
      {/* Top bar: Back + (own only) Settings gear */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}>
        <button onClick={onClose} style={{
          background: "transparent",
          border: "none",
          color: T2,
          fontFamily: F,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          padding: "4px 0",
        }}>← Back</button>
        {isOwn && onOpenSettings && (
          <button onClick={onOpenSettings} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid " + BD,
            borderRadius: 10,
            color: T2,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>⚙</span>
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* Identity block */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Avatar
            userId={profile.id}
            name={profile.f3_name || ""}
            size={92}
            isOwn={isOwn}
          />
        </div>
        <div style={{
          fontSize: 26,
          fontWeight: 800,
          color: T1,
          letterSpacing: -0.5,
          marginTop: 14,
          marginBottom: 4,
        }}>{profile.f3_name || "Anonymous"}</div>
        <div style={{ fontSize: 13, color: T4 }}>
          {[profile.ao, profile.state, profile.region].filter(Boolean).join(" · ") || "—"}
        </div>
      </div>


      {/* 4-stat strip */}
      {stats && (
        <div style={{
          display: "flex",
          background: CARD_BG,
          border: `1px solid ${BD}`,
          borderRadius: 14,
          padding: "14px 4px",
          marginBottom: 18,
        }}>
          <Stat label="Beatdowns" value={stats.beatdowns} />
          <Sep />
          <Stat label="Upvotes" value={stats.upvotes} />
          <Sep />
          <Stat label="Steals" value={stats.steals} accent={G} />
        </div>
      )}

      {/* STICKY: body-of-work label + tab toggle */}
      <div style={{
        position: "sticky" as const,
        top: 0,
        zIndex: 10,
        background: BG,
        marginLeft: -18,
        marginRight: -18,
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: 8,
      }}>
        {/* Body of work header */}
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: T5,
          textTransform: "uppercase",
          letterSpacing: 1.3,
          marginBottom: 10,
        }}>{isOwn ? "Your body of work" : "Body of work"}</div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          background: CARD_BG,
          border: `1px solid ${BD}`,
          borderRadius: 11,
          padding: 4,
          marginBottom: 14,
        }}>
          <TabBtn
            label="Beatdowns"
            count={beatdowns.length}
            active={tab === "beatdowns"}
            onClick={() => setTab("beatdowns")}
          />
          <TabBtn
            label="Exercises"
            count={exercises.length}
            active={tab === "exercises"}
            onClick={() => setTab("exercises")}
          />
        </div>
      </div>

      {/* Tab content */}
      <div style={{ marginBottom: 24 }}>
        {tab === "beatdowns" && (
          beatdowns.length === 0 ? (
            <EmptyState isOwn={isOwn} type="beatdowns" />
          ) : (
            beatdowns.map((bd) => (
              <BeatdownCard
                key={bd.id}
                bd={bd}
                onTap={onOpenBeatdownDetail ? () => onOpenBeatdownDetail(bd.id, bd as unknown as Record<string, unknown>) : undefined}
              />
            ))
          )
        )}
        {tab === "exercises" && (
          exercises.length === 0 ? (
            <EmptyState isOwn={isOwn} type="exercises" />
          ) : (
            exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                onTap={onOpenExerciseDetail ? () => onOpenExerciseDetail(ex.id) : undefined}
              />
            ))
          )
        )}
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

// ─── Subcomponents ───

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{
        fontSize: 20,
        fontWeight: 800,
        color: accent || T1,
        letterSpacing: -0.5,
        lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: T5,
        textTransform: "uppercase",
        letterSpacing: 1.1,
        marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

function Sep() {
  return <div style={{ width: 1, background: BD, margin: "4px 0" }} />;
}

function TabBtn({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? `${G}20` : "transparent",
        border: "none",
        color: active ? G : T4,
        fontFamily: F,
        fontSize: 14,
        fontWeight: 800,
        padding: "10px 0",
        borderRadius: 8,
        cursor: "pointer",
        letterSpacing: 0.2,
      }}>
      {label} <span style={{ opacity: 0.65, fontSize: 12, fontWeight: 700 }}>· {count}</span>
    </button>
  );
}

// Beatdown card — V2-Round-4: status stripe + source pill + asymmetric footer
function BeatdownCard({ bd, onTap }: { bd: BeatdownRow; onTap?: () => void }) {
  const votes = bd.vote_count || 0;
  const steals = bd.steal_count || 0;
  const comments = bd.comment_count || 0;
  const date = new Date(bd.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  const stripeColor = bd.is_public ? G : "#3a3a40";
  const sourcePill = bd.generated
    ? { label: "GloomBuilder", color: G, bg: G + "15", border: "1px solid " + G + "30" }
    : { label: "Hand Built", color: GOLD, bg: GOLD + "18", border: "1px solid " + GOLD + "40" };

  return (
    <div
      onClick={onTap}
      style={{
        background: CARD_BG,
        border: `1px solid ${BD}`,
        borderLeft: `3px solid ${stripeColor}`,
        borderRadius: 12,
        padding: "13px 15px",
        marginBottom: 10,
        cursor: onTap ? "pointer" : "default",
      }}
    >
      {/* Title + source pill */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 17,
          fontWeight: 800,
          color: T1,
          letterSpacing: -0.3,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{bd.name}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          color: sourcePill.color,
          background: sourcePill.bg,
          border: sourcePill.border,
          padding: "3px 8px",
          borderRadius: 6,
          flexShrink: 0,
        }}>{sourcePill.label}</span>
        {bd.from_notepad && (
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: G,
            background: G + "15",
            border: "1px solid " + G + "30",
            padding: "3px 8px",
            borderRadius: 6,
            flexShrink: 0,
            whiteSpace: "nowrap" as const,
          }}>↻ from Notepad</span>
        )}
      </div>

      {/* Description (single-line ellipsis) */}
      {bd.description && (
        <div style={{
          fontSize: 12,
          color: T4,
          fontWeight: 500,
          lineHeight: 1.4,
          marginBottom: 8,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{bd.description}</div>
      )}

      {/* Footer — asymmetric by is_public */}
      {bd.is_public ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 12,
          color: T4,
          fontWeight: 600,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            👍 <span style={{ color: T1 }}>{votes}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            ↻ <span style={{ color: T1 }}>{steals}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            💬 <span style={{ color: T1 }}>{comments}</span>
          </span>
          <span style={{ marginLeft: "auto", color: T4 }}>{date}</span>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: T4, fontWeight: 500 }}>
          Draft · {date}
        </div>
      )}

      {/* Inspired-by quiet line */}
      {bd.inspired_profile?.f3_name && (
        <div style={{
          fontSize: 11,
          fontStyle: "italic",
          color: T5,
          fontWeight: 500,
          marginTop: 4,
          lineHeight: 1.4,
        }}>
          inspired by {bd.inspired_profile.f3_name}
        </div>
      )}
    </div>
  );
}

// Exercise card — V2-Round-4: status stripe + asymmetric footer
function ExerciseCard({ ex, onTap }: { ex: ExerciseRow; onTap?: () => void }) {
  const votes = ex.vote_count || 0;
  const date = new Date(ex.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  const isShared = ex.source === "community";
  const stripeColor = isShared ? G : "#3a3a40";
  const description = ex.description || ex.how_to;

  return (
    <div
      onClick={onTap}
      style={{
        background: CARD_BG,
        border: `1px solid ${BD}`,
        borderLeft: `3px solid ${stripeColor}`,
        borderRadius: 12,
        padding: "13px 15px",
        marginBottom: 10,
        cursor: onTap ? "pointer" : "default",
      }}
    >
      {/* Title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 17,
          fontWeight: 800,
          color: T1,
          letterSpacing: -0.3,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{ex.name}</span>
      </div>

      {/* Description (single-line ellipsis) */}
      {description && (
        <div style={{
          fontSize: 12,
          color: T4,
          fontWeight: 500,
          lineHeight: 1.4,
          marginBottom: 8,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{description}</div>
      )}

      {/* Footer — asymmetric by source */}
      {isShared ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 12,
          color: T4,
          fontWeight: 600,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <ThumbsUpIcon size={13} filled />
            <span style={{ color: T1 }}>{votes}</span>
          </span>
          <span style={{ marginLeft: "auto", color: T4 }}>{date}</span>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: T4, fontWeight: 500 }}>
          Draft · {date}
        </div>
      )}

      {/* Inspired-by quiet line */}
      {ex.inspired_profile?.f3_name && (
        <div style={{
          fontSize: 11,
          fontStyle: "italic",
          color: T5,
          fontWeight: 500,
          marginTop: 4,
          lineHeight: 1.4,
        }}>
          inspired by {ex.inspired_profile.f3_name}
        </div>
      )}
    </div>
  );
}

// Empty state — motivating CTA for own view, neutral for visitor
function EmptyState({ isOwn, type }: { isOwn: boolean; type: "beatdowns" | "exercises" }) {
  const noun = type === "beatdowns" ? "beatdown" : "exercise";
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BD}`,
      borderRadius: 14,
      padding: "32px 24px",
      textAlign: "center",
    }}>
      {isOwn ? (
        <>
          <div style={{
            fontSize: 14,
            color: T2,
            fontWeight: 700,
            marginBottom: 6,
            letterSpacing: -0.2,
          }}>
            Your shared {noun}s will live here
          </div>
          <div style={{
            fontSize: 12,
            color: T5,
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            Build a {noun} and share it to start your portfolio.
          </div>
        </>
      ) : (
        <div style={{
          fontSize: 13,
          color: T4,
          fontWeight: 500,
        }}>
          No shared {noun}s yet.
        </div>
      )}
    </div>
  );
}
