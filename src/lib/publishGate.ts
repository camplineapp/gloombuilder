// src/lib/publishGate.ts
//
// Quality gate for sharing beatdowns publicly to the Library.
// Returns ok:true when both the beatdown content AND the author's
// profile meet the bar; otherwise returns separate missing-field
// lists so the UI can route users to the right fix.
//
// Reverses Bible v16's "no friction on private→public" policy
// after May 2026 spike in low-effort Generator-shared beatdowns
// (3 garbage rows force-unshared, all generated=true, all with
// default or date-only titles).

export interface BeatdownGateInput {
  name: string | null | undefined;
  description: string | null | undefined;
  site_features: string[] | null | undefined;
  sections: Array<{ exercises?: unknown[] }> | null | undefined;
}

export interface ProfileGateInput {
  f3_name: string | null | undefined;
  ao: string | null | undefined;
  state: string | null | undefined;
  region: string | null | undefined;
}

export type PublishCheck =
  | { ok: true }
  | { ok: false; bd_missing: string[]; profile_missing: string[] };

// Months that should NOT count as content words in a title
const MONTH_RE =
  /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(uary|ruary|ch|il|e|y|ust|tember|tober|ember)?$/i;

// Numeric / date-separator tokens that should NOT count as content
const NUMERIC_DATE_RE = /^\d{1,4}([\/\-\.]\d{1,4})*$/;
const YEAR_RE = /^(19|20)\d{2}$/;

function countContentWords(title: string): number {
  return title
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .filter(
      (w) =>
        !MONTH_RE.test(w) &&
        !NUMERIC_DATE_RE.test(w) &&
        !YEAR_RE.test(w)
    ).length;
}

export function canPublish(
  bd: BeatdownGateInput,
  profile: ProfileGateInput
): PublishCheck {
  const bd_missing: string[] = [];
  const profile_missing: string[] = [];

  // ── Beatdown checks ──
  const title = (bd.name ?? "").trim();
  if (!title) {
    bd_missing.push("Title");
  } else if (/^generated beatdown$/i.test(title)) {
    bd_missing.push('Real title (not "Generated Beatdown")');
  } else if (title.length < 3) {
    bd_missing.push("Title (3+ characters)");
  } else if (countContentWords(title) === 0) {
    bd_missing.push("Real title (not just a date)");
  }

  const desc = (bd.description ?? "").trim();
  if (!desc) {
    bd_missing.push("Description");
  } else if (desc.length < 10) {
    bd_missing.push("Description (10+ characters)");
  }

  const sites = bd.site_features ?? [];
  if (sites.length === 0) {
    bd_missing.push("AO or location");
  }

  const sections = bd.sections ?? [];
  const totalExercises = sections.reduce(
    (n, s) => n + (Array.isArray(s.exercises) ? s.exercises.length : 0),
    0
  );
  if (sections.length < 1) bd_missing.push("At least 1 section");
  if (totalExercises < 3) bd_missing.push("At least 3 exercises");

  // ── Profile checks ──
  if (!profile.f3_name?.trim()) profile_missing.push("F3 name");
  if (!profile.ao?.trim()) profile_missing.push("AO");
  if (!profile.state?.trim()) profile_missing.push("State");
  if (!profile.region?.trim()) profile_missing.push("Region");

  if (bd_missing.length === 0 && profile_missing.length === 0) {
    return { ok: true };
  }
  return { ok: false, bd_missing, profile_missing };
}
