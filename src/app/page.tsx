"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { saveBeatdown, loadMyBeatdowns, deleteBeatdown, saveExercise, loadMyExercises, deleteExercise, loadPublicBeatdowns, loadPublicExercises, shareBeatdown, shareExercise, addVote, removeVote, loadUserVotes } from "@/lib/db";
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
  id: string;
  nm: string;
  dt: string;
  src: string;
  d: string;
  desc: string;
  secs: Section[];
  tg: string[];
  inspiredBy?: string;
  isPublic?: boolean;
}

export interface LockerExercise {
  id: string;
  nm: string;
  tags: string[];
  how: string;
  src: string;
  inspiredBy?: string;
  shared?: boolean;
}

export interface SharedItem {
  id: string;
  src: string;
  nm: string;
  au: string;
  ao: string;
  reg: string;
  d: string;
  dur: string | null;
  aoT: string[];
  v: number;
  u: number;
  cm: number;
  ds: string;
  dt: string;
  tp: string;
  tg?: string[];
  et?: string[];
  howTo?: string;
  comments: { au: string; ao: string; txt: string; dt: string }[];
  secs?: Section[];
}

// Convert Supabase beatdown row to LockerBeatdown
function dbToLocker(row: Record<string, unknown>): LockerBeatdown {
  return {
    id: row.id as string,
    nm: (row.name as string) || "",
    dt: new Date(row.created_at as string).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }),
    src: (row.generated as boolean) ? "Generated" : "Manual",
    d: (row.difficulty as string) || "medium",
    desc: (row.description as string) || "",
    secs: (row.sections as Section[]) || [],
    tg: (row.tags as string[]) || [],
    isPublic: (row.is_public as boolean) || false,
  };
}

// Convert Supabase beatdown row to SharedItem for Library
function dbToShared(row: Record<string, unknown>): SharedItem {
  const profile = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    nm: (row.name as string) || "",
    au: (profile?.f3_name as string) || "Unknown",
    ao: ((profile?.ao as string) || "") + ((profile?.state as string) ? ", " + (profile?.state as string) : ""),
    reg: (profile?.region as string) || "",
    d: (row.difficulty as string) || "medium",
    dur: (row.duration as number) ? (row.duration as number) + " min" : null,
    aoT: (row.site_features as string[]) || [],
    v: (row.vote_count as number) || 0,
    u: (row.steal_count as number) || 0,
    cm: 0,
    ds: (row.description as string) || "",
    dt: new Date(row.created_at as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    src: (row.generated as boolean) ? "GloomBuilder" : "Hand Built",
    tp: "beatdown",
    tg: (row.tags as string[]) || [],
    comments: [],
    secs: (row.sections as Section[]) || [],
  };
}

// Convert Supabase exercise row to LockerExercise
function dbToExercise(row: Record<string, unknown>): LockerExercise {
  return {
    id: row.id as string,
    nm: (row.name as string) || "",
    tags: (row.body_part as string[]) || [],
    how: (row.how_to as string) || (row.description as string) || "",
    src: (row.source as string) || "community",
    shared: (row.source as string) === "community",
  };
}

