"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { saveBeatdown, loadMyBeatdowns, deleteBeatdown, saveExercise, loadMyExercises, deleteExercise, loadPublicBeatdowns, loadPublicExercises, shareBeatdown, shareExercise, unshareBeatdown, unshareExercise, addVote, removeVote, loadUserVotes, stealBeatdown, stealExercise, updateExercise, updateBeatdown  } from "@/lib/db";
import type { User } from "@supabase/supabase-js";
import { normalizeSection } from "@/lib/exercises";
import type { Section } from "@/lib/exercises";
import AuthScreen from "@/components/AuthScreen";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import LibraryScreen from "@/components/LibraryScreen";
import ProfileScreen from "@/components/ProfileScreen";
import GeneratorScreen from "@/components/GeneratorScreen";
import BuilderScreen from "@/components/BuilderScreen";
import CreateExerciseScreen from "@/components/CreateExerciseScreen";
import NotepadScreen from "@/components/NotepadScreen";
import LiveModeScreen from "@/components/LiveModeScreen";
import QProfileScreen from "@/components/QProfileScreen";
import PreblastComposer, { type AttachedBeatdown } from "@/components/PreblastComposer";
import CopyModal from "@/components/CopyModal";

export interface LockerBeatdown {
  id: string;
  nm: string;
  dt: string;
  src: string;
  d: string;
  desc: string;
  secs: Section[];
  tg: string[];
  dur?: string | null;
  sites?: string[];
  eq?: string[];
  inspiredBy?: string;
  isPublic?: boolean;
  fromNotepad?: boolean;
}

export interface LockerExercise {
  id: string;
  nm: string;
  desc: string;
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
  auId?: string;  // V2-4: author user UUID for profile navigation
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
  createdAt?: string;  // Item 5: raw ISO for unified-feed sort
  tp: string;
  tg?: string[];
  et?: string[];
  howTo?: string;
  inspiredBy?: string;
  comments: { au: string; ao: string; txt: string; dt: string }[];
  secs?: Section[];
}

// Convert Supabase beatdown row to LockerBeatdown
function dbToLocker(row: Record<string, unknown>): LockerBeatdown {
  const hasInspiredBy = !!(row.inspired_by);
  const inspiredProfile = row.inspired_profile as Record<string, unknown> | null;
  return {
    id: row.id as string,
    nm: (row.name as string) || "",
    dt: new Date(row.created_at as string).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }),
    src: hasInspiredBy ? "Stolen" : (row.generated as boolean) ? "Generated" : "Manual",
    d: (row.difficulty as string) || "medium",
    desc: (row.description as string) || "",
    secs: ((row.sections as Record<string,unknown>[]) || []).map(normalizeSection),
    tg: (row.tags as string[]) || [],
    dur: row.duration ? String(row.duration) + " min" : null,
    sites: (row.site_features as string[]) || [],
    eq: (row.equipment as string[]) || [],
    isPublic: (row.is_public as boolean) || false,
    fromNotepad: (row.from_notepad as boolean) || false,
    inspiredBy: hasInspiredBy ? (inspiredProfile?.f3_name as string) || "a fellow PAX" : undefined,
  };
}

