// Browser-only draft persistence. Survives backgrounding, tab reload, phone interruptions.
// Does not survive: clearing browser data, switching devices/browsers.

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
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, data: T): void {
  try {
    const envelope: DraftEnvelope<T> = { data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Silent fail — Safari private mode, quota exceeded, etc.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
}

export function formatTimeAgo(savedAt: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - savedAt) / 1000);
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