export default function App() {
  const [tab, setTab] = useState<"home" | "library" | "locker" | "profile">("home");
  const [vw, setVw] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<{ f3_name: string; ao: string; state: string; region: string } | null>(null);
  const [toast, setToast] = useState("");

  // Locker state — loaded from Supabase
  const [lk, setLk] = useState<LockerBeatdown[]>([]);
  const [lkEx, setLkEx] = useState<LockerExercise[]>([]);
  const [lkBm, setLkBm] = useState<never[]>([]);

  // Library shared items — loaded from Supabase
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

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

  // Load locker data from Supabase
  const loadLocker = useCallback(async () => {
    const beatdowns = await loadMyBeatdowns();
    setLk(beatdowns.map(dbToLocker));

    const exercises = await loadMyExercises();
    setLkEx(exercises.map(dbToExercise));
  }, []);

  // Load library data from Supabase
  const loadLibrary = useCallback(async () => {
    const publicBeatdowns = await loadPublicBeatdowns();
    const publicExercises = await loadPublicExercises();
    const bdItems = publicBeatdowns.map(dbToShared);
    const exItems: SharedItem[] = publicExercises.map((row: Record<string, unknown>) => {
      const p = row.profiles as Record<string, unknown> | null;
      return {
        id: row.id as string,
        nm: (row.name as string) || "",
        au: (p?.f3_name as string) || "Unknown",
        ao: ((p?.ao as string) || "") + ((p?.state as string) ? ", " + (p?.state as string) : ""),
        reg: (p?.region as string) || "",
        d: "medium",
        dur: null,
        aoT: [] as string[],
        v: (row.vote_count as number) || 0, u: 0, cm: 0,
        ds: (row.description as string) || (row.how_to as string) || "",
        howTo: (row.how_to as string) || "",
        dt: new Date(row.created_at as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        src: "Hand Built",
        tp: "exercise",
        et: (row.body_part as string[]) || [],
        comments: [],
        secs: [],
      };
    });
    setSharedItems([...bdItems, ...exItems]);
  }, []);

  useEffect(() => {
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });
    return () => { listener.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data after user is confirmed
  useEffect(() => {
    if (user) {
      loadLocker();
      loadLibrary();
      loadUserVotes().then(ids => setUserVotes(new Set(ids)));
    }
  }, [user, loadLocker, loadLibrary]);

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

  const handleSaveBeatdown = async (bd: { nm: string; desc: string; d: string; secs: Section[]; tg: string[]; src: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean }) => {
    const result = await saveBeatdown({
      nm: bd.nm,
      desc: bd.desc,
      d: bd.d,
      secs: bd.secs,
      tg: bd.tg,
      src: bd.src,
      dur: bd.dur,
      sites: bd.sites,
      eq: bd.eq,
      isPublic: bd.share || false,
    });

    if (result) {
      // Reload from database to get fresh data
      await loadLocker();
      if (bd.share) {
        await loadLibrary();
        fl("Saved to locker! Shared to community!");
      } else {
        fl("Saved to locker!");
      }
    } else {
      fl("Error saving — try again");
    }
    setVw(null);
    setTab("locker");
  };

  const handleSaveExercise = async (ex: { nm: string; tags: string[]; how: string; desc: string; share: boolean }) => {
    const result = await saveExercise({
      nm: ex.nm,
      how: ex.how,
      desc: ex.desc,
      tags: ex.tags,
      isPublic: ex.share,
    });

    if (result) {
      await loadLocker();
      if (ex.share) {
        await loadLibrary();
        fl("Saved to locker! Shared to community!");
      } else {
        fl("Saved to locker!");
      }
    } else {
      fl("Error saving — try again");
    }
    setVw(null);
    setTab("locker");
  };

  const handleDeleteBeatdown = async (id: string) => {
    const success = await deleteBeatdown(id);
    if (success) {
      setLk(lk.filter(b => b.id !== id));
      fl("Deleted");
    } else {
      fl("Error deleting");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const success = await deleteExercise(id);
    if (success) {
      setLkEx(lkEx.filter(e => e.id !== id));
      fl("Deleted");
    } else {
      fl("Error deleting");
    }
  };

  const handleShareBeatdown = async (id: string) => {
    const success = await shareBeatdown(id);
    if (success) {
      setLk(lk.map(b => b.id === id ? { ...b, isPublic: true } : b));
      await loadLibrary();
      fl("Shared to community!");
    } else {
      fl("Error sharing");
    }
  };

  const handleShareExercise = async (id: string) => {
    const success = await shareExercise(id);
    if (success) {
      setLkEx(lkEx.map(e => e.id === id ? { ...e, shared: true } : e));
      await loadLibrary();
      fl("Shared to community!");
    } else {
      fl("Error sharing");
    }
  };

  const handleToggleVote = async (itemId: string, itemType: "beatdown" | "exercise" = "beatdown") => {
    const isVoted = userVotes.has(itemId);
    // Optimistic update
    const newVotes = new Set(userVotes);
    if (isVoted) {
      newVotes.delete(itemId);
    } else {
      newVotes.add(itemId);
    }
    setUserVotes(newVotes);

    // Update server
    const success = isVoted ? await removeVote(itemId, itemType) : await addVote(itemId, itemType);
    if (success) {
      // Reload library to get updated vote_count from trigger
      await loadLibrary();
    } else {
      // Revert on failure
      setUserVotes(userVotes);
      fl("Vote failed — try again");
    }
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
      {tab === "library" && <LibraryScreen sharedItems={sharedItems} profName={profName} userVotes={userVotes} onToggleVote={handleToggleVote} />}
      {tab === "locker" && (
        <LockerScreen
          lk={lk}
          setLk={setLk}
          lkEx={lkEx}
          setLkEx={setLkEx}
          lkBm={lkBm}
          onNavigate={(view) => setVw(view)}
          onDeleteBeatdown={handleDeleteBeatdown}
          onDeleteExercise={handleDeleteExercise}
          onShareBeatdown={handleShareBeatdown}
          onShareExercise={handleShareExercise}
        />
      )}
      {tab === "profile" && <ProfileScreen onProfileSaved={checkUser} />}
      <BottomNav active={tab} onTabChange={(t) => { setTab(t); setVw(null); }} />
      {toastEl}
    </div>
  );
}
