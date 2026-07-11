import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/format";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  sheen?: boolean;
  hoverGlow?: boolean;
}

export default function GlassCard({
  children,
  className,
  as: Tag = "div",
  sheen = true,
  hoverGlow = false,
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass rounded-squircle",
        sheen && "glass-sheen",
        hoverGlow && "neon-glow-hover",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
