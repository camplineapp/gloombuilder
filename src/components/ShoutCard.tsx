"use client";
import { type ShoutRow } from "@/lib/db";

const CARD_BG = "#111114";
const BD = "rgba(255,255,255,0.07)";
const BD_STRONG = "rgba(255,255,255,0.12)";
const G = "#22c55e";
const A = "#f59e0b";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

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

// Map URL detection — return a clean label or null if not a recognized map URL
function detectMapService(url: string): { service: string; label: string } | null {
  const u = url.toLowerCase();
  if (u.includes("google.com/maps") || u.includes("goo.gl/maps") || u.includes("maps.app.goo.gl")) {
    return { service: "Google Maps", label: "Tap for directions" };
  }
  if (u.includes("maps.apple.com")) {
    return { service: "Apple Maps", label: "Tap for directions" };
  }
  if (u.includes("waze.com")) {
    return { service: "Waze", label: "Tap to navigate" };
  }
  return null;
}

interface ShoutCardProps {
  shout: ShoutRow;
  currentUserId: string;
  onAuthorTap?: (authorId: string) => void;
  onBeatdownTap?: (beatdownId: string) => void;
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

  // Hide post-time entirely when an event-time (when_text) is set — Q1(a)
  const showPostTime = !shout.when_text;

  // Native share — Q2(b)
  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const shareText = `${authorName} (${authorAo}): ${shout.text}`;
    const shareData: ShareData = {
      title: `Shout from ${authorName}`,
      text: shareText,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed — silent
        if ((err as Error).name !== "AbortError") {
          console.warn("Share failed:", err);
        }
      }
    } else {
      // Fallback: copy text to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // Brief feedback via title attribute (no toast system in this scope)
        const target = e.currentTarget as HTMLButtonElement;
        const original = target.getAttribute("data-tooltip") || "";
        target.setAttribute("data-tooltip", "Copied!");
        setTimeout(() => target.setAttribute("data-tooltip", original), 1500);
      } catch {
        console.warn("Clipboard unavailable");
      }
    }
  }

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
          // Stronger visual break between cards
          padding: "16px 0",
          borderBottom: "1px solid " + BD_STRONG,
        };

  return (
    <div style={wrapperStyle}>
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
          <span aria-hidden="true">📌</span>
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
          aria-label={`Open ${authorName}'s profile`}
        >
          {initials}
        </button>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
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
              {/* Show post-time only when no event-time is present */}
              {showPostTime && (
                <span style={{ fontFamily: F, fontSize: 11, color: T5 }}>
                  · {relativeTime(shout.created_at)}
                </span>
              )}
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

          {/* Event when (the prominent date/time when set) */}
          {shout.when_text && (
            <div
              style={{
                fontFamily: F,
                fontSize: 14,
                fontWeight: 800,
                color: T1,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 13 }}>📅</span>
              {shout.when_text}
            </div>
          )}

          {/* Location — clean label for known map services, larger tap target */}
          {shout.location_text && (() => {
            const isUrl = /^https?:\/\//i.test(shout.location_text);
            const mapService = isUrl ? detectMapService(shout.location_text) : null;

            const sharedStyles: React.CSSProperties = {
              fontFamily: F,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: 10,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.20)",
              borderRadius: 10,
              maxWidth: "100%",
            };

            if (mapService) {
              return (
                <a
                  href={shout.location_text}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Open location in ${mapService.service}`}
                  style={{ ...sharedStyles, color: G }}
                >
                  <span aria-hidden="true">📍</span>
                  <span>{mapService.label}</span>
                  <span style={{ color: T5, fontSize: 12, fontWeight: 600, marginLeft: 4 }}>
                    · {mapService.service}
                  </span>
                </a>
              );
            }
            if (isUrl) {
              const truncated =
                shout.location_text.length > 36
                  ? shout.location_text.slice(0, 36) + "…"
                  : shout.location_text;
              return (
                <a
                  href={shout.location_text}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open location URL"
                  style={{ ...sharedStyles, color: G, wordBreak: "break-all" }}
                >
                  <span aria-hidden="true">📍</span>
                  <span>{truncated}</span>
                </a>
              );
            }
            // Plain text address — no link
            return (
              <div style={{ ...sharedStyles, color: T2, cursor: "default" }}>
                <span aria-hidden="true">📍</span>
                <span>{shout.location_text}</span>
              </div>
            );
          })()}

          {/* Message text — improved line-height for readability */}
          <div
            style={{
              fontFamily: F,
              fontSize: 14,
              color: T2,
              lineHeight: 1.55,
              marginBottom: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {shout.text}
          </div>

          {/* Attached beatdown */}
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
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontFamily: F,
                textAlign: "left",
              }}
              aria-label={`Open beatdown: ${beatdown.name}`}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: T1 }}>
                {beatdown.name}
              </span>
              <span aria-hidden="true" style={{ color: T4, fontSize: 16 }}>→</span>
            </button>
          )}

          {/* Reactions row */}
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
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span aria-hidden="true">👍</span> 0
            </span>
            {shout.when_text && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>HC 0</span>
            )}
            {/* Share — wired to native share API with clipboard fallback */}
            <button
              onClick={handleShare}
              aria-label="Share this Shout"
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: T5,
                fontSize: 16,
                cursor: "pointer",
                padding: "4px 6px",
                fontFamily: F,
                lineHeight: 1,
                borderRadius: 4,
              }}
            >
              ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
