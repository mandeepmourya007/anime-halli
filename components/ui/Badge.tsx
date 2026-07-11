import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

type BadgeVariant = "default" | "score" | "outline";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white/80 border border-white/10",
  score: "bg-gradient-to-r from-neon-magenta/30 to-neon-violet/30 text-white border border-white/15",
  outline: "border border-white/20 text-white/70",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-squircle-sm px-2.5 py-1 text-xs font-medium backdrop-blur-md",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
