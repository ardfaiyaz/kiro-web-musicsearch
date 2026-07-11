export default function DiscoverLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="h-7 w-20 animate-pulse rounded-lg bg-border" aria-hidden="true" />
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
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:gap-12">
              <div className="aspect-square w-48 animate-pulse rounded-2xl bg-border sm:w-56 lg:w-64" aria-hidden="true" />
              <div>
                <div className="h-4 w-24 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                <div className="mt-3 h-10 w-64 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                <div className="mt-2 h-5 w-40 animate-pulse rounded-lg bg-border" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Section skeleton */}
          <section className="mb-16">
            <div className="mb-6 h-7 w-48 animate-pulse rounded-lg bg-border" aria-hidden="true" />
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-44 shrink-0 sm:w-52">
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="aspect-square w-full animate-pulse bg-border" aria-hidden="true" />
                    <div className="p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <div className="mb-6 h-7 w-40 animate-pulse rounded-lg bg-border" aria-hidden="true" />
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-square w-full animate-pulse bg-border" aria-hidden="true" />
                  <div className="p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
