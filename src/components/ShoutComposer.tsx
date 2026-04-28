"use client";
import { useState, useEffect } from "react";
import { postShout, updateShout, type ShoutRow } from "@/lib/db";

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

const DEFAULT_TYPE = "Bootcamp";

interface AttachedBeatdown {
  id: string;
  title: string;
}

interface ShoutComposerProps {
  onClose: () => void;
  onPosted: (shout: ShoutRow) => void;
  attachedBeatdown?: AttachedBeatdown | null;
  // EDIT MODE: when provided, the composer prefills with this shout's values
  // and saving calls updateShout instead of postShout
  editingShout?: ShoutRow | null;
}

function formatWhen(isoLocal: string): string {
  if (!isoLocal) return "";
  const d = new Date(isoLocal);
  if (isNaN(d.getTime())) return isoLocal;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = days[d.getDay()];
  const mo = months[d.getMonth()];
  const dt = d.getDate();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m < 10 ? "0" + m : "" + m;
  return `${day} · ${mo} ${dt} · ${h}:${mm}${ampm}`;
}

// Convert an ISO datetime string back to the value format used by datetime-local input
// ("YYYY-MM-DDTHH:mm")
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ShoutComposer({
  onClose,
  onPosted,
  attachedBeatdown,
  editingShout,
}: ShoutComposerProps) {
  const isEditing = !!editingShout;

  // Determine if the editing shout's type is a custom (non-standard) one
  const editingTypeIsCustom = isEditing && editingShout && !SHOUT_TYPES.includes(editingShout.type);

  // Initialize state from editingShout if in edit mode, else defaults
  const [type, setType] = useState<string>(() => {
    if (!editingShout) return DEFAULT_TYPE;
    if (editingTypeIsCustom) return editingShout.type;
    return editingShout.type;
  });
  const [customType, setCustomType] = useState<string>(() =>
    editingTypeIsCustom && editingShout ? editingShout.type : ""
  );
  const [showTypeGrid, setShowTypeGrid] = useState(false);
  const [editingCustom, setEditingCustom] = useState(false);
  const [message, setMessage] = useState(() => editingShout?.text || "");
  const [whenIso, setWhenIso] = useState<string | null>(() => {
    if (editingShout?.when_at) return isoToLocalInput(editingShout.when_at);
    return null;
  });
  const [locationText, setLocationText] = useState<string | null>(() =>
    editingShout?.location_text || null
  );
  const [locationInput, setLocationInput] = useState(() =>
    editingShout?.location_text || ""
  );
  const [bdAttached, setBdAttached] = useState<AttachedBeatdown | null>(attachedBeatdown || null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveType = editingCustom ? customType.trim() : type;
  const canPost = !!effectiveType && !editingCustom && message.trim().length > 0 && message.length <= 240 && !posting;

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function handlePickType(t: string) {
    if (t === "Custom") {
      setEditingCustom(true);
      setShowTypeGrid(false);
    } else {
      setType(t);
      setEditingCustom(false);
      setCustomType("");
      setShowTypeGrid(false);
    }
  }

  function commitCustomType() {
    const trimmed = customType.trim();
    if (trimmed) {
      setType(trimmed);
      setEditingCustom(false);
    }
  }

  async function handleSubmit() {
    if (!canPost) return;
    setPosting(true);
    setError(null);
    const payload = {
      text: message.trim(),
      type: effectiveType,
      beatdownId: bdAttached?.id || null,
      whenText: whenIso ? formatWhen(whenIso) : null,
      whenAt: whenIso ? new Date(whenIso).toISOString() : null,
      locationText: locationText || null,
    };
    const result = isEditing && editingShout
      ? await updateShout(editingShout.id, payload)
      : await postShout(payload);
    setPosting(false);
    if (!result) {
      setError("Couldn't save. Try again.");
      return;
    }
    onPosted(result);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(2px)",
          zIndex: 99,
        }}
      />

      {/* Sheet centered to 430px column */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: "#141416",
          borderRadius: "22px 22px 0 0",
          padding: "14px 22px 24px",
          borderTop: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 -8px 28px rgba(0,0,0,0.6)",
          maxHeight: "92vh",
          overflowY: "auto",
          fontFamily: F,
          zIndex: 100,
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

        {/* Title — different in edit mode */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.5,
            marginBottom: 18,
            color: T1,
          }}
        >
          {isEditing ? "Edit Shout" : "New Shout"}
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
          {showTypeGrid ? "Type · choose one" : "Type"}
        </div>

        {/* TYPE — collapsed chip OR expanded grid OR custom input */}
        {editingCustom ? (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value.slice(0, 20))}
                onBlur={commitCustomType}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitCustomType();
                  }
                }}
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
                  setEditingCustom(false);
                  setCustomType("");
                  setType(DEFAULT_TYPE);
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
        ) : showTypeGrid ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 5,
              marginBottom: 18,
              border: "1px solid " + BD,
              borderRadius: 11,
              padding: 8,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {SHOUT_TYPES.map((t) => {
              const selected = type === t;
              return (
                <button
                  key={t}
                  onClick={() => handlePickType(t)}
                  style={{
                    background: selected ? G + "26" : "rgba(255,255,255,0.04)",
                    border: "1px solid " + (selected ? G + "66" : BD),
                    color: selected ? G : T2,
                    fontFamily: F,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "8px 2px",
                    borderRadius: 7,
                    cursor: "pointer",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {t}
                </button>
              );
            })}
            <button
              onClick={() => handlePickType("Custom")}
              style={{
                background: A + "1A",
                border: "1px dashed " + A + "66",
                color: A,
                fontFamily: F,
                fontSize: 10,
                fontWeight: 700,
                padding: "8px 2px",
                borderRadius: 7,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Custom
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span
              style={{
                background: G + "26",
                border: "1px solid " + G + "66",
                color: G,
                fontSize: 13,
                fontWeight: 800,
                padding: "8px 14px",
                borderRadius: 8,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {type}
            </span>
            <button
              onClick={() => setShowTypeGrid(true)}
              style={{
                fontFamily: F,
                color: T4,
                fontSize: 12,
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

        {/* MESSAGE TEXTAREA — 5 lines */}
        <div style={{ position: "relative", marginBottom: 16 }}>
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
              padding: "12px 14px",
              minHeight: 140,
              resize: "vertical",
              outline: "none",
              lineHeight: 1.5,
            }}
            maxLength={240}
          />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              fontSize: 10,
              color: message.length > 220 ? A : T5,
              fontFamily: F,
            }}
          >
            {message.length} / 240
          </div>
        </div>

        {/* OPTIONAL ICON ROW */}
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
          Add details (optional)
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {/*
            📅 When — input absolutely covers the entire button.
            On iOS Safari, tapping the input opens the native rolodex picker.
            On desktop, clicking anywhere on the button area triggers the input's
            native picker affordance.
          */}
          <label
            style={{
              flex: 1,
              position: "relative",
              background: whenIso
                ? "rgba(34,197,94,0.10)"
                : "rgba(255,255,255,0.03)",
              border: "1px solid " + (whenIso ? "rgba(34,197,94,0.4)" : BD),
              borderRadius: 10,
              padding: "10px 6px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: whenIso ? G : T4,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>📅</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontFamily: F,
              }}
            >
              When
            </span>
            <input
              type="datetime-local"
              value={whenIso || ""}
              onChange={(e) => setWhenIso(e.target.value || null)}
              aria-label="Pick date and time"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                // Critical for iOS: input must be tappable, not pointer-events:none
                // Make it large enough to cover the entire label
                margin: 0,
                padding: 0,
                border: "none",
                background: "transparent",
                color: "transparent",
                fontFamily: "inherit",
              }}
            />
          </label>

          {/* 📍 Location */}
          <button
            type="button"
            onClick={() => {
              if (locationText !== null) {
                setLocationText(null);
                setLocationInput("");
              } else {
                setLocationText("");
                setLocationInput("");
              }
            }}
            aria-label={locationText !== null ? "Remove location" : "Add location"}
            style={{
              flex: 1,
              background: locationText !== null
                ? "rgba(34,197,94,0.10)"
                : "rgba(255,255,255,0.03)",
              border: "1px solid " + (locationText !== null ? "rgba(34,197,94,0.4)" : BD),
              borderRadius: 10,
              padding: "10px 6px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: locationText !== null ? G : T4,
              fontFamily: F,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>📍</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Location
            </span>
          </button>

          {/* 💪 Beatdown — V2-6 */}
          <button
            disabled
            aria-label="Attach beatdown (coming soon)"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid " + BD,
              borderRadius: 10,
              padding: "10px 6px",
              cursor: "not-allowed",
              opacity: 0.4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: T4,
              fontFamily: F,
            }}
            title="Attaching a beatdown coming soon"
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>💪</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Beatdown
            </span>
          </button>
        </div>

        {/* SELECTED CHIPS */}
        {whenIso && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 9,
              padding: "8px 10px",
              marginBottom: 6,
            }}
          >
            <span aria-hidden="true" style={{ color: G, fontSize: 14 }}>📅</span>
            <span style={{ flex: 1, color: T1, fontSize: 12, fontWeight: 600 }}>
              {formatWhen(whenIso)}
            </span>
            <button
              onClick={() => setWhenIso(null)}
              style={{
                color: T4,
                background: "rgba(255,255,255,0.06)",
                border: "none",
                width: 20,
                height: 20,
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: F,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Remove when"
            >
              ✕
            </button>
          </div>
        )}

        {locationText !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 9,
              padding: "8px 10px",
              marginBottom: 6,
            }}
          >
            <span aria-hidden="true" style={{ color: G, fontSize: 14 }}>📍</span>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                const v = e.target.value;
                setLocationInput(v);
                setLocationText(v);
              }}
              placeholder="Paste map URL or address"
              autoFocus
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: T1,
                fontFamily: F,
                fontSize: 12,
                fontWeight: 600,
                outline: "none",
                padding: 0,
              }}
              maxLength={500}
            />
            <button
              onClick={() => {
                setLocationText(null);
                setLocationInput("");
              }}
              style={{
                color: T4,
                background: "rgba(255,255,255,0.06)",
                border: "none",
                width: 20,
                height: 20,
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: F,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Remove location"
            >
              ✕
            </button>
          </div>
        )}

        {bdAttached && (
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
                fontFamily: F,
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
              <span aria-hidden="true" style={{ color: T4, fontSize: 16 }}>→</span>
            </div>
          </div>
        )}

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
            onClick={handleSubmit}
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
            {posting
              ? (isEditing ? "Saving..." : "Posting...")
              : (isEditing ? "Save Changes" : "Post Shout")}
          </button>
        </div>
      </div>
    </>
  );
}
