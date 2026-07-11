import { cn } from "@/lib/utils/format";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-squircle-sm bg-white/8",
        className,
      )}
    />
  );
}
