export default function DashboardLoading() {
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-border" aria-hidden="true" />
          <div className="mt-3 h-5 w-72 animate-pulse rounded-lg bg-border" aria-hidden="true" />
        </div>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-border" aria-hidden="true" />
                <div>
                  <div className="h-8 w-12 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-6 h-6 w-32 animate-pulse rounded-lg bg-border" aria-hidden="true" />
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    <div className="h-4 w-24 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                    <div className="mt-2 h-6 w-40 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
