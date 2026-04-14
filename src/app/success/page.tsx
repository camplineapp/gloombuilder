"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const BG = "#0E0E10";
const G = "#22c55e";
const T1 = "#F0EDE8";
const T3 = "#C0B8AC";
const T4 = "#928982";
const F = "'Outfit', system-ui, sans-serif";

function SuccessContent() {
  const params = useSearchParams();
  const amount = params.get("amount") || "";

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: BG,
        fontFamily: F,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 20 }}>💚</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 12 }}>
        Thank you, brother.
      </div>
      {amount ? (
        <div style={{ fontSize: 18, color: G, fontWeight: 700, marginBottom: 16 }}>
          ${amount} received
        </div>
      ) : null}
      <div style={{ fontSize: 15, color: T3, lineHeight: 1.7, marginBottom: 32, maxWidth: 320 }}>
        Your support keeps GloomBuilder alive and the features coming. Every dollar matters. 
        Build. Share. Steal. Repeat.
      </div>
      <a
        href="/"
        style={{
          background: G,
          color: BG,
          padding: "16px 40px",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          textDecoration: "none",
          fontFamily: F,
        }}
      >
        Back to GloomBuilder
      </a>
      <div style={{ fontSize: 11, color: T4, marginTop: 40 }}>
        Not affiliated with F3 Nation, Inc. Built independently by a PAX for the PAX.
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0E0E10", minHeight: "100vh" }} />}>
      <SuccessContent />
    </Suspense>
  );
}
