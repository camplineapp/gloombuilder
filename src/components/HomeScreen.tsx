"use client";

import { useState, useEffect } from "react";
import { loadDraft, formatTimeAgo, DRAFT_KEYS, PICKUP_INTENT_KEY } from "@/lib/drafts";
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

type GeneratorDraftLite = {
  grT: string;
  gr: Section[];
};

type NotepadDraftLite = {
  title: string;
  text: string;
};

type PickUpFlow = "build" | "generate" | "notepad";

interface PickUpInfo {
  flow: PickUpFlow;
  name: string;
  exerciseCount: number; // 0 for notepad (not displayed for notepad)
  sectionCount: number;  // 0 for notepad (not displayed for notepad)
  timeAgo: string;
  savedAt: number;       // for max-savedAt comparison
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

    const candidates: PickUpInfo[] = [];

    // Build flow
    const buildEnv = loadDraft<BuilderDraft>(DRAFT_KEYS.builderNew);
    if (buildEnv) {
      const exerciseCount = (buildEnv.data.secs || []).reduce(
        (sum, s) => sum + (s.exercises || []).filter(
          e => (e as { type?: string }).type !== "transition"
        ).length, 0
      );
      const titleHasContent = !!buildEnv.data.bT && buildEnv.data.bT.trim() !== "";
      const hasExercises = exerciseCount > 0;
      if (titleHasContent || hasExercises) {
        candidates.push({
          flow: "build",
          name: titleHasContent ? buildEnv.data.bT.trim() : "Untitled",
          exerciseCount,
          sectionCount: (buildEnv.data.secs || []).length,
          timeAgo: formatTimeAgo(buildEnv.savedAt),
          savedAt: buildEnv.savedAt,
        });
      }
    }

    // Generate flow
    const genEnv = loadDraft<GeneratorDraftLite>(DRAFT_KEYS.generatorResult);
    if (genEnv) {
      const exerciseCount = (genEnv.data.gr || []).reduce(
        (sum, s) => sum + (s.exercises || []).filter(
          e => (e as { type?: string }).type !== "transition"
        ).length, 0
      );
      const titleHasContent = !!genEnv.data.grT && genEnv.data.grT.trim() !== "";
      const hasExercises = exerciseCount > 0;
      // GeneratorScreen only autosaves when gr is non-null, so any
      // persisted draft has exercises by construction. Title-or-exercises
      // gate is for safety/symmetry with the other flows.
      if (titleHasContent || hasExercises) {
        candidates.push({
          flow: "generate",
          name: titleHasContent ? genEnv.data.grT.trim() : "Generated beatdown",
          exerciseCount,
          sectionCount: (genEnv.data.gr || []).length,
          timeAgo: formatTimeAgo(genEnv.savedAt),
          savedAt: genEnv.savedAt,
        });
      }
    }

    // Notepad flow
    const npEnv = loadDraft<NotepadDraftLite>(DRAFT_KEYS.notepadDraft);
    if (npEnv) {
      const titleHasContent = !!npEnv.data.title && npEnv.data.title.trim() !== "";
      const textHasContent = !!npEnv.data.text && npEnv.data.text.trim() !== "";
      if (titleHasContent || textHasContent) {
        candidates.push({
          flow: "notepad",
          name: titleHasContent ? npEnv.data.title.trim() : "Untitled notepad",
          exerciseCount: 0,
          sectionCount: 0,
          timeAgo: formatTimeAgo(npEnv.savedAt),
          savedAt: npEnv.savedAt,
        });
      }
    }

    if (candidates.length === 0) return;

    // Most-recent wins
    candidates.sort((a, b) => b.savedAt - a.savedAt);
    setPickUp(candidates[0]);
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
              <div style={{ fontSize: 13, color: "#928982", marginTop: 2 }}>Build. Share. Steal. Repeat.</div>
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
          <div style={{ fontSize: 14, color: "#928982", marginBottom: 22 }}>Picks the exercises and reps for you. Edit anything after.</div>
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
            onClick={() => {
              // Set one-shot intent flag so editor restores its draft on mount.
              // Editor reads-and-clears this flag on mount.
              sessionStorage.setItem(PICKUP_INTENT_KEY, "true");
              if (pickUp.flow === "generate") onGenerate();
              else if (pickUp.flow === "notepad") onCreateNotepad?.();
              else onBuild();
            }}
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
              <div style={{ fontSize: 12, color: T4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: F,
                  background: "rgba(255,255,255,0.06)",
                  color: T2,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  padding: "2px 7px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}>
                  {pickUp.flow === "build" ? "Built" : pickUp.flow === "generate" ? "Generated" : "Notepad"}
                </span>
                <span>{pickUp.timeAgo}</span>
                {pickUp.flow !== "notepad" && pickUp.sectionCount > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {pickUp.sectionCount} {pickUp.sectionCount === 1 ? "section" : "sections"}
                      {pickUp.exerciseCount > 0 && ` · ${pickUp.exerciseCount} ${pickUp.exerciseCount === 1 ? "exercise" : "exercises"}`}
                    </span>
                  </>
                )}
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
            <div style={{ fontSize: 13, color: "#928982", marginTop: 4 }}>You pick every exercise and rep yourself.</div>
          </div>
          <div style={{ color: "#7A7268", fontSize: 20 }}>→</div>
        </div>

        {/* Notepad — full-width Tier 2 row, promoted from former tile grid */}
        <div onClick={onCreateNotepad} style={{ background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📝</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#D0C8BC" }}>Notepad</div>
            <div style={{ fontSize: 13, color: "#928982", marginTop: 4 }}>Write it like a notepad. We&apos;ll convert it for you.</div>
          </div>
          <div style={{ color: "#7A7268", fontSize: 20 }}>→</div>
        </div>
      </div>

      {/* Tier 3 muted 2-card grid: Add exercise / Preblast */}
      <div style={{
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}>
        <button
          onClick={onCreateEx}
          style={{
            fontFamily: F,
            background: "#0E0E10",
            border: "1px solid #1f1f23",
            borderRadius: 10,
            padding: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left" as const,
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.7, flexShrink: 0 }}>➕</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#c8c0b8" }}>Add exercise</div>
            <div style={{ fontSize: 9, color: "#5A534C", marginTop: 2 }}>Suggest one to the database</div>
          </div>
        </button>

        <button
          onClick={onSendPreblast}
          style={{
            fontFamily: F,
            background: "#0E0E10",
            border: "1px solid #1f1f23",
            borderRadius: 10,
            padding: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left" as const,
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.7, flexShrink: 0 }}>📣</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#c8c0b8" }}>Preblast</div>
            <div style={{ fontSize: 9, color: "#5A534C", marginTop: 2 }}>Announce a beatdown</div>
          </div>
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: 24, textAlign: "center" as const }}>
        <div style={{ fontSize: 11, color: "#5A534C" }}>Not affiliated with F3 Nation, Inc. Built independently by a PAX for the PAX.</div>
      </div>
    </div>
  );
}
