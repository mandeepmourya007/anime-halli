import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/format";

export default function GradientText({
  children,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={cn("gradient-text", className)}>{children}</Tag>;
}
