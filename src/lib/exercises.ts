// Exercise database and generator
export interface ExerciseData {
  n: string; // name
  f: string; // full name / alias
  t: string[]; // tags
  s: string[]; // site requirements
  h: string; // how-to
  d?: string; // short description
  df?: number; // difficulty level 1-3
  pt?: number; // popularity tier: 1=classic, 2=well-known, 3=exotic
  ix?: string; // intensity: low, medium, high
  cr?: boolean; // is_core: true = curated core exercise every PAX knows (60 exercises)
  // Item 5: Library unification fields (optional — only populated for Supabase-derived rows)
  id?: string;
  source?: "seed" | "community";
  createdAt?: string;
  createdBy?: string;
  creatorName?: string;
  voteCount?: number;
  commentCount?: number;
}

// Local fallback exercises (45) — used if Supabase load fails
export const EX: ExerciseData[] = [
  { n:"SSH",f:"Side Straddle Hop",t:["Cardio","Warm-Up"],s:[],h:"Jump feet apart while raising arms overhead. Jump back to start." },
  { n:"Imperial Walker",f:"Knee-to-Elbow March",t:["Core","Warm-Up"],s:[],h:"Hands behind head. Bring knee up to opposite elbow, alternating." },
  { n:"Windmill",f:"Trunk Rotation",t:["Core","Warm-Up"],s:[],h:"Feet wide. Reach one hand to opposite foot, other arm to sky." },
  { n:"Good Morning",f:"Standing Hip Hinge",t:["Legs","Warm-Up"],s:[],h:"Hands behind head. Hinge forward at hips until parallel." },
  { n:"High Knees",f:"Knee Drive",t:["Cardio","Warm-Up"],s:[],h:"Jog driving knees to waist height." },
  { n:"Butt Kickers",f:"Heel-to-Glute",t:["Cardio","Warm-Up"],s:[],h:"Jog kicking heels up to glutes." },
  { n:"Toy Soldier",f:"Straight Leg March",t:["Legs","Warm-Up"],s:[],h:"March kicking straight legs to opposite hand." },
  { n:"Karaoke",f:"Grapevine",t:["Cardio","Warm-Up","Transport"],s:["field","parking"],h:"Side shuffle crossing feet." },
  { n:"Merkin",f:"Push-Up",t:["Chest","Arms"],s:[],h:"Hands shoulder-width, body rigid. Lower chest, press up." },
  { n:"Wide Merkin",f:"Wide Push-Up",t:["Chest","Arms"],s:[],h:"Push-up with hands wider than shoulders." },
  { n:"Diamond Merkin",f:"Diamond Push-Up",t:["Chest","Arms"],s:[],h:"Hands together under chest. Targets triceps." },
  { n:"Derkin",f:"Decline Merkin",t:["Chest","Shoulders"],s:["benches"],h:"Feet on bench, hands on ground." },
  { n:"Irkin",f:"Incline Merkin",t:["Chest"],s:["benches","walls"],h:"Hands on bench or wall." },
  { n:"Burpee",f:"Bobby Hurley",t:["Full Body","Cardio"],s:[],h:"Squat, kick back, push-up, jump forward, explode up." },
  { n:"Squat",f:"Air Squat",t:["Legs"],s:[],h:"Feet shoulder-width. Hips back to parallel." },
  { n:"Jump Squat",f:"Explosive Squat",t:["Legs","Cardio"],s:[],h:"Squat then explode into a jump." },
  { n:"Bonnie Blair",f:"Skater Lunge",t:["Legs","Cardio"],s:[],h:"Leap laterally, land one foot." },
  { n:"Lunge",f:"Walking Lunge",t:["Legs","Transport"],s:["field","parking"],h:"Step forward deep lunge, alternate." },
  { n:"Mountain Climber",f:"Plank Knee Drive",t:["Core","Cardio"],s:[],h:"High plank. Drive knees to chest." },
  { n:"Bear Crawl",f:"Quadruped Crawl",t:["Full Body","Transport"],s:["field","parking"],h:"Hands and feet, knees hovering. Crawl." },
  { n:"LBC",f:"Little Baby Crunch",t:["Core","Mary"],s:[],h:"On back, knees bent. Small crunch." },
  { n:"Freddie Mercury",f:"Flutter Twist",t:["Core","Mary"],s:[],h:"On back, legs elevated. Flutter with twist." },
  { n:"American Hammer",f:"Russian Twist",t:["Core","Mary"],s:[],h:"Seated, feet off ground. Rotate side to side." },
  { n:"Flutter Kick",f:"Scissor Kick",t:["Core","Mary"],s:[],h:"On back, legs 6in up. Alternate kicking." },
  { n:"Hello Dolly",f:"Leg Spread",t:["Core","Mary"],s:[],h:"On back, legs up. Open wide, bring together." },
  { n:"Big Boy Sit-Up",f:"Full Sit-Up",t:["Core","Mary"],s:[],h:"Full sit-up touching toes." },
  { n:"Rosalita",f:"Elevated Crunch",t:["Core","Mary"],s:[],h:"On back, legs up. Crunch toward toes." },
  { n:"Plank",f:"Front Leaning Rest",t:["Core","Static"],s:[],h:"Push-up position, body rigid. Hold." },
  { n:"Al Gore",f:"Wall Sit Hold",t:["Legs","Static"],s:["walls"],h:"Back against wall, squat 90deg." },
  { n:"Dips",f:"Bench Dip",t:["Arms","Chest"],s:["benches"],h:"Hands on bench behind. Lower to 90deg." },
  { n:"Step-Up",f:"Bench Step-Up",t:["Legs"],s:["benches"],h:"Step onto bench, drive through heel." },
  { n:"Box Jump",f:"Bench Jump",t:["Legs","Cardio"],s:["benches"],h:"Jump landing both feet on bench." },
  { n:"Stair Run",f:"Stair Sprint",t:["Cardio","Legs"],s:["stairs"],h:"Sprint up stairs. Walk down." },
  { n:"Pull-Up",f:"Dead Hang Pull-Up",t:["Arms","Chest"],s:["pullup"],h:"Hang from bar, pull chin above." },
  { n:"Hill Sprint",f:"Incline Sprint",t:["Cardio","Legs"],s:["hills"],h:"Sprint up hill. Walk down." },
  { n:"Coupon Curl",f:"Block Curl",t:["Arms","Coupon"],s:[],h:"Curl coupon waist to chest." },
  { n:"Coupon Press",f:"Block Press",t:["Shoulders","Coupon"],s:[],h:"Press coupon chest to overhead." },
  { n:"Coupon Squat",f:"Goblet Squat",t:["Legs","Coupon"],s:[],h:"Hold coupon at chest. Squat deep." },
  { n:"Coupon Thruster",f:"Block Thruster",t:["Full Body","Coupon"],s:[],h:"Squat then press coupon overhead." },
  { n:"Coupon Row",f:"Block Row",t:["Arms","Coupon"],s:[],h:"Hinge, row coupon to chest." },
  { n:"Sprint",f:"All-Out Run",t:["Cardio","Transport"],s:["field","parking","track"],h:"Full speed sprint." },
  { n:"Mike Tyson",f:"Plank Walkout",t:["Full Body"],s:[],h:"Walk hands to plank. Merkin. Walk back." },
  { n:"Monkey Humper",f:"Squat Pulse",t:["Legs"],s:[],h:"Deep squat. Pulse up and down." },
  { n:"Sumo Squat",f:"Wide Squat",t:["Legs"],s:[],h:"Extra wide, toes out. Squat deep." },
  { n:"Burp Back",f:"Burpee Broad Jump",t:["Full Body","Cardio","Transport"],s:["field","parking"],h:"Burpee then broad jump." },
];

