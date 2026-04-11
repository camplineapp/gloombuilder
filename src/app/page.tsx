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
import GeneratorScreen from "@/components/GeneratorScreen";
import BuilderScreen from "@/components/BuilderScreen";
import CreateExerciseScreen from "@/components/CreateExerciseScreen";

export default function App() {
  const [tab, setTab] = useState<"home" | "library" | "locker" | "profile">("home");
  const [vw, setVw] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<{ f3_name: string; ao: string; state: string; region: string } | null>(null);
  const [toast, setToast] = useState("");

  const supabase = createClient();

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (prof) setProfile(prof);
    }
    setChecking(false);
  };

  useEffect(() => {
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });
    return () => { listener.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0E0E10", fontFamily: "'Outfit', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#928982" }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={checkUser} />;
  }

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#0E0E10", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', system-ui, sans-serif", zIndex: 300 }}>{toast}</div>
  ) : null;

  // ════ FULL-SCREEN VIEWS ════
  if (vw === "gen" || vw === "build" || vw === "create-ex") {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0E0E10", fontFamily: "'Outfit', system-ui, sans-serif", paddingTop: 20, paddingBottom: 100, position: "relative" }}>
        {vw === "gen" && (
          <GeneratorScreen
            onClose={() => setVw(null)}
            onSave={() => { fl("Saved to locker!"); setVw(null); setTab("locker"); }}
          />
        )}
        {vw === "build" && (
          <BuilderScreen
            onClose={() => setVw(null)}
            onSave={() => { fl("Saved to locker!"); setVw(null); setTab("locker"); }}
          />
        )}
        {vw === "create-ex" && (
          <CreateExerciseScreen
            onClose={() => setVw(null)}
            onSave={() => { fl("Saved to locker!"); setVw(null); setTab("locker"); }}
          />
        )}
        {toastEl}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0E0E10", fontFamily: "'Outfit', system-ui, sans-serif", paddingTop: 20, paddingBottom: 100, position: "relative" }}>
      {tab === "home" && (
        <HomeScreen
          profName={profile?.f3_name || "PAX"}
          onProfileTap={() => setTab("profile")}
          onGenerate={() => setVw("gen")}
          onBuild={() => setVw("build")}
          onCreateEx={() => setVw("create-ex")}
        />
      )}
      {tab === "library" && <LibraryScreen />}
      {tab === "locker" && <LockerScreen />}
      {tab === "profile" && <ProfileScreen onProfileSaved={checkUser} />}
      <BottomNav active={tab} onTabChange={(t) => { setTab(t); setVw(null); }} />
      {toastEl}
    </div>
  );
}
