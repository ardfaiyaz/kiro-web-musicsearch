export default function TrackLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-6 w-24 animate-pulse rounded bg-border" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12" role="status" aria-label="Loading track details">
          {/* Artwork skeleton */}
          <div className="shrink-0">
            <div className="mx-auto aspect-square w-full max-w-sm animate-pulse rounded-2xl bg-border lg:w-80" />
          </div>

          {/* Details skeleton */}
          <div className="flex flex-1 flex-col gap-6">
            <div className="space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded bg-border" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-border" />
                  <div className="h-4 w-32 animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>

            <div className="h-14 w-64 animate-pulse rounded-xl bg-border" />
          </div>
        </div>

        {/* Recommendations skeleton */}
        <div className="mt-12">
          <div className="mb-6 h-6 w-48 animate-pulse rounded bg-border" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border">
                <div className="aspect-square w-full animate-pulse bg-border" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
