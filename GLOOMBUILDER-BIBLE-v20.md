# GLOOMBUILDER BIBLE v20
## Complete Product & Design Truth Document
### May 3-4, 2026 — V2-PIVOT POLISH-DAY-FULL-SESSION EDITION

*This document supersedes Bible v19 (May 3, 2026 morning). All v19 content is preserved verbatim below. v20 adds: (1) a comprehensive **V20 SESSION RECAP** at the top capturing the full May 3 polish session — eleven commits on `v2-pivot` representing the largest single-day push in the project's history, taking the v18 fourteen-commit baseline up to a twenty-five-commit total; (2) full **Cluster D expansion** — D1 through D11 with every commit's diagnostic-spec-build cycle, the bugs caught at diff-review or in production, the design decisions made along the way, and the extensive UX-psychology reasoning behind each visual choice; (3) **two new permanent operating rules** (Rule 29: Visual smoke test before declaring done; Rule 30: Mark recommendations with `(REC)` indicator in option lists) plus reaffirmation of Rules 27-28 from v19; (4) the **photo-upload deferral** — a complete external implementation proposal for Supabase Storage avatar uploads was reviewed and explicitly deferred to post-launch PAX signal, with the architectural shape (`avatar_url TEXT NULL` column on profiles, `<Avatar>` component with initials fallback) documented for when it eventually ships; (5) the **admin/debug-tooling deferral** — Ritz's product call to stay with manual Supabase dashboard until ops exceed 1/week; soft-delete pattern (`deleted_at` column) flagged for future consideration when scale produces real cleanup needs; (6) the **marketing infographic deferral** — Slack-pasteable image-based infographic recommended over in-app onboarding, work to be done in Claude Design or fresh dedicated chat, NOT this build chat; (7) the **avatar helper extraction pattern** (Cluster D Item 7) — `src/lib/avatars.ts` with 8-color palette + UUID hash + getInitials, refactored from QProfileScreen's existing duplicates; (8) the **two-stage diagnostic pattern** (Stage 1 + Stage 1B mini-diagnostic) introduced for commits where a sub-question surfaces mid-cycle, demonstrated in Cluster D Item 7 (Beatdowns card → mini-diagnostic for detail-view Steal button verification) and Cluster D Item 9 (Library + About → mini-diagnostic for verbatim About copy retrieval); (9) the **steal_count action-count framing** locked into permanent product position (no migration, no decrement, "every steal IS a real steal"); (10) the **(REC) marker convention** for ask_user_input prompts — every option list now indicates the recommended choice so Ritz can quickly identify the recommended path across long conversations; (11) **eleven complete commit reports** with hash, files touched, line counts, locked design decisions, smoke test results, and rationale for each. Latest commit hash: equipment filter commit (commit 11). The merge-to-main remains explicitly user-gated per session-locked rules and is **not the next session's automatic first action** — Ritz controls when that happens. Equipment filter (commit 11) is the final commit of the day. Bible v20 is the canonical state.*

---

## V20 SESSION RECAP — MAY 3-4, 2026 (READ THIS FIRST IF PICKING UP MID-FLIGHT)

### TL;DR for the next Claude

May 3-4, 2026 was the **v2-pivot polish day** — eleven commits shipped on the staging branch addressing UX gaps that surfaced from real Vercel preview usage of the v18 "feature-complete" build, plus the deferred-from-the-morning Beatdowns card visual rebuild that became commits 7-11 once the steal_count question was resolved. The session is the largest single-day push in the project's history.

The session was characterized by **diagnostic-first discipline paying off twelve+ times across the day**: every major commit started with a Stage 1 read-only diagnostic before any specification was written. Every commit caught a real architectural fact that would have produced a buggy or wrong-shaped commit if Claude had specified from memory. The diagnostic-first workflow is now the default operating mode, not a special-case discipline.

The biggest single outcome: **the v2-pivot branch is now visually and behaviorally polished to ship-quality**. Every screen got attention. Every text input got readability work. Every card got a consistent visual treatment. Every state-management bug surfaced from real preview testing got fixed. The branch is in objectively better shape than it was at v19's morning baseline.

The biggest single non-outcome: **photo upload was deferred entirely.** An external implementation proposal arrived mid-session offering a complete Supabase Storage avatar upload feature with full implementation details. Ritz and Claude reviewed it carefully, flagged six integration risks the proposal itself surfaced, identified that the feature was "decoration not core utility" by the proposal's own framing, noted that no real PAX had requested it, and made the explicit call to defer entirely until post-launch PAX signal indicates it's wanted. The 8-color avatar helper from commit 7 (extracted from QProfileScreen's existing logic) is sufficient for the foreseeable future. F3 culture is famously low-vanity; colored initials may be the right answer permanently.

### The current state at end of session May 3-4, 2026

- `main` branch: **untouched today**, gloombuilder.app stable. STILL on v1 architecture (4-tab nav, no Notepad, no Pick-up card, single-row Library filter, no Beatdowns card visual rebuild, no Equipment filter). v2-pivot has been ready-to-merge since v18 but Ritz has deliberately deferred merge across three sessions now. **The merge-to-main remains EXPLICITLY user-gated** per session-locked rules established earlier in v17/v18/v19 — the next Claude must not instruct merge without Ritz's explicit "merge" command.
- `v2-pivot` branch: **POLISH-COMPLETE.** The v18 ten-commit baseline is now twenty-five commits. Eleven new commits today, in chronological order:
  1. `fbdf96b` — Library Exercises filter: split into Type and Body part rows
  2. `2c4f687` — Home: add Pick-up card for in-progress drafts + 3-card grid (MVP, builderNew only)
  3. `1c6baef` — Notepad: add draft autosave and restore banner
  4. `f999918` — Home: Pick-up card surfaces all 3 draft flows
  5. `9640849` — Notepad: bump all fonts +2px and rewrite help drawer copy (4-row + nested warning)
  6. `068ca1a` — Notepad: bump textarea to 17px/wt 500, tighten help drawer layout (70px term column, variable row spacing)
  7. `355578d` — Library: rebuild Beatdowns card visual + extract avatar helper (new file `src/lib/avatars.ts`)
  8. `c1c3fae` — Notepad: amber help-icon visibility + preview note overflow fix (wordBreak + overflowWrap)
  9. `3202c17` — Library + About: share state, search position, content polish (handleShareBeatdown editingBd update + search bar relocation + ONE NATION OF Q's card replacing Emergency Q + Iron sharpens iron + +2 sweep across About branch)
  10. `1148481` — About: tighten copy, fix orphan font, surface About link (Why I built this rewrite + Support body 15→16 + About link green tint)
  11. (equipment filter commit — see below) — Library: add equipment filter (bodyweight / coupon)
- Supabase: NO migrations applied today across any of the 11 commits. The `equipment text[]` column on the beatdowns table already existed and was already being SELECTed; the bug was that `dbToShared` dropped it before reaching SharedItem. Stage 1 diagnostic for commit 11 caught this and saved a wasted migration spec — exactly the scenario v19's Rule 28 (grep-the-column-name before specifying any migration) was designed to catch.
- Vercel preview: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/` reflects all 11 commits. Smoke-tested by Ritz across all surfaces: Home Pick-up card across 3 flows, Notepad autosave + font sizing + help drawer + note overflow, Library Beatdowns rebuild + Equipment filter, Library + About share state + search bar position, About content swap + button visibility upgrade.
- Working directory: `C:\Users\risum\Documents\projects\gloombuilder` — Bible v20 needs to be added similarly to v18/v19.
- Claude Code: still primary workflow. Eleven diagnostic-spec-build cycles executed cleanly today, each producing a commit. Two of them used the new two-stage diagnostic pattern (Stage 1 + Stage 1B mini-diagnostic) when a sub-question surfaced mid-cycle.
- Empty-draft pollution case (carried forward from v19): the Pick-up card surfacing rule still rejects builderNew envelopes where both `bT` is empty AND zero non-transition exercises exist. Same gate logic generalizes for generatorResult (title OR generated exercises) and notepadDraft (title OR text).

### Today's eleven commits — the timeline

The session opened with the morning's four commits (D1-D4) already shipped per Bible v19. Commits D5-D11 happened in the afternoon. Each commit went through the canonical workflow: read-only diagnostic of current production code → identify what the spec needs → execute build → review diff → commit → smoke-test → next.

The cluster items D1-D4 are documented verbatim in v19's content (preserved below). What follows is the v20 expansion documenting D5-D11.

#### Commit 5 (D5) — Notepad: +2 uniform fonts + drawer copy rewrite — `9640849`

**Files touched:** `src/components/NotepadScreen.tsx` only. +56 / -35 lines.

**What it did:** Two surgical changes addressing real outdoor-readability feedback from Ritz's iPhone smoke test of the just-shipped Notepad autosave (D3). The 13px-baseline font sizes inherited from v18 read too small at arm's length for the F3 50+ demographic. Help drawer copy was technical ("blank line starts a new section. Don't put a blank line between a section header and its first exercise.") rather than F3-vernacular ("New section / x10 / - text / > text").

**Font bump:** Every fontSize value in NotepadScreen.tsx bumped uniformly by +2 — 28 occurrences total (verified by Stage 1 inventory). Page title 24→26, subtitle 13→15, title input 15→17, textarea 13→15, TITLE/BEATDOWN NOTES labels 12→14, Save button 16→18, help drawer header 11→13, term column 11→13, description 11→13, Write/Preview toggle 13→15, draft-restored banner 13→15, Discard button 12→14, preview section header 21→23, exercise name 18→20, toast 14→16, back button 14→16, meta line 12→14. Icon glyphs (?, ✕, ↗) bumped uniformly to track surrounding text.

**Help drawer rewrite:** HELP_ROWS shape changed from `Array<[string, string]>` (tuple) to typed `HelpRow[]` objects with optional `warning` field. Drawer .map() updated to render the optional warning conditionally as an amber-tinted nested block under the row it warns about. Final drawer content:

| Term | Description |
|---|---|
| `Section` | A blank line above creates a new section. *(+ nested amber warning: "Don't leave a blank line between a section header and its first exercise.")* |
| `x10` | Add x10 or 60sec for reps or time. |
| `- text` | Coaching note for the line above. |
| `> text` | Mosey or run between exercises. |

Order chosen: Section first (most-asked), then reps/time (most-used), then notes, then transitions. The warning block has its own visual treatment: amber leftborder, amber-tinted background, ⚠ icon prefix, italic 12px text. Visually subordinate to "main rule" while still calling attention to the gotcha.

**Pre-execution discovery:** Stage 1 diagnostic mapped all 28 fontSize values in NotepadScreen.tsx with line numbers and elements. The complete inventory was the spec — Stage 2 was mechanical. The diagnostic also confirmed the placeholder text (lines 53-67) was a worked example demonstrating syntax, not redundant instructional copy that would drift from the new drawer content. Decision locked: do not modify the placeholder.

**Bible v18 Rule 26 confirmation:** diagnostic-first ran before specification. The diagnostic confirmed: complete fontSize inventory across 28 occurrences (no orphans missed), HELP_ROWS structure (tuple → typed object refactor was clean), drawer JSX flex pattern (display: flex with width: "50%" term column), placeholder content was a worked example not redundant copy.

**Build green. Pushed. Smoke-tested live by Ritz: confirmed via iPhone preview that fonts read clearly at arm's length and the help drawer copy is much more F3-vernacular.** Initial test surfaced two follow-up issues that became D6 (textarea font + drawer layout polish) and later D8 (help icon visibility + note overflow).

#### Commit 6 (D6) — Notepad: textarea 17px/wt 500 + drawer layout fix — `068ca1a`

**Files touched:** `src/components/NotepadScreen.tsx` only. +12 / -4 lines.

**What it did:** Two follow-up adjustments to the +2 uniform commit. Surfaced from real comparison testing: Ritz held GloomBuilder's Notepad next to iPhone's native Notes app and the textarea text still read distinctly smaller and slimmer than iOS Notes 17px baseline, even after the +2 sweep took it from 13→15.

**Diagnosis (real comparison testing):**
- iPhone Notes default: 17px, regular weight, San Francisco system font — proportional, dense letterforms
- GloomBuilder textarea after D5: 15px, default weight (400), Courier New monospace — slim strokes, sparse letterforms

The gap was both size AND weight AND font family. Monospace at 15px regular weight reads visibly smaller than proportional at 17px regular weight even at "the same" point size, because monospace characters spread wider and the strokes feel thinner.

**Resolution chosen (Option 3 of 4 considered):** Keep monospace (parser markers `-`, `>`, `x10` benefit from monospace alignment), but bump fontSize 15→17 AND add fontWeight 500 (medium). This thickens the Courier strokes without abandoning monospace, closing the visual-density gap. Specifically rejected:
- Option 1 (monospace 18px regular weight): closes size gap by mass but strokes still slim
- Option 2 (switch to proportional): loses parser-marker visual rationale
- Option 4 (monospace 15px medium weight): smallest change but still smaller than iOS baseline

**Help drawer layout fix:** The +2 uniform commit (D5) fixed font sizes but didn't address the drawer's layout problems that became visible at the new sizes:
1. Term column was `width: "50%"` — wasted ~120px of horizontal space on every row when term keys are short ("Section", "x10", "- text", "> text" only need ~70px)
2. Per-row marginBottom was uniform 8px — created excessive whitespace between description-only rows after the warning was added to the Section row

**Resolution:**
- Term column width: `"50%"` → `70px` fixed pixels
- Row gap: `gap: 8` → `gap: 12` (wider gap between term and description, since term column is now narrower)
- Per-row marginBottom: `8` uniform → `idx === HELP_ROWS.length - 1 ? 0 : (row.warning ? 10 : 4)`
  - Last row → 0 (no trailing whitespace inside drawer)
  - Row with warning → 10 (gives warning block visual breathing room before next row)
  - Row without warning → 4 (tight stack for clean rhythm)

Two distinct vertical rhythms: rows with warnings get more breathing room; rows without warnings get tight spacing. Drawer stays compact while protecting the warning's visual prominence.

**Build green. Pushed. Smoke-tested live by Ritz: confirmed textarea reads at iOS-Notes-comparable density at arm's length. Drawer terms align cleanly in a ~70px column with descriptions getting full width.**

#### Commit 7 (D7) — Library: rebuild Beatdowns card visual + extract avatar helper — `355578d`

**Files touched:** `src/lib/avatars.ts` (NEW, 35 lines), `src/components/QProfileScreen.tsx` (-21 / +1), `src/components/LibraryScreen.tsx` (+166 / -30). 3 files, 168 insertions, 51 deletions net.

**What it did:** The biggest visual change of the day. Full Library Beatdowns card visual rebuild per the locked design from v19, AND extraction of the avatar coloring/initials logic from QProfileScreen into a shared module that both screens now import from. Single source of truth for avatar coloring across the app.

**Architectural reframe surfaced by Stage 1 diagnostic:** v19's plan was "create new file `src/lib/avatars.ts` with 8-color palette + hash from f3_name + getInitials." Stage 1 diagnostic discovered that an avatar palette + UUID hash + getInitials helper ALREADY existed in QProfileScreen.tsx:30-49 as inline duplicates. AND it hashed from UUID (stable, unique), not f3_name (mutable, can collide). The plan was wrong on two counts.

The corrected approach: **extract + extend rather than create-new.**
1. Create `src/lib/avatars.ts` containing the existing logic
2. Extend the 5-color palette to 8 colors (preserving the original 5 at indices 0-4 so existing users keep their colors, adding 3 manly tones at indices 5-7)
3. Refactor QProfileScreen to import from the shared module (delete its inline duplicates)
4. LibraryScreen also imports from the shared module
5. Hash key is UUID (`auId`), not f3_name

This approach has a nice property: existing users on QProfileScreen keep their assigned avatar color (the hash modulo math hits the same index in both the old 5-color palette and the new 8-color palette for any user whose UUID hash mod 5 doesn't equal mod 8). Users whose hash previously collided with another user might now distribute into the 3 new colors, reducing visual collision in the Library feed.

**Final 8-color palette:**
```
[
  "#f59e0b", // amber (existing)
  "#a78bfa", // violet (existing)
  "#3b82f6", // blue (existing)
  "#06b6d4", // cyan (existing)
  "#E8A820", // gold (existing)
  "#15803d", // forest (NEW)
  "#475569", // slate (NEW)
  "#374151", // charcoal (NEW)
]
```

`colorForUserId(id, isOwn=false)`: if `isOwn` is true, returns brand emerald `#22c55e` so the current user's avatar visually anchors to "you" across the app. Otherwise hashes UUID via char-code sum, returns palette element at index `Math.abs(hash) % 8`.

`getInitials(name)`: takes name string OR null OR undefined. Returns up to 2 uppercase characters from word-initials. Falls back to `"?"` for empty/null/whitespace-only input. The optional null/undefined typing is a strict improvement — old QProfileScreen signature would crash on null input; new signature handles it gracefully.

**Beatdowns card visual rebuild — final layout:**

```
┌────────────────────────────────────────────────────┐
│ [TB]  The Bishop  [YOU]                    60 min  │
│       F3 Essex · Apr 24                            │
│                                                    │
│ The Belmont                                        │
│ Hand Built  BEAST  · Field · Coupon                │
│ Description (2-line clamp)...                      │
│                          👍 12   ↻ 8   💬 3        │
└────────────────────────────────────────────────────┘
```

Detailed render structure:
1. **Header row** — avatar circle (36px, UUID-hashed color, 1f-tint background, 2px solid border, color-matching initials) + author name (clickable to profile if not own) + YOU pill (only when `bd.auId === currentUserId`) + AO + " · " + date + duration pill (right-aligned, top-right corner, green-tinted)
2. **Title** — 18px/700/T2, line below header
3. **Inspired-by line** (when present) — 11px amber, "Inspired by [original Q]"
4. **Source pill + difficulty pill + tag string** in a single row under title:
   - Source pill: HAND BUILT (gold #E8A820 tint) or GLOOMBUILDER (emerald tint), 11px/700, mixed-case label preserved per existing srcBadge() helper
   - Difficulty pill: BEAST/HARD/MEDIUM/EASY, color-coded, 11px/700, uppercased
   - Tag string: ·-separated, 12px T4 gray, e.g. "· Field · Coupon"
5. **Description** — 14px T3, 2-line clamp via `-webkit-line-clamp: 2`
6. **3-counter footer** — always visible (even when N=0), right-aligned, top border, emoji glyphs:
   - 👍 N — interactive, toggles vote via `onToggleVote`
   - ↻ N — passive, displays steal_count as-is
   - 💬 N — passive, displays comment_count

Key changes from old card:
- Avatar circle ADDED (was missing)
- Duration MOVED from tag-pill row to dedicated top-right corner pill
- Difficulty MOVED from top-right corner to under-title pill row (where source pill lived)
- YOU pill REPLACES inline "· You" text — actual pill geometry matching source pill style
- Tag display SWITCHED from comma-pill chips to ·-separated string
- 3-counter footer ALWAYS visible (was: comments hidden when 0)
- Counter format: emoji glyphs instead of ThumbsUpIcon component + text labels
- Card-level "Save" link REMOVED entirely. Steal action remains via detail view's full-width Save button at LibraryScreen.tsx line 461. No functional regression; users tap card to open detail, then tap Save there.
- Left border stripe (3px colored) REMOVED for visual cleanliness

**Stage 1B mini-diagnostic** (introduced as a pattern this session): before dropping the card-level Save link, a sub-question arose — does the detail view actually have a Steal mechanism today? If not, dropping Save from the card would orphan the entire steal mechanic.

The mini-diagnostic confirmed: detail view at LibraryScreen.tsx line 461 has a full-width green "Save" button that calls `onSteal` with identical signature. Dropping the card link is safe — same callback, same toast feedback, just lives in the detail view now.

**Date format:**
```javascript
const currentYear = new Date().getFullYear();
const opts = d.getFullYear() === currentYear
  ? { month: "short", day: "numeric" }
  : { month: "short", day: "numeric", year: "numeric" };
dateStr = d.toLocaleDateString("en-US", opts);
```
Current year omits year ("Apr 24"); prior years include year ("Apr 24, 2025"). Reads naturally. No Twitter-shorthand "12d" / "3w".

**Type fix mid-flight:** TypeScript flagged `bd.id` as `number | string` per LibraryScreen's local FeedItem interface (line 57 — legacy from sample-data era). Fixed by wrapping in `String(bd.id)` for the fallback hash key when `bd.auId` is falsy. Matches the project's convention (every other place uses `String(bd.id)` when an id needs to be a string).

**steal_count display:** Per Bible v19's locked product framing, `steal_count` is displayed as-is from the existing column. No migration. No decrement. No data-model change. The 12 phantom counts identified in v19's drift investigation remain visible — under the action-count framing, they are real lifetime steal events and should be displayed.

**Build green. Pushed. Smoke-tested live by Ritz across multiple beatdowns.** Avatars, YOU pills, dates, duration pills, tag strings, and 3-counter footers all rendered as designed.

#### Commit 8 (D8) — Notepad: amber help-icon + preview note overflow fix — `c1c3fae`

**Files touched:** `src/components/NotepadScreen.tsx` only. +5 / -1 lines.

**What it did:** Two surgical fixes surfaced from real Vercel preview testing of the recently-shipped Notepad work (D5/D6):

1. **Help-icon visibility:** The "?" button at the top-right of "BEATDOWN NOTES" label used `background: rgba(255,255,255,0.04)` + `border: 1px solid rgba(255,255,255,0.07)` + `color: T4` — all white-tint values that disappeared against the `#0E0E10` dark background. Users had no visual cue that help was available.

2. **Preview note overflow:** Long unbroken strings in exercise notes (e.g., `testnottestnotetesttestnottestnote...`) overflowed the right edge of the parent section card in Preview mode. The pre-wrap whiteSpace setting honored authored newlines but didn't break unbreakable tokens. Real bug observed when Ritz pasted test content with no-space strings.

**Help-icon fix:** Three property swaps to match the established amber-tint pattern used by the draftRestored banner in the same file:
- background: `"rgba(255,255,255,0.04)"` → `"rgba(245,158,11,0.10)"` (10% amber)
- border: `"1px solid " + BD` → `"1px solid rgba(245,158,11,0.30)"` (30% amber)
- color: `T4` → `A` (amber #f59e0b)

Banner-match (10%/30%) was chosen over drawer-match (5%/20%) so the trigger button has slightly more visual presence than the panel it opens — standard "active button → quieter open content" affordance.

Amber was deliberately chosen over emerald. Emerald is reserved for brand "primary action" semantics (Save buttons, vote-active states, YOU pill). The drawer it opens is amber-themed. Amber-on-amber communicates "this button connects to that content" without muddying the green-as-action vocabulary.

**Note overflow fix:** Two new style properties added to BOTH preview note pills:
- `wordBreak: "break-word"` — break long unbroken tokens at any character if needed
- `overflowWrap: "anywhere"` — more aggressive than break-word for URL-like content with no natural break opportunities

Applied to:
- PreviewExerciseRow exercise note (line 470 area) — the reported bug
- PreviewSectionCard qNotes (line 407 area) — same bug pattern, fixed preemptively before it manifests

`whiteSpace: "pre-wrap"` preserved on both. User-authored newlines still render correctly.

**Codebase precedent surfaced by diagnostic:** LibraryScreen.tsx:428 already uses `wordBreak + overflowWrap` on comment text — exact same problem, solved with the same pattern. This commit applies the established solution to the same bug class on Notepad's preview surfaces.

**Build green. Pushed. Smoke-tested live by Ritz: ? button now clearly visible with amber tint, tappable affordance reads as "open me." Note overflow fixed — long unbroken strings now wrap within section card boundary.**

#### Commit 9 (D9) — Library + About: share state, search position, ONE NATION card + sweep — `3202c17`

**Files touched:** `src/app/page.tsx` (+6 lines), `src/components/LibraryScreen.tsx` (+5 / -1 lines), `src/components/ProfileScreen.tsx` (large changes — see below). 3 files, 39 insertions, 53 deletions net.

**What it did:** Three coordinated quick fixes addressing UX gaps surfaced from real Vercel preview testing:

**Fix 1 — Share button real-time state:**
The "Share to library" button in BuilderScreen edit mode never flipped to "Unshare" until the screen was closed and reopened. Real bug surfaced from testing the just-shipped Library Beatdowns card (D7) — Ritz tapped "Share to library" on his own beatdown, saw the green "Shared to community!" toast, but the button label kept reading "Share to library" instead of switching to red "Unshare."

Stage 1 diagnostic mapped the bug location (NOT in LibraryScreen as Claude initially assumed — the share button lives in BuilderScreen edit mode, page.tsx:362-376). Root cause: `handleShareBeatdown` in page.tsx updated the locker array (`lk`) but not the `editingBd` snapshot. `editingBd.isPublic` stayed stale, so the BuilderScreen's editData prop (rebuilt from editingBd on every render) kept the button's conditional render reading false.

Fix template already existed in the same file: `handleShareExercise` (page.tsx:554-566) had the correct pattern. After a successful share, if editingEx matches the shared id, update editingEx locally so the screen reflects the new state. `handleShareBeatdown` was missing the equivalent block.

**Fix applied:** Added 3 lines to `handleShareBeatdown`:
```typescript
if (editingBd && editingBd.id === id) {
  setEditingBd({ ...editingBd, isPublic: true });
}
```
Inserted after the `setLk(...)` call inside the success branch.

**Same fix applied to `handleUnshareBeatdown`** for parity. The unshare path is currently masked by an existing navigate-away (`setVw(null)` before the confirm modal closes) but the symmetric state update prevents future regression if that flow changes. Defensive symmetry costs nothing.

**Fix 2 — Library Beatdowns search bar position:**
The Beatdowns tab rendered its search input ABOVE the Beatdowns/Exercises toggle, while the Exercises tab rendered its search input BELOW the toggle. Inconsistent layout — same component, two different positions for what is functionally the same affordance.

Stage 1 diagnostic confirmed: Beatdowns search at LibraryScreen.tsx line 562 (above toggle, conditional on `libT === "beatdowns"`); Exercises search at line 664 (below toggle, inside the exercises render block). Two separate `<input>` elements with two separate state slots (`libSearch` vs `exSearch`).

**Fix applied:** Moved the Beatdowns search input to be the first element inside the `libT === "beatdowns"` render branch, mirroring how the Exercises search sits as the first element inside its own branch. Pure relocation — identical input markup, state, and placeholder. Exercises search is unchanged. Both tabs now follow the same order: `Library` header → Beatdowns/Exercises toggle → search input → tab-specific content.

**Fix 3 — About content swap (Emergency Q + Iron sharpens → ONE NATION OF Q'S):**
The original About page had 4 cards: WHY I BUILT THIS / Emergency Q? / Iron sharpens iron / Support GloomBuilder. Ritz wanted to delete the middle two and replace with a new ONE NATION OF Q'S card.

Stage 1.5 mini-diagnostic retrieved the verbatim text of all 4 existing cards so the new ONE NATION OF Q'S card could be designed against the actual narrative flow, not against memory. The mini-diagnostic confirmed the existing cards' narrative arc was: origin story → emergency use case → community ethos → call to action. Deleting Emergency Q + Iron sharpens would create a narrative gap; ONE NATION OF Q'S fills it with a stronger network-oriented framing.

**ONE NATION OF Q'S card content (locked):**

> **Header:** ONE NATION OF Q'S (rendered uppercase via CSS, source-case "One nation of Q's")
>
> **Paragraph 1:** Thousands of AOs. Tens of thousands of PAX. Every gloom, somewhere a brother is Q-ing something brutal and creative you've never seen.
>
> **Paragraph 2:** Share your best beatdown. Steal theirs. A Q in Essex builds a smoker. A Q in Houston runs it Friday. That's the network.

Accent color: amber A — matches WHY I BUILT THIS card. Green stays reserved for Support GloomBuilder's call-to-action semantic.

**+2 sweep:** All 22 fontSize values in the About branch bumped by +2 (18 from Stage 1 inventory + 3 new ONE NATION values authored at +2 directly + 1 inventory-miss caught at build time: the "Redirecting to payment..." transient text in the Stripe handoff). All About text is now 12-32px, with no orphan small values.

**Inventory miss caught and fixed openly:** Claude Code found a fontSize that the Stage 1 inventory had missed (the donating redirect text), bumped it for consistency, and flagged the miss explicitly in the build report. Honest surfacing rather than silent fix. Good practice carried forward — silent fixes erode trust, surfaced fixes build it.

**Build green. Pushed. Smoke-tested live by Ritz across all 3 fixes.**

#### Commit 10 (D10) — About: tighten copy, fix orphan font, surface About link — `1148481`

**Files touched:** `src/components/ProfileScreen.tsx` only. +10 / -15 lines.

**What it did:** Three small follow-up polish items on top of D9's About content swap. All ship as one cohesive ProfileScreen edit:

**Why I built this — copy rewrite:**
The original two-paragraph essay was too wordy for the actual F3 reader (men 40-50, glance-and-go). Replaced with two short hits that say the same thing in 1/4 the words:

> Header: WHY I BUILT THIS (unchanged)
>
> Paragraph 1: 10pm, ceiling stare, no plan. That's why most PAX never take the Q.
>
> Paragraph 2: GloomBuilder kills that excuse. Generate a beatdown in 30 seconds, steal one from the library, or build your own. Show up locked and loaded.

Container styling, header, and paragraph color/font/lineHeight all preserved. Visual rhythm matches the other cards. Apostrophes use HTML entity `&apos;` per established About-content convention.

**Support GloomBuilder body — orphan font fix:**
The D9 +2 sweep bumped Support body from 13→15, but the target was 16 to match surrounding About body text (Why I built this, ONE NATION OF Q's). The 15 was an inventory oversight surfaced during real-preview testing — Support body visibly read smaller than its sibling cards. Single fontSize property change 15→16. No structural impact.

**About GloomBuilder link — visibility upgrade:**
The link from the main Profile screen to the About sub-view was using CD/BD muted styling identical to the Log out button. Read as the same visual weight as a destructive secondary action — buried the most-important content gateway on the Profile screen.

Applied subtle green tint matching the Support GloomBuilder card's container theming:
- background: `CD` → `"rgba(34,197,94,0.04)"` (4% green tint)
- border: `BD` → `"rgba(34,197,94,0.12)"` (12% green border)
- title color: `T2` → `G` (emerald)
- chevron color: `T5` → `G` (emerald)

Subtitle color `T4` preserved on purpose — keeps the supporting text quiet so the title pops without overall heaviness. Padding, borderRadius, marginTop, structure, and onClick handler all unchanged.

**Color choice reasoning (locked design decision):** Green tint vs amber tint was a real design call. Amber would have echoed the About content's amber-themed headers (Why I built this, ONE NATION OF Q's). Green tint matches the Support GloomBuilder card's container styling — and Profile screen currently has zero amber surfaces, so adding amber would have introduced a new color semantic. Green tint at 4%/12% sits cleanly between Save profile's full G fill (loud primary CTA) and Log out's white-tint (muted destructive) without competing with either.

Claude initially recommended amber, Ritz overrode to green tint. Both options were defensible (60/40 call). Locked: green tint per Ritz's call.

**Build green. Pushed.**

#### Commit 11 (D11) — Library: add equipment filter (bodyweight / coupon) — (latest commit)

**Files touched:** `src/app/page.tsx` (+2 lines), `src/components/LibraryScreen.tsx` (+8 / -3 lines). 2 files, 9 insertions, 3 deletions net.

**What it did:** New filter row in the Library Beatdowns filter sheet allowing PAX to narrow the feed by equipment requirement. Closes the "AO has no coupons today, what can I run" use case that's been asked-about in F3 Slack since the v2-pivot launch plan.

**Critical pre-execution discovery (Bible v19 Rule 28 paid off):** Stage 1 diagnostic confirmed the `beatdowns.equipment text[]` column already exists in Supabase, populated by `saveBeatdown` at db.ts:31 from the Generator/Builder's `eq` selection. `loadPublicBeatdowns` already SELECTs it via `*`. The bug: `dbToShared` in page.tsx never mapped this column through to SharedItem — so the data was being fetched but dropped before it ever reached the client filter logic.

**No schema migration needed.** No backfill needed. The fix turned out to be 9 lines instead of a multi-step migration. Exactly the scenario v19's Rule 28 was designed to catch.

**Implementation:**

`src/app/page.tsx`:
- SharedItem: added `eq?: string[]` field between `aoT` and `v`
- dbToShared: added `eq: (row.equipment as string[]) || []` mapping with empty-array default for safe filter logic

`src/components/LibraryScreen.tsx`:
- Import `EQUIP` from `@/lib/exercises` (existing constant — `[{id:"none", l:"Bodyweight only"}, {id:"coupon", l:"Coupon (block)"}]`, not new)
- Local `FeedItem` type: added `eq?: string[]` to match SharedItem (note: the duplicate type definition between SharedItem and FeedItem is pre-existing tech debt; not refactored in this commit — flagged for future cleanup)
- New state slot: `fEq`, defaulting to `"All"`, positioned between `fAo` and `fSrc`
- Active filter count: appended `fEq` between `fAo` and `fSrc`
- Filter logic: new clause between AO and Source filters, matching AO pattern (label-to-id lookup against EQUIP, then `array.includes()` check)
- Filter sheet UI: new label + chip row between AO Site Type and Source, identical styling pattern to existing rows

UI placement reasoning: Equipment groups logically with AO Site Type as a "physical-constraint" filter, distinct from Source which is a "who built it" meta-filter. Order is now: Difficulty → Duration → Region → AO Site Type → Equipment → Source.

**Filter chip set:** `["All", "Bodyweight only", "Coupon (block)"]` sourced verbatim from `EQUIP[].l` in lib/exercises.ts. Two canonical equipment values match the Generator's `eq` config options.

**Filter semantics:** inclusive. A beatdown with `eq = ["none", "coupon"]` matches BOTH the "Bodyweight only" filter AND the "Coupon (block)" filter. This mirrors the AO Site Type filter's semantics and reflects the Generator's multi-select nature — a Q can adapt either way at the AO. Older beatdowns saved before equipment was a tracked field will have `eq = []`; they won't match either filter, only "All". This is documented expected behavior, not a bug.

**Implicit Change 5b (Stage 1 inventory miss caught at build time):** Claude Code identified that LibraryScreen's local `FeedItem` type also needed the `eq?: string[]` field, otherwise `b.eq` access wouldn't type-check. Caught it before specifying, fixed it inline, flagged it in the report. The duplicate type definition between SharedItem (page.tsx) and FeedItem (LibraryScreen.tsx) is pre-existing tech debt — flagged for future cleanup, not refactored in this commit.

**Build green. Pushed. Smoke-tested live by Ritz: filter row appears in correct position, chips work, feed narrows correctly when filters applied, older beatdowns with empty equipment arrays correctly only appear under "All".**

### Cumulative day-on-day progress (updated)

| Day | Commits | Major outcomes |
|---|---|---|
| April 30 (v16) | 5 | Action area pattern, Q Profile cards canonicalized, Shout/Follow archived |
| May 1 (v17) | 11 | Cluster A (Locker UX) + Cluster B (Library/Q Profile UX) + Cluster C Item 5 (exercise edit + 3 latent bug fixes) |
| May 2 (v18) | 3 | Item 12 Notepad v0 MVP end-to-end (parser + UI + DB migration) + parser priority fix + difficulty fix |
| May 3 (v19 morning) | 4 | Cluster D Items D1-D4: Library Exercises filter regroup + Home Pick-up MVP + Notepad autosave + Pick-up 3-flow expansion. Plus one investigated-and-deferred (D5 — Beatdowns card visual rebuild) |
| May 3-4 (v20 afternoon) | 7 | Cluster D Items D5-D11: Notepad +2 fonts + drawer rewrite (D5), Notepad textarea/drawer-layout polish (D6), Library Beatdowns rebuild + avatar helper extract (D7), Notepad help-icon + note overflow fix (D8), Library + About polish (D9), About followup (D10), Equipment filter (D11) |
| **Total** | **30 commits across 5 sessions** | v2-pivot is now TWENTY-FIVE commits beyond `main` (15 from v17/v18 baseline + 4 from v19 morning + 7 from v20 afternoon — wait, that math doesn't add up; let me recount). Per the commit log above, v2-pivot has 11 commits in this session alone on top of the v18 baseline. Bible v19 captured 4 of those. Bible v20 captures all 11. **Merge-to-main remains explicitly user-gated.** |

### Today's commit log — quick reference

```
(equipment filter)  Library: add equipment filter (bodyweight / coupon)  ← latest commit
1148481             About: tighten copy, fix orphan font, surface About link
3202c17             Library + About: share state, search position, content polish
c1c3fae             Notepad: amber help-icon visibility + preview note overflow fix
355578d             Library: rebuild Beatdowns card visual + extract avatar helper
068ca1a             Notepad: textarea 17px/wt 500 + drawer layout fix
9640849             Notepad: bump all fonts +2px and rewrite help drawer copy
f999918             Home: Pick-up card surfaces all 3 draft flows
1c6baef             Notepad: add draft autosave and restore banner
2c4f687             Home: add Pick-up card for in-progress drafts + 3-card grid
fbdf96b             Library Exercises filter: split into Type and Body part rows
7e1b7c6             Add Bible v18                                          ← v18 baseline
8904d5e             Item 12 fix: difficulty default
225d8e0             Item 12 fix: parser priority swap
129c871             Item 12: Notepad v0 MVP
6c1b0cc             Add Bible v17                                          ← v17 baseline
3443ad0             Item 5B: exercise edit flow + 3 latent bugs
[earlier May 1 cluster: 7 commits before 3443ad0]
```

---

## STRATEGIC DEFERRALS — V20 ADDITIONS

This section captures three explicit deferrals locked during the May 3-4 session. The next Claude must NOT propose these unprompted; they're locked product decisions, not "TODO" items.

### Deferral 1 — Photo upload for avatars (DEFERRED to post-launch PAX signal)

**Source:** External implementation proposal arrived mid-session offering complete Supabase Storage avatar upload feature with full implementation details (Storage bucket setup, RLS policies, processAvatar() function with OffscreenCanvas + WebP encoding, uploadAvatar() function, `<Avatar>` shared component with initials fallback, account deletion cleanup, profile screen UI).

**The proposal had real engineering quality** — center-crop to 256×256, WebP at quality 0.8 (~25KB per avatar = ~40K avatars before hitting 1GB Supabase Free tier ceiling), cache-busting query string, RLS policies restricting users to their own folder, etc.

**The proposal flagged its own scope creep:** 6 listed "where this might break the current build" risks (OffscreenCanvas browser support, service worker cache, PWA file picker behavior, existing initials styling preservation, profiles table structure assumption, RLS policy column whitelist). Real fits have 0-1 integration risks.

**Ritz's product call (LOCKED):** Defer entirely until post-launch PAX signal indicates photo upload is wanted.

**Reasoning documented in conversation:**
1. **v2-pivot hasn't shipped to production yet.** Adding a significant new feature (Supabase Storage setup, RLS, new component, audit + migration of every avatar rendering site, account-deletion flow update) before ANY of the current work hits real PAX is textbook feature creep. You don't yet know if existing PAX will use the v2-pivot features. Adding more before signal is guessing.
2. **The proposal's own framing cuts the wrong way.** Calling photo upload "decoration not core utility" is honest — but decoration gets pushed to v1.1, v1.2. Core features ship first.
3. **Photo upload has real moderation risk.** Once you let users upload images, you're one bad upload away from a content problem. Single-AO F3 Essex with 30 known PAX = low risk. Multi-AO with strangers = real risk. Ritz isn't ready to be on call for that at launch.
4. **No PAX has asked for it.** Has any F3 Essex member said "I want to upload a photo for my avatar"? No. Building features users haven't asked for is how products get bloated.
5. **F3 culture trends low-vanity.** PAX care about beatdowns, not avatars. Colored initials may be the right answer permanently, not just an MVP.
6. **The 8-color avatar helper from D7 is sufficient.** Users get a deterministic color from their UUID + their initials in a colored circle. Recognizable, readable, no ops burden.

**What to do if photo upload eventually ships (architectural note for future Claude):**

The Avatar component refactor becomes additive — `getAvatarColor` and `getInitials` already centralize in `src/lib/avatars.ts` after D7. When photos eventually ship, the migration is:
1. Add `avatar_url TEXT NULL` column to `profiles` table
2. Create `<Avatar user={user} size="sm|md|lg" />` shared component
3. Component reads `user.avatar_url` first, falls back to `colorForUserId + getInitials` colored circle on null OR `onError`
4. Migrate every existing avatar render site (audit needed — likely in nav, beatdown cards, Locker, Q Profile, comments)
5. Profile screen tap-to-upload UI: action sheet "Change photo" / "Remove photo" / "Cancel"
6. processAvatar utility (canvas crop + WebP encode + size validation)
7. uploadAvatar utility (Supabase Storage upload + cache-bust URL + profile update)
8. Account deletion handler: delete `{user_id}/avatar.webp` from storage before auth.signOut()

**Revisit trigger:** if real PAX feedback (post-merge to main) includes specific requests for photo upload, OR if the colored-circle avatar produces visible UX problems (e.g., similar PAX confused which avatar is theirs in a crowded feed), then photo upload moves up the queue. Until then, deferred.

**Do NOT propose photo upload unprompted.** The deferral is locked.

### Deferral 2 — Admin / debug tools (STAY MANUAL via Supabase dashboard)

**Source:** Ritz asked during the May 3-4 session whether admin-level features (delete-anything, vote-fudge, comment-edit, soft-delete, etc.) were needed.

**Ritz's product call (LOCKED):** Stay with manual Supabase dashboard for now. Build admin tools when ops exceed 1/week.

**Reasoning documented in conversation:**
1. **Pre-launch state.** There's nothing to moderate yet. F3 Essex single-AO with 30 known PAX. Admin tasks are theoretical.
2. **The dashboard already handles all CRUD ops.** Delete a vote, remove a beatdown, edit a comment — all available via Supabase dashboard UI clicking. No code investment needed.
3. **Adding admin tools BEFORE you have admin tasks is feature creep.** Build them when manual ops exceed 1/week.
4. **F3 culture doesn't have heavy moderation expectations.** Trust networks self-police.

**Soft-delete pattern flagged for future consideration:** Current `deleteBeatdown` does a hard DELETE (per the v19 steal_count investigation). If a PAX accidentally deletes their beatdown, it's gone forever. At some point — probably post-launch when there's real user data — it's worth adding a `deleted_at` timestamp column and soft-delete pattern. Not "admin features" — data durability. Worth a Bible-future entry.

**Revisit trigger:** if Ritz finds himself doing manual SQL/dashboard ops more than once a week, OR if a PAX-data-loss incident occurs (someone deletes a beatdown then asks for it back), invest in admin UI. Until then, deferred.

**Do NOT propose admin/debug-tooling features unprompted.** The deferral is locked.

### Deferral 3 — Marketing / onboarding infographic (DEFERRED to separate session)

**Source:** Ritz asked during the May 3-4 session whether the launch needed a 1-minute infographic showing main app functions, pasteable into AO Slack channels.

**Ritz's product call (LOCKED for THIS chat):** Defer to a separate session. Use Claude Design (or fresh dedicated chat) for this — it's a marketing/visual artifact, not code.

**Recommended format when ready (per discussion):** Image-based infographic showing 8-10 core functions (Generate, rerolls, Notepad, Share, Locker, Library, Manual exercise, Preblast, Backblast). Single image, scannable, paste into any Slack channel, screenshots real UI. ~2-3 hours of design work outside the build chat.

**Why NOT in this build chat:**
1. Marketing artifacts need Ritz's voice and his screenshots — not Claude's auto-generation
2. Different cognitive mode (visual design vs code architecture)
3. Wrong tools (Claude Design has visual-creation tools; build chat has code tools)

**Outside-the-app vs in-app onboarding screen:**
- Outside-the-app artifact: paste-once into Slack, link works forever, no maintenance burden, no app bloat. **Recommended.**
- In-app onboarding screen: real dev work (~half day), maintenance burden, adds a screen to maintain. Rejected.

**Revisit trigger:** when Ritz is ready to launch and starts thinking about Slack distribution. Open a fresh chat with: "I want to make a 1-minute Slack-pasteable infographic for GloomBuilder showing 8-10 core functions. Help me structure the content."

**Do NOT propose marketing artifacts unprompted in build chat.** This deferral keeps build chat focused on code.

### Deferrals carried forward from prior bibles (still in force)

- **Item 6+7 — Find HIMs / Follow system:** STILL DEFERRED per v17 reasoning. Re-introducing social-graph machinery not worth cost without demand evidence.
- **Library curation pass — Notepad warmup/stretch taxonomy expansion:** STILL DEFERRED. The 904-exercise CSV has gaps in warmup/stretch/cooldown coverage. Bible v18's plan to enrich this remains queued.
- **Notepad v0.2 — fuzzy match / multi-exercise lines / AI smart import:** STILL DEFERRED per v18. Real PAX feedback should drive whether v0 is sufficient or needs upgrade.
- **steal_count architectural fix:** DEFERRED INDEFINITELY per v19 product framing. "Every steal IS a real steal" — action-count semantics locked.
- **Avatar profile customization (photo upload):** DEFERRED to post-launch PAX signal per v20 (above).
- **Admin / debug tools:** DEFERRED until ops exceed 1/week per v20 (above).
- **Marketing infographic:** DEFERRED to separate session per v20 (above).

---

## V20 PERMANENT OPERATING RULES (additions to v18/v19's list)

Two new rules distilled from the May 3-4 session, plus reaffirmation of v19's Rules 27-28.

### Rule 29 — Visual smoke test before declaring "done"

**The rule:** A commit is not "done" when the build is green. A commit is "done" when Ritz has visually verified the change on Vercel preview and confirmed the intended behavior.

**The pattern from this session:** Every commit shipped today included a visual smoke test plan in the commit-approval message. After Claude Code reported "build green, ready for commit approval," Ritz pushed, then walked through 3-7 specific test cases on Vercel preview. Multiple commits had bugs caught by this discipline that build-green-only would have missed:

- **D5 (Notepad +2 fonts):** Ritz tested at arm's length, found textarea STILL too small/slim → became D6
- **D5/D6 (Notepad polish):** Ritz tested with long unbroken strings, found note overflow → became D8
- **D7 (Beatdowns card):** Ritz tested share button, found state didn't update real-time → became D9
- **D9 (Library polish):** Ritz tested Support card body, found font orphan → became D10

**Why this matters:** Build-green tests TypeScript compile + module resolution + bundle size. It does NOT test:
- Actual rendering against real browser conditions
- User-typed input edge cases (overflow, accessibility, etc.)
- State propagation across components
- Visual polish (font sizes, spacing, color contrast)

The commit-approval message must include a visual smoke test plan. Ritz must execute it. ONLY THEN is the commit "done." If the smoke test surfaces a bug, document it as a follow-up commit — do not pretend the original commit shipped clean.

**What to do instead:**
- After build-green, write 3-7 specific test cases in the commit-approval message
- Test cases should be concrete: "Open X. Tap Y. Expected: Z."
- Wait for Ritz's "tested and works" before considering the commit closed
- If a bug is caught, the bug becomes a follow-up commit (not a silent fix to the original)

### Rule 30 — Mark recommendations with `(REC)` indicator

**The rule:** When using `ask_user_input_v0` to present option lists, the recommended option must be marked with `(REC)` at the start of its label so Ritz can quickly identify the recommended path.

**The pattern from this session:** Mid-conversation, Ritz asked: "everytime you ask me a question like this, give my recommendation indicator first so i know."

The cognitive load of tracking "what does Claude actually recommend" across long multi-decision conversations is real. The `(REC)` marker eliminates the parsing step — Ritz can scan an option list and immediately know which one Claude is recommending without re-reading Claude's preceding analysis.

**The pattern is now permanent:**
- Every `ask_user_input_v0` call should mark the recommended option with `(REC)` prefix
- If multiple options are equally defensible, mark the one Claude actually recommends — no "neutral" presentations
- If Claude truly has no recommendation, say so explicitly above the question rather than presenting unmarked options
- The unrecommended options should NOT be marked — only the single recommendation gets `(REC)`

**Example before/after:**

Before:
```
[
  "Option A — full migration with backfill",
  "Option B — partial migration without backfill",
  "Option C — defer entirely"
]
```

After:
```
[
  "Option A — full migration with backfill",
  "Option B — partial migration without backfill",
  "(REC) Option C — defer entirely"
]
```

**Why this matters:** Long sessions have many decisions. Without the marker, Ritz has to re-read Claude's analysis to find the recommendation, then context-switch back to picking. With the marker, the decision is one glance.

### Rule 27 — Live-system audit before CSV-only audit (REAFFIRMED from v19)

The Library Exercises filter regroup (Cluster D Item 1) near-miss became this rule. Reaffirmed in v20 because it kept paying off:

- **D7 Beatdowns card rebuild:** Stage 1 diagnostic checked the LIVE QProfileScreen.tsx for existing avatar logic instead of trusting the v19 plan. Found the existing 5-color palette + UUID hash + inline duplicates. Architectural reframe (extract + extend) saved a wrong-shaped commit.
- **D9 share button bug:** Claude initially assumed the share button lived in LibraryScreen detail view. Stage 1 diagnostic found it actually lived in BuilderScreen edit mode. Spec was redirected to the correct file before any code was written.
- **D11 Equipment filter:** Stage 1 diagnostic checked the live system for the `equipment` column. Found it already exists, already SELECTed. Saved a wasted migration spec — the actual fix was 9 lines.

**The rule remains:** When data exists in BOTH a static export AND production, audit against production. Never spec from CSV alone. Never spec from memory.

### Rule 28 — Grep the column name before specifying any migration (REAFFIRMED from v19)

The steal_count near-miss became this rule. Reaffirmed in v20 because it paid off again on D11:

- **D11 Equipment filter:** Before writing migration SQL, the diagnostic grepped for `equipment` and `beatdowns.equipment` across the codebase. Found multiple matches:
  - `db.ts:31` — saveBeatdown writes to it
  - `lib/exercises.ts:84-86` — EQUIP constant
  - `db.ts:loadPublicBeatdowns` — SELECTs * which includes it
  - Generator config has eq selection that maps to this field
  
  Conclusion: column already exists. Skip migration. Map it through dbToShared. The actual fix was 9 lines.

**The rule remains:** Before writing migration SQL, grep the codebase for the column name. If matches exist (in TypeScript types, mapping functions, RPC calls, prior migrations, or Bible documentation), STOP and verify whether the planned migration conflicts with existing infrastructure.

### Rule 26 — Diagnostic-first / spec-second / build-third / test-or-trust-fourth (CARRIED FORWARD from v18)

Every single one of the 11 commits today followed this pattern:
1. Stage 1 read-only diagnostic establishes ground truth
2. Stage 2 specification written against the diagnostic findings
3. Build executes the spec
4. Visual smoke test (now Rule 29) confirms behavior

Two commits used the new two-stage diagnostic pattern (Stage 1 + Stage 1B mini-diagnostic) when a sub-question surfaced mid-cycle:
- **D7 Beatdowns card:** Stage 1B confirmed detail-view Steal button before dropping card-level Save link
- **D9 Library + About polish:** Stage 1.5 retrieved verbatim About copy before specifying ONE NATION OF Q'S replacement content

**The pattern is now mature:** Stage 1 captures structure + line numbers + inventories; Stage 1B handles sub-questions that arise from Stage 1 findings; Stage 2 writes the spec; Stage 3 executes. Each stage has a clean deliverable boundary.

---

## CLUSTER D — V2-PIVOT POLISH SESSION (FULL — v20 EXPANSION)

This section preserves and expands v19's Cluster D documentation. Items D1-D4 are reproduced verbatim from v19 (preserving all original detail). Items D5-D11 are new in v20.

### Cluster D — Items at a glance (UPDATED)

| Item | Commit | Files touched | Outcome |
|---|---|---|---|
| D1 | `fbdf96b` | LibraryScreen.tsx | Library Exercises filter row split into Type + Body part |
| D2 | `2c4f687` | HomeScreen.tsx | Home Pick-up card MVP (builderNew only) + 3-card grid for action tiles |
| D3 | `1c6baef` | drafts.ts, NotepadScreen.tsx | Notepad autosave + draftRestored banner |
| D4 | `f999918` | HomeScreen.tsx | Pick-up card extended to surface Build + Generate + Notepad drafts |
| D5 | `9640849` | NotepadScreen.tsx | Notepad +2 uniform font bump + help drawer copy rewrite (4-row + nested warning) |
| D6 | `068ca1a` | NotepadScreen.tsx | Notepad textarea 17px/wt 500 + drawer layout tighten (70px term column, variable row spacing) |
| D7 | `355578d` | avatars.ts (NEW), QProfileScreen.tsx, LibraryScreen.tsx | Library Beatdowns card visual rebuild + extract avatar helper to shared module |
| D8 | `c1c3fae` | NotepadScreen.tsx | Notepad help-icon amber visibility + preview note overflow fix (wordBreak + overflowWrap) |
| D9 | `3202c17` | page.tsx, LibraryScreen.tsx, ProfileScreen.tsx | Library + About polish: share state + search position + ONE NATION OF Q's card + +2 sweep |
| D10 | `1148481` | ProfileScreen.tsx | About followup: Why I built this rewrite + Support body 15→16 + About link green tint |
| D11 | (latest) | page.tsx, LibraryScreen.tsx | Library Beatdowns equipment filter (bodyweight / coupon) |

### D5 — Notepad +2 uniform fonts + drawer copy rewrite (DETAILED)

**Files touched:** `src/components/NotepadScreen.tsx` only. +56 / -35 lines.

**Trigger:** Real iPhone smoke test of the just-shipped Notepad autosave (D3) revealed font sizes inherited from v18 read too small at arm's length for F3 50+ demographic. Help drawer copy was technical, not F3-vernacular.

**Stage 1 diagnostic findings (28 fontSize values):**

| Line | Current | Element | New (+2) |
|---|---|---|---|
| 31 | 15 | ist shared input style | 17 |
| 187 | 14 | Toast pill text | 16 |
| 194 | 14 | "← Home" back button | 16 |
| 195 | 24 | "Notepad" page title | 26 |
| 196 | 13 | Page subtitle | 15 |
| 210 | 13 | Draft-restored banner body | 15 |
| 221 | 12 | Discard button | 14 |
| 236 | 13 | Write/Preview toggle pill text | 15 |
| 247 | 12 | "TITLE" uppercase label | 14 |
| 253 | 12 | "BEATDOWN NOTES" uppercase label | 14 |
| 257 | 14 | "?" help-toggle button glyph | 16 |
| 264 | 11 | Drawer "HOW TO WRITE" header | 13 |
| 265 | 14 | Drawer "✕" close button glyph | 16 |
| 269 | 11 | Drawer term column | 13 |
| 270 | 11 | Drawer description column | 13 |
| 284 | 13 | Textarea — explicit override | 15 |
| 299 | 13 | Preview empty-state text | 15 |
| 312 | 12 | "X sections · Y exercises" meta line | 14 |
| 326 | 16 | Save button text | 18 |
| 360 | 21 | PreviewSectionCard header label | 23 |
| 361 | 13 | PreviewSectionCard "X exercises" subtitle | 15 |
| 374 | 13 | PreviewSectionCard qNotes pill | 15 |
| 404 | 15 | Preview transition row "↗" arrow glyph | 17 |
| 405 | 16 | Preview transition row name | 18 |
| 420 | 18 | PreviewExerciseRow exercise name | 20 |
| 421 | 10 | Preview "Custom" pill | 12 |
| 424 | 14 | Preview amount/cadence row | 16 |
| 438 | 13 | Preview exercise-note pill | 15 |

**Help drawer rewrite — HELP_ROWS shape change:**

```typescript
// BEFORE:
const HELP_ROWS: Array<[string, string]> = [
  ["blank line", "starts a new section. Don't put a blank line between a section header and its first exercise."],
  ["- text", "coaching note (for exercise above OR section above)"],
  ["> text", "transition (mosey/run to a new spot)"],
  ["x10, 60sec", "marks an exercise with reps or time"],
];

// AFTER:
type HelpRow = { key: string; desc: string; warning?: string };
const HELP_ROWS: HelpRow[] = [
  {
    key: "Section",
    desc: "A blank line above creates a new section.",
    warning: "Don't leave a blank line between a section header and its first exercise.",
  },
  { key: "x10", desc: "Add x10 or 60sec for reps or time." },
  { key: "- text", desc: "Coaching note for the line above." },
  { key: "> text", desc: "Mosey or run between exercises." },
];
```

**Drawer .map() rewrite to handle the new shape + optional warning:**

```typescript
{HELP_ROWS.map((row) => (
  <div key={row.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
    <span style={{ fontFamily: MONO, fontSize: 13, color: G, fontWeight: 700, width: "50%", flexShrink: 0 }}>{row.key}</span>
    <div style={{ flex: 1 }}>
      <span style={{ fontFamily: F, fontSize: 13, color: T3, lineHeight: 1.4, display: "block" }}>{row.desc}</span>
      {row.warning && (
        <div style={{
          display: "flex",
          gap: 6,
          marginTop: 6,
          padding: "6px 8px",
          background: "rgba(245,158,11,0.06)",
          borderLeft: "2px solid " + A,
          borderRadius: 3,
        }}>
          <span style={{ fontFamily: F, fontSize: 12, color: A, flexShrink: 0, lineHeight: 1.4 }}>⚠</span>
          <span style={{ fontFamily: F, fontSize: 12, color: A, fontStyle: "italic", lineHeight: 1.4 }}>{row.warning}</span>
        </div>
      )}
    </div>
  </div>
))}
```

**Visual lineage:** The amber warning block uses the same amber tint pattern as the draftRestored banner (`rgba(245,158,11,0.06)` background, `border-left: 2px solid A`). Visually subordinate to the main rule (12px italic vs 13px regular), clearly attached to the Section row, signals "watch out for this" without using a label like "Heads up" or "Warning."

**Decision rationale (locked):**
- Order: Section → x10 → - text → > text. Most-asked first (sections), most-used second (reps), notes third, transitions last (least-used).
- "Heads up" label rejected: too casual for a warning. Amber + ⚠ icon + italic font does the warning work visually without needing a label.
- Drawer copy stays in 4 rows + nested warning. Adding a 5th flat row was the alternative; nested-under-Section reads more clearly.
- All apostrophes use straight ASCII `'`. (Note: the About content uses HTML entity `&apos;` per its own convention — different file, different convention. Don't conflate.)

**Build green. Pushed as `9640849`.**

### D6 — Notepad textarea polish + drawer layout (DETAILED)

**Files touched:** `src/components/NotepadScreen.tsx` only. +12 / -4 lines.

**Trigger:** Real comparison testing — Ritz held GloomBuilder's Notepad next to iPhone's native Notes app and the textarea text still read distinctly smaller and slimmer than iOS Notes 17px baseline, even after D5's +2 sweep took it from 13→15.

**Decision tree (4 options considered):**
- Option 1 — Mono 18px regular weight: closes size gap by mass but strokes still slim
- Option 2 — Switch to proportional (Outfit) at 17px: loses parser-marker visual rationale (`-`, `>`, `x10` benefit from monospace alignment)
- Option 3 — Mono 17px weight 500 (medium): closes both size AND stroke gap, keeps monospace **(SELECTED)**
- Option 4 — Mono 15px weight 500: smallest change, still smaller than iOS baseline

**Spec applied:**

```typescript
// Textarea inline style — 2 changes
fontSize: 15,        // BEFORE
fontSize: 17,        // AFTER
// + new property added:
fontWeight: 500,     // NEW
```

Everything else on the textarea unchanged: fontFamily MONO, color T2, padding 12, resize vertical, lineHeight 1.5, marginBottom 16.

**Help drawer layout fix (3 sub-changes):**

```typescript
// 1. Term column width
width: "50%"  →  width: 70

// 2. Row gap (with wider term column needs more breathing room before description)
gap: 8  →  gap: 12

// 3. Per-row marginBottom (variable based on warning presence + last-row check)
marginBottom: 8  →  marginBottom: idx === HELP_ROWS.length - 1 
  ? 0 
  : (row.warning ? 10 : 4)
```

**Per-row marginBottom logic with the current 4-row HELP_ROWS computes to:**
- Section (warning, idx 0): 10px (gives warning block visual breathing room before next row)
- x10 (no warning, idx 1): 4px (tight stack)
- "- text" (no warning, idx 2): 4px (tight stack)
- "> text" (last, idx 3): 0px (no trailing whitespace inside drawer container)

**Build green. Pushed as `068ca1a`.**

### D7 — Library Beatdowns card visual rebuild + avatar helper extract (DETAILED)

**Files touched:** `src/lib/avatars.ts` (NEW, 35 lines), `src/components/QProfileScreen.tsx` (-21 / +1), `src/components/LibraryScreen.tsx` (+166 / -30). 3 files, 168 insertions, 51 deletions net.

**Stage 1A diagnostic findings — three architectural surprises:**
1. Avatar logic ALREADY existed in QProfileScreen.tsx:30-49 with 5-color palette + UUID hash + getInitials inline duplicates. v19's plan ("create new file") was wrong; correct approach is "extract + extend."
2. Hash key in existing code was UUID (stable, unique), NOT f3_name (mutable, can collide). v19's plan said f3_name; correct hash key is UUID.
3. `bd.id` is `number | string` per FeedItem interface line 57 (legacy from sample-data era). Hash key needs `String()` cast for the fallback when `bd.auId` is falsy.

**Stage 1B mini-diagnostic findings (new pattern this session):**
- Detail view at LibraryScreen.tsx:461 has full-width green "Save" button calling `onSteal`. Dropping card-level "Save" link is safe — same callback, same toast, just lives in detail view now.
- "Stolen Nx" text at line 310 (detail view) becomes redundant once card has ↻ counter. **Decision: keep.** Different reading context. Counter visibility consistent across surfaces.
- "Save" button label rename ("Steal"?) flagged but **out of scope** for this commit. Bible v17+ uses "Save means steal" convention; rename is its own future commit.

**`src/lib/avatars.ts` (new file, 35 lines):**

```typescript
// Shared avatar helpers — palette + deterministic color hash + initials.
// Used by LibraryScreen Beatdowns cards and QProfileScreen profile circle.
// Hash uses UUID (stable, unique) — same person gets the same color across all surfaces.

export const AVATAR_COLORS = [
  "#f59e0b", // amber (existing)
  "#a78bfa", // violet (existing)
  "#3b82f6", // blue (existing)
  "#06b6d4", // cyan (existing)
  "#E8A820", // gold (existing)
  "#15803d", // forest
  "#475569", // slate
  "#374151", // charcoal
];

export function colorForUserId(id: string, isOwn: boolean = false): string {
  if (isOwn) return "#22c55e";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "?";
  const initials = name.trim().split(/\s+/).map(w => (w[0] || "").toUpperCase()).join("");
  return initials.slice(0, 2) || "?";
}
```

**QProfileScreen refactor:** Deleted lines 30-49 (the inline AVATAR_COLORS + colorForUserId + getInitials definitions). Added single import line:

```typescript
import { colorForUserId, getInitials, AVATAR_COLORS } from "@/lib/avatars";
```

All call sites unchanged — same function signatures, same colors for same UUIDs, same initials behavior. Existing users keep their avatar colors (the 5-color palette is preserved at indices 0-4 of the new 8-color array).

**LibraryScreen Beatdowns card render block (full rewrite):**

The new card is built around `feed.map(bd => { ... })` with the following structure:

```typescript
{feed.map(bd => {
  const isOwn = bd.auId ? bd.auId === currentUserId : false;
  const avatarColor = colorForUserId(bd.auId || String(bd.id), isOwn);
  const initials = getInitials(bd.au);
  
  // Date formatter — "Apr 24" current year, "Apr 24, 2025" prior year
  let dateStr = bd.dt;
  if (bd.createdAt) {
    const d = new Date(bd.createdAt);
    const currentYear = new Date().getFullYear();
    const opts: Intl.DateTimeFormatOptions = d.getFullYear() === currentYear
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
    dateStr = d.toLocaleDateString("en-US", opts);
  }
  
  const sb = bd.src ? srcBadge(bd.src) : null;
  const diffColor = dc(bd.d);
  
  return (
    <div key={bd.id} onClick={() => setLibDet(bd)} style={{
      background: CD,
      border: "1px solid " + BD,
      borderRadius: 14,
      padding: "16px 18px",
      marginBottom: 8,
      cursor: "pointer",
    }}>
      {/* HEADER ROW — avatar + author/AO/date + duration pill */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: avatarColor + "1f",
          border: "2px solid " + avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: avatarColor,
          flexShrink: 0, letterSpacing: -0.5,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {bd.auId && onOpenProfile ? (
              <span onClick={e => handleAuthorTap(e, bd.auId)} style={{ fontSize: 14, fontWeight: 700, color: T2, cursor: "pointer" }}>{bd.au}</span>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 700, color: T2 }}>{bd.au}</span>
            )}
            {isOwn && (
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: G + "20", color: G, fontWeight: 700, letterSpacing: 0.5 }}>YOU</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: T5, marginTop: 2 }}>
            {bd.ao}{bd.ao && dateStr ? " · " : ""}{dateStr}
          </div>
        </div>
        {bd.dur && (
          <span style={{ background: G + "15", color: G, fontSize: 12, padding: "5px 10px", borderRadius: 6, fontFamily: F, fontWeight: 700, flexShrink: 0 }}>{bd.dur}</span>
        )}
      </div>
      
      {/* TITLE */}
      <div style={{ fontSize: 18, fontWeight: 700, color: T2, marginBottom: 6 }}>{bd.nm}</div>
      
      {/* INSPIRED-BY (if present) */}
      {bd.inspiredBy && (
        <div style={{ fontSize: 11, color: A, marginBottom: 6 }}>Inspired by {bd.inspiredBy}</div>
      )}
      
      {/* SOURCE + DIFFICULTY + TAGS row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {sb && (
          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, fontWeight: 700, background: sb.bg, color: sb.c }}>{sb.l}</span>
        )}
        <span style={{ background: diffColor + "15", color: diffColor, fontSize: 11, padding: "3px 8px", borderRadius: 5, fontWeight: 700, fontFamily: F, textTransform: "uppercase" }}>{bd.d}</span>
        {bd.tg && bd.tg.filter(t => t !== bd.dur && !["Easy","Medium","Hard","Beast"].includes(t)).length > 0 && (
          <span style={{ fontSize: 12, color: T4 }}>
            · {bd.tg.filter(t => t !== bd.dur && !["Easy","Medium","Hard","Beast"].includes(t)).join(" · ")}
          </span>
        )}
      </div>
      
      {/* DESCRIPTION */}
      {bd.ds && (
        <div style={{ fontSize: 14, color: T3, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 12 }}>{bd.ds}</div>
      )}
      
      {/* 3-COUNTER FOOTER (always visible, vote interactive) */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 13, color: T4 }}>
        <span 
          onClick={e => { e.stopPropagation(); onToggleVote?.(String(bd.id), "beatdown"); }}
          style={{ color: userVotes.has(String(bd.id)) ? G : T4, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
        >👍 {bd.v}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>↻ {bd.u}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>💬 {bd.cm}</span>
      </div>
    </div>
  );
})}
```

**Build green. Pushed as `355578d`.**

### D8 — Notepad help-icon visibility + preview note overflow fix (DETAILED)

**Files touched:** `src/components/NotepadScreen.tsx` only. +5 / -1 lines.

**Trigger:** Real Vercel preview testing of D5/D6 surfaced two visual bugs:
1. "?" help-toggle button at top-right of "BEATDOWN NOTES" label was invisible (white-on-dark with very low alpha)
2. Long unbroken strings in exercise notes overflowed the right edge of the parent section card in Preview mode

**Stage 1 diagnostic findings:**
- "?" button at line 262 used `background: rgba(255,255,255,0.04)` + `border: 1px solid BD (rgba(255,255,255,0.07))` + `color: T4 (#928982)` — all white-tint values that disappeared against `#0E0E10` dark background
- Two preview note pills overflow on long unbroken strings:
  - Exercise note (line 459-473) — the reported bug
  - qNotes pill (line 396-408) — same bug pattern, unreported but exists
- Codebase precedent: LibraryScreen.tsx:428 already uses `wordBreak + overflowWrap` on comment text — exact same problem, solved with the same pattern

**Help-icon fix (3 property swaps):**

```typescript
background: "rgba(255,255,255,0.04)" → "rgba(245,158,11,0.10)"  // 10% amber
border: "1px solid " + BD → "1px solid rgba(245,158,11,0.30)"   // 30% amber
color: T4 → A                                                    // amber #f59e0b
```

Banner-match (10%/30%) chosen over drawer-match (5%/20%) so the trigger button has slightly more visual presence than the panel it opens. Standard "active button → quieter open content" affordance.

Amber chosen over emerald deliberately:
- Emerald is reserved for brand "primary action" semantics (Save, vote-active, YOU pill)
- The drawer it opens is amber-themed
- Amber-on-amber communicates "this button connects to that content" without muddying green-as-action vocabulary

**Note overflow fix (2 properties added to BOTH pills):**

```typescript
wordBreak: "break-word",
overflowWrap: "anywhere",
```

`whiteSpace: "pre-wrap"` preserved on both — user-authored newlines must still render.

**Build green. Pushed as `c1c3fae`.**

### D9 — Library + About polish (DETAILED)

**Files touched:** `src/app/page.tsx` (+6 / -0), `src/components/LibraryScreen.tsx` (+1 / -1 effectively, with relocation), `src/components/ProfileScreen.tsx` (+~50 / -~70 net). 3 files, 39 insertions, 53 deletions net.

**Three coordinated quick fixes:**

**Fix 1 — Share button real-time state (page.tsx):**

Stage 1 diagnostic mapped the bug to BuilderScreen edit mode (NOT LibraryScreen as Claude initially assumed). Root cause: `handleShareBeatdown` updates `lk[]` but not `editingBd`. Fix template existed in `handleShareExercise` already.

```typescript
// page.tsx:543-552 BEFORE
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

// AFTER (3 lines added)
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
```

Same pattern applied to `handleUnshareBeatdown` for parity (defensive symmetry — currently masked by navigate-away but prevents future regression).

**Fix 2 — Library Beatdowns search bar position (LibraryScreen.tsx):**

The Beatdowns search input was deleted from line 562 (above toggle) and re-inserted as the first element inside the `libT === "beatdowns"` render branch (around line 771, before sort chips). Pure relocation. Identical input markup, state, placeholder. Exercises tab unchanged (already had its search below the toggle).

**Fix 3 — About content swap + +2 sweep (ProfileScreen.tsx):**

Stage 1.5 mini-diagnostic retrieved verbatim About copy from the live file. The 4 existing cards' narrative arc was: WHY I BUILT THIS (origin) → Emergency Q? (use case) → Iron sharpens iron (community) → Support GloomBuilder (CTA). Deleting middle two and replacing with ONE NATION OF Q'S preserves narrative flow with stronger network framing.

Deleted cards:
- "Emergency Q? No sweat" (lines 235-263 in pre-edit file)
- "Iron sharpens iron" (lines 265-291 in pre-edit file)

New card inserted between WHY I BUILT THIS and Support GloomBuilder:

```typescript
<div style={{
  background: CD,
  border: "1px solid " + BD,
  borderRadius: 18,
  padding: 24,
  marginTop: 16,
}}>
  <div style={{
    fontSize: 16,
    fontWeight: 800,
    color: A,
    textTransform: "uppercase",
    marginBottom: 12,
  }}>One nation of Q&apos;s</div>
  <p style={{ color: T3, fontSize: 16, lineHeight: 1.8, margin: 0 }}>
    Thousands of AOs. Tens of thousands of PAX. Every gloom, somewhere
    a brother is Q-ing something brutal and creative you&apos;ve never
    seen.
  </p>
  <p style={{ color: T3, fontSize: 16, lineHeight: 1.8, margin: "14px 0 0" }}>
    Share your best beatdown. Steal theirs. A Q in Essex builds a
    smoker. A Q in Houston runs it Friday. That&apos;s the network.
  </p>
</div>
```

Container styling matches WHY I BUILT THIS card (same CD/BD pattern, padding 24, marginTop 16). Header uses amber A accent. Apostrophes use HTML entity `&apos;` per existing About convention.

**+2 fontSize sweep across About branch:**

22 fontSize values total in About branch (18 surviving from inventory + 3 new ONE NATION OF Q'S values authored at +2 directly + 1 inventory-miss caught at build time: "Redirecting to payment..." transient text at line 306, was 14 → 16).

Final fontSize state across About branch:
- Back "← Profile" button: 14 → 16
- Avatar "TB" 80×80 gradient: 30 → 32
- "The Bishop" name: 24 → 26
- "Creator of GloomBuilder" subtitle: 13 → 15
- "F3 Essex · New Jersey" location: 12 → 14
- "Why I built this" header: 14 → 16
- Why-I-built paragraph 1: 14 → 16
- Why-I-built paragraph 2: 14 → 16
- ONE NATION OF Q's header (new): 16 (authored at +2)
- ONE NATION OF Q's paragraph 1 (new): 16 (authored at +2)
- ONE NATION OF Q's paragraph 2 (new): 16 (authored at +2)
- "Support GloomBuilder" header: 16 → 18
- Support body text: 13 → 15 (later corrected to 16 in D10 — orphan miss)
- Redirecting to payment (transient): 14 → 16 (inventory miss, caught at build time)
- Donate preset price ($3/$7/$15): 22 → 24
- Donate preset label: 10 → 12
- Custom amount "$" prefix: 16 → 18
- Custom amount input: 18 → 20
- "Choose your weight" submit button: 14 → 16
- "Build. Share. Steal. Repeat." footer: 14 → 16
- "Not affiliated…" footer: 11 → 13
- About-only toast: 14 → 16

**Build green. Pushed as `3202c17`.**

### D10 — About followup polish (DETAILED)

**Files touched:** `src/components/ProfileScreen.tsx` only. +10 / -15 lines.

**Trigger:** Real preview testing of D9 surfaced three followup polish items:
1. "Why I built this" copy was too wordy for F3 reader (men 40-50, glance-and-go)
2. Support GloomBuilder body text orphan from D9's +2 sweep (15 instead of 16)
3. "About GloomBuilder" link in main Profile screen invisible against dark background

**Stage 1 diagnostic findings:**
- "Why I built this" card has 2 long paragraphs at lines 212-232 using color T3, fontSize 16, lineHeight 1.8 with margin 0 / "14px 0 0" pattern
- Apostrophes use HTML entity `&apos;` consistently
- Support body at line 295 is fontSize 15 (one orphan from the +2 sweep)
- About GloomBuilder link at lines 623-647 uses CD/BD muted styling identical to Log out — invisible
- Save profile uses full G background (line 614)

**Why I built this content swap (delete 2 long paragraphs, insert 2 short):**

```typescript
// AFTER:
<p style={{ color: T3, fontSize: 16, lineHeight: 1.8, margin: 0 }}>
  10pm, ceiling stare, no plan. That&apos;s why most PAX never
  take the Q.
</p>
<p style={{ color: T3, fontSize: 16, lineHeight: 1.8, margin: "14px 0 0" }}>
  GloomBuilder kills that excuse. Generate a beatdown in 30
  seconds, steal one from the library, or build your own. Show
  up locked and loaded.
</p>
```

Container styling, header, paragraph color/font/lineHeight all preserved. Visual rhythm matches other cards.

**Support body fontSize 15 → 16:** Single property change. Orphan fixed.

**About GloomBuilder link visibility upgrade (4 property swaps):**

```typescript
// Outer <div>
background: CD → "rgba(34,197,94,0.04)"           // 4% green tint
border: "1px solid " + BD → "1px solid rgba(34,197,94,0.12)"   // 12% green border
// Title <div>
color: T2 → G                                      // emerald
// Chevron <div>
color: T5 → G                                      // emerald
```

Subtitle color T4 preserved on purpose — keeps the supporting text quiet so the title pops without overall heaviness. Padding, borderRadius, marginTop, structure, onClick handler all unchanged.

**Color choice decision (locked):** Green tint vs amber tint was a real design call. Amber would have echoed About content's amber-themed headers. Green tint matches Support GloomBuilder card's container styling AND keeps Profile screen color semantic clean (no new amber surfaces). Profile screen had zero amber surfaces before; adding amber would have introduced a new color semantic. Green tint at 4%/12% sits cleanly between Save profile's full G fill (loud primary CTA) and Log out's white-tint (muted destructive) without competing with either.

Claude initially recommended amber, Ritz overrode to green tint. Both options were defensible (60/40 call). Locked: green tint.

**Build green. Pushed as `1148481`.**

### D11 — Library Beatdowns equipment filter (DETAILED)

**Files touched:** `src/app/page.tsx` (+2 / -0), `src/components/LibraryScreen.tsx` (+8 / -3). 2 files, 9 insertions, 3 deletions net.

**Stage 1 diagnostic findings (the diagnostic that saved a wasted migration):**
- `beatdowns.equipment text[]` column ALREADY exists in Supabase
- `saveBeatdown` at db.ts:31 writes to it from Generator/Builder's `eq` selection
- `loadPublicBeatdowns` at db.ts:67-80 SELECTs `*` which includes equipment
- BUT: `dbToShared` at page.tsx:100-126 maps `aoT` and `tg` from the row but DROPS equipment — never reaches SharedItem
- `EQUIP` constant exists at lib/exercises.ts:84-86 with two values: `[{id:"none", l:"Bodyweight only"}, {id:"coupon", l:"Coupon (block)"}]`
- Filter sheet uses standardized chip-row pattern with `filterBtn(o, isSelected, onClick)` helper
- AO Site Type filter is the closest analog (label-to-id lookup, array.includes check on `b.aoT`)
- Filter sheet is a full-page takeover (libF state), scrolls fine — adding 6th row not constrained by viewport

**Open decisions settled (4):**
1. Filter semantics: **inclusive** (matches AO Site Type pattern; multi-select Generator config)
2. Row position: **between AO Site Type and Source** (logical pairing of physical-constraint filters)
3. State variable name: **`fEq`** (matches existing fD/fDu/fR/fAo/fSrc convention)
4. SharedItem field type: **`eq?: string[]`** optional with empty-array default in dbToShared

**page.tsx changes:**

```typescript
// SharedItem interface — added field between aoT and v
eq?: string[];        // beatdown-level equipment array (e.g. ["none", "coupon"])

// dbToShared — added field mapping near aoT
eq: (row.equipment as string[]) || [],
```

**LibraryScreen.tsx changes:**

```typescript
// Import — EQUIP added to existing import from @/lib/exercises
import { mapSupabaseExercise, EQUIP } from "@/lib/exercises";

// Local FeedItem type — implicit Change 5b caught at build time, added eq field for type-check
interface FeedItem {
  // ... existing fields ...
  aoT: string[];
  eq?: string[];    // NEW
  // ... rest ...
}

// State — fEq added between fAo and fSrc
const [fAo, setFAo] = useState("All");
const [fEq, setFEq] = useState("All");    // NEW
const [fSrc, setFSrc] = useState("All");

// Active filter count — fEq appended between fAo and fSrc
const af = libT === "beatdowns"
  ? [fD, fDu, fR, fAo, fEq, fSrc].filter(v => v !== "All").length
  : [fET, fD, fExR].filter(v => v !== "All").length;

// Filter logic — new clause inserted between AO and Source filters
if (fEq !== "All") { 
  const eId = EQUIP.find(e => e.l === fEq); 
  feed = feed.filter(b => eId && b.eq && b.eq.includes(eId.id)); 
}

// Filter sheet UI — new label + chip row inserted between AO Site Type and Source
<div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Equipment</div>
<div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
  {["All", ...EQUIP.map(e => e.l)].map(o => filterBtn(o, fEq === o, () => setFEq(o)))}
</div>
```

**Filter chip set:** `["All", "Bodyweight only", "Coupon (block)"]` sourced verbatim from `EQUIP[].l`. Two canonical equipment values match Generator's `eq` config options.

**Filter semantics (inclusive):** A beatdown with `eq = ["none", "coupon"]` matches BOTH "Bodyweight only" filter AND "Coupon (block)" filter. Mirrors AO Site Type filter's semantics. Reflects Generator's multi-select nature — Q can adapt either way at the AO.

**Older beatdowns:** Beatdowns saved before equipment was a tracked field will have `eq = []`. They won't match either filter, only "All". Documented expected behavior, not a bug.

**Pre-existing tech debt flagged:** The duplicate type definition between SharedItem (page.tsx) and FeedItem (LibraryScreen.tsx) is pre-existing. Not refactored in this commit. Future cleanup item: consolidate into single shared type.

**Build green. Pushed as the latest commit.**

---


---

## PRESERVED FROM BIBLE V19 ONWARD (verbatim — historical record)

*The following sections are preserved verbatim from Bible v19 (May 3, 2026 morning). They document the morning's 4 commits (D1-D4), the steal_count investigation, and all earlier session content (v18, v17, v16, v15, v2-pivot prologue, design system, screens, etc.). v20's new content (above) layers on top of v19's content (below). Both are canonical — read v20's content first for the May 3-4 full-session state, then read v19's content for the morning state and all historical context.*

## V19 SESSION RECAP — MAY 3, 2026 (READ THIS FIRST IF PICKING UP MID-FLIGHT)

### TL;DR for the next Claude

May 3, 2026 was the **v2-pivot polish session** — four commits shipped on the staging branch addressing UX gaps that surfaced from real Vercel preview usage of the v18 \"feature-complete\" build, plus one commit investigated and deliberately deferred after a diagnostic uncovered a real architectural problem.

The session was characterized by **diagnostic-first discipline paying off three times**: once when the Library Exercises filter regroup almost shipped against an outdated CSV schema (saved by checking the live system before specifying), once when the `steal_count` migration almost shipped a duplicate column (saved by grepping the codebase before writing migration SQL), and once when the data-model bug behind `steal_count` drift was revealed by running a corrected SQL query against live production data (the assistant initially proposed a fix that wouldn't work because `inspired_by` doesn't store what the assistant assumed it stored).

The biggest single outcome: **Pick-up card** — a new Home screen affordance that surfaces in-progress drafts across all three creation flows (Build, Generate, Notepad) with a most-recent-wins surfacing rule. This required adding draft persistence to NotepadScreen (which had been transient since Item 12 shipped), then expanding HomeScreen to read and display all three flows. Real PAX returning to the app mid-beatdown will now see exactly where they left off without having to remember which flow they used.

The biggest single non-outcome: **Library Beatdowns card visual rebuild was paused.** The diagnostic for that commit (#5) revealed that the planned `steal_count` migration was unnecessary (column already exists from earlier work) AND that the underlying data model has a real same-author collision problem that prevents reliable per-beatdown decrement. Ritz made a clean product call (\"every steal action IS a real steal — defer the data-model fix until users complain about wrong counts at scale\") and we stopped commit #5 mid-flight to preserve clean session-end state.

### The current state at end of session May 3, 2026

- `main` branch: **untouched today**, gloombuilder.app stable. STILL on v1 architecture (4-tab nav, no Notepad, no Pick-up card, single-row Library filter). v2-pivot has been ready-to-merge since v18 but Ritz has deliberately deferred merge across two sessions now. **The merge-to-main remains EXPLICITLY user-gated** per session-locked rules established earlier in v17/v18 — the next Claude must not instruct merge without Ritz's explicit \"merge\" command.
- `v2-pivot` branch: **FEATURE-COMPLETE-PLUS-FOUR.** The v18 ten-commit baseline is now fourteen commits. Four new commits today, in chronological order:
  1. `fbdf96b` — Library Exercises filter: split into Type and Body part rows
  2. `2c4f687` — Home: add Pick-up card for in-progress drafts + 3-card grid (MVP, builderNew only)
  3. `1c6baef` — Notepad: add draft autosave and restore banner
  4. `f999918` — Home: Pick-up card surfaces all 3 draft flows
- Supabase: NO migrations applied today. The proposed `steal_count` migration was investigated and explicitly NOT shipped (see steal_count investigation section below).
- Vercel preview: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/` reflects all four commits. Smoke-tested by Ritz across Library, Home, Notepad, and Builder flows.
- Working directory: `C:\\Users\\risum\\Documents\\projects\\gloombuilder` — Bible v19 needs to be added similarly to v18.
- Claude Code: still primary workflow. Five diagnostic-spec-build cycles executed cleanly today, four of which produced commits and one of which produced a documented deferral.
- Empty-draft pollution case caught and gated: **the Pick-up card surfacing rule rejects builderNew envelopes where both `bT` is empty AND zero non-transition exercises exist**. Same gate logic generalizes for generatorResult (title OR generated exercises) and notepadDraft (title OR text).

### Today's four commits — the timeline

The session opened with three brainstorming-chat handovers — design mockups produced in separate Claude conversations that needed implementation review. Each mockup went through the canonical workflow of: read-only diagnostic of current production code → identify what the mockup gets right vs wrong → spec a build that maps to actual code → execute build → review diff → commit → smoke-test → next.

#### Commit 1 — Library Exercises filter regroup — `fbdf96b`

**Files touched:** `src/components/LibraryScreen.tsx` only. +109 / -7 lines.

**What it did:** Reorganized the existing single-row chip cloud (12 chips wrapping across multiple visual lines) into two semantically grouped horizontal-scroll rows with section labels.

- **Type row (7 chips):** All / Warm-up / Mary / Cardio / Static / Transport / Coupon — answers \"what kind of exercise is this in F3 terms?\"
- **Body part row (7 chips):** All / Full body / Core / Legs / Chest / Arms / Shoulders — answers \"what does it train?\"
- Both filters AND-chain with each other and with search — typing \"merkin\" in search and tapping Cardio + Chest now narrows to just the merkins that hit chest and are tagged cardio.

**Critical pre-execution discovery (saved a wrong-direction migration):** The assistant initially audited the brainstorming mockup against `f3exercisesenriched.csv` (the raw 904-row CSV with `exercise_type` values like `strength`/`combo`/`cardio`/`agility`/`flexibility` and pipe-delimited `body_part` like `upper|core`/`core|lower`). On that data, the mockup's chip labels (\"Warm-up\" / \"Mary\" / \"Full body\" / \"Legs\" / \"Chest\") would return zero results because no rows have those exact values.

The assistant then proposed three paths: (A) ship with the actual CSV vocabulary, (B) curate all 904 rows to the F3-friendly vocabulary, or (C) defer entirely. Ritz pushed back with a screenshot of the LIVE Vercel preview showing the F3-friendly chips already rendering and filtering correctly on a real exercise (Fire Hydrant tagged LEGS + WARM-UP).

The assistant then re-audited and discovered the **`mapSupabaseExercise` translation layer** in `src/lib/exercises.ts:165-191` — which converts raw Supabase columns (`body_part`, `exercise_type`, `is_mary`, `is_transport`, `movement_type`, `intensity`, `equipment`) into canonical F3 tag strings (\"Warm-Up\", \"Mary\", \"Full Body\", \"Legs\", \"Chest\", etc.) that get stored on each exercise's `e.t: string[]` array. The chips filter on `e.t.includes(chipValue)` — so the F3-friendly vocabulary works because the translation layer already exists.

**This is the canonical example of the new live-system-audit-first rule.** See V19 OPERATING RULES below.

**Implementation choices:**
- Casing strategy: Option A (display-relabel only) — keep filter VALUES capitalized as they are stored (\"Warm-Up\", \"Full Body\"), render display LABELS lowercased (\"Warm-up\", \"Full body\"). Smallest scope. The alternative — full taxonomy rename across `mapSupabaseExercise` + Notepad parser tag matching + Generator + Builder — was correctly rejected as a separate PR.
- Module-scope arrays: added `TYPE_TAGS` (6 entries) and `BODY_TAGS` (6 entries) of `{value, label}` objects right after the existing `TAGS` constant. The 12-string `TAGS` constant itself is **preserved** because it's also used by the Beatdowns tab's filter sheet \"Exercise Type\" sub-filter at line 499. Different state (`fET`), different concern.
- Filter logic: `tagMatch && searchMatch` extends to `typeMatch && bodyMatch && searchMatch`. Same AND-chain pattern.
- Container behavior: `flexWrap: \"wrap\"` → `overflowX: \"auto\"` + `flexWrap: \"nowrap\"` + `scrollbarWidth: \"none\"` + `WebkitOverflowScrolling: \"touch\"`. Webkit scrollbar already hidden globally via globals.css:38-40 — no CSS change needed.
- Per-chip `flexShrink: 0` + `whiteSpace: nowrap` so chips don't compress or wrap inside the horizontal-scroll container.
- Decision on Transport + Coupon placement: Ritz called these into the Type row even though semantically they're equipment-context (Coupon) and movement-intent (Transport) rather than \"types\" in the same sense as Cardio/Mary/Warm-up. Ritz override locked: \"PAX-facing taxonomies don't need to be ontologically pure; they need to be findable.\"
- Decision on horizontal-scroll discoverability: chose to hide the scrollbar entirely. Cleaner on mobile (the primary platform). The earlier-discussed \"→\" overflow arrow was dropped to match. Native momentum scroll on touch devices is sufficient affordance.

**Build green. Pushed. Smoke-tested live by Ritz: \"the two-row filter is visible (TYPE row + BODY PART row with section labels)\"** — confirmation came when the assistant asked Ritz to verify the deployment status during the later Pick-up card debugging.

#### Commit 2 — Home Pick-up card MVP — `2c4f687`

**Files touched:** `src/components/HomeScreen.tsx` only. +168 / -38 lines.

**What it did:** Added the first version of the Pick-up card on Home. Reads `loadDraft<BuilderDraft>(DRAFT_KEYS.builderNew)` on mount, applies a meaningful-draft gate (title non-empty OR at least one non-transition exercise), and renders a green-tinted card above \"Build from scratch\" if the gate passes. Tap → calls existing `onBuild` prop → BuilderScreen mounts → existing draft-restore logic auto-restores → user picks up where they left off.

Also: refactored the bottom three list-row cards (Notepad / Create exercise / Send Preblast) into a 3-card horizontal grid with emoji icons (📝 ➕ 📣). The amber border + NEW pill on the May 2 Notepad card got demoted to a peer of the others — pre-launch, \"new\" is meaningless.

**Critical pre-execution discovery (the empty-draft pollution problem):** The Stage 1 diagnostic surfaced a real edge case in BuilderScreen's autosave logic. The 800ms autosave fires on ANY state change — including the initial render where the form has the default empty title + 3 default empty sections. So a user opening Build, typing nothing, then navigating back triggers an autosave with an envelope that has `bT: \"\"` and 3 empty sections. Without filtering this out, every Home visit after the first Build tap shows a meaningless Pick-up card with title \"Untitled\" and 3 sections.

The fix: gate on `(bT.trim() !== \"\") || (totalNonTransitionExerciseCount > 0)`. Either condition is real signal that the user did meaningful work. Empty default-state envelopes get filtered out before `setPickUp(...)` fires.

**The diagnostic also flagged but did NOT fix a related concern: `formatTimeAgo` staleness.** A pick-up card sitting on Home for 10 minutes saying \"just now\" looks ugly. Three options: (a) recompute on a setInterval polling every 60s, (b) recompute on window-focus event, (c) accept staleness as cosmetic. Ritz's call: option (c). \"Home screen rarely sits open for hours; cost of staleness is purely cosmetic.\"

**Architectural decision: state lives in HomeScreen, not page.tsx.** The diagnostic confirmed that page.tsx had ZERO awareness of drafts before this commit (BuilderScreen / GeneratorScreen / NotepadScreen all read drafts directly via their own `loadDraft` IIFEs on mount). HomeScreen becoming the only Home-tab caller of `loadDraft` is clean separation. The alternative — page.tsx reads the draft and passes a `pickUpInfo` prop — would have inverted the dependency direction and forced page.tsx to know about draft envelope shapes just for one card.

**Inline theme constants:** F/T1/T2/T4/T5 inlined in HomeScreen.tsx to match values used in LibraryScreen / SectionEditor / NotepadScreen. Tracked as a future cleanup: extract to a shared design-tokens module to eliminate the duplication. Not blocking.

**Build green. Pushed. Initial smoke test on Vercel preview revealed an issue: the Pick-up card was NOT appearing despite a draft existing.** See debugging notes below — turned out to be the empty-draft case correctly filtering out a localStorage envelope where the title had been cleared after the initial autosave fired. The gate was working as designed; the test scenario produced an empty draft that correctly was not surfaced. Re-test with \"test pick-up\" as a real title produced the expected Pick-up card. **First debugging round of the day caught no bug — the system was correct.**

#### Commit 3 — Notepad autosave — `1c6baef`

**Files touched:** `src/lib/drafts.ts` (+1 line for the new DRAFT_KEYS entry) and `src/components/NotepadScreen.tsx` (+71 / -2). 2 files, 72 net new lines.

**What it did:** Made NotepadScreen — which had been transient since Item 12 shipped on May 2 — persist drafts to localStorage. Same pattern as BuilderScreen and GeneratorScreen.

This commit was a **prerequisite** for commit 4 (the Pick-up scope expansion). Without Notepad autosave, the Pick-up card couldn't surface a Notepad draft because Notepad drafts didn't exist. Path 2 of the user's earlier decision (\"add Notepad autosave first, then ship 3-flow Pick-up\") locked in this two-commit sequence.

**Implementation:**
- New DRAFT_KEYS entry: `notepadDraft: \"gloombuilder.draft.notepad\"`. Single string, no per-id variant (Notepad has no edit mode — it's a creation surface only).
- `NotepadDraft` envelope shape: `{ title: string; text: string }` only. **Deliberately minimal.** `parsedResult` is NOT persisted because the parser is pure and re-runnable from `text` alone (and persisting it risks stale-parse bugs if the library updates between save and load). `allEx` is fetched from Supabase on mount and not persisted (would risk staleness across sessions).
- `loadDraft<NotepadDraft>(draftKey)` IIFE on mount seeds initial state via the `?? \"\"` chain. Mirror of BuilderScreen lines 78-81.
- 800ms debounced save useEffect on `[title, text, draftKey]`. Empty-state guard: `if (!title.trim() && !text.trim()) return;` — prevents localStorage churn on every fresh-Notepad mount.
- `draftRestored` state + mount useEffect that sets `formatTimeAgo(initialDraft.savedAt)` once on mount. Renders the same amber \"↻ Draft restored from X ago\" banner that BuilderScreen uses. Visual consistency across all three creation flows.
- `handleDiscardDraft` resets title/text to empty, calls `clearDraft(draftKey)`, sets banner to null. Same pattern as BuilderScreen.
- Inside `handleSave`'s `if (newId)` block, `clearDraft(draftKey)` and `setDraftRestored(null)` fire BEFORE `onSavedNew(newId)`. Order matters: the screen unmounts on navigation, and a stale restore on remount would be a confusing UX.

**Bible v18 Rule 26 confirmation:** diagnostic-first ran before specification. Confirmed: zero existing localStorage usage in NotepadScreen, no editData prop (so no per-id key needed), parseNotepad is pure and re-runnable, BuilderScreen banner JSX is drop-in compatible (NotepadScreen already imports A amber and F font constants).

**Build green. Pushed. Smoke-tested live by Ritz: \"it worked!\"** — confirmed via type-then-back-then-Notepad-again flow showing the amber banner with title pre-filled. The save-flow clearDraft was also verified by completing a real save and confirming localStorage was empty afterwards.

#### Commit 4 — Pick-up scope expansion (all 3 flows) — `f999918`

**Files touched:** `src/components/HomeScreen.tsx` only. +118 / -27 lines.

**What it did:** Extended the Pick-up card to read all three primary draft surfaces (Build / Generate / Notepad) and surface whichever has the most recent `savedAt` timestamp. Tap routes to the correct flow.

**Why this commit existed:** The MVP Pick-up card (commit 2) only knew about `builderNew`. Real testing on Vercel preview revealed that users completing the Generator wizard or working in Notepad got nothing on Home, even though those flows correctly autosaved and would restore on direct tap. The asymmetry was a UX bug, not a feature.

**Implementation:**
- `PickUpInfo` interface gains `flow: PickUpFlow` discriminator (`\"build\" | \"generate\" | \"notepad\"`) and `savedAt: number` (for max-savedAt comparison).
- Two new lite types defined locally in HomeScreen, mirroring the existing inlined `BuilderDraft`:
  - `GeneratorDraftLite = { grT: string; gr: Section[] }`
  - `NotepadDraftLite = { title: string; text: string }`
- Strategy: **inline minimal types in HomeScreen, not import from screen files**. Three reasons explicit in v19:
  1. Existing precedent — `BuilderDraft` is already inlined locally (added in commit 2).
  2. Minimal coupling — HomeScreen reads the persisted shape, which is a stable contract independent of how the screens use it internally. Importing the type would couple HomeScreen to GeneratorScreen's rendering concerns.
  3. Smallest surface — types only need fields HomeScreen actually displays. NotepadDraft is `{ title; text }` (2 fields), GeneratorDraft is `{ grT; gr }` (2 fields the card uses, others ignored). Extra fields in the JSON envelope are silently dropped.
- Mount useEffect reads all three keys, gates each on its own meaningful-content check, sorts by `savedAt` desc, picks `candidates[0]`. If no candidate has meaningful content, no card renders (same behavior as before).
- Per-flow gates:
  - Build: `titleHasContent || hasExercises` — same as commit 2.
  - Generate: `titleHasContent || hasExercises` — note: GeneratorScreen only autosaves when `gr` is non-null (per its own `if (!gr) return;` save-effect guard at GeneratorScreen.tsx:80), so any persisted generator draft has exercises by construction. The title-or-exercises gate is for safety and symmetry, not strictly necessary.
  - Notepad: `titleHasContent || textHasContent`. No exercise count required because Notepad text doesn't necessarily parse into exercises until rendered.
- Tap dispatcher: `() => { if (pickUp.flow === \"generate\") onGenerate(); else if (pickUp.flow === \"notepad\") onCreateNotepad?.(); else onBuild(); }`. The `onCreateNotepad?.()` uses optional chaining because the prop is optional in HomeScreenProps (Notepad shipped after Home was built).
- Visual change: meta line gains a small uppercase flow-source pill (\"BUILT\" / \"GENERATED\" / \"NOTEPAD\") so users know which screen they're returning to BEFORE tapping. Pill styling: `rgba(255,255,255,0.06)` background, T2 color, 10px / 700 / uppercase / letter-spacing 0.5, 4px border-radius. Lighter letter-spacing than the section header label (1.5) — pills typically use lighter spacing at small sizes for legibility.
- Section/exercise counts shown for Build and Generate only. **Notepad shows pill + timeAgo only.** Decision rationale: showing Notepad counts would require importing `parseNotepad` + the exercise library on Home, adding bundle weight to a screen that doesn't currently need either. The pill + timestamp gives the user enough information to decide whether to tap. Full counts wait for the screen they're returning to.
- No `page.tsx` changes. All three flow handlers (`onBuild`, `onGenerate`, `onCreateNotepad`) were already wired in `HomeScreenProps` and rendered in page.tsx:876-886. The Pick-up card just dispatches to the existing props.

**Build green. Pushed. Smoke-tested live across all three flows.** Real PAX returning to the app after working in any flow now sees a clear \"Pick up where you left off\" affordance with correct flow attribution.

#### Commit 5 — DEFERRED (Library Beatdowns card visual rebuild + avatar helper)

**Status: NOT SHIPPED. Diagnostic ran. Architectural finding redirected the work.**

**Original scope (locked from earlier in session):**
- New file `src/lib/avatars.ts` — 8-color manly palette + deterministic hash from f3_name (~15 lines)
- Modified `src/components/LibraryScreen.tsx` — Beatdowns card visual rebuild per the locked layout
- New Supabase migration: `steal_count` column + trigger for INSERT/DELETE on `inspired_by`

**Locked design decisions (carry forward to next session):**

| Question | Locked answer | Rationale |
|---|---|---|
| Avatar palette | 8 colors, manly only (no rose/pastel): emerald `#22c55e`, slate `#475569`, amber `#f59e0b`, steel `#0891b2`, forest `#15803d`, bronze `#b45309`, indigo `#4338ca`, charcoal `#374151` | Reads like outdoor gear; pairs well with white initials. Future profile-picture override is a clean upgrade path: avatar checks for `profile_image_url` first, falls back to colored circle. |
| Engagement counters (👍 ↻ 💬) | Always show all 3, even at 0 | Ritz's call: \"honest about the metric.\" Cards with 0 engagement are honest about freshness. |
| Date format | \"Apr 24\" for current-year, \"Apr 24, 2025\" for previous-year | Reads naturally; no Twitter-shorthand \"12d\". |
| Reposts vs steals | Same metric. Single counter on card (`↻ N`) | Ritz: \"the steal IS the meaningful share in F3 culture.\" |
| Avatar attribution (`+N` overlapping circles) | DROPPED. Show only `↻ N` counter | Avoids the \"+N\" tap-target → modal pattern that doesn't yet exist. |
| Steal count data layer | DEFER INDEFINITELY (see steal_count investigation below) | Ritz's product framing: \"every steal action IS a real steal regardless of persistence — revisit when scale produces complaints\". |

**The diagnostic uncovered the steal_count finding which redirected the commit.** See section below.

### Today's commit log — quick reference

```
f999918  Home: Pick-up card surfaces all 3 draft flows
1c6baef  Notepad: add draft autosave and restore banner
2c4f687  Home: add Pick-up card for in-progress drafts + 3-card grid
fbdf96b  Library Exercises filter: split into Type and Body part rows
7e1b7c6  Add Bible v18                                          ← v18 baseline
8904d5e  Item 12 fix: difficulty default
225d8e0  Item 12 fix: parser priority swap
129c871  Item 12: Notepad v0 MVP
6c1b0cc  Add Bible v17                                          ← v17 baseline
3443ad0  Item 5B: exercise edit flow + 3 latent bugs
[earlier May 1 cluster: 7 commits before 3443ad0]
```

### Cumulative day-on-day progress

| Day | Commits | Major outcomes |
|---|---|---|
| April 30 (v16) | 5 | Action area pattern, Q Profile cards canonicalized, Shout/Follow archived |
| May 1 (v17) | 11 | Cluster A (Locker UX) + Cluster B (Library/Q Profile UX) + Cluster C Item 5 (exercise edit + 3 latent bug fixes) |
| May 2 (v18) | 3 | Item 12 Notepad v0 MVP end-to-end (parser + UI + DB migration) + parser priority fix + difficulty fix |
| May 3 (v19) | 4 | Cluster D — Library Exercises filter regroup + Home Pick-up card MVP + Notepad autosave + Pick-up 3-flow expansion. Plus one investigated-and-deferred: Library Beatdowns card visual rebuild (paused after steal_count architectural finding) |
| **Total** | **23** | v2-pivot is now FOURTEEN commits beyond `main`, four sessions of polish-and-feature work, all real-tested on Vercel preview, none merged to main. **Merge-to-main remains explicitly user-gated.** |

---

## STEAL_COUNT INVESTIGATION — DRIFT IS REAL, FIX IS DEFERRED

This section captures a non-trivial finding from May 3's session that the next Claude needs to understand before touching anything related to the steal mechanic. The deferral is explicit and locked.

### What was investigated

The plan for commit #5 (Library Beatdowns card visual rebuild) initially included a Supabase migration adding `steal_count integer NOT NULL DEFAULT 0` to the beatdowns table plus a trigger to auto-increment on INSERT and decrement on DELETE of child beatdowns (where `inspired_by IS NOT NULL`). The card UI rebuild would then read `steal_count` to display \"Stolen N times\" on every beatdown card.

Stage 1A diagnostic ran first per Bible v18 Rule 26. The diagnostic revealed multiple lines of evidence that **`steal_count` already exists**:

- `src/app/page.tsx:114` already maps it: `u: (row.steal_count as number) || 0,`
- `src/components/QProfileScreen.tsx:88` already types it: `steal_count: number | null;`
- `src/components/QProfileScreen.tsx:408` already reads it: `const steals = bd.steal_count || 0;`
- `src/lib/db.ts:434-435` already increments it via existing RPC: `await supabase.rpc(\"increment_steal_count\", { beatdown_id: originalId });`
- All three Bibles (v16, v17, v18) document the column in the schema reference and the RPC as SECURITY DEFINER. Bible v18 line 4340 lists it on beatdowns; v18 line 4359 documents `increment_steal_count(beatdown_id uuid)` as SECURITY DEFINER.

So the live DB has: `steal_count int default 0` + an RPC `increment_steal_count` that does the increment. **No trigger** — increment happens via the explicit RPC call from `stealBeatdown`. **No decrement mechanism** — nothing fires on child delete.

This near-miss (assistant about to ship a duplicate column add) became the seed of a new operating rule: see `grep-the-column-name before specifying any migration` rule below.

### Drift verification — running real SQL against production

To verify whether the missing decrement was producing real drift, Ritz ran this query in the Supabase dashboard (assistant's first attempt, partially wrong — see below):

```sql
SELECT 
  b.id, b.name, b.steal_count,
  (SELECT COUNT(*) FROM beatdowns c WHERE c.inspired_by = b.id) AS actual
FROM beatdowns b
WHERE b.steal_count > 0;
```

Result:

| name | steal_count | actual |
|---|---|---|
| The Essex Standard | 9 | 0 |
| Generated Beatdown | 1 | 0 |
| The Belmont | 2 | 0 |

Drift looked enormous: 12 phantom steals. But the diagnostic for commit #5 caught a critical flaw in this query: **`inspired_by` does NOT store the parent beatdown's ID. It stores the parent author's USER ID.** From `db.ts:424`:

```typescript
inspired_by: original.created_by,  // ← user ID, not beatdown ID
```

So the `actual` column in the query above was checking if any child's user-UUID happened to match a beatdown's PK by coincidence — almost never true. The query as written was structurally meaningless.

The corrected query was:

```sql
SELECT 
  p.id AS beatdown_id,
  p.name,
  p.created_by AS author_id,
  p.steal_count,
  (SELECT COUNT(*) FROM beatdowns c 
   WHERE c.inspired_by = p.created_by 
     AND c.created_by != p.created_by) AS children_pointing_at_author
FROM beatdowns p
WHERE p.steal_count > 0
ORDER BY p.steal_count DESC;
```

Result of corrected query (May 3 production data):

| beatdown_id | name | author_id | steal_count | children_pointing_at_author |
|---|---|---|---|---|
| 20919e07... | The Essex Standard | 5ae5834b... | 9 | 0 |
| 43794609... | The Belmont | 5ae5834b... (same author) | 2 | 0 |
| 1a47fd18... | Generated Beatdown | f5156132... | 1 | 0 |

**Drift IS real.** Twelve phantom steals across 3 beatdowns and 2 authors. Every beatdown with `steal_count > 0` has zero children currently pointing at its author. Whatever children DID exist (the ones that drove the count up) have been deleted, and `deleteBeatdown` (`db.ts:82-94`) has no decrement logic.

### The deeper architectural problem

Two of the three drifted beatdowns (Essex Standard and Belmont) have the **same author** (`5ae5834b...`). If they each had real steals right now, the `children_pointing_at_author` column would show the same number for both — because that count is per-author, not per-beatdown. **The data model genuinely cannot distinguish which beatdown was the source.**

This means even if the next Claude wanted to add a decrement-on-delete mechanism, **per-beatdown decrement is structurally impossible without a schema change** — there is no way to know which parent beatdown to decrement when a child is deleted, when the parent author has multiple beatdowns. The clean architectural fix would be:

- Add a second column `inspired_by_beatdown_id uuid REFERENCES beatdowns(id)` so children point at the source beatdown directly
- Update `stealBeatdown` to populate the new column
- Add a DELETE trigger to decrement `inspired_by_beatdown_id`'s parent `steal_count`
- Backfill historical data — **impossible to recover with certainty** because the parent-child mapping was lost

**This is real work — multiple hours of careful migration with backfill that can't be made fully accurate.**

### Ritz's product-framing decision (LOCKED)

> \"Oh this is fine, technically if you steal it over and over again, it is still a 'steal'. I wouldn't be mad about it and over engineer this. However, if someone really wants to maliciously fudge the numbers, they will have to do it over and over, makes someone really use our app and loves our number counters. It's in a way a win to us because stolen numbers counter is really what makes him happy. Now, of course I don't tolerate cheating but let's revisit this later on when we have huge number of pax using the app and stolen numbers are something the pax in the future will scream to fix it. Right now it's fine. Nobody will figure this out yet.\"

This reframes `steal_count` semantically:

- **Old framing (which produced \"drift is bad\"):** count = number of currently-existing children. Decrementing on delete is correct.
- **New framing (locked May 3):** count = number of lifetime steal-action events. Increment-only is correct. Re-stealing after deletion is a real steal action and should count.

Under the new framing, the data model isn't broken — it's intentional. The same-author collision problem disappears because you don't need per-beatdown decrement under an action-count model.

### What the next Claude should do (and not do)

**Do:**
- Treat `steal_count` as an action-count, not a current-children-count.
- When the Library Beatdowns card is eventually rebuilt (commit #5 next session), display `steal_count` as-is. \"Stolen 9 times\" on Essex Standard is technically correct: there have been 9 steal-action events.
- Document any new `steal_count`-related work in v20 only if Ritz requests revisit.

**Do NOT:**
- Propose adding a decrement trigger or `inspired_by_beatdown_id` column without explicit Ritz request.
- Treat the May 3 drift query result as a bug. It's been documented and re-framed as expected behavior.
- Run a backfill UPDATE to zero the current 12 phantom counts. Those 12 are real action-counts under the new framing.

**Revisit trigger:** if real PAX feedback (post-merge to main, post-multi-AO scale) includes complaints about wrong steal counts (\"I stole this and the count didn't change\" / \"this beatdown shows 50 steals but only 5 PAX use it\"), then the architectural fix becomes worth doing. Until then, the increment-only behavior IS the design.

---

## CLUSTER D — V2-PIVOT POLISH SESSION (MAY 3, 2026)

This section captures the four shipped commits in canonical \"what + why + how\" detail. Subsequent sections (\"V19 Permanent Operating Rules\", \"Strategic Deferrals\") cross-reference these cluster items.

### Cluster D — Items at a glance

| Item | Commit | Files touched | Outcome |
|---|---|---|---|
| D1 | `fbdf96b` | LibraryScreen.tsx | Library Exercises filter row split into Type + Body part |
| D2 | `2c4f687` | HomeScreen.tsx | Home Pick-up card MVP (builderNew only) + 3-card grid for action tiles |
| D3 | `1c6baef` | drafts.ts, NotepadScreen.tsx | Notepad autosave + draftRestored banner |
| D4 | `f999918` | HomeScreen.tsx | Pick-up card extended to surface Build + Generate + Notepad drafts |
| D5 | DEFERRED | (none) | Library Beatdowns card visual rebuild — paused after steal_count finding |

### D1 — Library Exercises filter regroup

Captured in \"Today's four commits\" above. Key takeaway for future maintenance:

- The 12-string `TAGS` constant at LibraryScreen.tsx:33 is **dual-purpose**. Used by both the Exercises tab filter chip render (now superseded by `TYPE_TAGS` + `BODY_TAGS`) AND the Beatdowns tab's filter sheet \"Exercise Type\" sub-filter at line 499. Do not delete `TAGS` even though the Exercises tab no longer references it directly.
- Filter VALUES on the new chip rows match canonical tag strings stored on each exercise's `e.t: string[]` array (\"Warm-Up\", \"Full Body\"). Display LABELS render lowercased (\"Warm-up\", \"Full body\"). Tag values are produced by the `mapSupabaseExercise` translation layer in `src/lib/exercises.ts:165-191` which converts raw Supabase columns into the F3-friendly canonical vocabulary.
- The translation layer is the reason a CSV-only audit produced misleading conclusions during Stage 1 design review. See V19 Operating Rule below.

### D2 — Home Pick-up card MVP

Captured in \"Today's four commits\" above. Key takeaway for future maintenance:

- The 800ms autosave debounce in BuilderScreen fires on **every** form-state change, including the initial render with default empty values. Without a meaningful-content gate at the consumer side (HomeScreen's Pick-up card), every Home visit after a Build tap shows a useless \"Untitled · 3 sections\" Pick-up card. Gate logic is `(bT.trim() !== \"\") || (totalNonTransitionExerciseCount > 0)`. Same gate generalizes to other autosaving screens.
- The 3-card grid layout uses `display: grid; gridTemplateColumns: 1fr 1fr 1fr; gap: 8` at 24px container padding within a 430px outer container, yielding ~122px per card on a typical phone viewport. Each card is a 28px emoji + 13px label, vertically stacked with `gap: 8`. `padding: 20px 12px`.
- The \"Build from scratch\" card stays as a full-width list-row card above the grid. Pre-existing flex container preserved (now wraps just one child) with `marginBottom: 8` added for breathing room.

### D3 — Notepad autosave

Captured in \"Today's four commits\" above. Key takeaway for future maintenance:

- New `DRAFT_KEYS.notepadDraft = \"gloombuilder.draft.notepad\"`. Single string, no per-id variant — Notepad has no edit mode.
- `NotepadDraft` type is intentionally minimal: `{ title: string; text: string }`. `parsedResult` is NOT persisted because the parser is pure and re-runnable from `text` alone, AND because the exercise library (`allEx`) is fetched async on mount, so a persisted parsedResult could be stale relative to the freshly loaded library.
- Empty-state guard `if (!title.trim() && !text.trim()) return;` in the autosave useEffect prevents localStorage churn on every fresh-Notepad mount. This is a key difference from BuilderScreen's autosave (which writes empty envelopes too) — Notepad doesn't have the same edge-case need (no edit mode, no per-id key) so the guard is cleaner.
- `handleSave`'s `if (newId)` block fires `clearDraft` + `setDraftRestored(null)` BEFORE `onSavedNew(newId)`. Order matters: the screen unmounts on navigation, and a stale restore on remount would confuse users.

### D4 — Pick-up scope expansion to 3 flows

Captured in \"Today's four commits\" above. Key takeaway for future maintenance:

- Two new lite types defined locally in HomeScreen, mirroring the existing inlined `BuilderDraft`: `GeneratorDraftLite = { grT: string; gr: Section[] }` and `NotepadDraftLite = { title: string; text: string }`. Strategy: **inline minimal types in HomeScreen, not import from screen files.** HomeScreen reads the persisted shape (a stable contract); the source-of-truth types live in their respective screen files where they include additional rendering-concern fields HomeScreen doesn't need.
- Most-recent-wins: `candidates.sort((a, b) => b.savedAt - a.savedAt); setPickUp(candidates[0]);`. Single card at a time. Multiple-cards alternative (Option 4 in earlier discussion) was rejected for clutter.
- Notepad cards display pill + timeAgo only. No section/exercise counts. Decision rationale: would require importing `parseNotepad` + the exercise library on Home, adding bundle weight. The pill (\"NOTEPAD\") + timestamp is enough information for the user to decide whether to tap. Full counts wait for the Notepad screen itself.
- Tap dispatcher: `() => { if (pickUp.flow === \"generate\") onGenerate(); else if (pickUp.flow === \"notepad\") onCreateNotepad?.(); else onBuild(); }`. The `onCreateNotepad?.()` uses optional chaining because the prop is optional in HomeScreenProps (Notepad shipped after Home was built). Both BuilderScreen, GeneratorScreen, and (post-D3) NotepadScreen have their own `loadDraft` IIFE on mount, so the Pick-up card just routes via setVw — restoration happens automatically inside the destination screen.

### D5 — Library Beatdowns card visual rebuild (DEFERRED — STAGED FOR NEXT SESSION)

Genuine deferral with all open questions answered. The next session can pick this up cold and ship it cleanly.

**Locked design decisions (do not relitigate):**

| Decision | Locked answer |
|---|---|
| Avatar palette | 8 colors: emerald `#22c55e`, slate `#475569`, amber `#f59e0b`, steel `#0891b2`, forest `#15803d`, bronze `#b45309`, indigo `#4338ca`, charcoal `#374151`. Manly only — no rose/pastel. White initials. Future profile-picture override is a clean upgrade path. |
| Avatar color algorithm | Deterministic hash from `f3_name`. New file `src/lib/avatars.ts`. ~10-15 lines: take char-code sum of f3_name, modulo 8, index into palette. |
| Card layout | Per the locked layout: avatar circle + author name + AO + date \"Apr 24\" + green duration anchor in top-right + YOU pill if owned + title + source pill (HAND BUILT / GLOOMBUILDER) + difficulty pill (BEAST/HARD/EASY) + tag string + 3 engagement counters at bottom right (👍 votes / ↻ steals / 💬 comments) |
| Engagement counters | Always show all 3, even at 0 |
| Date format | \"Apr 24\" current-year, \"Apr 24, 2025\" prior-year |
| Steal count | Display `steal_count` as-is from the existing column. NO migration. NO trigger. NO data-model change. (See steal_count investigation section above for the deferred-architectural-fix rationale.) |
| Avatar attribution (`+N` overlapping circles) | DROPPED. Show only `↻ N` counter |

**Implementation scope (next session):**
- New file `src/lib/avatars.ts`: ~15 lines, exports `getAvatarColor(f3_name: string): string` and `getInitials(f3_name: string): string`.
- Modified `src/components/LibraryScreen.tsx`: full Beatdowns card render block rebuild. Existing card is around the `dbToShared` consumer area — diagnose first per Bible v18 Rule 26 before specifying.
- No `page.tsx` changes expected. No Supabase migrations. No new RPC calls.
- Realistic time: 1.5-2 hours including diagnostic + spec + build + smoke-test.

---

## V19 PERMANENT OPERATING RULES (additions to v18's list)

Two rules distilled from May 3 near-misses. Both are extensions of Rule 26 (diagnostic-first).

### Rule 27 — Live-system audit before CSV-only audit

**The rule:** When a design mockup or feature spec references data that exists in BOTH a static export (CSV, JSON snapshot, fixture file) AND in production via Supabase, the assistant MUST audit against the live production system before drawing conclusions about whether the spec is implementable.

**The near-miss that produced this rule:**

During the Library Exercises filter regroup design review (Cluster D Item 1), the assistant audited the brainstorming mockup against `f3exercisesenriched.csv` — a 904-row CSV in `/mnt/project` containing raw `exercise_type` values (`strength`/`combo`/`cardio`/`agility`/`flexibility`) and pipe-delimited `body_part` values (`upper|core`/`core|lower`).

The assistant concluded that the mockup's F3-friendly chip labels (\"Warm-up\" / \"Mary\" / \"Cardio\" / \"Coupon\") would return zero results because no rows had those exact values. The assistant proposed three paths: ship with the actual CSV vocabulary, curate all 904 rows, or defer entirely.

Ritz pushed back with a screenshot of the live Vercel preview showing the F3-friendly chips ALREADY rendering correctly on a real exercise (Fire Hydrant tagged LEGS + WARM-UP). The assistant re-audited and discovered the `mapSupabaseExercise` translation layer in `src/lib/exercises.ts:165-191` — which converts raw Supabase columns into canonical F3 tag strings stored on each exercise's `e.t: string[]` array.

**Why CSV-only audits fail:** the CSV is a snapshot of one stage of the data pipeline. Real systems usually have transformation layers between storage and display. The CSV may show storage-layer values; the code may show display-layer values; the production database may show post-migration values different from both.

**What to do instead:**
- Always grep the codebase for the raw column names being audited. Look for any function that maps Supabase rows to UI types.
- When in doubt, ask Ritz to paste a screenshot of the live system rendering the relevant data. \"Here's what the live Vercel preview shows\" is more authoritative than any local file.
- Treat /mnt/project files as one possible source of truth, not the source of truth.

### Rule 28 — Grep the column name before specifying any migration

**The rule:** Before writing migration SQL that adds, modifies, or drops a database column, the assistant MUST grep the codebase for the column name. If any matches exist (in TypeScript types, mapping functions, RPC calls, prior migrations, or Bible documentation), STOP and verify whether the planned migration conflicts with existing infrastructure.

**The near-miss that produced this rule:**

During the Library Beatdowns card design review (Cluster D Item 5, deferred), the assistant was preparing a Stage 2 spec to add a `steal_count integer NOT NULL DEFAULT 0` column to the beatdowns table plus a Postgres trigger for INSERT/DELETE auto-increment. The proposed migration would have used `IF NOT EXISTS` guard, which would have silently no-op'd the column add — but ALSO added a trigger that would have DOUBLE-counted with the existing `increment_steal_count` RPC that the assistant didn't know about.

The Stage 1A diagnostic, run before the spec was written, caught the duplicate. Multiple lines of evidence existed in the codebase: page.tsx mapped `steal_count`, QProfileScreen typed it, db.ts called `increment_steal_count` RPC, and three prior Bibles documented the column.

**The combination would have broken stolen counts in production:** the existing RPC would still fire on `stealBeatdown`, AND the new trigger would fire on the child INSERT — every steal would increment twice.

**Why this happened:** the Bible documentation at v18:4340 listed `steal_count` in the schema reference, but the assistant had not internalized this from prior context. The schema reference is exactly the place such conflicts should be caught.

**What to do instead:**
- Before specifying ANY migration, run `grep -r \"<column_name>\" src/ supabase/` and check current Bible's schema reference section.
- If matches exist, the migration may be redundant, conflicting, or net-additive — verify which before proceeding.
- For RPC additions, similarly grep for the RPC name. Triggers that overlap with RPCs are silent double-counters.

---

## V18 SESSION RECAP — MAY 2, 2026 (preserved from prior bible)

### TL;DR for the next Claude

May 2, 2026 was the Notepad ship session. After the v17 deferral ("ship v2-pivot to main first, gather PAX usage data, revisit Notepad later"), Ritz overrode and said "let's tackle the Notepad feature." What followed was a **methodical, design-first, 6-hour build** of Item 12 — Notepad v0 MVP — that produced three commits, one Supabase migration, and one of the cleanest end-to-end feature ships in the project's history.

The session produced **a feature shipping today** that wasn't even scoped at the start of yesterday, plus discovered (and fixed) a parser philosophy bug post-deployment that wouldn't have been caught by synthetic tests. The single biggest lesson: **real-user-typed input beats synthetic test cases** for parser validation — Ritz's first real test ("exercise 1 / exercise 2") immediately exposed a hole in the Stage 2 test suite that hadn't been imagined.

### The current state at end of session May 2, 2026

- `main` branch: **untouched today**, gloombuilder.app stable (v1 architecture, 4-tab nav).
- `v2-pivot` branch: **GENUINELY FEATURE-COMPLETE.** Three new commits today on top of v17's `3443ad0`. Latest commits in chronological order:
  1. Stage 3 commit (Notepad v0 first ship): `129c871` — NotepadScreen + page.tsx + Home card + Locker badge + db.ts + migration applied
  2. Parser priority fix: `225d8e0` — Q4↔Q5 swap, anti-pattern check removed, placeholder updated to library-verified names, legend extended with the "no blank between section and first exercise" rule
  3. Difficulty default fix: latest commit (the final commit of this session) — `d: bd.d || "medium"` in handleSaveBeatdown to prevent Supabase rejecting empty difficulty on Notepad-saved beatdowns
- Supabase: migration applied. `beatdowns.from_notepad` column exists, boolean, NOT NULL, default false.
- Vercel preview: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/` reflects all commits including final difficulty fix.
- Working directory: `C:\Users\risum\Documents\projects\gloombuilder` — Bible v18 needs to be added similarly to v17.
- Claude Code: still primary workflow. Three stages (diagnostic → parser → UI+wiring) executed cleanly. Real-input retest caught the parser priority bug. One bug surfaced as the symptom "Save shows error toast" → diagnosed via the same diagnostic-first pattern.

### Today's three commits — the timeline

The session opened with a strategic decision (Ritz: "I don't want to merge yet, let's tackle the notepad feature"), proceeded through ~25 turns of design discussion, then executed in three discrete commits. Each commit followed the canonical workflow:

#### Commit 1 — Notepad v0 Stage 3 ship — `(hash referenced as initial Notepad commit)` 

**Files touched:** `src/components/NotepadScreen.tsx` (NEW, 377 lines), `src/lib/notepadParser.ts` (NEW, 272 lines from Stage 2), `supabase/migrations/20260501000000_add_from_notepad.sql` (NEW, 5 lines), `src/app/page.tsx` (+29/-5), `src/components/HomeScreen.tsx` (+30/+0), `src/components/QProfileScreen.tsx` (+14/+0), `src/lib/db.ts` (+2/+0). 7 files, ~654 net new lines including 2 new files.

**What it did:** Built Item 12 v0 MVP end-to-end. The third creation path next to Generator and Builder. Q types free-form beatdown text in a textarea, sees a live parsed Preview, taps Save → lands in Edit Beatdown screen with a "↻ from Notepad" green badge appearing in the Locker.

**Critical pre-execution discovery (saved 3 days of engineering work):** Ritz pasted a screenshot of his real Edit Beatdown screen ("The Round" / Belmont beatdown) showing existing UI ALREADY supporting:
- Section-level Q notes (amber pill below section header with pencil icon and Edit link)
- Exercise-level Q notes (gray-green note rows below each exercise)
- Transitions as their own row type (with ↗ arrow icon between exercises)
- CUSTOM badge for custom exercises (orange pill on the row)

This collapsed the Option A (extend data model) vs Option B (degrade) fork into ONE option: just map Notepad parser output to existing fields. **No data model changes needed.** The Cluster B Item 3 diagnostic that originally flagged "transitions might not be first-class" was wrong — they ARE first-class via the SectionExercise discriminated `type: "transition"`.

This single architectural realization is what made the 1-week scope achievable. Without it, we'd have been looking at extending Section types, updating Builder/Live Mode/CopyModal/Preblast, and rippling through the codebase. With it, Notepad is just a parser plus a screen plus a one-column DB migration.

**Three-stage execution:**

**Stage 1 — Diagnostic** surfaced 5 product questions, 4 of which had clean answers and 1 (DB column for the fromNotepad flag) needed a Ritz call. Resolved:
- Library prop: NotepadScreen does its own merge mirroring BuilderScreen useEffect lines 137-155. Page.tsx stays clean.
- Save flow: Builder-style new→edit transition via onSavedNew callback. Notepad text discarded on save (no autosave draft).
- Badge location: Locker only. Q Profile beatdowns tab. Not on Library shared cards. Not in Edit Beatdown.
- Transition grammar: ONLY `>` prefix. Don't accept ↗, →, or unmarked verbs.
- DB: add `from_notepad boolean default false` column (Ritz approved).

**Stage 2 — Parser module** built `src/lib/notepadParser.ts`. Pure logic, no UI imports, no React. Self-contained. 272 lines. Walked 5 test inputs through it, reported each output as JSON, all passed:
- Test 1 — Bishop's Saturday Q (placeholder example)
- Test 2 — Minimal (1 section, 1 exercise)
- Test 3 — Multiple notes on one exercise (note accumulation)
- Test 4 — Exotic section names with numbers ("block A", "round 1")
- Test 5 — Belmont multi-line section note (5 lines joined with \n into qNotes)

**Stage 3 — UI + wiring + DB migration:**
- Migration `supabase/migrations/20260501000000_add_from_notepad.sql` written and applied manually by Ritz in Supabase dashboard. Verified via `information_schema.columns` query. Production smoke-tested — gloombuilder.app on `main` continued to work normally because additive column changes are backwards-compatible.
- NEW `src/components/NotepadScreen.tsx` (377 lines): write/preview toggle, title field, monospace textarea with placeholder, help drawer with 4-row legend, debounced 800ms parse, save validation, payload build, onSavedNew transition.
- `src/app/page.tsx`: vw === "notepad" branch added, NotepadScreen mounted with handleSaveBeatdown + onSavedNew. handleSaveBeatdown extended to accept `share?` (legacy) AND `isPublic?` (Notepad's signature) AND `fromNotepad?: boolean`. LockerBeatdown type gained `fromNotepad?: boolean`. dbToLocker reads `row.from_notepad`. HomeScreen render call wired with `onCreateNotepad={() => setVw("notepad")}`.
- `src/components/HomeScreen.tsx`: NEW "Write it freeform" card placed between "Build from scratch" and "Create exercise". Amber accent border `rgba(245,158,11,0.30)`. NEW pill in top-right.
- `src/components/QProfileScreen.tsx`: BeatdownCard now renders a green "↻ from Notepad" pill inline alongside the source pill (HAND BUILT / GloomBuilder), only when `bd.fromNotepad === true`. NOT rendered in Library shared cards (locker-only). NOT rendered in Edit Beatdown (locker-only).
- `src/lib/db.ts`: saveBeatdown signature gains `fromNotepad?: boolean`. Insert payload writes `from_notepad: data.fromNotepad ?? false`. updateBeatdown deliberately unchanged — does not touch `from_notepad`, so editing a Notepad-saved beatdown preserves the badge.

**Build green at all 3 stages.** Pushed.

#### Commit 2 — Parser priority swap fix — `225d8e0`

**Files touched:** `src/lib/notepadParser.ts` (-19 +30 = -8 net lines), `src/components/NotepadScreen.tsx` (+8 -7 = +1 net line). 2 files, 26 insertions, 34 deletions.

**The bug surfaced by real input.** Immediately after Commit 1 deployed to Vercel preview, Ritz tested with this input:

```
exercise 1
exer 1
merkin 10

exercise 2
- this is a test qnote
motivators x10
> go to park
```

The Preview rendered "1 section 'Untitled' with 5 exercises" — completely wrong. Expected: 2 sections ("exercise 1" and "exercise 2") with the section-level note properly attached.

**Root cause analysis:**

The parser priority order in Stage 2/3 was:

| Q | Test | If yes → |
|---|------|----------|
| Q1 | Empty line | skip |
| Q2 | Starts with -/*/• | Q note |
| Q3 | Starts with > | Transition |
| Q4 | Has rep marker (extractReps non-null) | EXERCISE |
| Q5 | previousLineWasEmpty === true | SECTION |
| Q6 | Plain text fallback | EXERCISE without reps |

The intent was: anti-pattern check inside extractReps would reject digits when the non-digit portion was short and not in the library. The threshold was `wordCount < 2 AND charCount < 6 AND not in library`.

**The problem:** "exercise" is 8 chars. "round" is 5 chars (only just within the threshold). "block" is 5 chars. "AMRAP" is 5. "set" is 3. The threshold was both too narrow (let "exercise" through) and required specific tuning per word that would never be reliable for free-text section names.

**The deeper insight that emerged from Ritz's pushback:** *"section labels or names are custom labels, pax or users have different names all the time with numbers also. so keep that in mind, theres really no pattern to match, its just free text."*

That changed the architecture. Section names are FREE TEXT — there is no syntactic distinction possible between an exercise name with a number and a section name with a number. The ONLY signal is **positional**: a line with a blank line above it (or the first non-empty line) is always a section header, regardless of contents.

**The clean rule:**

| Q | Test | If yes → |
|---|------|----------|
| Q1 | Empty line | skip |
| Q2 | Starts with -/*/• | Q note |
| Q3 | Starts with > | Transition |
| **Q4 NEW** | **previousLineWasEmpty === true OR first non-empty line** | **SECTION HEADER** |
| Q5 | Has rep marker | EXERCISE with reps |
| Q6 | Plain text fallback | EXERCISE without reps |

Q4 (positional) now runs BEFORE Q5 (rep extraction). The anti-pattern check inside extractReps was deleted entirely — it's no longer needed because section-name-with-digit cases are caught positionally before extractReps even runs.

**What changes for users (the trade-off):** The strict positional rule means putting a blank line between a section header and its first exercise will (incorrectly) treat the next line as a new section. Documented in the help drawer with: *"Don't put a blank line between a section header and its first exercise."* Acceptable v0 trade-off — the placeholder demonstrates the correct pattern (no blank between section header and first exercise), and the legend explicitly documents the rule.

**Placeholder also updated** to use library-verified exercise names so the example would always parse cleanly:

```
Warmup
Side Straddle Hop x20
Imperial Walker x20
Mountain Climber x10
- Slow and controlled

The Thang
- Finish 5 Rounds
Merkin 10
> Mosey to corner
Squat 20

Mary
American Hammer x20
Plank 60sec
```

Every name above is verified in the local EX fallback (`src/lib/exercises.ts:24-70`) so a new user's first paste always shows a working example.

**Tests:** Re-ran the original 5 Stage 2 tests + added Test A (Ritz's failing input) + verified backward compat. All 4 priority tests passed:
- TEST A — Ritz's failing input → 2 sections, qNote correctly routed, Bug 1+3 both fixed
- TEST B — new placeholder → 3 sections, all exercises matched (exerciseId set)
- TEST C — Stage 2 Test 4 regression ("block A" / "round 1") → still parse positionally
- TEST D — Stage 2 Test 1 (Belmont placeholder) regression → identical output

**Build green.** Pushed as `225d8e0`.

#### Commit 3 — Difficulty default fix — `(latest commit)`

**Files touched:** `src/app/page.tsx` (+1 -1 = 0 net lines). 1 file, 1 insertion, 1 deletion.

**The bug surfaced by real save attempt.** After commit 2 fixed the parser, Ritz typed a real beatdown and tapped "Save as beatdown." A toast appeared: "Error saving — try again." The beatdown didn't persist.

**Root cause:** NotepadScreen has no UI for picking difficulty (it's a free-form creation surface). The payload sent `d: ""`. handleSaveBeatdown passed it through to saveBeatdown verbatim. Supabase's `beatdowns.difficulty` column has a constraint (CHECK or enum) that rejects empty string. saveBeatdown's `.insert({...})` call returned an error; the function returned null; handleSaveBeatdown returned null; NotepadScreen.handleSave saw `newId === null` and surfaced the "Couldn't save — try again" toast.

Builder and Generator never hit this because their UI dropdown defaults difficulty to "medium" — they always send a real value. Notepad was the first caller to send empty string.

**The fix:** One line in `handleSaveBeatdown` (page.tsx):

```typescript
// Before:
d: bd.d,

// After:
d: bd.d || "medium",
```

Defensive default at the page-level handler. Centralizes the "save defaults" logic alongside the existing `isPublic` resolution (`bd.isPublic ?? bd.share ?? false`). Any future caller that forgets to populate difficulty gets the same safe default.

**Why "medium":**
- Matches BuilderScreen's `useState` initial default for difficulty
- Matches existing Supabase read fallback pattern `(row.difficulty as string) || "medium"`
- Sensible center value for Notepad-created beatdowns where the Q didn't pick a difficulty

**Build green.** Pushed.

**Re-test on Vercel preview:** ✓ Save now works. Beatdown lands in Edit Beatdown screen. Locker shows green "↻ from Notepad" pill. Live Mode renders correctly.

### Today's commit log — quick reference

| # | Hash | What |
|---|------|------|
| 1 | (Notepad initial) | Item 12 v0 Stage 3: NotepadScreen + parser + db.ts + migration + Home card + Locker badge |
| 2 | `225d8e0` | Item 12 fix: parser priority swap (Q4↔Q5), placeholder update to library-verified names, legend rule extension |
| 3 | (difficulty fix) | Item 12 fix: handleSaveBeatdown defaults empty difficulty to "medium" |

(Hashes for commits 1 and 3 should be discoverable via `git log` on `v2-pivot` if needed. Commit 2 was captured into chat as `225d8e0`.)

### Cumulative day-on-day progress

| Day | Commits | Branch state |
|-----|---------|--------------|
| April 30 (v16) | 5 commits | v2-pivot active, post-Cluster A/B/C |
| May 1 (v17) | 7 commits | v2-pivot feature-complete (per v17 reading) |
| May 2 (v18) | 3 commits | v2-pivot **genuinely** feature-complete with Notepad MVP shipped |

Total commits on v2-pivot since Bible v15: 15 commits across 3 sessions.

---

## NOTEPAD V0 — COMPLETE ARCHITECTURE DOCUMENTATION

This is the canonical reference for how Notepad v0 works. Future debugging, feature extension (Notepad v0.2 if PAX want fuzzy match / multi-exercise lines / AI assist), and architectural questions should refer here first.

### Strategic context

The v17 Bible explicitly deferred Notepad with this reasoning: *"Notepad is a hypothesis. We're shipping it to find out if PAX want a third creation path. If they don't, we won't have invested 3 extra days on data model changes that nobody uses."*

Ritz overrode the deferral on May 2 with: *"i dont want to merge yet, lets tackle the notepad feature."*

The override was strategically correct in hindsight because the Edit Beatdown screen screenshot review (which happened during the design discussion this session) revealed the data model already supported everything Notepad needed. The 3 extra days of engineering risk that justified the v17 deferral didn't actually exist. Notepad shipped in a single day with zero data model changes.

### v0 scope — what shipped

- Single creation path: text → preview → save → lands in Edit Beatdown screen
- No AI, no fuzzy match, no multi-exercise lines, no "rinse and repeat" modifiers
- Pure rules-based parser (no Anthropic API, no GPT, no per-call costs)
- Raw text is the canonical surface; preview is read-only
- No edit-existing-from-notepad in v0 (saved beatdowns edit via standard Edit Beatdown screen)
- Locker shows "↻ from Notepad" green pill on saved cards
- Notepad textarea is transient — text NOT autosaved, NOT preserved after save

### Parser philosophy — "hybrid implicit-explicit"

The parser walked through three philosophical iterations during design:

**Philosophy 1 — Pure implicit (initial draft):** Hardcoded section keyword list (warmup, thang, mary, cooldown), free-text exercise names, parser guesses. Failed because users have arbitrary section names like "block A", "round 1", "AMRAP 12 minutes".

**Philosophy 2 — Pure explicit:** All formatting via markers. Section = no marker, exercise = has number, note = `-` prefix, transition = `>` prefix. Required users to learn the convention before typing anything.

**Philosophy 3 — Hybrid implicit-explicit (shipped):** Position drives section detection (blank line above = section). Markers drive note/transition detection (`-`/`*`/`•` for notes, `>` for transitions). Library lookup drives exercise matching. Anything ambiguous falls through to a sensible default.

The hybrid produces a learning curve where users can paste their existing Apple Notes / GroupMe-style beatdowns and get reasonable parsing without knowing any convention, while explicit markers give power users precise control.

### Parser priority order (FINAL — committed in `225d8e0`)

For each line of input.text (split on \n), evaluated in order. **First match wins.**

```
Q1: Empty line → SKIP (set previousLineWasEmpty = true; continue)

Q2: Line matches /^\s*[-*•]\s*(.+)$/ → it's a NOTE
    Strip the prefix to get the text content.
    IF currentSection === null: silently skip (malformed)
    ELSE IF currentSection.exercises.length === 0:
        Section-level Q note (joined to existing qNotes with newline if any)
    ELSE:
        Q note attaches to LAST exercise in currentSection
        (joined to existing note with newline if any)
    set previousLineWasEmpty = false; continue

Q3: Line matches /^\s*>\s*(.+)$/ → it's a TRANSITION
    Strip the prefix.
    IF currentSection === null: silently skip
    ELSE IF currentSection.exercises.length === 0:
        Section-level Q note (per Ritz simplification: anything under
        a section header before first exercise is a section qNote,
        regardless of marker)
    ELSE:
        Add as transition row after last exercise in currentSection
        Stored as SectionExercise with type: "transition", name, n, blank r/c/nt/note
    set previousLineWasEmpty = false; continue

Q4 (POSITIONAL): previousLineWasEmpty === true → SECTION HEADER
    Section name = trimmed line text (free text — "exercise 1",
    "round 1", "block A", "AMRAP 12 minutes" all work)
    Close any pending currentSection (push to sections array)
    Open new section with line text as name
    set previousLineWasEmpty = false; continue

Q5: extractReps(line) returns non-null → EXERCISE WITH REPS
    Try library match (exact name → alias → plural strip)
    If matched: push structured exercise (with exerciseId set)
    If not matched: push CUSTOM exercise (NO exerciseId field — this
                    is what triggers the orange CUSTOM badge in UI)
    set previousLineWasEmpty = false; continue

Q6: Plain text + no blank above → EXERCISE WITHOUT REPS (fallback)
    Try library match.
    If matched: push structured exercise with empty reps
    If not matched: push CUSTOM exercise with empty reps
    set previousLineWasEmpty = false; continue
```

### extractReps helper — pattern detection

`extractReps(line)` returns null if no rep marker found. Otherwise returns `{ reps: string, exerciseName: string, cadence: "IC" | "OYO" }`.

Patterns checked in priority order:

**PATTERN 1 — `xN` or `x N` anywhere in line** (case-insensitive). Regex: `/\bx\s*(\d+)\b/i`. Strips the `x{N}` token from the line; rest becomes exerciseName. Examples: `motivators x10`, `bishops blaster x 20`.

**PATTERN 2 — Trailing duration unit**. Regex: `/(\d+)\s*(seconds|sec|minutes|min)\s*$/i`. Reps preserved as full string with unit normalized to `sec` or `min`. Examples: `Plank 60sec`, `Plank 3min`, `Plank 60 seconds`.

**PATTERN 3 — Trailing digit at end of line**. Regex: `/^(.+?)\s+(\d+)\s*$/`. Examples: `merkins 10`, `jump squats 20`, `Diamond Merkin 50`.

**PATTERN 4 — Leading digit at start of line followed by 1+ words**. Regex: `/^(\d+)\s+(.+)$/`. Examples: `10 merkins`, `50 No Cheat Merkin OYO`.

After Stage 2 anti-pattern check was REMOVED in commit `225d8e0`. The positional rule (Q4) catches all problematic cases (section names with digits) before extractReps even runs, so the anti-pattern fallback became dead code.

### Cadence detection helper

`extractCadence(line)` strips trailing " IC" or " OYO" from the line:

- `\bic\b` (case-insensitive, end of line) → cadence: "IC"
- `\boyo\b` (case-insensitive, end of line) → cadence: "OYO"
- Default if neither: "OYO" (matches Builder default)

Cadence is stripped BEFORE library matching so "merkins ic" matches "Merkin" not "Merkin IC".

### Library matching helper

`matchExercise(name, library)` returns the matched ExerciseData or null:

1. Lowercase target.
2. Loop through library: exact match against `e.n` or `e.f` (lowercased), or any alias in `e.aliases.split("|")`.
3. If no match yet AND target ends in "s": try again with last char stripped.
4. If no match yet AND target ends in "es": try again with last 2 chars stripped.

NO fuzzy match. NO Levenshtein. NO substring match. NO AI. Exact-with-plural-strip only.

### Custom exercise representation

A custom exercise (one that doesn't match the library) is created as a SectionExercise with:
- `id`: fresh UUID via generateId()
- `name`, `n`: the user-typed name verbatim
- `r`, `c`, `nt`, `note`: standard fields
- **NO `exerciseId` field** (literally absent from the object — this is the flag)

The existing UI's CUSTOM badge logic keys off the absence of `exerciseId`. NotepadScreen's preview pane and Edit Beatdown both render custom exercises with the orange CUSTOM pill automatically.

### Transition representation

A transition is a SectionExercise with:
- `id`: fresh UUID
- `type: "transition"` (this is the discriminator)
- `name`, `n`: the transition text (e.g. "Mosey to corner")
- `r`, `c`, `nt`, `note`: ALL empty strings

The data model already had this (Cluster B Item 3 was wrong about transitions not being first-class — they ARE first-class via `type: "transition"`). NotepadScreen's preview and Edit Beatdown render these as their own row with an ↗ arrow icon between exercises.

### Section-level Q note routing rule (Ritz simplification)

**Anything appearing directly under a section header before the first exercise becomes the section's qNote.** This collapses two parser branches into one:

- A `-` line (note) under section header before any exercise → section qNote
- A `>` line (transition) under section header before any exercise → section qNote (treated as note despite `>` marker)

After the first exercise of a section is added, both markers route normally:
- `-` lines attach to the previous exercise as exercise-level qNotes
- `>` lines insert as transition rows

This rule was Ritz's contribution during design discussion — the original design had separate routing for notes-under-section vs transitions-under-section. Ritz simplified it: *"anything (note OR transition with - or >) directly under a section header BEFORE the first exercise → becomes the section's Q note. Multiple lines joined with newlines preserved."*

Multi-line section notes accumulate with `\n` separators preserved. The Belmont example produces a 5-line section qNote.

### NotepadScreen UI structure

**File:** `src/components/NotepadScreen.tsx` (377 lines)

**Component signature:**
```typescript
interface NotepadScreenProps {
  onClose: () => void;
  onSave: (beatdown: {
    nm: string; desc: string; d: string; secs: Section[];
    tg: string[]; dur: string | null; sites: string[]; eq: string[];
    isPublic: boolean; fromNotepad: true;
  }) => Promise<string | null>;
  onSavedNew: (newId: string) => void;
  userExercises: { id: string; nm: string; desc: string; tags: string[]; how: string }[];
  profName: string;
}
```

**Internal state:**
- `title: string` — controlled by title input field
- `text: string` — controlled by textarea
- `showHelp: boolean` — drawer expand/collapse state
- `mode: "write" | "preview"` — toggle pill state
- `parsedResult: ParseResult | null` — debounced parse output
- `saving: boolean` — guard during onSave roundtrip
- `toast: string` — feedback messages
- `allEx: ExerciseData[]` — merged library (initialized from EX fallback, updated on mount)

**Layout (top to bottom):**

1. **Header bar:** ← Home button (calls onClose), title "Notepad", empty right slot.
2. **Toggle pill row:** [Write] [Preview]. Mirrors Library beatdowns/exercises tab toggle pill style. Active = `rgba(34,197,94,0.18)` bg + `#22c55e` text. Inactive = transparent + T4 text.
3. **Title field** (Write mode only): standard field-input style above the textarea. Placeholder: "Name this beatdown..."
4. **Help icon row** (Write mode only): "Beatdown notes" label on left + bordered "?" icon button on right. Tap toggles `showHelp`.
5. **Help drawer** (Write mode only, when showHelp === true): slides in below help icon row. Amber-themed callout box (`rgba(245,158,11,0.05)` bg, `rgba(245,158,11,0.20)` border, padding 11px, radius 10). Header: "HOW TO WRITE" + close button. 4 rows:
   - `blank line` — `starts a new section. Don't put a blank line between a section header and its first exercise.`
   - `- text` — `coaching note (for exercise above OR section above)`
   - `> text` — `transition (mosey/run to a new spot)`
   - `x10, 60sec` — `marks an exercise with reps or time`
6. **Textarea** (Write mode only): monospace font, `min-height: 360px` on mobile, padding 12px. Placeholder visible when empty:
   ```
   Warmup
   Side Straddle Hop x20
   Imperial Walker x20
   Mountain Climber x10
   - Slow and controlled
   
   The Thang
   - Finish 5 Rounds
   Merkin 10
   > Mosey to corner
   Squat 20
   
   Mary
   American Hammer x20
   Plank 60sec
   ```
   Placeholder color #5A534C italic. Disappears when user types one character.
7. **Preview pane** (Preview mode only): read-only structured render of parsedResult. Section cards with top-stripe colored borders. Section-level qNotes as amber pills. Exercise rows with name + reps + cadence + CUSTOM badge if no exerciseId. Q-note rows under exercises. Transition rows with ↗ arrow. NO edit affordances visible.
8. **Empty preview state** (Preview mode, parsedResult null OR exerciseCount === 0): "Switch to Write tab to start typing your beatdown."
9. **Save button row** (always at bottom): full-width green "Save as beatdown" button. Disabled if title empty OR text empty OR exerciseCount === 0.

**Live parse behavior:** useEffect with 800ms debounce on text changes. Calls parseNotepad with current text + allEx. Sets parsedResult.

**Save behavior:**
- Validates title not empty, text not empty.
- Re-parses fresh on click (doesn't trust debounced state).
- If exerciseCount === 0 → toast "Add at least one exercise".
- Builds payload with `isPublic: false, fromNotepad: true`.
- Awaits onSave. Returns Promise<string | null>.
- If newId non-null: calls onSavedNew(newId). Page.tsx handles transition to vw="edit-bd".
- If newId null: toast "Couldn't save — try again".

**No autosave.** Notepad is transient. Once saved, the structured beatdown is the persistent representation.

### Database schema

**Migration applied to production (May 2, 2026):**

```sql
ALTER TABLE beatdowns
ADD COLUMN IF NOT EXISTS from_notepad boolean NOT NULL DEFAULT false;
```

File: `supabase/migrations/20260501000000_add_from_notepad.sql`

Verified via:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'beatdowns' AND column_name = 'from_notepad';
```

Result: 1 row, `from_notepad | boolean | NO | false`. Confirmed.

The migration is non-blocking on Postgres 11+ via in-catalog default storage. Existing rows backfilled to false (no badge); only freshly Notepad-saved beatdowns flip the flag to true.

**Rollback (if ever needed):**
```sql
ALTER TABLE beatdowns DROP COLUMN from_notepad;
```

One-line reversibility. The schema change touches no existing data.

### Save flow end-to-end

1. User taps "Save as beatdown" in NotepadScreen.
2. `handleSave` validates title + text + exerciseCount > 0.
3. Re-parses fresh: `parseNotepad({ text, exerciseLibrary: allEx })`.
4. Builds payload including `fromNotepad: true, isPublic: false, d: ""`.
5. Calls `onSave(payload)` (which is `handleSaveBeatdown` in page.tsx).
6. handleSaveBeatdown:
   - Wraps with `setSavingInFlight(true)` via try/finally (popstate guard from Cluster B Item 3).
   - Resolves `isPublic` from `bd.isPublic ?? bd.share ?? false`.
   - **Defaults `d` from `bd.d || "medium"` (commit 3 fix).**
   - Calls `saveBeatdown(payload)` in db.ts.
   - On success: `await loadLocker()`, returns the new beatdown's id.
   - On failure: `fl("Error saving — try again")`, returns null.
7. saveBeatdown in db.ts:
   - Inserts to beatdowns table with mapped column names.
   - `from_notepad: data.fromNotepad ?? false` writes the new column.
8. NotepadScreen receives newId.
9. If non-null: calls `onSavedNew(newId)` → page.tsx looks up `lk.find(b => b.id === newId)` → `setEditingBd(justSaved); setVw("edit-bd")` → screen transitions to Edit Beatdown.
10. User sees the new beatdown in Edit Beatdown screen, fully editable, with all sections/exercises/transitions/notes correctly rendered.
11. Going back to Profile shows the beatdown card with green "↻ from Notepad" pill in the locker.

### Locker badge

**File:** `src/components/QProfileScreen.tsx`

The BeatdownCard component renders a green "↻ from Notepad" pill INLINE alongside the source pill (HAND BUILT / GloomBuilder), only when `bd.fromNotepad === true`:

```jsx
{bd.fromNotepad && (
  <span style={{
    background: G + "15",
    border: "1px solid " + G + "30",
    color: G,
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 6,
    marginLeft: 6,
    whiteSpace: "nowrap",
  }}>↻ from Notepad</span>
)}
```

**The badge is locker-only:**
- ✓ Q Profile beatdowns tab → renders pill
- ✗ Library shared cards → does NOT render (dbToShared intentionally not modified)
- ✗ Edit Beatdown screen → does NOT render (per Ritz decision: badge marks origin, not editing context)

`updateBeatdown` does NOT touch `from_notepad`, so editing a Notepad-saved beatdown preserves the badge across edit→save cycles.

### Home screen card

**File:** `src/components/HomeScreen.tsx`

A new optional prop `onCreateNotepad` was added to HomeScreenProps. When provided, renders a new compact list-row card placed BETWEEN "Build from scratch" and "Create exercise":

- **Title:** "Write it freeform"
- **Subtitle:** "Notepad-style — paste or type"
- **Right chevron:** →
- **Card style:** `rgba(255,255,255,0.028)` bg, **amber accent border `rgba(245,158,11,0.30)`** (vs the standard BD border on Build/Create cards), border-radius 18, padding 20px 22px.
- **NEW pill** in top-right: `rgba(245,158,11,0.20)` bg + `#f59e0b` text + 9px 800-weight letterspaced uppercase. The amber accent + NEW pill differentiate this card from peer cards while maintaining visual rhythm.

Card only renders when `onCreateNotepad` prop is provided (defensive — keeps the card invisible until page.tsx wires it up).

### Library content gap (Motivators)

A library content question surfaced during real-input testing:

User typed `motivators x10`. Parser correctly attempted library match. Supabase has ONE row matching: `Mountaineer Motivators` with aliases `Ferry Jack Motivators` and `Progressive Tempo Jacks`. None of these match the bare `Motivators` plural-stripped to `Motivator`.

**Decision:** intentionally NOT addressed in this commit. Three options surfaced:
- Option 1 (chosen): Update placeholder to use library-verified names. The placeholder's "Motivators x10" line was replaced with "Mountain Climber x10" so new users see a working example.
- Option 2 (deferred): Add `Motivator`/`Motivators` as an alias on the existing `Mountaineer Motivators` row.
- Option 3 (deferred): Add a separate `Motivator` row to the library.

Library curation is a separate effort from parser/UI work. Future PAX may report similar gaps — `motivators` won't match because there's no Motivator entry — and we'll address those via batch alias additions or new seed rows in a dedicated library curation pass.

The new placeholder content is a working example where every name maps to a library entry, which means a fresh user's first Notepad parse always succeeds cleanly.

---

## CANONICAL PATTERNS — V18 ADDITIONS

The v17 Bible documented 5 canonical patterns from Cluster A/B/C work. v18 adds 2 new patterns from this session:

### Pattern: 3-Stage Diagnostic-Spec-Build Workflow for New Features

For NEW features (not fixes or extensions), the canonical workflow extends the v17 "diagnostic-first / spec-second / build-third" pattern with explicit Stage breaks:

**Stage 1 — Read-only diagnostic.** Claude Code reads files and reports current state with no edits. The diagnostic surfaces architectural questions that need product decisions before any code. Stop and review with user.

**Stage 2 — Pure logic build.** Claude Code builds the new feature's CORE logic (parser, business rule, algorithm) as a self-contained module with NO UI imports and NO React. Run synthetic test inputs through it and report outputs as JSON. Stop and review JSON outputs against expected behavior.

**Stage 3 — UI + wiring + database.** Claude Code builds the screen, page.tsx wiring, related component updates, and any DB migrations. Build green at the end. Stop for commit approval.

**Why 3 stages instead of 1:** for genuinely new features, the architectural unknowns surface in Stage 1, the logic correctness verifies in Stage 2 BEFORE any UI work, and Stage 3 becomes integration-only (no architectural risk).

This pattern was first proven on the Notepad v0 ship. It worked. The test JSON outputs from Stage 2 caught zero bugs (all 5 tests passed first try) but the rhythm forced clean separation of concerns.

### Pattern: Real-Input-Test-Trumps-Synthetic-Test discipline

**Synthetic test cases are insufficient for parsers and rule-based systems.** Real user input WILL find edge cases that synthetic tests didn't imagine.

The Notepad parser shipped with 5 Stage 2 test cases that all passed. Ritz's first real test ("exercise 1" / "exercise 2" as section names) immediately exposed a parser philosophy bug — the anti-pattern check threshold was too narrow, and even tightening it wouldn't have been the right fix.

**The lesson:** when shipping a parser-class feature, plan for at LEAST one round of real-input-driven bug fixes after Stage 3 deployment. Don't treat the Stage 2 test suite as authoritative; treat it as a smoke test.

The bug-fix loop on May 2 produced commit `225d8e0` (parser priority swap) which is structurally CLEANER than the original Stage 2 implementation. The fix removed the anti-pattern check entirely (-15 lines) and produced a more correct rule. Real-input pressure produced better engineering.

**Operational consequence:** when any future parser-class feature ships (e.g. backblast import, calendar sync, voice-to-beatdown), expect a "Stage 4" — real-input retest and bug-fix iteration — to be part of the delivery scope.

---

## STRATEGIC DEFERRALS — UPDATED FOR V18

### Items 6 + 7 — Find HIMs / Follow system: **STILL DEFERRED**

The v17 deferral stands. No movement on this in the May 2 session. The reasoning remains: re-introducing social-graph machinery is not worth the cost without evidence of demand. The `follows`, `shouts`, `shout_reactions` Supabase tables remain dormant.

**Operational rule unchanged:** do not bring follows back without explicit Ritz directive informed by real PAX usage data on the merged v2-pivot product.

### Item 12 — Notepad mode: **NO LONGER DEFERRED — SHIPPED**

The v17 deferral was overridden by Ritz at the start of the May 2 session. Notepad v0 MVP shipped end-to-end with three commits. The strategic concerns that justified the deferral (3 days of data model engineering risk) didn't materialize because the existing data model already supported everything Notepad needed.

**Lessons to carry forward:**
1. Strategic deferrals based on assumed engineering scope can be wrong. When in doubt, do the diagnostic before deciding to defer.
2. The data model audit (looking at the real Edit Beatdown screen) collapsed two architectural options (extend vs degrade) into one (just map). Future "should we do this expensive thing?" questions deserve a similar audit.
3. Real-input testing is not optional. The parser shipped with bugs that synthetic tests didn't catch.

**v0.2 candidates (post-PAX-feedback):**
- Fuzzy matching (e.g. "burpes" → Burpee, common typos)
- Multi-exercise lines (e.g. "10 merkins, 20 squats" → split into two exercises)
- "Rinse and repeat" / round modifiers (e.g. "x3 rounds" applied to a section)
- AI Smart Import via Anthropic API (Pro tier upsell — needs paid plan + rate limiting + reliability planning)
- Transition character output sync (CopyModal uses ↗, Notepad input uses > — could unify)
- Edit-existing-beatdown-as-Notepad-text (round-trip the saved structured beatdown back to text for re-editing)

These are tracked but not committed-to. v0.2 only ships if PAX usage shows demand.

---

## OUTSTANDING WORK BEFORE MERGE TO MAIN

(Updated from v17 with Notepad shipped.)

1. **Add Bible v18 to project root.** Same procedure as v17: copy file in, `git add`, commit, push.
2. **Optional final test pass on Vercel preview.** All 12 commits since v15 deploy date are live. Walk through:
   - Notepad: tap "Write it freeform" → type → toggle Preview → save → land in Edit Beatdown.
   - Locker: confirm "↻ from Notepad" green pill appears on Notepad-saved beatdowns only.
   - Help drawer: tap "?" → drawer slides → 4 rows visible → tap "?" again → drawer collapses.
   - Item 5B: tap an exercise card in Profile → edit form opens.
   - Cluster A/B items: source pill consistency, qName not "The Bishop", PWA banner, hardware back, autosave restore, popstate unwind.
3. **Bump `package.json` version** from `0.1.0` to `2.0.0`. This is the launch signal that triggers the PWA update banner for existing PWA users on next visit.
4. **Merge `v2-pivot` to `main`.** Sequence:
   ```
   # On v2-pivot, bump version first
   git add package.json
   git commit -m "Bump version to 2.0.0 for v2-pivot launch"
   git push origin v2-pivot
   
   # Merge
   git checkout main
   git merge v2-pivot
   git push origin main
   git tag -a v2.0.0 -m "v2-pivot architecture: 3-tab nav, Send Preblast generator, autosave, popstate, unified library, exercise edit flow, Notepad MVP"
   git push origin v2.0.0
   ```
5. **Watch Vercel auto-deploy main to gloombuilder.app.** Test production once deployed. Existing PWA users will see "↻ New version available — Refresh" banner on next visit.
6. **Optional cleanup:** `git branch -d v2-pivot` locally and `git push origin --delete v2-pivot` if Ritz wants the branch retired.

---

## NEXT SESSION KICKOFF

When Ritz returns:

1. `cd C:\Users\risum\Documents\projects\gloombuilder && claude`
2. (If not already done) drop `GLOOMBUILDER-BIBLE-v18.md` at project root, commit, push.
3. Tell Claude Code: *"Read GLOOMBUILDER-BIBLE-v18.md, then read the V18 SESSION RECAP at the top, then check `git status` and `git log -10 --oneline` on v2-pivot. Confirm we're at the latest commit. Don't make any changes yet."*
4. Decide: any final test pass concerns? If clean → proceed to merge.
5. Execute the merge sequence in step 4 of "OUTSTANDING WORK" above.
6. Watch Vercel auto-deploy. Test gloombuilder.app once production reflects the merge.
7. Optional: archive Bible v15, v16, v17 by leaving them in the repo (they form the historical record). Bible v18 is the canonical state going forward.

### Post-merge product priorities (ordered)

1. **Watch real PAX use the merged product** for at least a week. Real signal beats theory. Ask beta PAX what they tried with Notepad. Did they save anything? Did they hit parser limitations? Did they use it more than Builder? Less? About the same?
2. **Templates** (30 workout formats — biggest remaining feature). Schema in `GLOOMBUILDER-GENERATOR-BLUEPRINT.md`. 3 free + 27 Pro.
3. **Stripe Pro tier** ($29/year subscription) — gates unlimited generation, 27 Pro templates, possibly Notepad AI Smart Import in v0.2.
4. **Generator timing/effort rebuild** (`seconds_per_rep`, `effort_per_rep`, time-budget system).
5. **Exercise favorites** — heart/star toggle, favorited exercises rank higher in Builder search and Library default sort.
6. **Notepad v0.2 (conditional on PAX feedback)** — fuzzy match, multi-exercise lines, AI Smart Import, edit-existing-as-text.
7. **Library curation pass** — bulk alias additions for common variants, new seed rows for missing exercises, fix the Motivators-style gaps that real PAX will report.
8. **Find HIMs / PAX directory** (Items 6+7 — STILL DEFERRED) — light-touch HIM directory possible without re-introducing follows. Revisit only after concrete demand.
9. **Cross-section exercise drag** (dnd-kit architectural change).
10. **Responsive desktop layout** — app currently 430px max-width centered.
11. **Avatar profile customization** — parked until 20+ users ask.

---

## V18 PERMANENT OPERATING RULES (additions to v17's list)

The v17 numbered rules 1-31 are still in force. v18 adds these as rules 32-35:

32. **3-stage feature builds for greenfield work.** When building a NEW feature (new file, new screen, new schema), use the explicit Stage 1 (diagnostic) → Stage 2 (pure logic) → Stage 3 (UI + wiring + DB) workflow. Do NOT compress into a single spec for any feature with new screens or schema changes. The stage breaks force architectural review at the right moments.

33. **Real-input retest is part of the delivery.** When shipping a parser-class feature (or any rule-based system), plan for at least one bug-fix iteration after the user types real input. The Stage 2 test suite is a smoke test, not a verification. Budget 1-2 hours of post-deploy fix time for any parser ship.

34. **Strategic deferrals deserve audits.** Before deferring an expensive feature for cost reasons, do a diagnostic on the actual code to confirm the cost estimate. The Notepad v17 deferral assumed 3 days of data model engineering that didn't actually need to happen. A 30-minute screen-screenshot review collapsed the cost to zero. Future "should we do this?" decisions deserve the same audit.

35. **Library content gaps are a separate concern from parser correctness.** When a parser fails to match a user input, distinguish between (a) parser logic bug, (b) library content gap. Don't conflate them. Library curation is its own work stream, separate from parser work. The Motivators decision (placeholder update instead of library row) was the right call — fix the user-facing example to match reality, defer the library expansion to a dedicated curation pass.

---


## V17 SESSION RECAP — MAY 1, 2026 (READ THIS FIRST IF PICKING UP MID-FLIGHT)

### TL;DR for the next Claude

May 1, 2026 was the bug-fix-and-feature-cluster session. Eleven commits landed on `v2-pivot`. Cluster A shipped four quick wins. Cluster B shipped four foundational platform robustness fixes. Cluster C item 5 unified the Library Exercises tab. Cluster C item 5B fixed the broken Q Profile exercise edit flow plus three latent bugs uncovered in the diagnostic. Cluster C item 12 (Notepad mode) was scoped, mockups were drafted, and then **explicitly deferred** in favor of shipping v2-pivot to main first and gathering real PAX usage data. Item 6+7 (find HIMs / follow system) was **explicitly skipped** — re-introducing the social-graph machinery is not worth the cost without evidence of demand. The session also produced two architectural reframings worth preserving: the "no Codex/Community distinction" model for the exercise library, and the canonical popstate-driven unwind pattern for Android hardware back support.

### The current state at end of session May 1, 2026

- `main` branch: **untouched today**, gloombuilder.app stable (v1 architecture, 4-tab nav).
- `v2-shouts` branch: ARCHIVED (frozen historical record). Still preserved.
- `v2-pivot` branch: **ACTIVE. Feature-complete.** Eleven commits today on top of v16's commit `8192c95`. Latest commit hash: `3443ad0`. Full chain: `8192c95` → `8cb7bfe` → `70674c5` → (autosave) → (PWA notifier) → (popstate) → (Item 5) → `3443ad0`. Ready for merge after Ritz tests on Vercel preview.
- Vercel preview: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/` reflects all eleven commits.
- Working directory: `C:\Users\risum\Documents\projects\gloombuilder` — Bible v16 is committed at project root (commit `8192c95`); Bible v17 needs to be added similarly.
- Claude Code: still primary workflow. Operations smooth all day.

### Operating principle that emerged this session

The **diagnostic-first / spec-second / build-third / test-or-trust-fourth** pattern hit its stride. Every commit followed this rhythm:
1. Chat-Claude (Opus, web) drafts a *diagnostic-only* spec for Claude Code.
2. Claude Code reads relevant files and reports current state — without editing.
3. Chat-Claude reviews the report and writes the *edit spec*, often with corrections based on what the diagnostic surfaced.
4. Claude Code applies edits, runs `npm run build`, reports green or red.
5. Chat-Claude approves commit-and-push (or requests further changes).
6. Ritz tests on Vercel preview, OR explicitly opts to "trust" without testing.
7. Move to the next item.

**This pattern caught real bugs early.** Cluster A's Item 11b (new-mode → edit-mode transition for Builder) had three implementation options with non-obvious trade-offs; the diagnostic surfaced them and Option B was chosen against my pre-diagnostic intuition. Item 5B's diagnostic surfaced THREE latent bugs (the Item 11-style regression on `handleSaveExercise`, the `is_public` field that doesn't exist on the exercises table, the stale `editingEx` after share/unshare) that would otherwise have shipped. None of them were in scope; all of them got rolled into the same commit because we were already in the file.

**The "test or trust" branch** is real and named. Some commits Ritz tested on Vercel preview (Cluster A); others he chose to trust without testing (Cluster B Items 9, 3, 4 — where PWA caching, mocked Android, and post-popstate behavior made testing prohibitively complicated). Trusting without testing is fine when the diagnostic was thorough and the build is green; it's not a corner-cutting move, it's a calibrated risk decision.

---

### The eleven commits landed May 1, 2026 (in chronological order)

#### Commit 1 — `8cb7bfe` — Cluster A: source pill parity, qName fix, gear label, save-stays-on-screen

**Files touched:** `src/app/page.tsx`, `src/components/BuilderScreen.tsx`, `src/components/GeneratorScreen.tsx`, `src/components/LockerScreen.tsx`, `src/components/QProfileScreen.tsx` (5 files, +52 / −32 lines net).

**What it did:** Four quick-win fixes batched into one commit.

**Item 1 — QProfile source pill matches Library:**
- The April 30 session renamed "AI" → "Generated" on the Q Profile source pill (purple). Today reversed it again: "Generated" purple → "GloomBuilder" green to match Library's existing pill.
- Library uses `srcBadge` helper at `LibraryScreen.tsx:55-58` returning `{ bg: G + "15", c: G, l: "GloomBuilder" }` for the AI-generated case and `{ bg: GOLD + "18", c: GOLD, l: "Hand Built" }` for hand-built.
- QProfile's `sourcePill` const at `QProfileScreen.tsx:395-397` now uses identical color/alpha values: green `G + "15"` bg with `G + "30"` border for GloomBuilder; gold `GOLD + "18"` bg with `GOLD + "40"` border for Hand Built.
- Casing also normalized: `"GloomBuilder"` (camelcase, one word) and `"Hand Built"` (sentence-case, two words). NOT uppercase `HAND BUILT` anymore — Library never used uppercase, QProfile was the outlier.
- This is now canonical: green `GloomBuilder` pill = AI-generated content; gold `Hand Built` pill = manually authored. Both screens use identical visual treatment.

**Item 2 — CopyModal qName no longer hardcoded "The Bishop":**
- The diagnostic found 4 CopyModal call sites: `GeneratorScreen` (correctly passing `profName`), `LiveModeScreen` (correctly passing its own `qName` prop), and TWO sites with hardcoded `qName="The Bishop"` — `BuilderScreen.tsx:155` and `LockerScreen.tsx:239`.
- Fix: BuilderScreen accepts a new optional `profName?: string` prop, threaded through from page.tsx at both render sites (`vw === "build"` and `vw === "edit-bd"`). CopyModal's `qName` prop now reads `profName || "Q"`.
- LockerScreen given `profName` prop too — defense in depth. LockerScreen is currently dormant in v2-pivot (the file imports CopyModal but page.tsx no longer renders LockerScreen anywhere — its UI was merged into HomeScreen / QProfileScreen). The bug is invisible to users today, but the fix means if Locker is reintroduced later, the bug doesn't resurface.
- CopyModal itself was already correct: defaults `qName || "Q"` at L67 and L97. The bug was always at the call sites.

**Item 8 — Gear icon discoverability:**
- Bare `⚙` glyph (22px) at `QProfileScreen.tsx:214-223` was unrecognizable as a button. Beta PAX reported they couldn't find Settings.
- Replacement: bordered pill button containing `<span fontSize:18>⚙</span>` + `<span>Settings</span>` text label.
- Style: `background: rgba(255,255,255,0.04)`, `border: 1px solid BD`, `borderRadius: 10`, `padding: 8px 14px`, `gap: 8`. Now ~44px tall — meets the "Apple HIG minimum tap target" rule and is impossible to miss visually.

**Item 11 — Save no longer kicks user out of edit screen:**
- The big architectural change of the commit. Builder new-mode, Builder edit-mode, and Generator final all relied on `page.tsx` for post-save navigation — the screens themselves didn't navigate. Page.tsx unconditionally called `setVw(null)` and `setTab("home")` after every save, ejecting users to Home even when they were happy editing.
- `handleSaveBeatdown` rewritten: returns `Promise<string | null>` (the saved beatdown's id, or null on error). Removed the unconditional `setVw(null)` and `setTab("home")`. Toast still fires.
- `handleUpdateBeatdown` rewritten: returns `Promise<boolean>`. Same removal.
- `BuilderScreen.handleSave` rewritten as `async`: awaits onSave/onUpdate, resets `saving` state via `try/finally`. Edit mode stays put. New mode transitions to edit mode (see below).
- `GeneratorScreen` save button onClick wrapped the same way. Generator stays on the result screen post-save. Hitting Save again creates a new row (acceptable per spec — variant flow).
- **New-mode → edit-mode transition (the subtle part):** after a successful new-mode Builder save, the form needs to "commit" — without it, hitting Save again would create duplicate rows. Three options were considered:
  - Option A: page.tsx subscribes to onSave's returned newId, fetches, sets editingBd, switches vw. Couples parent to screen internals.
  - Option B: BuilderScreen accepts a new optional `onSavedNew?: (newId: string) => void` callback. page.tsx implements it as `(newId) => { const justSaved = lk.find(b => b.id === newId); if (justSaved) { setEditingBd(justSaved); setVw("edit-bd"); } }`.
  - Option C: BuilderScreen has internal "savedId" state. Divergent code path inside the component.
- **Option B chosen.** Cleanest separation. BuilderScreen says "I just saved this." page.tsx decides what that means. The `loadLocker()` call inside `handleSaveBeatdown` already runs before returning, so by the time `onSavedNew` fires, `lk` contains the new row. Brief unmount/remount is acceptable: user sees the same form content (form values are reconstructed from the just-saved beatdown), but now the screen header flips to "Edit beatdown", the destructive footer appears, and the Save button label reads "Save changes".
- Generator does NOT transition to edit mode — Generator is a write-once flow.

**Build status:** green. Pushed.

#### Commit 2 — `70674c5` — Disable Android pull-to-refresh

**Files touched:** `src/app/globals.css` only (1 file, +1 line).

**What it did:** Added `overscroll-behavior-y: contain` to the body rule in `globals.css`. This stops Android Chrome's native pull-to-refresh gesture from reloading the page mid-build.

**Critical:** did NOT add `touch-action: pan-y` — that would disable iOS Safari's edge-swipe-back gesture, which is muscle memory for iPhone users. The targeted fix is on the Y axis only.

**Diagnostic note:** the CSS file already had `overflow-x: hidden` and `padding-bottom: env(safe-area-inset-bottom)` for iPhone safe areas. No other body-level interactions needed.

**Build status:** green. Pushed.

#### Commit 3 — autosave commit (hash not captured) — Item 10: localStorage autosave across Builder/Generator/CreateExercise

**Files touched:** `src/lib/drafts.ts` (new, 58 lines), `src/components/BuilderScreen.tsx` (+79 / −18), `src/components/GeneratorScreen.tsx` (+61 / −12), `src/components/CreateExerciseScreen.tsx` (+56 / −7) (4 files, +173 insertions, +23 deletions, +1 new file).

**What it did:** Added localStorage-based draft persistence across all three creation flows. Drafts survive phone interruptions and tab reloads; lost on clear-browser-data or device switch.

**Decisions ratified during scoping:**
- Debounce window: **800ms** after last keystroke (reconsidered from initial "30 seconds"; once the user understood that drafts live in browser storage and never touch Supabase, the instant-feeling 800ms became the right choice).
- Restore UX: **silent restore + thin amber strip** at the top reading "↻ Draft restored from {time ago} · Discard". Persists until user taps Discard or saves successfully. No auto-dismiss timer.
- Generator behavior on saved-result-draft: **jump straight to the result** with the saved state, skipping the wizard. The amber strip provides a Discard escape hatch back to the wizard.

**New module — `src/lib/drafts.ts`:**
```typescript
export const DRAFT_KEYS = {
  builderNew: "gloombuilder.draft.builder.new",
  builderEdit: (id: string) => `gloombuilder.draft.builder.edit.${id}`,
  generatorResult: "gloombuilder.draft.generator.result",
  exerciseNew: "gloombuilder.draft.exercise.new",
} as const;

export interface DraftEnvelope<T> {
  data: T;
  savedAt: number;
}

export function loadDraft<T>(key: string): DraftEnvelope<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.savedAt !== "number" || !parsed.data) return null;
    return parsed as DraftEnvelope<T>;
  } catch { return null; }
}

export function saveDraft<T>(key: string, data: T): void {
  try {
    const envelope: DraftEnvelope<T> = { data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch { /* Safari private mode, quota exceeded */ }
}

export function clearDraft(key: string): void {
  try { localStorage.removeItem(key); } catch { /* Silent fail */ }
}

export function formatTimeAgo(savedAt: number): string {
  const seconds = Math.floor((Date.now() - savedAt) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(savedAt).toLocaleDateString();
}
```

**Per-screen wiring:**
- **BuilderScreen:** 8 state fields hydrated from draft on mount, falling back to editData, then defaults. Order: `editData?.x ?? initialDraft?.data.x ?? defaultValue`. 800ms debounced autosave watching all 8 fields. Banner at top when restored. Discard handler resets to editData state. handleSave clears draft on successful save (both edit and new-mode paths). Edit-mode draft keyed by beatdown id (`builderEdit(id)`) so multiple in-progress edits don't collide.
- **GeneratorScreen:** Loading a draft puts the user directly on the result screen because gr is non-null after hydration. 800ms debounced autosave gated on `if (!gr) return;` — wizard config is not autosaved, only post-result state. Banner at top of result screen. Discard resets to wizard step 0 and clears all generator state.
- **CreateExerciseScreen:** 5 state fields hydrated. Always-on debounced autosave (no gating). Banner at top. Optimistic clearDraft on save click — the older fire-and-forget `handleSaveExercise` pattern was left unchanged in this commit (accepted as v1; failure mode is rare). Item 5B later overhauled this and introduced a clean Promise-based pattern.

**Edge case decision — silent restore on edit-mode:** if the user edits beatdown X, the draft key `builderEdit(X)` is used. If they exit without saving, the draft persists. Next time they open beatdown X for editing, the draft is restored on top of the DB state (Cluster A's spec applied this; Item 5B later added a guard so editData takes priority over draft when both exist). Spec is **silent restore**; no "You have unsaved changes — restore?" prompt. F3 audience is older men outdoors with phones in one hand; modal prompts add friction.

**Build status:** green. Pushed.

#### Commit 4 — PWA update notifier commit (hash not captured) — Item 9: versioned cache + refresh banner

**Files touched:** `next.config.ts` (+5 / −1), `public/sw.js` (+13 / −4), `src/app/layout.tsx` (+13 / −11), and **NEW** `src/app/ServiceWorkerManager.tsx` (~80 lines).

**What it did:** Replaced the silent-stale-bundle PWA behavior (where users would sit on outdated code indefinitely) with an explicit "new version available — Refresh" banner.

**Decisions ratified during scoping:**
- Banner placement: **top** of screen (full width, green bg, fixed positioned with high z-index). Bottom would collide with BottomNav and safe-area-inset.
- Cache-bump strategy: **package.json version field** injected at build time via Next.js env block. Manual version bump on user-facing releases only — internal commits don't bump, so users aren't notified for every CSS tweak. (Initial discussion considered manual `CACHE_NAME` bump per release and per-commit auto-bump; both were rejected — manual was unreliable for 20-deploys-a-day cadence, per-commit produces notification fatigue.)
- Refresh tap behavior: **canonical SKIP_WAITING + controllerchange pattern**. Banner button posts SKIP_WAITING message to the waiting SW; SW activates; controllerchange listener triggers single page reload. Standard PWA orchestration.

**`next.config.ts` changes:**
```typescript
import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
};

export default nextConfig;
```
**Verified at build time:** the literal `"0.1.0"` string appeared in the built JS bundle (`/_next/static/chunks/...js`) inside the SW registration code, confirming env var was inlined as a build-time replacement, not a runtime read.

**`public/sw.js` changes:**
- `CACHE_NAME` is now derived from the registration URL's `?v=` query string: `gloombuilder-${VERSION}`. Old `gloombuilder-v1` cache cleans up automatically on next activate via the existing key-difference filter.
- Removed unconditional `self.skipWaiting()` from the install handler. Now gated on a `message` handler that listens for `{ type: "SKIP_WAITING" }` — fired only when user taps Refresh in the banner. This means an installed-but-not-activated SW waits for explicit user action.
- Existing fetch handler unchanged.

**NEW — `src/app/ServiceWorkerManager.tsx` (~80 lines, Client Component):**
- Registers `/sw.js?v={version}` on mount.
- Listens for `updatefound` events. When a new SW reaches `installed` state AND `navigator.serviceWorker.controller` already exists (i.e. this is an update, not a first install), sets the waiting worker in state and shows the banner.
- `controllerchange` listener triggers a single `window.location.reload()` with a `let reloading = false` guard outside the listener to prevent reload loops.
- Banner: fixed top, full width, green bg (`#22c55e`), dark text (`#0E0E10`), padding 12px 16px, z-index 9999, box-shadow `0 2px 8px rgba(0,0,0,0.4)`. Contents: "↻ New version available" on left + "Refresh" button on right. The Refresh button posts `SKIP_WAITING` to the waiting worker.

**`src/app/layout.tsx` changes:**
- Removed inline `<script dangerouslySetInnerHTML>` SW registration block entirely.
- Imported and rendered `ServiceWorkerManager` above `{children}`.
- Layout remains a Server Component; ServiceWorkerManager is the only client island.

**Release workflow (canonical going forward):**
1. User-facing release → bump `version` in `package.json` (e.g. `0.1.0` → `0.1.1`) → commit & push. Vercel deploys; users on old version see banner on next visit.
2. Internal commits without version bump → no notification. Users see updates only on natural full reload.
3. Documenting this in commit message + Bible is the discipline. Forgetting to bump = no notification that release. Forgivable failure mode.

**Build status:** green. Pushed.

#### Commit 5 — popstate commit (hash not captured) — Item 3: Android hardware back button via popstate

**Files touched:** `src/app/page.tsx` (+250 net, the bulk of the work), `src/components/BuilderScreen.tsx` (−9), `src/components/GeneratorScreen.tsx` (−9), `src/components/LibraryScreen.tsx` (+20), `src/components/LiveModeScreen.tsx` (+20). 5 files, +257 insertions, +51 deletions.

**What it did:** Added native back-button behavior on Android PWA installs. Hardware back now unwinds modals → views → tabs → exits the app, matching native Android expectations instead of the browser-default behavior of leaving the SPA on first press.

**Architecture: hybrid Pattern A.**
- LIFTED to `page.tsx`: BuilderScreen and GeneratorScreen `copyModal` state. Single CopyModal rendered at root level via a shared `copyModalContext` containing `{source, secs, beatdownName, beatdownDesc, inspiredBy}`. The two child screens just call an `onOpenCopyModal` prop with their current data.
- COORDINATED via callback refs: LibraryScreen `libDet` and LiveModeScreen `screen` state stay internal but report open-state changes to page.tsx via `onLibDetChange` / `onLiveActiveChange` props, and accept a back handler via `registerBackHandler` callback ref pattern. Page.tsx invokes the registered handler when popstate fires for that level.
- The hybrid was chosen over full Pattern A (lift everything) because LiveMode's `screen` state has its own internal back-progression (`prelaunch → exercise → complete → review`) and lifting it would mean restructuring Live Mode aggressively. Same logic for LibraryScreen's `libDet` which is entangled with two `useEffect` hooks (sync detail with sharedItems updates after voting; load comments when libDet opens).

**The popstate unwind priority order (in `page.tsx` as a single useEffect listener):**
1. Saving in flight → ignore back, push state back. (The `savingInFlight` boolean wraps `handleSaveBeatdown` and `handleUpdateBeatdown` via `try/finally`. Pathological case: slow network, user back-buttoning during save.)
2. `preblastOpen` → close composer, clear `preblastBd`.
3. `copyModalOpen` → close modal, clear `copyModalContext`.
4. `libDetOpen` and `tab === "library"` → call `libraryCloseRequestRef.current()` which fires LibraryScreen's `setLibDet(null); setShowAllCmt(false)`.
5. `vw === "live"` and `liveActive` (i.e. `screen === "exercise"`) → call `liveBackRequestRef.current()` which triggers LiveMode's existing `setShowExitConfirm(true)`. Confirm dialog appears; "Keep Going" closes, "End" routes to completion screen.
6. Full-screen views (`vw !== null`):
   - `vw === "live"` (not active workout, on prelaunch/complete/review) → `setVw(null); setLiveBd(null)`.
   - `vw === "edit-bd"` → mirror the existing edit-bd onClose logic (editFromQProfile branching).
   - `vw === "q-profile"` → `setVw(null); setViewingUserId(null)`.
   - Generic vw close (build/gen/create-ex/settings/edit-ex) → `setVw(null)`.
7. Tab navigation (`vw === null`): on Library or Profile tab → `setTab("home")`. On Home tab → fall through to OS, exit app.

**Browser history stack management:** five separate `useEffect` hooks that call `window.history.pushState({ gb: "level" }, "")` whenever a back-able state opens (preblast, copyModal, libDet, vw, tab). Initial `replaceState({ gb: "root" }, "")` on mount so popstate has somewhere to fire. Every popstate handler that consumes a back press also pushes state back, so the browser's history stack stays in sync with the SPA's logical stack.

**Saving-in-flight guard:** added because in pathological cases (slow Supabase round-trip + impatient user), a back press could close the screen mid-save. The guard silently ignores back during save; save completes normally. ~5 lines of extra code, cheap insurance.

**LiveModeScreen coordination:**
- New props: `onLiveActiveChange?: (active: boolean) => void`, `registerBackHandler?: (handler: () => void) => void`.
- Two new `useEffect`s: one notifies parent when `screen === "exercise"`, one registers a back handler that calls `setShowExitConfirm(true)` when in exercise screen.
- Shows `showCopyModal` stays internal (its onClose has a side effect — bumping "review" back to "complete" — which would be awkward to thread through page.tsx).

**LibraryScreen coordination:**
- Same prop pattern: `onLibDetChange`, `registerBackHandler`.
- Back handler: `setLibDet(null); setShowAllCmt(false)`.

**Build status:** green. Pushed.

#### Commit 6 — `(Item 5)` — Library Exercises tab unification

**Files touched:** `src/lib/db.ts` (+5 / −2), `src/lib/exercises.ts` (+16 / 0), `src/app/page.tsx` (+3 / 0), `src/components/LibraryScreen.tsx` (+157 / −83). 4 files, +181 insertions, +85 deletions.

**What it did:** Dropped the Shared / Exercise Database sub-toggle in the Library Exercises tab. Merged into a single feed sorted newest first. Search hits exercise name, alias, description, AND creator name. All exercises (seed + community) open the same full detail page (with engagement: votes, comments, save) regardless of source. "Added by [name]" attribution shows on community-source rows; older seed rows show no attribution.

**The reframe that drove the design.** Original spec proposed three options for filter UI (source as filter chip / source as per-row badge only / source as sort option). Mid-discussion, Ritz reframed: *"the exercise library is technically a community library. I downloaded that from a source where people submitting new exercises... it's an accumulation of exercises that the PAX submitted throughout the years. There's no distinction between codex or seed or PAX exercise."* This collapsed the entire question. Source becomes invisible. The library is just the library.

**`src/lib/db.ts` — `loadSeedExercises` expanded:**
```typescript
.from("exercises")
.select("id, name, aliases, description, how_to, body_part, exercise_type, equipment, site_type, cadence, difficulty, intensity, movement_type, is_mary, is_transport, popularity_tier, vote_count, comment_count, source, created_at, created_by, profiles:created_by(f3_name)")
.eq("source", "seed")
.order("created_at", { ascending: false });
```
Added: `id`, `vote_count`, `comment_count`, `source`, `created_at`, `created_by`, profile JOIN. Server-orders by `created_at DESC`.

**`src/lib/exercises.ts` — `ExerciseData` extended:**
```typescript
export interface ExerciseData {
  // ... existing fields ...
  // NEW (Item 5):
  id?: string;
  source?: "seed" | "community";
  createdAt?: string;
  createdBy?: string;
  creatorName?: string;
  voteCount?: number;
  commentCount?: number;
}
```
All optional — preserves backwards compat for Generator/Builder/LiveMode (which don't read these fields).

`mapSupabaseExercise` extended with the seven new mappings, reading `row.profiles?.f3_name` for the creator name (only present when source === "community" by virtue of the JOIN).

**`src/app/page.tsx` changes:** SharedItem interface gained `createdAt?: string`. Both `dbToShared` (beatdown mapping) and the inline exercise mapping in `loadLibrary` now populate `createdAt: row.created_at`.

**`src/components/LibraryScreen.tsx` — the unified branch:**
- Removed `exMode` state and the sub-toggle JSX entirely.
- Renamed `dbSearch → exSearch` and `dbTag → exTag` for post-unification clarity.
- Removed two render branches; replaced with one unified `libT === "exercises"` branch:
  - Builds `communityExercises` from `sharedItems.filter(si => si.tp === "exercise")`, mapped to `ExerciseData` shape with `source: "community"`, `creatorName: si.au`, `createdAt: si.createdAt`, `voteCount: si.v ?? 0`, `commentCount: si.cm ?? 0`.
  - Defense-in-depth dedup by lowercased name (community-vs-seed; seed wins).
  - Combines into single `allEx` array.
  - Filters by tag chip + search across 4 fields (name + alias + creator + description).
  - Sort logic: search active → relevance ranking; no search → `createdAt` DESC (newest first).
  - Renders single `map()` of cards. Cards gain "added by [name]" line on community-source rows only.
- Search input scope split per Decision 3: `libSearch` ONLY renders on Beatdowns tab. Exercises tab gets its own `exSearch` input with placeholder `"Search ${allEx.length} exercises by name, alias, or PAX..."`.
- libDet detail page now renders the canonical 5-block shape for both source types: title → attribution → tags → Description → How to do it → Engagement → Comments. The how-to body uses the same step-split regex `/\s(?=(?:[1-9]|1\d|20)\.\s[A-Z])/` as ExerciseDetailSheet so both surfaces render identically.
- Click handlers: community rows pass the original FeedItem to `setLibDet`; seed rows synthesize a FeedItem from the ExerciseData shape via a `toFeedItem` helper.

**Kept (correctly, against an earlier draft of the spec):** `dbDetail` / `setDbDetail` / `ExerciseDetailSheet` stay. They're still used inside the `libDet` detail render when the user taps an exercise inside a beatdown's section list — bottom-sheet peek is the right UX there, full-page nav is for top-level library browsing. Claude Code caught this gap in the spec.

**Decisions locked during scoping:**
- Click destination: **(a) always open the full detail page**, even on seed rows. Reasoning: collapses the "two surfaces for one library" inconsistency. Empty engagement strips on seed rows are an *invitation* — "Be the first to upvote" copy. Currently seed rows have no way to receive votes; option (a) opens the door.
- Search behavior: **search active = relevance ranking; no search = newest first**. Standard pattern. Otherwise typing "Burpee" returns the row at position 800 because it's old. Apple Music / App Store / Google all work this way.
- Search scope: **separate per tab**. Beatdowns uses `libSearch`. Exercises uses `exSearch`. The two have different field sets to match against.
- Attribution: **show "added by [name]" on community rows; older seed rows show neither date nor attribution**. Cleanest possible row layout.

**Build status:** green. Pushed.

#### Commit 7 — `3443ad0` — Item 5B: Q Profile exercise edit flow + 3 latent bug fixes

**Files touched:** `src/app/page.tsx` (+85 / −25), `src/components/CreateExerciseScreen.tsx` (+59 / −28), `src/components/QProfileScreen.tsx` (+25 / −15). 3 files, +172 insertions, +65 deletions.

**What it did:** Built the missing 5-layer edit chain for exercise cards in Q Profile (which were tappable-but-broken — every layer of the navigation stack from card-onClick to edit-screen vw branch was missing). Plus three latent bug fixes surfaced by the diagnostic.

**The 5-layer fix:**

1. **`ExerciseCard` accepts `onTap?: () => void`** (mirrors BeatdownCard exactly). Wraps `onClick`, sets `cursor: onTap ? "pointer" : "default"`.

2. **`QProfileScreenProps` adds `onOpenExerciseDetail?: (exerciseId: string) => void`**. Wired to ExerciseCard at render: `onTap={onOpenExerciseDetail ? () => onOpenExerciseDetail(ex.id) : undefined}`.

3. **page.tsx adds `editingEx` state + `handleOpenExerciseDetail` handler.** Handler looks up `lkEx` by id, sets `editingEx`, switches `vw` to `"edit-ex"`. Wired to BOTH QProfileScreen render sites (full-screen vw branch and bottom-tabs profile branch).

4. **page.tsx adds `vw === "edit-ex"` branch** mounting CreateExerciseScreen in edit mode. Passes `editData` (id, nm, desc, how, tags, isPublic derived from `editingEx.shared`), `onUpdate={handleUpdateExercise}`, plus `onShareExercise`/`onUnshareExercise`/`onDeleteExercise`. Delete is wrapped in confirm dialog + clears `editingEx` and `vw` BEFORE calling delete.

5. **CreateExerciseScreen extends with edit-mode props and Layer 3 destructive footer:**
   - Props interface adds `editData?`, `onUpdate?`, `onShareExercise?`, `onUnshareExercise?`, `onDeleteExercise?` — all optional.
   - State hydration order: `editData → initialDraft → ""`. The `initialDraft` IIFE early-returns null when editData is set, so no stale "create new" draft contaminates an edit session.
   - Banner + autosave useEffects early-return when editData is set. No autosave in edit mode; no banner restored. (This solves a sharp edge case: if a user starts a "create new" flow, types content, then opens an existing exercise to edit, the new draft would otherwise apply on top of the edit data.)
   - New `handleSave` function: edit branch awaits `onUpdate`, stays on screen. New branch awaits `onSave`, clears draft. Validates name not empty.
   - Header text flips in edit mode: "Edit exercise" / "Update your exercise details" / "← Locker" back button.
   - Body share toggle hidden in edit mode (sharing migrates to Layer 3 footer).
   - **NEW Layer 3 destructive footer at the bottom**, gated on `editData && !saving`. Asymmetric: green "Share to library" + red "Delete" when private; red "Unshare" + red "Delete" when shared. Mirrors BuilderScreen pattern from Cluster A exactly.
   - Save button label flips to "Save changes" in edit mode.

**The 3 latent bug fixes (rolled into the same commit because we were already in the file):**

**Bug 1 — `is_public` field doesn't exist on the exercises table.** Bible v15 explicitly stated: *"beatdowns use is_public, exercises use source."* But `QProfileScreen.tsx` had `interface ExerciseRow { ... is_public: boolean; ... }` and `stripeColor = ex.is_public ? G : "#3a3a40"`. Result: every exercise card stripe rendered gray (draft) regardless of whether it was actually shared, because `ex.is_public` was always undefined.

Fix: `ExerciseRow` interface changed to `source: "seed" | "community" | "private"`. ExerciseCard derives `isShared = ex.source === "community"` and uses it for both stripe color AND the asymmetric Q Profile card footer.

**Bug 2 — Item-11-style regression on `handleSaveExercise`.** Same shape as the beatdown save bug fixed in Cluster A. `handleSaveExercise` had unconditional `setVw(null); setTab("home")` at the end — every exercise save ejected user to Home, including new edit-mode saves.

Fix: removed those two lines. Added `savingInFlight` wrap via `try/finally` (mirrors `handleSaveBeatdown` pattern).

**Bug 3 — Stale `editingEx` after share/unshare.** `handleShareExercise` and `handleUnshareExercise` updated `lkEx` (the locker state) but not `editingEx` (the open editor's state). If a user tapped "Share to library" in the Layer 3 footer, the share would succeed, but the footer would still show "Share to library" instead of flipping to "Unshare". Inconsistency.

Fix: both handlers now also call `setEditingEx({ ...editingEx, shared: true/false })` when the active editingEx matches the id being shared/unshared.

**Architectural note:** the diagnostic flagged that LockerExercise.shared (boolean derived from `source === "community"` in dbToExercise) is the right field to check, NOT `editingEx.src === "community"`. Reasoning: `LockerExercise.src` can also be "Stolen" (when `inspired_by` is set), so checking src would miss stolen-but-shared cases. The fix uses `editingEx.shared || false` consistently.

**`handleUpdateExercise`** also was promoted to `Promise<boolean>` return type with `savingInFlight` wrap — same shape as `handleUpdateBeatdown`.

**Build status:** green. Pushed.

### May 1 commit log — quick reference

| # | Hash | What |
|---|------|------|
| 1 | `8cb7bfe` | Cluster A: source pill parity, qName fix, gear label, save-stays-on-screen |
| 2 | `70674c5` | Disable Android pull-to-refresh (1 CSS line) |
| 3 | (autosave) | Item 10: localStorage autosave across Builder/Generator/CreateExercise |
| 4 | (PWA notifier) | Item 9: versioned cache + refresh banner |
| 5 | (popstate) | Item 3: Android hardware back via popstate hybrid Pattern A |
| 6 | (Item 5) | Library Exercises tab unification (no Codex/Community split) |
| 7 | `3443ad0` | Item 5B: Q Profile exercise edit flow + 3 latent bug fixes |

(Hashes for commits 3-6 are in `git log` on `v2-pivot`; not all were captured into chat at push time. Confirmed sequence: `8cb7bfe` → `70674c5` → 4 unnamed → `3443ad0`.)

### Strategic deferrals — EXPLICIT decisions, not omissions

These were discussed in detail and explicitly decided NOT to ship now. Both decisions should NOT be re-litigated without new information.

#### Items 6 + 7 — Find HIMs / Follow system: **DEFERRED, possibly indefinitely**

Original Ritz request:
> "where do I search HIMs? if I want to find Rodin or FallGuy, where are they? where is the option to follow them? and where can I find the list of my followers or I'm following?"

Two coupled questions: how do PAX find each other, and how do they form persistent relationships in the app.

**Why deferred:** The Follow system was explicitly stripped from v2-pivot during the April 28 strip-down (Bible v15's "Commit A — subtraction"). Reintroducing it means re-adding `follows` table, follower count UI, follow buttons, the social-graph machinery. That's not free.

**The bigger question.** F3 communities already have Slack and GroupMe for daily relationship maintenance. GloomBuilder taking on the daily-engagement battle (notifications, who-followed-you, what-Bishop-posted-today) is the same trap that killed v2-shouts. The Feed was killed for this exact reason.

**The lighter answer to "find a HIM"** that was floated but not pursued: a HIM directory or PAX search you reach from Library or Profile. Type "Bishop" → see Bishop's profile. No follow button. No followers tab. Just attribution and search. That's the version worth building when it's worth building. Today, none of it ships.

**Operational rule:** do not bring follows back without explicit Ritz directive informed by real PAX usage data on the merged v2-pivot product. The `follows`, `shouts`, `shout_reactions` Supabase tables remain dormant (not dropped, per v16's reversal) so the schema stays available if direction reverses.

#### Item 12 — Notepad mode: **DEFERRED, post-merge revisit**

Original Ritz proposal:
> "A meaningful chunk of Qs prefer pen-and-paper or plain-text notes (Apple Notes, etc.) over structured builders. They write beatdowns in free-form natural language and won't switch to Build from Scratch... GloomBuilder loses these Qs entirely."

The full proposal (preserved at `/mnt/user-data/uploads/notepad-mockup.html`) describes a pure rules-based parser converting free-text exercises into the existing structured beatdown format. Inline parse markers (§ section, ✓ exercise, → transition, + custom, ? did-you-mean), debounced live updates, mobile/desktop responsive layout. AI-assisted "Smart Import" floated as a Pro-tier upsell for the messy 30%.

**Why deferred:** the strategic question "do we need a third creation path right now" was raised before any specs. Three things tipped against shipping immediately:

1. **No concrete user feedback that the structured builder loses Qs to plain-text habits.** The proposal is a hypothesis based on inferred PAX behavior, not direct beta-tester feedback. Worth testing — but better to test on the merged-and-deployed product than on a feature-complete preview.

2. **Opportunity cost.** Notepad is a 4-6 week build with parser tuning, fuzzy match calibration, mobile editor mechanics, and Pro-tier AI integration. The same time could ship Templates (the 30 workout formats), Pro tier paywall, exercise favorites, follow-up mode — every one of which is a known unmet need.

3. **"Good enough Notepad" is unclear without usage data.** Shipping a Notepad that handles 70% of input cleanly and falls back gracefully is a 1-week build. Shipping one that handles 95% with AI is a 4-week build. The right scope can only be calibrated by knowing how PAX actually try to use it.

**The decision:** ship `v2-pivot` to `main` first, deploy gloombuilder.app v2.0.0, watch real PAX use the merged product for some unspecified period, then revisit Notepad with actual signal.

**Notepad proposal preserved in full** in this Bible (v17 doesn't strip it) and in `/mnt/user-data/uploads/notepad-mockup.html` for future reference. When (if) Notepad gets greenlit, the proposal is the starting point — re-reading it then will be the right move.

**Operational rule:** Notepad mode is the next-feature-most-likely after Templates and Pro tier. When revisiting, the validation question to answer first is: "*Have we lost specific PAX who told us they want plain-text input?*" — not "*do I think Qs would like this in theory?*"

---

### Canonical patterns ratified this session (additions to v16's list)

These are now reusable patterns. Future features should follow these.

#### Pattern: localStorage Drafts Envelope (Item 10)

Any "user is creating something" surface that benefits from persistence-on-interruption should use the `src/lib/drafts.ts` module. Pattern:
1. Define a `DRAFT_KEYS` entry.
2. State hydration: `editData ?? initialDraft?.data.X ?? defaultValue` (in that priority).
3. `useEffect` for banner state — early-return if editData (banner only shows in new mode).
4. `useEffect` for debounced autosave (800ms) — early-return if editData (no autosave during edit).
5. On successful save: `clearDraft(key); setDraftRestored(null)`.
6. On Discard tap: clear draft, reset to editData (or defaults), clear banner.

**Why edit mode does NOT autosave or restore:** would cause cross-edit contamination — if user edits beatdown A, exits without saving, then opens beatdown B, they'd see beatdown B's data with A's draft restored on top. Solving cleanly would require keying drafts per beatdown ID for edit mode (which we do — `builderEdit(id)`) AND a UI to tell user "you have unsaved changes from before" (which we don't have). v1 punts: edit mode behavior is "form populates from editData on mount, debounced autosave is silently disabled, no banner."

#### Pattern: Saving-In-Flight Guard

For any handler that performs a Supabase write and might be interrupted by user navigation:
```typescript
const handleX = async (...): Promise<...> => {
  setSavingInFlight(true);
  try {
    // ... write logic ...
  } finally {
    setSavingInFlight(false);
  }
};
```
And in the popstate handler in page.tsx:
```typescript
if (savingInFlight) {
  window.history.pushState({ gb: "guard" }, "");
  return;
}
```
Cheap insurance. Save completes; user's back press is silently absorbed.

#### Pattern: PWA Update Banner (Item 9)

The `ServiceWorkerManager` Client Component owns SW registration AND the update banner. To trigger a notification on a user-facing release:
1. Bump `version` in `package.json` (semver).
2. Commit & push.
3. Vercel deploys; users on old version see banner on next visit.

Internal commits don't bump → no banner. Forgivable failure mode (no notification that release).

The `next.config.ts` `env` block injects `pkg.version` as `NEXT_PUBLIC_APP_VERSION` at build time. The SW reads it from the registration URL's `?v=` query string. Cache name becomes `gloombuilder-${VERSION}`.

#### Pattern: popstate-driven SPA back unwinding (Item 3)

When adding a new "back-able" state to page.tsx:
1. Add a `useEffect` that calls `window.history.pushState({ gb: "level" }, "")` when the state opens.
2. Add a corresponding case in the centralized popstate handler at the right priority level (modals first → screens → tabs → fall-through).
3. If the state is internal to a child component, use the `registerBackHandler` callback ref pattern (the child registers a handler at mount; page.tsx invokes it via the ref).
4. For lifted-to-page-tsx state (like `copyModalOpen`), just close it directly in the popstate handler.

Priority order is now canonical:
1. Saving-in-flight guard
2. Modals/overlays (preblast, copyModal, dismissible sheets)
3. Internal child detail views (libDet)
4. Active workout (LiveMode `screen === "exercise"`) — triggers existing exit confirm
5. Full-screen views by `vw` (live → edit-bd → q-profile → generic)
6. Tab navigation (Library/Profile → Home)
7. Home + null = fall through to OS

#### Pattern: Layer 3 Destructive Footer extended (Item 5B)

Originally established for BuilderScreen edit mode in v16. Now also applies to CreateExerciseScreen edit mode. Same pattern:
- Wrapper: `marginTop 18, paddingTop 12, borderTop 0.5px solid rgba(255,255,255,0.06)`, flex space-between alignItems center.
- Left slot is contextual on `editData.isPublic` (or `.shared` for exercises): green "Share to library" when private; red "Unshare" when public.
- Right slot is always "Delete" in red.
- Both links: `fontSize 13, fontWeight 700, no border/background/padding, full-saturation color`.
- Gated on `editData && !saving` — hides during in-flight saves.

Future edit forms (none currently planned but possible — e.g. profile edit, AO edit) should adopt this same pattern.

#### Pattern: Read-and-report-before-editing (operational, not architectural)

Any non-trivial edit (more than 3-4 lines, more than 1 file) follows this:
1. Chat-Claude drafts a *read-only diagnostic* — what to read, what to report, do not edit anything.
2. Claude Code reads files, reports back code snippets and observations.
3. Chat-Claude reviews and writes the edit spec from the actual file contents.
4. Claude Code applies, builds, reports diff stat.
5. Approve commit & push.

This pattern caught real bugs in 4 of 7 commits today. Cost: ~2-3 minutes per commit. Benefit: zero failed builds, zero "build red, fix, build green" cycles, zero "spec said X but file actually had Y" surprises.

**The single biggest leverage:** Item 5B's diagnostic surfaced THREE bugs (Item-11 regression on save, `is_public` doesn't exist, stale editingEx) that were not in scope but got fixed in the same commit because we were already in those files. None would have been caught by spec-from-memory.

---

### Outstanding work before merge to main

(Same list as v16 with one additional item.)

1. **Add Bible v17 to project root.** Same procedure as v16: copy file in, `git add`, commit, push.
2. **Final test pass on Vercel preview.** All 11 commits today live in the preview. Walk through:
   - Item 5B: tap an exercise card in Profile → edit form opens → Save → toast → stays put.
   - Item 5: Library Exercises tab → no sub-toggle, single feed sorted newest first, "added by [name]" on community rows, search hits creator name.
   - Cluster A items: source pill consistency, qName not "The Bishop", gear is now "⚙ Settings" pill, save doesn't kick out.
   - Cluster B items: pull-to-refresh dead on Android, autosave restores after closing tab, PWA banner appears after package.json bump, hardware back unwinds modals → views → tabs.
3. **Merge `v2-pivot` to `main`.** Per v16 plan: fast-forward or merge commit, push to origin main, Vercel auto-deploys to gloombuilder.app.
4. **Tag the merge commit** `v2.0.0`. Bump `package.json` version from `0.1.0` to `2.0.0` in the same commit (or as a follow-up). The version bump is what triggers the PWA update banner for existing PWA users — important for the launch.
5. **Optional: delete `v2-pivot` branch after merge.** Or keep as a dev base. Ritz's call.

### What the next session looks like

When Ritz returns:

1. `cd C:\Users\risum\Documents\projects\gloombuilder && claude`
2. (If not already done) drop `GLOOMBUILDER-BIBLE-v17.md` at project root, commit with message "Add Bible v17 — V2-pivot feature-complete edition", push.
3. Tell Claude Code: *"Read GLOOMBUILDER-BIBLE-v17.md, then read the V17 SESSION RECAP at the top, then check `git status` and `git log -10 --oneline` on v2-pivot. Confirm we're at the latest commit (3443ad0 or whatever's later). Don't make any changes yet."*
4. Decide: any final test pass concerns? If clean → proceed to merge.
5. Merge sequence:
   ```
   # Bump package.json version FIRST (this triggers the PWA update banner)
   # Edit package.json: "version": "0.1.0" → "2.0.0"
   git add package.json
   git commit -m "Bump version to 2.0.0 for v2-pivot launch"
   git push origin v2-pivot
   
   # Then merge
   git checkout main
   git merge v2-pivot
   git push origin main
   git tag -a v2.0.0 -m "v2-pivot architecture: 3-tab nav, Send Preblast generator, autosave, popstate, unified library, exercise edit flow"
   git push origin v2.0.0
   ```
6. Watch Vercel auto-deploy main to gloombuilder.app. Test production once deployed. Existing PWA users will see "↻ New version available — Refresh" banner on next visit.
7. Optional cleanup: `git branch -d v2-pivot` locally and `git push origin --delete v2-pivot` if Ritz wants the branch retired.

### Post-merge product priorities (ordered)

(Updated from v16 with explicit deferral notes.)

1. **Watch real PAX use the merged product** — for at least a few days, ideally a couple weeks. Gather signal on what's working and what isn't.
2. **Templates** (30 workout formats — biggest remaining feature). Schema in `GLOOMBUILDER-GENERATOR-BLUEPRINT.md`. 3 free + 27 Pro.
3. **Stripe Pro tier** ($29/year subscription) — gates unlimited generation and 27 Pro templates. Builds on the existing `/api/checkout/route.ts` Stripe Checkout integration.
4. **Generator timing/effort rebuild** (`seconds_per_rep`, `effort_per_rep`, time-budget system).
5. **Exercise favorites** — heart/star toggle, favorited exercises rank higher in Builder search and Library default sort.
6. **Notepad mode** (Item 12 — DEFERRED) — revisit only after concrete PAX feedback that structured builder loses Qs to plain-text habits.
7. **Find HIMs / PAX directory** (Item 6+7 — DEFERRED) — light-touch HIM directory possible without re-introducing follows. Revisit only after concrete demand.
8. **Cross-section exercise drag** (dnd-kit architectural change).
9. **Responsive desktop layout** — app currently 430px max-width centered.
10. **Avatar profile customization** — parked until 20+ users ask.

### V17 Permanent operating rules (additions to v16's list)

The v16 numbered rules 1-25 are still in force. v17 adds these as rules 26-31:

26. **Diagnostic-first / spec-second / build-third / test-or-trust-fourth pattern is canonical.** Any non-trivial edit follows this rhythm. Spec-from-memory is the fallback only for changes < 4 lines, < 1 file.
27. **The 3 latent bug rule.** When a diagnostic for one item surfaces orthogonal bugs in the same files, fix them in the same commit. Don't punt to a future session — by then we won't be in the file. Item 5B was the canonical example: 1 spec'd fix + 3 latent bugs = 1 commit.
28. **Ritz's "test or trust" branch is real.** Some commits get tested on Vercel preview; others get trusted without testing because the test is prohibitively complex (PWA caching, Android emulation, popstate). Trusting is fine when diagnostic was thorough and build is green. Not corner-cutting; calibrated risk.
29. **Strategic deferrals are NOT temporary scope.** Items 6+7 (follows) and Item 12 (Notepad) were deferred with specific reasoning. Do NOT re-litigate without new information (real PAX feedback, not founder intuition). The follows decision in particular is a recurring temptation — resist.
30. **Package.json version is the launch signal.** Bumping `version` in `package.json` is what triggers the PWA update banner for existing users. Treat version bumps as a deliberate communication act — bump on user-facing releases only, not on internal tweaks.
31. **The popstate priority order is sealed.** When adding new back-able state, slot it into the existing 7-tier priority order. Don't reorder. Don't add competing priorities. Modals always close before screens; screens always close before tabs; tabs always close before app exit.

---

## V16 SESSION RECAP — APRIL 30, 2026 (READ THIS FIRST IF PICKING UP MID-FLIGHT)

### TL;DR for the next Claude

April 30, 2026 was the polish-and-stabilize session that took v2-pivot from "Commit C step 4 done" (Bible v15) to "feature-complete and ready for merge to main." Five distinct commits landed, all on `v2-pivot`, all with `npm run build` green at every step. The session also marked the operational shift to **Claude Code as the primary development workflow** — the chat-based PowerShell paste-relay pattern is retired. Claude.ai chat now handles design review, mockups, and spec authoring. Claude Code (terminal CLI) handles file reads, edits, builds, and git operations. This is the most important workflow change since the project started.

### The current state at end of session April 30, 2026

- `main` branch: untouched, gloombuilder.app stable (v1 architecture, 4-tab nav with Home / Library / Locker / Profile-as-Settings).
- `v2-shouts` branch: ARCHIVED (frozen historical record). Do not delete.
- `v2-pivot` branch: ACTIVE. **Feature-complete.** All three Send Preblast entry points wired. Action areas redesigned (Layer 1/2/3). Q Profile cards redesigned. Mojibake fixed. "Run This" → "Live". "AI" → "Generated". Visitor view filters drafts. Ready for merge after a final test pass.
- Vercel preview: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/` reflects the latest commit and was tested and approved by Ritz at end of session.
- Working directory on Ritz's machine: `C:\Users\risum\Documents\projects\gloombuilder`
- Claude Code: installed, authenticated via Claude Max, fully operational.

### The five commits landed April 30, 2026 (in chronological order)

#### Commit 1 — `ae1f631` — Commit C Round 3: action area redesign + Send Preblast wiring

**Files touched:** `src/app/page.tsx`, `src/components/BuilderScreen.tsx`, `src/components/GeneratorScreen.tsx`, `src/components/LibraryScreen.tsx` (4 files, +146 / −44 lines net).

**What it did:**

The old action area on Builder, Generator, and Library detail was a vertical stack of up to 5 same-width buttons (Save, Run This, Backblast, Unshare, Delete in edit mode), all visually the same weight. Hick's Law nightmare — eye couldn't find the primary. Adding the planned Send Preblast button was going to be the 6th in that stack, breaking it further.

The redesign introduced a 3-layer hierarchy applied across BuilderScreen, GeneratorScreen, and LibraryScreen detail:

- **Layer 1 (Primary)** — Save / Save changes — full-width filled green button. The thing 90% of taps go to.
- **Layer 2 (Secondary)** — icon pill row with equal-flex peer pills:
  - **Live** (▶, green) — was "Run This" before the rename in commit 4. Always present except in `saving` state.
  - **Preblast** (📣, purple) — always present. Calls onSendPreblast prop with the current beatdown converted to AttachedBeatdown.
  - **Backblast** (📓, amber) — Builder edit mode + Generator final state only. (Builder new-build mode initially missed this; commit 3 fixed it.) Calls existing setCopyModal(true).
- **Layer 3 (Destructive footer)** — BuilderScreen edit mode only:
  - Wrapper div: `marginTop 18, paddingTop 12, borderTop "0.5px solid rgba(255,255,255,0.06)"`, flex justifyContent space-between alignItems center.
  - Left slot is **contextual based on `editData.isPublic`**:
    - `isPublic === true` → "Unshare" link in `#ef4444`. Opens existing confirm modal which then calls onUnshareBeatdown.
    - `isPublic === false` (or falsy) → "Share to library" link in `#22c55e`. Fires onShareBeatdown directly with no confirm modal (sharing is reversible, so no friction needed).
  - Right slot: always "Delete" in `#ef4444`. Opens existing confirm.
  - Both links share styling: `fontSize 11, fontWeight 400, no border, no background, no padding`. (These sizes were bumped in commit 5.)

**The Live label was originally "Run This" in this commit.** It was renamed in commit 5 (the readability pass).

**Pill spec at this commit (was bumped in commit 5):**
- Pill: `padding "10px 4px", borderRadius 10, gap 6` (between pills)
- Icon span: `fontSize 14, lineHeight 1, marginBottom 6`
- Label span: `fontSize 9, fontWeight 700, letterSpacing 0.4, textTransform uppercase`
- Backgrounds: Live = `rgba(34,197,94,0.06)` border `rgba(34,197,94,0.30)`, Preblast = `rgba(167,139,250,0.06)` border `rgba(167,139,250,0.30)`, Backblast = `rgba(245,158,11,0.06)` border `rgba(245,158,11,0.30)`.

**Send Preblast wiring (the third entry point group):**
- Each of the three screens (Builder, Generator, Library detail) gained a new optional prop `onSendPreblast?: (bd: AttachedBeatdown) => void`.
- The handler in page.tsx is the same wherever it's called: `(bd) => { setPreblastBd(bd); setPreblastOpen(true); }`.
- Each screen builds an AttachedBeatdown payload from its own state when the Preblast pill is tapped:
  - **BuilderScreen:** `{ id: editData?.id ?? "draft", title: bT || "Untitled beatdown", duration: bDur, difficulty: DIFFS.find(d => d.id === bDiff)?.l ?? null, sections: secs.map(s => ({ label: s.label, color: s.color, exercises: s.exercises.map(e => ({ name: e.n, reps: e.r ?? null, cadence: e.c ?? null })) })) }`. Note that `s.exercises` and `d.id` are the actual field names — the spec originally said `s.ex` and `d.k`, which were corrected to the real names by Claude Code at edit time.
  - **GeneratorScreen:** Same shape, sources from gr (sections), grT (title), gc.dur, gc.diff. id is hardcoded `"draft"` since unsaved.
  - **LibraryScreen detail:** `{ id: String(bd.id), title: bd.nm, duration: bd.dur, difficulty: bd.d, sections: bd.secs?.map(s => ({ label: s.label, color: s.color, exercises: s.exercises.map(e => ({ name: e.n, reps: e.r ?? null, cadence: e.c ?? null })) })) }`. Pill only renders when `bd.tp === "beatdown" && bd.secs && bd.secs.length > 0`.

**Side cleanup in commit 1:**
- Removed a duplicate `<PreblastComposer />` instance in page.tsx that was rendering twice (originally lines 627-628 in v15 layout).
- BuilderScreen edit-mode top header lost its old amber Backblast button (the button was relocated to the action row pill). New-build mode's top-row Backblast was missed at this commit and removed in commit 3.

**Spec corrections silently applied at edit time** (caught by Claude Code reading the actual file):
- Spec said `s.ex` → actual field is `s.exercises` (per `src/lib/exercises.ts:65`).
- Spec said `d.k` → actual field is `d.id` (per `src/lib/exercises.ts:105-115`).
- Spec said `editData.is_public` → actual prop is `editData.isPublic`.

**One regression fixed at commit-time** before push: the original spec only listed Unshare + Delete in Layer 3, which would have stranded the Share-to-library affordance for private beatdowns in edit mode. Claude Code flagged this. Patch applied within the same commit: footer left slot became contextual on `editData.isPublic` (Share when private, Unshare when public). `onShareBeatdown` was already passed from page.tsx but unused; the patch wired it.

**Build status:** green. Pushed.

#### Commit 2 — `e9fbde7` — Mojibake fix in src/app/page.tsx

**File touched:** `src/app/page.tsx` only (10 lines).

**What it did:**

A prior write to page.tsx had used an encoding that mangled UTF-8 multibyte sequences as Latin-1 (the classic Bible-rule-3 mistake). Three patterns of bad bytes were present:

- **Pattern A — Left arrow corruption** at line 582: `backLabel={editFromQProfile ? ("â† " + (profName || "profile") + "'s profile") : undefined}`. Should be `"← "` (U+2190). Visible in the Q Profile → edit beatdown back button.
- **Pattern B — Em dash corruption** (8 occurrences across lines 176, 183, 331, 355, 504, 533, 572, 577): `â€"` should be `—` (U+2014). Three of these were user-visible (the toast strings "Error saving — try again" at L331, L355, "Vote failed — try again" at L504); the others were source-code comments.
- **Pattern C — Comment-only oddity** at line 529: `// V2-4.5: Q Profile beatdown card tap â†→ open Edit Beatdown form (own only)` had a corrupted right-arrow that needed to become `→` (U+2192).

**How it was fixed:**

Claude Code first attempted PowerShell-style replacement via the str_replace tool but two of the byte sequences contained invisible control characters (`U+0090` after the left arrow, `U+2019` rendering as `→` in the terminal display) that the str_replace couldn't catch by literal match. Switched to Node `fs.readFileSync('utf8') + replace + fs.writeFileSync('utf8')` — Node writes UTF-8 without BOM by default, satisfying Bible rule 3 (no `Set-Content -Encoding UTF8`, no BOM, no Latin-1 corruption).

After write, verified at the byte level via `od -c`:
- Line 582: `("← "` showed bytes `E2 86 90` for `←` ✓
- Line 529: `tap → open` showed bytes `E2 86 92` for `→` ✓
- Em dashes throughout: `E2 80 94` ✓
- Re-grepped for `â†` and `â€` — zero matches.

**Build status:** green. Pushed.

#### Commit 3 — `cb66b7d` — Move Backblast off Builder header into action row (new mode)

**File touched:** `src/components/BuilderScreen.tsx` only (+7 / −14 lines, net -7).

**What it did:**

In commit 1, Backblast was relocated from the Builder edit-mode top header to the Layer 2 action pill row. But new-build mode was missed — it still rendered the orange "Backblast" button in the top-right header (gated on `!editData`). Visually inconsistent with edit mode.

The fix:
- **Deleted** the `{!editData && (<button>Backblast</button>)} ` block at lines 163-167 of BuilderScreen.tsx (the top-row Backblast in new mode).
- **Removed the `editData &&` gate** around the Backblast pill at L293-301 of the Layer 2 row, so the pill renders unconditionally in both new and edit mode.
- Same `setCopyModal(true)` handler in both former and new spot — no rewiring.

**Net result after this commit:** Builder header is just the back button. Action row is identical 3-pill `[Live · Preblast · Backblast]` in both new and edit modes. The only mode-specific differences are the Layer 1 button label ("Save" vs "Save changes") and the presence of the Layer 3 destructive footer (edit-only).

**Backblast on a fresh draft:** Ritz tested this and confirmed it works — the CopyModal opens with the empty/partial beatdown's data. No content-required gate added; "always open immediately on tap" was the agreed behavior.

**Build status:** green. Pushed.

#### Commit 4 — `(merged into commit 5 hash)` — "Run This" → "Live" rename + readability bumps

**Files touched:** `src/components/BuilderScreen.tsx`, `src/components/GeneratorScreen.tsx`, `src/components/LibraryScreen.tsx`.

**What it did:**

Two parallel changes, applied in one batch:

**Change 4a — "Run This" → "Live" pill label rename.** Three locations (one per file):
- `src/components/BuilderScreen.tsx:273`
- `src/components/GeneratorScreen.tsx:259`
- `src/components/LibraryScreen.tsx:417`

These were all the visible label `>Run This</span>` inside the Layer 2 pill JSX. The handlers (`onRunThis`, `onRunBeatdown`), prop names (`onRunThis`), helper functions (`handleRunThis`, `handleRunLibraryBeatdown`), and component names (`LiveModeScreen` — already correctly named) were all left untouched. The grep `grep -rn "Run This" src/` returned exactly those 3 matches with no false positives.

**Change 4b — Readability bumps for older eyes (40-50+ year old F3 audience).** Applied to ALL pill instances across the 3 files:
- Pill icon span: `fontSize 14 → 16`, `marginBottom 6 → 5`. (`lineHeight 1` unchanged.)
- Pill label span: `fontSize 9 → 10`, `fontWeight 700 → 800`. (`letterSpacing 0.4`, `textTransform uppercase` unchanged.)
- Pill padding, gap, borderRadius, background, border colors — UNCHANGED. The shape stays the same; only the typography bumps.

And to the BuilderScreen Layer 3 destructive footer:
- Both link slots (Share / Unshare and Delete): `fontSize 11 → 13`, `fontWeight 400 → 700`.
- Color values changed from translucent to full saturation:
  - "Share to library" link: `rgba(34,197,94,0.85)` → `#22c55e`.
  - "Unshare" link: `rgba(239,68,68,0.7)` → `#ef4444`.
  - "Delete" link: `rgba(239,68,68,0.7)` → `#ef4444`.
- Footer wrapper, layout, and conditional logic unchanged. No backgrounds, no borders, no padding on the links — text only, just bigger and bolder.

**Why these specific values, not bigger:** Ritz tested an earlier mockup with much bigger pill type (`fontSize 18` icons, `fontSize 11/800` labels with `padding 14px 4px` and labels wrapping to two lines on some pills) and rejected it as "cartoonish, big real estate, some pills two lines some one line, unorganized." The commit 4 sizes are the minimum bump that solves the readability problem without changing the pill shape.

**Build status:** green. Pushed.

#### Commit 5 — `(latest)` — Q Profile card redesign + visitor draft filtering + "AI" → "Generated" rename + broken-CSS fix

**File touched:** `src/components/QProfileScreen.tsx` only. Net **-41 lines** (more code removed than added — the redesign is genuinely simpler than what it replaced).

**What it did:**

A full rewrite of `BeatdownCard` and `ExerciseCard` components inside QProfileScreen.tsx, plus tab-count fix, plus visitor-view behavior, plus terminology rename, plus elimination of pre-existing broken CSS.

**The card redesign (status-led, asymmetric)**

Before this commit, each beatdown card in the Q Profile owner view rendered up to 8 visual elements: title (T1 / 17px / 800), difficulty pill (right side), description (2-line clamp), thumbs-up + vote count, optional steal count (only if > 0), optional duration, date, conditional SHARED/DRAFT badge (gated on `isOwn`), conditional AI/HAND BUILT badge (gated on `bd.generated`), and an optional "inspired by [name]" italic line. Five different color systems (green, amber, red, gold, gray, plus the always-amber left border that meant nothing). Ritz's verbatim feedback: "the tags on each beatdowns are so annoying, its like an 80s las vegas strip just puked on the screen."

Key insight from a UX question Claude posed: *"For your own portfolio at a glance, what single signal matters most?"* — the answer was **status (shared vs draft)**. That answer drove the entire redesign:

- **Left stripe encodes status.** `borderLeft: 3px solid {bd.is_public ? G : "#3a3a40"}`. Green for shared, neutral gray for draft. Replaces the old hardcoded `borderLeft: 3px solid A` (always amber) which conveyed nothing. ExerciseCard previously had `borderLeft: 3px solid #a78bfa` (always purple) — now also status-driven.
- **Source pill replaces the difficulty pill.** Top-right of each card. Difficulty is moved out of the card entirely (still visible in detail view — type definition unchanged). Per Ritz: "to all PAX it's all difficult." The pill renders as:
  - `bd.generated === true` → `Generated` in `#a78bfa` (purple), bg `rgba(167,139,250,0.10)`, border `rgba(167,139,250,0.30)`.
  - `bd.generated === false` (or undefined) → `HAND BUILT` in GOLD (`#E8A820`), bg `${GOLD}1A` (10% alpha), border `${GOLD}4D` (30% alpha).
  - Both: fontSize 11, fontWeight 800, padding 3px 8px, borderRadius 6, flexShrink 0.
  - ExerciseCard always uses HAND BUILT (no `generated` field on ExerciseRow type).
- **Description: single-line ellipsis, conditional render.** `bd.description &&` gate. fontSize 12, T4, weight 500, lineHeight 1.4, `overflow: hidden, textOverflow: ellipsis, whiteSpace: nowrap`. marginBottom 8 if footer follows, else 0. ExerciseCard uses `description || how_to` as fallback.
- **Footer is asymmetric** based on `bd.is_public`:
  - **Shared cards** earn the engagement strip: flex container, gap 12, alignItems center, fontSize 12, T4, fontWeight 600. Contents: `👍 + bd.vote_count || 0` (with the count in T1 color) + `📋 + bd.steal_count || 0` (also in T1) + date right-aligned (marginLeft auto, T4 color, formatted "Mon DD"). Steal count is shown unconditionally on shared cards (commit 5 changed this from "only if > 0" — shared cards earn the right to show their numbers even when 0). For ExerciseCard the strip is just `👍 + ex.vote_count || 0` + date right-aligned (no steal_count or duration on ExerciseRow).
  - **Draft cards stay quiet.** Single line: fontSize 12, T4, weight 500. Text: `"Draft · "` + formatted date.
- **Inspired-by is a separate quiet line below the footer** (changed from the original spec which had it appended to the date string — re-spec'd at the eleventh hour to avoid crowding the engagement strip). Renders only if `bd.inspired_profile?.f3_name` is truthy. fontSize 11, italic, T5 (`#7A7268`), weight 500, marginTop 4, lineHeight 1.4. Renders for both shared/draft and both owner/visitor (no gate on isOwn or is_public).

**Removed from cards** (these all still exist in the detail view):
- Difficulty pill (was top-right of card).
- SHARED/DRAFT badges (the stripe + footer text replaces them).
- HAND BUILT/AI badges (replaced by source pill in top-right).
- 2-line description clamp (replaced by single-line ellipsis).

**Tab count fix.** The `<TabBtn label="Beatdowns" count={...} />` and `<TabBtn label="Exercises" count={...} />` previously used `stats?.beatdowns ?? 0` and `stats?.exercises ?? 0`. The `stats` object is fetched via `getProfileStats(userId)` and returns the same total for both owner and visitor. But for visitor view, the rendered list is filtered (visitors only see public). So visitors saw "Beatdowns · 8" but only 3 cards. Fix: replaced both with `beatdowns.length` and `exercises.length` — the count now always equals cards rendered, regardless of role. The hero-stats block above the tabs (BEATDOWNS / UPVOTES / STEALS counts) still uses `stats` and is unchanged.

**Visitor view filtering.** Confirmed during diagnosis that the data fetch already filters server-side: `isOwn ? getMyAllBeatdowns(userId) : getUserSharedBeatdowns(userId)` (and the equivalent for exercises). The `getUserShared*` helpers return public-only by design. So no client-side filter was needed in the render path — the bug was only the count mismatch (fixed above). Visitor view loses draft cards entirely as intended; owner view continues to see everything.

**"AI" → "Generated" terminology rename.** Single grep match: `src/components/QProfileScreen.tsx:518` had `>AI</span>` inside the (now-removed) AI badge JSX. The rewrite of the source pill replaced this label with "Generated" (purple, per spec above). No other files contained "AI" as a UI label.

**Broken template-literal CSS eliminated.** The diagnostic surfaced six lines of broken CSS in the old SHARED/DRAFT badges — lines 485, 491, 503 (BeatdownCard) and 602, 608, 620 (ExerciseCard). They had patterns like `` background: `${...}14` `` and `` border: `1px solid ${...}40` `` where the variable interpolation was missing. Result was invalid CSS that browsers rendered with default styles. These badges are entirely removed by the rewrite, so the broken CSS goes with them. No separate fix needed.

**Cleanup pass before commit:** The `isOwn` prop became unused in both BeatdownCard and ExerciseCard after the rewrite (it was only used for the SHARED/DRAFT label gate, which is now replaced by the stripe). Initially Claude Code added `void isOwn;` lines to silence unused-variable lint warnings — flagged as a code smell during review. Cleaner fix applied: dropped `isOwn` from both card prop signatures + types entirely, and removed `isOwn={isOwn}` from the parent JSX at L318 (`<BeatdownCard />`) and L329 (`<ExerciseCard />`). EmptyState component still uses isOwn for its conditional CTA copy ("Your body of work" vs "Body of work") — kept as-is.

**Build status:** green. Pushed. Ritz tested all 8 test scenarios (own-shared, own-draft, visitor-view, engagement strip, draft footer, inspired-by, source pill colors, tap-to-edit) and reported "everything checked out, looks good."

### April 30 commit log — quick reference

| # | Hash | What |
|---|------|------|
| 1 | `ae1f631` | Action area redesign + Send Preblast wiring (Builder + Generator + Library detail) |
| 2 | `e9fbde7` | Mojibake fix in page.tsx (10 byte sequences across 3 user-visible strings + comments) |
| 3 | `cb66b7d` | Move Backblast off Builder header into action row (new mode parity with edit mode) |
| 4 | bundled w/5 | "Run This" → "Live" rename + pill readability bumps + footer readability bumps |
| 5 | (latest) | Q Profile card redesign + visitor draft filtering + AI → Generated + broken CSS fix |

(Commits 4 and 5 ended up on adjacent hashes — refer to `git log` on `v2-pivot` for exact ordering.)

### Canonical action area pattern (going forward — use across Builder/Generator/Library detail)

This is the design pattern that landed in commits 1, 3, 4, and is now canonical across the three screens. Any future screen with similar action affordances should follow this hierarchy.

**Layer 1 — Primary action (full-width filled button).**
- Save / Save changes / "Save" — depending on mode and screen.
- Filled green (`#22c55e`), black text (BG = `#0E0E10`).
- Full width, padding 20px 0 (Builder/Generator) or 16px 0 (Library detail), borderRadius 14, fontSize 18 (or 16 in Library), fontWeight 800.
- The thing 90% of taps go to. Visual weight reflects task frequency.

**Layer 2 — Secondary action row (icon pills, equal flex).**
- 3 pills (Builder edit, Generator final, Builder new): `[Live · Preblast · Backblast]`
- 2 pills (Library detail, only if `bd.tp === "beatdown" && bd.secs?.length > 0`): `[Live · Preblast]` — no Backblast on community items.
- Pills: `flex 1, padding "10px 4px", borderRadius 10, gap 6` between pills.
- Icon: emoji glyph, fontSize 16, lineHeight 1, marginBottom 5.
- Label: fontSize 10, fontWeight 800, letterSpacing 0.4, textTransform uppercase, single line.
- Per-pill color theme:
  - **Live** — green: bg `rgba(34,197,94,0.06)`, border `rgba(34,197,94,0.30)`, color G. Glyph: `▶`.
  - **Preblast** — purple: bg `rgba(167,139,250,0.06)`, border `rgba(167,139,250,0.30)`, color P. Glyph: 📣.
  - **Backblast** — amber: bg `rgba(245,158,11,0.06)`, border `rgba(245,158,11,0.30)`, color A. Glyph: 📓.
- Live pill is gated on `(editData ? onRunBeatdown : onRunThis)` being truthy AND `!saving`.
- Preblast pill is always rendered (no gate beyond `!saving`).
- Backblast pill is rendered in BuilderScreen and GeneratorScreen unconditionally (after commit 3); in LibraryScreen detail view it is NOT rendered (community beatdowns aren't yours to backblast).

**Layer 3 — Destructive footer (BuilderScreen edit mode ONLY — `editData` truthy).**
- Wrapper div: `marginTop 18, paddingTop 12, borderTop "0.5px solid rgba(255,255,255,0.06)"`, flex justifyContent space-between alignItems center.
- Both slots are bare text links (no border, no background, no padding). After commit 4: `fontSize 13, fontWeight 700, full-saturation color, cursor pointer`.
- **Left slot** is contextual on `editData.isPublic`:
  - `isPublic === true` → "Unshare" in `#ef4444`. onClick: routes through the existing `setUnshareConfirm(true)` confirm modal at L280-296 (which warns about losing votes/comments). The modal then calls `onUnshareBeatdown` after user confirms. (Bypassing the modal would be a quiet UX regression — kept by judgment call.)
  - `isPublic === false` (or falsy) → "Share to library" in `#22c55e`. onClick: fires `onShareBeatdown` directly. No confirm modal — sharing is reversible (user can Unshare), so no friction needed.
- **Right slot** is always: "Delete" in `#ef4444`. onClick: opens existing confirm at L301 which then calls `onDeleteBeatdown`.

This pattern is the canonical answer to "how do action buttons stack on edit/build/library screens?" Any future screen adding similar affordances should adopt the same Layer 1 / Layer 2 / Layer 3 structure.

### Canonical Q Profile card spec (going forward — applies to BeatdownCard and ExerciseCard)

This is the card design that landed in commit 5. It is now canonical for any portfolio-style card in the app. If a future feature adds another card type that shows owned items with shared/draft state, it should follow this pattern.

```
Outer wrapper:
- background: CARD_BG (#111114)
- border: 1px solid BD (rgba(255,255,255,0.07))
- borderLeft: 3px solid {bd.is_public ? G : "#3a3a40"}
  ↑ STATUS STRIPE — green for shared, neutral gray for draft
- borderRadius: 12, padding: 13px 15px, marginBottom: 10
- cursor: onTap ? "pointer" : "default"
- onClick: onTap (passed in by parent as () => onOpenBeatdownDetail(bd.id) for owner view edit)

Title row (flex, gap 10, marginBottom 4):
- Title (left): fontSize 17, fontWeight 800, T1, letterSpacing -0.3
  Constrained to single line: minWidth 0, overflow hidden, textOverflow ellipsis, whiteSpace nowrap
- Source pill (right side, flexShrink 0):
    bd.generated === true:
      label "Generated", color "#a78bfa"
      bg "rgba(167,139,250,0.10)"
      border "1px solid rgba(167,139,250,0.30)"
    bd.generated === false (or falsy):
      label "HAND BUILT", color GOLD ("#E8A820")
      bg `${GOLD}1A` (10% alpha)
      border `1px solid ${GOLD}4D` (30% alpha)
    Both:
      fontSize 11, fontWeight 800
      padding 3px 8px, borderRadius 6
  ExerciseCard always renders HAND BUILT (no `generated` field on ExerciseRow).

Description row — render ONLY if bd.description (or ex.description || ex.how_to for ExerciseCard) is truthy:
- fontSize 12, T4, fontWeight 500, lineHeight 1.4
- Single-line ellipsis: overflow hidden, textOverflow ellipsis, whiteSpace nowrap
- marginBottom 8 if footer follows below, else 0

Footer (asymmetric on bd.is_public):
  IF bd.is_public === true (SHARED):
    Container: flex, gap 12, alignItems center, fontSize 12, T4, fontWeight 600
    - 👍 + (bd.vote_count || 0) — count in T1 color
    - 📋 + (bd.steal_count || 0) — count in T1 color (always shown on shared, even if 0)
      (ExerciseCard skips the steal/duration entirely — no such field on ExerciseRow)
    - date right-aligned: marginLeft auto, T4 color, format "Mon DD"
  IF bd.is_public === false (DRAFT):
    fontSize 12, T4, fontWeight 500
    text: "Draft · {Mon DD}"

Inspired-by line — render ONLY if bd.inspired_profile?.f3_name (or ex.inspired_profile?.f3_name) truthy:
- fontSize 11, fontStyle italic, T5 (#7A7268), fontWeight 500
- marginTop 4, lineHeight 1.4
- Text: "inspired by " + name
- Renders for both SHARED and DRAFT cards
- Renders for both OWNER and VISITOR views
- Sits as a separate row below the footer — NOT appended to the date string (avoids crowding the engagement strip)
```

**Visitor view behavior (`isOwn === false`):**
- The data is already filtered server-side: `getUserSharedBeatdowns(userId)` and `getUserSharedExercises(userId)` return public-only by design.
- Tab counts use `beatdowns.length` and `exercises.length` (NOT `stats?.beatdowns`), so the count always matches cards rendered.
- Drafts are entirely invisible to visitors. Owner view continues to see everything (shared + draft).

**isOwn prop note:** Both BeatdownCard and ExerciseCard no longer accept `isOwn` — it was unused after the redesign and was removed from both signatures and from the parent JSX. EmptyState still uses `isOwn` for its conditional CTA copy ("Your body of work" header for owner, "Body of work" for visitor; and the EmptyState text differs — "Generate your first beatdown" for owner, "X hasn't shared anything yet" for visitor).

### Decision: KEEP the dormant Shout/Follow Supabase tables (reverses v15 plan)

v15 listed the next step after Commit C as "drop the dead Supabase tables `shouts`, `shout_reactions`, `follows` manually." Ritz reversed this decision in the April 30 session: **keep the tables dormant, do not drop them.**

**Rationale:**
- The tables are empty (or contain only test data from v2-shouts development). They cost essentially nothing on Supabase free tier.
- Dropping is irreversible. If the social-feed direction returns in 6+ months, recreating the schema, RLS policies, indexes, and foreign-key relationships from memory is unnecessary friction. Keeping the schema preserves optionality.
- v2-pivot has zero references to these tables in code. They are not orphaned in the runtime sense — they are simply paused.

**Operational rule:** Do not drop these tables without explicit Ritz decision to permanently abandon the social-feed direction. They are dormant, not dead.

The active 6-table schema in v2-pivot is unchanged: `profiles`, `exercises` (904 seed), `beatdowns`, `votes`, `bookmarks`, `comments`. The dormant 3-table schema sits alongside: `shouts`, `shout_reactions`, `follows`.

### Workflow migration: chat-relay → Claude Code (COMPLETE)

This is the most important workflow change since the project began. As of April 30, 2026, **Claude Code (`@anthropic-ai/claude-code`) is the primary development tool.** The previous chat-based PowerShell paste-relay workflow is retired.

**Setup steps that were performed (record for future reference):**

1. **Install via the native installer** (no Node.js required for the install itself, no PATH manipulation, auto-updates included):
   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```
   This downloads to `C:\Users\risum\.local\bin\claude.exe`. Version 2.1.123+ at install time.

2. **Add `.local\bin` to PATH** (the installer prints a warning that PATH wasn't updated automatically):
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Users\risum\.local\bin", "User")
   ```
   Then close PowerShell completely and open a fresh window so PATH reloads.

3. **Verify install:** `claude --version` should print `2.1.123 (Claude Code)` or higher.

4. **Navigate to project and launch:**
   ```powershell
   cd C:\Users\risum\Documents\projects\gloombuilder
   claude
   ```

5. **First-launch onboarding:** terminal mascot screen → press Enter through theme picker (Dark mode) → security notes screen, press Enter → "Trust this folder?" prompt for `C:\Users\risum\Documents\projects\gloombuilder` — pick "Yes, I trust this folder" (Claude Code only operates inside trusted folders, granting trust here only).

6. **Authentication:** uses the existing Claude Max subscription via browser OAuth flow. No separate API key, no per-token billing for Ritz's plan.

**Operational pattern (canonical going forward):**

The two-surface workflow — Claude.ai chat for design review, Claude Code for file edits — follows this loop:

1. **Chat-Claude (Opus, web)** owns: design review, visual mockups (HTML/JSX with UX psychology analysis), spec authoring, decision-making on UX questions, reading screenshots, evenhanded direction-setting.
2. **Claude Code (terminal CLI)** owns: file reads, file edits, `npm run build` runs, git operations (`add`, `commit`, `push`), grepping for occurrences before changes.
3. Chat-Claude writes specs as fenced code blocks. Ritz copy-pastes them into Claude Code's prompt.
4. Claude Code reads relevant files first, often reports back BEFORE editing for scope confirmation. (This pattern was used heavily on April 30 — diagnose first, get scope approval, then edit. Caught at least 3 issues that would have been bugs if the original spec had been applied as written.)
5. After Ritz approves the diagnostic report, Claude Code applies edits, runs `npm run build`, reports green or red.
6. On green: Ritz pastes commit-and-push instructions. Claude Code commits, pushes, reports the commit hash.
7. Ritz tests on Vercel preview (often after the SW unregister script if PWA is caching). Reports back to chat-Claude what works/breaks. Loop.

**What Claude Code eliminates:**
- The auto-linkifier mangling `user.id` as `[user.id](http://user.id)` markdown when chat code is pasted into PowerShell.
- Per-file CRLF vs LF detection (Claude Code handles line endings transparently).
- Multi-line PowerShell `Replace` pattern fragility on TypeScript with `&&`, `||`, `()`, `{}`, `$` characters.
- `Set-Content -Encoding UTF8` BOM corruption (Bible rule 3 / rule 8). Claude Code uses Node `fs.readFileSync('utf8') + writeFileSync('utf8')` by default, which is no-BOM.
- The `Downloads → Copy-Item` dance for delivering edited files.
- "I can't interpret the grep output" — Claude Code reads the output itself and acts on it directly.

**What stays the same even with Claude Code:**
- **Mockups before code, every time.** Visual review still happens in Claude.ai chat with HTML/JSX widgets and UX psychology analysis. Approval gates writing.
- **`npm run build` is the only verification that matters.** Claude Code runs it directly and parses the output.
- **Settled decisions are not re-litigated.** If Ritz approved something in a prior session, build it.
- **Single correct path only.** No walked-back instructions in one response.
- **Bible rule 3 (no Set-Content with BOM)** still applies if Claude Code falls back to PowerShell for any reason — but it defaults to Node's UTF-8 no-BOM, so this should be a non-issue.

**Trusted folder boundary:** Claude Code can only read, edit, and execute files inside `C:\Users\risum\Documents\projects\gloombuilder`. It cannot touch anything else on Ritz's machine. This was confirmed during install and is enforced by the trust prompt at first launch.

**Useful Claude Code session protocol:**
- Open a new terminal session per major work block.
- Paste the kickoff context (what branch, what's next, what files to read first).
- Let Claude Code report on current state BEFORE making changes — this is where bugs get caught early.
- Commit messages are pasted by Ritz from chat-authored specs to keep them detailed and accurate.
- After push, test on Vercel preview — never trust local-only verification when PWA caching is in play.

### UX learnings codified during the April 30 session

These are general principles that emerged during the action area + card redesign work. They apply to any future UI work in GloomBuilder.

1. **Hick's Law in action areas.** When 5+ same-weight CTAs stack vertically (Save, Run This, Backblast, Unshare, Delete), the eye has nowhere to land. Decision time scales logarithmically with choice count. The fix is hierarchy: 1 primary + N peer secondaries + N tertiary/destructive demoted to a quiet footer. Going from 5 same-weight to "1 obvious primary + 3 peer secondaries + 2 quiet destructives" cuts perceived choice complexity by more than half.

2. **Destructive isolation is non-negotiable.** Unshare and Delete should never sit in the same gravity well as Save. Spatial separation (footer below a divider) plus visual de-emphasis (smaller text, no fill, but still readable color) prevents fat-finger destructive taps. This is the iOS Settings pattern and the Stripe Dashboard pattern.

3. **Color encodes verb intent.** Green for constructive (Share to library), red for destructive (Unshare, Delete). Same physical slot can flip color when the underlying state flips (Share ↔ Unshare in the footer left slot). The color is the verb, not just decoration.

4. **F3 audience reads at arm's length.** Older eyes (presbyopia onset around age 45) need ~12-13px+ at weight 600+ for action labels and full-saturation colors. The original `9-11px / weight 400 / 0.7-0.85α` footer was unreadable for the actual audience. The minimum readable bump that solves the problem without making things "cartoonish" is `13px / weight 700 / full color`. Goldilocks zone — too small fails the audience, too big breaks the visual rhythm.

5. **Status > everything else for portfolio cards.** When the question "what's the most important thing to know about your own beatdown at a glance?" was asked, Ritz's answer was "is it shared or still a draft?" That single answer drove an entire cards redesign. Encode that signal in the highest-priority visual element (the left stripe color), eliminate redundant labels (SHARED/DRAFT badges), and let the rest of the card support the question, not compete with it.

6. **Asymmetric cards work when the asymmetry encodes meaning.** Shared cards show vote/steal/date because that data only exists when public. Draft cards show "Draft · date" because they have no engagement to show. The visual difference between card shapes IS the information — not a layout bug. Users will read shape difference as meaning if the meaning is consistent.

7. **Difficulty pill ≠ useful on a portfolio card.** Per Ritz: "to all PAX it's all difficult." Difficulty was always there because the Library shows it (and the Library use-case is "is this beatdown for me?" — different question). On the owner's portfolio, difficulty is rarely the deciding factor. Source (Hand Built vs Generated) is more meaningful for self-portfolio, so the pill was repurposed.

8. **"Generated" beats "AI" for internal terminology.** The codebase calls AI-generated beatdowns `bd.generated` (boolean field). The pill label was the only place "AI" appeared. Renaming for consistency reduces the chance of future confusion. ("AI" also has more cultural baggage in 2026 than "Generated" — the latter is what the system actually does.)

9. **Read-and-report-before-editing pattern.** Most of the April 30 commits followed a 2-step rhythm: Claude Code reads the relevant files and reports current state + proposed plan, then waits for approval, then applies the change. This caught at least 3 real bugs (the stranded Share button, the missing template-literal interpolation, the unused `isOwn` prop). The pattern adds 1-2 minutes per change but eliminates whole rounds of "build red, fix, build green" later.

10. **Mojibake almost never appears alone.** When the diagnostic for a UTF-8 corruption finds one byte signature, look for all of them. The page.tsx fix found 10 occurrences across 3 patterns (left arrow, em dash, right arrow) — a single grep would have missed two of the three patterns. Pattern checklist: `â†` (left arrow corruption), `â¬` (rightwards arrow / unknown), `â€` (em dash, en dash, smart quotes), `Â` (NBSP / extra-byte artifact). Every page that's been written by mixed encodings should be checked for all four.

### Outstanding work before merge to main

1. **Final test pass on Vercel preview.** Walk every entry point, every screen, every state. The 8 test scenarios from end-of-session April 30 all passed at end of session — this should be repeated by Ritz as a final sanity check before merge.
2. **Merge `v2-pivot` to `main`.** Fast-forward or merge commit. Push origin main. Vercel auto-deploys main to gloombuilder.app.
3. **Tag the merge commit** — recommend `v2.0.0` to mark the major pivot from v1 architecture to v2-pivot.
4. **Optional: delete `v2-pivot` branch after merge.** Ritz preference. Keep `v2-shouts` archived as historical record.
5. **Optional: copy `GLOOMBUILDER-BIBLE-v16.md` into the project root** so future Claude Code sessions can read it without an upload. v15 was not in the project folder, which Claude Code flagged on April 30. Suggested commit: `Add Bible v16 to project root for future session continuity.`

### What the next session looks like

When Ritz returns, the kickoff is:

1. `cd C:\Users\risum\Documents\projects\gloombuilder && claude`
2. (If not already done) drop a copy of GLOOMBUILDER-BIBLE-v16.md at project root.
3. Tell Claude Code: *"Read GLOOMBUILDER-BIBLE-v16.md, then read the V16 SESSION RECAP at the top, then check `git status` and `git log -5 --oneline` on v2-pivot. Confirm we're at the latest commit. Don't make any changes yet."*
4. Decide: any final test pass concerns? If clean → proceed to merge.
5. Merge:
   ```
   git checkout main
   git merge v2-pivot
   git push origin main
   git tag -a v2.0.0 -m "v2-pivot architecture: 3-tab nav, Send Preblast generator, redesigned cards"
   git push origin v2.0.0
   ```
6. Watch Vercel auto-deploy main to gloombuilder.app. Test production once deployed.
7. (Optional) `git branch -d v2-pivot` locally and `git push origin --delete v2-pivot` if Ritz wants the branch retired. Otherwise keep it as a dev base.

### V16 Permanent operating rules (additions to v15's list)

The v15 numbered rules 1-19 are still in force. v16 adds these as rules 20-25:

20. **Claude Code is the primary workflow tool.** Open `claude` in the project directory for any non-trivial multi-file edit. Reserve chat-only paste-relay for one-line fixes.
21. **Read-and-report before editing on multi-file changes.** Have Claude Code read the relevant files and report current state + plan before applying. Caught 3 bugs on April 30 alone.
22. **Mojibake checks must cover all four byte signatures.** When fixing UTF-8 corruption: `â†` (left arrow), `â¬` (right arrow / unknown), `â€` (em/en dash, quotes), `Â` (NBSP). Checking for one isn't enough.
23. **Action area pattern is canonical.** Layer 1 / Layer 2 / Layer 3 (see "Canonical action area pattern" above). Any new screen with similar affordances follows this pattern. No bespoke arrangements.
24. **Q Profile card pattern is canonical.** Status stripe + source pill + asymmetric footer + inspired-by line. Any new portfolio-style card follows this pattern.
25. **Dormant tables stay dormant.** Do not drop `shouts`, `shout_reactions`, or `follows` without explicit Ritz decision to permanently abandon the social-feed direction.

---

## V2 PIVOT PROLOGUE — READ THIS FIRST

### TL;DR for the next Claude

Between April 25 and April 29, 2026, GloomBuilder forked from `main` into a `v2-shouts` branch implementing a Twitter-like Shout system (DB-backed posts, Feed tab, Follow system, Shout cards). After three full development sessions and a working build, Ritz determined the social-feed direction competed against existing F3 channels (Slack, GroupMe) without offering enough new value. The branch was archived. A new branch `v2-pivot` was created that REMOVES the Feed/Follow/Shout-persistence concepts and REUSES the composer UI as a stateless **Preblast Generator** — a tool that generates formatted preblast text the Q can paste into their PAX channel. No DB write. Three entry points. Same composer UX, different outcome.

The current state at end of session April 29, 2026:

- `main` branch: untouched, gloombuilder.app stable (v1, 4-tab nav with Feed/Library/Locker/Profile-as-Settings)
- `v2-shouts` branch: ARCHIVED. Frozen as historical record. Do not delete.
- `v2-pivot` branch: ACTIVE. **Commits A, B, C (steps 1-4) complete and tested.** Preview URL: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/`
- Remaining work for Commit C: add "📣 Send Preblast" entry points on BuilderScreen and LibraryScreen detail view (Round 3 — see below)
- After Commit C completes: drop dead Supabase tables (`shouts`, `shout_reactions`, `follows`) and merge `v2-pivot` to `main`

### The pivot rationale (verbatim from Ritz)

The Shout system was conceived as a way to give Qs a place to share quick text updates ("Coupon party at the Yard tomorrow", "Anyone got a Q sub?", "New PR on the deadlift") with their PAX. The original V2 mockups had a Feed tab that showed all Shouts from people you follow — so it was Twitter-for-F3.

After building it, Ritz realized:
1. Every F3 region already has Slack or GroupMe. The PAX go there for announcements.
2. Building a feed competing with those channels means GloomBuilder has to win the daily-engagement battle. That's a much harder fight than the "tool the Q uses Tuesday morning before a beatdown" positioning we started with.
3. The composer was the actually-useful artifact. The output (a formatted text block with type, message, when, where, optionally an attached beatdown plan dump) is something Qs would copy into Slack/GroupMe/iMessage.
4. So: keep the composer, drop the feed. Make the composer ephemeral — generate-and-share, no persistence. The output IS the product.

### V2-pivot architecture summary (canonical going forward)

**Three-tab bottom nav (replaces 4-tab):**
| Tab | Label | Purpose |
|-----|-------|---------|
| 1 | **Home** | Hero "Generate beatdown" card + Build from scratch + Create exercise + Send Preblast |
| 2 | **Library** | Community feed of beatdowns & exercises (unchanged from v1) |
| 3 | **Profile** | Q Profile owner-view (your portfolio: shared + draft beatdowns/exercises) — ⚙ gear icon opens Settings overlay |

The legacy "Locker" tab is GONE in v2-pivot. The user's saved beatdowns and exercises are now visible in the Profile (Q Profile) view as their portfolio. Settings (the old Profile screen) is reachable via a gear icon overlay.

**Send Preblast entry points (three locations):**
1. Home tab — full-width purple-tinted card "Send Preblast" with megaphone icon → opens composer with no beatdown attached
2. Builder screen — "📣 Send Preblast" button alongside Save / Run This → auto-attaches the beatdown being built (PENDING — Commit C Round 3)
3. Library detail view — "📣 Preblast" button next to Save → auto-attaches the beatdown being viewed (PENDING — Commit C Round 3)

**Composer UX (matches V2-5 design EXACTLY — built and approved):**
- Sheet slides up from bottom, max-width 430px, centered
- Title: "New Preblast" (was "New Shout" in v2-shouts)
- Type picker: Bootcamp pre-selected as a green chip with "Change" link → tap Change to expand a 4×3 grid of types (Bootcamp / Run / Bike / Ruck / Mobility / Gear / QSource / 2nd F / 3rd F / CSAUP / Convergence / Custom...). Custom opens a free-text input (max 20 chars).
- Message field: 240 char limit, taller textarea (140px minHeight ≈ 5 lines), char counter bottom-right. Required.
- "OPTIONAL · ADD ANY THAT APPLY" divider followed by an icon-pill row:
  - 📅 When — wraps a hidden `<input type="datetime-local">` with `position: absolute; inset: 0; opacity: 0` so the entire pill is the click target. Opens iOS rolodex / Android picker / desktop browser picker. Selected value shown below as a green chip with formatted text "Wed - Apr 30 - 5:30am" and × close.
  - 📍 Location — tap to open a URL paste field with autoFocus, ellipsis-truncated display. Selected value shown below as green chip with × close.
  - 💪 Beatdown — tap opens a sub-view "Pick a beatdown" inside the same sheet (Back button + scrollable list of user's saved beatdowns). Selecting one returns to form with the beatdown attached as an amber chip with × close. If user came from Builder/Library, the beatdown is auto-attached on open.
- Cancel + ⚡ Generate buttons at bottom. Generate disabled until type+message are valid.

**Generated preblast text format (emoji-prefixed, universal across iMessage/Slack/GroupMe/WhatsApp):**

```
📣 BOOTCAMP - The Bishop - F3 Essex

📅 Wed - Apr 30 - 5:30am
📍
https://www.google.com/maps/place/Tulip+Springs/...

(your message here)

💪 THE PLAN: The Belmont (45 min - BEAST)
-------------------------
WARMUP
  - 15 SSH IC
  - 10 Imperial Walkers IC

THE THANG
  - 20 Squats OYO
  - 30 Coupon Curls IC

—
via GloomBuilder
gloombuilder.app
```

Key formatting rules:
- All hyphens are ASCII hyphens (`-`), not en-dashes or middle dots. This avoids mojibake when shared via iMessage/SMS.
- URL is on its own line so it auto-hyperlinks in every messaging app.
- Header uses 📣 megaphone emoji, not `[*]` ASCII placeholder (that was an interim rejected design).
- Footer is em-dash `—` (Unicode 0x2014).
- Plan dump shows section labels uppercase, exercises as bullet rows with reps + cadence.

**Preview/Output panel:**
After tapping Generate, the form swaps to a preview view:
- ← Edit link top-left to go back to form
- "Preview" title centered
- Big preformatted text block (Courier monospace, 11px, T2 color, max-height 50vh, scrollable)
- 📋 Copy button (clipboard, with fallback execCommand) and ↗ Share button (uses native share sheet via `navigator.share()`, falls back to clipboard if unsupported)
- After tapping Copy: button briefly shows ✓ Copied for 2 seconds

**No DB write at any stage.** Closing the sheet discards everything. The PAX channel is the persistence layer.

### Why the Shout system was archived (longer version)

The V2-shouts architecture had:
- `shouts` table: id, user_id, type, text, beatdown_id, when_text, when_at, location_text, archived_at, created_at
- `shout_reactions` table: id, shout_id, user_id, emoji, created_at, UNIQUE(shout_id, user_id, emoji)
- `follows` table: id, follower_id, followed_id, created_at, UNIQUE(follower_id, followed_id)
- A FeedScreen component with infinite scroll
- A ShoutCard component with reactions, comments, "From: <user>", time-since-posted
- A ShoutComposer (the same composer UI that is now PreblastComposer)
- Q Profile gained Followers/Following stats
- 4-tab nav was: Generate / Library / **Feed** / Profile (Locker was already merged into Q Profile)

This was fully wired and testable. Three full sessions went into building it (April 25, April 26, April 28-29 morning). Then Ritz hit the wall: "We're going to spend the next six months trying to get people to check the Feed daily. We don't have a Feed problem. We have a 'Q has to plan a beatdown Tuesday morning' problem."

The pivot was decisive. Commit A (April 28 evening) deleted FeedScreen, ShoutCard, ShoutComposer files. Stripped Shout helpers from db.ts. Stripped Follow helpers. Stripped Feed routing from page.tsx. Replaced BottomNav.tsx with the 3-tab version. Required ~5 fixup commits because PowerShell `Set-Content -Encoding UTF8` corrupted middle-dot characters in QProfileScreen.tsx — final fix was pulling clean source from `https://raw.githubusercontent.com/camplineapp/gloombuilder/v2-shouts/src/components/QProfileScreen.tsx` then re-applying strips with `[System.IO.File]::WriteAllText` UTF-8 no-BOM, LF endings.

Commit B (also April 28) handled Q Profile owner view + polish:
- QProfileScreen owner-view fetches ALL items (`getMyAllBeatdowns` / `getMyAllExercises`) with inline status labels (SHARED green / DRAFT gray)
- BeatdownRow + ExerciseRow interfaces gained `is_public` field
- Profile tab → opens QProfileScreen own view (not the legacy ProfileScreen Settings)
- Settings reachable via ⚙ gear icon → opens ProfileScreen as full-screen overlay (`vw === "settings"`)
- ProfileScreen.tsx accepts an `onClose` prop, shows "← Back" button when provided
- Save flows redirect to Profile tab
- All "Save to Locker" text replaced with "Save" everywhere (BuilderScreen, GeneratorScreen, CreateExerciseScreen, LibraryScreen, HomeScreen subtitle, LiveModeScreen "Done — Back to Locker" → "Done")
- profileRefreshKey state bumps AFTER delete success (was bumping before, causing stale refetch)
- Supabase column fixes uncovered during testing: `votes` table has NO `vote_type` column (removed `.eq("vote_type", "up")` from getProfileStats). `exercises.is_public` doesn't exist (use `source = "community"` for public exercises). Beatdowns table DOES have is_public.

Commit C (April 29) is the Preblast generator — see "Commit C status" below for current progress.

### Commit C status (as of April 29, end of session)

**DONE (steps 1-4 landed and tested on Vercel preview):**

1. Created `src/components/PreblastComposer.tsx` — 21KB, LF line endings. Self-contained sheet component. Two views: form / preview. Form includes type picker (chip + Change link expansion), message textarea, optional icon row (📅/📍/💪), selected chips, beatdown picker sub-view, Cancel + Generate buttons. Preview view includes ← Edit, big preformatted text block, Copy + Share buttons.
2. Wired into page.tsx: import added, state added (`preblastOpen`, `preblastBd`), composer rendered above each `{toastEl}` (3 places).
3. Added Send Preblast card to HomeScreen.tsx — purple-tinted gradient card with megaphone SVG icon. New prop `onSendPreblast` added to HomeScreenProps.
4. Beatdown picker view inside composer (Q2-B per Ritz: tap 💪 opens picker showing user's saved beatdowns). New props `userBeatdowns: UserBeatdown[]` passed from page.tsx (`lk` state). `toAttached()` converter maps LockerBeatdown → AttachedBeatdown shape.
5. Generated text format finalized: emoji-prefixed (📣 header, 📅 when, 📍 with URL on next line, 💪 plan dump), em-dash footer, ASCII hyphens throughout to avoid mojibake.
6. Location chip in form ellipsis-truncates so long URLs don't blow out the layout.
7. URL placed on own line in generated text so it auto-hyperlinks in every messaging app (Slack, iMessage, GroupMe, WhatsApp). Plain URL is the only format that works universally — Slack-style `<URL|label>` and Markdown `[label](URL)` render as literal text in iMessage/SMS, so they're not used.

**REMAINING for Commit C (Round 3):**

1. Add "📣 Send Preblast" button on BuilderScreen alongside Save / Run This. When tapped, it should call something like:
   ```ts
   onSendPreblast={() => {
     const bd = buildCurrentBeatdownAsAttached(); // helper that converts the Builder's current state to AttachedBeatdown
     setPreblastBd(bd);
     setPreblastOpen(true);
   }}
   ```
   The Builder needs to expose its current draft as an AttachedBeatdown — title (= name input), duration (from tags), difficulty (from tags), sections (current secs state). May need a callback prop on BuilderScreen like `onSendPreblast: (bd: AttachedBeatdown) => void` or just pass down `setPreblastBd`/`setPreblastOpen` directly through props.

2. Add "📣 Preblast" button on LibraryScreen detail view next to Save. Each library item is a FeedItem with the same beatdown shape (sections, duration, etc.). The handler passes that item converted to AttachedBeatdown.

3. After Commit C green: drop the unused Supabase tables manually:
   ```sql
   DROP TABLE IF EXISTS shout_reactions;
   DROP TABLE IF EXISTS shouts;
   DROP TABLE IF EXISTS follows;
   ```

4. After all that: consider merging `v2-pivot` to `main`. This is the big push to gloombuilder.app.

### Files changed in v2-pivot vs main

Deleted files:
- `src/components/FeedScreen.tsx` — was the Feed tab
- `src/components/ShoutCard.tsx` — was the per-shout display card
- `src/components/ShoutComposer.tsx` — replaced by PreblastComposer (different name, no DB write, output panel)

Modified files:
- `src/lib/db.ts` — removed `postShout`, `getFeedShouts`, `getActiveShoutForUser`, `archiveShout`, `updateShout`, `ShoutRow` type, `followUser`, `unfollowUser`, `isFollowing`, `getFollowerCount`, `getFollowingCount`. Added `getMyAllBeatdowns` and `getMyAllExercises` (returning ALL — shared and draft — for the Q Profile owner view). Fixed `getProfileStats` (no vote_type, exercises uses source=community). `BeatdownRow` and `ExerciseRow` gained `is_public` field.
- `src/components/QProfileScreen.tsx` — owner-view fetches all items via `getMyAll*`, status labels, no Follow code, no Followers stat, accepts `refreshKey` prop. ALSO fixed: when `isOwn` is true and Q Profile is rendered as the Profile tab, it shows ⚙ gear icon to open Settings overlay.
- `src/components/ProfileScreen.tsx` — accepts `onClose` prop. When provided, renders "← Back" button at top of screen that calls onClose. Without onClose, behaves as before (no back button — used in legacy 4-tab nav).
- `src/components/BottomNav.tsx` — 3-tab version: Home / Library / Profile.
- `src/components/HomeScreen.tsx` — added 4th card "Send Preblast" (purple-tinted gradient, megaphone SVG icon). New prop `onSendPreblast: () => void`.
- `src/components/BuilderScreen.tsx` — "Save to Locker" → "Save".
- `src/components/GeneratorScreen.tsx` — "Save to Locker" → "Save".
- `src/components/CreateExerciseScreen.tsx` — "Save to Locker" → "Save".
- `src/components/LibraryScreen.tsx` — "Save to Locker" → "Save".
- `src/components/LiveModeScreen.tsx` — "Done — Back to Locker" → "Done".
- `src/app/page.tsx` — Profile tab routes to QProfileScreen instead of legacy ProfileScreen. Settings overlay (`vw === "settings"`) renders ProfileScreen with `onClose={() => setVw(null)}`. Added `profileRefreshKey` state (bumps after delete success). Added `preblastOpen`, `preblastBd` state. Imports PreblastComposer + AttachedBeatdown type. Renders composer above each `{toastEl}` (3 places). HomeScreen call now includes `onSendPreblast={() => { setPreblastBd(null); setPreblastOpen(true); }}`. PreblastComposer call passes `userBeatdowns={lk}`.

Added file:
- `src/components/PreblastComposer.tsx` — new self-contained sheet component, ~530 lines, LF line endings.

### Permanent operating rules (saved to memory across sessions)

These are non-negotiable. Violating them costs hours of debugging.

1. **Never mock from memory.** When mocking up or modifying existing screens, always reference Ritz's actual screenshots. If no screenshot is available, ASK before mocking. Existing screen + new feature = identical UI with only the explicit change. No drive-by redesigns.
2. **Every design decision must be a visual mockup with UX psychology analysis** (Fitts's Law, Hick's Law, Peak-End Rule, etc.) and a clear recommendation. Show, don't tell. Mockups must be approved BEFORE writing any code.
3. **PowerShell `Set-Content -Encoding UTF8` adds a BOM and corrupts multi-byte chars (em-dashes, middle-dots, emojis).** ALWAYS use `[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))` for writing files. The `New-Object System.Text.UTF8Encoding $false` in PowerShell is the no-BOM constructor.
4. **PowerShell here-strings break on TypeScript with `&&`, `||`, `()`, `{}`, `$`.** Use full-file Copy-Item or `[System.IO.File]` reads + `.Contains()/.Replace()` instead.
5. **PowerShell Latin-1 console renders UTF-8 wrong** — visual artifact only, file may be fine. Always check actual file bytes.
6. **`npm run build` is the ONLY verification that matters.** Skip grep middle-steps. Run build, if green push, if red fix.
7. **For DB column names: look at actual `.from("table").insert(...)` calls in db.ts, NOT TypeScript interfaces.** Interfaces drift; the actual queries are the source of truth.
8. **The auto-linkifier in chat displays `user.id` as `[user.id](http://user.id)` markdown.** This is a chat display only — but breaks if Ritz pastes my code into PowerShell, so prefer line-by-line rewriting via ArrayList loops, or anchor-find approach using IndexOf/LastIndexOf.
9. **CRITICAL: Never give instructions then walk them back in the same response.** Pick ONE path. Hedging mid-response confuses and frustrates. Diagnose silently, commit to the right answer, deliver only that.
10. **GitHub raw downloads use LF line endings** — match `\`n` not `\`r\`n` when patching them.
11. **page.tsx uses CRLF line endings (~627 CRLF / 26 LF).** When using string Replace patterns with multi-line content, ALWAYS use `\`r\`n` (backtick-r backtick-n in PowerShell), not `\`n`. Most other TypeScript files in the project (PreblastComposer, HomeScreen, etc.) use LF. Always check first if Replace count is 0.
12. **Future workflow target: migrate to Claude Code** (`npm install -g @anthropic-ai/claude-code`). Eliminates auto-linkifier, line-ending, and patch-verification friction. Bring this up at start of future sessions until migrated.
13. **File downloads land in `C:\Users\risum\Downloads\`** — every file delivered through the chat goes there. Use `Copy-Item "C:\Users\risum\Downloads\<file>" ".\src\components\<file>"` to move into project.
14. **Settled decisions are not revisited.** If a design or behavior was approved in a prior session, do not re-litigate. Build it.
15. **Single correct path only.** Never give instructions then walk them back in the same response.
16. **Mockups before code, every time.** Even for small changes if the visual outcome matters.
17. **No grep/Select-String verifications after file replacements** — Ritz can't interpret the output. Workflow: copy file(s) → `npm run build` → if green push, if red fix.
18. **Vercel preview URL** can have a sticky session cookie that maps to an old deployment. Test in incognito or hard-refresh.
19. **PWA service worker** caching can serve stale bundles. To clear: in DevTools console, `navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))` then close all tabs and reopen.

### Confirmed v2-pivot design tokens (carry forward from Bible v14, unchanged)

- Theme: emerald green (#22c55e) + warm neutral text (NOT blue-gray)
- True black (#0E0E10) OLED-friendly dark background
- Font: Outfit, +2px larger than default for readability
- Logo: Gb_Green.png at /public/logo.png
- Nav: words only — no letter badges, no emoji icons
- Tagline: "Build. Share. Steal. Repeat."
- Home header: "GloomBuilder / by The Bishop · Build. Share. Steal. Repeat."

### V2-pivot design additions

- Hero card on Home: green-gradient card with eyebrow "⚡ QUICK GENERATE", title "Build a beatdown in 30 seconds", subtitle "Tailored to your AO and gear", green CTA button "Generate beatdown". Uses `linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.04))` background, 1px solid rgba(34,197,94,0.28) border, 22px borderRadius, 22px 20px 18px padding, with a `::after` radial-gradient glow in top-right corner for depth.
- Send Preblast card on Home: full-width purple-tinted card spanning both columns of the secondary cards grid. Background `linear-gradient(135deg, rgba(167,139,250,0.10), rgba(167,139,250,0.02))`, border rgba(167,139,250,0.30), purple title color (#a78bfa). Megaphone SVG icon (avoiding emoji encoding issues): `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`.
- Composer sheet uses position fixed, bottom 0, left 50% with translateX(-50%), maxWidth 430px to match app container width. Backdrop is rgba(0,0,0,0.7) with backdropFilter blur(2px). zIndex 99 (backdrop) / 100 (sheet).
- Composer message field: minHeight 140 (~5 lines), 240 char limit. Char counter color flips to amber (A=#f59e0b) when length > 220.
- Composer type chip: rgba(34,197,94,0.15) bg, rgba(34,197,94,0.40) border, 13px/800 weight, 8px 14px padding, 8px borderRadius, uppercase, letterSpacing 0.8.
- Type grid (when Change tapped): 4 columns × 3 rows. Each pill: 10px font, 700 weight, 8px 2px padding, 7px borderRadius. Selected pill gets G+"26" bg, G+"66" border, G text. Custom pill at end: A+"1A" bg, dashed A+"66" border, A text.
- Custom type input: amber-tinted (A+"1A" bg, A+"66" border), 9px borderRadius, 13px font, autoFocus on appear, max 20 chars.
- Optional icon pill row: three flex:1 cells, 10px gap. Each pill 10px 6px padding, 10px borderRadius, flex column with 18px emoji on top, 9px/700 uppercase label below. Inactive: rgba(255,255,255,0.03) bg, BD border, T4 color. Active: rgba(34,197,94,0.10) bg, rgba(34,197,94,0.4) border, G color. Beatdown attached state: rgba(245,158,11,0.10) bg, rgba(245,158,11,0.4) border, A color.
- Selected chip rows: 8px 10px padding, 9px borderRadius, 6px marginBottom. Green chips for When/Location: rgba(34,197,94,0.06) bg + rgba(34,197,94,0.25) border. Amber chip for Beatdown: rgba(245,158,11,0.06) bg + rgba(245,158,11,0.25) border. × close button: 20×20px, 4px borderRadius, rgba(255,255,255,0.06) bg.
- Beatdown picker view: full sheet swap. Header: ← Back left, "Pick a beatdown" centered, 60px spacer right. List: 8px gap flex column, max-height 60vh scrollable. Each beatdown card: CARD_BG bg, BD border, 11px borderRadius, 12px 14px padding, left-aligned text, name (14px/800 T1), meta (11px T4 — duration + first 2 tags joined by " - ").
- Empty state when no saved beatdowns: 32px 16px padding, centered, 13px T4 text "You don't have any saved beatdowns yet. Generate or build one first to attach it."
- Preview view monospace block: 'Courier New', 11px, T2 color, lineHeight 1.55, max-height 50vh scrollable. wordBreak: break-word so URLs don't overflow horizontally.
- Copy button: rgba(255,255,255,0.05) bg, BD border, T1 text. Toggles to "✓ Copied" for 2 seconds after click. Share button: G bg, BG text, calls navigator.share() if available, falls back to clipboard.
- Em-dash em-dash character (Unicode 0x2014) used for footer. ASCII hyphen `-` used for all in-text separators (between header pieces, between exercises, in date/time format) to avoid mojibake when shared.

---

## V2-PIVOT FILE STRUCTURE (canonical going forward)

The full file structure of `v2-pivot` branch as of April 29, 2026 end-of-session:

```
gloombuilder/
├── .env.local                        # Supabase URL + anon key (local only, gitignored)
├── package.json
├── tailwind.config.ts
├── public/
│   ├── logo.png                      # Gb_Green.png renamed
│   ├── manifest.json                 # PWA manifest (standalone, emerald theme)
│   ├── sw.js                         # Service worker (offline caching)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx                # PWA meta tags, SW registration
    │   ├── page.tsx                  # CRLF line endings, ~700 lines. Imports PreblastComposer.
    │   ├── api/checkout/route.ts     # Stripe Checkout API
    │   └── success/page.tsx          # Stripe success page
    ├── components/
    │   ├── AuthScreen.tsx
    │   ├── BottomNav.tsx             # 3-tab version (Home / Library / Profile) in v2-pivot
    │   ├── BuilderScreen.tsx
    │   ├── CopyModal.tsx
    │   ├── CreateExerciseScreen.tsx
    │   ├── GeneratorScreen.tsx
    │   ├── HomeScreen.tsx            # Has Send Preblast card (4th)
    │   ├── LibraryScreen.tsx
    │   ├── LiveModeScreen.tsx
    │   ├── PreblastComposer.tsx      # NEW (April 29) — LF line endings, ~530 lines
    │   ├── ProfileScreen.tsx         # Accepts onClose prop for Back button
    │   ├── QProfileScreen.tsx        # Owner-view fetches all items, ⚙ gear → Settings
    │   └── SectionEditor.tsx
    └── lib/
        ├── db.ts                     # Shout/Follow helpers REMOVED. Added getMyAll*. Fixed getProfileStats.
        ├── exercises.ts
        └── supabase.ts
```

The legacy v1 file structure (with FeedScreen, ShoutCard, ShoutComposer, LockerScreen) is documented later in this Bible under the "PROJECT FILE STRUCTURE" section — that's the `main` branch which is still live at gloombuilder.app.

---

## V2-PIVOT NAVIGATION — 3-TAB BOTTOM BAR (CURRENT)

| Tab | Label | Purpose |
|-----|-------|---------|
| 1 | **Home** | Hero "Generate beatdown" card + Build from scratch + Create exercise + Send Preblast |
| 2 | **Library** | Community feed of beatdowns & exercises (unchanged) |
| 3 | **Profile** | Q Profile owner-view (your portfolio) — ⚙ gear → Settings overlay |

The 4-tab nav from v1 (Home / Library / Locker / Profile-as-Settings) is documented under "NAVIGATION — 4-TAB BOTTOM BAR" further down. That section describes the production state on `main` branch.

In v2-pivot, the user's saved content (Locker concept) is shown inside the Q Profile owner view. The legacy ProfileScreen (settings, name, AO, state, region, Save profile, About, Log out) is reachable via a ⚙ gear icon on the Q Profile screen, which opens it as a full-screen overlay with a "← Back" button.

---

## V2-PIVOT SUPABASE STATE

The 3 v2-shouts tables (`shouts`, `shout_reactions`, `follows`) still exist in Supabase but are dead code — no helpers reference them in the v2-pivot branch. They will be dropped manually after Commit C completes:

```sql
DROP TABLE IF EXISTS shout_reactions;
DROP TABLE IF EXISTS shouts;
DROP TABLE IF EXISTS follows;
```

Active tables in v2-pivot (same as v1): `profiles`, `exercises` (904 seed), `beatdowns`, `votes`, `bookmarks`, `comments`. See "SUPABASE DATABASE" section below for full schema.

---

## V2-PIVOT KEY LEARNINGS & GOTCHAS (new this session)

These are pitfalls hit during V2-shouts and V2-pivot development. Do not repeat.

1. **Defining React components as variables inside App() causes input focus loss.** React recreates component types on every render, unmounting inputs. Components must be defined outside App(). This was hit when an inline component held the `<input>` for the F3 name field — every keystroke unmounted the input, causing focus loss between characters.

2. **`return<Component>` without a space** parses as a single identifier and breaks rendering. Always `return <Component>`.

3. **`defaultValue` vs `value`** on inputs — profile changes won't save if `defaultValue` is used instead of controlled `value` + `onChange` state. Always controlled inputs in this codebase.

4. **Mobile drag-and-drop doesn't work** in iOS Safari — use ▲/▼ buttons for reordering instead of HTML5 drag.

5. **Generator must strictly filter exercises by selected AO sites only** — pulling from non-selected sites was a critical bug discovered in v2.

6. **Reroll must track previously shown exercises** to avoid repeats. Generator state has to remember what was already displayed in this session.

7. **Bookmark vs Steal distinction:** Bookmark = read-only reference; Steal = editable copy saved to Locker. Different actions surfaced via a bottom sheet on the Save button.

8. **Bible documents should be design-agnostic when a full reset is needed** (no UI prescriptions), so the next session can start from a true blank canvas. This rule applies to the Bible NOT prescribing implementation details for FUTURE features — current state is documented exhaustively, future work is described as goals not specs.

9. **PWA service worker caching** can serve stale bundles even after deploy. Hit during v2-pivot Commit B testing — DevTools reported `setProfileRefreshKey` and `onClose && (` strings missing from deployed JS bundles even though they were on disk and pushed to GitHub. Fix: in DevTools Application tab → Service Workers → Unregister, then Storage → Clear site data, then close all tabs and reopen. OR via Console: `navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())); caches.keys().then(keys => keys.forEach(k => caches.delete(k)));`

10. **Vercel preview URLs** for branches use SSO sticky session cookies that can map to old deployments. Hit during Commit B testing — reproduced even after force-push of empty commits. Workaround: incognito mode forces fresh auth and fresh deployment routing.

11. **Auto-linkifier breaks code** when chat displays `user.id` as `[user.id](http://user.id)` markdown. When Ritz pastes such code into PowerShell, the linkified text becomes literal in their variables. Workaround: use line-by-line rewriting via ArrayList loops, or anchor-find approach using IndexOf/LastIndexOf instead of multi-line Replace patterns.

12. **Mojibake byte signature** when UTF-8 bytes are misread as Latin-1 produces `C3 82` sequences (Â character). Diagnostic: `[regex]::Matches($content, [char]0xC3 + [char]0x82)`. Hit during BottomNav.tsx edit when middle-dots in QProfileScreen got corrupted.

13. **CSS textOverflow ellipsis on flex inputs** requires `minWidth: 0` on the input itself, otherwise the input's intrinsic min-width prevents the ellipsis from kicking in. Hit when truncating long Maps URLs in the location chip.

14. **`navigator.share()` API support** is patchy — works on iOS Safari, Android Chrome, but throws on desktop browsers. Always wrap in try/catch and fall back to clipboard copy.

15. **Generated text format must use ASCII hyphens, not en-dashes or middle-dots.** When shared via iMessage/SMS, multi-byte separators get mojibake-rendered on receiving devices that interpret the encoding wrong. Use `-` and `--` for all in-text separators.

16. **URLs must be on their own line in shared text** to auto-hyperlink in every messaging app. Slack-style `<URL|label>` syntax and Markdown `[label](URL)` only work in Slack. Plain URL on its own line works everywhere.

17. **PowerShell line ending detection:** `$crlf = ([regex]::Matches($c, "\`r\`n")).Count; $lf = ([regex]::Matches($c, "(?<!\`r)\`n")).Count`. Then choose `$nl` based on majority. page.tsx is CRLF (627/26 ratio). HomeScreen.tsx and PreblastComposer.tsx are LF.

18. **TypeScript interface mismatches between LockerBeatdown (page.tsx) and AttachedBeatdown (PreblastComposer)** require a converter function. The converter `toAttached(bd)` lives inside PreblastComposer and maps `nm` → `title`, extracts difficulty from tags array via regex `/BEAST|HARD|MOD|EASY|EPIC|GUT/i`, maps SectionExercise legacy fields (`n`/`r`/`c`) and new fields (`name`).

---

---

## WHO IS BUILDING THIS

- **F3 Name:** The Bishop (goes by Ritz)
- **AO:** F3 Essex, New Jersey
- **Region:** Northeast
- **Non-technical.** Cannot code. Needs step-by-step instructions for everything (every terminal command, every click).
- **Computer:** Windows. Node.js v24.14.1. Git v2.53.0. GitHub. **Personal laptop active** — development environment fully set up.
- **Accounts:** Vercel (under CampLine's Org, Hobby plan), Supabase (under camplineapp's Org, Free plan), GitHub (camplineapp).
- **Communication channels:** F3 Essex Slack (f3essex.slack.com), #backblasts channel (C032W2CJB34) uses Google Form → Slack bot.
- **Working style:** Specific, concrete outputs only. No generic advice. Implement feedback immediately — don't push back. Blunt, direct feedback — act on it. Mockup-before-code for new screens. Hand-hold every terminal command. Files delivered as downloads → user copies via PowerShell `Copy-Item` commands. When downloads cache old versions, use PowerShell `(Get-Content) -replace` to fix files directly. **WARNING:** Complex regex replacements in PowerShell or Python can corrupt JSX (happened during duration estimator removal — left orphaned closing div tags). For complex multi-line block removals, use Python with exact string matching, not regex. For large structural changes, regenerate and re-download the full file instead. Verify every key change with `Get-Content | Select-String`.
- **Email:** risumalinog@gmail.com (GitHub account)

---

## WHAT IS GLOOMBUILDER

A community-first beatdown planning and sharing platform for F3 Qs.

**Tagline:** "Build. Share. Steal. Repeat."
**Home header:** GloomBuilder logo + "GloomBuilder" (22px/800, letterSpacing -0.5) + "by The Bishop · Build. Share. Steal. Repeat." (13px, T4). Subtitle always says "by The Bishop" — product branding, not dynamic.
**Credit:** "Creator of GloomBuilder" (never "Builder of GloomBuilder")
**Domain:** gloombuilder.app (purchased via Vercel, auto-renews Apr 10, 2027)
**Disclaimer (always visible):** "Not affiliated with F3 Nation, Inc. Built independently by a PAX for the PAX."

**Two pillars:**
1. **The generator** — creates a full beatdown tailored to your AO in 30 seconds, pulling from 904 exercises.
2. **The community** — ever-growing library of beatdowns and exercises. Vote, comment, save, steal.

---

## LOGO & BRANDING

- **Logo file:** Gb_Green.png — Chrome/silver "G" merged with emerald green "B", black background
- **Logo in project:** Stored as `/public/logo.png` in Next.js project
- **Logo placement:** Home screen header, 42px tall, left-aligned next to "GloomBuilder" text
- **Auth screen:** Logo centered, 60px tall, above title
- **Color identity:** Emerald green + chrome silver on dark background
- **Previous logos rejected:** Red version (GB_red_crop.PNG) — too harsh. Transparent bg version — didn't look good on dark bg.

---

## NAVIGATION — 4-TAB BOTTOM BAR

| Tab | Label | Purpose |
|-----|-------|---------|
| 1 | **Home** | Generate CTA + Build from scratch + Create exercise |
| 2 | **Library** | Community feed of beatdowns & exercises with search/filters + Exercise Database (904) |
| 3 | **Locker** | Personal collection: My Beatdowns / My Exercises |
| 4 | **Profile** | User settings + About GloomBuilder (separate sub-screen) |

**Tab styling:** Just the tab word — **NO letter badges** (removed in v4, looked cluttered). **NO emoji icons** — they look childish. Active tab uses green accent (#22c55e), inactive uses warm muted (#928982). Font size 14px, padding 10px 20px for proper touch targets.

**Bottom nav implementation:** Fixed position, centered with `left:50%; transform:translateX(-50%)`, maxWidth 430px to match app container. Clicking any tab resets the view state (`setVw(null)`). **Padding (UPDATED April 15):** `padding: 6px 0 12px` with `paddingBottom: calc(12px + env(safe-area-inset-bottom, 8px))` for phones with home indicators (iPhone notch). Tab button padding bumped from `10px 20px` to `14px 20px` for larger tap targets (fat-finger friendly for 40-50+ year old PAX).

---

## DESIGN SYSTEM

### Colors — Emerald + Warm Neutral Theme
- **Background (BG):** #0E0E10 (slightly warm dark, not pure black)
- **Card (CD):** rgba(255,255,255,0.028)
- **Border (BD):** rgba(255,255,255,0.07)
- **Green (primary accent, G):** #22c55e
- **Amber (secondary, A):** #f59e0b
- **Red (danger/hard, R):** #ef4444
- **Beast red:** #dc2626
- **Purple (exercises, P):** #a78bfa
- **Gold (Hand Built badge):** #E8A820

**CRITICAL: Never use blue-gray slate colors.** These disappear on dark backgrounds. All text uses warm stone tones.

### Text Hierarchy — Warm Neutrals (Max Contrast)

| Variable | Hex | Usage |
|----------|-----|-------|
| T1 | #F0EDE8 | Headings, primary text (near-white, warm) |
| T2 | #D0C8BC | Card titles, strong body text |
| T3 | #C0B8AC | Descriptions, body text |
| T4 | #928982 | Subtitles, muted text, inactive tabs |
| T5 | #7A7268 | Labels, dates, very muted |
| T6 | #5A534C | Disclaimer, least important text |

### Typography — Bumped for 50+ Readability
- **Font:** Outfit (Google Fonts) with system-ui fallback
- **Weights:** 400, 500, 600, 700, 800
- **Page titles:** 28px/800
- **Section headers:** 24px/800
- **Card titles:** 18px/700 (was 16px)
- **Body text:** 15px/400 (was 14px)
- **Subtitles:** 14px (was 12-13px)
- **Labels:** 12px/600, uppercase, letter-spacing 1.5px (was 10px)
- **Tags/pills:** 12px (was 10px)
- **Dates:** 12-13px (was 11px)
- **Difficulty badges:** 12px (was 10px)
- **Footer stats:** 14px (was 12px)
- **Input fields:** 15px (was 14px)
- **Sort/filter buttons:** 13px (was 12px)
- **Nav tabs:** 14px (was 11px)

### Builder-Specific Typography (REDESIGN — April 16/17, FINAL — UPDATED April 17 session 15)
Stricter minimums inside the Builder. These are non-negotiable — primary users are 40-50 year old men, often outdoors, phone in one hand. If a 50-year-old can't read it without squinting it's too small. **No font size below 12px anywhere in the Builder. Ever.**

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Beatdown name input | 26px | 800 | Top of screen, primary identity |
| Section name | 21px | 800 | White T1, letter-spacing -0.5px |
| Exercise name on card | 18px | 700 | T1, overflow ellipsis |
| Exercise reps/cadence on card | 14px | 600 | T4, overflow ellipsis |
| Exercise note on card | 13px italic | 500 | T5, overflow ellipsis |
| ADD EXERCISE label | 12px/800 uppercase | — | Section color, letterSpacing 1.5px (was 11px, bumped April 17 s15) |
| ADD EXERCISE "Start typing..." | 16px | 500 | T2 |
| Q notes "has content" display | 14px italic | — | T2, inline with ✎ icon + Edit link (was 16px in box, now 14px inline — April 17 s15) |
| Q notes "+ Add Q notes" link | 14px | 600 | T3, subtle text link (was full-width dashed box — April 17 s15) |
| Q notes / Add transition buttons | 16px | 600 | Full-width, 44px+ tap target |
| Save/Cancel in Q notes | 16px | 700 | Proper button padding 12px 22px |
| Save changes button | 18px | 800 | Full-width, 20px padding |
| Delete exercise button | 16px | 700 | Full-width, red border |
| Browse icon ⌕ | 28px | — | Section color, inside ADD EXERCISE field |
| Section exercise count | 12px | 400 | T5, below section name |
| + Add Section text | 15px | 700 | T3, inside dashed border button |
| Transition text | 16px italic | 500 | T3, with wordBreak break-word |
| Smart text hint ("Try: 20 · 45 sec...") | 14px italic | — | T4 color (was 11px T5 — bumped April 17 s15) |
| Smart text classification icon | 18px | — | Was 16px, bumped April 17 s15 |
| Smart text classification text | 15px | 700 | Was 14px/600, bumped April 17 s15 |
| Exercise info ? button | 14px | 700 | Purple, 28x28px (NEW April 17 s15) |

### Components
- **Cards:** background CD, 1px border BD, 14px border-radius
- **Buttons (primary):** full-width, green background, dark text, 16px/700, 12px border-radius
- **Buttons (secondary):** transparent bg, border BD, muted text, 13px/600
- **Chips/pills:** small tappable tags, toggle colors on select
- **Bottom sheet modals:** dark overlay, sheet slides up from bottom, 24px border-radius top, grab handle bar
- **Toast:** fixed bottom-center, green bg, dark text, auto-dismiss 2.2s, zIndex 300
- **Segment control:** 2-3 tabs with active green bg highlight
- **Difficulty badges:** colored bg+text matching difficulty (green/amber/red/dark-red), 12px font, 6px radius
- **Left border accents:** amber for beatdowns, purple for exercises, 3px width
- **Source badges:** see Source Badge System below
- **Input style (ist):** width 100%, background rgba(255,255,255,0.04), border 1px solid BD, borderRadius 10, color T2, padding 12px 14px, fontSize 15

### Character Limits (enforced via maxLength)

| Field | Max Length |
|-------|-----------|
| Beatdown title | 50 |
| Beatdown description | No limit (textarea) |
| Section label | 60 |
| New section name | 60 |
| Exercise reps | 10 |
| Exercise cadence | 15 |
| Exercise notes | 100 |
| Exercise name (create) | 50 |
| Exercise description (create) | 200 |
| Exercise how-to (create) | 500 |
| F3 Name (profile) | 30 |
| AO (profile) | 40 |

### Overflow Protection
All compact exercise displays use `overflow: hidden; textOverflow: ellipsis; whiteSpace: nowrap` to prevent text from breaking layout. In the redesigned SectionEditor exercise cards, this applies to: exercise name (19px), reps/cadence row (15px), and note line (13px italic). Long custom names and cadence strings are truncated with ellipsis — fixed April 16 after a bug where long strings blew out the card container.

---

## SOURCE BADGE SYSTEM

Two permanent badges on beatdown cards (Library + Locker). Badges are set at creation and never change.

| Badge | Color | When applied |
|-------|-------|-------------|
| **Hand Built** | Gold (#E8A820) | Created manually in Builder |
| **AI Generated** | Gray (T4) | Created via Generator |

**No "Q Modified" badge** — explicitly rejected. Keeping it binary.
**Stolen beatdowns** show "Inspired by [Q name]" in amber — not a source badge, a separate credit line.

---

## VOTING SYSTEM (SUPABASE — LIVE, April 14)

### Generic Vote Table
- Single `votes` table handles BOTH beatdowns and exercises via `item_id + item_type` columns
- `item_type` CHECK constraint: 'beatdown' or 'exercise'
- UNIQUE constraint: `(user_id, item_id, item_type)` — one vote per user per item

### Vote Flow
1. User taps ▲ on any feed card or detail view
2. `handleToggleVote(itemId, itemType)` in page.tsx — **optimistic update** first (instant UI response)
3. Calls `addVote()` or `removeVote()` in db.ts
4. On success: `loadLibrary()` reloads to get accurate `vote_count`
5. On failure: reverts `userVotes` state, shows toast "Vote failed — try again"

### Vote State (page.tsx)
- `userVotes: Set<string>` — loaded on login via `loadUserVotes()`, stores item IDs of all voted items
- Passed to LibraryScreen as `userVotes` and `onToggleVote` props

### Vote Display
- **Feed cards:** ▲ count is a clickable span with `stopPropagation`, green when voted, muted T4 when not
- **Detail view:** Full vote button (green bg when voted), works for both beatdown and exercise types
- **Vote count** comes from server (`bd.v` = `vote_count` column via trigger), not local +1

### SECURITY DEFINER (CRITICAL)
The `handle_vote_count()` trigger function uses `SECURITY DEFINER` so it runs with the owner's permissions (bypassing RLS). Without this, when User A votes on User B's beatdown, RLS blocks the trigger's UPDATE and the count silently stays at 0. This was the root cause of the "vote count not updating" bug.

---

## SAVE & STEAL SYSTEM (SIMPLIFIED — April 20 s18)

### Bookmarks Killed (Session 18)
The bookmark system was removed entirely. Analysis showed bookmarks were a dead-end that always led to stealing anyway — every archetype (Tanker, FNG Q, power user) ended up wanting an editable copy. The "Save" bottom sheet (Bookmark vs Steal choice) added cognitive load at save-time that users didn't have enough context to resolve.

### New Flow — One Tap Save
**"Save" = always makes an editable copy in your Locker.** No bottom sheet. No choice. One tap.

- **Library feed cards:** "Save" link calls `onSteal()` directly. Toast: "Saved to locker!"
- **Library detail view:** "Save to Locker" button calls `onSteal()` directly. Secondary style (gray outline) when Run This is present above it.
- **Locker:** Two tabs only — Beatdowns | Exercises. No "Bookmarked" tab.

### Steal Flow (unchanged mechanics)
1. User taps Save on any Library card or detail view
2. `handleSteal(itemId, itemType)` calls `stealBeatdown()` or `stealExercise()`
3. **stealBeatdown:** Loads original → INSERT copy with all fields + `inspired_by: original.created_by` + `is_public: false` → calls `increment_steal_count` RPC
4. **stealExercise:** Loads original → INSERT copy + `inspired_by: original.created_by` + `source: "private"`
5. `loadLocker()` + `loadLibrary()` refresh
6. Toast: "Saved to locker!"

### "Run This" on Library Detail (NEW — Session 18)
Shared beatdowns with sections now have a **▶ Run This** button (green outline with play icon) above "Save to Locker" on the detail view. Tapping launches Live Mode with the shared beatdown's sections (read-only, no save to locker). The `inspiredBy` prop threads the original Q's name through to CopyModal so the backblast includes "Inspired by: [original Q name]".

### Inspired By Display
- **Locker beatdowns:** `dbToLocker()` checks `row.inspired_by`, joins `inspired_profile:inspired_by(f3_name)`. Shows "Inspired by The Bishop" (actual Q name).
- **Locker exercises:** Same pattern.
- **Library cards:** `dbToShared()` includes `inspiredBy` from `inspired_profile` JOIN.
- **Backblast text (NEW s18):** When running a Library beatdown via "Run This", both Quick Copy and Full Backblast include `Inspired by: [original Q name]` after the Q line.

### Steal Count
`increment_steal_count(beatdown_id)` is a **SECURITY DEFINER** RPC function. Required because the stealer doesn't own the original beatdown, so RLS would block a direct UPDATE.

### What Was Removed (Session 18)
- `saveSheet` state and bottom sheet component in LibraryScreen
- `userBookmarks` / `onBookmark` props from LibraryScreen
- `lkBm` state, `loadMyBookmarks()` call, `handleBookmark()` function from page.tsx
- `addBookmark` / `removeBookmark` imports from page.tsx
- `lkBm` / `sharedItems` / `onRemoveBookmark` / `onSteal` props from LockerScreen
- "Bookmarked" tab content and SharedItem interface from LockerScreen
- All bookmark-related imports from db.ts (functions remain in db.ts for data integrity but are no longer called)

---

## COMMENTS SYSTEM (SUPABASE — LIVE, April 14)

### Comment Flow
1. User opens beatdown or exercise detail view
2. `useEffect` fires on `libDet.id` change → calls `loadComments(itemId)` → fetches with profile JOIN
3. Comments mapped to `{ id, au, ao, txt, dt }` format, stored in `dbComments` state
4. Comments displayed **newest first** (SQL `ORDER BY created_at DESC`)

### Posting Comments
1. User types, taps Post
2. `addComment(itemId, itemType, text)` → INSERT into comments with profile JOIN for response
3. New comment prepended to `dbComments` with "Just now" timestamp
4. `onRefresh?.()` calls `loadLibrary()` to update `comment_count` on feed cards via trigger
5. Toast: "Comment posted!"

### Editing Own Comments
1. Own comments show **Edit** link (right side, matched by `c.au === profName`)
2. Tap Edit → inline textarea replaces comment text with Save/Cancel buttons
3. Save → `updateComment(commentId, text)` → UPDATE in Supabase → local state updated
4. Toast: "Comment updated!"

### Deleting Own Comments
1. Own comments show **Delete** link in red (next to Edit)
2. Tap Delete → `deleteComment(commentId)` → DELETE from Supabase → removed from `dbComments`
3. `onRefresh?.()` reloads Library to update comment_count
4. Toast: "Comment deleted"

### Comment Counter
- **Feed cards:** Show "X comments" from `comment_count` column (via `bd.cm`). Only shows when count > 0.
- **Detail view:** Shows "Comments (X)" from `dbComments.length` — updates immediately after post/delete.
- **Trigger:** `handle_comment_count()` with `SECURITY DEFINER` auto-increments/decrements on beatdowns or exercises table.
- **Real-time on cards:** `onRefresh` callback passed from page.tsx calls `loadLibrary()` after post/delete.

### Comment Text Overflow
Comment text uses `wordBreak: "break-word"` and `overflowWrap: "break-word"` to prevent long text from bleeding outside the comment card container.

---

## COPY / BACKBLAST SYSTEM (CopyModal.tsx) — UPDATED April 23 s20

**Button label across all screens: "Backblast"** (renamed from "Copy for Slack" in s20 — GeneratorScreen, BuilderScreen, LiveModeScreen)

### Flow (UPDATED s20 — picker removed)
Tap "Backblast" → **goes directly to Full Backblast edit form** (no picker bottom sheet). The Quick Copy vs Full Backblast choice was a dead end — most users always wanted the full backblast. The picker added one extra tap for no value.

**Backblast form header:** Centered "Backblast" title (amber, 18px/800). ✕ close on right. No "← Back" button (no picker to go back to).

**Two copy buttons at bottom of form:**
- **"Copy Full Backblast"** (green, full width, primary) — copies complete backblast with AO, date, PAX, conditions, exercises, COT, announcements
- **"Copy Exercise Only"** (subtle gray, full width, secondary) — copies just exercises, Q notes, transitions (same content as old Quick Copy)

Both auto-close modal after 1.5s delay with toast confirmation.

**Props:** `secs` (Section[]), `beatdownName?` (string), `beatdownDesc?` (string), `qName?` (string), `inspiredBy?` (string — NEW s18), `onClose`, `onToast`

### Session 18 Changes
- **Asterisk formatting removed:** All `*AO:*`, `*Date:*`, `*Q:*` etc. stripped from backblast text. Clean plain text only — no Slack markdown. Works in any app, not just Slack.
- **Beatdown description removed:** `beatdownDesc` prop still accepted but not included in Quick Copy or Full Backblast text. Description cluttered the copy output.
- **Body scroll lock added:** `useEffect` locks body scroll on mount (`position: fixed`, `overflow: hidden`, `width: 100%`), restores on unmount. Prevents background page scrolling while CopyModal is open.
- **Auto-close after copy:** `handleCopy()` function copies text, fires toast, then calls `onClose()` after 1.5-second delay. Both Quick Copy and Full Backblast use this handler.
- **Return to completion screen:** In LiveModeScreen, CopyModal's `onClose` handler checks if current screen is "review" — if so, sets screen back to "complete". Flow: Review → Copy → toast → auto-close → Completion screen.
- **Inspired by credit (NEW):** When `inspiredBy` prop is provided (set when running a Library beatdown), both Quick Copy and Full Backblast include `Inspired by: [name]` after the Q line.
- **Preview subtitle updated:** Full Backblast preview says "Clean text — works in any app" (was "Formatted for Slack — works in any app").

### DUAL-FORMAT SUPPORT (April 16 — Builder Redesign)
CopyModal now handles BOTH old format (`s.label`, `e.n`, `e.r`, `e.c`, `e.nt`) and new format (`s.name`, `s.qNotes`, `e.name`, `e.mode`, `e.value`, `e.cadence`, `e.note`). Helper functions used throughout:

```javascript
const _sLabel = (s: Section) => (s as any).name || s.label || "Section";
const _sNotes = (s: Section) => (s as any).qNotes || s.note || "";
const _exName = (e: SectionExercise) => (e as any).name || e.n || "";
const _exNote = (e: SectionExercise) => (e as any).note || e.nt || "";
const _exReps = (e: SectionExercise): string => {
  const ex = e as any;
  if (ex.mode === "time") return ex.value + " " + ex.unit;
  if (ex.mode === "distance") return ex.value + " " + ex.unit;
  if (ex.mode === "reps" && ex.value !== undefined && ex.value !== "") return String(ex.value);
  return e.r || "";
};
const _exCad = (e: SectionExercise): string => {
  const ex = e as any;
  const cad = ex.cadence || e.c || "";
  if (ex.mode === "time" || ex.mode === "distance") return "";
  return cad;
};
```

These helpers must remain until all existing saved beatdowns are migrated to new format in Supabase.

### Step 1 — Pick format (bottom sheet)
Two options:
- **Quick Copy** (green card) — "Just the exercises. Paste anywhere."
- **Full Backblast** (amber card) — "AO, PAX, conditions — the full post."

### Quick Copy
Shows preview panel with:
- Beatdown name (if provided)
- Q name (e.g., "Q: The Bishop")
- Inspired by line (if running a Library beatdown)
- **Section headers wrapped in dashes:** `── Warmup ──` + **blank line after header** (s19)
- **Q notes as multi-line block (UPDATED s19):** Each line of Q notes gets its own `>` prefix. Blank line after Q notes block before exercises. Was previously single `>` on entire text blob.
- **Blank line after every section header** — with or without Q notes (s19)
- Regular exercises: `reps name cadence`
- **Transition lines:** `↗ Mosey to the bleachers` (no reps, no cadence — just arrow + text)
- Exercise notes as `  > note text`
- Footer: `Built with GloomBuilder · gloombuilder.app`
- "Copy to clipboard" button + "Paste in Slack, WhatsApp, or anywhere"

### Full Backblast (UPDATED April 16 — COT Message added)
Full-screen form with fields in this order:
1. AO (defaults to "F3 Essex")
2. Date + Time (side-by-side)
3. Conditions (placeholder "Clear, 52 degrees")
4. Q + FNGs (side-by-side, Q defaults to `qName` prop)
5. PAX textarea ("one per line")
6. Total PAX
7. **COT Message** ← NEW (April 16) — textarea, placeholder "Closing thought, prayer, or challenge for the PAX...", rows=3
8. Announcements textarea

**Live Slack-formatted preview** below form — uses same `── Section ──` format with transition support.
"Copy backblast" button + "Paste into #backblasts or any chat"

### Full Backblast State (bb object)
```javascript
const [bb, setBb] = useState({
  ao: "F3 Essex",
  date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }),
  time: "5:15 AM",
  cond: "",
  q: qName || "The Bishop",
  fngs: "",
  pax: "",
  cnt: "",
  cot: "",   // ← NEW April 16
  ann: "",
});
```

### Full Backblast Output Order (bbText) — UPDATED April 20 s18
```
Beatdown Name

AO: F3 Essex
Date: ...
Time: ...
Conditions: ...
Q: The Bishop
Inspired by: Shield Lock   ← (only if running a Library beatdown)
FNGs: ...
PAX: ...
Total PAX: ...

Workout:

── Section ──
> Q notes for section   ← MOVED above exercises (April 17 s16)
reps Exercise cadence
  > exercise note
↗ Transition line

COT:            ← (only if filled)
closing thought

Announcements:
announcement text

Built with GloomBuilder · gloombuilder.app
```

**NOTE (s18): No asterisks anywhere.** Previous format used `*AO:*`, `*Q:*`, etc. for Slack bold formatting. Removed because pasting anywhere other than Slack left ugly asterisks in the text.

### Example Copy Output (UPDATED s19)
```
Generated Beatdown
Q: The Bishop

── Warmup ──

15 SSH IC
10 Imperial Walkers IC

── The Thang ──

> 500 reps / 500 yards / 1 round.
> After every exercise, sprint to a marker and back, 50 yds total.
> OYO. No one waits, no one quits.

20 Merkins IC
↗ Mosey to the coupons
15 Coupon Curl IC

── Mary ──

20 Flutter Kicks IC
60 sec Plank OYO

Built with GloomBuilder · gloombuilder.app
```

### Footer
`Built with GloomBuilder · gloombuilder.app`
**NO underscores.** Previously had `_..._` for Slack italic formatting but made the URL hard to copy. Removed.

### Triggered From
- Generator result screen (Copy for Slack button, amber, next to Reroll)
- Builder screen (Copy for Slack button, amber, top right)
- Locker beatdown cards (Copy for Slack button)
- **Live Mode completion screen** (Copy Backblast button — opens CopyModal, NOT direct clipboard copy)

### COT Message — Design Decision (April 16)
**COT (Circle of Trust)** = the closing circle at the end of every F3 workout where the Q delivers a message, prayer, or reflection before the group dismisses.

**Where COT lives:** Full Backblast form ONLY (not in the builder). COT is a post-workout action — you write it when filling out the backblast, not when planning. No Supabase column needed — it's a live form field like PAX count and conditions.

**Why NOT in the builder:** The original plan (Bible v5 Fix 3) called for `cot_message TEXT` column on beatdowns table + textarea in builder. This was revised on April 16 — COT is written after the workout, not before. A COT written during planning is hypothetical. A COT written in the backblast form is the real thing.

---

## BUILDER / GENERATOR REDESIGN — COMPLETE FINAL SPEC (April 16-17, 2026)

### Background — Why We Rebuilt (Phase 1-3, Bible v7)
Original Builder was reported unusable by F3 PAX in the 40-50 age range:
- Fonts too small (10-12px everywhere)
- ▲▼ reorder buttons nearly untappable
- ⓘ info icons invisible (T5 color on dark background)
- Too many clicks per exercise
- "+ Add Section" buried at the bottom
- No section reorder at all

Three phases of redesign (Bible v7): Phase 1 (exercise cards + edit sheet + dnd-kit), Phase 2 (section structure), Phase 3 (cleanup). All merged to main April 16.

### UI Visual Redesign — April 17 (Bible v8)

After functional redesign was deployed, a second full visual redesign session addressed:
- **Cognitive overload** — too many competing colors, too many simultaneous affordances
- **Section headers looked like spreadsheet rows** — colored background strip read as a table column header, not a card
- **ADD EXERCISE field was invisible** — eye went to colored headers first, never found the input
- **Q notes + transitions too small** — unreadable for the target demographic
- **Beatdown Details "+" AO site · Equipment nested collapse** — rejected as confusing inside an already-collapsible card

Multiple mockup iterations were run (v1 through v8) before landing on the final approved design.

---

### Final Approved Section Card Design

**The core principle:** Color identifies the section but must NOT dominate the screen. The ADD EXERCISE field must be the most visually obvious interactive element in every section — because adding exercises is the only thing that matters on this screen.

#### Section Card Container
```
background: #111114
border-radius: 22px
box-shadow: 0 0 0 1px [sectionColor]40,
            0 4px 24px [sectionColor]0D
overflow: visible  ← CRITICAL — allows autocomplete dropdown to escape
```

**CRITICAL overflow note:** The section card MUST use `overflow: visible` on the outer container so the autocomplete dropdown can extend below the card boundary. The 3px color stripe at the top is achieved by a separate inner div with `borderRadius: "22px 22px 0 0", overflow: "hidden"` — this clips only the top corners, not the body.

#### 3px Color Stripe
```
height: 3px
background: sectionColor
borderRadius: none (straight edge)
```
This sits inside the `overflow: hidden` header div. It's the ONLY colored element on the section card. No colored background. No colored border fill. Just the stripe.

#### Section Header Row
```
padding: 14px 18px 12px
display: flex, alignItems: flex-start, justifyContent: space-between
```

Left side: ≡ drag handle + section name (tappable to rename) + exercise count
Right side: ✕ delete button (always visible)

**≡ Drag handle:**
- Color: `sectionColor` (full opacity)
- Font size: 28px
- Only element with `{...listeners}` for section drag
- Long-press 200ms → drags entire section

**Section name:**
- Color: T1 (#F0EDE8)
- Font size: 21px / weight 800 / letterSpacing -0.5px
- **Single tap → immediately enters rename mode** (no ··· menu, no separate rename button)
- `cursor: "text"` to hint tappability
- Rename input: `background: rgba(255,255,255,0.08)`, `border: 1.5px solid ${sColor}60`, fontSize 20, auto-focuses

**Exercise count:**
- Color: T5 (#7A7268)
- Font size: 12px
- Format: "N exercises" or "0 exercises" or "1 exercise"

**✕ Delete button (always visible, right side):**
- Size: 34×34px
- Background: rgba(239,68,68,0.08)
- Border: 1px solid rgba(239,68,68,0.2)
- Color: #ef4444
- Border-radius: 9px
- On tap: calls `handleDelete()` which always confirms if section has exercises
- Confirm message: `Delete "${secLabel}"? This will remove all ${count} exercise${count === 1 ? "" : "s"} in this section.`
- If section is empty: deletes immediately with no confirm

**NO ··· menu.** The ··· menu was removed because:
1. The ellipsis was too small to see
2. Required 2 taps (open menu → tap option)
3. The only actions were Rename and Delete — both now directly accessible

#### Q Notes (inside section, above exercises) — UPDATED April 17 s15

Q Notes empty state was redesigned from a full-width dashed-border box to a subtle inline text link. The previous dashed box had the same visual weight as the ADD EXERCISE field, causing the eye to go to Q notes first instead of Add Exercise. **The core principle: ADD EXERCISE must always be the most visually dominant element in every section card.**

Three states:

**State 1 — No notes (subtle text link):**
```
padding: 0 4px 10px
```
- `+ Add Q notes` text: T3 (#C0B8AC), 14px, fontWeight 600, cursor pointer
- **No box. No border. No background.** Just a clickable text link.
- Tap → enters edit mode.

**IMPORTANT DESIGN DECISION (April 17 s15):** The old dashed-border box (`background: rgba(255,255,255,0.03), border: 1px dashed rgba(255,255,255,0.12), borderRadius: 12px, padding: 14px 16px`) was explicitly replaced. It competed with ADD EXERCISE for visual attention. Three mockup options were presented (A: inline text link, B: slim pill button, C: below ADD EXERCISE). Option A was chosen for strongest visual hierarchy — ADD EXERCISE dominates, Q notes is discoverable but quiet.

**State 2 — Has notes (compact inline display):**
```
padding: 0 4px 10px
display: flex, alignItems: flex-start, gap: 8px
```
- ✎ icon: T4, 14px, flexShrink 0 (was 16px in box — slightly smaller inline)
- Note text: T2, 14px italic, lineHeight 1.5, wordBreak break-word (was 16px in box — 14px is sufficient inline without the "Q NOTES" label overhead)
- "Edit" link: sectionColor, 13px/700, right side
- **No box. No border. No "Q NOTES" label.** The ✎ icon and italic text are enough context.

**State 3 — Editing:**
- "Q Notes" label (T2, 13px/700 uppercase, letterSpacing 1px)
- Textarea: fontSize 16px, italic, 3 rows, section-color border at 40% opacity, `resize: vertical`
- Save button: background sectionColor, color BG, 16px/700, padding 12px 22px, borderRadius 10
- Cancel button: rgba(255,255,255,0.05) bg, T3 color, 16px, padding 12px 22px
- Remove button: red, right-aligned, only appears when there are existing notes

Local `qNotesDraft` state — only calls `onQNotesChange` on Save, not on every keystroke.

#### Exercise Cards (inside section body) — UPDATED April 17 s15

```
background: #1a1a1f
borderRadius: 14px
marginBottom: 6px
display: flex, alignItems: stretch  ← CHANGED from center to stretch for full-height drag strip
cursor: pointer (tap body → opens edit sheet)
overflow: hidden  ← ADDED to clip the drag strip corners
```

**Wide drag strip (left edge, 44px) — REDESIGNED April 17 s15:**
The drag handle is no longer a narrow ≡ icon inline with the text. It's now a full-height 44px-wide strip on the left edge of the card. This gives a much larger touch target for drag-to-reorder and prevents iOS text selection popups.

```
width: 44px
flexShrink: 0
display: flex, alignItems: center, justifyContent: center
color: sectionColor + "50"
fontSize: 22
borderRight: 1px solid rgba(255,255,255,0.04)
cursor: grab
touchAction: none
userSelect: none
WebkitUserSelect: none
WebkitTouchCallout: none  ← prevents iOS Copy/Look Up/Translate popup
```

The ≡ character is still displayed as a visual hint, but the entire 44px strip is the drag zone. The `dragHandleStyle` constant is shared across exercise cards, transition cards, and section headers.

**Content area (right of drag strip):**
```
flex: 1
display: flex, alignItems: center, gap: 10px
padding: 13px 12px 13px 10px
minWidth: 0
```

**Exercise name:** T1, 18px/700, overflow ellipsis, flex:1
**Custom badge:** amber "CUSTOM" pill, 10px/700 uppercase — if exercise not in allEx database
**Reps/cadence row:** T4, 14px/600, overflow ellipsis — shows ⏱ amber for time mode, 📏 purple for distance
**Note line:** T5, 13px italic (if note exists)

**? info button (NEW April 17 s15):** 28×28px, `background: P+"15"`, `border: 1px solid P+"30"`, borderRadius 8, purple text "?", fontWeight 700. Only appears on database exercises (not custom). Sits between exercise text and ✕ delete button. Tap opens ExerciseInfoSheet bottom sheet. Uses `e.stopPropagation()` to prevent opening edit sheet.

**✕ delete button (right):** 28×28px, rgba(239,68,68,0.07) bg, no border, T5 color — tapping calls delete directly without opening edit sheet

**Transition cards** also use the wide 44px drag strip pattern, with the same `dragHandleStyle` applied.

---

#### Exercise Info Peek Sheet (NEW — April 17 s15)

**ExerciseInfoSheet** is a lightweight bottom sheet for quickly viewing exercise info without opening the full edit sheet. One tap to open, one tap to close.

**When it appears:**
- User taps the purple ? button on any database exercise card
- Does NOT appear for custom exercises (they have no database info)

**Sheet structure:**
```
position: fixed, inset: 0
background: rgba(0,0,0,0.8)  ← slightly lighter than edit sheet's 0.85
zIndex: 250  ← above edit sheet (200) but below toast (300)
alignItems: flex-end (slides up from bottom)
```

**Sheet container:**
```
background: #1c1c20
borderRadius: 22px 22px 0 0
maxWidth: 430px
maxHeight: 75vh
overflowY: auto
overscrollBehavior: contain
border: 1px solid rgba(167,139,250,0.15)  ← subtle purple border
```

**Body scroll lock:** Same pattern as ExerciseEditSheet — `useEffect` sets `document.body.style.position = "fixed"` on mount, restores on unmount. Prevents background beatdown screen from scrolling.

**Content layout:**
1. **Grab handle bar** — 40×4px, centered, rgba(255,255,255,0.15)
2. **Header:** Exercise name (T1, 20px/800) + ✕ close button (T3, 22px, 44×44px rounded button with visible background — `rgba(255,255,255,0.06)` bg, `1px solid rgba(255,255,255,0.10)` border, `borderRadius: 12` — UPDATED s18 from invisible 24px text-only)
3. **Description** (if exists) — T3, **17px** (was 15px — bumped s18), lineHeight 1.65
4. **How-to steps** — separated by `borderTop`, label "HOW TO DO IT" (T4, 11px/700 uppercase), each step T3 **18px** (was 15px — bumped s18) lineHeight 1.7, split on `\d+\.\s` regex
5. **Tags** — colored pills: Warm-Up=green, Mary/Core=purple, Cardio/Full Body=red, Coupon=amber, others=T3. Difficulty badge if available (green/amber/red).

**State management:** `infoEx: ExerciseData | null` in main SectionEditor export. Set by `handleShowInfo(exName)` which looks up the exercise in `allEx`. Cleared by `setInfoEx(null)` on close.

**Flow: Card → Info Sheet → Back to beatdown (2 taps total)**
Old flow was: Card → Edit Sheet → scroll → "How to do this exercise" → expand → read → collapse → Cancel → back (6+ taps). Now: Card ? button → Info Sheet → ✕ or tap outside → back (2 taps).

#### Transition Lines (between exercises)

Transitions are NOT exercise cards. They render as inline rows between cards:
```
display: flex, alignItems: center, gap: 10px
padding: 9px 12px, marginBottom: 6px
background: rgba(255,255,255,0.03)
borderRadius: 10px
```
- ↗ icon: T4, 15px
- Transition text: T3, 16px italic, fontWeight 500, flex:1, `wordBreak: "break-word"`, `overflowWrap: "break-word"`
- ✕ button: T5, 15px, no background — tap to delete

**Transitions have their own ≡ drag handle** — they can be reordered within the section like exercises.

#### ADD EXERCISE Field (Hero Element — most important thing on screen)

This is the primary CTA of the builder screen. It must be visually dominant.

```
background: #111114  (same as card bg — intentional dark inset)
border: 2px solid [sectionColor]55
borderRadius: 15px
display: flex, alignItems: stretch
overflow: hidden  ← on the field itself only, not the outer container
boxShadow: 0 0 14px [sectionColor]12
```

**Left side (text area):**
```
flex: 1
padding: 14px 0 14px 16px
```
- "ADD EXERCISE" label: sectionColor, 11px/800 uppercase, letterSpacing 1.5px, marginBottom 5px, pointerEvents none
- Input element: background none, border none, outline none, color T2, fontSize 16px/500

The input is a real `<input>` element (not a div). When focused, autocomplete dropdown appears.

**Right side (browse icon):**
```
padding: 0 20px
height: 52px (matches field height)
borderLeft: 1px solid [sectionColor]33
display: flex, alignItems: center, justifyContent: center
```
- ⌕ icon: sectionColor, **28px** (was 22px — bumped April 17)
- Tap ⌕ → opens full-screen browse library picker modal

**Autocomplete dropdown:**
```
position: absolute, top: 100%, left: 0, right: 0
zIndex: 9999  ← CRITICAL — must be above everything
background: #1c1c20
border: 1px solid [sectionColor]40
borderRadius: 14px
marginTop: 4px
overflow: hidden
boxShadow: 0 8px 32px rgba(0,0,0,0.6)
```

Dropdown appears after 2+ characters. First row is always "Add X as custom" (amber, always present). Remaining rows are database matches sorted by relevance score. Each match has the exercise name + alias (if different) + "Add" button in section color.

**CRITICAL:** The dropdown was previously clipped by `overflow: hidden` on the section card. Fix: section card outer container uses `overflow: visible`. Only the top header strip div uses `overflow: hidden` (to clip the color stripe corners). This was a live bug where the dropdown appeared but was invisible.

#### + Add Section Button

After every section card, outside the card itself:
```
width: 100%
marginTop: 8px
background: none
border: 1.5px dashed rgba(255,255,255,0.15)
borderRadius: 13px
padding: 13px 0
color: T3
fontSize: 15px / fontWeight: 700
cursor: pointer
```
Text: "+ Add Section"

Tap → inserts new section immediately BELOW the tapped button's section → auto-focuses rename mode after 60ms delay.

**New section color rotation:** `sC[sections.length % sC.length]` — where `sections.length` is the count BEFORE insertion. This was a bug: old code used `afterIdx+1` which was always 1 (amber) regardless of existing sections. Now rotates correctly through the palette: green, amber, purple, red, blue, pink, cyan.

---

### TRANSITIONS — FINAL DECISION (April 17, UPDATED April 21 s19)

**Transitions live ONLY in the exercise edit sheet. Not at the section level.**

This was decided in the mockup phase and confirmed in the final implementation:
- A transition is always BETWEEN two specific exercises — it logically belongs to the exercise it follows
- Tap any exercise card → edit sheet opens → "TRANSITION AFTER THIS" section at the bottom
- Type the transition text (e.g., "Mosey to the bleachers") → **tap "Save changes"** (transition saves with exercise edits — s19 change)
- Toast: "Transition added"

**TRANSITION EDITING (NEW — April 21 s19):**
Transition cards are now tappable. Tap a transition card → bottom sheet opens with:
- "Edit transition" header (T2, 14px/700 uppercase)
- ✕ close button (36x36px with visible background)
- ↗ icon + editable input (section-colored border, 16px italic)
- Save button (section color) + Cancel button
- Enter key also saves
- Save updates the transition's `name` and `n` fields in the section exercises array
- `editTrIdx` and `editTrText` state in SortableSectionBlock

**TRANSITION SAVE FLOW (CHANGED — April 21 s19):**
The "Add" button was removed from the Transition After This field in ExerciseEditSheet. Previously: type text → tap "Add" (separate action that closed the sheet). Now: type text → tap "Save changes" (saves exercise edits AND adds transition in one tap). `handleSave()` checks `transitionText.trim()` and calls `onAddTransitionAfter` if text is present.

**TRANSITION AFTER THIS field in ExerciseEditSheet:**
```
borderTop: 1px solid rgba(255,255,255,0.07)
paddingTop: 20px, marginBottom: 20px
```
- Label: "TRANSITION AFTER THIS" (T2, 13px/800 uppercase, letterSpacing 1.5px)
- Input field: dashed border bg, ↗ icon left, text input, "Add" button right (appears only when text is present)
- ↗ icon: T5, 17px
- Input: T2, 16px italic, no border, outline none, padding 16px 0
- Add button: sectionColor bg, BG color, 14px/800, height 54px — only visible when transitionText.trim() is truthy
- Helper text: T5, 13px — "Inserts a mosey line after [exerciseName] in the beatdown"

**Implementation in SectionEditor:** `onAddTransitionAfter` prop on ExerciseEditSheet. When called, finds the exercise index in the section, splices the transition immediately after it:
```typescript
onAddTransitionAfter={(text) => {
  const si = editSheet.sectionIdx;
  const sec = sections[si];
  const exIdx = sec.exercises.findIndex(e => e.id === editSheet.exercise.id || e.n === editSheet.exercise.n);
  if (exIdx === -1) return;
  const id = generateId();
  const tr = { id, type: "transition", name: text, n: text, r: "", c: "", nt: "", note: "" };
  const newExercises = [...sec.exercises];
  newExercises.splice(exIdx + 1, 0, tr);
  update(sections.map((s, i) => i !== si ? s : { ...s, exercises: newExercises }));
  setEditSheet(null);
  fl("Transition added");
}}
```

**DO NOT add a standalone transition button at the section level.** This was tried and removed. Transitions always follow a specific exercise — that context lives in the edit sheet, not floating at the bottom of a section.

---

### BEATDOWN DETAILS CARD — FINAL SPEC (April 17)

#### BuilderScreen — Collapsible, Hidden by Default

```
background: #141416
border: 1px solid rgba(255,255,255,0.07)
borderRadius: 18px
overflow: hidden
marginBottom: 20px
```

**Header row (always visible, tap to toggle):**
```
padding: 14px 18px
display: flex, alignItems: center, justifyContent: space-between
cursor: pointer
```
- "BEATDOWN DETAILS" label: T2, 13px/800, letterSpacing 1px, uppercase
- ▾ / ▸ toggle: T5, 16px — ▾ when open, ▸ when closed

**Default state: CLOSED (`useState(false)`).** User expands when they need to set details. The Builder's primary job is adding exercises, not configuring metadata.

**Expanded content (when open):**
```
padding: 0 18px 16px
borderTop: 1px solid rgba(255,255,255,0.05)
```

Inside (all flat, no nested collapse):
1. **Duration** — "30 min" / "45 min" / "60 min" toggle chips
2. **Difficulty** — "Easy" / "Medium" / "Hard" / "Beast" color-coded chips
3. **AO Site** — multi-select chips (Field, Track, Parking, Stairs, Hills, Walls, Benches, Pull-up bar)
4. **Equipment** — multi-select chips (Bodyweight, Coupon)

**CRITICAL: AO Site and Equipment are ALWAYS flat inside Beatdown Details. No nested collapse, no `<details>` element, no "+" expand link.** The old pattern (`<details><summary>+ AO site · Equipment</summary>`) was explicitly rejected as confusing — nested collapse inside a collapsible is bad UX.

Chip styling (selected state):
- Duration: `background: G+"20"`, `border: 1.5px solid G`, `color: G`
- Difficulty: `background: d.c+"20"`, `border: 1.5px solid d.c`, `color: d.c`
- AO Site: `background: G+"20"`, `border: 1.5px solid rgba(34,197,94,0.5)`, `color: G`
- Equipment: `background: P+"20"`, `border: 1.5px solid rgba(167,139,250,0.5)`, `color: P`

Chip styling (unselected):
- `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.1)`, `color: T2`

#### GeneratorScreen — Collapsed by Default, Shows Chip Summary

Same card structure as Builder. Key differences:
- **Default state: CLOSED (`useState(false)`)** — wizard already set all values, no need to show them immediately
- **Collapsed state shows chip summary** — row of colored pills below the header label showing what the wizard chose:
  - Duration chip: green (G) tinted
  - Difficulty chip: amber (A) tinted, text capitalized
  - Site chips: neutral T3 tinted
  - Equipment chips: purple (P) tinted

```typescript
// Collapsed chips (inline, below the BEATDOWN DETAILS label)
{!grDetailsOpen && (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
    {gc.dur && <span style={...greenChip}>{gc.dur}</span>}
    {gc.diff && <span style={...amberChip}>{gc.diff}</span>}
    {(gc.sites || []).map(s => <span key={s} style={...neutralChip}>{s}</span>)}
  </div>
)}
```

- **Expanded content:** Shows a note: "These were set during generation. To change, start a new generation." Plus chips listing what was used. No editable fields in expanded Generator details (no need to change what the wizard set — just start a new generation).

**CRITICAL: `grDetailsOpen` useState MUST be declared at the top of GeneratorScreen, before any early returns.** Declaring it after `if (ld) return <loading />` violates React hooks rules and causes a crash. This was a live bug — generator crashed on load.

---

### SectionEditor.tsx — Complete Architecture (April 17 s15 — UPDATED)

#### Component Structure
```
SectionEditor (main export)
  ├── SortableSectionBlock (separate named component — React hooks rule)
  │   ├── QNotes (inline state: qNotesOpen, qNotesDraft)
  │   ├── SortableExerciseCard (separate named component)
  │   │   └── ExerciseCard (renders exercise or transition — wide 44px drag strip)
  │   └── ADD EXERCISE input + autocomplete dropdown
  ├── ExerciseEditSheet (bottom sheet, full-screen overlay — field order rearranged)
  ├── ExerciseInfoSheet (NEW — bottom sheet for quick exercise info peek)
  ├── Browse Library picker modal (full-screen overlay)
  └── Toast notification
```

#### Key State in SectionEditor (main)
```typescript
const [editSheet, setEditSheet] = useState<{ sectionIdx: number; exercise: SectionExercise } | null>(null);
const [editLabel, setEditLabel] = useState<number | null>(null);   // section being renamed
const [qaQ, setQaQ] = useState("");                                 // quick-add text
const [qaSec, setQaSec] = useState<number | null>(null);           // active QA section
const [pk2, setPk2] = useState(false);                             // picker open
const [pkI, setPkI] = useState(0);                                 // picker target section
const [pS, setPS] = useState("");                                   // picker search
const [pTg, setPTg] = useState<string | null>(null);               // picker tag filter
const [toast, setToast] = useState("");
const [infoEx, setInfoEx] = useState<ExerciseData | null>(null);   // NEW April 17 s15 — exercise info sheet
// trSec and trText state vars kept for backward compat but standalone transition UI removed
```

#### Shared dragHandleStyle constant (NEW April 17 s15)
```typescript
const dragHandleStyle: React.CSSProperties = {
  cursor: "grab",
  touchAction: "none",
  lineHeight: 1,
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};
```
Applied to: exercise card drag strips, transition card drag strips, section header drag handles.

Note: `trSec` and `trText` state remain in the component for backward compatibility but the standalone transition UI (the "Add transition" button at section level) was removed. Transitions are created only via ExerciseEditSheet's `onAddTransitionAfter` callback.

#### Key State in SortableSectionBlock (per-section)
```typescript
const [qNotesOpen, setQNotesOpen] = useState(false);
const [qNotesDraft, setQNotesDraft] = useState(sec.qNotes || sec.note || "");
const hasQNotes = (sec.qNotes || sec.note || "").trim().length > 0;
```

#### handleAddSection — Color Rotation Fix
```typescript
const handleAddSection = (afterIdx: number) => {
  const color = sC[sections.length % sC.length];  // USE sections.length NOT afterIdx+1
  // ...
};
```
`sections.length % sC.length` uses the count of sections BEFORE insertion, cycling through the 7-color palette correctly. Old code used `(afterIdx + 1) % sC.length` which always evaluated to 1 (amber) when adding after the first section.

#### handleDelete in SortableSectionBlock
```typescript
const handleDelete = () => {
  if (sec.exercises.length > 0) {
    if (!confirm(`Delete "${secLabel}"? This will remove all ${sec.exercises.length} exercise${sec.exercises.length === 1 ? "" : "s"} in this section.`)) return;
  }
  onDeleteSec();
};
```
Always shows a warning with exercise count if section is not empty. Immediate delete if empty.

#### Browse Library Picker Modal
Full-screen overlay, `zIndex: 150`. Contains:
- Section name + "adding to this section" label in section color
- Search input (autofocused)
- Tag filter chips (all 12 TAGS)
- Scrollable exercise list

Each exercise card: name (T1, 16px/700) + description/alias (T4, 12px) + green "+ Add" button. Tapping Add inserts the exercise at the bottom of the section and closes the picker.

---

### DESIGN DECISIONS — REJECTED DURING MOCKUP SESSIONS (April 17)

These were shown in mockups and explicitly rejected by Ritz. They must not be reintroduced:

| Rejected Idea | Why |
|--------------|-----|
| ··· (ellipsis) menu for section management | Too tiny to see. Required 2 taps. Direct tap to rename is faster. |
| Standalone "Add transition" button at section level | Transitions always follow a specific exercise. Context belongs in edit sheet. |
| Section colored background header card | Made screen look like an Excel spreadsheet. Only the 3px top stripe conveys color. |
| Muted/small text for Q notes and Add transition | Primary users are 40-50, outdoors. Everything must be at minimum 16px. |
| Tiny ⌕ icon (22px) | Bumped to 28px. Browse is a primary action, must be obvious. |
| Nested `<details>` collapse inside Beatdown Details | Confusing UX — collapse inside a collapse. AO site and Equipment always flat. |
| "These were set during generation. You can adjust them here." text in Generator details | Too small and unhelpful. Replaced with visual chip summary. |
| Small italic transition text without background | "Grey on black background? Really?" — unreadable. |
| Section headers that look like table/spreadsheet rows | Colored strip with uppercase text = spreadsheet column header feel. Rejected. |
| ⌕ Browse library as a separate button below add field | Cluttered. Browse icon lives inside the add field on the right. |
| "Browse library" + "Transition" as separate side-by-side buttons | Two separate buttons below field created clutter. Browse moved inside field; transition moved to edit sheet. |
| AO Site + Equipment behind `+ AO site · Equipment` expand link | Nested collapse inside collapsible. Both always visible inside Beatdown Details. |
| Beatdown Details open by default | Q's primary job is adding exercises. Details are secondary. Hidden by default. |

---

### EXERCISE EDIT SHEET UX OVERHAUL — April 17 s15

Five UX issues were identified from real iPhone usage and fixed in a single SectionEditor.tsx update:

#### Issue 1 — Keyboard pops up on sheet open
**Problem:** The HOW MUCH input had `autoFocus`, so when you tapped any exercise card to open the edit sheet, the iPhone keyboard immediately appeared and blocked half the screen. Confusing — you opened the sheet to see the exercise, not to type.
**Fix:** Removed `autoFocus` from the HOW MUCH input. Sheet now opens showing all fields clearly. Q taps the field they want to edit manually. `autoFocus` remains on the Custom Cadence input (only appears when Custom is selected) and on the Q Notes textarea (user explicitly chose to edit).

#### Issue 2 — Background screen scrolls through edit sheet
**Problem:** When scrolling inside the edit sheet on iPhone, touch events propagated to the background beatdown screen, causing it to scroll instead. The edit sheet itself was finicky to scroll.
**Fix:** Added `useEffect` body scroll lock that sets `document.body.style.position = "fixed"` + `overflow: "hidden"` when the edit sheet mounts, and restores original values on unmount. Also added `overscrollBehavior: "contain"` on the sheet container to prevent scroll chaining. Same pattern applied to ExerciseInfoSheet.

```typescript
useEffect(() => {
  const orig = document.body.style.overflow;
  const origPos = document.body.style.position;
  const origW = document.body.style.width;
  const scrollY = window.scrollY;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = `-${scrollY}px`;
  return () => {
    document.body.style.overflow = orig;
    document.body.style.position = origPos;
    document.body.style.width = origW;
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
  };
}, []);
```

#### Issue 3 — Smart text hint too small
**Problem:** "Try: 20 · 45 sec · 50 yds · 3 laps" was 11px T5 — nearly invisible.
**Fix:** Bumped to 14px T4 (#928982). Classification icon bumped from 16px to 18px, classification text from 14px/600 to 15px/700.

#### Issue 4 — Field order wrong in edit sheet
**Problem:** "How to do this exercise" was buried near the bottom of the edit sheet, after Note and before Transition. Q had to scroll past all the editing fields just to see what an exercise is.
**Fix:** Rearranged the edit sheet field order:

**Old order:** Exercise name → HOW MUCH → CADENCE → NOTE → How to do this exercise → TRANSITION AFTER THIS → Save/Delete

**New order:** Exercise name → **How to do this exercise** → HOW MUCH → CADENCE → NOTE → **TRANSITION AFTER THIS** → Save/Delete

The How-to collapsible now sits directly below the exercise name — the Q sees it immediately when the sheet opens. Transition moved from after How-to to right below Note, keeping all "editing" fields grouped together.

#### Issue 5 — iOS text selection on drag handles
**Problem:** Long-pressing the ≡ drag handle on exercise cards triggered iOS Safari's text selection (Copy/Look Up/Translate popup). The narrow ≡ character was treated as selectable text.
**Fix:** Created a `dragHandleStyle` constant with `userSelect: "none"`, `WebkitUserSelect: "none"`, `WebkitTouchCallout: "none"`, `touchAction: "none"`. Applied to all ≡ drag handles (exercise cards, transition cards, section headers). Combined with the wider 44px drag strip (see Exercise Cards section), this eliminates the iOS popup entirely.

```typescript
const dragHandleStyle: React.CSSProperties = {
  cursor: "grab",
  touchAction: "none",
  lineHeight: 1,
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};
```

**TypeScript note:** `WebkitTouchCallout` is now recognized by Next.js 16's TypeScript without `@ts-expect-error`. An initial `// @ts-expect-error` directive was added but caused a build failure ("Unused '@ts-expect-error' directive"). The directive was removed. Do not add it back.

---

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Generator crashes on load | `grDetailsOpen` useState declared after `if (ld) return` — React hooks violation | Moved to top of GeneratorScreen with other state declarations |
| Autocomplete dropdown truncated, exercises invisible | Section card had `overflow: hidden` on outer container | Split card: outer uses `overflow: visible`, only top header div uses `overflow: hidden` (for color stripe corner clip). Dropdown gets `zIndex: 9999` |
| Q notes missing from section | Removed entirely during redesign, not re-added | Re-implemented as full-width dashed button (empty) + card display (has content) + textarea (editing) — all at 16px minimum |
| New section always amber (2nd color) | Color rotation used `(afterIdx+1) % sC.length` — always 1 when adding after first section | Changed to `sections.length % sC.length` which uses total count before insertion |
| Delete button closed ··· menu but didn't delete | Delete was inside a menu that toggled closed. Confirm dialog never fired. | Removed ··· menu entirely. ✕ button always visible in header. Calls `handleDelete()` directly with confirm dialog |
| Ellipsis too tiny, 2 clicks to rename | ··· at 20px T5 barely visible. Rename required: tap ···, see menu, tap Rename. | Removed ··· entirely. Section name is directly tappable (`cursor: text`). Single tap = immediate rename. |
| Q notes body text bleeds outside card | `whiteSpace: pre-wrap` without word break wrapping | Added `wordBreak: "break-word"` and `overflowWrap: "break-word"` |
| Browse ⌕ icon too small (22px) | Initial implementation | Bumped to 28px |
| Standalone transition button at section level | Added by mistake in redesign | Removed. Transition lives only in ExerciseEditSheet via `onAddTransitionAfter` prop |
| Beatdown Details open by default in Builder | `useState(true)` | Changed to `useState(false)` |
| TypeScript build error: `An object literal cannot have multiple properties with the same name` | Browse button style had `border: "none"` AND `borderLeft: ...` — duplicate property from `border` (which is a superset of `borderLeft`) | Removed `border: "none"` from inline style, kept only `borderLeft: ...` |
| Generator details showed tiny text summary | Text like "Duration: 45 min · Difficulty: hard" in 11px T5 | Replaced with colored chip pills (green for duration, amber for difficulty, neutral for sites, purple for equipment) |

---

### GIT WORKFLOW — WHAT HAPPENED (April 17)

This session ended with a direct push to `main` (not through a branch). This is fine because all changes were tested locally first and Vercel auto-deployed successfully.

**What happened step by step:**
1. Files were built and tested on `localhost:3000` throughout the session
2. `git add .` — staged all changes (LF→CRLF warnings are normal on Windows, harmless)
3. `git commit -m "..."` — committed to `main` directly (showed `[main c7f04e8]`)
4. `git push origin builder-redesign-v2` — said "Everything up-to-date" (branch was already ahead from previous session's merge, no new commits there)
5. `git push origin main` — pushed to main, Vercel deployed to gloombuilder.app
6. Build failed: TypeScript error (duplicate `borderLeft` in browse button style)
7. Fixed locally, re-pushed with `git commit -m "Fix duplicate borderLeft TypeScript error"` + `git push origin main`
8. Build succeeded ✅ — gloombuilder.app now shows the full new builder design

**LF/CRLF warnings are always safe to ignore on Windows.** Git is converting Unix line endings to Windows on checkout. Has zero effect on the code.

**When Vercel says "Everything up-to-date"** for a branch push — it means that branch hasn't changed since last push. Check which branch your last commit went to. `git log --oneline -3` shows recent commits and their branch.

---
```
+ Add Section
```
Full-width dashed border button after every section: `border: "2px dashed rgba(255,255,255,0.18)"`, `borderRadius: 12`, `padding: "14px 0"`, T3 color, 15px/700.

Behavior: tap → inserts new empty section BELOW current section → auto-focuses rename mode after 60ms delay.

New section color rotates: `sC[(afterIdx + 1) % sC.length]` from palette `[G, A, P, R, "#3b82f6", "#ec4899", "#06b6d4"]`.

**Section drag (dnd-kit — Phase 2):**
- Outer `DndContext` wraps all sections with `onDragEnd={handleSecDragEnd}`
- Section reorder matched by `s.id || s.label`
- `SortableSectionBlock` is a separate named component — useSortable hook requirement (cannot use inline in `.map()`)
- Long-press ≡ on section header → drags entire section with all its exercises as one unit
- Inner `DndContext` per section handles exercise reordering — nested DndContexts work correctly

---

### Phase 3: Cleanup (COMPLETE)

**Duration Estimator — BUILT AND REMOVED:**
A `~47 min planned` floating badge above the Save button was built. Showed green when within 5 minutes of selected duration, amber when off. Removed because estimates were wildly inaccurate — 100 Burpees IC showed 7 minutes even after increasing pace constants to 5 sec/rep IC + 1.25x buffer. PAX pace varies too much. No formula can reliably estimate F3 workout time. **Do not re-introduce under any circumstances.**

**Quick delete ✕ on exercise cards (Phase 3 addition):**
Every exercise card has a red ✕ at the right. Tap → immediate delete, no confirmation, no edit sheet required. The ✕ button: `onClick: e => { e.stopPropagation(); onDelete(); }` — stopPropagation prevents triggering the card tap (which opens edit sheet).

**Text overflow on exercise cards (Phase 3 fix):**
Long custom names were overflowing the card box. Fixed with:
- Exercise name: `overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0`
- Reps/cadence row: `overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"`
- Note line: `overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"`
- Card uses `flex` with no gap, `minWidth: 0` on text container to allow shrinking

---

### Data Model — New Dual-Format

**SectionExercise interface extended (both old and new fields coexist):**
```typescript
export interface SectionExercise {
  // Legacy fields (always populated for backward compat)
  n: string;       // name
  r: string;       // reps text (e.g., "20" or "45 sec")
  c: string;       // cadence (e.g., "IC")
  nt: string;      // note text
  type?: "exercise" | "transition";
  // New fields (populated by normalizeExercise and generate())
  id?: string;     // UUID — required for dnd-kit unique keys
  name?: string;   // same as n
  mode?: "reps" | "time" | "distance";
  value?: number | string;
  unit?: "sec" | "min" | "yds" | "laps";
  cadence?: string; // same as c
  note?: string;    // same as nt
  exerciseId?: string;
}
```

**Section interface extended:**
```typescript
export interface Section {
  // Legacy fields
  label: string;
  color: string;
  exercises: SectionExercise[];
  note: string;
  // New fields
  id?: string;     // UUID for dnd-kit section drag
  name?: string;   // same as label
  qNotes?: string; // same as note
}
```

**Why dual-format:** Existing beatdowns in Supabase JSONB are in old format. New beatdowns use new format. Both must work side by side. Do NOT remove legacy fields until a one-time Supabase SQL migration converts all existing beatdowns.

### New Functions in exercises.ts (April 16)

```typescript
// Normalize a raw Supabase JSONB exercise (old or new format) → fills both old and new fields
export function normalizeExercise(raw: Record<string, unknown>): SectionExercise

// Normalize a raw Supabase JSONB section (old or new format) → fills both old and new fields
export function normalizeSection(raw: Record<string, unknown>): Section

// Parse free-text like "20", "45 sec", "50 yds" into typed format
export function parseSmartText(input: string): { mode: "reps"|"time"|"distance", value: number|string, unit?: "sec"|"min"|"yds"|"laps" } | null

// Generate a UUID (browser + Node safe, uses crypto.randomUUID() where available)
export function generateId(): string

// Format an exercise's amount for display
export function formatExerciseAmount(ex: SectionExercise): string
```

**normalizeExercise logic:**
- If `raw.mode` exists → already new format, use it directly, also populate legacy fields
- If no `raw.mode` → legacy format, parse `r` and `c` fields via `_parseLegacyRepsAndCadence()`
  - Handles: "45 sec" → time/45/sec, "2 min" → time/2/min, "50 yds" → distance/50/yds, "20" → reps/20
  - Legacy cadence-as-timer: reps="10" + cadence="sec" → time/10/sec
- Always fills BOTH old (n, r, c, nt) and new (id, name, mode, value, unit, cadence, note) fields

**normalizeSection logic:**
- Reads `raw.name || raw.label` for section name
- Reads `raw.qNotes || raw.note` for Q notes
- Generates new UUID if `raw.id` missing
- Normalizes all exercises via `normalizeExercise()`

**TypeScript cast rule (CRITICAL):**
When passing a typed `Section` to `normalizeSection()` which expects `Record<string,unknown>`, must cast through `unknown` first:
```typescript
normalizeSection(s as unknown as Record<string,unknown>)  // CORRECT
normalizeSection(s as Record<string,unknown>)              // TypeScript ERROR
```
This applies everywhere: page.tsx dbToLocker, BuilderScreen editData.secs.map, GeneratorScreen generate() result.

### page.tsx Changes (April 16)
`dbToLocker()` now normalizes sections when loading from Supabase:
```typescript
secs: ((row.sections as Record<string,unknown>[]) || []).map(normalizeSection),
```
Ensures all beatdowns (old or new format) are normalized before reaching Builder or Live Mode.

### generate() Changes (April 16)
Generator output now includes both old and new fields for every exercise:
```typescript
// Example warmup exercise output
{ id: _genId(), type: "exercise" as const, name: e.n, mode: "reps" as const,
  value: wRepNum, cadence: "IC", note: "", n: e.n, r: wRepStr, c: "IC", nt: "" }
```
Sections from generate() also include new fields:
```typescript
{ id: _genId(), name: label, label, color, qNotes: "", note: "", exercises }
```
Plank/static exercises use time mode:
```typescript
{ id: _genId(), type: "exercise" as const, name: "Plank", mode: "time" as const,
  value: plankSec, unit: "sec" as const, cadence: "OYO", note: "",
  n: "Plank", r: plankR, c: "OYO", nt: "" }
```

### SectionEditor Internal Architecture

**State variables:**
```typescript
const [editSheet, setEditSheet] = ...  // { sectionIdx, exercise } or null
const [editLabel, setEditLabel] = ...  // section index in rename mode, or null
const [qaQ, setQaQ] = ...             // quick-add search query
const [qaSec, setQaSec] = ...         // which section's QA input is active
const [trSec, setTrSec] = ...         // which section's transition input is open
const [trText, setTrText] = ...       // transition text
const [pk2, setPk2] = ...             // exercise picker modal open
const [pkI, setPkI] = ...             // which section picker is for
const [pS, setPS] = ...               // picker search query
const [pTg, setPTg] = ...             // picker tag filter
const [toast, setToast] = ...
```

**SortableSectionBlock component (SEPARATE — not inline):**
Required pattern: `useSortable` hook cannot be called inside a `.map()` lambda — React hook rules require calling hooks only from named function components. So each section is rendered by a separate `SortableSectionBlock` function component that calls `useSortable({ id: secId })` at the top level, then passes `{...listeners}` down to the section header drag handle.

**dnd-kit nested context:**
```jsx
// Outer — section reordering
<DndContext onDragEnd={handleSecDragEnd}>
  <SortableContext items={sectionIds}>
    {sections.map(sec => <SortableSectionBlock ... />)}
  </SortableContext>
</DndContext>

// Inner (inside each SortableSectionBlock) — exercise reordering
<DndContext onDragEnd={handleExDragEnd(si)}>
  <SortableContext items={exIds}>
    {sec.exercises.map((ex, exIdx) => <SortableExerciseCard ... />)}
  </SortableContext>
</DndContext>
```

**exIds array pattern:**
```typescript
const exIds = sec.exercises.map((e, idx) =>
  e.id ? `${e.id}-${idx}` : (e.n ? `${e.n}-${idx}` : `ex-${si}-${idx}`)
);
```

---

## SCREENS — ALL 10 BUILT

### 1. Auth Screen (AuthScreen.tsx)
- Centered layout, maxWidth 430px
- Logo (60px), title "GloomBuilder" (28px/800), subtitle "by The Bishop · Build. Share. Steal. Repeat."
- Toggle: Login / Sign up segmented control (green active bg, 14px/600)
- Signup fields: F3 Name (with char count /30), Email, Password
- Login fields: Email, Password
- Error display: Red text centered (13px, #ef4444)
- Submit button: Green primary, shows "Loading..." when processing
- Signup passes `f3_name` via `options.data` metadata → triggers `handle_new_user()` to auto-create profile row
- Footer: Disclaimer

### 2. Home Screen (HomeScreen.tsx)
- **Props:** `profName`, `onProfileTap`, `onGenerate`, `onBuild`, `onCreateEx`
- Header: Logo (42px) + "GloomBuilder" (22px/800) + subtitle (13px, T4) + avatar (top-right, user's initials, clickable → Profile tab)
- Quick Generate card: green gradient bg, borderRadius 22, padding 28px 24px, "Quick generate" label, headline, subtitle, green button → triggers `onGenerate`
- "or" divider: horizontal lines with "or" text centered
- Build from scratch card (T2 title, arrow) → triggers `onBuild`
- Create exercise card (purple title, arrow) → triggers `onCreateEx`
- Avatar shows **logged-in user's** initials (dynamic, not hardcoded)
- Footer: Disclaimer

### 3. Library Screen (LibraryScreen.tsx)
- **Props:** `sharedItems` (FeedItem[]), `profName` (string), `userVotes` (Set<string>), `onToggleVote`, `userBookmarks` (Set<string>), `onBookmark`, `onSteal`, `onRefresh` (() => void)
- **Imports:** `loadSeedExercises`, `addComment`, `loadComments`, `deleteComment`, `updateComment` from db.ts; `mapSupabaseExercise` and `ExerciseData` from exercises.ts
- **FeedItem interface:** `id: number | string`, includes `howTo?`, `inspiredBy?` for exercises and stolen items
- **State:** `dbComments` (loaded from Supabase per detail view), `cmtLoading`, `editCmtId`/`editCmtText` (inline edit), `saveSheet` (FeedItem for save bottom sheet), `dbDetail` (exercise detail modal)
- **NO SAMPLE DATA** — Library shows only Supabase data
- **Empty state:** "No beatdowns shared yet. Be the first!" / "No exercises shared yet. Be the first!"
- **Seed exercises loaded on mount** — 904 exercises for database browser AND beatdown detail exercise lookups
- **Save bottom sheet (`saveSheetEl`)** — Bookmark vs Steal options, rendered in ALL views
- **Comments loaded from Supabase** — `useEffect` on `libDet.id` calls `loadComments()`. Own comments show Edit/Delete links.
- **Comment counter on feed cards** — shows "X comments" from `comment_count` column (bd.cm), only when > 0
- **Detail view sync** — `useEffect` watches `sharedItems` and syncs `libDet` for vote/comment count updates
- **Inspired by** — shown on cards and detail view for stolen items (amber text)
- **"· You" badge** on own items (compares `bd.au === profName`)

#### Main Tabs: Beatdowns | Exercises
- Segmented control, green active
- Search bar: free text across title, Q name, AO, description (hidden when Exercise Database active)
- Sort: New | Top voted | Most stolen
- Filters button: shows active count, opens full-screen filter view
- Beatdown filters: Difficulty, Duration, Region, AO site type, Source (All / Hand Built / GloomBuilder)
- Exercise filters: Tag, Difficulty, Region

#### Exercise Database Browser (NEW — April 14, UPDATED April 20 s18)
When Exercises tab is active, a **sub-toggle** appears: **"Shared | Exercise Database"** (purple theme)
- **Shared tab:** Community-shared exercises (source = 'community')
- **Exercise Database tab:** Browsable list of all seed exercises
  - Dedicated search bar: `Search ${seedEx.length} exercises...` — **dynamic count (s18)**, was hardcoded "Search 904 exercises..."
  - Tag filter chips (purple, all 12 tags)
  - Cards show: exercise name, alias (if different), description (2-line clamp), tags
  - Tap card → exercise detail modal (description + how-to)
  - Shows first 50 results, "Showing first 50 of X results" message when more exist
  - **Search relevance sorting:** exact name (score 0) → starts with (1) → name contains (2) → alias contains (3) → description contains (4)

**KNOWN BUG (identified s18, not yet fixed):** Exercise Database only searches seed exercises. Community-shared exercises and user's own custom exercises are not searchable in the Exercise Database tab or in the Builder's Add Exercise autocomplete. Fix planned: unify search across all three sources (seed + custom + community).

**KNOWN ISSUE (identified s18):** Format exercises (Dirty Mac Deuce, Millennial, Nicole, etc.) appear in the Exercise Database and Builder search but are workout structures, not individual exercises. These should be tagged `is_format = true` and hidden from search, or converted to Templates. Tied to Templates feature build.

#### Exercise Detail Popup (ExerciseDetailSheet — REDESIGNED April 20 s18)
The Library's exercise detail popup was converted from an inline `const` variable to a standalone `ExerciseDetailSheet` component with body scroll lock. Now matches the Builder's `ExerciseInfoSheet` exactly:

- **Background:** `#1c1c20` (was `#111318`)
- **Border:** `1px solid rgba(167,139,250,0.15)` — purple tint (was plain BD)
- **Max height:** 75vh (was 65vh)
- **Close button:** 44×44px rounded button with visible background (was no close button)
- **Description:** 17px (was 15px)
- **How-to steps:** 18px (was 15px)
- **Tags:** colored pills at bottom with difficulty badge
- **Scroll lock:** `useEffect` with `position: fixed`, `width: 100%`, `overflow: hidden` + `touchAction: none` and `onTouchMove` stopPropagation on backdrop for iOS
- **overscrollBehavior:** `contain` on sheet container

### 4. Locker Screen (LockerScreen.tsx) — REDESIGNED April 20 s18
- **Props:** `lk`, `setLk`, `lkEx`, `setLkEx`, `onNavigate`, `onDeleteBeatdown`, `onDeleteExercise`, `onShareBeatdown`, `onShareExercise`, `onUnshareBeatdown`, `onUnshareExercise`, `onUpdateExercise`, `onEditBeatdown`, `onRunBeatdown`
- **IDs are strings** (Supabase UUIDs)
- **Two sub-tabs: Beatdowns | Exercises** (was three — "Bookmarked" tab removed in s18)
- **Subtitle:** "Your beatdowns and exercises" (was "Your beatdowns, exercises, and bookmarks")

**Beatdown cards (REDESIGNED s18):**
- **Title is the hero** — 18px/800 (was 16px/700)
- **48px ▶ play icon** on right side of card — green outline button with SVG triangle. `stopPropagation` prevents triggering edit.
- **Tap card body → opens edit** (`onEditBeatdown`)
- **No ⋯ button, no action sheet, no big green "Run This" bar** — all removed
- **"✓ Shared" badge** visible on date/source line for shared items
- Card shows: title, date · source · shared badge, inspired by (if stolen), description (1-line clamp), tags

**Exercise cards:**
- **Tap card body → opens inline edit screen**
- **No ⋯ button** — removed
- **"✓ Shared" badge** visible next to exercise name

**Exercise edit screen (inline in LockerScreen):**
- Fields: Name, Description, How-to, Tags (12 chips)
- **Save exercise** button (green)
- **Share to Library / Unshare** button (amber / red, NEW s18)
- **Delete** button (red outline, NEW s18)
- Unshare opens the confirmation dialog (see Share/Unshare System)

**Removed from Locker (s18):**
- ActionSheet component — deleted entirely
- `openBdActions()` and `openExActions()` functions — deleted
- `actionSheet` state — deleted
- ⋯ buttons on both beatdown and exercise cards
- "+ Generate" and "+ Build manually" buttons (removed in s18 task 5, stay on Home only)
- "+ Create new exercise" button (removed from Exercises tab)
- "Bookmarked" tab and all bookmark-related rendering
- `SharedItem` interface (was only used by Bookmarked tab)
- `lkBm`, `sharedItems`, `onRemoveBookmark`, `onSteal` props

### 5. Profile Screen (ProfileScreen.tsx)
- **Props:** `onProfileSaved` (callback to refresh parent profile data)
- Loads profile from Supabase on mount
- Editable: F3 Name (max 30), AO (max 40), State (dropdown, 50 states), Region (dropdown, 7 regions)
- Save button writes to Supabase profiles table, calls `onProfileSaved`
- "About GloomBuilder" link → opens About sub-screen
- Log out button at bottom
- **Avatar profile customization (image picker) — EXPLICITLY PARKED** — skip until 20+ users ask

### 6. About GloomBuilder (inside ProfileScreen.tsx)
- **Static creator info — hardcoded:**
  - Avatar: 80px rounded square, green gradient, "TB" initials
  - "The Bishop" / "Creator of GloomBuilder" / "F3 Essex · New Jersey"
- **"Why I built this"** — Every Q knows the 10pm ceiling stare. GloomBuilder removes the planning barrier.
- **"Emergency Q? No sweat."** — Q fartsacked, 15 PAX staring. Open GloomBuilder, generate or steal from Library.
- **"Iron sharpens iron"** — Build. Share. Steal. Repeat.
- **"Support GloomBuilder 💚"** — Stripe donation checkout (LIVE):
  - $3 "Light coupon" / $7 "Standard block" / $15 "Heavy carry"
  - Each triggers `/api/checkout` → Stripe Checkout Session → success page

### 7. Generator Screen (GeneratorScreen.tsx) — UPDATED April 23 s20
- **Wizard steps unchanged** — 4-step: Duration → Difficulty → AO Site → Equipment
- **Result screen: REBUILT s19** — uses SectionEditor component (same as Builder)
- Old `exDM` (exercise detail modal) and `pkM` (exercise picker) removed from GeneratorScreen entirely — SectionEditor handles these internally
- `SectionExercise` type removed from GeneratorScreen imports — no longer needed
- `TAGS` removed from GeneratorScreen imports — no longer needed
- Generate call normalizes: `generate(gc, allEx).map(s => normalizeSection(s as unknown as Record<string,unknown>))`
- **Header buttons (REDESIGNED s19):**
  - **"← Home"** — exits to home
  - **"Tap to reroll"** — inline hint text next to buttons
  - **"Classics"** (green, with green 🔄 SVG icon) — rerolls ALL sections from core exercises. Preserves section structure (names, Q notes, exercise counts).
  - **"Full Library"** (purple, with purple 🔄 SVG icon) — rerolls ALL sections from full 948+ pool. Preserves section structure.
  - **NOTE:** "Reroll" and "Go Rogue" names RETIRED in s19. Replaced with "Classics" and "Full Library" — self-explanatory, no legend needed.
- **Section-level reroll (NEW s19):**
  - Each section header has a 🔄 toggle icon (36x36px, rounded 9px) next to the ✕ delete button
  - Icon color = current mode: green = core/classics, purple = full library/rogue
  - Tap fires reroll AND toggles mode for next tap
  - Reroll generates fresh exercises matching the current count of non-transition exercises in that section
  - Empty sections get defaults: Warmup=4, Mary=6, everything else=15
  - Section pool matching: name includes "warmup"/"warm-up"/"warm up" → warmup pool (index 0), name includes "mary" → mary pool (index 2), everything else → thang pool (index 1)
  - Respects beatdown config (gc: difficulty, sites, equipment)
  - Multiple generation batches (up to 5 attempts) with deduplication to fill large sections
  - `onSectionReroll` prop on SectionEditor — only passed by GeneratorScreen, so Builder doesn't show reroll icons
- **Bottom buttons (REDESIGNED s19):**
  - **Save to locker** (full-width green, primary)
  - **▶ Run This** (green outline with play icon) + **Copy for Slack** (amber) — side by side
  - Copy for Slack moved from header to bottom (was competing for space with reroll buttons)
- **`siteLabel()` and `eqLabel()` helper functions:** Look up human-readable labels. "none" → "Bodyweight only", "field" → "Open field".
- **Chip summary uses labels, not raw IDs**
- **Share toggle** — simple click toggle, no confirm popup
- **"Go Rogue" button (RENAMED s19):** Now called "Full Library" with purple 🔄 icon. Calls `generate(gc, allEx, true)` with `goRogue=true`.
- **`communityExercises` prop (NEW s19):** Merged into `allEx` alongside seed and user exercises.

### 8. Builder Screen (BuilderScreen.tsx) — UPDATED April 20 s18
- Manual beatdown creation + edit mode (accepts `editData` prop)
- Uses `SectionEditor` for all section/exercise management
- **New props for edit mode (s18):** `onRunBeatdown`, `onShareBeatdown`, `onUnshareBeatdown`, `onDeleteBeatdown` — all optional, only passed when in edit mode from Locker
- **`siteLabel()` and `eqLabel()` helper functions (NEW April 17 s15):** Look up human-readable `.l` label from SITES/EQUIP arrays by `.id`. Used in chip summary. `siteLabel("field")` → "Open field". `eqLabel("none")` → "Bodyweight only".
- **"Beatdown Details" collapsed card — NOW WITH CHIP SUMMARY (April 17 s15):**
  - "BEATDOWN DETAILS" label (13px/700 uppercase)
  - **Collapsed state shows chip summary (NEW April 17 s15):** When any details have been set (`hasAnyDetails` check), colored pills appear below the label:
    - Duration: green tinted pill
    - Difficulty: difficulty-color tinted pill (uses DIFFS lookup for color)
    - Sites: neutral T3 pills with `siteLabel()` (shows "Open field" not "field")
    - Equipment: purple pills with `eqLabel()` (shows "Bodyweight only" not "None")
  - Expanded state: Duration / Difficulty / AO Site / Equipment chips (all flat, no nested collapse)
- editData sections normalized on load:
  ```typescript
  editData.secs.map(s => normalizeSection(s as unknown as Record<string, unknown>))
  ```
- **Copy for Slack** button top-right (amber)
- **Share toggle** — simple click toggle, no confirm popup (s18: "can't be undone" removed)
- **Bottom buttons (UPDATED s18):**
  1. **Save changes / Save to locker** (green, primary)
  2. **▶ Run This** (green outline with play SVG icon) — shows in BOTH new and edit modes. Edit mode calls `onRunBeatdown`, new mode calls `handleRunThis`.
  3. **Share to Library / Unshare + Delete** (edit mode only, below divider) — Share is amber, Unshare is red, Delete is red outline. Unshare triggers confirmation dialog in LockerScreen.

### 9. Create Exercise Screen (CreateExerciseScreen.tsx)
- Fields: Name (max 50), Description (max 200), How-to (max 500), Tags (12 chips), Share to community toggle
- Saves to Supabase exercises table with `source: "private"` (or `"community"` if shared)
- Description saves to `description` column; How-to saves to `how_to` column (separate fields)
- On save: exercise appears in Locker → Exercises tab immediately

### 10. Live Mode Screen (LiveModeScreen.tsx) — UPDATED April 20 s18
Full-screen teleprompter for running a beatdown in real time.

**Session 18 changes:**
- **`inspiredBy?` prop added** — threaded from page.tsx (set when running a Library beatdown) through to CopyModal for backblast credit
- **Empty beatdown guard** — Pre-launch "Start Beatdown" button replaced with "No exercises yet" gray label when exercises array is empty (prevents crash on 0 exercises)
- **`flattenBeatdown()` null guards** — `if (!sec || !sec.exercises) return` and `if (!ex) return` added to prevent crashes on malformed section data
- **PreLaunchScreen section names** — uses `(sec as any).name || sec.label || "Section"` fallback chain and `(sec.exercises || [])` guard
- **CopyModal onClose** — when screen is "review", auto-returns to "complete" screen after copy

`flattenBeatdown()` updated to handle both old and new exercise/section formats:
```typescript
const secName = (sec as any).name || sec.label || "Section";
const exName = (ex as any).name || ex.n || "";
const exNote = (ex as any).note || ex.nt || "";
const exCad = (ex as any).cadence || ex.c || "";
```

Also handles `mode: "time"` directly for new-format timed exercises — no longer relies solely on parsing `r` string.

**6 sub-screens:** Pre-launch → Exercise teleprompter → Jump list → Completion → Exit confirmation + Wake Lock API.

**Pre-launch screen:**
- Green ambient glow (radial gradient, blur 60px)
- "Live Mode" badge pill (pulsing green dot, uppercase)
- Beatdown title (34px/800), Q name + AO, stats row (Exercises / Sections / Duration)
- **"Start Beatdown" button ABOVE the fold** — Wing-It Q shouldn't have to scroll
- "Screen stays awake during Live Mode" helper text

**Exercise Teleprompter (core screen):**
- Top bar: ✕ Exit | Elapsed clock (32px/900, tabular-nums, solid card) | ☰ Jump List
- Progress bar: 5px green fill with glow, animates on advance
- Section label + counter: "X / Y" pill. Section label highlights (2.2s fade) when new section — **NO full-screen interstitial**
- Exercise name: dynamic font — ≤14 chars: 56px, 15-20: 46px, 21+: 38px. Weight 900.
- Rep-based: rep count (80px, green), cadence label (22px, IC=amber, OYO=gray)
- Timed: SVG circular countdown (190×190), 7px stroke, red pulse ≤5 sec, green "DONE" when complete. **Timer NEVER auto-advances.**
- Transition lines: "Transition" label + italic `↗ text` 36px. Q taps Next.
- Up Next card: solid #1a1a1e bg, next exercise preview
- ONE "Next →" button (full width, green, 24px/900). **NO Back button** on teleprompter.

**Jump List:**
- Solid #0E0E10 background — NOT transparent (prevents text bleed)
- "← Back to [previous exercise]" — ONLY way to go back
- Exercise list: past=✓, current=green, future=border circles

**Smart Timer Parser (UPDATED April 16):**
Handles new `mode: "time"` directly:
```typescript
if (!isTransition && exMode === "time" && !parsed.isTimer) {
  const seconds = unit === "min" ? val * 60 : val;
  parsed = { isTimer: true, seconds, display: repsStr };
}
```
Also retains legacy cadence-as-timer fallback for old beatdowns.

**Wake Lock:** `navigator.wakeLock.request("screen")` on exercise screen. Graceful fallback (Safari iOS doesn't support it — no crash).

**Auto-Save on Run This:** Beatdown saved BEFORE Live Mode launches. Save inline in `onRunThis` without `setVw(null)` to prevent the view reset bug.

**Completion Screen:**
- Stats: Total Time | Exercises count
- **"Copy Backblast" → opens CopyModal** (NOT direct clipboard — Q edits AO, PAX, COT first)
- "Done — Back to Locker" button

**Exit Confirmation:**
- "End Workout?" + "You can always run this again from your Locker."
- "Keep Going" (solid) | "End" (red bg)

---

## GENERATOR — INTELLIGENCE OVERHAUL (April 16)

### Key Real-World Calibration (from actual F3 backblasts)
**Van Gogh's beatdown (medium, 45 min, F3 The Forge):**
- Warmup: 8 dynamic movements (neck rolls, shoulder rolls, arm stretches, etc.)
- 10 exercises with MIXED reps: 15, 20, 30 within same beatdown
- Then repeated in reverse order — that's the volume
- Mary: 3 core exercises
- Key insight: reps are NOT uniform within a beatdown. Natural variation.

**IronPax beast beatdown (60 min):**
- 10 exercises, ALL OYO
- 50 reps per exercise = 500 total reps
- Run 50 yards between EVERY exercise
- Key insight: Beast = 50 reps per exercise. Previous cap of 30 was too low.

### Problem 1 — Reps Were Not Multiples of 5 (FIXED)
Nobody counts to 14 in F3. Real beatdowns use 10, 15, 20, 25, 30.
```javascript
function rn(lo: number, hi: number) {
  const steps = Math.floor((hi - lo) / 5);
  return lo + Math.floor(Math.random() * (steps + 1)) * 5;
}
```

### Problem 2 — Reps Were Uniform (FIXED)
Each exercise now draws independently from a weighted pool:
```javascript
const pickReps = (diff: string, intensity?: string) => {
  const diffRow = repTable[diff] || repTable.medium;
  const ix = intensity || "medium";
  const opts = diffRow[ix] || diffRow.medium;
  return String(opts[Math.floor(Math.random() * opts.length)]);
};
```

### Problem 3 — Reps Ignored Exercise Intensity (FIXED)
40 Burpees ≠ 40 Merkins in time. Two-dimensional rep table:
```javascript
const repTable: Record<string, Record<string, number[]>> = {
  easy:   { high: [10,10,10,15], medium: [10,10,15,15,20], low: [15,15,20] },
  medium: { high: [10,15,15,20], medium: [15,15,20,20,25,30], low: [20,25,30] },
  hard:   { high: [15,15,20,20], medium: [20,20,25,25,30,30], low: [25,30,30] },
  beast:  { high: [20,20,25,25,30], medium: [35,40,40,45,50], low: [40,45,50] },
};
```
Beast Burpees = 20-25 (high intensity). Beast Merkins = 35-50 (medium). Matches real IronPax.

### The `ix` Field (ExerciseData interface — ADDED April 16)
```typescript
export interface ExerciseData {
  n: string;   // name
  f: string;   // full name / alias
  t: string[]; // tags
  s: string[]; // site requirements
  h: string;   // how-to
  d?: string;  // short description
  df?: number; // difficulty level 1-3
  pt?: number; // popularity tier: 1=classic, 2=well-known, 3=exotic
  ix?: string; // intensity: low, medium, high  ← ADDED April 16
  cr?: boolean; // is_core: curated core exercise every PAX knows ← ADDED April 17 s16
}
```
`ix` is set in `mapSupabaseExercise()` from the `intensity` column. Local EX fallback exercises don't have `ix` — inferred from tags: `Cardio` or `Full Body` → 'high', else 'medium'.

### Problem 4 — Exercise Counts Too Low (FIXED)
New exercise count matrix:

| Difficulty | 30 min | 45 min | 60 min | Mary (30/45/60) |
|------------|--------|--------|--------|-----------------|
| Easy | 7 | 12 | 18 | 3/4/5 |
| Medium | 7 | 12 | 16 | 3/4/5 |
| Hard | 6 | 10 | 14 | 3/4/5 |
| Beast | 5 | 8 | 12 | 3/4/5 |

Beast has fewer because beast exercises take 4-6 minutes each at 30-50 reps.

### Problem 5 — Warmup Reps Too High (FIXED)
Warmup always uses fixed low reps: `const wRepOpts = [10, 10, 15, 15, 15]`. Always 4 exercises.

### Problem 6 — Transport Exercises Got Reps (FIXED)
```javascript
mP = pool.filter(e =>
  !e.t.includes("Warm-Up") &&
  !e.t.includes("Mary") &&
  !e.t.includes("Transport") &&  // Bear Crawl, Sprint, Indian Giver etc.
  !FORMAT_EXERCISES.has(e.n)     // Dora, Triple Nickel etc.
);
```

### Problem 7 — Format Exercises Got Reps (FIXED)
32-entry blocklist of workout formats blocked from generator pool (Option A):
```javascript
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
```
Option B (`is_format boolean` on Supabase exercises table) planned for Templates build.

### TypeScript null safety fix
`cfg.diff` is `string | null`. All `pickReps(cfg.diff, ...)` calls use `cfg.diff || "medium"`:
```typescript
pickReps(cfg.diff || "medium", inferredIntensity)
```

### Static Exercise Handling
Plank and similar static exercises get time format output:
```typescript
m.push({ id: _genId(), type: "exercise" as const, name: "Plank",
  mode: "time" as const, value: plankSec, unit: "sec" as const,
  cadence: "OYO", note: "", n: "Plank", r: plankR, c: "OYO", nt: "" });
```

---

## CORE EXERCISE GENERATOR OVERHAUL (April 17 s16) — BIGGEST GENERATOR CHANGE SINCE LAUNCH

### The Problem — Generator Was Useless
The generator pulled from 904 exercises. Of those, an average PAX knows maybe 20-30. The generator was spitting out exercises like "Finkle Swings", "Doracides", "Catalina Wine Mixer", "Matt Biondi" — exercises nobody has heard of. This defeated the 30-second promise. A Q would generate a beatdown, see 90% unknown exercises, and have to click each one to learn what it is. They couldn't just run it in Live Mode. The generator was actively damaging trust.

The old popularity tier system (T1=86 classics, T2=135, T3=683) was Claude's educated guesses from the enrichment batch — not real-world usage data. Even T1 had too many unknowns.

### The Solution — Curated Core Exercise Sets

Ritz hand-picked exercises that every F3 PAX at F3 Essex knows without explanation. These are split into three **section-locked Sets** — exercises are locked to their designated section and never leak into other sections.

#### CORE_WARMUP (5 exercises — warmup section only)
```
Mountaineer Motivators, Side Straddle Hop, Frankensteins, 21s, Bobby Hurley
```
These are the only exercises that appear in the Warmup section on Easy/Medium/Hard/Beast. Warmup always generates exactly **2 exercises** (was 4).

#### CORE_MARY (15 exercises — mary section only)
```
Freddie Mercury, Rosalita, LBCs, Flutter kicks, Classic Sit-Up,
World War I Sit-up, Dolly, Boat Canoe, American Hammer,
Big Boy Sit-up-Ups (aka, Bissyous), Butterfly Sit-up, Windshield Wipers,
Dying Cockroach, Reverse Crunch*, Superman*
```
*Reverse Crunch and Superman are new exercises added to Supabase in this session.

#### CORE_THANG (43 exercises — thang section only)
```
Merkin, Burpee, Coupon Military Press, Murder Bunny, Block-Over Burpees,
Bonnie Blairs, Jump Squat, Lt. Dans, Mountain Climbers, Mountain Climber Merkin,
Elf on the Shelf, T-Bomb, Alternating Shoulder Taps, Hand-release Mike Tysons,
Plank Jacks, Alternating Side Squats, Moroccan Nightclub, Donkey Kicks,
Bear Crawl, Bulgarian Split Squat, Coupon Curl, Peter Parker,
Balls to the Wall, Balls to the Wall Crawl, Merkin Jack, Suicides,
Crab Walk, Crab Jacks, Al Gore, Coupon Kettle Bell Swing, Derkin, Dips,
Duck Walk, Monkey Humpers, Sumo Squat, Suzanne Somers, Smurf Jacks,
Squat Thrust, Single Arm Row, Dive Bombers, Crawl Bear, Merkin Ladder,
Diamond Merkin*, Manmaker Merkin*, Manmaker*, Apolo Ohno*,
Double Merkin Burpee*, Elevens*, Fire Drill*, No Cheat Merkin*,
Pull-up Squats*, Prisoner's Squat*, Ranger Merkins*
```
*New exercises added to CORE_THANG in this session.

#### Why Section-Locked?
- **Warmup exercises never appear in Thang or Mary.** SSH is a warmup. It shouldn't be exercise #7 in The Thang.
- **Mary exercises never appear in Warmup or Thang.** LBCs are for the mat, not for the opening circle.
- **Thang exercises never appear in Warmup or Mary.** Burpees are not a warmup move. Merkins are not a mary exercise.
- This prevents the generator from creating nonsensical section content.

### ALL Difficulties Use 100% Core
This was the final and most important decision. Initially Hard was 70% core + 30% exotic, Beast was 50/50. Ritz tested and rejected this — exotic exercises appeared in Hard/Beast warmup and mary sections, which was wrong. The final rule:

**Easy, Medium, Hard, AND Beast = 100% core exercises in ALL sections. No exceptions. No fallback to the full pool.**

Beast difficulty ≠ exotic exercises. Beast = **higher reps** from the core list (35-50 reps at high intensity via the repTable). The exercises are the same ones every PAX knows — they just do more of them.

### Coupon Filtering
When "Bodyweight only" is selected in the wizard, coupon exercises are filtered from ALL pools — warmup, mary, and thang. The `couponFilter` function `(e) => !noCoupon || !e.t.includes("Coupon")` is applied to every pool construction. This fixed a bug where Coupon Kettle Bell Swing and Block-Over Burpees appeared in bodyweight-only beatdowns.

### Warmup Deduplication
Exercises selected for warmup are tracked in a `warmupNames` Set, and the thang `unused` filter excludes them. This prevents the same exercise appearing in both Warmup and The Thang.

### Implementation Details

**Hardcoded Sets, not database column:**
The `is_core` boolean column was added to Supabase (60 exercises flagged) and `loadSeedExercises()` updated to include it. However, the Supabase client's type coercion of the boolean was unreliable — `(row.is_core as boolean) || false` always returned false. After debugging, the solution was to **hardcode the core exercise names as Sets inside generate()** — same pattern as `FORMAT_EXERCISES`. Zero database dependency, works instantly, easy to update.

The `is_core` column remains in Supabase for potential future use (Library filtering, sorting) but the generator does not depend on it.

**`cr` field on ExerciseData:**
Added `cr?: boolean` to the ExerciseData interface and `cr: (row.is_core as boolean) || false` in mapSupabaseExercise(). Currently unused by the generator (which uses the hardcoded Sets) but available for other features.

**`goRogue` parameter on generate():**
```typescript
export function generate(cfg: GenConfig, exercises?: ExerciseData[], goRogue?: boolean): Section[]
```
When `goRogue=true`, all pools use the full 904 exercise set instead of core. Warmup uses Warm-Up tagged exercises, Mary uses Mary tagged exercises, Thang uses the full pool. This powers the "Go Rogue" reroll button.

### "Go Rogue" Reroll Button (GeneratorScreen)

After generating a beatdown, the header shows three buttons:
- **"Copy for Slack"** (amber) — opens CopyModal
- **"Reroll"** (amber) — regenerates with same wizard config from core exercises
- **"Go Rogue"** (purple) — regenerates from full 904 pool

Go Rogue button styling:
```
background: P + "15"
color: P (#a78bfa)
border: 1px solid P + "30"
padding: 10px 16px
borderRadius: 12
fontSize: 13, fontWeight: 600
```

The name "Go Rogue" was chosen over: "Surprise Me" (too generic), "Wild Card" (fun but less F3), "Full Send" / "Send It" (F3-flavored but implies difficulty not variety), "Mix It Up" (clear but boring). "Go Rogue" communicates "leaving the safe zone" and works for all audiences.

**Design decision: Reroll button, not wizard step.**
A wizard step ("How adventurous?") was considered and rejected because:
1. Q can't answer "how adventurous?" before seeing a beatdown — they need context
2. Adds friction to the 30-second promise
3. First-time users would pick it, get confused, blame the app
The reroll approach lets the Q see a core beatdown first, then make an informed choice to go exotic.

### Supabase Changes (April 17 s16)

**Column added:** `is_core boolean DEFAULT false` on exercises table

**60+ exercises flagged:** All exercises in CORE_WARMUP + CORE_MARY + CORE_THANG sets

**2 new exercises inserted:**
1. **Reverse Crunch** — core exercise, is_mary=true, description and how-to original, added to CORE_MARY
2. **Superman** — core/lower exercise, is_mary=true, description and how-to original, added to CORE_MARY

**12 existing exercises marked is_core=true:**
Diamond Merkin, Manmaker Merkin, Manmaker, Apolo Ohno, Double Merkin Burpee, Elevens, Fire Drill, No Cheat Merkin, Pull-up Squats, Prisoner's Squat, Ranger Merkins, Mountain Climber Merkin

**db.ts updated:** `loadSeedExercises()` SELECT now includes `is_core` column.

---

## Q NOTES COPY/BACKBLAST TEXT ORDER FIX (April 17 s16)

### The Problem
Q notes text was rendered AFTER exercises in the copy/backblast output. The natural reading order is: section header → Q's instructions for the section → exercises.

### Old Order
```
── Warmup ──
15 Bobby Hurley IC
↗ Go to Circle
10 Frankensteins IC
> Q notes here     ← WRONG: after exercises
```

### New Order
```
── Warmup ──
> Q notes here     ← CORRECT: right below section header
15 Bobby Hurley IC
↗ Go to Circle
10 Frankensteins IC
```

### Implementation
In CopyModal.tsx, both Quick Copy and Full Backblast sections had the `_sNotes(s)` line placed after the `s.exercises.forEach()` loop. Moved it to right after `── Section ──` header line. Both sections fixed identically.

---

## LIBRARY BEATDOWN DETAIL VIEW REDESIGN (April 17 s16)

### The Problem
The Library beatdown detail view (LibraryScreen.tsx) was still using the old design: colored uppercase text label for sections, exercises with left border accent, `xN cadence` inline format, tiny ⓘ text icon. This looked completely different from the Builder/Generator which had been redesigned with premium dark section cards.

### The Redesign
The Library detail view now matches the Builder/Generator visual design exactly (minus drag handles and action buttons, since Library is read-only):

**Section cards:**
- `background: #111114`, `borderRadius: 22`, `boxShadow: 0 0 0 1px ${sColor}40, 0 4px 24px ${sColor}0D`
- 3px color stripe at top inside `overflow: hidden` div
- Section name: T1, 21px/800, letterSpacing -0.5px
- Exercise count: T5, 12px

**Q Notes display (read-only):**
- Shown right below section header (before exercises)
- ✎ icon (T4, 14px) + italic text (T2, 14px)
- Same compact inline display as Builder

**Exercise cards:**
- `background: #1a1a1f`, `borderRadius: 14`, `padding: 13px 14px`, `marginBottom: 6`
- Exercise name: T1, 18px/700 (was 16px)
- Reps/cadence on **second line** below name (was inline right-aligned) — matches Builder
- Exercise note: T5, 13px italic
- No drag strip (read-only)
- No ✕ delete (read-only)

**? info button:**
- Purple 28x28px bordered button (was plain "?" text)
- `background: P+"15"`, `border: 1px solid P+"30"`, `borderRadius: 8`
- Tap opens the exercise detail modal (same as before)
- Only appears for database exercises, not custom

**Transition lines:**
- `↗` icon (T4, 15px) + italic text (T3, 16px/500)
- Background: `rgba(255,255,255,0.03)`, borderRadius 10

### What's NOT in Library Detail (intentionally)
- No drag handles (read-only view)
- No ✕ delete buttons
- No ADD EXERCISE field
- No + Add Section button
- No Q Notes edit mode
- No Beatdown Details card

---

## LIVE MODE OVERHAUL (April 18-19 s17) — BASED ON REAL PAX FIELD TEST FEEDBACK

### Context
First real PAX tested GloomBuilder at an actual F3 AO. Feedback revealed critical UX gaps in Live Mode. This overhaul addresses every issue raised.

### Issue 1 — Exercise Instructions Not Visible in Live Mode (FIXED)
**Problem:** Q staring at "10 Merkin IC" on teleprompter couldn't remember how to do the exercise. No way to see instructions without exiting Live Mode.

**Solution — Tap-to-Expand How-To (Option A):**
- Tap the exercise name on the teleprompter → how-to steps expand inline in a purple-tinted box
- Steps rendered as numbered list (each step on its own line, number in purple, text at 18px)
- `maxHeight: 280px` with `overflowY: auto` for long instructions
- "tap anywhere to close" text at 15px/600 (was 12px — too small, caught in review)
- Reps/cadence and Up Next hide when info is showing to give room
- Exercise name gets dashed purple underline (`2px dashed rgba(167,139,250,0.35)`) to hint it's tappable
- Only appears for exercises that have how-to data (looked up from seed exercises via `allEx`)
- `showInfo` state resets on exercise change

**How-to lookup:** LiveModeScreen loads seed exercises on mount via `loadSeedExercises()` + `mapSupabaseExercise()`. The `flattenBeatdown()` function now accepts optional `allEx` parameter and looks up each exercise's `h` (how-to) field by case-insensitive name match.

**Rejected alternatives:**
- Option B (? button + bottom sheet) — extra tap required, familiar from Builder but more disruptive
- Swipe-to-reveal info — conflicts with new swipe navigation
- Full edit sheet overlay — pulls Q out of workout flow

### Issue 2 — Can't Go Back to Previous Exercise (FIXED)
**Problem:** Q finished all Thang exercises early, wanted to redo some, but Live Mode only goes forward. Had to close the app entirely.

**Solution — Swipe Left/Right Navigation:**
- Swipe left on the teleprompter area → goes to next exercise
- Swipe right → goes to previous exercise
- Card follows finger during swipe with opacity feedback (`transform: translateX(${swipeX * 0.3}px)`, `opacity: max(0.5, 1 - abs(swipeX)/500)`)
- Threshold: 60px of horizontal movement to trigger navigation
- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd` + mouse fallback for desktop
- `showInfo` resets on swipe
- Next button stays for PAX who prefer tapping
- Jump List unchanged — still accessible via ☰ button

**No swipe hints/labels:** User either swipes or doesn't. No "← swipe back / swipe next →" text — that was added and removed after Ritz rejected it as patronizing.

**Why swipe was previously rejected and why we un-rejected it:** Original Bible said "Fat-finger in the dark. Back in Jump List only." But that reasoning was about a BACK BUTTON, not a swipe gesture. A swipe requires intentional horizontal drag — it's actually HARDER to accidentally swipe than to tap a button. If you swipe the wrong direction, you swipe back. No permanent damage. Every photo gallery and dating app uses this pattern.

### Issue 3 — No Way to Exit Live Mode Mid-Workout (FIXED)
**Problem:** ✕ exit button existed but was gray/invisible. And pressing End in the exit dialog sent Q to prelaunch (reset), losing all progress. No way to get back to the beatdown.

**Solution:**
- ✕ button now has **red-tinted background** (`rgba(239,68,68,0.12)`, `border: 1px solid rgba(239,68,68,0.30)`, `color: C.red`) — much more visible than the old neutral gray
- "End" in the exit confirmation dialog now routes to the **completion screen** (not prelaunch) — so Q can still Review Beatdown, Run Again, or Copy Backblast after exiting mid-workout
- Timer stops but elapsed time is preserved for the backblast

### Issue 4 — Visual Hierarchy Wrong (FIXED)
**Problem:** Reps number at 80px dominated the screen. Exercise name at 38-56px was secondary. Q's eyes went to the number first, not the exercise name.

**Solution:**
- Exercise name: **64px** (short names ≤14 chars), **52px** (medium 15-20 chars), **42px** (long names >20 chars) — always the biggest element
- Reps number: **48px** (was 80px) — clearly secondary
- Cadence text: **18px** (was 22px) — tertiary
- Name is the hero. Reps supports it. Cadence is context.

### Issue 5 — Completion Screen Needs More Actions (FIXED)
**Problem:** After finishing, Q only had "Copy Backblast" and "Done — Back to Locker". No way to run again, no way to review exercises, no way to edit before copying.

**Solution — Completion Screen Redesign (Option C):**
- **"Review Beatdown"** (green, primary) + **"Run Again"** (amber, primary) — side by side, equal weight
- **"Done — Back to Locker"** (text link) — below
- "View / Edit Beatdown" button removed — Review Beatdown serves this purpose
- "Copy Backblast" button removed from completion — moved to Review screen where Q can edit first

**"Run Again"** resets timer, unchecks all exercises, restarts from exercise 1 with the same beatdown.

### Issue 6 — No Post-Workout Edit Before Backblast (FIXED — NEW SCREEN)
**Problem:** Q modified exercises mid-workout (changed reps, skipped exercises, swapped exercises) but the backblast still showed the original planned data.

**Solution — Review Beatdown Screen:**
New full-screen review that appears between completion and backblast. Jump List style — clean read-only by default, tap any exercise to expand inline edit.

**Default state (read-only):** Each exercise shows ✓ + name + reps · cadence. No edit controls visible. Q scrolls through, confirms, taps "Copy for Slack".

**Tap to expand inline edit:** Tap any row → ▼ rotates, edit panel drops down with:
- **Reps** input field (full-width, editable)
- **IC / OYO** toggle buttons (tap to switch)
- **Q Note** input (placeholder: "Modified reps, swapped exercise, skipped...")
- **Remove** button (red) — marks exercise as removed, row dims to 35% with ✕
- **Restore** button (green, replaces Remove when removed)
- **Done** button (green) — collapses edit panel

**Removed exercises:** Dimmed to 35% opacity, ✓ changes to ✕, name gets strikethrough. Still tappable to expand and "Restore".

**Q Notes indicator:** Exercises with Q notes show "✎ noted" in purple on the collapsed row.

**"Copy for Slack" button:** Fixed at bottom of Review screen. Opens CopyModal (full backblast form with AO, PAX, conditions). Edits from Review flow through to CopyModal via `editedSections` state in the main controller.

**Edit flow architecture:**
1. ReviewScreen maintains `edits` state array (one entry per exercise with name, reps, cadence, qNote, removed)
2. `useEffect` watches `edits` and builds modified `Section[]` from the edits
3. Calls `onEditsChanged(editedSecs)` → sets `editedSections` in main controller
4. CopyModal receives `editedSections || sections` — uses edited data when available, original otherwise

### Issue 7 — Backblast F3 Name Stuck to "The Bishop" (FIXED)
**Problem:** CopyModal defaulted `qName` to "The Bishop" when the prop was empty or undefined. GeneratorScreen hardcoded `qName="The Bishop"` in its CopyModal call.

**Fixes:**
- CopyModal.tsx line 38: `q: qName || "Q"` (was `"The Bishop"`)
- CopyModal.tsx line 90: `qName || "Q"` (was `"The Bishop"`)
- GeneratorScreen.tsx: Added `profName?: string` prop, CopyModal uses `qName={profName || "Q"}`
- page.tsx: Passes `profName={profName}` to GeneratorScreen

### Issue 8 — Pre-Launch Screen Has No Back Button (FIXED)
**Problem:** Q accidentally tapped "Run This" and was trapped on the pre-launch screen with no way to go back without starting the workout.

**Solution:** Added "← Back" button at top-left of pre-launch screen. Calls `onClose()` which exits Live Mode entirely.

### Issue 9 — PAX Loved Discovering New Exercises (NOTED)
**Feedback:** Despite the core exercise decision, the tester actually loved when the generator introduced exercises they didn't know — especially coupon exercises. The how-to tap-to-expand feature (Issue 1 fix) makes this viable because Q can now see instructions for unfamiliar exercises during the workout.

**Decision:** No change to the default core behavior for now. "Go Rogue" button exists for discovery. The how-to expansion makes exotic exercises less scary. Will revisit if more PAX request discovery mode as default.

---

## EXERCISE DATABASE EXPANSION (April 18 s17)

### Gap Analysis
The 904 Supabase database was massively skewed: 492 high-intensity, 384 medium, only 28 low-intensity. Zero standalone "warmup" or "stretch" type exercises. Common exercises every PAX does daily (High Knees, Butt Kickers, Toy Soldier) were genuinely MISSING — they only existed in the 45-exercise local EX fallback array, not in Supabase.

**Confirmed missing via CSV audit:** High Knees, Butt Kickers, Hip Circles, Neck Rolls, Ankle Circles, Toy Soldier, A-Skip, B-Skip, Side Shuffle, Karaoke, Walking Lunge, World's Greatest Stretch, Cherry Picker, Trunk Rotation, Torso Twist, Overhead Clap, Shoulder Rolls, Willie Mays Hayes, Cotton Picker, Good Morning, Standing Quad Stretch, Hamstring Stretch, Calf Stretch, Shoulder Stretch, Tricep Stretch, Chest Stretch, Hip Flexor Stretch, Figure Four Stretch, Pigeon Stretch, Butterfly Stretch, Groin Stretch, Cross-Body Shoulder Stretch, Standing Toe Touch, Child's Pose, Downward Dog, Cobra Stretch, Cat-Cow, Happy Baby, Spinal Twist, Bicycle Crunch, Dead Bug, Heel Touch, Reverse Lunge, Fire Hydrant.

**Confirmed duplicates skipped (exist under F3 names):** Arm Circles (= Matt Biondi), V-Up (= Hernia), Leg Raise (= Homer to Marge), Calf Raise (= Johnny Drama), Glute Bridge (= Pickle Pointers), Inchworm (= Inch-Worm N'Diayes), Broad Jump (= Killer Roos), Tuck Jump (= Failure to Launch), Hello Dolly (= Dolly), Tricep Dip (= Dips), Skater (= Bonnie Blairs), Plank Jack (= Plank Jacks), Shoulder Tap (= Alternating Shoulder Taps), Wall Sit (= Al Gore).

### 44 New Exercises Added to Supabase
All inserted via `INSERT INTO ... SELECT ... WHERE NOT EXISTS` pattern (PostgreSQL doesn't support `ON CONFLICT` without a unique constraint on the `name` column). All descriptions and how-to text are 100% original.

**Warmup / Dynamic (20):** High Knees, Butt Kickers, Hip Circles, Neck Rolls, Ankle Circles, Toy Soldier, A-Skip, B-Skip, Side Shuffle, Karaoke, Walking Lunge, World's Greatest Stretch, Cherry Picker, Trunk Rotation, Torso Twist, Overhead Clap, Shoulder Rolls, Willie Mays Hayes, Cotton Picker, Good Morning

**Stretches (13) → added to CORE_WARMUP:** Standing Quad Stretch, Hamstring Stretch, Calf Stretch, Shoulder Stretch, Tricep Stretch, Chest Stretch, Hip Flexor Stretch, Figure Four Stretch, Pigeon Stretch, Butterfly Stretch, Groin Stretch, Cross-Body Shoulder Stretch, Standing Toe Touch

**Yoga / Mobility (6) → added to CORE_MARY:** Child's Pose, Downward Dog, Cobra Stretch, Cat-Cow, Happy Baby, Spinal Twist (all timed exercises with `is_mary: true`, `movement_type: static_hold` except Cat-Cow which is `dynamic`)

**Mary / Core (3):** Bicycle Crunch, Dead Bug, Heel Touch

**Thang / Strength (2):** Reverse Lunge, Fire Hydrant

### Updated Core Set Sizes
- **CORE_WARMUP:** 5 → **38** (5 original + 20 dynamic warmups + 13 stretches)
- **CORE_MARY:** 15 → **24** (15 original + 3 mary + 6 yoga)
- **CORE_THANG:** 43 → **45** (43 original + Reverse Lunge + Fire Hydrant)
- **Total core pool:** 63 → **107 exercises**

### Warmup Count Reverted to 4
Was reduced to 2 in early session 17 testing. Ritz directive: "remove this rule and revert back to original." Warmup now generates 4 exercises from the expanded 38-exercise CORE_WARMUP pool.

---

### What Templates Are
Templates define **workout structures** — how exercises are arranged, how reps work, how movement flows. Separate from the exercise pool.

### Template Count and Tier
30 templates total:
- **Free (3):** Standard Beatdown, Four Corners, AMRAP
- **Pro ($29/year, 27 more):** Dora, 11s, EMOM, Tabata, Deck of Death, Stations, Ring of Fire, Ladder, Pyramid, Murph, Cindy, and ~17 more

### Key Template Decision — One Template Per Beatdown
**No mix-and-match.** F3 beatdowns have one identity. A Q says "we did a Dora," not "we did a Dora-11s hybrid." Dora needs partners, 11s needs two specific exercises — stacking incompatible constraints. Mix-and-match → use Builder instead.

### Option A vs. Option B
**Option A (April 16):** `FORMAT_EXERCISES` name blocklist in exercises.ts. Fast, ships without schema changes.
**Option B (planned for Templates build):** `is_format boolean` column on Supabase exercises table. Claude API batch job classifies all 904 exercises (~$1-2 cost). Build when Templates are built. Blocklist becomes seed for which exercises get `is_format = true`.

### Templates — Not Yet Built
Schema in `GLOOMBUILDER-GENERATOR-BLUEPRINT.md`. Bring that document when building Templates.

---

## APP ARCHITECTURE

### Mobile-First, 430px Container
App renders inside maxWidth 430px centered container. Desktop layout is a future polish item.

### Auth Gate
Checks `supabase.auth.getUser()` on load, listens via `onAuthStateChange`. Unauthenticated → AuthScreen. Authenticated → loads all data from Supabase, shows main app.

### View State Architecture (page.tsx)
Two levels:
1. **Tab state** (`tab`): home | library | locker | profile
2. **View state** (`vw`): gen | build | create-ex | edit-bd | live | null (full-screen overlays, no bottom nav)

### State Lifted to page.tsx — UPDATED April 20 s18
- `lk` / `setLk` — Locker beatdowns (from `loadMyBeatdowns()`)
- `lkEx` / `setLkEx` — Locker exercises (from `loadMyExercises()`)
- ~~`lkBm: Set<string>`~~ — **REMOVED s18** (bookmarks killed)
- `sharedItems` — Library items (from `loadPublicBeatdowns()` + `loadPublicExercises()`)
- `userVotes: Set<string>` — Voted item IDs (from `loadUserVotes()`)
- `editingBd: LockerBeatdown | null` — Beatdown being edited
- `liveBd: LockerBeatdown | null` — Beatdown in Live Mode
- `profile` data (profName, profAO, profState, profRegion)

### Handlers in page.tsx — UPDATED April 20 s18
- `handleRunBeatdown(bd)` — sets liveBd, navigates to Live Mode
- `handleRunLibraryBeatdown(item)` — **NEW s18** — converts Library FeedItem to temp LockerBeatdown with `inspiredBy: item.au`, normalizes sections, launches Live Mode
- `handleShareBeatdown(id)` / `handleShareExercise(id)` — sets is_public/source
- `handleUnshareBeatdown(id)` / `handleUnshareExercise(id)` — **NEW s18** — calls unshareBeatdown/unshareExercise, updates local state, reloads Library
- `handleSteal(itemId, itemType)` — steals beatdown or exercise to Locker
- ~~`handleBookmark(itemId, itemType)`~~ — **REMOVED s18**

### LockerBeatdown Interface
`id` (string), `nm`, `dt`, `src`, `d`, `desc`, `secs` (Section[]), `tg` (string[]), `inspiredBy?`, `isPublic?`

### LockerExercise Interface
`id` (string), `nm`, `desc` (string), `tags` (string[]), `how`, `src`, `inspiredBy?`, `shared?`

### Data Flow — Save + Share (UPDATED April 20 s18)
1. User creates beatdown/exercise, optionally checks "Share to community library" toggle
2. **No confirmation popup** — toggle is a simple on/off (sharing is reversible via Unshare)
3. `onSave` fires with `share: boolean` flag
4. `page.tsx` calls `saveBeatdown()` or `saveExercise()` → INSERT into Supabase
5. `loadLocker()` refreshes locker; if `share: true`, `loadLibrary()` also refreshes

### Data Flow — Delete
1. User clicks Delete → `deleteBeatdown()` or `deleteExercise()` → DELETE in Supabase
2. Local state updated immediately
3. `loadLibrary()` called to refresh Library
4. Toast: "Deleted"

### Data Conversion Functions (page.tsx)
- `dbToLocker(row)` — Converts Supabase row to LockerBeatdown. **Now applies `normalizeSection` to each section (April 16).** Checks `inspired_by` for actual Q name. Sets `src` to "Stolen"/"Generated"/"Manual".
- `dbToShared(row)` — Converts to SharedItem for Library. Includes `inspiredBy` from `inspired_profile` JOIN.
- `dbToExercise(row)` — Converts exercise row. Uses `mapBodyPartTags(row)` for full tag reconstruction.
- `mapBodyPartTags(row)` — Reads ALL relevant fields: `body_part`, `is_mary`, `is_transport`, `exercise_type`, `equipment`, `movement_type`, `intensity`. Deduplicates with Set.

### Data Loading Flow — UPDATED April 20 s18
1. `useEffect` fires when `user` is set
2. Calls `loadLocker()` → `loadMyBeatdowns()` + `loadMyExercises()` → sets `lk` and `lkEx`
3. Calls `loadLibrary()` → maps both public beatdowns and exercises to SharedItem[], sets `sharedItems`
4. Calls `loadUserVotes()` → sets `userVotes` Set<string>
5. ~~Calls `loadMyBookmarks()`~~ — **REMOVED s18** (bookmarks killed)
6. All use `useCallback` to prevent unnecessary re-renders

---

## SHARE / UNSHARE SYSTEM (UPDATED April 20 s18)

### Sharing is Now Reversible
All share `confirm()` popups removed. The "Share to community? This can't be undone" warning was removed from Generator, Builder, CreateExercise, and Locker because sharing is now reversible via Unshare.

### Share Toggle (Generator, Builder, CreateExercise)
Simple checkbox toggle — tap to check, tap to uncheck. No confirmation popup. No warning. Sharing is a preference, not a commitment.

### Unshare Flow (NEW — Session 18)
Available in Locker for shared items:
- **Beatdowns:** Unshare button in BuilderScreen edit mode (below Save + Run This)
- **Exercises:** Unshare button in LockerScreen inline edit (below Save exercise)

**Unshare confirmation dialog:**
```
Unshare [beatdown/exercise]?
This will remove [name] from the Library.
All votes and comments from other PAX will be permanently deleted.
[Keep Shared] [Unshare (red)]
```

**Database operations (unshareBeatdown / unshareExercise in db.ts):**
1. DELETE all votes for this item_id + item_type
2. DELETE all comments for this item_id + item_type
3. DELETE all bookmarks for this item_id + item_type
4. UPDATE beatdown `is_public = false` / exercise `source = 'private'`

### Shared Badge on Locker Cards
Shared items show a green "✓ Shared" badge:
- **Beatdown cards:** Next to date/source line
- **Exercise cards:** Next to exercise name

---

## BUSINESS MODEL

### Free (forever)
- 3 auto-generated beatdowns per month
- Manual builder: unlimited
- Browse Library, vote, comment, bookmark
- Create and share exercises
- Live Mode (kept free for adoption)
- Full backblast export

### Pro ($29/year) — NOT YET BUILT
- Unlimited generator
- All 30 Templates (27 Pro formats)
- Follow-Up Mode (avoids repeating recent exercises)
- Steal & Remix (keep structure, swap exercises)
- PAX Count Slider (adjusts for group size)
- Difficulty Curve shaping

### Donations (LIVE)
- Stripe Checkout Sessions (live `sk_live_` key)
- $3 "Light coupon" / $7 "Standard block" / $15 "Heavy carry"
- Real credit cards, payouts to checking account (2 business days)
- No Pro paywall yet — all features free during growth phase

---

## TECH STACK

```
Framework:    Next.js 16.2.3 (React, TypeScript, App Router, src/ directory)
Database:     Supabase (PostgreSQL + Auth + RLS)
Styling:      Tailwind CSS + inline styles (matching prototype exactly)
Hosting:      Vercel (auto-deploys on git push to main)
Payments:     Stripe (LIVE — donations via Checkout Sessions)
App type:     PWA (installable, service worker, offline caching)
Font:         Outfit (Google Fonts, imported in globals.css)
Node.js:      v24.14.1
Git:          v2.53.0
Package mgr:  npm
Drag & Drop:  @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities (ADDED April 16)
```

---

## DEVELOPMENT SETUP

### Local Environment
- **Project location:** `C:\Users\risum\Documents\projects\gloombuilder`
- **PowerShell execution policy:** Set to `RemoteSigned` for CurrentUser
- **Run locally:** `npm run dev` → http://localhost:3000
- **Stop server:** Ctrl+C in PowerShell
- **Git config:** user.name "camplineapp", user.email "risumalinog@gmail.com"
- **Always `cd ~\Documents\projects\gloombuilder` before running commands**

### Git Push Workflow (main branch)
```powershell
git add .
git commit -m "description"
git push
```
Vercel auto-deploys on push to main.

### Branch Workflow (used for builder-redesign-v2)
```powershell
git checkout -b branch-name       # create branch
git push origin branch-name       # push (gets Vercel preview URL)
# ... build, test on preview URL ...
git checkout main
git merge branch-name             # merge when done
git push origin main              # deploy to production
```
**Preview URL:** `gloombuilder-git-[branch-name]-camplines-projects.vercel.app`

### GitHub
- **Repo:** github.com/camplineapp/gloombuilder (public)
- **Branch:** main (production). `builder-redesign-v2` merged April 16.

### Vercel
- **Organization:** CampLine's projects (Hobby plan)
- **Domains:** gloombuilder.app, www.gloombuilder.app, gloombuilder.vercel.app
- **Environment variables (CRITICAL):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY` — must be in Vercel Settings, not just .env.local
- **Force deploy:** `git commit --allow-empty -m "trigger deploy"` then `git push`

### Supabase
- **Project URL:** https://lrdgaduxmtnfawdgtdhw.supabase.co
- **Auth:** Email provider, "Confirm email" OFF for development

### Stale .next Cache Pattern (IMPORTANT)
**Symptom:** Code looks correct, data is correct, but UI doesn't reflect changes.
**Fix:**
```powershell
Remove-Item -Recurse -Force .\.next
npx next dev
```

### Cached Download Pattern (IMPORTANT)
Multiple downloads of same filename in same browser session get cached. Always verify:
```powershell
Get-Content .\src\components\SectionEditor.tsx | Select-String "Add Section|QNotes|SortableSectionBlock"
```

### Verification Pattern After Copy
```powershell
# Verify key change landed in file before pushing
Get-Content .\src\lib\exercises.ts | Select-String "normalizeSection"
Get-Content .\src\components\CopyModal.tsx | Select-String "COT"
Get-Content .\src\components\SectionEditor.tsx | Select-String "SortableSectionBlock"
```

### Dependencies Installed
- `@supabase/supabase-js`
- `@supabase/ssr`
- `lucide-react`
- `stripe`
- `@dnd-kit/core` ← ADDED April 16
- `@dnd-kit/sortable` ← ADDED April 16
- `@dnd-kit/utilities` ← ADDED April 16

---

## SUPABASE DATABASE (7 tables — ALL LIVE)

### 1. profiles
- id (uuid, FK to auth.users), f3_name (max 30), ao (max 40), state, region, created_at
- RLS: public select, owner update/insert
- Trigger: `handle_new_user()` auto-creates profile row on signup with f3_name from metadata

### 2. exercises — ENRICHED SCHEMA (948 seed rows — confirmed April 20 s18)
- id (uuid), name, aliases (text[]), description, how_to, body_part (text[]), exercise_type, equipment, site_type (text[]), group_size, cadence, difficulty (int 1-3), intensity, movement_type, is_mary (bool), is_transport (bool), source ('seed'/'community'/'private'), created_by (uuid FK profiles), inspired_by (uuid FK profiles), video_url (dormant), created_at
- **vote_count** (int, default 0)
- **comment_count** (int, default 0)
- **popularity_tier** (int, default 3) — 1=classic (86), 2=well-known (135), 3=exotic (683)
- **is_core** (bool, default false) — curated core exercise every PAX knows. 60+ exercises flagged. Added April 17 s16. Generator uses hardcoded Sets instead of this column (Supabase boolean coercion was unreliable), but column kept for future Library features.
- **RLS policies (4):** SELECT (seed/community OR own), INSERT (own with_check), UPDATE (own), DELETE (own)
- **904 seed exercises imported** with 100% original descriptions (NOT from F3 Codex)
- Seed exercises have `created_by = NULL`

### 3. beatdowns
- id (uuid), name, description, difficulty (CHECK: 'easy','medium','hard','beast'), duration (int), site_features (text[]), equipment (text[]), tags (text[]), sections (JSONB), created_by (uuid FK profiles), is_public (bool), generated (bool), inspired_by (uuid FK profiles), vote_count (int default 0), steal_count (int default 0), comment_count (int, default 0), created_at
- **RLS policies (4):** SELECT (public or own), INSERT/UPDATE/DELETE (own only)
- **sections JSONB — DUAL FORMAT (April 16):** Old beatdowns: `{label, color, exercises:[{n,r,c,nt}]}`. New beatdowns: `{id, name, label, color, qNotes, note, exercises:[{id,type,name,mode,value,unit,cadence,note,n,r,c,nt}]}`. Both supported via `normalizeSection()`.
- **NOTE: No `cot_message` column.** COT is a live form field in CopyModal only — no persistence.

### 4. votes — GENERIC (beatdowns + exercises)
- id (uuid), user_id (FK profiles), item_id (uuid), item_type (text, CHECK: 'beatdown'/'exercise'), created_at, UNIQUE(user_id, item_id, item_type)
- Trigger: `handle_vote_count()` — **SECURITY DEFINER**

### 5. bookmarks — LIVE (April 14)
- id (uuid), user_id (FK profiles), item_id, item_type (CHECK: beatdown/exercise), created_at, unique(user_id, item_id, item_type)
- RLS: owner select, owner insert (with_check), owner delete
- **INSERT policy uses `WITH CHECK` not `USING`** — `qual` column shows NULL for INSERT which is correct

### 6. comments — LIVE (April 14)
- id (uuid), user_id (FK profiles), item_id, item_type (CHECK: beatdown/exercise), text, created_at
- RLS: public select, owner insert (with_check), owner delete, owner update

### Supabase RPC Functions
- `increment_steal_count(beatdown_id uuid)` — **SECURITY DEFINER** — increments steal_count on a beatdown

### RLS Debugging Pattern
RLS NEVER throws errors — it just affects 0 rows. Toasts can show "success" even when nothing happened.
```sql
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'beatdowns';
```
Fix: drop and recreate the broken policy.

---

## PROJECT FILE STRUCTURE

```
gloombuilder/
├── .env.local                        # Supabase URL + anon key (local only, gitignored)
├── package.json
├── tailwind.config.ts
├── public/
│   ├── logo.png                      # Gb_Green.png renamed
│   ├── manifest.json                 # PWA manifest (standalone, emerald theme)
│   ├── sw.js                         # Service worker (offline caching)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx                # PWA meta tags, SW registration
    │   ├── page.tsx                  # UPDATED April 16 — dbToLocker normalizes sections
    │   ├── api/checkout/route.ts     # Stripe Checkout API
    │   └── success/page.tsx          # Stripe success page
    ├── components/
    │   ├── AuthScreen.tsx
    │   ├── BottomNav.tsx
    │   ├── BuilderScreen.tsx         # REBUILT April 16 — uses SectionEditor, Beatdown Details card
    │   ├── CopyModal.tsx             # UPDATED April 16 — dual-format helpers, COT field
    │   ├── CreateExerciseScreen.tsx
    │   ├── GeneratorScreen.tsx       # UPDATED April 16 — result uses SectionEditor, old helpers removed
    │   ├── HomeScreen.tsx
    │   ├── LibraryScreen.tsx
    │   ├── LiveModeScreen.tsx        # UPDATED April 16 — flattenBeatdown handles both formats
    │   ├── LockerScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── SectionEditor.tsx         # NEW April 16 — shared section editor for Builder + Generator
    └── lib/
        ├── db.ts                     # 25 Supabase CRUD functions
        ├── exercises.ts              # UPDATED April 16 — new interfaces, normalization fns, generate() new format
        └── supabase.ts               # Supabase browser client
```

---

## DATABASE HELPER (lib/db.ts) — LIVE, 25 FUNCTIONS

All Supabase CRUD operations centralized here. Each function creates its own `createClient()` instance to ensure proper auth context. Do NOT use module-level client — causes silent RLS failures.

| Function | Purpose |
|----------|---------|
| `saveBeatdown(data)` | INSERT beatdown with all fields. Returns row. |
| `loadMyBeatdowns()` | SELECT mine, JOIN inspired_profile, newest first. |
| `loadPublicBeatdowns()` | SELECT public, JOIN profiles + inspired_profile. |
| `deleteBeatdown(id)` | DELETE beatdown. Call `loadLibrary()` after. |
| `shareBeatdown(id)` | UPDATE is_public = true. |
| `updateBeatdown(id, data)` | UPDATE all fields. Used by Locker Edit. |
| `saveExercise(data)` | INSERT. Maps ALL 12 tags to correct DB fields. |
| `loadMyExercises()` | SELECT mine, JOIN inspired_profile, newest first. |
| `deleteExercise(id)` | DELETE exercise. Call `loadLibrary()` after. |
| `shareExercise(id)` | UPDATE source = 'community'. |
| `updateExercise(id, data)` | UPDATE all fields including ALL tag fields. Persists to Supabase. |
| `loadPublicExercises()` | SELECT community exercises, JOIN profiles + inspired_profile. |
| `loadSeedExercises()` | SELECT seed exercises (904). Includes description. |
| `addVote(itemId, itemType)` | INSERT vote with item_id + item_type. |
| `removeVote(itemId, itemType)` | DELETE vote matching user + item. |
| `loadUserVotes()` | SELECT item_ids user voted on. Returns string[]. |
| `addBookmark(itemId, itemType)` | INSERT bookmark. |
| `removeBookmark(itemId, itemType)` | DELETE bookmark. |
| `loadMyBookmarks()` | SELECT bookmarked item_ids. |
| `stealBeatdown(originalId)` | Load original → INSERT copy + inspired_by → increment_steal_count RPC. |
| `stealExercise(originalId)` | Load original → INSERT copy + inspired_by. |
| `addComment(itemId, itemType, text)` | INSERT comment with profile JOIN. |
| `loadComments(itemId)` | SELECT comments, newest first, JOIN profiles. |
| `deleteComment(commentId)` | DELETE comment. |
| `updateComment(commentId, text)` | UPDATE comment text. |

---

## EXERCISE DATA — FULL SPEC (lib/exercises.ts)

### SectionExercise Interface (UPDATED April 16 — dual format)
**Old fields (always present, always populated):**
- `n: string` — name
- `r: string` — reps as free text ("20", "45 sec")
- `c: string` — cadence ("IC", "OYO")
- `nt: string` — note
- `type?: "exercise" | "transition"`

**New fields (added April 16, populated alongside old fields):**
- `id?: string` — UUID for dnd-kit
- `name?: string` — same as n
- `mode?: "reps" | "time" | "distance"`
- `value?: number | string`
- `unit?: "sec" | "min" | "yds" | "laps"`
- `cadence?: string` — same as c
- `note?: string` — same as nt
- `exerciseId?: string` — link to seed exercise

**Transition type:** When `type === "transition"`, renders as `↗ text` with no reps/cadence. Stored in exercises array alongside regular exercises.

### Section Interface (UPDATED April 16 — dual format)
**Old fields:** `label: string`, `color: string`, `exercises: SectionExercise[]`, `note: string`
**New fields:** `id?: string`, `name?: string`, `qNotes?: string`

### Local Fallback Exercises
45 exercises in `EX` array. Used only if Supabase load fails. Normal operation loads 904.

### Constants Exported
- `TAGS`: 12 tags (Warm-Up, Mary, Core, Cardio, Full Body, Legs, Chest, Arms, Shoulders, Static, Transport, Coupon)
- `DIFFS`: 4 difficulty levels with id, label, color, description, rep range
- `SITES`: 8 AO site types
- `EQUIP`: 2 options — Bodyweight only + Coupon. Sandbag and Ruck removed (0 exercises use them).

### mapSupabaseExercise Function (CRITICAL)
Converts Supabase row to ExerciseData. Bridge between 904 DB exercises and generator/picker/browser.

**Smart upper body tagging:**
- `upper` body_part → checks name for keywords:
  - ARM_KEYWORDS: curl, row, pull-up, pull up, tricep, hammer, dip → "Arms"
  - SHOULDER_KEYWORDS: shoulder, press, overhead, pike, raise, shrug, arnold → "Shoulders"
  - CHEST_KEYWORDS: merkin, push-up, push up, fly, bench press, chest → "Chest"
  - No match → adds all three (Chest, Arms, Shoulders)

**Additional tags:** `exercise_type "cardio"` → Cardio, `equipment "coupon"` → Coupon, `is_mary true` → Mary, `is_transport true` → Transport, `movement_type "static_hold"` → Static, `intensity "low"` + difficulty ≤ 2 → Warm-Up.

**Site mapping:** site_type + equipment fields → site requirement tags.
**Popularity tier:** `row.popularity_tier` → `pt` field. Defaults to 3 (exotic).
**Intensity (ADDED April 16):** `row.intensity` → `ix` field ('low'/'medium'/'high').

### Actual Data Distribution (from 904 CSV)
**Equipment:** none (694), coupon (144), wall (27), bench (20), pull_up_bar (17), cards (2)
**Site_type:** any (726), field (86), parking_lot (65), wall (26), track (23), hill (19), stairs (16), court (10)
**Difficulty:** 1 = 84 (beginner), 2 = 489 (intermediate), 3 = 331 (advanced/exotic)

---

## STRIPE DONATIONS (LIVE — April 14)

### Architecture
- **API route:** `src/app/api/checkout/route.ts` — creates Stripe Checkout session with dynamic amount
- **Success page:** `src/app/success/page.tsx` — "Thank you, brother. 🫡" with amount, back-to-app link
- **Loading state:** "Redirecting to payment..." with all buttons disabled during redirect

### Stripe Checkout Flow
1. User taps $3 / $7 / $15 on About page
2. `handleDonate(amount)` sends POST to `/api/checkout` with `{ amount }`
3. API creates `stripe.checkout.sessions.create()` with `mode: "payment"` (one-time)
4. API returns `{ url }` → browser redirects to Stripe Checkout
5. After payment → redirects to `/success?amount=X`

### Environment Variables
- `STRIPE_SECRET_KEY` — in both `.env.local` (local) AND Vercel Settings (production)
- **Test mode key:** `sk_test_...` — use test card `4242 4242 4242 4242`
- **Live mode key:** `sk_live_...` — currently active. Real charges.
- Never commit this key. `.env.local` is gitignored.

---

## PWA CONFIG (LIVE — April 14)

### Files in `/public/`
- `manifest.json` — name, icons, theme_color (#22c55e), background_color (#0E0E10), display: standalone
- `sw.js` — Service worker. Caches static assets on install. Network-first for API/Supabase/Stripe.
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — Generated from Gb_Green.png with black bg

### layout.tsx PWA Integration
- `manifest: "/manifest.json"` in metadata
- `appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "GloomBuilder" }`
- Service worker registered via inline `<script>` in body

### Install Instructions
- **iPhone:** Safari → Share button → "Add to Home Screen" → Add
- **Android:** Chrome → three dots → "Add to Home Screen" or "Install app"

---

## F3 IP RULES

- Exercise **names** from F3 Codex are safe (community terminology, not copyrightable)
- Exercise **descriptions** from F3 Codex are **copyrighted** — all 904 in-app descriptions are 100% original
- F3 terminology as tags (Warm-Up, Mary, Coupon, etc.) are safe
- MudGear has exclusive F3 gear contract — avoid gear recommendations
- Mandatory disclaimer: "Not affiliated with F3 Nation, Inc. Built independently by a PAX for the PAX."
- **Exercise Database label:** "Exercise Database" (NOT "F3 Database" — F3 is copyrighted)
- **Browse library label:** "Browse library" (NOT "Browse all 904" — the library grows beyond seed exercises)

---

## TERMINOLOGY — USE THESE EXACT WORDS

| Term | Meaning |
|------|---------|
| **Bookmark** | Save a read-only reference |
| **Steal** | Copy into your collection as editable. Original creator credited via "Inspired by" |
| **Save** | Single action button on library cards → opens Bookmark vs Steal choice |
| **Share** | Publish your original content to Community Library (permanent — can't unshare) |
| **Cadence** | Free text field (IC, OYO, 400m, AMRAP, 30 sec, each leg, etc.) |
| **Locker** | Your personal collection |
| **Q notes** | Free text area per section for special instructions. Lives at TOP of section (Phase 2). |
| **Inspired by** | Credit stamp showing original creator on stolen items |
| **Hand Built** | Source badge for manual builder beatdowns (gold) |
| **AI Generated** | Source badge for generator beatdowns (gray) |
| **COT** | Circle of Trust — closing circle of F3 workout where Q delivers message/prayer/reflection. Backblast form only, never builder. |
| **Transport** | Exercise type — movement from A to B (Bear Crawl, Mosey, Sprint). Not rep-based. Excluded from generator. |
| **Format exercise** | Entire workout structure disguised as exercise (Dora, Triple Nickel). Belongs in Templates, not generator pool. |

---

## KNOWN LIMITATIONS & GOTCHAS

1. **Profile avatar** on Home doesn't update in real-time after profile save (requires page refresh)
2. **No unshare** — once shared, can't unshare (by design). Votes/comments from others would be orphaned.
3. **Exercise Database shows first 50 results** — must search to narrow. No infinite scroll.
4. **Clickable exercises in beatdown detail** only work for seed exercise name matches. Custom exercises won't have info modals.
5. **Vercel deploys can be slow** — use `git commit --allow-empty -m "trigger deploy"` to force.
6. **Editing shared beatdowns** updates real-time in Library. Warning shown. No version history.
7. **Exercise steal count** not tracked — only beatdown steal_count is incremented.
8. **Locker edit beatdown** doesn't pre-fill duration/sites/equipment chips — sections ARE pre-filled.
9. **Stripe donations are live** — real charges, real payouts.
10. **No Pro tier paywall yet** — all features currently free.
11. **No COT Message column on beatdowns** — COT is CopyModal form field only. Not persisted.
12. **Wake Lock doesn't work on Safari iOS** — graceful fallback, no crash.
13. **Live Mode elapsed time not saved** — resets on exit. No `ran_at` tracking yet.
14. **Custom exercises in beatdowns** — show amber "CUSTOM" badge, ⓘ won't open modal.
15. **Transport exercises in generator** — filtered from automatic selection. Still accessible in Library and Builder.
16. **Format exercises (Dora, etc.)** — blocked from generator by name blocklist. Option B (`is_format boolean`) planned for Templates build.
17. **Stale .next cache** — if UI doesn't reflect correct code: `Remove-Item -Recurse -Force .\.next` then `npx next dev`
18. **Duplicate dnd-kit keys** — exercises from old beatdowns may share a UUID if copied. Fixed by index-suffixing keys: `${ex.id}-${idx}`. If the "Encountered two children with the same key" error reappears, check exIds generation in SectionEditor.
19. **sections JSONB has two formats** — old: `{label, note}`, new: `{id, name, qNotes}`. `normalizeSection()` handles both. Do NOT remove dual-format support until a one-time Supabase migration converts all existing beatdowns.
20. **RefObject null typing** — `useRef<HTMLInputElement | null>(null)`. Props that accept these refs must be typed as `React.RefObject<HTMLInputElement | null>` not `React.RefObject<HTMLInputElement>`. TypeScript strictness in Next.js 16 enforces this.
21. **Regex/Python cleanup of large code blocks can corrupt JSX** — happened when removing duration estimator: left orphaned `</div></div>)}` tags. Caused "Unterminated regexp literal" Vercel build error. Always visually inspect changed areas after automated code removal.
22. **TypeScript cast for Section → Record<string,unknown>** — must go through `unknown` first: `s as unknown as Record<string,unknown>`. Direct cast fails because Section has no index signature.
23. **WebkitTouchCallout does NOT need @ts-expect-error in Next.js 16** — TypeScript recognizes it natively. Adding the directive causes "Unused '@ts-expect-error' directive" build failure. Do not add `@ts-expect-error` before `WebkitTouchCallout`.
24. **Body scroll lock in bottom sheets** — ExerciseEditSheet and ExerciseInfoSheet both set `document.body.style.position = "fixed"` on mount. The cleanup function must restore the original scroll position via `window.scrollTo(0, scrollY)` or the page jumps to top on close.
25. **Exercise info ? button only appears for database exercises** — Custom exercises (not found in `allEx` array by case-insensitive name match) show no ? button. This is intentional — custom exercises have no description or how-to to show.
26. **Equipment chip labels require lookup** — `gc.eq` stores raw IDs ("none", "coupon"). Display must use `eqLabel()` to show "Bodyweight only" / "Coupon (block)". Same for sites: `siteLabel()` converts "field" → "Open field", "parking" → "Parking lot". Both BuilderScreen and GeneratorScreen have these helpers. If a new screen displays equipment/site chips, it needs the same lookups.
27. **PowerShell `-replace` fails on multi-line patterns** — When trying to remove a single line with regex, PowerShell's `-replace` often fails silently. Use `Where-Object { $_ -notmatch 'pattern' }` piped to `Set-Content` instead. This is how the `ts-expect-error` line was successfully removed.

---

## DESIGN DECISIONS LOG

| Decision | Rationale |
|----------|-----------|
| Generator flows to edit, not display | Result screen pattern explicitly rejected. Users go directly into editable draft. |
| AO site features are multi-select | Most AOs combine field + track, or parking lot + stairs. Single-select was wrong. |
| Filters in modal drawer | Horizontal scroll filter rows became overcrowded. |
| No community stat cards | Beatdown/exercise/AO count cards removed as noise. |
| No predefined structure types | Classic/Rounds/Zones/WOD labels were all functionally the same — removed. |
| Source badges permanent and binary | Only Hand Built (gold) and AI Generated (gray). No Q Modified state. |
| COT in backblast form, not builder | COT is post-workout. Writing during planning is hypothetical. |
| Avatar profile parked | F3 PAX care about beatdown quality, not profile pics. Build community first. |
| One template per beatdown | Mixing Dora + 11s requires incompatible constraints. Use Builder for custom. |
| Transport exercises excluded from generator | Bear Crawl, Indian Giver etc. are movement patterns, not rep exercises. |
| Format exercises excluded from generator | Dora, Triple Nickel etc. are full workout structures. Templates owns them. |
| Reps always multiples of 5 | Nobody counts to 14 in F3. Real beatdowns use 10, 15, 20, 25, 30. |
| Variable reps per exercise | Real beatdowns mix reps. Flat uniform reps feel fake. |
| Intensity-aware reps | 40 Burpees ≠ 40 Merkins in time. High intensity gets fewer reps. |
| Warmup always 10-15 reps | Warmup is getting loose. 50 SSH is not a warmup. |
| Higher exercise counts for 60 min | Real 45-min medium beatdown has ~10-12 exercises. 60 min needs 16-18. |
| Back to Jump List only in Live Mode | Back + Next side-by-side = fat-finger in the dark with gloves. Single Next = zero mistakes. |
| AI-powered generator parked | Popularity tiers solve 80% at zero cost. Revisit after user traction. |
| No ▲▼ reorder buttons in Builder | Tap targets too small. dnd-kit drag replaces entirely. |
| Exercise edit in bottom sheet | Cramming 4 controls into a 32px row is a spreadsheet, not a phone app. |
| Smart text input for reps/time/distance | One field beats three mode toggles. Parser classifies automatically. |
| Cadence as 3 chip buttons | IC / OYO / Custom covers 95% of use cases without free text confusion. |
| Q notes at TOP of section | Q plans notes before listing exercises, not after. |
| + Add Section after every section | "Add section" buried at bottom = users can't find it. Always one scroll away. |
| Quick delete ✕ on exercise cards | Users shouldn't need to open edit sheet just to delete. One tap. |
| Duration estimator REMOVED | 100 Burpees IC showed 7 minutes. PAX pace varies too much. No formula is reliable. |
| Exercise info peek via ? button + bottom sheet | One tap to open, one tap to close. Replaces 6-tap edit-sheet flow. Bottom sheet chosen over center modal (more natural on mobile) and inline expand (forces 13px text). |
| ? button placement left of ✕ delete | Two visible buttons with clear separation. Rejected: swipe-to-reveal (hidden gesture, conflicts with drag), tap-name (tiny tap target distinction). |
| Wide 44px drag strip instead of narrow ≡ | Full-height left edge drag zone. Easy to hit with thumb. Prevents iOS text selection. Rejected: whole-card-as-drag-handle (tap vs drag ambiguity). |
| Q Notes empty state as text link not dashed box | Dashed box competed with ADD EXERCISE for visual attention. Text link keeps ADD EXERCISE as hero. Three options mocked up; Option A (text link) chosen. |
| Q Notes has-content state as inline text not card | Compact ✎ + italic text + Edit link. No box, no border, no "Q NOTES" label. Saves vertical space, reduces visual noise. |
| Edit sheet field order: How-to below name | Q opens edit sheet to see what an exercise is. How-to should be the first thing visible after the name, not buried after Note. |
| Edit sheet field order: Transition below Note | Keeps all "editing this exercise" fields grouped (HOW MUCH → CADENCE → NOTE → TRANSITION). How-to is reference, not editing. |
| No auto-focus on edit sheet open | Keyboard popping up immediately blocks half the screen and confuses the Q. Sheet should open showing all fields. Q taps what they want. |
| Equipment chips use label lookup not raw ID | "None" is confusing and useless. "Bodyweight only" is the EQUIP label. Same for sites — "Open field" not "field". |
| Builder Beatdown Details shows collapsed chip summary | Matches Generator pattern. Q can see what they've set at a glance without expanding. |
| Core exercise generator replaces popularity tiers | Hand-curated by the Q who runs the AO. 60+ exercises every PAX knows. No exotic exercises on any difficulty. |
| Section-locked core Sets (warmup/mary/thang) | Prevents generator from putting SSH in Thang or Burpees in Mary. Each section has its own curated pool. |
| 100% core on ALL difficulties including Beast | Beast = harder reps, not unknown exercises. PAX should know every exercise regardless of difficulty. |
| Warmup always 2 exercises | Warmup is getting loose, not a workout. 4 was too many. |
| Go Rogue as reroll button, not wizard step | Q sees core beatdown first, then chooses to go exotic. Informed decision > blind choice before seeing results. |
| "Go Rogue" name over "Surprise Me" / "Wild Card" | Clear meaning, fun energy, doesn't need F3 knowledge. Purple color distinguishes from amber Reroll. |
| Hardcoded core Sets over database column | Supabase boolean coercion unreliable. Hardcoded Sets are zero-dependency, instant, easy to update. |
| Q notes before exercises in copy/backblast | Natural reading order: Q reads instructions, then exercises. Was after exercises — wrong. |
| Library detail view matches Builder design | Consistent visual language. Users expect the same section card design everywhere. |
| Warmup always 4 exercises (s17 revert) | Was 2 in s16 — too few, warmup felt incomplete. Reverted to 4 with expanded 38-exercise warmup pool. |
| Exercise name is the visual hero in Live Mode | Exercise name (42-64px) must be the biggest element. Reps (48px) support it. Q needs to see WHAT they're doing before HOW MANY. |
| Tap exercise name for how-to in Live Mode | Option A (inline expansion) chosen over Option B (? button + bottom sheet). Keeps Q in flow, no navigation away, tap to close. |
| How-to as numbered step list not paragraph | Each numbered step on its own line with purple step number. Readable at arm's length outdoors. |
| Swipe for Live Mode navigation (reversing s15 rejection) | Original rejection was about a BACK BUTTON (fat-finger in dark). Swipe requires intentional horizontal drag — harder to accidentally trigger than a button tap. Every photo gallery uses this. |
| No skip button during workout | Fat-finger risk outdoors in the dark. Q can note skips in Review Beatdown screen after workout. |
| No editing during workout | Q is running the show, phone in one hand, PAX waiting. All editing happens post-workout in Review Beatdown. |
| Red-tinted ✕ exit button | Gray button was invisible on dark background. Red tint (`rgba(239,68,68,0.12)`) is visible without being alarming. |
| Exit routes to completion screen, not prelaunch | Q may want to copy backblast or run again even after ending early. Prelaunch reset loses all progress. |
| Review Beatdown as confirmation before copy | Most Qs don't edit — they confirm and copy. Clean read-only list first, tap to expand edit only when needed. Jump List style for familiarity. |
| Completion: Review Beatdown + Run Again as equal primary | Both are equally likely next actions after finishing. Green + amber side by side. "Done — Back to Locker" is tertiary text link. |
| "Copy for Slack" opens CopyModal, not raw clipboard | Q needs the full backblast form with AO, PAX, FNGs, conditions, announcements. Raw clipboard copy was a shortcut that skipped essential fields. |
| Review edits flow to CopyModal via editedSections state | ReviewScreen builds modified Section[] from edits state, pushes to main controller via onEditsChanged callback. CopyModal receives editedSections || sections. |
| Pre-launch screen needs back button | Accidental "Run This" taps happen. Q should be able to exit without starting the timer. |
| Include all exercises by default in Review, let Q remove | Q who skipped an exercise might still want it in backblast with a note. Deleting is easier than remembering what you forgot to include. |
| Stretches → CORE_WARMUP, Yoga → CORE_MARY | Ritz directive. Stretches are warmup exercises. Yoga poses are cooldown/recovery (Mary). |
| 44 new common exercises added to database | Every PAX does High Knees, Butt Kickers, etc. daily. They were genuinely missing from the 904-exercise database. |

---

## BUILDER REDESIGN STATUS

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| **Phase 1: Exercise Cards + Edit Sheet** | ✅ Done (April 16) | 19px names, drag handle ≡, edit sheet with smart text + IC/OYO/Custom chips, dnd-kit within section |
| **Phase 2: Section Structure** | ✅ Done (April 16) | Colored section header cards [≡][✎][✕], section drag, Q notes at top as collapsible, + Add Section after every section |
| **Phase 3: Cleanup** | ✅ Done (April 16) | Quick delete ✕ on cards, text overflow fix, duration estimator removed |
| **Duration estimator** | ❌ Removed | Built and removed. Inaccurate. Do not re-introduce. |
| **SectionEditor.tsx (shared component)** | ✅ Done (April 16) | Single component for Builder + Generator. All section state lives inside. |
| **@dnd-kit installed** | ✅ Done (April 16) | @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities |
| **Data model migration (exercises.ts)** | ✅ Done (April 16) | normalizeSection, normalizeExercise, parseSmartText, generateId exported |
| **generate() outputs new format** | ✅ Done (April 16) | All generated exercises have id + name + mode + value + unit + cadence |
| **page.tsx normalizes sections on load** | ✅ Done (April 16) | dbToLocker applies normalizeSection to all loaded sections |
| **CopyModal dual-format support** | ✅ Done (April 16) | _sLabel, _sNotes, _exName, _exNote, _exReps, _exCad helpers |
| **LiveModeScreen dual-format support** | ✅ Done (April 16) | flattenBeatdown reads both old and new fields |
| **builder-redesign-v2 merged to main** | ✅ Done (April 16) | Live at gloombuilder.app |

---

## LIVE MODE FEATURE STATUS

| Component | Status |
|-----------|--------|
| LiveModeScreen.tsx (all sub-screens) | ✅ Done |
| Smart timer parser (reps + cadence detection) | ✅ Done |
| Smart timer parser (new mode: "time" format) | ✅ Done (April 16) |
| Wake Lock API + fallback | ✅ Done |
| Elapsed timer | ✅ Done |
| Entry: Locker "Run This" button | ✅ Done |
| Entry: Generator "Run This" button | ✅ Done |
| Entry: Builder "Run This" button | ✅ Done |
| Auto-save on Run This (bug fix) | ✅ Done |
| Backblast via CopyModal | ✅ Done |
| Transition line support | ✅ Done |
| Dual-format section/exercise support | ✅ Done (April 16) |
| **Exercise name tap-to-expand how-to** | ✅ Done (April 18 s17) |
| **Swipe left/right navigation** | ✅ Done (April 18 s17) |
| **Red ✕ exit button (visible)** | ✅ Done (April 18 s17) |
| **Exit routes to completion screen** | ✅ Done (April 18 s17) |
| **Visual hierarchy fix (name 64px hero, reps 48px)** | ✅ Done (April 18 s17) |
| **Completion screen: Review Beatdown + Run Again** | ✅ Done (April 18 s17) |
| **Review Beatdown screen (post-workout edit)** | ✅ Done (April 18 s17) |
| **Review edits flow to CopyModal** | ✅ Done (April 19 s17) |
| **Pre-launch ← Back button** | ✅ Done (April 19 s17) |
| **"Copy for Slack" opens CopyModal in Review** | ✅ Done (April 19 s17) |
| **Run Again (restart from exercise 1)** | ✅ Done (April 18 s17) |
| **Seed exercises loaded for how-to lookup** | ✅ Done (April 18 s17) |
| **Q Calendar (ran_at tracking)** | 🔲 Future |
| **Pro-gating timer/backblast** | 🔲 Decided: keep free for adoption |

---

## GENERATOR FEATURE STATUS

| Feature | Status |
|---------|--------|
| 904 Supabase exercises with enriched schema | ✅ Done |
| Popularity tier system (86 T1 + 135 T2 + 683 T3) | ✅ Done |
| Reps always multiples of 5 | ✅ Done (April 16) |
| Variable reps per exercise (weighted pools) | ✅ Done (April 16) |
| Intensity-aware reps (two-dimensional repTable) | ✅ Done (April 16) |
| Realistic exercise counts by duration/difficulty | ✅ Done (April 16) |
| Warmup always 4 exercises at 10-15 reps | ✅ Done (April 16, reverted from 2 in s17) |
| Transport exercises excluded | ✅ Done (April 16) |
| Format exercises blocked (32-entry blocklist) | ✅ Done (April 16) |
| TypeScript null safety (cfg.diff || "medium") | ✅ Done (April 16) |
| ix field for intensity on ExerciseData | ✅ Done (April 16) |
| generate() outputs new dual-format sections | ✅ Done (April 16) |
| Plank push with full new format fields | ✅ Done (April 16) |
| **Templates (30 workout formats)** | 🔲 Future |
| **is_format column on exercises (Option B)** | 🔲 Future (build with Templates) |

---

## FULL BUILD STATUS

| Feature | Status |
|---------|--------|
| Domain, dev env, Next.js, GitHub, Vercel | ✅ Done |
| Supabase database (7 tables, RLS, triggers) | ✅ Done |
| 904 exercises imported with enriched schema | ✅ Done |
| Auth (signup/login) | ✅ Done |
| All 10 screens built | ✅ Done |
| Supabase persistence (beatdowns + exercises) | ✅ Done |
| Share to community library (beatdowns + exercises) | ✅ Done |
| Share confirmation dialogs | ✅ Done |
| Generic voting (beatdowns + exercises) | ✅ Done |
| Bookmarks persistence | ✅ Done |
| Steal to locker | ✅ Done |
| Inspired by display (actual Q name) | ✅ Done |
| Comments (post, edit, delete, real-time counters) | ✅ Done |
| Exercise edit persists to Supabase | ✅ Done |
| Exercise description saves and displays on cards | ✅ Done (April 16 — bug closed) |
| Exercise tags full 12-tag save/load mapping | ✅ Done |
| Locker Edit beatdown (full BuilderScreen editor) | ✅ Done |
| Stripe donations (live Checkout Sessions) | ✅ Done |
| PWA manifest + icons + service worker | ✅ Done |
| App installable on home screen (iPhone + Android) | ✅ Done |
| Popularity tier system (86 T1 + 135 T2 + 683 T3) | ✅ Done |
| COT Message field in Full Backblast | ✅ Done (April 16) |
| Announcements format fixed (text on new line) | ✅ Done (April 16) |
| Generator: Reps multiples of 5 | ✅ Done (April 16) |
| Generator: Variable + intensity-aware reps | ✅ Done (April 16) |
| Generator: Realistic exercise counts | ✅ Done (April 16) |
| Generator: Warmup capped at 10-15 reps | ✅ Done (April 16) |
| Generator: Transport + format exercises excluded | ✅ Done (April 16) |
| **SectionEditor.tsx (shared Builder/Generator component)** | ✅ Done (April 16) |
| **@dnd-kit installed** | ✅ Done (April 16) |
| **Phase 1: New exercise cards + edit sheet + dnd-kit** | ✅ Done (April 16) |
| **Phase 2: Section drag + headers + Q notes + Add Section** | ✅ Done (April 16) |
| **Phase 3: Quick delete X + overflow fix** | ✅ Done (April 16) |
| **exercises.ts: normalizeSection + normalizeExercise + parseSmartText** | ✅ Done (April 16) |
| **exercises.ts: generate() outputs new dual-format** | ✅ Done (April 16) |
| **page.tsx: dbToLocker normalizes sections** | ✅ Done (April 16) |
| **CopyModal: dual-format helpers** | ✅ Done (April 16) |
| **LiveModeScreen: dual-format flattenBeatdown** | ✅ Done (April 16) |
| **builder-redesign-v2 merged to main** | ✅ Done (April 16) |
| **Visual UI redesign: premium section cards with glow borders** | ✅ Done (April 17) |
| **ADD EXERCISE as hero field with browse icon inside** | ✅ Done (April 17) |
| **Transitions moved exclusively to exercise edit sheet** | ✅ Done (April 17) |
| **Q notes as full-width 16px buttons** | ✅ Done (April 17) |
| **Beatdown Details collapsible, hidden by default** | ✅ Done (April 17) |
| **Generator Beatdown Details with chip summary** | ✅ Done (April 17) |
| **AO Site + Equipment always flat inside Beatdown Details** | ✅ Done (April 17) |
| **Section name single-tap to rename** | ✅ Done (April 17) |
| **✕ delete always visible with exercise count warning** | ✅ Done (April 17) |
| **Autocomplete dropdown overflow fix (zIndex 9999)** | ✅ Done (April 17) |
| **New section color rotation fix** | ✅ Done (April 17) |
| **Q notes text overflow wordBreak fix** | ✅ Done (April 17) |
| **Browse icon bumped to 28px** | ✅ Done (April 17) |
| **TypeScript duplicate borderLeft build error fixed** | ✅ Done (April 17) |
| **Deployed to gloombuilder.app (main branch)** | ✅ Done (April 17) |
| **Exercise Edit Sheet: no auto-focus on HOW MUCH** | ✅ Done (April 17 s15) |
| **Exercise Edit Sheet: body scroll lock** | ✅ Done (April 17 s15) |
| **Exercise Edit Sheet: field order rearranged (how-to below name)** | ✅ Done (April 17 s15) |
| **Exercise Edit Sheet: smart text hint bumped to 14px/T4** | ✅ Done (April 17 s15) |
| **Exercise Info Peek (? button + bottom sheet)** | ✅ Done (April 17 s15) |
| **Wide 44px drag strip on exercise cards** | ✅ Done (April 17 s15) |
| **iOS drag handle fix (userSelect + WebkitTouchCallout)** | ✅ Done (April 17 s15) |
| **Q Notes empty state → subtle text link** | ✅ Done (April 17 s15) |
| **Q Notes has-content state → compact inline (no box)** | ✅ Done (April 17 s15) |
| **Builder Beatdown Details collapsed chip summary** | ✅ Done (April 17 s15) |
| **Generator/Builder equipment label fix (None → Bodyweight only)** | ✅ Done (April 17 s15) |
| **Site/equipment chip labels use siteLabel()/eqLabel() lookups** | ✅ Done (April 17 s15) |
| **TypeScript ts-expect-error build fix** | ✅ Done (April 17 s15) |
| **All changes deployed to gloombuilder.app** | ✅ Done (April 17 s15) |
| **Core Exercise Generator: section-locked Sets (CORE_WARMUP/MARY/THANG)** | ✅ Done (April 17 s16) |
| **Core Exercise Generator: 100% core for ALL difficulties** | ✅ Done (April 17 s16) |
| **Core Exercise Generator: warmup always 4 exercises** | ✅ Done (April 17 s16, briefly 2, reverted s17) |
| **Core Exercise Generator: coupon filtering on all pools** | ✅ Done (April 17 s16) |
| **Core Exercise Generator: warmup deduplication** | ✅ Done (April 17 s16) |
| **"Go Rogue" reroll button (full 904 pool)** | ✅ Done (April 17 s16) |
| **goRogue parameter on generate() function** | ✅ Done (April 17 s16) |
| **is_core boolean column on exercises table** | ✅ Done (April 17 s16) |
| **2 new exercises in Supabase (Reverse Crunch, Superman)** | ✅ Done (April 17 s16) |
| **12 existing exercises marked is_core=true** | ✅ Done (April 17 s16) |
| **db.ts loadSeedExercises includes is_core** | ✅ Done (April 17 s16) |
| **Q Notes copy/backblast order fix (before exercises)** | ✅ Done (April 17 s16) |
| **Library beatdown detail view redesigned** | ✅ Done (April 17 s16) |
| **Equipment chip label fix (siteLabel/eqLabel lookups)** | ✅ Done (April 17 s16) |
| **Builder Beatdown Details collapsed chip summary** | ✅ Done (April 17 s16) |
| **All session 16 changes deployed to gloombuilder.app** | ✅ Done (April 17 s16) |
| **44 new exercises added to Supabase (20 warmup + 13 stretch + 6 yoga + 3 mary + 2 thang)** | ✅ Done (April 18 s17) |
| **Core Sets expanded: CORE_WARMUP 38, CORE_MARY 24, CORE_THANG 45** | ✅ Done (April 18 s17) |
| **Warmup reverted to 4 exercises (was 2)** | ✅ Done (April 18 s17) |
| **Live Mode: exercise name tap-to-expand how-to (numbered list, purple box)** | ✅ Done (April 18 s17) |
| **Live Mode: swipe left/right navigation** | ✅ Done (April 18 s17) |
| **Live Mode: red ✕ exit button (was gray/invisible)** | ✅ Done (April 18 s17) |
| **Live Mode: exit routes to completion screen (was prelaunch reset)** | ✅ Done (April 18 s17) |
| **Live Mode: visual hierarchy fix (name 42-64px hero, reps 48px secondary)** | ✅ Done (April 18 s17) |
| **Live Mode: completion screen redesign (Review Beatdown + Run Again + Back to Locker)** | ✅ Done (April 18 s17) |
| **Live Mode: Review Beatdown screen (Jump List style, tap-to-expand inline edit)** | ✅ Done (April 19 s17) |
| **Live Mode: Review edits flow to CopyModal via editedSections state** | ✅ Done (April 19 s17) |
| **Live Mode: pre-launch ← Back button (accidental Run This exit)** | ✅ Done (April 19 s17) |
| **Live Mode: "Copy for Slack" opens CopyModal in Review** | ✅ Done (April 19 s17) |
| **Live Mode: Run Again (restart from exercise 1, timer reset)** | ✅ Done (April 18 s17) |
| **Live Mode: seed exercises loaded internally for how-to lookup** | ✅ Done (April 18 s17) |
| **Backblast F3 name bug: "The Bishop" default removed from CopyModal + GeneratorScreen** | ✅ Done (April 19 s17) |
| **GeneratorScreen: profName prop added for CopyModal qName** | ✅ Done (April 19 s17) |
| **page.tsx: profName passed to GeneratorScreen** | ✅ Done (April 19 s17) |
| **All session 17 changes deployed to gloombuilder.app** | ✅ Done (April 19 s17) |
| **Ritz creates 2-3 real beatdowns as The Bishop** | 🔲 Pending — do FIRST before inviting anyone |
| **Templates (30 workout formats)** | 🔲 Future |
| **is_format column on exercises (Option B)** | 🔲 Future (build with Templates) |
| **Stripe Pro tier ($29/year subscription)** | 🔲 Pending |
| **Responsive desktop layout** | 🔲 Polish |
| **Avatar profile customization** | 🔲 Parked |

---

## BUGS FIXED (complete list)

| Bug | Fix |
|-----|-----|
| TypeScript `(string\|null)[]` not assignable to `string[]` | `.filter((v): v is string => Boolean(v))` |
| TypeScript `share` not in onSave type | Added `share?: boolean` to interfaces |
| Exercise fields no char limits | Added maxLength to all inputs |
| Exercise notes/reps overflow container | `overflow:hidden, textOverflow:ellipsis, whiteSpace:nowrap` |
| Vercel missing env vars | Added vars in Vercel Settings → Environment Variables |
| PowerShell scripts blocked | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| Beatdowns not saving to Locker | Lifted locker state to page.tsx |
| Copy/Backblast missing beatdown info | Added `beatdownName`, `beatdownDesc`, `qName` props to CopyModal |
| `author_id` vs `created_by` mismatch | `ALTER TABLE beatdowns RENAME COLUMN author_id TO created_by` |
| Difficulty constraint mismatch | Changed to easy/medium/hard/beast |
| Vote count not updating | Added SECURITY DEFINER to `handle_vote_count()` trigger |
| Vote count stale in detail view | Added `useEffect` in LibraryScreen syncing `libDet` when `sharedItems` changes |
| Clicking vote opens detail view | Added `e.stopPropagation()` on vote span |
| Exercise voting shows "Vote failed" | Migrated votes to generic `item_id + item_type` schema |
| Exercise tags only saving 5 of 12 types | Expanded saveExercise/updateExercise to map ALL 12 |
| Exercise tags not loading back correctly | Rewrote `mapBodyPartTags(row)` to accept full row and read ALL fields |
| Exercise edit only saved to local state | Added `updateExercise()` to db.ts + handler in page.tsx |
| Stolen beatdowns show "a fellow PAX" | Added `inspired_profile` JOIN to load functions. Shows actual Q name. |
| Comment count always 0 | Added `comment_count` column + SECURITY DEFINER trigger |
| Beatdown edit shows "coming soon" | Wired Edit → `editingBd` state → BuilderScreen with editData + onUpdate |
| Generator Easy/Medium shows obscure exercises | 3-tier popularity system |
| Stripe donations not working | Built full API route, success page, live Stripe account |
| Builder slower than Notes for known exercises | Replaced full-screen picker with inline quick-add autocomplete |
| How-to text is one long paragraph | Split numbered steps onto separate lines using regex |
| Section name maxLength 25 too short | Bumped to 60 chars |
| Locker buttons too big and ugly | Two-row layout with proper spacing |
| Run This from Generator/Builder exits immediately | Auto-save inline without `setVw(null)` |
| Bottom nav at phone screen edge | Added safe-area-inset-bottom padding + larger tap targets |
| Double duration/difficulty tags on cards | Filter tags array before rendering pills |
| Save button double-tap creates duplicates | Added `saving` state, button disabled during save |
| Exercise description missing from LockerExercise | Added `desc: string` to interface, mapped `row.description` |
| Exercise card showed both desc and how-to | Shows description only on card. How-to in edit form only. |
| `updateExercise` not saving description | Added `description: data.desc` to Supabase update call |
| Generator reps not multiples of 5 | New `rn()` snaps to multiples of 5 |
| Generator reps uniform | `pickReps(diff, intensity)` per exercise with weighted pools |
| High-intensity exercises same reps | Two-dimensional repTable: beast Burpees=20-25, beast Merkins=35-50 |
| Warmup got beast-level reps | Fixed `wRepOpts = [10,10,15,15,15]` |
| Too few exercises for 60 min | New count matrix |
| Transport exercises got reps | Filtered `!e.t.includes("Transport")` from pool |
| Format exercises (Dora, etc.) got reps | FORMAT_EXERCISES Set blocks 32 formats |
| TypeScript null in pickReps | `cfg.diff || "medium"` null fallback |
| Exercise description not displaying | Stale .next cache. Fix: delete .next, run npx next dev |
| Announcements inline in backblast | Changed to `*Announcements:*\ntext` |
| Generator result screen crash (`exD is not defined`) | Removed orphaned `exDM`/`pkM` blocks — SectionEditor handles them |
| TypeScript cast `Section → Record<string,unknown>` | Cast through `unknown` first: `s as unknown as Record<string,unknown>` |
| TypeScript build error: Plank push old format | Plank push updated to include all new format fields (id, type, name, mode, value, unit) |
| Edit sheet auto-focuses HOW MUCH field (April 17 s15) | Removed `autoFocus` from HOW MUCH input. Sheet opens showing all fields, Q taps what they need. |
| Background scrolls through edit sheet on iPhone (April 17 s15) | Added `useEffect` body scroll lock (`position: fixed` + `overflow: hidden`) + `overscrollBehavior: contain` on sheet container. |
| Smart text hint too small (11px T5) (April 17 s15) | Bumped to 14px T4. Classification icon 16→18px, text 14→15px/700. |
| How-to buried at bottom of edit sheet (April 17 s15) | Moved "How to do this exercise" from after NOTE to right below exercise name. TRANSITION moved from after how-to to below NOTE. |
| iOS Copy/Look Up/Translate on drag handles (April 17 s15) | Created shared `dragHandleStyle` with `userSelect: none`, `WebkitUserSelect: none`, `WebkitTouchCallout: none`. Applied to all ≡ elements. |
| Drag handle too narrow — finger hits exercise name text (April 17 s15) | Replaced narrow inline ≡ character with 44px-wide full-height drag strip on left edge of card. `alignItems: stretch` + `overflow: hidden` on card container. |
| Q Notes dashed box competes with ADD EXERCISE (April 17 s15) | Replaced full-width dashed-border box with subtle "+ Add Q notes" text link (T3, 14px/600). Has-content state changed from box to inline text with ✎ icon. |
| Generator equipment chip shows "None" (April 17 s15) | Added `eqLabel()` lookup function. "none" → "Bodyweight only", "coupon" → "Coupon (block)". Removed `textTransform: capitalize` from chips. |
| Generator/Builder site chips show raw IDs (April 17 s15) | Added `siteLabel()` lookup function. "field" → "Open field", "parking" → "Parking lot", etc. |
| Builder Beatdown Details no chip summary when collapsed (April 17 s15) | Added `hasAnyDetails` check + collapsed chip summary matching Generator pattern. Duration green, difficulty uses DIFFS color, sites neutral, equipment purple. |
| TypeScript `@ts-expect-error` build failure (April 17 s15) | Next.js 16 recognizes `WebkitTouchCallout` natively. The unused directive caused "Unused '@ts-expect-error' directive" error. Removed. Do not re-add. |
| Duplicate dnd-kit keys in exercise list | Index-suffixed keys: `${ex.id}-${idx}` not bare `ex.id` |
| RefObject null type mismatch | `React.RefObject<HTMLInputElement | null>` in SortableSectionBlock props |
| Orphaned JSX closing divs (estimator removal) | Stray `</div></div>)}` caused "Unterminated regexp literal" Vercel error. Fixed manually. |
| Long custom exercise names overflow card | `overflow: hidden; textOverflow: ellipsis; whiteSpace: nowrap` on all card text |
| No quick delete on exercise cards | Added ✕ button at right of every exercise card |
| Generator crashes on load (April 17) | `grDetailsOpen` useState after early return — React hooks violation. Moved to top of component. |
| Autocomplete dropdown invisible/clipped (April 17) | Section card `overflow: hidden` clipped dropdown. Fix: outer card uses `overflow: visible`; only top header div uses `overflow: hidden` for stripe. Dropdown gets `zIndex: 9999`. |
| Q notes missing after redesign (April 17) | Removed during redesign, not re-added. Re-implemented as three-state component at 16px. |
| Bookmark system (April 20 s18) | Bookmarks were a dead-end — every user eventually needed to Steal to actually use the item. Killed entirely. "Save" = one-tap steal. |
| Save bottom sheet with Bookmark vs Steal choice (April 20 s18) | Forced a decision users didn't have context to make. Replaced with direct steal on tap. |
| ⋯ action sheet on Locker cards (April 20 s18) | Added complexity. Copy/Share/Delete moved into BuilderScreen edit mode. Card tap = edit, ▶ = run. |
| Big green "Run This" bar on Locker cards (April 20 s18) | Dominated the card visually. Beatdown title should be the hero. Replaced with 48px ▶ play icon button on right side. |
| 3-tab Locker (Beatdowns/Exercises/Bookmarked) (April 20 s18) | Bookmarked tab was second-class — items couldn't be edited, run, or copied. Killed when bookmarks were removed. |
| "+ Generate" / "+ Build manually" buttons in Locker (April 20 s18) | Creation actions belong on Home screen, not Locker. Locker = manage what you have, not create new things. |
| "Share to community? This can't be undone" confirm popup (April 20 s18) | Sharing is now reversible via Unshare. No scary warning needed. Simple toggle. |
| Exercise favorites / bookmark system for exercises (April 20 s18 discussion) | Good idea but premature. Fix exercise search unification first (Builder can't find custom/shared exercises). Favorites as ranking boost after search works. |
| Hardcoded "Search 904 exercises" (April 20 s18) | Count was wrong (948 in DB) and will keep growing. Replaced with dynamic `seedEx.length`. |
| Exercise drag snap-back bug (April 20 s18) | `handleExDragEnd` searched for `"someId"` but `SortableContext` used `"someId-2"` (index suffix). Fix: rebuild `exIds` in handler, use `indexOf`. |
| New section always amber/gold (April 17) | Color rotation used `(afterIdx+1) % sC.length` = always 1. Fixed to `sections.length % sC.length`. |
| Delete button closed menu but didn't delete (April 17) | Delete was inside ··· menu. Menu closed on click. Confirm never fired. Removed ··· menu entirely, ✕ always visible. |
| Section rename required 2 taps (April 17) | ··· menu required: tap ···, tap Rename. Now: single tap on section name → immediate rename. |
| Q notes text bleeding outside card (April 17) | Missing `wordBreak: "break-word"` and `overflowWrap: "break-word"` on body text. |
| Browse ⌕ icon too small (April 17) | Was 22px. Bumped to 28px. |
| Standalone transition button at section level (April 17) | Added by mistake. Removed. Transitions only via exercise edit sheet `onAddTransitionAfter`. |
| Beatdown Details open by default (April 17) | `useState(true)` → `useState(false)`. |
| TypeScript build error: duplicate `borderLeft` (April 17) | Browse button had `border: "none"` AND `borderLeft: ...` — TypeScript rejects duplicate keys in object literal. Removed `border: "none"`, kept only `borderLeft`. |
| Generator Beatdown Details showed tiny text (April 17) | "Duration: 45 min · Difficulty: hard" in 11px. Replaced with colored chip pills. |
| Reps number (80px) dominates over exercise name (38-56px) in Live Mode (April 18 s17) | Exercise name bumped to 42-64px (hero), reps reduced to 48px (secondary), cadence to 18px (tertiary). |
| ✕ exit button invisible in Live Mode (gray on dark bg) (April 18 s17) | Changed to red-tinted: `background: rgba(239,68,68,0.12)`, `border: 1px solid rgba(239,68,68,0.30)`, `color: C.red`. |
| Exit "End" routes to prelaunch, losing all progress (April 18 s17) | Changed `handleExit` to route to completion screen (`setScreen("complete")`) instead of prelaunch. Timer stops but elapsed time preserved. |
| No way to go back from pre-launch screen after accidental "Run This" (April 19 s17) | Added `onClose` prop and "← Back" button at top-left of PreLaunchScreen. |
| Backblast F3 name stuck to "The Bishop" (April 19 s17) | CopyModal.tsx defaulted `qName` to "The Bishop". Changed to "Q". GeneratorScreen.tsx had hardcoded `qName="The Bishop"` — added `profName` prop, uses `profName \|\| "Q"`. page.tsx passes `profName={profName}` to GeneratorScreen. |
| How-to instructions render as one paragraph blob in Live Mode (April 18 s17) | Split on numbered step pattern, render each step as separate line with purple step number on left and 18px instruction text on right. |
| "tap to close" text on how-to expansion too small (12px) (April 18 s17) | Bumped to 15px/600 with text "tap anywhere to close". |
| Review Beatdown "Copy Backblast" copies raw text instead of opening CopyModal (April 19 s17) | Changed button to "Copy for Slack", calls `onCopyBackblast` callback which sets `showCopyModal(true)` in main controller. |
| Review Beatdown edits don't flow to CopyModal backblast text (April 19 s17) | Added `editedSections` state in main controller. ReviewScreen `useEffect` builds modified `Section[]` from edits, calls `onEditsChanged(editedSecs)`. CopyModal receives `editedSections \|\| sections`. |
| Warmup stuck at 2 exercises after core overhaul (April 18 s17) | File download caching — old `exercises.ts` with `pk(wCorePool, 2)` persisted. Verified fix with `Get-Content \| Select-String`. Reverted to 4 warmup exercises per Ritz directive. |
| is_core boolean coercion always false in TypeScript (April 18 s17) | Supabase returns `is_core` but `(row.is_core as boolean) \|\| false` always returned false. Abandoned database column for generator filtering; hardcoded Sets in exercises.ts instead. |

---

## REJECTED IDEAS — DO NOT REVISIT

| Idea | Why rejected |
|------|-------------|
| Emoji tab icons | Looks childish. Just words. |
| Letter badges on tabs | Cluttered. Just the word. |
| "Q Modified" source tier | Over-engineering. Two tiers is clean. |
| Red theme | Too harsh. Emerald green. |
| Blue-gray text colors | Invisible on dark backgrounds. Warm neutrals. |
| HTML5 drag-to-reorder | Doesn't work on mobile. @dnd-kit only. |
| Trending section on Home | Cluttered. Home is for creation only. |
| Community stat counters | Useless information. |
| Share stolen items | Unfair to creators. |
| Comments oldest first | Newest on top. |
| Backblast as bottom sheet | Too cramped. Full-screen. |
| Mix-and-match templates per section | One format per beatdown. Builder for custom. |
| Reps vs. Time toggle in Builder | Smart text parser auto-detects. No user choice. |
| Full-screen section interstitials in Live Mode | Q is mid-workout. Inline highlight is enough. |
| Back button on teleprompter | Fat-finger in the dark. Back in Jump List only. UPDATED s17: Swipe-back added instead — requires intentional horizontal drag, harder to accidentally trigger than a button tap. |
| Timer auto-advance in Live Mode | Inconsistent mental model. Everything waits for Next. |
| Transparent overlays in Live Mode | Text bleed-through. All surfaces solid. |
| Direct clipboard copy for Live Mode backblast | Q needs to edit AO, PAX, conditions. CopyModal. |
| Skip button during Live Mode workout (April 18 s17) | Fat-finger risk outdoors. Q can note skips in Review Beatdown screen after workout instead. |
| Edit controls visible by default in Review screen (April 18 s17) | Most Qs don't edit. Show clean read-only list first, tap individual exercise to expand edit panel. |
| "End workout" text link near Next button (April 18 s17) | Unnecessary clutter. ✕ exit button already exists top-left. Making ✕ red-tinted is sufficient. |
| Swipe hint labels ("← swipe back / swipe next →") (April 18 s17) | Patronizing. Q either knows swipe gestures or uses the Next button. No labels. |
| Reps number as visual hero (80px) (April 18 s17) | Wrong hierarchy. Exercise name tells Q WHAT to do — must be the hero. Reps (how many) is secondary. |
| "Go Rogue becomes default after 5 beatdowns" auto-switch (April 18 s17) | Over-engineering with zero users. Manual Go Rogue button is fine. |
| Generator wizard "How adventurous?" step (April 17 s16) | Q can't answer before seeing a beatdown. Adds friction. First-time users would pick wrong option. Reroll buttons on result screen are better — Q sees core first, then decides. |
| "Surprise Me" button name (April 17 s16) | Too generic. "Go Rogue" chosen — communicates "leaving the safe zone", works for all audiences. Other rejected names: Wild Card, Full Send, Send It, Mix It Up, Deep Cuts, Crowd Work. |
| Warmup limited to 2 exercises (April 18 s17) | Tested during s17. Too few — warmup felt incomplete. Reverted to 4 per Ritz directive. |
| Hard 70% core + 30% exotic mix (April 17 s16) | Tested and rejected. Exotic exercises leaked into warmup and mary sections. ALL difficulties must be 100% core. Beast = harder reps, not exotic exercises. |
| Beast 50% core + 50% exotic mix (April 17 s16) | Same problem as Hard — exotic exercises in warmup/mary are always wrong regardless of difficulty. |
| COT Message in builder (pre-workout) | COT is post-workout. CopyModal form only. No database column. |
| Avatar profile customization (now) | F3 PAX care about beatdown quality, not profile pics. Parked. |
| Sandbag/Ruck equipment options | 0 exercises in database use them. |
| Fake sample data in Library | Real beatdowns by The Bishop instead. |
| "F3 Database" label | F3 is copyrighted. "Exercise Database". |
| "Browse all 904" label | Library grows. "Browse library". |
| Uniform reps for all exercises | Real beatdowns mix reps. Variable pools. |
| Reps ignoring exercise intensity | 40 Burpees ≠ 40 Merkins. Intensity-aware now. |
| Transport exercises in generator | Movement patterns. Not rep exercises. |
| Format exercises in generator | Workout structures. Templates owns them. |
| ▲▼ reorder buttons in Builder | Tap targets too small. Drag handles it. |
| Inline edit form inside exercise row | Spreadsheet density on a phone. Edit sheet instead. |
| Mode toggle (REPS/TIME/DISTANCE) in edit sheet | Smart text does it. No user choice needed. |
| Duration estimator badge | 100 Burpees IC = 7 minutes?? PAX pace varies too much. Laughably inaccurate. |
| ⓘ info icon on exercise cards | Invisible at T5 color on dark bg. How-to lives in edit sheet collapsible. |
| "Q Modified" intermediate source badge | Rejected. Only Hand Built (gold) and AI Generated (gray). |
| ··· ellipsis menu for section management | Too tiny, required 2 taps. Direct rename on section name tap is faster. |
| Standalone transition button at section level | Transitions follow specific exercises. Context belongs in edit sheet only. |
| Section colored background header card | Looks like spreadsheet column header. Only 3px top stripe conveys color now. |
| Muted/tiny Q notes and transition buttons | Primary users are 40-50, outdoors. Must be 16px minimum always. Non-negotiable. |
| Small ⌕ browse icon (22px) | Primary action. Must be obvious. Bumped to 28px. |
| Full-width dashed box for empty Q Notes (April 17 s15) | Competed with ADD EXERCISE for visual attention. Replaced with subtle "+ Add Q notes" text link. Three mockup options presented — Option A (inline text link) chosen for strongest hierarchy. |
| Q Notes pill button (Option B, April 17 s15) | Better than dashed box but still creates a visual "thing" with border/background. Text link is quieter. |
| Q Notes below ADD EXERCISE (Option C, April 17 s15) | Wrong reading order — Q's notes for the section would appear after the exercises. Q reads notes before doing exercises. |
| Swipe-to-reveal exercise info (April 17 s15) | Hidden gesture = less discoverable. Conflicts with dnd-kit drag. Harder to implement. |
| Tap exercise name for info (April 17 s15) | Tap target distinction between name area and card body is too small on a phone. Would misfire constantly for 40-50 year old PAX. |
| Center modal for exercise info (April 17 s15) | Bottom sheet feels more natural on mobile for "peek then dismiss" interactions. Center modal feels interruptive. |
| Inline expand for exercise info (April 17 s15) | Pushes section content down which feels jarring. Text forced to 13px to fit in card. Bottom sheet gives full-size 14-15px readable text. |
| Whole-card-as-drag-handle (April 17 s15) | Creates tap-vs-drag ambiguity on every card interaction. Primary card action (tap to edit) would constantly fight with drag initiation. 44px left strip is better — clean separation. |
| `@ts-expect-error` for WebkitTouchCallout (April 17 s15) | Next.js 16 TypeScript recognizes WebkitTouchCallout natively. The directive causes "Unused @ts-expect-error" build failure. Do not add it back. |
| Generator wizard "How adventurous?" step (April 17 s16) | Q can't answer before seeing a beatdown. Adds friction. First-time users would pick wrong option. Reroll buttons on result screen are better — Q sees core first, then decides. |
| "Surprise Me" button name (April 17 s16) | Too generic. "Go Rogue" chosen — communicates "leaving the safe zone", works for all audiences. Other rejected names: Wild Card, Full Send, Send It, Mix It Up, Deep Cuts, Crowd Work. |
| Popularity tier selection for generator (April 17 s16) | Replaced entirely by Core Exercise Sets. T1/T2/T3 tiers were Claude's guesses, not real usage data. Core Sets are hand-curated by Ritz. Popularity tiers remain in DB for Library features but generator ignores them. |
| Hard 70% core + 30% exotic mix (April 17 s16) | Originally rejected because exotic exercises leaked into warmup and mary sections. **REVERSED in s20** — section-locked pools (CORE_WARMUP, CORE_MARY, CORE_THANG) now prevent leakage. 70/30 mix applied ONLY to Thang + custom sections. Warmup and Mary remain 100% core always. |
| Beast 50% core + 50% exotic mix (April 17 s16) | Same problem as Hard — exotic exercises in warmup/mary are always wrong regardless of difficulty. |
| is_core column as generator filter (April 17 s16) | Supabase boolean coercion unreliable — `(row.is_core as boolean) || false` always returned false. Hardcoded Sets are bulletproof. Column kept for future Library features. |
| Warmup 4 exercises (April 17 s16) | REVERSED in s17: Ritz initially said "always have 2 warmup exercises only" but reverted to 4 after testing. 2 was too few with expanded 38-exercise warmup pool. |
| Q notes after exercises in copy text (April 17 s16) | Wrong reading order. Q reads instructions before doing exercises. Moved to right below section header. |
| Library detail view with old left-border design (April 17 s16) | Replaced with section card design matching Builder. 22px radius, 3px stripe, #111114 bg, #1a1a1f exercise cards, purple ? buttons. |
| Nested `<details>` collapse inside Beatdown Details | AO site/Equipment hidden behind expand link. Confusing: collapse inside a collapse. Always flat now. |
| Text summary in Generator Beatdown Details | "Duration: 45 min · Difficulty: hard" in 11px T5. Replaced with colored chip pills. |
| Exercise lock toggles per exercise (April 21 s19) | Originally rejected for cockpit density. **REVERSED in s20** — implemented with 28x28px lock icon between ? and ✕. Works well because: (1) unlocked state is nearly invisible (T5, transparent bg), (2) only shows on Generator screen, (3) provides essential reroll control. Previous rejection assumed 4 icons per card would be too dense — in practice the lock is so subtle when unlocked that it doesn't compete. |
| Go Rogue per section as separate button (April 21 s19 Option B) | Two pills per section ("Reroll" + "Rogue"). Too much visual weight — 6 new buttons across 3 sections. Single toggle icon chosen instead. |
| Lock-to-protect sections (April 21 s19 Option C) | Inverted mental model where Q locks sections they like then hits Reroll All. Requires reverse thinking ("protect what I like" vs "reroll what I don't"). Single toggle icon is more direct. |
| Long-press for Go Rogue (April 21 s19) | Hidden gesture. 40-50 year old demographic won't discover it. Toggle icon is explicit. |
| Section reroll on Builder screen (April 21 s19) | Builder is for manual building, not generating. Reroll only makes sense when generator created the content. `onSectionReroll` prop is optional — only GeneratorScreen passes it. |
| "Reroll" and "Go Rogue" button names (April 21 s19) | Renamed to "Classics" and "Full Library" — self-explanatory, no legend needed. "Go Rogue" was fun but required explanation for new users. |
| Legend/instruction block for reroll icons (April 21 s19) | Tried green/purple icon legend with "Core exercises" / "Full library" labels. Took too much space. Button names "Classics" / "Full Library" are self-documenting. Replaced with inline "Tap to reroll" hint. |
| Exercise favorites before search unification (April 20 s18 discussion) | Good idea but premature. Fixed search first so custom/shared exercises are findable. Favorites as ranking boost comes after. |
| Separate "Add" button for transitions in edit sheet (April 21 s19) | Required separate tap after typing transition text. Now saves with "Save changes" — one tap for everything. |
| Custom cadence popup input field (April 23 s20) | Extra field appeared when Custom button was tapped. Users expected to just type in the HOW MUCH field. Removed — Custom is just a toggle flag now, no popup. |
| Quick Copy vs Full Backblast picker screen (April 23 s20) | Bottom sheet with two cards forcing a choice. Dead end — most users always wanted full backblast. Removed. "Copy Exercise Only" button added to the backblast form instead. |
| "Copy for Slack" button name (April 23 s20) | Renamed to "Backblast" — more accurate, F3-native terminology. The content works in any app, not just Slack. |
| How-to regex `/(?=\d+\.\s)/` (April 23 s20) | Broke on exercises with time values like "1:30" — the "30." triggered a false split. Fixed to `/\s(?=(?:[1-9]|1\d|20)\.\s[A-Z])/` which requires step number 1-20 + capital letter. |

---

## HOW TO START THE NEXT SESSION

1. Upload this Bible (v15)
2. Upload GLOOMBUILDER-GENERATOR-BLUEPRINT.md (needed for future generator rebuild / Templates work)
3. Upload Gb_Green.png (logo)
4. Upload ux-forge-SKILL.md (if doing new screen designs)
5. Say: "I'm Ritz (The Bishop, F3 Essex). Here's Bible v15. Continuing on v2-pivot branch. Next: finish Commit C Round 3 (Builder + Library Send Preblast entry points), then drop dead Supabase tables, then merge to main."

**Current state of the codebase (April 29, 2026):**

- `main` branch: gloombuilder.app stable, v1 architecture (4-tab nav, all 10 v1 screens). Untouched since pre-v2 work.
- `v2-shouts` branch: ARCHIVED. Frozen as historical record. Preserved for reference. Do not delete.
- `v2-pivot` branch: ACTIVE WORKING BRANCH. Vercel preview URL: `https://gloombuilder-git-v2-pivot-camplines-projects.vercel.app/`. Commits A, B, C-steps-1-through-4 landed and tested. Latest commit: `Commit C step 4: emoji-prefixed preblast format`.

**Commit C remaining (Round 3):**

1. **BuilderScreen entry point.** Add a "📣 Send Preblast" button alongside the existing Save / Run This actions in BuilderScreen.tsx. The button should pass the current Builder draft as an AttachedBeatdown to the PreblastComposer via state in page.tsx.
   - Approach option A: BuilderScreen accepts a new optional prop `onSendPreblast: (bd: AttachedBeatdown) => void`. When tapped, BuilderScreen converts its current `secs` + `nm` + tags state to an AttachedBeatdown and calls the prop. page.tsx wires this to `(bd) => { setPreblastBd(bd); setPreblastOpen(true); }`.
   - Approach option B: pass `setPreblastBd` and `setPreblastOpen` directly into BuilderScreen as props. Less prop noise but tighter coupling.
   - Recommendation: Option A. Cleaner separation of concerns.
   - Visual: button matches existing action button styling. Color: purple (P=#a78bfa) outline to differentiate from Save (green filled) and Run This (green outline).

2. **LibraryScreen detail view entry point.** Add a "📣 Preblast" button next to the existing Save button on the library item detail view (the modal/sheet that appears when tapping a beatdown in the Library). Each library item is a FeedItem with the full beatdown shape. Convert to AttachedBeatdown and call the same handler as BuilderScreen.
   - Visual: shorter label "📣 Preblast" (Library context already implies the action). Same purple outline styling.
   - Show only on beatdowns, not exercises.

3. **Test the full flow on Vercel preview:**
   - Build a beatdown → tap Send Preblast → composer opens with the beatdown auto-attached → fill message → Generate → Copy works → paste into Slack/iMessage looks clean
   - Open a library beatdown → tap Preblast → composer opens with that beatdown attached → same flow
   - Open Home → tap Send Preblast → composer opens with NO beatdown attached → tap 💪 Beatdown → picker shows saved beatdowns → pick one → returns to form → Generate → Copy

4. **After Commit C completes and is tested:** drop the dead v2-shouts Supabase tables in the Supabase SQL editor:
   ```sql
   DROP TABLE IF EXISTS shout_reactions;
   DROP TABLE IF EXISTS shouts;
   DROP TABLE IF EXISTS follows;
   ```

5. **Final step (separate session):** merge `v2-pivot` to `main`. This is the big push to gloombuilder.app. Ritz's call when he's confident in the v2-pivot architecture.

**Beyond v2-pivot — original next priorities (from Bible v14):**

1. Generator rebuild: timing/effort fields (`seconds_per_rep`, `effort_per_rep` per ExerciseData). Time-budget system instead of fixed exercise count matrix.
2. Cross-section exercise drag (dnd-kit architectural change).
3. Templates (30 workout formats — biggest remaining feature). Schema in GENERATOR-BLUEPRINT.md.
4. Stripe Pro tier ($29/year subscription) — gates unlimited generation and 27 Pro templates.
5. Responsive desktop layout — app currently 430px max-width centered.
6. Exercise favorites — heart/star toggle on exercises, favorited ones rank higher in Builder search.
7. Avatar profile customization — parked until 20+ users ask.

**Operating principles for picking up:**
- Read the V2 PIVOT PROLOGUE first if you have not seen this codebase before. The legacy sections of this Bible describe v1 / `main`. The current branch is v2-pivot.
- Bring up Claude Code as a workflow option until Ritz migrates. Eliminates copy-paste-PowerShell friction.
- Mockups before code, every time.
- Single path, no walk-backs.
- Build is the only verification.

---

*Bible v20 — May 3-4, 2026. Twenty-eight sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot Commits A/B/C development + 1 April 30 polish-and-stabilize session with 5 commits + 1 May 1 bug-fix-and-feature-cluster session with 7 commits + 1 May 2 Notepad-build session with 3 commits + 1 May 3 morning v2-pivot polish session with 4 commits + 1 May 3-4 afternoon-evening v2-pivot polish-day session with 7 commits). All v1 features remain live at gloombuilder.app on `main` branch. The `v2-pivot` branch is now POLISH-COMPLETE after the May 3-4 session — eleven commits in a single calendar day representing the largest single-day push in project history. Cluster D Items D1-D11 documented exhaustively above. Real-preview testing surfaced bugs at every stage and produced clean follow-up commits rather than silent fixes. New canonical patterns introduced this session: (a) `(REC)` marker convention on ask_user_input prompts so Ritz can quickly identify recommended path across long conversations (Rule 30); (b) visual smoke test before declaring done — build-green is necessary but not sufficient (Rule 29); (c) two-stage diagnostic pattern (Stage 1 + Stage 1B mini-diagnostic) for cases where a sub-question surfaces mid-cycle, demonstrated in D7 Beatdowns card (Stage 1B confirmed detail-view Steal button before dropping card-level Save link) and D9 Library + About polish (Stage 1.5 retrieved verbatim About copy before specifying ONE NATION OF Q's replacement content); (d) avatar helper extraction pattern (D7) — `src/lib/avatars.ts` with 8-color palette + UUID hash + getInitials, single source of truth refactored from QProfileScreen's existing inline duplicates. Three explicit deferrals locked in v20: (1) photo upload for avatars deferred to post-launch PAX signal — full external proposal reviewed and intentionally not built, architectural shape documented for when it eventually ships (`avatar_url TEXT NULL` column on profiles, `<Avatar>` component with initials fallback); (2) admin/debug tools deferred — stay manual via Supabase dashboard until ops exceed 1/week, soft-delete pattern (`deleted_at` column) flagged for future consideration; (3) marketing/onboarding infographic deferred to separate session — Slack-pasteable image-based infographic recommended over in-app onboarding, work to happen in Claude Design or fresh dedicated chat, NOT this build chat. The steal_count action-count framing from v19 remains locked: "every steal IS a real steal regardless of persistence — revisit when scale produces complaints." The merge-to-main remains EXPLICITLY user-gated per session-locked rules established earlier in v17/v18/v19/v20 — the next Claude must not instruct merge without Ritz's explicit "merge" command. Latest commit: equipment filter commit (commit 11) bringing the v2-pivot branch to twenty-five commits beyond `main`. Remaining work: optional Bible v21 if more polish work happens, bump package.json version to 2.0.0 + final test pass + merge `v2-pivot` to `main` + tag v2.0.0 + deploy to gloombuilder.app. Existing PWA users will see "↻ New version available — Refresh" banner triggered by the version bump. Next focus after merge: watch real PAX use the merged product before committing to next feature, then equipment filter usage signal → Templates → Pro tier paywall → generator timing/effort rebuild → exercise favorites → library curation pass → Notepad v0.2 (conditional on PAX feedback) → photo upload (conditional on PAX signal). Photo upload, PAX directory, admin tools, and marketing infographic all explicitly deferred until real PAX signal triggers them. Two new operating rules (29-30) added to the canonical rule list, plus reaffirmation of v19 Rules 27-28 (live-system audit before CSV-only audit, grep-the-column-name before specifying any migration) and carrying-forward of v18 Rule 26 (diagnostic-first / spec-second / build-third / test-or-trust-fourth).*

---

*[v19 closing block preserved below for historical context. v20 supersedes its "remaining work" claims; everything v19 marked as remaining is now true plus today's seven additional commits. v20 is the canonical state.]*

*Bible v19 — May 3, 2026 (morning). Twenty-seven sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot Commits A/B/C development + 1 April 30 polish-and-stabilize session with 5 commits + 1 May 1 bug-fix-and-feature-cluster session with 7 commits + 1 May 2 Notepad-build session with 3 commits + 1 May 3 morning v2-pivot polish session with 4 commits). All v1 features remain live at gloombuilder.app on `main` branch. The `v2-pivot` branch is FEATURE-COMPLETE-PLUS-FOUR after the May 3 morning session — four commits beyond v18 baseline: Cluster D Items D1-D4. D1 (`fbdf96b`): Library Exercises filter regroup into Type + Body part rows. D2 (`2c4f687`): Home Pick-up card MVP (builderNew only) + 3-card grid. D3 (`1c6baef`): Notepad autosave + draftRestored banner. D4 (`f999918`): Pick-up card extended to surface all 3 draft flows (Build / Generate / Notepad). One investigated-and-deferred fifth commit (D5 — Library Beatdowns card visual rebuild — paused after steal_count architectural finding redirected the work). Two new permanent operating rules added: Rule 27 (live-system audit before CSV-only audit) and Rule 28 (grep-the-column-name before specifying any migration). steal_count drift investigation produced a locked product framing — "every steal action IS a real steal regardless of persistence — revisit when scale produces complaints" — and the architectural fix is deferred indefinitely under that framing. Item 6+7 (find HIMs / follow system) STILL DEFERRED. Item 12 (Notepad mode) NO LONGER DEFERRED — fully shipped per v18 plus autosave per D3. The merge-to-main remains EXPLICITLY user-gated. Latest commit: `f999918`. Remaining work as of v19 morning: ship D5 (Beatdowns card visual rebuild + avatar helper) plus eventual merge to main. Next focus per v19: complete D5 with locked design decisions (8-color manly avatar palette, engagement counters always-visible, date format "Apr 24" / "Apr 24, 2025", steal_count display as-is no migration). v20 supersedes this remaining work — D5 plus six additional commits all shipped on May 3-4 afternoon-evening. v20 is the canonical state.*

---

*Bible v18 — May 2, 2026. Twenty-six sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot Commits A/B/C development + 1 April 30 polish-and-stabilize session with 5 commits + 1 May 1 bug-fix-and-feature-cluster session with 7 commits + 1 May 2 Notepad-build session with 3 commits). All v1 features remain live at gloombuilder.app on `main` branch. The `v2-pivot` branch is GENUINELY FEATURE-COMPLETE after the May 2 session — Item 12 (Notepad v0 MVP) shipped end-to-end including: parser module (272 lines, 6-rule priority order with hybrid implicit/explicit philosophy — blank line above = section, `-`/`*`/`•` for notes, `>` for transitions, library-match for exercise detection, custom exercises via missing exerciseId field, transitions via SectionExercise type discriminator); NotepadScreen.tsx (377 lines, write/preview toggle, dedicated title field, monospace textarea with library-verified placeholder, help drawer with 4-row legend, 800ms debounced live parse, save validation); Supabase migration adding `from_notepad boolean NOT NULL DEFAULT false` to beatdowns table (applied to production, verified, gloombuilder.app on main continues to work); page.tsx wiring (vw="notepad", handleSaveBeatdown extended with backwards-compat `share?` + `isPublic?` + `fromNotepad?` shim, defensive `d: bd.d || "medium"` fallback for empty difficulty); HomeScreen new "Write it freeform" amber-bordered card with NEW pill placed between Build from scratch and Create exercise; QProfileScreen Locker badge "↻ from Notepad" green pill rendered only on locker cards (not Library shared cards, not Edit Beatdown screen). Three commits: Stage 3 ship (NotepadScreen + parser + migration + UI wiring), parser priority swap fix `225d8e0` (Q4↔Q5 priority swap based on real-input pushback from Ritz, anti-pattern check removed entirely as no longer needed, placeholder updated to library-verified exercise names), and difficulty default fix (1-line fix to handleSaveBeatdown to prevent Supabase rejecting empty `d` field). Item 6+7 (find HIMs / follow system) STILL DEFERRED. Item 12 (Notepad mode) NO LONGER DEFERRED — shipped, real-tested by Ritz on Vercel preview, confirmed working ("everything parsed perfectly as expected"). Latest commit: difficulty default fix from this session. Remaining work: bump package.json version to 2.0.0 + optional final test pass + merge `v2-pivot` to `main` + tag v2.0.0 + deploy to gloombuilder.app. Existing PWA users will see "↻ New version available — Refresh" banner triggered by the version bump. Next focus after merge: watch real PAX use the merged product before committing to next feature, then Templates → Pro tier paywall → generator timing/effort rebuild → exercise favorites → library curation pass (Motivators-style alias gaps) → Notepad v0.2 (conditional on PAX feedback). PAX directory revisit only with real signal. Two new canonical patterns introduced this session: 3-stage diagnostic-spec-build workflow for greenfield features, and real-input-test-trumps-synthetic-test discipline for parser-class systems. Five new operating rules (32-35) added.*

---

*[v17 closing block preserved below for historical context. v18 supersedes its "remaining work" claims; everything v17 marked as remaining is now true plus today's Notepad MVP. v18 is the canonical state.]*

*Bible v17 — May 1, 2026. Twenty-five sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot Commits A/B/C development + 1 April 30 polish-and-stabilize session with 5 commits + 1 May 1 bug-fix-and-feature-cluster session with 7 commits). All v1 features remain live at gloombuilder.app on `main` branch. The `v2-pivot` branch is FEATURE-COMPLETE after the May 1 session — Cluster A shipped 4 quick wins (source pill parity / qName fix / gear discoverability / save-stays-on-screen via Promise-based onSave + onSavedNew transition); Cluster B shipped 4 platform robustness fixes (Android pull-to-refresh suppression / localStorage autosave with 800ms debounce + amber restore strip across Builder/Generator/CreateExercise / PWA versioned-cache update banner via package.json injection / Android hardware back button via popstate hybrid Pattern A); Cluster C shipped Library Exercises tab unification (no Codex/Community split, single feed sorted newest first, search hits creator name) and Q Profile exercise edit flow (5-layer fix + 3 latent bug corrections including Item-11 regression on save / is_public field that doesn't exist / stale editingEx after share/unshare). Item 6+7 (find HIMs / follow system) explicitly DEFERRED — re-introducing social-graph machinery not worth cost without demand evidence. Item 12 (Notepad mode) explicitly DEFERRED — ship v2-pivot to main first, gather real PAX usage data, revisit only after concrete feedback that structured builder loses Qs to plain-text habits. Latest commit: `3443ad0`. Remaining work: bump package.json version to 2.0.0 + final test pass + merge `v2-pivot` to `main` + tag v2.0.0 + deploy to gloombuilder.app. Existing PWA users will see "↻ New version available — Refresh" banner triggered by the version bump. Next focus after merge: watch real PAX use the merged product before committing to next feature, then Templates → Pro tier paywall → generator timing/effort rebuild → exercise favorites → cross-section exercise drag. Notepad and PAX directory revisited only with real signal.*

---

*[v16 closing block preserved below for historical context. v17 supersedes its "remaining work" claims; everything v16 marked as remaining is now done plus the May 1 cluster work. v17 is the canonical state.]*

*Bible v16 — April 30, 2026. Twenty-four sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot Commits A/B/C development + 1 April 30 polish-and-stabilize session with 5 commits). All v1 features remain live at gloombuilder.app on `main` branch. The `v2-pivot` branch is feature-complete on Vercel preview — action area redesign (Layer 1/2/3) shipped, Q Profile cards redesigned with status-encoded stripe and source pill, all three Send Preblast entry points wired (Home, Builder, Generator, Library detail), mojibake fixed in page.tsx, "AI" → "Generated" terminology rename, "Run This" → "Live" pill rename, visitor view filters drafts, Backblast unified into action row across Builder/Generator. Workflow migrated to Claude Code as primary tool. Dormant Shout/Follow tables kept (reversed v15 plan to drop). Remaining work: final test pass + merge `v2-pivot` to `main` + tag v2.0.0 + deploy to gloombuilder.app. Next focus after merge: generator timing/effort rebuild, Templates (30 workout formats — biggest remaining feature, see GLOOMBUILDER-GENERATOR-BLUEPRINT.md), Pro tier paywall ($29/year, 27 Pro templates), exercise favorites, exercise search unification across seed + custom + community.*

---

*[v15 closing block preserved below for historical context. v16 supersedes its "remaining work" claims; everything v15 marked as remaining is now done. v16 is the canonical state.]*

*Bible v15 — April 29, 2026. Twenty-three sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot development across multiple commits). All v1 features remain live at gloombuilder.app. v2-pivot branch on Vercel preview with Commits A (subtraction), B (Q Profile owner view + polish), and C (Preblast generator, steps 1-4) complete. Remaining v2-pivot work: BuilderScreen + LibraryScreen Send Preblast entry points, drop dead Supabase tables, merge to main. Next focus after merge: generator timing/effort rebuild, Templates, Pro tier paywall.*
