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

// Avatar palette for OTHER HIMs (own profile is always green for brand consistency)
const AVATAR_COLORS = ["#f59e0b", "#a78bfa", "#3b82f6", "#06b6d4", "#E8A820"];

function colorForUserId(id: string, isOwn: boolean): string {
  if (isOwn) return G;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => (w[0] || "").toUpperCase())
    .join("")
    .slice(0, 2);
}

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
  // V2-4: tap a beatdown card → open it elsewhere (Library detail)
  onOpenBeatdownDetail?: (beatdownId: string) => void;
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
  created_at: string;
  generated: boolean;
  is_public: boolean;
  tags: string[] | null;
  inspired_profile: { f3_name: string } | null;
}

interface ExerciseRow {
  id: string;
  name: string;
  description: string;
  how_to: string;
  vote_count: number | null;
  created_at: string;
  is_public: boolean;
  body_part: string[] | null;
  inspired_profile: { f3_name: string } | null;
}

export default function QProfileScreen({
  userId,
  currentUserId,
  onClose,
  onOpenSettings,
  onOpenBeatdownDetail,
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

  const avatarColor = colorForUserId(profile.id, isOwn);
  const initials = getInitials(profile.f3_name);

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
            background: "transparent",
            border: "none",
            color: T3,
            fontSize: 22,
            cursor: "pointer",
            padding: "4px 8px",
          }}>⚙</button>
        )}
      </div>

      {/* Identity block */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{
          width: 92,
          height: 92,
          borderRadius: "50%",
          background: `${avatarColor}1f`,
          border: `2px solid ${avatarColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          fontSize: 32,
          fontWeight: 800,
          color: avatarColor,
          letterSpacing: -0.5,
        }}>{initials || "?"}</div>
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
          count={stats?.beatdowns ?? 0}
          active={tab === "beatdowns"}
          onClick={() => setTab("beatdowns")}
        />
        <TabBtn
          label="Exercises"
          count={stats?.exercises ?? 0}
          active={tab === "exercises"}
          onClick={() => setTab("exercises")}
        />
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
                isOwn={isOwn}
                onTap={onOpenBeatdownDetail ? () => onOpenBeatdownDetail(bd.id) : undefined}
              />
            ))
          )
        )}
        {tab === "exercises" && (
          exercises.length === 0 ? (
            <EmptyState isOwn={isOwn} type="exercises" />
          ) : (
            exercises.map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} isOwn={isOwn} />
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

// Beatdown card — light inline metadata, V2-4: tappable when onTap is provided
function BeatdownCard({ bd, isOwn, onTap }: { bd: BeatdownRow; isOwn: boolean; onTap?: () => void }) {
  const diff = difficultyColor(bd.difficulty);
  const votes = bd.vote_count || 0;
  const steals = bd.steal_count || 0;
  const date = new Date(bd.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

  return (
    <div
      onClick={onTap}
      style={{
        background: CARD_BG,
        border: `1px solid ${BD}`,
        borderLeft: `3px solid ${A}`,
        borderRadius: 12,
        padding: "13px 15px",
        marginBottom: 10,
        cursor: onTap ? "pointer" : "default",
        transition: "background 0.15s ease",
      }}
    >
      {/* Title + difficulty pill */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 17,
          fontWeight: 800,
          color: T1,
          letterSpacing: -0.3,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{bd.name}</div>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          color: diff.fg,
          background: diff.bg,
          border: `1px solid ${diff.border}`,
          padding: "3px 8px",
          borderRadius: 6,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}>{diff.label}</span>
      </div>

      {/* Description (2-line clamp) */}
      {bd.description && (
        <div style={{
          fontSize: 13,
          color: T3,
          lineHeight: 1.45,
          marginBottom: 10,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>{bd.description}</div>
      )}

      {/* Light inline metadata — Strava/LinkedIn style */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 12,
        color: T4,
        fontWeight: 600,
        flexWrap: "wrap",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <ThumbsUpIcon size={13} filled />
          <span>{votes}</span>
        </span>
        {steals > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span>{steals} {steals === 1 ? "steal" : "steals"}</span>
          </span>
        )}
        {bd.duration && (
          <span>{bd.duration} min</span>
        )}
        <span>{date}</span>
        {isOwn && (
          bd.is_public ? (
            <span style={{
              fontSize: 10,
              color: G,
              background: `14`,
              padding: `2px 7px`,
              borderRadius: 4,
              letterSpacing: 0.5,
              fontWeight: 800,
              textTransform: `uppercase`,
              border: `1px solid 40`,
            }}>SHARED</span>
          ) : (
            <span style={{
              fontSize: 10,
              color: T5,
              background: `rgba(255,255,255,0.04)`,
              padding: `2px 7px`,
              borderRadius: 4,
              letterSpacing: 0.5,
              fontWeight: 700,
              textTransform: `uppercase`,
              border: `1px solid `,
            }}>DRAFT</span>
          )
        )}
        {bd.generated && (
          <span style={{
            fontSize: 10,
            color: T5,
            background: "rgba(255,255,255,0.04)",
            padding: "2px 7px",
            borderRadius: 4,
            letterSpacing: 0.5,
            fontWeight: 700,
            textTransform: "uppercase",
            border: `1px solid ${BD}`,
          }}>AI</span>
        )}
        {!bd.generated && (
          <span style={{
            fontSize: 10,
            color: GOLD,
            background: `${GOLD}14`,
            padding: "2px 7px",
            borderRadius: 4,
            letterSpacing: 0.5,
            fontWeight: 700,
            textTransform: "uppercase",
            border: `1px solid ${GOLD}40`,
          }}>HAND BUILT</span>
        )}
        {bd.inspired_profile && (
          <span style={{ color: T5, fontStyle: "italic" }}>
            inspired by {bd.inspired_profile.f3_name}
          </span>
        )}
      </div>
    </div>
  );
}

// Exercise card — same pattern, slightly different content
function ExerciseCard({ ex, isOwn }: { ex: ExerciseRow; isOwn: boolean }) {
  const votes = ex.vote_count || 0;
  const date = new Date(ex.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  const bodyParts = (ex.body_part || []).slice(0, 3);

  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BD}`,
      borderLeft: `3px solid #a78bfa`,
      borderRadius: 12,
      padding: "13px 15px",
      marginBottom: 10,
    }}>
      <div style={{
        fontSize: 17,
        fontWeight: 800,
        color: T1,
        letterSpacing: -0.3,
        marginBottom: 6,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>{ex.name}</div>

      {(ex.description || ex.how_to) && (
        <div style={{
          fontSize: 13,
          color: T3,
          lineHeight: 1.45,
          marginBottom: 10,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>{ex.description || ex.how_to}</div>
      )}

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 12,
        color: T4,
        fontWeight: 600,
        flexWrap: "wrap",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <ThumbsUpIcon size={13} filled />
          <span>{votes}</span>
        </span>
        <span>{date}</span>
        {isOwn && (
          ex.is_public ? (
            <span style={{
              fontSize: 10,
              color: G,
              background: `14`,
              padding: `2px 7px`,
              borderRadius: 4,
              letterSpacing: 0.5,
              fontWeight: 800,
              textTransform: `uppercase`,
              border: `1px solid 40`,
            }}>SHARED</span>
          ) : (
            <span style={{
              fontSize: 10,
              color: T5,
              background: `rgba(255,255,255,0.04)`,
              padding: `2px 7px`,
              borderRadius: 4,
              letterSpacing: 0.5,
              fontWeight: 700,
              textTransform: `uppercase`,
              border: `1px solid `,
            }}>DRAFT</span>
          )
        )}
        {bodyParts.length > 0 && (
          <span style={{ color: T5 }}>
            {bodyParts.map(bp => bp.charAt(0).toUpperCase() + bp.slice(1)).join(" · ")}
          </span>
        )}
        {ex.inspired_profile && (
          <span style={{ color: T5, fontStyle: "italic" }}>
            inspired by {ex.inspired_profile.f3_name}
          </span>
        )}
      </div>
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
