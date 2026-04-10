"use client";

export default function HomeScreen() {
  const profName = "The Bishop";
  const initials = profName
    .split(" ")
    .map((w) => (w[0] || "").toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="GB" style={{ height: 42 }} />
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#F0EDE8",
                  letterSpacing: -0.5,
                }}
              >
                GloomBuilder
              </div>
              <div style={{ fontSize: 13, color: "#928982", marginTop: 2 }}>
                by {profName} · Build. Share. Steal. Repeat.
              </div>
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.09)",
              border: "1.5px solid rgba(34,197,94,0.19)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#22c55e",
              cursor: "pointer",
            }}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Quick Generate Card */}
      <div style={{ padding: "28px 24px 0" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.01))",
            border: "1px solid rgba(34,197,94,0.1)",
            borderRadius: 22,
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#22c55e",
              textTransform: "uppercase" as const,
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            Quick generate
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#F0EDE8",
              lineHeight: 1.4,
              marginBottom: 4,
            }}
          >
            Build a beatdown in 30 seconds
          </div>
          <div style={{ fontSize: 14, color: "#928982", marginBottom: 22 }}>
            Tailored to your AO site and gear
          </div>
          <button
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              background: "#22c55e",
              color: "#0E0E10",
              border: "none",
            }}
          >
            Generate beatdown
          </button>
        </div>
      </div>

      {/* "or" divider with lines */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
        />
        <span style={{ fontSize: 12, color: "#5A534C" }}>or</span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
        />
      </div>

      {/* Build from scratch + Create exercise */}
      <div
        style={{
          padding: "0 24px",
          display: "flex",
          flexDirection: "column" as const,
          gap: 10,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "20px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#D0C8BC" }}>
              Build from scratch
            </div>
            <div style={{ fontSize: 13, color: "#928982", marginTop: 4 }}>
              Manual builder — unlimited, free
            </div>
          </div>
          <div style={{ color: "#7A7268", fontSize: 20 }}>→</div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "20px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
              Create exercise
            </div>
            <div style={{ fontSize: 13, color: "#928982", marginTop: 4 }}>
              Add your own to locker and community
            </div>
          </div>
          <div style={{ color: "#7A7268", fontSize: 20 }}>→</div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: 24, textAlign: "center" as const }}>
        <div style={{ fontSize: 11, color: "#5A534C" }}>
          Not affiliated with F3 Nation, Inc. Built independently by a PAX for
          the PAX.
        </div>
      </div>
    </div>
  );
}