export const TAGS = ["Warm-Up","Mary","Core","Cardio","Full Body","Legs","Chest","Arms","Shoulders","Static","Transport","Coupon"];
export const DIFFS = [
  { id: "easy", l: "Easy", c: "#22c55e", d: "FNG-friendly.", r: "8-12" },
  { id: "medium", l: "Medium", c: "#f59e0b", d: "Standard beatdown.", r: "10-15" },
  { id: "hard", l: "Hard", c: "#ef4444", d: "Leave PAX in the lot.", r: "15-20" },
  { id: "beast", l: "Beast", c: "#dc2626", d: "Iron PAX level.", r: "20-30" },
];
export const SITES = [
  { id: "field", l: "Open field" }, { id: "track", l: "Track" }, { id: "benches", l: "Benches" },
  { id: "hills", l: "Hills" }, { id: "stairs", l: "Stairs" }, { id: "parking", l: "Parking lot" },
  { id: "pullup", l: "Pull-up bars" }, { id: "walls", l: "Walls" },
];
export const EQUIP = [
  { id: "none", l: "Bodyweight only" }, { id: "coupon", l: "Coupon (block)" },
];

export interface GenConfig {
  dur: string | null;
  diff: string | null;
  sites: string[];
  eq: string[];
}

export interface SectionExercise {
  // Legacy fields (always present, filled by normalizeExercise for backward compat)
  n: string;
  r: string;
  c: string;
  nt: string;
  type?: "exercise" | "transition";
  // New fields (added for redesign — populated alongside legacy)
  id?: string;
  name?: string;
  mode?: "reps" | "time" | "distance";
  value?: number | string;
  unit?: "sec" | "min" | "yds" | "laps";
  cadence?: string;
  note?: string;
  exerciseId?: string;
}

