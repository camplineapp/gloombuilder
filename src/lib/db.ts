import { createClient } from "@/lib/supabase";
import type { Section } from "@/lib/exercises";

// ════ BEATDOWNS ════

export async function saveBeatdown(data: {
  nm: string;
  desc: string;
  d: string;
  secs: Section[];
  tg: string[];
  src: string;
  dur: string | null;
  sites: string[];
  eq: string[];
  isPublic: boolean;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: result, error } = await supabase
    .from("beatdowns")
    .insert({
      name: data.nm,
      description: data.desc,
      difficulty: data.d,
      duration: data.dur ? parseInt(data.dur) : null,
      site_features: data.sites,
      equipment: data.eq,
      tags: data.tg,
      sections: data.secs,
      created_by: user.id,
      is_public: data.isPublic,
      generated: data.src === "Generated",
    })
    .select()
    .single();

  if (error) {
    console.error("Save beatdown error:", error);
    return null;
  }
  return result;
}

export async function loadMyBeatdowns() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("beatdowns")
    .select("*, inspired_profile:inspired_by(f3_name)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load beatdowns error:", error);
    return [];
  }
  return data || [];
}

export async function loadPublicBeatdowns() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("beatdowns")
    .select("*, profiles:created_by(f3_name, ao, state, region), inspired_profile:inspired_by(f3_name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load public beatdowns error:", error);
    return [];
  }
  return data || [];
}

export async function deleteBeatdown(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("beatdowns")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete beatdown error:", error);
    return false;
  }
  return true;
}

// ════ EXERCISES ════

export async function saveExercise(data: {
  nm: string;
  how: string;
  desc: string;
  tags: string[];
  isPublic: boolean;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Map tags to database fields
  const bodyParts: string[] = [];
  if (data.tags.includes("Core")) bodyParts.push("core");
  if (data.tags.includes("Chest")) bodyParts.push("chest");
  if (data.tags.includes("Arms")) bodyParts.push("arms");
  if (data.tags.includes("Shoulders")) bodyParts.push("shoulders");
  if (data.tags.includes("Legs")) bodyParts.push("legs");
  if (data.tags.includes("Full Body")) bodyParts.push("full_body");

  const { data: result, error } = await supabase
    .from("exercises")
    .insert({
      name: data.nm,
      description: data.desc || data.how,
      how_to: data.how,
      body_part: bodyParts,
      exercise_type: data.tags.includes("Cardio") ? "cardio" : "strength",
      equipment: data.tags.includes("Coupon") ? "coupon" : "none",
      movement_type: data.tags.includes("Static") ? "static_hold" : "dynamic",
      intensity: data.tags.includes("Warm-Up") ? "low" : "medium",
      difficulty: data.tags.includes("Warm-Up") ? 1 : 2,
      site_type: ["any"],
      cadence: "either",
      is_mary: data.tags.includes("Mary"),
      is_transport: data.tags.includes("Transport"),
      source: data.isPublic ? "community" : "private",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Save exercise error:", error);
    return null;
  }
  return result;
}

export async function loadMyExercises() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("exercises")
    .select("*, inspired_profile:inspired_by(f3_name)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load exercises error:", error);
    return [];
  }
  return data || [];
}

export async function deleteExercise(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete exercise error:", error);
    return false;
  }
  return true;
}

export async function loadPublicExercises() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*, profiles:created_by(f3_name, ao, state, region), inspired_profile:inspired_by(f3_name)")
    .eq("source", "community")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load public exercises error:", error);
    return [];
  }
  return data || [];
}

// ════ SHARE (make public after saving) ════

export async function shareBeatdown(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("beatdowns")
    .update({ is_public: true })
    .eq("id", id);

  if (error) {
    console.error("Share beatdown error:", error);
    return false;
  }
  return true;
}

export async function shareExercise(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("exercises")
    .update({ source: "community" })
    .eq("id", id);

  if (error) {
    console.error("Share exercise error:", error);
    return false;
  }
  return true;
}

// ════ UNSHARE (remove from public, delete votes/comments/bookmarks) ════

