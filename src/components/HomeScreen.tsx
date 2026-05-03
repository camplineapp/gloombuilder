"use client";

import { useState, useEffect } from "react";
import { loadDraft, formatTimeAgo, DRAFT_KEYS } from "@/lib/drafts";
import type { Section } from "@/lib/exercises";

const F = "'Outfit', system-ui, sans-serif";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T4 = "#928982";
const T5 = "#7A7268";

type BuilderDraft = {
  bT: string;
  bD: string;
  bDur: string | null;
  bDiff: string | null;
  bSites: string[];
  bEq: string[];
  secs: Section[];
  shareLib: boolean;
};

interface PickUpInfo {
  name: string;
  exerciseCount: number;
  sectionCount: number;
  timeAgo: string;
}

interface HomeScreenProps {
  profName: string;
  onProfileTap: () => void;
  onGenerate: () => void;
  onBuild: () => void;
  onCreateEx: () => void;
  onSendPreblast: () => void;
  onCreateNotepad?: () => void;
}

export default function HomeScreen({ profName, onProfileTap, onGenerate, onBuild, onCreateEx, onSendPreblast, onCreateNotepad }: HomeScreenProps) {
  const initials = profName
    .split(" ")
    .map((w) => (w[0] || "").toUpperCase())
    .join("")
    .slice(0, 2);

  const [pickUp, setPickUp] = useState<PickUpInfo | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const env = loadDraft<BuilderDraft>(DRAFT_KEYS.builderNew);
    if (!env) return;

    const exerciseCount = (env.data.secs || []).reduce(
      (sum, s) => sum + (s.exercises || []).filter(
        e => (e as { type?: string }).type !== "transition"
      ).length,
      0
    );

    const titleHasContent = !!env.data.bT && env.data.bT.trim() !== "";
    const hasExercises = exerciseCount > 0;

    if (!titleHasContent && !hasExercises) return;

    setPickUp({
      name: titleHasContent ? env.data.bT.trim() : "Untitled",
      exerciseCount,
      sectionCount: (env.data.secs || []).length,
      timeAgo: formatTimeAgo(env.savedAt),
    });
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="GB" style={{ height: 42 }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#F0EDE8", letterSpacing: -0.5 }}>GloomBuilder</div>
              <div style={{ fontSize: 13, color: "#928982", marginTop: 2 }}>by The Bishop · Build. Share. Steal. Repeat.</div>
            </div>
          </div>
          <div onClick={onProfileTap} style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(34,197,94,0.09)", border: "1.5px solid rgba(34,197,94,0.19)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#22c55e", cursor: "pointer" }}>{initials}</div>
        </div>
      </div>

      {/* Quick Generate Card */}
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.01))", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 22, padding: "28px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 8 }}>Quick generate</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#F0EDE8", lineHeight: 1.4, marginBottom: 4 }}>Build a beatdown in 30 seconds</div>
          <div style={{ fontSize: 14, color: "#928982", marginBottom: 22 }}>Tailored to your AO site and gear</div>
          <button onClick={onGenerate} style={{ fontFamily: "'Outfit', system-ui, sans-serif", width: "100%", padding: "14px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: "#22c55e", color: "#0E0E10", border: "none" }}>Generate beatdown</button>
        </div>
      </div>

      {/* "or" divider */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ fontSize: 12, color: "#5A534C" }}>or</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Pick up where you left off — only when a meaningful builderNew draft exists */}
      {pickUp && (
        <div style={{ padding: "0 24px", marginBottom: 10 }}>
          <div style={{
            fontFamily: F,
            fontSize: 11,
            fontWeight: 700,
            color: T5,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 8,
            paddingLeft: 4,
          }}>Pick up where you left off</div>
          <button
            onClick={onBuild}
            style={{
              width: "100%",
              textAlign: "left",
              fontFamily: F,
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.20)",
              borderRadius: 18,
              padding: "16px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{
              width: 4,
              alignSelf: "stretch",
              background: "#22c55e",
              borderRadius: 2,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                color: T1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: 4,
              }}>{pickUp.name}</div>
              <div style={{ fontSize: 12, color: T4 }}>
                {pickUp.timeAgo} · {pickUp.sectionCount} {pickUp.sectionCount === 1 ? "section" : "sections"}
                {pickUp.exerciseCount > 0 && ` · ${pickUp.exerciseCount} ${pickUp.exerciseCount === 1 ? "exercise" : "exercises"}`}
              </div>
            </div>
            <span style={{ color: "#22c55e", fontSize: 22, fontWeight: 700 }}>→</span>
          </button>
        </div>
      )}

      {/* Build from scratch — full-width list-row, primary creation entry */}
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 8 }}>
        <div onClick={onBuild} style={{ background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#D0C8BC" }}>Build from scratch</div>
            <div style={{ fontSize: 13, color: "#928982", marginTop: 4 }}>Manual builder — unlimited, free</div>
          </div>
          <div style={{ color: "#7A7268", fontSize: 20 }}>→</div>
        </div>
      </div>

      {/* 3-card grid: Notepad / Add exercise / Preblast */}
      <div style={{
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        <button
          onClick={onCreateNotepad}
          style={{
            fontFamily: F,
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "20px 12px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28 }}>📝</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T2, textAlign: "center" }}>Notepad</span>
        </button>

        <button
          onClick={onCreateEx}
          style={{
            fontFamily: F,
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "20px 12px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28 }}>➕</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T2, textAlign: "center" }}>Add exercise</span>
        </button>

        <button
          onClick={onSendPreblast}
          style={{
            fontFamily: F,
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "20px 12px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28 }}>📣</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T2, textAlign: "center" }}>Preblast</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: 24, textAlign: "center" as const }}>
        <div style={{ fontSize: 11, color: "#5A534C" }}>Not affiliated with F3 Nation, Inc. Built independently by a PAX for the PAX.</div>
      </div>
    </div>
  );
}