export interface Section {
  // Legacy fields (always present)
  label: string;
  color: string;
  exercises: SectionExercise[];
  note: string;
  // New fields (added for redesign)
  id?: string;
  name?: string;
  qNotes?: string;
}

// ════ MAP SUPABASE EXERCISE TO EXERCISEDATA ════

const BODY_MAP: Record<string, string[]> = {
  upper: ["Chest", "Arms", "Shoulders"],
  lower: ["Legs"],
  core: ["Core"],
  full_body: ["Full Body"],
};

// Keyword detection for more specific upper body tagging
const ARM_KEYWORDS = ["curl", "row", "pull-up", "pull up", "tricep", "hammer", "dip"];
const SHOULDER_KEYWORDS = ["shoulder", "press", "overhead", "pike", "raise", "shrug", "arnold"];
const CHEST_KEYWORDS = ["merkin", "push-up", "push up", "fly", "bench press", "chest"];

const SITE_MAP: Record<string, string> = {
  field: "field", parking_lot: "parking", track: "track",
  stairs: "stairs", hill: "hills", court: "field", wall: "walls",
  bench: "benches",
};

export function mapSupabaseExercise(row: Record<string, unknown>): ExerciseData {
  const name = (row.name as string) || "";
  const nameLower = name.toLowerCase();
  const aliases = (row.aliases as string[]) || [];
  const bodyPart = (row.body_part as string[]) || [];
  const exerciseType = (row.exercise_type as string) || "";
  const equipment = (row.equipment as string) || "none";
  const siteType = (row.site_type as string[]) || [];
  const intensity = (row.intensity as string) || "medium";
  const difficulty = (row.difficulty as number) || 2;
  const movementType = (row.movement_type as string) || "dynamic";
  const isMary = (row.is_mary as boolean) || false;
  const isTransport = (row.is_transport as boolean) || false;
  const howTo = (row.how_to as string) || "";
  const description = (row.description as string) || "";

  // Build tags from Supabase fields
  const tags: string[] = [];

  // Body part mapping — smart detection for upper body
  bodyPart.forEach(bp => {
    if (bp === "upper") {
      // Use keyword detection for specific upper body tags
      const hasArm = ARM_KEYWORDS.some(k => nameLower.includes(k));
      const hasShoulder = SHOULDER_KEYWORDS.some(k => nameLower.includes(k));
      const hasChest = CHEST_KEYWORDS.some(k => nameLower.includes(k));
      if (hasArm) tags.push("Arms");
      if (hasShoulder) tags.push("Shoulders");
      if (hasChest) tags.push("Chest");
      // If no specific match, add all three so exercise is discoverable
      if (!hasArm && !hasShoulder && !hasChest) {
        tags.push("Chest", "Arms", "Shoulders");
      }
    } else if (BODY_MAP[bp]) {
      tags.push(...BODY_MAP[bp]);
    }
  });

  if (exerciseType === "cardio") tags.push("Cardio");
  if (equipment === "coupon") tags.push("Coupon");
  if (isMary) tags.push("Mary");
  if (isTransport) tags.push("Transport");
  if (movementType === "static_hold") tags.push("Static");
  // Warm-up candidates: low intensity, beginner-intermediate difficulty, dynamic movement
  if (intensity === "low" && difficulty <= 2 && movementType === "dynamic" && !isMary) {
    tags.push("Warm-Up");
  }
  // Deduplicate
  const uniqueTags = [...new Set(tags)];

  // Build site requirements from BOTH site_type AND equipment
  const sites: string[] = [];
  siteType.forEach(st => {
    if (st !== "any" && SITE_MAP[st]) sites.push(SITE_MAP[st]);
  });
  // Equipment that implies a site requirement
  const EQUIP_SITE: Record<string, string> = { bench: "benches", wall: "walls", pull_up_bar: "pullup" };
  if (EQUIP_SITE[equipment]) {
    const mapped = EQUIP_SITE[equipment];
    if (!sites.includes(mapped)) sites.push(mapped);
  }

  const profile = row.profiles as Record<string, unknown> | null;
  return {
    n: name,
    f: aliases.length > 0 ? aliases[0] : name,
    t: uniqueTags,
    s: sites,
    h: howTo,
    d: description,
    df: difficulty,
    pt: (row.popularity_tier as number) || 3,
    ix: intensity,
    cr: (row.is_core as boolean) || false,
    id: row.id as string | undefined,
    source: (row.source as "seed" | "community" | undefined),
    createdAt: row.created_at as string | undefined,
    createdBy: row.created_by as string | undefined,
    creatorName: (profile?.f3_name as string | undefined),
    voteCount: (row.vote_count as number) ?? 0,
    commentCount: (row.comment_count as number) ?? 0,
  };
}

// ════ GENERATOR ════

