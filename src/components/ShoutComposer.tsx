"use client";
import { useState, useEffect } from "react";
import { postShout, type ShoutRow } from "@/lib/db";

// Design tokens (matches Bible v14 + existing screens)
const BG = "#0E0E10";
const CARD_BG = "#111114";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const F = "'Outfit', system-ui, sans-serif";

const SHOUT_TYPES = [
  "Bootcamp",
  "Run",
  "Bike",
  "Ruck",
  "Mobility",
  "Gear",
  "QSource",
  "2nd F",
  "3rd F",
  "CSAUP",
  "Convergence",
];

interface AttachedBeatdown {
  id: string;
  title: string;
}

interface ShoutComposerProps {
  onClose: () => void;
  onPosted: (shout: ShoutRow) => void;
  // Optional: pre-attached beatdown if user opened composer from a beatdown card
  attachedBeatdown?: AttachedBeatdown | null;
}

export default function ShoutComposer({ onClose, onPosted, attachedBeatdown }: ShoutComposerProps) {
  const [type, setType] = useState<string>("");
  const [customType, setCustomType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [whenText, setWhenText] = useState<string | null>(null);
  const [whenInput, setWhenInput] = useState("");
  const [locationText, setLocationText] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [bdAttached, setBdAttached] = useState<AttachedBeatdown | null>(attachedBeatdown || null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveType = type === "Custom" ? customType.trim() : type;
  const canPost = !!effectiveType && message.trim().length > 0 && message.length <= 240 && !posting;

  // Lock background scroll when sheet is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  async function handlePost() {
    if (!canPost) return;
    setPosting(true);
    setError(null);
    const result = await postShout({
      text: message.trim(),
      type: effectiveType,
      beatdownId: bdAttached?.id || null,
      whenText: whenText || null,
      locationText: locationText || null,
    });
    setPosting(false);
    if (!result) {
      setError("Couldn't post. Try again.");
      return;
    }
    onPosted(result);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          background: "#141416",
          borderRadius: "22px 22px 0 0",
          padding: "14px 22px 24px",
          borderTop: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 -8px 28px rgba(0,0,0,0.6)",
          maxHeight: "92vh",
          overflowY: "auto",
          fontFamily: F,
        }}
      >
        {/* Grab handle */}
        <div
          style={{
            width: 44,
            height: 5,
            background: BD,
            borderRadius: 3,
            margin: "0 auto 14px",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.5,
            marginBottom: 18,
            color: T1,
          }}
        >
          New Shout
        </div>

        {/* TYPE LABEL */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: T5,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 7,
          }}
        >
          Type <span style={{ color: G, fontSize: 9, marginLeft: 4 }}>REQUIRED</span>
        </div>

        {/* TYPE PICKER — collapsed (chip) or expanded (grid) */}
        {type && type !== "Custom" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span
              style={{
                background: G + "26",
                border: "1px solid " + G + "66",
                color: G,
                fontSize: 12,
                fontWeight: 800,
                padding: "7px 12px",
                borderRadius: 8,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {type}
            </span>
            <button
              onClick={() => setType("")}
              style={{
                fontFamily: F,
                color: T4,
                fontSize: 11,
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Change
            </button>
          </div>
        ) : type === "Custom" ? (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value.slice(0, 20))}
                placeholder="Custom type label..."
                style={{
                  flex: 1,
                  background: A + "1A",
                  border: "1px solid " + A + "66",
                  borderRadius: 9,
                  color: T1,
                  fontFamily: F,
                  fontSize: 13,
                  padding: "9px 12px",
                  outline: "none",
                }}
                autoFocus
                maxLength={20}
              />
              <button
                onClick={() => {
                  setType("");
                  setCustomType("");
                }}
                style={{
                  fontFamily: F,
                  color: T4,
                  fontSize: 11,
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Cancel
              </button>
            </div>
            <div style={{ fontSize: 10, color: T5 }}>{customType.length} / 20</div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 7,
              marginBottom: 18,
            }}
          >
            {SHOUT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid " + BD,
                  color: T2,
                  fontFamily: F,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "9px 4px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setType("Custom")}
              style={{
                background: A + "1A",
                border: "1px dashed " + A + "66",
                color: A,
                fontFamily: F,
                fontSize: 12,
                fontWeight: 700,
                padding: "9px 4px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Custom...
            </button>
          </div>
        )}

        {/* MESSAGE LABEL */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: T5,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 7,
          }}
        >
          Message <span style={{ color: G, fontSize: 9, marginLeft: 4 }}>REQUIRED</span>
        </div>

        {/* MESSAGE TEXTAREA */}
        <div style={{ position: "relative", marginBottom: 18 }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 240))}
            placeholder="What's the Shout?"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid " + BD,
              borderRadius: 12,
              color: T1,
              fontFamily: F,
              fontSize: 14,
              padding: "10px 12px",
              minHeight: 80,
              resize: "vertical",
              outline: "none",
            }}
            maxLength={240}
          />
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 10,
              fontSize: 10,
              color: message.length > 220 ? A : T5,
              fontFamily: F,
            }}
          >
            {message.length} / 240
          </div>
        </div>

        {/* OPTIONAL HEADER */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: T5,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            margin: "14px 0 10px",
            textAlign: "center",
          }}
        >
          Optional · Add any that apply
        </div>

        {/* WHEN */}
        {whenText !== null ? (
          <div
            style={{
              background: G + "10",
              border: "1px solid " + G + "40",
              borderRadius: 11,
              padding: "9px 11px",
              marginBottom: 7,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: G,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>When</span>
              <button
                onClick={() => {
                  setWhenText(null);
                  setWhenInput("");
                }}
                style={{
                  color: T4,
                  fontSize: 11,
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontFamily: F,
                }}
                aria-label="Remove when"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={whenInput}
              onChange={(e) => {
                const v = e.target.value;
                setWhenInput(v);
                setWhenText(v);
              }}
              placeholder="e.g. Wed · Apr 22 · 5:30am"
              autoFocus
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: T1,
                fontFamily: F,
                fontSize: 13,
                outline: "none",
                padding: 0,
              }}
              maxLength={100}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              setWhenText("");
              setWhenInput("");
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: 11,
              color: T3,
              fontFamily: F,
              fontSize: 12,
              fontWeight: 600,
              textAlign: "left",
              marginBottom: 6,
              cursor: "pointer",
            }}
          >
            + Add when
          </button>
        )}

        {/* LOCATION */}
        {locationText !== null ? (
          <div
            style={{
              background: G + "10",
              border: "1px solid " + G + "40",
              borderRadius: 11,
              padding: "9px 11px",
              marginBottom: 7,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: G,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Location</span>
              <button
                onClick={() => {
                  setLocationText(null);
                  setLocationInput("");
                }}
                style={{
                  color: T4,
                  fontSize: 11,
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontFamily: F,
                }}
                aria-label="Remove location"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                const v = e.target.value;
                setLocationInput(v);
                setLocationText(v);
              }}
              placeholder="Map URL or address"
              autoFocus
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: T1,
                fontFamily: F,
                fontSize: 13,
                outline: "none",
                padding: 0,
              }}
              maxLength={500}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              setLocationText("");
              setLocationInput("");
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: 11,
              color: T3,
              fontFamily: F,
              fontSize: 12,
              fontWeight: 600,
              textAlign: "left",
              marginBottom: 6,
              cursor: "pointer",
            }}
          >
            + Add location
          </button>
        )}

        {/* BEATDOWN ATTACHMENT */}
        {bdAttached ? (
          <div
            style={{
              background: A + "10",
              border: "1px solid " + A + "40",
              borderRadius: 11,
              padding: "9px 11px",
              marginBottom: 7,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: A,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Attached beatdown</span>
              <button
                onClick={() => setBdAttached(null)}
                style={{
                  color: T4,
                  fontSize: 11,
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontFamily: F,
                }}
                aria-label="Remove beatdown"
              >
                ✕
              </button>
            </div>
            <div
              style={{
                background: CARD_BG,
                border: "1px solid " + BD,
                borderLeft: "3px solid " + A,
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: T1 }}>
                {bdAttached.title}
              </span>
              <span style={{ color: T4, fontSize: 16 }}>→</span>
            </div>
          </div>
        ) : (
          // V2-5: pre-attachment via "Add beatdown" picker not yet wired.
          // For now, beatdown can only be attached if composer was opened from a beatdown context.
          <button
            disabled
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: 11,
              color: T5,
              fontFamily: F,
              fontSize: 12,
              fontWeight: 600,
              textAlign: "left",
              marginBottom: 6,
              cursor: "not-allowed",
              opacity: 0.6,
            }}
            title="Attach a beatdown by opening composer from a beatdown card (V2-6)"
          >
            + Add beatdown <span style={{ color: T5, marginLeft: 6, fontSize: 10 }}>(coming soon)</span>
          </button>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.30)",
              borderRadius: 8,
              color: "#ef4444",
              fontSize: 12,
              fontFamily: F,
            }}
          >
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            disabled={posting}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid " + BD,
              color: T3,
              fontFamily: F,
              fontSize: 13,
              fontWeight: 700,
              padding: "11px 16px",
              borderRadius: 11,
              cursor: posting ? "not-allowed" : "pointer",
              opacity: posting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!canPost}
            style={{
              flex: 1,
              background: canPost ? G : G + "33",
              border: "none",
              color: canPost ? BG : "rgba(14,14,16,0.6)",
              fontFamily: F,
              fontSize: 13,
              fontWeight: 800,
              padding: "11px 0",
              borderRadius: 11,
              cursor: canPost ? "pointer" : "not-allowed",
            }}
          >
            {posting ? "Posting..." : "Post Shout"}
          </button>
        </div>
      </div>
    </div>
  );
}
