# GLOOMBUILDER BIBLE v16
## Complete Product & Design Truth Document
### April 30, 2026 — V2-PIVOT STABILIZED EDITION

*This document supersedes Bible v15 (April 29, 2026). All v15 content is preserved verbatim. v16 adds: (1) a comprehensive April 30, 2026 SESSION RECAP at the top — five commits' worth of polish work that took v2-pivot from "Commit C step 4 done" to "feature-complete and ready for merge"; (2) the workflow migration to Claude Code documented as complete; (3) the decision to KEEP the dormant Shout/Follow Supabase tables (reversing v15's plan to drop them); (4) a new canonical action area pattern (Layer 1 / Layer 2 / Layer 3) that applies across BuilderScreen, GeneratorScreen, and LibraryScreen detail; (5) a redesigned Q Profile card spec with status-encoded left stripe, source pill, asymmetric footer, and visitor draft filtering; (6) an "AI" → "Generated" terminology rename; (7) "Run This" → "Live" pill label rename; (8) full UTF-8 mojibake fix in page.tsx. Production at gloombuilder.app remains stable on `main` (v1 architecture, 4-tab nav). The `v2-pivot` branch is feature-complete on Vercel preview. The next session's work is a final test pass + the merge from `v2-pivot` to `main`.*

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

*Bible v16 — April 30, 2026. Twenty-four sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot Commits A/B/C development + 1 April 30 polish-and-stabilize session with 5 commits). All v1 features remain live at gloombuilder.app on `main` branch. The `v2-pivot` branch is feature-complete on Vercel preview — action area redesign (Layer 1/2/3) shipped, Q Profile cards redesigned with status-encoded stripe and source pill, all three Send Preblast entry points wired (Home, Builder, Generator, Library detail), mojibake fixed in page.tsx, "AI" → "Generated" terminology rename, "Run This" → "Live" pill rename, visitor view filters drafts, Backblast unified into action row across Builder/Generator. Workflow migrated to Claude Code as primary tool. Dormant Shout/Follow tables kept (reversed v15 plan to drop). Remaining work: final test pass + merge `v2-pivot` to `main` + tag v2.0.0 + deploy to gloombuilder.app. Next focus after merge: generator timing/effort rebuild, Templates (30 workout formats — biggest remaining feature, see GLOOMBUILDER-GENERATOR-BLUEPRINT.md), Pro tier paywall ($29/year, 27 Pro templates), exercise favorites, exercise search unification across seed + custom + community.*

---

*[v15 closing block preserved below for historical context. v16 supersedes its "remaining work" claims; everything v15 marked as remaining is now done. v16 is the canonical state.]*

*Bible v15 — April 29, 2026. Twenty-three sessions complete (2 design + 18 v1 development + 3 v2-shouts development + 1 v2-pivot development across multiple commits). All v1 features remain live at gloombuilder.app. v2-pivot branch on Vercel preview with Commits A (subtraction), B (Q Profile owner view + polish), and C (Preblast generator, steps 1-4) complete. Remaining v2-pivot work: BuilderScreen + LibraryScreen Send Preblast entry points, drop dead Supabase tables, merge to main. Next focus after merge: generator timing/effort rebuild, Templates, Pro tier paywall.*
