import { SkeletonCard, SkeletonText } from "@/app/components/Skeleton";

export default function DiscoverLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <SkeletonText width="w-48" className="h-6" />
            <div className="flex gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-border" aria-hidden="true" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-border" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Title skeleton */}
        <section className="mb-8" aria-label="Loading">
          <SkeletonText width="w-56" className="h-8 mb-3" />
          <SkeletonText width="w-80" className="h-4" />
        </section>

        {/* Trending songs skeleton */}
        <section className="mb-10" aria-label="Loading trending">
          <SkeletonText width="w-40" className="h-6 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 shrink-0 sm:w-48">
                <SkeletonCard />
              </div>
            ))}
          </div>
        </section>

        {/* New releases skeleton */}
        <section className="mb-10" aria-label="Loading releases">
          <SkeletonText width="w-36" className="h-6 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 shrink-0 sm:w-48">
                <SkeletonCard />
              </div>
            ))}
          </div>
        </section>

        {/* Featured albums skeleton */}
        <section className="mb-10" aria-label="Loading albums">
          <SkeletonText width="w-44" className="h-6 mb-4" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>

        {/* Genre skeleton */}
        <section className="mb-10" aria-label="Loading genres">
          <SkeletonText width="w-40" className="h-6 mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-border sm:h-32"
                aria-hidden="true"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
