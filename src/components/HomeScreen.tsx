"use client";

export default function HomeScreen() {
  return (
    <div className="px-6 pt-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <img src="/logo.png" alt="GB" className="h-[42px] w-auto" />
        <div>
          <h1
            className="font-outfit font-extrabold"
            style={{ fontSize: 28, color: "#F0EDE8" }}
          >
            GloomBuilder
          </h1>
        </div>
      </div>
      <p className="font-outfit mb-10" style={{ fontSize: 14, color: "#928982" }}>
        by The Bishop · Build. Share. Steal. Repeat.
      </p>

      {/* Generate CTA */}
      <button
        className="w-full font-outfit font-bold border-none cursor-pointer mb-4"
        style={{
          background: "#22c55e",
          color: "#0E0E10",
          fontSize: 16,
          padding: "16px 0",
          borderRadius: 12,
        }}
      >
        Generate a Beatdown
      </button>

      {/* Build from scratch */}
      <div
        className="cursor-pointer mb-3"
        style={{
          background: "rgba(255,255,255,0.028)",
          border: "1px dashed rgba(34,197,94,0.19)",
          borderRadius: 14,
          padding: "20px 18px",
          textAlign: "center",
        }}
      >
        <div
          className="font-outfit font-bold"
          style={{ fontSize: 15, color: "#22c55e" }}
        >
          + Build from scratch
        </div>
        <div
          className="font-outfit"
          style={{ fontSize: 12, color: "#928982", marginTop: 4 }}
        >
          Create a beatdown manually
        </div>
      </div>

      {/* Create exercise */}
      <div
        className="cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.028)",
          border: "1px dashed rgba(167,139,250,0.19)",
          borderRadius: 14,
          padding: "20px 18px",
          textAlign: "center",
        }}
      >
        <div
          className="font-outfit font-bold"
          style={{ fontSize: 15, color: "#a78bfa" }}
        >
          + Create new exercise
        </div>
        <div
          className="font-outfit"
          style={{ fontSize: 12, color: "#928982", marginTop: 4 }}
        >
          Add to the community library
        </div>
      </div>

      {/* Disclaimer */}
      <p
        className="text-center font-outfit mt-12"
        style={{ fontSize: 11, color: "#5A534C" }}
      >
        Not affiliated with F3 Nation, Inc. Built independently by a PAX for the
        PAX.
      </p>
    </div>
  );
}
