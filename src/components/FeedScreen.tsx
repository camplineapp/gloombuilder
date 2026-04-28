"use client";
import { useState, useEffect, useCallback } from "react";
import { getFeedShouts, type ShoutRow } from "@/lib/db";
import ShoutCard from "@/components/ShoutCard";

const BG = "#0E0E10";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const T1 = "#F0EDE8";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

interface FeedScreenProps {
  currentUserId: string;
  // Bumping this number triggers a re-fetch (used by parent after a Shout is posted)
  refreshKey?: number;
  // Open Composer
  onOpenComposer: () => void;
  // Open a Q Profile (own or visitor)
  onOpenProfile: (targetUserId: string) => void;
  // Open a beatdown (V2-5: visitor flow shows "Coming soon", own opens Edit)
  onOpenBeatdown: (beatdownId: string) => void;
}

export default function FeedScreen({
  currentUserId,
  refreshKey = 0,
  onOpenComposer,
  onOpenProfile,
  onOpenBeatdown,
}: FeedScreenProps) {
  const [shouts, setShouts] = useState<ShoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"following" | "search">("following");

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const data = await getFeedShouts();
    setShouts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed, refreshKey]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: F,
        padding: "16px 18px 100px",
        position: "relative",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: T1,
          marginBottom: 14,
          letterSpacing: -0.5,
        }}
      >
        Feed
      </div>

      {/* Segmented control: Following / Search */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid " + BD,
          borderRadius: 11,
          padding: 3,
          marginBottom: 12,
        }}
      >
        <button
          onClick={() => setMode("following")}
          style={{
            flex: 1,
            padding: "8px 0",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: mode === "following" ? G : T4,
            background: mode === "following" ? "rgba(34,197,94,0.12)" : "transparent",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontFamily: F,
          }}
        >
          Following
        </button>
        <button
          onClick={() => setMode("search")}
          style={{
            flex: 1,
            padding: "8px 0",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: mode === "search" ? G : T4,
            background: mode === "search" ? "rgba(34,197,94,0.12)" : "transparent",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontFamily: F,
          }}
        >
          ⌕ Search
        </button>
      </div>

      {/* Mode body */}
      {mode === "search" ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 16px",
            color: T5,
            fontSize: 14,
          }}
        >
          Search is coming soon.
          <br />
          <span style={{ fontSize: 12, color: T5, marginTop: 6, display: "inline-block" }}>
            Find HIMs, AOs, and Shouts by keyword.
          </span>
        </div>
      ) : (
        <>
          {/* Status line */}
          <div style={{ fontSize: 11, color: T4, marginBottom: 14 }}>
            {loading
              ? "Loading…"
              : shouts.length === 0
              ? "No Shouts yet"
              : `${shouts.length} active Shout${shouts.length === 1 ? "" : "s"}`}
          </div>

          {/* Shout list */}
          {!loading && shouts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 16px",
                color: T5,
                fontSize: 14,
                border: "1px dashed " + BD,
                borderRadius: 12,
              }}
            >
              No Shouts yet.
              <br />
              <span style={{ fontSize: 12, color: T5, marginTop: 6, display: "inline-block" }}>
                Tap ✎ to post the first one.
              </span>
            </div>
          ) : (
            shouts.map((s) => (
              <ShoutCard
                key={s.id}
                shout={s}
                currentUserId={currentUserId}
                onAuthorTap={onOpenProfile}
                onBeatdownTap={onOpenBeatdown}
                variant="feed"
              />
            ))
          )}
        </>
      )}

      {/* Floating compose button */}
      <button
        onClick={onOpenComposer}
        aria-label="New Shout"
        style={{
          position: "fixed",
          bottom: "calc(80px + env(safe-area-inset-bottom, 8px))",
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: G,
          color: BG,
          border: "none",
          fontSize: 24,
          fontWeight: 800,
          fontFamily: F,
          boxShadow: "0 6px 16px rgba(34,197,94,0.4), 0 4px 8px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✎
      </button>
    </div>
  );
}
