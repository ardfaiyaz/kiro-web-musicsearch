import { SkeletonText } from "@/app/components/Skeleton";

export default function AlbumLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <SkeletonText width="w-16" />
            <SkeletonText width="w-48" className="h-6" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Album Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="mx-auto aspect-square w-full max-w-xs animate-pulse rounded-2xl bg-border lg:w-72" />
          <div className="flex flex-1 flex-col gap-4">
            <SkeletonText width="w-64" className="h-8" />
            <SkeletonText width="w-40" className="h-5" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <SkeletonText width="w-12" className="h-3" />
                <SkeletonText width="w-16" />
              </div>
              <div className="flex flex-col gap-1">
                <SkeletonText width="w-12" className="h-3" />
                <SkeletonText width="w-20" />
              </div>
              <div className="flex flex-col gap-1">
                <SkeletonText width="w-12" className="h-3" />
                <SkeletonText width="w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Track Listing */}
        <div className="mt-10">
          <SkeletonText width="w-36" className="mb-4 h-6" />
          <div className="overflow-hidden rounded-xl border border-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
              >
                <SkeletonText width="w-6" className="h-4" />
                <SkeletonText width="w-48" className="flex-1" />
                <SkeletonText width="w-12" className="h-4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