export async function unshareBeatdown(id: string) {
  const supabase = createClient();

  // Delete votes, comments, and bookmarks for this item
  await supabase.from("votes").delete().eq("item_id", id).eq("item_type", "beatdown");
  await supabase.from("comments").delete().eq("item_id", id).eq("item_type", "beatdown");
  await supabase.from("bookmarks").delete().eq("item_id", id).eq("item_type", "beatdown");

  // Set beatdown back to private
  const { error } = await supabase
    .from("beatdowns")
    .update({ is_public: false })
    .eq("id", id);

  if (error) {
    console.error("Unshare beatdown error:", error);
    return false;
  }
  return true;
}

export async function unshareExercise(id: string) {
  const supabase = createClient();

  // Delete votes, comments, and bookmarks for this item
  await supabase.from("votes").delete().eq("item_id", id).eq("item_type", "exercise");
  await supabase.from("comments").delete().eq("item_id", id).eq("item_type", "exercise");
  await supabase.from("bookmarks").delete().eq("item_id", id).eq("item_type", "exercise");

  // Set exercise back to private
  const { error } = await supabase
    .from("exercises")
    .update({ source: "private" })
    .eq("id", id);

  if (error) {
    console.error("Unshare exercise error:", error);
    return false;
  }
  return true;
}

// ════ LOAD SEED EXERCISES FOR GENERATOR ════

export async function loadSeedExercises() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("name, aliases, description, how_to, body_part, exercise_type, equipment, site_type, cadence, difficulty, intensity, movement_type, is_mary, is_transport, popularity_tier")
    .eq("source", "seed");

  if (error) {
    console.error("Load seed exercises error:", error);
    return [];
  }
  return data || [];
}

// ════ VOTES ════

export async function addVote(itemId: string, itemType: "beatdown" | "exercise") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("votes")
    .insert({ user_id: user.id, item_id: itemId, item_type: itemType });

  if (error) {
    console.error("Add vote error:", error);
    return false;
  }
  return true;
}

export async function removeVote(itemId: string, itemType: "beatdown" | "exercise") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .eq("item_type", itemType);

  if (error) {
    console.error("Remove vote error:", error);
    return false;
  }
  return true;
}

export async function loadUserVotes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("votes")
    .select("item_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Load votes error:", error);
    return [];
  }
  return (data || []).map(v => v.item_id as string);
}

// ════ BOOKMARKS ════

export async function addBookmark(itemId: string, itemType: "beatdown" | "exercise") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, item_id: itemId, item_type: itemType });

  if (error) {
    console.error("Add bookmark error:", error);
    return false;
  }
  return true;
}

export async function removeBookmark(itemId: string, itemType: "beatdown" | "exercise") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .eq("item_type", itemType);

  if (error) {
    console.error("Remove bookmark error:", error);
    return false;
  }
  return true;
}

export async function loadMyBookmarks() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("item_id, item_type")
    .eq("user_id", user.id);

  if (error) {
    console.error("Load bookmarks error:", error);
    return [];
  }
  return data || [];
}

// ════ STEAL ════

export async function stealBeatdown(originalId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Load original
  const { data: original } = await supabase
    .from("beatdowns")
    .select("*")
    .eq("id", originalId)
    .single();

  if (!original) return null;

  // Insert copy
  const { data: copy, error } = await supabase
    .from("beatdowns")
    .insert({
      name: original.name,
      description: original.description,
      difficulty: original.difficulty,
      duration: original.duration,
      site_features: original.site_features,
      equipment: original.equipment,
      tags: original.tags,
      sections: original.sections,
      created_by: user.id,
      is_public: false,
      generated: original.generated,
      inspired_by: original.created_by,
    })
    .select()
    .single();

  if (error) {
    console.error("Steal beatdown error:", error);
    return null;
  }

  // Increment steal_count on original (SECURITY DEFINER not needed — we use direct SQL)
  await supabase.rpc("increment_steal_count", { beatdown_id: originalId });

  return copy;
}

