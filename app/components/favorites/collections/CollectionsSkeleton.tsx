"use client";

import ShimmerSkeleton from "@/app/components/ShimmerSkeleton";

export default function CollectionsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true" aria-label="Loading collections">
      {/* Hero skeleton */}
      <ShimmerSkeleton shape="rectangle" height="180px" className="rounded-3xl" />

      {/* Statistics skeleton */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ShimmerSkeleton key={i} shape="rectangle" height="56px" className="rounded-xl" />
        ))}
      </div>

      {/* Gallery skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <ShimmerSkeleton shape="rectangle" height="200px" className="rounded-xl" />
            <ShimmerSkeleton shape="line" height="14px" width="70%" />
            <ShimmerSkeleton shape="line" height="12px" width="50%" />
          </div>
        ))}
      </div>
    </div>
  );
}
