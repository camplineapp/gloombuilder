"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthScreen from "@/components/AuthScreen";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import LibraryScreen from "@/components/LibraryScreen";
import LockerScreen from "@/components/LockerScreen";
import ProfileScreen from "@/components/ProfileScreen";

export default function App() {
  const [tab, setTab] = useState<"home" | "library" | "locker" | "profile">("home");
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const supabase = createClient();

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    setChecking(false);
  };

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <div
        style={{
          maxWidth: 430,
          margin: "0 auto",
          minHeight: "100vh",
          background: "#0E0E10",
          fontFamily: "'Outfit', system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#928982" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={checkUser} />;
  }

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
