import {
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
} from "@/app/components/Skeleton";

export default function ArtistLoading() {
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
        {/* Artist Header */}
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <SkeletonCircle size="h-40 w-40 sm:h-48 sm:w-48" />
          <div className="flex flex-col gap-3">
            <SkeletonText width="w-64" className="h-8" />
            <SkeletonText width="w-32" className="h-5" />
            <div className="flex gap-4">
              <SkeletonText width="w-24" className="h-4" />
              <SkeletonText width="w-24" className="h-4" />
            </div>
            <div className="flex gap-2">
              <SkeletonText width="w-16" className="h-6 rounded-full" />
              <SkeletonText width="w-20" className="h-6 rounded-full" />
              <SkeletonText width="w-14" className="h-6 rounded-full" />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-10">
          <SkeletonText width="w-24" className="mb-4 h-6" />
          <SkeletonText width="w-full" className="mb-2" />
          <SkeletonText width="w-full" className="mb-2" />
          <SkeletonText width="w-3/4" />
        </div>

        {/* Top Songs */}
        <div className="mt-10">
          <SkeletonText width="w-32" className="mb-6 h-6" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
