"use client";

import ShimmerSkeleton from "@/app/components/ShimmerSkeleton";

export default function FavoriteArtistsSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading favorite artists">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden rounded-3xl">
        <ShimmerSkeleton shape="rectangle" height="220px" className="w-full" />
      </div>

      {/* Statistics Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerSkeleton key={i} shape="rectangle" height="80px" className="rounded-2xl" />
        ))}
      </div>

      {/* Search/Filter Bar Skeleton */}
      <div className="flex flex-wrap gap-3">
        <ShimmerSkeleton shape="rectangle" width="240px" height="44px" className="rounded-xl" />
        <ShimmerSkeleton shape="rectangle" width="100px" height="44px" className="rounded-xl" />
        <ShimmerSkeleton shape="rectangle" width="100px" height="44px" className="rounded-xl" />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 rounded-2xl p-4">
            <ShimmerSkeleton shape="circle" width="96px" height="96px" />
            <ShimmerSkeleton shape="line" width="80%" height="14px" />
            <ShimmerSkeleton shape="line" width="60%" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}
