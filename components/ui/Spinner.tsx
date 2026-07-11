import { cn } from "@/lib/utils/format";

export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-neon-cyan",
        className,
      )}
    />
  );
}
