// Exercise database and generator
export interface ExerciseData {
  n: string; // name
  f: string; // full name / alias
  t: string[]; // tags
  s: string[]; // site requirements
  h: string; // how-to
  d?: string; // short description
  df?: number; // difficulty level 1-3
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
  n: string; r: string; c: string; nt: string;
}

export interface Section {
  label: string; color: string; exercises: SectionExercise[]; note: string;
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

  return {
    n: name,
    f: aliases.length > 0 ? aliases[0] : name,
    t: uniqueTags,
    s: sites,
    h: howTo,
    d: description,
    df: difficulty,
  };
}

// ════ GENERATOR ════

function pk(a: ExerciseData[], n: number) {
  return a.slice().sort(() => Math.random() - 0.5).slice(0, n);
}
function rn(lo: number, hi: number) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

export function generate(cfg: GenConfig, exercises?: ExerciseData[]): Section[] {
  const G = "#22c55e", A = "#f59e0b", P = "#a78bfa";
  const exList = exercises && exercises.length > 0 ? exercises : EX;

  let rL: number, rH: number;
  if (cfg.diff === "easy") { rL = 8; rH = 12; }
  else if (cfg.diff === "medium") { rL = 10; rH = 15; }
  else if (cfg.diff === "hard") { rL = 15; rH = 20; }
  else { rL = 20; rH = 30; }

  const pool = exList.filter(e => e.s.length === 0 || e.s.some(s => cfg.sites.includes(s)));
  const wP = pool.filter(e => e.t.includes("Warm-Up"));
  let mP = pool.filter(e => !e.t.includes("Warm-Up") && !e.t.includes("Mary"));
  let yP = pool.filter(e => e.t.includes("Mary"));

  if (!cfg.eq.includes("coupon")) {
    mP = mP.filter(e => !e.t.includes("Coupon"));
  }

  // Filter by exercise difficulty to match beatdown difficulty
  // Easy/Medium → common exercises only (difficulty 1-2), no exotic
  // Hard → all exercises
  // Beast → intermediate+ (difficulty 2-3), no beginner
  if (cfg.diff === "easy" || cfg.diff === "medium") {
    mP = mP.filter(e => !e.df || e.df <= 2);
    yP = yP.filter(e => !e.df || e.df <= 2);
  } else if (cfg.diff === "beast") {
    mP = mP.filter(e => !e.df || e.df >= 2);
  }

  const tC = cfg.dur === "30 min" ? 5 : cfg.dur === "60 min" ? 10 : 7;
  const mC = cfg.diff === "easy" ? 2 : 4;

  const w = pk(wP, 3).map(e => ({
    n: e.n, r: String(rn(rL, rH)), c: "IC", nt: "",
  }));

  // When coupon selected, guarantee 2-3 coupon exercises in The Thang
  // When specific sites selected, guarantee site-specific exercises
  let thangPicks: ExerciseData[];
  const sitePool = mP.filter(e => e.s.length > 0 && e.s.some(s => cfg.sites.includes(s)));
  const generalPool = mP.filter(e => e.s.length === 0);
  const couponPool = mP.filter(e => e.t.includes("Coupon"));
  const nonCouponGeneral = generalPool.filter(e => !e.t.includes("Coupon"));

  let picks: ExerciseData[] = [];
  let remaining = tC;

  // 1. Site-specific exercises (guarantee ~30% of Thang)
  if (sitePool.length > 0) {
    const siteCount = Math.min(Math.ceil(tC * 0.3), sitePool.length);
    picks.push(...pk(sitePool, siteCount));
    remaining -= picks.length;
  }

  // 2. Coupon exercises (guarantee 2-3 when coupon selected)
  if (cfg.eq.includes("coupon") && remaining > 0) {
    const unusedCoupon = couponPool.filter(e => !picks.some(p => p.n === e.n));
    const couponCount = Math.min(Math.ceil(tC / 3), unusedCoupon.length, remaining);
    picks.push(...pk(unusedCoupon, couponCount));
    remaining -= couponCount;
  }

  // 3. Fill rest with general exercises
  if (remaining > 0) {
    const fillPool = cfg.eq.includes("coupon") ? generalPool : nonCouponGeneral;
    const unused = fillPool.filter(e => !picks.some(p => p.n === e.n));
    picks.push(...pk(unused, remaining));
  }

  // Shuffle final order
  thangPicks = picks.sort(() => Math.random() - 0.5);

  const t = thangPicks.map(e => {
    const iS = e.t.includes("Static");
    const r = iS ? (cfg.diff === "beast" ? "90 sec" : "45 sec") : String(rn(rL, rH));
    let nt = "";
    if (e.s.length > 0) {
      const m2 = e.s.filter(s => cfg.sites.includes(s));
      if (m2.length > 0) {
        const si = SITES.find(x => x.id === m2[0]);
        if (si) nt = "Use the " + si.l.toLowerCase();
      }
    }
    return { n: e.n, r, c: iS ? "OYO" : (Math.random() > 0.5 ? "IC" : "OYO"), nt };
  });

  const m = pk(yP, mC).map(e => ({
    n: e.n, r: String(rn(rL, rH)), c: "IC", nt: "",
  }));

  if (cfg.diff === "hard" || cfg.diff === "beast") {
    m.push({ n: "Plank", r: cfg.diff === "beast" ? "90 sec" : "60 sec", c: "OYO", nt: "" });
  }

  return [
    { label: "Warmup", color: G, exercises: w, note: "" },
    { label: "The Thang", color: A, exercises: t, note: "" },
    { label: "Mary", color: P, exercises: m, note: "" },
  ];
}
