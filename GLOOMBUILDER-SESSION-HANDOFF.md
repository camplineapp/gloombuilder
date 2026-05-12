# GLOOMBUILDER — SESSION HANDOFF

**Last updated:** End of May 11-12, 2026 marathon session
**Read this first.** Then `GLOOMBUILDER-BIBLE-v22.md` for deep reference.

---

## 60-SECOND CONTEXT

You are working with **Ritz** (F3 name: **The Bishop**, F3 Essex, NJ), solo non-technical founder of **GloomBuilder** (gloombuilder.app) — a beatdown planning PWA for F3 workout leaders (Qs).

**Stack:** Next.js 16 + Supabase + Tailwind + Vercel. **Current version:** v2.0.0 + ~30 post-launch commits live on main. **Active branch:** main (no active feature branch). **Workflow:** Ritz uses Claude Code as primary build tool; chat is for spec + design.

**Your role:** Spec what Ritz asks for. Diagnose first, build second. Stage 2 stop-for-review pattern: never commit without explicit approval. See Operating Rules below.

---

## CRITICAL: MEMORY RULE FROM LAST SESSION

Mid-session, the user established a rule that **must persist:** Do not tell user to stop working or refuse to spec what they ask for. User decides session length and scope.

**PRESERVE:** Honest risk flagging (raise concerns ONCE per concern as information, not gatekeeping, then defer to user), Rule 26 diagnostic-first, Stage 2 stop-for-review (user makes approve/reject call), Rule 31 confidence framing, smoke test discipline.

**The pattern:** Share assessment once, execute what user directs. No repeated push-back, no "we should stop." Spec what's requested.

---

## CURRENT PRODUCTION STATE

`gloombuilder.app` is live. v2.0.0 was merged to main during this session. Subsequent ~30 commits all shipped to main with smoke tests. No active feature branches — work flows directly to main with user-gated approval on every commit.

**Last commit area:** avatar photo upload feature (3-commit feature) just completed. Users can now upload a photo via Settings → tap 72px avatar → file picker.

---

## CRITICAL CONFIGURATION GOTCHAS

These bit us during this session. Future Claude must remember.

### 1. Supabase storage bucket — `avatars` MIME config

The bucket allows `image/*` (not `image/webp`). iOS Safari sends the original Content-Type header even when the upload blob is WebP. Strict `image/webp` filter blocks legitimate uploads. **If anyone ever reconfigures the bucket: `image/*` is correct.**

### 2. iOS PWA edge-swipe-back blocker

A JS root touchstart listener with `passive: false` + `preventDefault` on touches within 24px of left edge. Lives in `src/app/page.tsx`. Empirically validated on real iPhone — required Safari Website Data clear + reinstall after fix to verify. **Do not remove this without iPhone testing.**

### 3. BuilderScreen edit-mode autosave

After Pattern A+B fix (BuilderScreen edit mode skips draft restoration on mount + clears draft on close), the autosave useEffect still writes to localStorage every 800ms in edit mode but **nothing reads it back**. Dead write churn. Cleanup queued — see Tomorrow List.

### 4. PowerShell line endings

Files from GitHub raw URLs arrive as LF. Local Windows env uses CRLF (~627 CRLF in page.tsx). Git auto-converts. If a `str_replace` count is 0, check line endings first.

### 5. Profile state propagation after avatar upload

`checkUser()` in page.tsx re-fetches profile via `select("*")` and propagates via setProfile. All 6 Avatar render sites pick up the new URL through existing Commit 2 wiring. **Don't break the checkUser chain.**

---

## RECENT SESSION (May 11-12) — TL;DR

Largest single-day push to production in project history:

