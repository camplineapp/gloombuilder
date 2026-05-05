"use client";

interface ThumbsUpIconProps {
  size?: number;
  filled?: boolean;
  color?: string;
}

/**
 * Inline thumbs-up SVG. Replaces the old ▲ vote glyph everywhere.
 * Renders identically across all OS/browsers (no emoji rendering issues).
 * Inherits color via `currentColor` — wrap in any colored container to inherit.
 *
 * Usage:
 *   <ThumbsUpIcon size={14} />                    // outlined, inherits parent color
 *   <ThumbsUpIcon size={14} filled />             // filled, inherits parent color
 *   <ThumbsUpIcon size={14} color="#22c55e" />    // explicit color override
 */
export default function ThumbsUpIcon({
  size = 14,
  filled = false,
  color = "currentColor",
}: ThumbsUpIconProps) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{ display: "inline-block", verticalAlign: "middle" }}
        aria-hidden="true"
      >
        <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z" />
      </svg>
    );
  }

  // Outlined version — for not-yet-voted state
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-hidden="true"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}
