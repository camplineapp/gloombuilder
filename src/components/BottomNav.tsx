"use client";

type Tab = "home" | "library" | "locker" | "profile";

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "library", label: "Library" },
  { key: "locker", label: "Locker" },
  { key: "profile", label: "Profile" },
];

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center"
      style={{
        background: "#0E0E10",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className="font-outfit font-medium border-none bg-transparent cursor-pointer"
          style={{
            color: active === t.key ? "#22c55e" : "#928982",
            fontSize: 14,
            padding: "10px 20px",
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
