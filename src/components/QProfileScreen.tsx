"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getProfileById,
  getProfileStats,
  isFollowing,
  followUser,
  unfollowUser,
  type ProfileStats,
} from "@/lib/db";

// Design tokens (matches Bible v14 + existing screens)
const BG = "#0E0E10";
const CARD_BG = "#111114";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

// Avatar color palette for OTHER HIMs (own profile is always green for brand consistency)
// Trimmed to 5 brand-aligned colors — pink/red removed, deeper warmer tones kept
const AVATAR_COLORS = ["#f59e0b", "#a78bfa", "#3b82f6", "#06b6d4", "#E8A820"];

function colorForUserId(id: string, isOwn: boolean): string {
  // Own profile: always green (matches Home avatar)
  if (isOwn) return G;
  // Others: deterministic hash-based color from the brand-aligned palette
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

interface QProfileScreenProps {
  userId: string;             // which Q's profile to show
  currentUserId: string;      // the logged-in user (for self-vs-visitor logic)
  onClose: () => void;
  onOpenSettings?: () => void; // only used in self view
}

interface ProfileData {
  id: string;
  f3_name: string;
  ao: string;
  state: string;
  region: string;
}

export default function QProfileScreen({
  userId,
  currentUserId,
  onClose,
  onOpenSettings,
}: QProfileScreenProps) {
  const isOwn = userId === currentUserId;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [tab, setTab] = useState<"beatdowns" | "exercises">("beatdowns");
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, s, f] = await Promise.all([
      getProfileById(userId),
      getProfileStats(userId),
      isOwn ? Promise.resolve(false) : isFollowing(userId),
    ]);
    setProfile(p as ProfileData | null);
    setStats(s);
    setFollowing(f);
    setLoading(false);
  }, [userId, isOwn]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleFollowToggle = async () => {
    if (followLoading || isOwn) return;
    setFollowLoading(true);
    const optimistic = !following;
    setFollowing(optimistic);
    const ok = optimistic ? await followUser(userId) : await unfollowUser(userId);
    if (!ok) setFollowing(!optimistic); // revert on failure
    // Refresh stats so follower count updates
    const newStats = await getProfileStats(userId);
    setStats(newStats);
    setFollowLoading(false);
  };

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

      {/* Follow + Share row — visitor view only */}
      {!isOwn && (
        <div style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 22,
        }}>
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            style={{
              background: following ? "transparent" : G,
              border: following ? `1.5px solid ${BD}` : "none",
              color: following ? T2 : "#0E0E10",
              fontFamily: F,
              fontSize: 14,
              fontWeight: 800,
              padding: "10px 28px",
              borderRadius: 10,
              cursor: followLoading ? "wait" : "pointer",
              minHeight: 44,
              opacity: followLoading ? 0.7 : 1,
              letterSpacing: 0.2,
            }}>
            {following ? "Following" : "Follow"}
          </button>
        </div>
      )}

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
          <Sep />
          <Stat label="Followers" value={stats.followers} />
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

      {/* Tabs: Beatdowns / Exercises */}
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

      {/* Tab content — V2-2 placeholder; V2-3 will fill these in */}
      <div style={{
        background: CARD_BG,
        border: `1px solid ${BD}`,
        borderRadius: 14,
        padding: "32px 20px",
        textAlign: "center",
        marginBottom: 24,
      }}>
        {tab === "beatdowns" && (
          <div>
            <div style={{ fontSize: 14, color: T3, fontWeight: 600, marginBottom: 6 }}>
              {(stats?.beatdowns ?? 0) === 0
                ? (isOwn ? "You haven't shared any beatdowns yet." : "No shared beatdowns yet.")
                : `${stats?.beatdowns} shared beatdown${(stats?.beatdowns ?? 0) === 1 ? "" : "s"}`}
            </div>
            <div style={{ fontSize: 12, color: T5, fontStyle: "italic" }}>
              Beatdown cards coming in V2-3.
            </div>
          </div>
        )}
        {tab === "exercises" && (
          <div>
            <div style={{ fontSize: 14, color: T3, fontWeight: 600, marginBottom: 6 }}>
              {(stats?.exercises ?? 0) === 0
                ? (isOwn ? "You haven't shared any exercises yet." : "No shared exercises yet.")
                : `${stats?.exercises} shared exercise${(stats?.exercises ?? 0) === 1 ? "" : "s"}`}
            </div>
            <div style={{ fontSize: 12, color: T5, fontStyle: "italic" }}>
              Exercise cards coming in V2-3.
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding so content isn't hidden by bottom nav */}
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
