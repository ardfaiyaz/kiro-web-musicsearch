export default function PlaylistsLoading() {
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

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-10 w-36 animate-pulse rounded-lg bg-border" aria-hidden="true" />
          <div className="mt-3 h-5 w-56 animate-pulse rounded-lg bg-border" aria-hidden="true" />
        </div>

        <div className="mb-10 flex gap-3">
          <div className="h-12 flex-1 animate-pulse rounded-2xl bg-border" aria-hidden="true" />
          <div className="h-12 w-24 animate-pulse rounded-2xl bg-border" aria-hidden="true" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-border" aria-hidden="true" />
                <div>
                  <div className="h-5 w-32 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                  <div className="mt-2 h-4 w-20 animate-pulse rounded-lg bg-border" aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
