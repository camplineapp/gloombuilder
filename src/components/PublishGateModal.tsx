// src/components/PublishGateModal.tsx
//
// Quality gate modal — shown when a user attempts to share publicly
// but their beatdown content + author profile haven't met the bar.
// Visual template matches the Unshare confirm modal pattern (rgba
// backdrop, #1c1c20 card, 22px radius, 360 maxWidth).

import type { PublishCheck } from "@/lib/publishGate";

const F = "'Outfit', system-ui, sans-serif";
const T1 = "#F0EDE8";
const T2 = "#C9C2BA";
const T3 = "#928982";
const G = "#22c55e";
const BG = "#0E0E10";
const A = "#f59e0b";

interface PublishGateModalProps {
  check: PublishCheck;
  onFixProfile: () => void;
  onKeepPrivate: () => void;
  onClose: () => void;
}

export default function PublishGateModal({
  check,
  onFixProfile,
  onKeepPrivate,
  onClose,
}: PublishGateModalProps) {
  if (check.ok) return null;

  const { bd_missing, profile_missing } = check;
  const hasProfileGaps = profile_missing.length > 0;
  const hasBdGaps = bd_missing.length > 0;

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    marginBottom: 6,
  } as const;

  const sectionLabelStyle = {
    fontFamily: F,
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    color: T3,
    fontWeight: 600,
    margin: "16px 0 8px",
    textAlign: "left" as const,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c20",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 22,
          padding: "28px 24px",
          maxWidth: 360,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "rgba(245,158,11,0.15)",
              color: A,
              fontSize: 20,
              fontWeight: 800,
              fontFamily: F,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            !
          </div>
          <h3
            style={{
              fontFamily: F,
              fontSize: 20,
              fontWeight: 800,
              color: T1,
              margin: "0 0 4px",
            }}
          >
            Not ready to share
          </h3>
          <p
            style={{
              fontFamily: F,
              fontSize: 14,
              color: T3,
              margin: "0 0 8px",
              lineHeight: 1.5,
            }}
          >
            Finish these to share with the community.
          </p>
        </div>

        {hasProfileGaps && (
          <>
            <div style={sectionLabelStyle}>Your profile</div>
            {profile_missing.map((label) => (
              <div key={"p:" + label} style={rowStyle}>
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: 14,
                    fontWeight: 700,
                    width: 16,
                    flexShrink: 0,
                  }}
                >
                  ✗
                </span>
                <span
                  style={{
                    fontFamily: F,
                    fontSize: 14,
                    color: T1,
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
            <button
              onClick={onFixProfile}
              style={{
                fontFamily: F,
                width: "100%",
                padding: "12px 16px",
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.30)",
                borderRadius: 10,
                color: G,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Finish your profile</span>
              <span style={{ fontSize: 16 }}>→</span>
            </button>
          </>
        )}

        {hasBdGaps && (
          <>
            <div style={sectionLabelStyle}>This beatdown</div>
            {bd_missing.map((label) => (
              <div key={"b:" + label} style={rowStyle}>
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: 14,
                    fontWeight: 700,
                    width: 16,
                    flexShrink: 0,
                  }}
                >
                  ✗
                </span>
                <span
                  style={{
                    fontFamily: F,
                    fontSize: 14,
                    color: T1,
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onKeepPrivate}
            style={{
              fontFamily: F,
              flex: 1,
              padding: "14px 0",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              color: T2,
              cursor: "pointer",
            }}
          >
            Keep private
          </button>
          <button
            onClick={onClose}
            style={{
              fontFamily: F,
              flex: 1,
              padding: "14px 0",
              background: G,
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              color: BG,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
