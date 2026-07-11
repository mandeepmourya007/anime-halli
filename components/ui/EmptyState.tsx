import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

export default function EmptyState({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-squircle px-6 py-16 text-center text-white/60", className)}>
      {children}
    </div>
  );
}
