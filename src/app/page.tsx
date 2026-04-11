"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Section } from "@/lib/exercises";
import AuthScreen from "@/components/AuthScreen";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import LibraryScreen from "@/components/LibraryScreen";
import LockerScreen from "@/components/LockerScreen";
import ProfileScreen from "@/components/ProfileScreen";
import GeneratorScreen from "@/components/GeneratorScreen";
import BuilderScreen from "@/components/BuilderScreen";
import CreateExerciseScreen from "@/components/CreateExerciseScreen";

export interface LockerBeatdown {
  id: number; nm: string; dt: string; src: string; d: string; desc: string;
  secs: Section[]; tg: string[]; inspiredBy?: string;
}

export interface LockerExercise {
  id: number; nm: string; tags: string[]; how: string; src: string; inspiredBy?: string;
}

export interface SharedItem {
  id: number; src: string; nm: string; au: string; ao: string; reg: string;
  d: string; dur: string | null; aoT: string[]; v: number; u: number; cm: number;
  ds: string; dt: string; tp: string; tg?: string[]; et?: string[];
  comments: { au: string; ao: string; txt: string; dt: string }[];
  secs?: Section[];
}

export default function App() {
  const [tab, setTab] = useState<"home" | "library" | "locker" | "profile">("home");
  const [vw, setVw] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<{ f3_name: string; ao: string; state: string; region: string } | null>(null);
  const [toast, setToast] = useState("");

  // Locker state
  const [lk, setLk] = useState<LockerBeatdown[]>([]);
  const [lkEx, setLkEx] = useState<LockerExercise[]>([]);
  const [lkBm, setLkBm] = useState<never[]>([]);

  // Shared items (appear in Library)
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);

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

  const profName = profile?.f3_name || "PAX";
  const profAO = profile?.ao || "";
  const profState = profile?.state || "";
  const profRegion = profile?.region || "";

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#0E0E10", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', system-ui, sans-serif", zIndex: 300 }}>{toast}</div>
  ) : null;

  const handleSaveBeatdown = (bd: { nm: string; desc: string; d: string; secs: Section[]; tg: string[]; src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean }) => {
    const now = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" });
    const newBd: LockerBeatdown = {
      id: Date.now(),
      nm: bd.nm,
      dt: now,
      src: bd.src === "Generated" ? "Generated" : "Manual",
      d: bd.d,
      desc: bd.desc,
      secs: bd.secs,
      tg: bd.tg,
    };
    setLk([newBd, ...lk]);

    if (bd.share) {
      const sharedItem: SharedItem = {
        id: Date.now() + 1,
        nm: bd.nm,
        au: profName,
        ao: (profAO ? profAO + ", " : "") + profState,
        reg: profRegion,
        d: bd.d,
        dur: bd.dur,
        aoT: bd.sites,
        v: 0, u: 0, cm: 0,
        ds: bd.desc || bd.nm,
        dt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        src: bd.src === "Generated" ? "AI Generated" : "Hand Built",
        tp: "beatdown",
        tg: bd.tg,
        comments: [],
        secs: bd.secs,
      };
      setSharedItems([...sharedItems, sharedItem]);
      fl("Saved to locker! Shared to community!");
    } else {
      fl("Saved to locker!");
    }
    setVw(null);
    setTab("locker");
  };

  const handleSaveExercise = (ex: { nm: string; tags: string[]; how: string; share: boolean }) => {
    const newEx: LockerExercise = {
      id: Date.now(),
      nm: ex.nm,
      tags: ex.tags,
      how: ex.how,
      src: "Created",
    };
    setLkEx([...lkEx, newEx]);

    if (ex.share) {
      const sharedItem: SharedItem = {
        id: Date.now() + 1,
        nm: ex.nm,
        au: profName,
        ao: (profAO ? profAO + ", " : "") + profState,
        reg: profRegion,
        d: "medium",
        dur: null,
        aoT: [],
        v: 0, u: 0, cm: 0,
        ds: ex.how,
        dt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        src: "Hand Built",
        tp: "exercise",
        et: ex.tags,
        comments: [],
      };
      setSharedItems([...sharedItems, sharedItem]);
      fl("Saved to locker! Shared to community!");
    } else {
      fl("Saved to locker!");
    }
    setVw(null);
    setTab("locker");
  };

  // ════ FULL-SCREEN VIEWS ════
  if (vw === "gen" || vw === "build" || vw === "create-ex") {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0E0E10", fontFamily: "'Outfit', system-ui, sans-serif", paddingTop: 20, paddingBottom: 100, position: "relative" }}>
        {vw === "gen" && <GeneratorScreen onClose={() => setVw(null)} onSave={handleSaveBeatdown} />}
        {vw === "build" && <BuilderScreen onClose={() => setVw(null)} onSave={handleSaveBeatdown} />}
        {vw === "create-ex" && <CreateExerciseScreen onClose={() => setVw(null)} onSave={handleSaveExercise} />}
        {toastEl}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0E0E10", fontFamily: "'Outfit', system-ui, sans-serif", paddingTop: 20, paddingBottom: 100, position: "relative" }}>
      {tab === "home" && (
        <HomeScreen
          profName={profName}
          onProfileTap={() => setTab("profile")}
          onGenerate={() => setVw("gen")}
          onBuild={() => setVw("build")}
          onCreateEx={() => setVw("create-ex")}
        />
      )}
      {tab === "library" && <LibraryScreen sharedItems={sharedItems} profName={profName} />}
      {tab === "locker" && (
        <LockerScreen
          lk={lk}
          setLk={setLk}
          lkEx={lkEx}
          setLkEx={setLkEx}
          lkBm={lkBm}
          onNavigate={(view) => setVw(view)}
        />
      )}
      {tab === "profile" && <ProfileScreen onProfileSaved={checkUser} />}
      <BottomNav active={tab} onTabChange={(t) => { setTab(t); setVw(null); }} />
      {toastEl}
    </div>
  );
}
