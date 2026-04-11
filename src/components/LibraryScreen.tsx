"use client";

import { useState } from "react";

const CD = "rgba(255,255,255,0.028)";
const BD = "rgba(255,255,255,0.07)";
const G = "#22c55e";
const A = "#f59e0b";
const R = "#ef4444";
const P = "#a78bfa";
const BG = "#0E0E10";
const T1 = "#F0EDE8";
const T2 = "#D0C8BC";
const T3 = "#C0B8AC";
const T4 = "#928982";
const T5 = "#7A7268";
const T6 = "#5A534C";
const F = "'Outfit', system-ui, sans-serif";

const ist: React.CSSProperties = {
  width: "100%", background: CD, border: "1px solid " + BD, borderRadius: 12,
  color: T1, padding: "14px 16px", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: F,
};

const REGIONS = ["All","Northeast","Southeast","Midwest","Southwest","West","Mid-Atlantic","Pacific NW"];
const SITES = [{id:"field",l:"Open field"},{id:"track",l:"Track"},{id:"benches",l:"Benches"},{id:"hills",l:"Hills"},{id:"stairs",l:"Stairs"},{id:"parking",l:"Parking lot"},{id:"pullup",l:"Pull-up bars"},{id:"walls",l:"Walls"}];
const TAGS = ["Warm-Up","Mary","Core","Cardio","Full Body","Legs","Chest","Arms","Shoulders","Static","Transport","Coupon"];

interface Comment { au: string; ao: string; txt: string; dt: string }
interface Exercise { n: string; r: string; c: string; nt: string }
interface Section { label: string; color: string; exercises: Exercise[]; note: string }
interface FeedItem {
  id: number; src: string; nm: string; au: string; ao: string; reg: string;
  d: string; dur: string | null; aoT: string[]; v: number; u: number; cm: number;
  ds: string; dt: string; tp: string; tg?: string[]; et?: string[];
  comments: Comment[]; secs?: Section[];
}

