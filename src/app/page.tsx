"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import LibraryScreen from "@/components/LibraryScreen";
import LockerScreen from "@/components/LockerScreen";
import ProfileScreen from "@/components/ProfileScreen";

export default function App() {
  const [tab, setTab] = useState<"home" | "library" | "locker" | "profile">("home");

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#0E0E10",
        fontFamily: "'Outfit', system-ui, sans-serif",
        paddingTop: 20,
        paddingBottom: 100,
        position: "relative",
      }}
    >
      {tab === "home" && <HomeScreen />}
      {tab === "library" && <LibraryScreen />}
      {tab === "locker" && <LockerScreen />}
      {tab === "profile" && <ProfileScreen />}
      <BottomNav active={tab} onTabChange={setTab} />
    </div>
  );
}
