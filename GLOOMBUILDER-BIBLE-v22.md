# GLOOMBUILDER BIBLE v22
## Complete Product & Design Truth Document
### May 12, 2026 — POST-AVATAR-FEATURE EDITION

*This document supersedes Bible v21 (May 7-8, 2026). v22 reorganizes the canonical reference content (architecture, design system, operating rules, schema, conventions) into the front sections for fast lookup, with chronological session history preserved at the end. The May 11-12 session — the largest single-day push in project history — added ~30 commits including the 3-commit avatar photo upload feature, 3 sticky-header commits, 2 Notepad parser fixes, the Twitter-style comment redesign, the homepage 2×2 grid, the stale-data bug fix, and one new operating rule (Rule 33 — cross-reference external specs against project design constraints before shipping). Also captured: a critical memory rule change about session length and the role of risk-flagging vs. gatekeeping.*

---

## TABLE OF CONTENTS

1. **[CRITICAL CONTEXT](#critical-context)** — what every Claude must know before doing anything
2. **[OPERATING RULES](#operating-rules)** — Rules 1-33, the discipline framework
3. **[ARCHITECTURE](#architecture)** — stack, file structure, key components
4. **[DATABASE SCHEMA](#database-schema)** — Supabase tables, columns, RLS policies, storage buckets
5. **[DESIGN SYSTEM](#design-system)** — tokens, typography, color palette, component patterns
6. **[CORE DESIGN PRINCIPLES](#core-design-principles)** — the F3 50+ readability rule, notepad test, visibility-beats-density
7. **[WORKFLOW](#workflow)** — Stage 1 / Stage 2 pattern, commit message format, Bible update ritual
8. **[KEY COMPONENTS DEEP-DIVE](#key-components-deep-dive)** — Avatar, BeatdownDetailSheet, BuilderScreen, SectionEditor
9. **[CONFIGURATION GOTCHAS](#configuration-gotchas)** — landmines that bit us
10. **[FEATURE STATE](#feature-state)** — what's shipped, what's pending
11. **[F3 VOCABULARY](#f3-vocabulary)** — terminology reference
12. **[SESSION HISTORY](#session-history)** — chronological recap of major sessions

---

## CRITICAL CONTEXT

### Who is this for

**Ritz** (F3 name: **The Bishop**, F3 Essex, New Jersey). Solo non-technical founder. Building GloomBuilder (gloombuilder.app) — a beatdown planning and sharing PWA for F3 workout leaders (Qs).

### What stage we're in

**Live in production.** v2.0.0 merged to main on May 7-8, 2026. ~30 post-launch commits shipped since. App is fully functional end-to-end. No paying users yet — pre-public-launch. Active dogfooding by Ritz + F3 Essex PAX.

### The critical memory rule (set May 12)

**Do not tell user to stop working or refuse to spec what they ask for.** User decides session length and scope.

**PRESERVE:** Honest risk flagging (raise concerns ONCE per concern as information, not gatekeeping, then defer to user), Rule 26 diagnostic-first, Stage 2 stop-for-review (user makes approve/reject call), Rule 31 confidence framing, smoke test discipline.

**Background:** during the May 11-12 marathon, Claude pushed back 4+ times on continuing the session ("you should stop," "we're at peak fatigue"). User overrode each time and shipped clean. After the session passed 17 commits and Claude was still pushing back, user explicitly directed: "Commit to memory that you don't force me to stop working. I'll tell you what I want you to do." Claude clarified the distinction between gatekeeping (overdone) and honest risk-flagging (still wanted). User confirmed: "Sounds right." Memory updated.

**The pattern:** share assessment once per concern, then execute what user directs. No repeated push-back. No "are you sure?" loops. No refusing to spec.

### What Claude is and isn't doing here

Claude's role: spec, diagnose, design, walk through tradeoffs. Ritz uses **Claude Code** as the primary build tool — Claude Code has direct file access, makes the actual edits, runs builds, shows diffs. This chat is for thinking + design + spec-writing.

The workflow is **strictly two-stage**:
- **Stage 1:** Claude Code runs read-only diagnostic. No edits. Reports findings.
- **Stage 2:** Claude writes spec → Claude Code makes changes → builds → shows diff → **STOPS** → waits for user approval → commits + pushes.

Claude must not bypass either stage. Every commit waits for explicit user approval before pushing.

---

## OPERATING RULES

These rules have been established across sessions and are permanent unless explicitly retired. Number = order of establishment.

**Rule 1 (foundational):** The notepad test. The app must be faster and easier than a notepad for creating a beatdown. If it isn't, the app has failed.

**Rule 2:** Visibility beats density. If a field is useful sometimes, show it always. Fields/buttons must be immediately visible without explanation.

**Rule 3:** Color carries meaning. Section color pervades all child elements.

**Rule 4:** One screen = one decision.

**Rule 5:** "These are old guys with poor eyesight." Primary user is men 40-50, outdoors before dawn, poor eyesight, thick fingers. All design decisions filtered through this constraint. Live Mode's teleprompter is the internal gold standard for visual clarity.

**Rule 6-25:** (Established across earlier sessions, captured in Bible v20 and earlier. Most are subsumed by later rules or merged into design principles below.)

**Rule 26:** Diagnostic-first. Never assert a UI state from memory without running a diagnostic. Always check before claiming. Read-only Stage 1 before any spec.

**Rule 27:** Live-system audit before CSV-only audit. When investigating data shape, query the actual DB, not just static files.

**Rule 28:** Grep column name before specifying migration. Many "missing column" issues are actually "column exists but isn't selected." Check before writing migration SQL.

**Rule 29:** Visual smoke test before declaring done. Build-green is not the same as user-tested-on-phone.

**Rule 30:** Mark recommendations with `(REC)` in option lists. Helps user spot the suggested path.

**Rule 31:** Distinguish documented vs empirically-validated confidence. In commit messages and reports: "~95% empirical from code inspection" is different from "validated on real iPhone after Safari Website Data clear." State which.

**Rule 32:** Component extractions split into Stage A (extract + verify in original location) + Stage B (wire to new location). Each step independently verifiable. Established with `BeatdownDetailSheet` extraction.

**Rule 33 (NEW May 12):** External specs (designer mockups, prior chat threads, copied-and-pasted descriptions) must be cross-referenced against project design constraints (F3 50+ readability, warm neutrals, etc.) before implementation. Verbatim copy without cross-check shipped a 9px subtitle that violated readability rules. Trust the principles, not the spec.

---

## ARCHITECTURE

### Stack

- **Framework:** Next.js 16 (Turbopack)
- **Language:** TypeScript
- **UI:** React 18, Tailwind CSS (utility-first, plus inline styles for complex tokens)
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Hosting:** Vercel (Hobby tier)
- **Auto-deploy:** main branch → gloombuilder.app on push
- **Payments:** Stripe (Pro tier infrastructure exists, currently disabled — free tier only)

### Working directory

`C:\Users\risum\Documents\projects\gloombuilder`

### GitHub

`camplineapp/gloombuilder` — main branch is production. No active feature branches; work flows directly to main with user-gated approval per commit.

### Top-level file structure (significant files only)

```
src/
├── app/
│   └── page.tsx                    # Root app, view router, profile state, all mount sites
├── components/
│   ├── Avatar.tsx                  # Unified avatar component (initials + photo)
│   ├── BeatdownDetailSheet.tsx     # Reusable beatdown detail (Library + visitor flow)
│   ├── BuilderScreen.tsx           # Beatdown editor (new + edit modes)
│   ├── SectionEditor.tsx           # Section/exercise editing within builder
│   ├── LibraryScreen.tsx           # Public feed + filters + sticky header
│   ├── QProfileScreen.tsx          # Own/visitor profile + sticky tab toggle
│   ├── HomeScreen.tsx              # Home tab with Quick Generate + 2×2 grid
│   ├── ProfileScreen.tsx           # Settings (profile edit + photo upload)
│   ├── NotepadScreen.tsx           # Notepad → beatdown parser UI
│   ├── GeneratorScreen.tsx         # AI generator config
│   ├── LiveModeScreen.tsx          # Live beatdown teleprompter
│   ├── PreblastComposer.tsx        # Preblast announcement composer
│   ├── CreateExerciseScreen.tsx    # Custom exercise creator
│   ├── ExerciseDetailSheet.tsx     # Exercise info modal
│   ├── BottomNav.tsx               # Home/Library/Profile tab bar
│   └── (others — LockerScreen, AuthScreen, ThumbsUpIcon, etc.)
├── lib/
│   ├── db.ts                       # All Supabase queries
│   ├── supabase.ts                 # Client factory
│   ├── avatars.ts                  # Color palette + getInitials helper
│   ├── avatarUpload.ts             # Image processing + storage upload (NEW May 12)
│   ├── notepadParser.ts            # Notepad → beatdown parser logic
│   ├── exercises.ts                # Exercise data shapes + normalization
│   └── drafts.ts                   # localStorage draft helpers + Pick-up flow
└── app/globals.css                 # body styling, scrollbar hiding, overscroll behavior
```

### View routing model

Single-page app. Tabs (`Home`, `Library`, `Profile`) controlled by `tab` state in `page.tsx`. Within each tab, a `vw` state controls sub-views (e.g., `vw === "settings"` shows ProfileScreen as an overlay above the Profile tab). Full-screen routes (Builder, Generator, Notepad, Live Mode) override the tab UI entirely.

Key state in `page.tsx`:
- `tab: "home" | "library" | "profile"`
- `vw: null | "gen" | "build" | "notepad" | "edit-bd" | "settings" | "live" | ...`
- `user: User | null` (Supabase auth)
- `profile: { f3_name, ao, state, region, avatar_url? } | null`
- `lk: LockerBeatdown[]` — user's own beatdowns (full DB pull)
- `lkEx: LockerExercise[]` — user's own custom exercises
- `sharedItems: SharedItem[]` — public feed (full DB pull)
- `userVotes: Set<string>` — items user has voted on
- `editingBd: LockerBeatdown | null` — beatdown being edited in BuilderScreen
- `viewingUserId: string | null` — Q-Profile being viewed (null = own profile)
- `viewingSharedBd: FeedItem | null` — beatdown being viewed in q-profile-bd visitor flow

### Scroll model

**Body-level scrolling.** Per Stage 1 diagnostic of sticky-header work: no screen has its own scroll container. The document body is the actual scroll mechanism. `globals.css` sets `overflow-x: hidden`, `overscroll-behavior-y: contain`, `overscroll-behavior-x: none`. Scrollbars hidden globally via `::-webkit-scrollbar`. Pull-to-refresh overscroll contained on Y axis.

**Bottom nav:** `position: fixed`, with `paddingBottom: calc(12px + env(safe-area-inset-bottom, 8px))` for iOS notch safety.

**Sticky headers (Library, QProfile — May 12):** `position: sticky, top: 0, zIndex: 10`. Negative horizontal margins + matching padding to negate parent's padding (so background extends edge-to-edge during scroll). `paddingTop: env(safe-area-inset-top, 0px)` absorbs iOS dynamic island/notch.

---

## DATABASE SCHEMA

### Postgres tables

**`profiles`** — user profile data
- `id` (UUID, FK to auth.users)
- `f3_name` (TEXT) — display name
- `ao` (TEXT) — Area of Operations (workout location)
- `state` (TEXT)
- `region` (TEXT)
- `avatar_url` (TEXT, NULL) — **added May 12** — public URL of uploaded avatar photo

**`beatdowns`**
- `id` (UUID)
- `created_by` (UUID, FK profiles.id)
- `name`, `description`, `difficulty` (medium|hard|beast), `duration`, `sections` (JSONB), `site_features` (TEXT[]), `equipment` (TEXT[]), `tags` (TEXT[])
- `is_public` (BOOL) — controls feed visibility
- `inspired_by` (UUID, FK profiles.id) — for stolen beatdowns; FK to creator user, not source beatdown (architectural item: should point to beatdown ID for proper steal_count decrement on delete)
- `vote_count`, `steal_count`, `comment_count` (INT) — denormalized aggregates
- `created_at`, `updated_at`

**`exercises`**
- Similar shape to beatdowns
- `source` (TEXT) — `seed` | `community` | `private` (own custom)
- `name`, `aliases`, `description`, `how_to`, `body_part`, `exercise_type`, `equipment`, `site_type`, `group_size`, `cadence`, `difficulty`, `intensity`, `movement_type`, `is_mary`, `is_transport`

**`comments`**
- `id`, `user_id` (FK profiles.id), `item_id` (UUID), `item_type` (`beatdown` | `exercise`), `text`, `created_at`

**`bookmarks`, `votes`** — relations

### Storage

**Bucket `avatars`:**
- Public read
- 1 MB file size limit
- Allowed MIME types: `image/*` ⚠️ (NOT `image/webp` — see Configuration Gotchas)
- Path convention: `{userId}/avatar.webp`

**RLS policies on `storage.objects`:**
- SELECT (public read): `bucket_id = 'avatars'`
- INSERT/UPDATE/DELETE (authenticated): `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

---

## DESIGN SYSTEM

### Color tokens

```
BG          = #0E0E10   /* canvas */
G (green)   = #22c55e   /* primary accent — own user, success */
P (purple)  = #a78bfa   /* secondary accent — Pro features, community */
R (red)     = #ef4444   /* destructive */

/* Warm neutral text tones */
T1 = #F0EDE8   /* primary text */
T2 = #D0C8BC
T3 = #C9C2BB
T4 = #928982   /* secondary text — subtitles, metadata */
T5 = #7A7268
T6 = #5A534C   /* tertiary — least prominent */

/* Surfaces */
CD = rgba(255,255,255,0.028)  /* card background — subtle on dark */
BD = rgba(255,255,255,0.07)   /* card border — hairline */
```

### Font

`'Outfit', system-ui, -apple-system, sans-serif` — base size +2px above default. Letter-spacing tuned for outdoor readability (-0.5 on titles, normal on body).

### Avatar color palette (deterministic per user)

8-color palette in `src/lib/avatars.ts`: amber, violet, blue, cyan, gold, forest, slate, charcoal. UUID hash → palette index. `isOwn=true` forces brand green #22c55e.

### Component patterns

**Tier-based avatar sizing** (Avatar component):
- `size ≤ 42`: 1px border, "26"/"66" alpha suffixes, font weight 500
- `size 43-79`: 1.5px border, "09"/"19" alpha, weight 700
- `size ≥ 80`: 2px border, "1f" bg + full border alpha, weight 700
- Photo path (avatarUrl truthy): NO border, `objectFit: cover`, plain circle

**Card surface (Bible v20 spec):**
- `background: rgba(255,255,255,0.028)` (CD)
- `border: 1px solid rgba(255,255,255,0.07)` (BD)
- `borderRadius: 18`
- `padding: 20px 22px` or `16px` depending on density tier
- Tier 2 rows: 3px colored top stripe for section cards in BuilderScreen
- Tier 3 muted tiles: darker bg (#0E0E10) + thinner border (#1f1f23) + smaller radius (10px)

**Pill button:**
- `padding: 7px 14px` (small) or `10px 18px` (large)
- `borderRadius: 10`
- Active state: brand green tint background + green text
- Inactive: T4 text on subtle gray background

### Logo

`/public/logo.png` — chrome silver G + emerald green B on black. ~42px in headers.

### Source badges (on beatdowns/exercises)

- **HAND BUILT** (gold #E8A820) — built without AI assist
- **AI GENERATED** (gray #94a3b8) — permanent, intentionally visible as marketing signal
- **GLOOMBUILDER** (green) — system-generated content
- Color tints in tag chips: difficulty (medium amber, hard red, beast deep red)

---

## CORE DESIGN PRINCIPLES

### The F3 50+ readability rule

Primary target users: men 40-50, outdoors before dawn, poor eyesight, thick fingers. **Every visual design decision filtered through this.**

- Minimum readable font size: **12px** for any meaningful text. 9px violated this rule on May 12 and shipped — Rule 33 was established as a result.
- Bottom-of-screen disclaimer ("Not affiliated with F3 Nation, Inc...") is the legibility floor. No text smaller than this.
- Tap targets minimum 36px square. 44px preferred for primary actions.
- Contrast: text against background must be high. Warm neutrals over pure white-on-black.
- Live Mode (teleprompter) is the internal gold standard — anything less legible than Live Mode needs justification.

### Visibility beats density

If a field or button is useful sometimes, show it always. Don't hide it behind menus. Trade screen space for instant comprehension.

Examples from this session:
- Add a comment input is anchored at bottom of comment section, not hidden behind a button
- Steal button on others' beatdowns is the only button shown — but always shown
- Filter chips on Library are always visible in sticky header

### One screen = one decision

Each screen should ask one question or surface one action. Edit Beatdown asks "what should this beatdown be?" The Live Mode asks "what's the next exercise?" Multi-purpose screens fail at all purposes.

### The notepad test

The app must be **faster** and **easier** than typing a beatdown into the iOS Notes app. If it isn't, the user will use Notes instead.

Concrete tests:
- Generate beatdown from scratch in <30 seconds (Quick Generate hero)
- Notepad input → parsed beatdown in <10 seconds
- Edit a section + save in <5 taps

### Never draw from memory

When mocking up or modifying existing screens, **always reference actual screenshots**. If no screenshot is available, **ask before mocking**. Existing screen + new feature = identical UI with only the explicit change. No drive-by redesigns.

### Visual builder, not technical

Every design question MUST be presented as a visual mockup (HTML/JSX artifact), never as text "Option A vs B vs C" lists. Each mockup must include UX psychology analysis with a clear recommendation. Show, don't tell.

---

## WORKFLOW

### Two-stage commit pattern (canonical)

**Stage 1 — Read-only diagnostic:**
- Claude writes the diagnostic prompt
- Ritz pastes into Claude Code
- Claude Code reads files, runs greps, reports findings
- **No edits**
- Findings flow back to chat for Claude to write the Stage 2 spec

**Stage 2 — Build:**
- Claude writes detailed spec including file:line references, exact change shapes, what to leave alone, verification steps
- Spec ends with: "⚠️ CRITICAL: STOP after build-green. Do NOT commit. Show diff and wait for explicit user approval before committing."
- Ritz pastes spec into Claude Code
- Claude Code makes changes, runs `npm run build`, shows `git diff`, **stops**
- Ritz reviews diff, either approves or requests changes
- On approval: Claude writes the commit message with Rule 31 confidence framing
- Ritz pastes commit message into Claude Code → commits + pushes
- Smoke test on phone (Safari Website Data clear + PWA reinstall when needed)
- Report back

### Commit message format

```
<type>(<scope>): <short description>

<longer prose explanation of what changed and why>

<bullet list of specific changes>

Confidence per Rule 31: ~XX% empirical based on <what was verified>.
The N% uncertainty is <what remains unknown>.
```

Standard types: `feat`, `fix`, `refactor`, `docs`, `chore`.

### Stage 2 stop-for-review

**Never commit without explicit approval.** Even if the build is green, even if the spec was followed exactly, even if it seems trivial. The pattern exists because:
1. Diffs catch things specs miss
2. User retains control over what goes to production
3. Forces explicit go/no-go decisions, prevents momentum from shipping bad commits

### Bible update ritual

When a session ends with significant work:
1. Claude writes the new Bible (`GLOOMBUILDER-BIBLE-vN.md`) incrementing version
2. Claude provides a Claude Code commit command to add it to the repo
3. **Critical:** Claude reminds Ritz to upload the new Bible to project knowledge UI, replacing the previous version
4. The session-handoff doc (`GLOOMBUILDER-SESSION-HANDOFF.md`) also updates each major session

### Memory rule

Ritz has access to `memory_user_edits` — Claude's persistent memory across chats. Major user preferences and operating rules get saved there. As of May 12, the active memory entries include:

- Ritz/Bishop/F3 Essex context
- GloomBuilder tech stack + workflow
- F3 vocabulary in use
- Design principles (notepad test, visibility, color carries meaning, etc.)
- Claude Code migration (completed)
- "Don't tell user to stop working" rule (May 12)

---

## KEY COMPONENTS DEEP-DIVE

### `Avatar.tsx` (May 11-12 extraction)

Single source of truth for all avatar rendering. Eliminates 6 inline implementations.

**Props:**
```typescript
interface AvatarProps {
  userId: string;        // UUID for color derivation; "" falls back to name hash
  name: string;          // For initials extraction
  size: number;          // 36/42/72/92 typical
  isOwn?: boolean;       // Forces brand green
  avatarUrl?: string | null;  // Photo URL; if set, renders <img> instead of initials
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}
```

**Render logic:**
- If `avatarUrl` truthy → `<img>` with `objectFit: cover`, no border, circular via `borderRadius: 50%`
- Else → colored circle with initials, tier-based border styling

**Used in 6 sites:**
1. QProfileScreen 92px big avatar
2. HomeScreen 42px top-right chip
3. ProfileScreen 72px Settings edit avatar
4. LibraryScreen 36px beatdown card author
5. BeatdownDetailSheet 36px commenter (each comment row)
6. BeatdownDetailSheet 36px "Add a comment" row (current user)

### `BeatdownDetailSheet.tsx` (Stage 2A extraction, May 7-8)

Reusable detail view for a beatdown. Used by both Library (`libDet`) and Q-Profile visitor flow (`q-profile-bd` view). Replaced 244 lines of inline JSX in LibraryScreen.

**Renders:** title, author, location, tags, description, sections + exercises, comments (Twitter-style as of May 12), Steal button (only when not own), exercise sub-detail modal.

**Key props:**
- `item: FeedItem` — the beatdown to display
- `seedEx: ExerciseData[]` — merged exercise pool for `?` info lookup (seed + custom + community — see "Missing-? bug fix" in session history)
- `currentUserId?: string` — for ownership detection
- `currentAvatarUrl?: string | null` — current user's photo for the "Add a comment" row
- `onSteal, onToggleVote, onOpenProfile, onRefresh` — handlers

**Action button visibility rules (May 12):**
- Yours: hide all (Save/Live/Preblast). Detail view is read-only feeling. Edit from Profile tab.
- Others': show only "Steal" button. Live/Preblast removed entirely — they become post-Steal actions accessible from your own Locker.

### `BuilderScreen.tsx` + `SectionEditor.tsx`

The beatdown editor. Two modes:
- **New mode** (`editData` null): build a new beatdown from scratch or via Pick-up restoration
- **Edit mode** (`editData` set): modify an existing beatdown

**Pattern A+B fix (May 11-12):** Edit mode now **skips draft restoration on mount** (editData wins over localStorage) and **clears draft on back-button close**. Previously, autosave drafts could clobber DB-fresh editData on next open, creating ghost edits that survived across sessions. The autosave useEffect still fires every 800ms in edit mode but is **now write-only** (nothing reads it back) — cleanup queued.

**Section editing:**
- SectionEditor handles per-section exercise rows
- Exercise picker uses merged pool: seed + lkEx (user customs) + community-shared
- The "?" info button gates on `foundEx` lookup against this merged pool

### `LibraryScreen.tsx`

Public feed. Two sub-tabs (Beatdowns / Exercises) controlled by `libT` state. Mounts BeatdownDetailSheet for tap-into-detail (`libDet` state). Mounts ExerciseDetailSheet for exercise info modal (`dbDetail` state).

**Sticky header (May 12):** page title, tab toggle, search input, sort/filter chip rows all freeze at top. Card lists scroll under. `position: sticky, top: 0, zIndex: 10`. Edge-to-edge background via negative margins + matching padding.

### `QProfileScreen.tsx`

Profile view. Used for both own profile (current user) and visitor flow (viewing another Q's profile). `isOwn` flag derived from `userId === currentUserId`.

**Sticky tab toggle (May 12):** ONLY the "YOUR BODY OF WORK" label + Beatdowns/Exercises tab toggle freeze. Avatar, name, location, stats card all scroll away (per user-chosen option b — tab-toggle-only freeze, not full-header freeze).

**Settings entry:** gear icon top-right → routes to `vw === "settings"` → mounts ProfileScreen (the editing form, not to be confused with QProfileScreen).

### `HomeScreen.tsx`

Home tab. Components:
- Header (logo, title, subtitle "Build. Share. Steal. Repeat.", avatar chip top-right)
- Pick-up card (only visible when localStorage draft exists for new-flow beatdowns)
- Quick Generate hero (green gradient card with "Generate beatdown" button)
- "or" divider
- 2×2 high-saturation creation grid (May 12):
  - Top-left: 🛠️ Build from scratch (blue #4f7dff)
  - Top-right: 📝 Notepad (amber #f59e0b)
  - Bottom-left: 💪 Add exercise (purple #a855f7)
  - Bottom-right: 📣 Preblast (red #ef4444)
- Footer disclaimer

### `ProfileScreen.tsx` (Settings)

Profile editing form. Fields: F3 Name, AO, State, Region. Plus avatar upload (May 12 — tap 72px avatar → file picker).

**Avatar upload flow:**
1. Tap avatar → hidden `<input type="file" accept="image/*">` opens
2. File select → `uploadAvatar(file, profUserId)` from `src/lib/avatarUpload.ts`
3. Pipeline: validate type/size → `createImageBitmap` decode → center square crop → 256×256 resize → WebP encode @ 0.85 quality → upload to `avatars/{userId}/avatar.webp` with `upsert: true` → return `${publicUrl}?v=${Date.now()}` (cache-busted)
4. `UPDATE profiles SET avatar_url = ...` to persist
5. `setProfAvatarUrl(url)` for immediate UI update
6. `onAvatarChanged()` callback fires `checkUser()` in page.tsx → refetches profile → propagates to all 6 Avatar render sites

### `NotepadScreen.tsx` + `notepadParser.ts`

Notepad input → parsed beatdown. User types/pastes free-form text, parser detects sections, exercises, reps, cadence.

**Parser patterns (in priority order):**
- P1: `x15` anywhere (multipliers)
- P2: trailing duration (`stretch 60 sec`, `stretch 60s`, `stretch 60 minutes`) — supports `seconds|second|secs|sec|s|minutes|minute|mins|min`
- P2b (May 12): leading duration (`60 sec stretch`, `60s stretch`, `30 min walk`) — same alternation
- P3: trailing bare digit (`merkins 15`)
- P4: leading bare digit (`15 merkins`)
- Q6 fallback: no rep pattern matches → cadence extracted from line, name is whatever remains

**Cadence extraction (May 12 fix):** runs both inside `extractReps` (for lines that match rep patterns) AND in Q6 fallback (for lines like `plank IC` with no reps). Previously, no-rep lines lost their cadence to a hardcoded OYO default because cadence scope died with `extractReps`'s null return.

---

## CONFIGURATION GOTCHAS

These bit us during development. Future Claude must remember.

### 1. Supabase storage bucket — `avatars` MIME config

Bucket allows `image/*`, NOT `image/webp`. iOS Safari sends the original Content-Type header even when the upload blob is WebP. A strict `image/webp` filter blocks legitimate uploads.

**If anyone ever reconfigures the bucket: `image/*` is correct.**

Background: bucket was initially configured with `image/webp` only. iOS Safari uploads failed with "mime type image/png is not supported." Laptop uploads worked. The difference was iOS Safari's Content-Type header. Loosened to `image/*` and everything works. Client code still converts to WebP before upload, so storage is still optimized.

### 2. iOS PWA edge-swipe-back blocker

JS root touchstart listener in `src/app/page.tsx` with `passive: false` + `preventDefault` on touches within 24px of left edge. Required to block iOS Safari's native edge-swipe-back gesture from navigating away from the PWA.

**Empirically validated on real iPhone** — required Safari Website Data clear + reinstall after fix to verify. **Do not remove without iPhone testing.**

The opt-out attribute mechanism (`data-allow-edge-swipe`) is in code but currently unused — kept as future hook in case some surface (e.g., horizontal carousel) needs to opt out.

### 3. BuilderScreen edit-mode autosave (write-only)

After Pattern A+B fix (May 11-12), edit mode skips draft restoration on mount AND clears draft on back-button close. The autosave useEffect still fires every 800ms in edit mode but **nothing reads it back**.

Dead write churn. Cleanup queued in Tomorrow List — disable the autosave useEffect when `editData` is set.

### 4. PowerShell line endings

Files from GitHub raw URLs arrive as LF. Local Windows env uses CRLF (~627 CRLF in page.tsx). Git auto-converts on commit. If a `str_replace` count is 0, check line endings first.

### 5. Profile state propagation after avatar upload

`checkUser()` in page.tsx is the canonical "refetch profile state" function. Used by:
- Initial app load
- Profile save in ProfileScreen
- Avatar change (May 12)

The profile state propagates via `setProfile(prof)` which flows to all 6 Avatar render sites through prop pipelines established in Commit 2 of the avatar feature. **Don't break the checkUser chain.**

### 6. PowerShell auto-linkifier in terminal

When terminal output contains strings like `user.id` or `data.user.id`, chat display auto-linkifies them. This is a display artifact only — never claim file corruption based on this. Verify with `$line.Length` if needed.

### 7. F3 Codex copyright

F3 exercise names are safe to use (open knowledge). Codex descriptions are copyrighted — all descriptions in our DB must be 100% original, no paraphrasing from F3 Nation Codex.

### 8. `inspired_by` FK semantics

`beatdowns.inspired_by` currently points to the originating user (FK to profiles.id), not the originating beatdown. This means:
- When a user deletes a beatdown that others stole, the stolen copies still reference the deleted user
- We can't decrement steal_count on source deletion because we don't know the source ID

Architectural fix queued: change to FK to beatdowns.id. Schema migration + data backfill. Bigger project.

---

## FEATURE STATE

### Shipped (live on gloombuilder.app as of May 12)

**Core flows:**
- ✅ Auth (Supabase magic link)
- ✅ Profile (F3 name, AO, state, region, **avatar photo upload**)
- ✅ Build from scratch (BuilderScreen + SectionEditor + exercise picker)
- ✅ Quick Generate (AI-assisted via Claude API)
- ✅ Notepad (free-form text → parsed beatdown)
- ✅ Add custom exercise (CreateExerciseScreen)
- ✅ Share/unshare beatdowns (toggles is_public flag)
- ✅ Public Library feed (beatdowns + exercises tabs, sort, filter, search, **sticky header**)
- ✅ Steal beatdowns/exercises (fork to your locker)
- ✅ Comments (Twitter-style with avatar bubbles, edit/delete own)
- ✅ Votes (👍 toggle per item)
- ✅ Live Mode (teleprompter for running a beatdown)
- ✅ Preblast composer (announce a beatdown via shareable text)
- ✅ Q Profile (own + visitor flow, **sticky tab toggle**)
- ✅ Visitor-flow beatdown viewing (tap another Q's beatdown in their profile)

**Recent quality-of-life:**
- ✅ Pick-up card on Home (resume draft if abandoned mid-flow)
- ✅ Modified Flavor B draft architecture (draft restoration on new flows, NOT on edit flows — see Pattern A+B fix)
- ✅ iOS PWA edge-swipe-back blocker
- ✅ Tab-tap-while-on-root resets Library sub-views
- ✅ Action button visibility rules (own = no buttons, others = Steal only)
- ✅ "?" info button works for custom + community exercises in detail view

### Pending — Tomorrow List (priority order)

**Immediate user homework:**
1. **Audit own beatdowns** — open each from Profile, check for stale-draft-clobbered content like Jungle Warfare. Re-edit and explicitly Save anything that looks wrong.

**Small commits:**
2. **Bible v22 commit** — commit `GLOOMBUILDER-BIBLE-v22.md`, upload to project knowledge UI replacing v21.
3. **Autosave-disable in edit mode** — kill the dead 800ms write churn (see Configuration Gotcha #3).

**Larger features (each its own session):**
4. **BottomNav on modal screens** — Edit Beatdown, Edit Exercise, Settings, Creator/About. Needs mockup first.
5. **Visitor-flow exercise viewing** — same pattern as Stage 2A/2B for exercises. Currently "Coming soon" toast at page.tsx:801.
6. **QProfileScreen 92px tap-to-upload** — deferred secondary avatar upload trigger. Discoverability bonus.
7. **Per-card steal_count drift architectural fix** — `inspired_by` FK to beatdowns.id, decrement on delete.
8. **App-wide font audit on outdoor surfaces** — PreblastComposer, Live Mode, Generator config, CreateExercise undersized for F3 50+ demographic.
9. **Server-side anti-cheating** — Supabase edge function enforcing `inspired_by !== created_by`.

**Bigger architectural:**
10. **Stale draft TTL** — localStorage drafts accumulate indefinitely; need cleanup or expiry.
11. **Account deletion flow** — doesn't exist yet. When added, must also `supabase.storage.from('avatars').remove([...])` to clean up.

---

## F3 VOCABULARY

| Term | Meaning |
|------|---------|
| **Q** | Workout leader (the person running the beatdown that day) |
| **PAX** | Participants (the men working out under the Q) |
| **AO** | Area of Operations (the location of the workout, like "F3 Essex") |
| **Beatdown** | A workout session |
| **Backblast** | Post-workout report (not built in GloomBuilder yet) |
| **Mary** | Core/abs finisher section at the end of a beatdown |
| **IC** | In Cadence (group does reps together to a count) |
| **OYO** | On Your Own (individual pace, no group count) |
| **Coupon** | Weighted block (cinder block, sandbag) used during exercises |
| **FNG** | Friendly New Guy (first-timer) |
| **Locker** | Personal saved collection (your own beatdowns/exercises) |
| **Steal** | Community copy mechanic — fork a public beatdown into your Locker |
| **Gloom** | Pre-dawn darkness (F3 workouts happen at 5:30am typically) |
| **The Bishop** | Ritz's F3 name (this app's creator) |
| **F3** | Fitness, Fellowship, Faith — the men's movement |
| **F3 Nation** | The umbrella organization. GloomBuilder is NOT affiliated — mandatory disclaimer on every page |

**Tagline:** "Build. Share. Steal. Repeat."

**Mandatory disclaimer (in footer):** "Not affiliated with F3 Nation, Inc. Built independently by a PAX for the PAX."

---

## SESSION HISTORY

Chronological recap of major sessions. Each session captures: date, scope, key outcomes, principal artifacts.

### Sessions 1-N (pre-May 7) — see Bible v20 archives

Foundation, schema, v2-pivot development, design system establishment, v20 polish day.

### May 7-8, 2026 — V2.0.0 LAUNCH + 12 POST-LAUNCH FIXES

The v2.0.0 production launch day. v2-pivot branch (17 commits) merged to main as v2.0.0. Then 12 post-launch fixes shipped to main as bugs surfaced from real-app dogfooding. Plus Stage 2A/2B refactor: extracted `BeatdownDetailSheet` (Stage 2A), wired Q-Profile visitor flow (Stage 2B).

**Key outcomes:**
- gloombuilder.app went live with v2 architecture
- Visitor-flow beatdown viewing shipped (replaced "Coming soon" toast)
- Two new operating rules: Rule 31 (confidence framing), Rule 32 (split component extractions into Stage A/B)
- Modified Flavor B draft architecture + Pick-up sessionStorage flag (resolved the "draft restored" banner problem)
- Profile latency parallelization (7 serial → 4 parallel queries, then later to 2 parallel)
- iOS PWA edge-swipe-back blocker
- STEALS divergence resolved via per-card sum (UX-over-data-purity tradeoff)
- Profile/Library stale-data bug discovered but not fixed (highest-priority pending item carried to next session)

**Bible v21 written** capturing all of this.

### May 11-12, 2026 — MARATHON: AVATAR FEATURE + STICKY HEADERS + COMMENT REDESIGN + HOMEPAGE 2×2 + STALE-DATA FIX + PARSER FIXES

The largest single-day push in project history. ~30 commits shipped to main, plus Bible v22 written.

**Stale-data bug fix (Pattern A+B):**

The Profile-vs-Library divergence carried from May 7-8 was diagnosed and fixed.

**Bug:** Tapping a beatdown from Profile showed a different version than the same beatdown viewed from Library. Empirically confirmed via Safari Website Data clear + PWA reinstall — Profile then showed the correct version, proving the divergence was localStorage-resident.

**Diagnosis:** BuilderScreen edit mode auto-restored localStorage drafts on mount. The autosave useEffect fires every keystroke (800ms debounce); `clearDraft` only fires on Save success. Closing the editor without saving left half-finished drafts that clobbered fresh editData on next open. Library reads DB directly (no draft restoration) so it showed truth. Profile-tap-edit used BuilderScreen, which preferred draft over editData.

**Fix:** Pattern A+B —
- **A:** clearDraft on back-button close in edit mode (no orphan drafts left)
- **B:** initialDraft IIFE returns null unconditionally in edit mode (editData wins on mount)

**Trade-off acknowledged:** autosave in edit mode is now write-only (still fires every 800ms but never read). Cleanup queued.

**Walks back partial behavior change:** Bible v21 documented edit-mode auto-restore as preserved by Modified Flavor B. Same-day-as-v21 reversal because the original implementation had this stale-clobber bug. Architectural spirit of Modified Flavor B preserved (Pick-up card on Home still works for new flows).

**Side effect of the fix:** users who had stale drafts in their localStorage from before the fix would see their "edits" disappear on next open (revealing the DB truth). This affected Ritz's "Jungle Warfare" beatdown — the description he thought he saved was actually a stale draft. The DB version had no description. Audit-your-beatdowns task added to homework.

**Twitter-style comment redesign (Variant A):**

Mock-then-pick workflow. Three variants designed (avatar bubbles, hairline list, avatar+engagement icons). User chose A (avatar bubbles + hairline dividers).

**Shape:**
- 36px circular avatar on the left (color from `colorForUserId`, initials from `getInitials`)
- Right side: name · location · date inline (flex-wrap), Edit/Delete actions inline-right on own comments
- Body text below metadata
- 0.5px hairline divider between comments
- "Add a comment" row at bottom with current user's avatar

**Data shape extension:** added `auId?: string` and `auAvatarUrl?: string | null` to comment state. loadComments mapper extracts `r.user_id` → `auId` (FK was already on wire via existing profiles join, just wasn't being read). Optimistic insert sets `auId: currentUserId` for instant green-avatar own-comment paint.

**Edit-mode rendering preserved:** when c.id === editCmtId, textarea + Save/Cancel replace body text. Avatar + metadata stay visible.

**Missing-`?` info button fix:**

LibraryScreen + Q-Profile-visitor BeatdownDetailSheet mounts only passed `seedEx` (seed exercises only). Custom and community exercises in a beatdown's sections fell through silently — no `?` button rendered.

**Fix:** caller-side merge at both call sites. New `beatdownExPool` useMemo composes `[...seedEx, ...communityFromShared]` (LibraryScreen) or `[...seedEx, ...userMapped, ...communityMapped]` (page.tsx q-profile-bd). Both passed via the existing `seedEx` prop. BeatdownDetailSheet itself unchanged.

**Edge case acknowledged:** when a public beatdown references the creator's PRIVATE custom exercise, Library viewers still see no `?` (data not accessible). Deferred to a future data-layer fix.

**Action button visibility rules:**

Per user direction:
- Yours: hide all (Save/Live/Preblast). Detail view becomes read-only.
- Others': single "Steal" button (renamed from "Save"). Live/Preblast removed entirely.

**Architectural shift:** Live/Preblast no longer reachable from public-beatdown detail views; only from BuilderScreen edit form post-Steal. F3-culture-aligned (steal-as-ritual). Drives steal counts higher (better social signal of actual usage).

`handleRunLibraryBeatdown` removed entirely (no remaining callers). `AttachedBeatdown` import removed from BeatdownDetailSheet + LibraryScreen.

**Homepage 2×2 grid:**

Multi-step iteration:
1. First: copy + layout refresh (Option C → 2 Tier 2 rows + 2 muted Tier 3 tiles)
2. Then: hotfix for icon asymmetry (Build from scratch lacked icon) + readability (9px subtitle violated Rule 33)
3. Finally: full 2×2 high-saturation grid replacing the Tier 2/Tier 3 distinction entirely

**Final grid:**
- Top-left: 🛠️ Build from scratch (blue #4f7dff)
- Top-right: 📝 Notepad (amber #f59e0b)
- Bottom-left: 💪 Add exercise (purple #a855f7)
- Bottom-right: 📣 Preblast (red #ef4444)

Equal visual weight across all four creation entry points. Quick Generate hero remains green-gradient at top (kept as recommended path). Footer disclaimer unchanged.

**Notepad parser fixes (two commits):**

**Fix 1:** Leading seconds + short-suffix `s`. Patterns added/extended:
- New P2b: leading duration (`60 sec stretch`, `60s stretch`)
- P2 extended to include `secs`, `s`, `mins` plurals

**Fix 2:** Cadence on no-rep lines + leading minutes. Bug: `plank IC` parsed as name="plank IC" with no cadence (cadence extraction lived inside extractReps, scope died on null return). `30 min walk` parsed as reps=30, name="min walk" (P2b regex only had seconds variants).

Fixes:
- Q6 fallback (no-rep path) now calls `extractCadence` directly on rawLine, uses both the stripped name AND extracted cadence
- P2b regex extended to include `minutes|minute|mins|min` plus normalization step (matches P2)
- Bonus: singular forms (`second`, `minute`) added to both P2 and P2b for natural F3 writing

**Sticky headers (3 commits):**

Body-level scrolling preserved (Option A from diagnostic). Each sticky surface wraps elements in a `position: sticky` div with `top: 0, zIndex: 10, paddingTop: env(safe-area-inset-top, 0px)` and negative horizontal margins + matching padding for edge-to-edge background.

**Commit 1:** Library Beatdowns + Exercises tabs — freezes page title, tab toggle, search input, chip rows. Card lists scroll under.

**Commit 2:** QProfileScreen — freezes ONLY "YOUR BODY OF WORK" label + Beatdowns/Exercises tab toggle (per user-chosen option b). Avatar, name, stats card all scroll away naturally. Smaller freeze region = more scroll area.

First use of `env(safe-area-inset-top)` in the codebase. Smoke-tested clean on iPhone Pro hardware.

**Avatar photo upload feature (3 commits):**

Pulled forward the May 4 spec (which had been queued but never built). Three-commit feature:

**Commit 1 — Avatar component extraction:**
- Created `src/components/Avatar.tsx` (initials-only, no photo support yet)
- Replaced 6 inline render sites (QProfile, Home, ProfileScreen settings, LibraryScreen cards, BeatdownDetailSheet commenter + add-comment)
- Sites 2 and 3 (HomeScreen, ProfileScreen) previously bypassed `colorForUserId` with hardcoded brand green — now flow through unified component with `isOwn=true` forcing green
- avatarUrl prop declared but ignored (`_avatarUrl` underscore prefix)
- Visual tier defaults: size-based border width, alpha suffixes, font weight

**Commit 2 — Data plumbing:**
- 8 db.ts queries extended to select `avatar_url` in profiles joins (loadSeedExercises skipped per recommendation — seed authors don't render avatars)
- 5 type/state shapes widened (page.tsx profile state, SharedItem, FeedItem, dbComments tuple, QProfileScreen ProfileData)
- 4 mappers extracting avatar_url (dbToShared, inline exercise mapper, loadComments mapper, addComment optimistic mapper)
- 3 prop interface additions (HomeScreen +avatarUrl/+currentUserId, BeatdownDetailSheet +currentAvatarUrl, LibraryScreen +currentAvatarUrl)
- Mount-site threading: page.tsx pipes profile?.avatar_url through to HomeScreen, LibraryScreen, q-profile-bd BeatdownDetailSheet
- 6 Avatar render sites now receive avatarUrl (still ignored by Avatar.tsx — Commit 3 wires it)
- No visible change in this commit. Pure wiring.

**Commit 3 — Photo render branch + upload UI:**
- Avatar.tsx: drop `_avatarUrl` underscore, add photo render branch (`<img>` with no border, objectFit cover) when avatarUrl truthy
- New file `src/lib/avatarUpload.ts`: validate → createImageBitmap decode → center square crop → 256×256 resize → WebP @ 0.85 → upload to `avatars/{userId}/avatar.webp` with upsert → return cache-busted public URL
- ProfileScreen.tsx: hidden file input, click handler on 72px avatar, upload handler with loading state + toast feedback, new `onAvatarChanged?` prop
- page.tsx: `onAvatarChanged={() => checkUser()}` wires parent refresh (does NOT close Settings view)
- OffscreenCanvas with regular `<canvas>` fallback for older Safari
- 10MB pre-resize cap, 1MB bucket cap (processed files are typically 25KB)

**Supabase setup (user manual steps before Commit 3 could work):**
- `ALTER TABLE profiles ADD COLUMN avatar_url TEXT NULL;`
- Created `avatars` storage bucket (public, 1MB limit, MIME `image/*` after iOS Safari incompatibility surfaced)
- 4 RLS policies on `storage.objects` (public SELECT, authenticated INSERT/UPDATE/DELETE on owner-only path)

**MIME type gotcha:** initial setup used `image/webp` only. iOS Safari uploads failed because the Content-Type header iOS sends doesn't match the WebP blob's type. Loosened to `image/*` and everything works. Client code still converts to WebP before upload, so storage cost stays optimized. **This is now documented in Configuration Gotchas.**

**Sticky-header smoke test outcomes:** all three sticky surfaces verified working on iPhone PWA. Notch handling clean via `env(safe-area-inset-top)`. No regression on detail views (BeatdownDetailSheet still covers sticky header when active because LibraryScreen returns early-branch for libDet).

**Total May 11-12 commit count:** ~30 commits to main. By a wide margin the largest single-day production push in project history.

**New operating rule established:** Rule 33 (cross-reference external specs against project design constraints). Came out of shipping 9px subtitle text that violated the F3 50+ readability rule because the spec was followed verbatim without checking against project principles.

**Critical memory rule established:** "Don't tell user to stop working." User overrode 4+ "we should stop" pushbacks during this session; each commit shipped clean. Discipline framework working as intended — Claude's job is to flag risk ONCE, then defer to user direction. Memory updated.

**Pending at end of session:** Tomorrow List (above). All major decisions made and decisions logged. Next-Claude reads this Bible + Session Handoff before first message.

---

## CLOSING

This Bible v22 supersedes v21. All v21 content is captured here in summary form within the [SESSION HISTORY](#session-history) section. The verbatim v21 file remains in project knowledge as historical reference but is no longer the canonical source.

**For the next Claude:** start with `GLOOMBUILDER-SESSION-HANDOFF.md` for a 60-second briefing, then come here for deep reference on anything specific. The [TABLE OF CONTENTS](#table-of-contents) is jump-friendly.

**For Ritz:** when significant work happens in the next session, update both:
1. This Bible (increment to v23, rewrite with new session integrated)
2. The Session Handoff doc (refresh "Last updated" + commit count + Tomorrow List)

Commit both via Claude Code. Upload to project knowledge UI replacing the previous version.

The work continues.
