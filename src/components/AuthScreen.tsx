"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [f3Name, setF3Name] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    if (mode === "signup" && !f3Name.trim()) {
      setError("F3 name required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { f3_name: f3Name.trim() },
          },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      onAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const ist = {
    width: "100%",
    background: "rgba(255,255,255,0.028)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    color: "#F0EDE8",
    padding: "14px 16px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "'Outfit', system-ui, sans-serif",
  };

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#0E0E10",
        fontFamily: "'Outfit', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      {/* Logo + title */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <img
          src="/logo.png"
          alt="GB"
          style={{ height: 60, margin: "0 auto 16px" }}
        />
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#F0EDE8",
            letterSpacing: -0.5,
          }}
        >
          GloomBuilder
        </div>
        <div style={{ fontSize: 13, color: "#928982", marginTop: 4 }}>
          by The Bishop · Build. Share. Steal. Repeat.
        </div>
      </div>

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.028)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
        }}
      >
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            style={{
              flex: 1,
              fontFamily: "'Outfit', system-ui, sans-serif",
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: mode === m ? "#22c55e" : "transparent",
              color: mode === m ? "#0E0E10" : "#928982",
            }}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      {/* F3 Name (signup only) */}
      {mode === "signup" && (
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              color: "#7A7268",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              display: "block",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            F3 Name{" "}
            <span style={{ color: "#5A534C", fontWeight: 400 }}>
              ({f3Name.length}/30)
            </span>
          </label>
          <input
            value={f3Name}
            maxLength={30}
            onChange={(e) => setF3Name(e.target.value)}
            placeholder="e.g. The Bishop"
            style={ist}
          />
        </div>
      )}

      {/* Email */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            color: "#7A7268",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "block",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={ist}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            color: "#7A7268",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "block",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={ist}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            fontSize: 13,
            color: "#ef4444",
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          width: "100%",
          padding: "14px 0",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: loading ? "default" : "pointer",
          background: loading ? "#928982" : "#22c55e",
          color: "#0E0E10",
          border: "none",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? "Loading..."
          : mode === "login"
          ? "Log in"
          : "Create account"}
      </button>

      {/* Disclaimer */}
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#5A534C" }}>
          Not affiliated with F3 Nation, Inc. Built independently by a PAX for
          the PAX.
        </div>
      </div>
    </div>
  );
}