export async function stealExercise(originalId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Load original
  const { data: original } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", originalId)
    .single();

  if (!original) return null;

  // Insert copy
  const { data: copy, error } = await supabase
    .from("exercises")
    .insert({
      name: original.name,
      aliases: original.aliases,
      description: original.description,
      how_to: original.how_to,
      body_part: original.body_part,
      exercise_type: original.exercise_type,
      equipment: original.equipment,
      site_type: original.site_type,
      cadence: original.cadence,
      difficulty: original.difficulty,
      intensity: original.intensity,
      movement_type: original.movement_type,
      is_mary: original.is_mary,
      is_transport: original.is_transport,
      source: "private",
      created_by: user.id,
      inspired_by: original.created_by,
    })
    .select()
    .single();

  if (error) {
    console.error("Steal exercise error:", error);
    return null;
  }

  return copy;
}

// ════ UPDATE EXERCISE ════

export async function updateExercise(id: string, data: {
  nm: string;
  desc?: string;
  how: string;
  tags: string[];
}) {
  const supabase = createClient();

  const bodyParts: string[] = [];
  if (data.tags.includes("Core")) bodyParts.push("core");
  if (data.tags.includes("Chest")) bodyParts.push("chest");
  if (data.tags.includes("Arms")) bodyParts.push("arms");
  if (data.tags.includes("Shoulders")) bodyParts.push("shoulders");
  if (data.tags.includes("Legs")) bodyParts.push("legs");
  if (data.tags.includes("Full Body")) bodyParts.push("full_body");

  const { error } = await supabase
    .from("exercises")
    .update({
      name: data.nm,
      description: data.desc || "",
      how_to: data.how,
      body_part: bodyParts,
      exercise_type: data.tags.includes("Cardio") ? "cardio" : "strength",
      equipment: data.tags.includes("Coupon") ? "coupon" : "none",
      movement_type: data.tags.includes("Static") ? "static_hold" : "dynamic",
      intensity: data.tags.includes("Warm-Up") ? "low" : "medium",
      is_mary: data.tags.includes("Mary"),
      is_transport: data.tags.includes("Transport"),
    })
    .eq("id", id);

  if (error) {
    console.error("Update exercise error:", error);
    return false;
  }
  return true;
}

// ════ COMMENTS ════

export async function addComment(itemId: string, itemType: "beatdown" | "exercise", text: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, item_id: itemId, item_type: itemType, text })
    .select("*, profiles:user_id(f3_name, ao, state)")
    .single();

  if (error) {
    console.error("Add comment error:", error);
    return null;
  }
  return data;
}

export async function loadComments(itemId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles:user_id(f3_name, ao, state)")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load comments error:", error);
    return [];
  }
  return data || [];
}

export async function deleteComment(commentId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Delete comment error:", error);
    return false;
  }
  return true;
}

export async function updateComment(commentId: string, text: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("comments")
    .update({ text })
    .eq("id", commentId);

  if (error) {
    console.error("Update comment error:", error);
    return false;
  }
  return true;
}

// ════ UPDATE BEATDOWN ════

export async function updateBeatdown(id: string, data: {
  nm: string;
  desc: string;
  d: string;
  dur: number | null;
  siteFeatures: string[];
  equipment: string[];
  tags: string[];
  sections: unknown;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("beatdowns")
    .update({
      name: data.nm,
      description: data.desc,
      difficulty: data.d,
      duration: data.dur,
      site_features: data.siteFeatures,
      equipment: data.equipment,
      tags: data.tags,
      sections: data.sections,
    })
    .eq("id", id);

  if (error) {
    console.error("Update beatdown error:", error);
    return false;
  }
  return true;
}

// ═══ V2 SHOUT SYSTEM HELPERS (Session V2-2, April 24, 2026) ═══

// ─── PROFILES ───

export async function getProfileById(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("Get profile error:", error);
    return null;
  }
  return data;
}

export async function getMyProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getProfileById(user.id);
}

// ─── FOLLOWS ───

export async function followUser(followedId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (user.id === followedId) return false; // can't follow self (also enforced by DB CHECK)
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, followed_id: followedId });
  if (error) {
    // 23505 = unique violation = already following, treat as success
    if (error.code === "23505") return true;
    console.error("Follow error:", error);
    return false;
  }
  return true;
}

export async function unfollowUser(followedId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("followed_id", followedId);
  if (error) {
    console.error("Unfollow error:", error);
    return false;
  }
  return true;
}