function pk(a: ExerciseData[], n: number) {
  return a.slice().sort(() => Math.random() - 0.5).slice(0, n);
}
function rn(lo: number, hi: number) {
  const steps = Math.floor((hi - lo) / 5);
  return lo + Math.floor(Math.random() * (steps + 1)) * 5;
}

export function generate(cfg: GenConfig, exercises?: ExerciseData[], goRogue?: boolean): Section[] {
  const G = "#22c55e", A = "#f59e0b", P = "#a78bfa";
  const exList = exercises && exercises.length > 0 ? exercises : EX;

  // Variable rep picker — each exercise draws independently from a weighted pool
  // so one exercise gets 15 reps, the next gets 30, creating natural variety within a beatdown
  // Rep pools by difficulty × intensity
  // High intensity (Burpees, Thrusters, Cardio) get fewer reps — they take much longer per rep
  // Medium/low intensity (Merkins, Squats) get full reps from the difficulty pool
  const repTable: Record<string, Record<string, number[]>> = {
    easy:   { high: [10, 10, 10, 15], medium: [10, 10, 15, 15, 20], low: [15, 15, 20] },
    medium: { high: [10, 15, 15, 20], medium: [15, 15, 20, 20, 25, 30], low: [20, 25, 30] },
    hard:   { high: [15, 15, 20, 20], medium: [20, 20, 25, 25, 30, 30], low: [25, 30, 30] },
    beast:  { high: [20, 20, 25, 25, 30], medium: [35, 40, 40, 45, 50], low: [40, 45, 50] },
  };
  const pickReps = (diff: string, intensity?: string) => {
    const diffRow = repTable[diff] || repTable.medium;
    // Infer high intensity from tags if ix not set (for local fallback EX exercises)
    const ix = intensity || "medium";
    const opts = diffRow[ix] || diffRow.medium;
    return String(opts[Math.floor(Math.random() * opts.length)]);
  };

  // Exercise count matrix: difficulty x duration
  // Easy/Medium 60 min = ~15-18 exercises (lower reps, more variety)
  // Beast 60 min = ~12 exercises (fewer but each is brutal at 35-50 reps)
  const dur = cfg.dur === "30 min" ? 30 : cfg.dur === "60 min" ? 60 : 45;
  let tC: number, mC: number;
  if (cfg.diff === "easy") {
    if (dur === 30)      { tC = 7;  mC = 3; }
    else if (dur === 45) { tC = 12; mC = 4; }
    else                 { tC = 18; mC = 5; }
  } else if (cfg.diff === "medium") {
    if (dur === 30)      { tC = 7;  mC = 3; }
    else if (dur === 45) { tC = 12; mC = 4; }
    else                 { tC = 16; mC = 5; }
  } else if (cfg.diff === "hard") {
    if (dur === 30)      { tC = 6;  mC = 3; }
    else if (dur === 45) { tC = 10; mC = 4; }
    else                 { tC = 14; mC = 5; }
  } else { // beast
    if (dur === 30)      { tC = 5;  mC = 3; }
    else if (dur === 45) { tC = 8;  mC = 4; }
    else                 { tC = 12; mC = 5; }
  }
  const rL = 10, rH = 20;

  // ════ CORE EXERCISE SETS — Section-locked (curated by Ritz / The Bishop) ════
  // These exercises are locked to their designated section. Warmup-only exercises
  // never appear in Thang or Mary. Mary-only exercises never appear in Warmup or Thang.
  // Everything else is Thang-only (the main workout).

  const CORE_WARMUP = new Set([
    // Original 5
    "Mountaineer Motivators", "Side Straddle Hop", "Frankensteins", "21s", "Bobby Hurley",
    // 20 new dynamic warmups (April 17 s16)
    "High Knees", "Butt Kickers", "Hip Circles", "Neck Rolls", "Ankle Circles",
    "Toy Soldier", "A-Skip", "B-Skip", "Side Shuffle", "Karaoke",
    "Walking Lunge", "World's Greatest Stretch", "Cherry Picker", "Trunk Rotation",
    "Torso Twist", "Overhead Clap", "Shoulder Rolls", "Willie Mays Hayes",
    "Cotton Picker", "Good Morning",
    // 13 stretches (April 17 s16)
    "Standing Quad Stretch", "Hamstring Stretch", "Calf Stretch", "Shoulder Stretch",
    "Tricep Stretch", "Chest Stretch", "Hip Flexor Stretch", "Figure Four Stretch",
    "Pigeon Stretch", "Butterfly Stretch", "Groin Stretch", "Cross-Body Shoulder Stretch",
    "Standing Toe Touch",
  ]);

  const CORE_MARY = new Set([
    // Original 15
    "Freddie Mercury", "Rosalita", "LBCs", "Flutter kicks", "Classic Sit-Up",
    "World War I Sit-up", "Dolly", "Boat Canoe", "American Hammer",
    "Big Boy Sit-up-Ups (aka, Bissyous)", "Butterfly Sit-up", "Windshield Wipers",
    "Dying Cockroach", "Reverse Crunch", "Superman",
    // 3 new mary exercises (April 17 s16)
    "Bicycle Crunch", "Dead Bug", "Heel Touch",
    // 6 yoga/mobility exercises (April 17 s16)
    "Child's Pose", "Downward Dog", "Cobra Stretch", "Cat-Cow", "Happy Baby", "Spinal Twist",
  ]);

  const CORE_THANG = new Set([
    "Merkin", "Burpee", "Coupon Military Press", "Murder Bunny", "Block-Over Burpees",
    "Bonnie Blairs", "Jump Squat", "Lt. Dans", "Mountain Climbers", "Mountain Climber Merkin",
    "Elf on the Shelf", "T-Bomb", "Alternating Shoulder Taps", "Hand-release Mike Tysons",
    "Plank Jacks", "Alternating Side Squats", "Moroccan Nightclub", "Donkey Kicks",
    "Bear Crawl", "Bulgarian Split Squat", "Coupon Curl", "Peter Parker",
    "Balls to the Wall", "Balls to the Wall Crawl", "Merkin Jack", "Suicides",
    "Crab Walk", "Crab Jacks", "Al Gore", "Coupon Kettle Bell Swing", "Derkin", "Dips",
    "Duck Walk", "Monkey Humpers", "Sumo Squat", "Suzanne Somers", "Smurf Jacks",
    "Squat Thrust", "Single Arm Row", "Dive Bombers", "Crawl Bear", "Merkin Ladder",
    // New Thang exercises (added April 17 s15)
    "Diamond Merkin", "Manmaker Merkin", "Manmaker", "Apolo Ohno",
    "Double Merkin Burpee", "Elevens", "Fire Drill", "No Cheat Merkin",
    "Pull-up Squats", "Prisoner's Squat", "Ranger Merkins",
    // 2 new thang exercises (April 17 s16)
    "Reverse Lunge", "Fire Hydrant",
  ]);

  // Combined set for general "is this core?" checks
  const ALL_CORE = new Set([...CORE_WARMUP, ...CORE_MARY, ...CORE_THANG]);
  const isCore = (e: ExerciseData) => ALL_CORE.has(e.n);

  // Coupon exercises — must be excluded when "Bodyweight only" is selected
  const noCoupon = !cfg.eq.includes("coupon");

  const pool = exList.filter(e => e.s.length === 0 || e.s.some(s => cfg.sites.includes(s)));

  // Exclude Transport and Format from all pools
  const FORMAT_EXERCISES = new Set([
    "Dora", "Dora 1-2-3", "Triple Nickel", "11s", "7s", "5s",
    "Ring of Fire", "Thunder", "Deck of Death", "Dice Roll",
    "Indian Run", "Reverse Indian Run", "Indian Giver",
    "Pain Train", "Route 66", "Catch Me If You Can",
    "Jacob's Ladder", "Blackjack", "Wheel of Pain",
    "Murph", "Cindy", "Mary Marathon", "Battle Buddy",
    "Relay Race", "Wheel & Spoke", "EMOM", "Tabata",
    "Stations", "Four Corners", "AMRAP", "BOMBS",
    "Bear Crawl Bonanza", "VQ Special",
    // Circuits — named beatdowns, not individual exercises (April 23 s20)
    "Dirty Mac Deuce", "1st & 10", "Four Corners Escalator", "Wilt Chamberlains",
    "Santa's Ladder", "Mary In The Middle", "Vicious circle", "Doracides",
    "Stink B.O.M.B.S.", "Millenial", "TYFBAF (Thank You For Being A Friend)",
    "Hindenburg BLIMPS", "Doc Ock's Octogon of Pain",
    // Games — require props or aren't real exercises (April 23 s20)
    "Duck Jousting", "Ultimate Frisburpee", "Ultimate Football",
    "Pinochle",
  ]);

  // Base filter: no transport, no format exercises
  const baseFilter = (e: ExerciseData) => !e.t.includes("Transport") && !FORMAT_EXERCISES.has(e.n);
  // Coupon filter: applied when bodyweight-only is selected
  const couponFilter = (e: ExerciseData) => !noCoupon || !e.t.includes("Coupon");

  // ════ WARMUP POOL ════
  // ALL difficulties use CORE_WARMUP — nobody wants exotic warmup exercises
  // ALL difficulties use core exercises for ALL sections. No exotic exercises anywhere.
  // UNLESS goRogue=true — then use the full 904 pool for everything ("Go Rogue" mode)

  const wCorePool = pool.filter(e => CORE_WARMUP.has(e.n) && couponFilter(e));
  const wTaggedPool = pool.filter(e => e.t.includes("Warm-Up") && couponFilter(e));
  const wRepOpts = [10, 10, 15, 15, 15];
  const w = pk(goRogue ? (wTaggedPool.length >= 4 ? wTaggedPool : wCorePool) : wCorePool, 4).map(e => {
    const wRep = String(wRepOpts[Math.floor(Math.random() * wRepOpts.length)]);
    return { id: _genId(), type: "exercise" as const, name: e.n, mode: "reps" as const, value: parseInt(wRep), cadence: "IC", note: "", n: e.n, r: wRep, c: "IC", nt: "" };
  });

  // ════ MARY POOL ════
  // ALL difficulties use CORE_MARY — nobody wants exotic mary exercises
  // UNLESS goRogue=true — then use full Mary-tagged pool
  const yCorePool = pool.filter(e => CORE_MARY.has(e.n) && couponFilter(e));
  const yTaggedPool = pool.filter(e => e.t.includes("Mary") && couponFilter(e));
  const maryPool = goRogue ? yTaggedPool : yCorePool;

  // ════ THANG POOL ════
  // Exclude warmup-only, mary-only, transport, format exercises from thang
  let mP = pool.filter(e =>
    baseFilter(e) &&
    couponFilter(e) &&
    !CORE_WARMUP.has(e.n) &&
    !CORE_MARY.has(e.n) &&
    !e.t.includes("Warm-Up") &&
    !e.t.includes("Mary")
  );

  // Split thang pool by core status
  const mCore = mP.filter(e => CORE_THANG.has(e.n));  // Thang-specific core exercises

  // ════ THANG EXERCISE SELECTION ════
  // Default ("Classics"): 80% core thang exercises + 20% full library for variety
  // goRogue ("Full Library"): 100% full thang pool (all exercises minus warmup/mary/transport/format)
  // Warmup and Mary are always 100% core (never affected by this mix)
  let thangPicks: ExerciseData[];

  const thangSource = goRogue ? mP : mCore;
  const sitePool = thangSource.filter(e => e.s.length > 0 && e.s.some(s => cfg.sites.includes(s)));
  const couponPool = thangSource.filter(e => e.t.includes("Coupon"));

  let picks: ExerciseData[] = [];
  let remaining = tC;

  // 1. Site-specific exercises (guarantee ~30% of Thang when sites selected)
  if (sitePool.length > 0) {
    const siteCount = Math.min(Math.ceil(tC * 0.3), sitePool.length);
    if (siteCount > 0) {
      picks.push(...pk(sitePool, siteCount));
      remaining -= picks.length;
    }
  }

  // 2. Coupon exercises (guarantee 2-3 when coupon selected — only if coupon IS selected)
  if (cfg.eq.includes("coupon") && remaining > 0) {
    const unusedCoupon = couponPool.filter(e => !picks.some(p => p.n === e.n));
    const couponCount = Math.min(Math.ceil(tC / 3), unusedCoupon.length, remaining);
    if (couponCount > 0) {
      picks.push(...pk(unusedCoupon, couponCount));
      remaining = tC - picks.length;
    }
  }

  // 3. Fill remaining slots — 80/20 core/full mix (or 100% full if goRogue)
  if (remaining > 0) {
    const warmupNames = new Set(w.map(e => e.n));
    const unused = (e: ExerciseData) => !picks.some(p => p.n === e.n) && !warmupNames.has(e.n);

    if (goRogue) {
      // Full Library mode: 100% from full pool
      const fillPicks = pk(mP.filter(unused), remaining);
      picks.push(...fillPicks);
    } else {
      // Classics mode: 70% core + 30% full library for variety
      const rogueCount = Math.max(1, Math.round(remaining * 0.3));
      const coreCount = remaining - rogueCount;

      // Pick core exercises first
      const coreFill = pk(mCore.filter(unused), coreCount);
      picks.push(...coreFill);

      // Pick rogue exercises from full pool (excluding core to guarantee novelty)
      const unusedAfterCore = (e: ExerciseData) => !picks.some(p => p.n === e.n) && !warmupNames.has(e.n) && !CORE_THANG.has(e.n);
      const rogueFill = pk(mP.filter(unusedAfterCore), rogueCount);
      picks.push(...rogueFill);

      // If not enough rogue exercises, backfill with more core
      if (picks.length < tC) {
        const stillUnused = (e: ExerciseData) => !picks.some(p => p.n === e.n) && !warmupNames.has(e.n);
        const backfill = pk(mCore.filter(stillUnused), tC - picks.length);
        picks.push(...backfill);
      }
    }
  }

  // Shuffle final order for natural feel
  thangPicks = picks.sort(() => Math.random() - 0.5);

  const t = thangPicks.map(e => {
    const iS = e.t.includes("Static");
    // Infer intensity: use stored ix, or detect high-intensity from tags for local fallback exercises
    const inferredIntensity = e.ix || (e.t.some(tag => ["Cardio", "Full Body"].includes(tag)) ? "high" : "medium");
    const r = iS ? (cfg.diff === "beast" ? "90 sec" : "60 sec") : pickReps(cfg.diff || "medium", inferredIntensity);
    const _parsed = _parseLegacyAmount(r);
    let nt = "";
    if (e.s.length > 0) {
      const m2 = e.s.filter(s => cfg.sites.includes(s));
      if (m2.length > 0) {
        const si = SITES.find(x => x.id === m2[0]);
        if (si) nt = "Use the " + si.l.toLowerCase();
      }
    }
    const _cad = iS ? "OYO" : (Math.random() > 0.5 ? "IC" : "OYO");
    return { id: _genId(), type: "exercise" as const, name: e.n, mode: _parsed.mode, value: _parsed.value, unit: _parsed.unit, cadence: _cad, note: nt, n: e.n, r, c: _cad, nt };
  });

  const m = pk(maryPool, mC).map(e => {
    const mRep = pickReps(cfg.diff || "medium", e.ix || "medium");
    const mParsed = _parseLegacyAmount(mRep);
    return { id: _genId(), type: "exercise" as const, name: e.n, mode: mParsed.mode, value: mParsed.value, unit: mParsed.unit, cadence: "IC", note: "", n: e.n, r: mRep, c: "IC", nt: "" };
  });

  if (cfg.diff === "hard" || cfg.diff === "beast") {
    const plankSec = cfg.diff === "beast" ? 90 : 60;
    const plankR = cfg.diff === "beast" ? "90 sec" : "60 sec";
    m.push({ id: _genId(), type: "exercise" as const, name: "Plank", mode: "time" as const, value: plankSec, unit: "sec" as const, cadence: "OYO", note: "", n: "Plank", r: plankR, c: "OYO", nt: "" });
  }

  const _mkSec = (label: string, color: string, exercises: SectionExercise[]) => ({
    id: _genId(), name: label, label, color, qNotes: "", note: "", exercises
  });
  return [
    _mkSec("Warmup", G, w),
    _mkSec("The Thang", A, t),
    _mkSec("Mary", P, m),
  ];
}