const FEED: FeedItem[] = [
  {id:1,src:"Hand Built",nm:"The Grinder",au:"GloomBuilder",ao:"F3 Essex, NJ",reg:"Northeast",d:"hard",dur:"60 min",aoT:["parking"],v:2,u:1,cm:24,ds:"Heavy coupon Dora with bear crawl suicides between rounds.",dt:"Mar 28, 2026",tp:"beatdown",tg:["Coupon","Parking lot"],comments:[{au:"GloomBuilder PAX",ao:"F3 Midwest, OH",txt:"Brought this to my AO. PAX were wrecked.",dt:"Mar 30"},{au:"GloomBuilder PAX",ao:"F3 Mid-Atlantic, PA",txt:"Beast mode. Did 4 rounds instead of 3.",dt:"Apr 1"}],secs:[{label:"Warmup",color:G,exercises:[{n:"SSH",r:"20",c:"IC",nt:""},{n:"Imperial Walker",r:"15",c:"IC",nt:""}],note:""},{label:"The Thang",color:A,exercises:[{n:"Bear Crawl",r:"50 yds",c:"OYO",nt:"Across lot"},{n:"Coupon Curl",r:"20",c:"OYO",nt:""},{n:"Burpee",r:"15",c:"OYO",nt:"No rest"}],note:"Dora style: partner runs while you work."},{label:"Mary",color:P,exercises:[{n:"LBC",r:"25",c:"IC",nt:""},{n:"American Hammer",r:"20",c:"IC",nt:""}],note:""}]},
  {id:2,src:"AI Generated",nm:"The Grasshopper",au:"GloomBuilder",ao:"F3 Midwest, OH",reg:"Midwest",d:"easy",dur:"30 min",aoT:["field"],v:1,u:2,cm:18,ds:"Perfect for FNG days. Bodyweight circuit.",dt:"Mar 30, 2026",tp:"beatdown",tg:["Field"],comments:[{au:"GloomBuilder PAX",ao:"F3 Essex, NJ",txt:"Used this for our FNG Saturday. Perfect.",dt:"Apr 2"}],secs:[{label:"Warmup",color:G,exercises:[{n:"SSH",r:"10",c:"IC",nt:""},{n:"Toy Soldier",r:"10",c:"IC",nt:""}],note:""},{label:"The Thang",color:A,exercises:[{n:"Squat",r:"12",c:"IC",nt:""},{n:"Merkin",r:"10",c:"OYO",nt:""},{n:"Lunge",r:"10 each",c:"OYO",nt:""},{n:"Mountain Climber",r:"10",c:"IC",nt:""}],note:"2 rounds. 60 sec rest."},{label:"Mary",color:P,exercises:[{n:"LBC",r:"15",c:"IC",nt:""},{n:"Flutter Kick",r:"12",c:"IC",nt:""}],note:""}]},
  {id:3,src:"Hand Built",nm:"Stairway to Heaven",au:"GloomBuilder",ao:"F3 Mid-Atlantic, PA",reg:"Mid-Atlantic",d:"hard",dur:"45 min",aoT:["stairs"],v:2,u:0,cm:12,ds:"Relentless stair work with coupon carry.",dt:"Mar 25, 2026",tp:"beatdown",tg:["Stairs","Coupon"],comments:[{au:"GloomBuilder PAX",ao:"F3 Midwest, OH",txt:"Ran this at our AO. Legs were jello for 3 days.",dt:"Mar 27"},{au:"GloomBuilder PAX",ao:"F3 Southwest, TX",txt:"Added burpee buy-ins between stair sets. Brutal.",dt:"Mar 28"},{au:"GloomBuilder PAX",ao:"F3 West, CO",txt:"Perfect for a stair AO. Highly recommend.",dt:"Mar 29"}],secs:[{label:"Warmup",color:G,exercises:[{n:"High Knees",r:"20",c:"IC",nt:""},{n:"Butt Kickers",r:"20",c:"IC",nt:""}],note:""},{label:"The Thang",color:A,exercises:[{n:"Stair Run",r:"5 trips",c:"OYO",nt:""},{n:"Coupon Press",r:"20",c:"OYO",nt:""},{n:"Coupon Squat",r:"20",c:"OYO",nt:""},{n:"Dips",r:"15",c:"OYO",nt:""}],note:"Coupon carry up stairs between rounds."},{label:"Mary",color:P,exercises:[{n:"American Hammer",r:"20",c:"IC",nt:""},{n:"Plank",r:"60 sec",c:"OYO",nt:""}],note:""}]},
  {id:4,src:"Hand Built",nm:"Reverse Burpee Tuck",au:"GloomBuilder",ao:"F3 West, CO",reg:"West",d:"medium",dur:null,aoT:[],v:1,u:1,cm:6,ds:"Sit down, roll back, explode up into tuck jump.",dt:"Apr 1, 2026",tp:"exercise",et:["Full Body","Cardio"],comments:[{au:"GloomBuilder PAX",ao:"F3 Southeast, NC",txt:"Added this to my warmup rotation. PAX love it.",dt:"Apr 2"},{au:"GloomBuilder PAX",ao:"F3 Southeast, FL",txt:"Great full body movement. Harder than it looks.",dt:"Apr 3"}]},
  {id:5,src:"Hand Built",nm:"Pain Train Express",au:"GloomBuilder",ao:"F3 Southwest, TX",reg:"Southwest",d:"beast",dur:"45 min",aoT:["field","benches"],v:0,u:2,cm:31,ds:"EMOM ladder with escalating burpees.",dt:"Apr 1, 2026",tp:"beatdown",tg:["Field","Benches"],comments:[{au:"GloomBuilder PAX",ao:"F3 Southeast, GA",txt:"This destroyed us. 5 stars.",dt:"Apr 3"}],secs:[{label:"Warmup",color:G,exercises:[{n:"SSH",r:"25",c:"IC",nt:""},{n:"Good Morning",r:"15",c:"IC",nt:""}],note:""},{label:"Round 1",color:A,exercises:[{n:"Burpee",r:"10",c:"OYO",nt:""},{n:"Merkin",r:"25",c:"OYO",nt:""},{n:"Squat",r:"30",c:"OYO",nt:""}],note:"EMOM: 1 burpee each minute"},{label:"Round 2",color:R,exercises:[{n:"Burpee",r:"15",c:"OYO",nt:""},{n:"Diamond Merkin",r:"20",c:"OYO",nt:""},{n:"Jump Squat",r:"25",c:"OYO",nt:""}],note:"EMOM: 2 burpees each minute"},{label:"Mary",color:P,exercises:[{n:"LBC",r:"25",c:"IC",nt:""},{n:"Plank",r:"90 sec",c:"OYO",nt:""}],note:""}]},
  {id:6,src:"AI Generated",nm:"Block Party",au:"GloomBuilder",ao:"F3 Southeast, FL",reg:"Southeast",d:"medium",dur:"45 min",aoT:["parking"],v:2,u:2,cm:9,ds:"All coupon. 4-round circuit.",dt:"Apr 3, 2026",tp:"beatdown",tg:["Coupon","Parking lot"],comments:[{au:"GloomBuilder PAX",ao:"F3 Southeast, NC",txt:"Simple but effective. Great coupon day.",dt:"Apr 4"},{au:"GloomBuilder PAX",ao:"F3 Southeast, GA",txt:"We added coupon swings between rounds.",dt:"Apr 5"}],secs:[{label:"Warmup",color:G,exercises:[{n:"SSH",r:"15",c:"IC",nt:""}],note:""},{label:"The Thang",color:A,exercises:[{n:"Coupon Curl",r:"15",c:"OYO",nt:""},{n:"Coupon Press",r:"15",c:"OYO",nt:""},{n:"Coupon Squat",r:"15",c:"OYO",nt:""},{n:"Coupon Row",r:"15",c:"OYO",nt:""}],note:"4 rounds. Mosey between."},{label:"Mary",color:P,exercises:[{n:"American Hammer",r:"20",c:"IC",nt:""}],note:""}]},
  {id:7,src:"Hand Built",nm:"Crab Flip Merkin",au:"GloomBuilder",ao:"F3 Southeast, SC",reg:"Southeast",d:"hard",dur:null,aoT:[],v:0,u:1,cm:4,ds:"10 crab walks then 5 merkins across the lot.",dt:"Apr 2, 2026",tp:"exercise",et:["Full Body","Arms","Transport"],comments:[{au:"GloomBuilder PAX",ao:"F3 Midwest, OH",txt:"Arms were toast after 3 sets of these.",dt:"Apr 3"},{au:"GloomBuilder PAX",ao:"F3 Southwest, AZ",txt:"Great transport exercise.",dt:"Apr 4"}]},
  {id:8,src:"Hand Built",nm:"Iron Horse Circuit",au:"GloomBuilder",ao:"F3 Southeast, GA",reg:"Southeast",d:"beast",dur:"60 min",aoT:["field","hills"],v:1,u:0,cm:28,ds:"Hill repeats with coupon stations.",dt:"Apr 4, 2026",tp:"beatdown",tg:["Hills","Coupon"],comments:[{au:"GloomBuilder PAX",ao:"F3 Essex, NJ",txt:"This is a top 5 beatdown. Brought it to Essex.",dt:"Apr 5"},{au:"GloomBuilder PAX",ao:"F3 Southwest, TX",txt:"The ascending rounds are pure misery. Love it.",dt:"Apr 6"}],secs:[{label:"Warmup",color:G,exercises:[{n:"SSH",r:"25",c:"IC",nt:""},{n:"Karaoke",r:"50 yds",c:"OYO",nt:"Each way"}],note:""},{label:"The Thang",color:A,exercises:[{n:"Hill Sprint",r:"4 trips",c:"OYO",nt:""},{n:"Coupon Thruster",r:"25",c:"OYO",nt:""},{n:"Bear Crawl",r:"50 yds",c:"OYO",nt:""},{n:"Burpee",r:"20",c:"OYO",nt:""}],note:"4 rounds ascending."},{label:"Mary",color:P,exercises:[{n:"LBC",r:"30",c:"IC",nt:""},{n:"Plank",r:"90 sec",c:"OYO",nt:""}],note:""}]},
  {id:9,src:"Hand Built",nm:"Plank Jack Burner",au:"GloomBuilder",ao:"F3 Southwest, AZ",reg:"Southwest",d:"easy",dur:null,aoT:[],v:2,u:1,cm:8,ds:"Plank jack, merkin, repeat. No rest.",dt:"Apr 5, 2026",tp:"exercise",et:["Core","Chest","Cardio"],comments:[{au:"GloomBuilder PAX",ao:"F3 Southeast, SC",txt:"Simple and devastating. Perfect Mary finisher.",dt:"Apr 6"},{au:"GloomBuilder PAX",ao:"F3 Southeast, FL",txt:"Did 5 rounds of 10 as a Thang closer.",dt:"Apr 7"}]},
];

