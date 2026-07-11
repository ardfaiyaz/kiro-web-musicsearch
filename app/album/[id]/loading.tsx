export default function AlbumLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-5 w-16 animate-pulse rounded-lg bg-border" aria-hidden="true" />
              <div className="h-7 w-20 animate-pulse rounded-lg bg-border" aria-hidden="true" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-8 animate-pulse rounded-full bg-border sm:w-20" aria-hidden="true" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {/* Hero skeleton */}
        <div className="bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
              <div className="mx-auto aspect-square w-full max-w-xs animate-pulse rounded-2xl bg-border lg:w-72" aria-hidden="true" />
              <div className="flex flex-1 flex-col gap-4">
                <div className="h-10 w-64 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                <div className="h-5 w-40 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="h-3 w-12 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                      <div className="h-4 w-20 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Track listing skeleton */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 h-7 w-36 animate-pulse rounded-lg bg-border" aria-hidden="true" />
          <div className="overflow-hidden rounded-2xl border border-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border/50 px-5 py-4 last:border-b-0"
              >
                <div className="h-4 w-6 animate-pulse rounded bg-border" aria-hidden="true" />
                <div className="h-4 w-48 flex-1 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                <div className="h-4 w-12 animate-pulse rounded bg-border" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
