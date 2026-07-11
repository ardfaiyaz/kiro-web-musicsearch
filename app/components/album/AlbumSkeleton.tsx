export default function AlbumSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true" aria-label="Loading album">
      {/* Hero skeleton */}
      <section className="relative min-h-[70vh] overflow-hidden bg-card">
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end lg:gap-12">
            {/* Artwork skeleton */}
            <div className="mx-auto aspect-square w-full max-w-xs shimmer-wave rounded-2xl bg-border lg:max-w-sm" />

            {/* Info skeleton */}
            <div className="flex flex-1 flex-col items-center gap-6 lg:items-start">
              {/* Title */}
              <div className="space-y-3 w-full max-w-md">
                <div className="h-10 w-3/4 shimmer-wave rounded-xl bg-border" />
                <div className="h-6 w-1/2 shimmer-wave rounded-lg bg-border" />
              </div>

              {/* Genre tags */}
              <div className="flex gap-2">
                <div className="h-7 w-20 shimmer-wave rounded-full bg-border" />
                <div className="h-7 w-16 shimmer-wave rounded-full bg-border" />
              </div>

              {/* Metadata */}
              <div className="flex gap-4">
                <div className="h-4 w-12 shimmer-wave rounded bg-border" />
                <div className="h-4 w-20 shimmer-wave rounded bg-border" />
                <div className="h-4 w-16 shimmer-wave rounded bg-border" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <div className="h-12 w-36 shimmer-wave rounded-full bg-border" />
                <div className="h-12 w-28 shimmer-wave rounded-xl bg-border" />
                <div className="h-12 w-24 shimmer-wave rounded-xl bg-border" />
              </div>

              {/* Stats */}
              <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 shimmer-wave rounded-xl bg-border"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracklist skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-7 w-32 shimmer-wave rounded-lg bg-border mb-6" />
        <div className="overflow-hidden rounded-2xl border border-border/50">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border/30 px-5 py-3 last:border-b-0"
            >
              <div className="h-5 w-5 shimmer-wave rounded bg-border" />
              <div className="hidden h-10 w-10 shimmer-wave rounded-lg bg-border sm:block" />
              <div className="h-4 flex-1 shimmer-wave rounded bg-border max-w-[200px]" />
              <div className="hidden h-4 w-12 shimmer-wave rounded bg-border sm:block" />
              <div className="h-8 w-8 shimmer-wave rounded-full bg-border" />
            </div>
          ))}
        </div>
      </div>

      {/* Details skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-6 w-40 shimmer-wave rounded-lg bg-border mb-6" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 shimmer-wave rounded-xl bg-border"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