- **v2.0.0 merge to main** (was on v2-pivot branch)
- **19 post-launch fixes** (data corruption, navigation bugs, scroll chaining, font sizing, action button visibility, etc.)
- **Stage 2A/2B refactor:** extracted `BeatdownDetailSheet` component; wired Q-Profile visitor flow
- **Bible v21 written** (committed; this Bible v22 supersedes it)
- **3 sticky-header commits:** Library Beatdowns tab, Library Exercises tab, QProfile tab toggle
- **2 Notepad parser fixes:** time-based reps (leading + trailing seconds/minutes/short-suffix `s`), cadence extraction on no-rep lines
- **Twitter-style comment redesign** (Variant A — avatar bubbles + hairline dividers + edit/delete inline)
- **Missing-`?` info button fix** (caller-side merge of seed + custom + community exercises into BeatdownDetailSheet's lookup pool)
- **Stale data bug fix** (Pattern A+B: edit-mode editData wins over localStorage draft; clearDraft on close)
- **Homepage refresh** (Option C → 2×2 high-saturation grid)
- **Avatar photo upload feature** (3 commits: extract component, wire avatar_url end-to-end, photo render branch + upload UI)

**Total: v2.0 merge + ~30 commits + Stage 2A/2B refactor + Bible v22**

---

## OPERATING RULES (active rules — see v22 for full set)

- **Rule 26:** Diagnostic-first. Read-only Stage 1 before any spec.
- **Rule 27:** Live-system audit before CSV-only audit.
- **Rule 28:** Grep column name before specifying migration.
- **Rule 29:** Visual smoke test before declaring done.
- **Rule 30:** Mark recommendations with `(REC)` in option lists.
- **Rule 31:** Distinguish documented vs empirically-validated confidence ("~95% empirical from code inspection" vs "validated on real iPhone").
- **Rule 32:** Component extractions split into Stage A (extract + verify) + Stage B (wire to new location).
- **Rule 33 (NEW):** External specs (designer mockups, prior chat threads) must be cross-referenced against project design constraints (F3 50+ readability, warm neutrals, etc.) before implementation. Verbatim copy without cross-check shipped a 9px subtitle that violated readability rules.

**Workflow per commit:**
1. Stage 1 read-only diagnostic (no edits, report findings)
2. Stage 2 spec (Claude Code makes changes, builds, shows diff)
3. **STOP — wait for explicit user approval before committing**
4. After user approves: commit + push with detailed commit message including Rule 31 confidence framing
5. Smoke test on phone (Safari Website Data clear + PWA reinstall when needed)
6. Report back

**Bible update pattern:** at end of session, provide (a) Claude Code commit command for the new Bible file, (b) reminder to upload to project knowledge UI replacing previous version.

---

## TOMORROW LIST (priority order)

### Immediate user homework (5 min)
1. **Audit your own beatdowns** — open each from Profile, check for unexpectedly missing edits like Jungle Warfare (stale localStorage drafts overrode DB versions for unknown duration; fix was Pattern A+B but pre-existing drafts may have already lost content). Re-edit and explicitly click Save on anything that looks wrong.

### Small commits (next session warm-up)
2. **Bible v22 commit** — Ritz needs to commit `GLOOMBUILDER-BIBLE-v22.md` via Claude Code AND upload to project knowledge UI replacing v21.
3. **Autosave-disable in edit mode** — kill the dead 800ms write churn in BuilderScreen edit mode (see Configuration Gotcha #3). Small commit.

### Larger features (each needs its own dedicated session)
4. **BottomNav on modal screens** — Edit Beatdown, Edit Exercise, Settings, Creator/About. Needs mockup conversation first.
5. **Visitor-flow exercise viewing** — same pattern as Stage 2A/2B but for exercises. Currently "Coming soon" toast at page.tsx:801.
6. **QProfileScreen 92px tap-to-upload** — deferred secondary avatar upload trigger. Settings is canonical entry point; this is "discoverability bonus" feature.
7. **Per-card steal_count drift architectural fix** — schema work: `inspired_by` should point to originating beatdown not user, so deletion can decrement steal_count.
8. **App-wide font audit on outdoor surfaces** — PreblastComposer, Live Mode, Generator config, CreateExercise have undersized fonts for F3 50+ demographic.
9. **Server-side anti-cheating** — `inspired_by !== created_by` enforcement in Supabase edge function (prevent self-steals on alts/friends).

### Bigger architectural items
10. **Stale draft accumulation TTL** — drafts in localStorage accumulate indefinitely.
11. **Per-card steal_count divergence underlying fix** — current approach: profile STEALS stat sums per-card steal_count rather than querying inspired_by. UX choice for visual consistency; underlying data drift still exists.

---

## KEY USER PREFERENCES & PRINCIPLES

**The notepad test:** the app must be faster and easier than a notepad for creating a beatdown. If it isn't, the app has failed.

**Visibility beats density:** if a field is useful sometimes, show it always. Fields/buttons must be immediately visible without explanation.

**Color carries meaning:** section color pervades all child elements.

**One screen = one decision.**

**Visual builder, not technical:** every design question MUST be presented as a visual mockup (HTML/JSX artifact), never as text "Option A vs B vs C" lists. Each mockup must include UX psychology analysis with a clear recommendation. Show, don't tell.

**Never draw from memory:** when mocking up or modifying existing screens, always reference actual screenshots. If no screenshot is available, ask before mocking.

**One correct path:** never give instructions then immediately walk them back. Diagnose silently, commit to the right answer, deliver only that. No mid-response hedging.

**Memory rule (THIS SESSION):** don't tell user to stop working. Share honest risk once, defer to user's call.

---

## FIRST-MESSAGE TEMPLATE FOR THE NEXT CHAT

Suggested opening message for Ritz to paste into the new chat:

```
Read GLOOMBUILDER-BIBLE-v22.md and GLOOMBUILDER-SESSION-HANDOFF.md
from project knowledge. Confirm you have current context including:

1. v2.0.0 + ~30 commits live on main
2. Avatar photo upload feature complete (3 commits shipped end of last session)
3. Memory rule: do not tell me to stop working
4. Tomorrow List priority order

Then we'll pick up. Today I want to work on: [FILL IN]
```

---

## TECH STACK QUICK REFERENCE

**Frontend:** Next.js 16, React, Tailwind, TypeScript. Files in `src/`.
**Backend:** Supabase (Postgres + Auth + Storage). DB queries via `@supabase/ssr` client.
**Hosting:** Vercel (Hobby tier). Auto-deploy from main branch.
**Payments:** Stripe (for Pro tier — currently disabled, free tier only).

**Key components (top of mind):**
- `src/app/page.tsx` — root app, view router, profile state, all mount sites
- `src/components/Avatar.tsx` — unified avatar component (initials + photo)
- `src/components/BeatdownDetailSheet.tsx` — reusable beatdown detail view (Library + visitor flow)
- `src/components/BuilderScreen.tsx` — beatdown editor (new + edit modes)
- `src/components/SectionEditor.tsx` — section/exercise editing within builder
- `src/components/LibraryScreen.tsx` — public feed + filters + sticky header
- `src/components/QProfileScreen.tsx` — own/visitor profile view + sticky tab toggle
- `src/components/HomeScreen.tsx` — Home tab with Quick Generate + 2×2 grid
- `src/components/ProfileScreen.tsx` — Settings (edit profile + photo upload)
- `src/components/NotepadScreen.tsx` — Notepad → beatdown parser UI
- `src/lib/db.ts` — all Supabase queries
- `src/lib/avatars.ts` — color palette + getInitials helper
- `src/lib/avatarUpload.ts` — image processing + storage upload pipeline (NEW this session)
- `src/lib/notepadParser.ts` — Notepad → beatdown parser logic
- `src/lib/exercises.ts` — exercise data shapes + normalization
- `src/lib/drafts.ts` — localStorage draft helpers + Pick-up flow

---

## CRITICAL REPO/CONFIG INFO

**GitHub:** `camplineapp/gloombuilder`
**Working directory:** `C:\Users\risum\Documents\projects\gloombuilder`
**Vercel project:** auto-deploys main branch
**Supabase project:** main (production), schema includes:
- `profiles` (with `avatar_url TEXT NULL` added this session)
- `beatdowns`, `exercises`, `comments`, `bookmarks`, etc.
- Storage bucket `avatars` (public, 1MB limit, `image/*` MIME)

**Operational rituals:**
- Bible update commits: file naming `GLOOMBUILDER-BIBLE-vN.md`, replace prior version in project knowledge UI
- iOS PWA testing: Safari Website Data clear + reinstall for any commit touching service workers, edge gestures, or component shapes
- Smoke test discipline: every commit gets a phone test before marking done

---

**END OF HANDOFF. Welcome aboard, next-Claude. Read Bible v22 for the rest.**