// Convert Supabase beatdown row to SharedItem for Library
function dbToShared(row: Record<string, unknown>): SharedItem {
  const profile = row.profiles as Record<string, unknown> | null;
  const inspiredProfile = row.inspired_profile as Record<string, unknown> | null;
  return {
    id: row.id as string,
    nm: (row.name as string) || "",
    au: (profile?.f3_name as string) || "Unknown",
    auId: (row.created_by as string) || undefined,  // V2-4: extract author UUID
    ao: ((profile?.ao as string) || "") + ((profile?.state as string) ? ", " + (profile?.state as string) : ""),
    reg: (profile?.region as string) || "",
    d: (row.difficulty as string) || "medium",
    dur: (row.duration as number) ? (row.duration as number) + " min" : null,
    aoT: (row.site_features as string[]) || [],
    v: (row.vote_count as number) || 0,
    u: (row.steal_count as number) || 0,
    cm: (row.comment_count as number) || 0,
    ds: (row.description as string) || "",
    dt: new Date(row.created_at as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    createdAt: row.created_at as string | undefined,
    src: (row.generated as boolean) ? "GloomBuilder" : "Hand Built",
    tp: "beatdown",
    tg: (row.tags as string[]) || [],
    inspiredBy: inspiredProfile ? (inspiredProfile.f3_name as string) || undefined : undefined,
    comments: [],
    secs: ((row.sections as Record<string,unknown>[]) || []).map(normalizeSection),
  };
}

// Map raw body_part values to display tags
function mapBodyPartTags(row: Record<string, unknown>): string[] {
  const bodyPart = (row.body_part as string[]) || [];
  const MAP: Record<string, string> = {
    upper: "Chest", lower: "Legs", core: "Core", full_body: "Full Body",
    chest: "Chest", arms: "Arms", shoulders: "Shoulders", legs: "Legs",
  };
  const tags: string[] = [];
  bodyPart.forEach(bp => {
    const mapped = MAP[bp.toLowerCase()];
    if (mapped) tags.push(mapped);
  });
  if (row.is_mary) tags.push("Mary");
  if (row.is_transport) tags.push("Transport");
  if ((row.exercise_type as string) === "cardio") tags.push("Cardio");
  if ((row.equipment as string) === "coupon") tags.push("Coupon");
  if ((row.movement_type as string) === "static_hold") tags.push("Static");
  if ((row.intensity as string) === "low") tags.push("Warm-Up");
  return [...new Set(tags)];
}

// Convert Supabase exercise row to LockerExercise
function dbToExercise(row: Record<string, unknown>): LockerExercise {
  const hasInspiredBy = !!(row.inspired_by);
  const inspiredProfile = row.inspired_profile as Record<string, unknown> | null;
  return {
    id: row.id as string,
    nm: (row.name as string) || "",
    desc: (row.description as string) || "",
    tags: mapBodyPartTags(row),
    how: (row.how_to as string) || "",
    src: hasInspiredBy ? "Stolen" : (row.source as string) || "community",
    shared: (row.source as string) === "community",
    inspiredBy: hasInspiredBy ? (inspiredProfile?.f3_name as string) || "a fellow PAX" : undefined,
  };
}

export default function App() {
  const [tab, setTab] = useState<"home" | "library" | "profile">("home");
  const [vw, setVw] = useState<string | null>(null);
  const [editingBd, setEditingBd] = useState<LockerBeatdown | null>(null);
  const [editingEx, setEditingEx] = useState<LockerExercise | null>(null);
  const [liveBd, setLiveBd] = useState<LockerBeatdown | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<{ f3_name: string; ao: string; state: string; region: string } | null>(null);
  const [toast, setToast] = useState("");

  // V2-4: which Q's profile is being viewed (null = own profile)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  // V2-4.5: tracks whether edit-bd was opened from Q Profile (back button returns there)
  const [editFromQProfile, setEditFromQProfile] = useState(false);
  // V2-5: bumped after a Shout is posted to trigger Feed re-fetch
  // V2-5: when set, ShoutComposer opens in EDIT mode prefilled with this shout

  // Locker state — loaded from Supabase
  const [lk, setLk] = useState<LockerBeatdown[]>([]);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [preblastOpen, setPreblastOpen] = useState(false);
  const [preblastBd, setPreblastBd] = useState<AttachedBeatdown | null>(null);
  const [lkEx, setLkEx] = useState<LockerExercise[]>([]);

  // Library shared items — loaded from Supabase
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // Item 3: lifted modal states (hardware back support)
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyModalContext, setCopyModalContext] = useState<{
    source: "builder" | "generator" | "library";
    secs: Section[];
    beatdownName: string;
    beatdownDesc: string;
    inspiredBy?: string;
  } | null>(null);

  // Item 3: tracking state for child-internal modals (callbacks from children)
  const [libDetOpen, setLibDetOpen] = useState(false);
  const [liveActive, setLiveActive] = useState(false);

  // Item 3: saving-in-flight guard for popstate
  const [savingInFlight, setSavingInFlight] = useState(false);

  // Item 3: refs for callback-driven children
  const libraryCloseRequestRef = useRef<(() => void) | null>(null);
  const liveBackRequestRef = useRef<(() => void) | null>(null);

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
      const ip = row.inspired_profile as Record<string, unknown> | null;
      return {
        id: row.id as string,
        nm: (row.name as string) || "",
        au: (p?.f3_name as string) || "Unknown",
        auId: (row.created_by as string) || undefined,  // V2-4: author UUID
        ao: ((p?.ao as string) || "") + ((p?.state as string) ? ", " + (p?.state as string) : ""),
        reg: (p?.region as string) || "",
        d: "medium",
        dur: null,
        aoT: [] as string[],
        v: (row.vote_count as number) || 0, u: 0, cm: (row.comment_count as number) || 0,
        ds: (row.description as string) || (row.how_to as string) || "",
        howTo: (row.how_to as string) || "",
        dt: new Date(row.created_at as string).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        createdAt: row.created_at as string | undefined,
        src: "Hand Built",
        tp: "exercise",
        et: mapBodyPartTags(row as Record<string, unknown>),
        inspiredBy: ip ? (ip.f3_name as string) || undefined : undefined,
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
  // Community exercises derived from sharedItems for Builder search
  const communityExercises = useMemo(() =>
    sharedItems.filter(si => si.tp === "exercise").map(si => ({
      nm: si.nm, desc: si.ds || "", tags: si.et || [], how: si.howTo || "",
    })),
    [sharedItems]
  );

  useEffect(() => {
    if (user) {
      loadLocker();
      loadLibrary();
      loadUserVotes().then(ids => setUserVotes(new Set(ids)));
    }
  }, [user, loadLocker, loadLibrary]);

  // Item 3: pushState whenever a back-able state opens — keeps history stack aligned
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (preblastOpen) window.history.pushState({ gb: "preblast" }, "");
  }, [preblastOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (copyModalOpen) window.history.pushState({ gb: "copyModal" }, "");
  }, [copyModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (libDetOpen) window.history.pushState({ gb: "libDet" }, "");
  }, [libDetOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (vw !== null) window.history.pushState({ gb: "vw:" + vw }, "");
  }, [vw]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (tab !== "home") window.history.pushState({ gb: "tab:" + tab }, "");
  }, [tab]);

  // Item 3: centralized popstate handler — Android hardware back routing
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState({ gb: "root" }, "");

    const onPopState = (_e: PopStateEvent) => {
      // Saving in flight — silently re-push and ignore
      if (savingInFlight) {
        window.history.pushState({ gb: "guard" }, "");
        return;
      }

      // Priority order: most-recently-opened thing closes first

      // 1. Preblast composer (overlay above everything)
      if (preblastOpen) {
        setPreblastOpen(false);
        setPreblastBd(null);
        window.history.pushState({ gb: "level" }, "");
        return;
      }

      // 2. Copy modal (Backblast modal, lifted to page.tsx)
      if (copyModalOpen) {
        setCopyModalOpen(false);
        setCopyModalContext(null);
        window.history.pushState({ gb: "level" }, "");
        return;
      }

      // 3. Library detail view (internal to LibraryScreen — request close via callback)
      if (libDetOpen && tab === "library") {
        libraryCloseRequestRef.current?.();
        window.history.pushState({ gb: "level" }, "");
        return;
      }

      // 4. Live Mode active workout — request exit confirm via callback
      if (vw === "live" && liveActive) {
        liveBackRequestRef.current?.();
        window.history.pushState({ gb: "level" }, "");
        return;
      }

      // 5. Full-screen views (vw !== null) — replicate existing close handlers
      if (vw === "live") {
        setVw(null);
        setLiveBd(null);
        window.history.pushState({ gb: "level" }, "");
        return;
      }
      if (vw === "edit-bd") {
        if (editFromQProfile) {
          setEditFromQProfile(false);
          setEditingBd(null);
          setVw("q-profile");
        } else {
          setVw(null);
          setEditingBd(null);
        }
        window.history.pushState({ gb: "level" }, "");
        return;
      }
      if (vw === "q-profile") {
        setVw(null);
        setViewingUserId(null);
        window.history.pushState({ gb: "level" }, "");
        return;
      }
      if (vw !== null) {
        setVw(null);
        window.history.pushState({ gb: "level" }, "");
        return;
      }

      // 6. Tab navigation (vw === null) — Library or Profile back to Home
      if (tab === "library" || tab === "profile") {
        setTab("home");
        window.history.pushState({ gb: "level" }, "");
        return;
      }

      // 7. Already at root — fall through to OS exit
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    preblastOpen, copyModalOpen, libDetOpen, vw, liveActive,
    tab, editFromQProfile, savingInFlight,
  ]);

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

  // V2-4: open someone's Q Profile (null userId = own profile)
  const handleOpenProfile = (targetUserId?: string | null) => {
    if (targetUserId && targetUserId !== user.id) {
      setViewingUserId(targetUserId);
      setVw("q-profile");
    } else {
      setViewingUserId(null);
      setVw(null);
      setTab("profile");
    }
  };

  const handleSaveBeatdown = async (bd: { nm: string; desc: string; d: string; secs: Section[]; tg: string[]; src?: string; dur: string | null; sites: string[]; eq: string[]; share?: boolean; isPublic?: boolean; fromNotepad?: boolean }): Promise<string | null> => {
    setSavingInFlight(true);
    try {
      const isPublic = bd.isPublic ?? bd.share ?? false;
      const result = await saveBeatdown({
        nm: bd.nm,
        desc: bd.desc,
        d: bd.d || "medium",
        secs: bd.secs,
        tg: bd.tg,
        src: bd.src ?? "Manual",
        dur: bd.dur,
        sites: bd.sites,
        eq: bd.eq,
        isPublic,
        fromNotepad: bd.fromNotepad ?? false,
      });

      if (result) {
        await loadLocker();
        if (isPublic) {
          await loadLibrary();
          fl("Saved! Shared to community!");
        } else {
          fl("Saved!");
        }
        return (result as { id?: string }).id || null;
      } else {
        fl("Error saving — try again");
        return null;
      }
    } finally {
      setSavingInFlight(false);
    }
  };

  const handleSaveExercise = async (ex: { nm: string; tags: string[]; how: string; desc: string; share: boolean }): Promise<void> => {
    setSavingInFlight(true);
    try {
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
          fl("Saved! Shared to community!");
        } else {
          fl("Saved!");
        }
      } else {
        fl("Error saving — try again");
      }
    } finally {
      setSavingInFlight(false);
    }
  };

  const handleDeleteBeatdown = async (id: string) => {
    setProfileRefreshKey(k => k + 1);
    const success = await deleteBeatdown(id);
    if (success) {
      setLk(lk.filter(b => b.id !== id));
      await loadLibrary();
      setProfileRefreshKey(k => k + 1);
      fl("Deleted");
    } else {
      fl("Error deleting");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const success = await deleteExercise(id);
    if (success) {
      setLkEx(lkEx.filter(e => e.id !== id));
      await loadLibrary();
      setProfileRefreshKey(k => k + 1);
      fl("Deleted");
    } else {
      fl("Error deleting");
    }
  };

  const handleShareBeatdown = async (id: string) => {
    const success = await shareBeatdown(id);
    if (success) {
      setLk(lk.map(b => b.id === id ? { ...b, isPublic: true } : b));
      if (editingBd && editingBd.id === id) {
        setEditingBd({ ...editingBd, isPublic: true });
      }
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
      if (editingEx && editingEx.id === id) {
        setEditingEx({ ...editingEx, shared: true });
      }
      await loadLibrary();
      fl("Shared to community!");
    } else {
      fl("Error sharing");
    }
  };

  const handleUnshareBeatdown = async (id: string) => {
    const success = await unshareBeatdown(id);
    if (success) {
      setLk(lk.map(b => b.id === id ? { ...b, isPublic: false } : b));
      if (editingBd && editingBd.id === id) {
        setEditingBd({ ...editingBd, isPublic: false });
      }
      await loadLibrary();
      fl("Removed from Library");
    } else {
      fl("Error unsharing");
    }
  };

  const handleUnshareExercise = async (id: string) => {
    const success = await unshareExercise(id);
    if (success) {
      setLkEx(lkEx.map(e => e.id === id ? { ...e, shared: false } : e));
      if (editingEx && editingEx.id === id) {
        setEditingEx({ ...editingEx, shared: false });
      }
      await loadLibrary();
      fl("Removed from Library");
    } else {
      fl("Error unsharing");
    }
  };

  const handleUpdateExercise = async (id: string, data: { nm: string; desc?: string; how: string; tags: string[] }): Promise<boolean> => {
    setSavingInFlight(true);
    try {
      const success = await updateExercise(id, data);
      if (success) {
        await loadLocker();
        await loadLibrary();
        fl("Exercise saved!");
        return true;
      } else {
        fl("Error saving");
        return false;
      }
    } finally {
      setSavingInFlight(false);
    }
  };

  const handleEditBeatdown = (bd: LockerBeatdown) => {
    setEditingBd(bd);
    setVw("edit-bd");
  };

  const handleRunBeatdown = (bd: LockerBeatdown) => {
    setLiveBd(bd);
    setVw("live");
  };

  // Run a shared beatdown from the Library (read-only, no save)
  const handleRunLibraryBeatdown = (item: { nm: string; au: string; ao: string; d: string; dur: string | null; secs?: { label: string; color: string; exercises: { n: string; r: string; c: string; nt: string }[]; note: string }[]; tg?: string[] }) => {
    if (!item.secs || item.secs.length === 0) return;
    const secs = item.secs.map(s => normalizeSection(s as unknown as Record<string, unknown>));
    setLiveBd({
      id: "library-run",
      nm: item.nm,
      dt: "",
      src: "Library",
      d: item.d || "medium",
      desc: "",
      secs,
      tg: item.tg || [],
      isPublic: false,
      inspiredBy: item.au,
    });
    setVw("live");
  };

  const handleUpdateBeatdown = async (id: string, data: { nm: string; desc: string; d: string; secs: Section[]; tg: string[]; dur: string | null; sites: string[]; eq: string[] }): Promise<boolean> => {
    setSavingInFlight(true);
    try {
      const durNum = data.dur ? parseInt(data.dur) : null;
      const success = await updateBeatdown(id, { nm: data.nm, desc: data.desc, d: data.d, dur: durNum, siteFeatures: data.sites, equipment: data.eq, tags: data.tg, sections: data.secs });
      if (success) {
        await loadLocker();
        await loadLibrary();
        fl("Beatdown saved!");
        return true;
      } else {
        fl("Error saving");
        return false;
      }
    } finally {
      setSavingInFlight(false);
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

  const handleSteal = async (itemId: string, itemType: "beatdown" | "exercise") => {
    if (itemType === "beatdown") {
      const copy = await stealBeatdown(itemId);
      if (copy) {
        await loadLocker();
        await loadLibrary();
        fl("Stolen!");
      } else {
        fl("Steal failed");
      }
    } else {
      const copy = await stealExercise(itemId);
      if (copy) {
        await loadLocker();
        fl("Stolen!");
      } else {
        fl("Steal failed");
      }
    }
  };

  // V2-4.5: Q Profile beatdown card tap → open Edit Beatdown form (own only)
  // Visitor-flow (other Q's beatdowns) deferred to V2-5 when there's content to test against.
  const handleOpenBeatdownDetail = (beatdownId: string) => {
    if (viewingUserId !== null) {
      // Visitor profile — not yet wired in V2-4.5
      fl("Coming soon");
      return;
    }
    const bd = lk.find(b => b.id === beatdownId);
    if (!bd) {
      fl("Beatdown not found");
      return;
    }
    setEditingBd(bd);
    setEditFromQProfile(true);
    setVw("edit-bd");
  };

  // Item 5B: Q Profile exercise card tap → open Edit Exercise form (own only)
  const handleOpenExerciseDetail = (exerciseId: string) => {
    if (viewingUserId !== null) {
      fl("Coming soon");
      return;
    }
    const found = lkEx.find(e => e.id === exerciseId);
    if (!found) {
      fl("Exercise not found");
      return;
    }
    setEditingEx(found);
    setVw("edit-ex");
  };

  // ===== FULL-SCREEN VIEWS =====
  if (vw === "gen" || vw === "build" || vw === "create-ex" || vw === "edit-bd" || vw === "edit-ex" || vw === "live" || vw === "q-profile" || vw === "settings" || vw === "notepad") {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#0E0E10", fontFamily: "'Outfit', system-ui, sans-serif", paddingTop: vw === "live" ? 0 : 20, paddingBottom: vw === "live" ? 0 : 100, position: "relative" }}>
        {vw === "gen" && <GeneratorScreen onClose={() => setVw(null)} onSave={handleSaveBeatdown} profName={profName} userExercises={lkEx} communityExercises={communityExercises} onSendPreblast={(bd) => { setPreblastBd(bd); setPreblastOpen(true); }} onOpenCopyModal={(ctx) => { setCopyModalContext({ source: "generator", ...ctx }); setCopyModalOpen(true); }} onRunThis={async (secs, title, dur, saveData) => {
          // Save to locker WITHOUT resetting view
          if (saveData) {
            const result = await saveBeatdown({ nm: saveData.nm, desc: saveData.desc, d: saveData.d, secs: saveData.secs, tg: saveData.tg, src: saveData.src, dur: saveData.dur, sites: saveData.sites, eq: saveData.eq, isPublic: saveData.share || false });
            if (result) { await loadLocker(); if (saveData.share) await loadLibrary(); fl("Saved!"); }
          }
          setLiveBd({ id: "temp", nm: title, dt: "", src: "Generated", d: "medium", desc: "", secs, tg: [dur], isPublic: false });
          setVw("live");
        }} />}
        {vw === "build" && <BuilderScreen onClose={() => setVw(null)} onSave={handleSaveBeatdown} profName={profName} userExercises={lkEx} communityExercises={communityExercises} onSendPreblast={(bd) => { setPreblastBd(bd); setPreblastOpen(true); }} onOpenCopyModal={(ctx) => { setCopyModalContext({ source: "builder", ...ctx }); setCopyModalOpen(true); }} onSavedNew={(newId) => { const justSaved = lk.find(b => b.id === newId); if (justSaved) { setEditingBd(justSaved); setVw("edit-bd"); } }} onRunThis={async (secs, title, dur, saveData) => {
          if (saveData) {
            const result = await saveBeatdown({ nm: saveData.nm, desc: saveData.desc, d: saveData.d, secs: saveData.secs, tg: saveData.tg, src: saveData.src, dur: saveData.dur, sites: saveData.sites, eq: saveData.eq, isPublic: saveData.share || false });
            if (result) { await loadLocker(); if (saveData.share) await loadLibrary(); fl("Saved!"); }
          }
          setLiveBd({ id: "temp", nm: title, dt: "", src: "Manual", d: "medium", desc: "", secs, tg: [dur], isPublic: false });
          setVw("live");
        }} />}
        {vw === "create-ex" && <CreateExerciseScreen onClose={() => setVw(null)} onSave={handleSaveExercise} />}
        {vw === "notepad" && <NotepadScreen
          onClose={() => setVw(null)}
          onSave={handleSaveBeatdown}
          onSavedNew={(newId) => {
            const justSaved = lk.find(b => b.id === newId);
            if (justSaved) {
              setEditingBd(justSaved);
              setVw("edit-bd");
            }
          }}
          userExercises={lkEx}
          profName={profName}
        />}
        {vw === "edit-bd" && editingBd && <BuilderScreen
          onClose={() => {
            if (editFromQProfile) {
              // Came from Q Profile — return there
              setEditFromQProfile(false);
              setEditingBd(null);
              setVw("q-profile");
            } else {
              // Came from Locker — return there (existing behavior)
              setVw(null);
              setEditingBd(null);
            }
          }}
          backLabel={editFromQProfile ? ("← " + (profName || "profile") + "'s profile") : undefined}
          profName={profName}
          onSave={handleSaveBeatdown}
          editData={{
            id: editingBd.id,
            nm: editingBd.nm,
            desc: editingBd.desc,
            d: editingBd.d,
            secs: editingBd.secs,
            tg: editingBd.tg,
            dur: editingBd.dur || null,
            sites: editingBd.sites || [],
            eq: editingBd.eq || [],
            isPublic: editingBd.isPublic,
          }}
          onUpdate={handleUpdateBeatdown}
          userExercises={lkEx}
          communityExercises={communityExercises}
          onRunBeatdown={() => { handleRunBeatdown(editingBd); }}
          onShareBeatdown={() => { handleShareBeatdown(editingBd.id); }}
          onUnshareBeatdown={() => { setVw(null); setEditingBd(null); handleUnshareBeatdown(editingBd.id); }}
          onDeleteBeatdown={() => { if (confirm("Delete this beatdown? This can't be undone.")) { setVw(null); setEditingBd(null); handleDeleteBeatdown(editingBd.id); } }}
          onSendPreblast={(bd) => { setPreblastBd(bd); setPreblastOpen(true); }}
          onOpenCopyModal={(ctx) => { setCopyModalContext({ source: "builder", ...ctx }); setCopyModalOpen(true); }}
        />}
        {vw === "edit-ex" && editingEx && <CreateExerciseScreen
          onClose={() => { setVw(null); setEditingEx(null); }}
          onSave={handleSaveExercise}
          editData={{
            id: editingEx.id,
            nm: editingEx.nm,
            desc: editingEx.desc,
            how: editingEx.how,
            tags: editingEx.tags,
            isPublic: editingEx.shared || false,
          }}
          onUpdate={handleUpdateExercise}
          onShareExercise={() => handleShareExercise(editingEx.id)}
          onUnshareExercise={() => handleUnshareExercise(editingEx.id)}
          onDeleteExercise={() => {
            if (confirm("Delete this exercise? This can't be undone.")) {
              setVw(null);
              setEditingEx(null);
              handleDeleteExercise(editingEx.id);
            }
          }}
        />}
        {vw === "live" && liveBd && <LiveModeScreen
          beatdownTitle={liveBd.nm}
          qName={profName || "Q"}
          ao={profAO || "F3"}
          duration={liveBd.tg.find(t => t.includes("min")) || "45 min"}
          sections={liveBd.secs}
          inspiredBy={liveBd.inspiredBy}
          userExercises={lkEx}
          onClose={() => { setVw(null); setLiveBd(null); }}
          onLiveActiveChange={(active) => setLiveActive(active)}
          registerBackHandler={(handler) => { liveBackRequestRef.current = handler; }}
        />}
        {vw === "q-profile" && user && (
          <QProfileScreen
            userId={viewingUserId || user.id}
            currentUserId={user.id}
            onClose={() => { setVw(null); setViewingUserId(null); }}
            onOpenSettings={viewingUserId ? undefined : () => { setVw(null); setTab("profile"); }}
            onOpenBeatdownDetail={handleOpenBeatdownDetail}
            onOpenExerciseDetail={handleOpenExerciseDetail}
          refreshKey={profileRefreshKey}
          />
        )}
        {vw === "settings" && (
          <ProfileScreen onProfileSaved={() => { checkUser(); setVw(null); }} onClose={() => setVw(null)} />
        )}
        {preblastOpen && <PreblastComposer onClose={() => { setPreblastOpen(false); setPreblastBd(null); }} qName={profName || "Q"} ao={profAO || ""} attachedBeatdown={preblastBd} userBeatdowns={lk} />}
        {copyModalOpen && copyModalContext && (
          <CopyModal
            secs={copyModalContext.secs}
            beatdownName={copyModalContext.beatdownName}
            beatdownDesc={copyModalContext.beatdownDesc}
            qName={profName || "Q"}
            inspiredBy={copyModalContext.inspiredBy}
            onClose={() => { setCopyModalOpen(false); setCopyModalContext(null); }}
            onToast={fl}
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
          profName={profName}
          onProfileTap={() => handleOpenProfile(null)}
          onGenerate={() => setVw("gen")}
          onSendPreblast={() => { setPreblastBd(null); setPreblastOpen(true); }}
          onBuild={() => setVw("build")}
          onCreateNotepad={() => setVw("notepad")}
          onCreateEx={() => setVw("create-ex")}
        />
      )}
      {tab === "library" && <LibraryScreen sharedItems={sharedItems} profName={profName} userVotes={userVotes} onToggleVote={handleToggleVote} onSteal={handleSteal} onRunBeatdown={handleRunLibraryBeatdown} onRefresh={loadLibrary} onOpenProfile={handleOpenProfile} currentUserId={user.id} onSendPreblast={(bd) => { setPreblastBd(bd); setPreblastOpen(true); }} onLibDetChange={(open) => setLibDetOpen(open)} registerBackHandler={(handler) => { libraryCloseRequestRef.current = handler; }} />}
      {tab === "profile" && user && (
        <QProfileScreen
          userId={user.id}
          currentUserId={user.id}
          onClose={() => setTab("home")}
          onOpenSettings={() => setVw("settings")}
          onOpenBeatdownDetail={handleOpenBeatdownDetail}
          onOpenExerciseDetail={handleOpenExerciseDetail}
          refreshKey={profileRefreshKey}
        />
      )}
            <BottomNav active={tab} onTabChange={(t) => { setTab(t); setVw(null); }} />
      {preblastOpen && <PreblastComposer onClose={() => { setPreblastOpen(false); setPreblastBd(null); }} qName={profName || "Q"} ao={profAO || ""} attachedBeatdown={preblastBd} userBeatdowns={lk} />}
      {copyModalOpen && copyModalContext && (
        <CopyModal
          secs={copyModalContext.secs}
          beatdownName={copyModalContext.beatdownName}
          beatdownDesc={copyModalContext.beatdownDesc}
          qName={profName || "Q"}
          inspiredBy={copyModalContext.inspiredBy}
          onClose={() => { setCopyModalOpen(false); setCopyModalContext(null); }}
          onToast={fl}
        />
      )}
      {toastEl}
    </div>
  );
}