// ════ ID GENERATOR (browser + Node safe) ════
function _genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ════ EXPORTED ID GENERATOR ════
export function generateId(): string {
  return _genId();
}

// ════ SMART TEXT PARSER ════
// Parses free-text like "20" → reps, "45 sec" → timer, "50 yds" → distance
export function parseSmartText(input: string): { mode: "reps" | "time" | "distance"; value: number | string; unit?: "sec" | "min" | "yds" | "laps" } | null {
  if (!input || !input.trim()) return null;
  const t = input.trim().toLowerCase();
  const secMatch = t.match(/^(\d+)\s*(?:sec(?:onds?)?|s)$/);
  if (secMatch) return { mode: "time", value: parseInt(secMatch[1]), unit: "sec" };
  const minMatch = t.match(/^(\d+)\s*(?:min(?:utes?)?|m)$/);
  if (minMatch) return { mode: "time", value: parseInt(minMatch[1]), unit: "min" };
  const colonMatch = t.match(/^(\d+):(\d{2})$/);
  if (colonMatch) return { mode: "time", value: parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]), unit: "sec" };
  const ydsMatch = t.match(/^(\d+)\s*(?:y(?:d|ds|ards?)?)$/);
  if (ydsMatch) return { mode: "distance", value: parseInt(ydsMatch[1]), unit: "yds" };
  const lapsMatch = t.match(/^(\d+)\s*laps?$/);
  if (lapsMatch) return { mode: "distance", value: parseInt(lapsMatch[1]), unit: "laps" };
  const repsMatch = t.match(/^(\d+)$/);
  if (repsMatch) return { mode: "reps", value: parseInt(repsMatch[1]) };
  return { mode: "reps", value: input.trim() };
}

