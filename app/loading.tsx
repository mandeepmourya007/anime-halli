import Container from "@/components/layout/Container";
import Skeleton from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <Container className="space-y-8 py-8">
      <Skeleton className="h-64 w-full rounded-squircle-lg sm:h-80 md:h-96" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-64" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    </Container>
  );
}