export async function isFollowing(followedId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followed_id", followedId)
    .maybeSingle();
  if (error) {
    console.error("Is following check error:", error);
    return false;
  }
  return !!data;
}

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followed_id", userId);
  if (error) {
    console.error("Follower count error:", error);
    return 0;
  }
  return count || 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);
  if (error) {
    console.error("Following count error:", error);
    return 0;
  }
  return count || 0;
}

// ─── PROFILE STATS (aggregates for the Q Profile screen) ───

export interface ProfileStats {
  beatdowns: number;
  upvotes: number;
  steals: number;
  followers: number;
  exercises: number;
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = createClient();
  // All counts are SHARED-only per spec (is_public = true)
  // 1. Count of shared beatdowns by this user
  const { count: bdCount } = await supabase
    .from("beatdowns")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .eq("is_public", true);
  // 2. Count of shared exercises by this user
  const { count: exCount } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .eq("is_public", true);
  // 3. Total upvotes received on shared content
  // Get IDs of shared beatdowns + exercises by this user, then count votes against those IDs
  const { data: sharedBds } = await supabase
    .from("beatdowns")
    .select("id")
    .eq("created_by", userId)
    .eq("is_public", true);
  const { data: sharedExs } = await supabase
    .from("exercises")
    .select("id")
    .eq("created_by", userId)
    .eq("is_public", true);
  const ownedIds = [
    ...(sharedBds || []).map((b: { id: string }) => b.id),
    ...(sharedExs || []).map((e: { id: string }) => e.id),
  ];
  let upvotes = 0;
  if (ownedIds.length > 0) {
    const { count: voteCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .in("item_id", ownedIds)
      .eq("vote_type", "up");
    upvotes = voteCount || 0;
  }
  // 4. Steal count: how many times someone else's beatdowns/exercises had this user as inspired_by
  const { count: stealBd } = await supabase
    .from("beatdowns")
    .select("*", { count: "exact", head: true })
    .eq("inspired_by", userId)
    .neq("created_by", userId);
  const { count: stealEx } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("inspired_by", userId)
    .neq("created_by", userId);
  const steals = (stealBd || 0) + (stealEx || 0);
  // 5. Followers
  const followers = await getFollowerCount(userId);
  return {
    beatdowns: bdCount || 0,
    upvotes,
    steals,
    followers,
    exercises: exCount || 0,
  };
}


// ═══ V2-3 SHARED CONTENT FETCHERS (April 24, 2026) ═══

/**
 * Fetch all SHARED (public) beatdowns for a given user.
 * Returns raw Supabase rows; caller should map them to display format.
 * Sorted by vote_count DESC (top-voted first) per UX decision for Q Profile portfolio.
 * Falls back to created_at DESC for ties.
 */
export async function getUserSharedBeatdowns(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("beatdowns")
    .select("*, profiles:created_by(f3_name, ao, state, region), inspired_profile:inspired_by(f3_name)")
    .eq("created_by", userId)
    .eq("is_public", true)
    .order("vote_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Get user shared beatdowns error:", error);
    return [];
  }
  return data || [];
}

/**
 * Fetch all SHARED (public) exercises for a given user.
 * Same sort logic as beatdowns: top-voted first, newest as tiebreaker.
 */
export async function getUserSharedExercises(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*, profiles:created_by(f3_name, ao, state, region), inspired_profile:inspired_by(f3_name)")
    .eq("created_by", userId)
    .eq("is_public", true)
    .order("vote_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Get user shared exercises error:", error);
    return [];
  }
  return data || [];
}

// ═══ V2-5 SHOUT SYSTEM + OWNER-VIEW ALL-ITEMS HELPERS (April 26, 2026) ═══
// APPEND TO END OF src/lib/db.ts
// ─────────────────────────────────────────────────────────────────────

// ─── SHOUTS ───

export interface ShoutRow {
  id: string;
  author_id: string;
  text: string;
  type: string;
  beatdown_id: string | null;
  when_text: string | null;
  when_at: string | null;
  location_text: string | null;
  expires_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  // Joined fields (when selected with profiles join)
  profiles?: {
    f3_name: string;
    ao: string | null;
    state: string | null;
    region: string | null;
  } | null;
  beatdown?: {
    id: string;
    title: string;
  } | null;
}