function dc(d: string) {
  if (d === "easy" || d === "Beginner") return G;
  if (d === "medium" || d === "Intermediate") return A;
  if (d === "hard" || d === "Advanced") return R;
  if (d === "beast" || d === "Beast") return "#dc2626";
  return T4;
}

function srcBadge(s: string) {
  if (s === "Hand Built") return { bg: "#E8A820" + "18", c: "#E8A820", l: "Hand Built" };
  return { bg: "#94a3b8" + "15", c: "#94a3b8", l: "AI Generated" };
}

interface LibraryScreenProps {
  sharedItems?: FeedItem[];
  profName?: string;
}

export default function LibraryScreen({ sharedItems = [], profName = "" }: LibraryScreenProps) {
  const [libDet, setLibDet] = useState<FeedItem | null>(null);
  const [libSearch, setLibSearch] = useState("");
  const [libT, setLibT] = useState("beatdowns");
  const [libF, setLibF] = useState(false);
  const [fSort, setFSort] = useState("new");
  const [fD, setFD] = useState("All");
  const [fDu, setFDu] = useState("All");
  const [fR, setFR] = useState("All");
  const [fAo, setFAo] = useState("All");
  const [fSrc, setFSrc] = useState("All");
  const [fET, setFET] = useState("All");
  const [fExR, setFExR] = useState("All");
  const [showAllCmt, setShowAllCmt] = useState(false);
  const [cmtText, setCmtText] = useState("");
  const [votes, setVotes] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState("");

  const fl = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const toggleVote = (id: number) => { setVotes({ ...votes, [id]: !votes[id] }); };

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: G, color: BG, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, zIndex: 100 }}>{toast}</div>
  ) : null;

  const filterBtn = (label: string, sel: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ fontFamily: F, background: sel ? G + "20" : "rgba(255,255,255,0.04)", color: sel ? G : T4, border: "1px solid " + (sel ? G + "30" : BD), padding: "7px 14px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: sel ? 700 : 500 }}>{label}</button>
  );

  // ════ DETAIL VIEW ════
  if (libDet) {
    const bd = libDet;
    const voted = votes[bd.id];
    const comments = (bd.comments || []).slice().reverse();
    const shownComments = showAllCmt ? comments : comments.slice(0, 3);

    return (
      <div style={{ padding: "0 24px" }}>
        <button onClick={() => { setLibDet(null); setShowAllCmt(false); }} style={{ fontFamily: F, color: T4, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 20 }}>← Library</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>{bd.nm}</div>
            {bd.src && bd.tp !== "exercise" ? (() => { const sb = srcBadge(bd.src); return <div style={{ marginTop: 8 }}><span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, fontWeight: 700, background: sb.bg, color: sb.c }}>{sb.l}</span></div>; })() : null}
            <div style={{ fontSize: 15, color: T4, marginTop: 6 }}>{bd.au} · {bd.ao}</div>
            <div style={{ fontSize: 13, color: T5, marginTop: 3 }}>{bd.dt}</div>
          </div>
          <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
        </div>
        <div style={{ fontSize: 16, color: T3, marginTop: 16, lineHeight: 1.7 }}>{bd.ds}</div>
        {(bd.tg || bd.et) ? <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>{(bd.tg || bd.et || []).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.05)", color: T4, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{t}</span>)}</div> : null}
        <div style={{ display: "flex", gap: 14, marginTop: 20, alignItems: "center" }}>
          <button onClick={() => toggleVote(bd.id)} style={{ fontFamily: F, background: voted ? G + "15" : "rgba(255,255,255,0.04)", color: voted ? G : T4, border: "1px solid " + (voted ? G + "30" : BD), padding: "8px 16px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>▲ {bd.v + (voted ? 1 : 0)}</button>
          <span style={{ fontSize: 13, color: T5 }}>Stolen {bd.u}x</span>
        </div>
        {bd.tp === "beatdown" && bd.secs && bd.secs.length > 0 ? <div style={{ marginTop: 24 }}>{bd.secs.map((sec, si) => (
          <div key={si} style={{ marginTop: 16 }}>
            <div style={{ color: sec.color, fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>{sec.label}</div>
            {sec.exercises.map((ex, ei) => (
              <div key={ei} style={{ padding: "10px 14px", background: CD, borderLeft: "3px solid " + sec.color + "40", borderRadius: "0 10px 10px 0", marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T2, fontSize: 15, fontWeight: 600 }}>{ex.n}</span>
                  <span style={{ color: sec.color, fontSize: 13, fontWeight: 600 }}>x{ex.r} {ex.c}</span>
                </div>
                {ex.nt ? <div style={{ color: T4, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{ex.nt}</div> : null}
              </div>
            ))}
            {sec.note ? <div style={{ color: T4, fontSize: 13, marginTop: 6, fontStyle: "italic", padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>{sec.note}</div> : null}
          </div>
        ))}</div> : null}
        {/* Comments */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Comments ({comments.length})</div>
            {comments.length > 3 ? <button onClick={() => setShowAllCmt(!showAllCmt)} style={{ fontFamily: F, background: "none", border: "none", color: G, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{showAllCmt ? "Show less" : "View all"}</button> : null}
          </div>
          {shownComments.map((c, i) => (
            <div key={i} style={{ background: CD, border: "1px solid " + BD, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><span style={{ fontSize: 14, fontWeight: 700, color: T2 }}>{c.au}</span>{c.ao ? <span style={{ fontSize: 13, color: T4, marginLeft: 6 }}>· {c.ao}</span> : null}</div>
                <span style={{ fontSize: 12, color: T5 }}>{c.dt}</span>
              </div>
              <div style={{ fontSize: 15, color: T3, marginTop: 6, lineHeight: 1.55 }}>{c.txt}</div>
            </div>
          ))}
          {comments.length === 0 ? <div style={{ textAlign: "center", color: T6, padding: 16, fontSize: 13 }}>No comments yet. Be the first.</div> : null}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input value={cmtText} onChange={e => setCmtText(e.target.value)} placeholder="Add a comment..." style={{ ...ist, flex: 1 }} />
            <button onClick={() => { if (!cmtText.trim()) return; fl("Comment posted!"); setCmtText(""); }} style={{ fontFamily: F, background: G, color: BG, border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Post</button>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => fl("Saved!")} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Save to locker</button>
        </div>
        {toastEl}
      </div>
    );
  }

  // ════ FILTERS ════
  if (libF) {
    return (
      <div style={{ padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: T1 }}>Filters</div>
          <span onClick={() => setLibF(false)} style={{ color: T4, cursor: "pointer", fontSize: 22 }}>✕</span>
        </div>
        {libT === "beatdowns" ? (
          <div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Difficulty</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","Easy","Medium","Hard","Beast"].map(o => filterBtn(o, fD === o, () => setFD(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Duration</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","30 min","45 min","60 min"].map(o => filterBtn(o, fDu === o, () => setFDu(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Region</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{REGIONS.map(o => filterBtn(o, fR === o, () => setFR(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>AO site type</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All", ...SITES.map(s => s.l)].map(o => filterBtn(o, fAo === o, () => setFAo(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Source</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","Hand Built","AI Generated"].map(o => filterBtn(o, fSrc === o, () => setFSrc(o)))}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Tag</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All", ...TAGS].map(o => filterBtn(o, fET === o, () => setFET(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Difficulty</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{["All","Easy","Medium","Hard","Beast"].map(o => filterBtn(o, fD === o, () => setFD(o)))}</div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Region</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{REGIONS.map(o => filterBtn(o, fExR === o, () => setFExR(o)))}</div>
          </div>
        )}
        <button onClick={() => setLibF(false)} style={{ fontFamily: F, width: "100%", padding: "16px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: G, color: BG, border: "none" }}>Apply filters</button>
      </div>
    );
  }

  // ════ FEED LIST ════
  let feed = [...FEED, ...sharedItems];
  if (libSearch.trim()) {
    const q = libSearch.toLowerCase();
    feed = feed.filter(b => (b.nm || "").toLowerCase().includes(q) || (b.au || "").toLowerCase().includes(q) || (b.ao || "").toLowerCase().includes(q) || (b.ds || "").toLowerCase().includes(q));
  }
  if (libT === "beatdowns") {
    feed = feed.filter(b => b.tp === "beatdown");
    if (fD !== "All") feed = feed.filter(b => b.d === fD.toLowerCase());
    if (fDu !== "All") feed = feed.filter(b => b.dur === fDu);
    if (fR !== "All") feed = feed.filter(b => b.reg === fR);
    if (fAo !== "All") { const sId = SITES.find(s => s.l === fAo); feed = feed.filter(b => sId && b.aoT && b.aoT.includes(sId.id)); }
    if (fSrc !== "All") feed = feed.filter(b => b.src === fSrc);
  } else {
    feed = feed.filter(b => b.tp === "exercise");
    if (fET !== "All") feed = feed.filter(b => b.et && b.et.includes(fET));
    if (fD !== "All") feed = feed.filter(b => b.d === fD.toLowerCase());
    if (fExR !== "All") feed = feed.filter(b => b.reg === fExR);
  }
  if (fSort === "new") feed.sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime());
  if (fSort === "top") feed.sort((a, b) => b.v - a.v);
  if (fSort === "stolen") feed.sort((a, b) => b.u - a.u);

  const af = libT === "beatdowns"
    ? [fD, fDu, fR, fAo, fSrc].filter(v => v !== "All").length
    : [fET, fD, fExR].filter(v => v !== "All").length;

  return (
    <div style={{ padding: "0 24px" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 12 }}>Library</div>
      <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder="Search by title, Q name, AO..." style={{ ...ist, marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid " + BD, padding: 3, marginBottom: 16 }}>
        {["beatdowns", "exercises"].map(sv => (
          <div key={sv} onClick={() => setLibT(sv)} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: libT === sv ? 700 : 500, color: libT === sv ? G : T4, background: libT === sv ? "rgba(34,197,94,0.08)" : "transparent", borderRadius: 10, cursor: "pointer", textTransform: "capitalize" }}>{sv}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ k: "new", l: "New" }, { k: "top", l: "Top voted" }, { k: "stolen", l: "Most stolen" }].map(sv => (
          <button key={sv.k} onClick={() => setFSort(sv.k)} style={{ fontFamily: F, background: fSort === sv.k ? G + "15" : "rgba(255,255,255,0.04)", color: fSort === sv.k ? G : T4, padding: "7px 14px", borderRadius: 10, fontSize: 13, border: "none", cursor: "pointer", fontWeight: fSort === sv.k ? 700 : 500 }}>{sv.l}</button>
        ))}
        <button onClick={() => setLibF(true)} style={{ fontFamily: F, marginLeft: "auto", background: af > 0 ? G + "15" : "rgba(255,255,255,0.04)", color: af > 0 ? G : T4, padding: "7px 14px", borderRadius: 10, fontSize: 12, border: "1px solid " + (af > 0 ? G + "30" : BD), cursor: "pointer", fontWeight: 600 }}>Filters{af > 0 ? " (" + af + ")" : ""}</button>
      </div>
      {feed.map(bd => (
        <div key={bd.id} onClick={() => setLibDet(bd)} style={{ background: CD, border: "1px solid " + BD, borderLeft: "3px solid " + (bd.tp === "exercise" ? P + "50" : A + "50"), borderRadius: 14, padding: "16px 18px", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T2 }}>{bd.nm}</div>
                {bd.src && bd.tp !== "exercise" ? (() => { const sb = srcBadge(bd.src); return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, fontWeight: 700, background: sb.bg, color: sb.c }}>{sb.l}</span>; })() : null}
              </div>
              <div style={{ fontSize: 14, color: T4, marginTop: 5 }}>{bd.au} · {bd.ao}{bd.au === profName ? <span style={{ color: G, fontSize: 11, marginLeft: 6 }}>· You</span> : null}</div>
              <div style={{ fontSize: 12, color: T5, marginTop: 3 }}>{bd.dt}</div>
            </div>
            <span style={{ background: dc(bd.d) + "15", color: dc(bd.d), fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
          </div>
          <div style={{ fontSize: 15, color: T3, marginTop: 10, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bd.ds}</div>
          {(bd.tg || bd.et || bd.dur) ? <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>{bd.dur ? <span style={{ background: G + "12", color: G, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F, fontWeight: 600 }}>{bd.dur}</span> : null}{(bd.tg || bd.et || []).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.05)", color: T4, fontSize: 12, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{t}</span>)}</div> : null}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", gap: 14, fontSize: 14, color: T4 }}>
              <span style={{ color: G, fontWeight: 600 }}>▲ {bd.v}</span>
              <span>Stolen {bd.u}x</span>
              {(bd.comments || []).length > 0 ? <span>{(bd.comments || []).length} comments</span> : null}
            </div>
            <span onClick={e => { e.stopPropagation(); fl("Saved!"); }} style={{ fontSize: 14, color: G, cursor: "pointer", padding: "4px 8px", fontWeight: 600 }}>Save</span>
          </div>
        </div>
      ))}
      {feed.length === 0 ? <div style={{ textAlign: "center", color: T5, padding: 40 }}>No results match your filters</div> : null}
      {toastEl}
    </div>
  );
}
