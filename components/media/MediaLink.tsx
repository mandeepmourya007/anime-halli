import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Every link into the detail route (`/anime/[id]`) goes through here with
 * prefetch disabled — that route's data fetch hits 2-3 rate-limited external
 * APIs (TMDB, Watchmode; see `lib/http/rate-limiter.ts`), and Next's default
 * viewport prefetching queues up badly once a whole grid of cards prefetches
 * at once on a real network. A real click still fetches on navigation as
 * normal — only the speculative prefetch is skipped.
 */
export default function MediaLink({
  id,
  ...props
}: { id: string } & Omit<ComponentProps<typeof Link>, "href" | "prefetch">) {
  return <Link href={`/anime/${id}`} prefetch={false} {...props} />;
}