/**
 * Post a new Shout. Archives any existing un-archived Shout for this user first
 * (only one Active Shout per user at a time).
 * Returns the new shout row, or null on error.
 */
export async function postShout(data: {
  text: string;
  type: string;
  beatdownId?: string | null;
  whenText?: string | null;
  whenAt?: string | null;
  locationText?: string | null;
}): Promise<ShoutRow | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("postShout: no authed user");
    return null;
  }

  // Archive any existing active shout for this user
  await supabase
    .from("shouts")
    .update({ is_archived: true })
    .eq("author_id", user.id)
    .eq("is_archived", false);

  // Compute expires_at = when_at + 12 hours, if when_at provided
  let expiresAt: string | null = null;
  if (data.whenAt) {
    const whenDate = new Date(data.whenAt);
    if (!isNaN(whenDate.getTime())) {
      expiresAt = new Date(whenDate.getTime() + 12 * 60 * 60 * 1000).toISOString();
    }
  }

  const insertPayload = {
    author_id: user.id,
    text: data.text,
    type: data.type,
    beatdown_id: data.beatdownId || null,
    when_text: data.whenText || null,
    when_at: data.whenAt || null,
    location_text: data.locationText || null,
    expires_at: expiresAt,
    is_archived: false,
  };

  const { data: row, error } = await supabase
    .from("shouts")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("postShout error:", error);
    return null;
  }
  return row as ShoutRow;
}

/**
 * Get the single active (un-archived) Shout for a user, or null if none.
 * Joined with author profile and (if attached) beatdown title.
 */
export async function getActiveShoutForUser(userId: string): Promise<ShoutRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shouts")
    .select("*, profiles:author_id(f3_name, ao, state, region), beatdown:beatdown_id(id, title)")
    .eq("author_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getActiveShoutForUser error:", error);
    return null;
  }
  return (data as ShoutRow) || null;
}

/**
 * Get the Feed for the logged-in user: active shouts from people they follow,
 * plus their own active shout, newest first.
 * If the user follows nobody, returns just their own active shout (or empty).
 */
export async function getFeedShouts(): Promise<ShoutRow[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get IDs of people the user follows
  const { data: follows } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", user.id);

  const followedIds = (follows || []).map((f: { followed_id: string }) => f.followed_id);
  // Include the user's own shouts in their feed
  const authorIds = [user.id, ...followedIds];

  const { data, error } = await supabase
    .from("shouts")
    .select("*, profiles:author_id(f3_name, ao, state, region), beatdown:beatdown_id(id, title)")
    .in("author_id", authorIds)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getFeedShouts error:", error);
    return [];
  }
  return (data || []) as ShoutRow[];
}

/**
 * Manually archive a Shout (e.g., user deletes it).
 * Only the author can archive their own shouts (enforced by RLS).
 */
export async function archiveShout(shoutId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("shouts")
    .update({ is_archived: true })
    .eq("id", shoutId);
  if (error) {
    console.error("archiveShout error:", error);
    return false;
  }
  return true;
}

// ─── OWNER-VIEW: ALL ITEMS (V2-5 Locker→Profile merge) ───

/**
 * Fetch ALL beatdowns for a user (shared + private + inspired-by).
 * Used on Q Profile owner-view to replace the Locker tab.
 * Sorted by vote_count DESC then created_at DESC (matches getUserSharedBeatdowns).
 */
export async function getMyAllBeatdowns(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("beatdowns")
    .select("*, profiles:created_by(f3_name, ao, state, region), inspired_profile:inspired_by(f3_name)")
    .eq("created_by", userId)
    .order("vote_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyAllBeatdowns error:", error);
    return [];
  }
  return data || [];
}

/**
 * Fetch ALL exercises for a user (shared + private + inspired-by).
 * Used on Q Profile owner-view to replace the Locker tab.
 */
export async function getMyAllExercises(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*, profiles:created_by(f3_name, ao, state, region), inspired_profile:inspired_by(f3_name)")
    .eq("created_by", userId)
    .order("vote_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyAllExercises error:", error);
    return [];
  }
  return data || [];
}
