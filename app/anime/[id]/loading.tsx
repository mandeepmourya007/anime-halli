import Container from "@/components/layout/Container";
import Skeleton from "@/components/ui/Skeleton";

export default function AnimeDetailLoading() {
  return (
    <Container className="space-y-8 py-8">
      <Skeleton className="h-64 w-full rounded-squircle-lg sm:h-80 md:h-96" />

      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="aspect-video w-full rounded-squircle-lg" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </Container>
  );
}
