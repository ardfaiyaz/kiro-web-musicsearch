export default function PlaylistsLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-7 w-48 animate-pulse rounded-md bg-border" />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-36 animate-pulse rounded-md bg-border" />
          <div className="mt-2 h-5 w-56 animate-pulse rounded-md bg-border" />
        </div>

        <div className="mb-8 flex gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-xl bg-border" />
          <div className="h-10 w-20 animate-pulse rounded-xl bg-border" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-border" />
                <div>
                  <div className="h-5 w-32 animate-pulse rounded-md bg-border" />
                  <div className="mt-1 h-4 w-20 animate-pulse rounded-md bg-border" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