// ════ LEGACY AMOUNT PARSER (used internally in generate()) ════
function _parseLegacyAmount(rStr: string): { mode: "reps" | "time" | "distance"; value: number | string; unit?: "sec" | "min" | "yds" | "laps" } {
  const parsed = parseSmartText(rStr);
  return parsed || { mode: "reps", value: rStr };
}

// ════ LEGACY REPS+CADENCE PARSER (handles old cadence-as-timer pattern) ════
function _parseLegacyRepsAndCadence(rStr: string, cStr: string): {
  mode: "reps" | "time" | "distance";
  value: number | string;
  unit?: "sec" | "min" | "yds" | "laps";
  cadence: string;
} {
  const t = rStr.trim().toLowerCase();
  const cl = cStr.trim().toLowerCase();

  // Time in reps field
  const secMatch = t.match(/^(\d+)\s*(?:sec(?:onds?)?|s)$/);
  if (secMatch) return { mode: "time", value: parseInt(secMatch[1]), unit: "sec", cadence: "OYO" };
  const minMatch = t.match(/^(\d+)\s*(?:min(?:utes?)?|m)$/);
  if (minMatch) return { mode: "time", value: parseInt(minMatch[1]), unit: "min", cadence: "OYO" };
  const colonMatch = t.match(/^(\d+):(\d{2})$/);
  if (colonMatch) return { mode: "time", value: parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]), unit: "sec", cadence: "OYO" };

  // Distance in reps field
  const ydsMatch = t.match(/^(\d+)\s*(?:y(?:d|ds|ards?)?)$/);
  if (ydsMatch) return { mode: "distance", value: parseInt(ydsMatch[1]), unit: "yds", cadence: "OYO" };
  const lapsMatch = t.match(/^(\d+)\s*laps?$/);
  if (lapsMatch) return { mode: "distance", value: parseInt(lapsMatch[1]), unit: "laps", cadence: "OYO" };

  // Legacy cadence-as-timer: reps is plain number + cadence says "sec"/"min"
  const repsNum = parseInt(t);
  if (!isNaN(repsNum) && String(repsNum) === t && /^(sec(onds?)?|s|min(utes?|s)?|m)$/i.test(cl)) {
    const isMin = /^(min(utes?|s)?|m)$/i.test(cl);
    return { mode: "time", value: repsNum, unit: isMin ? "min" : "sec", cadence: "OYO" };
  }

  // Plain number = reps
  if (!isNaN(repsNum) && String(repsNum) === t) {
    return { mode: "reps", value: repsNum, cadence: cStr || "IC" };
  }

  // Fallback
  return { mode: "reps", value: rStr, cadence: cStr || "IC" };
}

