"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];
const REGIONS = ["Northeast","Southeast","Midwest","Southwest","West","Mid-Atlantic","Pacific NW"];

const CD = "rgba(255,255,255,0.028)";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const BG = "#0E0E10";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const T6 = "#5A534C";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%",
  background: CD,
  border: "1px solid " + BD,
  borderRadius: 12,
  color: T1,
  padding: "14px 16px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: F,
};

interface ProfileScreenProps {
  onProfileSaved?: () => void;
  onClose?: () => void;
}

export default function ProfileScreen({ onProfileSaved, onClose }: ProfileScreenProps) {
  const [vw, setVw] = useState<null | "about">(null);
  const [profName, setProfName] = useState("");
  const [profAO, setProfAO] = useState("");
  const [profState, setProfState] = useState("New Jersey");
  const [profRegion, setProfRegion] = useState("Northeast");
  const [customAmt, setCustomAmt] = useState("");
  const [donating, setDonating] = useState(false);

  const handleDonate = async (amount: number | string) => {
    const amt = Number(amount);
    if (!amt || amt < 1) { fl("Minimum $1"); return; }
    setDonating(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        fl(data.error || "Payment failed");
        setDonating(false);
      }
    } catch {
      fl("Payment failed");
      setDonating(false);
    }
  };
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fl = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfName(data.f3_name || "");
          setProfAO(data.ao || "");
          setProfState(data.state || "New Jersey");
          setProfRegion(data.region || "Northeast");
        }
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        f3_name: profName,
        ao: profAO,
        state: profState,
        region: profRegion,
      })
      .eq("id", user.id);
    if (error) {
      fl("Error saving");
    } else {
      fl("Profile saved!");
      if (onProfileSaved) onProfileSaved();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ padding: "0 24px" }}>
        <div style={{ fontSize: 20, color: T1 }}>Loading...</div>
      </div>
    );
  }

  const initials = profName
    .split(" ")
    .map((w) => (w[0] || "").toUpperCase())
    .join("")
    .slice(0, 2);

  // ════ ABOUT (static creator info) ════
  if (vw === "about") {
    return (
      <div style={{ padding: "0 24px" }}>
        <button
          onClick={() => setVw(null)}
          style={{
            fontFamily: F,
            color: T4,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          ← Profile
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              color: BG,
            }}
          >
            TB
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>
            The Bishop
          </div>
          <div style={{ color: T4, fontSize: 13, marginTop: 4 }}>
            Creator of GloomBuilder
          </div>
          <div style={{ color: T5, fontSize: 12, marginTop: 4 }}>
            F3 Essex · New Jersey
          </div>
        </div>

        <div
          style={{
            background: CD,
            border: "1px solid " + BD,
            borderRadius: 18,
            padding: 24,
            marginTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: A,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Why I built this
          </div>
          <p style={{ color: T3, fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            Every Q knows the feeling. 10pm the night before and you&apos;re
            staring at the ceiling trying to plan a beatdown. What exercises? How
            many reps? What order? GloomBuilder was born from that moment.
          </p>
          <p
            style={{
              color: T3,
              fontSize: 14,
              lineHeight: 1.8,
              margin: "14px 0 0",
            }}
          >
            But here&apos;s the thing — that same feeling is the number one
            reason PAX don&apos;t step up to Q. They want to lead, but the
            planning feels overwhelming. GloomBuilder removes that barrier.
            Generate a solid beatdown in 30 seconds, customize it to your AO,
            and show up ready to lead. No more excuses. If you&apos;ve been
            thinking about taking the Q, this is your tool. If you already Q,
            share this with the PAX who need that push.
          </p>
        </div>

        <div
          style={{
            background: CD,
            border: "1px solid " + BD,
            borderRadius: 18,
            padding: 24,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: A,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Emergency Q? No sweat.
          </div>
          <p style={{ color: T3, fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            We&apos;ve all been there. You roll up to the AO and the Q
            fartsacked. No call, no text — just 15 PAX staring at you.
            Don&apos;t spiral. Open GloomBuilder, generate a beatdown in 30
            seconds, or steal one straight from the community library.
            You&apos;re locked and loaded before the first SSH. The Gloom
            doesn&apos;t wait, and neither does GloomBuilder.
          </p>
        </div>

        <div
          style={{
            background: CD,
            border: "1px solid " + BD,
            borderRadius: 18,
            padding: 24,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: A,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Iron sharpens iron
          </div>
          <p style={{ color: T3, fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            The generator gets you in the door, but the community library is
            what keeps GloomBuilder alive. Every beatdown shared, every exercise
            stolen, every vote cast makes the platform better for every Q.
            Build. Share. Steal. Repeat.
          </p>
        </div>

        <div
          style={{
            background: "rgba(34,197,94,0.03)",
            border: "1px solid rgba(34,197,94,0.08)",
            borderRadius: 18,
            padding: 24,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: G,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Support GloomBuilder 💚
          </div>
          <div
            style={{
              fontSize: 13,
              color: T4,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Built by a PAX for the PAX — out of pocket, on my own time, because
            this tool needs to exist. If GloomBuilder has been worth showing up
            to, show some love, brother. Every dollar helps keep it going and
            the features coming.
          </div>
          {donating ? <div style={{ textAlign: "center", color: G, fontSize: 14, fontWeight: 700, padding: 20 }}>Redirecting to payment...</div> : null}
          <div style={{ display: "flex", gap: 10, opacity: donating ? 0.4 : 1, pointerEvents: donating ? "none" : "auto" }}>
            {[
              { a: 3, l: "Light coupon" },
              { a: 7, l: "Standard block" },
              { a: 15, l: "Heavy carry" },
            ].map((t) => (
              <button
                key={t.a}
                onClick={() => handleDonate(t.a)}
                style={{
                  background: CD,
                  border: "1px solid " + BD,
                  borderRadius: 14,
                  padding: 16,
                  cursor: "pointer",
                  flex: 1,
                  fontFamily: F,
                }}
              >
                <div style={{ color: G, fontSize: 22, fontWeight: 800 }}>
                  ${t.a}
                </div>
                <div style={{ color: T5, fontSize: 10, marginTop: 6 }}>
                  {t.l}
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: G,
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                $
              </span>
              <input
                value={customAmt}
                onChange={(e) =>
                  setCustomAmt(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="0"
                style={{
                  width: "100%",
                  background: CD,
                  border: "1px solid " + BD,
                  borderRadius: 14,
                  color: T1,
                  padding: "16px 14px 16px 28px",
                  fontSize: 18,
                  fontWeight: 800,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: F,
                }}
              />
            </div>
            <button
              onClick={() => {
                if (!customAmt || customAmt === "0") {
                  fl("Enter an amount");
                  return;
                }
                handleDonate(customAmt);
              }}
              style={{
                background: CD,
                border: "1px solid " + BD,
                borderRadius: 14,
                padding: "16px 20px",
                cursor: "pointer",
                fontFamily: F,
                flexShrink: 0,
              }}
            >
              <div style={{ color: G, fontSize: 14, fontWeight: 700 }}>
                Choose your weight
              </div>
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T4 }}>
            Build. Share. Steal. Repeat.
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ fontSize: 11, color: T6 }}>
            Not affiliated with F3 Nation, Inc.
          </div>
        </div>

        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              background: G,
              color: BG,
              padding: "10px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: F,
              zIndex: 100,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    );
  }

  // ════ PROFILE MAIN ════
  return (
    <div style={{ padding: "0 24px" }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              fontFamily: F,
              color: T3,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              padding: "4px 0",
              marginBottom: 16,
            }}
          >
            ← Back
          </button>
        )}
      <div style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 24 }}>
        Profile
      </div>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.1)",
            border: "2px solid rgba(34,197,94,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            color: G,
            margin: "0 auto 12px",
          }}
        >
          {initials}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T1 }}>
          {profName}
        </div>
        <div style={{ color: T4, fontSize: 13, marginTop: 4 }}>
          {profAO}, {profState} · {profRegion}
        </div>
      </div>

      {/* F3 Name */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontFamily: F,
            color: T5,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "block",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          F3 name{" "}
          <span style={{ color: T6, fontWeight: 400 }}>
            ({profName.length}/30)
          </span>
        </label>
        <input
          value={profName}
          maxLength={30}
          onChange={(e) => setProfName(e.target.value)}
          style={ist}
        />
      </div>

      {/* AO */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontFamily: F,
            color: T5,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "block",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          AO{" "}
          <span style={{ color: T6, fontWeight: 400 }}>
            ({profAO.length}/40)
          </span>
        </label>
        <input
          value={profAO}
          maxLength={40}
          onChange={(e) => setProfAO(e.target.value)}
          style={ist}
        />
      </div>

      {/* State */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontFamily: F,
            color: T5,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "block",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          State
        </label>
        <select
          value={profState}
          onChange={(e) => setProfState(e.target.value)}
          style={{ ...ist, appearance: "auto" as const }}
        >
          {US_STATES.map((s) => (
            <option key={s} value={s} style={{ background: "#111" }}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Region */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontFamily: F,
            color: T5,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "block",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Region
        </label>
        <select
          value={profRegion}
          onChange={(e) => setProfRegion(e.target.value)}
          style={{ ...ist, appearance: "auto" as const }}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r} style={{ background: "#111" }}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Save */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={saveProfile}
          style={{
            fontFamily: F,
            width: "100%",
            padding: "16px 0",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            background: G,
            color: BG,
            border: "none",
          }}
        >
          Save profile
        </button>
      </div>

      {/* About GloomBuilder link */}
      <div
        onClick={() => setVw("about")}
        style={{
          background: CD,
          border: "1px solid " + BD,
          borderRadius: 14,
          padding: "18px 20px",
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T2 }}>
            About GloomBuilder
          </div>
          <div style={{ fontSize: 12, color: T4, marginTop: 3 }}>
            The story, the creator, support
          </div>
        </div>
        <div style={{ color: T5 }}>→</div>
      </div>

      {/* Log out */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={logout}
          style={{
            fontFamily: F,
            width: "100%",
            padding: "14px 0",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            background: "rgba(255,255,255,0.04)",
            color: T4,
            border: "1px solid " + BD,
          }}
        >
          Log out
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: G,
            color: BG,
            padding: "10px 24px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: F,
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
