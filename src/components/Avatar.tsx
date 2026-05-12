"use client";
import { colorForUserId, getInitials } from "@/lib/avatars";

interface AvatarProps {
  userId: string;
  name: string;
  size: number;
  isOwn?: boolean;
  avatarUrl?: string | null;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Avatar({
  userId,
  name,
  size,
  isOwn = false,
  avatarUrl: _avatarUrl,
  onClick,
}: AvatarProps) {
  const color = colorForUserId(userId || name, isOwn);
  const initials = getInitials(name);

  // Size tiers govern border width, bg/border alpha, font size/weight.
  // ≥80: heavy ring (2px solid). 43-79: faint ring (1.5px). ≤42: thin ring (1px).
  let borderWidth: number;
  let bgOpacityHex: string;
  let borderColor: string;
  let fontSize: number;
  let fontWeight: number;

  if (size >= 80) {
    borderWidth = 2;
    bgOpacityHex = "1f";
    borderColor = color;
    fontSize = Math.round(size * 0.35);
    fontWeight = 800;
  } else if (size >= 43) {
    borderWidth = 1.5;
    bgOpacityHex = "09";
    borderColor = color + "19";
    fontSize = Math.round(size * 0.33);
    fontWeight = 800;
  } else {
    borderWidth = 1;
    bgOpacityHex = "26";
    borderColor = color + "66";
    fontSize = Math.round(size * 0.36);
    fontWeight = 700;
  }

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: color + bgOpacityHex,
    border: `${borderWidth}px solid ${borderColor}`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Outfit', system-ui, sans-serif",
    fontSize,
    fontWeight,
    flexShrink: 0,
    letterSpacing: -0.5,
    cursor: onClick ? "pointer" : undefined,
  };

  return (
    <div style={style} onClick={onClick}>{initials}</div>
  );
}