// ════ NORMALIZE EXERCISE (raw Supabase JSONB or legacy SectionExercise → new format) ════
// Fills BOTH old and new fields so all existing code continues to work
export function normalizeExercise(raw: Record<string, unknown>): SectionExercise {
  const id = (raw.id as string) || _genId();
  const type: "exercise" | "transition" = (raw.type as string) === "transition" ? "transition" : "exercise";

  if (type === "transition") {
    const tName = (raw.name as string) || (raw.n as string) || "";
    return { id, type, name: tName, n: tName, r: "", c: "", nt: "" };
  }

  const exName = (raw.name as string) || (raw.n as string) || "";
  const exNote = (raw.note as string) || (raw.nt as string) || "";

  let mode: "reps" | "time" | "distance" = "reps";
  let value: number | string = "";
  let unit: "sec" | "min" | "yds" | "laps" | undefined;
  let cadence = "IC";

  if (raw.mode) {
    // Already new format
    mode = raw.mode as "reps" | "time" | "distance";
    value = raw.value as number | string;
    unit = raw.unit as "sec" | "min" | "yds" | "laps" | undefined;
    cadence = (raw.cadence as string) || "IC";
  } else {
    // Legacy format — parse r + c
    const parsed = _parseLegacyRepsAndCadence((raw.r as string) || "", (raw.c as string) || "");
    mode = parsed.mode;
    value = parsed.value;
    unit = parsed.unit;
    cadence = parsed.cadence;
  }

  // Build legacy r string for backward compat (preserve original if it exists)
  let rLegacy = (raw.r as string) || "";
  if (!rLegacy) {
    if (mode === "reps") rLegacy = String(value);
    else if (mode === "time") rLegacy = `${value} ${unit}`;
    else if (mode === "distance") rLegacy = `${value} ${unit}`;
  }

  return {
    // New fields
    id, type, name: exName, mode, value, unit, cadence, note: exNote,
    // Legacy fields (backward compat — always populated)
    n: exName, r: rLegacy, c: cadence, nt: exNote,
  };
}

// ════ NORMALIZE SECTION (raw Supabase JSONB or legacy Section → new format) ════
export function normalizeSection(raw: Record<string, unknown>): Section {
  const sName = (raw.name as string) || (raw.label as string) || "Section";
  const sNotes = (raw.qNotes as string) || (raw.note as string) || "";
  const rawExercises = (raw.exercises as Record<string, unknown>[]) || [];
  return {
    // New fields
    id: (raw.id as string) || _genId(),
    name: sName,
    qNotes: sNotes,
    // Legacy fields (backward compat)
    label: sName,
    note: sNotes,
    color: (raw.color as string) || "#22c55e",
    exercises: rawExercises.map(normalizeExercise),
  };
}

// ════ FORMAT EXERCISE AMOUNT FOR DISPLAY ════
export function formatExerciseAmount(ex: SectionExercise): string {
  if (ex.type === "transition") return ex.name || ex.n || "";
  if (ex.mode === "time") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "distance") return `${ex.value} ${ex.unit}`;
  if (ex.mode === "reps") return `${ex.value} reps`;
  return ex.r || "";
}
