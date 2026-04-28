"use client";

type Tab = "home" | "library" | "feed" | "profile";

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "library", label: "Library" },
  { key: "feed", label: "Feed" },
  { key: "profile", label: "Profile" },
];

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: "#0E0E10",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        zIndex: 50,
        padding: "6px 0 12px",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom, 8px))",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontWeight: 500,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: active === t.key ? "#22c55e" : "#928982",
            fontSize: 14,
            padding: "14px 20px",
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
