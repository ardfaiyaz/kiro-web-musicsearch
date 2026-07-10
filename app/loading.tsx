export default function Loading() {
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
        <div className="flex flex-col items-center gap-8 py-16">
          <div className="h-12 w-72 animate-pulse rounded-lg bg-border" aria-hidden="true" />
          <div className="h-6 w-96 animate-pulse rounded-lg bg-border" aria-hidden="true" />
          <div className="h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-border" aria-hidden="true" />
        </div>
      </main>
    </div>
  );
}
