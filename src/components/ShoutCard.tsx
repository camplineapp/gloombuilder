"use client";
import { type ShoutRow } from "@/lib/db";

// Design tokens (matches Bible v14 + existing screens)
const CARD_BG = "#111114";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

// Avatar palette for OTHER HIMs (matches QProfileScreen)
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

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

interface ShoutCardProps {
  shout: ShoutRow;
  currentUserId: string;
  onAuthorTap?: (authorId: string) => void;
  onBeatdownTap?: (beatdownId: string) => void;
  // Display variant: "feed" = full card with bottom border for Feed list,
  //                  "profile" = standalone card with green-tinted bg + 📌 pin for Q Profile
  variant?: "feed" | "profile";
}

export default function ShoutCard({
  shout,
  currentUserId,
  onAuthorTap,
  onBeatdownTap,
  variant = "feed",
}: ShoutCardProps) {
  const authorName = shout.profiles?.f3_name || "Unknown";
  const authorAo = shout.profiles?.ao || "";
  const isOwn = shout.author_id === currentUserId;
  const avatarColor = colorForUserId(shout.author_id, isOwn);
  const initials = getInitials(authorName);
  const beatdown = shout.beatdown;

  // Wrapper styling differs per variant
  const wrapperStyle: React.CSSProperties =
    variant === "profile"
      ? {
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
        }
      : {
          padding: "14px 0",
          borderBottom: "1px solid " + BD,
        };

  return (
    <div style={wrapperStyle}>
      {/* Pin indicator — only on profile variant */}
      {variant === "profile" && (
        <div
          style={{
            fontFamily: F,
            fontSize: 9,
            fontWeight: 800,
            color: G,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span>📌</span>
          <span>Active Shout · {relativeTime(shout.created_at)} ago</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {/* Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAuthorTap?.(shout.author_id);
          }}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: avatarColor + "20",
            border: "1.5px solid " + avatarColor,
            color: avatarColor,
            fontFamily: F,
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
            padding: 0,
          }}
          aria-label={`${authorName}'s profile`}
        >
          {initials}
        </button>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Author row (only on feed variant — profile already shows name elsewhere) */}
          {variant === "feed" && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAuthorTap?.(shout.author_id);
                }}
                style={{
                  fontFamily: F,
                  fontSize: 14,
                  fontWeight: 800,
                  color: T1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {authorName}
              </button>
              <span style={{ fontFamily: F, fontSize: 11, color: T5 }}>
                · {relativeTime(shout.created_at)}
              </span>
            </div>
          )}

          {/* Meta row: AO + type pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {authorAo && <span style={{ fontFamily: F, fontSize: 11, color: T4 }}>{authorAo}</span>}
            <span
              style={{
                fontFamily: F,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid " + BD,
                color: T2,
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              {shout.type}
            </span>
          </div>

          {/* When (if provided) */}
          {shout.when_text && (
            <div
              style={{
                fontFamily: F,
                fontSize: 14,
                fontWeight: 800,
                color: T1,
                marginBottom: 4,
              }}
            >
              {shout.when_text}
            </div>
          )}

          {/* Location (if provided) */}
          {shout.location_text && (() => {
            const isUrl = /^https?:\/\//i.test(shout.location_text);
            if (isUrl) {
              return (
                <a
                  href={shout.location_text}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontFamily: F,
                    fontSize: 13,
                    fontWeight: 700,
                    color: G,
                    textDecoration: "none",
                    marginBottom: 8,
                    display: "inline-block",
                  }}
                >
                  📍 {shout.location_text.length > 40 ? shout.location_text.slice(0, 40) + "…" : shout.location_text}
                </a>
              );
            }
            return (
              <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T2, marginBottom: 8 }}>
                📍 {shout.location_text}
              </div>
            );
          })()}

          {/* Message text */}
          <div
            style={{
              fontFamily: F,
              fontSize: 14,
              color: T2,
              lineHeight: 1.45,
              marginBottom: 10,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {shout.text}
          </div>

          {/* Attached beatdown (minimal: title + arrow only, per user direction) */}
          {beatdown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBeatdownTap?.(beatdown.id);
              }}
              style={{
                width: "100%",
                background: CARD_BG,
                border: "1px solid " + BD,
                borderLeft: "3px solid " + A,
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontFamily: F,
                textAlign: "left",
              }}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: T1 }}>
                {beatdown.title}
              </span>
              <span style={{ color: T4, fontSize: 16 }}>→</span>
            </button>
          )}

          {/* Reactions row (V2-5: render only, taps non-functional per spec) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 12,
              color: T4,
              fontFamily: F,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>👍 0</span>
            {/* HC only shows if when_text is set (a "live event" Shout) */}
            {shout.when_text && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>HC 0</span>
            )}
            <span style={{ marginLeft: "auto", color: T5 }}>↗</span>
          </div>
        </div>
      </div>
    </div>
  );
}
