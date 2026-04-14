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
    .select("*")
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
    .select("*, profiles:created_by(f3_name, ao, state, region)")
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

  const { data: result, error } = await supabase
    .from("exercises")
    .insert({
      name: data.nm,
      description: data.desc || data.how,
      how_to: data.how,
      body_part: data.tags.filter(t => ["Core", "Chest", "Arms", "Shoulders", "Legs"].includes(t)).map(t => t.toLowerCase()),
      exercise_type: "strength",
      site_type: ["any"],
      cadence: "either",
      difficulty: 2,
      intensity: "medium",
      movement_type: "dynamic",
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
    .select("*")
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
    .select("*, profiles:created_by(f3_name, ao, state, region)")
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

// ════ LOAD SEED EXERCISES FOR GENERATOR ════

export async function loadSeedExercises() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("name, aliases, description, how_to, body_part, exercise_type, equipment, site_type, cadence, difficulty, intensity, movement_type, is_mary, is_transport")
    .eq("source", "seed");

  if (error) {
    console.error("Load seed exercises error:", error);
    return [];
  }
  return data || [];
}
