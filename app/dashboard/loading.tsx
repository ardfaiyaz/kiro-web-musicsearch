export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-7 w-48 animate-pulse rounded-md bg-border" />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-40 animate-pulse rounded-md bg-border" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-border" />
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-border" />
                <div>
                  <div className="h-7 w-12 animate-pulse rounded-md bg-border" />
                  <div className="mt-1 h-4 w-24 animate-pulse rounded-md bg-border" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 h-6 w-32 animate-pulse rounded-md bg-border" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    <div className="h-4 w-24 animate-pulse rounded-md bg-border" />
                    <div className="mt-1 h-6 w-40 animate-pulse rounded-md bg-border" />
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
