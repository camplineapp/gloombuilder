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

// Color for a user's avatar based on their UUID. If isOwn is true, returns
// the brand green (#22c55e) so the current user's avatar visually anchors
// to "you" across the app.
export function colorForUserId(id: string, isOwn: boolean = false): string {
  if (isOwn) return "#22c55e";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Initials from f3_name. Returns up to 2 uppercase characters.
// Falls back to "?" for empty / null / whitespace-only input.
export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "?";
  const initials = name.trim().split(/\s+/).map(w => (w[0] || "").toUpperCase()).join("");
  return initials.slice(0, 2) || "?";
}
