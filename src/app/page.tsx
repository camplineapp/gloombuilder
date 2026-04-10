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
    <div className="min-h-screen bg-gb-bg font-outfit pb-20">
      {tab === "home" && <HomeScreen />}
      {tab === "library" && <LibraryScreen />}
      {tab === "locker" && <LockerScreen />}
      {tab === "profile" && <ProfileScreen />}
      <BottomNav active={tab} onTabChange={setTab} />
    </div>
  );
}
