export default function TrackLoading() {
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

      <main className="flex-1">
        {/* Hero skeleton */}
        <div className="bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12" role="status" aria-label="Loading track details">
              <div className="shrink-0">
                <div className="mx-auto aspect-square w-full max-w-sm animate-pulse rounded-2xl bg-border lg:w-80" aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col gap-6">
                <div className="space-y-3">
                  <div className="h-10 w-3/4 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                  <div className="h-5 w-1/2 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-16 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                      <div className="h-4 w-32 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                    </div>
                  ))}
                </div>
                <div className="h-16 w-full animate-pulse rounded-2xl bg-border" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations skeleton */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 h-7 w-48 animate-pulse rounded-lg bg-border" aria-hidden="true" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border">
                <div className="aspect-square w-full animate-pulse bg-border" aria-hidden="true" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                  <div className="h-3 w-1/2 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
